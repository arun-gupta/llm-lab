#!/bin/bash

# Start MCP Servers Script
# This script starts MCP servers for LLM Lab

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting MCP Server Infrastructure..."

# Start the HTTP Filesystem MCP server on port 3002
echo "Starting HTTP Filesystem MCP Server on port 3002..."
cd http-filesystem-mcp-server
PORT=3002 nohup node index.js > ../http-filesystem-mcp-server.log 2>&1 &
FILESYSTEM_PID=$!
echo $FILESYSTEM_PID > ../http-filesystem-mcp-server.pid
cd ..

echo "MCP server infrastructure started!"
echo "HTTP Filesystem MCP Server: http://localhost:3002"
echo ""
echo "Available Remote MCP Servers:"
echo "  • GitHub MCP Server: https://api.githubcopilot.com/mcp/"
echo "  • GitHub Repositories: https://api.githubcopilot.com/mcp/x/repos"
echo "  • GitHub Issues: https://api.githubcopilot.com/mcp/x/issues"
echo "  • GitHub Pull Requests: https://api.githubcopilot.com/mcp/x/pull_requests"
echo "  • GitHub Actions: https://api.githubcopilot.com/mcp/x/actions"
echo ""
echo "SQLite MCP Server: Docker container (managed separately)"
echo "Logs are available in $MCP_DIR/http-filesystem-mcp-server.log"
echo "PID is stored in $MCP_DIR/http-filesystem-mcp-server.pid"
