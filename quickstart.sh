#!/bin/bash

# LLM Prompt Lab QuickStart Script
# This script installs dependencies, sets up environment, and starts the development server

set -e  # Exit on any error

echo "🚀 Setting up LLM Prompt Lab..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install local MCP servers for enhanced Postman integration
echo "🔌 Setting up local MCP servers for enhanced Postman integration..."
if [ -f "scripts/setup-mcp-servers.sh" ]; then
    bash scripts/setup-mcp-servers.sh
    echo "✅ Local MCP servers installed successfully"
    echo "   • Local MCP Server Template: Port 3001"
    echo "   • File System MCP Server: Port 3002"
    echo "   • Web Search MCP Server: Port 3003"
    echo "   • Database MCP Server: Port 3004"
    echo "   💡 Remote GitHub MCP: https://api.githubcopilot.com/mcp/ (no installation needed)"
    echo "   💡 You can manage MCP servers from the Settings tab in the UI"
    echo ""
else
    echo "⚠️  MCP setup script not found, skipping MCP server installation"
    echo ""
fi

# Set up HTTP filesystem MCP server for Postman integration
echo "🌐 Setting up HTTP filesystem MCP server for Postman integration..."
if [ -f "scripts/setup-http-filesystem-mcp.sh" ]; then
    bash scripts/setup-http-filesystem-mcp.sh
    echo "✅ HTTP filesystem MCP server installed successfully"
    echo "   • HTTP Filesystem MCP Server: http://localhost:3002"
    echo "   • Health check: http://localhost:3002/health"
    echo "   • Tools endpoint: http://localhost:3002/tools"
    echo "   💡 Import the 'Official Filesystem MCP (HTTP)' collection in Postman"
    echo ""
else
    echo "⚠️  HTTP filesystem MCP setup script not found, skipping installation"
    echo ""
fi

# Set up environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.local.example .env.local
    echo "📝 Created .env.local from template"
    echo ""
    echo "🔑 IMPORTANT: You need to add your API keys to .env.local"
    echo "   Required: At least one working LLM provider API key"
    echo "   Working: OpenAI or Anthropic (Cohere & Mistral coming soon)"
    echo "   Optional: POSTMAN_API_KEY for advanced Postman integration"
    echo ""
    echo "📖 Get API keys from:"
    echo "   • OpenAI: https://platform.openai.com/ → API Keys"
    echo "   • Anthropic: https://console.anthropic.com/ → API Keys"
    echo "   • Postman: https://www.postman.com → Settings → API Keys"
    echo ""
    
    # Ask if user wants to edit the file now
    read -p "Would you like to edit .env.local now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Try to open with common editors
        if command -v code &> /dev/null; then
            echo "📝 Opening .env.local in VS Code..."
            code .env.local
        elif command -v nano &> /dev/null; then
            echo "📝 Opening .env.local in nano..."
            nano .env.local
        elif command -v vim &> /dev/null; then
            echo "📝 Opening .env.local in vim..."
            vim .env.local
        else
            echo "📝 Please edit .env.local with your preferred editor"
        fi
        echo ""
        echo "Press Enter when you've added your API keys..."
        read
    fi
else
    echo "✅ .env.local already exists"
fi

# Check if at least one API key is configured
if ! grep -q "^OPENAI_API_KEY=sk-" .env.local 2>/dev/null && ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  Warning: No API keys detected in .env.local"
    echo "   The app will start but you'll need API keys to test LLM providers"
    echo ""
fi

echo "🎯 Starting development server and MCP servers..."
echo "   The app will open automatically in your browser"
echo "   If it doesn't open, visit: http://localhost:3000"
echo "   MCP servers will be available for Postman integration"
echo ""

# Start local MCP servers in background
echo "🚀 Starting local MCP servers in background..."
if [ -f "$HOME/.mcp-servers/start-mcp-servers.sh" ]; then
    bash "$HOME/.mcp-servers/start-mcp-servers.sh" &
    MCP_PID=$!
    echo "✅ Local MCP servers started (PID: $MCP_PID)"
    echo "   • HTTP Filesystem MCP: http://localhost:3002"
    echo "   • Remote GitHub MCP: https://api.githubcopilot.com/mcp/ (no startup needed)"
    echo ""
else
    echo "⚠️  MCP servers startup script not found"
    echo ""
fi

# Function to open browser (works on macOS and Linux)
open_browser() {
    sleep 3  # Wait for server to start
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:3000
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:3000
    elif command -v wslview &> /dev/null; then
        # WSL
        wslview http://localhost:3000
    else
        echo "🌐 Please open http://localhost:3000 in your browser"
    fi
}

# Start the browser opener in background
open_browser &

# Start the development server
npm run dev