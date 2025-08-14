#!/bin/bash

# MCP Setup Wrapper for LLM Lab
# This script runs the MCP server setup from the main project directory

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up MCP servers for LLM Lab...${NC}"

# Check if the setup script exists
if [ ! -f "scripts/setup-mcp-servers.sh" ]; then
    echo "❌ MCP setup script not found. Please ensure you're in the LLM Lab project directory."
    exit 1
fi

# Run the MCP setup script
echo -e "${GREEN}Running MCP server setup...${NC}"
bash scripts/setup-mcp-servers.sh

echo -e "\n${GREEN}✅ MCP setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd ~/.mcp-servers"
echo "2. ./start-mcp-servers.sh"
echo "3. ./status-mcp-servers.sh"
echo "4. Import the MCP collection in Postman"
echo ""
echo "For more information, see ~/.mcp-servers/README.md"
