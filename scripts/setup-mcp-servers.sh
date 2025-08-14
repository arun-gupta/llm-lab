#!/bin/bash

# MCP Server Setup Script for LLM Lab
# This script installs and configures popular MCP servers for Postman integration

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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Create MCP servers directory
MCP_DIR="$HOME/.mcp-servers"
mkdir -p "$MCP_DIR"
cd "$MCP_DIR"

print_section "MCP Server Setup for LLM Lab"
print_info "This script will install and configure popular MCP servers for Postman integration"
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

if ! command_exists git; then
    print_error "Git is required but not installed"
    print_info "Please install Git from https://git-scm.com/"
    exit 1
fi

print_success "All prerequisites are installed"

# Install MCP servers
print_section "Installing MCP Servers"

# 1. GitHub MCP Server
print_step "Installing GitHub MCP Server"
if [ ! -d "github-mcp-server" ]; then
    git clone https://github.com/modelcontextprotocol/server-github.git github-mcp-server
    cd github-mcp-server
    npm install
    print_success "GitHub MCP Server installed"
else
    cd github-mcp-server
    git pull
    npm install
    print_success "GitHub MCP Server updated"
fi
cd ..

# 2. File System MCP Server
print_step "Installing File System MCP Server"
if [ ! -d "filesystem-mcp-server" ]; then
    git clone https://github.com/modelcontextprotocol/server-filesystem.git filesystem-mcp-server
    cd filesystem-mcp-server
    npm install
    print_success "File System MCP Server installed"
else
    cd filesystem-mcp-server
    git pull
    npm install
    print_success "File System MCP Server updated"
fi
cd ..

# 3. Web Search MCP Server
print_step "Installing Web Search MCP Server"
if [ ! -d "web-search-mcp-server" ]; then
    git clone https://github.com/modelcontextprotocol/server-web-search.git web-search-mcp-server
    cd web-search-mcp-server
    npm install
    print_success "Web Search MCP Server installed"
else
    cd web-search-mcp-server
    git pull
    npm install
    print_success "Web Search MCP Server updated"
fi
cd ..

# 4. Database MCP Server
print_step "Installing Database MCP Server"
if [ ! -d "database-mcp-server" ]; then
    git clone https://github.com/modelcontextprotocol/server-database.git database-mcp-server
    cd database-mcp-server
    npm install
    print_success "Database MCP Server installed"
else
    cd database-mcp-server
    git pull
    npm install
    print_success "Database MCP Server updated"
fi
cd ..

# Create configuration files
print_section "Creating Configuration Files"

# Create a startup script
cat > start-mcp-servers.sh << 'EOF'
#!/bin/bash

# Start MCP Servers Script
# This script starts all MCP servers on their respective ports

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting MCP Servers..."

# Start GitHub MCP Server on port 3001
echo "Starting GitHub MCP Server on port 3001..."
cd github-mcp-server
nohup node dist/index.js --port 3001 > ../github-mcp.log 2>&1 &
GITHUB_PID=$!
echo $GITHUB_PID > ../github-mcp.pid
cd ..

# Start File System MCP Server on port 3002
echo "Starting File System MCP Server on port 3002..."
cd filesystem-mcp-server
nohup node dist/index.js --port 3002 > ../filesystem-mcp.log 2>&1 &
FILESYSTEM_PID=$!
echo $FILESYSTEM_PID > ../filesystem-mcp.pid
cd ..

# Start Web Search MCP Server on port 3003
echo "Starting Web Search MCP Server on port 3003..."
cd web-search-mcp-server
nohup node dist/index.js --port 3003 > ../web-search-mcp.log 2>&1 &
WEBSEARCH_PID=$!
echo $WEBSEARCH_PID > ../web-search-mcp.pid
cd ..

# Start Database MCP Server on port 3004
echo "Starting Database MCP Server on port 3004..."
cd database-mcp-server
nohup node dist/index.js --port 3004 > ../database-mcp.log 2>&1 &
DATABASE_PID=$!
echo $DATABASE_PID > ../database-mcp.pid
cd ..

echo "All MCP servers started!"
echo "GitHub MCP: http://localhost:3001"
echo "File System MCP: http://localhost:3002"
echo "Web Search MCP: http://localhost:3003"
echo "Database MCP: http://localhost:3004"
echo ""
echo "Logs are available in $MCP_DIR/*.log"
echo "PIDs are stored in $MCP_DIR/*.pid"
EOF

# Create a stop script
cat > stop-mcp-servers.sh << 'EOF'
#!/bin/bash

# Stop MCP Servers Script
# This script stops all running MCP servers

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Stopping MCP Servers..."

# Stop GitHub MCP Server
if [ -f "github-mcp.pid" ]; then
    PID=$(cat github-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped GitHub MCP Server (PID: $PID)"
    else
        echo "GitHub MCP Server was not running"
    fi
    rm -f github-mcp.pid
fi

# Stop File System MCP Server
if [ -f "filesystem-mcp.pid" ]; then
    PID=$(cat filesystem-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped File System MCP Server (PID: $PID)"
    else
        echo "File System MCP Server was not running"
    fi
    rm -f filesystem-mcp.pid
fi

# Stop Web Search MCP Server
if [ -f "web-search-mcp.pid" ]; then
    PID=$(cat web-search-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped Web Search MCP Server (PID: $PID)"
    else
        echo "Web Search MCP Server was not running"
    fi
    rm -f web-search-mcp.pid
fi

# Stop Database MCP Server
if [ -f "database-mcp.pid" ]; then
    PID=$(cat database-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Stopped Database MCP Server (PID: $PID)"
    else
        echo "Database MCP Server was not running"
    fi
    rm -f database-mcp.pid
fi

echo "All MCP servers stopped!"
EOF

# Create a status script
cat > status-mcp-servers.sh << 'EOF'
#!/bin/bash

# Status MCP Servers Script
# This script shows the status of all MCP servers

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "MCP Servers Status:"
echo "=================="

# Check GitHub MCP Server
if [ -f "github-mcp.pid" ]; then
    PID=$(cat github-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ GitHub MCP Server: Running (PID: $PID, Port: 3001)"
    else
        echo "❌ GitHub MCP Server: Not running (stale PID file)"
        rm -f github-mcp.pid
    fi
else
    echo "❌ GitHub MCP Server: Not running"
fi

# Check File System MCP Server
if [ -f "filesystem-mcp.pid" ]; then
    PID=$(cat filesystem-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ File System MCP Server: Running (PID: $PID, Port: 3002)"
    else
        echo "❌ File System MCP Server: Not running (stale PID file)"
        rm -f filesystem-mcp.pid
    fi
else
    echo "❌ File System MCP Server: Not running"
fi

# Check Web Search MCP Server
if [ -f "web-search-mcp.pid" ]; then
    PID=$(cat web-search-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ Web Search MCP Server: Running (PID: $PID, Port: 3003)"
    else
        echo "❌ Web Search MCP Server: Not running (stale PID file)"
        rm -f web-search-mcp.pid
    fi
else
    echo "❌ Web Search MCP Server: Not running"
fi

# Check Database MCP Server
if [ -f "database-mcp.pid" ]; then
    PID=$(cat database-mcp.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ Database MCP Server: Running (PID: $PID, Port: 3004)"
    else
        echo "❌ Database MCP Server: Not running (stale PID file)"
        rm -f database-mcp.pid
    fi
else
    echo "❌ Database MCP Server: Not running"
fi

echo ""
echo "Port Usage:"
echo "3001: GitHub MCP Server"
echo "3002: File System MCP Server"
echo "3003: Web Search MCP Server"
echo "3004: Database MCP Server"
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

# MCP Server URLs (for Postman collection)
NEXT_PUBLIC_MCP_GITHUB_URL=ws://localhost:3001
NEXT_PUBLIC_MCP_FILESYSTEM_URL=ws://localhost:3002
NEXT_PUBLIC_MCP_WEBSEARCH_URL=ws://localhost:3003
NEXT_PUBLIC_MCP_DATABASE_URL=ws://localhost:3004

# GitHub MCP Server Configuration
GITHUB_TOKEN=your_github_token_here

# Web Search MCP Server Configuration
SERPER_API_KEY=your_serper_api_key_here

# Database MCP Server Configuration
DATABASE_URL=your_database_connection_string_here
EOF

print_success "Environment configuration created"

# Create README for MCP servers
cat > README.md << 'EOF'
# MCP Servers for LLM Lab

This directory contains the MCP (Model Context Protocol) servers used by LLM Lab for Postman integration.

## Installed Servers

- **GitHub MCP Server** (Port 3001): Access GitHub repositories and data
- **File System MCP Server** (Port 3002): Read and write local files
- **Web Search MCP Server** (Port 3003): Perform web searches
- **Database MCP Server** (Port 3004): Query databases

## Quick Start

1. **Start all servers:**
   ```bash
   ./start-mcp-servers.sh
   ```

2. **Check status:**
   ```bash
   ./status-mcp-servers.sh
   ```

3. **Stop all servers:**
   ```bash
   ./stop-mcp-servers.sh
   ```

## Configuration

1. Copy `.env.mcp` to your project's `.env.local`
2. Update the API keys and tokens as needed
3. Restart the servers after configuration changes

## Usage with Postman

The MCP Integration collection in LLM Lab is configured to use these servers:

- GitHub: `ws://localhost:3001`
- File System: `ws://localhost:3002`
- Web Search: `ws://localhost:3003`
- Database: `ws://localhost:3004`

## Troubleshooting

- Check logs: `tail -f *.log`
- Check ports: `lsof -i :3001-3004`
- Restart servers: `./stop-mcp-servers.sh && ./start-mcp-servers.sh`

## API Keys Required

- **GitHub**: Personal access token for repository access
- **Web Search**: Serper API key for web search functionality
- **Database**: Connection string for your database

## More Information

- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/server-github)
- [File System MCP Server](https://github.com/modelcontextprotocol/server-filesystem)
- [Web Search MCP Server](https://github.com/modelcontextprotocol/server-web-search)
- [Database MCP Server](https://github.com/modelcontextprotocol/server-database)
EOF

print_success "Documentation created"

print_section "Setup Complete!"

print_success "MCP servers have been installed and configured"
print_info "Installation directory: $MCP_DIR"

echo ""
echo "Next steps:"
echo "1. Configure API keys in .env.mcp"
echo "2. Start the servers: ./start-mcp-servers.sh"
echo "3. Check status: ./status-mcp-servers.sh"
echo "4. Import the MCP collection in Postman"
echo ""
echo "Available commands:"
echo "  ./start-mcp-servers.sh  - Start all MCP servers"
echo "  ./stop-mcp-servers.sh   - Stop all MCP servers"
echo "  ./status-mcp-servers.sh - Check server status"
echo ""
echo "For more information, see README.md in $MCP_DIR"
