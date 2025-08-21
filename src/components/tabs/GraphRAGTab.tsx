'use client';

import { useState } from 'react';
import { Upload, Network, Search, BarChart3, Download } from 'lucide-react';
import { GraphPreview } from '@/components/GraphPreview';

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
}

export function GraphRAGTab() {
  const [documents, setDocuments] = useState<File[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<GraphRAGResponse | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'graph' | 'query' | 'analytics'>('upload');
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  const sampleQueries = [
    "What are the key relationships between AI and healthcare?",
    "How do technology companies innovate in their respective fields?",
    "What are the main challenges in AI implementation?",
    "Which organizations are leading in AI research?",
    "What are the benefits of AI in modern healthcare?",
    "How do different companies approach AI development?"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const textFiles = files.filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    setDocuments(textFiles);
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
        body: JSON.stringify({ query, graphData }),
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
    try {
      const response = await fetch('/api/graphrag/postman-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graphData, responses }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graphrag-collection.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating Postman collection:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GraphRAG Lab</h2>
          <p className="text-gray-600">Build knowledge graphs and compare GraphRAG vs traditional RAG</p>
        </div>
        <button 
          onClick={generatePostmanCollection} 
          disabled={!responses}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Postman Collection
        </button>
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
              activeTab === 'query' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${!graphData ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => graphData && setActiveTab('query')}
            disabled={!graphData}
          >
            🔍 Query & Compare {graphData && <span className="ml-1 text-green-500">✓</span>}
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${!responses ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => responses && setActiveTab('analytics')}
            disabled={!responses}
          >
            📊 Analytics
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Upload className="w-5 h-5" />
                  Upload Documents
                </h3>
                <p className="text-gray-600 mt-1">
                  Upload text files to build a knowledge graph. The system will extract entities and relationships.
                </p>
              </div>
              <div className="p-6 space-y-4">
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

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
                    <div className="space-y-1">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">{(doc.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
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

        {activeTab === 'query' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Search className="w-5 h-5" />
                  Query & Compare
                </h3>
                <p className="text-gray-600 mt-1">
                  Test GraphRAG vs traditional RAG responses
                </p>
              </div>
              <div className="p-6 space-y-4">
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
          </div>
        )}

        {activeTab === 'analytics' && responses && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
                <p className="text-gray-600 mt-1">
                  Detailed analysis of GraphRAG vs Traditional RAG
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
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

                  <div>
                    <h4 className="font-medium mb-2">Graph Context Used:</h4>
                    <div className="space-y-1">
                      {responses.graphContext.map((context, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {context}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
