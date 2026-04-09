package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/handlers"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
	"github.com/stretchr/testify/assert"
)

func setupTestDB() {
	_, err := database.InitDB("test.db")
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}
}

func cleanupTestDB() {
	sqlDB, _ := database.DB.DB()
	sqlDB.Close()
	os.Remove("test.db")
}

func TestCRUD(t *testing.T) {
	setupTestDB()
	defer cleanupTestDB()

	gin.SetMode(gin.TestMode)
	r := gin.Default()

	// Register routes with /api prefix (consistent with main.go)
	api := r.Group("/api")
	{
		containerGroup := api.Group("/containers")
		{
			containerGroup.POST("", handlers.CreateContainer)
			containerGroup.GET("", handlers.ListContainers)
		}
		foodGroup := api.Group("/food")
		{
			foodGroup.POST("", handlers.CreateFood)
			foodGroup.POST("/:id/open", handlers.OpenFood)
		}
	}

	// 1. Create Container
	containerJSON := `{"name": "Fridge"}`
	req, _ := http.NewRequest("POST", "/api/containers", bytes.NewBufferString(containerJSON))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var createdContainer models.Container
	json.Unmarshal(w.Body.Bytes(), &createdContainer)
	assert.Equal(t, "Fridge", createdContainer.Name)

	// 2. Create Food
	foodJSON := `{"name": "Apple", "quantity": 5, "container_id": 1}`
	req, _ = http.NewRequest("POST", "/api/food", bytes.NewBufferString(foodJSON))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var createdFood models.Food
	json.Unmarshal(w.Body.Bytes(), &createdFood)
	assert.Equal(t, "Apple", createdFood.Name)
	assert.Equal(t, uint(1), createdFood.ContainerID)
	assert.False(t, createdFood.IsOpened)

	// 3. Open Food
	req, _ = http.NewRequest("POST", "/api/food/1/open", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var openedFood models.Food
	json.Unmarshal(w.Body.Bytes(), &openedFood)
	assert.True(t, openedFood.IsOpened)
	assert.NotNil(t, openedFood.ExpirationDate)

	// 4. List Containers with Food
	req, _ = http.NewRequest("GET", "/api/containers", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var containers []models.Container
	json.Unmarshal(w.Body.Bytes(), &containers)
	assert.Len(t, containers, 1)
	assert.Len(t, containers[0].Foods, 1)
	assert.Equal(t, "Apple", containers[0].Foods[0].Name)
	assert.True(t, containers[0].Foods[0].IsOpened)

	// 5. Test Autocomplete
	// Register Autocomplete route for test
	api.GET("/food-logs/autocomplete", handlers.AutocompleteFood)

	req, _ = http.NewRequest("GET", "/api/food-logs/autocomplete?q=Ap", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var suggestions []string
	json.Unmarshal(w.Body.Bytes(), &suggestions)
	assert.Contains(t, suggestions, "Apple")

	// Create another food to test distinct logs
	food2JSON := `{"name": "Banana", "quantity": 2, "container_id": 1}`
	req, _ = http.NewRequest("POST", "/api/food", bytes.NewBufferString(food2JSON))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Test Autocomplete for Banana
	req, _ = http.NewRequest("GET", "/api/food-logs/autocomplete?q=Ban", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	json.Unmarshal(w.Body.Bytes(), &suggestions)
	assert.Contains(t, suggestions, "Banana")

	// Check that we don't have duplicate logs (create Apple again)
	req, _ = http.NewRequest("POST", "/api/food", bytes.NewBufferString(foodJSON))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var count int64
	database.DB.Model(&models.FoodLog{}).Where("name = ?", "Apple").Count(&count)
	assert.Equal(t, int64(1), count)
}
