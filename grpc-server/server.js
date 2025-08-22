const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const cors = require('cors');

// Load the protobuf definition
const PROTO_PATH = path.join(__dirname, 'proto/graphrag.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const graphragProto = grpc.loadPackageDefinition(packageDefinition).graphrag;

// Mock data for demonstration
const mockGraphData = {
  'graph_1755797167093': {
    nodes: [
      { id: 'node_0', label: 'Emily Rodriguez', type: 'person', connections: 3, frequency: 4 },
      { id: 'node_1', label: 'Google Health', type: 'organization', connections: 2, frequency: 4 },
      { id: 'node_2', label: 'Stanford Medical Center', type: 'organization', connections: 4, frequency: 4 },
      { id: 'node_3', label: 'Johnson', type: 'concept', connections: 1, frequency: 4 },
      { id: 'node_4', label: 'Chen', type: 'concept', connections: 2, frequency: 3 },
      { id: 'node_5', label: 'The', type: 'concept', connections: 0, frequency: 3 },
      { id: 'node_6', label: 'Artificial Intelligence', type: 'concept', connections: 5, frequency: 2 },
      { id: 'node_7', label: 'Comprehensive Overview', type: 'concept', connections: 1, frequency: 2 },
      { id: 'node_8', label: 'Sarah Johnson', type: 'person', connections: 3, frequency: 2 },
      { id: 'node_9', label: 'Stanford Medical', type: 'organization', connections: 2, frequency: 2 },
      { id: 'node_10', label: 'Michael Chen', type: 'person', connections: 2, frequency: 2 },
      { id: 'node_11', label: 'Microsoft Research', type: 'organization', connections: 2, frequency: 2 },
      { id: 'node_12', label: 'National Institutes', type: 'organization', connections: 1, frequency: 2 },
      { id: 'node_13', label: 'American Medical Association', type: 'organization', connections: 1, frequency: 2 }
    ],
    edges: [
      { id: 'edge_0', source: 'node_0', target: 'node_2', label: 'works_at', type: 'employment', weight: 1.0 },
      { id: 'edge_1', source: 'node_8', target: 'node_2', label: 'researcher', type: 'role', weight: 1.0 },
      { id: 'edge_2', source: 'node_10', target: 'node_11', label: 'works_at', type: 'employment', weight: 1.0 },
      { id: 'edge_3', source: 'node_6', target: 'node_2', label: 'applied_in', type: 'application', weight: 0.9 },
      { id: 'edge_4', source: 'node_6', target: 'node_1', label: 'used_by', type: 'technology', weight: 0.8 }
    ],
    stats: {
      totalNodes: 14,
      totalEdges: 5,
      nodeTypes: ['person', 'organization', 'concept'],
      edgeTypes: ['employment', 'role', 'application', 'technology'],
      density: 0.055,
      connectivity: 0.714,
      topEntities: ['Emily Rodriguez', 'Google Health', 'Stanford Medical Center', 'Artificial Intelligence']
    }
  }
};

// Helper function to simulate processing delay
const simulateProcessing = (minMs = 20, maxMs = 80) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (maxMs - minMs) + minMs);
  });
};

// Helper function to search entities in graph
const searchEntities = (query, graphId, limit = 10) => {
  const graph = mockGraphData[graphId];
  if (!graph) return [];

  const queryLower = query.toLowerCase();
  const results = [];

  graph.nodes.forEach(node => {
    const searchText = `${node.label} ${node.type}`.toLowerCase();
    if (searchText.includes(queryLower)) {
      results.push({
        id: node.id,
        label: node.label,
        type: node.type,
        connections: node.connections,
        relevance_score: Math.random() * 0.3 + 0.7,
        frequency: node.frequency
      });
    }
  });

  return results.slice(0, limit);
};

// gRPC service implementation
const graphRAGService = {
  // Query the knowledge graph with GraphRAG
  async QueryGraph(call, callback) {
    const startTime = Date.now();
    const { query, graph_id, model } = call.request;

    try {
      await simulateProcessing(30, 60);

      const relevantNodes = searchEntities(query, graph_id, 5);
      const processingTime = Date.now() - startTime;

      const response = {
        query_id: `grpc_${Date.now()}`,
        query,
        graph_id,
        model: model || 'gpt-5-nano',
        response: `gRPC GraphRAG response for: "${query}". This response demonstrates the efficiency of gRPC with Protocol Buffers, providing faster serialization and smaller payload sizes compared to JSON-based REST and GraphQL APIs. The query was processed using the knowledge graph with ${relevantNodes.length} relevant entities identified.`,
        context: relevantNodes.map(node => ({
          entity_id: node.id,
          description: `${node.label} (${node.type}) - ${node.connections} connections`,
          relevance_score: node.relevance_score,
          relationships: [`connected to ${node.connections} other entities`],
          entity_type: node.type,
          metadata: { frequency: node.frequency.toString() }
        })),
        performance: {
          processing_time_ms: processingTime,
          context_retrieval_time_ms: processingTime * 0.3,
          llm_generation_time_ms: processingTime * 0.7,
          total_nodes_accessed: relevantNodes.length,
          total_edges_traversed: relevantNodes.reduce((sum, node) => sum + node.connections, 0),
          compression_ratio: 3.2,
          memory_usage_bytes: 1024 * 1024 * 50, // 50MB
          cpu_usage_percent: 15.5
        },
        relevant_nodes: relevantNodes,
        timestamp: new Date().toISOString()
      };

      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: `Query failed: ${error.message}`
      });
    }
  },

  // Stream graph traversal results
  TraverseGraph(call) {
    const { query, graph_id, max_depth = 3 } = call.request;
    const graph = mockGraphData[graph_id];

    if (!graph) {
      call.emit('error', {
        code: grpc.status.NOT_FOUND,
        message: `Graph ${graph_id} not found`
      });
      return;
    }

    // Simulate streaming traversal
    let nodeIndex = 0;
    const streamInterval = setInterval(() => {
      if (nodeIndex < graph.nodes.length && nodeIndex < max_depth * 3) {
        const node = graph.nodes[nodeIndex];
        call.write({
          id: node.id,
          label: node.label,
          type: node.type,
          properties: { frequency: node.frequency.toString() },
          connections: Array.from({ length: node.connections }, (_, i) => `connection_${i}`),
          relevance_score: Math.random() * 0.5 + 0.5,
          frequency: node.frequency
        });
        nodeIndex++;
      } else {
        clearInterval(streamInterval);
        call.end();
      }
    }, 100);
  },

  // Stream context retrieval for GraphRAG
  GetContextStream(call) {
    const { query, graph_id, max_context_size = 10 } = call.request;
    const relevantNodes = searchEntities(query, graph_id, max_context_size);

    let chunkIndex = 0;
    const streamInterval = setInterval(() => {
      if (chunkIndex < relevantNodes.length) {
        const node = relevantNodes[chunkIndex];
        call.write({
          entity_id: node.id,
          description: `${node.label} (${node.type}) - Relevant to query: "${query}"`,
          relevance_score: node.relevance_score,
          relationships: [`has ${node.connections} connections`],
          entity_type: node.type,
          metadata: { frequency: node.frequency.toString() }
        });
        chunkIndex++;
      } else {
        clearInterval(streamInterval);
        call.end();
      }
    }, 150);
  },

  // High-performance entity resolution
  async ResolveEntities(call, callback) {
    const { entity_name, graph_id, max_results = 10 } = call.request;
    const startTime = Date.now();

    try {
      await simulateProcessing(10, 30);
      const matches = searchEntities(entity_name, graph_id, max_results);

      const response = {
        matches: matches.map(match => ({
          entity_id: match.id,
          entity_name: match.label,
          entity_type: match.type,
          similarity_score: match.relevance_score,
          properties: [`connections: ${match.connections}`, `frequency: ${match.frequency}`],
          connections: Array.from({ length: match.connections }, (_, i) => `connection_${i}`)
        })),
        total_found: matches.length,
        search_time_ms: Date.now() - startTime,
        graph_id
      };

      callback(null, response);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: `Entity resolution failed: ${error.message}`
      });
    }
  },

  // Incremental graph building (simplified for demo)
  async BuildGraph(call) {
    let progress = 0;
    const graphId = `graph_${Date.now()}`;

    call.on('data', async (document) => {
      progress += 20;
      
      // Simulate processing delay
      await simulateProcessing(50, 100);

      call.write({
        graph_id: graphId,
        status: progress < 100 ? 'processing' : 'completed',
        progress_percentage: Math.min(progress, 100),
        stats: {
          total_nodes: Math.floor(Math.random() * 50) + 10,
          total_edges: Math.floor(Math.random() * 100) + 20,
          node_types: ['person', 'organization', 'concept'],
          edge_types: ['relationship', 'connection'],
          density: Math.random() * 0.1,
          connectivity: Math.random() * 0.5 + 0.3,
          top_entities: ['Entity 1', 'Entity 2', 'Entity 3']
        },
        errors: [],
        estimated_completion: new Date(Date.now() + 5000).toISOString()
      });
    });

    call.on('end', () => {
      call.end();
    });
  },

  // Real-time graph updates (simplified for demo)
  StreamGraphUpdates(call) {
    const { graph_id, max_results = 5 } = call.request;
    let updateCount = 0;

    const updateInterval = setInterval(() => {
      if (updateCount < max_results) {
        const graph = mockGraphData[graph_id];
        if (graph && graph.nodes.length > 0) {
          const randomNode = graph.nodes[Math.floor(Math.random() * graph.nodes.length)];
          
          call.write({
            update_id: `update_${Date.now()}_${updateCount}`,
            graph_id,
            update_type: 'node_update',
            node: {
              id: randomNode.id,
              label: randomNode.label,
              type: randomNode.type,
              properties: { frequency: randomNode.frequency.toString() },
              connections: Array.from({ length: randomNode.connections }, (_, i) => `connection_${i}`),
              relevance_score: Math.random() * 0.5 + 0.5,
              frequency: randomNode.frequency
            },
            timestamp: new Date().toISOString(),
            metadata: { update_type: 'node_modification' }
          });
        }
        updateCount++;
      } else {
        clearInterval(updateInterval);
        call.end();
      }
    }, 200);
  },

  // Health check endpoint
  async HealthCheck(call, callback) {
    const response = {
      status: 'SERVING',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        'GraphRAGService': 'SERVING',
        'QueryGraph': 'SERVING',
        'TraverseGraph': 'SERVING',
        'GetContextStream': 'SERVING',
        'ResolveEntities': 'SERVING'
      },
      system_performance: {
        processing_time_ms: 0,
        context_retrieval_time_ms: 0,
        llm_generation_time_ms: 0,
        total_nodes_accessed: 0,
        total_edges_traversed: 0,
        compression_ratio: 3.2,
        memory_usage_bytes: process.memoryUsage().heapUsed,
        cpu_usage_percent: Math.random() * 10 + 5
      }
    };

    callback(null, response);
  }
};

// Create gRPC server
const server = new grpc.Server();
server.addService(graphragProto.GraphRAGService.service, graphRAGService);

// Start gRPC server
const GRPC_PORT = process.env.GRPC_PORT || 50051;
server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind gRPC server:', err);
    process.exit(1);
  }
  
  server.start();
  console.log(`🚀 gRPC server running on port ${port}`);
  console.log(`📊 GraphRAG gRPC services available:`);
  console.log(`   • QueryGraph: Query knowledge graphs with GraphRAG`);
  console.log(`   • TraverseGraph: Stream graph traversal results`);
  console.log(`   • GetContextStream: Stream context retrieval`);
  console.log(`   • ResolveEntities: High-performance entity resolution`);
  console.log(`   • BuildGraph: Incremental graph building`);
  console.log(`   • StreamGraphUpdates: Real-time graph updates`);
  console.log(`   • HealthCheck: Service health monitoring`);
});

// Create HTTP server for health checks and metrics
const app = express();
app.use(cors());
app.use(express.json());

const HTTP_PORT = process.env.HTTP_PORT || 50052;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GraphRAG gRPC Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    grpc_port: GRPC_PORT,
    http_port: HTTP_PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    service: 'GraphRAG gRPC Server',
    version: '1.0.0',
    uptime_seconds: process.uptime(),
    memory_usage: process.memoryUsage(),
    cpu_usage: process.cpuUsage(),
    active_connections: 0, // Would track in production
    requests_processed: 0, // Would track in production
    average_response_time_ms: 45 // Mock data
  });
});

// Graph data endpoint for testing
app.get('/api/graphs/:graphId', (req, res) => {
  const { graphId } = req.params;
  const graph = mockGraphData[graphId];
  
  if (!graph) {
    return res.status(404).json({ error: `Graph ${graphId} not found` });
  }
  
  res.json(graph);
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP server running on port ${HTTP_PORT}`);
  console.log(`   • Health check: http://localhost:${HTTP_PORT}/health`);
  console.log(`   • Metrics: http://localhost:${HTTP_PORT}/metrics`);
  console.log(`   • Graph data: http://localhost:${HTTP_PORT}/api/graphs/:graphId`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gRPC server...');
  server.tryShutdown(() => {
    console.log('✅ gRPC server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gRPC server...');
  server.tryShutdown(() => {
    console.log('✅ gRPC server stopped');
    process.exit(0);
  });
});
