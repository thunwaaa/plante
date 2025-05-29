package controllers

import (
	"authentication/models"
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type DiagnosisController struct {
	collection *mongo.Collection
}

func NewDiagnosisController(db *mongo.Database) *DiagnosisController {
	return &DiagnosisController{
		collection: db.Collection("plant_problems"),
	}
}

// InitializeDiagnosisData loads the JSON data into MongoDB
func (dc *DiagnosisController) InitializeDiagnosisData() error {
	log.Println("Starting initialization of plant problems data...")

	// Read the JSON file
	file, err := ioutil.ReadFile("data/plant_problem_data.json")
	if err != nil {
		log.Printf("Error reading plant problem data file: %v", err)
		return err
	}
	log.Println("Successfully read plant problem data file")

	var data struct {
		TreeDiagnosisResponses []models.PlantProblem `json:"tree_diagnosis_responses"`
	}
	if err := json.Unmarshal(file, &data); err != nil {
		log.Printf("Error unmarshaling plant problem data: %v", err)
		return err
	}
	log.Printf("Successfully unmarshaled %d plant problems", len(data.TreeDiagnosisResponses))

	// Clear existing data
	_, err = dc.collection.DeleteMany(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Error clearing existing plant problems: %v", err)
		return err
	}
	log.Println("Successfully cleared existing plant problems")

	// Insert new data
	if len(data.TreeDiagnosisResponses) > 0 {
		var documents []interface{}
		for _, problem := range data.TreeDiagnosisResponses {
			documents = append(documents, problem)
		}
		result, err := dc.collection.InsertMany(context.Background(), documents)
		if err != nil {
			log.Printf("Error inserting plant problems: %v", err)
			return err
		}
		log.Printf("Successfully inserted %d plant problems", len(result.InsertedIDs))
	} else {
		log.Println("No plant problems to insert")
	}

	return nil
}

// GetDiagnosis handles the diagnosis request and returns the best matching diagnosis
func (dc *DiagnosisController) GetDiagnosis(c *gin.Context) {
	var request models.DiagnosisRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get all plant problems from database
	cursor, err := dc.collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch diagnosis data"})
		return
	}
	defer cursor.Close(context.Background())

	var problems []models.PlantProblem
	if err := cursor.All(context.Background(), &problems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode diagnosis data"})
		return
	}

	// Find the best matching diagnosis
	bestMatch := findBestMatch(request, problems)
	if bestMatch == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No matching diagnosis found"})
		return
	}

	response := models.DiagnosisResponse{
		Diagnosis: bestMatch.Diagnosis,
		Solution:  bestMatch.Solution,
		Severity:  bestMatch.Severity,
	}

	c.JSON(http.StatusOK, response)
}

// findBestMatch finds the most similar diagnosis based on the input conditions
func findBestMatch(request models.DiagnosisRequest, problems []models.PlantProblem) *models.PlantProblem {
	var bestMatch *models.PlantProblem
	highestScore := -1.0

	for _, problem := range problems {
		score := calculateMatchScore(request, problem.Condition)
		if score > highestScore {
			highestScore = score
			bestMatch = &problem
		}
	}

	// Only return a match if the score is above a certain threshold
	if highestScore >= 0.6 { // 60% match threshold
		return bestMatch
	}
	return nil
}

// calculateMatchScore calculates how well the request matches a condition
func calculateMatchScore(request models.DiagnosisRequest, condition models.Condition) float64 {
	var score float64
	var totalWeight float64

	// Problem part match (weight: 2)
	problemPartMatch := false
	for _, part := range condition.ProblemPart {
		if request.ProblemPart == part {
			problemPartMatch = true
			break
		}
	}
	if problemPartMatch {
		score += 2
	}
	totalWeight += 2

	// Symptoms match (weight: 3)
	if len(request.Symptoms) > 0 && len(condition.Symptoms) > 0 {
		symptomMatches := 0
		for _, reqSymptom := range request.Symptoms {
			for _, condSymptom := range condition.Symptoms {
				if reqSymptom == condSymptom {
					symptomMatches++
					break
				}
			}
		}
		score += float64(symptomMatches) * 3 / float64(math.Max(float64(len(request.Symptoms)), float64(len(condition.Symptoms))))
	}
	totalWeight += 3

	// Watering frequency match (weight: 1)
	if request.WateringFrequency == condition.WateringFrequency {
		score += 1
	}
	totalWeight += 1

	// Sunlight match (weight: 1)
	if request.Sunlight == condition.Sunlight {
		score += 1
	}
	totalWeight += 1

	// Soil type match (weight: 1)
	if request.SoilType == condition.SoilType {
		score += 1
	}
	totalWeight += 1

	// Temperature match (weight: 1)
	if request.Temperature == condition.Temperature {
		score += 1
	}
	totalWeight += 1

	// Materials match (weight: 1)
	if len(request.Materials) > 0 && len(condition.Materials) > 0 {
		materialMatches := 0
		for _, reqMaterial := range request.Materials {
			for _, condMaterial := range condition.Materials {
				if reqMaterial == condMaterial {
					materialMatches++
					break
				}
			}
		}
		score += float64(materialMatches) / float64(math.Max(float64(len(request.Materials)), float64(len(condition.Materials))))
	}
	totalWeight += 1

	// Fertilizers match (weight: 1)
	if len(request.Fertilizers) > 0 && len(condition.Fertilizers) > 0 {
		fertilizerMatches := 0
		for _, reqFertilizer := range request.Fertilizers {
			for _, condFertilizer := range condition.Fertilizers {
				if reqFertilizer == condFertilizer {
					fertilizerMatches++
					break
				}
			}
		}
		score += float64(fertilizerMatches) / float64(math.Max(float64(len(request.Fertilizers)), float64(len(condition.Fertilizers))))
	}
	totalWeight += 1

	// Normalize score to 0-1 range
	return score / totalWeight
}
