import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const collection = {
      info: {
        name: "Protocol Comparison Collection",
        description: "Compare REST, GraphQL, and gRPC performance for GraphRAG queries with latency and analytics tracking",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      variable: [
        {
          key: "base_url",
          value: "http://localhost:3000",
          type: "string"
        },
        {
          key: "graph_id",
          value: "graph_1755797167093",
          type: "string"
        },
        {
          key: "test_query",
          value: "What are the key relationships between AI and healthcare?",
          type: "string"
        },
        {
          key: "model",
          value: "gpt-5-nano",
          type: "string"
        }
      ],
      item: [
        {
          name: "🏁 Protocol Comparison Tests",
          item: [
            {
              name: "Run Full Protocol Comparison",
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
                    query: "{{test_query}}",
                    graphId: "{{graph_id}}",
                    model: "{{model}}"
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/protocol-comparison",
                  host: ["{{base_url}}"],
                  path: ["api", "protocol-comparison"]
                },
                description: "Run the same query across REST, GraphQL, and gRPC to compare performance"
              },
              response: []
            }
          ]
        },
        {
          name: "🌐 Individual REST Tests",
          item: [
            {
              name: "GraphRAG Query (REST)",
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
                    query: "{{test_query}}",
                    graphId: "{{graph_id}}",
                    model: "{{model}}",
                    includeAnalytics: true
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/graphrag/query",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "query"]
                },
                description: "Test GraphRAG query via REST API with full analytics"
              },
              response: []
            },
            {
              name: "Get Graph Data (REST)",
              request: {
                method: "GET",
                header: [],
                url: {
                  raw: "{{base_url}}/api/graphrag/graph/{{graph_id}}",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "graph", "{{graph_id}}"]
                },
                description: "Get graph data via REST API for latency comparison"
              },
              response: []
            }
          ]
        },
        {
          name: "🔧 Individual GraphQL Tests",
          item: [
            {
              name: "GraphRAG Query (GraphQL)",
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
    }
  }
}`,
                    variables: {
                      input: {
                        query: "{{test_query}}",
                        graphId: "{{graph_id}}",
                        model: "{{model}}"
                      }
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/graphql",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Test GraphRAG query via GraphQL with performance metrics"
              },
              response: []
            },
            {
              name: "Get Graph Data (GraphQL)",
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
      density
      connectivity
    }
  }
}`,
                    variables: {
                      id: "{{graph_id}}"
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/graphql",
                  host: ["{{base_url}}"],
                  path: ["api", "graphql"]
                },
                description: "Get graph data via GraphQL for latency comparison"
              },
              response: []
            }
          ]
        },
        {
          name: "⚡ Individual gRPC Tests",
          item: [
            {
              name: "GraphRAG Query (gRPC Mock)",
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
                    service: "GraphRAGService",
                    method: "QueryGraph",
                    message: {
                      query: "{{test_query}}",
                      graph_id: "{{graph_id}}",
                      model: "{{model}}",
                      streaming: false
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/grpc/graphrag/query",
                  host: ["{{base_url}}"],
                  path: ["api", "grpc", "graphrag", "query"]
                },
                description: "Mock gRPC query for performance comparison (would be actual gRPC in production)"
              },
              response: []
            },
            {
              name: "Stream Graph Traversal (gRPC Mock)",
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
                    service: "GraphRAGService",
                    method: "TraverseGraph",
                    message: {
                      graph_id: "{{graph_id}}",
                      start_node: "node_0",
                      depth: 3,
                      streaming: true
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/grpc/graph/traverse",
                  host: ["{{base_url}}"],
                  path: ["api", "grpc", "graph", "traverse"]
                },
                description: "Mock gRPC streaming traversal for performance comparison"
              },
              response: []
            }
          ]
        },
        {
          name: "📊 Performance Analytics",
          item: [
            {
              name: "Get Comparison Analytics",
              request: {
                method: "GET",
                header: [],
                url: {
                  raw: "{{base_url}}/api/protocol-comparison/analytics",
                  host: ["{{base_url}}"],
                  path: ["api", "protocol-comparison", "analytics"]
                },
                description: "Get aggregated performance analytics across all protocols"
              },
              response: []
            },
            {
              name: "Protocol Benchmarks",
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
                    queries: [
                      "What are the main entities in this graph?",
                      "How are healthcare and AI connected?",
                      "What are the most important relationships?",
                      "Give me a summary of the knowledge graph."
                    ],
                    graphId: "{{graph_id}}",
                    iterations: 3
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/protocol-comparison/benchmark",
                  host: ["{{base_url}}"],
                  path: ["api", "protocol-comparison", "benchmark"]
                },
                description: "Run multiple queries across protocols for comprehensive benchmarking"
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
              "// Protocol Comparison Pre-request Script",
              "const startTime = Date.now();",
              "pm.environment.set('request_start_time', startTime);",
              "console.log('Starting protocol comparison at:', new Date(startTime).toISOString());"
            ]
          }
        },
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              "// Protocol Comparison Test Script",
              "const startTime = pm.environment.get('request_start_time');",
              "const endTime = Date.now();",
              "const latency = endTime - startTime;",
              "",
              "pm.test('Response is valid JSON', function () {",
              "    pm.response.to.have.jsonBody();",
              "});",
              "",
              "pm.test('Response time is recorded', function () {",
              "    pm.expect(pm.response.responseTime).to.be.above(0);",
              "    console.log('Response time:', pm.response.responseTime + 'ms');",
              "    console.log('Total latency:', latency + 'ms');",
              "});",
              "",
              "pm.test('Status code is successful', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "// Store performance metrics",
              "if (pm.response.code === 200) {",
              "    const responseBody = pm.response.json();",
              "    ",
              "    // For comparison endpoint",
              "    if (responseBody.results) {",
              "        responseBody.results.forEach(result => {",
              "            console.log(`${result.protocol}: ${result.latency}ms, ${result.payloadSize} bytes`);",
              "        });",
              "        ",
              "        pm.environment.set('fastest_protocol', responseBody.analytics.fastest);",
              "        pm.environment.set('most_efficient_protocol', responseBody.analytics.mostEfficient);",
              "    }",
              "    ",
              "    // Store payload size",
              "    const payloadSize = JSON.stringify(responseBody).length;",
              "    pm.environment.set('last_payload_size', payloadSize);",
              "    console.log('Payload size:', payloadSize + ' bytes');",
              "}",
              "",
              "pm.test('Performance metrics available', function () {",
              "    const responseBody = pm.response.json();",
              "    if (responseBody.performance || responseBody.results) {",
              "        pm.expect(true).to.be.true;",
              "    } else {",
              "        pm.expect(false).to.be.true;",
              "    }",
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
          'Content-Disposition': 'attachment; filename="protocol-comparison-collection.json"'
        }
      });
    }

  } catch (error) {
    console.error('Error generating protocol comparison Postman collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate protocol comparison Postman collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
