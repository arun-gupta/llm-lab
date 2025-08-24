#!/bin/bash

# Start GraphRAG gRPC Server
cd "$(dirname "$0")/grpc-server"

echo "🚀 Starting GraphRAG gRPC Server..."
echo "   • gRPC Server: localhost:50051"
echo "   • HTTP Server: localhost:50052"
echo "   • Health Check: http://localhost:50052/health"
echo "   • Metrics: http://localhost:50052/metrics"
echo ""

# Start the server
npm start
