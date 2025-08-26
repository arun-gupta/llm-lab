import { NextRequest, NextResponse } from 'next/server';
import { factChecker } from '@/lib/fact-checker';

export async function POST(request: NextRequest) {
  try {
    const { response, prompt } = await request.json();
    
    if (!response || !prompt) {
      return NextResponse.json(
        { error: 'Response and prompt are required' },
        { status: 400 }
      );
    }

    const factCheckResult = await factChecker.checkAccuracy(response, prompt);
    
    return NextResponse.json(factCheckResult);
  } catch (error) {
    console.error('Fact-checking error:', error);
    return NextResponse.json(
      { error: 'Failed to perform fact-checking' },
      { status: 500 }
    );
  }
}
