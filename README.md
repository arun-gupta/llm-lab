# LLM Prompt Lab

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/arun-gupta/llm-prompt-lab) *(Outdated - Use Local Setup)*

A comprehensive **LLM experimentation and GraphRAG development platform** that combines traditional LLM testing with advanced **Graph-based Retrieval-Augmented Generation (GraphRAG)** capabilities. Build knowledge graphs from documents, compare GraphRAG vs traditional RAG, and test multiple protocols (REST, GraphQL, gRPC) with seamless **Postman integration**.

## 🎯 **What Makes This Special**

### **🕸️ GraphRAG Lab**
- **Document Processing**: Upload text documents and automatically build knowledge graphs
- **Entity Extraction**: Extract entities, relationships, and context from your documents
- **Graph Visualization**: Interactive knowledge graph exploration and analysis
- **Protocol Comparison**: Test REST vs GraphQL vs gRPC performance side-by-side
- **Performance Analytics**: Compare GraphRAG vs traditional RAG with detailed metrics

### **🤖 Multi-Provider LLM Testing**
- **Side-by-Side Comparison**: Test OpenAI, Anthropic, and Ollama models simultaneously
- **Performance Metrics**: Latency, token usage, and response quality analysis
- **Streaming Support**: Real-time response streaming for GPT-5 and other models
- **Custom Prompts**: Advanced prompt engineering with context and examples

### **📱 Postman Integration**
- **Direct Collection Creation**: Generate Postman collections with one click
- **Multi-Protocol Support**: REST, GraphQL, and gRPC collections
- **MCP Server Integration**: GitHub, Filesystem, and SQLite MCP servers
- **Automated Testing**: Pre-built test scripts and environment templates

### **⚡ Developer Experience**
- **One-Command Setup**: `./quickstart.sh` sets up everything automatically
- **Configurable Ports**: Centralized port management for all services
- **Real-Time Feedback**: Live status updates and error handling
- **Production Ready**: Docker support, environment management, and deployment guides

### **🌐 Multi-Protocol & Transport Support**
- **REST API**: HTTP/1.1 with JSON payloads for traditional API interactions
- **GraphQL**: HTTP/1.1 with GraphQL queries for flexible data fetching
- **gRPC**: HTTP/2 with Protocol Buffers for high-performance streaming
- **MCP (Model Context Protocol)**: HTTP wrappers for GitHub, Filesystem, and SQLite integrations
- **WebSocket**: Real-time streaming for GraphRAG updates and LLM responses
- **HTTP/2**: Multiplexed connections for improved performance
- **Protocol Buffers**: Binary serialization for efficient data transfer

## 🚀 Quick Start

### **Option 1: Local Development (Recommended)**

**Quick and Easy Setup:**
```bash
# Clone and run with one command
git clone https://github.com/arun-gupta/llm-lab.git
cd llm-lab
./quickstart.sh
```

**Manual Setup:**
```bash
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev

# Optional: Set up MCP servers manually (if not using quickstart.sh)
./scripts/setup-http-filesystem-mcp.sh
```

### **Option 2: GitHub Codespaces (Outdated - Use Local Setup Instead)**

⚠️ **Note**: GitHub Codespaces setup is currently outdated and may not work properly. We recommend using the local development setup above for the best experience.

If you still want to try Codespaces:
- Click the button at the top of this README
- May require manual dependency installation
- Environment setup may need manual configuration
- Use local setup for optimal performance and reliability
```bash
# Clone and run
git clone https://github.com/arun-gupta/llm-lab.git
cd llm-lab
./quickstart.sh
```

**Or manually:**
```bash
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev
```

### **MCP Server Setup (Automatic)**

The `quickstart.sh` script automatically sets up MCP servers for enhanced Postman integration:
- **MCP SQLite Server**: Port 3001 (SQLite database operations)
- **MCP Filesystem Server**: Port 3002 (File operations and directory listing)
- **Remote GitHub MCP**: https://api.githubcopilot.com/mcp/ (no installation needed)

**Note**: Web Search and Database MCP servers are not yet implemented.

### **GraphRAG Setup (Automatic)**

The `quickstart.sh` script also sets up GraphRAG functionality:
- **Data Directories**: `data/graphs/` and `sample-docs/`
- **Sample Documents**: AI healthcare and tech companies examples
- **Knowledge Graph Storage**: JSON-based graph persistence
- **API Endpoints**: Document upload, graph building, query comparison
- **gRPC Server**: Port 50051 (gRPC protocol) and 50052 (HTTP proxy)
- **Protocol Comparison**: REST vs GraphQL vs gRPC performance testing

**Manual Setup (if needed):**
```bash
# Set up Filesystem MCP server manually
./scripts/setup-http-filesystem-mcp.sh

# Set up SQLite MCP server (requires Docker)
mkdir -p data
docker run -d --name sqlite-mcp-http -p 3001:3001 -v $(pwd)/data:/data -e SERVER_MODE=http -e HTTP_PORT=3001 arungupta/sqlite-mcp-server
```

### **MCP Server Integration**

LLM Lab includes **MCP (Model Context Protocol) server integration** for enhanced Postman automation:

- **GitHub MCP Server**: Repository analysis, issues, PRs, health reports
- **Filesystem MCP Server**: File operations, directory listing, content reading
- **SQLite MCP Server**: Database operations with Docker HTTP mode
- **Postman Collections**: Ready-to-use collections for all MCP integrations
- **HTTP Wrappers**: Direct API testing without MCP client setup

**📖 Documentation**: [MCP-Postman Integration Guide](docs/mcp-postman-integration.md)

## 🔑 Required API Keys

Add to `.env.local`:
```env
# Required (at least one):
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional (for Postman integration):
POSTMAN_API_KEY=your_key_here

# Optional (for GitHub MCP server integration):
GITHUB_TOKEN=your_github_personal_access_token_here
```

**Get API Keys:** [OpenAI](https://platform.openai.com/) | [Anthropic](https://console.anthropic.com/) | [Postman](https://www.postman.com) | [GitHub](https://github.com/settings/tokens)

### **🚀 GPT-5 Streaming Support**

**Important**: GPT-5 models use streaming for optimal performance and content generation. To use GPT-5 models:

1. **Verify your OpenAI organization** at [https://platform.openai.com/settings/organization/general](https://platform.openai.com/settings/organization/general)
2. **Click "Verify Organization"** and wait up to 15 minutes for access to propagate
3. **Ensure your API key** has access to GPT-5 models

**Why streaming?** GPT-5 models require streaming to capture partial content and avoid empty responses. This enables:
- ✅ **Actual content generation** instead of empty responses
- ✅ **Better token utilization** with balanced limits
- ✅ **Graceful truncation handling** for long responses
- ✅ **Real-time content capture** as it's generated

### **🔑 Setting Up API Keys**

**For Local Development:**
1. Copy `.env.local.example` to `.env.local`
2. Add your API keys to `.env.local`:
   ```env
   OPENAI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   POSTMAN_API_KEY=your_key_here  # optional
   GITHUB_TOKEN=your_github_token_here  # optional, for MCP integration
   ```

**For GitHub Codespaces (Outdated):**
⚠️ **Note**: Codespaces setup is outdated. Use local development instead.

If you still want to try Codespaces:
1. Go to your Codespace settings and add environment variables, or
2. Edit `.env.local` directly in the Codespace
3. Set `NEXT_PUBLIC_BASE_URL` to your Codespaces URL

## ✨ Key Features

### **🕸️ GraphRAG (Graph-based Retrieval-Augmented Generation)**
- **Document Upload & Processing**: Upload text documents and automatically extract entities and relationships
- **Knowledge Graph Building**: Create interactive knowledge graphs with entity extraction and relationship mapping
- **Graph Visualization**: Explore and analyze knowledge graphs with interactive visualizations
- **Protocol Comparison**: Test REST vs GraphQL vs gRPC performance with detailed analytics
- **Performance Metrics**: Compare GraphRAG vs traditional RAG with latency, payload size, and response quality
- **Multi-Protocol Support**: 
  - **REST API**: HTTP/1.1 endpoints for traditional CRUD operations
  - **GraphQL**: HTTP/1.1 with flexible querying and schema introspection
  - **gRPC**: HTTP/2 with Protocol Buffers for streaming and high-performance operations

### **🤖 LLM Testing & Comparison**
- **Multi-Provider Support**: OpenAI, Anthropic, and Ollama models side-by-side
- **Real-Time Streaming**: GPT-5 and other models with live response streaming
- **Performance Analytics**: Latency, token usage, and response quality metrics
- **Advanced Prompting**: Context-aware prompts with examples and templates
- **Local Model Support**: Ollama integration with auto-detection

### **📱 Postman Integration**
- **Multi-Protocol Collections**: Generate Postman collections for REST, GraphQL, gRPC, and MCP protocols
- **Direct Integration**: Create collections directly in Postman Desktop or Web
- **Protocol-Specific Features**:
  - **REST Collections**: HTTP/1.1 endpoints with JSON request/response examples
  - **GraphQL Collections**: HTTP/1.1 with GraphQL queries and variables
  - **gRPC Collections**: HTTP/2 endpoints with Protocol Buffer message examples
  - **MCP Collections**: HTTP wrappers for GitHub, Filesystem, and SQLite integrations
- **Automated Testing**: Pre-built test scripts and environment templates
- **Custom Naming**: Personalized collection names and organization

### **⚡ Developer Experience**
- **One-Command Setup**: `./quickstart.sh` with automatic dependency installation
- **Configurable Architecture**: Centralized port management for all services
- **Real-Time Feedback**: Live status updates and comprehensive error handling
- **Production Ready**: Docker support, environment management, and deployment guides
- **Comprehensive Documentation**: Detailed guides for all features and integrations

## 🎯 Postman Integration

### **What You Get:**
- **Direct Workspace Creation**: Collections appear instantly in your Postman workspace
- **Collection Preview**: Review collection details before creation
- **Custom Names**: Personalize collection names for better organization
- **Success Celebrations**: Engaging feedback when collections are created
- **Environment Templates**: Automatic setup of API key variables
- **Test Automation**: Pre-built scripts validate responses
- **Dynamic Content**: Variables for easy prompt modification
- **Rich Documentation**: Detailed descriptions in every collection

### **Two Options:**
1. **🚀 Direct Creation** (Recommended): Collections created directly in Postman
2. **📥 Download & Import**: Traditional JSON file download

### **Agent Selection:**
- **Web**: Create collections in Postman web interface
- **Desktop**: Create collections in Postman desktop app

## 📊 Current Status

✅ **Working**: OpenAI, Anthropic, Ollama integrations  
✅ **Complete**: Postman integration, UI, error handling, success celebrations  
✅ **Features**: Custom collection names, collection preview, status indicators  
✅ **MCP Integration**: GitHub, Filesystem, and SQLite MCP servers with Postman collections  
✅ **GPT-5 Streaming**: Implemented streaming for GPT-5 models to fix empty response issues  
✅ **GraphRAG Integration**: Document upload, knowledge graph building, and GraphRAG vs traditional RAG comparison  
✅ **Protocol Comparison**: REST vs GraphQL vs gRPC performance testing with Postman integration  
✅ **Port Configuration**: Centralized port management with configurable ports  
✅ **Concise Quickstart**: Streamlined setup with minimal verbosity  

## 🛠️ Usage

### **LLM Testing & Comparison**
1. **Enter your prompt** and optional context
2. **Select providers** (defaults to "All Local" if Ollama models available)
3. **Submit** to compare responses side-by-side
4. **Preview collection** details before creation
5. **Create Postman collection** with custom name for direct API testing
6. **Celebrate success** with engaging animations

### **MCP Server Integration**
1. **Navigate to MCP tab** to see available integrations
2. **Install collections** for GitHub, Filesystem, or SQLite MCP servers
3. **Set up servers** using the provided setup scripts
4. **Test connections** with health check endpoints
5. **Use in Postman** for automated testing and data operations

### **GraphRAG Integration**
1. **Navigate to GraphRAG tab** to access graph-based RAG functionality
2. **Upload documents** (text files) to build knowledge graphs
3. **Build knowledge graph** with entity extraction and relationship mapping
4. **Query and compare** GraphRAG vs traditional RAG responses
5. **Test protocols** with REST, GraphQL, and gRPC comparison
6. **Export Postman collections** for API testing and integration
7. **Direct Postman integration** for all collections (REST, GraphQL, gRPC, Protocol Comparison)

## 📈 Planned Features

### **Phase 1: Enhanced Integration** ✅
- [x] One-click Postman workspace setup
- [x] Interactive onboarding wizard
- [x] Collection preview before creation
- [x] Success celebration moments
- [x] Improved error handling
- [x] Custom collection names
- [x] MCP server integration (GitHub, Filesystem, SQLite)
- [x] HTTP wrappers for direct API testing
- [x] GraphRAG integration with protocol comparison
- [x] gRPC server with HTTP proxy
- [x] Centralized port configuration
- [x] Streamlined quickstart experience

### **Phase 2: Enhanced Postman Integration** 📱
- [ ] **Collection Templates**: Pre-built templates for common AI/ML workflows
- [ ] **Environment Management**: Dynamic environment variables for different AI providers
- [ ] **Test Automation**: Advanced test scripts for model validation and performance testing
- [ ] **Mock Server Integration**: AI response mocking for development and testing
- [ ] **Collection Analytics**: Usage analytics and performance insights for collections
- [ ] **Team Collaboration**: Shared collections and team workspace integration

### **Phase 3: Advanced Protocol Support** 🌐
- [ ] **WebSocket Collections**: Postman collections for real-time streaming endpoints
- [ ] **Enhanced gRPC Collections**: Improved gRPC collection generation with Protocol Buffers
- [ ] **GraphQL Subscriptions**: Postman collections for GraphQL subscription endpoints
- [ ] **Webhook Collections**: Postman collections for webhook testing and validation
- [ ] **HTTP/3 Support**: Postman collections optimized for HTTP/3 endpoints

### **Phase 4: AI/ML Service Integration** 🧠
- [ ] **Vector Database Collections**: Postman collections for Pinecone, Weaviate, Chroma APIs
- [ ] **Model Training Collections**: Postman collections for fine-tuning and training APIs
- [ ] **RAG Pipeline Collections**: Postman collections for RAG pipeline configuration and testing
- [ ] **Model Monitoring Collections**: Postman collections for A/B testing and performance monitoring APIs
- [ ] **Embedding Service Collections**: Postman collections for custom embedding model APIs
- [ ] **Multi-Modal API Collections**: Postman collections for image, audio, and video processing APIs

### **Phase 5: Agentic System Integration** 🤖
- [ ] **Agent Orchestration Collections**: Postman collections for multi-agent coordination APIs
- [ ] **Agent Memory Collections**: Postman collections for agent memory and context management APIs
- [ ] **Tool Integration Collections**: Postman collections for external API and service integrations
- [ ] **Agent Decision Collections**: Postman collections for autonomous decision-making APIs
- [ ] **Agent Marketplace Collections**: Postman collections for agent discovery and deployment APIs
- [ ] **Workflow Automation Collections**: Postman collections for workflow orchestration APIs

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Reference

### **LLM API Endpoint**
```bash
POST /api/llm
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "context": "Optional context",
  "providers": ["openai:gpt-5", "anthropic:claude-4-sonnet-20241022"]
}
```

### **Postman Integration**
```bash
# Check Postman API key status
GET /api/postman/status

# Create collection in Postman workspace
POST /api/postman/create-collection
{
  "collection": { /* Postman collection object */ },
  "createInWeb": true
}
```

### **Ollama Models**
```bash
# Get available Ollama models
GET /api/ollama/models
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community. **Perfect for generating Postman collections and testing LLM APIs.**
