// MCP Client for Postman Integration
// This can be used in Postman pre-request and test scripts

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

interface MCPCall {
  method: string;
  params: any;
}

class MCPClient {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private tools: MCPTool[] = [];

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);
      
      this.ws.onopen = () => {
        console.log('Connected to MCP server:', this.serverUrl);
        this.initialize();
        resolve();
      };
      
      this.ws.onerror = (error) => {
        console.error('MCP connection error:', error);
        reject(error);
      };
    });
  }

  private async initialize(): Promise<void> {
    // Initialize the MCP connection
    await this.send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'Postman MCP Client',
          version: '1.0.0'
        }
      }
    });

    // List available tools
    const toolsResponse = await this.send({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    });

    this.tools = toolsResponse.result.tools || [];
  }

  async call(method: string, params: any = {}): Promise<any> {
    if (!this.ws) {
      throw new Error('MCP client not connected');
    }

    const response = await this.send({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: method,
        arguments: params
      }
    });

    return response.result.content[0]?.text || response.result;
  }

  private send(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const messageId = message.id;
      
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.id === messageId) {
          this.ws?.removeEventListener('message', handler);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        }
      };

      this.ws.addEventListener('message', handler);
      this.ws.send(JSON.stringify(message));
    });
  }

  getAvailableTools(): MCPTool[] {
    return this.tools;
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}

// Popular MCP Server Configurations
export const MCP_SERVERS = {
  GITHUB: {
    name: 'GitHub MCP Server',
    url: 'ws://localhost:3001',
    description: 'Access GitHub repositories, issues, and more',
    tools: [
      'github/list_repositories',
      'github/get_repository',
      'github/create_issue',
      'github/search_code',
      'github/get_pull_requests'
    ]
  },
  FILESYSTEM: {
    name: 'File System MCP Server',
    url: 'ws://localhost:3002',
    description: 'Read, write, and search files',
    tools: [
      'filesystem/read_file',
      'filesystem/write_file',
      'filesystem/list_directory',
      'filesystem/search_files'
    ]
  },
  WEB_SEARCH: {
    name: 'Web Search MCP Server',
    url: 'ws://localhost:3003',
    description: 'Search the web and get current information',
    tools: [
      'web_search/search',
      'web_search/get_news',
      'web_search/get_weather'
    ]
  },
  DATABASE: {
    name: 'Database MCP Server',
    url: 'ws://localhost:3004',
    description: 'Query and manipulate databases',
    tools: [
      'database/query',
      'database/insert',
      'database/update',
      'database/delete'
    ]
  }
};

export { MCPClient };
