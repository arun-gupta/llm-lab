#!/bin/bash

# Test script for ArangoDB integration
set -e

echo "🧪 Testing ArangoDB Integration..."

# Check if ArangoDB is running
echo "1. Checking ArangoDB status..."
if curl -s http://localhost:8529/_api/version > /dev/null; then
    echo "✅ ArangoDB is running"
else
    echo "❌ ArangoDB is not running. Please start it first:"
    echo "   docker-compose -f docker-compose.arangodb.yml up -d"
    exit 1
fi

# Test health endpoint
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/arangodb/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed:"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

# Test graph building endpoint
echo "3. Testing graph building endpoint..."
# Create a simple test document
echo "This is a test document about AI and machine learning." > test-doc.txt

# Test the build endpoint
BUILD_RESPONSE=$(curl -s -X POST \
  -F "documents=@test-doc.txt" \
  http://localhost:3000/api/graphrag/build-graph-arangodb)

if echo "$BUILD_RESPONSE" | grep -q "graphId"; then
    echo "✅ Graph building endpoint working"
    GRAPH_ID=$(echo "$BUILD_RESPONSE" | grep -o '"graphId":"[^"]*"' | cut -d'"' -f4)
    echo "   Created graph: $GRAPH_ID"
else
    echo "❌ Graph building endpoint failed:"
    echo "$BUILD_RESPONSE"
    exit 1
fi

# Test graph retrieval endpoint
echo "4. Testing graph retrieval endpoint..."
if [ ! -z "$GRAPH_ID" ]; then
    RETRIEVE_RESPONSE=$(curl -s "http://localhost:3000/api/graphrag/graphs-arangodb?graphId=$GRAPH_ID&includeData=true")
    if echo "$RETRIEVE_RESPONSE" | grep -q "graph"; then
        echo "✅ Graph retrieval endpoint working"
    else
        echo "❌ Graph retrieval endpoint failed:"
        echo "$RETRIEVE_RESPONSE"
        exit 1
    fi
fi

# Cleanup
rm -f test-doc.txt

echo ""
echo "🎉 All ArangoDB integration tests passed!"
echo ""
echo "📋 Next steps:"
echo "   1. Use the GraphRAG interface to build and query graphs"
echo "   2. Check ArangoDB web interface at http://localhost:8529"
echo "   3. Monitor performance improvements over JSON storage"
