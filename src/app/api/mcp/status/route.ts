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
        name: 'filesystem', 
        port: portConfig.mcp.filesystem, 
        pidFile: 'http-filesystem-mcp-server.pid',
        displayName: 'Filesystem MCP',
        description: 'Official MCP server with HTTP wrapper for Postman integration',
        docker: false
      },
      { 
        name: 'sqlite', 
        port: portConfig.mcp.sqlite, 
        pidFile: null,
        displayName: 'SQLite MCP',
        description: 'Database operations with Docker HTTP mode for Postman integration',
        docker: true
      }
    ];

    const statusData: Record<number, ServerStatus> = {};

    for (const server of servers) {
      try {
        if (server.docker) {
          // Check Docker container status
          try {
            // Check if Docker container is running and listening on the port
            await execAsync(`docker ps --filter "publish=${server.port}" --format "{{.Names}}"`);
            await execAsync(`lsof -i :${server.port} | grep LISTEN`);
            
            statusData[server.port] = {
              status: 'running',
              port: server.port,
              name: server.displayName,
              description: server.description
            };
          } catch (dockerError) {
            // Docker container not running or port not listening
            statusData[server.port] = {
              status: 'stopped',
              port: server.port,
              name: server.displayName,
              description: server.description
            };
          }
        } else {
          // Check local process status
          const pidFilePath = path.join(mcpDir, server.pidFile);
          
          // First check if port is listening (most reliable indicator)
          try {
            await execAsync(`lsof -i :${server.port} | grep LISTEN`);
            
            // Port is listening, now check PID file
            if (fs.existsSync(pidFilePath)) {
              const pid = parseInt(fs.readFileSync(pidFilePath, 'utf8').trim());
              
              // Verify the process is still running
              try {
                await execAsync(`kill -0 ${pid}`);
                statusData[server.port] = {
                  status: 'running',
                  pid,
                  port: server.port,
                  name: server.displayName,
                  description: server.description
                };
              } catch (processError) {
                // Process not running, but port is listening - create new PID file
                try {
                  const portOutput = await execAsync(`lsof -i :${server.port} | grep LISTEN`);
                  const lines = portOutput.stdout.trim().split('\n');
                  if (lines.length > 0) {
                    const parts = lines[0].split(/\s+/);
                    const newPid = parseInt(parts[1]);
                    fs.writeFileSync(pidFilePath, newPid.toString());
                    statusData[server.port] = {
                      status: 'running',
                      pid: newPid,
                      port: server.port,
                      name: server.displayName,
                      description: server.description
                    };
                  }
                } catch (pidError) {
                  // Fallback to running without PID
                  statusData[server.port] = {
                    status: 'running',
                    port: server.port,
                    name: server.displayName,
                    description: server.description
                  };
                }
              }
            } else {
              // PID file doesn't exist but port is listening - create PID file
              try {
                const portOutput = await execAsync(`lsof -i :${server.port} | grep LISTEN`);
                const lines = portOutput.stdout.trim().split('\n');
                if (lines.length > 0) {
                  const parts = lines[0].split(/\s+/);
                  const newPid = parseInt(parts[1]);
                  fs.writeFileSync(pidFilePath, newPid.toString());
                  statusData[server.port] = {
                    status: 'running',
                    pid: newPid,
                    port: server.port,
                    name: server.displayName,
                    description: server.description
                  };
                }
              } catch (pidError) {
                // Fallback to running without PID
                statusData[server.port] = {
                  status: 'running',
                  port: server.port,
                  name: server.displayName,
                  description: server.description
                };
              }
            }
          } catch (portError) {
            // Port not listening, check if PID file exists but process is dead
            if (fs.existsSync(pidFilePath)) {
              const pid = parseInt(fs.readFileSync(pidFilePath, 'utf8').trim());
              try {
                await execAsync(`kill -0 ${pid}`);
                // Process exists but port not listening
                statusData[server.port] = {
                  status: 'error',
                  pid,
                  port: server.port,
                  name: server.displayName,
                  description: server.description
                };
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
          }
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
