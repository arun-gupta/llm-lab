'use client';

import { useState } from 'react';
import { LLMForm } from '@/components/LLMForm';
import { ResponseTabs } from '@/components/ResponseTabs';
import { PostmanSetupGuide } from '@/components/PostmanSetupGuide';
import { PostmanStatusIndicator } from '@/components/PostmanStatusIndicator';
import { CollectionPreview } from '@/components/CollectionPreview';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection, createPostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code, Github } from 'lucide-react';

export default function Home() {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);
  const [showPostmanSetup, setShowPostmanSetup] = useState(false);
  const [postmanConfigured, setPostmanConfigured] = useState(false);
  const [showCollectionPreview, setShowCollectionPreview] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics'>('responses');

  const createPostmanCollectionInWorkspace = async () => {
    if (responses.length === 0) return;
    
    // Show preview first
    setShowCollectionPreview(true);
  };

  const handleConfirmCollectionCreation = async (createInWeb: boolean = true) => {
    setIsCreatingCollection(true);
    try {
      const collection = generatePostmanCollection(
        formData?.prompt || '',
        formData?.context,
        responses
      );
      
      const response = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          collection,
          createInWeb 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (createInWeb) {
          // Open in web browser
          window.open(result.collectionUrl, '_blank');
        } else {
          // For desktop, we'll use a postman:// URL scheme
          const desktopUrl = result.collectionUrl.replace('https://go.postman.co', 'postman://');
          window.open(desktopUrl, '_blank');
        }
        setShowCollectionPreview(false);
      } else {
        // Fallback to download if API key not configured or failed
        const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'llm-api-explorer-collection.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowCollectionPreview(false);
      }
    } catch (error) {
      console.error('Failed to create Postman collection:', error);
      // Fallback to download on error
      const collection = generatePostmanCollection(
        formData?.prompt || '',
        formData?.context,
        responses
      );
      const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'llm-api-explorer-collection.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowCollectionPreview(false);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
    // Auto-switch to responses tab when starting to load
    if (loading) {
      setActiveTab('responses');
      // Scroll to responses area when loading starts
      setTimeout(() => {
        const responsesElement = document.getElementById('responses-section');
        if (responsesElement) {
          responsesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100); // Small delay to ensure tab switch happens first
    }
  };

  const handleResponsesChange = (newResponses: LLMResponse[]) => {
    setResponses(newResponses);
    // Auto-switch to responses tab when new responses arrive
    if (newResponses.length > 0) {
      setActiveTab('responses');
      // Scroll to responses area when responses arrive
      setTimeout(() => {
        const responsesElement = document.getElementById('responses-section');
        if (responsesElement) {
          responsesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const handleHomeClick = () => {
    // Reset all state to initial values
    setResponses([]);
    setIsLoading(false);
    setActiveTab('responses');
    setFormData(null);
    setShowPostmanSetup(false);
    setShowCollectionPreview(false);
    setIsCreatingCollection(false);
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to home page"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LLM Prompt Lab</h1>
                <p className="text-xs text-gray-600">Test prompts across cloud & local models with Postman integration</p>
              </div>
            </button>
            
            <div className="flex items-center space-x-3">
              <PostmanStatusIndicator onStatusChange={setPostmanConfigured} />
              
              {responses.length > 0 && (
                <>
                  <button
                    onClick={createPostmanCollectionInWorkspace}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{postmanConfigured ? 'Create in Postman' : 'Download All Postman'}</span>
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
                onResponsesChange={handleResponsesChange}
                onLoadingChange={handleLoadingChange}
                onProvidersChange={setSelectedProviders}
                onFormDataChange={setFormData}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2" id="responses-section">
            <ResponseTabs 
              responses={responses}
              prompt={formData?.prompt || ''}
              context={formData?.context || ''}
              isLoading={isLoading}
              selectedProviders={selectedProviders}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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

      {/* Collection Preview */}
      <CollectionPreview
        isOpen={showCollectionPreview}
        onClose={() => setShowCollectionPreview(false)}
        onConfirm={handleConfirmCollectionCreation}
        prompt={formData?.prompt || ''}
        context={formData?.context}
        responses={responses}
        isCreating={isCreatingCollection}
      />
    </div>
  );
}
