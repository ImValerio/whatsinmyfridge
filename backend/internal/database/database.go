package database

import (
	"github.com/glebarez/sqlite"
	"github.com/imvalerio/whatsinmyfridge/internal/models"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto Migrate the models
	err = db.AutoMigrate(&models.Container{}, &models.Food{}, &models.User{})
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}

func CloseDB() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
