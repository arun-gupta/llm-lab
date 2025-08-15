#!/bin/bash

# Filesystem MCP Server Setup Script for LLM Lab
# This script sets up a filesystem MCP server based on the Model Context Protocol

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

print_section "Filesystem MCP Server Setup for LLM Lab"
print_info "This script will set up a filesystem MCP server based on the Model Context Protocol"
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

# Create filesystem MCP server
print_section "Setting Up Filesystem MCP Server"

print_step "Creating filesystem MCP server"
mkdir -p "filesystem-mcp-server"
cd "filesystem-mcp-server"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "filesystem-mcp-server",
  "version": "1.0.0",
  "description": "Filesystem MCP server for LLM Lab",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "ws": "^8.14.2"
  }
}
EOF

# Create the main server file
cat > index.js << 'EOF'
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: 'filesystem-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to check if path is safe
function isPathSafe(requestedPath, basePath) {
  const resolvedPath = path.resolve(requestedPath);
  const resolvedBase = path.resolve(basePath);
  return resolvedPath.startsWith(resolvedBase);
}

// Helper function to get safe base path
function getSafeBasePath() {
  // Default to user's home directory, but can be configured
  return process.env.MCP_FILESYSTEM_BASE_PATH || process.env.HOME || '/tmp';
}

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to read',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to write',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_directory',
        description: 'List contents of a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the directory to list',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'file_exists',
        description: 'Check if a file or directory exists',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to check',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'get_file_info',
        description: 'Get information about a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to get information about',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'create_directory',
        description: 'Create a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the directory to create',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'delete_file',
        description: 'Delete a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to delete',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'search_files',
        description: 'Search for files by pattern',
        inputSchema: {
          type: 'object',
          properties: {
            directory: {
              type: 'string',
              description: 'Directory to search in',
            },
            pattern: {
              type: 'string',
              description: 'File pattern to search for (e.g., "*.js", "*.txt")',
            },
          },
          required: ['directory', 'pattern'],
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  const basePath = getSafeBasePath();
  
  try {
    switch (name) {
      case 'read_file': {
        const filePath = path.resolve(args.path);
        if (!isPathSafe(filePath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      }
      
      case 'write_file': {
        const filePath = path.resolve(args.path);
        if (!isPathSafe(filePath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(filePath, args.content, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: `File written successfully: ${filePath}`,
            },
          ],
        };
      }
      
      case 'list_directory': {
        const dirPath = path.resolve(args.path);
        if (!isPathSafe(dirPath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const items = entries.map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: path.join(dirPath, entry.name),
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(items, null, 2),
            },
          ],
        };
      }
      
      case 'file_exists': {
        const filePath = path.resolve(args.path);
        if (!isPathSafe(filePath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        try {
          await fs.access(filePath);
          return {
            content: [
              {
                type: 'text',
                text: 'true',
              },
            ],
          };
        } catch {
          return {
            content: [
              {
                type: 'text',
                text: 'false',
              },
            ],
          };
        }
      }
      
      case 'get_file_info': {
        const filePath = path.resolve(args.path);
        if (!isPathSafe(filePath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        const stats = await fs.stat(filePath);
        const info = {
          path: filePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          created: stats.birthtime,
          modified: stats.mtime,
          permissions: stats.mode.toString(8),
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }
      
      case 'create_directory': {
        const dirPath = path.resolve(args.path);
        if (!isPathSafe(dirPath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        await fs.mkdir(dirPath, { recursive: true });
        return {
          content: [
            {
              type: 'text',
              text: `Directory created successfully: ${dirPath}`,
            },
          ],
        };
      }
      
      case 'delete_file': {
        const filePath = path.resolve(args.path);
        if (!isPathSafe(filePath, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          await fs.rmdir(filePath, { recursive: true });
        } else {
          await fs.unlink(filePath);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Deleted successfully: ${filePath}`,
            },
          ],
        };
      }
      
      case 'search_files': {
        const searchDir = path.resolve(args.directory);
        if (!isPathSafe(searchDir, basePath)) {
          throw new Error(`Access denied: Path outside allowed directory`);
        }
        
        const results = [];
        
        async function searchRecursive(dir, pattern) {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
              await searchRecursive(fullPath, pattern);
            } else {
              // Simple pattern matching (can be enhanced with glob patterns)
              if (entry.name.includes(pattern.replace('*', '')) || 
                  entry.name.endsWith(pattern.replace('*', ''))) {
                results.push(fullPath);
              }
            }
          }
        }
        
        await searchRecursive(searchDir, args.pattern);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new Error(`Filesystem operation failed: ${error.message}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport);
console.log('Filesystem MCP Server running on stdio');
EOF

# Install dependencies
print_step "Installing dependencies"
npm install
print_success "Filesystem MCP server dependencies installed"

cd ..

# Update the main startup script to include filesystem server
print_section "Updating MCP Server Infrastructure"

# Check if start-mcp-servers.sh exists and update it
if [ -f "start-mcp-servers.sh" ]; then
    print_step "Updating existing startup script"
    # Create a backup
    cp start-mcp-servers.sh start-mcp-servers.sh.backup
    
    # Add filesystem server to the startup script
    cat >> start-mcp-servers.sh << 'EOF'

# Start the filesystem MCP server on port 3002
echo "Starting Filesystem MCP Server on port 3002..."
cd filesystem-mcp-server
nohup node index.js > ../filesystem-mcp-server.log 2>&1 &
FILESYSTEM_MCP_PID=$!
echo $FILESYSTEM_MCP_PID > ../filesystem-mcp-server.pid
cd ..

echo "Filesystem MCP Server: http://localhost:3002"
EOF
    print_success "Startup script updated"
else
    print_warning "No existing startup script found, creating new one"
    cat > start-mcp-servers.sh << 'EOF'
#!/bin/bash

# Start MCP Servers Script
# This script starts MCP servers for LLM Lab

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Starting MCP Server Infrastructure..."

# Start the filesystem MCP server on port 3002
echo "Starting Filesystem MCP Server on port 3002..."
cd filesystem-mcp-server
nohup node index.js > ../filesystem-mcp-server.log 2>&1 &
FILESYSTEM_MCP_PID=$!
echo $FILESYSTEM_MCP_PID > ../filesystem-mcp-server.pid
cd ..

echo "MCP server infrastructure started!"
echo "Filesystem MCP Server: http://localhost:3002"
echo ""
echo "Available Remote MCP Servers:"
echo "  • GitHub MCP Server: https://api.githubcopilot.com/mcp/"
echo "  • GitHub Repositories: https://api.githubcopilot.com/mcp/x/repos"
echo "  • GitHub Issues: https://api.githubcopilot.com/mcp/x/issues"
echo "  • GitHub Pull Requests: https://api.githubcopilot.com/mcp/x/pull_requests"
echo "  • GitHub Actions: https://api.githubcopilot.com/mcp/x/actions"
echo ""
echo "Logs are available in $MCP_DIR/filesystem-mcp-server.log"
echo "PID is stored in $MCP_DIR/filesystem-mcp-server.pid"
EOF
fi

# Update stop script if it exists
if [ -f "stop-mcp-servers.sh" ]; then
    print_step "Updating existing stop script"
    # Create a backup
    cp stop-mcp-servers.sh stop-mcp-servers.sh.backup
    
    # Add filesystem server to the stop script
    cat >> stop-mcp-servers.sh << 'EOF'

# Stop filesystem MCP server
if [ -f "filesystem-mcp-server.pid" ]; then
    echo "Stopping Filesystem MCP Server..."
    kill $(cat filesystem-mcp-server.pid) 2>/dev/null || true
    rm -f filesystem-mcp-server.pid
    echo "Filesystem MCP Server stopped"
else
    echo "Filesystem MCP Server PID file not found"
fi
EOF
    print_success "Stop script updated"
fi

# Make scripts executable
chmod +x start-mcp-servers.sh
chmod +x stop-mcp-servers.sh

print_section "Filesystem MCP Server Setup Complete"
print_success "Filesystem MCP server has been set up successfully!"
print_info "Installation directory: $MCP_DIR/filesystem-mcp-server"
print_info ""
print_info "Available tools:"
print_info "  • read_file - Read file contents"
print_info "  • write_file - Write content to file"
print_info "  • list_directory - List directory contents"
print_info "  • file_exists - Check if file/directory exists"
print_info "  • get_file_info - Get file/directory information"
print_info "  • create_directory - Create directory"
print_info "  • delete_file - Delete file/directory"
print_info "  • search_files - Search for files by pattern"
print_info ""
print_info "Security features:"
print_info "  • Path validation to prevent directory traversal"
print_info "  • Configurable base path (default: $HOME)"
print_info "  • Safe file operations with proper error handling"
print_info ""
print_info "To start the server:"
print_info "  npm run start-mcp"
print_info ""
print_info "To stop the server:"
print_info "  npm run stop-mcp"
print_info ""
print_info "Configuration:"
print_info "  Set MCP_FILESYSTEM_BASE_PATH environment variable to restrict access"
print_info "  Example: export MCP_FILESYSTEM_BASE_PATH=/path/to/safe/directory"
