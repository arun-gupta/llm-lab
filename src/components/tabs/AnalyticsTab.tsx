'use client';

import { TrendingUp, BarChart3, PieChart, Activity, DollarSign, Clock, Target, Download } from 'lucide-react';

export function AnalyticsTab() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Usage Analytics',
      description: 'Track your usage patterns and provider preferences',
      status: '🚧 Coming Soon'
    },
    {
      icon: BarChart3,
      title: 'Performance Metrics',
      description: 'Response times, success rates, and quality scores',
      status: '🚧 Coming Soon'
    },
    {
      icon: PieChart,
      title: 'Cost Analysis',
      description: 'Detailed cost breakdown by provider and model',
      status: '🚧 Coming Soon'
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Live performance monitoring and alerts',
      status: '🚧 Coming Soon'
    },
    {
      icon: Target,
      title: 'Quality Assessment',
      description: 'Automated quality scoring and improvement suggestions',
      status: '🚧 Coming Soon'
    },
    {
      icon: Download,
      title: 'Export Reports',
      description: 'Generate and export detailed analytics reports',
      status: '🚧 Coming Soon'
    }
  ];

  const mockMetrics = [
    { label: 'Total Requests', value: '1,247', change: '+12%', icon: Activity },
    { label: 'Avg Response Time', value: '2.3s', change: '-8%', icon: Clock },
    { label: 'Success Rate', value: '98.5%', change: '+2%', icon: Target },
    { label: 'Total Cost', value: '$24.50', change: '+15%', icon: DollarSign }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Analytics & Insights
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive analytics and performance insights to optimize your LLM usage and costs.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {mockMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-orange-600" />
                <span className="text-sm text-green-600 font-medium">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="text-xs text-gray-500 font-medium">{feature.status}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Dashboard Preview */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Analytics Dashboard Preview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Response Time Trends</h3>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Performance charts will be displayed here</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">OpenAI</p>
                <p className="font-semibold text-gray-900">1.8s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Anthropic</p>
                <p className="font-semibold text-gray-900">2.1s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ollama</p>
                <p className="font-semibold text-gray-900">3.2s</p>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Cost analysis charts will be displayed here</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">OpenAI</span>
                <span className="font-semibold text-gray-900">$12.30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Anthropic</span>
                <span className="font-semibold text-gray-900">$8.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ollama</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Advanced Analytics Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">Predictive Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered insights to predict costs, optimize performance, and suggest improvements.
            </p>
            <div className="text-xs text-gray-500">🚧 In Development</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">Custom Dashboards</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create custom dashboards with the metrics that matter most to your workflow.
            </p>
            <div className="text-xs text-gray-500">🚧 In Development</div>
          </div>
        </div>
      </div>
    </div>
  );
}
