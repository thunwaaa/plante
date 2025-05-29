package routes

import (
	"authentication/controllers"
	"authentication/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRecommendationRoutes(router *gin.RouterGroup, db *mongo.Database) {
	recommendationRoutes := router.Group("/recommendations")
	{
		// Public routes - handle both with and without trailing slash
		recommendationRoutes.GET("", controllers.GetRecommendations())
		recommendationRoutes.GET("/", controllers.GetRecommendations())

		// Admin only routes
		adminGroup := recommendationRoutes.Group("/")
		adminGroup.Use(middleware.Authenticate(), middleware.AdminOnly())
		{
			adminGroup.POST("/import", controllers.ImportPlantData())
		}
	}
}
