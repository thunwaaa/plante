package middleware

import (
	"authentication/models"
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/api/option"
)

type AuthMiddleware struct {
	db     *mongo.Database
	client *auth.Client
}

func NewAuthMiddleware(db *mongo.Database) (*AuthMiddleware, error) {
	// Initialize Firebase Admin SDK
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	// Get Auth client
	client, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting auth client: %v", err)
	}

	return &AuthMiddleware{
		db:     db,
		client: client,
	}, nil
}

func (m *AuthMiddleware) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ปล่อยผ่าน OPTIONS เพื่อให้ CORS middleware ทำงาน
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			fmt.Printf("Missing Authorization header\n")
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		// Extract token from Bearer
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			fmt.Printf("Invalid Authorization header format: %s\n", authHeader)
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}
		idToken := tokenParts[1]

		// Verify token with Firebase
		token, err := m.client.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			log.Printf("Error verifying token: %v", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Get user from database using firebase_uid
		var user models.User
		err = m.db.Collection("users").FindOne(context.Background(), bson.M{
			"firebase_uid": token.UID,
		}).Decode(&user)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				// User not found, try to create new user
				log.Printf("User not found for firebase_uid: %s, creating new user", token.UID)

				// Get user info from Firebase
				firebaseUser, err := m.client.GetUser(context.Background(), token.UID)
				if err != nil {
					log.Printf("Error getting user from Firebase: %v", err)
					http.Error(w, "User not found", http.StatusUnauthorized)
					return
				}

				// Create new user
				email := firebaseUser.Email
				name := firebaseUser.DisplayName
				profileImageURL := firebaseUser.PhotoURL
				newUser := models.User{
					ID:              primitive.NewObjectID(),
					User_id:         token.UID,
					Email:           &email,
					Name:            &name,
					Role:            "user",
					Provider:        "firebase",
					IsVerified:      firebaseUser.EmailVerified,
					FirebaseUID:     token.UID,
					ProfileImageURL: &profileImageURL,
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
					LastLoginAt:     time.Now(),
				}

				_, err = m.db.Collection("users").InsertOne(context.Background(), newUser)
				if err != nil {
					log.Printf("Error creating new user: %v", err)
					http.Error(w, "Failed to create user", http.StatusInternalServerError)
					return
				}

				user = newUser
			} else {
				// Other database error
				log.Printf("Error finding user: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		} else if user.ID.IsZero() {
			// User exists but has no ID, update it
			user.ID = primitive.NewObjectID()
			_, err = m.db.Collection("users").UpdateOne(
				context.Background(),
				bson.M{"firebase_uid": token.UID},
				bson.M{"$set": bson.M{
					"_id":        user.ID,
					"updated_at": time.Now(),
				}},
			)
			if err != nil {
				log.Printf("Error updating user ID: %v", err)
				// Don't return error, just log it
			}
		}

		// Update user's profile image if it's not set
		if user.ProfileImageURL == nil {
			firebaseUser, err := m.client.GetUser(context.Background(), token.UID)
			if err == nil && firebaseUser.PhotoURL != "" {
				profileImageURL := firebaseUser.PhotoURL
				user.ProfileImageURL = &profileImageURL
				// Update user in database
				_, err = m.db.Collection("users").UpdateOne(
					context.Background(),
					bson.M{"firebase_uid": token.UID},
					bson.M{"$set": bson.M{
						"profile_image_url": profileImageURL,
						"updated_at":        time.Now(),
					}},
				)
				if err != nil {
					log.Printf("Error updating user profile image: %v", err)
				}
			}
		}

		// Update last login
		_, err = m.db.Collection("users").UpdateOne(
			context.Background(),
			bson.M{"firebase_uid": token.UID},
			bson.M{"$set": bson.M{
				"last_login_at": time.Now(),
				"updated_at":    time.Now(),
			}},
		)
		if err != nil {
			log.Printf("Error updating last login: %v", err)
			// Don't return error here, just log it
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), "user", &user)
		ctx = context.WithValue(ctx, "user_id", user.User_id)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Gin middleware version for authentication
func (m *AuthMiddleware) GinAuthMiddleware() func(c *gin.Context) {
	return func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is required"})
			return
		}
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid authorization header format"})
			return
		}
		idToken := tokenParts[1]
		token, err := m.client.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			log.Printf("Error verifying token: %v", err)
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token"})
			return
		}
		var user models.User
		err = m.db.Collection("users").FindOne(context.Background(), bson.M{
			"firebase_uid": token.UID,
		}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				log.Printf("User not found for firebase_uid: %s, creating new user", token.UID)
				firebaseUser, err := m.client.GetUser(context.Background(), token.UID)
				if err != nil {
					log.Printf("Error getting user from Firebase: %v", err)
					c.AbortWithStatusJSON(401, gin.H{"error": "User not found"})
					return
				}
				email := firebaseUser.Email
				name := firebaseUser.DisplayName
				profileImageURL := firebaseUser.PhotoURL
				newUser := models.User{
					ID:              primitive.NewObjectID(),
					User_id:         token.UID,
					Email:           &email,
					Name:            &name,
					Role:            "user",
					Provider:        "firebase",
					IsVerified:      firebaseUser.EmailVerified,
					FirebaseUID:     token.UID,
					ProfileImageURL: &profileImageURL,
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
					LastLoginAt:     time.Now(),
				}
				_, err = m.db.Collection("users").InsertOne(context.Background(), newUser)
				if err != nil {
					log.Printf("Error creating new user: %v", err)
					c.AbortWithStatusJSON(500, gin.H{"error": "Failed to create user"})
					return
				}
				user = newUser
			} else {
				log.Printf("Error finding user: %v", err)
				c.AbortWithStatusJSON(500, gin.H{"error": "Database error"})
				return
			}
		} else if user.ID.IsZero() {
			user.ID = primitive.NewObjectID()
			_, err = m.db.Collection("users").UpdateOne(
				context.Background(),
				bson.M{"firebase_uid": token.UID},
				bson.M{"$set": bson.M{
					"_id":        user.ID,
					"updated_at": time.Now(),
				}},
			)
			if err != nil {
				log.Printf("Error updating user ID: %v", err)
			}
		}
		if user.ProfileImageURL == nil {
			firebaseUser, err := m.client.GetUser(context.Background(), token.UID)
			if err == nil && firebaseUser.PhotoURL != "" {
				profileImageURL := firebaseUser.PhotoURL
				user.ProfileImageURL = &profileImageURL
				_, err = m.db.Collection("users").UpdateOne(
					context.Background(),
					bson.M{"firebase_uid": token.UID},
					bson.M{"$set": bson.M{
						"profile_image_url": profileImageURL,
						"updated_at":        time.Now(),
					}},
				)
				if err != nil {
					log.Printf("Error updating user profile image: %v", err)
				}
			}
		}
		_, err = m.db.Collection("users").UpdateOne(
			context.Background(),
			bson.M{"firebase_uid": token.UID},
			bson.M{"$set": bson.M{
				"last_login_at": time.Now(),
				"updated_at":    time.Now(),
			}},
		)
		if err != nil {
			log.Printf("Error updating last login: %v", err)
		}
		c.Set("user", &user)
		c.Set("user_id", user.User_id)
		c.Next()
	}
}
