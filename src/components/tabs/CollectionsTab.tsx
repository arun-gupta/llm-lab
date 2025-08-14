'use client';

import { useState } from 'react';
import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp, Code, Zap, Database, Globe, X } from 'lucide-react';

export function CollectionsTab() {
  const [showInstallModal, setShowInstallModal] = useState(false);
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
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Code className="w-4 h-4" />
            <span>MCP Integration</span>
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

      {/* MCP Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">MCP Server Integration</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate popular MCP (Model Context Protocol) servers with Postman for enhanced API testing and automation.
          </p>
        </div>

        {/* MCP Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">GitHub MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Access repositories, create issues, search code</p>
            <div className="text-xs text-gray-500">✅ Available</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">File System MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Read, write, and search files</p>
            <div className="text-xs text-gray-500">✅ Available</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Web Search MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Search web, get news, weather</p>
            <div className="text-xs text-gray-500">✅ Available</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Database MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Query, insert, update, delete</p>
            <div className="text-xs text-gray-500">✅ Available</div>
          </div>
        </div>

        {/* MCP Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Dynamic test data generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Multi-MCP orchestration</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Real-time data validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Conditional test execution</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Start</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Install MCP Integration collection in Postman</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Start MCP servers (GitHub, File System, etc.)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Import collection and configure environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Start testing with MCP-powered requests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setShowInstallModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install in Postman</span>
            </button>
            <button 
              onClick={() => window.open('/docs/MCP-POSTMAN-INTEGRATION.md', '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>View Documentation</span>
            </button>
          </div>
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

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Install MCP Collection</h3>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Choose how you'd like to install the MCP Integration collection:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/postman-collections/mcp-integration-demo.json';
                    link.download = 'mcp-integration-demo.json';
                    link.click();
                    setShowInstallModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Download & Import</div>
                    <div className="text-sm text-gray-600">Download the collection file and import it manually</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    const collectionUrl = `${window.location.origin}/postman-collections/mcp-integration-demo.json`;
                    const postmanUrl = `https://go.postman.co/import?url=${encodeURIComponent(collectionUrl)}`;
                    window.open(postmanUrl, '_blank');
                    setShowInstallModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Postman Web</div>
                    <div className="text-sm text-gray-600">Open directly in Postman Web browser</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    try {
                      // Fetch the collection JSON
                      const response = await fetch('/postman-collections/mcp-integration-demo.json');
                      const collection = await response.json();
                      
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
                        alert(`✅ Collection created successfully in Postman Desktop!
                        
Collection URL: ${result.collectionUrl}
                        
You can now open Postman Desktop to see your new collection.`);
                      } else {
                        throw new Error(result.message || 'Failed to create collection');
                      }
                    } catch (error) {
                      console.error('Error creating collection:', error);
                      alert(`❌ Failed to create collection in Postman Desktop.

Error: ${error.message}

Please try the "Download & Import" option instead.`);
                    }
                    
                    setShowInstallModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-5 h-5 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Direct API Creation</div>
                    <div className="text-sm text-gray-600">Create collection directly in Postman Desktop via API</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const collectionUrl = `${window.location.origin}/postman-collections/mcp-integration-demo.json`;
                    
                    // Try multiple approaches for Postman Desktop
                    try {
                      // Method 1: Try postman:// scheme
                      const postmanDesktopUrl = `postman://import?url=${encodeURIComponent(collectionUrl)}`;
                      window.open(postmanDesktopUrl, '_blank');
                      
                      // Method 2: Try alternative scheme
                      setTimeout(() => {
                        const alternativeUrl = `postman://collection/import?url=${encodeURIComponent(collectionUrl)}`;
                        window.open(alternativeUrl, '_blank');
                      }, 500);
                      
                      // Method 3: Try with a different approach
                      setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = postmanDesktopUrl;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                      
                    } catch (error) {
                      console.log('Postman Desktop URL scheme not supported');
                    }
                    
                    // Show helpful message
                    setTimeout(() => {
                      const message = `Postman Desktop Integration Attempted!

If Postman Desktop didn't open automatically:

1. Make sure Postman Desktop is installed from: https://www.postman.com/downloads/
2. Try the "Download & Import" option instead
3. Or use "Postman Web" for browser-based import

The collection URL is: ${collectionUrl}`;
                      
                      alert(message);
                    }, 1500);
                    
                    setShowInstallModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Postman Desktop</div>
                    <div className="text-sm text-gray-600">Open directly in Postman Desktop app (if installed)</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Installation Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Download & Import:</strong> Works everywhere, no security blocks</li>
                  <li>• <strong>Direct API Creation:</strong> Best option - creates collection directly in Postman Desktop</li>
                  <li>• <strong>Postman Desktop:</strong> Uses URL scheme (may not work in all browsers)</li>
                  <li>• <strong>Postman Web:</strong> Works best in production environments</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Recommended:</strong> Try "Direct API Creation" first for the best experience with Postman Desktop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
