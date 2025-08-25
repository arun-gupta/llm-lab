#!/bin/bash

# Start gRPC-Web proxy server
echo "Starting gRPC-Web proxy server..."

# Load port configuration
CONFIG_FILE="config/ports.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
else
    GRPC_SERVER_PORT=50051
fi

# Check if gRPC server is running
if ! curl -s http://localhost:$GRPC_SERVER_PORT > /dev/null 2>&1; then
    echo "⚠️  Warning: gRPC server not detected on port $GRPC_SERVER_PORT"
    echo "   Make sure to start the gRPC server first:"
    echo "   cd grpc-server && npm start"
    echo ""
fi

# Start gRPC-Web proxy
node grpc-web-proxy.js
