import { NextRequest } from 'next/server';
// // import { graphRAGWebClient } from '@/lib/grpc-web-client';

// Real SSE streaming endpoint for GraphRAG queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const graphId = searchParams.get('graphId');
  const model = searchParams.get('model') || 'gpt-4';

  if (!query || !graphId) {
    return new Response('data: {"error": "Query and graphId are required"}\n\n', {
      status: 400,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'connected',
          message: 'SSE connection established',
          query,
          graphId,
          timestamp: new Date().toISOString()
        })}\n\n`));

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Send processing start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'processing',
          message: 'Processing GraphRAG query',
          query,
          timestamp: new Date().toISOString()
        })}\n\n`));

        // Get real graph traversal results
        const traverseResults = await graphRAGWebClient.traverseGraph(query, graphId, model);
        
        // Send graph nodes as individual events
        for (let i = 0; i < Math.min(traverseResults.length, 5); i++) {
          const node = traverseResults[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            event: 'graph_node',
            data: node,
            index: i + 1,
            total: Math.min(traverseResults.length, 5),
            timestamp: new Date().toISOString()
          })}\n\n`));
          
          // Add delay between events for realistic streaming
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Get context chunks
        const contextResults = await graphRAGWebClient.getContextStream(query, graphId, 5);
        
        // Send context chunks as individual events
        for (let i = 0; i < contextResults.length; i++) {
          const context = contextResults[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            event: 'context_chunk',
            data: context,
            index: i + 1,
            total: contextResults.length,
            timestamp: new Date().toISOString()
          })}\n\n`));
          
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'complete',
          message: 'GraphRAG query completed',
          summary: {
            total_nodes: traverseResults.length,
            total_context_chunks: contextResults.length,
            query,
            graphId
          },
          timestamp: new Date().toISOString()
        })}\n\n`));

        controller.close();
      } catch (error) {
        console.error('SSE streaming error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'error',
          error: 'Failed to process GraphRAG query',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
