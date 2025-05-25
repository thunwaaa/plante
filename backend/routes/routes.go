package routes

import (
	"plante/backend/controllers"
	"plante/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		users := api.Group("/users")
		{
			users.POST("/signup", controllers.Signup())
			users.POST("/login", controllers.Login())
			users.POST("/logout", controllers.Logout())

			// Protected routes
			protected := users.Group("/")
			protected.Use(middleware.Authenticate())
			{
				protected.GET("/", controllers.GetUsers())
				protected.GET("/:id", controllers.GetUser())
			}
		}
	}
}
