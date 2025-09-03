import { NextRequest, NextResponse } from 'next/server';
import { callAllProviders, LLMRequest } from '@/lib/llm-apis';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log the raw request
    const rawBody = await request.text();
    console.log('=== LLM API Debug ===');
    console.log('Raw request body:', rawBody);
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body at position 106:', rawBody.charAt(106));
    console.log('Raw body as hex:', rawBody.split('').map((c, i) => i >= 100 && i <= 110 ? `${i}:${c.charCodeAt(0).toString(16)}` : '').filter(Boolean).join(', '));
    console.log('========================');
    
    // Try to parse the JSON
    let body: LLMRequest;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error details:', parseError);
      console.error('Failed to parse body:', rawBody);
      return NextResponse.json(
        { error: `JSON parsing failed: ${parseError.message}`, rawBody: rawBody.substring(0, 200) },
        { status: 400 }
      );
    }
    
    // Validate request
    if (!body.prompt || !body.providers || body.providers.length === 0) {
      return NextResponse.json(
        { error: 'Prompt and at least one provider are required' },
        { status: 400 }
      );
    }

    // Call all selected providers
    const responses = await callAllProviders(body);
    
    // Debug logging to see what's being sent to frontend
    console.log('=== API Route Response Debug ===');
    console.log('Sending responses to frontend:', JSON.stringify(responses, null, 2));
    console.log('Response count:', responses.length);
    responses.forEach((resp, index) => {
      console.log(`Response ${index}:`, {
        provider: resp.provider,
        contentLength: resp.content?.length,
        contentPreview: resp.content?.substring(0, 100) + '...',
        hasError: !!resp.error,
        fullContent: resp.content
      });
    });
    console.log('================================');
    
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error processing LLM request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 