import { NextRequest, NextResponse } from 'next/server';
import { callAllProviders, LLMRequest } from '@/lib/llm-apis';

export async function POST(request: NextRequest) {
  try {
    const body: LLMRequest = await request.json();
    
    // Validate request
    if (!body.prompt || !body.providers || body.providers.length === 0) {
      return NextResponse.json(
        { error: 'Prompt and at least one provider are required' },
        { status: 400 }
      );
    }

    // Call all selected providers
    const responses = await callAllProviders(body);
    
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error processing LLM request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 