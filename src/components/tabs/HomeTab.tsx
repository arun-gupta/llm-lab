'use client';

import { Zap, TestTube, BarChart3, Library, TrendingUp, Settings, ArrowRight, Play } from 'lucide-react';
import { ApiKeyStatusIndicator } from '../ApiKeyStatusIndicator';

import { TabType } from '../TabNavigation';

interface HomeTabProps {
  onTabChange: (tab: TabType) => void;
  apiKeyStatus: any;
}

export function HomeTab({ onTabChange, apiKeyStatus }: HomeTabProps) {
  const quickActions = [
    {
      title: 'Test All Providers',
      description: 'Test your prompt across OpenAI, Anthropic, and Ollama',
      icon: TestTube,
      action: () => onTabChange('test'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Compare Providers',
      description: 'Side-by-side comparison and performance benchmarking',
      icon: BarChart3,
      action: () => onTabChange('compare'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Browse Collections',
      description: 'Explore shared collections and templates',
      icon: Library,
      action: () => onTabChange('collections'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'View Analytics',
      description: 'Performance insights and usage reports',
      icon: TrendingUp,
      action: () => onTabChange('analytics'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to LLM Lab
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Test and compare LLMs with Postman integration and analytics.
        </p>
        
        {/* API Key Status */}
        <div className="flex justify-center mb-8">
          <ApiKeyStatusIndicator />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
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
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Getting Started</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Configure API Keys</h3>
              <p className="text-gray-600 text-sm">
                Set up your OpenAI, Anthropic, and Postman API keys in the Settings tab.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Test Your Prompts</h3>
              <p className="text-gray-600 text-sm">
                Use the Test tab to experiment with prompts across different providers and models.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Collections</h3>
              <p className="text-gray-600 text-sm">
                Generate Postman collections and discover shared collections from the community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
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

      {/* Features Preview */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <TestTube className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">A/B Testing</h3>
            <p className="text-gray-600 text-sm">
              Compare different prompts, models, and providers to find the best approach.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <BarChart3 className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Performance Benchmarking</h3>
            <p className="text-gray-600 text-sm">
              Measure response times, costs, and quality across different providers.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Library className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Collection Gallery</h3>
            <p className="text-gray-600 text-sm">
              Share and discover Postman collections with the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
