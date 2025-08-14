import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface ServerStatus {
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  port: number;
}

export async function GET() {
  try {
    const mcpDir = path.join(process.env.HOME || '', '.mcp-servers');
    const servers = [
      { name: 'github', port: 3001, pidFile: 'github-mcp.pid' },
      { name: 'filesystem', port: 3002, pidFile: 'filesystem-mcp.pid' },
      { name: 'websearch', port: 3003, pidFile: 'web-search-mcp.pid' },
      { name: 'database', port: 3004, pidFile: 'database-mcp.pid' }
    ];

    const statusData: Record<number, ServerStatus> = {};

    for (const server of servers) {
      const pidFilePath = path.join(mcpDir, server.pidFile);
      
      try {
        // Check if PID file exists
        if (fs.existsSync(pidFilePath)) {
          const pid = parseInt(fs.readFileSync(pidFilePath, 'utf8').trim());
          
          // Check if process is running
          try {
            await execAsync(`kill -0 ${pid}`);
            
            // Check if port is actually listening
            try {
              await execAsync(`lsof -i :${server.port} | grep LISTEN`);
              statusData[server.port] = {
                status: 'running',
                pid,
                port: server.port
              };
            } catch (portError) {
              // Process exists but port not listening
              statusData[server.port] = {
                status: 'error',
                pid,
                port: server.port
              };
            }
          } catch (processError) {
            // Process not running, remove stale PID file
            try {
              fs.unlinkSync(pidFilePath);
            } catch (unlinkError) {
              // Ignore unlink errors
            }
            statusData[server.port] = {
              status: 'stopped',
              port: server.port
            };
          }
        } else {
          statusData[server.port] = {
            status: 'stopped',
            port: server.port
          };
        }
      } catch (error) {
        statusData[server.port] = {
          status: 'error',
          port: server.port
        };
      }
    }

    return NextResponse.json(statusData);
  } catch (error) {
    console.error('Error checking MCP server status:', error);
    return NextResponse.json(
      { error: 'Failed to check MCP server status' },
      { status: 500 }
    );
  }
}
