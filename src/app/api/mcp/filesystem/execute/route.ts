import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
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
      } else if (lowerQuery.includes('sample') || lowerQuery.includes('doc')) {
        return { operation: 'list_sample_docs', params: {} };
      } else {
        // Default to listing sample docs
        return { operation: 'list_sample_docs', params: {} };
      }
    };

    const { operation, params } = parseQuery(query);

    // Execute Filesystem MCP operations
    const executeFilesystemMCP = async (op: string, p: Record<string, any>): Promise<any> => {
      const basePath = process.cwd();
      
      switch (op) {
        case 'list_directory':
          const dirPath = p.path || '.';
          const fullPath = join(basePath, dirPath);
          
          try {
            const items = await readdir(fullPath, { withFileTypes: true });
            const files = await Promise.all(items.map(async item => {
              const itemPath = join(fullPath, item.name);
              const itemStats = item.isFile() ? await stat(itemPath) : null;
              
              return {
                name: item.name,
                type: item.isDirectory() ? 'directory' : 'file',
                path: join(dirPath, item.name),
                size: itemStats?.size || null,
                modified: itemStats?.mtime.toISOString() || null
              };
            }));
            
            return {
              path: dirPath,
              items: files,
              total_files: files.filter(f => f.type === 'file').length,
              total_directories: files.filter(f => f.type === 'directory').length
            };
          } catch (error) {
            throw new Error(`Failed to read directory: ${dirPath}`);
          }

        case 'read_file':
          const filePath = p.path;
          if (!filePath) {
            throw new Error('File path is required');
          }
          
          const fullFilePath = join(basePath, filePath);
          
          try {
            const content = await readFile(fullFilePath, 'utf-8');
            const fileStats = await stat(fullFilePath);
            
            return {
              path: filePath,
              content: content,
              size: fileStats.size,
              modified: fileStats.mtime.toISOString(),
              encoding: 'utf-8'
            };
          } catch (error) {
            throw new Error(`Failed to read file: ${filePath}`);
          }

        case 'search_files':
          const searchPath = p.path || '.';
          const searchTerm = p.query;
          const searchFullPath = join(basePath, searchPath);
          
          try {
            const items = await readdir(searchFullPath, { withFileTypes: true });
            const matchingFiles = [];
            
            for (const item of items) {
              if (item.isFile() && item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                const filePath = join(searchPath, item.name);
                const fileStats = await stat(join(searchFullPath, item.name));
                matchingFiles.push({
                  name: item.name,
                  path: filePath,
                  size: fileStats.size,
                  modified: fileStats.mtime.toISOString()
                });
              }
            }
            
            return {
              search_term: searchTerm,
              path: searchPath,
              results: matchingFiles,
              total_matches: matchingFiles.length
            };
          } catch (error) {
            throw new Error(`Failed to search files: ${searchPath}`);
          }

        case 'get_file_info':
          const infoPath = p.path;
          if (!infoPath) {
            throw new Error('File path is required');
          }
          
          const infoFullPath = join(basePath, infoPath);
          
          try {
            const fileStats = await stat(infoFullPath);
            
            return {
              path: infoPath,
              exists: true,
              size: fileStats.size,
              created: fileStats.birthtime.toISOString(),
              modified: fileStats.mtime.toISOString(),
              accessed: fileStats.atime.toISOString(),
              is_file: fileStats.isFile(),
              is_directory: fileStats.isDirectory(),
              permissions: fileStats.mode.toString(8)
            };
          } catch (error) {
            return {
              path: infoPath,
              exists: false,
              error: 'File not found'
            };
          }

        case 'list_sample_docs':
          const samplePath = join(basePath, 'sample-docs');
          
          try {
            const items = await readdir(samplePath, { withFileTypes: true });
            const files = items
              .filter(item => item.isFile())
              .map(item => ({
                name: item.name,
                path: join('sample-docs', item.name),
                size: 0, // Will be calculated below
                modified: new Date().toISOString()
              }));
            
            // Get file sizes
            for (const file of files) {
              try {
                const fileStats = await stat(join(basePath, file.path));
                file.size = fileStats.size;
                file.modified = fileStats.mtime.toISOString();
              } catch (error) {
                // Ignore errors for individual files
              }
            }
            
            return {
              path: 'sample-docs',
              files: files,
              total_files: files.length,
              total_size: files.reduce((sum, file) => sum + file.size, 0)
            };
          } catch (error) {
            throw new Error('Failed to read sample documents directory');
          }

        default:
          throw new Error(`Unknown operation: ${op}`);
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
