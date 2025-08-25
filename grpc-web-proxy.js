const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();

// Load port configuration
let PORT = 50052;
let GRPC_SERVER_PORT = 50051;
let NEXTJS_PORT = 3000;

try {
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, 'config', 'ports.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    PORT = config.development.grpc.http;
    GRPC_SERVER_PORT = config.development.grpc.server;
    NEXTJS_PORT = config.development.nextjs;
  }
} catch (error) {
  console.warn('Failed to load port config, using defaults:', error.message);
}

// Enable CORS for gRPC-Web
app.use(cors({
  origin: [`http://localhost:${NEXTJS_PORT}`, 'http://localhost:3001'],
  credentials: true
}));

// Load the protobuf definition
const PROTO_PATH = path.join(__dirname, 'grpc-server/proto/graphrag.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const graphragProto = grpc.loadPackageDefinition(packageDefinition).graphrag;

// Create gRPC client to connect to the main gRPC server
const grpcClient = new graphragProto.GraphRAGService(
  `localhost:${GRPC_SERVER_PORT}`,
  grpc.credentials.createInsecure()
);

// gRPC-Web proxy endpoints
app.use(express.json());

// Query Graph endpoint
app.post('/graphrag.GraphRAGService/QueryGraph', async (req, res) => {
  try {
    const { query, graph_id, model } = req.body;
    
    const request = {
      query: query,
      graph_id: graph_id,
      model: model || 'gpt-4'
    };

    grpcClient.QueryGraph(request, (err, response) => {
      if (err) {
        console.error('gRPC error:', err);
        res.status(500).json({
          error: 'gRPC service error',
          details: err.message
        });
      } else {
        res.json(response);
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy error',
      details: error.message
    });
  }
});

// Traverse Graph endpoint (streaming)
app.post('/graphrag.GraphRAGService/TraverseGraph', async (req, res) => {
  try {
    const { query, graph_id, model } = req.body;
    
    const request = {
      query: query,
      graph_id: graph_id,
      model: model || 'gpt-4'
    };

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const stream = grpcClient.TraverseGraph(request);
    
    stream.on('data', (data) => {
      res.write(JSON.stringify(data) + '\n');
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

    stream.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Streaming proxy error:', error);
    res.status(500).json({
      error: 'Streaming proxy error',
      details: error.message
    });
  }
});

// Get Context Stream endpoint (streaming)
app.post('/graphrag.GraphRAGService/GetContextStream', async (req, res) => {
  try {
    const { query, graph_id, max_context_size } = req.body;
    
    const request = {
      query: query,
      graph_id: graph_id,
      max_context_size: max_context_size || 10
    };

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const stream = grpcClient.GetContextStream(request);
    
    stream.on('data', (data) => {
      res.write(JSON.stringify(data) + '\n');
    });

    stream.on('error', (err) => {
      console.error('Context stream error:', err);
      res.end();
    });

    stream.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Context streaming proxy error:', error);
    res.status(500).json({
      error: 'Context streaming proxy error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gRPC-Web Proxy' });
});

app.listen(PORT, () => {
  console.log(`gRPC-Web proxy server running on port ${PORT}`);
  console.log(`Connect to gRPC server at localhost:50051`);
});
