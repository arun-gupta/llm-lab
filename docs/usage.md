# Multi-Protocol Lab Usage Guide

A comprehensive guide on how to use all features of Multi-Protocol Lab.

## 🚀 Getting Started

### **Quick Start**
1. **Clone the repository**: `git clone https://github.com/arun-gupta/llm-lab.git`
2. **Navigate to directory**: `cd llm-lab`
3. **Run setup script**: `./quickstart.sh`
4. **Add API keys** to `.env.local`
5. **Start the application**: `npm run dev`

### **Environment Setup**
Create a `.env.local` file with your API keys:
```env
# Required (at least one):
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional (for Postman integration):
POSTMAN_API_KEY=your_key_here

# Optional (for GitHub MCP server integration):
GITHUB_TOKEN=your_github_personal_access_token_here
```

## 🤖 LLM Testing & Comparison

### **Basic LLM Testing**
1. **Navigate to the LLM tab** in the application
2. **Enter your prompt** in the text area
3. **Add optional context** for better results
4. **Select providers** (defaults to "All Local" if Ollama models available)
5. **Submit** to compare responses side-by-side
6. **Review results** with performance metrics

### **Advanced Features**
- **Streaming Support**: Enable real-time response streaming for GPT-5 models
- **Performance Analytics**: View latency, token usage, and response quality metrics
- **Custom Prompts**: Use advanced prompt engineering with context and examples
- **Local Models**: Test with Ollama models for offline development

### **Postman Integration for LLM**
1. **Preview collection** details before creation
2. **Create Postman collection** with custom name for direct API testing
3. **Choose integration method**:
   - **Direct Creation**: Collections appear instantly in your Postman workspace
   - **Download & Import**: Traditional JSON file download
4. **Celebrate success** with engaging animations

## 🕸️ GraphRAG Integration

### **Document Upload & Processing**
1. **Navigate to GraphRAG tab** to access graph-based RAG functionality
2. **Upload documents** (text files) to build knowledge graphs
3. **Use sample documents**:
   - **AI Healthcare**: Healthcare AI applications and research
   - **Tech Companies**: Technology company information and relationships
4. **Monitor processing** with real-time progress indicators

### **Knowledge Graph Building**
1. **Build knowledge graph** with entity extraction and relationship mapping
2. **Review extracted entities** and their classifications
3. **Explore relationships** between entities
4. **Analyze graph statistics** and metrics

### **Query and Comparison**
1. **Query the knowledge graph** with natural language questions
2. **Compare GraphRAG vs traditional RAG** responses
3. **Analyze performance differences** with detailed metrics
4. **Export results** for further analysis

### **Protocol Testing**
1. **Test protocols** with REST, GraphQL, gRPC, gRPC-Web, WebSocket, and SSE comparison
2. **Run performance comparisons** across all protocols
3. **Analyze latency and payload efficiency**
4. **Review protocol-specific features** and recommendations

### **Postman Integration for GraphRAG**
1. **Export Postman collections** for API testing and integration
2. **Direct Postman integration** for all collections:
   - REST API collections
   - GraphQL collections
   - gRPC collections
   - gRPC-Web collections
   - WebSocket collections
   - SSE collections
   - Protocol Comparison collections

## 📱 MCP Server Integration

### **Setup MCP Servers**
1. **Navigate to MCP tab** to see available integrations
2. **Install collections** for GitHub, Filesystem, or SQLite MCP servers
3. **Set up servers** using the provided setup scripts:
   ```bash
   # Filesystem MCP server
   ./scripts/setup-http-filesystem-mcp.sh
   
   # SQLite MCP server (requires Docker)
   docker run -d --name sqlite-mcp-http -p 3001:3001 -v $(pwd)/data:/data -e SERVER_MODE=http -e HTTP_PORT=3001 arungupta/sqlite-mcp-server
   ```

### **Using MCP Servers**
1. **Test connections** with health check endpoints
2. **Use in Postman** for automated testing and data operations
3. **Explore available operations** for each server type
4. **Monitor server status** and performance

### **Available MCP Servers**
- **GitHub MCP Server**: Repository analysis, issues, PRs, health reports
- **Filesystem MCP Server**: File operations, directory listing, content reading
- **SQLite MCP Server**: Database operations with Docker HTTP mode

## 🌐 Protocol-Specific Usage

### **REST API**
- **HTTP/1.1 endpoints** for traditional CRUD operations
- **JSON request/response** format
- **Standard HTTP methods** (GET, POST, PUT, DELETE)
- **Authentication** via API keys

### **GraphQL**
- **HTTP/1.1 with GraphQL queries** for flexible data fetching
- **Schema introspection** for API exploration
- **Variable support** for dynamic queries
- **Query optimization** and caching

### **gRPC**
- **HTTP/2 with Protocol Buffers** for high-performance streaming
- **Unary, streaming, and bidirectional** communication
- **Type-safe** message definitions
- **Performance optimization** for large datasets

### **gRPC-Web**
- **HTTP/1.1 with Protocol Buffers** for browser-based applications
- **Browser-compatible** gRPC implementation
- **Client-side streaming** capabilities
- **Web-friendly** transport layer

### **WebSocket**
- **Real-time bidirectional streaming** for live updates
- **Persistent connections** for continuous communication
- **JSON message format** for easy integration
- **Event-driven architecture** for real-time applications

### **Server-Sent Events (SSE)**
- **HTTP/1.1 with EventSource** for one-way streaming responses
- **Server-to-client streaming** for real-time updates
- **Automatic reconnection** handling
- **Lightweight** streaming solution

## 📊 Performance Analysis

### **Protocol Comparison**
1. **Run protocol comparison** tests
2. **Analyze latency** across all protocols
3. **Compare payload efficiency** and size
4. **Review performance recommendations**
5. **Export results** for further analysis

### **Performance Metrics**
- **Latency**: Response time measurements
- **Payload Size**: Data transfer efficiency
- **Throughput**: Requests per second
- **Resource Usage**: CPU and memory consumption

### **Optimization Tips**
- **Choose appropriate protocol** for your use case
- **Optimize payload size** for better performance
- **Use streaming** for large responses
- **Implement caching** where appropriate

## 🔧 Advanced Usage

### **Custom Integrations**
- **Extend functionality** with custom plugins
- **Integrate external services** via webhooks
- **Customize collection templates** for specific workflows
- **Build custom test scripts** for specialized testing

### **Development Workflow**
- **Local development** with Ollama models
- **Testing with multiple providers** for comparison
- **Performance benchmarking** across protocols
- **Continuous integration** with automated testing

### **Production Deployment**
- **Docker containerization** for easy deployment
- **Environment management** for different stages
- **Security configuration** for production use
- **Monitoring and logging** for operational insights

## 🛠️ Troubleshooting

### **Common Issues**
- **API Key Issues**: Verify API keys are correctly set in `.env.local`
- **Port Conflicts**: Check for port conflicts and adjust configuration
- **Docker Issues**: Ensure Docker is running for SQLite MCP server
- **Network Issues**: Verify internet connectivity for external APIs

### **Performance Issues**
- **High Latency**: Check network connectivity and API provider status
- **Memory Usage**: Monitor resource consumption and optimize configurations
- **Timeout Issues**: Adjust timeout settings for long-running operations

### **Integration Issues**
- **Postman Integration**: Verify Postman API key and workspace access
- **MCP Server Issues**: Check server status and configuration
- **Protocol Issues**: Verify protocol-specific configurations

## 📚 Additional Resources

- **API Documentation**: See [API Reference](../README.md#-api-reference)
- **Feature Details**: See [Features Guide](features.md)
- **Planned Features**: See [Roadmap](roadmap.md)
- **MCP Integration**: See [MCP-Postman Integration Guide](mcp-postman-integration.md)

---

For more detailed information about specific features, see the [Features Guide](features.md) and [Roadmap](roadmap.md).
