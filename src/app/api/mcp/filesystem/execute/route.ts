import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface FilesystemMCPOperation {
  operation: string;
  params: Record<string, any>;
}

interface FilesystemMCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  collection?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { query, generateCollection = false } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Parse natural language query to determine operation and params
    const parseQuery = (q: string): { operation: string; params: any } => {
      const lowerQuery = q.toLowerCase();
      
      // Check for exact matches first
      if (lowerQuery === 'health check') {
        return { operation: 'health_check', params: {} };
      } else if (lowerQuery === 'show configuration') {
        return { operation: 'show_configuration', params: {} };
      } else if (lowerQuery === 'list available tools') {
        return { operation: 'list_available_tools', params: {} };
      } else if (lowerQuery === 'list allowed directories') {
        return { operation: 'list_allowed_directories', params: {} };
      } else if (lowerQuery === 'list directory contents (private tmp)' || lowerQuery === 'list directory contents (desktop)') {
        const pathMatch = q.match(/\(([^)]+)\)/);
        const path = pathMatch ? pathMatch[1] : 'sample-docs';
        return { operation: 'list_directory', params: { path } };
      } else if (lowerQuery === 'write test file') {
        return { operation: 'write_test_file', params: {} };
      } else if (lowerQuery === 'read test file') {
        return { operation: 'read_file', params: { path: 'sample-docs/ai-healthcare.txt' } };
      } else if (lowerQuery === 'get file information') {
        return { operation: 'get_file_info', params: { path: 'sample-docs/ai-healthcare.txt' } };
      } else if (lowerQuery === 'create test directory') {
        return { operation: 'create_test_directory', params: {} };
      } else if (lowerQuery === 'search for test files') {
        return { operation: 'search_files', params: { query: 'AI', path: 'sample-docs' } };
      } else if (lowerQuery === 'show test file metadata') {
        return { operation: 'get_file_info', params: { path: 'sample-docs/ai-healthcare.txt' } };
      } else if (lowerQuery === 'show test directory contents') {
        return { operation: 'list_directory', params: { path: 'sample-docs' } };
      } else {
        // Fallback to pattern matching for custom queries
        if (lowerQuery.includes('list') && (lowerQuery.includes('file') || lowerQuery.includes('dir'))) {
          const pathMatch = q.match(/['"`]([^'"`]+)['"`]/);
          const path = pathMatch ? pathMatch[1] : 'sample-docs';
          return { operation: 'list_directory', params: { path } };
        } else if (lowerQuery.includes('read') && lowerQuery.includes('file')) {
          const fileMatch = q.match(/['"`]([^'"`]+)['"`]/);
          const file = fileMatch ? fileMatch[1] : 'sample-docs/ai-healthcare.txt';
          return { operation: 'read_file', params: { path: file } };
        } else if (lowerQuery.includes('search') && lowerQuery.includes('file')) {
          const searchMatch = q.match(/['"`]([^'"`]+)['"`]/);
          const searchTerm = searchMatch ? searchMatch[1] : 'AI';
          return { operation: 'search_files', params: { query: searchTerm, path: 'sample-docs' } };
        } else if (lowerQuery.includes('info') || lowerQuery.includes('stat')) {
          const fileMatch = q.match(/['"`]([^'"`]+)['"`]/);
          const file = fileMatch ? fileMatch[1] : 'sample-docs/ai-healthcare.txt';
          return { operation: 'get_file_info', params: { path: file } };
        } else {
          // Default to listing sample docs
          return { operation: 'list_sample_docs', params: {} };
        }
      }
    };

    const { operation, params } = parseQuery(query);

    // Execute Filesystem MCP operations using real MCP API
    const executeFilesystemMCP = async (op: string, p: Record<string, any>): Promise<any> => {
      const filesystemMCPUrl = process.env.FILESYSTEM_MCP_URL || 'http://localhost:3002';
      
      // Map operations to MCP tool names
      let mcpToolName = '';
      let mcpArguments = {};

      switch (op) {
        case 'health_check':
          mcpToolName = 'health_check';
          mcpArguments = {};
          break;
        case 'show_configuration':
          mcpToolName = 'show_configuration';
          mcpArguments = {};
          break;
        case 'list_available_tools':
          mcpToolName = 'list_available_tools';
          mcpArguments = {};
          break;
        case 'list_allowed_directories':
          mcpToolName = 'list_allowed_directories';
          mcpArguments = {};
          break;

        case 'write_test_file':
          mcpToolName = 'write_test_file';
          mcpArguments = {};
          break;
        case 'create_test_directory':
          mcpToolName = 'create_test_directory';
          mcpArguments = {};
          break;
        case 'list_directory':
          mcpToolName = 'list_directory';
          mcpArguments = { path: p.path || '.' };
          break;
          
        case 'read_file':
          mcpToolName = 'read_file';
          mcpArguments = { path: p.path };
          break;
        case 'search_files':
          mcpToolName = 'search_files';
          mcpArguments = { query: p.query, path: p.path || '.' };
          break;
        case 'get_file_info':
          mcpToolName = 'get_file_info';
          mcpArguments = { path: p.path };
          break;
        case 'list_sample_docs':
          mcpToolName = 'list_directory';
          mcpArguments = { path: 'sample-docs' };
          break;
        default:
          throw new Error(`Unknown operation: ${op}`);
      }

      // Call MCP tool
      const toolResponse = await fetch(`${filesystemMCPUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: mcpToolName,
            arguments: mcpArguments
          },
          id: Date.now()
        })
      });

      if (!toolResponse.ok) {
        throw new Error(`MCP tool call failed: ${toolResponse.status} ${toolResponse.statusText}`);
      }

      const toolData = await toolResponse.json();
      
      if (toolData.error) {
        throw new Error(`MCP tool error: ${toolData.error.message}`);
      }

      // Parse the MCP response
      if (toolData.result?.content && toolData.result.content.length > 0) {
        const contentText = toolData.result.content[0].text;
        try {
          // Try to parse as JSON first
          const parsedData = JSON.parse(contentText);
          return parsedData;
        } catch (parseError) {
          // If not JSON, return the text as is
          return { content: contentText };
        }
      } else {
        throw new Error('No content received from MCP server');
      }
    };

    // Execute the MCP operation
    const result = await executeFilesystemMCP(operation, params);

    let collection = null;
    if (generateCollection) {
      // Generate dynamic collection based on the operation result
      collection = {
        info: {
          name: `Filesystem MCP - ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          description: `Dynamic collection generated from Filesystem MCP ${operation} operation`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "base_path",
            value: ".",
            type: "string"
          },
          {
            key: "file_path",
            value: params?.path || "sample-docs/ai-healthcare.txt",
            type: "string"
          }
        ],
        item: [
          {
            name: `Filesystem ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  operation: operation,
                  params: params
                }, null, 2)
              },
              url: {
                raw: "{{base_url}}/api/mcp/filesystem/execute",
                host: ["{{base_url}}"],
                path: ["api", "mcp", "filesystem", "execute"]
              },
              description: `Filesystem MCP ${operation} operation`
            },
            response: []
          }
        ]
      };
    }

    const response: FilesystemMCPResponse = {
      success: true,
      data: result,
      collection: collection
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Filesystem MCP execution error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Filesystem MCP execution failed'
      },
      { status: 500 }
    );
  }
}
