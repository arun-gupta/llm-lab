'use client';

import { useState } from 'react';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TestTab } from '@/components/tabs/TestTab';
import { GraphRAGTab } from '@/components/tabs/GraphRAGTab';
import { MCPTab } from '@/components/tabs/MCPTab';
import { ModelMonitoringTab } from '@/components/tabs/ModelMonitoringTab';


import { SettingsTab } from '@/components/tabs/SettingsTab';
import { PostmanSetupGuide } from '@/components/PostmanSetupGuide';

import { CollectionPreview } from '@/components/CollectionPreview';
import { SuccessCelebration } from '@/components/SuccessCelebration';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection, createPostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code, Github } from 'lucide-react';

export default function Home() {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  

  
  // Postman integration states
  const [showPostmanSetup, setShowPostmanSetup] = useState(false);
  const [showCollectionPreview, setShowCollectionPreview] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  
  // Success celebration states
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'collection-created' | 'api-key-setup' | 'first-response' | 'postman-connected'>('first-response');
  const [celebrationData, setCelebrationData] = useState<any>({});

  // Track if we've shown the Postman connected celebration
  const [hasShownPostmanConnected, setHasShownPostmanConnected] = useState(false);





  const handleHomeClick = () => {
    // Navigate to home tab
    setActiveTab('home');
    
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
                <h1 className="text-xl font-bold text-gray-900">Postman Protocol Playground</h1>
                <p className="text-xs text-gray-600">Test and compare LLM providers with side-by-side performance analysis</p>
              </div>
            </button>
            
            <div className="flex items-center space-x-3">
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

      {/* Tab Navigation */}
      <div className="pt-16">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <main className="pt-8">
        {activeTab === 'home' && (
          <HomeTab onTabChange={setActiveTab} apiKeyStatus={{}} />
        )}
        {activeTab === 'test' && (
          <TestTab onTabChange={setActiveTab} />
        )}



        {activeTab === 'graphrag' && (
          <GraphRAGTab />
        )}

        {activeTab === 'collections' && (
          <MCPTab />
        )}

        {activeTab === 'monitoring' && (
          <ModelMonitoringTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Use Postman to test and compare LLMs with MCP integration. 
              Built for unified experimentation across OpenAI, Anthropic, and Ollama.
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
        onConfirm={() => console.log('Collection creation coming soon...')}
        prompt=""
        context=""
        responses={[]}
        isCreating={isCreatingCollection}
      />

      {/* Success Celebration */}
      <SuccessCelebration
        isVisible={showSuccessCelebration}
        type={celebrationType}
        onClose={() => setShowSuccessCelebration(false)}
        data={celebrationData}
      />


    </div>
  );
}
