#!/bin/bash

# Script to kill processes running on ports needed by Postman Labs
set -e

echo "🔫 Killing processes on required ports..."

# Ports used by the application
PORTS=(
    3000  # Next.js
    3001  # MCP SQLite
    3002  # MCP Filesystem
    50051 # gRPC Server
    50052 # gRPC HTTP
    50053 # gRPC Web Proxy
    8529  # ArangoDB
)

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo "🔫 Killing process(es) on port $port: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo "✅ Killed process(es) on port $port"
    else
        echo "✅ Port $port is free"
    fi
}

# Kill processes on each port
for port in "${PORTS[@]}"; do
    kill_port $port
done

echo ""
echo "🎯 Port cleanup completed!"
echo ""
echo "📋 Ports checked:"
echo "   • 3000  - Next.js"
echo "   • 3001  - MCP SQLite"
echo "   • 3002  - MCP Filesystem"
echo "   • 50051 - gRPC Server"
echo "   • 50052 - gRPC HTTP"
echo "   • 50053 - gRPC Web Proxy"
echo "   • 8529  - ArangoDB"
echo ""
echo "🚀 You can now run ./quickstart.sh to start fresh"
