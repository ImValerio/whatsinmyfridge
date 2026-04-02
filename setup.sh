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

# 3. Configure Resend and Email (Optional)
echo ""
echo "Configure Email Notifications via Resend (Optional)"
read -p "Enter your RESEND_API_KEY (leave blank to skip): " USER_RESEND_KEY
if [ -n "$USER_RESEND_KEY" ]; then
    echo "RESEND_API_KEY=$USER_RESEND_KEY" > .env
    read -p "Enter the sender email address (e.g. fridge@yourdomain.com): " USER_EMAIL_FROM
    if [ -n "$USER_EMAIL_FROM" ]; then
        echo "EMAIL_ADDRESS_FROM=$USER_EMAIL_FROM" >> .env
        echo "Configuration saved to .env"
    else
        echo "Sender email not provided. Resend configuration might be incomplete."
    fi
else
    echo "Skipping Resend configuration."
    # Ensure .env exists to avoid docker-compose warnings
    touch .env
fi

# 4. Choose docker-compose file and cleanup
echo ""
echo "Which Docker images would you like to use?"
echo "1) Prebuilt images (imvalerio/whatsinmyfridge-*)"
echo "2) Build locally (using source code)"
read -p "Select option (1 or 2): " IMAGE_CHOICE

if [ "$IMAGE_CHOICE" == "1" ]; then
    echo "Using prebuilt images. Cleaning up..."
    mv docker-compose.pi.yml docker-compose.yml
    rm -f docker-compose.yml
    mv docker-compose.pi.yml docker-compose.yml
else
    echo "Using local builds. Cleaning up..."
    rm -f docker-compose.pi.yml
fi

COMPOSE_FILE="docker-compose.yml"
echo "Selected docker-compose.yml configured."

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
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable whatsinmyfridge.service
    echo "Startup service enabled."
else
    # Update WorkingDirectory if it changed
    sed -i "s|WorkingDirectory=.*|WorkingDirectory=$(pwd)|" "$SERVICE_FILE"
    systemctl daemon-reload
    echo "Startup service already exists (updated WorkingDirectory)."
fi

# 6. Run docker compose
echo "Starting application..."
docker compose up -d

echo ""
echo "--- Setup Complete! ---"
echo "Your app is starting. You can access it at http://$NEW_HOSTNAME.local"
