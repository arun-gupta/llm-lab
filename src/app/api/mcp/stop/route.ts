import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const mcpDir = path.join(process.env.HOME || '', '.mcp-servers');
    const stopScriptPath = path.join(mcpDir, 'stop-mcp-servers.sh');

    // Check if MCP directory and stop script exist
    const fs = require('fs');
    if (!fs.existsSync(mcpDir)) {
      return NextResponse.json(
        { error: 'MCP servers not installed. Please run npm run setup-mcp first.' },
        { status: 404 }
      );
    }

    if (!fs.existsSync(stopScriptPath)) {
      return NextResponse.json(
        { error: 'MCP stop script not found. Please run npm run setup-mcp first.' },
        { status: 404 }
      );
    }

    // Execute the stop script
    const { stdout, stderr } = await execAsync(`bash "${stopScriptPath}"`, {
      cwd: mcpDir,
      timeout: 15000 // 15 second timeout
    });

    if (stderr && !stderr.includes('No such process')) {
      console.error('MCP stop script stderr:', stderr);
    }

    console.log('MCP stop script output:', stdout);

    // Stop SQLite MCP Docker container
    try {
      const dockerOutput = await execAsync('docker stop sqlite-mcp-server', {
        timeout: 10000 // 10 second timeout
      });
      console.log('SQLite MCP Docker container stopped:', dockerOutput.stdout);
    } catch (dockerError: any) {
      if (dockerError.message.includes('No such container')) {
        console.log('SQLite MCP Docker container not running');
      } else {
        console.error('Error stopping SQLite MCP Docker container:', dockerError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'MCP servers stopped successfully',
      output: stdout
    });

  } catch (error: any) {
    console.error('Error stopping MCP servers:', error);
    
    // Check if it's a timeout error
    if (error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Timeout stopping MCP servers. Please check if they are running.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to stop MCP servers', details: error.message },
      { status: 500 }
    );
  }
}
