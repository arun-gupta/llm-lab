#!/bin/bash

# Setup MCP Servers for Postman Labs
# This script sets up the MCP server infrastructure locally

set -e

echo "🚀 Setting up MCP Servers for Postman Labs..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the postman-labs directory"
    exit 1
fi

# Create mcp-servers directory if it doesn't exist
if [ ! -d "mcp-servers" ]; then
    echo "📁 Creating mcp-servers directory..."
    mkdir -p mcp-servers
fi

# Run the setup scripts
echo "🔧 Setting up MCP server infrastructure..."

# Set up HTTP filesystem MCP server
if [ -f "scripts/setup-http-filesystem-mcp.sh" ]; then
    echo "📡 Setting up HTTP filesystem MCP server..."
    bash scripts/setup-http-filesystem-mcp.sh
fi

# Set up official filesystem MCP server
if [ -f "scripts/setup-official-filesystem-mcp.sh" ]; then
    echo "📡 Setting up official filesystem MCP server..."
    bash scripts/setup-official-filesystem-mcp.sh
fi

echo "✅ MCP Servers setup complete!"
echo ""
echo "📋 Available MCP Servers:"
echo "  • HTTP Filesystem MCP: http://localhost:3002"
echo "  • GitHub MCP: https://api.githubcopilot.com/mcp/ (remote)"
echo "  • SQLite MCP: Docker container (port 3001)"
echo ""
echo "🚀 To start all services:"
echo "  ./quickstart.sh"
echo ""
echo "🛑 To stop all services:"
echo "  ./quickstop.sh"
echo ""
echo "📊 To check status:"
echo "  ./quickstatus.sh"
