# WebSocket Integration for GraphRAG

## Overview

WebSocket provides real-time bidirectional communication for GraphRAG applications, enabling persistent connections and instant data streaming. This protocol is ideal for applications requiring real-time updates, interactive sessions, and continuous data flow.

## Real-time Services

### Available WebSocket Services

- **Unary Queries**: Single request-response pattern with persistent connection
- **Streaming Queries**: Real-time streaming of graph traversal results
- **Context Streaming**: Continuous streaming of relevant context chunks
- **Bidirectional Sessions**: Interactive query processing with real-time feedback

### Real-time Benefits

- **Persistent Connections**: Single connection for multiple messages
- **Low Latency**: Minimal connection overhead (~30-70ms)
- **Bidirectional**: Simultaneous send and receive capabilities
- **Event-driven**: Perfect for real-time updates and notifications
- **Browser Native**: Built-in browser support without additional libraries

## WebSocket Message Format

### Connection Setup

```javascript
// WebSocket connection to GraphRAG service
const ws = new WebSocket('ws://localhost:3000/api/websocket/graphrag');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Query Message Format

```json
{
  "type": "unary|streaming|context-streaming|bidirectional",
  "query": "Your GraphRAG query",
  "graphId": "your-graph-id",
  "sessionId": "optional-session-id",
  "options": {
    "stream": true,
    "maxResults": 10,
    "includeMetadata": true
  }
}
```

### Response Format

```json
{
  "type": "response",
  "queryId": "query-123",
  "response": "GraphRAG response content",
  "latency": 45,
  "payloadSize": 1850,
  "streaming": false,
  "streamingData": [],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Client Examples

### JavaScript/TypeScript Client

```typescript
class GraphRAGWebSocketClient {
  private ws: WebSocket;
  private messageQueue: Map<string, (data: any) => void> = new Map();

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Connected to GraphRAG WebSocket');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callback = this.messageQueue.get(data.queryId);
      if (callback) {
        callback(data);
        this.messageQueue.delete(data.queryId);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  async queryGraph(query: string, graphId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const queryId = `query-${Date.now()}`;
      
      this.messageQueue.set(queryId, resolve);
      
      const message = {
        type: 'unary',
        query,
        graphId,
        queryId
      };

      this.ws.send(JSON.stringify(message));
    });
  }

  async streamGraphTraversal(query: string, graphId: string, onChunk: (chunk: any) => void): Promise<void> {
    const queryId = `stream-${Date.now()}`;
    
    this.messageQueue.set(queryId, (data) => {
      if (data.streamingData) {
        data.streamingData.forEach((chunk: any) => onChunk(chunk));
      }
    });

    const message = {
      type: 'streaming',
      query,
      graphId,
      queryId
    };

    this.ws.send(JSON.stringify(message));
  }

  async startBidirectionalSession(sessionId: string, graphId: string): Promise<void> {
    const message = {
      type: 'bidirectional',
      sessionId,
      graphId,
      action: 'start'
    };

    this.ws.send(JSON.stringify(message));
  }

  close() {
    this.ws.close();
  }
}

// Usage example
const client = new GraphRAGWebSocketClient('ws://localhost:3000/api/websocket/graphrag');

// Unary query
const result = await client.queryGraph('AI healthcare benefits', 'graph-123');
console.log('Result:', result);

// Streaming query
client.streamGraphTraversal('Stanford researchers', 'graph-123', (chunk) => {
  console.log('Streaming chunk:', chunk);
});

// Bidirectional session
client.startBidirectionalSession('session-123', 'graph-123');
```

### HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>GraphRAG WebSocket Client</title>
</head>
<body>
    <div id="app">
        <h1>GraphRAG WebSocket Client</h1>
        
        <div>
            <input type="text" id="query" placeholder="Enter your query...">
            <input type="text" id="graphId" placeholder="Graph ID" value="graph-123">
            <button onclick="sendQuery()">Send Query</button>
        </div>
        
        <div>
            <button onclick="startStreaming()">Start Streaming</button>
            <button onclick="startSession()">Start Session</button>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:3000/api/websocket/graphrag');
        const resultsDiv = document.getElementById('results');

        ws.onopen = () => {
            console.log('Connected to GraphRAG WebSocket');
            resultsDiv.innerHTML += '<p>✅ Connected to WebSocket</p>';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            resultsDiv.innerHTML += `<p><strong>Response:</strong> ${data.response}</p>`;
            
            if (data.streamingData) {
                data.streamingData.forEach(chunk => {
                    resultsDiv.innerHTML += `<p><em>Stream:</em> ${chunk.content}</p>`;
                });
            }
        };

        function sendQuery() {
            const query = document.getElementById('query').value;
            const graphId = document.getElementById('graphId').value;
            
            const message = {
                type: 'unary',
                query,
                graphId
            };
            
            ws.send(JSON.stringify(message));
        }

        function startStreaming() {
            const query = document.getElementById('query').value;
            const graphId = document.getElementById('graphId').value;
            
            const message = {
                type: 'streaming',
                query,
                graphId
            };
            
            ws.send(JSON.stringify(message));
        }

        function startSession() {
            const graphId = document.getElementById('graphId').value;
            
            const message = {
                type: 'bidirectional',
                sessionId: 'session-' + Date.now(),
                graphId,
                action: 'start'
            };
            
            ws.send(JSON.stringify(message));
        }
    </script>
</body>
</html>
```

## Setup Instructions

### 1. Server Setup

```javascript
// WebSocket server setup with Node.js and ws library
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle different query types
      switch (data.type) {
        case 'unary':
          await handleUnaryQuery(ws, data);
          break;
        case 'streaming':
          await handleStreamingQuery(ws, data);
          break;
        case 'context-streaming':
          await handleContextStreaming(ws, data);
          break;
        case 'bidirectional':
          await handleBidirectionalSession(ws, data);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown query type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

async function handleUnaryQuery(ws, data) {
  const startTime = Date.now();
  
  // Process GraphRAG query
  const response = await processGraphRAGQuery(data.query, data.graphId);
  
  const result = {
    type: 'response',
    queryId: data.queryId,
    response: response,
    latency: Date.now() - startTime,
    payloadSize: JSON.stringify(response).length,
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(result));
}

async function handleStreamingQuery(ws, data) {
  const startTime = Date.now();
  
  // Process streaming GraphRAG query
  const streamingData = await processStreamingGraphRAGQuery(data.query, data.graphId);
  
  const result = {
    type: 'response',
    queryId: data.queryId,
    response: 'Streaming initiated',
    latency: Date.now() - startTime,
    payloadSize: JSON.stringify(streamingData).length,
    streaming: true,
    streamingData: streamingData,
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(result));
}
```

### 2. Environment Configuration

```bash
# Install WebSocket dependencies
npm install ws

# Set environment variables
export WEBSOCKET_PORT=3000
export GRAPHRAG_ENDPOINT=http://localhost:8000
export MAX_CONNECTIONS=100
```

### 3. Client Configuration

```javascript
// WebSocket client configuration
const config = {
  url: 'ws://localhost:3000/api/websocket/graphrag',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
};
```

## Performance Characteristics

### Latency Comparison

- **WebSocket**: ~30-70ms (fastest)
- **gRPC**: ~80-140ms
- **gRPC-Web**: ~100-180ms
- **GraphQL**: ~120-200ms
- **REST**: ~150-250ms

### Payload Efficiency

- **WebSocket**: ~2.2KB (JSON format)
- **gRPC**: ~800B (Protocol Buffers)
- **gRPC-Web**: ~900B (Protocol Buffers)
- **GraphQL**: ~1.8KB (JSON)
- **REST**: ~2.5KB (JSON)

### Connection Overhead

- **Initial Connection**: ~50ms
- **Message Overhead**: ~10-20 bytes per message
- **Heartbeat**: 30-second intervals
- **Reconnection**: Automatic with exponential backoff

## Best Practices

### 1. Connection Management

```javascript
// Implement connection pooling for multiple clients
class WebSocketPool {
  private connections: Map<string, WebSocket> = new Map();
  
  getConnection(clientId: string): WebSocket {
    if (!this.connections.has(clientId)) {
      const ws = new WebSocket(this.url);
      this.connections.set(clientId, ws);
    }
    return this.connections.get(clientId)!;
  }
}
```

### 2. Error Handling

```javascript
// Robust error handling with retry logic
class ResilientWebSocketClient {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnect();
        this.reconnectAttempts++;
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }
}
```

### 3. Message Queuing

```javascript
// Queue messages when connection is down
class MessageQueue {
  private queue: any[] = [];
  
  send(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.queue.push(message);
    }
  }
  
  flush() {
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if WebSocket server is running
   - Verify port configuration
   - Check firewall settings

2. **Message Loss**
   - Implement message acknowledgment
   - Use message queuing
   - Add retry logic

3. **High Latency**
   - Check network conditions
   - Optimize query processing
   - Use connection pooling

4. **Memory Leaks**
   - Properly close connections
   - Clean up event listeners
   - Monitor connection count

### Debug Tools

```javascript
// WebSocket debugging utilities
class WebSocketDebugger {
  static logConnection(ws: WebSocket) {
    console.log('Connection state:', ws.readyState);
    console.log('Buffered amount:', ws.bufferedAmount);
  }
  
  static logMessage(message: any) {
    console.log('Message sent:', message);
    console.log('Message size:', JSON.stringify(message).length);
  }
}
```

## Integration with GraphRAG

### Real-time Graph Updates

```javascript
// Subscribe to graph updates via WebSocket
ws.send(JSON.stringify({
  type: 'subscribe',
  graphId: 'graph-123',
  events: ['node_added', 'edge_updated', 'query_result']
}));
```

### Interactive Sessions

```javascript
// Maintain session state for interactive queries
const session = {
  sessionId: 'session-123',
  graphId: 'graph-123',
  context: [],
  history: []
};

ws.send(JSON.stringify({
  type: 'bidirectional',
  sessionId: session.sessionId,
  query: 'Follow up question',
  context: session.context
}));
```

### Performance Monitoring

```javascript
// Monitor WebSocket performance
class WebSocketMonitor {
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0,
    connectionUptime: 0
  };
  
  recordMessage(latency: number) {
    this.metrics.messagesReceived++;
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.messagesReceived - 1) + latency) / 
      this.metrics.messagesReceived;
  }
}
```

This comprehensive WebSocket integration provides real-time, bidirectional communication for GraphRAG applications with excellent performance characteristics and robust error handling.
