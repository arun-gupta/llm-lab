#!/bin/bash

# Status MCP Servers Script
# This script shows the status of MCP servers for LLM Lab

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "MCP Server Infrastructure Status:"
echo "================================="

# Check HTTP Filesystem MCP server
if [ -f "http-filesystem-mcp-server.pid" ]; then
    PID=$(cat http-filesystem-mcp-server.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ HTTP Filesystem MCP Server: Running (PID: $PID, Port: $MCP_FILESYSTEM_PORT)"
    else
        echo "❌ HTTP Filesystem MCP Server: Not running (stale PID file)"
        rm -f http-filesystem-mcp-server.pid
    fi
else
    echo "❌ HTTP Filesystem MCP Server: Not running"
fi

# Check SQLite MCP Docker container
if command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "sqlite-mcp-server"; then
        echo "✅ SQLite MCP Server: Running (Docker container)"
    else
        echo "❌ SQLite MCP Server: Not running (Docker container)"
    fi
else
    echo "⚠️  SQLite MCP Server: Docker not available"
fi

echo ""
echo "Available Remote MCP Servers:"
echo "✅ GitHub MCP Server: https://api.githubcopilot.com/mcp/"
echo "✅ GitHub Repositories: https://api.githubcopilot.com/mcp/x/repos"
echo "✅ GitHub Issues: https://api.githubcopilot.com/mcp/x/issues"
echo "✅ GitHub Pull Requests: https://api.githubcopilot.com/mcp/x/pull_requests"
echo "✅ GitHub Actions: https://api.githubcopilot.com/mcp/x/actions"
echo "✅ GitHub Notifications: https://api.githubcopilot.com/mcp/x/notifications"
echo "✅ GitHub Organizations: https://api.githubcopilot.com/mcp/x/orgs"
echo "✅ GitHub Users: https://api.githubcopilot.com/mcp/x/users"
echo "✅ GitHub Gists: https://api.githubcopilot.com/mcp/x/gists"
echo "✅ GitHub Discussions: https://api.githubcopilot.com/mcp/x/discussions"
echo "✅ GitHub Dependabot: https://api.githubcopilot.com/mcp/x/dependabot"
echo "✅ GitHub Code Security: https://api.githubcopilot.com/mcp/x/code_security"
echo "✅ GitHub Secret Protection: https://api.githubcopilot.com/mcp/x/secret_protection"
echo "✅ GitHub Experiments: https://api.githubcopilot.com/mcp/x/experiments"
echo "✅ GitHub Copilot: https://api.githubcopilot.com/mcp/x/copilot"
echo ""
echo "Port Usage:"
echo "3001: SQLite MCP Server (Docker)"
echo "3002: HTTP Filesystem MCP Server"
echo ""
echo "Note: Remote GitHub MCP servers are always available and don't require local installation."
echo "For more information, see: https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md"
