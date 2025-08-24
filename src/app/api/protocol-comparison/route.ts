import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getBaseURL } from '@/lib/port-config';

interface ProtocolTestResult {
  protocol: 'REST' | 'GraphQL' | 'gRPC' | 'gRPC-Web' | 'WebSocket';
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

    // Test REST API (Mock for now)
    try {
      const restStartTime = performance.now();
      
      // Simulate REST API call with mock data
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
      
      const restEndTime = performance.now();
      const mockRestResponse = `AI in healthcare offers numerous benefits including improved diagnostic accuracy, personalized treatment plans, and enhanced patient care through machine learning algorithms. The technology can analyze vast amounts of medical data to identify patterns and provide insights that help healthcare professionals make better decisions.`;

      results.push({
        protocol: 'REST',
        latency: Math.round(restEndTime - restStartTime),
        payloadSize: JSON.stringify({ response: mockRestResponse }).length,
        response: mockRestResponse,
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

    // Test GraphQL API (Mock for now)
    try {
      const graphqlStartTime = performance.now();
      
      // Simulate GraphQL API call with mock data
      await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 80));
      
      const graphqlEndTime = performance.now();
      const mockGraphQLResponse = `Based on the knowledge graph analysis, AI in healthcare provides significant advantages such as enhanced diagnostic precision through pattern recognition, optimized treatment protocols, and improved patient outcomes. The graph-based approach enables more contextual understanding of medical relationships.`;

      results.push({
        protocol: 'GraphQL',
        latency: Math.round(graphqlEndTime - graphqlStartTime),
        payloadSize: JSON.stringify({ data: { graphRAGQuery: { graphRAGResponse: mockGraphQLResponse } } }).length,
        response: mockGraphQLResponse,
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

    // Test gRPC-Web API (Mock for now)
    try {
      const grpcWebStartTime = performance.now();
      
      // Simulate gRPC-Web API call with mock data
      // gRPC-Web has slightly higher latency than gRPC due to HTTP/1.1 transport
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 80));
      
      const grpcWebEndTime = performance.now();
      const mockGrpcWebResponse = `gRPC-Web browser analysis demonstrates AI healthcare advantages: client-side streaming, HTTP/1.1 compatibility, and browser-optimized communication. The web-friendly approach enables direct browser-to-server communication without proxies.`;

      // gRPC-Web has similar protobuf efficiency but slightly larger headers due to HTTP/1.1
      const jsonPayloadSize = JSON.stringify({ response: mockGrpcWebResponse }).length;
      const protobufPayloadSize = Math.round(jsonPayloadSize * 0.4); // Slightly larger than gRPC due to HTTP headers

      results.push({
        protocol: 'gRPC-Web',
        latency: Math.round(grpcWebEndTime - grpcWebStartTime),
        payloadSize: protobufPayloadSize,
        response: mockGrpcWebResponse,
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

    // Test WebSocket API (Mock for now)
    try {
      const websocketStartTime = performance.now();
      
      // Simulate WebSocket API call with mock data
      // WebSocket has low latency due to persistent connection
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 40));
      
      const websocketEndTime = performance.now();
      const mockWebSocketResponse = `WebSocket real-time analysis reveals AI healthcare benefits: persistent bidirectional communication, minimal overhead, and instant data streaming. The connection-oriented approach enables continuous data flow and real-time updates.`;

      // WebSocket has minimal overhead, similar to JSON but with connection benefits
      const jsonPayloadSize = JSON.stringify({ response: mockWebSocketResponse }).length;
      const websocketPayloadSize = Math.round(jsonPayloadSize * 0.9); // Minimal overhead

      results.push({
        protocol: 'WebSocket',
        latency: Math.round(websocketEndTime - websocketStartTime),
        payloadSize: websocketPayloadSize,
        response: mockWebSocketResponse,
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
      if (mostEfficient === 'gRPC') {
        recommendations.push('gRPC is most bandwidth-efficient due to Protocol Buffers');
      }
      if (mostEfficient === 'gRPC-Web') {
        recommendations.push('gRPC-Web offers efficient browser communication with Protocol Buffers');
      }
      if (mostEfficient === 'WebSocket') {
        recommendations.push('WebSocket provides efficient real-time communication with minimal overhead');
      }
      const graphqlLatency = successfulResults.find(r => r.protocol === 'GraphQL')?.latency;
      const restLatency = successfulResults.find(r => r.protocol === 'REST')?.latency;
      if (graphqlLatency && restLatency && graphqlLatency < restLatency) {
        recommendations.push('GraphQL reduces over-fetching compared to REST');
      }
      if (successfulResults.length === 5) {
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
