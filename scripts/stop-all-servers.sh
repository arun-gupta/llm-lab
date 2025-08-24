#!/bin/bash

# Stop all servers for real protocol implementations
echo "🛑 Stopping all servers..."

# Function to stop server by PID file
stop_server() {
    local name=$1
    local pid_file="logs/$2.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
            echo "✅ $name stopped"
        else
            echo "⚠️  $name process not found, removing stale PID file"
            rm "$pid_file"
        fi
    else
        echo "⚠️  No PID file found for $name"
    fi
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop all servers
stop_server "gRPC Server" "grpc-server"
stop_server "gRPC-Web Proxy" "grpc-web-proxy"
stop_server "WebSocket Server" "websocket-server"

echo ""
echo "✅ All servers stopped"
echo "📝 Logs are preserved in the logs/ directory"
