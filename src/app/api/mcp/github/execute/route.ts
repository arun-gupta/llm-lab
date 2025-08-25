import { NextRequest, NextResponse } from 'next/server';

interface GitHubMCPOperation {
  operation: string;
  params: Record<string, any>;
}

interface GitHubMCPResponse {
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
      
      // Check for specific patterns first
      if (lowerQuery.includes('user repositories') || lowerQuery.includes('list repositories') || lowerQuery === 'get user repositories') {
        return { operation: 'list_repositories', params: {} };
      } else if (lowerQuery.includes('repository information') || lowerQuery.includes('get repository')) {
        const repoMatch = q.match(/['"`]([^'"`]+)['"`]/);
        const repo = repoMatch ? repoMatch[1] : 'postman-labs';
        return { operation: 'get_repository', params: { repo } };
      } else if (lowerQuery.includes('issue')) {
        const repoMatch = q.match(/['"`]([^'"`]+)['"`]/);
        const repo = repoMatch ? repoMatch[1] : 'postman-labs';
        return { operation: 'list_issues', params: { repo } };
      } else if (lowerQuery.includes('pull request') || lowerQuery.includes('pr')) {
        const repoMatch = q.match(/['"`]([^'"`]+)['"`]/);
        const repo = repoMatch ? repoMatch[1] : 'postman-labs';
        return { operation: 'get_pull_requests', params: { repo } };
      } else if (lowerQuery.includes('health')) {
        const repoMatch = q.match(/['"`]([^'"`]+)['"`]/);
        const repo = repoMatch ? repoMatch[1] : 'postman-labs';
        return { operation: 'get_repository_health', params: { repo } };
      } else {
        // Default to listing repositories
        return { operation: 'list_repositories', params: {} };
      }
    };

    const { operation, params } = parseQuery(query);
    
    // Debug logging
    console.log('=== GitHub MCP Debug ===');
    console.log('Original Query:', query);
    console.log('Lowercase Query:', query.toLowerCase());
    console.log('Parsed Operation:', operation);
    console.log('Parsed Params:', params);
    console.log('========================');

    // Execute GitHub MCP operations using real MCP API
    const executeGitHubMCP = async (op: string, p: Record<string, any>): Promise<any> => {
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        throw new Error('GitHub token not configured. Please set GITHUB_TOKEN environment variable.');
      }

      // Initialize MCP session
      const initResponse = await fetch('https://api.githubcopilot.com/mcp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            clientInfo: { name: 'postman-labs-mcp-client', version: '1.0.0' }
          },
          id: 1
        })
      });

      if (!initResponse.ok) {
        throw new Error(`MCP initialization failed: ${initResponse.status} ${initResponse.statusText}`);
      }

      const sessionId = initResponse.headers.get('mcp-session-id');
      if (!sessionId) {
        throw new Error('No session ID received from MCP server');
      }

      // Execute the requested operation
      let mcpMethod = '';
      let mcpArguments = {};

      switch (op) {
        case 'list_repositories':
          mcpMethod = 'search_repositories';
          mcpArguments = { query: 'user:arun-gupta', perPage: 5 };
          break;

        case 'get_repository':
          mcpMethod = 'search_repositories';
          mcpArguments = { query: `repo:arun-gupta/${p.repo || 'postman-labs'}`, perPage: 1 };
          break;
        case 'list_issues':
          mcpMethod = 'search_issues';
          mcpArguments = { query: `repo:arun-gupta/${p.repo || 'postman-labs'} is:issue`, perPage: 10 };
          break;
        case 'get_pull_requests':
          mcpMethod = 'search_issues';
          mcpArguments = { query: `repo:arun-gupta/${p.repo || 'postman-labs'} is:pr`, perPage: 10 };
          break;
        case 'get_repository_health':
          mcpMethod = 'search_repositories';
          mcpArguments = { query: `repo:arun-gupta/${p.repo || 'postman-labs'}`, perPage: 1 };
          break;
        default:
          throw new Error(`Unknown operation: ${op}`);
      }

      // Call MCP tool
      const toolResponse = await fetch('https://api.githubcopilot.com/mcp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubToken}`,
          'Mcp-Session-Id': sessionId
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: mcpMethod,
            arguments: mcpArguments
          },
          id: 2
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
          const parsedData = JSON.parse(contentText);
          return parsedData;
        } catch (parseError) {
          throw new Error(`Failed to parse MCP response: ${parseError.message}`);
        }
      } else {
        throw new Error('No content received from MCP server');
      }
    };

    // Execute the MCP operation
    const result = await executeGitHubMCP(operation, params);

    let collection = null;
    if (generateCollection) {
      // Generate dynamic collection based on the operation result
      collection = {
        info: {
          name: `GitHub MCP - ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          description: `Dynamic collection generated from GitHub MCP ${operation} operation`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "github_token",
            value: "{{GITHUB_TOKEN}}",
            type: "string"
          },
          {
            key: "owner",
            value: "arun-gupta",
            type: "string"
          },
          {
            key: "repo",
            value: "postman-labs",
            type: "string"
          }
        ],
        item: [
          {
            name: `GitHub ${operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{github_token}}"
                },
                {
                  key: "Accept",
                  value: "application/vnd.github.v3+json"
                }
              ],
              url: {
                raw: `https://api.github.com/repos/{{owner}}/{{repo}}/${operation.replace(/_/g, '/')}`,
                protocol: "https",
                host: ["api", "github", "com"],
                path: ["repos", "{{owner}}", "{{repo}}", ...operation.split('_')]
              },
              description: `GitHub API call for ${operation} operation`
            },
            response: []
          }
        ]
      };
    }

    const response: GitHubMCPResponse = {
      success: true,
      data: result,
      collection: collection
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GitHub MCP execution error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'GitHub MCP execution failed'
      },
      { status: 500 }
    );
  }
}
