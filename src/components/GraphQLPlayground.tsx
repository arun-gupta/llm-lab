'use client';
import { useState, useEffect } from 'react';

export function GraphQLPlayground() {
  const [availableGraphs, setAvailableGraphs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">GraphQL Playground</h2>
        <p className="text-gray-600 mb-4">
          Test GraphQL queries for the GraphRAG system. The playground includes example queries to get you started.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Editor */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GraphQL Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
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
              className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
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
          <div className="w-full h-[calc(24rem+8rem)] p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 overflow-auto">
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
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
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
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
