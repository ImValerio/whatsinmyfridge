package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/handlers"
	"github.com/imvalerio/whatsinmyfridge/internal/notifier"
	"time"
)

func main() {
	_, err := database.InitDB("fridge.db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Start notification ticker
	go func() {
		for {
			log.Println("Checking for expiring foods...")
			if err := notifier.SendExpirationNotifications(); err != nil {
				log.Printf("Error sending expiration notifications: %v", err)
			}
			time.Sleep(1 * time.Hour)
		}
	}()

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// API Route Group
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Container routes
		containerGroup := api.Group("/containers")
		{
			containerGroup.POST("", handlers.CreateContainer)
			containerGroup.GET("", handlers.ListContainers)
			containerGroup.GET("/:id", handlers.GetContainer)
			containerGroup.PUT("/:id", handlers.UpdateContainer)
			containerGroup.DELETE("/:id", handlers.DeleteContainer)
		}

		// Food routes
		foodGroup := api.Group("/food")
		{
			foodGroup.POST("", handlers.CreateFood)
			foodGroup.GET("", handlers.ListFood)
			foodGroup.GET("/:id", handlers.GetFood)
			foodGroup.PUT("/:id", handlers.UpdateFood)
			foodGroup.DELETE("/:id", handlers.DeleteFood)
			foodGroup.POST("/:id/open", handlers.OpenFood)
			foodGroup.POST("/:id/frozen", handlers.ToggleFoodFrozen)
		}

		// Food Log routes
		foodLogGroup := api.Group("/food-logs")
		{
			foodLogGroup.GET("/autocomplete", handlers.AutocompleteFood)
			foodLogGroup.POST("", handlers.CreateFoodLog)
			foodLogGroup.GET("", handlers.ListFoodLogs)
			foodLogGroup.GET("/:id", handlers.GetFoodLog)
			foodLogGroup.PUT("/:id", handlers.UpdateFoodLog)
			foodLogGroup.DELETE("/:id", handlers.DeleteFoodLog)
		}

		// User routes
		userGroup := api.Group("/users")
		{
			userGroup.POST("", handlers.CreateUser)
			userGroup.GET("", handlers.ListUsers)
			userGroup.GET("/:id", handlers.GetUser)
			userGroup.PUT("/:id", handlers.UpdateUser)
			userGroup.DELETE("/:id", handlers.DeleteUser)
		}
	}

	log.Println("Server starting on :8080")
	r.Run(":8080")
}
