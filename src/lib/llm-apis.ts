import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMResponse {
  provider: string;
  content: string;
  latency: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  error?: string;
}

export interface LLMRequest {
  prompt: string;
  context?: string;
  providers: string[];
  models?: Record<string, string>;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  cost: 'low' | 'medium' | 'high';
}

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  size_vram: number;
  expires_at: string;
}

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callOpenAI(prompt: string, context?: string, model: string = 'gpt-4o-mini'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      max_tokens: 1000,
    });

    const latency = Date.now() - startTime;
    
    return {
      provider: `OpenAI (${model})`,
      content: response.choices[0]?.message?.content || 'No response received',
      latency,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    return {
      provider: `OpenAI (${model})`,
      content: '',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function callAnthropic(prompt: string, context?: string, model: string = 'claude-3-haiku-20240307'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });

    const latency = Date.now() - startTime;
    
    return {
      provider: `Anthropic (${model})`,
      content: response.content[0]?.type === 'text' ? response.content[0].text : 'No response received',
      latency,
      tokens: {
        prompt: response.usage?.input_tokens || 0,
        completion: response.usage?.output_tokens || 0,
        total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  } catch (error) {
    return {
      provider: `Anthropic (${model})`,
      content: '',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Ollama integration - get only running models
export async function getOllamaModels(): Promise<OllamaModel[]> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/ps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ollama not available');
    }

    const data = await response.json();
    console.log('Ollama /api/ps response:', data); // Debug log
    
    // The /api/ps endpoint returns running models in data.models array
    // Each model has: name, model, size, size_vram, expires_at
    return data.models || [];
  } catch (error) {
    console.log('Ollama not available:', error);
    return [];
  }
}

export async function callOllama(prompt: string, model: string, context?: string): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: fullPrompt,
        stream: false,
        options: {
          num_predict: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    
    return {
      provider: `Ollama (${model})`,
      content: data.response || 'No response received',
      latency,
      tokens: {
        prompt: data.prompt_eval_count || 0,
        completion: data.eval_count || 0,
        total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  } catch (error) {
    return {
      provider: `Ollama (${model})`,
      content: '',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function callAllProviders(request: LLMRequest): Promise<LLMResponse[]> {
  const promises: Promise<LLMResponse>[] = [];
  
  for (const provider of request.providers) {
    if (provider.startsWith('openai:')) {
      const model = provider.replace('openai:', '');
      promises.push(callOpenAI(request.prompt, request.context, model));
    } else if (provider.startsWith('anthropic:')) {
      const model = provider.replace('anthropic:', '');
      promises.push(callAnthropic(request.prompt, request.context, model));
    } else if (provider.startsWith('ollama:')) {
      const modelName = provider.replace('ollama:', '');
      promises.push(callOllama(request.prompt, modelName, request.context));
    }
  }
  
  return Promise.all(promises);
} 