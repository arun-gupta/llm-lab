'use client';

import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp } from 'lucide-react';

export function CollectionsTab() {
  const features = [
    {
      icon: Library,
      title: 'Public Collection Gallery',
      description: 'Browse and discover shared collections from the community',
      status: '🚧 Coming Soon'
    },
    {
      icon: Plus,
      title: 'Create Collections',
      description: 'Generate Postman collections from your test results',
      status: '✅ Available'
    },
    {
      icon: Search,
      title: 'Search & Filter',
      description: 'Find collections by provider, use case, or popularity',
      status: '🚧 Coming Soon'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Rate collections and leave helpful reviews',
      status: '🚧 Coming Soon'
    },
    {
      icon: Download,
      title: 'One-Click Import',
      description: 'Import collections directly to Postman with one click',
      status: '🚧 Coming Soon'
    },
    {
      icon: Share2,
      title: 'Share Collections',
      description: 'Share your collections with the community',
      status: '🚧 Coming Soon'
    }
  ];

  const popularCategories = [
    { name: 'Content Generation', count: 24, icon: '📝' },
    { name: 'Code Review', count: 18, icon: '💻' },
    { name: 'Data Analysis', count: 15, icon: '📊' },
    { name: 'Customer Support', count: 12, icon: '🎧' },
    { name: 'Marketing Copy', count: 9, icon: '📢' },
    { name: 'Research Assistant', count: 7, icon: '🔬' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Library className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Collections Gallery
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover, create, and share Postman collections for LLM testing. Browse community collections or create your own.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Search className="w-4 h-4" />
            <span>Browse Gallery</span>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="text-xs text-gray-500 font-medium">{feature.status}</div>
            </div>
          );
        })}
      </div>

      {/* Popular Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCategories.map((category, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.count} collections</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Preview */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Collection Gallery Preview</h2>
        <p className="text-gray-600 mb-6">
          The gallery will feature collections from the community, organized by category and popularity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Content Generation Suite</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Complete collection for blog posts, emails, and social media content</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By @promptmaster</span>
              <span>2.4k downloads</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Code Review Assistant</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.9</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Comprehensive code review and bug detection prompts</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By @devhelper</span>
              <span>1.8k downloads</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Data Analysis Tools</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">4.7</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Statistical analysis and data interpretation prompts</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By @dataanalyst</span>
              <span>1.2k downloads</span>
            </div>
          </div>
        </div>
        <div className="text-gray-500 text-sm">
          🚧 The public gallery is currently in development. Stay tuned for the launch!
        </div>
      </div>
    </div>
  );
}
