'use client';

import { useState, useEffect } from 'react';
import { X, Download, Code, Edit3, Save, Eye, FileText, Settings, Globe, Database } from 'lucide-react';

interface CollectionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (collection: any, collectionName: string, createInWeb: boolean) => void;
  collectionUrl: string;
}

export function CollectionPreviewModal({ isOpen, onClose, onDeploy, collectionUrl }: CollectionPreviewModalProps) {
  const [collection, setCollection] = useState<any>(null);
  const [collectionName, setCollectionName] = useState('MCP Integration Demo');
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'environment' | 'customize'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createInWeb, setCreateInWeb] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);

  useEffect(() => {
    if (isOpen && collectionUrl) {
      loadCollection();
      loadGitHubToken();
    }
  }, [isOpen, collectionUrl]);

  const loadGitHubToken = async () => {
    try {
      const response = await fetch('/api/github/token');
      if (response.ok) {
        const data = await response.json();
        if (data.configured && data.token) {
          setGithubToken(data.token);
        }
      }
    } catch (error) {
      console.log('Could not load GitHub token from .env.local:', error);
    }
  };

  const loadCollection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(collectionUrl);
      if (!response.ok) {
        throw new Error('Failed to load collection');
      }
      
      const collectionData = await response.json();
      setCollection(collectionData);
      setCollectionName(collectionData.info?.name || 'MCP Integration Demo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = () => {
    if (collection) {
      const updatedCollection = {
        ...collection,
        info: {
          ...collection.info,
          name: collectionName,
        },
      };
      
      // Show deployment in progress message
      const deployMessage = `🚀 Deploying "${collectionName}" to Postman ${createInWeb ? 'Web' : 'Desktop'}...`;
      alert(deployMessage);
      
      onDeploy(updatedCollection, collectionName, createInWeb, githubToken);
    }
  };

  const getRequestCount = () => {
    if (!collection?.item) return 0;
    return collection.item.reduce((count: number, item: any) => {
      if (item.item) {
        return count + item.item.length;
      }
      return count + 1;
    }, 0);
  };

  const getEnvironmentVariables = () => {
    if (!collection?.variable) return [];
    return collection.variable.map((variable: any) => ({
      key: variable.key,
      value: variable.value,
      description: variable.description || '',
      type: variable.type || 'string',
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Collection Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{collection?.info?.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 mb-2">Description:</span>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {collection?.info?.description || 'No description'}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Requests:</span>
            <span className="font-medium">{getRequestCount()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Environment Variables:</span>
            <span className="font-medium">{getEnvironmentVariables().length}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">MCP Server Integration</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>GitHub MCP Server Integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>File System Operations</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Web Search Capabilities</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Advanced Test Scripts</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Ready to Deploy</h4>
        <p className="text-sm text-green-800">
          This collection is ready to be deployed to Postman. It includes comprehensive MCP server integration 
          with pre-configured requests, environment variables, and test scripts.
        </p>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4">
      {collection?.item?.map((folder: any, folderIndex: number) => (
        <div key={folderIndex} className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <FolderIcon className="w-4 h-4" />
              <span>{folder.name}</span>
              <span className="text-sm text-gray-500">({folder.item?.length || 0} requests)</span>
            </h4>
          </div>
          <div className="p-4 space-y-3">
            {folder.item?.map((request: any, requestIndex: number) => (
              <div key={requestIndex} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getMethodColor(request.request?.method)}`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{request.name}</div>
                    <div className="text-sm text-gray-500">{request.request?.url?.raw || request.request?.url?.host?.join('/')}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {request.request?.method || 'GET'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEnvironment = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Environment Variables</h4>
        {getEnvironmentVariables().length > 0 ? (
          <div className="space-y-2">
            {getEnvironmentVariables().map((variable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{variable.key}</div>
                  <div className="text-sm text-gray-500">{variable.description}</div>
                </div>
                <div className="text-sm text-gray-400">
                  {variable.type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No environment variables configured</p>
        )}
      </div>
    </div>
  );

  const renderCustomize = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Customize Collection</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter collection name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showGithubToken ? "text" : "password"}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ghp_your_github_token_here"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showGithubToken ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {githubToken ? (
                  <span className="text-green-600">✅ Auto-loaded from .env.local</span>
                ) : (
                  <>
                    Required for GitHub MCP server integration. 
                    <a 
                      href="https://github.com/settings/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      Generate token →
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deployment Target
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={!createInWeb}
                  onChange={() => setCreateInWeb(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Postman Desktop</div>
                  <div className="text-sm text-gray-500">Create collection in Postman Desktop app</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked={createInWeb}
                  onChange={() => setCreateInWeb(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Postman Web</div>
                  <div className="text-sm text-gray-500">Create collection in Postman Web browser</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Deployment Summary</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Collection Name:</span>
            <span className="font-medium">{collectionName}</span>
          </div>
          <div className="flex justify-between">
            <span>Target:</span>
            <span className="font-medium">{createInWeb ? 'Postman Web' : 'Postman Desktop'}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Requests:</span>
            <span className="font-medium">{getRequestCount()}</span>
          </div>
          <div className="flex justify-between">
            <span>GitHub Token:</span>
            <span className={`font-medium ${githubToken ? 'text-green-700' : 'text-red-700'}`}>
              {githubToken ? '✅ Configured' : '❌ Not configured'}
            </span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> {createInWeb 
              ? 'Postman Web will open automatically in your browser after deployment.' 
              : 'Postman Desktop will attempt to open automatically after deployment. Make sure it\'s installed from postman.com/downloads/'
            }
          </p>
                       {!githubToken && (
               <p className="text-xs text-red-700 mt-2">
                 <strong>⚠️ Note:</strong> GitHub token is required for GitHub MCP server integration to work properly.
               </p>
             )}
             {githubToken && (
               <p className="text-xs text-green-700 mt-2">
                 <strong>✅ Ready:</strong> GitHub token is configured and ready for MCP server integration.
               </p>
             )}
        </div>
      </div>
    </div>
  );

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'bg-green-500';
      case 'POST': return 'bg-blue-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const FolderIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Collection Preview & Customize</h3>
              <p className="text-sm text-gray-600">Review and customize before deploying to Postman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Tabs */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Requests</span>
              </button>
              <button
                onClick={() => setActiveTab('environment')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'environment' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Environment</span>
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'customize' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Customize</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading collection...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-600 mb-4">❌</div>
                  <p className="text-gray-600">Error loading collection: {error}</p>
                  <button
                    onClick={loadCollection}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'requests' && renderRequests()}
                {activeTab === 'environment' && renderEnvironment()}
                {activeTab === 'customize' && renderCustomize()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = collectionUrl;
                link.download = `${collectionName}.json`;
                link.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={!collection || !collectionName.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Deploy to Postman</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
