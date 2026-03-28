#!/bin/bash

# Exit on error
set -e

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

echo "--- What's In My Fridge - Setup ---"

# 1. Ask for hostname
read -p "Enter the hostname for your machine (e.g. fridge-pi): " NEW_HOSTNAME
if [ -n "$NEW_HOSTNAME" ]; then
    echo "Setting hostname to $NEW_HOSTNAME..."
    hostnamectl set-hostname "$NEW_HOSTNAME"
    sed -i "s/127.0.1.1.*/127.0.1.1\t$NEW_HOSTNAME/g" /etc/hosts
fi

# 2. Install and configure Avahi
echo "Installing and configuring Avahi (mDNS)..."
apt-get update
apt-get install -y avahi-daemon
systemctl enable avahi-daemon
systemctl start avahi-daemon

# 3. Configure Resend API Key (Optional)
echo ""
echo "Configure Resend for email notifications (Optional)"
read -p "Enter your RESEND_API_KEY (leave blank to skip): " USER_RESEND_KEY
if [ -n "$USER_RESEND_KEY" ]; then
    echo "RESEND_API_KEY=$USER_RESEND_KEY" > .env
    echo "API Key saved to .env"
else
    echo "Skipping Resend configuration."
    # Ensure .env exists to avoid docker-compose warnings
    touch .env
fi

# 4. Choose docker-compose file
echo ""
echo "Which Docker images would you like to use?"
echo "1) Prebuilt images (imvalerio/whatsinmyfridge-*)"
echo "2) Build locally (using source code)"
read -p "Select option (1 or 2): " IMAGE_CHOICE

COMPOSE_FILE="docker-compose.yml"
if [ "$IMAGE_CHOICE" == "1" ]; then
    COMPOSE_FILE="docker-compose.pi.yml"
fi
echo "Using $COMPOSE_FILE"

# 5. Configure startup
SERVICE_FILE="/etc/systemd/system/whatsinmyfridge.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "Creating systemd service for startup..."
    PROJECT_DIR=$(pwd)
    cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=What's In My Fridge Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker compose -f $COMPOSE_FILE up -d
ExecStop=/usr/bin/docker compose -f $COMPOSE_FILE down

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable whatsinmyfridge.service
    echo "Startup service enabled."
else
    echo "Startup service already exists."
fi

# 6. Run docker compose
echo "Starting application..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "--- Setup Complete! ---"
echo "Your app is starting. You can access it at http://$NEW_HOSTNAME.local"
