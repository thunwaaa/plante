package routes

import (
	"authentication/controllers"

	"github.com/gin-gonic/gin"
)

func SetupDiagnosisRoutes(router *gin.Engine, diagnosisController *controllers.DiagnosisController) {
	diagnosisRoutes := router.Group("/api/diagnosis")
	{
		diagnosisRoutes.POST("/analyze", diagnosisController.GetDiagnosis)
	}
}
