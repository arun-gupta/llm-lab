#!/bin/bash

# Setup script for GraphRAG gRPC Server
# This script installs dependencies and sets up the gRPC server

set -e  # Exit on any error

echo "🚀 Setting up GraphRAG gRPC Server..."
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

# Navigate to gRPC server directory
cd grpc-server

# Install dependencies
echo "📦 Installing gRPC server dependencies..."
npm install

# Create necessary directories
echo "📁 Creating gRPC server directories..."
mkdir -p proto
mkdir -p logs

# Copy proto file if it doesn't exist
if [ ! -f "proto/graphrag.proto" ]; then
    echo "📄 Protocol Buffer definition already exists"
else
    echo "✅ Protocol Buffer definition ready"
fi

# Load port configuration
CONFIG_FILE="../config/ports.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
else
    GRPC_SERVER_PORT=50051
    GRPC_HTTP_PORT=50052
fi

# Create startup script
echo "📝 Creating gRPC server startup script..."
cat > start-grpc-server.sh << EOF
#!/bin/bash

# Start GraphRAG gRPC Server
cd "\$(dirname "\$0")/grpc-server"

echo "🚀 Starting GraphRAG gRPC Server..."
echo "   • gRPC Server: localhost:$GRPC_SERVER_PORT"
echo "   • HTTP Server: localhost:$GRPC_HTTP_PORT"
echo "   • Health Check: http://localhost:$GRPC_HTTP_PORT/health"
echo "   • Metrics: http://localhost:$GRPC_HTTP_PORT/metrics"
echo ""

# Start the server
npm start
EOF

chmod +x start-grpc-server.sh

# Create test script
echo "🧪 Creating gRPC server test script..."
cat > test-grpc-server.sh << 'EOF'
#!/bin/bash

# Test GraphRAG gRPC Server
cd "$(dirname "$0")/grpc-server"

echo "🧪 Testing GraphRAG gRPC Server..."
echo ""

# Wait for server to be ready
echo "⏳ Waiting for gRPC server to be ready..."
sleep 3

# Run tests
node client.js
EOF

chmod +x test-grpc-server.sh

# Go back to root directory
cd ..

echo ""
echo "✅ GraphRAG gRPC Server setup completed!"
echo ""
echo "📋 Available commands:"
echo "   • Start server: ./grpc-server/start-grpc-server.sh"
echo "   • Test server: ./grpc-server/test-grpc-server.sh"
echo "   • Manual start: cd grpc-server && npm start"
echo "   • Manual test: cd grpc-server && node client.js"
echo ""
echo "🌐 Server endpoints:"
echo "   • gRPC: localhost:$GRPC_SERVER_PORT"
echo "   • HTTP: localhost:$GRPC_HTTP_PORT"
echo "   • Health: http://localhost:$GRPC_HTTP_PORT/health"
echo "   • Metrics: http://localhost:$GRPC_HTTP_PORT/metrics"
echo ""
echo "📊 gRPC Services:"
echo "   • QueryGraph: Query knowledge graphs with GraphRAG"
echo "   • TraverseGraph: Stream graph traversal results"
echo "   • GetContextStream: Stream context retrieval"
echo "   • ResolveEntities: High-performance entity resolution"
echo "   • BuildGraph: Incremental graph building"
echo "   • StreamGraphUpdates: Real-time graph updates"
echo "   • HealthCheck: Service health monitoring"
echo ""
