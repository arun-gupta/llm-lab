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
