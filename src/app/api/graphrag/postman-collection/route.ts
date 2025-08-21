import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { graphData, responses } = await request.json();

    const collection = {
      info: {
        name: "GraphRAG API Collection",
        description: "Postman collection for GraphRAG (Graph-based Retrieval-Augmented Generation) API testing and comparison",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      variable: [
        {
          key: "base_url",
          value: "http://localhost:3000",
          type: "string"
        },
        {
          key: "openai_api_key",
          value: "{{OPENAI_API_KEY}}",
          type: "string"
        },
        {
          key: "anthropic_api_key",
          value: "{{ANTHROPIC_API_KEY}}",
          type: "string"
        }
      ],
      item: [
        {
          name: "📄 Document Upload & Graph Building",
          item: [
            {
              name: "Upload Documents and Build Graph",
              request: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "multipart/form-data"
                  }
                ],
                body: {
                  mode: "formdata",
                  formdata: [
                    {
                      key: "documents",
                      type: "file",
                      src: []
                    }
                  ]
                },
                url: {
                  raw: "{{base_url}}/api/graphrag/build-graph",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "build-graph"]
                },
                description: "Upload text documents and build a knowledge graph with entities and relationships"
              },
              response: []
            }
          ]
        },
        {
          name: "🔍 GraphRAG Query & Comparison",
          item: [
            {
              name: "Query GraphRAG vs Traditional RAG",
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
                    query: "What are the key relationships between AI and healthcare in our documents?",
                    graphData: {
                      nodes: [],
                      edges: [],
                      stats: {
                        totalNodes: 0,
                        totalEdges: 0,
                        topEntities: []
                      }
                    }
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/graphrag/query",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "query"]
                },
                description: "Compare GraphRAG vs traditional RAG responses with performance metrics"
              },
              response: []
            }
          ]
        },
        {
          name: "📊 Graph Analytics",
          item: [
            {
              name: "Get Graph Statistics",
              request: {
                method: "GET",
                header: [],
                url: {
                  raw: "{{base_url}}/api/graphrag/graph-stats",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "graph-stats"]
                },
                description: "Retrieve statistics about the knowledge graph (nodes, edges, top entities)"
              },
              response: []
            },
            {
              name: "Visualize Graph",
              request: {
                method: "GET",
                header: [],
                url: {
                  raw: "{{base_url}}/api/graphrag/visualize",
                  host: ["{{base_url}}"],
                  path: ["api", "graphrag", "visualize"]
                },
                description: "Get graph visualization data for interactive display"
              },
              response: []
            }
          ]
        },
        {
          name: "🔄 LLM Integration",
          item: [
            {
              name: "Test LLM Providers with Graph Context",
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
                    prompt: "Analyze the relationships in our knowledge graph",
                    context: "Graph context will be automatically added",
                    providers: ["openai:gpt-4o-mini", "anthropic:claude-3-5-haiku-20241022"]
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/llm",
                  host: ["{{base_url}}"],
                  path: ["api", "llm"]
                },
                description: "Test different LLM providers with graph-enhanced prompts"
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
              "// Pre-request script for GraphRAG API",
              "console.log('GraphRAG API Request:', pm.request.url);",
              "",
              "// Add timestamp for tracking",
              "pm.request.headers.add({",
              "    key: 'X-Request-Timestamp',",
              "    value: new Date().toISOString()",
              "});"
            ]
          }
        },
        {
          listen: "test",
          script: {
            type: "text/javascript",
            exec: [
              "// Test script for GraphRAG API",
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response has required fields', function () {",
              "    const jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.have.property('message');",
              "});",
              "",
              "// Log response for debugging",
              "console.log('GraphRAG Response:', pm.response.json());"
            ]
          }
        }
      ]
    };

    // Add example responses if available
    if (responses) {
      collection.item[1].item[0].response = [
        {
          name: "Example GraphRAG Response",
          originalRequest: {
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
                query: responses.query,
                graphData: graphData
              })
            },
            url: {
              raw: "{{base_url}}/api/graphrag/query",
              host: ["{{base_url}}"],
              path: ["api", "graphrag", "query"]
            }
          },
          status: "OK",
          code: 200,
          _postman_previewlanguage: "json",
          header: [
            {
              key: "Content-Type",
              value: "application/json"
            }
          ],
          cookie: [],
          body: JSON.stringify(responses, null, 2)
        }
      ];
    }

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
          'Content-Disposition': 'attachment; filename="graphrag-collection.json"'
        }
      });
    }

  } catch (error) {
    console.error('Error generating Postman collection:', error);
    return NextResponse.json(
      { error: 'Failed to generate Postman collection' },
      { status: 500 }
    );
  }
}
