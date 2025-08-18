'use client';

import { useState, useEffect } from 'react';
import { X, Save, Server, Database, FileText, Github } from 'lucide-react';

interface MCPSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: () => void;
}

interface GitHubSettings {
  reposCount: number;
}

interface TokenLimits {
  gpt5Streaming: number;
  gpt5NonStreaming: number;
  otherModels: number;
}

export function MCPSettingsPanel({ isOpen, onClose, onConfigChange }: MCPSettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [githubSettings, setGithubSettings] = useState<GitHubSettings>({
    reposCount: 5
  });
  const [tokenLimits, setTokenLimits] = useState<TokenLimits>({
    gpt5Streaming: 2000,
    gpt5NonStreaming: 500,
    otherModels: 1000
  });

  const loadGitHubSettings = async () => {
    try {
      const response = await fetch('/api/github/settings');
      if (response.ok) {
        const settings = await response.json();
        setGithubSettings({
          reposCount: settings.reposCount || 5
        });
      }
    } catch (error) {
      console.log('No existing GitHub settings found, using defaults');
    }
  };

  const loadTokenLimits = async () => {
    try {
      const response = await fetch('/api/config/token-limits');
      if (response.ok) {
        const limits = await response.json();
        setTokenLimits({
          gpt5Streaming: limits.gpt5Streaming || 2000,
          gpt5NonStreaming: limits.gpt5NonStreaming || 500,
          otherModels: limits.otherModels || 1000
        });
      }
    } catch (error) {
      console.log('No existing token limits found, using defaults');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      // Save GitHub settings
      const settingsResponse = await fetch('/api/github/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(githubSettings),
      });

      // Save token limits
      const tokenLimitsResponse = await fetch('/api/config/token-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenLimits),
      });

      if (settingsResponse.ok && tokenLimitsResponse.ok) {
        setSaveStatus('success');
        setStatusMessage('MCP settings saved successfully!');
        onConfigChange?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to save MCP settings');
      }
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('Failed to save MCP settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing settings on mount
  useEffect(() => {
    if (isOpen) {
      loadGitHubSettings();
      loadTokenLimits();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">MCP Settings</h2>
              <p className="text-sm text-gray-600">Configure Model Context Protocol settings and token limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* GitHub MCP Settings */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Github className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">GitHub MCP Settings</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-blue-700">
                  Number of Repositories to Fetch
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={githubSettings.reposCount}
                  onChange={(e) => setGithubSettings(prev => ({ ...prev, reposCount: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <p className="text-xs text-blue-600">
                Number of repositories to fetch when testing GitHub MCP integration (1-100)
              </p>
            </div>
          </div>

          {/* Token Limits Settings */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Token Limits</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-purple-700">
                    GPT-5 Streaming
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={tokenLimits.gpt5Streaming}
                    onChange={(e) => setTokenLimits(prev => ({ ...prev, gpt5Streaming: parseInt(e.target.value) || 2000 }))}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <p className="text-xs text-purple-600">
                  Token limit for GPT-5 models using streaming (100-4000)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-purple-700">
                    GPT-5 Non-Streaming
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    value={tokenLimits.gpt5NonStreaming}
                    onChange={(e) => setTokenLimits(prev => ({ ...prev, gpt5NonStreaming: parseInt(e.target.value) || 500 }))}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <p className="text-xs text-purple-600">
                  Token limit for GPT-5 models without streaming (50-2000)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-purple-700">
                    Other Models
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={tokenLimits.otherModels}
                    onChange={(e) => setTokenLimits(prev => ({ ...prev, otherModels: parseInt(e.target.value) || 1000 }))}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <p className="text-xs text-purple-600">
                  Token limit for other models (GPT-4, Claude, etc.) (100-4000)
                </p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-lg border ${
              saveStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              saveStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
