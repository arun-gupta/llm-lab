#!/bin/bash

# MCP Server Setup Script for LLM Lab
# This script sets up MCP server infrastructure for Postman integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_step() {
    echo -e "\n${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create MCP servers directory
MCP_DIR="$HOME/.mcp-servers"
mkdir -p "$MCP_DIR"
cd "$MCP_DIR"

print_section "MCP Server Setup for LLM Lab"
print_info "This script will set up MCP server infrastructure for Postman integration"
print_info "Installation directory: $MCP_DIR"

# Check prerequisites
print_section "Checking Prerequisites"

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    print_info "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is required but not installed"
    exit 1
fi

print_success "All prerequisites are installed"

# Create MCP server infrastructure
print_section "Setting Up MCP Server Infrastructure"

# Create configuration files
print_section "Creating Configuration Files"

# Create a startup script
cat > start-mcp-servers.sh << 'EOF'
#!/bin/bash

# Start MCP Servers Script
# This script starts MCP servers for LLM Lab

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting MCP Server Infrastructure..."

# Load port configuration
CONFIG_FILE="../../config/ports.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
else
    MCP_FILESYSTEM_PORT=3002
fi

# Start the HTTP Filesystem MCP server
echo "Starting HTTP Filesystem MCP Server on port $MCP_FILESYSTEM_PORT..."
cd http-filesystem-mcp-server
PORT=$MCP_FILESYSTEM_PORT nohup node index.js > ../http-filesystem-mcp-server.log 2>&1 &
FILESYSTEM_PID=$!
echo $FILESYSTEM_PID > ../http-filesystem-mcp-server.pid
cd ..

echo "MCP server infrastructure started!"
echo "HTTP Filesystem MCP Server: http://localhost:$MCP_FILESYSTEM_PORT"
echo ""
echo "Available Remote MCP Servers:"
echo "  • GitHub MCP Server: https://api.githubcopilot.com/mcp/"
echo "  • GitHub Repositories: https://api.githubcopilot.com/mcp/x/repos"
echo "  • GitHub Issues: https://api.githubcopilot.com/mcp/x/issues"
echo "  • GitHub Pull Requests: https://api.githubcopilot.com/mcp/x/pull_requests"
echo "  • GitHub Actions: https://api.githubcopilot.com/mcp/x/actions"
echo ""
echo "SQLite MCP Server: Docker container (managed separately)"
echo "Logs are available in $MCP_DIR/http-filesystem-mcp-server.log"
echo "PID is stored in $MCP_DIR/http-filesystem-mcp-server.pid"
EOF

# Create a stop script
cat > stop-mcp-servers.sh << 'EOF'
#!/bin/bash

# Stop MCP Servers Script
# This script stops MCP servers for LLM Lab

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Stopping MCP Server Infrastructure..."

# Stop the HTTP Filesystem MCP server
if [ -f "http-filesystem-mcp-server.pid" ]; then
    PID=$(cat http-filesystem-mcp-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped HTTP Filesystem MCP Server (PID: $PID)"
    else
        echo "HTTP Filesystem MCP Server was not running"
    fi
    rm -f http-filesystem-mcp-server.pid
fi

echo "MCP server infrastructure stopped!"
echo "Note: SQLite MCP Docker container must be stopped separately with: docker stop sqlite-mcp-server"
EOF

# Create a status script
cat > status-mcp-servers.sh << 'EOF'
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
EOF

# Make scripts executable
chmod +x start-mcp-servers.sh
chmod +x stop-mcp-servers.sh
chmod +x status-mcp-servers.sh

print_success "Configuration files created"

# Create environment configuration
print_section "Creating Environment Configuration"

cat > .env.mcp << 'EOF'
# MCP Server Configuration
# Copy these variables to your .env.local file

# Local MCP Server URLs
NEXT_PUBLIC_MCP_FILESYSTEM_URL=http://localhost:3002
NEXT_PUBLIC_MCP_SQLITE_URL=http://localhost:3001

# Remote GitHub MCP Server URLs (always available)
NEXT_PUBLIC_MCP_GITHUB_URL=https://api.githubcopilot.com/mcp/
NEXT_PUBLIC_MCP_GITHUB_REPOS_URL=https://api.githubcopilot.com/mcp/x/repos
NEXT_PUBLIC_MCP_GITHUB_ISSUES_URL=https://api.githubcopilot.com/mcp/x/issues
NEXT_PUBLIC_MCP_GITHUB_PR_URL=https://api.githubcopilot.com/mcp/x/pull_requests
NEXT_PUBLIC_MCP_GITHUB_ACTIONS_URL=https://api.githubcopilot.com/mcp/x/actions
NEXT_PUBLIC_MCP_GITHUB_NOTIFICATIONS_URL=https://api.githubcopilot.com/mcp/x/notifications
NEXT_PUBLIC_MCP_GITHUB_ORGS_URL=https://api.githubcopilot.com/mcp/x/orgs
NEXT_PUBLIC_MCP_GITHUB_USERS_URL=https://api.githubcopilot.com/mcp/x/users
NEXT_PUBLIC_MCP_GITHUB_GISTS_URL=https://api.githubcopilot.com/mcp/x/gists
NEXT_PUBLIC_MCP_GITHUB_DISCUSSIONS_URL=https://api.githubcopilot.com/mcp/x/discussions
NEXT_PUBLIC_MCP_GITHUB_DEPENDABOT_URL=https://api.githubcopilot.com/mcp/x/dependabot
NEXT_PUBLIC_MCP_GITHUB_CODE_SECURITY_URL=https://api.githubcopilot.com/mcp/x/code_security
NEXT_PUBLIC_MCP_GITHUB_SECRET_PROTECTION_URL=https://api.githubcopilot.com/mcp/x/secret_protection
NEXT_PUBLIC_MCP_GITHUB_EXPERIMENTS_URL=https://api.githubcopilot.com/mcp/x/experiments
NEXT_PUBLIC_MCP_GITHUB_COPILOT_URL=https://api.githubcopilot.com/mcp/x/copilot

# GitHub MCP Server Configuration
# The remote GitHub MCP server uses GitHub authentication
# No additional API keys required - uses your GitHub account
EOF

print_success "Environment configuration created"

# Create README for MCP servers
cat > README.md << 'EOF'
# MCP Server Infrastructure for LLM Lab

This directory contains the MCP (Model Context Protocol) server infrastructure for LLM Lab.

## Current Setup

- **HTTP Filesystem MCP Server** (Port 3002): Official MCP server with HTTP wrapper for Postman integration
- **SQLite MCP Server** (Port 3001): Database operations with Docker HTTP mode for Postman integration

## Available Remote MCP Servers

GitHub provides official remote MCP servers that are always available:

### Core GitHub Services
- **All GitHub Tools**: https://api.githubcopilot.com/mcp/
- **Repositories**: https://api.githubcopilot.com/mcp/x/repos
- **Issues**: https://api.githubcopilot.com/mcp/x/issues
- **Pull Requests**: https://api.githubcopilot.com/mcp/x/pull_requests
- **Actions**: https://api.githubcopilot.com/mcp/x/actions
- **Notifications**: https://api.githubcopilot.com/mcp/x/notifications

### Additional Services
- **Organizations**: https://api.githubcopilot.com/mcp/x/orgs
- **Users**: https://api.githubcopilot.com/mcp/x/users
- **Gists**: https://api.githubcopilot.com/mcp/x/gists
- **Discussions**: https://api.githubcopilot.com/mcp/x/discussions
- **Dependabot**: https://api.githubcopilot.com/mcp/x/dependabot
- **Code Security**: https://api.githubcopilot.com/mcp/x/code_security
- **Secret Protection**: https://api.githubcopilot.com/mcp/x/secret_protection
- **Experiments**: https://api.githubcopilot.com/mcp/x/experiments
- **Copilot**: https://api.githubcopilot.com/mcp/x/copilot

## Quick Start

1. **Start local servers:**
   ```bash
   ./start-mcp-servers.sh
   ```

2. **Start SQLite MCP Docker container:**
   ```bash
   docker run -d -p 3001:3001 --name sqlite-mcp-server arungupta/sqlite-mcp-server
   ```

3. **Check status:**
   ```bash
   ./status-mcp-servers.sh
   ```

4. **Stop local servers:**
   ```bash
   ./stop-mcp-servers.sh
   ```

5. **Stop SQLite MCP Docker container:**
   ```bash
   docker stop sqlite-mcp-server
   ```

## Usage with Postman

The MCP Integration collection in LLM Lab is configured to use these servers:

- HTTP Filesystem Server: `http://localhost:3002`
- SQLite Server: `http://localhost:3001`
- Remote GitHub Servers: `https://api.githubcopilot.com/mcp/` (and variants)

## Authentication

- **Local Servers**: No authentication required
- **Remote GitHub Servers**: Uses GitHub authentication (your GitHub account)

## Troubleshooting

- Check local logs: `tail -f http-filesystem-mcp-server.log`
- Check local ports: `lsof -i :3002`
- Check Docker container: `docker ps | grep sqlite-mcp-server`
- Restart local server: `./stop-mcp-servers.sh && ./start-mcp-servers.sh`
- Restart Docker container: `docker restart sqlite-mcp-server`
- Remote servers are always available and don't require local setup

## More Information

- [GitHub MCP Server Documentation](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
EOF

print_success "Documentation created"

print_section "Setup Complete!"

print_success "MCP server infrastructure has been set up"
print_info "Installation directory: $MCP_DIR"

echo ""
echo "Next steps:"
echo "1. Start local server: ./start-mcp-servers.sh"
echo "2. Start SQLite MCP Docker container: docker run -d -p 3001:3001 --name sqlite-mcp-server arungupta/sqlite-mcp-server"
echo "3. Check status: ./status-mcp-servers.sh"
echo "4. Remote GitHub MCP servers are always available"
echo "5. Import the MCP collection in Postman"
echo ""
echo "Available commands:"
echo "  ./start-mcp-servers.sh  - Start local MCP server infrastructure"
echo "  ./stop-mcp-servers.sh   - Stop local MCP server infrastructure"
echo "  ./status-mcp-servers.sh - Check server status"
echo ""
echo "Remote GitHub MCP servers are always available at:"
echo "  https://api.githubcopilot.com/mcp/"
echo ""
echo "For more information, see README.md in $MCP_DIR"
