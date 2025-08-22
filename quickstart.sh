#!/bin/bash

# LLM Prompt Lab QuickStart Script
# This script installs dependencies, sets up environment, and starts the development server

set -e  # Exit on any error

# Load port configuration
CONFIG_FILE="config/ports.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
    NEXTJS_PORT=$(jq -r '.development.nextjs' "$CONFIG_FILE")
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
    MCP_SQLITE_PORT=$(jq -r '.development.mcp.sqlite' "$CONFIG_FILE")
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
else
    # Fallback to default ports
    NEXTJS_PORT=3000
    GRPC_SERVER_PORT=50051
    GRPC_HTTP_PORT=50052
    MCP_SQLITE_PORT=3001
    MCP_FILESYSTEM_PORT=3002
fi

# Set environment variables for configurable ports
export NEXTJS_PORT
export GRPC_PORT=$GRPC_SERVER_PORT
export HTTP_PORT=$GRPC_HTTP_PORT

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

# Set up GraphRAG data directories
echo "🕸️  Setting up GraphRAG data directories..."
mkdir -p data/graphs
mkdir -p sample-docs
echo "✅ GraphRAG directories created"
echo "   • data/graphs/ - Knowledge graph storage"
echo "   • sample-docs/ - Sample documents for testing"

# Create sample documents if they don't exist
if [ ! -f "sample-docs/ai-healthcare.txt" ] || [ ! -f "sample-docs/tech-companies.txt" ]; then
    echo "📄 Creating sample documents..."
    # Create minimal sample documents
    echo "AI in Healthcare sample content" > sample-docs/ai-healthcare.txt
    echo "Tech Companies sample content" > sample-docs/tech-companies.txt
    echo "✅ Sample documents created"
fi

echo ""

# Set up additional servers (MCP servers already set up by npm postinstall)
echo "🔌 Setting up additional servers..."
if [ -f "scripts/setup-http-filesystem-mcp.sh" ]; then
    bash scripts/setup-http-filesystem-mcp.sh > /dev/null 2>&1
fi

if [ -f "scripts/setup-grpc-server.sh" ]; then
    bash scripts/setup-grpc-server.sh > /dev/null 2>&1
fi

echo "✅ Server setup complete"

# Set up environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "📝 Please add your API keys to .env.local (OpenAI/Anthropic)"
else
    echo "✅ .env.local already exists"
fi

echo "🚀 Starting servers..."
echo "📋 Ports: Next.js:$NEXTJS_PORT | gRPC:$GRPC_SERVER_PORT | MCP:$MCP_FILESYSTEM_PORT"

# Start MCP servers in background
if [ -f "$HOME/.mcp-servers/start-mcp-servers.sh" ]; then
    bash "$HOME/.mcp-servers/start-mcp-servers.sh" > /dev/null 2>&1 &
    MCP_PID=$!
fi

# Start gRPC server in background
if [ -f "grpc-server/start-grpc-server.sh" ]; then
    bash grpc-server/start-grpc-server.sh > /dev/null 2>&1 &
    GRPC_PID=$!
fi

# Function to open browser (works on macOS and Linux)
open_browser() {
    sleep 3  # Wait for server to start
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:$NEXTJS_PORT
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:$NEXTJS_PORT
    elif command -v wslview &> /dev/null; then
        # WSL
        wslview http://localhost:$NEXTJS_PORT
    else
        echo "🌐 Please open http://localhost:$NEXTJS_PORT in your browser"
    fi
}

# Start the development server in background
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait for servers to start
sleep 5

# Test endpoints
echo "🧪 Testing endpoints..."
for i in {1..5}; do
    if curl -s http://localhost:$NEXTJS_PORT > /dev/null 2>&1; then
        echo "✅ Next.js ready"
        break
    elif [ $i -eq 5 ]; then
        echo "❌ Next.js not responding"
    else
        sleep 1
    fi
done

for i in {1..5}; do
    if curl -s http://localhost:$GRPC_HTTP_PORT/health > /dev/null 2>&1; then
        echo "✅ gRPC ready"
        break
    elif [ $i -eq 5 ]; then
        echo "❌ gRPC not responding"
    else
        sleep 1
    fi
done

echo ""
echo "🎉 LLM Prompt Lab is ready!"
echo "   • App: http://localhost:$NEXTJS_PORT"
echo "   • gRPC: http://localhost:$GRPC_HTTP_PORT/health"

# Start the browser opener in background
open_browser &

# Wait for the Next.js server
wait $NEXTJS_PID