package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	User_id      string             `bson:"user_id" json:"user_id"`
	Email        *string            `bson:"email" json:"email"`
	Name         *string            `bson:"name" json:"name"`
	Password     *string            `bson:"password" json:"-"`
	Role         string             `bson:"role" json:"role"`
	FCMToken     *string            `bson:"fcm_token,omitempty" json:"fcm_token,omitempty"`
	Token        *string            `bson:"token,omitempty" json:"token,omitempty"`
	RefreshToken *string            `bson:"refresh_token,omitempty" json:"refresh_token,omitempty"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
	// เพิ่มฟิลด์สำหรับ Firebase
	Provider        string    `bson:"provider" json:"provider"` // "password", "google", "facebook", etc.
	LastLoginAt     time.Time `bson:"last_login_at" json:"last_login_at"`
	IsVerified      bool      `bson:"is_verified" json:"is_verified"`
	FirebaseUID     string    `bson:"firebase_uid,omitempty" json:"firebase_uid,omitempty"`
	ProfileImageURL *string   `bson:"profile_image_url,omitempty" json:"profile_image_url,omitempty"`
}

// UserResponse สำหรับส่งข้อมูลกลับไปให้ frontend
type UserResponse struct {
	ID              string    `json:"id"`
	Email           string    `json:"email"`
	Role            string    `json:"role"`
	Provider        string    `json:"provider"`
	IsVerified      bool      `json:"is_verified"`
	CreatedAt       time.Time `json:"created_at"`
	LastLoginAt     time.Time `json:"last_login_at"`
	FCMToken        *string   `json:"fcm_token,omitempty"`
	ProfileImageURL *string   `json:"profile_image_url,omitempty"`
}
