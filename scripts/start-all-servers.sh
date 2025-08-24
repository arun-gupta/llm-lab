#!/bin/bash

# Start all servers for real protocol implementations
echo "🚀 Starting all servers for real protocol implementations..."
echo ""

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
    if check_port 50051; then
        echo "⚠️  Port 50051 is already in use. gRPC server may already be running."
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
start_server "gRPC-Web Proxy" "node grpc-web-proxy.js" 50052

# Start WebSocket server
start_server "WebSocket Server" "node websocket-server.js" 3001

# Wait a moment for servers to start
echo "⏳ Waiting for servers to initialize..."
sleep 3

# Check server status
echo "📊 Server Status:"
echo ""

if check_port 50051; then
    echo "✅ gRPC Server: Running on port 50051"
else
    echo "❌ gRPC Server: Not running on port 50051"
fi

if check_port 50052; then
    echo "✅ gRPC-Web Proxy: Running on port 50052"
else
    echo "❌ gRPC-Web Proxy: Not running on port 50052"
fi

if check_port 3001; then
    echo "✅ WebSocket Server: Running on port 3001"
else
    echo "❌ WebSocket Server: Not running on port 3001"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Start the Next.js development server: npm run dev"
echo "2. Upload documents and build a knowledge graph"
echo "3. Test real protocol implementations in the Protocol Comparison tab"
echo ""
echo "📝 Logs are available in the logs/ directory"
echo "🛑 To stop all servers, run: ./scripts/stop-all-servers.sh"
