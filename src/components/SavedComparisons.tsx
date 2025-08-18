'use client';

import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Zap, Trash2, Eye, Download } from 'lucide-react';

interface SavedComparison {
  id: string;
  timestamp: string;
  prompt: string;
  context?: string;
  selectedProviders: string[];
  responses: any[];
  analytics: any;
  metadata: {
    totalResponses: number;
    successfulResponses: number;
    totalTokens: number;
    avgLatency: number;
  };
}

interface SavedComparisonsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedComparisons({ isOpen, onClose }: SavedComparisonsProps) {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<SavedComparison | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadComparisons();
    }
  }, [isOpen]);

  const loadComparisons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/comparisons/save');
      if (response.ok) {
        const data = await response.json();
        setComparisons(data);
      }
    } catch (error) {
      console.error('Failed to load comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComparison = async (id: string) => {
    try {
      const response = await fetch(`/api/comparisons/save/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setComparisons(prev => prev.filter(c => c.id !== id));
        if (selectedComparison?.id === id) {
          setSelectedComparison(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    }
  };

  const exportComparison = (comparison: SavedComparison) => {
    const blob = new Blob([JSON.stringify(comparison, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${comparison.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncatePrompt = (prompt: string, maxLength: number = 100) => {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Saved Comparisons</h2>
              <p className="text-sm text-gray-600">View and manage your saved model comparisons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Comparison List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading comparisons...</p>
                </div>
              ) : comparisons.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved comparisons</h3>
                  <p className="text-gray-600">Save your first comparison to see it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comparisons.map((comparison) => (
                    <div
                      key={comparison.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedComparison?.id === comparison.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedComparison(comparison)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {truncatePrompt(comparison.prompt, 60)}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportComparison(comparison);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Export"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComparison(comparison.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(comparison.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{comparison.metadata.successfulResponses}/{comparison.metadata.totalResponses} responses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{comparison.metadata.totalTokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comparison Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedComparison ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparison Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedComparison.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Models:</span>
                      <span className="ml-2 font-medium">{selectedComparison.selectedProviders.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="ml-2 font-medium">
                        {((selectedComparison.metadata.successfulResponses / selectedComparison.metadata.totalResponses) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Latency:</span>
                      <span className="ml-2 font-medium">{Math.round(selectedComparison.metadata.avgLatency)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Prompt</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedComparison.prompt}</p>
                    {selectedComparison.context && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 font-medium mb-1">Context:</p>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedComparison.context}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Responses</h4>
                  <div className="space-y-4">
                    {selectedComparison.responses.map((response, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{response.provider}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{response.latency}ms</span>
                            <span>{response.tokens?.total || 0} tokens</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">
                            {response.content || 'No response received'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Section */}
                {selectedComparison.analytics && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Analytics</h4>
                    
                    {/* Performance Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 flex items-center space-x-3 mb-4">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-3 h-3 text-blue-600" />
                          </div>
                          <span>Performance</span>
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Success Rate</span>
                            <span className="font-semibold text-gray-900">
                              {((selectedComparison.analytics.successfulResponses / selectedComparison.analytics.totalResponses) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Avg Latency</span>
                            <span className="font-semibold text-gray-900">{Math.round(selectedComparison.analytics.avgLatency)}ms</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 text-sm">Fastest Response</span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{selectedComparison.analytics.performanceRanking?.[0]?.provider.split(' ')[0]}</div>
                              <div className="text-xs text-gray-500">{selectedComparison.analytics.performanceRanking?.[0]?.latency}ms</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 flex items-center space-x-3 mb-4">
                          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-3 h-3 text-green-600" />
                          </div>
                          <span>Token Usage</span>
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Total Tokens</span>
                            <span className="font-semibold text-gray-900">{selectedComparison.analytics.totalTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Avg per Response</span>
                            <span className="font-semibold text-gray-900">{Math.round(selectedComparison.analytics.avgTokens)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 text-sm">Most Efficient</span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{selectedComparison.analytics.efficiencyRanking?.[0]?.provider.split(' ')[0]}</div>
                              <div className="text-xs text-gray-500">Lowest token usage</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 flex items-center space-x-3 mb-4">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <span>Cost Analysis</span>
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Total Cost</span>
                            <span className="font-semibold text-gray-900">
                              ${selectedComparison.analytics.totalCost?.toFixed(8) || '0.00000000'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Most Expensive</span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {(() => {
                                  const maxCostIndex = selectedComparison.analytics.costEstimates?.indexOf(Math.max(...selectedComparison.analytics.costEstimates));
                                  const maxCost = selectedComparison.analytics.costEstimates?.[maxCostIndex];
                                  const provider = selectedComparison.responses[maxCostIndex]?.provider.split(' ')[0] || 'Unknown';
                                  return maxCost > 0 ? provider : 'All Free';
                                })()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(() => {
                                  const maxCostIndex = selectedComparison.analytics.costEstimates?.indexOf(Math.max(...selectedComparison.analytics.costEstimates));
                                  const maxCost = selectedComparison.analytics.costEstimates?.[maxCostIndex];
                                  return maxCost > 0 ? `$${maxCost.toFixed(8)}` : 'No cost';
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 text-sm">Monthly (1k/day)</span>
                            <span className="font-semibold text-gray-900">
                              ${((selectedComparison.analytics.totalCost || 0) * 30000).toFixed(6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 flex items-center space-x-3 mb-4">
                          <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span>Content Analysis</span>
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Avg Word Count</span>
                            <span className="font-semibold text-gray-900">{Math.round(selectedComparison.analytics.avgWordCount)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600 text-sm">Similarity</span>
                            <span className="font-semibold text-gray-900">
                              {(selectedComparison.analytics.avgSimilarity * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 text-sm">Length Range</span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{selectedComparison.analytics.shortestResponse}-{selectedComparison.analytics.longestResponse}</div>
                              <div className="text-xs text-gray-500">characters</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Ranking */}
                    {selectedComparison.analytics.performanceRanking && (
                      <div className="mb-6">
                        <h5 className="font-medium text-gray-900 mb-3">Performance Ranking</h5>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                              <div className="flex items-center space-x-3">
                                <span className="w-6">Rank</span>
                                <span>Model</span>
                              </div>
                              <div className="flex items-center space-x-8">
                                <span>Latency</span>
                                <span>Tokens</span>
                                <span>Length</span>
                              </div>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {selectedComparison.analytics.performanceRanking.map((response: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    index === 0 ? 'bg-green-100 text-green-800' :
                                    index === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm">{response.provider}</span>
                                </div>
                                <div className="flex items-center space-x-8 text-sm text-gray-600">
                                  <span className="w-12 text-right">{response.latency}ms</span>
                                  <span className="w-16 text-right">{response.tokens?.total || 0} tokens</span>
                                  <span className="w-12 text-right">{response.content.length} chars</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a comparison</h3>
                  <p className="text-gray-600">Choose a comparison from the list to view its details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
