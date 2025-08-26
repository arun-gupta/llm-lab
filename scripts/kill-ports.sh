#!/bin/bash

# Script to kill processes running on ports needed by Postman Labs
set -e

echo "🔫 Killing processes on required ports..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    DOCKER_AVAILABLE=true
    echo "🐳 Docker is available"
else
    DOCKER_AVAILABLE=false
    echo "⚠️  Docker not found - will skip Docker-related operations"
fi

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
        # Special handling for port 8529 (ArangoDB) - use Docker commands instead of kill
        if [ "$port" = "8529" ] && [ "$DOCKER_AVAILABLE" = true ]; then
            echo "🐳 Stopping ArangoDB container on port $port..."
            docker-compose -f docker-compose.arangodb.yml down 2>/dev/null || true
            echo "✅ ArangoDB container stopped"
        elif [ "$port" = "8529" ] && [ "$DOCKER_AVAILABLE" = false ]; then
            echo "⚠️  Skipping ArangoDB cleanup (Docker not available)"
        else
            # Check if any of the PIDs are system processes we shouldn't kill
            local safe_to_kill=true
            for pid in $pids; do
                # Get process name
                local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "")
                # Skip system processes
                if [[ "$process_name" == "com.docker.backend" ]] || [[ "$process_name" == "Docker" ]] || [[ "$process_name" == "docker" ]] || [[ "$process_name" == "com.docke" ]] || [[ "$process_name" =~ ^com\.docker ]]; then
                    echo "⚠️  Skipping system process $process_name (PID: $pid) on port $port"
                    safe_to_kill=false
                fi
            done
            
            if [ "$safe_to_kill" = true ]; then
                echo "🔫 Killing process(es) on port $port: $pids"
                echo "$pids" | xargs kill -9 2>/dev/null || true
                echo "✅ Killed process(es) on port $port"
            else
                echo "⚠️  Skipping port $port due to system processes"
            fi
        fi
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
