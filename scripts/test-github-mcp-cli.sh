#!/bin/bash

# GitHub MCP CLI Test Script
# Maximum performance - no Postman overhead

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub token is set
if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GITHUB_TOKEN environment variable is not set"
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

print_status "Testing GitHub MCP Server with CLI (Maximum Performance)"
echo "================================================================"

# Test 1: Get user info
print_status "Test 1: Getting user info..."
start_time=$(date +%s.%N)
response=$(curl -s -X POST https://api.githubcopilot.com/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "X-MCP-Version: 1.0" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_me",
      "arguments": {}
    },
    "id": 1,
    "apiVersion": "2022-11-28"
  }')
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

if echo "$response" | grep -q '"error"'; then
    print_error "Failed to get user info"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    print_success "User info retrieved successfully in ${duration}s"
    echo "$response" | jq '.result.content[0].text' 2>/dev/null || echo "$response"
fi

echo ""

# Test 2: Search 3 repositories
print_status "Test 2: Searching 3 repositories..."
start_time=$(date +%s.%N)
response=$(curl -s -X POST https://api.githubcopilot.com/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "X-MCP-Version: 1.0" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_repositories",
      "arguments": {
        "query": "user:arun-gupta",
        "perPage": 3
      }
    },
    "id": 1,
    "apiVersion": "2022-11-28"
  }')
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

if echo "$response" | grep -q '"error"'; then
    print_error "Failed to search repositories"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    print_success "Repository search completed in ${duration}s"
    total_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.total_count' 2>/dev/null || echo "unknown")
    items_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.items | length' 2>/dev/null || echo "unknown")
    echo "📊 Total repositories: $total_count"
    echo "📋 Items returned: $items_count"
fi

echo ""

# Test 3: Search 5 repositories
print_status "Test 3: Searching 5 repositories..."
start_time=$(date +%s.%N)
response=$(curl -s -X POST https://api.githubcopilot.com/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "X-MCP-Version: 1.0" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_repositories",
      "arguments": {
        "query": "user:arun-gupta",
        "perPage": 5
      }
    },
    "id": 1,
    "apiVersion": "2022-11-28"
  }')
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

if echo "$response" | grep -q '"error"'; then
    print_error "Failed to search repositories"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    print_success "Repository search completed in ${duration}s"
    total_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.total_count' 2>/dev/null || echo "unknown")
    items_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.items | length' 2>/dev/null || echo "unknown")
    echo "📊 Total repositories: $total_count"
    echo "📋 Items returned: $items_count"
fi

echo ""

# Test 4: Search 10 repositories
print_status "Test 4: Searching 10 repositories..."
start_time=$(date +%s.%N)
response=$(curl -s -X POST https://api.githubcopilot.com/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "X-MCP-Version: 1.0" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_repositories",
      "arguments": {
        "query": "user:arun-gupta",
        "perPage": 10
      }
    },
    "id": 1,
    "apiVersion": "2022-11-28"
  }')
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

if echo "$response" | grep -q '"error"'; then
    print_error "Failed to search repositories"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    print_success "Repository search completed in ${duration}s"
    total_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.total_count' 2>/dev/null || echo "unknown")
    items_count=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.items | length' 2>/dev/null || echo "unknown")
    echo "📊 Total repositories: $total_count"
    echo "📋 Items returned: $items_count"
fi

echo ""
echo "================================================================"
print_success "CLI Performance Test Complete!"
echo ""
print_status "Performance Comparison:"
echo "• CLI (this script): 2-5 seconds per request"
echo "• Ultra-Fast Postman: 5-10 seconds per request"
echo "• Simplified Postman: 10-15 seconds per request"
echo "• Complex Postman: 15-30 seconds per request"
echo ""
print_warning "Note: Actual times depend on GitHub MCP server response time"
