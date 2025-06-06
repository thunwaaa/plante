package controllers

import (
	"authentication/config"
	"authentication/helpers"
	"authentication/models"
	"context"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"bytes"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var validate = validator.New()
var userCollection *mongo.Collection

func InitUserCollection() {
	userCollection = config.OpenCollection("users")
}

func Signup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate required fields
		if user.Email == nil || user.Password == nil || user.Name == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
			return
		}

		// Check if email already exists
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var existingUser models.User
		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}

		//Generate rest of the user data
		user.Password = helpers.HashPassword(user.Password)
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.ID = primitive.NewObjectID()
		user.User_id = user.ID.Hex()
		user.Role = "user"
		user.Provider = "password"
		user.IsVerified = false
		user.LastLoginAt = time.Now()

		// Generate tokens
		token, refreshToken := helpers.GenerateTokens(*user.Email, user.User_id, user.Role)
		user.Token = &token
		user.RefreshToken = &refreshToken

		_, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"user": gin.H{
				"user_id": user.User_id,
				"email":   user.Email,
				"name":    user.Name,
				"role":    user.Role,
				"token":   token,
			},
		})
	}
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		var user models.User
		var foundUser models.User

		// Log the raw request body
		body, _ := c.GetRawData()
		log.Printf("Login request body: %s", string(body))
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

		// Get user input
		if err := c.BindJSON(&user); err != nil {
			log.Printf("BindJSON error: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
			return
		}

		// Log the parsed user data
		log.Printf("Parsed user data - Email: %v, Password length: %d", user.Email, len(*user.Password))

		// Validate required fields
		if user.Email == nil || user.Password == nil {
			log.Printf("Missing required fields - Email: %v, Password: %v", user.Email, user.Password)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
			return
		}

		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
			return
		}

		//verify password
		passwordIsValid, msg := helpers.VerifyPassword(*foundUser.Password, *user.Password)
		if !passwordIsValid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": msg})
			return
		}

		token, refreshToken := helpers.GenerateTokens(*foundUser.Email, *&foundUser.User_id, "USER")
		helpers.UpdateAllTokens(token, refreshToken, foundUser.User_id)

		c.JSON(http.StatusOK, gin.H{
			"user":          foundUser,
			"token":         token,
			"refresh_token": refreshToken,
		})
	}
}

func GetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestedUserId := c.Param("id")

		// Get claims from the context
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Type assertion to get the claims object
		tokenClaims, ok := claims.(*helpers.Claims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		tokenUserId := tokenClaims.UserID
		userType := tokenClaims.Role

		if userType != "ADMIN" && tokenUserId != requestedUserId {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"user_id": requestedUserId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve claims from context
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Type assertion to get the claims object
		tokenClaims, ok := claims.(*helpers.Claims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		// Check if the user is an ADMIN
		if tokenClaims.Role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			return
		}

		// Proceed to get the users list from the database
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		// Find all users
		cursor, err := userCollection.Find(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		var users []models.User
		if err := cursor.All(ctx, &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Return the list of users
		c.JSON(http.StatusOK, users)
	}
}

func Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get claims from the context
		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Type assertion to get the claims object
		tokenClaims, ok := claims.(*helpers.Claims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Update user document to clear tokens
		updateObj := bson.D{
			{"$set", bson.D{
				{"token", ""},
				{"refresh_token", ""},
				{"updated_at", time.Now()},
			}},
		}

		filter := bson.M{"user_id": tokenClaims.UserID}
		_, err := userCollection.UpdateOne(ctx, filter, updateObj)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error logging out"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
	}
}

func UploadProfileImage() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Handle the file upload
		file, err := c.FormFile("profile_image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
			return
		}

		// Open the file
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open image file"})
			return
		}
		defer src.Close()

		// Upload to Cloudinary
		imageURL, err := config.UploadImage(src, "plante/profiles")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
			return
		}

		// Update user document with the new image URL
		filter := bson.M{"user_id": userID.(string)}
		update := bson.M{
			"$set": bson.M{
				"profileImageUrl": imageURL,
				"updated_at":      time.Now(),
			},
		}

		_, err = userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile image"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Profile image uploaded successfully", "profileImageUrl": imageURL})
	}
}

func UpdateUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userID := c.Param("id")
		// Get user ID from context (set by auth middleware)
		authenticatedUserID, exists := c.Get("user_id")
		if !exists || authenticatedUserID.(string) != userID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		var updatedUser models.User
		if err := c.BindJSON(&updatedUser); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Create update document
		updateFields := bson.M{
			"updated_at": time.Now(),
		}

		if updatedUser.Email != nil {
			updateFields["email"] = updatedUser.Email
		}
		// Only update fields that are provided and allowed to be updated
		if updatedUser.Name != nil && *updatedUser.Name != "" {
			updateFields["name"] = updatedUser.Name
		}
		// Add other fields here if they become editable in the future

		update := bson.M{"$set": updateFields}

		filter := bson.M{"user_id": userID}
		result, err := userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		if result.ModifiedCount == 0 {
			c.JSON(http.StatusOK, gin.H{"message": "No changes made"})
			return
		}

		// Fetch the updated user to return
		var user models.User
		err = userCollection.FindOne(ctx, filter).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// SaveFCMTokenHandler handles saving the FCM token for a user
func SaveFCMTokenHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var request struct {
			FCMToken string `json:"fcmToken" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Update user document with FCM token
		filter := bson.M{"user_id": userID.(string)}
		update := bson.M{
			"$set": bson.M{
				"fcm_token":  request.FCMToken,
				"updated_at": time.Now(),
			},
		}

		_, err := userCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update FCM token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "FCM token updated successfully"})
	}
}
