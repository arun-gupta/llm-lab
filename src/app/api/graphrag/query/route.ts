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
    const { query, graphData } = await request.json();

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

    // Get responses from LLM
    const [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
      callOpenAI('gpt-4o-mini', graphRAGPrompt),
      callOpenAI('gpt-4o-mini', traditionalRAGPrompt)
    ]);

    const endTime = Date.now();
    const graphRAGLatency = endTime - startTime;
    const traditionalRAGLatency = endTime - startTime; // Simplified for MVP

    // Calculate context relevance (simplified)
    const contextRelevance = calculateContextRelevance(query, graphContext);

    return NextResponse.json({
      query,
      graphRAGResponse: graphRAGResponse.content,
      traditionalRAGResponse: traditionalRAGResponse.content,
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
  const relevantNodes: GraphNode[] = [];
  const relevantEdges: GraphEdge[] = [];

  // Find nodes that match query terms
  for (const node of graphData.nodes) {
    if (queryLower.includes(node.label.toLowerCase()) || 
        node.label.toLowerCase().includes(queryLower)) {
      relevantNodes.push(node);
    }
  }

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

  // Build context descriptions
  const context = [];
  
  for (const node of relevantNodes.slice(0, 5)) { // Limit to top 5
    context.push({
      type: 'entity',
      description: `${node.label} (${node.type}) - ${node.connections} connections`
    });
  }

  for (const edge of relevantEdges.slice(0, 5)) { // Limit to top 5
    const sourceNode = graphData.nodes.find(n => n.id === edge.source);
    const targetNode = graphData.nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      context.push({
        type: 'relationship',
        description: `${sourceNode.label} ${edge.relationship} ${targetNode.label}`
      });
    }
  }

  return context;
}

function buildGraphRAGPrompt(query: string, context: any[]) {
  const contextText = context.map(ctx => ctx.description).join('\n');
  
  return `You are a GraphRAG assistant with access to a knowledge graph. Use the following graph context to answer the query:

GRAPH CONTEXT:
${contextText}

QUERY: ${query}

Please provide a comprehensive answer that leverages the relationships and entities in the knowledge graph. Focus on connections and patterns that emerge from the graph structure.`;
}

function buildTraditionalRAGPrompt(query: string, graphData: GraphData) {
  const entities = graphData.nodes.map(n => n.label).join(', ');
  
  return `You are a traditional RAG assistant. Use the following document entities to answer the query:

DOCUMENT ENTITIES: ${entities}

QUERY: ${query}

Please provide an answer based on the available entities from the documents.`;
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
