import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const mcpDir = path.join(process.env.HOME || '', '.mcp-servers');
    const startScriptPath = path.join(mcpDir, 'start-mcp-servers.sh');

    // Check if MCP directory and start script exist
    const fs = require('fs');
    if (!fs.existsSync(mcpDir)) {
      return NextResponse.json(
        { error: 'MCP servers not installed. Please run ./setup-mcp.sh first.' },
        { status: 404 }
      );
    }

    if (!fs.existsSync(startScriptPath)) {
      return NextResponse.json(
        { error: 'MCP start script not found. Please run ./setup-mcp.sh first.' },
        { status: 404 }
      );
    }

    // Execute the start script
    const { stdout, stderr } = await execAsync(`bash "${startScriptPath}"`, {
      cwd: mcpDir,
      timeout: 30000 // 30 second timeout
    });

    if (stderr && !stderr.includes('nohup')) {
      console.error('MCP start script stderr:', stderr);
    }

    console.log('MCP start script output:', stdout);

    return NextResponse.json({
      success: true,
      message: 'MCP servers started successfully',
      output: stdout
    });

  } catch (error: any) {
    console.error('Error starting MCP servers:', error);
    
    // Check if it's a timeout error
    if (error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Timeout starting MCP servers. Please check if they are already running.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start MCP servers', details: error.message },
      { status: 500 }
    );
  }
}
