export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanItem[];
}

export interface PostmanEnvironment {
  id: string;
  name: string;
  values: {
    key: string;
    value: string;
    type: string;
    enabled: boolean;
  }[];
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
      port?: string;
      path: string[];
    };
  };
  event?: {
    listen: string;
    script: {
      exec: string[];
    };
  }[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

export function generatePostmanCollection(
  prompt: string,
  context?: string,
  responses?: any[],
  collectionName?: string
): PostmanCollection {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Parse the base URL to get protocol, host, and port
  const url = new URL(baseUrl);
  const protocol = url.protocol.replace(':', '');
  const host = url.hostname;
  const port = url.port || '3000'; // Default to 3000 if no port specified
  
  // Use the actual hostname for the environment
  // In Codespaces, this will be the Codespaces hostname
  // In local development, this will be localhost or 127.0.0.1
  const hostForPostman = host;
  
  // Get the actual providers from responses, or use default implemented ones
  const availableProviders = responses 
    ? responses.map(response => {
        const isOllama = response.provider.startsWith('ollama:') || response.provider.startsWith('Ollama (');
        if (isOllama) {
          return response.provider.startsWith('ollama:') 
            ? response.provider 
            : `ollama:${response.provider.match(/Ollama \((.+)\)/)?.[1] || ''}`;
        }
        return response.provider.toLowerCase().includes('openai') ? 'openai' : 'anthropic';
      })
    : ['openai', 'anthropic']; // Default to implemented providers only
  
  const collection: PostmanCollection = {
    info: {
      name: collectionName || 'LLM Prompt Lab Collection',
      description: `Generated collection for prompt: "${prompt}"

🔑 CRITICAL: API KEY SETUP REQUIRED BEFORE USING

STEP 1: Download Environment File
• Download the environment file from the collection preview
• This file contains placeholder values for your API keys

STEP 2: Import Environment in Postman
• In Postman, click "Import" (top left)
• Select the downloaded environment file
• The environment will appear in your Environments list

STEP 3: Select Environment
• In the top-right corner of Postman, click the environment dropdown
• Select your imported environment (NOT "No environment")
• This is crucial - requests will fail without an environment selected

STEP 4: Add Your API Keys
• Go to Environments → Edit your imported environment
• Replace placeholder values with your actual API keys:
  - openai_api_key: Your OpenAI API key (starts with sk-)
  - anthropic_api_key: Your Anthropic API key (starts with sk-ant-)
  - postman_api_key: Your Postman API key (optional)
  - base_url: Already set correctly

💡 TIP: Copy API keys from LLM Prompt Lab Config Panel (gear icon in header)

⚠️ SECURITY: The downloaded environment file contains safe placeholder values only.

🚨 TROUBLESHOOTING: If you see "{{openai_api_key}}" in errors, make sure you've selected the environment in the top-right dropdown!`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'LLM Prompt Lab - All Providers',
        event: [
          {
            listen: 'prerequest',
            script: {
              exec: [
                '// Check if environment variables are properly set',
                'const openaiKey = pm.environment.get("openai_api_key");',
                'const anthropicKey = pm.environment.get("anthropic_api_key");',
                'const baseUrl = pm.environment.get("base_url");',
                '',
                '// Warn if environment is not set up',
                'if (!openaiKey || openaiKey === "your_openai_api_key_here") {',
                '    console.warn("⚠️ WARNING: OpenAI API key not set. Please:");',
                '    console.warn("1. Import the environment file");',
                '    console.warn("2. Select the environment in the top-right dropdown");',
                '    console.warn("3. Edit the environment and add your API keys");',
                '}',
                '',
                'if (!anthropicKey || anthropicKey === "your_anthropic_api_key_here") {',
                '    console.warn("⚠️ WARNING: Anthropic API key not set");',
                '}',
                '',
                'if (!baseUrl || baseUrl === "your_base_url_here") {',
                '    console.warn("⚠️ WARNING: Base URL not set");',
                '}',
                '',
                '// Set request variables',
                'const baseUrl = pm.environment.get("base_url");',
                'if (baseUrl && baseUrl !== "your_base_url_here") {',
                '    pm.request.url.raw = baseUrl + "/api/llm";',
                '}'
              ]
            }
          },
          {
            listen: 'test',
            script: {
              exec: [
                '// Test response status',
                'pm.test("Response is successful", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                '',
                '// Test response structure',
                'pm.test("Response has valid structure", function () {',
                '    const response = pm.response.json();',
                '    pm.expect(response).to.have.property("responses");',
                '    pm.expect(response.responses).to.be.an("array");',
                '    pm.expect(response.responses.length).to.be.greaterThan(0);',
                '});',
                '',
                '// Test each provider response',
                'pm.test("All provider responses are valid", function () {',
                '    const response = pm.response.json();',
                '    response.responses.forEach((resp, index) => {',
                '        pm.expect(resp).to.have.property("provider");',
                '        pm.expect(resp).to.have.property("content");',
                '        pm.expect(resp).to.have.property("latency");',
                '        pm.expect(resp.latency).to.be.a("number");',
                '        pm.expect(resp.latency).to.be.greaterThan(0);',
                '        pm.expect(resp.content).to.be.a("string");',
                '        pm.expect(resp.content.length).to.be.greaterThan(0);',
                '    });',
                '});',
                '',
                '// Performance test',
                'pm.test("Response time is reasonable", function () {',
                '    pm.expect(pm.response.responseTime).to.be.lessThan(25000); // 25 seconds',
                '});',
                '',
                '// Set collection variables for comparison',
                'const response = pm.response.json();',
                'if (response.responses && response.responses.length > 0) {',
                '    response.responses.forEach((resp, index) => {',
                '        pm.collectionVariables.set(`provider_${index + 1}`, resp.provider);',
                '        pm.collectionVariables.set(`latency_${index + 1}`, resp.latency.toString());',
                '        pm.collectionVariables.set(`content_${index + 1}`, resp.content.substring(0, 100));',
                '    });',
                '}'
              ]
            }
          }
        ],
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
              providers: availableProviders,
            }, null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          },
          url: {
            raw: `${baseUrl}/api/llm`,
            protocol: protocol,
            host: [hostForPostman],
            port: port,
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
        // Handle both original provider format (ollama:model) and formatted names (Ollama (model))
        const isOllama = response.provider.startsWith('ollama:') || response.provider.startsWith('Ollama (');
        const providerName = isOllama 
          ? response.provider.startsWith('ollama:') 
            ? response.provider.replace('ollama:', '')
            : response.provider.match(/Ollama \((.+)\)/)?.[1] || response.provider
          : response.provider;
        
        // Generate provider-specific test scripts
        const testScripts = generateProviderTestScripts(response.provider, isOllama);
        
        collection.item.push({
          name: `${response.provider} - Direct API Call`,
          event: [
            {
              listen: 'prerequest',
              script: {
                exec: [
                  '// Check if environment variables are properly set',
                  'const openaiKey = pm.environment.get("openai_api_key");',
                  'const anthropicKey = pm.environment.get("anthropic_api_key");',
                  '',
                  '// Get the request URL safely',
                  'const requestUrl = pm.request.url.raw || pm.request.url.toString() || "";',
                  '',
                  '// Provider-specific checks',
                  `if (requestUrl.includes("openai.com") && (!openaiKey || openaiKey === "your_openai_api_key_here")) {`,
                  '    console.warn("⚠️ WARNING: OpenAI API key not set for this request");',
                  '    console.warn("Please import the environment file and add your OpenAI API key");',
                  '}',
                  '',
                  `if (requestUrl.includes("anthropic.com") && (!anthropicKey || anthropicKey === "your_anthropic_api_key_here")) {`,
                  '    console.warn("⚠️ WARNING: Anthropic API key not set for this request");',
                  '    console.warn("Please import the environment file and add your Anthropic API key");',
                  '}',
                  '',
                  '// Set Authorization header dynamically',
                  'if (requestUrl.includes("openai.com")) {',
                  '    pm.request.headers.add({ key: "Authorization", value: "Bearer " + openaiKey });',
                  '} else if (requestUrl.includes("anthropic.com")) {',
                  '    pm.request.headers.add({ key: "x-api-key", value: anthropicKey });',
                  '}'
                ]
              }
            },
            {
              listen: 'test',
              script: {
                exec: testScripts
              }
            }
          ],
          request: {
            method: 'POST',
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text',
              },
              ...(isOllama ? [] : [{
                key: 'Authorization',
                value: `Bearer {{${getProviderKeyName(response.provider)}}}`,
                type: 'text',
              }]),
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                isOllama 
                  ? {
                      model: providerName,
                      prompt: context ? `${context}\n\n${prompt}` : prompt,
                      stream: false,
                    }
                  : {
                      messages: [
                        {
                          role: 'user',
                          content: context ? `${context}\n\n${prompt}` : prompt,
                        },
                      ],
                      max_tokens: 1000,
                    },
                null, 2
              ),
              options: {
                raw: {
                  language: 'json',
                },
              },
            },
            url: {
              raw: getProviderUrl(response.provider),
              protocol: isOllama ? 'http' : 'https',
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

export function generatePostmanEnvironment(collectionName: string, responses?: any[]): PostmanEnvironment {
  const values = [
    {
      key: 'base_url',
      value: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      type: 'default',
      enabled: true,
    },
    {
      key: 'setup_instructions',
      value: '🚨 CRITICAL: After importing this environment, you MUST: 1) Select it in the top-right dropdown, 2) Replace placeholder values with your actual API keys from LLM Prompt Lab Config Panel.',
      type: 'default',
      enabled: false,
    },
  ];

  // Add API key variables based on actual providers used
  if (responses) {
    const providers = new Set<string>();
    
    responses.forEach(response => {
      if (response.provider) {
        const isOllama = response.provider.startsWith('ollama:') || response.provider.startsWith('Ollama (');
        if (!isOllama) {
          const keyName = getProviderKeyName(response.provider);
          providers.add(keyName);
        }
      }
    });

    // Add unique provider API keys
    providers.forEach(keyName => {
      values.unshift({
        key: keyName,
        value: `your_${keyName.replace('_api_key', '')}_api_key_here`,
        type: 'secret',
        enabled: true,
      });
    });
  } else {
    // Fallback to default keys if no responses provided
    values.unshift(
      {
        key: 'openai_api_key',
        value: 'your_openai_api_key_here',
        type: 'secret',
        enabled: true,
      },
      {
        key: 'anthropic_api_key',
        value: 'your_anthropic_api_key_here',
        type: 'secret',
        enabled: true,
      },
      {
        key: 'postman_api_key',
        value: 'your_postman_api_key_here',
        type: 'secret',
        enabled: true,
      }
    );
  }

  return {
    id: `env-${Date.now()}`,
    name: `${collectionName} Environment`,
    values,
  };
}

function generateProviderTestScripts(provider: string, isOllama: boolean): string[] {
  const baseTests = [
    '// Basic response validation',
    'pm.test("Response is successful", function () {',
    '    pm.response.to.have.status(200);',
    '});',
    '',
          '// Response time validation',
      'pm.test("Response time is reasonable", function () {',
      '    pm.expect(pm.response.responseTime).to.be.lessThan(25000); // 25 seconds max',
      '});',
    '',
    '// Content-Type validation',
    'pm.test("Response has correct content type", function () {',
    '    pm.expect(pm.response.headers.get("content-type")).to.include("application/json");',
    '});'
  ];

  if (isOllama) {
    return [
      ...baseTests,
      '',
      '// Ollama-specific response validation',
      'pm.test("Ollama response has required fields", function () {',
      '    const response = pm.response.json();',
      '    pm.expect(response).to.have.property("response");',
      '    pm.expect(response).to.have.property("model");',
      '    pm.expect(response).to.have.property("done");',
      '    pm.expect(response.response).to.be.a("string");',
      '    pm.expect(response.response.length).to.be.greaterThan(0);',
      '});',
      '',
      '// Ollama model validation',
      'pm.test("Response model matches request", function () {',
      '    const response = pm.response.json();',
      '    const requestBody = JSON.parse(pm.request.body.raw);',
      '    pm.expect(response.model).to.equal(requestBody.model);',
      '});',
      '',
      '// Response quality check',
      'pm.test("Response content is meaningful", function () {',
      '    const response = pm.response.json();',
      '    pm.expect(response.response.length).to.be.greaterThan(10);',
      '    pm.expect(response.response).to.not.include("error");',
      '    pm.expect(response.response).to.not.include("Error");',
      '});',
      '',
      '// Set variables for comparison',
      'const response = pm.response.json();',
      'pm.collectionVariables.set("ollama_response", response.response);',
      'pm.collectionVariables.set("ollama_model", response.model);',
      'pm.collectionVariables.set("ollama_latency", pm.response.responseTime.toString());'
    ];
  } else {
    // Cloud provider tests (OpenAI, Anthropic, etc.)
    return [
      ...baseTests,
      '',
      '// Cloud provider response validation',
      'pm.test("Response has valid structure", function () {',
      '    const response = pm.response.json();',
      '    pm.expect(response).to.have.property("choices");',
      '    pm.expect(response.choices).to.be.an("array");',
      '    pm.expect(response.choices.length).to.be.greaterThan(0);',
      '});',
      '',
      '// Message content validation',
      'pm.test("Response contains message content", function () {',
      '    const response = pm.response.json();',
      '    const choice = response.choices[0];',
      '    pm.expect(choice).to.have.property("message");',
      '    pm.expect(choice.message).to.have.property("content");',
      '    pm.expect(choice.message.content).to.be.a("string");',
      '    pm.expect(choice.message.content.length).to.be.greaterThan(0);',
      '});',
      '',
      '// Usage statistics validation',
      'pm.test("Response includes usage statistics", function () {',
      '    const response = pm.response.json();',
      '    if (response.usage) {',
      '        pm.expect(response.usage).to.have.property("total_tokens");',
      '        pm.expect(response.usage.total_tokens).to.be.a("number");',
      '        pm.expect(response.usage.total_tokens).to.be.greaterThan(0);',
      '    }',
      '});',
      '',
      '// Response quality check',
      'pm.test("Response content is meaningful", function () {',
      '    const response = pm.response.json();',
      '    const content = response.choices[0].message.content;',
      '    pm.expect(content.length).to.be.greaterThan(10);',
      '    pm.expect(content).to.not.include("error");',
      '    pm.expect(content).to.not.include("Error");',
      '});',
      '',
      '// Set variables for comparison',
      'const response = pm.response.json();',
      'const content = response.choices[0].message.content;',
      'pm.collectionVariables.set("cloud_response", content);',
      'pm.collectionVariables.set("cloud_tokens", response.usage?.total_tokens?.toString() || "0");',
      'pm.collectionVariables.set("cloud_latency", pm.response.responseTime.toString());'
    ];
  }
}

function getProviderUrl(provider: string): string {
  if (provider.startsWith('ollama:') || provider.startsWith('Ollama (')) {
    return 'http://localhost:11434/api/generate';
  }
  
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
  if (provider.startsWith('ollama:') || provider.startsWith('Ollama (')) {
    return 'localhost:11434';
  }
  
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
  if (provider.startsWith('ollama:') || provider.startsWith('Ollama (')) {
    return ['api', 'generate'];
  }
  
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

function getProviderKeyName(provider: string): string {
  if (provider.startsWith('ollama:') || provider.startsWith('Ollama (')) {
    return 'ollama_api_key'; // Not used for Ollama, but consistent naming
  }
  
  // Extract the base provider name for clean environment variable names
  if (provider.toLowerCase().includes('openai')) {
    return 'openai_api_key';
  } else if (provider.toLowerCase().includes('anthropic')) {
    return 'anthropic_api_key';
  } else if (provider.toLowerCase().includes('cohere')) {
    return 'cohere_api_key';
  } else if (provider.toLowerCase().includes('mistral')) {
    return 'mistral_api_key';
  }
  
  // Fallback to a clean version of the provider name
  return provider.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_api_key';
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