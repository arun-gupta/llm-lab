import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  try {
    // Check if Ollama is running locally
    let ollamaStatus = 'missing';
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (ollamaResponse.ok) {
        ollamaStatus = 'configured';
      }
    } catch (error) {
      // Ollama is not running or not accessible
      ollamaStatus = 'missing';
    }

    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        openai: '',
        anthropic: '',
        ollama: ollamaStatus,
        github: ''
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

    return NextResponse.json({
      openai: keys.OPENAI_API_KEY || '',
      anthropic: keys.ANTHROPIC_API_KEY || '',
      ollama: ollamaStatus,
      github: keys.GITHUB_TOKEN || ''
    });
  } catch (error) {
    console.error('Error reading API keys:', error);
    return NextResponse.json(
      { error: 'Failed to read API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { openai, anthropic, github } = await request.json();

    // Validate API key formats
    if (openai && !openai.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      );
    }

    if (anthropic && !anthropic.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'Invalid Anthropic API key format' },
        { status: 400 }
      );
    }



    if (github && !github.startsWith('ghp_') && !github.startsWith('github_pat_')) {
      return NextResponse.json(
        { error: 'Invalid GitHub token format. Should start with ghp_ or github_pat_' },
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
    if (openai) envVars.OPENAI_API_KEY = openai;
    if (anthropic) envVars.ANTHROPIC_API_KEY = anthropic;
    if (github) envVars.GITHUB_TOKEN = github;

    // Remove empty values
    Object.keys(envVars).forEach(key => {
      if (!envVars[key]) {
        delete envVars[key];
      }
    });

    // Write back to .env.local
    const newContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(ENV_FILE_PATH, newContent);

    return NextResponse.json({ 
      success: true,
      message: 'API keys saved successfully'
    });
  } catch (error) {
    console.error('Error saving API keys:', error);
    return NextResponse.json(
      { error: 'Failed to save API keys' },
      { status: 500 }
    );
  }
}
