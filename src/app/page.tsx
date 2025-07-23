'use client';

import { useState } from 'react';
import { LLMForm } from '@/components/LLMForm';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code } from 'lucide-react';

export default function Home() {
  const [responses, setResponses] = useState<LLMResponse[]>([]);

  const downloadAllPostmanCollection = () => {
    if (responses.length === 0) return;

    const collection = generatePostmanCollection(
      'LLM API Explorer Collection',
      'Generated from API Explorer Playground',
      responses
    );

    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llm-api-explorer-collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">API Explorer Playground</h1>
                <p className="text-sm text-gray-600">Compare responses from multiple LLM providers</p>
              </div>
            </div>
            
            {responses.length > 0 && (
              <button
                onClick={downloadAllPostmanCollection}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All Postman</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LLMForm onResponsesChange={setResponses} />
            </div>
          </div>

          {/* Right Column - Responses */}
          <div className="lg:col-span-2">
            {responses.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to explore LLM APIs?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select your preferred providers, enter a prompt, and compare responses from different LLM services side by side.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Code className="w-4 h-4" />
                      <span>Compare APIs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>Export to Postman</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Zap className="w-4 h-4" />
                      <span>View Metrics</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Test Prompts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Responses ({responses.length})
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Total tokens: {responses.reduce((sum, r) => sum + (r.tokens?.total || 0), 0)}
                    </span>
                    <span>
                      Avg latency: {Math.round(responses.reduce((sum, r) => sum + r.latency, 0) / responses.length)}ms
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {responses.map((response, index) => (
                    <div key={`${response.provider}-${index}`} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {response.provider === 'OpenAI' && '🤖'}
                            {response.provider === 'Anthropic' && '🧠'}
                            {response.provider === 'Cohere' && '⚡'}
                            {response.provider === 'Mistral' && '🌪️'}
                          </span>
                          <h3 className="font-semibold text-lg">{response.provider}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">{response.latency}ms</span>
                          {response.tokens && (
                            <span className="text-gray-600">{response.tokens.total} tokens</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        {response.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-800 text-sm">{response.error}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                              {response.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built for DevRel teams, API testing, and LLM comparison. 
              Compare responses from OpenAI, Anthropic, Cohere, and Mistral APIs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
