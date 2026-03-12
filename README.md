# What's in My Fridge?

A simple application to track and manage the food in your fridge, organized by containers (like fridge, freezer, pantry).

## Project Structure

This project is a monorepo containing:

-   **Backend**: A Go-based REST API built with the Gin framework and utilizing SQLite for persistent storage.
-   **Frontend**: A modern web interface built using Next.js, React, and Tailwind CSS.
-   **Docker**: Fully containerized environment using Docker and Docker Compose.

## Prerequisites

-   [Docker](https://www.docker.com/get-started) installed on your machine.
-   [Docker Compose](https://docs.docker.com/compose/install/) (usually bundled with Docker Desktop).

## Getting Started

To launch the entire application, simply run the following command from the project root:

```bash
docker-compose up --build
```

This will:
1. Build the backend and frontend Docker images.
2. Start the backend service on `http://localhost:8080`.
3. Start the frontend service on `http://localhost:3000`.

## Services

### Backend (Go)
- **Port**: `8080`
- **Health Check**: `http://localhost:8080/api/health`
- **Base API URL**: `http://localhost:8080/api`
- **Storage**: Uses a persistent SQLite database stored in a Docker volume (`backend_data`).

### Frontend (Next.js)
- **Port**: `3000`
- **Technology**: React, TypeScript, Next.js, Tailwind CSS.
- **Environment**: Configured to connect to the backend at `http://localhost:8080/api/food`.

## Troubleshooting

- **CORS Issues**: Ensure the backend allows requests from the frontend origin (`http://localhost:3000`).
- **Data Persistence**: Data is saved in the `backend_data` volume. To reset, run `docker-compose down -v`.
