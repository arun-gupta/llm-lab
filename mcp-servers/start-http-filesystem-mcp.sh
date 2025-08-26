#!/bin/bash

# Start HTTP Filesystem MCP Server Script
# This script starts the HTTP wrapper around the official filesystem MCP server

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting HTTP Filesystem MCP Server..."

# Load configuration
if [ -f "filesystem-mcp-config.env" ]; then
    source filesystem-mcp-config.env
    echo "Loaded configuration from filesystem-mcp-config.env"
    echo "Allowed directories: $ALLOWED_DIRECTORIES"
else
    echo "Configuration file not found, using defaults"
    ALLOWED_DIRECTORIES="/tmp $HOME/Desktop"
fi

# Start the HTTP filesystem MCP server
echo "Starting HTTP filesystem MCP server on port $DEFAULT_PORT..."
cd http-filesystem-mcp-server
nohup node index.js > ../http-filesystem-mcp-server.log 2>&1 &
HTTP_FILESYSTEM_MCP_PID=$!
echo $HTTP_FILESYSTEM_MCP_PID > ../http-filesystem-mcp-server.pid
cd ..

echo "HTTP Filesystem MCP Server started!"
echo "Server URL: http://localhost:$DEFAULT_PORT"
echo "Health check: http://localhost:$DEFAULT_PORT/health"
echo "Configuration: http://localhost:$DEFAULT_PORT/config"
echo "Tools endpoint: http://localhost:$DEFAULT_PORT/tools"
echo "MCP endpoint: http://localhost:$DEFAULT_PORT/mcp"
echo ""
echo "Logs are available in $MCP_DIR/http-filesystem-mcp-server.log"
echo "PID is stored in $MCP_DIR/http-filesystem-mcp-server.pid"
echo ""
echo "To change allowed directories:"
echo "1. Edit $MCP_DIR/filesystem-mcp-config.env"
echo "2. Restart the server: ./stop-http-filesystem-mcp.sh && ./start-http-filesystem-mcp.sh"
