# MCP Server Integration with Postman

This guide demonstrates how to integrate popular MCP (Model Context Protocol) servers with Postman for enhanced API testing and automation.

## 🚀 Overview

MCP (Model Context Protocol) allows AI models to interact with external tools and data sources. By integrating MCP servers with Postman, you can:

- **Access external data** during API testing
- **Automate complex workflows** using multiple MCP servers
- **Enhance test data generation** with real-time information
- **Create dynamic test scenarios** based on external conditions

## 📦 Popular MCP Servers

### 1. **GitHub MCP Server**
- **URL**: `ws://localhost:3001`
- **Tools**: List repositories, create issues, search code, get pull requests
- **Use Cases**: Test GitHub API integrations, create test issues, fetch repository data

### 2. **File System MCP Server**
- **URL**: `ws://localhost:3002`
- **Tools**: Read files, write files, list directories, search files
- **Use Cases**: Read test data files, write test results, search for configuration files

### 3. **Web Search MCP Server**
- **URL**: `ws://localhost:3003`
- **Tools**: Web search, get news, get weather
- **Use Cases**: Get current information for tests, validate against real-time data

### 4. **Database MCP Server**
- **URL**: `ws://localhost:3004`
- **Tools**: Query database, insert data, update records, delete records
- **Use Cases**: Test database integrations, generate test data, validate database state

## 🛠️ Setup Instructions

### 1. Install MCP Servers

```bash
# Install popular MCP servers
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-web-search
npm install -g @modelcontextprotocol/server-database
```

### 2. Start MCP Servers

```bash
# Start GitHub MCP server
mcp-server-github --port 3001

# Start File System MCP server
mcp-server-filesystem --port 3002

# Start Web Search MCP server
mcp-server-web-search --port 3003

# Start Database MCP server
mcp-server-database --port 3004
```

### 3. Import Postman Collection

1. Download the `MCP Integration Demo` collection
2. Import it into Postman
3. Set up environment variables for MCP server URLs

## 📝 Usage Examples

### Example 1: GitHub Integration

```javascript
// Pre-request Script
const mcpClient = new MCPClient(pm.environment.get('mcp_github_url'));

try {
  await mcpClient.connect();
  const repos = await mcpClient.call('github/list_repositories', {
    owner: 'arun-gupta',
    type: 'all'
  });

  // Use repository data in request
  pm.request.body.raw = JSON.stringify({
    repositories: repos,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error('MCP GitHub error:', error);
} finally {
  mcpClient.disconnect();
}
```

### Example 2: File System Integration

```javascript
// Pre-request Script
const mcpClient = new MCPClient(pm.environment.get('mcp_filesystem_url'));

try {
  await mcpClient.connect();
  const fileContent = await mcpClient.call('filesystem/read_file', {
    path: '/path/to/test-data.json'
  });

  // Use file content in request
  pm.request.body.raw = fileContent;
} catch (error) {
  console.error('MCP File System error:', error);
} finally {
  mcpClient.disconnect();
}
```

### Example 3: Web Search Integration

```javascript
// Pre-request Script
const mcpClient = new MCPClient(pm.environment.get('mcp_web_search_url'));

try {
  await mcpClient.connect();
  const searchResults = await mcpClient.call('web_search/search', {
    query: 'API testing best practices',
    num_results: 5
  });

  // Use search results in request
  pm.request.body.raw = JSON.stringify({
    search_results: searchResults,
    query: 'API testing best practices'
  });
} catch (error) {
  console.error('MCP Web Search error:', error);
} finally {
  mcpClient.disconnect();
}
```

### Example 4: Multi-MCP Orchestration

```javascript
// Pre-request Script
const githubMCP = new MCPClient(pm.environment.get('mcp_github_url'));
const filesystemMCP = new MCPClient(pm.environment.get('mcp_filesystem_url'));
const webSearchMCP = new MCPClient(pm.environment.get('mcp_web_search_url'));

try {
  // Connect to all MCP servers
  await Promise.all([
    githubMCP.connect(),
    filesystemMCP.connect(),
    webSearchMCP.connect()
  ]);

  // Execute parallel MCP calls
  const [repos, files, searchResults] = await Promise.all([
    githubMCP.call('github/list_repositories', { owner: 'arun-gupta' }),
    filesystemMCP.call('filesystem/search_files', { query: '*.json' }),
    webSearchMCP.call('web_search/search', { query: 'MCP integration' })
  ]);

  // Combine results
  const orchestratedData = {
    repositories: repos,
    files: files,
    search_results: searchResults,
    orchestrated_at: new Date().toISOString()
  };

  // Use orchestrated data in request
  pm.request.body.raw = JSON.stringify(orchestratedData);
} catch (error) {
  console.error('Multi-MCP orchestration error:', error);
} finally {
  // Disconnect from all MCP servers
  githubMCP.disconnect();
  filesystemMCP.disconnect();
  webSearchMCP.disconnect();
}
```

## 🔧 Advanced Features

### 1. **Dynamic Test Data Generation**

```javascript
// Generate test data based on current conditions
const weatherMCP = new MCPClient(pm.environment.get('mcp_web_search_url'));

try {
  await weatherMCP.connect();
  const weather = await weatherMCP.call('web_search/get_weather', {
    location: 'San Francisco, CA'
  });

  // Adjust test parameters based on weather
  if (weather.temperature > 80) {
    pm.environment.set('test_mode', 'summer');
  } else {
    pm.environment.set('test_mode', 'winter');
  }
} finally {
  weatherMCP.disconnect();
}
```

### 2. **Conditional Test Execution**

```javascript
// Execute tests based on external conditions
const githubMCP = new MCPClient(pm.environment.get('mcp_github_url'));

try {
  await githubMCP.connect();
  const issues = await githubMCP.call('github/list_issues', {
    owner: 'arun-gupta',
    repo: 'llm-lab',
    state: 'open'
  });

  // Only run tests if there are open issues
  if (issues.length > 0) {
    pm.test('Should handle open issues', function() {
      pm.expect(issues.length).to.be.greaterThan(0);
    });
  }
} finally {
  githubMCP.disconnect();
}
```

### 3. **Real-time Data Validation**

```javascript
// Validate API responses against real-time data
const webSearchMCP = new MCPClient(pm.environment.get('mcp_web_search_url'));

try {
  await webSearchMCP.connect();
  const currentInfo = await webSearchMCP.call('web_search/search', {
    query: 'current API status'
  });

  // Test response validation
  pm.test('Response should match current information', function() {
    const response = pm.response.json();
    pm.expect(response.timestamp).to.be.closeTo(
      new Date().getTime(),
      60000 // Within 1 minute
    );
  });
} finally {
  webSearchMCP.disconnect();
}
```

## 🎯 Best Practices

### 1. **Error Handling**
- Always wrap MCP calls in try-catch blocks
- Implement fallback mechanisms for when MCP servers are unavailable
- Log errors for debugging

### 2. **Connection Management**
- Always disconnect from MCP servers after use
- Use connection pooling for frequent calls
- Implement retry logic for failed connections

### 3. **Performance Optimization**
- Use parallel MCP calls when possible
- Cache frequently used data
- Minimize the number of MCP server connections

### 4. **Security**
- Use environment variables for MCP server URLs
- Implement authentication for sensitive MCP servers
- Validate MCP server responses before use

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MCP servers are running
   - Check port numbers and URLs
   - Verify firewall settings

2. **Authentication Errors**
   - Check API keys and tokens
   - Verify MCP server configuration
   - Ensure proper permissions

3. **Timeout Errors**
   - Increase timeout values
   - Check network connectivity
   - Optimize MCP server performance

### Debug Tips

```javascript
// Enable detailed logging
console.log('MCP Server URL:', pm.environment.get('mcp_github_url'));
console.log('MCP Call Parameters:', params);
console.log('MCP Response:', response);
```

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Postman Scripting Documentation](https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

## 🤝 Contributing

To contribute to MCP-Postman integration:

1. Fork the repository
2. Create a feature branch
3. Add new MCP server integrations
4. Update documentation
5. Submit a pull request

---

**Happy Testing with MCP! 🚀**
