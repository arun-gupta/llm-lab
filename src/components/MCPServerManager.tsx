'use client';

import { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Server, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

// Default port configuration (will be overridden by API)
const DEFAULT_MCP_PORTS = {
  sqlite: 3001,
  filesystem: 3002
};

interface MCPServer {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  description: string;
  type: 'remote' | 'local';
  docker?: boolean;
}

interface MCPServerManagerProps {
  className?: string;
  onClose?: () => void;
}

export function MCPServerManager({ className = '', onClose }: MCPServerManagerProps) {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      name: 'GitHub MCP',
      port: 0, // Remote server, no local port
      status: 'running',
      description: 'Fast repository analysis with user repos, issues, PRs, and health reports',
      type: 'remote'
    },
    {
      name: 'Filesystem MCP',
      port: DEFAULT_MCP_PORTS.filesystem,
      status: 'stopped',
      description: 'Official MCP server with HTTP wrapper for Postman integration',
      type: 'local'
    },
    {
      name: 'SQLite MCP',
      port: DEFAULT_MCP_PORTS.sqlite,
      status: 'stopped',
      description: 'Database operations with Docker HTTP mode for Postman integration',
      type: 'local',
      docker: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Add Esc key listener for closing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const checkServerStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mcp/status');
      if (response.ok) {
        const statusData = await response.json();
        
        // Update local servers with status from API, keep GitHub MCP as always running
        setServers(prevServers => 
          prevServers.map(server => {
            if (server.name === 'GitHub MCP') {
              // GitHub MCP is always running (remote server)
              return { ...server, status: 'running' as const };
            } else {
              // Find matching local server by port
              const localServer = Object.values(statusData).find((s: any) => s.port === server.port);
              return {
                ...server,
                status: localServer?.status || 'stopped',
                pid: localServer?.pid
              };
            }
          })
        );
      }
    } catch (error) {
      console.log('MCP servers not running or status check failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startAllServers = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/mcp/start', { method: 'POST' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Local MCP servers started successfully!' });
        // Wait a moment then check status
        setTimeout(checkServerStatus, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to start local MCP servers' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error starting MCP servers' });
    } finally {
      setIsLoading(false);
    }
  };

  const stopAllServers = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/mcp/stop', { method: 'POST' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Local MCP servers stopped successfully!' });
        // Wait a moment then check status
        setTimeout(checkServerStatus, 1000);
      } else {
        setMessage({ type: 'error', text: 'Failed to stop local MCP servers' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error stopping MCP servers' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stopped':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'stopped':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MCP Server Management</h3>
            <p className="text-sm text-gray-600">Manage Model Context Protocol servers for enhanced Postman integration</p>
          </div>
        </div>
        <button
          onClick={checkServerStatus}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* MCP Server Status */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">MCP Servers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {servers.map((server) => (
            <div key={server.port} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(server.status)}
                    <h4 className="font-medium text-gray-900">{server.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{server.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {server.type === 'remote' ? (
                      <span className="text-purple-600 font-medium">Remote Server</span>
                    ) : (
                      <>
                        <span>Port: {server.port}</span>
                        {server.docker && <span className="text-blue-600 font-medium">🐳 Docker</span>}
                        {server.pid && <span>PID: {server.pid}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                  {getStatusText(server.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={startAllServers}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>Start Local Servers</span>
        </button>
        
        <button
          onClick={stopAllServers}
          disabled={isLoading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Square className="w-4 h-4" />
          <span>Stop Local Servers</span>
        </button>
      </div>

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 MCP Server Information</h4>
        <p className="text-sm text-blue-800 mb-3">
          Local MCP server infrastructure is automatically installed during project setup. If it's missing:
        </p>
        <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
          npm run setup-mcp
        </div>
        <p className="text-xs text-blue-700 mt-2">
          <strong>SQLite MCP Server:</strong> Requires Docker - Run: <code className="bg-gray-200 px-1 rounded">docker run -p 3001:3001 arungupta/sqlite-mcp-server</code>
        </p>
        <p className="text-xs text-blue-700 mt-1">
          <strong>Filesystem MCP Server:</strong> Run: <code className="bg-gray-200 px-1 rounded">./scripts/setup-http-filesystem-mcp.sh</code>
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Remote GitHub MCP servers are always available and don't require local installation.
        </p>
        <p className="text-xs text-blue-700 mt-1">
          <a href="https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md" 
             target="_blank" 
             rel="noopener noreferrer"
             className="underline hover:text-blue-600">
            View GitHub MCP Server Documentation →
          </a>
        </p>
      </div>
    </div>
  );
}
