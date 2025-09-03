# MCP Server Integration with Postman

This guide demonstrates how to integrate popular MCP (Model Context Protocol) servers with Postman for enhanced API testing and automation.

## 🚀 Overview

MCP (Model Context Protocol) allows AI models to interact with external tools and data sources. By integrating MCP servers with Postman, you can:

- **Access external data** during API testing
- **Automate complex workflows** using multiple MCP servers
- **Enhance test data generation** with real-time information
- **Create dynamic test scenarios** based on external conditions

## 📦 Available MCP Servers

### 1. **GitHub MCP Server**
- **URL**: `https://api.githubcopilot.com/mcp/`
- **Tools**: Repository analysis, issues, pull requests, gists
- **Use Cases**: Test GitHub API integrations, analyze repositories, fetch user data

**Available GitHub MCP Tools:**
- `search_repositories` - Search user repositories
- `github_get_repo` - Get repository information
- `github_list_issues` - List repository issues
- `github_list_pull_requests` - List pull requests
- `github_get_top_gists` - Get user's top gists
- `github_analyze_repo_health` - Comprehensive repository health analysis

### 2. **Filesystem MCP Server**
- **URL**: `http://localhost:3002`
- **Tools**: File and directory operations
- **Use Cases**: Read test data files, write test results, search for configuration files

**Available Filesystem MCP Tools:**
- `list_directory` - List directory contents
- `read_text_file` - Read file contents as text
- `read_media_file` - Read image/audio files (base64)
- `write_file` - Write content to file
- `edit_file` - Make selective edits with pattern matching
- `create_directory` - Create directory
- `move_file` - Move/rename files and directories
- `search_files` - Search for files by partial name
- `get_file_info` - Get detailed file metadata
- `list_allowed_directories` - List accessible directories

### 3. **SQLite MCP Server**
- **URL**: `http://localhost:3001`
- **Tools**: Database operations with SQLite
- **Use Cases**: Test database integrations, generate test data, validate database state

**Available SQLite MCP Tools:**
- `list_tables` - List all tables in the database
- `describe_table` - Get detailed table schema
- `run_query` - Execute SELECT queries safely
- `insert_data` - Insert new records
- `update_data` - Update existing records
- `delete_data` - Delete records
- `get_table_info` - Get table statistics

## 🛠️ Setup Instructions

### 1. **GitHub MCP Server**
No setup required - uses GitHub Copilot's MCP API directly.

**Prerequisites:**
- GitHub Personal Access Token (PAT)
- Repository owner and name variables

### 2. **Filesystem MCP Server**

**Option A: Use the setup script (Recommended)**
```bash
# Run the setup script from the main project
./scripts/setup-http-filesystem-mcp.sh
```

This script will:
- Set up an HTTP wrapper around the official filesystem MCP server
- Configure directory access permissions
- Start the server on port 3002
- Create necessary configuration files

**Option B: Manual setup with official MCP server**
```bash
# Run the official filesystem MCP setup script
./scripts/setup-official-filesystem-mcp.sh

# This will:
# - Clone the official MCP servers repository
# - Build the filesystem server
# - Set up HTTP wrapper
# - Configure allowed directories
```

**Option C: Quick start with existing setup**
```bash
# If you already have the setup scripts, just run:
./scripts/setup-http-filesystem-mcp.sh

# The script will guide you through:
# - Directory access configuration
# - Server startup
# - Health check verification
```

### 3. **SQLite MCP Server**

The SQLite MCP Server Docker image supports two modes:
- **MCP Mode** (default): For MCP client integration
- **HTTP Mode**: For API testing with Postman

**For Postman Integration (HTTP Mode):**

```bash
# Create data directory
mkdir -p data

# Run Docker container in HTTP mode
docker run -d \
  --name sqlite-mcp-http \
  -p 4000:4000 \
  -v $(pwd)/data:/data \
  -e SQLITE_DB_PATH=/data/database.db \
  -e SERVER_MODE=http \
  -e HTTP_PORT=4000 \
  arungupta/sqlite-mcp-server
```

**Docker Commands:**
- **Start HTTP Mode**: `docker run -d --name sqlite-mcp-http -p 4000:4000 -v $(pwd)/data:/data -e SERVER_MODE=http -e HTTP_PORT=4000 arungupta/sqlite-mcp-server`
- **Stop**: `docker stop sqlite-mcp-http && docker rm sqlite-mcp-http`
- **Logs**: `docker logs sqlite-mcp-http`
- **Health Check**: `curl http://localhost:3001/health`

**HTTP Mode Features:**
- ✅ HTTP API accessible on port 4000
- ✅ RESTful endpoints for database operations
- ✅ Perfect for Postman testing
- ✅ Health check endpoint: `GET /health`
- ✅ Official Postman collection available in the repository

**Available Endpoints:**
- `GET /health` - Health check
- `GET /info` - Server information
- `GET /tools` - List available MCP tools
- `GET /tables` - List all tables
- `GET /tables/{table}` - Get table schema
- `POST /query` - Execute SELECT queries
- `POST /insert` - Insert data
- `POST /update` - Update data
- `POST /delete` - Delete data





## 🎯 Best Practices

### 1. **Error Handling**
- Always wrap MCP calls in try-catch blocks
- Implement fallback mechanisms for when MCP servers are unavailable
- Log errors for debugging

```javascript
try {
  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mcpRequest)
  });
  
  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('MCP Error:', error);
  // Fallback to default data or skip test
  pm.test.skip('MCP server unavailable');
}
```

### 2. **Connection Management**
- Use appropriate timeout values for MCP requests
- Implement retry logic for failed connections
- Handle connection errors gracefully

### 3. **Performance Optimization**
- Use parallel MCP calls when possible
- Cache frequently used data
- Minimize the number of MCP server requests

### 4. **Security**
- Use environment variables for sensitive data (tokens, URLs)
- Validate MCP server responses before use
- Implement proper authentication for MCP servers

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MCP servers are running on correct ports
   - Check firewall settings
   - Verify server URLs in environment variables

2. **Authentication Errors**
   - Check GitHub token validity
   - Verify MCP server configuration
   - Ensure proper permissions

3. **Timeout Errors**
   - Increase timeout values in Postman settings
   - Check network connectivity
   - Optimize MCP server performance

### Debug Tips

```javascript
// Enable detailed logging
console.log('MCP Server URL:', pm.environment.get('mcp_server_url'));
console.log('MCP Request:', pm.request.body.raw);
console.log('MCP Response:', pm.response.json());
```

## 📚 Available Collections

### 1. **GitHub MCP Collection**
- **File**: `public/postman-collections/github-mcp-unified.json`
- **Features**: Repository analysis, issues, PRs, gists, health reports
- **Setup**: Requires GitHub Personal Access Token

### 2. **Filesystem MCP Collection**
- **File**: `public/postman-collections/official-filesystem-mcp-fixed.json`
- **Features**: File operations, directory listing, search, metadata
- **Setup**: Requires HTTP filesystem MCP server on port 3002

### 3. **SQLite MCP Collection**
- **File**: `public/postman-collections/sqlite-mcp-server.json`
- **Features**: Database operations, CRUD, queries, statistics
- **Setup**: Requires Docker container on port 4000

## 🚀 Quick Start

1. **Install any MCP collection** from the MCP tab in the application
2. **Set up the corresponding MCP server** (see setup instructions above)
3. **Run "Health Check"** to verify server connectivity
4. **Execute the available tools** for your use case
5. **Combine multiple MCP servers** for advanced workflows

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Postman Scripting Documentation](https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/)
- [GitHub MCP Server](https://github.com/arun-gupta/sqlite-mcp-server)
- [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/servers/filesystem)
- [SQLite MCP Server](https://github.com/arun-gupta/sqlite-mcp-server)

---

**Happy Testing with MCP! 🚀**
