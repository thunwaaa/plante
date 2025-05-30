package routes

import (
	"authentication/controllers"
	"authentication/middleware"
	"authentication/models"
	"authentication/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PlantRoutes(router *gin.Engine, authService *services.AuthService) {
	// Create auth middleware
	authMiddleware, err := middleware.NewAuthMiddleware(authService.GetDB())
	if err != nil {
		panic(err)
	}

	plantGroup := router.Group("/api/plants")
	plantGroup.Use(func(c *gin.Context) {
		authMiddleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
			// Get user from context
			user, ok := r.Context().Value("user").(*models.User)
			if !ok {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "User not authenticated",
					"code":  "UNAUTHORIZED",
				})
				c.Abort()
				return
			}

			// Set user in gin context
			c.Set("user", user)
			c.Set("user_id", user.User_id)
			c.Next()
		})(c.Writer, c.Request)
	})

	// More specific routes first
	plantGroup.POST("/upload", controllers.UploadPlantImage())
	plantGroup.POST("/new", controllers.CreatePlant())
	plantGroup.PUT("/edit/:plant_id", controllers.UpdatePlant())
	plantGroup.POST("/:plant_id/growth", controllers.AddGrowthRecord())
	plantGroup.PUT("/:plant_id/growth/:record_id", controllers.UpdateGrowthRecord())
	plantGroup.DELETE("/:plant_id/growth/:record_id", controllers.DeleteGrowthRecord())

	// More general routes last
	plantGroup.GET("/dashboard", controllers.GetUserPlants())
	plantGroup.GET("/:plant_id", controllers.GetPlant())
	plantGroup.DELETE("/:plant_id", controllers.DeletePlant())
}
