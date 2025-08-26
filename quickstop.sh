#!/bin/bash

# Postman Protocol Playground QuickStop Script
# This script stops all services started by quickstart.sh

set -e  # Exit on any error

echo "🛑 Stopping Postman Protocol Playground services..."
echo ""

# Kill any processes on required ports for thorough cleanup
echo "🔫 Ensuring all ports are free..."
if [ -f "scripts/kill-ports.sh" ]; then
    bash scripts/kill-ports.sh
fi
echo ""

# Stop ArangoDB
echo "🗄️ Stopping ArangoDB..."
docker-compose -f docker-compose.arangodb.yml down 2>/dev/null || true
echo "✅ ArangoDB stopped"

echo ""

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

# Stop gRPC servers
stop_server "gRPC Server" "grpc-server"
stop_server "gRPC-Web Proxy" "grpc-web-proxy"

# Stop MCP servers
if [ -f "mcp-servers/stop-mcp-servers.sh" ]; then
    echo "Stopping MCP servers..."
    bash "mcp-servers/stop-mcp-servers.sh" > /dev/null 2>&1
    echo "✅ MCP servers stopped"
fi

# Stop SQLite MCP Docker container
if command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
        echo "Stopping SQLite MCP Docker container..."
        docker stop sqlite-mcp-server > /dev/null 2>&1
        echo "✅ SQLite MCP Docker container stopped"
    fi
fi

# Stop Next.js development server (if running)
if [ -f "logs/nextjs.pid" ]; then
    stop_server "Next.js" "nextjs"
else
    # Try to find and stop Next.js process
    NEXTJS_PID=$(pgrep -f "next dev" || true)
    if [ ! -z "$NEXTJS_PID" ]; then
        echo "Stopping Next.js development server (PID: $NEXTJS_PID)..."
        kill $NEXTJS_PID
        echo "✅ Next.js development server stopped"
    fi
fi

echo ""
echo "✅ All Postman Protocol Playground services stopped"
echo "📝 Logs are preserved in the logs/ directory"
echo ""
echo "To restart all services, run: ./quickstart.sh"
