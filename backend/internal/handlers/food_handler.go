package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
)

func OpenFood(c *gin.Context) {
	id := c.Param("id")
	var food models.Food
	if err := database.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}

	if food.IsOpened {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Food is already opened"})
		return
	}

	// Set is_opened to true and expiration to now + 2 days
	expiration := time.Now().AddDate(0, 0, 2)
	food.IsOpened = true
	food.ExpirationDate = &expiration

	if err := database.DB.Save(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food item"})
		return
	}

	c.JSON(http.StatusOK, food)
}

func CreateFood(c *gin.Context) {
	var food models.Food
	if err := c.ShouldBindJSON(&food); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify container exists
	var container models.Container
	if err := database.DB.First(&container, food.ContainerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Container not found"})
		return
	}

	if err := database.DB.Create(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create food item"})
		return
	}
	c.JSON(http.StatusCreated, food)
}

func ListFood(c *gin.Context) {
	var food []models.Food
	database.DB.Find(&food)
	c.JSON(http.StatusOK, food)
}

func GetFood(c *gin.Context) {
	id := c.Param("id")
	var food models.Food
	if err := database.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}
	c.JSON(http.StatusOK, food)
}

func UpdateFood(c *gin.Context) {
	id := c.Param("id")
	var food models.Food
	if err := database.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}

	var input models.Food
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If ContainerID is provided, verify it exists
	if input.ContainerID != 0 {
		var container models.Container
		if err := database.DB.First(&container, input.ContainerID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Container not found"})
			return
		}
	}

	if err := database.DB.Model(&food).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food item"})
		return
	}
	c.JSON(http.StatusOK, food)
}

func DeleteFood(c *gin.Context) {
	id := c.Param("id")
	var food models.Food
	if err := database.DB.First(&food, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}
	if err := database.DB.Delete(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Food deleted successfully"})
}
