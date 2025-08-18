import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'config', 'token-limits.json');

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

// Load token limits from file
const loadTokenLimits = () => {
  try {
    ensureConfigDir();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading token limits:', error);
  }
  
  // Return defaults if file doesn't exist or error
  return {
    gpt5Streaming: 2000,
    gpt5NonStreaming: 500,
    otherModels: 1000
  };
};

// Save token limits to file
const saveTokenLimits = (limits: any) => {
  try {
    ensureConfigDir();
    fs.writeFileSync(configPath, JSON.stringify(limits, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving token limits:', error);
    return false;
  }
};

export async function GET() {
  try {
    const limits = loadTokenLimits();
    return NextResponse.json(limits);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load token limits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const limits = await request.json();
    
    // Validate limits
    const validatedLimits = {
      gpt5Streaming: Math.max(100, Math.min(4000, limits.gpt5Streaming || 2000)),
      gpt5NonStreaming: Math.max(50, Math.min(2000, limits.gpt5NonStreaming || 500)),
      otherModels: Math.max(100, Math.min(4000, limits.otherModels || 1000))
    };
    
    if (saveTokenLimits(validatedLimits)) {
      return NextResponse.json(validatedLimits);
    } else {
      return NextResponse.json(
        { error: 'Failed to save token limits' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token limits data' },
      { status: 400 }
    );
  }
}
