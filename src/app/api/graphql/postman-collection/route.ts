import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const collection = {
      info: {
        name: "GraphRAG GraphQL API Collection",
        description: "Postman collection for GraphRAG GraphQL API with queries, mutations, and subscriptions",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      variable: [
        {
          key: "base_url",
          value: "http://localhost:3000",
          type: "string"
        },
        {
          key: "graphql_endpoint",
          value: "{{base_url}}/api/graphql",
          type: "string"
        }
      ],
      item: [
        {
          name: "📊 Analytics & Insights",
          item: [
            {
              name: "Get Analytics Overview",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetAnalytics {
  analytics {
    graphStats {
      totalGraphs
      totalNodes
      totalEdges
      averageNodesPerGraph
      averageEdgesPerGraph
      nodeTypes
      edgeTypes
    }
    documentStats {
      totalDocuments
      documentTypes
      averageDocumentSize
      sampleDocuments
    }
    insights {
      mostCommonEntities
      mostCommonRelationships
      graphDensity
      connectivityScore
    }
    timestamp
    version
  }
}`
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get comprehensive analytics and insights about the GraphRAG system"
              },
              response: []
            }
          ]
        },
        {
          name: "🕸️ Graph Operations",
          item: [
            {
              name: "Get All Graphs",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetGraphs {
  graphs {
    id
    name
    stats {
      totalNodes
      totalEdges
      nodeTypes
      edgeTypes
      density
      connectivity
    }
    createdAt
    updatedAt
  }
}`
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Retrieve all knowledge graphs with their statistics"
              },
              response: []
            },
            {
              name: "Get Specific Graph",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetGraph($id: ID!) {
  graph(id: $id) {
    id
    name
    nodes {
      id
      label
      type
      connections
    }
    edges {
      id
      source
      target
      label
      type
    }
    stats {
      totalNodes
      totalEdges
      nodeTypes
      edgeTypes
      density
      connectivity
    }
  }
}`,
                    variables: {
                      "id": "ai-healthcare"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get detailed information about a specific knowledge graph"
              },
              response: []
            },
            {
              name: "Search Entities",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query SearchEntities($query: String!, $graphId: ID, $limit: Int) {
  searchEntities(query: $query, graphId: $graphId, limit: $limit) {
    id
    label
    type
    connections
  }
}`,
                    variables: {
                      "query": "AI",
                      "limit": 10
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Search for entities across all graphs or within a specific graph"
              },
              response: []
            },
            {
              name: "Get Entity Relationships",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetEntityRelationships($entityId: String!, $graphId: ID!, $depth: Int) {
  entityRelationships(entityId: $entityId, graphId: $graphId, depth: $depth) {
    id
    source
    target
    label
    type
  }
}`,
                    variables: {
                      "entityId": "Artificial Intelligence",
                      "graphId": "ai-healthcare",
                      "depth": 2
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get relationships for a specific entity up to a specified depth"
              },
              response: []
            }
          ]
        },
        {
          name: "🔍 GraphRAG Queries",
          item: [
            {
              name: "GraphRAG Query",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GraphRAGQuery($input: GraphRAGQueryInput!) {
  graphRAGQuery(input: $input) {
    query
    model
    graphRAGResponse
    traditionalRAGResponse
    graphContext
    performance {
      graphRAGLatency
      traditionalRAGLatency
      contextRelevance
    }
    analytics {
      tokens {
        graphRAG {
          input
          output
          total
          efficiency
          cost
        }
        traditionalRAG {
          input
          output
          total
          efficiency
          cost
        }
      }
      quality {
        graphRAG {
          length
          completeness
          specificity
          readability
        }
        traditionalRAG {
          length
          completeness
          specificity
          readability
        }
      }
      graph {
        totalNodes
        totalEdges
        usedEntities
        usedRelationships
        coveragePercentage
        relationshipUtilization
        entityTypeDistribution
      }
    }
  }
}`,
                    variables: {
                      "input": {
                        "query": "What are the key relationships between AI and healthcare?",
                        "graphId": "ai-healthcare",
                        "model": "gpt-5-nano"
                      }
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Execute a GraphRAG query comparing GraphRAG vs Traditional RAG with full analytics"
              },
              response: []
            }
          ]
        },
        {
          name: "📄 Document Operations",
          item: [
            {
              name: "Get All Documents",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetDocuments {
  documents {
    id
    name
    type
    size
    content
    uploadedAt
  }
}`
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Retrieve all available documents"
              },
              response: []
            },
            {
              name: "Get Specific Document",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetDocument($id: ID!) {
  document(id: $id) {
    id
    name
    type
    size
    content
    uploadedAt
  }
}`,
                    variables: {
                      "id": "ai-healthcare"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get detailed information about a specific document"
              },
              response: []
            }
          ]
        },
        {
          name: "🛠️ Graph Management",
          item: [
            {
              name: "Delete Graph",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `mutation DeleteGraph($id: ID!) {
  deleteGraph(id: $id)
}`,
                    variables: {
                      "id": "temp-graph-id"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Delete a knowledge graph by ID"
              },
              response: []
            },
            {
              name: "Update Graph Metadata",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `mutation UpdateGraph($id: ID!, $name: String) {
  updateGraph(id: $id, name: $name) {
    id
    name
    stats {
      totalNodes
      totalEdges
    }
    updatedAt
  }
}`,
                    variables: {
                      "id": "ai-healthcare",
                      "name": "Updated AI Healthcare Graph"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Update metadata for a knowledge graph"
              },
              response: []
            }
          ]
        },
        {
          name: "📈 Graph Statistics",
          item: [
            {
              name: "Get Graph Statistics",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    query: `query GetGraphStatistics($id: ID!) {
  graphStatistics(id: $id) {
    totalNodes
    totalEdges
    nodeTypes
    edgeTypes
    density
    connectivity
  }
}`,
                    variables: {
                      "id": "ai-healthcare"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{graphql_endpoint}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get detailed statistics for a specific graph"
              },
              response: []
            }
          ]
        }
      ],
      event: [
        {
          listen: "prerequest",
          script: {
            type: "text/javascript",
            exec: [
              "// GraphQL API Pre-request Script",
              "console.log('Executing GraphQL request to:', pm.variables.get('graphql_endpoint'));"
            ]
          }
        },
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              "// GraphQL API Test Script",
              "pm.test('Response is valid JSON', function () {",
              "    pm.response.to.have.jsonBody();",
              "});",
              "",
              "pm.test('No GraphQL errors', function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData.errors).to.be.undefined;",
              "});",
              "",
              "pm.test('Response time is acceptable', function () {",
              "    pm.expect(pm.response.responseTime).to.be.below(5000);",
              "});"
            ]
          }
        }
      ]
    };

    // Check if this is a request for direct import or file download
    const acceptHeader = request.headers.get('accept');
    const isDirectImport = acceptHeader?.includes('application/json') && !request.headers.get('content-type')?.includes('multipart');

    if (isDirectImport) {
      // Return JSON for direct import
      return NextResponse.json(collection);
    } else {
      // Return file download
      return new NextResponse(JSON.stringify(collection, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="graphrag-graphql-collection.json"'
        }
      });
    }

  } catch (error) {
    console.error('Error generating GraphQL Postman collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate GraphQL Postman collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
