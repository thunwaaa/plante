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
		authHeader := c.GetHeader("Authorization")
		log.Printf("Raw Authorization Header: %s", authHeader) // Log the raw header

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		authHeader = strings.TrimPrefix(authHeader, "Bearer ")
		log.Printf("Token after trimming Bearer: %s", authHeader) // Log after trimming

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		claims, err := helpers.ValidateToken(authHeader)
		if err != nil {
			log.Printf("Token validation error: %v", err) // Log the validation error
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		// Set claims in the context for later use in controllers
		c.Set("claims", claims)
		c.Next()
	}
}