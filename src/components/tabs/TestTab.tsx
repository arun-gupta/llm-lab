'use client';

import { useState } from 'react';
import { LLMForm } from '../LLMForm';
import { ResponseTabs } from '../ResponseTabs';
import { SavedComparisons } from '../SavedComparisons';
import { LLMResponse } from '@/lib/llm-apis';
import { Clock, DollarSign, Target, History } from 'lucide-react';
import { SuccessCelebration } from '../SuccessCelebration';

import { TabType } from '../TabNavigation';

interface TestTabProps {
  onTabChange: (tab: TabType) => void;
}

export function TestTab({ onTabChange }: TestTabProps) {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics' | 'comparison'>('responses');
  const [showSavedComparisons, setShowSavedComparisons] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ title: string; message: string } | null>(null);

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
    console.log('=== TestTab handleResponsesChange ===');
    console.log('New responses received:', newResponses);
    console.log('Response count:', newResponses.length);
    newResponses.forEach((resp, index) => {
      console.log(`Response ${index}:`, {
        provider: resp.provider,
        contentLength: resp.content?.length,
        contentPreview: resp.content?.substring(0, 100) + '...',
        hasError: !!resp.error
      });
    });
    console.log('=====================================');
    
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

  const generateLLMTestingCollection = async () => {
    if (!responses || responses.length === 0) return;

    setImportStatus('importing');
    
    try {
      // Create a collection for LLM testing
      const collection = {
        info: {
          name: `LLM Testing Collection - ${new Date().toLocaleDateString()}`,
          description: `LLM Testing collection with ${responses.length} provider responses`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "base_url",
            value: "http://localhost:3000",
            type: "string"
          }
        ],
        item: responses.map((response, index) => ({
          name: `${response.provider} - ${response.model || 'Unknown Model'}`,
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                prompt: formData?.prompt || "Test prompt",
                context: formData?.context || "",
                provider: response.provider,
                model: response.model
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/api/llm",
              host: ["{{base_url}}"],
              path: ["api", "llm"]
            }
          },
          response: [
            {
              name: "Sample Response",
              originalRequest: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    prompt: formData?.prompt || "Test prompt",
                    context: formData?.context || "",
                    provider: response.provider,
                    model: response.model
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/llm",
                  host: ["{{base_url}}"],
                  path: ["api", "llm"]
                }
              },
              status: response.error ? "Error" : "OK",
              code: response.error ? 500 : 200,
              _postman_previewlanguage: "json",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              cookie: [],
              body: JSON.stringify({
                provider: response.provider,
                model: response.model,
                content: response.content || "No content",
                error: response.error || null,
                latency: response.latency || 0,
                tokens: response.tokens || 0
              }, null, 2)
            }
          ]
        }))
      };

      // Create collection via Postman API
      const apiResponse = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: collection,
          createInWeb: false, // Create in Desktop
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        setImportStatus('success');
        setShowSuccessCelebration(true);
        setCelebrationData({
          title: 'LLM Testing Collection Created!',
          message: 'Your LLM testing collection has been successfully created in Postman Desktop!'
        });
      } else {
        // Fallback to download if API key not configured
        if (result.fallback) {
          const blob = new Blob([JSON.stringify(collection, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `llm-testing-collection-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setImportStatus('success');
          setShowSuccessCelebration(true);
          setCelebrationData({
            title: 'LLM Testing Collection Downloaded!',
            message: 'Collection downloaded! Import it manually into Postman.'
          });
        } else {
          throw new Error(result.message || 'Failed to create collection');
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setImportStatus('error');
      setShowSuccessCelebration(true);
      setCelebrationData({
        title: 'Collection Creation Failed',
        message: 'Failed to create collection. Try again or check your Postman API key.'
      });
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Testing</h1>
            <p className="text-gray-600">
              Test prompts across different providers and models with A/B testing, side-by-side comparison, and performance benchmarking.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateLLMTestingCollection}
              disabled={!responses || responses.length === 0 || importStatus === 'importing'}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
              {importStatus === 'importing' ? 'Importing...' : 'Add to Postman Collection'}
            </button>
            <button
              onClick={() => setShowSavedComparisons(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>View Saved Comparisons</span>
            </button>
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

      {/* Advanced Comparison Features */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Comparison Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Response Time Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Detailed latency and throughput comparison with statistical analysis
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Cost Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Compare costs across different providers and models with budget tracking
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Quality Assessment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automated quality scoring and comparison with consistency checks
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Saved Comparisons Modal */}
      <SavedComparisons
        isOpen={showSavedComparisons}
        onClose={() => setShowSavedComparisons(false)}
      />

      {/* Success Celebration */}
      {showSuccessCelebration && celebrationData && (
        <SuccessCelebration
          isVisible={showSuccessCelebration}
          onClose={() => {
            setShowSuccessCelebration(false);
            setCelebrationData(null);
            setImportStatus('idle');
          }}
          title={celebrationData.title}
          message={celebrationData.message}
        />
      )}
    </div>
  );
}
