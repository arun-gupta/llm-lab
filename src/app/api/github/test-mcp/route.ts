import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  try {
    // Read GitHub token from .env.local
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        success: false,
        message: 'No .env.local file found',
        error: 'Configuration file missing'
      });
    }

    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    const keys: { [key: string]: string } = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        keys[key.trim()] = value.trim();
      }
    });

    const githubToken = keys.GITHUB_TOKEN || '';
    const isConfigured = githubToken &&
      (githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_')) &&
      githubToken !== 'your_github_personal_access_token_here';

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        message: 'GitHub token not configured or invalid',
        error: 'Token missing or invalid format'
      });
    }

    // Test GitHub MCP server connection
    try {
      // Step 1: Initialize MCP session
      const initResponse = await fetch('https://api.githubcopilot.com/mcp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'X-MCP-Version': '1.0',
          'Authorization': `Bearer ${githubToken}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: 'llm-lab-test',
              version: '1.0.0'
            }
          },
          id: 1
        })
      });

      if (!initResponse.ok) {
        throw new Error(`MCP initialization failed: ${initResponse.status} ${initResponse.statusText}`);
      }

      const initData = await initResponse.json();
      const sessionId = initResponse.headers.get('mcp-session-id');

      if (!sessionId) {
        throw new Error('No session ID received from MCP server');
      }

      // Step 2: Test tools/list to verify available tools
      const toolsResponse = await fetch('https://api.githubcopilot.com/mcp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'X-MCP-Version': '1.0',
          'Authorization': `Bearer ${githubToken}`,
          'Mcp-Session-Id': sessionId
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 2
        })
      });

      if (!toolsResponse.ok) {
        throw new Error(`Tools list failed: ${toolsResponse.status} ${toolsResponse.statusText}`);
      }

      const toolsData = await toolsResponse.json();
      const availableTools = toolsData.result?.tools || [];
      const toolNames = availableTools.map((tool: any) => tool.name);

      // Step 3: Test a simple tool call (get_me)
      const testResponse = await fetch('https://api.githubcopilot.com/mcp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'X-MCP-Version': '1.0',
          'Authorization': `Bearer ${githubToken}`,
          'Mcp-Session-Id': sessionId
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_me',
            arguments: {}
          },
          id: 3,
          apiVersion: '2022-11-28'
        })
      });

      if (!testResponse.ok) {
        throw new Error(`Tool call failed: ${testResponse.status} ${testResponse.statusText}`);
      }

      const testData = await testResponse.json();
      
      if (testData.error) {
        throw new Error(`Tool call error: ${testData.error.message}`);
      }

      // Parse the MCP response format
      let userData = null;
      if (testData.result?.content && testData.result.content.length > 0) {
        const contentText = testData.result.content[0].text;
        try {
          userData = JSON.parse(contentText);
        } catch (parseError) {
          console.warn('Failed to parse MCP response:', parseError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'GitHub MCP server connection successful',
        details: {
          sessionId: sessionId,
          availableTools: toolNames.length,
          sampleTools: toolNames.slice(0, 5), // Show first 5 tools
          testResult: {
            userLogin: userData?.login || 'unknown',
            userName: userData?.details?.name || 'unknown',
            userEmail: userData?.email || 'not provided',
            publicRepos: userData?.details?.public_repos || 0,
            followers: userData?.details?.followers || 0
          }
        }
      });

    } catch (mcpError) {
      return NextResponse.json({
        success: false,
        message: 'GitHub MCP server test failed',
        error: mcpError instanceof Error ? mcpError.message : 'Unknown MCP error',
        details: {
          tokenConfigured: true,
          tokenFormat: 'valid'
        }
      });
    }

  } catch (error) {
    console.error('Error testing GitHub MCP server:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to test GitHub MCP server',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
