package services

import (
	"authentication/models"
	"context"
	"fmt"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/api/option"
)

type AuthService struct {
	db         *mongo.Database
	authClient *auth.Client
}

func NewAuthService(db *mongo.Database) (*AuthService, error) {
	// Initialize Firebase Admin SDK
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	// Get Auth client
	authClient, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting auth client: %v", err)
	}

	return &AuthService{
		db:         db,
		authClient: authClient,
	}, nil
}

// VerifyIDToken ตรวจสอบ Firebase ID token
func (s *AuthService) VerifyIDToken(idToken string) (*auth.Token, error) {
	return s.authClient.VerifyIDToken(context.Background(), idToken)
}

// GetUserByUID ดึงข้อมูลผู้ใช้จาก Firebase UID
func (s *AuthService) GetUserByUID(uid string) (*models.User, error) {
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"user_id": uid}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateOrUpdateUser สร้างหรืออัพเดทข้อมูลผู้ใช้ใน MongoDB
func (s *AuthService) CreateOrUpdateUser(firebaseUser *auth.UserRecord) (*models.User, error) {
	// ตรวจสอบว่ามีผู้ใช้อยู่แล้วหรือไม่
	var existingUser models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"user_id": firebaseUser.UID}).Decode(&existingUser)

	now := time.Now()
	email := firebaseUser.Email
	name := firebaseUser.DisplayName
	user := models.User{
		User_id:     firebaseUser.UID,
		FirebaseUID: firebaseUser.UID,
		Email:       &email,
		Name:        &name,
		Role:        "user",
		Provider:    "firebase",
		CreatedAt:   now,
		UpdatedAt:   now,
		IsVerified:  firebaseUser.EmailVerified,
	}

	if err == mongo.ErrNoDocuments {
		// สร้างผู้ใช้ใหม่
		user.CreatedAt = now
		user.Role = "user" // กำหนดค่าเริ่มต้น
		_, err = s.db.Collection("users").InsertOne(context.Background(), user)
	} else if err == nil {
		// อัพเดทผู้ใช้ที่มีอยู่
		update := bson.M{
			"$set": bson.M{
				"email":         firebaseUser.Email,
				"provider":      firebaseUser.ProviderID,
				"is_verified":   firebaseUser.EmailVerified,
				"last_login_at": now,
				"updated_at":    now,
			},
		}
		_, err = s.db.Collection("users").UpdateOne(
			context.Background(),
			bson.M{"user_id": firebaseUser.UID},
			update,
		)
	}

	if err != nil {
		return nil, fmt.Errorf("error creating/updating user: %v", err)
	}

	return &user, nil
}

// UpdateFCMToken อัพเดท FCM token ของผู้ใช้
func (s *AuthService) UpdateFCMToken(uid string, fcmToken string) error {
	_, err := s.db.Collection("users").UpdateOne(
		context.Background(),
		bson.M{"user_id": uid},
		bson.M{"$set": bson.M{"fcm_token": fcmToken, "updated_at": time.Now()}},
	)
	return err
}

// DeleteUser ลบผู้ใช้จากทั้ง Firebase และ MongoDB
func (s *AuthService) DeleteUser(uid string) error {
	// ลบจาก Firebase
	if err := s.authClient.DeleteUser(context.Background(), uid); err != nil {
		return fmt.Errorf("error deleting user from Firebase: %v", err)
	}

	// ลบจาก MongoDB
	_, err := s.db.Collection("users").DeleteOne(context.Background(), bson.M{"user_id": uid})
	if err != nil {
		return fmt.Errorf("error deleting user from MongoDB: %v", err)
	}

	return nil
}

// GetDB returns the database instance
func (s *AuthService) GetDB() *mongo.Database {
	return s.db
}

// GetFirebaseUser gets a user from Firebase by UID
func (s *AuthService) GetFirebaseUser(uid string) (*auth.UserRecord, error) {
	return s.authClient.GetUser(context.Background(), uid)
}

func (s *AuthService) UpdateVerificationStatus(userID string, isVerified bool) error {
	_, err := s.db.Collection("users").UpdateOne(
		context.Background(),
		bson.M{"user_id": userID},
		bson.M{"$set": bson.M{
			"is_verified": isVerified,
			"updated_at":  time.Now(),
		}},
	)
	return err
}

// SendVerificationEmail ส่งอีเมลยืนยันไปยังผู้ใช้
func (s *AuthService) SendVerificationEmail(uid string) error {
	// สร้าง action code settings สำหรับ Firebase
	actionCodeSettings := &auth.ActionCodeSettings{
		URL:             "http://localhost:3000/verify-email", // URL ที่จะ redirect ไปหลังจากยืนยันอีเมล
		HandleCodeInApp: true,
	}

	// ส่งอีเมลยืนยัน
	link, err := s.authClient.EmailVerificationLinkWithSettings(context.Background(), uid, actionCodeSettings)
	if err != nil {
		return fmt.Errorf("error sending verification email: %v", err)
	}

	// อัพเดท link ในฐานข้อมูล (ถ้าต้องการเก็บไว้ใช้ภายหลัง)
	_, err = s.db.Collection("users").UpdateOne(
		context.Background(),
		bson.M{"user_id": uid},
		bson.M{"$set": bson.M{
			"verification_link": link,
			"updated_at":        time.Now(),
		}},
	)
	return err
}

// CheckVerificationStatus ตรวจสอบสถานะการยืนยันอีเมล
func (s *AuthService) CheckVerificationStatus(uid string) (bool, error) {
	// ดึงข้อมูลผู้ใช้จาก Firebase
	firebaseUser, err := s.authClient.GetUser(context.Background(), uid)
	if err != nil {
		return false, fmt.Errorf("error getting user from Firebase: %v", err)
	}

	// อัพเดทสถานะในฐานข้อมูล
	_, err = s.db.Collection("users").UpdateOne(
		context.Background(),
		bson.M{"user_id": uid},
		bson.M{"$set": bson.M{
			"is_verified": firebaseUser.EmailVerified,
			"updated_at":  time.Now(),
		}},
	)
	if err != nil {
		return false, fmt.Errorf("error updating verification status: %v", err)
	}

	return firebaseUser.EmailVerified, nil
}

// GetUserVerificationStatus ดึงสถานะการยืนยันอีเมลของผู้ใช้
func (s *AuthService) GetUserVerificationStatus(uid string) (bool, error) {
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"user_id": uid}).Decode(&user)
	if err != nil {
		return false, fmt.Errorf("error getting user: %v", err)
	}
	return user.IsVerified, nil
}
