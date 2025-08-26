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
