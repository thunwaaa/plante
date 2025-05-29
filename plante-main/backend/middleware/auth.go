package middleware

import (
	"authentication/helpers"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Handle CORS preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Status(http.StatusOK)
			return
		}

		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		log.Printf("Raw Authorization Header: %s", authHeader)

		// Check if Authorization header exists
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		// Extract the token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		token := tokenParts[1]
		log.Printf("Token after extraction: %s", token)

		// Validate the token
		claims, err := helpers.ValidateToken(token)
		if err != nil {
			log.Printf("Token validation error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		// Set claims and user_id in the context
		c.Set("claims", claims)
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
