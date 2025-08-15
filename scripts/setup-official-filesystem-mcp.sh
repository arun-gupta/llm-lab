#!/bin/bash

# Official Filesystem MCP Server Setup Script for LLM Lab
# This script sets up the official filesystem MCP server from the Model Context Protocol repository

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

print_section "Official Filesystem MCP Server Setup for LLM Lab"
print_info "This script will set up the official filesystem MCP server from the Model Context Protocol repository"
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
    print_error "git is required but not installed"
    exit 1
fi

print_success "All prerequisites are installed"

# Set up official filesystem MCP server
print_section "Setting Up Official Filesystem MCP Server"

# Check if official servers are already cloned
if [ ! -d "official-mcp-servers" ]; then
    print_step "Cloning official MCP servers repository"
    git clone https://github.com/modelcontextprotocol/servers.git official-mcp-servers
    print_success "Official MCP servers repository cloned"
else
    print_step "Updating official MCP servers repository"
    cd official-mcp-servers
    git pull origin main
    cd ..
    print_success "Official MCP servers repository updated"
fi

# Build the filesystem server
print_step "Building official filesystem MCP server"
cd official-mcp-servers
npm install
npm run build
print_success "Official filesystem MCP server built successfully"

# Create a symlink for easy access
cd ..
if [ -L "filesystem-mcp-server-official" ]; then
    rm filesystem-mcp-server-official
fi
ln -s official-mcp-servers/src/filesystem filesystem-mcp-server-official
print_success "Created symlink for easy access"

# Create a startup script for the official server
print_section "Creating Startup Scripts"

cat > start-official-filesystem-mcp.sh << 'EOF'
#!/bin/bash

# Start Official Filesystem MCP Server Script
# This script starts the official filesystem MCP server

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting Official Filesystem MCP Server..."

# Set default allowed directories (can be overridden)
DEFAULT_DIRS="/tmp $HOME/Desktop"

# Check if custom directories are provided
if [ $# -eq 0 ]; then
    ALLOWED_DIRS="$DEFAULT_DIRS"
    echo "Using default allowed directories: $ALLOWED_DIRS"
else
    ALLOWED_DIRS="$@"
    echo "Using custom allowed directories: $ALLOWED_DIRS"
fi

# Start the official filesystem MCP server
echo "Starting filesystem MCP server with allowed directories: $ALLOWED_DIRS"
cd filesystem-mcp-server-official

# Run the server with stdio transport (MCP protocol)
node dist/index.js $ALLOWED_DIRS
EOF

chmod +x start-official-filesystem-mcp.sh
print_success "Created startup script: start-official-filesystem-mcp.sh"

# Create a test script
cat > test-official-filesystem-mcp.sh << 'EOF'
#!/bin/bash

# Test Official Filesystem MCP Server Script
# This script tests the official filesystem MCP server

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Testing Official Filesystem MCP Server..."

# Create a test directory
TEST_DIR="/tmp/mcp-test-$(date +%s)"
mkdir -p "$TEST_DIR"
echo "Created test directory: $TEST_DIR"

# Test file operations
echo "Testing file operations..."

# Test 1: List allowed directories
echo "Test 1: Listing allowed directories"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_allowed_directories","arguments":{}}}' | node filesystem-mcp-server-official/dist/index.js /tmp

# Test 2: Create a test file
echo "Test 2: Creating test file"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"write_file","arguments":{"path":"/tmp/test.txt","content":"Hello from Official Filesystem MCP Server!"}}}' | node filesystem-mcp-server-official/dist/index.js /tmp

# Test 3: Read the test file
echo "Test 3: Reading test file"
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"read_text_file","arguments":{"path":"/tmp/test.txt"}}}' | node filesystem-mcp-server-official/dist/index.js /tmp

# Test 4: List directory
echo "Test 4: Listing directory"
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"list_directory","arguments":{"path":"/tmp"}}}' | node filesystem-mcp-server-official/dist/index.js /tmp

# Cleanup
rm -f /tmp/test.txt
echo "Test completed successfully!"
EOF

chmod +x test-official-filesystem-mcp.sh
print_success "Created test script: test-official-filesystem-mcp.sh"

# Update the main startup script to include the official server
print_section "Updating MCP Server Infrastructure"

# Check if start-mcp-servers.sh exists and update it
if [ -f "start-mcp-servers.sh" ]; then
    print_step "Updating existing startup script"
    # Create a backup
    cp start-mcp-servers.sh start-mcp-servers.sh.backup
    
    # Add official filesystem server to the startup script
    cat >> start-mcp-servers.sh << 'EOF'

# Start the official filesystem MCP server
echo "Starting Official Filesystem MCP Server..."
cd filesystem-mcp-server-official
nohup node dist/index.js /tmp $HOME/Desktop > ../official-filesystem-mcp-server.log 2>&1 &
OFFICIAL_FILESYSTEM_MCP_PID=$!
echo $OFFICIAL_FILESYSTEM_MCP_PID > ../official-filesystem-mcp-server.pid
cd ..

echo "Official Filesystem MCP Server: stdio transport (MCP protocol)"
EOF
    print_success "Startup script updated"
fi

# Update stop script if it exists
if [ -f "stop-mcp-servers.sh" ]; then
    print_step "Updating existing stop script"
    # Create a backup
    cp stop-mcp-servers.sh stop-mcp-servers.sh.backup
    
    # Add official filesystem server to the stop script
    cat >> stop-mcp-servers.sh << 'EOF'

# Stop official filesystem MCP server
if [ -f "official-filesystem-mcp-server.pid" ]; then
    echo "Stopping Official Filesystem MCP Server..."
    kill $(cat official-filesystem-mcp-server.pid) 2>/dev/null || true
    rm -f official-filesystem-mcp-server.pid
    echo "Official Filesystem MCP Server stopped"
else
    echo "Official Filesystem MCP Server PID file not found"
fi
EOF
    print_success "Stop script updated"
fi

# Make scripts executable
chmod +x start-mcp-servers.sh
chmod +x stop-mcp-servers.sh

print_section "Official Filesystem MCP Server Setup Complete"
print_success "Official filesystem MCP server has been set up successfully!"
print_info "Installation directory: $MCP_DIR/filesystem-mcp-server-official"
print_info ""
print_info "Available tools (from official server):"
print_info "  • read_text_file - Read file contents as text"
print_info "  • read_media_file - Read image/audio files (base64)"
print_info "  • read_multiple_files - Read multiple files simultaneously"
print_info "  • write_file - Write content to file"
print_info "  • edit_file - Make selective edits with pattern matching"
print_info "  • create_directory - Create directory"
print_info "  • list_directory - List directory contents"
print_info "  • move_file - Move/rename files and directories"
print_info "  • search_files - Search for files by pattern"
print_info "  • get_file_info - Get detailed file metadata"
print_info "  • list_allowed_directories - List accessible directories"
print_info ""
print_info "Security features:"
print_info "  • Directory access control via command-line arguments"
print_info "  • Dynamic directory updates via MCP Roots protocol"
print_info "  • Path validation and security checks"
print_info "  • Sandboxed operations within allowed directories"
print_info ""
print_info "To start the server:"
print_info "  ./start-official-filesystem-mcp.sh [allowed_directories...]"
print_info "  Example: ./start-official-filesystem-mcp.sh /tmp /Users/username/Desktop"
print_info ""
print_info "To test the server:"
print_info "  ./test-official-filesystem-mcp.sh"
print_info ""
print_info "To use with MCP clients:"
print_info "  The server uses stdio transport (MCP protocol standard)"
print_info "  Configure your MCP client to use the server binary"
print_info "  Binary location: $MCP_DIR/filesystem-mcp-server-official/dist/index.js"
