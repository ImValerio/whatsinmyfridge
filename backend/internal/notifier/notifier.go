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
	"gorm.io/gorm"
)

func SendExpirationNotifications() error {
	now := time.Now()

	// 1. Only notify at or after 8:00 AM
	if now.Hour() < 8 {
		return nil
	}

	todayStr := now.Format("2006-01-02")

	// 2. Check if already successfully notified today
	var notificationLog models.NotificationLog
	err := database.DB.Where("sent_date = ?", todayStr).First(&notificationLog).Error
	if err == nil {
		// Already sent today
		return nil
	}
	if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check notification log: %v", err)
	}

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not set")
	}

	client := resend.NewClient(apiKey)

	// Get ranges
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	tomorrowStart := todayStart.Add(24 * time.Hour)
	tomorrowEnd := tomorrowStart.Add(24 * time.Hour)

	// We look for everything expiring today or tomorrow.
	// We specifically want items expiring today that haven't been communicated yet.
	// But we also include tomorrow's items for the summary.
	// We exclude frozen foods.
	var expiringFoods []models.Food
	err = database.DB.Where("expiration_date >= ? AND expiration_date < ? AND is_frozen = ?", todayStart, tomorrowEnd, false).Find(&expiringFoods).Error
	if err != nil {
		return fmt.Errorf("failed to query expiring foods: %v", err)
	}

	// Filter to check if we actually have something new to report for TODAY
	// or if we just want to send the daily summary regardless if there are any items.
	// If the fridge is empty or nothing expires, we might skip the email.
	if len(expiringFoods) == 0 {
		log.Printf("No items expiring today or tomorrow. Skipping email for %s", todayStr)
		// We still mark it as "processed" for today so we don't keep checking every hour
		return logNotificationSuccess(todayStr)
	}

	var expiringToday []models.Food
	var expiringTomorrow []models.Food

	for _, food := range expiringFoods {
		if food.ExpirationDate.Before(tomorrowStart) {
			expiringToday = append(expiringToday, food)
		} else {
			expiringTomorrow = append(expiringTomorrow, food)
		}
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
	var htmlContent strings.Builder
	htmlContent.WriteString(fmt.Sprintf("<h2>Food Expiration Report - %s</h2>", todayStr))

	if len(expiringToday) > 0 {
		htmlContent.WriteString("<h3>Expiring Today:</h3><ul>")
		for _, food := range expiringToday {
			status := ""
			if food.ExpirationCommunicated {
				status = " (already notified)"
			}
			htmlContent.WriteString(fmt.Sprintf("<li>%s (Quantity: %d)%s</li>", food.Name, food.Quantity, status))
		}
		htmlContent.WriteString("</ul>")
	}

	if len(expiringTomorrow) > 0 {
		htmlContent.WriteString("<h3>Expiring Tomorrow:</h3><ul>")
		for _, food := range expiringTomorrow {
			htmlContent.WriteString(fmt.Sprintf("<li>%s (Quantity: %d)</li>", food.Name, food.Quantity))
		}
		htmlContent.WriteString("</ul>")
	}

	userEmails := make([]string, len(users))
	for i, user := range users {
		userEmails[i] = user.Email
	}

	emailFrom := os.Getenv("EMAIL_ADDRESS_FROM")
	if emailFrom == "" {
		return fmt.Errorf("EMAIL_ADDRESS_FROM not set")
	}

	params := &resend.SendEmailRequest{
		From:    emailFrom,
		To:      userEmails,
		Subject: fmt.Sprintf("Daily Food Expiration Alert - %s", todayStr),
		Html:    htmlContent.String(),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	log.Printf("Daily expiration email sent: %s to %d users", sent.Id, len(users))

	// Mark as communicated only those expiring TODAY
	if len(expiringToday) > 0 {
		todayIDs := make([]uint, len(expiringToday))
		for i, food := range expiringToday {
			todayIDs[i] = food.ID
		}
		err = database.DB.Model(&models.Food{}).Where("id IN ?", todayIDs).Update("expiration_communicated", true).Error
		if err != nil {
			log.Printf("Warning: failed to update food communication status: %v", err)
		}
	}

	return logNotificationSuccess(todayStr)
}

func logNotificationSuccess(date string) error {
	logEntry := models.NotificationLog{
		SentDate: date,
		SentAt:   time.Now(),
	}
	return database.DB.Create(&logEntry).Error
}
