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

export async function callOpenAI(prompt: string, context?: string, model: string = 'gpt-5-mini'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    // Add timeout to individual provider calls - increased for Codespaces
    const timeoutMs = process.env.CODESPACES ? 45000 : 20000; // 45 seconds for Codespaces, 20 for local
    
    // Use max_completion_tokens for GPT-5 models, max_tokens for others
    const tokenParam = model.startsWith('gpt-5') ? 'max_completion_tokens' : 'max_tokens';
    
    const response = await Promise.race([
      openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        [tokenParam]: 1000,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI request timeout')), timeoutMs)
      )
    ]) as any;

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

export async function callAnthropic(prompt: string, context?: string, model: string = 'claude-3-5-haiku-20241022'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    // Add timeout to individual provider calls - increased for Codespaces
    const timeoutMs = process.env.CODESPACES ? 45000 : 20000; // 45 seconds for Codespaces, 20 for local
    
    const response = await Promise.race([
      anthropic.messages.create({
        model: model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Anthropic request timeout')), timeoutMs)
      )
    ]) as any;

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
    
    // Add timeout to individual provider calls - increased for Codespaces
    const timeoutMs = process.env.CODESPACES ? 45000 : 20000; // 45 seconds for Codespaces, 20 for local
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
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
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

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
  
  // Use Promise.allSettled with timeout to handle slow providers gracefully
  const timeoutMs = process.env.CODESPACES ? 60000 : 25000; // 60 seconds for Codespaces, 25 for local
  
  const timeoutPromise = new Promise<LLMResponse[]>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  const providersPromise = Promise.allSettled(promises).then(results => {
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Return error response for failed providers
        const provider = request.providers[index];
        return {
          provider: provider.includes(':') ? provider.split(':')[1] : provider,
          content: '',
          latency: 0,
          error: `Provider timeout or error: ${result.reason?.message || 'Unknown error'}`,
        };
      }
    });
  });
  
  return Promise.race([providersPromise, timeoutPromise]);
} 