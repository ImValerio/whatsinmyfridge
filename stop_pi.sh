#!/bin/bash

ROOT_DIR=$(pwd)

echo "Stopping services..."

# Stop backend
if [ -f backend.pid ]; then
    PID=$(cat backend.pid)
    kill $PID 2>/dev/null && echo "Stopped backend (PID: $PID)"
    rm backend.pid
else
    pkill -f "./backend/server" && echo "Stopped backend using pkill"
fi

# Stop Nginx instances
[ -f $ROOT_DIR/logs/frontend_nginx.pid ] && sudo nginx -s stop -c $ROOT_DIR/frontend_nginx.conf 2>/dev/null && echo "Stopped frontend nginx"
[ -f $ROOT_DIR/logs/proxy_nginx.pid ] && sudo nginx -s stop -c $ROOT_DIR/proxy_nginx.conf 2>/dev/null && echo "Stopped proxy nginx"

echo "Cleanup complete."
