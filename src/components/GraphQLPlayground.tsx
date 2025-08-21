'use client';
import { useState } from 'react';

export function GraphQLPlayground() {
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
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
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
      setLoading(false);
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
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Executing...' : 'Execute Query'}
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
              setVariables('{"input": {"query": "What is AI?", "graphId": "ai-healthcare", "model": "gpt-5-nano"}}');
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
