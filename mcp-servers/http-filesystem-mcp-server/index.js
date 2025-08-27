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
const MCP_SERVER_PATH = path.join(process.env.HOME, '.mcp-servers/official-mcp-servers/src/filesystem/dist/index.js');

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
