package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"authentication/config"
	"authentication/controllers"
	"authentication/helpers"
	"authentication/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	log.Println("Starting application...")

	// Generate and set JWT key
	key := config.GenerateRandomKey()
	helpers.SetJWTKey(key)
	log.Printf("Generated Key: %s\n", key)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}
	defer client.Disconnect(ctx)

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB:", err)
	}
	log.Println("Connected to MongoDB!")

	db := client.Database("plante")
	config.SetDatabase(db)
	controllers.InitUserCollection()
	controllers.InitPlantCollection()
	controllers.InitRecommendationCollection()

	// Import plant data from JSON
	if err := helpers.ImportPlantData(client); err != nil {
		log.Printf("Error importing plant data: %v", err)
	}

	// Initialize controllers
	diagnosisController := controllers.NewDiagnosisController(db)

	// Initialize diagnosis data
	if err := diagnosisController.InitializeDiagnosisData(); err != nil {
		log.Printf("Warning: Failed to initialize diagnosis data: %v", err)
	}

	// Initialize router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve static files from the uploads directory
	router.Static("/uploads", "./uploads")

	// Add request logging middleware
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[%s] | %s | %d | %s | %s | %s | %s\n",
			param.TimeStamp.Format("2006/01/02 - 15:04:05"),
			param.ClientIP,
			param.StatusCode,
			param.Method,
			param.Path,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	}))

	// Setup routes
	apiGroup := router.Group("/api")
	routes.SetupRoutes(router)
	routes.PlantRoutes(router)
	routes.SetupRecommendationRoutes(apiGroup, db)
	routes.SetupDiagnosisRoutes(router, diagnosisController)

	// Initialize Cloudinary
	if err := config.InitCloudinary(); err != nil {
		log.Fatal("Failed to initialize Cloudinary:", err)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
	log.Printf("Server is running on http://localhost:%s\n", port)
}
