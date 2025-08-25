'use client';
import { useState, useEffect } from 'react';
import { SuccessCelebration } from './SuccessCelebration';

export function GraphQLPlayground() {
  const [availableGraphs, setAvailableGraphs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'manual' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  
  // Fetch available graphs on component mount
  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetGraphs {
              graphs {
                id
                name
                stats {
                  totalNodes
                  totalEdges
                }
              }
            }`
          })
        });
        
        const data = await response.json();
        if (data.data?.graphs) {
          setAvailableGraphs(data.data.graphs.map((g: any) => g.id));
        }
      } catch (error) {
        console.warn('Could not fetch available graphs:', error);
      }
    };
    
    fetchGraphs();
  }, []);

  const [query, setQuery] = useState(`# GraphRAG GraphQL Playground
# Welcome! Try this example query to get started:

query GetAnalytics {
  analytics {
    graphStats {
      totalGraphs
      totalNodes
      totalEdges
      averageNodesPerGraph
      averageEdgesPerGraph
    }
    insights {
      mostCommonEntities
      graphDensity
      connectivityScore
    }
    timestamp
    version
  }
}`);
  
  const [variables, setVariables] = useState(`{
  "query": "AI"
}`);
  
  const [result, setResult] = useState('');

  const executeQuery = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : undefined,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePostmanCollection = async () => {
    setImportStatus('importing');
    setImportMessage('Generating GraphQL collection...');
    
    try {
      const response = await fetch('/api/graphql/postman-collection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const collectionData = await response.json();
        
        // Try to create collection directly in Postman Desktop using API
        const createInPostman = async () => {
          try {
            setImportMessage('Creating collection in Postman Desktop...');
            
            // Use the same API as MCP tab for direct Postman integration
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
              setShowSuccessCelebration(true);
              
              // Don't open Postman Desktop automatically - just show success message
            } else {
              // Fallback to download if API key not configured
              if (result.fallback) {
                setImportMessage('Downloading collection file...');
                
                const blob = new Blob([JSON.stringify(collectionData, null, 2)], {
                  type: 'application/json'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'graphrag-graphql-collection.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setImportStatus('manual');
                setImportMessage('📥 GraphQL Collection downloaded! Import manually into Postman Desktop.');
              } else {
                setImportStatus('error');
                setImportMessage('❌ Failed to create collection. Please try again.');
              }
            }
          } catch (error) {
            console.error('Error creating collection in Postman:', error);
            setImportStatus('error');
            setImportMessage('❌ Error creating collection. Please try again.');
          }
        };

        await createInPostman();
      } else {
        setImportStatus('error');
        setImportMessage('❌ Failed to generate collection. Please try again.');
      }
    } catch (error) {
      console.error('Error generating collection:', error);
      setImportStatus('error');
      setImportMessage('❌ Error generating collection. Please try again.');
    }
  };

  return (
          <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">GraphQL Playground</h2>
          <p className="text-gray-700 mb-2">
            Test GraphQL queries for the GraphRAG system. The playground includes example queries to get you started.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
                      <button
              onClick={generatePostmanCollection}
              disabled={importStatus === 'importing'}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
              {importStatus === 'importing' ? 'Importing...' : 'Add GraphQL to Postman'}
            </button>
          
          {importStatus !== 'idle' && (
            <div className={`px-4 py-3 rounded-lg text-sm max-w-md ${
              importStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              importStatus === 'manual' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
              importStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start space-x-2">
                {importStatus === 'success' && (
                  <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="leading-relaxed">{importMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Query Editor */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GraphQL Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900"
              placeholder="Enter your GraphQL query here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variables (JSON)
            </label>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900"
              placeholder='{"key": "value"}'
            />
          </div>

          <button
            onClick={executeQuery}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
        </div>

        {/* Results */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Results
          </label>
          <div className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-white overflow-auto">
            {result ? (
              <pre className="whitespace-pre-wrap">{result}</pre>
            ) : (
              <div className="text-gray-500">
                Execute a query to see results here...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Graphs */}
      {availableGraphs.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Available Graph IDs:</h3>
          <div className="flex flex-wrap gap-2">
            {availableGraphs.slice(0, 5).map((graphId) => (
              <span key={graphId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {graphId}
              </span>
            ))}
            {availableGraphs.length > 5 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                +{availableGraphs.length - 5} more
              </span>
            )}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Use these IDs in your GraphRAG queries. The first graph will be used in examples.
          </p>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Quick Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setQuery(`query GetGraphs {
  graphs {
    id
    name
    stats {
      totalNodes
      totalEdges
      nodeTypes
    }
  }
}`);
              setVariables('{}');
            }}
            className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Get All Graphs</div>
            <div className="text-sm text-gray-600">List all knowledge graphs</div>
          </button>

          <button
            onClick={() => {
              setQuery(`query GetAnalytics {
  analytics {
    graphStats {
      totalGraphs
      totalNodes
      totalEdges
      averageNodesPerGraph
      averageEdgesPerGraph
    }
    insights {
      mostCommonEntities
      graphDensity
      connectivityScore
    }
    timestamp
    version
  }
}`);
              setVariables('{}');
            }}
            className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Get Analytics</div>
            <div className="text-sm text-gray-600">System-wide analytics</div>
          </button>

          <button
            onClick={() => {
              setQuery(`query SearchEntities($query: String!) {
  searchEntities(query: $query, limit: 10) {
    id
    label
    type
    connections
  }
}`);
              setVariables('{"query": "AI"}');
            }}
            className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">Search Entities</div>
            <div className="text-sm text-gray-600">Find entities by name</div>
          </button>

          <button
            onClick={() => {
              const graphId = availableGraphs[0] || 'graph_1755797167093';
              setQuery(`query GraphRAGQuery($input: GraphRAGQueryInput!) {
  graphRAGQuery(input: $input) {
    query
    model
    graphRAGResponse
    traditionalRAGResponse
    performance {
      graphRAGLatency
      traditionalRAGLatency
      contextRelevance
    }
    analytics {
      tokens {
        graphRAG {
          total
          cost
        }
        traditionalRAG {
          total
          cost
        }
      }
    }
  }
}`);
              setVariables(`{"input": {"query": "What is AI?", "graphId": "${graphId}", "model": "gpt-5-nano"}}`);
            }}
            className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">GraphRAG Query</div>
            <div className="text-sm text-gray-600">Compare GraphRAG vs Traditional RAG</div>
          </button>
        </div>
      </div>
      
      {/* Success Celebration */}
      <SuccessCelebration
        isVisible={showSuccessCelebration}
        type="collection-created"
        onClose={() => setShowSuccessCelebration(false)}
        data={{
          collectionUrl: undefined,
          hasEnvironment: false
        }}
      />
    </div>
  );
}
