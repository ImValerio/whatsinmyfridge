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
2. Start the Nginx reverse proxy on `http://localhost` (Port 80).
3. Route traffic to the backend and frontend services internally.

## Services

### Main Application (Nginx)
- **Port**: `80` (Standard HTTP)
- **URL**: `http://localhost`
- **Role**: Unified entry point for both Frontend and Backend API.

### Backend (Go)
- **Port**: `8080` (Exposed for direct API access/debugging)
- **Health Check**: `http://localhost:8080/api/health`
- **Base API URL**: `http://localhost/api`
- **Storage**: Uses a persistent SQLite database stored in a Docker volume (`backend_data`).

### Frontend (Next.js)
- **Port**: Internal (Accessible via Nginx on port 80)
- **Technology**: React, TypeScript, Next.js, Tailwind CSS.
- **Environment**: Automatically detects the host's IP/hostname to connect to the backend.

## Local Network Access (Raspberry Pi / Linux)

To access your fridge from any device on your Wi-Fi (phone, tablet, laptop) using a URL instead of an IP address:

1.  **Set your Raspberry Pi's hostname** (e.g., `myfridge`):
    ```bash
    sudo hostnamectl set-hostname myfridge
    ```
2.  **Enable mDNS (Avahi)** to broadcast the `.local` address:
    ```bash
    sudo apt update && sudo apt install -y avahi-daemon
    sudo systemctl enable --now avahi-daemon
    ```
3. **Access the app** from your phone or laptop:
    *   **Main App**: `http://myfridge.local/` (No port needed!)
    *   **Direct API Access**: `http://myfridge.local:8080/api` (Still available for debugging)

## Troubleshooting


- **CORS Issues**: The backend is configured to allow all origins (`*`) by default for easy local network access.
- **mDNS/Bonjour**: On Windows, ensure "Network Discovery" is on. iOS/macOS support `.local` addresses natively.
- **Data Persistence**: Data is saved in the `backend_data` volume. To reset, run `docker-compose down -v`.
