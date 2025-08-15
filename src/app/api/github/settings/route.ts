import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        reposCount: 3
      });
    }

    // Read the .env.local file
    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    
    // Parse the environment variables
    const keys: { [key: string]: string } = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        keys[key.trim()] = value.trim();
      }
    });

    const reposCount = parseInt(keys.GITHUB_REPOS_COUNT || '3');

    return NextResponse.json({
      reposCount: reposCount
    });
  } catch (error) {
    console.error('Error reading GitHub settings:', error);
    return NextResponse.json(
      { 
        reposCount: 3,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reposCount } = await request.json();

    // Validate repos count
    if (typeof reposCount !== 'number' || reposCount < 1 || reposCount > 100) {
      return NextResponse.json(
        { error: 'Invalid repos count. Must be between 1 and 100.' },
        { status: 400 }
      );
    }

    // Read existing .env.local file if it exists
    let existingContent = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      existingContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
    }

    // Parse existing content
    const lines = existingContent.split('\n');
    const envVars: { [key: string]: string } = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });

    // Update with new values
    envVars.GITHUB_REPOS_COUNT = reposCount.toString();

    // Reconstruct .env.local content
    const newContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write back to .env.local
    fs.writeFileSync(ENV_FILE_PATH, newContent);

    return NextResponse.json({
      success: true,
      reposCount: reposCount,
      message: 'GitHub settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving GitHub settings:', error);
    return NextResponse.json(
      { error: 'Failed to save GitHub settings' },
      { status: 500 }
    );
  }
}
