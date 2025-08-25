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
  const [activeTab, setActiveTab] = useState<'execute' | 'collections'>('execute');
  const [mcpQuery, setMcpQuery] = useState('');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample queries for each MCP type
  const sampleQueries = {
    github: [
      "List my repositories",
      "Get repository 'postman-labs'",
      "Show issues for 'postman-labs'",
      "Get pull requests for 'postman-labs'",
      "Show repository health for 'postman-labs'"
    ],
    filesystem: [
      "List files in sample-docs",
      "Read file 'ai-healthcare.txt'",
      "Search for files containing 'AI'",
      "Get file info for 'ai-healthcare.txt'",
      "List sample documents"
    ],
    sqlite: [
      "List all tables",
      "Show users table schema",
      "Execute SELECT * FROM users LIMIT 5",
      "Get database info",
      "Backup database",
      "Optimize database"
    ]
  };

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (deploymentStatus) {
      const timer = setTimeout(() => {
        setDeploymentStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deploymentStatus]);

  // Execute MCP query and generate collection
  const executeMCPQuery = async (mcpType: string, query: string, generateCollection: boolean = false) => {
    setIsExecuting(true);
    setMcpResult(null);

    try {
      const response = await fetch(`/api/mcp/${mcpType}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
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
          message: result.error || 'MCP query failed'
        });
      }
    } catch (error) {
      console.error('MCP execution error:', error);
      setDeploymentStatus({
        type: 'error',
        message: 'Failed to execute MCP query'
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

                {/* MCP Servers Tabbed Interface */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveMCP('github')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeMCP === 'github'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>GitHub MCP</span>
              </button>
              <button
                onClick={() => setActiveMCP('filesystem')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeMCP === 'filesystem'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Filesystem MCP</span>
              </button>
              <button
                onClick={() => setActiveMCP('sqlite')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeMCP === 'sqlite'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQLite MCP</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeMCP === 'github' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub MCP</h3>
                  <p className="text-sm text-gray-600 mb-4">Fast repository analysis with user repos, issues, PRs, and health reports</p>
                  <div className="text-xs text-gray-500 mb-4">✅ 6 optimized MCP requests</div>
                  <div className="text-xs text-purple-600 mb-4">🔧 Environment variables for security</div>
                </div>
                
                {/* Sample Queries */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sample Queries</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleQueries.github.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setMcpQuery(query)}
                        className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setActiveTab('execute')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Queries
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/postman-collections/github-mcp-unified.json');
                        const collection = await response.json();
                        
                        const apiResponse = await fetch('/api/postman/create-collection', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ collection, createInWeb: false }),
                        });
                        
                        const result = await apiResponse.json();
                        
                        if (result.success) {
                          setDeploymentStatus({
                            type: 'success',
                            message: 'GitHub MCP Collection created successfully in Postman Desktop!'
                          });
                        } else {
                          if (result.fallback) {
                            const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
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
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                    Add to Postman
                  </button>
                </div>
              </div>
            )}

            {activeMCP === 'filesystem' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Filesystem MCP</h3>
                  <p className="text-sm text-gray-600 mb-4">Official MCP server with HTTP wrapper for Postman integration</p>
                  <div className="text-xs text-gray-500 mb-4">✅ 11 official tools + HTTP API</div>
                  <div className="text-xs text-green-600 mb-4">🌐 HTTP wrapper for Postman</div>
                </div>
                
                {/* Sample Queries */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sample Queries</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleQueries.filesystem.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setMcpQuery(query)}
                        className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setActiveTab('execute')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Queries
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/postman-collections/official-filesystem-mcp-fixed.json');
                        const collection = await response.json();
                        
                        const apiResponse = await fetch('/api/postman/create-collection', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ collection, createInWeb: false }),
                        });
                        
                        const result = await apiResponse.json();
                        
                        if (result.success) {
                          setDeploymentStatus({
                            type: 'success',
                            message: 'Filesystem MCP Collection created successfully in Postman Desktop!'
                          });
                        } else {
                          if (result.fallback) {
                            const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
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
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                    Add to Postman
                  </button>
                </div>
              </div>
            )}

            {activeMCP === 'sqlite' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SQLite MCP</h3>
                  <p className="text-sm text-gray-600 mb-4">Database operations with Docker HTTP mode for Postman integration</p>
                  <div className="text-xs text-gray-500 mb-4">✅ 15 database tools + HTTP API</div>
                  <div className="text-xs text-blue-600 mb-4">🐳 Docker HTTP mode for API testing</div>
                </div>
                
                {/* Sample Queries */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sample Queries</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleQueries.sqlite.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setMcpQuery(query)}
                        className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setActiveTab('execute')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Queries
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/postman-collections/sqlite-mcp-server.json');
                        const collection = await response.json();
                        
                        const apiResponse = await fetch('/api/postman/create-collection', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ collection, createInWeb: false }),
                        });
                        
                        const result = await apiResponse.json();
                        
                        if (result.success) {
                          setDeploymentStatus({
                            type: 'success',
                            message: 'SQLite MCP Collection created successfully in Postman Desktop!'
                          });
                        } else {
                          if (result.fallback) {
                            const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
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
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
                    Add to Postman
                  </button>
                </div>
              </div>
            )}

            {!activeMCP && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an MCP Server</h3>
                <p className="text-gray-600">Choose a tab above to explore MCP operations and sample queries</p>
              </div>
            )}
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeMCP.charAt(0).toUpperCase() + activeMCP.slice(1)} MCP Operations
            </h3>
            <button
              onClick={() => setActiveMCP(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('execute')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'execute'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Execute Queries
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collections
              </button>
            </nav>
          </div>

                    {activeTab === 'execute' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Query Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MCP Query
                  </label>
                  <textarea
                    value={mcpQuery}
                    onChange={(e) => setMcpQuery(e.target.value)}
                    placeholder={
                      activeMCP === 'github'
                        ? "e.g., 'List my repositories', 'Get issues for postman-labs', 'Show repository health'" :
                      activeMCP === 'filesystem'
                        ? "e.g., 'List files in sample-docs', 'Read ai-healthcare.txt', 'Search for files containing AI'" :
                      activeMCP === 'sqlite'
                        ? "e.g., 'List all tables', 'Show users table schema', 'Execute SELECT * FROM users LIMIT 5'" :
                        "Enter your MCP query..."
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => executeMCPQuery(activeMCP, mcpQuery, false)}
                    disabled={!mcpQuery.trim() || isExecuting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? 'Executing...' : 'Execute Query'}
                  </button>
                  <button
                    onClick={() => executeMCPQuery(activeMCP, mcpQuery, true)}
                    disabled={!mcpQuery.trim() || isExecuting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? 'Creating...' : 'Execute & Create Collection'}
                  </button>
                </div>

                {/* Sample Queries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Queries
                  </label>
                  <div className="space-y-2">
                    {sampleQueries[activeMCP || 'github'].map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setMcpQuery(query)}
                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Results Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Results
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 h-96 overflow-auto">
                  {mcpResult ? (
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(mcpResult, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Code className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm">Execute a query to see results here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Generate Postman collections for {activeMCP} MCP operations. Use the Execute tab to test queries first, then create collections with real data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/postman-collections/${activeMCP}-mcp-${activeMCP === 'github' ? 'unified' : activeMCP === 'filesystem' ? 'official-fixed' : 'server'}.json`);
                      const collection = await response.json();
                      
                      const apiResponse = await fetch('/api/postman/create-collection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ collection, createInWeb: false }),
                      });
                      
                      const result = await apiResponse.json();
                      
                      if (result.success) {
                        setDeploymentStatus({
                          type: 'success',
                          message: `${activeMCP.charAt(0).toUpperCase() + activeMCP.slice(1)} MCP Collection created successfully in Postman Desktop!`
                        });
                      } else {
                        setDeploymentStatus({
                          type: 'error',
                          message: 'Failed to create collection'
                        });
                      }
                    } catch (error) {
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Failed to create collection'
                      });
                    }
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img src="/postman-logo.svg" alt="Postman" className="w-6 h-6" />
                    <div>
                      <h4 className="font-medium text-gray-900">Static Collection</h4>
                      <p className="text-sm text-gray-600">Pre-built collection with sample data</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    if (mcpResult) {
                      executeMCPQuery(activeMCP, mcpQuery, true);
                    } else {
                      setDeploymentStatus({
                        type: 'error',
                        message: 'Execute a query first to create a dynamic collection'
                      });
                    }
                  }}
                  disabled={!mcpResult}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Dynamic Collection</h4>
                      <p className="text-sm text-gray-600">Collection based on executed query results</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
