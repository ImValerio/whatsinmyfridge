package models

import (
	"time"
)

// Container model
type Container struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Foods     []Food    `json:"foods"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Food model
type Food struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	Name                  string     `json:"name" binding:"required"`
	Quantity              int        `json:"quantity"`
	ExpirationDate        *time.Time `json:"expiration_date"`
	IsOpened              bool       `json:"is_opened"`
	ContainerID           uint       `json:"container_id" binding:"required"`
	ExpirationCommunicated bool       `json:"expiration_communicated" gorm:"default:false"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

// User model
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name" binding:"required"`
	Email     string    `json:"email" binding:"required,email" gorm:"unique"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
