'use client';

import { Zap, TestTube, BarChart3, Library, Settings, ArrowRight, Code, Network, Activity } from 'lucide-react';
import { ApiKeyStatusIndicator } from '../ApiKeyStatusIndicator';

import { TabType } from '../TabNavigation';

interface HomeTabProps {
  onTabChange: (tab: TabType) => void;
  apiKeyStatus: any;
}

export function HomeTab({ onTabChange, apiKeyStatus }: HomeTabProps) {
  const quickActions = [


    {
      title: 'GraphRAG Lab',
      description: 'Build knowledge graphs, compare protocols, and test GraphRAG vs traditional RAG',
      icon: Network,
      action: () => onTabChange('graphrag'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'MCP Integration',
      description: 'Explore Model Context Protocol integrations for GitHub, Filesystem, and SQLite',
      icon: Library,
      action: () => onTabChange('collections'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Model Monitoring',
      description: 'A/B testing, response comparison, and performance monitoring for LLM models',
      icon: Activity,
      action: () => onTabChange('monitoring'),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Settings',
      description: 'Configure API keys, manage preferences, and customize your experience',
      icon: Settings,
      action: () => onTabChange('settings'),
      color: 'bg-gray-500 hover:bg-gray-600'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Postman Protocol Playground
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Test LLM providers, build knowledge graphs, and compare communication protocols
        </p>
      </div>

      {/* Protocol Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Supported Protocols</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium text-blue-800">REST API</div>
            <div className="text-xs text-blue-600">HTTP/JSON</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl mb-2">🔧</div>
            <div className="font-medium text-purple-800">GraphQL</div>
            <div className="text-xs text-purple-600">Flexible Queries</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium text-green-800">gRPC</div>
            <div className="text-xs text-green-600">High Performance</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl mb-2">📡</div>
            <div className="font-medium text-red-800">SSE</div>
            <div className="text-xs text-red-600">Server Streaming</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl mb-2">🔌</div>
            <div className="font-medium text-orange-800">WebSocket</div>
            <div className="text-xs text-orange-600">Real-time</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-medium text-indigo-800">MCP</div>
            <div className="text-xs text-indigo-600">Model Context</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`
                  ${action.color} text-white p-6 rounded-lg text-left transition-all transform hover:scale-105 hover:shadow-lg
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6" />
                  <ArrowRight className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-blue-100 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>



      {/* Getting Started */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Configure API Keys</h3>
              <p className="text-gray-600 text-sm">
                Set up your OpenAI and Anthropic API keys, and ensure Ollama is running locally.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">LLM Testing</h3>
              <p className="text-gray-600 text-sm">
                Use the LLM Testing tab to experiment with prompts and compare providers side-by-side.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore MCP</h3>
              <p className="text-gray-600 text-sm">
                Discover MCP integrations and collections for enhanced API testing and automation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Try GraphRAG</h3>
              <p className="text-gray-600 text-sm">
                Upload documents, build knowledge graphs, and compare protocols (REST, GraphQL, gRPC, WebSocket, SSE).
              </p>
            </div>
          </div>
        </div>
      </div>




    </div>
  );
}
