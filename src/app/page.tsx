'use client';

import { useState } from 'react';
import { LLMForm } from '@/components/LLMForm';
import { ResponseTabs } from '@/components/ResponseTabs';
import { PostmanSetupGuide } from '@/components/PostmanSetupGuide';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection, createPostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code, Github } from 'lucide-react';

export default function Home() {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);
  const [showPostmanSetup, setShowPostmanSetup] = useState(false);

  const createPostmanCollectionInWorkspace = async () => {
    if (responses.length === 0) return;

    const collection = generatePostmanCollection(
      'LLM Prompt Lab Collection',
      'Generated from LLM Prompt Lab',
      responses
    );

    try {
      const collectionId = await createPostmanCollection(collection);
      if (collectionId) {
        // Open the collection directly in Postman
        window.open(`https://go.postman.co/collection/${collectionId}`, '_blank');
      } else {
        // Fallback to download if API key not configured
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
      }
    } catch (error) {
      console.error('Failed to create Postman collection:', error);
    }
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
                <>
                  <button
                    onClick={createPostmanCollectionInWorkspace}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Create in Postman</span>
                  </button>
                  <button
                    onClick={() => setShowPostmanSetup(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <span>⚙️</span>
                    <span>Setup Guide</span>
                  </button>
                </>
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
            <ResponseTabs 
              responses={responses}
              prompt={formData?.prompt || ''}
              context={formData?.context || ''}
              isLoading={isLoading}
              selectedProviders={selectedProviders}
            />
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

      {/* Postman Setup Guide */}
      <PostmanSetupGuide 
        isOpen={showPostmanSetup} 
        onClose={() => setShowPostmanSetup(false)} 
      />
    </div>
  );
}
