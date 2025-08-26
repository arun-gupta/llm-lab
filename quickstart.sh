#!/bin/bash

# Postman Protocol Playground QuickStart Script
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

echo "🚀 Setting up Postman Protocol Playground..."
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
mkdir -p logs
echo "✅ GraphRAG directories created"
echo "   • data/graphs/ - Knowledge graph storage"
echo "   • sample-docs/ - Sample documents for testing"
echo "   • logs/ - Server logs"

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

# Start ArangoDB if not running
echo "🗄️ Checking ArangoDB..."
if ! curl -s http://localhost:8529/_api/version > /dev/null 2>&1; then
    echo "📦 Starting ArangoDB..."
    docker-compose -f docker-compose.arangodb.yml up -d
    echo "⏳ Waiting for ArangoDB to be ready..."
    sleep 10
else
    echo "✅ ArangoDB is already running"
fi

echo "🚀 Starting servers..."
echo "📋 Ports: Next.js:$NEXTJS_PORT | gRPC:$GRPC_SERVER_PORT | MCP:$MCP_FILESYSTEM_PORT | ArangoDB:8529"

# Start MCP servers in background
if [ -f "mcp-servers/start-mcp-servers.sh" ]; then
    bash "mcp-servers/start-mcp-servers.sh" > /dev/null 2>&1 &
    MCP_PID=$!
fi

# Start SQLite MCP Docker container
echo "🐳 Starting SQLite MCP Docker container..."
if command -v docker &> /dev/null; then
    # Check if container is already running
    if ! docker ps --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
        # Check if container exists but is stopped
        if docker ps -a --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
            docker start sqlite-mcp-server > /dev/null 2>&1
            echo "✅ SQLite MCP Docker container started"
        else
            # Create and start new container
            docker run -d -p $MCP_SQLITE_PORT:$MCP_SQLITE_PORT --name sqlite-mcp-server arungupta/sqlite-mcp-server > /dev/null 2>&1
            echo "✅ SQLite MCP Docker container created and started"
        fi
    else
        echo "✅ SQLite MCP Docker container already running"
    fi
else
    echo "⚠️  Docker not found - SQLite MCP server will not be available"
fi

# Start gRPC server in background
echo "📡 Starting gRPC server..."
if [ -d "grpc-server" ]; then
    cd grpc-server
    if ! lsof -Pi :$GRPC_SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        npm start > ../logs/grpc-server.log 2>&1 &
        GRPC_PID=$!
        echo $GRPC_PID > ../logs/grpc-server.pid
        echo "✅ gRPC server started (PID: $GRPC_PID)"
    else
        echo "✅ gRPC server already running on port $GRPC_SERVER_PORT"
    fi
    cd ..
else
    echo "❌ gRPC server directory not found"
fi

# Start gRPC-Web proxy in background
echo "🌐 Starting gRPC-Web proxy..."
if [ -f "grpc-web-proxy.js" ]; then
    if ! lsof -Pi :$GRPC_HTTP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        node grpc-web-proxy.js > logs/grpc-web-proxy.log 2>&1 &
        GRPC_WEB_PID=$!
        echo $GRPC_WEB_PID > logs/grpc-web-proxy.pid
        echo "✅ gRPC-Web proxy started (PID: $GRPC_WEB_PID)"
    else
        echo "✅ gRPC-Web proxy already running on port $GRPC_HTTP_PORT"
    fi
else
    echo "❌ gRPC-Web proxy not found"
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

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Received interrupt signal, cleaning up..."
    
    # Stop gRPC servers
    if [ ! -z "$GRPC_PID" ] && ps -p $GRPC_PID > /dev/null 2>&1; then
        echo "Stopping gRPC server (PID: $GRPC_PID)..."
        kill $GRPC_PID
    fi
    
    if [ ! -z "$GRPC_WEB_PID" ] && ps -p $GRPC_WEB_PID > /dev/null 2>&1; then
        echo "Stopping gRPC-Web proxy (PID: $GRPC_WEB_PID)..."
        kill $GRPC_WEB_PID
    fi
    
    # Stop MCP servers
    if [ -f "mcp-servers/stop-mcp-servers.sh" ]; then
        echo "Stopping MCP servers..."
        bash "mcp-servers/stop-mcp-servers.sh" > /dev/null 2>&1
    fi
    
    # Stop Docker container
    if command -v docker &> /dev/null; then
        if docker ps --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
            echo "Stopping SQLite MCP Docker container..."
            docker stop sqlite-mcp-server > /dev/null 2>&1
        fi
    fi
    
    # Stop Next.js
    if [ ! -z "$NEXTJS_PID" ] && ps -p $NEXTJS_PID > /dev/null 2>&1; then
        echo "Stopping Next.js development server (PID: $NEXTJS_PID)..."
        kill $NEXTJS_PID
    fi
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the development server in background
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait for servers to start
sleep 8

# Test endpoints
echo "🧪 Testing endpoints..."
for i in {1..8}; do
    if curl -s http://localhost:$NEXTJS_PORT > /dev/null 2>&1; then
        echo "✅ Next.js ready"
        break
    elif [ $i -eq 8 ]; then
        echo "❌ Next.js not responding"
    else
        sleep 1
    fi
done

for i in {1..8}; do
    if curl -s http://localhost:$GRPC_HTTP_PORT/health > /dev/null 2>&1; then
        echo "✅ gRPC-Web proxy ready"
        break
    elif [ $i -eq 8 ]; then
        echo "❌ gRPC-Web proxy not responding"
    else
        sleep 1
    fi
done

# Test gRPC server (basic check)
if lsof -Pi :$GRPC_SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ gRPC server ready"
else
    echo "❌ gRPC server not responding"
fi

echo ""
echo "🎉 Postman Protocol Playground is ready!"
echo "   • App: http://localhost:$NEXTJS_PORT"
echo "   • gRPC Server: localhost:$GRPC_SERVER_PORT"
echo "   • gRPC-Web Proxy: http://localhost:$GRPC_HTTP_PORT/health"
echo "   • MCP Filesystem: localhost:$MCP_FILESYSTEM_PORT"
echo "   • MCP SQLite: localhost:$MCP_SQLITE_PORT"

# Start the browser opener in background
open_browser &

# Wait for the Next.js server
wait $NEXTJS_PID