package helpers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"authentication/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ImportPlantData(mongoClient *mongo.Client) error {
	log.Println("Attempting to import plant data...")

	// Get the current working directory
	wd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("error getting working directory: %w", err)
	}

	// Construct the path to the JSON file
	jsonFilePath := filepath.Join(wd, "data", "plant_database_unique.json")
	log.Printf("Looking for plant data at: %s", jsonFilePath)

	// Read the JSON file
	content, err := os.ReadFile(jsonFilePath)
	if err != nil {
		log.Printf("Error reading JSON file %s: %v", jsonFilePath, err)
		return fmt.Errorf("error reading JSON file: %w", err)
	}

	// First unmarshal into a map to preserve the exact structure
	var rawPlants []map[string]interface{}
	if err := json.Unmarshal(content, &rawPlants); err != nil {
		log.Printf("Error unmarshaling JSON data: %v", err)
		return fmt.Errorf("error unmarshaling JSON data: %w", err)
	}

	// Convert to PlantRecommendation structs with validation
	var plants []models.PlantRecommendation
	for _, rawPlant := range rawPlants {
		// Safely extract and validate required fields
		id, ok := rawPlant["id"].(float64)
		if !ok {
			log.Printf("WARNING: Invalid or missing id for plant %v", rawPlant["name"])
			continue
		}

		name, ok := rawPlant["name"].(string)
		if !ok {
			log.Printf("WARNING: Invalid or missing name for plant id %v", id)
			continue
		}

		scientificName, ok := rawPlant["scientificName"].(string)
		if !ok {
			log.Printf("WARNING: Invalid or missing scientificName for plant %s", name)
			continue
		}

		image, ok := rawPlant["image"].(string)
		if !ok {
			log.Printf("WARNING: Invalid or missing image for plant %s", name)
			continue
		}

		description, ok := rawPlant["description"].(string)
		if !ok {
			log.Printf("WARNING: Invalid or missing description for plant %s", name)
			continue
		}

		careLevel, ok := rawPlant["careLevel"].(string)
		if !ok {
			log.Printf("WARNING: Invalid or missing careLevel for plant %s", name)
			continue
		}

		// Extract conditions
		rawConditions, ok := rawPlant["conditions"].(map[string]interface{})
		if !ok {
			log.Printf("WARNING: Invalid conditions format for plant %s", name)
			continue
		}

		// Ensure all array fields are properly handled
		area := convertToStringSlice(rawConditions["พื้นที่"])
		light := convertToStringSlice(rawConditions["แสง"])
		purpose := convertToStringSlice(rawConditions["วัตถุประสงค์"])
		experience := convertToStringSlice(rawConditions["ประสบการณ์"])

		// Ensure string fields are not empty
		size := ""
		if sizeVal, ok := rawConditions["ขนาด"].(string); ok {
			size = sizeVal
		}

		water := ""
		if waterVal, ok := rawConditions["น้ำ"].(string); ok {
			water = waterVal
		}

		// Create plant with validated conditions
		plant := models.PlantRecommendation{
			ID:             int(id),
			Name:           name,
			ScientificName: scientificName,
			Image:          image,
			Description:    description,
			CareLevel:      careLevel,
			Conditions: models.PlantConditions{
				Area:       area,
				Light:      light,
				Size:       size,
				Water:      water,
				Purpose:    purpose,
				Experience: experience,
			},
			Benefits: convertToStringSlice(rawPlant["benefits"]),
			Tags:     convertToStringSlice(rawPlant["tags"]),
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

	// Get the database and collection
	db := mongoClient.Database("plante")
	collection := db.Collection("plant_recommendations")

	// Drop existing collection to ensure clean import
	if err := collection.Drop(context.Background()); err != nil {
		log.Printf("Warning: Could not drop existing collection: %v", err)
	}

	// Create index on id field
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "id", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	if _, err := collection.Indexes().CreateOne(context.Background(), indexModel); err != nil {
		log.Printf("Warning: Could not create index: %v", err)
	}

	log.Printf("Importing %d plants into the database...", len(plants))

	// Insert data into MongoDB using bulk insert for better performance
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Convert to interface slice for bulk insert
	var plantsToInsert []interface{}
	for _, plant := range plants {
		plantsToInsert = append(plantsToInsert, plant)
	}

	// Insert all documents at once
	if len(plantsToInsert) > 0 {
		result, err := collection.InsertMany(ctx, plantsToInsert)
		if err != nil {
			log.Printf("Error inserting plants: %v", err)
			return fmt.Errorf("error inserting plants: %w", err)
		}
		log.Printf("Successfully inserted %d documents", len(result.InsertedIDs))
	}

	// Verify final import
	count, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Warning: Could not count documents after import: %v", err)
	} else {
		log.Printf("Successfully imported %d plants into plant_recommendations collection", count)
	}

	// Sample verification - check one record to ensure data integrity
	var samplePlant models.PlantRecommendation
	err = collection.FindOne(ctx, bson.M{}).Decode(&samplePlant)
	if err != nil {
		log.Printf("Warning: Could not verify sample plant: %v", err)
	} else {
		log.Printf("Sample plant verification:")
		log.Printf("  Name: %s", samplePlant.Name)
		log.Printf("  Area: %v", samplePlant.Conditions.Area)
		log.Printf("  Light: %v", samplePlant.Conditions.Light)
		log.Printf("  Size: %s", samplePlant.Conditions.Size)
		log.Printf("  Water: %s", samplePlant.Conditions.Water)
		log.Printf("  Purpose: %v", samplePlant.Conditions.Purpose)
		log.Printf("  Experience: %v", samplePlant.Conditions.Experience)
	}

	return nil
}

// Helper function to convert interface{} to []string
func convertToStringSlice(v interface{}) []string {
	if v == nil {
		return []string{}
	}

	switch val := v.(type) {
	case []interface{}:
		result := make([]string, len(val))
		for i, item := range val {
			if item != nil {
				result[i] = fmt.Sprint(item)
			}
		}
		return result
	case []string:
		return val
	default:
		return []string{}
	}
}
