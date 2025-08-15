'use client';

import { useState } from 'react';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { HomeTab } from '@/components/tabs/HomeTab';
import { TestTab } from '@/components/tabs/TestTab';

import { CollectionsTab } from '@/components/tabs/CollectionsTab';
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { PostmanSetupGuide } from '@/components/PostmanSetupGuide';
import { ApiKeyStatusIndicator } from '@/components/ApiKeyStatusIndicator';
import { CollectionPreview } from '@/components/CollectionPreview';
import { SuccessCelebration } from '@/components/SuccessCelebration';
import { ConfigPanel } from '@/components/ConfigPanel';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection, createPostmanCollection } from '@/lib/postman';
import { Download, Zap, Globe, Code, Github, Settings } from 'lucide-react';

export default function Home() {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // API key status state
  const [apiKeyStatus, setApiKeyStatus] = useState<any>({});
  const [apiKeyRefreshTrigger, setApiKeyRefreshTrigger] = useState(0);
  
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

  // Config panel state
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const handleApiKeyStatusChange = (status: any) => {
    setApiKeyStatus(status);
    
    // Show celebration when Postman is first connected
    if (status.postman === 'configured' && !hasShownPostmanConnected) {
      setHasShownPostmanConnected(true);
      setCelebrationType('postman-connected');
      setCelebrationData({});
      setShowSuccessCelebration(true);
    }
  };

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
                <h1 className="text-xl font-bold text-gray-900">LLM Lab</h1>
                <p className="text-xs text-gray-600">Use Postman to test & compare LLMs and MCP integration</p>
              </div>
            </button>
            
            <div className="flex items-center space-x-3">
              <ApiKeyStatusIndicator 
                onStatusChange={handleApiKeyStatusChange} 
                refreshTrigger={apiKeyRefreshTrigger}
              />
              
              <button
                onClick={() => setShowConfigPanel(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Configure API Keys"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
              
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
          <HomeTab onTabChange={setActiveTab} apiKeyStatus={apiKeyStatus} />
        )}
        {activeTab === 'test' && (
          <TestTab onTabChange={setActiveTab} />
        )}

        {activeTab === 'collections' && (
          <CollectionsTab />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab />
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
              Use Postman to test & compare LLMs with MCP integration. 
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

      {/* Config Panel */}
      <ConfigPanel
        isOpen={showConfigPanel}
        onClose={() => {
          setShowConfigPanel(false);
          // Refresh API key status after config panel closes
          setApiKeyRefreshTrigger(prev => prev + 1);
        }}
        onConfigChange={() => {
          // Refresh Postman status when config changes
          if (typeof window !== 'undefined') {
            // Trigger a page refresh to pick up new environment variables
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
