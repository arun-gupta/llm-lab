import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { loadPortConfig } from '@/lib/port-config';

const execAsync = promisify(exec);

interface ServerStatus {
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  port: number;
  name: string;
  description: string;
}

export async function GET() {
  try {
    const mcpDir = path.join(process.env.HOME || '', '.mcp-servers');
    const portConfig = loadPortConfig();
    
    const servers = [
      { 
        name: 'template', 
        port: portConfig.mcp.sqlite, 
        pidFile: 'mcp-server.pid',
        displayName: 'Local MCP Server Template',
        description: 'Basic MCP server template for testing'
      },
      { 
        name: 'filesystem', 
        port: portConfig.mcp.filesystem, 
        pidFile: 'http-filesystem-mcp-server.pid',
        displayName: 'Filesystem MCP Server',
        description: 'File and directory operations with HTTP wrapper for Postman integration'
      }
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
                port: server.port,
                name: server.displayName,
                description: server.description
              };
            } catch (portError) {
              // Process exists but port not listening
              statusData[server.port] = {
                status: 'error',
                pid,
                port: server.port,
                name: server.displayName,
                description: server.description
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
              port: server.port,
              name: server.displayName,
              description: server.description
            };
          }
        } else {
          statusData[server.port] = {
            status: 'stopped',
            port: server.port,
            name: server.displayName,
            description: server.description
          };
        }
      } catch (error) {
        statusData[server.port] = {
          status: 'error',
          port: server.port,
          name: server.displayName,
          description: server.description
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
