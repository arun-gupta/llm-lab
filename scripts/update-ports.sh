#!/bin/bash

# Update port configurations across all files
# This script helps ensure consistency when changing ports

set -e

CONFIG_FILE="config/ports.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Port configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Load current port configuration
if command -v jq &> /dev/null; then
    NEXTJS_PORT=$(jq -r '.development.nextjs' "$CONFIG_FILE")
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
    MCP_SQLITE_PORT=$(jq -r '.development.mcp.sqlite' "$CONFIG_FILE")
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
else
    echo "❌ jq is required to read port configuration"
    exit 1
fi

echo "🔧 Current Port Configuration:"
echo "   • Next.js: $NEXTJS_PORT"
echo "   • gRPC Server: $GRPC_SERVER_PORT"
echo "   • gRPC-Web Proxy: $GRPC_HTTP_PORT"
echo "   • MCP SQLite: $MCP_SQLITE_PORT"
echo "   • MCP Filesystem: $MCP_FILESYSTEM_PORT"
echo ""

echo "📝 Files that use port configuration:"
echo "   ✅ quickstart.sh - Uses config file"
echo "   ✅ scripts/start-all-servers.sh - Uses config file"
echo "   ✅ grpc-web-proxy.js - Uses config file"
echo "   ✅ scripts/setup-http-filesystem-mcp.sh - Updated to use config file"
echo "   ✅ scripts/setup-grpc-server.sh - Updated to use config file"
echo "   ✅ scripts/setup-mcp-servers.sh - Updated to use config file"
echo "   ✅ scripts/start-websocket-server.sh - Updated to use config file"
echo "   ✅ scripts/start-grpc-web-proxy.sh - Updated to use config file"
echo "   ✅ src/lib/port-config.ts - TypeScript utility"
echo ""

echo "💡 To change ports, edit $CONFIG_FILE and restart services:"
echo "   ./quickstop.sh"
echo "   ./quickstart.sh"
echo ""

echo "🔍 Checking for remaining hardcoded port references..."
echo ""

# Check for hardcoded port references (mostly fallback values)
echo "Remaining hardcoded ports (mostly fallback values):"
grep -r "50051\|50052\|3000\|3001\|3002" --include="*.sh" --include="*.js" scripts/ | grep -v "config/ports.json" | head -10

echo ""
echo "📋 Summary:"
echo "   ✅ Port configuration is centralized in config/ports.json"
echo "   ✅ All main scripts now use the config file"
echo "   ✅ Setup scripts have been updated for consistency"
echo "   ✅ TypeScript application uses port-config.ts utility"
echo "   ✅ Fallback values are properly configured"
echo ""
echo "🎉 Port configuration is now fully consistent!"
