const WebSocket = require('ws');
const http = require('http');
const { graphRAGWebClient } = require('./src/lib/grpc-web-client');

const PORT = 3001;

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store active connections
const connections = new Map();

console.log(`WebSocket server starting on port ${PORT}...`);

wss.on('connection', (ws, req) => {
  const connectionId = Date.now().toString();
  connections.set(connectionId, ws);
  
  console.log(`WebSocket client connected: ${connectionId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'WebSocket connection established',
    connectionId,
    timestamp: new Date().toISOString()
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received message from ${connectionId}:`, data.type);

      switch (data.type) {
        case 'query':
          await handleQuery(ws, data, connectionId);
          break;
          
        case 'stream_query':
          await handleStreamQuery(ws, data, connectionId);
          break;
          
        case 'context_stream':
          await handleContextStream(ws, data, connectionId);
          break;
          
        case 'bidirectional_session':
          await handleBidirectionalSession(ws, data, connectionId);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Unknown message type',
            receivedType: data.type
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message',
        details: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${connectionId}`);
    connections.delete(connectionId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
    connections.delete(connectionId);
  });
});

// Handle unary query
async function handleQuery(ws, data, connectionId) {
  try {
    const { query, graph_id, model = 'gpt-4' } = data;
    
    if (!query || !graph_id) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Query and graph_id are required'
      }));
      return;
    }

    // Send processing start
    ws.send(JSON.stringify({
      type: 'processing',
      message: 'Processing GraphRAG query',
      query,
      timestamp: new Date().toISOString()
    }));

    // Execute real GraphRAG query
    const result = await graphRAGWebClient.queryGraph(query, graph_id, model);
    
    // Send result
    ws.send(JSON.stringify({
      type: 'query_result',
      data: result,
      query,
      graph_id,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Query error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to execute query',
      details: error.message
    }));
  }
}

// Handle streaming query
async function handleStreamQuery(ws, data, connectionId) {
  try {
    const { query, graph_id, model = 'gpt-4' } = data;
    
    if (!query || !graph_id) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Query and graph_id are required'
      }));
      return;
    }

    // Send processing start
    ws.send(JSON.stringify({
      type: 'stream_start',
      message: 'Starting GraphRAG streaming query',
      query,
      timestamp: new Date().toISOString()
    }));

    // Get real graph traversal results
    const traverseResults = await graphRAGWebClient.traverseGraph(query, graph_id, model);
    
    // Send each node as a separate message
    for (let i = 0; i < traverseResults.length; i++) {
      const node = traverseResults[i];
      ws.send(JSON.stringify({
        type: 'stream_node',
        data: node,
        index: i + 1,
        total: traverseResults.length,
        timestamp: new Date().toISOString()
      }));
      
      // Add delay for realistic streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Send stream completion
    ws.send(JSON.stringify({
      type: 'stream_complete',
      message: 'GraphRAG streaming completed',
      summary: {
        total_nodes: traverseResults.length,
        query,
        graph_id
      },
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Stream query error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to execute streaming query',
      details: error.message
    }));
  }
}

// Handle context streaming
async function handleContextStream(ws, data, connectionId) {
  try {
    const { query, graph_id, max_context_size = 10 } = data;
    
    if (!query || !graph_id) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Query and graph_id are required'
      }));
      return;
    }

    // Send processing start
    ws.send(JSON.stringify({
      type: 'context_stream_start',
      message: 'Starting context streaming',
      query,
      max_context_size,
      timestamp: new Date().toISOString()
    }));

    // Get real context chunks
    const contextResults = await graphRAGWebClient.getContextStream(query, graph_id, max_context_size);
    
    // Send each context chunk as a separate message
    for (let i = 0; i < contextResults.length; i++) {
      const context = contextResults[i];
      ws.send(JSON.stringify({
        type: 'context_chunk',
        data: context,
        index: i + 1,
        total: contextResults.length,
        timestamp: new Date().toISOString()
      }));
      
      // Add delay for realistic streaming
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    // Send context stream completion
    ws.send(JSON.stringify({
      type: 'context_stream_complete',
      message: 'Context streaming completed',
      summary: {
        total_chunks: contextResults.length,
        query,
        graph_id
      },
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Context stream error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to execute context streaming',
      details: error.message
    }));
  }
}

// Handle bidirectional session
async function handleBidirectionalSession(ws, data, connectionId) {
  try {
    const { query, graph_id, model = 'gpt-4', session_type = 'interactive' } = data;
    
    if (!query || !graph_id) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Query and graph_id are required'
      }));
      return;
    }

    // Send session start
    ws.send(JSON.stringify({
      type: 'session_start',
      message: 'Bidirectional session established',
      query,
      session_type,
      timestamp: new Date().toISOString()
    }));

    // Simulate interactive session with multiple exchanges
    const sessionSteps = [
      { step: 'query_analysis', message: 'Analyzing query structure and intent' },
      { step: 'graph_traversal', message: 'Traversing knowledge graph for relevant nodes' },
      { step: 'context_retrieval', message: 'Retrieving contextual information' },
      { step: 'response_generation', message: 'Generating comprehensive response' },
      { step: 'session_complete', message: 'Bidirectional session completed successfully' }
    ];

    for (let i = 0; i < sessionSteps.length; i++) {
      const step = sessionSteps[i];
      
      // Send step update
      ws.send(JSON.stringify({
        type: 'session_step',
        data: step,
        index: i + 1,
        total: sessionSteps.length,
        timestamp: new Date().toISOString()
      }));
      
      // Add delay between steps
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Send session completion
    ws.send(JSON.stringify({
      type: 'session_complete',
      message: 'Bidirectional session completed',
      summary: {
        total_steps: sessionSteps.length,
        query,
        graph_id,
        session_type
      },
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Bidirectional session error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to establish bidirectional session',
      details: error.message
    }));
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Connect to: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    server.close(() => {
      console.log('WebSocket server stopped');
      process.exit(0);
    });
  });
});
