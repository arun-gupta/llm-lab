'use client';

import { useState } from 'react';
import { ResponseCard } from './ResponseCard';
import { LLMResponse } from '@/lib/llm-apis';
import { BarChart3, MessageSquare, Clock, Zap, DollarSign, Target, Loader2, Download } from 'lucide-react';
import React from 'react'; // Added missing import for React.useEffect
import { generatePostmanCollection } from '@/lib/postman';

interface ResponseTabsProps {
  responses: LLMResponse[];
  prompt: string;
  context?: string;
  isLoading?: boolean;
  selectedProviders?: string[];
  activeTab?: 'responses' | 'analytics';
  onTabChange?: (tab: 'responses' | 'analytics') => void;
}

export function ResponseTabs({ 
  responses, 
  prompt, 
  context, 
  isLoading = false, 
  selectedProviders = [],
  activeTab: externalActiveTab,
  onTabChange
}: ResponseTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'responses' | 'analytics'>('responses');
  const [downloading, setDownloading] = useState(false);
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  
  const handleTabChange = (tab: 'responses' | 'analytics') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Auto-switch to responses tab when new responses arrive
  React.useEffect(() => {
    if (responses.length > 0 && activeTab === 'analytics') {
      handleTabChange('responses');
    }
  }, [responses.length]);

  const createPostmanCollectionForComparison = async () => {
    if (responses.length === 0) return;
    
    setDownloading(true);
    try {
      const collection = generatePostmanCollection(prompt, context, responses, 'LLM Model Comparison');
      const blob = new Blob([JSON.stringify(collection, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'llm-model-comparison.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create Postman collection:', error);
    } finally {
      setDownloading(false);
    }
  };

  const calculateAnalytics = () => {
    const totalResponses = responses.length;
    const successfulResponses = responses.filter(r => !r.error);
    const avgLatency = responses.reduce((sum, r) => sum + r.latency, 0) / totalResponses;
    const totalTokens = responses.reduce((sum, r) => sum + (r.tokens?.total || 0), 0);
    const avgTokens = totalTokens / totalResponses;

    // Response length analysis
    const responseLengths = responses.map(r => r.content.length);
    const avgLength = responseLengths.reduce((sum, len) => sum + len, 0) / totalResponses;
    const shortestResponse = Math.min(...responseLengths);
    const longestResponse = Math.max(...responseLengths);

    // Word count analysis
    const wordCounts = responses.map(r => r.content.split(/\s+/).length);
    const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / totalResponses;

    // Cost estimation (rough estimates in USD per 1M tokens)
    const costEstimates = responses.map(r => {
      if (!r.tokens) return 0;
      const provider = r.provider.toLowerCase();
      let costPer1M = 0;

      if (provider.includes('gpt-5-mini')) costPer1M = 0.50;
      else if (provider.includes('gpt-5')) costPer1M = 10.0;
      else if (provider.includes('gpt-4o-mini')) costPer1M = 0.15;
      else if (provider.includes('gpt-4o')) costPer1M = 5.0;
      else if (provider.includes('gpt-4')) costPer1M = 30.0;
      else if (provider.includes('gpt-3.5')) costPer1M = 0.5;
      else if (provider.includes('claude-4-opus')) costPer1M = 20.0;
      else if (provider.includes('claude-4-sonnet')) costPer1M = 5.0;
      else if (provider.includes('claude-4-haiku')) costPer1M = 0.75;
      else if (provider.includes('claude-3.5-sonnet')) costPer1M = 3.0;
      else if (provider.includes('claude-3.5-haiku')) costPer1M = 0.25;
      else if (provider.includes('claude-3-opus')) costPer1M = 15.0;
      else if (provider.includes('claude-3-haiku')) costPer1M = 0.25;
      else if (provider.includes('ollama')) costPer1M = 0; // Local models are free

      return (r.tokens.total / 1000000) * costPer1M;
    });
    const totalCost = costEstimates.reduce((sum, cost) => sum + cost, 0);

    // Response similarity (basic Jaccard similarity for words)
    const calculateSimilarity = (text1: string, text2: string) => {
      const words1 = new Set(text1.toLowerCase().split(/\s+/));
      const words2 = new Set(text2.toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      return intersection.size / union.size;
    };

    // Completeness Score - how well the response addresses the prompt
    const calculateCompleteness = (response: string, prompt: string) => {
      const promptWords = prompt.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const responseWords = response.toLowerCase().split(/\s+/);
      const responseSet = new Set(responseWords);

      // Check how many key prompt words are addressed
      const addressedWords = promptWords.filter(word => responseSet.has(word) ||
        responseWords.some(rWord => rWord.includes(word) || word.includes(rWord)));

      // Bonus for question words being answered
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
      const promptQuestions = questionWords.filter(q => prompt.toLowerCase().includes(q));
      let questionBonus = 0;

      if (promptQuestions.length > 0) {
        // Simple heuristic: if response is substantial and addresses key terms, likely answers questions
        questionBonus = response.length > 100 && addressedWords.length > promptWords.length * 0.3 ? 0.2 : 0;
      }

      return Math.min(1, (addressedWords.length / Math.max(promptWords.length, 1)) + questionBonus);
    };

    // Readability Level (simplified Flesch-Kincaid)
    const calculateReadability = (text: string) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const syllables = words.reduce((count, word) => {
        // Simple syllable counting heuristic
        const vowels = word.toLowerCase().match(/[aeiouy]+/g);
        return count + (vowels ? vowels.length : 1);
      }, 0);

      if (sentences.length === 0 || words.length === 0) return 0;

      const avgSentenceLength = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;

      // Simplified Flesch-Kincaid Grade Level
      const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
      return Math.max(0, Math.min(20, gradeLevel)); // Cap between 0-20
    };

    // Structure Quality Score
    const calculateStructureQuality = (text: string) => {
      let score = 0;
      const lines = text.split('\n').filter(line => line.trim().length > 0);

      // Check for paragraphs (multiple lines)
      if (lines.length > 1) score += 0.2;

      // Check for bullet points or numbered lists
      const listPattern = /^[\s]*[\]\-*•\d+.)]/;
      const hasLists = lines.some(line => listPattern.test(line));
      if (hasLists) score += 0.3;

      // Check for headers or emphasis (simple heuristics)
      const hasHeaders = lines.some(line =>
        line.trim().length < 50 &&
        (line.includes(':') || line.match(/^[A-Z][^.!?]*$/))
      );
      if (hasHeaders) score += 0.2;

      // Check for proper sentence structure
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgSentenceLength = text.split(/\s+/).length / Math.max(sentences.length, 1);

      // Good sentence length (10-25 words)
      if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 0.2;

      // Check for varied sentence lengths (not all the same)
      const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
      const lengthVariance = sentenceLengths.length > 1 ?
        sentenceLengths.reduce((acc, len, i, arr) =>
          acc + Math.abs(len - arr.reduce((sum, l) => sum + l, 0) / arr.length), 0
        ) / sentenceLengths.length : 0;

      if (lengthVariance > 3) score += 0.1; // Some variety in sentence length

      return Math.min(1, score);
    };

    let avgSimilarity = 0;
    if (responses.length >= 2) {
      const similarities = [];
      for (let i = 0; i < responses.length; i++) {
        for (let j = i + 1; j < responses.length; j++) {
          if (!responses[i].error && !responses[j].error) {
            similarities.push(calculateSimilarity(responses[i].content, responses[j].content));
          }
        }
      }
      avgSimilarity = similarities.length > 0 ? similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length : 0;
    }

    // Performance ranking
    const performanceRanking = responses
      .filter(r => !r.error)
      .sort((a, b) => a.latency - b.latency)
      .map((r, index) => ({ ...r, rank: index + 1 }));

    // Efficiency ranking (tokens per word)
    const efficiencyRanking = responses
      .filter(r => !r.error && r.tokens)
      .map(r => ({
        ...r,
        efficiency: r.tokens!.total / r.content.split(/\s+/).length
      }))
      .sort((a, b) => a.efficiency - b.efficiency);

    // Quality metrics for each response
    const qualityMetrics = responses.map(r => ({
      provider: r.provider,
      completeness: r.error ? 0 : calculateCompleteness(r.content, prompt),
      readability: r.error ? 0 : calculateReadability(r.content),
      structure: r.error ? 0 : calculateStructureQuality(r.content)
    }));

    // Average quality scores (with safe division)
    const avgCompleteness = qualityMetrics.length > 0 ?
      qualityMetrics.reduce((sum, m) => sum + m.completeness, 0) / qualityMetrics.length : 0;
    const avgReadability = qualityMetrics.length > 0 ?
      qualityMetrics.reduce((sum, m) => sum + m.readability, 0) / qualityMetrics.length : 0;
    const avgStructure = qualityMetrics.length > 0 ?
      qualityMetrics.reduce((sum, m) => sum + m.structure, 0) / qualityMetrics.length : 0;

    // Best quality rankings (with safe defaults)
    const bestCompleteness = qualityMetrics.length > 0 ? qualityMetrics.reduce((best, current) =>
      current.completeness > best.completeness ? current : best
    ) : { provider: 'N/A', completeness: 0 };

    const bestReadability = qualityMetrics.length > 0 ? qualityMetrics.reduce((best, current) =>
      current.readability > 0 && (best.readability === 0 || current.readability < best.readability) ? current : best
    ) : { provider: 'N/A', readability: 0 };

    const bestStructure = qualityMetrics.length > 0 ? qualityMetrics.reduce((best, current) =>
      current.structure > best.structure ? current : best
    ) : { provider: 'N/A', structure: 0 };

    return {
      totalResponses,
      successfulResponses: successfulResponses.length,
      errorRate: ((totalResponses - successfulResponses.length) / totalResponses) * 100,
      avgLatency,
      totalTokens,
      avgTokens,
      avgLength,
      shortestResponse,
      longestResponse,
      avgWordCount,
      totalCost,
      avgSimilarity,
      performanceRanking,
      efficiencyRanking,
      costEstimates,
      qualityMetrics,
      avgCompleteness,
      avgReadability,
      avgStructure,
      bestCompleteness,
      bestReadability,
      bestStructure
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('responses')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'responses'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Responses ({responses.length})</span>
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
            disabled={isLoading || responses.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              } ${(isLoading || responses.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Summary Stats */}
        {responses.length > 0 && (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total tokens: {analytics.totalTokens.toLocaleString()}</span>
            <span>Avg latency: {Math.round(analytics.avgLatency)}ms</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'responses' ? (
        <div className="transition-all duration-300 ease-in-out">
          {isLoading ? (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 mb-2">Getting responses from {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''}...</p>
              <div className="flex justify-center space-x-2">
                {selectedProviders.map((provider, index) => (
                  <div key={index} className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>{provider.includes('ollama:') ? provider.replace('ollama:', '') : provider}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No responses yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Enter a prompt and select providers to see responses and compare different LLM outputs.
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>Compare Responses</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Download className="w-4 h-4" />
                    <span>Export to Postman</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>View Metrics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BarChart3 className="w-4 h-4" />
                    <span>Performance Data</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {responses.map((response, index) => (
                <div key={index} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                  <ResponseCard
                    response={response}
                    prompt={prompt}
                    context={context}
                  />
                </div>
              ))}
              
              {/* Postman Collection Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={createPostmanCollectionForComparison}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>{downloading ? 'Creating Collection...' : 'Create Postman Collection for Comparison'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Analytics</h3>

          {responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No responses to analyze yet
              </h3>
              <p className="text-gray-600 mb-4">
                Test some prompts to see detailed analytics and performance metrics.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Latency Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Zap className="w-4 h-4" />
                  <span>Token Usage</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>Quality Metrics</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance Ranking</span>
                </div>
              </div>
            </div>
          ) : analytics.successfulResponses === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No successful responses to analyze</p>
              <p className="text-sm text-gray-500 mt-1">Analytics will appear when responses are available</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Performance</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {((analytics.successfulResponses / analytics.totalResponses) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Latency</span>
                      <span className="text-sm font-semibold text-gray-900">{Math.round(analytics.avgLatency)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fastest Response</span>
                      <span className="text-sm font-semibold text-gray-900 text-xs">
                        {analytics.performanceRanking[0]?.provider.split(' ')[0]} ({analytics.performanceRanking[0]?.latency}ms)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Token Usage</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Tokens</span>
                      <span className="text-sm font-semibold text-gray-900">{analytics.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg per Response</span>
                      <span className="text-sm font-semibold text-gray-900">{Math.round(analytics.avgTokens)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Most Efficient</span>
                      <span className="text-sm font-semibold text-gray-900 text-xs">
                        {analytics.efficiencyRanking[0]?.provider.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Cost Analysis</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${analytics.totalCost < 0.01 ? '<$0.01' : analytics.totalCost.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Most Expensive</span>
                      <span className="text-sm font-semibold text-gray-900 text-xs">
                        {responses[analytics.costEstimates.indexOf(Math.max(...analytics.costEstimates))]?.provider.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly (1k/day)</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(analytics.totalCost * 30000).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Content Analysis</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Word Count</span>
                      <span className="text-sm font-semibold text-gray-900">{Math.round(analytics.avgWordCount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Similarity</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(analytics.avgSimilarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Length Range</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {analytics.shortestResponse}-{analytics.longestResponse}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Analysis Section */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Quality Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Completeness */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Completeness</span>
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average</span>
                        <span className="font-semibold text-gray-900">{(analytics.avgCompleteness * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Best</span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {analytics.bestCompleteness.provider.split(' ')[0]} ({(analytics.bestCompleteness.completeness * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {analytics.qualityMetrics.map((metric, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-500">{metric.provider.split(' ')[0]}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${metric.completeness * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-900">{(metric.completeness * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Readability */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Readability</span>
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Grade Level</span>
                        <span className="font-semibold text-gray-900">{analytics.avgReadability.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Most Readable</span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {analytics.bestReadability.provider.split(' ')[0]} (Grade {analytics.bestReadability.readability.toFixed(1)})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {analytics.qualityMetrics.map((metric, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-500">{metric.provider.split(' ')[0]}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, (20 - metric.readability) * 5)}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-900">Grade {metric.readability.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Structure Quality */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Structure</span>
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average</span>
                        <span className="font-semibold text-gray-900">{(analytics.avgStructure * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Best</span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {analytics.bestStructure.provider.split(' ')[0]} ({(analytics.bestStructure.structure * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {analytics.qualityMetrics.map((metric, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-500">{metric.provider.split(' ')[0]}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${metric.structure * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-900">{(metric.structure * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Ranking */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Performance Ranking</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 text-xs font-medium text-gray-600">Rank</span>
                        <span className="font-medium text-gray-700">Model</span>
                      </div>
                      <div className="flex items-center space-x-8 text-xs font-medium text-gray-600">
                        <span>Latency</span>
                        <span>Tokens</span>
                        <span>Length</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {analytics.performanceRanking.map((response, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index === 0 ? 'bg-green-100 text-green-800' :
                              index === 1 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">{response.provider}</span>
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

              {/* Response Comparison */}
              {responses.length === 2 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">Head-to-Head Comparison</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {responses.map((response, index) => (
                      <div key={index} className="space-y-3">
                        <h5 className="font-medium text-gray-800">{response.provider}</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Speed</span>
                            <span className={response.latency < analytics.avgLatency ? 'text-green-600' : 'text-red-600'}>
                              {response.latency < analytics.avgLatency ? 'Faster' : 'Slower'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tokens</span>
                            <span className={(response.tokens?.total || 0) < analytics.avgTokens ? 'text-green-600' : 'text-red-600'}>
                              {(response.tokens?.total || 0) < analytics.avgTokens ? 'Fewer' : 'More'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Length</span>
                            <span className={response.content.length < analytics.avgLength ? 'text-blue-600' : 'text-purple-600'}>
                              {response.content.length < analytics.avgLength ? 'Concise' : 'Detailed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
