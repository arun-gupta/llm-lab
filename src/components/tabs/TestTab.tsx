'use client';

import { useState } from 'react';
import { LLMForm } from '../LLMForm';
import { ResponseTabs } from '../ResponseTabs';
import { LLMResponse } from '@/lib/llm-apis';
import { TestTube, BarChart3, Save, Share2 } from 'lucide-react';

import { TabType } from '../TabNavigation';

interface TestTabProps {
  onTabChange: (tab: TabType) => void;
}

export function TestTab({ onTabChange }: TestTabProps) {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics'>('responses');

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setActiveTab('responses');
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

  const handleResponsesChange = (newResponses: LLMResponse[]) => {
    setResponses(newResponses);
    if (newResponses.length > 0) {
      setActiveTab('responses');
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

  const handleSaveTest = () => {
    // TODO: Implement save test functionality
    console.log('Save test functionality coming soon...');
  };

  const handleShareResults = () => {
    // TODO: Implement share results functionality
    console.log('Share results functionality coming soon...');
  };

  const handleCompareResults = () => {
    // Navigate to compare tab with current results
    onTabChange('compare');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Prompts</h1>
            <p className="text-gray-600">
              Test your prompts across different providers and models with A/B testing capabilities.
            </p>
          </div>
          <div className="flex space-x-3">
            {responses.length > 0 && (
              <>
                <button
                  onClick={handleSaveTest}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Test</span>
                </button>
                <button
                  onClick={handleShareResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCompareResults}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Compare</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* A/B Testing Options */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">A/B Testing Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Provider Testing</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test the same prompt across different providers (OpenAI, Anthropic, Ollama)
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Model Testing</h3>
            </div>
            <p className="text-sm text-gray-600">
              Compare different models within the same provider
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Prompt Variations</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test different prompt formulations and styles
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
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

      {/* Future Features Placeholder */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">Advanced A/B Testing</h3>
            <p className="text-sm text-gray-600 mb-4">
              Statistical significance testing, confidence intervals, and automated winner selection.
            </p>
            <div className="text-xs text-gray-500">🚧 In Development</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">Test Templates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pre-built test scenarios for common use cases like content generation, code review, etc.
            </p>
            <div className="text-xs text-gray-500">🚧 In Development</div>
          </div>
        </div>
      </div>
    </div>
  );
}
