package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
)

func CreateContainer(c *gin.Context) {
	var container models.Container
	if err := c.ShouldBindJSON(&container); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DB.Create(&container).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create container"})
		return
	}
	c.JSON(http.StatusCreated, container)
}

func ListContainers(c *gin.Context) {
	var containers []models.Container
	database.DB.Preload("Foods").Find(&containers)
	c.JSON(http.StatusOK, containers)
}

func GetContainer(c *gin.Context) {
	id := c.Param("id")
	var container models.Container
	if err := database.DB.Preload("Foods").First(&container, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Container not found"})
		return
	}
	c.JSON(http.StatusOK, container)
}

func UpdateContainer(c *gin.Context) {
	id := c.Param("id")
	var container models.Container
	if err := database.DB.First(&container, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Container not found"})
		return
	}

	var input models.Container
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&container).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update container"})
		return
	}
	c.JSON(http.StatusOK, container)
}

func DeleteContainer(c *gin.Context) {
	id := c.Param("id")
	var container models.Container
	if err := database.DB.First(&container, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Container not found"})
		return
	}
	if err := database.DB.Delete(&container).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete container"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Container deleted successfully"})
}
