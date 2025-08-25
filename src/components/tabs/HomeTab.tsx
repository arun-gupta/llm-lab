'use client';

import { Zap, TestTube, BarChart3, Library, Settings, ArrowRight, Play, Code, Network } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
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

      {/* What You Can Do */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center mb-2">
              <TestTube className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">LLM Testing</h3>
            </div>
            <p className="text-sm text-gray-600">Test prompts across OpenAI, Anthropic, and Ollama with side-by-side comparison</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center mb-2">
              <Network className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">GraphRAG</h3>
            </div>
            <p className="text-sm text-gray-600">Build knowledge graphs and compare REST, GraphQL, gRPC, WebSocket, and SSE protocols</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center mb-2">
              <Library className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-900">MCP</h3>
            </div>
            <p className="text-sm text-gray-600">Model Context Protocol integrations for GitHub, Filesystem, and SQLite</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Settings</h3>
            </div>
            <p className="text-sm text-gray-600">Configure API keys, manage preferences, and customize your experience</p>
          </div>
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

      {/* Recent Activity Placeholder */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No recent activity yet. Start by experimenting with prompts!</p>
                      <button
              onClick={() => onTabChange('test')}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Experimenting</span>
            </button>
        </div>
      </div>


    </div>
  );
}
