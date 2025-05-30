package routes

import (
	"authentication/controllers"
	"authentication/middleware"
	"authentication/models"
	"authentication/services"

	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRecommendationRoutes(router *gin.RouterGroup, authService *services.AuthService) {
	// Create auth middleware
	authMiddleware, err := middleware.NewAuthMiddleware(authService.GetDB())
	if err != nil {
		panic(err)
	}

	recommendationRoutes := router.Group("/recommendations")
	{
		// Public routes - handle both with and without trailing slash
		recommendationRoutes.GET("", controllers.GetRecommendations())
		recommendationRoutes.GET("/", controllers.GetRecommendations())

		// Admin only routes
		adminGroup := recommendationRoutes.Group("/")
		adminGroup.Use(func(c *gin.Context) {
			authMiddleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
				// Copy user from context
				if user, ok := r.Context().Value("user").(*models.User); ok {
					c.Set("user", user)
					// Check if user is admin
					if user.Role != "admin" {
						c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin access required"})
						return
					}
				}
				c.Next()
			})(c.Writer, c.Request)
		})
		{
			adminGroup.POST("/import", controllers.ImportPlantData())
		}
	}
}
