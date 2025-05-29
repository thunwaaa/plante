package controllers

import (
	"authentication/config"
	"authentication/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var recommendationCollection *mongo.Collection

func InitRecommendationCollection() {
	recommendationCollection = config.OpenCollection("plant_recommendations")
}

// GetRecommendations handles plant recommendations based on user criteria
func GetRecommendations() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Get query parameters
		area := c.Query("area")
		light := c.Query("light")
		size := c.Query("size")
		water := c.Query("water")
		purpose := c.Query("purpose")
		experience := c.Query("experience")

		// Build filter conditions using $or to match any of the conditions
		filter := bson.M{
			"$and": []bson.M{
				// Size must match exactly (using $and)
				{"$or": []bson.M{
					{"conditions.ขนาด": size},
					{"conditions.ขนาด": bson.M{"$regex": "^" + size}}, // Match start of string
				}},
				// Other conditions can match any
				{"$or": []bson.M{
					// Match by area
					{"conditions.พื้นที่": bson.M{"$in": []string{area}}},
					// Match by light
					{"conditions.แสง": bson.M{"$in": []string{light}}},
					// Match by water - handle both short and long format
					{"$or": []bson.M{
						{"conditions.น้ำ": water},
						{"conditions.น้ำ": bson.M{"$regex": "^" + water}}, // Match start of string
					}},
					// Match by purpose
					{"conditions.วัตถุประสงค์": bson.M{"$in": []string{purpose}}},
					// Match by experience
					{"conditions.ประสบการณ์": bson.M{"$in": []string{experience}}},
				}},
			},
		}

		// Add minimum match count to ensure plants match at least some criteria
		filter["$expr"] = bson.M{
			"$and": []interface{}{
				// Size must match exactly
				bson.M{"$or": []bson.M{
					{"$eq": []interface{}{"$conditions.ขนาด", size}},
					{"$regexMatch": bson.M{"input": "$conditions.ขนาด", "regex": "^" + size}},
				}},
				// At least 2 other criteria must match
				bson.M{
					"$gte": []interface{}{
						bson.M{
							"$size": bson.M{
								"$filter": bson.M{
									"input": []interface{}{
										bson.M{"$in": []interface{}{area, bson.M{"$ifNull": []interface{}{"$conditions.พื้นที่", []string{}}}}},
										bson.M{"$in": []interface{}{light, bson.M{"$ifNull": []interface{}{"$conditions.แสง", []string{}}}}},
										bson.M{"$or": []bson.M{
											{"$eq": []interface{}{"$conditions.น้ำ", water}},
											{"$regexMatch": bson.M{"input": "$conditions.น้ำ", "regex": "^" + water}},
										}},
										bson.M{"$in": []interface{}{purpose, bson.M{"$ifNull": []interface{}{"$conditions.วัตถุประสงค์", []string{}}}}},
										bson.M{"$in": []interface{}{experience, bson.M{"$ifNull": []interface{}{"$conditions.ประสบการณ์", []string{}}}}},
									},
									"as":   "match",
									"cond": "$$match",
								},
							},
						},
						2, // Require at least 2 matching criteria (excluding size)
					},
				},
			},
		}

		// Find matching plants
		cursor, err := recommendationCollection.Find(ctx, filter)
		if err != nil {
			log.Printf("Error finding plants: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding plants: " + err.Error()})
			return
		}
		defer cursor.Close(ctx)

		// Decode results
		var plants []models.PlantRecommendation
		if err = cursor.All(ctx, &plants); err != nil {
			log.Printf("Error decoding plants: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding plants: " + err.Error()})
			return
		}

		// Log the number of plants found
		log.Printf("Found %d matching plants", len(plants))

		// Return results
		c.JSON(http.StatusOK, gin.H{
			"plants": plants,
			"count":  len(plants),
		})
	}
}

// ImportPlantData imports plant data from JSON into MongoDB
func ImportPlantData() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Read the raw request body
		body, err := c.GetRawData()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error reading request body"})
			return
		}

		// First unmarshal into a map to preserve the exact structure
		var rawPlants []map[string]interface{}
		if err := json.Unmarshal(body, &rawPlants); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
			return
		}

		// Convert to PlantRecommendation structs with validation
		var plants []models.PlantRecommendation
		for _, rawPlant := range rawPlants {
			// Extract conditions
			rawConditions, ok := rawPlant["conditions"].(map[string]interface{})
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid conditions format for plant",
					"plant": rawPlant["name"],
				})
				return
			}

			// Ensure all array fields are properly handled
			area := convertToStringSlice(rawConditions["พื้นที่"])
			if area == nil {
				area = []string{} // Initialize as empty array instead of null
			}
			light := convertToStringSlice(rawConditions["แสง"])
			if light == nil {
				light = []string{}
			}
			purpose := convertToStringSlice(rawConditions["วัตถุประสงค์"])
			if purpose == nil {
				purpose = []string{}
			}
			experience := convertToStringSlice(rawConditions["ประสบการณ์"])
			if experience == nil {
				experience = []string{}
			}

			// Ensure string fields are not empty
			size := rawConditions["ขนาด"]
			if size == nil {
				size = ""
			}
			water := rawConditions["น้ำ"]
			if water == nil {
				water = ""
			}

			// Create plant with validated conditions
			plant := models.PlantRecommendation{
				ID:             int(rawPlant["id"].(float64)),
				Name:           rawPlant["name"].(string),
				ScientificName: rawPlant["scientificName"].(string),
				Image:          rawPlant["image"].(string),
				Description:    rawPlant["description"].(string),
				CareLevel:      rawPlant["careLevel"].(string),
				Conditions: models.PlantConditions{
					Area:       area,
					Light:      light,
					Size:       size.(string),
					Water:      water.(string),
					Purpose:    purpose,
					Experience: experience,
				},
				Benefits: convertToStringSlice(rawPlant["benefits"]),
				Tags:     convertToStringSlice(rawPlant["tags"]),
			}

			// Validate required fields
			if err := validatePlant(plant); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
					"plant": plant.Name,
					"id":    plant.ID,
				})
				return
			}

			// Log the plant data for debugging
			log.Printf("Importing plant: %s (ID: %d)", plant.Name, plant.ID)
			log.Printf("  Conditions:")
			log.Printf("    Area: %v", plant.Conditions.Area)
			log.Printf("    Light: %v", plant.Conditions.Light)
			log.Printf("    Size: %s", plant.Conditions.Size)
			log.Printf("    Water: %s", plant.Conditions.Water)
			log.Printf("    Purpose: %v", plant.Conditions.Purpose)
			log.Printf("    Experience: %v", plant.Conditions.Experience)

			plants = append(plants, plant)
		}

		// Delete existing data
		_, err = recommendationCollection.DeleteMany(ctx, bson.M{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error clearing existing data"})
			return
		}

		// Convert to interface slice for bulk insert
		var plantsToInsert []interface{}
		for _, plant := range plants {
			plantsToInsert = append(plantsToInsert, plant)
		}

		// Insert new data
		if len(plantsToInsert) > 0 {
			_, err = recommendationCollection.InsertMany(ctx, plantsToInsert)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error importing plant data: " + err.Error()})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully imported plant data",
			"count":   len(plantsToInsert),
		})
	}
}

// Helper function to convert interface{} to []string
func convertToStringSlice(v interface{}) []string {
	if v == nil {
		return []string{} // Return empty array instead of nil
	}

	switch val := v.(type) {
	case []interface{}:
		if len(val) == 0 {
			return []string{} // Return empty array for empty slices
		}
		result := make([]string, len(val))
		for i, item := range val {
			if item == nil {
				result[i] = "" // Convert nil to empty string
			} else {
				result[i] = fmt.Sprint(item) // Convert any type to string
			}
		}
		return result
	case []string:
		if len(val) == 0 {
			return []string{} // Return empty array for empty slices
		}
		return val
	default:
		return []string{} // Return empty array for unknown types
	}
}

// Helper function to validate plant data
func validatePlant(plant models.PlantRecommendation) error {
	if len(plant.Conditions.Area) == 0 {
		return fmt.Errorf("missing area data")
	}
	if len(plant.Conditions.Light) == 0 {
		return fmt.Errorf("missing light data")
	}
	if plant.Conditions.Size == "" {
		return fmt.Errorf("missing size data")
	}
	if plant.Conditions.Water == "" {
		return fmt.Errorf("missing water data")
	}
	if len(plant.Conditions.Purpose) == 0 {
		return fmt.Errorf("missing purpose data")
	}
	if len(plant.Conditions.Experience) == 0 {
		return fmt.Errorf("missing experience data")
	}
	return nil
}
