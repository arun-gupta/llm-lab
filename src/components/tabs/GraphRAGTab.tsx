'use client';

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'upload' | 'graph' | 'query' | 'analytics'>('upload');
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'manual' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

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
        
        // Try to import directly to Postman Desktop
        const importToPostman = async () => {
          try {
            setImportMessage('Attempting to import to Postman Desktop...');
            
            // Postman Desktop API endpoint (default port)
            const postmanResponse = await fetch('/api/postman/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                collection: collectionData,
                name: 'GraphRAG API Collection'
              }),
            });

            const result = await postmanResponse.json();

            if (result.success) {
              setImportStatus('success');
              setImportMessage(result.message);
            } else {
              // Fallback to file download if Postman Desktop is not available
              throw new Error('Postman Desktop not available');
            }
          } catch (error) {
            // Fallback: Download the collection file
            setImportMessage('Postman Desktop not available. Downloading collection file...');
            
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
            setImportMessage('Collection downloaded. Import manually into Postman Desktop.');
          }
        };

        await importToPostman();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GraphRAG Lab</h2>
          <p className="text-gray-600">Build knowledge graphs and compare GraphRAG vs traditional RAG</p>
        </div>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={generatePostmanCollection} 
            disabled={!responses || importStatus === 'importing'}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            <Download className="w-4 h-4 mr-2" />
            {importStatus === 'importing' ? 'Importing...' : 'Add to Postman Desktop'}
          </button>
          
          {importStatus !== 'idle' && (
            <div className={`px-3 py-1 rounded-full text-sm ${
              importStatus === 'success' ? 'bg-green-100 text-green-800' :
              importStatus === 'manual' ? 'bg-yellow-100 text-yellow-800' :
              importStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {importMessage}
            </div>
          )}
        </div>
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
                    <div className="text-sm text-gray-500 mb-2">or load sample documents:</div>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Click to load individual sample datasets
                    </p>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
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
                      <span className="text-xs text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''} selected</span>
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

            {/* Analytics Cue */}
            {responses && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800">Detailed Analytics Available</h4>
                      <p className="text-sm text-purple-600">
                        View comprehensive token usage, response quality, and graph coverage metrics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && responses && (
          <div className="space-y-6">
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
          </div>
        )}
      </div>
    </div>
  );
}
