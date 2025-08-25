'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp, Code, Zap, Database, Globe, X } from 'lucide-react';
import { CollectionPreviewModal } from '../CollectionPreviewModal';

export function MCPTab() {

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUltraFastModal, setShowUltraFastModal] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // MCP Execution States
  const [activeMCP, setActiveMCP] = useState<'github' | 'filesystem' | 'sqlite' | null>(null);
  const [mcpOperation, setMcpOperation] = useState('');
  const [mcpParams, setMcpParams] = useState('');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (deploymentStatus) {
      const timer = setTimeout(() => {
        setDeploymentStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deploymentStatus]);

  // Execute MCP operation and generate collection
  const executeMCPOperation = async (mcpType: string, operation: string, params: any, generateCollection: boolean = false) => {
    setIsExecuting(true);
    setMcpResult(null);

    try {
      const response = await fetch(`/api/mcp/${mcpType}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          params,
          generateCollection
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMcpResult(result.data);
        
        if (result.collection && generateCollection) {
          // Create collection via Postman API
          const apiResponse = await fetch('/api/postman/create-collection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: result.collection,
              createInWeb: false,
            }),
          });
          
          const apiResult = await apiResponse.json();
          
          if (apiResult.success) {
            setDeploymentStatus({
              type: 'success',
              message: `${mcpType.charAt(0).toUpperCase() + mcpType.slice(1)} MCP Collection created successfully in Postman Desktop!`
            });
          } else {
            setDeploymentStatus({
              type: 'error',
              message: 'Failed to create collection in Postman'
            });
          }
        }
      } else {
        setDeploymentStatus({
          type: 'error',
          message: result.error || 'MCP operation failed'
        });
      }
    } catch (error) {
      console.error('MCP execution error:', error);
      setDeploymentStatus({
        type: 'error',
        message: 'Failed to execute MCP operation'
      });
    } finally {
      setIsExecuting(false);
    }
  };


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






      {/* MCP Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">MCP Server Integration</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Integrate popular MCP (Model Context Protocol) servers with Postman for enhanced API testing and automation.
          </p>
        </div>

        {/* MCP Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">GitHub MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Fast repository analysis with user repos, issues, PRs, and health reports</p>
            <div className="text-xs text-gray-500 mb-4">✅ 6 optimized MCP requests</div>
            <div className="text-xs text-blue-600 mb-4">🔧 Environment variables for security</div>
            <div className="flex space-x-2 mt-auto">
              <button
                onClick={() => setActiveMCP('github')}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute
              </button>
              <button
                onClick={async () => {
                  try {
                    // Fetch the collection JSON
                    const response = await fetch('/postman-collections/github-mcp-unified.json');
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
                        message: 'Working MCP Collection created successfully in Postman Desktop!'
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
                        a.download = 'github-mcp-unified.json';
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
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                Add to Postman
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Filesystem MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Official MCP server with HTTP wrapper for Postman integration</p>
            <div className="text-xs text-gray-500 mb-4">✅ 11 official tools + HTTP API</div>
            <div className="text-xs text-green-600 mb-4">🌐 HTTP wrapper for Postman</div>
            <div className="flex space-x-2 mt-auto">
              <button
                onClick={() => setActiveMCP('filesystem')}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute
              </button>
              <button
                onClick={async () => {
                  try {
                    // Fetch the collection JSON
                    const response = await fetch('/postman-collections/official-filesystem-mcp-fixed.json');
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
                        message: 'Filesystem MCP Collection created successfully in Postman Desktop!'
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
                        a.download = 'official-filesystem-mcp-fixed.json';
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
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                Add to Postman
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">SQLite MCP</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Database operations with Docker HTTP mode for Postman integration</p>
            <div className="text-xs text-gray-500 mb-4">✅ 15 database tools + HTTP API</div>
                          <div className="text-xs text-blue-600 mb-4">🐳 Docker HTTP mode for API testing</div>
            <div className="flex space-x-2 mt-auto">
              <button
                onClick={() => setActiveMCP('sqlite')}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                Execute
              </button>
              <button
                onClick={async () => {
                  try {
                    // Fetch the collection JSON
                    const response = await fetch('/postman-collections/sqlite-mcp-server.json');
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
                        message: 'SQLite MCP Collection created successfully in Postman Desktop!'
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
                        a.download = 'sqlite-mcp-server.json';
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
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                Add to Postman
              </button>
            </div>
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
        </div>

        {/* MCP Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                <span>Install any MCP collection (GitHub, Filesystem, or SQLite)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Set up the corresponding MCP server (see collection descriptions)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Run "Health Check" to verify server connectivity</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Execute the available tools for your use case</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Combine multiple MCP servers for advanced workflows</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.open('/docs/mcp-postman-integration.md', '_blank')}
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

      {/* MCP Execution Interface */}
      {activeMCP && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Execute {activeMCP.charAt(0).toUpperCase() + activeMCP.slice(1)} MCP Operations
            </h3>
            <button
              onClick={() => setActiveMCP(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operation Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <select
                  value={mcpOperation}
                  onChange={(e) => setMcpOperation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an operation...</option>
                  {activeMCP === 'github' && (
                    <>
                      <option value="list_repositories">List Repositories</option>
                      <option value="get_repository">Get Repository</option>
                      <option value="list_issues">List Issues</option>
                      <option value="get_pull_requests">Get Pull Requests</option>
                      <option value="get_repository_health">Get Repository Health</option>
                    </>
                  )}
                  {activeMCP === 'filesystem' && (
                    <>
                      <option value="list_directory">List Directory</option>
                      <option value="read_file">Read File</option>
                      <option value="search_files">Search Files</option>
                      <option value="get_file_info">Get File Info</option>
                      <option value="list_sample_docs">List Sample Documents</option>
                    </>
                  )}
                  {activeMCP === 'sqlite' && (
                    <>
                      <option value="list_tables">List Tables</option>
                      <option value="describe_table">Describe Table</option>
                      <option value="execute_query">Execute Query</option>
                      <option value="get_database_info">Get Database Info</option>
                      <option value="backup_database">Backup Database</option>
                      <option value="optimize_database">Optimize Database</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameters (JSON)
                </label>
                <textarea
                  value={mcpParams}
                  onChange={(e) => setMcpParams(e.target.value)}
                  placeholder="Enter parameters as JSON..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    try {
                      const params = mcpParams ? JSON.parse(mcpParams) : {};
                      executeMCPOperation(activeMCP, mcpOperation, params, false);
                    } catch (error) {
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Invalid JSON parameters'
                      });
                    }
                  }}
                  disabled={!mcpOperation || isExecuting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? 'Executing...' : 'Execute Operation'}
                </button>
                <button
                  onClick={() => {
                    try {
                      const params = mcpParams ? JSON.parse(mcpParams) : {};
                      executeMCPOperation(activeMCP, mcpOperation, params, true);
                    } catch (error) {
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Invalid JSON parameters'
                      });
                    }
                  }}
                  disabled={!mcpOperation || isExecuting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? 'Creating...' : 'Execute & Create Collection'}
                </button>
              </div>
            </div>

            {/* Results Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 h-64 overflow-auto">
                {mcpResult ? (
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(mcpResult, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Execute an operation to see results here...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
