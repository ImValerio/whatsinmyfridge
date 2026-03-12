package notifier

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/imvalerio/whatsinmyfridge/internal/database"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
	"github.com/resend/resend-go/v3"
)

func SendExpirationNotifications() error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	client := resend.NewClient(apiKey)

	// Get today's range
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)

	var expiringFoods []models.Food
	err := database.DB.Where("expiration_date >= ? AND expiration_date < ? AND expiration_communicated = ?", todayStart, todayEnd, false).Find(&expiringFoods).Error
	if err != nil {
		return fmt.Errorf("failed to query expiring foods: %v", err)
	}

	if len(expiringFoods) == 0 {
		return nil
	}

	var users []models.User
	err = database.DB.Find(&users).Error
	if err != nil {
		return fmt.Errorf("failed to query users: %v", err)
	}

	if len(users) == 0 {
		log.Println("No users to notify")
		return nil
	}

	// Prepare email content
	var foodList strings.Builder
	foodList.WriteString("<ul>")
	for _, food := range expiringFoods {
		foodList.WriteString(fmt.Sprintf("<li>%s (Quantity: %d)</li>", food.Name, food.Quantity))
	}
	foodList.WriteString("</ul>")

	htmlContent := fmt.Sprintf("<p>The following items are expiring today:</p>%s", foodList.String())

	userEmails := make([]string, len(users))
	for i, user := range users {
		userEmails[i] = user.Email
	}

	params := &resend.SendEmailRequest{
		From:    "onboarding@resend.dev",
		To:      userEmails,
		Subject: "Food Expiration Alert - Today",
		Html:    htmlContent,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	log.Printf("Expiration email sent: %s to %d users", sent.Id, len(users))

	// Mark as communicated
	foodIDs := make([]uint, len(expiringFoods))
	for i, food := range expiringFoods {
		foodIDs[i] = food.ID
	}
	err = database.DB.Model(&models.Food{}).Where("id IN ?", foodIDs).Update("expiration_communicated", true).Error
	if err != nil {
		return fmt.Errorf("failed to update food communication status: %v", err)
	}

	return nil
}
