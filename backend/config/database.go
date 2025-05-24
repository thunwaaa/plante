package config

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database

func SetDatabase(database *mongo.Database) {
	db = database
}

func ConnectDB() *mongo.Client {
	log.Println("Attempting to connect to MongoDB...")
	clientOptions := options.Client().ApplyURI("mongodb+srv://thunk:Glidgd5324@mai.keo9rgi.mongodb.net/")

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)

	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("MongoDB is not reachable: %v", err)
	}

	log.Println("Successfully connected to MongoDB!")
	return client
}

var Client *mongo.Client = ConnectDB()

func OpenCollection(collectionName string) *mongo.Collection {
	return db.Collection(collectionName)
}
