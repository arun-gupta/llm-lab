#!/bin/bash

# Test HTTP Filesystem MCP Server Script
# This script tests the HTTP wrapper around the official filesystem MCP server

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Testing HTTP Filesystem MCP Server..."

# Wait for server to start
sleep 2

# Test 1: Health check
echo "Test 1: Health check"
curl -s http://localhost:$DEFAULT_PORT/health | jq .

# Test 2: Configuration
echo "Test 2: Configuration"
curl -s http://localhost:$DEFAULT_PORT/config | jq .

# Test 3: List tools
echo "Test 3: List available tools"
curl -s http://localhost:$DEFAULT_PORT/tools | jq .

# Test 4: List allowed directories
echo "Test 4: List allowed directories"
curl -s -X POST http://localhost:$DEFAULT_PORT/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"list_allowed_directories","arguments":{}}' | jq .

# Test 5: Create a test file
echo "Test 5: Create test file"
curl -s -X POST http://localhost:$DEFAULT_PORT/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"write_file","arguments":{"path":"/tmp/test.txt","content":"Hello from HTTP Filesystem MCP Server!"}}' | jq .

# Test 6: Read the test file
echo "Test 6: Read test file"
curl -s -X POST http://localhost:$DEFAULT_PORT/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"read_text_file","arguments":{"path":"/tmp/test.txt"}}' | jq .

# Test 7: List directory
echo "Test 7: List directory"
curl -s -X POST http://localhost:$DEFAULT_PORT/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"list_directory","arguments":{"path":"/tmp"}}' | jq .

# Cleanup
rm -f /tmp/test.txt
echo "Test completed successfully!"
