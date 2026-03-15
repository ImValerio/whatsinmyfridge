# What's in my fridge? - Backend

A simple Go backend to monitor food in your fridge, organized by containers.

## Features

- CRUD operations for **Containers** (e.g., Fridge, Pantry, Freezer).
- CRUD operations for **Food** items linked to containers.
- CRUD operations for **Users** to receive notifications.
- **Email Notifications**: Automatic alerts for foods expiring today, sent via Resend.
- Background ticker to check for expiring food every hour.
- Automatic database migration using GORM and SQLite.
- Clean, production-ready project structure.
- Dockerized for easy deployment.

## Tech Stack

- **Go** (1.25)
- **Gin** (Web Framework)
- **GORM** (ORM)
- **SQLite** (Pure Go driver, no CGO required)
- **Resend Go SDK** (Email provider)
- **godotenv** (Environment variable management)

## Project Structure

```text
.
├── cmd/
│   └── server/          # Entry point of the application
├── internal/
│   ├── database/        # Database initialization and migration
│   ├── handlers/        # HTTP handlers for API endpoints (Container, Food, User)
│   ├── models/          # GORM models (Container, Food, User)
│   └── notifier/        # Email notification logic
├── .env                 # Environment variables (ignored by git)
├── Dockerfile           # Multi-stage Docker build
├── go.mod               # Go modules file
├── main_test.go         # Integration tests
└── README.md            # Project documentation
```

## API Endpoints

### Containers

- `POST /api/containers`: Create a new container.
- `GET /api/containers`: List all containers (preloads food).
- `GET /api/containers/:id`: Get a specific container.
- `PUT /api/containers/:id`: Update a container.
- `DELETE /api/containers/:id`: Delete a container.

### Food

- `POST /api/food`: Add food to a container.
- `GET /api/food`: List all food items.
- `GET /api/food/:id`: Get a specific food item.
- `PUT /api/food/:id`: Update a food item.
- `DELETE /api/food/:id`: Remove a food item.
- `POST /food/:id/open?expirationDays=2`: Open a food item (sets expiration to +X days, defaults to 2).

### Users

- `POST /api/users`: Create a new user.
- `GET /api/users`: List all users.
- `GET /api/users/:id`: Get a specific user.
- `PUT /api/users/:id`: Update a user.
- `DELETE /api/users/:id`: Delete a user.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
RESEND_API_KEY=your_resend_api_key_here
EMAIL_ADDRESS_FROM=email_address_sender
```

### Prerequisites

- Go 1.25 or higher
- Docker (optional)

### Running Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Run the application:
   ```bash
   go run cmd/server/main.go
   ```
4. The server will start on `http://localhost:8080`.

### Running Tests

```bash
go test -v .
```

### Running with Docker

1. Build the image:
   ```bash
   docker build -t whatsinmyfridge .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 whatsinmyfridge
   ```

## License

MIT
