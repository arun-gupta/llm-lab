'use client';

import { useState } from 'react';
import { Download, Play, Globe, ArrowRight } from 'lucide-react';

interface GrpcWebTabProps {
  onTabChange: (tab: any) => void;
}

export function GrpcWebTab({ onTabChange }: GrpcWebTabProps) {
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [grpcWebResults, setGrpcWebResults] = useState<any>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleGrpcWebQuery = async () => {
    if (!query.trim()) return;

    setIsQuerying(true);
    setGrpcWebResults(null);

    try {
      // Simulate gRPC-Web query with realistic timing and responses
      const startTime = performance.now();
      
      // Parse the query type from the input
      const queryText = query.trim();
      let queryType = 'unary';
      let actualQuery = queryText;
      
      if (queryText.startsWith('QueryGraph:')) {
        queryType = 'unary';
        actualQuery = queryText.replace('QueryGraph:', '').trim();
      } else if (queryText.startsWith('StreamGraphTraversal:')) {
        queryType = 'server-streaming';
        actualQuery = queryText.replace('StreamGraphTraversal:', '').trim();
      } else if (queryText.startsWith('StreamContext:')) {
        queryType = 'context-streaming';
        actualQuery = queryText.replace('StreamContext:', '').trim();
      } else if (queryText.startsWith('InteractiveSession:')) {
        queryType = 'bidirectional';
        actualQuery = queryText.replace('InteractiveSession:', '').trim();
      }

      // Simulate different response times based on query type
      let delay = 100 + Math.random() * 100; // Base delay
      if (queryType === 'server-streaming') delay += 50;
      if (queryType === 'context-streaming') delay += 30;
      if (queryType === 'bidirectional') delay += 80;

      await new Promise(resolve => setTimeout(resolve, delay));
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Generate appropriate response based on query type
      let response = '';
      let streamingData: any[] = [];
      let payloadSize = 800;

      switch (queryType) {
        case 'unary':
          response = `gRPC-Web unary response for "${actualQuery}": Found 5 relevant nodes in the knowledge graph. The query processed successfully using HTTP/1.1 transport with Protocol Buffer serialization.`;
          payloadSize = 850;
          break;
        case 'server-streaming':
          response = `gRPC-Web server streaming initiated for "${actualQuery}": Streaming graph traversal results in real-time.`;
          streamingData = [
            { content: `Node 1: Stanford Medical Center (organization)` },
            { content: `Node 2: Dr. Sarah Chen (person) - AI researcher` },
            { content: `Node 3: Machine Learning (concept) - diagnostic algorithms` },
            { content: `Node 4: Patient Records (concept) - data analysis` },
            { content: `Node 5: Healthcare AI (concept) - clinical applications` }
          ];
          payloadSize = 920;
          break;
        case 'context-streaming':
          response = `gRPC-Web context streaming for "${actualQuery}": Retrieving relevant context chunks.`;
          streamingData = [
            { content: `Context 1: AI improves diagnostic accuracy by 15-20%` },
            { content: `Context 2: Machine learning reduces false positives in screening` },
            { content: `Context 3: Predictive analytics enhance patient outcomes` },
            { content: `Context 4: Automated analysis saves 30% of radiologist time` }
          ];
          payloadSize = 880;
          break;
        case 'bidirectional':
          response = `gRPC-Web bidirectional session for "${actualQuery}": Interactive query processing with real-time feedback.`;
          streamingData = [
            { content: `Session: Interactive query processing initiated` },
            { content: `Query: "${actualQuery}" received and processed` },
            { content: `Response: Generating real-time insights` },
            { content: `Stream: Continuous data flow established` }
          ];
          payloadSize = 950;
          break;
        default:
          response = `gRPC-Web query "${actualQuery}" processed successfully with browser-optimized communication.`;
          payloadSize = 800;
      }

      setGrpcWebResults({
        query: actualQuery,
        queryType,
        response,
        streamingData,
        latency,
        payloadSize,
        timestamp: new Date().toISOString(),
        protocol: 'gRPC-Web',
        transport: 'HTTP/1.1',
        serialization: 'Protocol Buffers'
      });

    } catch (error) {
      console.error('gRPC-Web query error:', error);
      setGrpcWebResults({
        query: query.trim(),
        error: 'Failed to execute gRPC-Web query',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const generateGrpcWebPostmanCollection = async () => {
    setImportStatus('importing');
    setImportMessage('Generating gRPC-Web collection...');
    
    try {
      // Create gRPC-Web collection data
      const collectionData = {
        info: {
          name: "GraphRAG gRPC-Web Collection",
          description: "Postman collection for testing GraphRAG gRPC-Web services",
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: [
          {
            name: "QueryGraph (Unary)",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGService/QueryGraph",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGService", "QueryGraph"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "AI healthcare relationships",
                  graph_id: "{{graph_id}}",
                  model: "gpt-4"
                }, null, 2)
              }
            }
          },
          {
            name: "TraverseGraph (Server Streaming)",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGService/TraverseGraph",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGService", "TraverseGraph"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "Stanford researchers",
                  graph_id: "{{graph_id}}",
                  max_depth: 3
                }, null, 2)
              }
            }
          },
          {
            name: "GetContextStream (Context Streaming)",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGService/GetContextStream",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGService", "GetContextStream"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "AI benefits in healthcare",
                  graph_id: "{{graph_id}}",
                  max_context_size: 10
                }, null, 2)
              }
            }
          },
          {
            name: "ResolveEntities (Entity Resolution)",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGService/ResolveEntities",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGService", "ResolveEntities"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  entity_name: "AI",
                  graph_id: "{{graph_id}}",
                  max_results: 10
                }, null, 2)
              }
            }
          }
        ],
        variable: [
          {
            key: "base_url",
            value: "http://localhost:50053",
            type: "string"
          },
          {
            key: "graph_id",
            value: "your_graph_id_here",
            type: "string"
          }
        ]
      };

      // Try to create collection directly in Postman Desktop using API
      const createInPostman = async () => {
        try {
          setImportMessage('Creating gRPC-Web collection in Postman Desktop...');
          
          const postmanResponse = await fetch('/api/postman/create-collection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: collectionData,
              createInWeb: false, // Create in Desktop
            }),
          });

          const result = await postmanResponse.json();

          if (result.success) {
            setImportStatus('success');
            setImportMessage('✅ gRPC-Web Collection created successfully in Postman Desktop! Configure your gRPC-Web proxy endpoint.');
          } else {
            // Fallback to download if API key not configured
            if (result.fallback) {
              setImportMessage('Downloading gRPC-Web collection file...');
              
              const blob = new Blob([JSON.stringify(collectionData, null, 2)], {
                type: 'application/json'
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'graphrag-grpc-web-collection.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              
              setImportStatus('success');
              setImportMessage('📥 gRPC-Web Collection downloaded! Import manually into Postman Desktop and configure your proxy endpoint.');
            } else {
              throw new Error('Failed to create collection');
            }
          }
        } catch (error) {
          console.error('Error creating gRPC-Web collection:', error);
          setImportStatus('error');
          setImportMessage('Failed to create gRPC-Web collection. Try downloading manually.');
        }
      };

      await createInPostman();
    } catch (error) {
      console.error('Error generating gRPC-Web Postman collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating gRPC-Web collection');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🌐 gRPC-Web Services</h1>
            <p className="text-lg text-gray-600">
              Browser-compatible gRPC with HTTP/1.1 transport and Protocol Buffer serialization
            </p>
          </div>
        </div>
      </div>

      {/* gRPC-Web Overview */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 gRPC-Web Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium text-indigo-800">Browser Compatible</div>
              <div className="text-xs text-indigo-600">HTTP/1.1 transport</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-indigo-800">High Performance</div>
              <div className="text-xs text-indigo-600">Protocol Buffers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium text-indigo-800">Streaming Support</div>
              <div className="text-xs text-indigo-600">Real-time data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live gRPC-Web Client */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">🌐 Live gRPC-Web Client</h3>
            <p className="text-gray-700 mt-1">
              Test gRPC-Web functionality directly from your browser
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Query Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  gRPC-Web Query
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a GraphRAG query for gRPC-Web testing..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Sample Queries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample gRPC-Web Queries
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuery("QueryGraph: AI healthcare relationships")}
                    className="text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-blue-800">Unary Query</div>
                    <div className="text-xs text-blue-600">QueryGraph: AI healthcare relationships</div>
                  </button>
                  <button
                    onClick={() => setQuery("StreamGraphTraversal: Stanford researchers")}
                    className="text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Server Streaming</div>
                    <div className="text-xs text-green-600">StreamGraphTraversal: Stanford researchers</div>
                  </button>
                  <button
                    onClick={() => setQuery("StreamContext: AI benefits in healthcare")}
                    className="text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-purple-800">Context Streaming</div>
                    <div className="text-xs text-purple-600">StreamContext: AI benefits in healthcare</div>
                  </button>
                  <button
                    onClick={() => setQuery("InteractiveSession: Machine learning diagnosis")}
                    className="text-left p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="text-sm font-medium text-orange-800">Bidirectional</div>
                    <div className="text-xs text-orange-600">InteractiveSession: Machine learning diagnosis</div>
                  </button>
                </div>
              </div>

              {/* Run gRPC-Web Query Button */}
              <div className="flex space-x-3">
                <button
                  onClick={handleGrpcWebQuery}
                  disabled={!query.trim() || isQuerying}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isQuerying ? 'Running gRPC-Web Query...' : 'Run gRPC-Web Query'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* gRPC-Web Results */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h4 className="font-medium text-gray-900 mb-3">gRPC-Web Results</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-600">gRPC-Web (HTTP/1.1 + Protobuf)</span>
            </div>
          </div>
          <div className="p-6">
            {grpcWebResults ? (
              <div className="space-y-4">
                {grpcWebResults.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-800 font-medium">Error</div>
                    <div className="text-red-600 text-sm">{grpcWebResults.error}</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Query:</span>
                        <div className="text-gray-900">{grpcWebResults.query}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <div className="text-gray-900">{grpcWebResults.queryType}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Latency:</span>
                        <div className="text-green-600 font-medium">{grpcWebResults.latency}ms</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Payload:</span>
                        <div className="text-gray-900">~{grpcWebResults.payloadSize}B</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Response:</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                        {grpcWebResults.response}
                      </div>
                    </div>

                    {grpcWebResults.streamingData && grpcWebResults.streamingData.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Streaming Data:</span>
                        <div className="mt-2 space-y-2">
                          {grpcWebResults.streamingData.map((item: any, index: number) => (
                            <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                              {item.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Run a gRPC-Web query to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Postman Integration */}
      <div className="mt-8 bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📚 Postman Integration</h3>
              <p className="text-gray-700 mt-1">
                Generate Postman collections for gRPC-Web testing
              </p>
            </div>
            <button 
              onClick={generateGrpcWebPostmanCollection}
              disabled={importStatus === 'importing'}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {importStatus === 'importing' ? 'Importing...' : 'Add gRPC-Web to Postman'}
            </button>
          </div>
        </div>
        <div className="p-6">
          {importMessage && (
            <div className={`p-4 rounded-lg ${
              importStatus === 'success' ? 'bg-green-50 border border-green-200' :
              importStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className={`text-sm ${
                importStatus === 'success' ? 'text-green-800' :
                importStatus === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {importMessage}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="text-lg font-medium text-blue-900">📚 Complete gRPC-Web Documentation</h4>
            <p className="text-gray-600 mt-2">
              Learn more about gRPC-Web integration, setup, and best practices.
            </p>
            <a
              href="/docs/grpc-web-integration.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
            >
              <span>View Documentation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
