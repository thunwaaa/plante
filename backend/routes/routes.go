package routes

import (
	"authentication/controllers"
	"authentication/middleware"
	"authentication/models"
	"authentication/services"

	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, authService *services.AuthService) {
	// Create auth middleware
	authMiddleware, err := middleware.NewAuthMiddleware(authService.GetDB())
	if err != nil {
		panic(err)
	}

	// Public routes
	auth := router.Group("/auth")
	{
		// Firebase Auth routes - Public endpoints that don't need auth
		auth.POST("/verify-token", func(c *gin.Context) {
			var input struct {
				IDToken string `json:"idToken" binding:"required"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(400, gin.H{"error": "Invalid request format"})
				return
			}

			// Verify token
			token, err := authService.VerifyIDToken(input.IDToken)
			if err != nil {
				fmt.Printf("Token verification error: %v\n", err)
				c.JSON(401, gin.H{"error": "Invalid token"})
				return
			}

			// Get user from Firebase
			firebaseUser, err := authService.GetFirebaseUser(token.UID)
			if err != nil {
				fmt.Printf("Firebase user lookup error: %v\n", err)
				c.JSON(500, gin.H{"error": "Failed to get user from Firebase"})
				return
			}

			// Create or update user in MongoDB
			user, err := authService.CreateOrUpdateUser(firebaseUser)
			if err != nil {
				fmt.Printf("User creation/update error: %v\n", err)
				c.JSON(500, gin.H{"error": "Failed to create/update user"})
				return
			}

			// Return user data and token
			c.JSON(200, gin.H{
				"user": gin.H{
					"user_id":       user.User_id,
					"email":         user.Email,
					"name":          user.Name,
					"role":          user.Role,
					"is_verified":   user.IsVerified,
					"provider":      user.Provider,
					"created_at":    user.CreatedAt,
					"updated_at":    user.UpdatedAt,
					"last_login_at": user.LastLoginAt,
				},
				"token": input.IDToken,
			})
		})

		// Protected auth routes that need authentication
		protectedAuth := auth.Group("/")
		{
			// Add auth middleware for protected routes
			protectedAuth.Use(func(c *gin.Context) {
				// Get token from header
				authHeader := c.GetHeader("Authorization")
				if authHeader == "" {
					c.JSON(http.StatusUnauthorized, gin.H{
						"error": "No authorization header",
						"code":  "MISSING_AUTH_HEADER",
					})
					c.Abort()
					return
				}

				// Extract token
				tokenParts := strings.Split(authHeader, " ")
				if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
					c.JSON(http.StatusUnauthorized, gin.H{
						"error": "Invalid authorization header format",
						"code":  "INVALID_AUTH_FORMAT",
					})
					c.Abort()
					return
				}

				token := tokenParts[1]

				// Verify token
				verifiedToken, err := authService.VerifyIDToken(token)
				if err != nil {
					log.Printf("Token verification error: %v", err)
					c.JSON(http.StatusUnauthorized, gin.H{
						"error":   "Invalid token",
						"code":    "INVALID_TOKEN",
						"details": err.Error(),
					})
					c.Abort()
					return
				}

				// Get user from database
				user, err := authService.GetUserByUID(verifiedToken.UID)
				if err != nil {
					log.Printf("User lookup error: %v", err)
					c.JSON(http.StatusUnauthorized, gin.H{
						"error":   "User not found",
						"code":    "USER_NOT_FOUND",
						"details": err.Error(),
					})
					c.Abort()
					return
				}

				// Set user in context
				c.Set("user", *user)
				c.Next()
			})

			// Protected auth endpoints
			protectedAuth.POST("/fcm-token", func(c *gin.Context) {
				// Create a custom handler that converts between http.HandlerFunc and gin.HandlerFunc
				handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					// Get the user from the context after auth middleware
					if user, ok := r.Context().Value("user").(*models.User); ok {
						// Create a new gin context with the user
						c.Set("user", user)

						var input struct {
							FCMToken string `json:"fcmToken" binding:"required"`
						}
						if err := c.ShouldBindJSON(&input); err != nil {
							c.JSON(400, gin.H{"error": err.Error()})
							return
						}

						if err := authService.UpdateFCMToken(user.User_id, input.FCMToken); err != nil {
							c.JSON(500, gin.H{"error": "Failed to update FCM token"})
							return
						}

						c.JSON(200, gin.H{"message": "FCM token updated successfully"})
					} else {
						c.JSON(401, gin.H{"error": "User not authenticated"})
					}
				})

				// Apply the auth middleware
				authMiddleware.AuthMiddleware(handler).ServeHTTP(c.Writer, c.Request)
			})

			protectedAuth.POST("/verify-email", func(c *gin.Context) {
				if c.Request.Method != http.MethodPost {
					c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not allowed"})
					return
				}

				// Get user from context
				user, ok := c.MustGet("user").(models.User)
				if !ok {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
					return
				}

				// Update verification status
				err := authService.UpdateVerificationStatus(user.User_id, true)
				if err != nil {
					log.Printf("Error updating verification status: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification status"})
					return
				}

				// Return success response
				c.JSON(http.StatusOK, gin.H{
					"message": "Email verification status updated successfully",
					"user": map[string]interface{}{
						"user_id":     user.User_id,
						"email":       user.Email,
						"is_verified": true,
					},
				})
			})

			protectedAuth.POST("/send-verification", func(c *gin.Context) {
				// Get user from context
				user, ok := c.MustGet("user").(models.User)
				if !ok {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
					return
				}

				// Send verification email
				err := authService.SendVerificationEmail(user.User_id)
				if err != nil {
					log.Printf("Error sending verification email: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"message": "Verification email sent successfully",
				})
			})

			protectedAuth.GET("/check-verification", func(c *gin.Context) {
				// Get user from context
				user, ok := c.MustGet("user").(models.User)
				if !ok {
					c.JSON(http.StatusUnauthorized, gin.H{
						"error": "User not found in context",
						"code":  "UNAUTHORIZED",
					})
					return
				}

				// Get verification status from database
				isVerified, err := authService.GetUserVerificationStatus(user.User_id)
				if err != nil {
					log.Printf("Error getting verification status: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error":   "Failed to get verification status",
						"code":    "VERIFICATION_CHECK_FAILED",
						"details": err.Error(),
					})
					return
				}

				// Return verification status
				c.JSON(http.StatusOK, gin.H{
					"is_verified": isVerified,
					"user_id":     user.User_id,
					"email":       user.Email,
					"message":     "Verification status retrieved successfully",
				})
			})
		}
	}

	// Protected routes
	api := router.Group("/api")
	api.Use(authMiddleware.GinAuthMiddleware())
	{
		// User profile
		api.GET("/profile", func(c *gin.Context) {
			user := c.MustGet("user").(*models.User)
			c.JSON(200, gin.H{"user": user})
		})

		// Delete account
		api.DELETE("/account", func(c *gin.Context) {
			user := c.MustGet("user").(*models.User)
			if err := authService.DeleteUser(user.User_id); err != nil {
				c.JSON(500, gin.H{"error": "Failed to delete account"})
				return
			}
			c.JSON(200, gin.H{"message": "Account deleted successfully"})
		})

		users := api.Group("/users")
		{
			users.POST("/signup", controllers.Signup())
			users.POST("/login", controllers.Login())
			users.POST("/logout", controllers.Logout())

			// Protected user routes
			protectedUsers := users.Group("/")
			{
				protectedUsers.GET("/", controllers.GetUsers())
				protectedUsers.GET("/:id", controllers.GetUser())
				protectedUsers.POST("/upload-profile-image", controllers.UploadProfileImage())
				// Route to save FCM token
				protectedUsers.POST("/fcm-token", controllers.SaveFCMTokenHandler())
			}
		}

		// Protected reminder routes
		reminders := api.Group("/reminders")
		{
			reminders.POST("/", controllers.CreateReminder())
			reminders.POST("", controllers.CreateReminder())
			reminders.GET("/", controllers.GetReminders())
			reminders.GET("/plant/:plant_id", controllers.GetPlantReminders())
			reminders.PUT("/:id", controllers.UpdateReminder())
			reminders.DELETE("/:id", controllers.DeleteReminder())
		}
	}
}
