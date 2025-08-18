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
  truncationWarning?: string;
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

// Load token limits from config
const loadTokenLimits = () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'config', 'token-limits.json');
    
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Using default token limits');
  }
  
  // Return defaults if file doesn't exist or error
  return {
    gpt5Streaming: 2000,
    gpt5NonStreaming: 500,
    otherModels: 1000
  };
};

export async function callOpenAI(prompt: string, context?: string, model: string = 'gpt-5-mini'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    // Add timeout to individual provider calls - increased for Codespaces and GPT-5 models
    const baseTimeoutMs = process.env.CODESPACES ? 45000 : 20000; // 45 seconds for Codespaces, 20 for local
    const timeoutMs = model.startsWith('gpt-5') ? 60000 : baseTimeoutMs; // 60 seconds for GPT-5 models
    
    // Use max_completion_tokens for GPT-5 models, max_tokens for others
    const tokenParam = model.startsWith('gpt-5') ? 'max_completion_tokens' : 'max_tokens';
    
    const tokenLimits = loadTokenLimits();
    const tokenLimit = model.startsWith('gpt-5') ? tokenLimits.gpt5NonStreaming : tokenLimits.otherModels;
    
    console.log('=== OpenAI Debug ===');
    console.log('Model:', model);
    console.log('Token parameter:', tokenParam);
    console.log('Token limit:', tokenLimit);
    console.log('Token limits config:', tokenLimits);
    console.log('================================');
    
    const response = await Promise.race([
      openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        [tokenParam]: tokenLimit,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI request timeout')), timeoutMs)
      )
    ]) as any;

    const latency = Date.now() - startTime;
    
    const content = response.choices?.[0]?.message?.content;
    
    // Debug: Log the raw response to see what's actually being returned
    console.log('=== Raw OpenAI Response Debug ===');
    console.log('Full response object:', JSON.stringify(response, null, 2));
    console.log('Choices array:', response.choices);
    console.log('First choice:', response.choices?.[0]);
    console.log('Message object:', response.choices?.[0]?.message);
    console.log('Raw content:', response.choices?.[0]?.message?.content);
    console.log('Content type:', typeof response.choices?.[0]?.message?.content);
    console.log('Content length:', response.choices?.[0]?.message?.content?.length);
    console.log('==================================');
    
    return {
      provider: `OpenAI (${model})`,
      content: content || (response.choices?.[0]?.finish_reason === 'length' ? 
        'Response was cut off due to token limit. Try a shorter prompt or increase the token limit for longer responses.' : 
        'No response received'),
      latency,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.log('=== OpenAI Error Debug ===');
    console.log('Error occurred in callOpenAI:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.log('================================');
    
    return {
      provider: `OpenAI (${model})`,
      content: 'No response received',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function callOpenAIStreaming(prompt: string, context?: string, model: string = 'gpt-5-mini'): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    // Add timeout to individual provider calls - increased for Codespaces and GPT-5 models
    const baseTimeoutMs = process.env.CODESPACES ? 45000 : 20000; // 45 seconds for Codespaces, 20 for local
    const timeoutMs = model.startsWith('gpt-5') ? 60000 : baseTimeoutMs; // 60 seconds for GPT-5 models
    
    // Use max_completion_tokens for GPT-5 models, max_tokens for others
    const tokenParam = model.startsWith('gpt-5') ? 'max_completion_tokens' : 'max_tokens';
    
    const tokenLimits = loadTokenLimits();
    // Use higher token limits for nano to account for its different streaming behavior
    let tokenLimit = tokenLimits.gpt5Streaming;
    if (model === 'gpt-5-nano') {
      tokenLimit = Math.max(tokenLimit, 1500); // Higher limit for nano (1500-2000 range)
    }
    
    console.log('=== GPT-5 Streaming Debug ===');
    console.log('Using streaming for GPT-5 model:', model);
    console.log('Token parameter:', tokenParam);
    console.log('Token limit:', tokenLimit);
    console.log('Token limits config:', tokenLimits);
    console.log('Model type:', model === 'gpt-5-nano' ? 'NANO' : model === 'gpt-5-mini' ? 'MINI' : 'OTHER');
    console.log('================================');
    
    const stream = await Promise.race([
      openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        [tokenParam]: tokenLimit, // Configurable token limit for GPT-5
        stream: true, // Enable streaming
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI streaming request timeout')), timeoutMs)
      )
    ]) as any;

    let content = '';
    let totalTokens = 0;
    
    // Collect all chunks from the stream - improved for nano's streaming behavior
    let chunkCount = 0;
    let hasContent = false;
    let finishReason = null;
    
    for await (const chunk of stream) {
      chunkCount++;
      const delta = chunk.choices[0]?.delta?.content;
      finishReason = chunk.choices[0]?.finish_reason;
      
      // Log every chunk for debugging
      console.log(`Chunk ${chunkCount}:`, {
        delta: delta ? `${delta.length} chars` : 'null',
        finish_reason: finishReason,
        hasContent: !!delta
      });
      
      if (delta) {
        content += delta;
        hasContent = true;
        console.log(`Chunk ${chunkCount}: Received "${delta}"`);
      }
      
      // Track token usage if available
      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens || totalTokens;
      }
      
      // For nano, also check finish_reason to see if it's hitting length limit
      if (finishReason === 'length') {
        console.log(`Model ${model} hit length limit at chunk ${chunkCount}`);
      }
    }
    
    console.log(`Total chunks received: ${chunkCount}`);
    console.log(`Final content length: ${content.length}`);
    console.log(`Has content: ${hasContent}`);
    console.log(`Finish reason: ${finishReason}`);

    const latency = Date.now() - startTime;
    
    console.log('=== GPT-5 Streaming Results ===');
    console.log('Final content length:', content.length);
    console.log('Content preview:', content.substring(0, 200) + '...');
    console.log('Total tokens used:', totalTokens);
    console.log('================================');
    
    return {
      provider: `OpenAI (${model})`,
      content: content || (finishReason === 'length' && !hasContent ? 
        'Response was cut off due to token limit. Try increasing the token limit for GPT-5 nano.' : 
        'No response received'),
      latency,
      tokens: {
        prompt: 0, // We don't have exact breakdown in streaming
        completion: totalTokens,
        total: totalTokens,
      },
      // Add truncation warning if content seems incomplete
      truncationWarning: content && content.length > 0 && totalTokens >= 1400 ? 
        'Response may be truncated. Consider increasing token limit or using a shorter prompt for complete responses.' : undefined
    };
  } catch (error) {
    console.log('=== GPT-5 Streaming Error ===');
    console.log('Error occurred in callOpenAIStreaming:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.log('================================');
    
    return {
      provider: `OpenAI (${model})`,
      content: 'No response received',
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
  console.log('=== callAllProviders Debug ===');
  console.log('Request providers:', request.providers);
  console.log('Request prompt:', request.prompt);
  
  const promises: Promise<LLMResponse>[] = [];
  
  for (const provider of request.providers) {
    console.log('Processing provider:', provider);
    if (provider.startsWith('openai:')) {
      const model = provider.replace('openai:', '');
      console.log('Calling OpenAI with model:', model);
      if (model.startsWith('gpt-5')) {
        console.log('Calling GPT-5 with streaming approach');
        promises.push(callOpenAIStreaming(request.prompt, request.context, model));
      } else {
        promises.push(callOpenAI(request.prompt, request.context, model));
      }
    } else if (provider.startsWith('anthropic:')) {
      const model = provider.replace('anthropic:', '');
      console.log('Calling Anthropic with model:', model);
      promises.push(callAnthropic(request.prompt, request.context, model));
    } else if (provider.startsWith('ollama:')) {
      const modelName = provider.replace('ollama:', '');
      console.log('Calling Ollama with model:', modelName);
      promises.push(callOllama(request.prompt, modelName, request.context));
    }
  }
  
  // Use Promise.allSettled with timeout to handle slow providers gracefully
  // Increase timeout if any GPT-5 models are being used
  const hasGPT5 = request.providers.some(p => p.includes('gpt-5'));
  const baseTimeoutMs = process.env.CODESPACES ? 60000 : 25000; // 60 seconds for Codespaces, 25 for local
  const timeoutMs = hasGPT5 ? 90000 : baseTimeoutMs; // 90 seconds if GPT-5 is involved
  
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