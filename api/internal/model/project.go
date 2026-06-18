package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Number      string          `json:"number"`
	CalcNo      string          `json:"calcNo"`
	Customer    string          `json:"customer"`
	Address     string          `json:"address"`
	City        string          `json:"city"`
	Lat         *float64        `json:"lat,omitempty"`
	Lon         *float64        `json:"lon,omitempty"`
	AreaM2      float64         `json:"areaM2"`
	RoofType    string          `json:"roofType"`
	Parapet     string          `json:"parapet"`
	Status      string          `json:"status"`
	Author      string          `json:"author"`
	NorthDeg    float64         `json:"northDeg"`
	SnowRegion  string          `json:"snowRegion"`
	WindRegion  string          `json:"windRegion"`
	Geometry    json.RawMessage `json:"geometry"`
	Climate     json.RawMessage `json:"climate"`
	Calculation json.RawMessage `json:"calculation"`
	UnderlayURL string          `json:"underlayUrl,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

type ProjectListItem struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Number   string    `json:"number"`
	CalcNo   string    `json:"calcNo"`
	Customer string    `json:"customer"`
	City     string    `json:"city"`
	AreaM2   float64   `json:"areaM2"`
	Sensors  int       `json:"sensors"`
	Status   string    `json:"status"`
	Created  string    `json:"created"`
	Calcs    int       `json:"calcs"`
}

type CalculationRun struct {
	ID          uuid.UUID       `json:"id"`
	ProjectID   uuid.UUID       `json:"projectId"`
	CalcNo      string          `json:"calcNo"`
	Author      string          `json:"author"`
	Status      string          `json:"status"`
	NorthDeg    float64         `json:"northDeg"`
	SnowRegion  string          `json:"snowRegion"`
	WindRegion  string          `json:"windRegion"`
	Geometry    json.RawMessage `json:"geometry,omitempty"`
	Climate     json.RawMessage `json:"climate,omitempty"`
	Calculation json.RawMessage `json:"calculation,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	Created     string          `json:"created"`
	Current     bool            `json:"current,omitempty"`
	Sensors     int             `json:"sensors"`
}

type CalculationHistoryResponse struct {
	ProjectID uuid.UUID        `json:"projectId"`
	CalcNo    string           `json:"calcNo"`
	Author    string           `json:"author"`
	Items     []CalculationRun `json:"items"`
}

type CreateProjectRequest struct {
	Name     string `json:"name"`
	Address  string `json:"address"`
	City     string `json:"city"`
	Customer string `json:"customer"`
}

type UpdateProjectRequest struct {
	Name       *string          `json:"name,omitempty"`
	Address    *string          `json:"address,omitempty"`
	City       *string          `json:"city,omitempty"`
	Lat        *float64         `json:"lat,omitempty"`
	Lon        *float64         `json:"lon,omitempty"`
	Customer   *string          `json:"customer,omitempty"`
	AreaM2     *float64         `json:"areaM2,omitempty"`
	NorthDeg   *float64         `json:"northDeg,omitempty"`
	SnowRegion *string          `json:"snowRegion,omitempty"`
	WindRegion *string          `json:"windRegion,omitempty"`
	Geometry   json.RawMessage  `json:"geometry,omitempty"`
	Climate    json.RawMessage  `json:"climate,omitempty"`
	Calculation json.RawMessage `json:"calculation,omitempty"`
	Status     *string          `json:"status,omitempty"`
}

type CalculateRequest struct {
	NorthDeg   float64         `json:"northDeg"`
	SnowRegion string          `json:"snowRegion"`
	WindRegion string          `json:"windRegion"`
	Geometry   json.RawMessage `json:"geometry"`
	Climate    json.RawMessage `json:"climate"`
	Sensors    []Sensor        `json:"sensors,omitempty"`
}

type GeometryData struct {
	Roof      [][]float64 `json:"roof"`
	Obstacles []Obstacle  `json:"obstacles,omitempty"`
	Walkway   [][]float64 `json:"walkway,omitempty"`
	AreaM2    float64     `json:"areaM2,omitempty"`
}

type Obstacle struct {
	ID    string  `json:"id"`
	Type  string  `json:"type"`
	Short string  `json:"short,omitempty"`
	Shape string  `json:"shape"`
	X     float64 `json:"x,omitempty"`
	Y     float64 `json:"y,omitempty"`
	W     float64 `json:"w,omitempty"`
	H     float64 `json:"h,omitempty"`
	CX    float64 `json:"cx,omitempty"`
	CY    float64 `json:"cy,omitempty"`
	R     float64 `json:"r,omitempty"`
	HM    float64 `json:"hM,omitempty"`
}

type CalculateInput struct {
	City       string
	SnowRegion string
	WindRegion string
	NorthDeg   float64
	Geometry   GeometryData
	WindRose   []WindRose
	Sensors    []Sensor
}

type CalculationResult struct {
	Snowbags []Snowbag  `json:"snowbags"`
	Sensors  []Sensor   `json:"sensors"`
	Metrics  Metrics    `json:"metrics"`
	Spec     []SpecItem `json:"spec"`
	WindRose []WindRose `json:"windRose"`
}

type Snowbag struct {
	ID    string      `json:"id"`
	Name  string      `json:"name"`
	Basis string      `json:"basis"`
	Poly  [][]float64 `json:"poly"`
	Mu    float64     `json:"mu"`
	Load  string      `json:"load"`
	Area  int         `json:"area"`
	Risk  string      `json:"risk"`
}

type Sensor struct {
	ID   string  `json:"id"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Zone *string `json:"zone"`
}

type Metrics struct {
	RoofArea  string         `json:"roofArea"`
	BagsArea  string         `json:"bagsArea"`
	BagsShare string         `json:"bagsShare"`
	Sensors   int            `json:"sensors"`
	Coverage  string         `json:"coverage"`
	MaxLoad   string         `json:"maxLoad"`
	MinDistM  string         `json:"minDistM,omitempty"`
	AvgDistM  string         `json:"avgDistM,omitempty"`
	Risk      map[string]int `json:"risk"`
}

type SpecItem struct {
	Pos  int    `json:"pos"`
	Name string `json:"name"`
	Unit string `json:"unit"`
	Qty  int    `json:"qty"`
	Note string `json:"note"`
}

type WindRose struct {
	Dir string  `json:"dir"`
	Deg float64 `json:"deg"`
	V   int     `json:"v"`
}

type ProjectFile struct {
	ID        uuid.UUID `json:"id"`
	ProjectID uuid.UUID `json:"projectId"`
	Name      string    `json:"name"`
	MimeType  string    `json:"mimeType"`
	Size      int64     `json:"size"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"createdAt"`
}

type HealthResponse struct {
	Status   string            `json:"status"`
	Services map[string]string `json:"services"`
}
