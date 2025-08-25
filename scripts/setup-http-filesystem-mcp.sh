#!/bin/bash

# HTTP Filesystem MCP Server Setup Script for LLM Lab
# This script sets up an HTTP wrapper around the official filesystem MCP server

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

print_section "HTTP Filesystem MCP Server Setup for LLM Lab"
print_info "This script will set up an HTTP wrapper around the official filesystem MCP server"
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

# Configuration section
print_section "Directory Access Configuration"
print_info "You can configure which directories the filesystem MCP server can access."
print_info "This is important for security - only allow access to directories you trust."

# Default directories
DEFAULT_DIRS="/tmp $HOME/Desktop"

# Use default directories automatically for quickstart
ALLOWED_DIRS="$DEFAULT_DIRS"
print_info "Using default directories: $ALLOWED_DIRS"
print_info "You can edit filesystem-mcp-config.env later to customize directories"

# Save configuration
print_step "Saving configuration"
cat > filesystem-mcp-config.env << EOF
# Filesystem MCP Server Configuration
# This file contains the allowed directories for the filesystem MCP server
# Edit this file to change allowed directories, then restart the server

ALLOWED_DIRECTORIES="$ALLOWED_DIRS"
DEFAULT_DIRECTORIES="$DEFAULT_DIRS"
EOF

print_success "Configuration saved to: filesystem-mcp-config.env"

# Set up HTTP wrapper for filesystem MCP server
print_section "Setting Up HTTP Filesystem MCP Server"

print_step "Creating HTTP wrapper for filesystem MCP server"
mkdir -p "http-filesystem-mcp-server"
cd "http-filesystem-mcp-server"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "http-filesystem-mcp-server",
  "version": "1.0.0",
  "description": "HTTP wrapper for official filesystem MCP server",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "child_process": "^1.0.2"
  }
}
EOF

# Create the HTTP wrapper server with configurable directories
cat > index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load port configuration
let DEFAULT_PORT = 3002;
try {
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, '../config/ports.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    DEFAULT_PORT = config.development.mcp.filesystem;
  }
} catch (error) {
  console.warn('Failed to load port config, using default:', error.message);
}

const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(cors());
app.use(express.json());

// MCP server binary path
const MCP_SERVER_PATH = path.join(__dirname, '../official-mcp-servers/src/filesystem/dist/index.js');

// Configuration file path
const CONFIG_PATH = path.join(__dirname, '../filesystem-mcp-config.env');

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
      const lines = configContent.split('\n');
      const config = {};
      
      lines.forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          config[key.trim()] = value.trim().replace(/"/g, '');
        }
      });
      
      return config;
    }
  } catch (error) {
    console.warn('Could not load configuration file:', error.message);
  }
  
  // Default configuration
  return {
    ALLOWED_DIRECTORIES: '/tmp ' + process.env.HOME + '/Desktop'
  };
}

// Store MCP server process
let mcpProcess = null;
let sessionId = null;
let allowedDirectories = [];

// Initialize MCP server
async function initializeMCPServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting MCP server...');
    
    // Load configuration
    const config = loadConfig();
    allowedDirectories = config.ALLOWED_DIRECTORIES.split(' ').filter(dir => dir.trim());
    
    console.log('Allowed directories:', allowedDirectories);
    
    // Start the MCP server process with configured directories
    const args = [MCP_SERVER_PATH, ...allowedDirectories];
    mcpProcess = spawn('node', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle MCP server output
    mcpProcess.stdout.on('data', (data) => {
      console.log('MCP Server:', data.toString());
    });

    mcpProcess.stderr.on('data', (data) => {
      console.log('MCP Server Error:', data.toString());
    });

    mcpProcess.on('close', (code) => {
      console.log('MCP Server process exited with code:', code);
    });

    // Wait a moment for server to start
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

// Send request to MCP server
async function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    if (!mcpProcess) {
      reject(new Error('MCP server not running'));
      return;
    }

    const requestStr = JSON.stringify(request) + '\n';
    
    let responseData = '';
    let errorData = '';

    // Handle response
    const responseHandler = (data) => {
      responseData += data.toString();
      try {
        const response = JSON.parse(responseData);
        resolve(response);
        mcpProcess.stdout.removeListener('data', responseHandler);
        mcpProcess.stderr.removeListener('data', errorHandler);
      } catch (e) {
        // Incomplete JSON, continue reading
      }
    };

    // Handle errors
    const errorHandler = (data) => {
      errorData += data.toString();
    };

    mcpProcess.stdout.on('data', responseHandler);
    mcpProcess.stderr.on('data', errorHandler);

    // Send request
    mcpProcess.stdin.write(requestStr);

    // Timeout after 10 seconds
    setTimeout(() => {
      mcpProcess.stdout.removeListener('data', responseHandler);
      mcpProcess.stderr.removeListener('data', errorHandler);
      reject(new Error('Request timeout'));
    }, 10000);
  });
}

// Initialize MCP server on startup
initializeMCPServer().then(() => {
  console.log('MCP server initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize MCP server:', error);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcpServer: mcpProcess ? 'running' : 'stopped',
    allowedDirectories: allowedDirectories,
    timestamp: new Date().toISOString()
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  const config = loadConfig();
  res.json({
    allowedDirectories: allowedDirectories,
    configFile: CONFIG_PATH,
    config: config
  });
});

// MCP protocol endpoint
app.post('/mcp', async (req, res) => {
  try {
    const mcpRequest = req.body;
    console.log('Received MCP request:', mcpRequest.method);
    
    const response = await sendMCPRequest(mcpRequest);
    res.json(response);
  } catch (error) {
    console.error('Error processing MCP request:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: 'Internal error: ' + error.message
      }
    });
  }
});

// Tools endpoint (for easier Postman integration)
app.post('/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    console.log('Tool call:', name, args);
    
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: name,
        arguments: args
      }
    };
    
    const response = await sendMCPRequest(mcpRequest);
    res.json(response);
  } catch (error) {
    console.error('Error processing tool call:', error);
    res.status(500).json({
      error: 'Internal error: ' + error.message
    });
  }
});

// List tools endpoint
app.get('/tools', async (req, res) => {
  try {
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
      params: {}
    };
    
    const response = await sendMCPRequest(mcpRequest);
    res.json(response);
  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({
      error: 'Internal error: ' + error.message
    });
  }
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP Filesystem MCP Server running on http://localhost:${PORT}`);
  console.log('Allowed directories:', allowedDirectories);
  console.log('Available endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /config - Configuration info');
  console.log('  POST /mcp - MCP protocol endpoint');
  console.log('  POST /tools/call - Tool call endpoint');
  console.log('  GET  /tools - List available tools');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (mcpProcess) {
    mcpProcess.kill();
  }
  process.exit(0);
});
EOF

# Install dependencies
print_step "Installing dependencies"
npm install
print_success "HTTP filesystem MCP server dependencies installed"

cd ..

# Create a startup script for the HTTP server
print_section "Creating Startup Scripts"

cat > start-http-filesystem-mcp.sh << 'EOF'
#!/bin/bash

# Start HTTP Filesystem MCP Server Script
# This script starts the HTTP wrapper around the official filesystem MCP server

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting HTTP Filesystem MCP Server..."

# Load configuration
if [ -f "filesystem-mcp-config.env" ]; then
    source filesystem-mcp-config.env
    echo "Loaded configuration from filesystem-mcp-config.env"
    echo "Allowed directories: $ALLOWED_DIRECTORIES"
else
    echo "Configuration file not found, using defaults"
    ALLOWED_DIRECTORIES="/tmp $HOME/Desktop"
fi

# Start the HTTP filesystem MCP server
echo "Starting HTTP filesystem MCP server on port $DEFAULT_PORT..."
cd http-filesystem-mcp-server
nohup node index.js > ../http-filesystem-mcp-server.log 2>&1 &
HTTP_FILESYSTEM_MCP_PID=$!
echo $HTTP_FILESYSTEM_MCP_PID > ../http-filesystem-mcp-server.pid
cd ..

echo "HTTP Filesystem MCP Server started!"
echo "Server URL: http://localhost:$DEFAULT_PORT"
echo "Health check: http://localhost:$DEFAULT_PORT/health"
echo "Configuration: http://localhost:$DEFAULT_PORT/config"
echo "Tools endpoint: http://localhost:$DEFAULT_PORT/tools"
echo "MCP endpoint: http://localhost:$DEFAULT_PORT/mcp"
echo ""
echo "Logs are available in $MCP_DIR/http-filesystem-mcp-server.log"
echo "PID is stored in $MCP_DIR/http-filesystem-mcp-server.pid"
echo ""
echo "To change allowed directories:"
echo "1. Edit $MCP_DIR/filesystem-mcp-config.env"
echo "2. Restart the server: ./stop-http-filesystem-mcp.sh && ./start-http-filesystem-mcp.sh"
EOF

chmod +x start-http-filesystem-mcp.sh
print_success "Created startup script: start-http-filesystem-mcp.sh"

# Create a stop script
cat > stop-http-filesystem-mcp.sh << 'EOF'
#!/bin/bash

# Stop HTTP Filesystem MCP Server Script

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Stopping HTTP Filesystem MCP Server..."

if [ -f "http-filesystem-mcp-server.pid" ]; then
    PID=$(cat http-filesystem-mcp-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "HTTP Filesystem MCP Server stopped (PID: $PID)"
    else
        echo "HTTP Filesystem MCP Server process not running"
    fi
    rm -f http-filesystem-mcp-server.pid
else
    echo "PID file not found"
fi
EOF

chmod +x stop-http-filesystem-mcp.sh
print_success "Created stop script: stop-http-filesystem-mcp.sh"

# Create a configuration script
cat > configure-filesystem-mcp.sh << 'EOF'
#!/bin/bash

# Configure Filesystem MCP Server Script
# This script allows you to reconfigure the allowed directories

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Filesystem MCP Server Configuration"
echo "=================================="
echo ""

# Load current configuration
if [ -f "filesystem-mcp-config.env" ]; then
    source filesystem-mcp-config.env
    echo "Current allowed directories: $ALLOWED_DIRECTORIES"
else
    echo "No configuration file found, using defaults"
    ALLOWED_DIRECTORIES="/tmp $HOME/Desktop"
fi

echo ""
echo "Do you want to reconfigure the allowed directories? (y/N): "
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter the directories you want to allow access to (one per line, empty line to finish):"
    echo "Examples: /tmp, $HOME/Documents, $HOME/Downloads"
    echo "Warning: Only enter directories you trust!"
    echo ""
    
    CUSTOM_DIRS=""
    while true; do
        read -p "Directory path (or empty to finish): " dir_path
        if [ -z "$dir_path" ]; then
            break
        fi
        
        # Validate directory exists
        if [ ! -d "$dir_path" ]; then
            echo "Directory '$dir_path' does not exist. Create it? (y/N): "
            read -n 1 -r create_dir
            echo ""
            if [[ $create_dir =~ ^[Yy]$ ]]; then
                mkdir -p "$dir_path"
                echo "Created directory: $dir_path"
            else
                echo "Skipping directory: $dir_path"
                continue
            fi
        fi
        
        # Add to custom directories
        if [ -z "$CUSTOM_DIRS" ]; then
            CUSTOM_DIRS="$dir_path"
        else
            CUSTOM_DIRS="$CUSTOM_DIRS $dir_path"
        fi
        echo "Added: $dir_path"
    done
    
    if [ -n "$CUSTOM_DIRS" ]; then
        # Update configuration file
        cat > filesystem-mcp-config.env << CONFIG_EOF
# Filesystem MCP Server Configuration
# This file contains the allowed directories for the filesystem MCP server
# Edit this file to change allowed directories, then restart the server

ALLOWED_DIRECTORIES="$CUSTOM_DIRS"
DEFAULT_DIRECTORIES="/tmp $HOME/Desktop"
CONFIG_EOF
        
        echo ""
        echo "Configuration updated!"
        echo "New allowed directories: $CUSTOM_DIRS"
        echo ""
        echo "To apply changes, restart the server:"
        echo "  ./stop-http-filesystem-mcp.sh && ./start-http-filesystem-mcp.sh"
    else
        echo "No directories specified, keeping current configuration"
    fi
else
    echo "Configuration unchanged"
fi
EOF

chmod +x configure-filesystem-mcp.sh
print_success "Created configuration script: configure-filesystem-mcp.sh"

# Create a test script
cat > test-http-filesystem-mcp.sh << 'EOF'
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
EOF

chmod +x test-http-filesystem-mcp.sh
print_success "Created test script: test-http-filesystem-mcp.sh"

# Update the main startup script to include the HTTP server
print_section "Updating MCP Server Infrastructure"

# Check if start-mcp-servers.sh exists and update it
if [ -f "start-mcp-servers.sh" ]; then
    print_step "Updating existing startup script"
    # Create a backup
    cp start-mcp-servers.sh start-mcp-servers.sh.backup
    
    # Add HTTP filesystem server to the startup script
    cat >> start-mcp-servers.sh << 'EOF'

# Start the HTTP filesystem MCP server
echo "Starting HTTP Filesystem MCP Server..."
cd http-filesystem-mcp-server
nohup node index.js > ../http-filesystem-mcp-server.log 2>&1 &
HTTP_FILESYSTEM_MCP_PID=$!
echo $HTTP_FILESYSTEM_MCP_PID > ../http-filesystem-mcp-server.pid
cd ..

echo "HTTP Filesystem MCP Server: http://localhost:$DEFAULT_PORT"
EOF
    print_success "Startup script updated"
fi

# Update stop script if it exists
if [ -f "stop-mcp-servers.sh" ]; then
    print_step "Updating existing stop script"
    # Create a backup
    cp stop-mcp-servers.sh stop-mcp-servers.sh.backup
    
    # Add HTTP filesystem server to the stop script
    cat >> stop-mcp-servers.sh << 'EOF'

# Stop HTTP filesystem MCP server
if [ -f "http-filesystem-mcp-server.pid" ]; then
    echo "Stopping HTTP Filesystem MCP Server..."
    kill $(cat http-filesystem-mcp-server.pid) 2>/dev/null || true
    rm -f http-filesystem-mcp-server.pid
    echo "HTTP Filesystem MCP Server stopped"
else
    echo "HTTP Filesystem MCP Server PID file not found"
fi
EOF
    print_success "Stop script updated"
fi

# Make scripts executable
chmod +x start-mcp-servers.sh
chmod +x stop-mcp-servers.sh

print_section "HTTP Filesystem MCP Server Setup Complete"
print_success "HTTP filesystem MCP server has been set up successfully!"
print_info "Installation directory: $MCP_DIR/http-filesystem-mcp-server"
print_info ""
print_info "Configuration:"
print_info "  • Allowed directories: $ALLOWED_DIRS"
print_info "  • Config file: $MCP_DIR/filesystem-mcp-config.env"
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
print_info "HTTP Endpoints:"
print_info "  • GET  /health - Health check"
print_info "  • GET  /config - Configuration info"
print_info "  • POST /mcp - MCP protocol endpoint"
print_info "  • POST /tools/call - Tool call endpoint"
print_info "  • GET  /tools - List available tools"
print_info ""
print_info "Management Commands:"
print_info "  • ./start-http-filesystem-mcp.sh - Start the server"
print_info "  • ./stop-http-filesystem-mcp.sh - Stop the server"
print_info "  • ./configure-filesystem-mcp.sh - Reconfigure allowed directories"
print_info "  • ./test-http-filesystem-mcp.sh - Test the server"
print_info ""
print_info "To change allowed directories:"
print_info "  1. Run: ./configure-filesystem-mcp.sh"
print_info "  2. Or edit: $MCP_DIR/filesystem-mcp-config.env"
print_info "  3. Restart: ./stop-http-filesystem-mcp.sh && ./start-http-filesystem-mcp.sh"
print_info ""
print_info "Postman Integration:"
print_info "  The server now supports HTTP requests and can be used with Postman!"
print_info "  Base URL: http://localhost:$DEFAULT_PORT"
