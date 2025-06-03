package controllers

import (
	"authentication/config"
	"authentication/models"
	"authentication/services"
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var reminderCollection *mongo.Collection
var reminderService *services.ReminderService

func InitReminderCollection() {
	reminderCollection = config.OpenCollection("reminders")
}

// InitializeReminderService initializes the reminder service with the database connection
func InitializeReminderService(db *mongo.Database) {
	reminderService = services.NewReminderService(db)
}

// CreateReminder handles the creation of a new reminder
func CreateReminder() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var reminder models.Reminder
		if err := c.BindJSON(&reminder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Get user's FCM token
		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
			return
		}

		// Validate reminder fields
		if reminder.Type == "" || reminder.Frequency == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing type or frequency"})
			return
		}
		if reminder.Frequency == "once" && reminder.ScheduledTime.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing scheduled time for one-time reminder"})
			return
		}
		if (reminder.Frequency == "daily" || reminder.Frequency == "weekly") && reminder.TimeOfDay == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing time of day for daily/weekly reminder"})
			return
		}
		if reminder.Frequency == "weekly" && reminder.DayOfWeek == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing day of week for weekly reminder"})
			return
		}

		// ตรวจสอบสิทธิ์ user กับ plant
		var plant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": reminder.PlantID}).Decode(&plant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant data"})
			return
		}
		// Debug log for userID and plant.UserID
		fmt.Printf("[DEBUG] plant.UserID: %s, userID: %v\n", plant.UserID, userID)
		userIDStr := ""
		switch v := userID.(type) {
		case string:
			userIDStr = v
		case primitive.ObjectID:
			userIDStr = v.Hex()
		default:
			userIDStr = fmt.Sprintf("%v", v)
		}
		if plant.UserID != userIDStr {
			fmt.Printf("[DEBUG] Ownership check failed: plant.UserID = %s, userIDStr = %s\n", plant.UserID, userIDStr)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not the owner of this plant"})
			return
		}

		// FCM Token check
		if user.FCMToken == nil || *user.FCMToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User has not enabled notifications"})
			return
		}

		// Timezone handling (set to Asia/Bangkok)
		loc, _ := time.LoadLocation("Asia/Bangkok")
		reminder.CreatedAt = time.Now().In(loc)
		reminder.UpdatedAt = time.Now().In(loc)

		// Set reminder ID BEFORE creating notification data
		reminder.ID = primitive.NewObjectID()
		reminder.UserID = plant.UserID
		reminder.IsActive = true

		// Create reminder data for notification (add title/body)
		// Frontend now sends notificationData as a JSON string
		// We just need to ensure it's stored correctly.
		// The NotificationData field is already part of the reminder struct

		// Remove backend-side generation:
		/*
			reminderData := map[string]interface{}{
				"reminderId": reminder.ID.Hex(),
				"plantId":    reminder.PlantID.Hex(),
				"type":       reminder.Type,
				"frequency":  reminder.Frequency,
				"plantName":  plant.Name,
				"title":      fmt.Sprintf("ถึงเวลาสำหรับ %s", reminder.Type),
				"body":       fmt.Sprintf("อย่าลืม %s ให้กับ %s!", reminder.Type, plant.Name),
			}
			reminderJSON, err := json.Marshal(reminderData)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare notification data"})
				return
			}
			reminder.NotificationData = string(reminderJSON)
		*/

		_, insertErr := reminderCollection.InsertOne(ctx, reminder)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reminder"})
			return
		}

		c.JSON(http.StatusCreated, reminder)
	}
}

// GetReminders handles fetching reminders for the authenticated user, optionally filtered by plantId
func GetReminders() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		filter := bson.M{"user_id": userID}

		// Add plantId filter if provided
		plantId := c.Query("plantId")
		if plantId != "" {
			plantObjID, err := primitive.ObjectIDFromHex(plantId)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
				return
			}
			filter["plant_id"] = plantObjID
		}

		cursor, err := reminderCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reminders"})
			return
		}
		defer cursor.Close(ctx)

		var reminders []models.Reminder
		if err := cursor.All(ctx, &reminders); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode reminders"})
			return
		}

		c.JSON(http.StatusOK, reminders)
	}
}

// UpdateReminder handles updating an existing reminder
func UpdateReminder() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		reminderID := c.Param("id")
		objID, err := primitive.ObjectIDFromHex(reminderID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reminder ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		var updatedReminder models.Reminder
		if err := c.BindJSON(&updatedReminder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Ensure the user owns the reminder
		filter := bson.M{"_id": objID, "user_id": userID}

		updateFields := bson.M{
			"updated_at": time.Now(),
		}

		// Only update fields that are provided and allowed
		if updatedReminder.Type != "" {
			updateFields["type"] = updatedReminder.Type
		}
		if updatedReminder.Frequency != "" {
			updateFields["frequency"] = updatedReminder.Frequency
		}
		if !updatedReminder.ScheduledTime.IsZero() {
			updateFields["scheduled_time"] = updatedReminder.ScheduledTime
		}
		if updatedReminder.DayOfWeek != "" {
			updateFields["day_of_week"] = updatedReminder.DayOfWeek
		}
		if updatedReminder.TimeOfDay != "" {
			updateFields["time_of_day"] = updatedReminder.TimeOfDay
		}
		// Allow updating IsActive status
		updateFields["is_active"] = updatedReminder.IsActive

		update := bson.M{"$set": updateFields}

		result, err := reminderCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reminder"})
			return
		}

		if result.ModifiedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Reminder not found or no changes made"})
			return
		}

		// Fetch the updated reminder to return
		var reminder models.Reminder
		err = reminderCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&reminder)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated reminder"})
			return
		}

		c.JSON(http.StatusOK, reminder)
	}
}

// DeleteReminder handles deleting an existing reminder
func DeleteReminder() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		reminderID := c.Param("id")
		objID, err := primitive.ObjectIDFromHex(reminderID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reminder ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Ensure the user owns the reminder before deleting
		filter := bson.M{"_id": objID, "user_id": userID}

		result, err := reminderCollection.DeleteOne(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete reminder"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Reminder not found or already deleted"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Reminder deleted successfully"})
	}
}

// GetPlantReminders handles getting all reminders for a specific plant
func GetPlantReminders() gin.HandlerFunc {
	return func(c *gin.Context) {
		plantID := c.Param("plant_id")
		log.Printf("[DEBUG] Getting reminders for plant ID: %s", plantID)

		if plantID == "" {
			log.Printf("[ERROR] Plant ID is empty")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Plant ID is required"})
			return
		}

		// Validate plant ID format
		if _, err := primitive.ObjectIDFromHex(plantID); err != nil {
			log.Printf("[ERROR] Invalid plant ID format: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID format"})
			return
		}

		// Get reminders from database
		log.Printf("[DEBUG] Fetching reminders from database for plant ID: %s", plantID)
		reminders, err := reminderService.GetRemindersByPlantID(plantID)
		if err != nil {
			log.Printf("[ERROR] Error getting reminders for plant %s: %v", plantID, err)
			// Check for specific error types
			if err.Error() == "invalid plant ID format" {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reminders"})
			return
		}

		log.Printf("[DEBUG] Successfully fetched %d reminders for plant %s", len(reminders), plantID)

		// If no reminders found, return empty array instead of null
		if reminders == nil {
			reminders = []models.Reminder{}
		}

		c.JSON(http.StatusOK, gin.H{
			"reminders": reminders,
			"count":     len(reminders),
		})
	}
}
