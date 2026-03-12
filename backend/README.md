# What's in my fridge? - Backend

A simple Go backend to monitor food in your fridge, organized by containers.

## Features
- CRUD operations for **Containers** (e.g., Fridge, Pantry, Freezer).
- CRUD operations for **Food** items linked to containers.
- Automatic database migration using GORM and SQLite.
- Clean, production-ready project structure.
- Dockerized for easy deployment.

## Tech Stack
- **Go** (1.25)
- **Gin** (Web Framework)
- **GORM** (ORM)
- **SQLite** (Pure Go driver, no CGO required)

## Project Structure
```text
.
├── cmd/
│   └── server/          # Entry point of the application
├── internal/
│   ├── database/        # Database initialization and migration
│   ├── handlers/        # HTTP handlers for API endpoints
│   └── models/          # GORM models (Container, Food)
├── Dockerfile           # Multi-stage Docker build
├── go.mod               # Go modules file
├── main_test.go         # Integration tests
└── README.md            # Project documentation
```

## API Endpoints

### Containers
- `POST /containers`: Create a new container.
- `GET /containers`: List all containers (preloads food).
- `GET /containers/:id`: Get a specific container.
- `PUT /containers/:id`: Update a container.
- `DELETE /containers/:id`: Delete a container.

### Food
- `POST /food`: Add food to a container.
- `GET /food`: List all food items.
- `GET /food/:id`: Get a specific food item.
- `PUT /food/:id`: Update a food item.
- `DELETE /food/:id`: Remove a food item.
- `POST /food/:id/open`: Open a food item (sets expiration to +2 days).

## Getting Started

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
