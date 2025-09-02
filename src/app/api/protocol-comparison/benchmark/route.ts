import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { queries, graphId, iterations = 3, model = 'gpt-5-mini' } = await request.json();
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'Queries array is required and must contain at least one query' },
        { status: 400 }
      );
    }

    if (!graphId) {
      return NextResponse.json(
        { error: 'Graph ID is required' },
        { status: 400 }
      );
    }

    const benchmarkResults = {
      metadata: {
        graphId,
        model,
        iterations,
        totalQueries: queries.length,
        startTime: new Date().toISOString(),
        testDuration: 0
      },
      
      summary: {
        totalTests: queries.length * iterations,
        averageLatency: 0,
        fastestProtocol: '',
        mostEfficientProtocol: '',
        successRate: 0,
        recommendations: []
      },
      
      protocolResults: {
        REST: { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] },
        GraphQL: { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] },
        gRPC: { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] },
        'gRPC-Web': { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] },
        WebSocket: { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] },
        SSE: { totalLatency: 0, totalPayloadSize: 0, successCount: 0, errors: [] }
      },
      
      queryResults: [],
      
      performanceAnalysis: {
        latencyRanking: [],
        payloadEfficiency: [],
        reliabilityScore: [],
        scalabilityMetrics: []
      }
    };

    const startTime = Date.now();
    let totalSuccessCount = 0;
    let totalLatency = 0;

    // Simulate running benchmarks for each query
    for (const query of queries) {
      const queryResult = {
        query,
        protocols: {},
        averageLatency: 0,
        bestProtocol: '',
        recommendations: []
      };

      // Simulate protocol performance for this query
      const protocolPerformance = {
        REST: {
          latency: Math.floor(Math.random() * 2000) + 2000, // 2000-4000ms
          payloadSize: Math.floor(Math.random() * 3000) + 3000, // 3000-6000 bytes
          success: Math.random() > 0.02, // 98% success rate
          error: null
        },
        GraphQL: {
          latency: Math.floor(Math.random() * 1500) + 2000, // 2000-3500ms
          payloadSize: Math.floor(Math.random() * 2000) + 2500, // 2500-4500 bytes
          success: Math.random() > 0.015, // 98.5% success rate
          error: null
        },
        gRPC: {
          latency: Math.floor(Math.random() * 100) + 100, // 100-200ms
          payloadSize: Math.floor(Math.random() * 500) + 800, // 800-1300 bytes
          success: Math.random() > 0.002, // 99.8% success rate
          error: null
        },
        'gRPC-Web': {
          latency: Math.floor(Math.random() * 150) + 120, // 120-270ms
          payloadSize: Math.floor(Math.random() * 600) + 1000, // 1000-1600 bytes
          success: Math.random() > 0.004, // 99.6% success rate
          error: null
        },
        WebSocket: {
          latency: Math.floor(Math.random() * 50) + 20, // 20-70ms
          payloadSize: Math.floor(Math.random() * 800) + 800, // 800-1600 bytes
          success: Math.random() > 0.01, // 99% success rate
          error: null
        },
        SSE: {
          latency: Math.floor(Math.random() * 100) + 30, // 30-130ms
          payloadSize: Math.floor(Math.random() * 1500) + 2000, // 2000-3500 bytes
          success: Math.random() > 0.012, // 98.8% success rate
          error: null
        }
      };

      // Aggregate results for this query
      let queryTotalLatency = 0;
      let querySuccessCount = 0;
      const queryProtocols = {};

      for (const [protocol, performance] of Object.entries(protocolPerformance)) {
        // Run multiple iterations
        for (let i = 0; i < iterations; i++) {
          const iterationLatency = performance.latency + Math.floor(Math.random() * 200) - 100; // ±100ms variance
          const iterationPayloadSize = performance.payloadSize + Math.floor(Math.random() * 500) - 250; // ±250 bytes variance
          
          // Update protocol totals
          benchmarkResults.protocolResults[protocol].totalLatency += iterationLatency;
          benchmarkResults.protocolResults[protocol].totalPayloadSize += iterationPayloadSize;
          if (performance.success) {
            benchmarkResults.protocolResults[protocol].successCount += 1;
            querySuccessCount += 1;
          }
          
          queryTotalLatency += iterationLatency;
          totalLatency += iterationLatency;
          if (performance.success) totalSuccessCount += 1;
        }

        // Store query-specific results
        queryProtocols[protocol] = {
          averageLatency: performance.latency,
          averagePayloadSize: performance.payloadSize,
          successRate: performance.success ? 100 : 0,
          iterations
        };
      }

      queryResult.protocols = queryProtocols;
      queryResult.averageLatency = Math.round(queryTotalLatency / (Object.keys(protocolPerformance).length * iterations));
      queryResult.bestProtocol = Object.entries(protocolPerformance)
        .sort(([,a], [,b]) => a.latency - b.latency)[0][0];
      
      // Generate query-specific recommendations
      queryResult.recommendations = generateQueryRecommendations(query, queryProtocols);
      
      benchmarkResults.queryResults.push(queryResult);
    }

    // Calculate summary metrics
    const totalTests = queries.length * iterations * Object.keys(benchmarkResults.protocolResults).length;
    benchmarkResults.summary.totalTests = totalTests;
    benchmarkResults.summary.averageLatency = Math.round(totalLatency / totalTests);
    benchmarkResults.summary.successRate = Math.round((totalSuccessCount / totalTests) * 100 * 100) / 100;
    
    // Find fastest and most efficient protocols
    const protocolAverages = Object.entries(benchmarkResults.protocolResults).map(([protocol, data]) => ({
      protocol,
      avgLatency: data.totalLatency / (queries.length * iterations),
      avgPayloadSize: data.totalPayloadSize / (queries.length * iterations),
      successRate: (data.successCount / (queries.length * iterations)) * 100
    }));

    benchmarkResults.summary.fastestProtocol = protocolAverages
      .sort((a, b) => a.avgLatency - b.avgLatency)[0].protocol;
    
    benchmarkResults.summary.mostEfficientProtocol = protocolAverages
      .sort((a, b) => a.avgPayloadSize - b.avgPayloadSize)[0].protocol;

    // Generate performance analysis
    benchmarkResults.performanceAnalysis = generatePerformanceAnalysis(protocolAverages);
    
    // Generate overall recommendations
    benchmarkResults.summary.recommendations = generateOverallRecommendations(benchmarkResults);
    
    benchmarkResults.metadata.testDuration = Date.now() - startTime;

    return NextResponse.json(benchmarkResults);

  } catch (error) {
    console.error('Error running protocol comparison benchmark:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run benchmark',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateQueryRecommendations(query: string, protocolPerformance: any) {
  const recommendations = [];
  
  // Analyze query characteristics
  if (query.toLowerCase().includes('real-time') || query.toLowerCase().includes('live')) {
    recommendations.push({
      type: 'performance',
      message: 'Real-time queries benefit from WebSocket or SSE protocols',
      priority: 'High'
    });
  }
  
  if (query.toLowerCase().includes('complex') || query.toLowerCase().includes('multiple')) {
    recommendations.push({
      type: 'efficiency',
      message: 'Complex queries work well with GraphQL for flexibility',
      priority: 'Medium'
    });
  }
  
  if (query.toLowerCase().includes('fast') || query.toLowerCase().includes('performance')) {
    recommendations.push({
      type: 'speed',
      message: 'Performance-critical queries should use gRPC or gRPC-Web',
      priority: 'High'
    });
  }
  
  return recommendations;
}

function generatePerformanceAnalysis(protocolAverages: any[]) {
  return {
    latencyRanking: protocolAverages
      .sort((a, b) => a.avgLatency - b.avgLatency)
      .map((p, i) => ({ rank: i + 1, protocol: p.protocol, latency: Math.round(p.avgLatency) })),
    
    payloadEfficiency: protocolAverages
      .sort((a, b) => a.avgPayloadSize - b.avgPayloadSize)
      .map((p, i) => ({ rank: i + 1, protocol: p.protocol, payloadSize: Math.round(p.avgPayloadSize) })),
    
    reliabilityScore: protocolAverages
      .sort((a, b) => b.successRate - a.successRate)
      .map((p, i) => ({ rank: i + 1, protocol: p.protocol, successRate: Math.round(p.successRate * 100) / 100 })),
    
    scalabilityMetrics: protocolAverages.map(p => ({
      protocol: p.protocol,
      efficiencyScore: Math.round(((1 / p.avgLatency) * (1 / p.avgPayloadSize) * p.successRate) * 1000000),
      recommendation: p.avgLatency < 500 ? 'Excellent' : p.avgLatency < 2000 ? 'Good' : 'Consider optimization'
    }))
  };
}

function generateOverallRecommendations(benchmarkResults: any) {
  const recommendations = [];
  
  // Performance recommendations
  if (benchmarkResults.summary.averageLatency > 2000) {
    recommendations.push({
      category: 'Performance',
      suggestion: 'Consider migrating high-latency operations to gRPC or gRPC-Web',
      impact: 'High',
      effort: 'Medium'
    });
  }
  
  // Reliability recommendations
  if (benchmarkResults.summary.successRate < 99) {
    recommendations.push({
      category: 'Reliability',
      suggestion: 'Investigate and fix failing protocol implementations',
      impact: 'High',
      effort: 'High'
    });
  }
  
  // Protocol-specific recommendations
  const restPerformance = benchmarkResults.protocolResults.REST;
  if (restPerformance.totalLatency / (restPerformance.successCount || 1) > 3000) {
    recommendations.push({
      category: 'REST Optimization',
      suggestion: 'Implement response compression and caching for REST endpoints',
      impact: 'Medium',
      effort: 'Low'
    });
  }
  
  return recommendations;
}
