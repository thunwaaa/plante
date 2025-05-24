package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// ... existing code ...

func UploadImage() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log the request details
		log.Printf("Received upload request - Content-Type: %s", c.GetHeader("Content-Type"))

		// Get the file from the request
		file, err := c.FormFile("image")
		if err != nil {
			log.Printf("Error getting file from form: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("No image file provided: %v", err)})
			return
		}

		// Log file details
		log.Printf("Received file: %s, size: %d bytes", file.Filename, file.Size)

		// Create uploads directory if it doesn't exist
		uploadDir := "./uploads"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			log.Printf("Error creating upload directory: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		// Generate unique filename
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filepath := filepath.Join(uploadDir, filename)

		// Save the file
		if err := c.SaveUploadedFile(file, filepath); err != nil {
			log.Printf("Error saving file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image: %v", err)})
			return
		}

		log.Printf("Successfully saved file to: %s", filepath)

		// Return the URL for the uploaded image
		imageURL := fmt.Sprintf("/uploads/%s", filename)
		c.JSON(http.StatusOK, gin.H{"image_url": imageURL})
	}
}
