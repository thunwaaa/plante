package services

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"authentication/config"
	"authentication/models"
)

// GetDB returns the database instance from config
func GetDB() *mongo.Database {
	return config.DB
}

// NewReminderService creates a new reminder service
func NewReminderService(database *mongo.Database) *ReminderService {
	return &ReminderService{
		db: database,
	}
}

type ReminderService struct {
	db *mongo.Database
}

// GetRemindersByPlantID gets all reminders for a specific plant
func (s *ReminderService) GetRemindersByPlantID(plantID string) ([]models.Reminder, error) {
	log.Printf("[DEBUG] Service: Getting reminders for plant ID: %s", plantID)
	var reminders []models.Reminder

	// Convert plantID string to ObjectID
	objID, err := primitive.ObjectIDFromHex(plantID)
	if err != nil {
		log.Printf("[ERROR] Service: Invalid plant ID format: %v", err)
		return nil, fmt.Errorf("invalid plant ID format: %v", err)
	}

	log.Printf("[DEBUG] Service: Finding reminders in database for plant ID: %s", plantID)
	// Find all reminders for the plant
	cursor, err := s.db.Collection("reminders").Find(context.Background(), bson.M{
		"plant_id": objID,
	})
	if err != nil {
		log.Printf("[ERROR] Service: Error finding reminders: %v", err)
		return nil, fmt.Errorf("error finding reminders: %v", err)
	}
	defer cursor.Close(context.Background())

	log.Printf("[DEBUG] Service: Decoding reminders from cursor")
	// Decode all reminders
	if err := cursor.All(context.Background(), &reminders); err != nil {
		log.Printf("[ERROR] Service: Error decoding reminders: %v", err)
		return nil, fmt.Errorf("error decoding reminders: %v", err)
	}

	log.Printf("[DEBUG] Service: Successfully retrieved %d reminders", len(reminders))
	return reminders, nil
}
