import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { mcpServerUrl, method, params = {} } = await request.json();

    if (!mcpServerUrl || !method) {
      return NextResponse.json(
        { error: 'Missing required parameters: mcpServerUrl and method' },
        { status: 400 }
      );
    }

    // Create WebSocket connection to MCP server
    const ws = new WebSocket(mcpServerUrl);

    return new Promise((resolve) => {
      ws.on('open', async () => {
        try {
          // Initialize MCP connection
          const initResponse = await sendMCPMessage(ws, {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              clientInfo: {
                name: 'Postman MCP Proxy',
                version: '1.0.0'
              }
            }
          });

          if (initResponse.error) {
            ws.close();
            resolve(NextResponse.json(
              { error: `MCP initialization failed: ${initResponse.error.message}` },
              { status: 500 }
            ));
            return;
          }

          // Call the requested method
          const callResponse = await sendMCPMessage(ws, {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: method,
              arguments: params
            }
          });

          ws.close();

          if (callResponse.error) {
            resolve(NextResponse.json(
              { error: `MCP call failed: ${callResponse.error.message}` },
              { status: 500 }
            ));
          } else {
            resolve(NextResponse.json({
              success: true,
              data: callResponse.result,
              method,
              mcpServerUrl
            }));
          }
        } catch (error) {
          ws.close();
          resolve(NextResponse.json(
            { error: `MCP communication error: ${error}` },
            { status: 500 }
          ));
        }
      });

      ws.on('error', (error) => {
        resolve(NextResponse.json(
          { error: `WebSocket connection error: ${error.message}` },
          { status: 500 }
        ));
      });

      ws.on('close', () => {
        // Connection closed
      });
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Request processing error: ${error}` },
      { status: 500 }
    );
  }
}

function sendMCPMessage(ws: WebSocket, message: MCPRequest): Promise<MCPResponse> {
  return new Promise((resolve, reject) => {
    const messageId = message.id;
    
    const handler = (data: WebSocket.Data) => {
      try {
        const response: MCPResponse = JSON.parse(data.toString());
        if (response.id === messageId) {
          ws.removeListener('message', handler);
          resolve(response);
        }
      } catch (error) {
        ws.removeListener('message', handler);
        reject(error);
      }
    };

    ws.on('message', handler);
    ws.send(JSON.stringify(message));
  });
}
