'use client';

import { useState } from 'react';
import { LLMForm } from '@/components/LLMForm';
import { ResponseTabs } from '@/components/ResponseTabs';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code, Github } from 'lucide-react';

export default function Home() {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);

  const downloadAllPostmanCollection = () => {
    if (responses.length === 0) return;

    const collection = generatePostmanCollection(
      'LLM Prompt Lab Collection',
      'Generated from LLM Prompt Lab',
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LLM Prompt Lab</h1>
                <p className="text-xs text-gray-600">Test prompts across cloud & local models with Postman integration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {responses.length > 0 && (
                <button
                  onClick={downloadAllPostmanCollection}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All Postman</span>
                </button>
              )}
              
              <a
                href="https://github.com/arun-gupta/llm-prompt-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LLMForm 
                onResponsesChange={setResponses}
                onLoadingChange={setIsLoading}
                onProvidersChange={setSelectedProviders}
                onFormDataChange={setFormData}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2">
            {(isLoading || responses.length > 0) ? (
              <ResponseTabs 
                responses={responses}
                prompt={formData?.prompt || ''}
                context={formData?.context || ''}
                isLoading={isLoading}
                selectedProviders={selectedProviders}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to test your prompts?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select your preferred providers, enter a prompt, and compare how different LLMs respond to the same input.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Code className="w-4 h-4" />
                      <span>Compare Prompts</span>
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
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built for prompt engineering, LLM comparison, and AI experimentation. 
              Test your prompts across OpenAI, Anthropic, and local Ollama models.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
