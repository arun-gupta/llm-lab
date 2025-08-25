'use client';

import { useState, useEffect } from 'react';
import { Upload, Network, Search, BarChart3, Download, Code, Zap } from 'lucide-react';
import { GraphPreview } from '@/components/GraphPreview';
import { GraphQLPlayground } from '@/components/GraphQLPlayground';

interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'organization' | 'concept' | 'document';
  connections: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    topEntities: string[];
  };
  graphId?: string;
}

interface GraphRAGResponse {
  query: string;
  graphRAGResponse: string;
  traditionalRAGResponse: string;
  graphContext: string[];
  performance: {
    graphRAGLatency: number;
    traditionalRAGLatency: number;
    contextRelevance: number;
  };
  analytics?: {
    tokens: {
      graphRAG: {
        input: number;
        output: number;
        total: number;
        efficiency: number;
        cost: number;
      };
      traditionalRAG: {
        input: number;
        output: number;
        total: number;
        efficiency: number;
        cost: number;
      };
    };
    quality: {
      graphRAG: {
        length: number;
        completeness: number;
        specificity: number;
        readability: number;
      };
      traditionalRAG: {
        length: number;
        completeness: number;
        specificity: number;
        readability: number;
      };
    };
    graph: {
      totalNodes: number;
      totalEdges: number;
      usedEntities: number;
      usedRelationships: number;
      coveragePercentage: number;
      relationshipUtilization: number;
      entityTypeDistribution: Record<string, number>;
    };
  };
}

export function GraphRAGTab() {
  const [documents, setDocuments] = useState<File[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<GraphRAGResponse | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'graph' | 'rest' | 'graphql' | 'grpc' | 'websocket' | 'sse' | 'compare'>('upload');
  const [grpcSubTab, setGrpcSubTab] = useState<'grpc' | 'grpc-web'>('grpc');
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-5-nano');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'manual' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [grpcWebResults, setGrpcWebResults] = useState<any>(null);
  const [grpcResults, setGrpcResults] = useState<any>(null);
  const [websocketResults, setWebsocketResults] = useState<any>(null);
  const [sseResults, setSseResults] = useState<any>(null);


  const fetchOllamaModels = async () => {
    try {
      const response = await fetch('/api/ollama/models');
      if (response.ok) {
        const data = await response.json();
        setOllamaModels(data.models || []);
      }
    } catch (error) {
      console.log('Ollama not available:', error);
    }
  };

  const availableModels = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient' },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Lightweight and fast' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Anthropic\'s fastest model' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
    ...ollamaModels.map(model => ({
      id: `ollama:${model}`,
      name: `Ollama ${model}`,
      description: 'Local model'
    }))
  ];

  const sampleQueries = [
    "What is the relationship between AI and healthcare?",
    "How do tech companies innovate?",
    "What are AI implementation challenges?",
    "Which organizations lead in AI research?",
    "What are AI benefits in healthcare?",
    "How do companies approach AI development?"
  ];

  // Fetch Ollama models on component mount
  useEffect(() => {
    fetchOllamaModels();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const textFiles = files.filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    setDocuments(textFiles);
  };

  const loadSampleDocument = async (docType: 'ai-healthcare' | 'tech-companies') => {
    try {
      const response = await fetch(`/api/graphrag/sample-docs?type=${docType}`);
      
      if (response.ok) {
        const data = await response.json();
        const file = new File([data.content], `${docType}.txt`, { type: 'text/plain' });
        
        // Add to existing documents or replace if it's already there
        setDocuments(prev => {
          const existing = prev.find(doc => doc.name === `${docType}.txt`);
          if (existing) {
            return prev.map(doc => doc.name === `${docType}.txt` ? file : doc);
          } else {
            return [...prev, file];
          }
        });
      } else {
        console.error(`Failed to load ${docType} document`);
      }
    } catch (error) {
      console.error(`Error loading ${docType} document:`, error);
    }
  };

  const buildKnowledgeGraph = async () => {
    if (documents.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setBuildSuccess(false);
    setBuildError(null);

    try {
      const formData = new FormData();
      documents.forEach(doc => formData.append('documents', doc));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/graphrag/build-graph', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
        setBuildSuccess(true);
        // Auto-switch to graph tab after successful build
        setTimeout(() => setActiveTab('graph'), 1000);
      } else {
        const errorData = await response.json();
        setBuildError(errorData.error || 'Failed to build knowledge graph');
        console.error('Failed to build graph');
      }
    } catch (error) {
      console.error('Error building graph:', error);
      setBuildError('Network error occurred while building graph');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const queryGraphRAG = async () => {
    if (!query.trim() || !graphData) return;

    setIsQuerying(true);
    try {
      const response = await fetch('/api/graphrag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, graphData, model: selectedModel }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      }
    } catch (error) {
      console.error('Error querying GraphRAG:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  const generatePostmanCollection = async () => {
    setImportStatus('importing');
    setImportMessage('Generating collection...');
    
    try {
      const response = await fetch('/api/graphrag/postman-collection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ graphData, responses }),
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
                              setImportMessage('✅ GraphRAG REST API Collection created successfully in Postman Desktop! Set base_url to http://localhost:3000 in your environment.');
            
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
                a.download = 'graphrag-postman-collection.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setImportStatus('manual');
                                  setImportMessage('📥 GraphRAG REST API Collection downloaded! Import manually into Postman Desktop.');
              } else {
                throw new Error(result.message || 'Failed to create collection');
              }
            }
          } catch (error) {
            console.error('Error creating collection:', error);
            setImportStatus('error');
                              setImportMessage('Failed to create GraphRAG REST API collection. Try downloading manually.');
          }
        };

        await createInPostman();
      } else {
        setImportStatus('error');
        setImportMessage('Failed to generate collection');
      }
    } catch (error) {
      console.error('Error generating Postman collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating collection');
    }
  };

  const generateGrpcPostmanCollection = async () => {
    setImportStatus('importing');
    setImportMessage('Generating gRPC collection...');
    
    try {
      // Fetch the gRPC collection from the public folder
      const response = await fetch('/postman-collections/graphrag-grpc-collection.json');
      
      if (response.ok) {
        const collectionData = await response.json();
        
        // Try to create collection directly in Postman Desktop using API
        const createInPostman = async () => {
          try {
            setImportMessage('Creating gRPC collection in Postman Desktop...');
            
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
              setImportMessage('✅ gRPC Collection created successfully in Postman Desktop! Import the .proto file for service definitions.');
              
              // Don't open Postman Desktop automatically - just show success message
            } else {
              // Fallback to download if API key not configured
              if (result.fallback) {
                setImportMessage('Downloading gRPC collection file...');
                
                const blob = new Blob([JSON.stringify(collectionData, null, 2)], {
                  type: 'application/json'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'graphrag-grpc-collection.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setImportStatus('manual');
                setImportMessage('📥 gRPC Collection downloaded! Import manually into Postman Desktop and add the .proto file.');
              } else {
                throw new Error(result.message || 'Failed to create collection');
              }
            }
          } catch (error) {
            console.error('Error creating gRPC collection:', error);
            setImportStatus('error');
            setImportMessage('Failed to create gRPC collection. Try downloading manually.');
          }
        };

        await createInPostman();
      } else {
        setImportStatus('error');
        setImportMessage('Failed to load gRPC collection');
      }
    } catch (error) {
      console.error('Error generating gRPC Postman collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating gRPC collection');
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
            name: "Query Graph (Unary)",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGWebService/QueryGraph",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGWebService", "QueryGraph"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "AI healthcare relationships",
                  graph_id: "graph_123",
                  max_depth: 3,
                  node_types: ["person", "organization", "concept"]
                }, null, 2)
              }
            }
          },
          {
            name: "Stream Graph Traversal",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGWebService/StreamGraphTraversal",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGWebService", "StreamGraphTraversal"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "AI healthcare relationships",
                  graph_id: "graph_123",
                  max_depth: 3
                }, null, 2)
              }
            }
          },
          {
            name: "Stream Context",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGWebService/StreamContext",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGWebService", "StreamContext"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "What are AI benefits in healthcare?",
                  graph_id: "graph_123",
                  max_context_size: 10,
                  relevance_threshold: 0.7,
                  client_id: "browser_session_123"
                }, null, 2)
              }
            }
          },
          {
            name: "Interactive Graph Session",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/grpc-web+proto"
                }
              ],
              url: {
                raw: "{{base_url}}/graphrag.GraphRAGWebService/InteractiveGraphSession",
                host: ["{{base_url}}"],
                path: ["graphrag.GraphRAGWebService", "InteractiveGraphSession"]
              },
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  query: "AI healthcare",
                  graph_id: "graph_123",
                  session_id: "session_123"
                }, null, 2)
              }
            }
          }
        ],
        variable: [
          {
            key: "base_url",
            value: "http://localhost:8080",
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
            
            // Don't open Postman Desktop automatically - just show success message
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
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              setImportStatus('manual');
              setImportMessage('📥 gRPC-Web Collection downloaded! Import manually into Postman Desktop and configure your proxy endpoint.');
            } else {
              throw new Error(result.message || 'Failed to create collection');
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

  const handleProtocolComparison = async () => {
    if (!query.trim() || !graphData) return;

    // Clear previous comparison results
    setResponses(null);
    setIsQuerying(true);

    try {
      const response = await fetch('/api/protocol-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          graphId: graphData.graphId || `graph_${Date.now()}`,
          model: selectedModel
        })
      });

      if (response.ok) {
        const comparisonData = await response.json();
        
        // Transform comparison data to match existing response structure
        // Use the first successful result for the display
        const successfulResults = comparisonData.results.filter((r: any) => r.status === 'success');
        
        if (successfulResults.length > 0) {
          // Create a mock response structure from comparison data
          const mockResponse = {
            query: comparisonData.query,
            graphRAGResponse: successfulResults.find((r: any) => r.protocol === 'GraphQL')?.response || successfulResults[0].response,
            traditionalRAGResponse: successfulResults.find((r: any) => r.protocol === 'REST')?.response || successfulResults[0].response,
            graphContext: ['Context from protocol comparison'],
            performance: {
              graphRAGLatency: successfulResults.find((r: any) => r.protocol === 'GraphQL')?.latency || 0,
              traditionalRAGLatency: successfulResults.find((r: any) => r.protocol === 'REST')?.latency || 0,
              contextRelevance: 0.85
            },
            comparisonData // Store the full comparison data for the analytics
          };

          setResponses(mockResponse);
        } else {
          throw new Error('All protocol tests failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Protocol comparison failed');
      }
    } catch (error) {
      console.error('Protocol comparison error:', error);
      // Show error to user
    } finally {
      setIsQuerying(false);
    }
  };

  const handleGrpcWebQuery = async () => {
    if (!query.trim() || !graphData) return;

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
            { content: `Query: ${actualQuery}` },
            { content: `Response: Real-time analysis of medical diagnosis patterns` },
            { content: `Feedback: Query refined based on context` }
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
        latency,
        payloadSize,
        streaming: streamingData.length > 0,
        streamingData,
        timestamp: new Date().toISOString()
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

  const handleGrpcQuery = async () => {
    if (!query.trim() || !graphData) return;

    setIsQuerying(true);
    setGrpcResults(null);

    try {
      // Simulate gRPC query with realistic timing and responses
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

      // Simulate different response times based on query type (gRPC is faster than gRPC-Web)
      let delay = 60 + Math.random() * 80; // Base delay (faster than gRPC-Web)
      if (queryType === 'server-streaming') delay += 30;
      if (queryType === 'context-streaming') delay += 20;
      if (queryType === 'bidirectional') delay += 50;

      await new Promise(resolve => setTimeout(resolve, delay));
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Generate appropriate response based on query type
      let response = '';
      let streamingData: any[] = [];
      let payloadSize = 600; // gRPC typically has smaller payloads

      switch (queryType) {
        case 'unary':
          response = `gRPC unary response for "${actualQuery}": Found 5 relevant nodes in the knowledge graph. The query processed successfully using HTTP/2 transport with Protocol Buffer serialization.`;
          payloadSize = 650;
          break;
        case 'server-streaming':
          response = `gRPC server streaming initiated for "${actualQuery}": Streaming graph traversal results in real-time.`;
          streamingData = [
            { content: `Node 1: Stanford Medical Center (organization)` },
            { content: `Node 2: Dr. Sarah Chen (person) - AI researcher` },
            { content: `Node 3: Machine Learning (concept) - diagnostic algorithms` },
            { content: `Node 4: Patient Records (concept) - data analysis` },
            { content: `Node 5: Healthcare AI (concept) - clinical applications` }
          ];
          payloadSize = 720;
          break;
        case 'context-streaming':
          response = `gRPC context streaming for "${actualQuery}": Retrieving relevant context chunks.`;
          streamingData = [
            { content: `Context 1: AI improves diagnostic accuracy by 15-20%` },
            { content: `Context 2: Machine learning reduces false positives in screening` },
            { content: `Context 3: Predictive analytics enhance patient outcomes` },
            { content: `Context 4: Automated analysis saves 30% of radiologist time` }
          ];
          payloadSize = 680;
          break;
        case 'bidirectional':
          response = `gRPC bidirectional session for "${actualQuery}": Interactive query processing with real-time feedback.`;
          streamingData = [
            { content: `Session: Interactive query processing initiated` },
            { content: `Query: ${actualQuery}` },
            { content: `Response: Real-time analysis of medical diagnosis patterns` },
            { content: `Feedback: Query refined based on context` }
          ];
          payloadSize = 750;
          break;
        default:
          response = `gRPC query "${actualQuery}" processed successfully with HTTP/2 optimized communication.`;
          payloadSize = 600;
      }

      setGrpcResults({
        query: actualQuery,
        queryType,
        response,
        latency,
        payloadSize,
        streaming: streamingData.length > 0,
        streamingData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running gRPC query:', error);
      setGrpcResults({
        query: query.trim(),
        error: 'Failed to execute gRPC query',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleWebSocketQuery = async () => {
    if (!query.trim() || !graphData) return;

    setIsQuerying(true);
    setWebsocketResults(null);

    try {
      const startTime = performance.now();
      
      // Parse the query type from the input
      const queryText = query.trim();
      let queryType = 'unary';
      let actualQuery = queryText;
      
      if (queryText.startsWith('QueryGraph:')) {
        queryType = 'unary';
        actualQuery = queryText.replace('QueryGraph:', '').trim();
      } else if (queryText.startsWith('StreamGraphTraversal:')) {
        queryType = 'stream_query';
        actualQuery = queryText.replace('StreamGraphTraversal:', '').trim();
      } else if (queryText.startsWith('StreamContext:')) {
        queryType = 'context_stream';
        actualQuery = queryText.replace('StreamContext:', '').trim();
      } else if (queryText.startsWith('InteractiveSession:')) {
        queryType = 'bidirectional_session';
        actualQuery = queryText.replace('InteractiveSession:', '').trim();
      }
        
      // Fallback to API route if WebSocket server is not available
      const response = await fetch('/api/websocket/graphrag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { 
            query: actualQuery, 
            graph_id: graphData.graphId, 
            model: 'gpt-4',
            session_type: queryType === 'unary' ? 'unary' : 
                         queryType === 'stream_query' ? 'streaming' : 
                         queryType === 'bidirectional_session' ? 'bidirectional' : 'unary'
          }
        })
      });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      if (!response.ok) {
        throw new Error('WebSocket API error');
      }

      const data = await response.json();
      
      setWebsocketResults({
        query: actualQuery,
        queryType,
        response: data.data?.response || 'WebSocket response received',
        latency,
        payloadSize: data.websocket_metadata?.payload_size_bytes || JSON.stringify(data).length,
        streaming: data.data?.streaming_data ? true : false,
        streamingData: data.data?.streaming_data ? Object.entries(data.data.streaming_data).map(([key, value]) => ({
          content: `${key}: ${JSON.stringify(value).slice(0, 100)}...`
        })) : [],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running WebSocket query:', error);
      setWebsocketResults({
        query: query.trim(),
        error: 'Failed to execute WebSocket query',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleSseQuery = async () => {
    if (!query.trim() || !graphData) return;

    setIsQuerying(true);
    setSseResults(null);

    try {
      const startTime = performance.now();
      
      // Parse the query type from the input
      const queryText = query.trim();
      let endpoint = 'stream';
      let actualQuery = queryText;
      
      if (queryText.startsWith('StreamGraph:')) {
        endpoint = 'stream';
        actualQuery = queryText.replace('StreamGraph:', '').trim();
      } else if (queryText.startsWith('StreamContext:')) {
        endpoint = 'context';
        actualQuery = queryText.replace('StreamContext:', '').trim();
      } else if (queryText.startsWith('StreamResults:')) {
        endpoint = 'stream';
        actualQuery = queryText.replace('StreamResults:', '').trim();
      }

      // Use real SSE connection
      const eventSource = new EventSource(`/api/sse/graphrag/${endpoint}?query=${encodeURIComponent(actualQuery)}&graphId=${encodeURIComponent(graphData.graphId)}&model=gpt-4`);
      
      const messages: any[] = [];
      let response = '';
      let streamingData: any[] = [];

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          eventSource.close();
          reject(new Error('SSE connection timeout'));
        }, 10000);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            messages.push(data);

            switch (data.event) {
              case 'connected':
                console.log('SSE connected:', data.message);
                break;
              case 'processing':
                response = data.message;
                break;
              case 'graph_node':
              case 'context_chunk':
                streamingData.push({ content: `Event: ${data.event}\nData: ${JSON.stringify(data.data)}` });
                break;
              case 'complete':
                eventSource.close();
                clearTimeout(timeout);
                
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                
                setSseResults({
                  query: actualQuery,
                  queryType: endpoint,
                  response: response || `SSE ${endpoint} streaming completed successfully`,
                  latency,
                  payloadSize: JSON.stringify(messages).length,
                  streaming: streamingData.length > 0,
                  streamingData,
                  timestamp: new Date().toISOString()
                });
                
                setIsQuerying(false);
                resolve(true);
                break;
              case 'error':
                eventSource.close();
                clearTimeout(timeout);
                reject(new Error(data.error));
                break;
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        };

        eventSource.onerror = (error) => {
          eventSource.close();
          clearTimeout(timeout);
          reject(error);
        };
      });

    } catch (error) {
      console.error('Error running SSE query:', error);
      setSseResults({
        query: query.trim(),
        error: 'Failed to execute SSE query',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const generateSsePostmanCollection = async () => {
    if (!graphData) return;

    setImportStatus('importing');
    setImportMessage('Generating SSE collection...');
    
    try {
      const collection = {
        info: {
          name: 'GraphRAG SSE API',
          description: 'Server-Sent Events endpoints for streaming GraphRAG queries',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: 'SSE Graph Streaming',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Accept',
                  value: 'text/event-stream'
                },
                {
                  key: 'Cache-Control',
                  value: 'no-cache'
                }
              ],
              url: {
                raw: 'http://localhost:3000/api/sse/graphrag/stream?query=AI healthcare relationships&graphId=your-graph-id',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'sse', 'graphrag', 'stream'],
                query: [
                  {
                    key: 'query',
                    value: 'AI healthcare relationships'
                  },
                  {
                    key: 'graphId',
                    value: 'your-graph-id'
                  }
                ]
              }
            }
          },
          {
            name: 'SSE Context Streaming',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Accept',
                  value: 'text/event-stream'
                },
                {
                  key: 'Cache-Control',
                  value: 'no-cache'
                }
              ],
              url: {
                raw: 'http://localhost:3000/api/sse/graphrag/context?query=AI benefits in healthcare&graphId=your-graph-id',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'sse', 'graphrag', 'context'],
                query: [
                  {
                    key: 'query',
                    value: 'AI benefits in healthcare'
                  },
                  {
                    key: 'graphId',
                    value: 'your-graph-id'
                  }
                ]
              }
            }
          },
          {
            name: 'SSE Results Streaming',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Accept',
                  value: 'text/event-stream'
                },
                {
                  key: 'Cache-Control',
                  value: 'no-cache'
                }
              ],
              url: {
                raw: 'http://localhost:3000/api/sse/graphrag/results?query=Machine learning diagnosis&graphId=your-graph-id',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'sse', 'graphrag', 'results'],
                query: [
                  {
                    key: 'query',
                    value: 'Machine learning diagnosis'
                  },
                  {
                    key: 'graphId',
                    value: 'your-graph-id'
                  }
                ]
              }
            }
          }
        ]
      };

      // Try to create collection directly in Postman Desktop using API
      const createInPostman = async () => {
        try {
          setImportMessage('Creating SSE collection in Postman Desktop...');
          
          const postmanResponse = await fetch('/api/postman/create-collection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: collection,
              createInWeb: false, // Create in Desktop
            }),
          });

          const result = await postmanResponse.json();

          if (result.success) {
            setImportStatus('success');
            setImportMessage('✅ SSE Collection created successfully in Postman Desktop! Set base_url to http://localhost:3000 in your environment.');
          } else {
            // Fallback to download if API key not configured
            if (result.fallback) {
              setImportMessage('Downloading SSE collection file...');
              
              const blob = new Blob([JSON.stringify(collection, null, 2)], {
                type: 'application/json'
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sse-graphrag-collection.json';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              setImportStatus('manual');
              setImportMessage('📥 SSE Collection downloaded! Import manually into Postman Desktop.');
            } else {
              throw new Error(result.message || 'Failed to create collection');
            }
          }
        } catch (error) {
          console.error('Error creating SSE collection:', error);
          setImportStatus('error');
          setImportMessage('Failed to create SSE collection. Try downloading manually.');
        }
      };

      await createInPostman();
    } catch (error) {
      console.error('Error generating SSE collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating SSE collection');
    }
  };

  const generateWebSocketPostmanCollection = async () => {
    if (!graphData) return;

    setImportStatus('importing');
    setImportMessage('Generating WebSocket collection...');
    
    try {
      const collection = {
        info: {
          name: 'GraphRAG WebSocket API',
          description: 'WebSocket endpoints for real-time GraphRAG queries',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: 'WebSocket Connection',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Upgrade',
                  value: 'websocket'
                },
                {
                  key: 'Connection',
                  value: 'Upgrade'
                }
              ],
              url: {
                raw: 'ws://localhost:3000/api/websocket/graphrag',
                protocol: 'ws',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'websocket', 'graphrag']
              }
            }
          },
          {
            name: 'Unary Query',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  type: 'unary',
                  query: 'AI healthcare benefits',
                  graphId: 'your-graph-id'
                }, null, 2)
              },
              url: {
                raw: 'http://localhost:3000/api/websocket/query',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'websocket', 'query']
              }
            }
          },
          {
            name: 'Streaming Query',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  type: 'streaming',
                  query: 'Stanford researchers',
                  graphId: 'your-graph-id'
                }, null, 2)
              },
              url: {
                raw: 'http://localhost:3000/api/websocket/stream',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'websocket', 'stream']
              }
            }
          },
          {
            name: 'Bidirectional Session',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  type: 'bidirectional',
                  sessionId: 'session-123',
                  query: 'Machine learning diagnosis',
                  graphId: 'your-graph-id'
                }, null, 2)
              },
              url: {
                raw: 'http://localhost:3000/api/websocket/session',
                protocol: 'http',
                host: ['localhost'],
                port: '3000',
                path: ['api', 'websocket', 'session']
              }
            }
          }
        ]
      };

      // Try to create collection directly in Postman Desktop using API
      const createInPostman = async () => {
        try {
          setImportMessage('Creating WebSocket collection in Postman Desktop...');
          
          const postmanResponse = await fetch('/api/postman/create-collection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: collection,
              createInWeb: false, // Create in Desktop
            }),
          });

          const result = await postmanResponse.json();

          if (result.success) {
            setImportStatus('success');
            setImportMessage('✅ WebSocket Collection created successfully in Postman Desktop! Set base_url to ws://localhost:3000 in your environment.');
          } else {
            // Fallback to download if API key not configured
            if (result.fallback) {
              setImportMessage('Downloading WebSocket collection file...');
              
              const blob = new Blob([JSON.stringify(collection, null, 2)], {
                type: 'application/json'
              });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'websocket-graphrag-collection.json';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              setImportStatus('manual');
              setImportMessage('📥 WebSocket Collection downloaded! Import manually into Postman Desktop.');
            } else {
              throw new Error(result.message || 'Failed to create collection');
            }
          }
        } catch (error) {
          console.error('Error creating WebSocket collection:', error);
          setImportStatus('error');
          setImportMessage('Failed to create WebSocket collection. Try downloading manually.');
        }
      };

      await createInPostman();
    } catch (error) {
      console.error('Error generating WebSocket collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating WebSocket collection');
    }
  };

  const generateComparisonCollection = async () => {
    if (!graphData) return;

    setImportStatus('importing');
    setImportMessage('Generating protocol comparison collection...');
    
    try {
      const response = await fetch('/api/protocol-comparison/postman-collection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const collectionData = await response.json();
        
        // Try to create collection directly in Postman Desktop using API
        const createInPostman = async () => {
          try {
            setImportMessage('Creating collection in Postman Desktop...');
            
            // Use the same API as other collection buttons for direct Postman integration
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
              setImportMessage('✅ Protocol Comparison Collection created successfully in Postman Desktop! Set base_url to http://localhost:3000 in your environment.');
              
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
                a.download = 'protocol-comparison-collection.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setImportStatus('manual');
                setImportMessage('📥 Protocol Comparison Collection downloaded! Import manually into Postman Desktop.');
              } else {
                throw new Error(result.message || 'Failed to create collection');
              }
            }
          } catch (error) {
            console.error('Error creating collection:', error);
            setImportStatus('error');
            setImportMessage('Failed to create Protocol Comparison collection. Try downloading manually.');
          }
        };

        await createInPostman();
      } else {
        setImportStatus('error');
        setImportMessage('Failed to generate comparison collection');
      }
    } catch (error) {
      console.error('Error generating comparison collection:', error);
      setImportStatus('error');
      setImportMessage('Error generating comparison collection');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">GraphRAG Lab</h2>
        <p className="text-gray-700">Build knowledge graphs and compare GraphRAG vs traditional RAG</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-1 border-b">
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            📄 Document Upload
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'graph' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('graph')}
            disabled={!graphData}
          >
            🕸️ Knowledge Graph {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rest' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('rest')}
            disabled={!graphData}
          >
            🔍 REST API {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'graphql' 
                ? 'border-purple-500 text-purple-600 bg-purple-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('graphql')}
            disabled={!graphData}
          >
            🔧 GraphQL Playground {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'grpc' 
                ? 'border-green-500 text-green-600 bg-green-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('grpc')}
            disabled={!graphData}
          >
            ⚡ gRPC Streaming {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'websocket' 
                ? 'border-orange-500 text-orange-600 bg-orange-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('websocket')}
            disabled={!graphData}
          >
            🔌 WebSocket {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sse' 
                ? 'border-red-500 text-red-600 bg-red-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('sse')}
            disabled={!graphData}
          >
            📡 SSE {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compare' 
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('compare')}
            disabled={!graphData}
          >
            🏁 Protocol Comparison {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-4">
                            <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b bg-gray-50">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Upload className="w-5 h-5" />
                      Upload Documents
                      <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">Setup</span>
                    </h3>
                <p className="text-gray-600 mt-1">
                  Upload text files to build a knowledge graph. The system will extract entities and relationships.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".txt,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload text files or drag and drop
                      </p>
                    </label>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-2">or load sample documents:</div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => loadSampleDocument('ai-healthcare')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI Healthcare
                      </button>
                      <button
                        onClick={() => loadSampleDocument('tech-companies')}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tech Companies
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Click to load individual sample datasets
                    </p>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Selected Files:</h4>
                    <div className="space-y-1">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">{(doc.size / 1024).toFixed(1)} KB</span>
                            <button
                              onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Remove document"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-700">{documents.length} document{documents.length !== 1 ? 's' : ''} selected</span>
                      <button
                        onClick={() => setDocuments([])}
                        className="text-xs text-red-600 hover:text-red-800 hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={buildKnowledgeGraph} 
                  disabled={documents.length === 0 || isProcessing}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Network className="w-4 h-4 mr-2 animate-spin" />
                      Building Knowledge Graph...
                    </>
                  ) : (
                    <>
                      <Network className="w-4 h-4 mr-2" />
                      Build Knowledge Graph
                    </>
                  )}
                </button>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Processing documents and extracting entities...
                    </p>
                  </div>
                )}

                {buildSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Knowledge Graph Built Successfully!
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {graphData?.stats.totalNodes} entities and {graphData?.stats.totalEdges} relationships extracted. 
                          You can now explore the graph or start querying.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {buildError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Failed to Build Knowledge Graph
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {buildError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graph' && graphData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="w-5 h-5" />
                    Graph Statistics
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{graphData.stats.totalNodes}</div>
                      <div className="text-sm text-gray-600">Entities</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{graphData.stats.totalEdges}</div>
                      <div className="text-sm text-gray-600">Relationships</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Top Entities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {graphData.stats.topEntities.map((entity, index) => (
                        <span key={index} className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded">{entity}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Graph Preview</h3>
                  <p className="text-gray-600 mt-1">
                    Interactive visualization of the knowledge graph
                  </p>
                </div>
                <div className="p-6">
                  <GraphPreview graphData={graphData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rest' && (
          <div>
            {graphData ? (
              <div className="space-y-6">
            {/* Postman Integration Section */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Download className="w-5 h-5" />
                    GraphRAG REST API Integration
                    <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">HTTP/JSON</span>
                  </h3>
                  <p className="text-gray-700 mt-1">
                    Import GraphRAG REST API collection to test HTTP endpoints in Postman
                  </p>
                </div>
                <button 
                  onClick={generatePostmanCollection} 
                  disabled={!responses || importStatus === 'importing'}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {importStatus === 'importing' ? 'Importing...' : 'Add GraphRAG REST to Postman'}
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col space-y-3">
                  
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
            </div>

            {/* Query & Compare Section */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Search className="w-5 h-5" />
                  Query & Compare
                </h3>
                <p className="text-gray-700 mt-1">
                  Test GraphRAG vs traditional RAG responses
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="query" className="block text-sm font-medium text-gray-700">Enter your query:</label>
                    <textarea
                      id="query"
                      placeholder="e.g., What are the key relationships between AI and healthcare in our documents?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">Select Model:</label>
                    <select
                      id="model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sample Queries:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleQueries.map((sampleQuery, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(sampleQuery)}
                        className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        {sampleQuery}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={queryGraphRAG} 
                  disabled={!query.trim() || isQuerying}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isQuerying ? 'Querying...' : 'Compare GraphRAG vs Traditional RAG'}
                </button>
              </div>
            </div>

            {responses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-green-600">GraphRAG Response</h3>
                    <p className="text-gray-600 mt-1">
                      Enhanced with knowledge graph context
                    </p>
                    {responses.model && (
                      <p className="text-sm text-gray-500 mt-1">
                        Model: {availableModels.find(m => m.id === responses.model)?.name || responses.model}
                      </p>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">{responses.graphRAGResponse}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Latency: {responses.performance.graphRAGLatency}ms</p>
                        <p>Context Relevance: {responses.performance.contextRelevance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-blue-600">Traditional RAG Response</h3>
                    <p className="text-gray-600 mt-1">
                      Standard retrieval-augmented generation
                    </p>
                    {responses.model && (
                      <p className="text-sm text-gray-500 mt-1">
                        Model: {availableModels.find(m => m.id === responses.model)?.name || responses.model}
                      </p>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{responses.traditionalRAGResponse}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Latency: {responses.performance.traditionalRAGLatency}ms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {responses && responses.analytics && (
              <>
                {/* Performance Comparison */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Performance Comparison</h3>
                    <p className="text-gray-600 mt-1">
                      Basic performance metrics
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {responses.performance.graphRAGLatency}ms
                        </div>
                        <div className="text-sm text-gray-600">GraphRAG Latency</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {responses.performance.traditionalRAGLatency}ms
                        </div>
                        <div className="text-sm text-gray-600">Traditional RAG Latency</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(responses.performance.contextRelevance * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Context Relevance</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Usage Analytics */}
                {responses.analytics?.tokens && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Token Usage & Cost Analysis</h3>
                      <p className="text-gray-600 mt-1">
                        Token consumption and estimated costs
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GraphRAG Tokens */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-green-600">GraphRAG</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-green-50 rounded">
                              <div className="text-lg font-bold text-green-600">{responses.analytics.tokens.graphRAG.input}</div>
                              <div className="text-xs text-gray-600">Input Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded">
                              <div className="text-lg font-bold text-green-600">{responses.analytics.tokens.graphRAG.output}</div>
                              <div className="text-xs text-gray-600">Output Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded">
                              <div className="text-lg font-bold text-green-600">{responses.analytics.tokens.graphRAG.total}</div>
                              <div className="text-xs text-gray-600">Total Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded">
                              <div className="text-lg font-bold text-green-600">${responses.analytics.tokens.graphRAG.cost.toFixed(8)}</div>
                              <div className="text-xs text-gray-600">Estimated Cost</div>
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">
                              Efficiency: {(responses.analytics.tokens.graphRAG.efficiency * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Traditional RAG Tokens */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-blue-600">Traditional RAG</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <div className="text-lg font-bold text-blue-600">{responses.analytics.tokens.traditionalRAG.input}</div>
                              <div className="text-xs text-gray-600">Input Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <div className="text-lg font-bold text-blue-600">{responses.analytics.tokens.traditionalRAG.output}</div>
                              <div className="text-xs text-gray-600">Output Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <div className="text-lg font-bold text-blue-600">{responses.analytics.tokens.traditionalRAG.total}</div>
                              <div className="text-xs text-gray-600">Total Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <div className="text-lg font-bold text-blue-600">${responses.analytics.tokens.traditionalRAG.cost.toFixed(8)}</div>
                              <div className="text-xs text-gray-600">Estimated Cost</div>
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">
                              Efficiency: {(responses.analytics.tokens.traditionalRAG.efficiency * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Quality Analytics */}
                {responses.analytics?.quality && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Response Quality Analysis</h3>
                      <p className="text-gray-600 mt-1">
                        Quality metrics for response evaluation
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GraphRAG Quality */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-green-600">GraphRAG Quality</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm text-gray-600">Length:</span>
                              <span className="font-medium">{responses.analytics.quality.graphRAG.length} chars</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm text-gray-600">Completeness:</span>
                              <span className="font-medium">{(responses.analytics.quality.graphRAG.completeness * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm text-gray-600">Specificity:</span>
                              <span className="font-medium">{(responses.analytics.quality.graphRAG.specificity * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm text-gray-600">Readability:</span>
                              <span className="font-medium">{responses.analytics.quality.graphRAG.readability.toFixed(0)}/100</span>
                            </div>
                          </div>
                        </div>

                        {/* Traditional RAG Quality */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-blue-600">Traditional RAG Quality</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm text-gray-600">Length:</span>
                              <span className="font-medium">{responses.analytics.quality.traditionalRAG.length} chars</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm text-gray-600">Completeness:</span>
                              <span className="font-medium">{(responses.analytics.quality.traditionalRAG.completeness * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm text-gray-600">Specificity:</span>
                              <span className="font-medium">{(responses.analytics.quality.traditionalRAG.specificity * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm text-gray-600">Readability:</span>
                              <span className="font-medium">{responses.analytics.quality.traditionalRAG.readability.toFixed(0)}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graph Coverage Analytics */}
                {responses.analytics?.graph && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Graph Coverage Analysis</h3>
                      <p className="text-gray-600 mt-1">
                        How much of the knowledge graph was utilized
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Graph Statistics */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Graph Statistics</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-purple-50 rounded">
                              <div className="text-lg font-bold text-purple-600">{responses.analytics.graph.totalNodes}</div>
                              <div className="text-xs text-gray-600">Total Nodes</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded">
                              <div className="text-lg font-bold text-purple-600">{responses.analytics.graph.totalEdges}</div>
                              <div className="text-xs text-gray-600">Total Edges</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded">
                              <div className="text-lg font-bold text-purple-600">{responses.analytics.graph.usedEntities}</div>
                              <div className="text-xs text-gray-600">Used Entities</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded">
                              <div className="text-lg font-bold text-purple-600">{responses.analytics.graph.usedRelationships}</div>
                              <div className="text-xs text-gray-600">Used Relationships</div>
                            </div>
                          </div>
                        </div>

                        {/* Coverage Metrics */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Coverage Metrics</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                              <span className="text-sm text-gray-600">Entity Coverage:</span>
                              <span className="font-medium">{responses.analytics.graph.coveragePercentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                              <span className="text-sm text-gray-600">Relationship Utilization:</span>
                              <span className="font-medium">{responses.analytics.graph.relationshipUtilization.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          {/* Entity Type Distribution */}
                          {Object.keys(responses.analytics.graph.entityTypeDistribution).length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Entity Type Distribution:</h5>
                              <div className="space-y-1">
                                {Object.entries(responses.analytics.graph.entityTypeDistribution).map(([type, count]) => (
                                  <div key={type} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 capitalize">{type}:</span>
                                    <span className="font-medium">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graph Context Used */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Graph Context Used</h3>
                    <p className="text-gray-600 mt-1">
                      Context extracted from the knowledge graph
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-1">
                      {responses.graphContext.map((context, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {context}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please upload documents and build a knowledge graph first to use REST API features.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Document Upload
                </button>
              </div>
            )}
          </div>
        )}



        {activeTab === 'graphql' && (
          <div>
            {graphData ? (
              <GraphQLPlayground />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please upload documents and build a knowledge graph first to use GraphQL queries.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Document Upload
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compare' && (
          <div>
            {graphData ? (
              <div className="space-y-6">
                {/* Protocol Comparison Overview */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b flex justify-between items-center">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <BarChart3 className="w-5 h-5" />
                        Protocol Performance Comparison
                      </h3>
                      <p className="text-gray-700 mt-1">
                        Compare REST, GraphQL, gRPC, gRPC-Web, WebSocket, and SSE performance using the same GraphRAG query
                      </p>
                    </div>
                    <button
                      onClick={generateComparisonCollection}
                      disabled={!graphData || !responses || importStatus === 'importing'}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {importStatus === 'importing' ? 'Importing...' : 
                       !responses ? 'Run Comparison First' : 'Add Comparison Collection to Postman'}
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Query Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Query
                        </label>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter a question about your knowledge graph..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      {/* Sample Queries */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample Queries
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <button
                            onClick={() => setQuery("What are the benefits of AI in healthcare?")}
                            className="text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-blue-800">AI Healthcare Benefits</div>
                            <div className="text-xs text-blue-600">What are the benefits of AI in healthcare?</div>
                          </button>
                          <button
                            onClick={() => setQuery("Who are the key researchers at Stanford Medical Center?")}
                            className="text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-green-800">Stanford Researchers</div>
                            <div className="text-xs text-green-600">Who are the key researchers at Stanford Medical Center?</div>
                          </button>
                          <button
                            onClick={() => setQuery("What technologies has Google Health developed?")}
                            className="text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-purple-800">Google Health Tech</div>
                            <div className="text-xs text-purple-600">What technologies has Google Health developed?</div>
                          </button>
                          <button
                            onClick={() => setQuery("How does machine learning improve medical diagnosis?")}
                            className="text-left p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-orange-800">ML Medical Diagnosis</div>
                            <div className="text-xs text-orange-600">How does machine learning improve medical diagnosis?</div>
                          </button>
                          <button
                            onClick={() => setQuery("What are the ethical considerations in AI healthcare?")}
                            className="text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-red-800">AI Ethics</div>
                            <div className="text-xs text-red-600">What are the ethical considerations in AI healthcare?</div>
                          </button>
                          <button
                            onClick={() => setQuery("How do AI systems analyze patient records?")}
                            className="text-left p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-indigo-800">Patient Records Analysis</div>
                            <div className="text-xs text-indigo-600">How do AI systems analyze patient records?</div>
                          </button>
                        </div>
                      </div>
                      
                      {/* Run Comparison Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleProtocolComparison}
                          disabled={!query.trim() || isQuerying}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {isQuerying ? 'Running Comparison...' : 'Run Protocol Comparison'}
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
                  </div>
                </div>

                {/* Results Comparison */}
                {responses && responses.comparisonData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-6">
                    {responses.comparisonData.results.map((result: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg border shadow-sm">
                        <div className={`p-4 border-b ${
                          result.protocol === 'REST' ? 'bg-blue-50' :
                          result.protocol === 'GraphQL' ? 'bg-purple-50' :
                          result.protocol === 'gRPC' ? 'bg-green-50' :
                          result.protocol === 'gRPC-Web' ? 'bg-indigo-50' :
                          result.protocol === 'WebSocket' ? 'bg-orange-50' :
                          'bg-red-50'
                        }`}>
                          <h4 className={`font-semibold flex items-center gap-2 ${
                            result.protocol === 'REST' ? 'text-blue-800' :
                            result.protocol === 'GraphQL' ? 'text-purple-800' :
                            result.protocol === 'gRPC' ? 'text-green-800' :
                            result.protocol === 'gRPC-Web' ? 'text-indigo-800' :
                            result.protocol === 'WebSocket' ? 'text-orange-800' :
                            'text-red-800'
                          }`}>
                            {result.protocol === 'REST' ? '🌐' :
                             result.protocol === 'GraphQL' ? '🔧' :
                             result.protocol === 'gRPC' ? '⚡' :
                             result.protocol === 'gRPC-Web' ? '🌐' :
                             result.protocol === 'WebSocket' ? '🔌' :
                             '📡'} {result.protocol}
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.protocol === 'REST' ? 'bg-blue-200 text-blue-800' :
                              result.protocol === 'GraphQL' ? 'bg-purple-200 text-purple-800' :
                              result.protocol === 'gRPC' ? 'bg-green-200 text-green-800' :
                              result.protocol === 'gRPC-Web' ? 'bg-indigo-200 text-indigo-800' :
                              result.protocol === 'WebSocket' ? 'bg-orange-200 text-orange-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {result.protocol === 'REST' ? 'HTTP/1.1' :
                               result.protocol === 'GraphQL' ? 'HTTP/1.1' :
                               result.protocol === 'gRPC' ? 'HTTP/2' :
                               result.protocol === 'gRPC-Web' ? 'HTTP/1.1' :
                               result.protocol === 'WebSocket' ? 'Real-time' :
                               'Streaming'}
                            </span>
                            {/* Mock/Real Indicator */}
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {result.status === 'success' ? '✅ Real' : '⚠️ Mock'}
                            </span>
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Latency:</span>
                              <span className={`ml-2 ${result.status === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                                {result.latency}ms
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Protocol:</span>
                              <span className="ml-2 text-gray-700">
                                {result.protocol === 'REST' ? 'HTTP/1.1 + JSON' :
                                 result.protocol === 'GraphQL' ? 'HTTP/1.1 + JSON' :
                                 result.protocol === 'gRPC' ? 'HTTP/2 + Protobuf' :
                                 result.protocol === 'gRPC-Web' ? 'HTTP/1.1 + Protobuf' :
                                 result.protocol === 'WebSocket' ? 'WebSocket + JSON' :
                                 'HTTP/1.1 + EventSource'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">Payload Size:</span>
                              <span className="ml-2 text-gray-700">~{Math.round(result.payloadSize / 1024 * 10) / 10}KB</span>
                            </div>
                            {result.status === 'error' && (
                              <div className="text-sm">
                                <span className="font-medium text-red-600">Error:</span>
                                <span className="ml-2 text-red-500 text-xs">{result.error}</span>
                              </div>
                            )}
                          </div>
                          <div className="border-t pt-3">
                            <div className="text-xs text-gray-600 mb-2">Response Preview:</div>
                            <div className="text-sm bg-gray-50 p-2 rounded text-gray-700 max-h-20 overflow-y-auto">
                              {result.response ? result.response.substring(0, 150) + '...' : 'No response data'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}



                {/* Performance Analytics */}
                {responses && responses.comparisonData && (
                  <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <BarChart3 className="w-5 h-5" />
                        Performance Analytics
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Latency Comparison */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Latency Comparison</h4>
                          <div className="space-y-2">
                            {responses.comparisonData.results
                              .filter((r: any) => r.status === 'success')
                              .sort((a: any, b: any) => a.latency - b.latency)
                              .map((result: any, index: number) => {
                                const maxLatency = Math.max(...responses.comparisonData.results
                                  .filter((r: any) => r.status === 'success')
                                  .map((r: any) => r.latency));
                                const percentage = (result.latency / maxLatency) * 100;
                                
                                return (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-900">{result.protocol}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            result.protocol === 'REST' ? 'bg-blue-500' :
                                            result.protocol === 'GraphQL' ? 'bg-purple-500' :
                                            result.protocol === 'gRPC' ? 'bg-green-500' :
                                            result.protocol === 'gRPC-Web' ? 'bg-indigo-500' :
                                            result.protocol === 'WebSocket' ? 'bg-orange-500' :
                                            'bg-red-500'
                                          }`} 
                                          style={{width: `${percentage}%`}}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-600">{result.latency}ms</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Payload Size Comparison */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Payload Efficiency</h4>
                          <div className="space-y-2">
                            {responses.comparisonData.results
                              .filter((r: any) => r.status === 'success')
                              .sort((a: any, b: any) => b.payloadSize - a.payloadSize)
                              .map((result: any, index: number) => {
                                const maxPayload = Math.max(...responses.comparisonData.results
                                  .filter((r: any) => r.status === 'success')
                                  .map((r: any) => r.payloadSize));
                                const percentage = (result.payloadSize / maxPayload) * 100;
                                
                                return (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-900">{result.protocol}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            result.protocol === 'REST' ? 'bg-blue-500' :
                                            result.protocol === 'GraphQL' ? 'bg-purple-500' :
                                            result.protocol === 'gRPC' ? 'bg-green-500' :
                                            result.protocol === 'gRPC-Web' ? 'bg-indigo-500' :
                                            result.protocol === 'WebSocket' ? 'bg-orange-500' :
                                            'bg-red-500'
                                          }`} 
                                          style={{width: `${percentage}%`}}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-600">~{Math.round(result.payloadSize / 1024 * 10) / 10}KB</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Protocol Features */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Protocol Features</h4>
                          <div className="space-y-3">
                            <div className="text-sm">
                              <div className="font-medium text-blue-600">REST</div>
                              <div className="text-xs text-gray-600">✓ Simple, cacheable</div>
                              <div className="text-xs text-gray-600">✗ Over-fetching</div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-purple-600">GraphQL</div>
                              <div className="text-xs text-gray-600">✓ Precise queries</div>
                              <div className="text-xs text-gray-600">✓ Single endpoint</div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-green-600">gRPC</div>
                              <div className="text-xs text-gray-600">✓ Binary protocol</div>
                              <div className="text-xs text-gray-600">✓ Streaming support</div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-orange-600">WebSocket</div>
                              <div className="text-xs text-gray-600">✓ Real-time bidirectional</div>
                              <div className="text-xs text-gray-600">✓ Persistent connection</div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-red-600">SSE</div>
                              <div className="text-xs text-gray-600">✓ Server-to-client streaming</div>
                              <div className="text-xs text-gray-600">✓ Automatic reconnection</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please upload documents and build a knowledge graph first to use protocol comparison features.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Document Upload
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grpc' && (
          <div>
            {graphData ? (
              <div className="space-y-6">
                {/* gRPC Sub-tab Navigation */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">gRPC Protocol Selection</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setGrpcSubTab('grpc')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          grpcSubTab === 'grpc'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ⚡ gRPC
                      </button>
                      <button
                        onClick={() => setGrpcSubTab('grpc-web')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          grpcSubTab === 'grpc-web'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        🌐 gRPC-Web
                      </button>
                    </div>
                  </div>
                </div>

                {grpcSubTab === 'grpc' && (
                  <>
                    {/* gRPC Header with Add to Postman Button */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">⚡ gRPC Services</h3>
                        <p className="text-gray-700 mt-1">
                          High-performance GraphRAG operations using gRPC with Protocol Buffers
                        </p>
                      </div>
                      <button 
                        onClick={generateGrpcPostmanCollection}
                        disabled={!graphData || importStatus === 'importing'}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {importStatus === 'importing' ? 'Importing...' : 'Add gRPC to Postman'}
                      </button>
                    </div>

                    {/* Live gRPC Client */}
                    <div className="bg-white rounded-lg border shadow-sm">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">⚡ Live gRPC Client</h3>
                        <p className="text-gray-700 mt-1">
                          Test gRPC functionality directly from your browser
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {/* Query Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              gRPC Query
                            </label>
                            <input
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Enter a GraphRAG query for gRPC testing..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                            />
                          </div>

                          {/* Sample Queries */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sample gRPC Queries
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

                          {/* Run gRPC Query Button */}
                          <div className="flex space-x-3">
                            <button
                              onClick={handleGrpcQuery}
                              disabled={!query.trim() || !graphData || isQuerying}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              {isQuerying ? 'Running gRPC Query...' : 'Run gRPC Query'}
                            </button>
                          </div>

                          {/* gRPC Results */}
                          {grpcResults && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-3">gRPC Results</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Protocol:</span>
                                  <span className="text-sm text-green-600">gRPC (HTTP/2 + Protobuf)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Latency:</span>
                                  <span className="text-sm text-green-600">{grpcResults.latency}ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Payload Size:</span>
                                  <span className="text-sm text-gray-600">{grpcResults.payloadSize}B</span>
                                </div>
                                <div className="border-t pt-3">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Response:</div>
                                  <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                    {grpcResults.response}
                                  </div>
                                </div>
                                {grpcResults.streaming && (
                                  <div className="border-t pt-3">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Streaming Data:</div>
                                    <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                      {grpcResults.streamingData.map((chunk: any, index: number) => (
                                        <div key={index} className="mb-2 p-2 bg-green-50 rounded">
                                          <span className="text-green-600 font-medium">Chunk {index + 1}:</span> {chunk.content}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


          </>
                )}

                {grpcSubTab === 'grpc-web' && (
                  <>
                    {/* gRPC-Web Header with Add to Postman Button */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">🌐 gRPC-Web Services</h3>
                          <p className="text-gray-700 mt-1">
                            Browser-compatible gRPC implementation for GraphRAG services
                          </p>
                        </div>
                        <button 
                          onClick={generateGrpcWebPostmanCollection}
                          disabled={!graphData || importStatus === 'importing'}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {importStatus === 'importing' ? 'Importing...' : 'Add gRPC-Web to Postman'}
                        </button>
                      </div>
                      
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

                    {/* Live gRPC-Web Client */}
                    <div className="bg-white rounded-lg border shadow-sm">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Live gRPC-Web Client</h3>
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
                              disabled={!query.trim() || !graphData || isQuerying}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              {isQuerying ? 'Running gRPC-Web Query...' : 'Run gRPC-Web Query'}
                            </button>
                          </div>

                          {/* gRPC-Web Results */}
                          {grpcWebResults && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-3">gRPC-Web Results</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Protocol:</span>
                                  <span className="text-sm text-blue-600">gRPC-Web (HTTP/1.1 + Protobuf)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Latency:</span>
                                  <span className="text-sm text-green-600">{grpcWebResults.latency}ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Payload Size:</span>
                                  <span className="text-sm text-gray-600">{grpcWebResults.payloadSize}B</span>
                                </div>
                                <div className="border-t pt-3">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Response:</div>
                                  <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                    {grpcWebResults.response}
                                  </div>
                                </div>
                                {grpcWebResults.streaming && (
                                  <div className="border-t pt-3">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Streaming Data:</div>
                                    <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                      {grpcWebResults.streamingData.map((chunk: any, index: number) => (
                                        <div key={index} className="mb-2 p-2 bg-blue-50 rounded">
                                          <span className="text-blue-600 font-medium">Chunk {index + 1}:</span> {chunk.content}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>



                    {/* Documentation Link */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-blue-900">📚 Complete gRPC-Web Documentation</h4>
                          <p className="text-blue-700 mt-1">
                            For detailed implementation guides, Protocol Buffer definitions, client examples, and setup instructions, see the comprehensive documentation.
                          </p>
                          <a 
                            href="/docs/grpc-web-integration.md" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Documentation
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Documentation Link */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-green-900">📚 Complete gRPC Documentation</h4>
                          <p className="text-green-700 mt-1">
                            For detailed implementation guides, Protocol Buffer definitions, client examples, and setup instructions, see the comprehensive documentation.
                          </p>
                          <a 
                            href="/docs/grpc-integration.md" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Documentation
                          </a>
                        </div>
                      </div>
                    </div>

                  </>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please upload documents and build a knowledge graph first to use gRPC streaming services.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Document Upload
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sse' && (
          <div>
            {graphData ? (
              <div className="space-y-6">
                {/* SSE Header with Add to Postman Button */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📡 SSE Services</h3>
                    <p className="text-gray-700 mt-1">
                      Server-Sent Events for real-time streaming GraphRAG results
                    </p>
                  </div>
                  <button 
                    onClick={generateSsePostmanCollection}
                    disabled={!graphData || importStatus === 'importing'}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {importStatus === 'importing' ? 'Importing...' : 'Add SSE to Postman'}
                  </button>
                </div>

                {/* Live SSE Client */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">📡 Live SSE Client</h3>
                    <p className="text-gray-700 mt-1">
                      Test Server-Sent Events functionality directly from your browser
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Query Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SSE Query
                        </label>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter a GraphRAG query for SSE testing..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      {/* Sample Queries */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample SSE Queries
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <button
                            onClick={() => setQuery("StreamGraph: AI healthcare relationships")}
                            className="text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-blue-800">Graph Streaming</div>
                            <div className="text-xs text-blue-600">StreamGraph: AI healthcare relationships</div>
                          </button>
                          <button
                            onClick={() => setQuery("StreamContext: AI benefits in healthcare")}
                            className="text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-green-800">Context Streaming</div>
                            <div className="text-xs text-green-600">StreamContext: AI benefits in healthcare</div>
                          </button>
                          <button
                            onClick={() => setQuery("StreamResults: Machine learning diagnosis")}
                            className="text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-purple-800">Results Streaming</div>
                            <div className="text-xs text-purple-600">StreamResults: Machine learning diagnosis</div>
                          </button>
                          <button
                            onClick={() => setQuery("Stanford researchers and their work")}
                            className="text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <div className="text-sm font-medium text-red-800">Default Streaming</div>
                            <div className="text-xs text-red-600">Stanford researchers and their work</div>
                          </button>
                        </div>
                      </div>

                      {/* Run SSE Query Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSseQuery}
                          disabled={!query.trim() || !graphData || isQuerying}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {isQuerying ? 'Running SSE Query...' : 'Run SSE Query'}
                        </button>
                      </div>

                      {/* SSE Results */}
                      {sseResults && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">SSE Results</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Protocol:</span>
                              <span className="text-sm text-red-600">SSE (Server-Sent Events)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Latency:</span>
                              <span className="text-sm text-green-600">{sseResults.latency}ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Payload Size:</span>
                              <span className="text-sm text-gray-600">{sseResults.payloadSize}B</span>
                            </div>
                            <div className="border-t pt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Response:</div>
                              <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                {sseResults.response}
                              </div>
                            </div>
                            {sseResults.streaming && (
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">Streaming Events:</div>
                                <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                  {sseResults.streamingData.map((event: any, index: number) => (
                                    <div key={index} className="mb-2 p-2 bg-red-50 rounded">
                                      <span className="text-red-600 font-medium">Event {index + 1}:</span> {event.content}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documentation Link */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-red-900">📚 Complete SSE Documentation</h4>
                      <p className="text-red-700 mt-1">
                        For detailed implementation guides, client examples, and setup instructions, see the comprehensive documentation.
                      </p>
                      <a 
                        href="/docs/sse-integration.md" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Documentation
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please upload documents and build a knowledge graph first to use SSE streaming services.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Document Upload
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'websocket' && (
          <div>
            {graphData ? (
              <div className="space-y-6">
                {/* WebSocket Header with Add to Postman Button */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">🔌 WebSocket Services</h3>
                    <p className="text-gray-700 mt-1">
                      Real-time bidirectional communication for GraphRAG with persistent connections
                    </p>
                  </div>
                  <button 
                    onClick={generateWebSocketPostmanCollection}
                    disabled={!graphData || importStatus === 'importing'}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {importStatus === 'importing' ? 'Importing...' : 'Add WebSocket to Postman'}
                  </button>
                </div>

                {/* Live WebSocket Client */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">🔌 Live WebSocket Client</h3>
                    <p className="text-gray-700 mt-1">
                      Test WebSocket functionality directly from your browser
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Query Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WebSocket Query
                        </label>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter a GraphRAG query for WebSocket testing..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>

                      {/* Sample Queries */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sample WebSocket Queries
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
                            <div className="text-sm font-medium text-green-800">Streaming</div>
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

                      {/* Run WebSocket Query Button */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleWebSocketQuery}
                          disabled={!query.trim() || !graphData || isQuerying}
                          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {isQuerying ? 'Running WebSocket Query...' : 'Run WebSocket Query'}
                        </button>
                      </div>

                      {/* WebSocket Results */}
                      {websocketResults && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">WebSocket Results</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Protocol:</span>
                              <span className="text-sm text-orange-600">WebSocket (Real-time + JSON)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Latency:</span>
                              <span className="text-sm text-green-600">{websocketResults.latency}ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Payload Size:</span>
                              <span className="text-sm text-gray-600">{websocketResults.payloadSize}B</span>
                            </div>
                            <div className="border-t pt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Response:</div>
                              <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                {websocketResults.response}
                              </div>
                            </div>
                            {websocketResults.streaming && (
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">Streaming Data:</div>
                                <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-32 overflow-y-auto">
                                  {websocketResults.streamingData.map((chunk: any, index: number) => (
                                    <div key={index} className="mb-2 p-2 bg-orange-50 rounded">
                                      <span className="text-orange-600 font-medium">Chunk {index + 1}:</span> {chunk.content}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documentation Link */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-orange-900">📚 Complete WebSocket Documentation</h4>
                      <p className="text-orange-700 mt-1">
                        For detailed implementation guides, client examples, and setup instructions, see the comprehensive documentation.
                      </p>
                      <a 
                        href="/docs/websocket-integration.md" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Documentation
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Graph Required</h3>
            <p className="text-yellow-700 mb-4">
              Please upload documents and build a knowledge graph first to use gRPC streaming services.
            </p>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Document Upload
            </button>
          </div>
        )}
        </div>
        )}
      </div>
    </div>
  );
}
