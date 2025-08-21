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
