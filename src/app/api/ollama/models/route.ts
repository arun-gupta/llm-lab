import { NextResponse } from 'next/server';
import { getOllamaModels } from '@/lib/llm-apis';

export async function GET() {
  try {
    const models = await getOllamaModels();
    console.log('API endpoint returning models:', models);
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Ollama models', models: [] },
      { status: 500 }
    );
  }
}