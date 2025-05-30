package controllers

import (
	"authentication/config"
	"authentication/models"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var reminderCollection *mongo.Collection

func InitReminderCollection() {
	reminderCollection = config.OpenCollection("reminders")
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

		userObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		// Get user's FCM token
		var user models.User
		err = userCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
			return
		}

		if user.FCMToken == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User has not enabled notifications"})
			return
		}

		// Get plant details for notification
		var plant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": reminder.PlantID}).Decode(&plant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant data"})
			return
		}

		reminder.UserID = userObjID
		reminder.ID = primitive.NewObjectID()
		reminder.CreatedAt = time.Now()
		reminder.UpdatedAt = time.Now()
		reminder.IsActive = true

		// Create reminder data for notification
		reminderData := map[string]interface{}{
			"reminderId": reminder.ID.Hex(),
			"plantId":    reminder.PlantID.Hex(),
			"type":       reminder.Type,
			"frequency":  reminder.Frequency,
			"plantName":  plant.Name,
		}

		// Convert reminder data to JSON string for notification
		reminderJSON, err := json.Marshal(reminderData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare notification data"})
			return
		}

		// Store reminder data in the reminder document
		reminder.NotificationData = string(reminderJSON)

		_, insertErr := reminderCollection.InsertOne(ctx, reminder)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reminder"})
			return
		}

		c.JSON(http.StatusCreated, reminder)
	}
}

// GetReminders handles fetching reminders for the authenticated user
func GetReminders() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		userObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		filter := bson.M{"user_id": userObjID}
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

		userObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		var updatedReminder models.Reminder
		if err := c.BindJSON(&updatedReminder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Ensure the user owns the reminder
		filter := bson.M{"_id": objID, "user_id": userObjID}

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

		userObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		// Ensure the user owns the reminder before deleting
		filter := bson.M{"_id": objID, "user_id": userObjID}

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
