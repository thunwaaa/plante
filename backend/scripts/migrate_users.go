package main

import (
	"authentication/models"
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("plante")

	// Get all users
	cursor, err := db.Collection("users").Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	// Update each user
	for cursor.Next(context.Background()) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			log.Printf("Error decoding user: %v", err)
			continue
		}

		// Update user document
		update := bson.M{
			"$set": bson.M{
				"firebase_uid": user.User_id,  // Copy user_id to firebase_uid
				"name":         user.Username, // Copy username to name
				"updated_at":   time.Now(),
			},
			"$unset": bson.M{
				"password": "", // Remove password field
				"role":     "", // Remove role field
			},
		}

		_, err := db.Collection("users").UpdateOne(
			context.Background(),
			bson.M{"_id": user.ID},
			update,
		)
		if err != nil {
			log.Printf("Error updating user %s: %v", user.ID.Hex(), err)
			continue
		}

		fmt.Printf("Updated user: %s\n", user.ID.Hex())
	}

	fmt.Println("Migration completed!")
}
