# Multi-Protocol Lab API Reference

Complete API documentation for Multi-Protocol Lab endpoints and integrations.

## 🤖 LLM API Endpoint

### **POST /api/llm**

Test and compare responses from multiple LLM providers.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "prompt": "Your prompt here",
  "context": "Optional context",
  "providers": ["openai:gpt-5", "anthropic:claude-4-sonnet-20241022"]
}
```

**Parameters**:
- `prompt` (string, required): The main prompt to send to LLM providers
- `context` (string, optional): Additional context for the prompt
- `providers` (array, optional): List of provider:model combinations

**Supported Providers**:
- `openai:gpt-5` - OpenAI GPT-5 model
- `openai:gpt-4` - OpenAI GPT-4 model
- `anthropic:claude-4-sonnet-20241022` - Anthropic Claude 4 Sonnet
- `anthropic:claude-3-5-sonnet-20241022` - Anthropic Claude 3.5 Sonnet
- `ollama:*` - Any locally available Ollama model

**Response**:
```json
{
  "responses": {
    "openai:gpt-5": {
      "content": "Response from GPT-5",
      "latency": 1200,
      "tokens": {
        "input": 50,
        "output": 200,
        "total": 250
      }
    },
    "anthropic:claude-4-sonnet-20241022": {
      "content": "Response from Claude 4",
      "latency": 1500,
      "tokens": {
        "input": 50,
        "output": 180,
        "total": 230
      }
    }
  },
  "performance": {
    "fastest": "openai:gpt-5",
    "mostEfficient": "anthropic:claude-4-sonnet-20241022"
  }
}
```

## 📱 Postman Integration API

### **GET /api/postman/status**

Check Postman API key status and workspace access.

**Response**:
```json
{
  "status": "connected",
  "workspace": "Your Workspace Name",
  "apiKeyValid": true
}
```

### **POST /api/postman/create-collection**

Create a Postman collection directly in your workspace.

**Request Body**:
```json
{
  "collection": {
    "info": {
      "name": "LLM Test Collection",
      "description": "Collection for testing LLM APIs"
    },
    "item": [
      {
        "name": "Test LLM",
        "request": {
          "method": "POST",
          "header": [
            {
              "key": "Content-Type",
              "value": "application/json"
            }
          ],
          "body": {
            "mode": "raw",
            "raw": "{\n  \"prompt\": \"Hello, world!\",\n  \"providers\": [\"openai:gpt-5\"]\n}"
          },
          "url": {
            "raw": "{{baseUrl}}/api/llm",
            "host": ["{{baseUrl}}"],
            "path": ["api", "llm"]
          }
        }
      }
    ]
  },
  "createInWeb": true
}
```

**Parameters**:
- `collection` (object, required): Postman collection object
- `createInWeb` (boolean, optional): Create in Postman web (true) or desktop (false)

**Response**:
```json
{
  "success": true,
  "collectionId": "abc123-def456",
  "collectionUrl": "https://go.postman.co/collection/abc123-def456",
  "message": "Collection created successfully"
}
```

## 🕸️ GraphRAG API

### **POST /api/graphrag/build-graph**

Build a knowledge graph from uploaded documents.

**Request Body**:
```json
{
  "documents": [
    {
      "name": "document1.txt",
      "content": "Document content here..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "graphId": "graph_1234567890",
  "stats": {
    "totalNodes": 150,
    "totalEdges": 300,
    "topEntities": ["AI", "Healthcare", "Technology"]
  }
}
```

### **POST /api/graphrag/query**

Query the knowledge graph with natural language.

**Request Body**:
```json
{
  "query": "What are the benefits of AI in healthcare?",
  "graphId": "graph_1234567890"
}
```

**Response**:
```json
{
  "query": "What are the benefits of AI in healthcare?",
  "graphRAGResponse": "AI in healthcare offers numerous benefits...",
  "traditionalRAGResponse": "Traditional RAG response...",
  "graphContext": ["AI", "Healthcare", "Benefits"],
  "performance": {
    "graphRAGLatency": 1200,
    "traditionalRAGLatency": 1800,
    "contextRelevance": 0.95
  }
}
```

### **POST /api/protocol-comparison**

Compare performance across different protocols.

**Request Body**:
```json
{
  "query": "What are the benefits of AI in healthcare?",
  "protocols": ["REST", "GraphQL", "gRPC", "gRPC-Web", "WebSocket", "SSE"]
}
```

**Response**:
```json
{
  "results": [
    {
      "protocol": "REST",
      "latency": 168,
      "payloadSize": "2.5KB",
      "response": "REST API response..."
    },
    {
      "protocol": "GraphQL",
      "latency": 137,
      "payloadSize": "1.8KB",
      "response": "GraphQL response..."
    }
  ],
  "analytics": {
    "fastest": "SSE",
    "mostEfficient": "gRPC",
    "recommendations": ["Use SSE for real-time updates", "Use gRPC for high-performance scenarios"]
  }
}
```

## 🔧 Ollama API

### **GET /api/ollama/models**

Get available Ollama models.

**Response**:
```json
{
  "models": [
    {
      "name": "llama2",
      "size": "3.8GB",
      "modified_at": "2024-01-15T10:30:00Z"
    },
    {
      "name": "codellama",
      "size": "4.2GB",
      "modified_at": "2024-01-16T14:20:00Z"
    }
  ]
}
```

## 🌐 Protocol-Specific APIs

### **gRPC Endpoints**

**gRPC Server**: `localhost:50051`

**Protocol Buffer Definition**:
```protobuf
syntax = "proto3";

package graphrag;

service GraphRAGService {
  rpc Query(QueryRequest) returns (QueryResponse);
  rpc StreamQuery(QueryRequest) returns (stream QueryResponse);
  rpc BuildGraph(BuildGraphRequest) returns (BuildGraphResponse);
}

message QueryRequest {
  string query = 1;
  string graph_id = 2;
}

message QueryResponse {
  string response = 1;
  float latency = 2;
  repeated string context = 3;
}
```

### **gRPC-Web Endpoints**

**gRPC-Web Server**: `localhost:50052`

Same protocol buffer definition as gRPC, accessible via HTTP/1.1.

### **WebSocket Endpoints**

**WebSocket Server**: `ws://localhost:3000/api/websocket`

**Message Format**:
```json
{
  "type": "query",
  "data": {
    "query": "What are the benefits of AI in healthcare?",
    "graphId": "graph_1234567890"
  }
}
```

### **SSE Endpoints**

**SSE Endpoint**: `GET /api/sse/query?q=What are the benefits of AI in healthcare?`

**Event Stream Format**:
```
event: query_start
data: {"query": "What are the benefits of AI in healthcare?"}

event: query_progress
data: {"progress": 50, "message": "Processing..."}

event: query_complete
data: {"response": "AI in healthcare offers numerous benefits...", "latency": 1200}
```

## 🔑 Authentication

### **API Keys**

Most endpoints require API keys to be set in the `.env.local` file:

```env
# Required for LLM APIs
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Required for Postman integration
POSTMAN_API_KEY=your_postman_key_here

# Optional for GitHub MCP integration
GITHUB_TOKEN=your_github_token_here
```

### **Headers**

For authenticated requests, include the appropriate headers:

```bash
# For OpenAI
Authorization: Bearer your_openai_key_here

# For Anthropic
x-api-key: your_anthropic_key_here

# For Postman
X-API-Key: your_postman_key_here
```

## 📊 Error Handling

### **Common Error Responses**

**400 Bad Request**:
```json
{
  "error": "Invalid request format",
  "details": "Missing required field: prompt"
}
```

**401 Unauthorized**:
```json
{
  "error": "Invalid API key",
  "details": "Please check your API key configuration"
}
```

**429 Rate Limited**:
```json
{
  "error": "Rate limit exceeded",
  "details": "Please wait before making additional requests"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

## 🔧 Development Endpoints

### **Health Check**

**GET /api/health**

Check the health status of all services.

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "llm": "operational",
    "graphrag": "operational",
    "postman": "operational",
    "grpc": "operational"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Configuration**

**GET /api/config**

Get current application configuration.

**Response**:
```json
{
  "ports": {
    "app": 3000,
    "grpc": 50051,
    "grpcWeb": 50052,
    "mcpSqlite": 3001,
    "mcpFilesystem": 3002
  },
  "features": {
    "streaming": true,
    "protocolComparison": true,
    "postmanIntegration": true
  }
}
```

---

For more detailed usage examples and integration guides, see the [Usage Guide](usage.md) and [Features Guide](features.md).
