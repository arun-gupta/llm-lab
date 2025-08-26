#!/bin/bash

# Stop MCP Servers Script
# This script stops MCP servers for LLM Lab

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Stopping MCP Server Infrastructure..."

# Stop the HTTP Filesystem MCP server
if [ -f "http-filesystem-mcp-server.pid" ]; then
    PID=$(cat http-filesystem-mcp-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped HTTP Filesystem MCP Server (PID: $PID)"
    else
        echo "HTTP Filesystem MCP Server was not running"
    fi
    rm -f http-filesystem-mcp-server.pid
fi

echo "MCP server infrastructure stopped!"
echo "Note: SQLite MCP Docker container must be stopped separately with: docker stop sqlite-mcp-server"

# Stop HTTP filesystem MCP server
if [ -f "http-filesystem-mcp-server.pid" ]; then
    echo "Stopping HTTP Filesystem MCP Server..."
    kill $(cat http-filesystem-mcp-server.pid) 2>/dev/null || true
    rm -f http-filesystem-mcp-server.pid
    echo "HTTP Filesystem MCP Server stopped"
else
    echo "HTTP Filesystem MCP Server PID file not found"
fi
