import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
  try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return NextResponse.json({
        openai: '',
        anthropic: '',
        postman: ''
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
      postman: keys.POSTMAN_API_KEY || ''
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
    const { openai, anthropic, postman } = await request.json();

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

    if (postman && !postman.startsWith('PMAK-')) {
      return NextResponse.json(
        { error: 'Invalid Postman API key format' },
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
    if (postman) envVars.POSTMAN_API_KEY = postman;

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
