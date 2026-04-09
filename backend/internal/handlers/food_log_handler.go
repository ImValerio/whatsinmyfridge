package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
)

func AutocompleteFood(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusOK, []string{})
		return
	}

	var foodLogs []models.FoodLog
	if err := database.DB.Where("name LIKE ?", q+"%").Limit(10).Find(&foodLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch autocomplete suggestions"})
		return
	}

	suggestions := make([]string, len(foodLogs))
	for i, log := range foodLogs {
		suggestions[i] = log.Name
	}

	c.JSON(http.StatusOK, suggestions)
}

func CreateFoodLog(c *gin.Context) {
	var foodLog models.FoodLog
	if err := c.ShouldBindJSON(&foodLog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&foodLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create food log"})
		return
	}
	c.JSON(http.StatusCreated, foodLog)
}

func ListFoodLogs(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "10")

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var foodLogs []models.FoodLog
	var total int64

	database.DB.Model(&models.FoodLog{}).Count(&total)

	if err := database.DB.Offset(offset).Limit(pageSize).Find(&foodLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch food logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      foodLogs,
		"total":     total,
		"page":      page,
		"pageSize":  pageSize,
		"lastPage":  (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

func GetFoodLog(c *gin.Context) {
	id := c.Param("id")
	var foodLog models.FoodLog
	if err := database.DB.First(&foodLog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food log not found"})
		return
	}
	c.JSON(http.StatusOK, foodLog)
}

func UpdateFoodLog(c *gin.Context) {
	id := c.Param("id")
	var foodLog models.FoodLog
	if err := database.DB.First(&foodLog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food log not found"})
		return
	}

	var input models.FoodLog
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&foodLog).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food log"})
		return
	}
	c.JSON(http.StatusOK, foodLog)
}

func DeleteFoodLog(c *gin.Context) {
	id := c.Param("id")
	var foodLog models.FoodLog
	if err := database.DB.First(&foodLog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food log not found"})
		return
	}
	if err := database.DB.Delete(&foodLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food log"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Food log deleted successfully"})
}
