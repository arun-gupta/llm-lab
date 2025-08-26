#!/bin/bash

# Postman Protocol Playground QuickStatus Script
# This script shows the status of all services

set -e

echo "📊 Postman Protocol Playground Service Status"
echo "============================================="
echo ""

# Load port configuration
CONFIG_FILE="config/ports.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
    NEXTJS_PORT=$(jq -r '.development.nextjs' "$CONFIG_FILE")
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
    GRPC_WEB_PROXY_PORT=$(jq -r '.development.grpc.web_proxy' "$CONFIG_FILE")
    MCP_SQLITE_PORT=$(jq -r '.development.mcp.sqlite' "$CONFIG_FILE")
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
else
    NEXTJS_PORT=3000
    GRPC_SERVER_PORT=50051
    GRPC_HTTP_PORT=50052
    GRPC_WEB_PROXY_PORT=50053
    MCP_SQLITE_PORT=3001
    MCP_FILESYSTEM_PORT=3002
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check Next.js
if check_port $NEXTJS_PORT; then
    echo "✅ Next.js App: Running on port $NEXTJS_PORT"
else
    echo "❌ Next.js App: Not running on port $NEXTJS_PORT"
fi

# Check gRPC Server
if check_port $GRPC_SERVER_PORT; then
    echo "✅ gRPC Server: Running on port $GRPC_SERVER_PORT"
else
    echo "❌ gRPC Server: Not running on port $GRPC_SERVER_PORT"
fi

# Check gRPC-Web Proxy
if check_port $GRPC_WEB_PROXY_PORT; then
    echo "✅ gRPC-Web Proxy: Running on port $GRPC_WEB_PROXY_PORT"
else
    echo "❌ gRPC-Web Proxy: Not running on port $GRPC_WEB_PROXY_PORT"
fi

# Check MCP Filesystem
if check_port $MCP_FILESYSTEM_PORT; then
    echo "✅ MCP Filesystem: Running on port $MCP_FILESYSTEM_PORT"
else
    echo "❌ MCP Filesystem: Not running on port $MCP_FILESYSTEM_PORT"
fi

# Check MCP SQLite (Docker)
if command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
        echo "✅ MCP SQLite: Running (Docker container)"
    else
        echo "❌ MCP SQLite: Not running (Docker container)"
    fi
else
    echo "⚠️  MCP SQLite: Docker not available"
fi

echo ""
echo "🔗 Quick Actions:"
echo "   • Start all: ./quickstart.sh"
echo "   • Stop all: ./quickstop.sh"
echo "   • Check status: ./quickstatus.sh"
echo ""
echo "💡 Tip: Press Ctrl+C in quickstart to stop all services cleanly"
