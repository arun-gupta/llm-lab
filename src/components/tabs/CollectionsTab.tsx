'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp, Code, Zap, Database, Globe, X } from 'lucide-react';
import { CollectionPreviewModal } from '../CollectionPreviewModal';

export function CollectionsTab() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUltraFastModal, setShowUltraFastModal] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (deploymentStatus) {
      const timer = setTimeout(() => {
        setDeploymentStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deploymentStatus]);
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
      {/* Deployment Status Notification */}
      {deploymentStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          deploymentStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {deploymentStatus.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="text-sm font-medium">{deploymentStatus.message}</span>
            <button 
              onClick={() => setDeploymentStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
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
              <div className="text-xs text-gray-500">✅ Available (with fallback)</div>
              <div className="text-xs text-orange-600 mt-1">⚠️ May use mock data if slow</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow opacity-60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">File System MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Read, write, and search files</p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow opacity-60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Web Search MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Search web, get news, weather</p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow opacity-60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Database MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Query, insert, update, delete</p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
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
                <span>GitHub token is pre-configured and ready to use</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Test GitHub token with "Test GitHub Token" request</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Run GitHub requests - uses mock data if MCP server is slow</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span className="text-gray-500">Other MCP servers coming soon (File System, Web Search, Database)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Preview & Deploy (Complex)</span>
            </button>
            <button 
              onClick={() => setShowUltraFastModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Preview & Deploy (Ultra-Fast)</span>
            </button>
            <button 
              onClick={() => setShowInstallModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Quick Install</span>
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
                        setDeploymentStatus({
                          type: 'success',
                          message: 'Collection created successfully in Postman Desktop!'
                        });
                      } else {
                        throw new Error(result.message || 'Failed to create collection');
                      }
                    } catch (error) {
                      console.error('Error creating collection:', error);
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Failed to create collection. Try "Download & Import" instead.'
                      });
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
                    
                    // Single attempt to open Postman Desktop
                    try {
                      // Try the most reliable URL scheme
                      const postmanDesktopUrl = `postman://import?url=${encodeURIComponent(collectionUrl)}`;
                      window.open(postmanDesktopUrl, '_blank');
                      
                      // Show immediate feedback
                      setDeploymentStatus({
                        type: 'success',
                        message: 'Attempting to open Postman Desktop...'
                      });
                      
                    } catch (error) {
                      console.log('Postman Desktop URL scheme not supported');
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Could not open Postman Desktop. Try "Direct API Creation" instead.'
                      });
                    }
                    
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

      {/* Ultra-Fast MCP Test Collection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ultra-Fast MCP Test</h3>
              <p className="text-sm text-gray-600">CLI-like performance with minimal session management</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const collectionUrl = `${window.location.origin}/postman-collections/ultra-fast-mcp.json`;
                window.open(collectionUrl, '_blank');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Full
            </button>
            <button
              onClick={() => {
                const collectionUrl = `${window.location.origin}/postman-collections/ultra-fast-mcp-simple.json`;
                window.open(collectionUrl, '_blank');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Download Simple
            </button>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-900 mb-2">⚡ Maximum Performance - Minimal Overhead</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• <strong>Minimal session management</strong> - One-time initialization</li>
            <li>• <strong>Static request bodies</strong> - No dynamic variable processing</li>
            <li>• <strong>Simple test scripts</strong> - Basic response validation only</li>
            <li>• <strong>Session ID reuse</strong> - Stored in environment variables</li>
            <li>• <strong>Multiple repo counts</strong> - 3, 5, and 10 repos pre-configured</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">📋 What's Included</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Initialize MCP session (one-time)</li>
              <li>• Search 3 repositories (static)</li>
              <li>• Search 5 repositories (static)</li>
              <li>• Search 10 repositories (static)</li>
              <li>• Get user info (static)</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🚀 Performance Benefits</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Fastest possible Postman performance</li>
              <li>• Minimal script execution</li>
              <li>• Session ID reuse for efficiency</li>
              <li>• Direct MCP protocol calls</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simplified MCP Test Collection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Simplified MCP Test</h3>
              <p className="text-sm text-gray-600">CLI-like performance with minimal scripts</p>
            </div>
          </div>
          <button
            onClick={() => {
              const collectionUrl = `${window.location.origin}/postman-collections/simple-mcp-test.json`;
              window.open(collectionUrl, '_blank');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Collection
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">🚀 Why This Collection is Faster</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>No complex pre-request scripts</strong> - Direct API calls like CLI</li>
            <li>• <strong>No session management</strong> - Removes MCP session overhead</li>
            <li>• <strong>No timeout logic</strong> - No fallback to mock data</li>
            <li>• <strong>No environment variable processing</strong> - Minimal variable substitution</li>
            <li>• <strong>Direct GitHub MCP server calls</strong> - No proxy or middleware</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">📋 What's Included</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Single repository search request</li>
              <li>• Configurable repository count</li>
              <li>• Simple response parsing</li>
              <li>• Basic error handling</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">⚡ Performance Benefits</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Faster response times</li>
              <li>• Less memory usage</li>
              <li>• No script execution delays</li>
              <li>• Direct MCP protocol calls</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Comparison Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Performance Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs font-bold">CLI</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm">CLI Script</h4>
              <p className="text-xs text-gray-600 mt-1">2-5 seconds</p>
              <p className="text-xs text-gray-500">Maximum speed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs font-bold">UF</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm">Ultra-Fast</h4>
              <p className="text-xs text-gray-600 mt-1">5-10 seconds</p>
              <p className="text-xs text-gray-500">Zero scripts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm">Simplified</h4>
              <p className="text-xs text-gray-600 mt-1">10-15 seconds</p>
              <p className="text-xs text-gray-500">Minimal scripts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <h4 className="font-medium text-gray-900 text-sm">Complex</h4>
              <p className="text-xs text-gray-600 mt-1">15-30 seconds</p>
              <p className="text-xs text-gray-500">Full features</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Recommendation:</strong> Use CLI for performance testing, Ultra-Fast Postman for development
          </p>
          <button
            onClick={() => {
              const scriptUrl = `${window.location.origin}/scripts/test-github-mcp-cli.sh`;
              window.open(scriptUrl, '_blank');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CLI Script
          </button>
        </div>
      </div>

      {/* Collection Preview Modal - Complex */}
      <CollectionPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onDeploy={async (collection, collectionName, createInWeb, githubToken) => {
                      try {
              // Update collection with GitHub token if provided
              if (githubToken) {
                // Update the github_token variable in the collection
                if (collection.variable) {
                  const githubTokenVar = collection.variable.find(v => v.key === 'github_token');
                  if (githubTokenVar) {
                    githubTokenVar.value = githubToken;
                  } else {
                    collection.variable.push({
                      key: 'github_token',
                      value: githubToken,
                      type: 'string'
                    });
                  }
                }
              }

              // Create collection via Postman API
              const apiResponse = await fetch('/api/postman/create-collection', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  collection: collection,
                  createInWeb: createInWeb,
                }),
              });
            
            const result = await apiResponse.json();
            
                          if (result.success) {
                // Show success message
                const successMessage = `✅ Collection "${collectionName}" created successfully in Postman ${createInWeb ? 'Web' : 'Desktop'}!
              
Collection URL: ${result.collectionUrl}${githubToken ? '\n\n🔑 GitHub token has been configured in the collection!' : '\n\n⚠️ Remember to configure your GitHub token in Postman for GitHub MCP integration.'}`;

              if (!createInWeb) {
                // For Desktop deployment, try to open Postman Desktop once
                try {
                  // Single attempt to open Postman Desktop with the collection
                  const postmanDesktopUrl = `postman://import?url=${encodeURIComponent(result.collectionUrl)}`;
                  window.open(postmanDesktopUrl, '_blank');
                  
                  setDeploymentStatus({
                    type: 'success',
                    message: `Collection "${collectionName}" created! Opening Postman Desktop...`
                  });
                } catch (error) {
                  console.log('Postman Desktop URL scheme not supported');
                  setDeploymentStatus({
                    type: 'success',
                    message: `Collection "${collectionName}" created! Open Postman Desktop to view it.`
                  });
                }
              } else {
                // For Web deployment, open in browser
                window.open(result.collectionUrl, '_blank');
                setDeploymentStatus({
                  type: 'success',
                  message: `Collection "${collectionName}" created! Opening Postman Web...`
                });
              }
            } else {
              throw new Error(result.message || 'Failed to create collection');
            }
          } catch (error) {
            console.error('Error creating collection:', error);
            setDeploymentStatus({
              type: 'error',
              message: 'Failed to create collection. Try "Quick Install" instead.'
            });
          }
          
          setShowPreviewModal(false);
        }}
        collectionUrl="/postman-collections/mcp-integration-demo.json"
      />

      {/* Collection Preview Modal - Ultra-Fast */}
      <CollectionPreviewModal
        isOpen={showUltraFastModal}
        onClose={() => setShowUltraFastModal(false)}
        onDeploy={async (collection, collectionName, createInWeb, githubToken) => {
                      try {
              // Update collection with GitHub token if provided
              if (githubToken) {
                // Update the github_token variable in the collection
                if (collection.variable) {
                  const githubTokenVar = collection.variable.find(v => v.key === 'github_token');
                  if (githubTokenVar) {
                    githubTokenVar.value = githubToken;
                  } else {
                    collection.variable.push({
                      key: 'github_token',
                      value: githubToken,
                      type: 'string'
                    });
                  }
                }
              }

              // Create collection via Postman API
              const apiResponse = await fetch('/api/postman/create-collection', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  collection: collection,
                  createInWeb: createInWeb,
                }),
              });
            
            const result = await apiResponse.json();
            
                          if (result.success) {
                // Show success message
                const successMessage = `✅ Ultra-Fast Collection "${collectionName}" created successfully in Postman ${createInWeb ? 'Web' : 'Desktop'}!
              
Collection URL: ${result.collectionUrl}${githubToken ? '\n\n🔑 GitHub token has been configured in the collection!' : '\n\n⚠️ Remember to configure your GitHub token in Postman for GitHub MCP integration.'}`;

              if (!createInWeb) {
                // For Desktop deployment, try to open Postman Desktop once
                try {
                  // Single attempt to open Postman Desktop with the collection
                  const postmanDesktopUrl = `postman://import?url=${encodeURIComponent(result.collectionUrl)}`;
                  window.open(postmanDesktopUrl, '_blank');
                  
                  setDeploymentStatus({
                    type: 'success',
                    message: `Ultra-Fast Collection "${collectionName}" created! Opening Postman Desktop...`
                  });
                } catch (error) {
                  console.log('Postman Desktop URL scheme not supported');
                  setDeploymentStatus({
                    type: 'success',
                    message: `Ultra-Fast Collection "${collectionName}" created! Open Postman Desktop to view it.`
                  });
                }
              } else {
                // For Web deployment, open in browser
                window.open(result.collectionUrl, '_blank');
                setDeploymentStatus({
                  type: 'success',
                  message: `Ultra-Fast Collection "${collectionName}" created! Opening Postman Web...`
                });
              }
            } else {
              throw new Error(result.message || 'Failed to create collection');
            }
          } catch (error) {
            console.error('Error creating collection:', error);
            setDeploymentStatus({
              type: 'error',
              message: 'Failed to create collection. Try "Quick Install" instead.'
            });
          }
          
          setShowUltraFastModal(false);
        }}
        collectionUrl="/postman-collections/ultra-fast-mcp.json"
      />
    </div>
  );
}
