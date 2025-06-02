package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reminder struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID           string             `bson:"user_id" json:"userId"`
	PlantID          primitive.ObjectID `bson:"plant_id" json:"plantId"`
	Type             string             `bson:"type" json:"type"`                                 // e.g., "watering", "fertilizing"
	Frequency        string             `bson:"frequency" json:"frequency"`                       // e.g., "once", "daily", "weekly"
	ScheduledTime    time.Time          `bson:"scheduled_time" json:"scheduledTime"`              // For "once" or first occurrence
	DayOfWeek        string             `bson:"day_of_week,omitempty" json:"dayOfWeek,omitempty"` // For "weekly" (e.g., "Monday")
	TimeOfDay        string             `bson:"time_of_day,omitempty" json:"timeOfDay,omitempty"` // For "daily" or "weekly" (e.g., "08:00")
	CreatedAt        time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt        time.Time          `bson:"updated_at" json:"updatedAt"`
	IsActive         bool               `bson:"is_active" json:"isActive"`                                     // To enable/disable reminder
	NotificationData string             `bson:"notification_data,omitempty" json:"notificationData,omitempty"` // JSON string containing notification data
}
