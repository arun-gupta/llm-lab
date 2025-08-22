const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

// Create gRPC client
const client = new graphragProto.GraphRAGService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Test functions
async function testQueryGraph() {
  return new Promise((resolve, reject) => {
    const request = {
      query: "What are the key relationships between AI and healthcare?",
      graph_id: "graph_1755797167093",
      model: "gpt-5-nano"
    };

    console.log('🔍 Testing QueryGraph...');
    const startTime = Date.now();

    client.QueryGraph(request, (error, response) => {
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (error) {
        console.error('❌ QueryGraph failed:', error.message);
        reject(error);
        return;
      }

      console.log('✅ QueryGraph successful!');
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Response: ${response.response.substring(0, 100)}...`);
      console.log(`   Context entities: ${response.context.length}`);
      console.log(`   Performance: ${response.performance.processing_time_ms}ms processing`);
      
      resolve({ response, latency });
    });
  });
}

async function testTraverseGraph() {
  return new Promise((resolve, reject) => {
    const request = {
      query: "AI healthcare",
      graph_id: "graph_1755797167093",
      max_depth: 3
    };

    console.log('🔄 Testing TraverseGraph (streaming)...');
    const startTime = Date.now();
    const nodes = [];

    const call = client.TraverseGraph(request);

    call.on('data', (node) => {
      nodes.push(node);
      console.log(`   📍 Node: ${node.label} (${node.type})`);
    });

    call.on('end', () => {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      console.log('✅ TraverseGraph completed!');
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Nodes received: ${nodes.length}`);
      
      resolve({ nodes, latency });
    });

    call.on('error', (error) => {
      console.error('❌ TraverseGraph failed:', error.message);
      reject(error);
    });
  });
}

async function testGetContextStream() {
  return new Promise((resolve, reject) => {
    const request = {
      query: "What are AI benefits in healthcare?",
      graph_id: "graph_1755797167093",
      max_context_size: 5
    };

    console.log('📡 Testing GetContextStream (streaming)...');
    const startTime = Date.now();
    const chunks = [];

    const call = client.GetContextStream(request);

    call.on('data', (chunk) => {
      chunks.push(chunk);
      console.log(`   📄 Context: ${chunk.description.substring(0, 60)}...`);
    });

    call.on('end', () => {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      console.log('✅ GetContextStream completed!');
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Context chunks: ${chunks.length}`);
      
      resolve({ chunks, latency });
    });

    call.on('error', (error) => {
      console.error('❌ GetContextStream failed:', error.message);
      reject(error);
    });
  });
}

async function testResolveEntities() {
  return new Promise((resolve, reject) => {
    const request = {
      entity_name: "AI",
      graph_id: "graph_1755797167093",
      max_results: 5
    };

    console.log('🔍 Testing ResolveEntities...');
    const startTime = Date.now();

    client.ResolveEntities(request, (error, response) => {
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (error) {
        console.error('❌ ResolveEntities failed:', error.message);
        reject(error);
        return;
      }

      console.log('✅ ResolveEntities successful!');
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Matches found: ${response.total_found}`);
      console.log(`   Search time: ${response.search_time_ms}ms`);
      
      response.matches.forEach(match => {
        console.log(`   🎯 ${match.entity_name} (${match.entity_type}) - ${match.similarity_score.toFixed(2)}`);
      });
      
      resolve({ response, latency });
    });
  });
}

async function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const request = { service: "GraphRAGService" };

    console.log('🏥 Testing HealthCheck...');
    const startTime = Date.now();

    client.HealthCheck(request, (error, response) => {
      const endTime = Date.now();
      const latency = endTime - startTime;

      if (error) {
        console.error('❌ HealthCheck failed:', error.message);
        reject(error);
        return;
      }

      console.log('✅ HealthCheck successful!');
      console.log(`   Latency: ${latency}ms`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Version: ${response.version}`);
      console.log(`   Services: ${Object.keys(response.services).length} available`);
      
      resolve({ response, latency });
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting gRPC client tests...\n');

  try {
    // Test health check first
    await testHealthCheck();
    console.log('');

    // Test main functionality
    await testQueryGraph();
    console.log('');

    await testTraverseGraph();
    console.log('');

    await testGetContextStream();
    console.log('');

    await testResolveEntities();
    console.log('');

    console.log('🎉 All gRPC tests completed successfully!');
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = {
  client,
  testQueryGraph,
  testTraverseGraph,
  testGetContextStream,
  testResolveEntities,
  testHealthCheck,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
