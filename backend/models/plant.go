package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Plant struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id" validate:"required"`
	Name        string             `json:"name" validate:"required"`
	Type        string             `json:"type" validate:"required"`
	Container   string             `json:"container" validate:"required"`
	PlantHeight float64            `json:"plant_height" validate:"required"`
	PlantDate   time.Time          `json:"plant_date" validate:"required"`
	ImageURL    string             `json:"image_url,omitempty"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}
