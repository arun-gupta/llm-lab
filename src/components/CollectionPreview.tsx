'use client';

import { useState } from 'react';
import { X, Download, Eye, FileText, Code, Settings, Play } from 'lucide-react';
import { generatePostmanCollection } from '@/lib/postman';
import { LLMResponse } from '@/lib/llm-apis';

interface CollectionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (createInWeb?: boolean) => void;
  prompt: string;
  context?: string;
  responses: LLMResponse[];
  isCreating: boolean;
}

export function CollectionPreview({ 
  isOpen, 
  onClose, 
  onConfirm, 
  prompt, 
  context, 
  responses,
  isCreating 
}: CollectionPreviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'environment' | 'tests'>('overview');
  const [createInWeb, setCreateInWeb] = useState(true);
  
  if (!isOpen) return null;

  const collection = generatePostmanCollection(prompt, context, responses);
  const collectionJson = JSON.stringify(collection, null, 2);

  const getProviderIcon = (provider: string) => {
    if (provider.startsWith('ollama:')) return '🦙';
    switch (provider.toLowerCase()) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'cohere': return '⚡';
      case 'mistral': return '🌪️';
      default: return '🤖';
    }
  };

  const getProviderColor = (provider: string) => {
    if (provider.startsWith('ollama:')) return 'text-green-600';
    switch (provider.toLowerCase()) {
      case 'openai': return 'text-green-600';
      case 'anthropic': return 'text-blue-600';
      case 'cohere': return 'text-purple-600';
      case 'mistral': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const handleConfirm = () => {
    onConfirm(createInWeb);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Postman Collection Preview</h2>
              <p className="text-sm text-gray-600">Review what will be created in your Postman workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b flex-shrink-0">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'requests', label: 'Requests', icon: Code },
              { id: 'environment', label: 'Environment', icon: Settings },
              { id: 'tests', label: 'Test Scripts', icon: Play },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Collection Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Name:</strong> {collection.info.name}</p>
                  <p><strong>Description:</strong> {collection.info.description}</p>
                  <p><strong>Total Requests:</strong> {collection.item.length}</p>
                  <p><strong>Providers:</strong> {responses.length} different LLM services</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span>API Requests</span>
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Direct API calls to each provider</li>
                      <li>• Proper headers and authentication</li>
                      <li>• Request body with your prompt</li>
                      <li>• Environment variables for API keys</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Test Scripts</span>
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Response validation</li>
                      <li>• Status code checks</li>
                      <li>• Content verification</li>
                      <li>• Error handling</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Provider Requests</h3>
                <div className="space-y-2">
                  {responses.map((response, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getProviderIcon(response.provider)}</span>
                      <span className={`font-medium ${getProviderColor(response.provider)}`}>
                        {response.provider}
                      </span>
                      <span className="text-sm text-gray-500">
                        {response.latency}ms • {response.tokens?.total || 'N/A'} tokens
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">API Requests</h3>
              {collection.item.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getProviderIcon(item.name)}</span>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {item.request.method}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">URL:</span>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded mt-1">
                        {item.request.url.raw}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Headers:</span>
                      <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded mt-1">
                        {item.request.header.map((header, i) => (
                          <div key={i}>{header.key}: {header.value}</div>
                        ))}
                      </div>
                    </div>
                    {item.request.body && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Body:</span>
                        <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(JSON.parse(item.request.body.raw), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'environment' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Environment Variables</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  The collection will include environment variables for secure API key management:
                </p>
                <div className="space-y-2">
                  {responses.map((response, index) => {
                    const isOllama = response.provider.startsWith('ollama:') || response.provider.startsWith('Ollama (');
                    
                    // Skip API key variables for Ollama since it doesn't require authentication
                    if (isOllama) {
                      return (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <span className="text-gray-500 italic">No API key required (local Ollama)</span>
                        </div>
                      );
                    }
                    
                    const provider = response.provider.toLowerCase();
                    return (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className="font-mono bg-white px-2 py-1 rounded border">
                          {provider}_api_key
                        </span>
                        <span className="text-gray-600">→ Your {response.provider} API key</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Test Scripts</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-3">
                  Each request includes comprehensive automated test scripts for validation and monitoring:
                </p>
                <div className="space-y-4">
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Basic Validation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Status code verification (200 OK)</li>
                      <li>• Response time validation (under 30 seconds)</li>
                      <li>• Content-Type header validation</li>
                      <li>• JSON response structure validation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Provider-Specific Tests</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-blue-600">Cloud Providers (OpenAI, Anthropic):</span>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li>• Response structure validation (choices array)</li>
                          <li>• Message content verification</li>
                          <li>• Usage statistics validation (tokens)</li>
                          <li>• Response quality checks</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-600">Ollama (Local):</span>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li>• Ollama-specific response fields (response, model, done)</li>
                          <li>• Model name validation</li>
                          <li>• Response content quality checks</li>
                          <li>• Local endpoint validation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Performance & Monitoring</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Response time tracking and alerts</li>
                      <li>• Token usage monitoring</li>
                      <li>• Error detection and reporting</li>
                      <li>• Collection variables for comparison</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Automated Variables</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Response content extraction</li>
                      <li>• Latency tracking across providers</li>
                      <li>• Token usage comparison</li>
                      <li>• Model information storage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const blob = new Blob([collectionJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'llm-prompt-lab-collection.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
            
            {/* Postman Agent Selection */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Create in:</span>
              <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setCreateInWeb(true)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    createInWeb 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Web
                </button>
                <button
                  onClick={() => setCreateInWeb(false)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    !createInWeb 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Desktop
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isCreating}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Create in Postman {createInWeb ? 'Web' : 'Desktop'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
