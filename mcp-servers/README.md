# MCP Server Infrastructure for LLM Lab

This directory contains the MCP (Model Context Protocol) server infrastructure for LLM Lab.

## Current Setup

- **HTTP Filesystem MCP Server** (Port 3002): Official MCP server with HTTP wrapper for Postman integration
- **SQLite MCP Server** (Port 3001): Database operations with Docker HTTP mode for Postman integration

## Available Remote MCP Servers

GitHub provides official remote MCP servers that are always available:

### Core GitHub Services
- **All GitHub Tools**: https://api.githubcopilot.com/mcp/
- **Repositories**: https://api.githubcopilot.com/mcp/x/repos
- **Issues**: https://api.githubcopilot.com/mcp/x/issues
- **Pull Requests**: https://api.githubcopilot.com/mcp/x/pull_requests
- **Actions**: https://api.githubcopilot.com/mcp/x/actions
- **Notifications**: https://api.githubcopilot.com/mcp/x/notifications

### Additional Services
- **Organizations**: https://api.githubcopilot.com/mcp/x/orgs
- **Users**: https://api.githubcopilot.com/mcp/x/users
- **Gists**: https://api.githubcopilot.com/mcp/x/gists
- **Discussions**: https://api.githubcopilot.com/mcp/x/discussions
- **Dependabot**: https://api.githubcopilot.com/mcp/x/dependabot
- **Code Security**: https://api.githubcopilot.com/mcp/x/code_security
- **Secret Protection**: https://api.githubcopilot.com/mcp/x/secret_protection
- **Experiments**: https://api.githubcopilot.com/mcp/x/experiments
- **Copilot**: https://api.githubcopilot.com/mcp/x/copilot

## Quick Start

1. **Start local servers:**
   ```bash
   ./start-mcp-servers.sh
   ```

2. **Start SQLite MCP Docker container:**
   ```bash
   docker run -d -p 3001:3001 --name sqlite-mcp-server arungupta/sqlite-mcp-server
   ```

3. **Check status:**
   ```bash
   ./status-mcp-servers.sh
   ```

4. **Stop local servers:**
   ```bash
   ./stop-mcp-servers.sh
   ```

5. **Stop SQLite MCP Docker container:**
   ```bash
   docker stop sqlite-mcp-server
   ```

## Usage with Postman

The MCP Integration collection in LLM Lab is configured to use these servers:

- HTTP Filesystem Server: `http://localhost:3002`
- SQLite Server: `http://localhost:3001`
- Remote GitHub Servers: `https://api.githubcopilot.com/mcp/` (and variants)

## Authentication

- **Local Servers**: No authentication required
- **Remote GitHub Servers**: Uses GitHub authentication (your GitHub account)

## Troubleshooting

- Check local logs: `tail -f http-filesystem-mcp-server.log`
- Check local ports: `lsof -i :3002`
- Check Docker container: `docker ps | grep sqlite-mcp-server`
- Restart local server: `./stop-mcp-servers.sh && ./start-mcp-servers.sh`
- Restart Docker container: `docker restart sqlite-mcp-server`
- Remote servers are always available and don't require local setup

## More Information

- [GitHub MCP Server Documentation](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
