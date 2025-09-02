'use client';

import { useState, useEffect } from 'react';
import { Library, Plus, Search, Star, Download, Share2, Users, TrendingUp, Code, Zap, Database, Globe, X } from 'lucide-react';
import { CollectionPreviewModal } from '../CollectionPreviewModal';

export function MCPTab() {

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUltraFastModal, setShowUltraFastModal] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // MCP Execution States
  const [activeMCP, setActiveMCP] = useState<'github' | 'filesystem' | 'sqlite' | null>('github');
  const [activeTab, setActiveTab] = useState<'execute'>('execute');
  const [mcpQuery, setMcpQuery] = useState('');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample queries for each MCP type
  const sampleQueries = {
    github: [
      "Initialize MCP Session (Optional)",
      "Get User Repositories",
      "Get Repository Information",
      "Get Repository Issues", 
      "Get Pull Requests",
      "Generate Repository Health Report"
    ],
    filesystem: [
      "Health Check",
      "List Allowed Directories",
      "List Directory Contents (/private/tmp)",
      "List Directory Contents (/Users/arungupta/Desktop)",
      "Write Test File",
      "Read Test File",
      "Get File Information",
      "Create Test Directory",
      "Search for Test Files",
      "Show Test File Metadata",
      "Show Test Directory Contents"
    ],
    sqlite: [
      "Health Check",
      "Server Info",
      "List Tools",
      "List Tables",
      "Describe Table",
      "Run Query",
      "Insert Row",
      "Update Row",
      "Delete Row",
      "Execute Tool - List Tables",
      "Execute Tool - Describe Table",
      "Execute Tool - Run Query",
      "Execute Tool - Insert Row",
      "Execute Tool - Update Row",
      "Execute Tool - Delete Row"
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
        // Handle specific error cases with user-friendly messages
        let errorMessage = result.error || 'MCP query failed';
        
        // Provide more specific error messages based on the error content
        if (errorMessage.includes('Failed to read directory')) {
          errorMessage = 'Directory not found or not accessible. Please check the path and try again.';
        } else if (errorMessage.includes('Failed to read file')) {
          errorMessage = 'File not found or not accessible. Please check the file path and try again.';
        } else if (errorMessage.includes('File path is required')) {
          errorMessage = 'Please specify a file or directory path in your query.';
        } else if (errorMessage.includes('Unknown operation')) {
          errorMessage = 'This operation is not supported. Please try a different query.';
        } else if (errorMessage.includes('Failed to search files')) {
          errorMessage = 'Unable to search files. Please check the directory path and search term.';
        }
        
        setDeploymentStatus({
          type: 'error',
          message: errorMessage
        });
        
        // Also set the result to show the error in the results panel
        setMcpResult({
          error: true,
          message: errorMessage,
          details: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('MCP execution error:', error);
      
      let errorMessage = 'Failed to execute MCP query';
      
      // Handle network and connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to the MCP server. Please check your connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setDeploymentStatus({
        type: 'error',
        message: errorMessage
      });
      
      // Show error in results panel
      setMcpResult({
        error: true,
        message: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error occurred'
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
            {activeMCP && (
              <div className="space-y-6">
                {/* Header for the active MCP, including "Add to Postman" and "X" button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {activeMCP === 'github' && (
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {activeMCP === 'filesystem' && (
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {activeMCP === 'sqlite' && (
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeMCP.charAt(0).toUpperCase() + activeMCP.slice(1)} MCP Operations
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={async () => {
                        try {
                          const collectionFileName = 
                            activeMCP === 'github' ? 'github-mcp-unified.json' :
                            activeMCP === 'filesystem' ? 'official-filesystem-mcp-fixed.json' :
                            activeMCP === 'sqlite' ? 'sqlite-mcp-server.json' : '';
                          
                          const response = await fetch(`/postman-collections/${collectionFileName}`);
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
                            if (result.fallback) {
                              const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = collectionFileName;
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
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
                    >
                      <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4" />
                      <span>Add to Postman</span>
                    </button>
                    <button
                      onClick={() => setActiveMCP(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* MCP Description and Capabilities */}
                {activeMCP === 'github' && (
                  <>
                    <p className="text-sm text-gray-600">Fast repository analysis with user repos, issues, PRs, and health reports</p>
                    <div className="text-xs text-gray-500">✅ 6 optimized MCP requests</div>
                    <div className="text-xs text-purple-600 mb-4">🔧 Environment variables for security</div>
                  </>
                )}
                {activeMCP === 'filesystem' && (
                  <>
                    <p className="text-sm text-gray-600">Official MCP server with HTTP wrapper for Postman integration</p>
                    <div className="text-xs text-gray-500">✅ 11 official tools + HTTP API</div>
                    <div className="text-xs text-green-600 mb-4">🌐 HTTP wrapper for Postman</div>
                  </>
                )}
                {activeMCP === 'sqlite' && (
                  <>
                    <p className="text-sm text-gray-600">Database operations with Docker HTTP mode for Postman integration</p>
                    <div className="text-xs text-gray-500">✅ 15 database tools + HTTP API</div>
                    <div className="text-xs text-blue-600 mb-4">🐳 Docker HTTP mode for API testing</div>
                  </>
                )}

                {/* Internal Tab Navigation */}
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
                                          <div className="flex justify-center">
                      <button
                        onClick={() => executeMCPQuery(activeMCP, mcpQuery, false)}
                        disabled={!mcpQuery.trim() || isExecuting}
                        className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExecuting ? 'Executing...' : 'Execute Query'}
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
                          mcpResult.error ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <span className="text-red-500 text-xl">⚠️</span>
                                </div>
                                <h4 className="text-sm font-medium text-red-800 mb-2">Query Failed</h4>
                                <p className="text-sm text-red-600 mb-3">{mcpResult.message}</p>
                                {mcpResult.details && (
                                  <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
                                    <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto">
                                      {mcpResult.details}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>

                              
                              {/* Show search limitations caveat for GitHub MCP */}
                              {activeMCP === 'github' && mcpResult.search_limitations && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <div className="flex items-start space-x-2">
                                    <span className="text-yellow-600 text-sm">⚠️</span>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                        {mcpResult.search_limitations.note}
                                      </h4>
                                      <p className="text-xs text-yellow-700 mb-2">
                                        {mcpResult.search_limitations.details}
                                      </p>
                                      <div className="text-xs text-yellow-600 space-y-1">
                                        <div><strong>Profile Count:</strong> {mcpResult.search_limitations.profile_count}</div>
                                        <div><strong>Search Count:</strong> {mcpResult.search_limitations.search_count}</div>
                                        <div><em>{mcpResult.search_limitations.explanation}</em></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                {JSON.stringify(mcpResult, null, 2)}
                              </pre>
                            </div>
                          )
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


    </div>
  );
}
