package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Plant struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name        string             `bson:"name" json:"name"`
	Type        string             `bson:"type" json:"type"`
	Container   string             `bson:"container" json:"container"`
	PlantHeight float64            `bson:"plant_height" json:"plant_height"`
	PlantDate   time.Time          `bson:"plant_date" json:"plant_date"`
	ImageURL    string             `bson:"image_url" json:"image_url"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`

	// Legacy fields (will be removed after migration)
	Plantheight float64   `bson:"plantheight,omitempty" json:"plantheight,omitempty"`
	Plantdate   time.Time `bson:"plantdate,omitempty" json:"plantdate,omitempty"`
	Imageurl    string    `bson:"imageurl,omitempty" json:"imageurl,omitempty"`
	Createdat   time.Time `bson:"createdat,omitempty" json:"createdat,omitempty"`
	Updatedat   time.Time `bson:"updatedat,omitempty" json:"updatedat,omitempty"`
}
