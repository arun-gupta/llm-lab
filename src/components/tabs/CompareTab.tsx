'use client';

import { BarChart3, TrendingUp, Zap, Clock, DollarSign, Target } from 'lucide-react';

export function CompareTab() {
  const features = [
    {
      icon: BarChart3,
      title: 'Side-by-Side Comparison',
      description: 'Compare responses from multiple providers simultaneously',
      status: '🚧 Coming Soon'
    },
    {
      icon: TrendingUp,
      title: 'Performance Benchmarking',
      description: 'Measure response times, costs, and quality metrics',
      status: '🚧 Coming Soon'
    },
    {
      icon: Zap,
      title: 'Local vs Cloud Analysis',
      description: 'Compare Ollama local models with cloud providers',
      status: '🚧 Coming Soon'
    },
    {
      icon: Clock,
      title: 'Response Time Analysis',
      description: 'Detailed latency and throughput comparison',
      status: '🚧 Coming Soon'
    },
    {
      icon: DollarSign,
      title: 'Cost Analysis',
      description: 'Compare costs across different providers and models',
      status: '🚧 Coming Soon'
    },
    {
      icon: Target,
      title: 'Quality Assessment',
      description: 'Automated quality scoring and comparison',
      status: '🚧 Coming Soon'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Compare & Benchmark
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced comparison tools for side-by-side analysis, performance benchmarking, and statistical insights across different LLM providers.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="text-xs text-gray-500 font-medium">{feature.status}</div>
            </div>
          );
        })}
      </div>

      {/* Demo Section */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Comparison Demo</h2>
        <p className="text-gray-600 mb-6">
          Experience the power of advanced LLM comparison tools. This feature will allow you to:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Comparison</h3>
            <p className="text-sm text-gray-600">
              See responses from multiple providers side-by-side with real-time metrics
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Statistical Analysis</h3>
            <p className="text-sm text-gray-600">
              Confidence intervals, significance testing, and automated insights
            </p>
          </div>
        </div>
        <div className="text-gray-500 text-sm">
          🚧 This feature is currently in development. Stay tuned for updates!
        </div>
      </div>
    </div>
  );
}
