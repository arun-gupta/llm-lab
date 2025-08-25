import { NextRequest } from 'next/server';
// import { graphRAGWebClient } from '@/lib/grpc-web-client';

// Real SSE streaming endpoint for GraphRAG context retrieval
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const graphId = searchParams.get('graphId');
  const maxContextSize = parseInt(searchParams.get('maxContextSize') || '10');

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
          message: 'SSE context streaming established',
          query,
          graphId,
          maxContextSize,
          timestamp: new Date().toISOString()
        })}\n\n`));

        // Get real context chunks
        const contextResults = await graphRAGWebClient.getContextStream(query, graphId, maxContextSize);
        
        // Send context chunks as individual events
        for (let i = 0; i < contextResults.length; i++) {
          const context = contextResults[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            event: 'context_chunk',
            data: context,
            index: i + 1,
            total: contextResults.length,
            relevance_score: context.relevance_score,
            entity_type: context.entity_type,
            timestamp: new Date().toISOString()
          })}\n\n`));
          
          // Add delay between events for realistic streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'complete',
          message: 'Context retrieval completed',
          summary: {
            total_context_chunks: contextResults.length,
            query,
            graphId,
            average_relevance: contextResults.reduce((sum, ctx) => sum + ctx.relevance_score, 0) / contextResults.length
          },
          timestamp: new Date().toISOString()
        })}\n\n`));

        controller.close();
      } catch (error) {
        console.error('SSE context streaming error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: 'error',
          error: 'Failed to retrieve context',
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
