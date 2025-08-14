import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        token: '',
        configured: false,
        message: 'No .env.local file found'
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

    const githubToken = keys.GITHUB_TOKEN || '';
    const isConfigured = githubToken && 
      (githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_')) &&
      githubToken !== 'your_github_personal_access_token_here';

    return NextResponse.json({
      token: isConfigured ? githubToken : '',
      configured: isConfigured,
      message: isConfigured ? 'GitHub token is configured' : 'GitHub token not configured or invalid'
    });
  } catch (error) {
    console.error('Error reading GitHub token:', error);
    return NextResponse.json(
      { 
        token: '',
        configured: false,
        message: 'Failed to read GitHub token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
