# What's in My Fridge?

A simple application to track and manage the food in your fridge, organized by containers (like fridge, freezer, pantry).

## Project Structure

This project is a monorepo containing:

- **Backend**: A Go-based REST API built with the Gin framework and utilizing SQLite for persistent storage.
- **Frontend**: A modern web interface built using Next.js, React, and Tailwind CSS.
- **Docker**: Fully containerized environment using Docker and Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually bundled with Docker Desktop).

## Getting Started

### 1. Standard (Local Build)

To build and launch the entire application from source:

```bash
docker compose up --build
```

### 2. Raspberry Pi / Linux (Easy Setup)

If you are running on a Raspberry Pi or a Linux server, you can use the automated setup script. This script handles:

- Setting a custom hostname (e.g., `myfridge.local`).
- Installing and configuring Avahi (mDNS) for easy network access.
- **Configuring Resend API Key for email notifications (Optional).**
- Configuring the app to start automatically on boot.
- Choosing between **prebuilt images** (faster) or **local builds** (from source).

```bash
chmod +x setup.sh
sudo ./setup.sh
```

**Prebuilt Images available on Docker Hub:**

- `imvalerio/whatsinmyfridge-be` (Backend)
- `imvalerio/whatsinmyfridge-fe` (Frontend)

## Services

### Main Application (Nginx)

- **Port**: `80` (Standard HTTP)
- **URL**: `http://localhost` or `http://<your-hostname>.local`
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

## Resource Optimization (Raspberry Pi)

If you are running this on a low-resource device like a **Raspberry Pi 3 (1GB RAM)**, the build process might be slow or fail. We have optimized the configuration, but you should also follow these steps:

1.  **Enable Swap Space**: Increase your swap to at least 2GB to prevent "Out of Memory" errors during the Next.js build:
    ```bash
    sudo dphys-swapfile swapoff
    sudo nano /etc/dphys-swapfile # Set CONF_SWAPSIZE=2048
    sudo dphys-swapfile setup
    sudo dphys-swapfile swapon
    ```
2.  **Use BuildKit**: Enable the modern Docker build engine for better performance:
    ```bash
    export DOCKER_BUILDKIT=1
    docker-compose up --build
    ```
3.  **Optimization Features Included**:
    - **Static Export**: Next.js is compiled to static JS, HTML, and CSS files during build, eliminating Node.js runtime overhead.
    - **Lightweight Server**: The frontend is served using a minimal Nginx container on port 3000, significantly reducing RAM usage compared to a full Node.js server.
    - **Multi-stage builds**: Reduces the final image size.
    - **Disabled ESLint/TypeScript during build**: Saves significant RAM (ensure you lint/type-check on your dev machine).
    - **Memory Limits**: Next.js is configured to limit its heap size during build.
    - **.dockerignore**: Prevents large local folders (like `node_modules`) from being sent to the Pi's Docker daemon.

## Troubleshooting

- **CORS Issues**: The backend is configured to allow all origins (`*`) by default for easy local network access.
- **mDNS/Bonjour**: On Windows, ensure "Network Discovery" is on. iOS/macOS support `.local` addresses natively.
- **Data Persistence**: Data is saved in the `backend_data` volume. To reset, run `docker-compose down -v`.
