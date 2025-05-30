package services

import (
	"authentication/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/api/option"
)

type NotificationService struct {
	db     *mongo.Database
	client *messaging.Client
}

func NewNotificationService(db *mongo.Database) (*NotificationService, error) {
	// Initialize Firebase Admin SDK
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	// Get Messaging client
	client, err := app.Messaging(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting messaging client: %v", err)
	}

	return &NotificationService{
		db:     db,
		client: client,
	}, nil
}

func (s *NotificationService) SendNotification(token string, title, body string, data map[string]string) error {
	badge := 1
	message := &messaging.Message{
		Token: token,
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data: data,
		Android: &messaging.AndroidConfig{
			Priority: "high",
			Notification: &messaging.AndroidNotification{
				Title:    title,
				Body:     body,
				Priority: messaging.PriorityHigh,
			},
		},
		APNS: &messaging.APNSConfig{
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Sound: "default",
					Badge: &badge,
				},
			},
		},
	}

	_, err := s.client.Send(context.Background(), message)
	if err != nil {
		return fmt.Errorf("error sending FCM message: %v", err)
	}

	return nil
}

func (s *NotificationService) CheckAndSendReminders() error {
	ctx := context.Background()
	now := time.Now()

	// Get all active reminders
	cursor, err := s.db.Collection("reminders").Find(ctx, bson.M{"is_active": true})
	if err != nil {
		return fmt.Errorf("error fetching reminders: %v", err)
	}
	defer cursor.Close(ctx)

	var reminders []models.Reminder
	if err := cursor.All(ctx, &reminders); err != nil {
		return fmt.Errorf("error decoding reminders: %v", err)
	}

	for _, reminder := range reminders {
		// Get user's FCM token
		var user models.User
		err := s.db.Collection("users").FindOne(ctx, bson.M{"_id": reminder.UserID}).Decode(&user)
		if err != nil {
			log.Printf("Error fetching user for reminder %s: %v", reminder.ID.Hex(), err)
			continue
		}

		if user.FCMToken == nil {
			log.Printf("No FCM token found for user %s", user.User_id)
			continue
		}

		// Check if reminder should be sent based on its frequency
		shouldSend := false
		switch reminder.Frequency {
		case "once":
			// For one-time reminders, check if it's time
			if reminder.ScheduledTime.Before(now) && reminder.ScheduledTime.After(now.Add(-1*time.Minute)) {
				shouldSend = true
			}
		case "daily":
			// For daily reminders, check if current time matches
			currentTime := now.Format("15:04")
			if currentTime == reminder.TimeOfDay {
				shouldSend = true
			}
		case "weekly":
			// For weekly reminders, check if current day and time match
			currentDay := now.Format("Monday")
			currentTime := now.Format("15:04")
			if currentDay == reminder.DayOfWeek && currentTime == reminder.TimeOfDay {
				shouldSend = true
			}
		}

		if shouldSend {
			// Parse notification data
			var notificationData map[string]interface{}
			if err := json.Unmarshal([]byte(reminder.NotificationData), &notificationData); err != nil {
				log.Printf("Error parsing notification data for reminder %s: %v", reminder.ID.Hex(), err)
				continue
			}

			// Convert notification data to string map for FCM
			data := make(map[string]string)
			for k, v := range notificationData {
				data[k] = fmt.Sprintf("%v", v)
			}

			// Send notification
			err = s.SendNotification(*user.FCMToken, data["title"], data["body"], data)
			if err != nil {
				log.Printf("Error sending notification for reminder %s: %v", reminder.ID.Hex(), err)
				continue
			}

			// If it's a one-time reminder, mark it as inactive
			if reminder.Frequency == "once" {
				_, err = s.db.Collection("reminders").UpdateOne(
					ctx,
					bson.M{"_id": reminder.ID},
					bson.M{"$set": bson.M{"is_active": false}},
				)
				if err != nil {
					log.Printf("Error updating one-time reminder %s: %v", reminder.ID.Hex(), err)
				}
			}
		}
	}

	return nil
}
