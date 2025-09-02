import { NextRequest, NextResponse } from 'next/server';

interface SQLiteMCPOperation {
  operation: string;
  params: Record<string, any>;
}

interface SQLiteMCPResponse {
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
      } else if (lowerQuery === 'server info') {
        return { operation: 'server_info', params: {} };
      } else if (lowerQuery === 'list tools') {
        return { operation: 'list_tools', params: {} };
      } else if (lowerQuery === 'list tables') {
        return { operation: 'list_tables', params: {} };
      } else if (lowerQuery === 'describe table') {
        return { operation: 'describe_table', params: { table_name: 'users' } };
      } else if (lowerQuery === 'run query') {
        return { operation: 'run_query', params: { query: 'SELECT * FROM users ORDER BY id DESC LIMIT 10' } };
      } else if (lowerQuery === 'insert row') {
        const timestamp = Date.now();
        return { 
          operation: 'insert_row', 
          params: { 
            table: 'users', 
            data: { 
              name: `Test User ${timestamp}`, 
              email: `test${timestamp}@example.com` 
            } 
          } 
        };
      } else if (lowerQuery === 'update row') {
        return { operation: 'update_row', params: { table: 'users', id: 1, data: { name: `Updated User ${Date.now()}` } } };
      } else if (lowerQuery === 'delete row') {
        // Delete by email pattern to match Postman Collection behavior
        return { operation: 'delete_row', params: { table: 'users', email: 'test-delete@example.com' } };
      } else {
        // Fallback to pattern matching for custom queries
        if (lowerQuery.includes('list') && lowerQuery.includes('table')) {
          return { operation: 'list_tables', params: {} };
        } else if (lowerQuery.includes('schema') || lowerQuery.includes('describe')) {
          const tableMatch = q.match(/['"`]([^'"`]+)['"`]/);
          const table = tableMatch ? tableMatch[1] : 'users';
          return { operation: 'describe_table', params: { table_name: table } };
        } else if (lowerQuery.includes('select') || lowerQuery.includes('query')) {
          const selectMatch = q.match(/select\s+(.+?)(?:\s+limit\s+\d+)?$/i);
          if (selectMatch) {
            return { operation: 'run_query', params: { query: q } };
          } else {
            return { operation: 'run_query', params: { query: 'SELECT * FROM users ORDER BY id DESC LIMIT 10' } };
          }
        } else {
          // Default to listing tools
          return { operation: 'list_tools', params: {} };
        }
      }
    };

    const { operation, params } = parseQuery(query);

    // Execute SQLite MCP operations using real MCP API
    const executeSQLiteMCP = async (op: string, p: Record<string, any>): Promise<any> => {
      const sqliteMCPUrl = process.env.SQLITE_MCP_URL || 'http://localhost:3001';
      
      let endpoint = '';
      let method = 'GET';
      let body = null;

      switch (op) {
        case 'health_check':
          endpoint = '/health';
          break;
        case 'server_info':
          endpoint = '/info';
          break;
        case 'list_tools':
          endpoint = '/tools';
          break;
        case 'list_tables':
          endpoint = '/tables';
          break;

        case 'describe_table':
          endpoint = `/tables/${p.table_name || 'users'}`;
          break;
        case 'run_query':
          endpoint = '/query';
          method = 'POST';
          body = { query: p.query };
          break;
        case 'insert_row':
          endpoint = '/tables/users/insert';
          method = 'POST';
          body = { data: p.data };
          break;
        case 'update_row':
          endpoint = '/tables/users/update';
          method = 'PUT';
          body = { data: p.data, where: { id: p.id } };
          break;
        case 'delete_row':
          endpoint = '/tables/users/delete';
          method = 'DELETE';
          body = { where: p.email ? { email: p.email } : { id: p.id } };
          break;
        default:
          throw new Error(`Unknown operation: ${op}`);
      }

      // Call SQLite MCP API
      const response = await fetch(`${sqliteMCPUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`SQLite MCP API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    };

    // Execute the MCP operation
    const result = await executeSQLiteMCP(operation, params);

    let collection = null;
    if (generateCollection) {
      // Generate dynamic collection based on the operation result
      collection = {
        info: {
          name: `SQLite MCP - ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          description: `Dynamic collection generated from SQLite MCP ${operation} operation`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "database_path",
            value: "postman_labs.db",
            type: "string"
          },
          {
            key: "table_name",
            value: "users",
            type: "string"
          }
        ],
        item: [
          {
            name: `SQLite ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
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
                raw: "{{base_url}}/api/mcp/sqlite/execute",
                host: ["{{base_url}}"],
                path: ["api", "mcp", "sqlite", "execute"]
              },
              description: `SQLite MCP ${operation} operation`
            },
            response: []
          }
        ]
      };
    }

    const response: SQLiteMCPResponse = {
      success: true,
      data: result,
      collection: collection
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('SQLite MCP execution error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'SQLite MCP execution failed'
      },
      { status: 500 }
    );
  }
}
