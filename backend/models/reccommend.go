package models

type PlantConditions struct {
	Area       []string `json:"พื้นที่" bson:"พื้นที่"`
	Light      []string `json:"แสง" bson:"แสง"`
	Size       string   `json:"ขนาด" bson:"ขนาด"`
	Water      string   `json:"น้ำ" bson:"น้ำ"`
	Purpose    []string `json:"วัตถุประสงค์" bson:"วัตถุประสงค์"`
	Experience []string `json:"ประสบการณ์" bson:"ประสบการณ์"`
}

type PlantRecommendation struct {
	ID             int             `json:"id" bson:"id"`
	Name           string          `json:"name" bson:"name"`
	ScientificName string          `json:"scientificName" bson:"scientific_name"`
	Image          string          `json:"image" bson:"image"`
	Description    string          `json:"description" bson:"description"`
	CareLevel      string          `json:"careLevel" bson:"care_level"`
	Conditions     PlantConditions `json:"conditions" bson:"conditions"`
	Benefits       []string        `json:"benefits" bson:"benefits"`
	Tags           []string        `json:"tags" bson:"tags"`
}

type PlantRecommendationList []PlantRecommendation
