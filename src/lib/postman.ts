export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: PostmanHeader[];
    body?: {
      mode: string;
      raw: string;
      options?: {
        raw: {
          language: string;
        };
      };
    };
    url: {
      raw: string;
      protocol: string;
      host: string[];
      path: string[];
    };
  };
}

export interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

export function generatePostmanCollection(
  prompt: string,
  context?: string,
  responses?: any[]
): PostmanCollection {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const collection: PostmanCollection = {
    info: {
      name: 'LLM API Explorer Collection',
      description: `Generated collection for prompt: "${prompt}"`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'LLM API Explorer - All Providers',
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text',
            },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              prompt,
              context,
              providers: ['openai', 'anthropic', 'cohere', 'mistral'],
            }, null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          },
          url: {
            raw: `${baseUrl}/api/llm`,
            protocol: 'http',
            host: ['localhost'],
            path: ['api', 'llm'],
          },
        },
      },
    ],
  };

  // Add individual provider examples if responses are provided
  if (responses) {
    responses.forEach((response) => {
      if (response.provider) {
        collection.item.push({
          name: `${response.provider} - Direct API Call`,
          request: {
            method: 'POST',
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text',
              },
              {
                key: 'Authorization',
                value: `Bearer {{${response.provider.toLowerCase()}_api_key}}`,
                type: 'text',
              },
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                messages: [
                  {
                    role: 'user',
                    content: context ? `${context}\n\n${prompt}` : prompt,
                  },
                ],
                max_tokens: 1000,
              }, null, 2),
              options: {
                raw: {
                  language: 'json',
                },
              },
            },
            url: {
              raw: getProviderUrl(response.provider),
              protocol: 'https',
              host: [getProviderHost(response.provider)],
              path: getProviderPath(response.provider),
            },
          },
        });
      }
    });
  }

  return collection;
}

function getProviderUrl(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'cohere':
      return 'https://api.cohere.ai/v1/generate';
    case 'mistral':
      return 'https://api.mistral.ai/v1/chat/completions';
    default:
      return 'https://api.openai.com/v1/chat/completions';
  }
}

function getProviderHost(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'api.openai.com';
    case 'anthropic':
      return 'api.anthropic.com';
    case 'cohere':
      return 'api.cohere.ai';
    case 'mistral':
      return 'api.mistral.ai';
    default:
      return 'api.openai.com';
  }
}

function getProviderPath(provider: string): string[] {
  switch (provider.toLowerCase()) {
    case 'openai':
      return ['v1', 'chat', 'completions'];
    case 'anthropic':
      return ['v1', 'messages'];
    case 'cohere':
      return ['v1', 'generate'];
    case 'mistral':
      return ['v1', 'chat', 'completions'];
    default:
      return ['v1', 'chat', 'completions'];
  }
}

export async function createPostmanCollection(collection: PostmanCollection): Promise<string | null> {
  const postmanApiKey = process.env.POSTMAN_API_KEY;
  
  if (!postmanApiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.getpostman.com/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': postmanApiKey,
      },
      body: JSON.stringify({
        collection: collection,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.collection?.uid || null;
    }
  } catch (error) {
    console.error('Error creating Postman collection:', error);
  }

  return null;
} 