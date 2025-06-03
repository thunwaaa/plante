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
	db                    *mongo.Database
	client                *messaging.Client
	lastNotificationTimes map[string]time.Time
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
		db:                    db,
		client:                client,
		lastNotificationTimes: make(map[string]time.Time),
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
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc)

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

	log.Printf("[DEBUG] Found %d active reminders", len(reminders))

	for _, reminder := range reminders {
		log.Printf("[DEBUG] Processing reminder: ID=%s, Type=%s, Frequency=%s, ScheduledTime=%v",
			reminder.ID.Hex(), reminder.Type, reminder.Frequency, reminder.ScheduledTime)

		// Get user's FCM token
		var user models.User
		err := s.db.Collection("users").FindOne(ctx, bson.M{"user_id": reminder.UserID}).Decode(&user)
		if err != nil {
			log.Printf("[ERROR] Error fetching user for reminder %s: %v", reminder.ID.Hex(), err)
			continue
		}

		if user.FCMToken == nil {
			log.Printf("[ERROR] No FCM token found for user %s", user.User_id)
			continue
		}

		log.Printf("[DEBUG] User FCM token: %s", *user.FCMToken)

		// Check if reminder should be sent based on its frequency
		shouldSend := false
		switch reminder.Frequency {
		case "once":
			// For one-time reminders, check if it's time
			reminderTime := reminder.ScheduledTime.In(loc)
			// Compare only hours and minutes, ignore seconds
			nowTruncated := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), 0, 0, loc)
			reminderTimeTruncated := time.Date(reminderTime.Year(), reminderTime.Month(), reminderTime.Day(),
				reminderTime.Hour(), reminderTime.Minute(), 0, 0, loc)

			log.Printf("[DEBUG] One-time reminder check: now=%v, scheduled=%v", nowTruncated, reminderTimeTruncated)
			if nowTruncated.Equal(reminderTimeTruncated) {
				shouldSend = true
				log.Printf("[DEBUG] One-time reminder should be sent")
			}
		case "daily":
			// For daily reminders, check if current time matches (ignoring seconds)
			currentTime := now.Format("15:04")
			scheduledTime := reminder.TimeOfDay
			log.Printf("[DEBUG] Daily reminder check: current=%s, scheduled=%s", currentTime, scheduledTime)

			if currentTime == scheduledTime {
				shouldSend = true
				log.Printf("[DEBUG] Daily reminder should be sent")
			}
		case "weekly":
			// For weekly reminders, check if current day and time match (ignoring seconds)
			currentDay := now.Format("Monday")
			currentTime := now.Format("15:04")
			scheduledTime := reminder.TimeOfDay
			log.Printf("[DEBUG] Weekly reminder check: day=%s, time=%s, scheduled_day=%s, scheduled_time=%s",
				currentDay, currentTime, reminder.DayOfWeek, scheduledTime)

			if currentDay == reminder.DayOfWeek && currentTime == scheduledTime {
				shouldSend = true
				log.Printf("[DEBUG] Weekly reminder should be sent")
			}
		}

		if shouldSend {
			// Check if we've already sent a notification for this reminder in the current minute
			lastNotificationKey := fmt.Sprintf("last_notification_%s", reminder.ID.Hex())
			lastNotificationTime, exists := s.lastNotificationTimes[lastNotificationKey]

			if !exists || !lastNotificationTime.Equal(time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), 0, 0, loc)) {
				log.Printf("[DEBUG] Preparing to send notification for reminder %s", reminder.ID.Hex())
				// Parse notification data
				var notificationData map[string]interface{}
				if err := json.Unmarshal([]byte(reminder.NotificationData), &notificationData); err != nil {
					log.Printf("[ERROR] Error parsing notification data for reminder %s: %v", reminder.ID.Hex(), err)
					continue
				}

				// Extract title, body, and plantName from notification data
				title, okTitle := notificationData["title"].(string)
				body, okBody := notificationData["body"].(string)

				if !okTitle || !okBody || title == "" || body == "" {
					log.Printf("[ERROR] Notification data missing title/body for reminder %s", reminder.ID.Hex())
					continue
				}

				// Convert notification data to string map for FCM
				data := make(map[string]string)
				for k, v := range notificationData {
					data[k] = fmt.Sprintf("%v", v)
				}

				// Send notification
				err = s.SendNotification(*user.FCMToken, title, body, data)
				if err != nil {
					log.Printf("[ERROR] Error sending notification for reminder %s: %v", reminder.ID.Hex(), err)
					continue
				}
				log.Printf("[DEBUG] Successfully sent notification for reminder %s", reminder.ID.Hex())

				// Update last notification time
				s.lastNotificationTimes[lastNotificationKey] = time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), 0, 0, loc)

				// If it's a one-time reminder, mark it as inactive
				if reminder.Frequency == "once" {
					_, err = s.db.Collection("reminders").UpdateOne(
						ctx,
						bson.M{"_id": reminder.ID},
						bson.M{"$set": bson.M{"is_active": false}},
					)
					if err != nil {
						log.Printf("[ERROR] Error updating one-time reminder %s: %v", reminder.ID.Hex(), err)
					} else {
						log.Printf("[DEBUG] Marked one-time reminder %s as inactive", reminder.ID.Hex())
					}
				}
			}
		}
	}

	return nil
}

// Helper function to parse time string to int
func parseInt(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}
