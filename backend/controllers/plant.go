package controllers

import (
	"authentication/config"
	"authentication/models"
	"context"
	"fmt"
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

		// Get the created plant data
		var createdPlant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": result.InsertedID}).Decode(&createdPlant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created plant"})
			return
		}

		c.JSON(http.StatusCreated, createdPlant)
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

		// Find all plants for the user
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

		// Clean up and standardize plant data
		cleanedPlants := make([]models.Plant, len(plants))
		for i, plant := range plants {
			// Use the most recent data
			cleanedPlant := models.Plant{
				ID:          plant.ID,
				UserID:      plant.UserID,
				Name:        plant.Name,
				Type:        plant.Type,
				Container:   plant.Container,
				PlantHeight: plant.PlantHeight, // Use new field
				PlantDate:   plant.PlantDate,   // Use new field
				ImageURL:    plant.ImageURL,    // Use new field
				CreatedAt:   plant.CreatedAt,
				UpdatedAt:   plant.UpdatedAt,
			}

			// If new fields are empty but old fields exist, use old fields
			if cleanedPlant.PlantHeight == 0 && plant.Plantheight > 0 {
				cleanedPlant.PlantHeight = plant.Plantheight
			}
			if cleanedPlant.PlantDate.IsZero() && !plant.Plantdate.IsZero() {
				cleanedPlant.PlantDate = plant.Plantdate
			}
			if cleanedPlant.ImageURL == "" && plant.Imageurl != "" {
				cleanedPlant.ImageURL = plant.Imageurl
			}

			// Update the plant in database to use new field names
			update := bson.M{
				"$set": bson.M{
					"plant_height": cleanedPlant.PlantHeight,
					"plant_date":   cleanedPlant.PlantDate,
					"image_url":    cleanedPlant.ImageURL,
					"updated_at":   time.Now(),
				},
				"$unset": bson.M{
					"plantheight": "",
					"plantdate":   "",
					"imageurl":    "",
				},
			}

			_, err = plantCollection.UpdateOne(
				ctx,
				bson.M{"_id": plant.ID},
				update,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clean up plant data"})
				return
			}

			cleanedPlants[i] = cleanedPlant
		}

		c.JSON(http.StatusOK, cleanedPlants)
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

		// Clean up plant data
		cleanedPlant := models.Plant{
			ID:          plant.ID,
			UserID:      plant.UserID,
			Name:        plant.Name,
			Type:        plant.Type,
			Container:   plant.Container,
			PlantHeight: plant.PlantHeight,
			PlantDate:   plant.PlantDate,
			ImageURL:    plant.ImageURL,
			CreatedAt:   plant.CreatedAt,
			UpdatedAt:   plant.UpdatedAt,
		}

		// If new fields are empty but old fields exist, use old fields
		if cleanedPlant.PlantHeight == 0 && plant.Plantheight > 0 {
			cleanedPlant.PlantHeight = plant.Plantheight
		}
		if cleanedPlant.PlantDate.IsZero() && !plant.Plantdate.IsZero() {
			cleanedPlant.PlantDate = plant.Plantdate
		}
		if cleanedPlant.ImageURL == "" && plant.Imageurl != "" {
			cleanedPlant.ImageURL = plant.Imageurl
		}

		// Update the plant in database to use new field names
		update := bson.M{
			"$set": bson.M{
				"plant_height": cleanedPlant.PlantHeight,
				"plant_date":   cleanedPlant.PlantDate,
				"image_url":    cleanedPlant.ImageURL,
				"updated_at":   time.Now(),
			},
			"$unset": bson.M{
				"plantheight": "",
				"plantdate":   "",
				"imageurl":    "",
			},
		}

		_, err = plantCollection.UpdateOne(
			ctx,
			bson.M{"_id": plant.ID},
			update,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clean up plant data"})
			return
		}

		c.JSON(http.StatusOK, cleanedPlant)
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

		// Get existing plant data first
		var existingPlant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&existingPlant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Plant not found"})
			return
		}

		// Verify ownership
		userID, exists := c.Get("user_id")
		if !exists || existingPlant.UserID.Hex() != userID.(string) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
			return
		}

		// Parse update data
		var updateData models.Plant
		if err := c.BindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Prepare update fields
		update := bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
		}

		// Only update fields that are provided and not empty
		if updateData.Name != "" {
			update["$set"].(bson.M)["name"] = updateData.Name
		}
		if updateData.Type != "" {
			update["$set"].(bson.M)["type"] = updateData.Type
		}
		if updateData.Container != "" {
			update["$set"].(bson.M)["container"] = updateData.Container
		}
		if updateData.PlantHeight > 0 {
			update["$set"].(bson.M)["plant_height"] = updateData.PlantHeight
		}
		if !updateData.PlantDate.IsZero() {
			update["$set"].(bson.M)["plant_date"] = updateData.PlantDate
		}
		if updateData.ImageURL != "" {
			update["$set"].(bson.M)["image_url"] = updateData.ImageURL
		}

		// Perform update
		_, err = plantCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Get updated plant data
		var updatedPlant models.Plant
		err = plantCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedPlant)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated plant"})
			return
		}

		c.JSON(http.StatusOK, updatedPlant)
	}
}

func UploadPlantImage() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("image")
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
		imageURL, err := config.UploadImage(src, "plante/plants")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"image_url": imageURL})
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

		// Get plant data first to get image URL
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

		// Delete image from Cloudinary if exists
		if plant.ImageURL != "" {
			publicID := config.GetPublicIDFromURL(plant.ImageURL)
			if publicID != "" {
				if err := config.DeleteImage(publicID); err != nil {
					// Log error but continue with plant deletion
					fmt.Printf("Failed to delete image from Cloudinary: %v\n", err)
				}
			}
		}

		// Delete plant from database
		_, err = plantCollection.DeleteOne(ctx, bson.M{"_id": objID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Plant deleted successfully"})
	}
}
