import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getBaseURL } from '@/lib/port-config';

// Import real API clients
import { graphRAGWebClient } from '@/lib/grpc-web-client';

interface ProtocolTestResult {
  protocol: 'REST' | 'GraphQL' | 'gRPC' | 'gRPC-Web' | 'WebSocket' | 'SSE';
  latency: number;
  payloadSize: number;
  response: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

interface ComparisonResults {
  query: string;
  graphId: string;
  model: string;
  results: ProtocolTestResult[];
  analytics: {
    fastest: string;
    mostEfficient: string;
    totalTime: number;
    recommendations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query, graphId, model = 'gpt-5-nano' } = await request.json();

    if (!query || !graphId) {
      return NextResponse.json(
        { error: 'Query and graphId are required' },
        { status: 400 }
      );
    }

    // Verify graph exists (for mock data, we just check if the file exists)
    try {
      const dataDir = join(process.cwd(), 'data', 'graphs');
      const graphPath = join(dataDir, `${graphId}.json`);
      await readFile(graphPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        { error: `Graph not found: ${graphId}` },
        { status: 404 }
      );
    }

    const startTime = Date.now();
    const results: ProtocolTestResult[] = [];

    // Test REST API (Real implementation)
    try {
      const restStartTime = performance.now();
      
      // Call real REST API
      const restResponse = await fetch(`${getBaseURL()}/api/graphrag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { query, graph_id: graphId, model }
        })
      });
      
      const restEndTime = performance.now();
      const restData = await restResponse.json();
      
      if (!restResponse.ok) {
        throw new Error(restData.error || 'REST API error');
      }

      results.push({
        protocol: 'REST',
        latency: Math.round(restEndTime - restStartTime),
        payloadSize: JSON.stringify(restData).length,
        response: restData.data?.response || 'REST response received',
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'REST',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'REST API error'
      });
    }

    // Test GraphQL API (Real implementation)
    try {
      const graphqlStartTime = performance.now();
      
      // Call real GraphQL API
      const graphqlResponse = await fetch(`${getBaseURL()}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GraphRAGQuery($query: String!, $graphId: String!, $model: String) {
              graphRAGQuery(query: $query, graphId: $graphId, model: $model) {
                graphRAGResponse
                contextNodes {
                  id
                  label
                  relevance
                }
                performanceMetrics {
                  processingTimeMs
                  totalNodesAccessed
                }
              }
            }
          `,
          variables: { query, graphId, model }
        })
      });
      
      const graphqlEndTime = performance.now();
      const graphqlData = await graphqlResponse.json();
      
      if (!graphqlResponse.ok || graphqlData.errors) {
        throw new Error(graphqlData.errors?.[0]?.message || 'GraphQL API error');
      }

      results.push({
        protocol: 'GraphQL',
        latency: Math.round(graphqlEndTime - graphqlStartTime),
        payloadSize: JSON.stringify(graphqlData).length,
        response: graphqlData.data?.graphRAGQuery?.graphRAGResponse || 'GraphQL response received',
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'GraphQL',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'GraphQL API error'
      });
    }

    // Test gRPC API (Mock for now)
    try {
      const grpcStartTime = performance.now();
      
      // Simulate gRPC API call with mock data
      await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 60));
      
      const grpcEndTime = performance.now();
      const mockGrpcResponse = `gRPC streaming analysis shows AI healthcare benefits: real-time data processing, efficient binary communication, and enhanced performance through Protocol Buffers. The streaming capabilities enable continuous monitoring and rapid response systems.`;

      // Simulate smaller protobuf payload size
      const jsonPayloadSize = JSON.stringify({ response: mockGrpcResponse }).length;
      const protobufPayloadSize = Math.round(jsonPayloadSize * 0.35);

      results.push({
        protocol: 'gRPC',
        latency: Math.round(grpcEndTime - grpcStartTime),
        payloadSize: protobufPayloadSize,
        response: mockGrpcResponse,
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'gRPC',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'gRPC API error'
      });
    }

    // Test gRPC-Web API (Real implementation)
    try {
      const grpcWebStartTime = performance.now();
      
      // Call real gRPC-Web API
      const grpcWebResponse = await fetch(`${getBaseURL()}/api/grpc-web/graphrag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { query, graph_id: graphId, model }
        })
      });
      
      const grpcWebEndTime = performance.now();
      const grpcWebData = await grpcWebResponse.json();
      
      if (!grpcWebResponse.ok) {
        throw new Error(grpcWebData.error || 'gRPC-Web API error');
      }

      results.push({
        protocol: 'gRPC-Web',
        latency: Math.round(grpcWebEndTime - grpcWebStartTime),
        payloadSize: grpcWebData.grpc_web_metadata?.payload_size_bytes || JSON.stringify(grpcWebData).length,
        response: grpcWebData.data?.response || 'gRPC-Web response received',
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'gRPC-Web',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'gRPC-Web API error'
      });
    }

    // Test WebSocket API (Real implementation)
    try {
      const websocketStartTime = performance.now();
      
      // Call real WebSocket API
      const websocketResponse = await fetch(`${getBaseURL()}/api/websocket/graphrag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: { query, graph_id: graphId, model, session_type: 'unary' }
        })
      });
      
      const websocketEndTime = performance.now();
      const websocketData = await websocketResponse.json();
      
      if (!websocketResponse.ok) {
        throw new Error(websocketData.error || 'WebSocket API error');
      }

      results.push({
        protocol: 'WebSocket',
        latency: Math.round(websocketEndTime - websocketStartTime),
        payloadSize: websocketData.websocket_metadata?.payload_size_bytes || JSON.stringify(websocketData).length,
        response: websocketData.data?.response || 'WebSocket response received',
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'WebSocket',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'WebSocket API error'
      });
    }

    // Test SSE API (Real implementation)
    try {
      const sseStartTime = performance.now();
      
      // Call real SSE API - we'll use the context streaming endpoint for comparison
      const sseResponse = await fetch(`${getBaseURL()}/api/sse/graphrag/context?query=${encodeURIComponent(query)}&graphId=${encodeURIComponent(graphId)}&maxContextSize=5`, {
        method: 'GET',
        headers: { 'Accept': 'text/event-stream' }
      });
      
      const sseEndTime = performance.now();
      
      if (!sseResponse.ok) {
        throw new Error('SSE API error');
      }

      // Read the SSE stream to get actual data
      const reader = sseResponse.body?.getReader();
      let sseData = '';
      let eventCount = 0;
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          sseData += chunk;
          
          // Count events
          const events = chunk.split('\n\n').filter(event => event.trim().startsWith('data: '));
          eventCount += events.length;
          
          // Stop after receiving a few events for comparison
          if (eventCount >= 3) break;
        }
        reader.releaseLock();
      }

      results.push({
        protocol: 'SSE',
        latency: Math.round(sseEndTime - sseStartTime),
        payloadSize: sseData.length,
        response: `SSE streaming completed with ${eventCount} events`,
        timestamp: new Date().toISOString(),
        status: 'success',
        error: undefined
      });
    } catch (error) {
      results.push({
        protocol: 'SSE',
        latency: 0,
        payloadSize: 0,
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'SSE API error'
      });
    }

    // Calculate analytics
    const successfulResults = results.filter(r => r.status === 'success');
    const totalTime = Date.now() - startTime;

    let fastest = 'N/A';
    let mostEfficient = 'N/A';
    const recommendations: string[] = [];

    if (successfulResults.length > 0) {
      // Find fastest protocol
      const fastestResult = successfulResults.reduce((prev, current) => 
        prev.latency < current.latency ? prev : current
      );
      fastest = fastestResult.protocol;

      // Find most efficient (smallest payload)
      const mostEfficientResult = successfulResults.reduce((prev, current) => 
        prev.payloadSize < current.payloadSize ? prev : current
      );
      mostEfficient = mostEfficientResult.protocol;

      // Generate recommendations
      if (fastest === 'gRPC') {
        recommendations.push('gRPC shows best latency performance for real-time applications');
      }
      if (fastest === 'gRPC-Web') {
        recommendations.push('gRPC-Web provides excellent browser performance with Protocol Buffers');
      }
      if (fastest === 'WebSocket') {
        recommendations.push('WebSocket shows best real-time performance with persistent connections');
      }
      if (fastest === 'SSE') {
        recommendations.push('SSE shows best streaming performance with minimal overhead');
      }
      if (mostEfficient === 'gRPC') {
        recommendations.push('gRPC is most bandwidth-efficient due to Protocol Buffers');
      }
      if (mostEfficient === 'gRPC-Web') {
        recommendations.push('gRPC-Web offers efficient browser communication with Protocol Buffers');
      }
      if (mostEfficient === 'WebSocket') {
        recommendations.push('WebSocket provides efficient real-time communication with minimal overhead');
      }
      if (mostEfficient === 'SSE') {
        recommendations.push('SSE provides efficient streaming communication with minimal overhead');
      }
      const graphqlLatency = successfulResults.find(r => r.protocol === 'GraphQL')?.latency;
      const restLatency = successfulResults.find(r => r.protocol === 'REST')?.latency;
      if (graphqlLatency && restLatency && graphqlLatency < restLatency) {
        recommendations.push('GraphQL reduces over-fetching compared to REST');
      }
      if (successfulResults.length === 6) {
        recommendations.push('All protocols are functional - choose based on your specific requirements');
      }
      // Compare gRPC vs gRPC-Web
      const grpcLatency = successfulResults.find(r => r.protocol === 'gRPC')?.latency;
      const grpcWebLatency = successfulResults.find(r => r.protocol === 'gRPC-Web')?.latency;
      if (grpcLatency && grpcWebLatency && grpcLatency < grpcWebLatency) {
        recommendations.push('gRPC has lower latency than gRPC-Web due to HTTP/2 vs HTTP/1.1');
      }
      if (grpcLatency && grpcWebLatency && grpcWebLatency < grpcLatency) {
        recommendations.push('gRPC-Web shows better performance in this test');
      }
      // Compare WebSocket vs others
      const websocketLatency = successfulResults.find(r => r.protocol === 'WebSocket')?.latency;
      if (websocketLatency && grpcLatency && websocketLatency < grpcLatency) {
        recommendations.push('WebSocket shows better real-time performance than gRPC');
      }
      if (websocketLatency && grpcWebLatency && websocketLatency < grpcWebLatency) {
        recommendations.push('WebSocket provides better real-time performance than gRPC-Web');
      }
      // Compare SSE vs others
      const sseLatency = successfulResults.find(r => r.protocol === 'SSE')?.latency;
      if (sseLatency && websocketLatency && sseLatency < websocketLatency) {
        recommendations.push('SSE shows better streaming performance than WebSocket');
      }
      if (sseLatency && grpcLatency && sseLatency < grpcLatency) {
        recommendations.push('SSE shows better streaming performance than gRPC');
      }
    }

    const comparisonResults: ComparisonResults = {
      query,
      graphId,
      model,
      results,
      analytics: {
        fastest,
        mostEfficient,
        totalTime,
        recommendations
      }
    };

    return NextResponse.json(comparisonResults);

  } catch (error) {
    console.error('Protocol comparison error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run protocol comparison',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
