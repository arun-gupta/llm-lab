#!/bin/bash

# Stop HTTP Filesystem MCP Server Script

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Stopping HTTP Filesystem MCP Server..."

if [ -f "http-filesystem-mcp-server.pid" ]; then
    PID=$(cat http-filesystem-mcp-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "HTTP Filesystem MCP Server stopped (PID: $PID)"
    else
        echo "HTTP Filesystem MCP Server process not running"
    fi
    rm -f http-filesystem-mcp-server.pid
else
    echo "PID file not found"
fi
