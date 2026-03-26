#!/bin/bash

# Exit on error
set -e

echo "--- Starting local deployment  ---"

# 1. Build Backend
echo "Building Backend..."
cd backend
export CGO_ENABLED=0
go build -trimpath -ldflags="-s -w" -o server ./cmd/server/main.go
cd ..

# 2. Build Frontend
echo "Building Frontend..."
cd frontend
# Limit memory for Pi 3
export NODE_OPTIONS="--max-old-space-size=768"
npm install --prefer-offline --no-audit
npm run build
cd ..

# 3. Prepare Nginx configs
echo "Preparing Nginx configurations..."
ROOT_DIR=$(pwd)
mkdir -p logs

# Frontend Nginx Config (simulating the frontend service on port 3000)
cat > frontend_nginx.conf <<EOF
error_log $ROOT_DIR/logs/frontend_error.log;
pid $ROOT_DIR/logs/frontend_nginx.pid;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    access_log $ROOT_DIR/logs/frontend_access.log;
    server {
        listen 3000;
        location / {
            root $ROOT_DIR/frontend/out;
            index index.html index.htm;
            try_files \$uri \$uri.html \$uri/ /index.html;
        }
    }
}
EOF

# Main Proxy Nginx Config (simulating the nginx service on port 80)
cat > proxy_nginx.conf <<EOF
error_log $ROOT_DIR/logs/proxy_error.log;
pid $ROOT_DIR/logs/proxy_nginx.pid;
events { worker_connections 1024; }
http {
    access_log $ROOT_DIR/logs/proxy_access.log;
    server {
        listen 80;
        
        # Frontend
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }

        # Backend API
        location /api {
            proxy_pass http://localhost:8080/api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# 4. Run services
echo "Stopping any existing processes..."
pkill -f "./backend/server" || true
[ -f $ROOT_DIR/logs/frontend_nginx.pid ] && sudo nginx -s stop -c $ROOT_DIR/frontend_nginx.conf 2>/dev/null || true
[ -f $ROOT_DIR/logs/proxy_nginx.pid ] && sudo nginx -s stop -c $ROOT_DIR/proxy_nginx.conf 2>/dev/null || true
sleep 1

echo "Starting Backend..."
cd backend
nohup ./server > server.log 2>&1 &
echo \$! > ../backend.pid
cd ..

echo "Starting Frontend Service (on 3000)..."
sudo nginx -c $ROOT_DIR/frontend_nginx.conf

echo "Starting Proxy Service (on 80)..."
sudo nginx -c $ROOT_DIR/proxy_nginx.conf

echo "--- Deployment Complete ---"
echo "Backend running (PID: \$(cat backend.pid))"
echo "Frontend and Proxy running via Nginx"
echo "Access the app at http://localhost"
