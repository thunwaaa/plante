package routes

import (
	"authentication/controllers"
	"authentication/middleware"

	"github.com/gin-gonic/gin"
)

func PlantRoutes(router *gin.Engine) {
	plantGroup := router.Group("/api/plants")
	plantGroup.Use(middleware.Authenticate())

	// More specific routes first
	plantGroup.POST("/upload", controllers.UploadImage())
	plantGroup.POST("/new", controllers.CreatePlant())
	plantGroup.PUT("/edit/:plant_id", controllers.UpdatePlant())

	// More general routes last
	plantGroup.GET("/dashboard", controllers.GetUserPlants())
	plantGroup.GET("/:plant_id", controllers.GetPlant())
	plantGroup.DELETE("/:plant_id", controllers.DeletePlant())
}
