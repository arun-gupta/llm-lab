#!/bin/bash

# Generate startup scripts with configurable ports
echo "🔧 Generating startup scripts with configurable ports..."

# Load port configuration
CONFIG_FILE="config/ports.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Port configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Extract ports using jq (if available) or fallback to defaults
if command -v jq &> /dev/null; then
    NEXTJS_PORT=$(jq -r '.development.nextjs' "$CONFIG_FILE")
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
    MCP_SQLITE_PORT=$(jq -r '.development.mcp.sqlite' "$CONFIG_FILE")
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
else
    echo "⚠️  jq not found, using default ports"
    NEXTJS_PORT=3000
    GRPC_SERVER_PORT=50051
    GRPC_HTTP_PORT=50052
    MCP_SQLITE_PORT=3001
    MCP_FILESYSTEM_PORT=3002
fi

echo "📋 Port Configuration:"
echo "   • Next.js: $NEXTJS_PORT"
echo "   • gRPC Server: $GRPC_SERVER_PORT"
echo "   • gRPC HTTP: $GRPC_HTTP_PORT"
echo "   • MCP SQLite: $MCP_SQLITE_PORT"
echo "   • MCP Filesystem: $MCP_FILESYSTEM_PORT"

# Update gRPC server startup script
cat > grpc-server/start-grpc-server.sh << EOF
#!/bin/bash

# Start GraphRAG gRPC Server
cd "\$(dirname "\$0")"

echo "🚀 Starting GraphRAG gRPC Server..."
echo "   • gRPC Server: localhost:$GRPC_SERVER_PORT"
echo "   • HTTP Server: localhost:$GRPC_HTTP_PORT"
echo "   • Health Check: http://localhost:$GRPC_HTTP_PORT/health"
echo "   • Metrics: http://localhost:$GRPC_HTTP_PORT/metrics"
echo ""

# Set environment variables for ports
export GRPC_PORT=$GRPC_SERVER_PORT
export HTTP_PORT=$GRPC_HTTP_PORT

# Start the server
npm start
EOF

chmod +x grpc-server/start-grpc-server.sh

# Update quickstart script
cat > quickstart-with-ports.sh << EOF
#!/bin/bash

# Quickstart script with configurable ports
echo "🎯 Starting LLM Prompt Lab with configurable ports..."

# Set environment variables
export NEXTJS_PORT=$NEXTJS_PORT
export GRPC_PORT=$GRPC_SERVER_PORT
export HTTP_PORT=$GRPC_HTTP_PORT

# Start Next.js development server
echo "🌐 Starting Next.js server on port $NEXTJS_PORT..."
npm run dev &
NEXTJS_PID=\$!

# Start gRPC server
echo "⚡ Starting gRPC server on ports $GRPC_SERVER_PORT/$GRPC_HTTP_PORT..."
bash grpc-server/start-grpc-server.sh &
GRPC_PID=\$!

echo "✅ Servers started:"
echo "   • Next.js: http://localhost:$NEXTJS_PORT (PID: \$NEXTJS_PID)"
echo "   • gRPC: localhost:$GRPC_SERVER_PORT (PID: \$GRPC_PID)"
echo "   • gRPC HTTP: http://localhost:$GRPC_HTTP_PORT"

# Wait for servers to be ready
sleep 5

# Test endpoints
echo "🧪 Testing endpoints..."
curl -s http://localhost:$NEXTJS_PORT > /dev/null && echo "✅ Next.js server ready" || echo "❌ Next.js server not responding"
curl -s http://localhost:$GRPC_HTTP_PORT/health > /dev/null && echo "✅ gRPC server ready" || echo "❌ gRPC server not responding"

echo ""
echo "🎉 LLM Prompt Lab is ready!"
echo "   • Main app: http://localhost:$NEXTJS_PORT"
echo "   • gRPC health: http://localhost:$GRPC_HTTP_PORT/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
wait
EOF

chmod +x quickstart-with-ports.sh

echo "✅ Startup scripts generated successfully!"
echo "   • grpc-server/start-grpc-server.sh (updated)"
echo ""
echo "🚀 Run './quickstart.sh' to start with configurable ports"
