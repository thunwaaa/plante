package controllers

import (
	"authentication/config"
	"authentication/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var plantCollection *mongo.Collection

func InitPlantCollection() {
	plantCollection = config.OpenCollection("plants")
}

func CreatePlant() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var plant models.Plant
		if err := c.BindJSON(&plant); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Convert user ID to ObjectID
		userObjID, err := primitive.ObjectIDFromHex(userID.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		plant.UserID = userObjID
		plant.CreatedAt = time.Now()
		plant.UpdatedAt = time.Now()

		result, err := plantCollection.InsertOne(ctx, plant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":  "Plant created successfully",
			"plant_id": result.InsertedID,
		})
	}
}

func GetUserPlants() gin.HandlerFunc {
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		cursor, err := plantCollection.Find(ctx, bson.M{"user_id": userObjID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		var plants []models.Plant
		if err = cursor.All(ctx, &plants); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, plants)
	}
}

func GetPlant() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		plantID := c.Param("plant_id")
		objID, err := primitive.ObjectIDFromHex(plantID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
			return
		}

		var plant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&plant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Plant not found"})
			return
		}

		// Verify ownership
		userID, exists := c.Get("user_id")
		if !exists || plant.UserID.Hex() != userID.(string) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
			return
		}

		c.JSON(http.StatusOK, plant)
	}
}

func UpdatePlant() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		plantID := c.Param("plant_id")
		objID, err := primitive.ObjectIDFromHex(plantID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
			return
		}

		var plant models.Plant
		if err := c.BindJSON(&plant); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Verify ownership
		var existingPlant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&existingPlant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Plant not found"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists || existingPlant.UserID.Hex() != userID.(string) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
			return
		}

		plant.UpdatedAt = time.Now()
		update := bson.M{
			"$set": bson.M{
				"name":         plant.Name,
				"type":         plant.Type,
				"container":    plant.Container,
				"plant_height": plant.PlantHeight,
				"plant_date":   plant.PlantDate,
				"image_url":    plant.ImageURL,
				"updated_at":   plant.UpdatedAt,
			},
		}

		_, err = plantCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Plant updated successfully"})
	}
}

func DeletePlant() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		plantID := c.Param("plant_id")
		objID, err := primitive.ObjectIDFromHex(plantID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
			return
		}

		// Verify ownership
		var plant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&plant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Plant not found"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists || plant.UserID.Hex() != userID.(string) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
			return
		}

		_, err = plantCollection.DeleteOne(ctx, bson.M{"_id": objID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Plant deleted successfully"})
	}
}
