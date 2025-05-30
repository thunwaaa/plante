package config

import (
	"log"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	MongoClient *mongo.Client
	DB          *mongo.Database
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}
