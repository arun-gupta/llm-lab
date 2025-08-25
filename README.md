# Postman Labs

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/arun-gupta/postman-labs) *(Outdated - Use Local Setup)*

A comprehensive **Postman-focused protocol testing and GraphRAG development platform** that combines traditional LLM testing with advanced **Graph-based Retrieval-Augmented Generation (GraphRAG)** capabilities. Build knowledge graphs from documents, compare GraphRAG vs traditional RAG, and test multiple protocols (REST, GraphQL, gRPC, gRPC-Web, WebSocket, SSE) with seamless **Postman integration**. Perfect for API testing and protocol comparison.

## 🎯 **What Makes This Special**

### **🤖 Multi-Provider LLM Testing**
- **Side-by-Side Comparison**: Test OpenAI, Anthropic, and Ollama models simultaneously
- **Performance Metrics**: Latency, token usage, and response quality analysis
- **Streaming Support**: Real-time response streaming for GPT-5 and other models
- **Custom Prompts**: Advanced prompt engineering with context and examples

### **🕸️ GraphRAG Lab**
- **Document Processing**: Upload text documents and automatically build knowledge graphs
- **Entity Extraction**: Extract entities, relationships, and context from your documents
- **Graph Visualization**: Interactive knowledge graph exploration and analysis
- **Protocol Comparison**: Test REST vs GraphQL vs gRPC vs gRPC-Web vs WebSocket vs SSE performance side-by-side
- **Performance Analytics**: Compare GraphRAG vs traditional RAG with detailed metrics

### **🌐 Multi-Protocol & Transport Support**
- **REST API**: HTTP/1.1 with JSON payloads for traditional API interactions
- **GraphQL**: HTTP/1.1 with GraphQL queries for flexible data fetching
- **gRPC**: HTTP/2 with Protocol Buffers for high-performance streaming
- **gRPC-Web**: HTTP/1.1 with Protocol Buffers for browser-based gRPC applications
- **WebSocket**: Real-time bidirectional streaming for GraphRAG updates and LLM responses
- **Server-Sent Events (SSE)**: HTTP/1.1 with EventSource for meaningful context streaming with real content
- **MCP (Model Context Protocol)**: HTTP wrappers for GitHub, Filesystem, and SQLite integrations
- **HTTP/2**: Multiplexed connections for improved performance
- **Protocol Buffers**: Binary serialization for efficient data transfer

### **⚡ Developer Experience**
- **One-Command Setup**: `./quickstart.sh` sets up everything automatically
- **Configurable Ports**: Centralized port management for all services
- **Real-Time Feedback**: Live status updates and error handling
- **Production Ready**: Docker support, environment management, and deployment guides

### **📱 Postman Integration**
- **Direct Collection Creation**: Generate Postman collections with one click
- **Multi-Protocol Support**: REST, GraphQL, gRPC, gRPC-Web, WebSocket, SSE, and MCP collections
- **MCP Server Integration**: GitHub, Filesystem, and SQLite MCP servers
- **Automated Testing**: Pre-built test scripts and environment templates

**🚧 Coming Soon:**
- **Vector Database APIs**: Pinecone, Weaviate, Chroma, Qdrant integrations
- **Neo4j Backend**: Native graph database integration for scalable knowledge graph storage
- **Agentic Systems**: LangChain, AutoGen, CrewAI agent orchestration

**🔧 Development Tools:**
- **GitHub Actions**: Automated testing and deployment ([docs](docs/github-actions.md))
- **Docker**: Production-ready containerization
- **Health Checks**: Container monitoring and status endpoints
- **Newman Integration**: Automated Postman collection testing with HTML reports

**✅ Recent Improvements:**
- **SSE Streaming**: Meaningful context content instead of generic messages
- **Protocol Comparison UI**: Previous results clear automatically for better UX
- **gRPC-Web Integration**: Fixed port conflicts and dependency issues
- **Quickstart Script**: Enhanced with gRPC server startup and clean shutdown
- **Docker Support**: Production-ready Dockerfile with multi-stage builds
- **GitHub Actions**: Automated CI/CD pipelines for testing and deployment
- **Newman Integration**: Automated testing of all Postman collections with detailed HTML reports

## 🚀 Quick Start

### **Option 1: Local Development (Recommended)**

**Quick and Easy Setup:**
```bash
# Clone and run with one command
git clone https://github.com/arun-gupta/postman-protocol-playground.git
cd postman-protocol-playground
./quickstart.sh

# To stop all services (two options):
# Option 1: Press Ctrl+C in the quickstart terminal (recommended)
# Option 2: Run in another terminal: ./quickstop.sh

# To check service status:
./quickstatus.sh
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

### **Option 2: Docker Deployment**

**Using Docker Compose (Recommended for Production):**
```bash
# Clone the repository
git clone https://github.com/arun-gupta/postman-labs.git
cd postman-labs

# Quick start with pre-built images (fastest)
docker-compose up -d

# Development setup (simpler, fewer services)
docker-compose -f docker-compose.dev.yml up -d

# Local build from source (for development/testing)
docker-compose -f docker-compose.build.yml up -d
```

# Option 1: Use .env.local (recommended for local development)
# Create .env.local with your API keys (this file is gitignored)
cat > .env.local << EOF
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
POSTMAN_API_KEY=your_postman_api_key_here
OLLAMA_BASE_URL=http://host.docker.internal:11434
EOF

# Option 2: Use .env file
# Create environment file with your API keys
cp .env.example .env
# Edit .env and add your API keys

# Build and run with Docker Compose
docker-compose up --build

# To run in background
docker-compose up -d --build

# To stop
docker-compose down
```

**Using Docker directly:**
```bash
# Build the image
docker build -t postman-labs .

# Run the container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e ANTHROPIC_API_KEY=your_key \
  -e POSTMAN_API_KEY=your_key \
  postman-labs

# Or with environment file
docker run -p 3000:3000 --env-file .env postman-labs
```

**Environment Variables Required:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key  
- `POSTMAN_API_KEY`: Your Postman API key (optional)
- `OLLAMA_BASE_URL`: URL for Ollama server (optional, defaults to localhost:11434)

**Environment File Precedence:**
Docker Compose reads environment files in this order (later files override earlier ones):
1. `.env.local` (gitignored, recommended for local development)
2. `.env` (can be committed to git for default values)

**Docker Compose Options:**
- **Quick Start** (`docker-compose.yml`): All services using pre-built images from GHCR (fastest startup)
- **Development** (`docker-compose.dev.yml`): Simplified setup with just the main app and SQLite MCP server
- **Local Build** (`docker-compose.build.yml`): All services built locally from source (for development/testing)

**Pre-built Images Available (All from GHCR):**
- `ghcr.io/arun-gupta/postman-labs:latest` - Main Next.js application
- `ghcr.io/arun-gupta/postman-labs-grpc:latest` - gRPC server for GraphRAG
- `ghcr.io/arun-gupta/postman-labs-grpc-web:latest` - gRPC-Web proxy
- `ghcr.io/arun-gupta/postman-labs-filesystem-mcp:latest` - Filesystem MCP server
- `ghcr.io/arun-gupta/sqlite-mcp-server:latest` - SQLite MCP server

**Benefits of Unified GHCR Registry:**
- ✅ All images from the same trusted source
- ✅ Consistent security scanning and vulnerability management
- ✅ Unified access control and permissions
- ✅ Better performance with single registry
- ✅ Simplified dependency management

**Example .env.local file:**
```bash
# Create .env.local with your actual API keys
OPENAI_API_KEY=sk-your-actual-openai-key
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
POSTMAN_API_KEY=your-actual-postman-key
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### **Option 3: GitHub Codespaces (Outdated - Use Local Setup Instead)**

⚠️ **Note**: GitHub Codespaces setup is currently outdated and may not work properly. We recommend using the local development setup above for the best experience.

If you still want to try Codespaces:
- Click the button at the top of this README
- May require manual dependency installation
- Environment setup may need manual configuration
- Use local setup for optimal performance and reliability
```bash
# Clone and run
git clone https://github.com/arun-gupta/postman-labs.git
cd postman-labs
./quickstart.sh
```

**Or manually:**
```bash
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev
```

### **gRPC Services Setup (Automatic)**

The `quickstart.sh` script automatically starts gRPC services for high-performance GraphRAG operations:
- **gRPC Server**: Port 50051 (Core GraphRAG service with Protocol Buffers)
- **gRPC-Web Proxy**: Port 50053 (Browser-compatible gRPC over HTTP/1.1)
- **Health Check**: http://localhost:50053/health
- **Performance**: ~50% latency reduction vs REST, ~36% payload size
- **Clean Shutdown**: All services stop cleanly with Ctrl+C or `./quickstop.sh`

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
- **gRPC Server**: Port 50051 (gRPC protocol) and 50053 (gRPC-Web proxy)
- **Protocol Comparison**: REST vs GraphQL vs gRPC vs gRPC-Web vs WebSocket vs SSE performance testing
- **Real-time Streaming**: SSE with meaningful context content and WebSocket bidirectional communication
- **UI Improvements**: Previous comparison results clear automatically for better UX

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


## 🔑 API Keys & Configuration

### **Required API Keys**

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
- ✅ **Real-time content capture** as it is generated

### **💾 Data Storage**

**Current Implementation:**
- **In-Memory Database**: All data (graphs, comparisons, settings) is stored in memory for fast access
- **File System**: Sample documents and generated collections are stored locally
- **Session Storage**: User preferences and temporary data persist during browser sessions

**Planned Enhancements:**
- **Neo4j Backend**: Native graph database integration for scalable knowledge graph storage
- **Persistent Storage**: Database-backed storage for long-term data persistence
- **Cloud Integration**: Optional cloud storage for collaborative features
⚠️ **Note**: Codespaces setup is outdated. Use local development instead.

If you still want to try Codespaces:
1. Go to your Codespace settings and add environment variables, or
2. Edit `.env.local` directly in the Codespace
3. Set `NEXT_PUBLIC_BASE_URL` to your Codespaces URL



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

## 🛠️ Usage

For comprehensive usage instructions, see our detailed guides:

- **[📖 Usage Guide](docs/usage.md)** - Complete step-by-step instructions for all features
- **[✨ Features Guide](docs/features.md)** - Detailed feature descriptions and capabilities
- **[📈 Roadmap](docs/roadmap.md)** - Development phases and planned features

## 🧪 Testing with Newman

This project includes automated testing of all Postman collections using [Newman](https://github.com/postmanlabs/newman), the command-line collection runner for Postman.

### **CI/CD Integration**
- **Automated Testing**: All collections are tested automatically in GitHub Actions
- **HTML Reports**: Detailed test reports are generated and uploaded as artifacts
- **Parallel Execution**: Collections can be tested in parallel for faster feedback
- **Failure Handling**: Tests continue even if some collections fail

### **Local Testing**
```bash
# Test all collections sequentially
./scripts/test-collections.sh

# Test all collections in parallel
PARALLEL=true ./scripts/test-collections.sh

# Test a specific collection
newman run public/postman-collections/github-mcp-unified.json --reporters cli,html
```

### **Available Collections**
- **GitHub MCP**: Tests GitHub integration via Model Context Protocol
- **GraphRAG gRPC**: Tests GraphRAG functionality via gRPC
- **Filesystem MCP**: Tests filesystem operations via Model Context Protocol
- **SQLite MCP**: Tests SQLite database operations via Model Context Protocol

### **Test Reports**
- Reports are saved to `newman-reports/` directory
- HTML reports provide detailed test results and response data
- Failed tests are clearly marked with error details
- CI artifacts are retained for 30 days

## 📈 Development Status

For detailed development phases and planned features, see our **[📈 Roadmap](docs/roadmap.md)**.

**✅ Completed**: Multi-protocol support (REST, GraphQL, gRPC, gRPC-Web, WebSocket, SSE), Postman integration, GraphRAG, MCP servers  
**🔄 In Progress**: Enhanced Postman features, advanced protocol support  
**📋 Planned**: AI/ML service integrations, agentic systems, vector databases

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

For complete API documentation, see our **[📚 API Reference](docs/api-reference.md)**.

**Key Endpoints**:
- **LLM Testing**: `POST /api/llm` - Test multiple LLM providers
- **Postman Integration**: `POST /api/postman/create-collection` - Create collections
- **GraphRAG**: `POST /api/graphrag/query` - Query knowledge graphs
- **Protocol Comparison**: `POST /api/protocol-comparison` - Compare protocols
- **Ollama Models**: `GET /api/ollama/models` - List local models



## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community. **Perfect for protocol testing, Postman integration, and GraphRAG development.**
