#!/bin/bash

# Start all servers for real protocol implementations
echo "🚀 Starting all servers for real protocol implementations..."
echo ""

# Load port configuration
CONFIG_FILE="../config/ports.json"
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

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start a server in background
start_server() {
    local name=$1
    local command=$2
    local port=$3
    
    echo "Starting $name on port $port..."
    
    if check_port $port; then
        echo "⚠️  Port $port is already in use. $name may already be running."
    else
        $command > logs/$name.log 2>&1 &
        echo $! > logs/$name.pid
        echo "✅ $name started (PID: $(cat logs/$name.pid))"
    fi
    echo ""
}

# Create logs directory
mkdir -p logs

# Start gRPC server (required for gRPC-Web and other protocols)
if [ -d "grpc-server" ]; then
    echo "📡 Starting gRPC server..."
    cd grpc-server
    if check_port $GRPC_SERVER_PORT; then
        echo "⚠️  Port $GRPC_SERVER_PORT is already in use. gRPC server may already be running."
    else
        npm start > ../logs/grpc-server.log 2>&1 &
        echo $! > ../logs/grpc-server.pid
        echo "✅ gRPC server started (PID: $(cat ../logs/grpc-server.pid))"
    fi
    cd ..
    echo ""
else
    echo "❌ gRPC server directory not found. Please ensure grpc-server is set up."
    echo ""
fi

# Start gRPC-Web proxy
start_server "gRPC-Web Proxy" "node grpc-web-proxy.js" $GRPC_HTTP_PORT

# Start WebSocket server
start_server "WebSocket Server" "node websocket-server.js" $MCP_SQLITE_PORT

# Wait a moment for servers to start
echo "⏳ Waiting for servers to initialize..."
sleep 3

# Check server status
echo "📊 Server Status:"
echo ""

if check_port $GRPC_SERVER_PORT; then
    echo "✅ gRPC Server: Running on port $GRPC_SERVER_PORT"
else
    echo "❌ gRPC Server: Not running on port $GRPC_SERVER_PORT"
fi

if check_port $GRPC_HTTP_PORT; then
    echo "✅ gRPC-Web Proxy: Running on port $GRPC_HTTP_PORT"
else
    echo "❌ gRPC-Web Proxy: Not running on port $GRPC_HTTP_PORT"
fi

if check_port $MCP_SQLITE_PORT; then
    echo "✅ WebSocket Server: Running on port $MCP_SQLITE_PORT"
else
    echo "❌ WebSocket Server: Not running on port $MCP_SQLITE_PORT"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Start the Next.js development server: npm run dev"
echo "2. Upload documents and build a knowledge graph"
echo "3. Test real protocol implementations in the Protocol Comparison tab"
echo ""
echo "📝 Logs are available in the logs/ directory"
echo "🛑 To stop all servers, run: ./scripts/stop-all-servers.sh"
