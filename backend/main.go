package main

import (
	"authentication/config"
	"authentication/helpers"
	"authentication/routes"
	"fmt"

	"log"

	"github.com/gin-gonic/gin"
)

func main() {

	//Connect to mongoDB

	log.Println("Starting application...")

	key := config.GenerateRandomKey()
	helpers.SetJWTKey(key)
	fmt.Printf("Generated Key: %s\n", key)
	//Init gin router
	r := gin.Default()
	routes.SetupRoutes(r)

	// //Start the server
	r.Run(":8080")
	log.Println("Serever is running on http://localhost:8080")
}