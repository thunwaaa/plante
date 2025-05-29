package models

import (
	"encoding/json"
	"fmt"
)

type ProblemPartType []string

func (p *ProblemPartType) UnmarshalJSON(data []byte) error {
	var single string
	if err := json.Unmarshal(data, &single); err == nil {
		*p = ProblemPartType{single}
		return nil
	}
	var multi []string
	if err := json.Unmarshal(data, &multi); err == nil {
		*p = multi
		return nil
	}
	return fmt.Errorf("problemPart is neither string nor []string: %s", string(data))
}

type PlantProblem struct {
	ID        int       `json:"id" bson:"id"`
	Condition Condition `json:"condition" bson:"condition"`
	Diagnosis string    `json:"diagnosis" bson:"diagnosis"`
	Solution  string    `json:"solution" bson:"solution"`
	Severity  string    `json:"severity" bson:"severity"`
}

type Condition struct {
	ProblemPart       ProblemPartType `json:"problemPart" bson:"problemPart"`
	Symptoms          []string        `json:"symptoms" bson:"symptoms"`
	WateringFrequency string          `json:"wateringFrequency" bson:"wateringFrequency"`
	Sunlight          string          `json:"sunlight" bson:"sunlight"`
	SoilType          string          `json:"soilType" bson:"soilType"`
	Temperature       string          `json:"temperature" bson:"temperature"`
	Materials         []string        `json:"materials" bson:"materials"`
	Fertilizers       []string        `json:"fertilizers" bson:"fertilizers"`
}

type DiagnosisRequest struct {
	ProblemPart       string   `json:"problemPart"`
	Symptoms          []string `json:"symptoms"`
	WateringFrequency string   `json:"wateringFrequency"`
	Sunlight          string   `json:"sunlight"`
	SoilType          string   `json:"soilType"`
	Temperature       string   `json:"temperature"`
	Materials         []string `json:"materials"`
	Fertilizers       []string `json:"fertilizers"`
}

type DiagnosisResponse struct {
	Diagnosis string `json:"diagnosis"`
	Solution  string `json:"solution"`
	Severity  string `json:"severity"`
}
