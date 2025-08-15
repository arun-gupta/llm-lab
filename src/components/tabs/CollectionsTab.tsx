'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp, Code, Zap, Database, Globe, X } from 'lucide-react';
import { CollectionPreviewModal } from '../CollectionPreviewModal';

export function CollectionsTab() {

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
            <p className="text-sm text-gray-600 mb-4">Get your personal GitHub repositories with MCP integration</p>
            <div className="text-xs text-gray-500 mb-4">✅ Ready to use - just add your GitHub token</div>
            <div className="text-xs text-blue-600 mb-4">🔧 Auto-detects your username from token</div>
            <button
              onClick={async () => {
                try {
                  // Fetch the collection JSON
                  const response = await fetch('/postman-collections/github-mcp-repos.json');
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
                      message: '✅ Working MCP Collection created successfully in Postman Desktop!'
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
                      a.download = 'github-mcp-repos.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setDeploymentStatus({
                        type: 'success',
                        message: 'Collection downloaded! Import it manually into Postman.'
                      });
                    } else {
                      throw new Error(result.message || 'Failed to create collection');
                    }
                  }
                } catch (error) {
                  console.error('Error creating collection:', error);
                  setDeploymentStatus({
                    type: 'error',
                    message: 'Failed to create collection. Try "Download & Import" instead.'
                  });
                }
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Install GitHub Repos Collection
            </button>
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
                <span>Install GitHub MCP collection in Postman</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Set your GitHub token and username variables</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Run "Initialize MCP Session" to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Run "Get My Repositories" to fetch your repos</span>
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
              onClick={() => window.open('/docs/MCP-POSTMAN-INTEGRATION.md', '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>View Documentation</span>
            </button>
          </div>
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
