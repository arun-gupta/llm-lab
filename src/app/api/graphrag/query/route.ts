import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/llm-apis';

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

export async function POST(request: NextRequest) {
  try {
    const { query, graphData, model = 'gpt-4o-mini' } = await request.json();

    if (!query || !graphData) {
      return NextResponse.json(
        { error: 'Query and graph data are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Extract relevant graph context
    const graphContext = extractRelevantContext(query, graphData);
    
    // Build GraphRAG prompt
    const graphRAGPrompt = buildGraphRAGPrompt(query, graphContext);
    
    // Build traditional RAG prompt (simplified)
    const traditionalRAGPrompt = buildTraditionalRAGPrompt(query, graphData);

    // Get responses from LLM with error handling
    let graphRAGResponse, traditionalRAGResponse;
    
    try {
      // Determine provider and model
      const isAnthropic = model.startsWith('claude');
      const isOllama = model.startsWith('ollama:');
      const provider = isAnthropic ? 'anthropic' : isOllama ? 'ollama' : 'openai';
      
      if (isAnthropic) {
        // Use Anthropic API for Claude models
        const { callAnthropic } = await import('@/lib/llm-apis');
        [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
          callAnthropic(graphRAGPrompt, undefined, model),
          callAnthropic(traditionalRAGPrompt, undefined, model)
        ]);
      } else if (isOllama) {
        // Use Ollama API for local models
        const { callOllama } = await import('@/lib/llm-apis');
        const ollamaModel = model.replace('ollama:', '');
        [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
          callOllama(graphRAGPrompt, ollamaModel, undefined),
          callOllama(traditionalRAGPrompt, ollamaModel, undefined)
        ]);
      } else {
        // Use OpenAI API for GPT models - use streaming for GPT-5 models
        if (model.startsWith('gpt-5')) {
          const { callOpenAIStreaming } = await import('@/lib/llm-apis');
          [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
            callOpenAIStreaming(graphRAGPrompt, undefined, model),
            callOpenAIStreaming(traditionalRAGPrompt, undefined, model)
          ]);
        } else {
          [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
            callOpenAI(graphRAGPrompt, undefined, model),
            callOpenAI(traditionalRAGPrompt, undefined, model)
          ]);
        }
      }
    } catch (error) {
      console.error('LLM API error:', error);
      return NextResponse.json({
        error: 'Failed to get responses from LLM. Please check your API key and try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    const endTime = Date.now();
    // Use individual latencies from each response for accurate comparison
    const graphRAGLatency = graphRAGResponse?.latency || (endTime - startTime);
    const traditionalRAGLatency = traditionalRAGResponse?.latency || (endTime - startTime);

    // Validate responses
    const graphRAGContent = graphRAGResponse?.content || 'No response received from GraphRAG';
    const traditionalRAGContent = traditionalRAGResponse?.content || 'No response received from Traditional RAG';

    // Check for token limit errors
    const isTokenLimitError = (content: string) => 
      content.includes('token limit') || content.includes('cut off') || content.length < 50;

    const finalGraphRAGResponse = isTokenLimitError(graphRAGContent) 
      ? 'Response was truncated due to length. Try a more specific query or check the graph context.'
      : graphRAGContent;

    const finalTraditionalRAGResponse = isTokenLimitError(traditionalRAGContent)
      ? 'Response was truncated due to length. Try a more specific query.'
      : traditionalRAGContent;

    // Calculate context relevance (simplified)
    const contextRelevance = calculateContextRelevance(query, graphContext);

    // Calculate token usage analytics
    const tokenAnalytics = calculateTokenAnalytics(
      graphRAGResponse, 
      traditionalRAGResponse, 
      graphRAGPrompt, 
      traditionalRAGPrompt
    );

    // Calculate response quality analytics
    const qualityAnalytics = calculateResponseQuality(
      finalGraphRAGResponse, 
      finalTraditionalRAGResponse, 
      query
    );

    // Calculate graph coverage analytics
    const graphAnalytics = calculateGraphCoverage(graphContext, graphData);

    return NextResponse.json({
      query,
      model,
      graphRAGResponse: finalGraphRAGResponse,
      traditionalRAGResponse: finalTraditionalRAGResponse,
      graphContext: graphContext.map(ctx => ctx.description),
      performance: {
        graphRAGLatency,
        traditionalRAGLatency,
        contextRelevance
      },
      analytics: {
        tokens: tokenAnalytics,
        quality: qualityAnalytics,
        graph: graphAnalytics
      }
    });

  } catch (error) {
    console.error('Error querying GraphRAG:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

function extractRelevantContext(query: string, graphData: GraphData) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(' ').filter(term => term.length > 2);
  const relevantNodes: GraphNode[] = [];
  const relevantEdges: GraphEdge[] = [];

  // Score nodes by relevance
  const nodeScores = graphData.nodes.map(node => {
    let score = 0;
    const nodeLabel = node.label.toLowerCase();
    
    // Exact matches get higher scores
    if (queryLower.includes(nodeLabel) || nodeLabel.includes(queryLower)) {
      score += 10;
    }
    
    // Partial matches
    for (const term of queryTerms) {
      if (nodeLabel.includes(term)) {
        score += 2;
      }
    }
    
    // Bonus for high-connection nodes
    score += Math.min(node.connections * 0.5, 5);
    
    return { node, score };
  });

  // Sort by score and take top nodes
  const topNodes = nodeScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.node);

  relevantNodes.push(...topNodes);

  // Find edges connected to relevant nodes
  for (const edge of graphData.edges) {
    const sourceNode = graphData.nodes.find(n => n.id === edge.source);
    const targetNode = graphData.nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode && 
        (relevantNodes.some(n => n.id === edge.source) || 
         relevantNodes.some(n => n.id === edge.target))) {
      relevantEdges.push(edge);
    }
  }

  // Build concise context descriptions
  const context = [];
  
  for (const node of relevantNodes.slice(0, 2)) { // Limit to top 2
    context.push({
      type: 'entity',
      description: `${node.label} (${node.type}, ${node.connections} connections)`
    });
  }

  for (const edge of relevantEdges.slice(0, 2)) { // Limit to top 2
    const sourceNode = graphData.nodes.find(n => n.id === edge.source);
    const targetNode = graphData.nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      context.push({
        type: 'relationship',
        description: `${sourceNode.label} → ${targetNode.label} (${edge.relationship})`
      });
    }
  }

  return context;
}

function buildGraphRAGPrompt(query: string, context: any[]) {
  // Limit context to prevent token overflow
  const limitedContext = context.slice(0, 3); // Only top 3 most relevant
  const contextText = limitedContext.map(ctx => ctx.description).join('\n');
  
  return `GraphRAG Assistant - Use this knowledge graph context:

CONTEXT:
${contextText}

QUERY: ${query}

Answer using graph relationships and connections. Keep response under 300 words.`;
}

function buildTraditionalRAGPrompt(query: string, graphData: GraphData) {
  // Limit entities to prevent token overflow
  const limitedEntities = graphData.nodes.slice(0, 10).map(n => n.label).join(', ');
  
  return `Traditional RAG Assistant - Use these document entities:

ENTITIES: ${limitedEntities}

QUERY: ${query}

Answer based on available entities. Keep response under 300 words.`;
}

function calculateContextRelevance(query: string, context: any[]) {
  if (context.length === 0) return 0;
  
  const queryTerms = query.toLowerCase().split(' ');
  let relevantContexts = 0;
  
  for (const ctx of context) {
    const contextText = ctx.description.toLowerCase();
    const hasRelevantTerms = queryTerms.some(term => 
      contextText.includes(term) && term.length > 2
    );
    if (hasRelevantTerms) relevantContexts++;
  }
  
  return relevantContexts / context.length;
}

function calculateTokenAnalytics(graphRAGResponse: any, traditionalRAGResponse: any, graphRAGPrompt: string, traditionalRAGPrompt: string) {
  // Estimate tokens (rough approximation: ~4 characters per token)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  const graphRAGInputTokens = estimateTokens(graphRAGPrompt);
  const traditionalRAGInputTokens = estimateTokens(traditionalRAGPrompt);
  
  const graphRAGOutputTokens = graphRAGResponse?.tokens?.completion || estimateTokens(graphRAGResponse?.content || '');
  const traditionalRAGOutputTokens = traditionalRAGResponse?.tokens?.completion || estimateTokens(traditionalRAGResponse?.content || '');
  
  const graphRAGTotalTokens = graphRAGResponse?.tokens?.total || (graphRAGInputTokens + graphRAGOutputTokens);
  const traditionalRAGTotalTokens = traditionalRAGResponse?.tokens?.total || (traditionalRAGInputTokens + traditionalRAGOutputTokens);
  
  // Calculate token efficiency (output per input)
  const graphRAGEfficiency = graphRAGInputTokens > 0 ? graphRAGOutputTokens / graphRAGInputTokens : 0;
  const traditionalRAGEfficiency = traditionalRAGInputTokens > 0 ? traditionalRAGOutputTokens / traditionalRAGInputTokens : 0;
  
  // Rough cost estimation (using GPT-4o-mini pricing as baseline)
  const costPer1KTokens = 0.00015; // $0.00015 per 1K tokens
  const graphRAGCost = (graphRAGTotalTokens / 1000) * costPer1KTokens;
  const traditionalRAGCost = (traditionalRAGTotalTokens / 1000) * costPer1KTokens;
  
  return {
    graphRAG: {
      input: graphRAGInputTokens,
      output: graphRAGOutputTokens,
      total: graphRAGTotalTokens,
      efficiency: graphRAGEfficiency,
      cost: graphRAGCost
    },
    traditionalRAG: {
      input: traditionalRAGInputTokens,
      output: traditionalRAGOutputTokens,
      total: traditionalRAGTotalTokens,
      efficiency: traditionalRAGEfficiency,
      cost: traditionalRAGCost
    }
  };
}

function calculateResponseQuality(graphRAGResponse: string, traditionalRAGResponse: string, query: string) {
  // Response length analysis
  const graphRAGLength = graphRAGResponse.length;
  const traditionalRAGLength = traditionalRAGResponse.length;
  
  // Completeness score (how many query terms are addressed)
  const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  const graphRAGCompleteness = calculateCompleteness(graphRAGResponse, queryTerms);
  const traditionalRAGCompleteness = calculateCompleteness(traditionalRAGResponse, queryTerms);
  
  // Specificity score (ratio of specific terms vs generic terms)
  const graphRAGSpecificity = calculateSpecificity(graphRAGResponse);
  const traditionalRAGSpecificity = calculateSpecificity(traditionalRAGResponse);
  
  // Readability score (Flesch reading ease approximation)
  const graphRAGReadability = calculateReadability(graphRAGResponse);
  const traditionalRAGReadability = calculateReadability(traditionalRAGResponse);
  
  return {
    graphRAG: {
      length: graphRAGLength,
      completeness: graphRAGCompleteness,
      specificity: graphRAGSpecificity,
      readability: graphRAGReadability
    },
    traditionalRAG: {
      length: traditionalRAGLength,
      completeness: traditionalRAGCompleteness,
      specificity: traditionalRAGSpecificity,
      readability: traditionalRAGReadability
    }
  };
}

function calculateGraphCoverage(context: any[], graphData: GraphData) {
  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.edges.length;
  
  // Count unique entities used in context
  const usedEntities = new Set();
  const usedRelationships = new Set();
  
  context.forEach(ctx => {
    if (ctx.type === 'entity') {
      usedEntities.add(ctx.description.split(' (')[0]); // Extract entity name
    } else if (ctx.type === 'relationship') {
      usedRelationships.add(ctx.description);
    }
  });
  
  const coveragePercentage = totalNodes > 0 ? (usedEntities.size / totalNodes) * 100 : 0;
  const relationshipUtilization = totalEdges > 0 ? (usedRelationships.size / totalEdges) * 100 : 0;
  
  // Calculate entity type distribution
  const entityTypes = new Map<string, number>();
  graphData.nodes.forEach(node => {
    if (usedEntities.has(node.label)) {
      entityTypes.set(node.type, (entityTypes.get(node.type) || 0) + 1);
    }
  });
  
  return {
    totalNodes,
    totalEdges,
    usedEntities: usedEntities.size,
    usedRelationships: usedRelationships.size,
    coveragePercentage,
    relationshipUtilization,
    entityTypeDistribution: Object.fromEntries(entityTypes)
  };
}

// Helper functions for quality calculations
function calculateCompleteness(response: string, queryTerms: string[]): number {
  if (queryTerms.length === 0) return 1;
  
  const responseLower = response.toLowerCase();
  let addressedTerms = 0;
  
  for (const term of queryTerms) {
    if (responseLower.includes(term)) {
      addressedTerms++;
    }
  }
  
  return addressedTerms / queryTerms.length;
}

function calculateSpecificity(response: string): number {
  // Count specific terms (proper nouns, technical terms) vs generic terms
  const specificPatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Proper nouns
    /\b[A-Z][A-Z]+\b/g, // Acronyms
    /\b\d+\b/g, // Numbers
    /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g // Technical terms
  ];
  
  const genericPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, // Common words
    /\b(this|that|these|those|it|they|them|their)\b/gi // Pronouns
  ];
  
  let specificCount = 0;
  let genericCount = 0;
  
  specificPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) specificCount += matches.length;
  });
  
  genericPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) genericCount += matches.length;
  });
  
  const total = specificCount + genericCount;
  return total > 0 ? specificCount / total : 0;
}

function calculateReadability(text: string): number {
  // Enhanced readability calculation with better handling of technical content
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = estimateSyllables(text);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease formula: 206.835 - (1.015 × avg sentence length) - (84.6 × avg syllables per word)
  let fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Handle negative scores for technical content by using a more lenient scale
  if (fleschScore < 0) {
    // For very technical content, map negative scores to a reasonable range
    // -50 to 0 becomes 20 to 40 (indicating technical but readable)
    fleschScore = Math.max(20, 40 + (fleschScore * 0.4));
  }
  
  // Ensure the score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(fleschScore)));
}

function estimateSyllables(text: string): number {
  // Enhanced syllable estimation for technical content
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;
  
  words.forEach(word => {
    // Clean the word
    word = word.replace(/[^\w]/g, ''); // Remove non-word characters
    
    if (word.length === 0) return;
    
    // Handle technical terms and acronyms
    if (word.match(/^[a-z]+$/)) {
      // Regular word - remove common suffixes that don't add syllables
      word = word.replace(/(?:ed|es|ing|ly|ment|ness|tion|sion|al|ive|able|ible)$/, '');
      
      // Count vowel groups more accurately
      const vowelGroups = word.match(/[aeiouy]+/g);
      if (vowelGroups) {
        syllableCount += vowelGroups.length;
      } else {
        syllableCount += 1; // At least one syllable
      }
    } else {
      // Technical terms, numbers, or mixed content - estimate more conservatively
      syllableCount += Math.max(1, Math.ceil(word.length / 3));
    }
  });
  
  return syllableCount;
}
