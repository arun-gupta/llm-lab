#!/bin/bash

# Start WebSocket server for real-time GraphRAG communication
echo "Starting WebSocket server..."

# Check if gRPC server is running
if ! curl -s http://localhost:50051 > /dev/null 2>&1; then
    echo "⚠️  Warning: gRPC server not detected on port 50051"
    echo "   Make sure to start the gRPC server first:"
    echo "   cd grpc-server && npm start"
    echo ""
fi

# Start WebSocket server
node websocket-server.js
