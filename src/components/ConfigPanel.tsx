'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Save, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: () => void;
}

interface ApiKeys {
  openai: string;
  anthropic: string;
  postman: string;
}

export function ConfigPanel({ isOpen, onClose, onConfigChange }: ConfigPanelProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    postman: ''
  });
  const [showKeys, setShowKeys] = useState<{ [key in keyof ApiKeys]: boolean }>({
    openai: false,
    anthropic: false,
    postman: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState<{ [key in keyof ApiKeys]: boolean }>({
    openai: false,
    anthropic: false,
    postman: false
  });

  // Load existing API keys on mount
  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen]);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/config/keys');
      if (response.ok) {
        const keys = await response.json();
        setApiKeys({
          openai: keys.openai || '',
          anthropic: keys.anthropic || '',
          postman: keys.postman || ''
        });
      }
    } catch (error) {
      console.log('No existing API keys found');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      const response = await fetch('/api/config/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeys),
      });

      if (response.ok) {
        setSaveStatus('success');
        setStatusMessage('API keys saved successfully!');
        onConfigChange?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to save API keys');
      }
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('Failed to save API keys. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleKeyVisibility = (key: keyof ApiKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = async (key: keyof ApiKeys) => {
    const keyValue = apiKeys[key];
    if (!keyValue) return;

    try {
      await navigator.clipboard.writeText(keyValue);
      setCopyStatus(prev => ({
        ...prev,
        [key]: true
      }));
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [key]: false
        }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getKeyStatus = (key: string, type: 'openai' | 'anthropic' | 'postman') => {
    if (!key) return 'missing';
    
    switch (type) {
      case 'openai':
        return key.startsWith('sk-') ? 'valid' : 'invalid';
      case 'anthropic':
        return key.startsWith('sk-ant-') ? 'valid' : 'invalid';
      case 'postman':
        // Postman API keys can have various formats, so we'll be more lenient
        return key.length > 10 ? 'valid' : 'invalid';
      default:
        return 'invalid';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Valid key';
      case 'invalid':
        return 'Invalid format';
      default:
        return 'Not configured';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
              <p className="text-sm text-gray-600">Configure your API keys for LLM providers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* OpenAI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                OpenAI API Key
              </label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getKeyStatus(apiKeys.openai, 'openai'))}
                <span className="text-xs text-gray-500">
                  {getStatusText(getKeyStatus(apiKeys.openai, 'openai'))}
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={apiKeys.openai}
                onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {apiKeys.openai && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard('openai')}
                    className={`p-1 rounded transition-colors ${
                      copyStatus.openai 
                        ? 'text-green-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copyStatus.openai ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('openai')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
            </p>
          </div>

          {/* Anthropic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Anthropic API Key
              </label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getKeyStatus(apiKeys.anthropic, 'anthropic'))}
                <span className="text-xs text-gray-500">
                  {getStatusText(getKeyStatus(apiKeys.anthropic, 'anthropic'))}
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                type={showKeys.anthropic ? 'text' : 'password'}
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {apiKeys.anthropic && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard('anthropic')}
                    className={`p-1 rounded transition-colors ${
                      copyStatus.anthropic 
                        ? 'text-green-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copyStatus.anthropic ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('anthropic')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Get your key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a>
            </p>
          </div>

          {/* Postman */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Postman API Key (Optional)
              </label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(getKeyStatus(apiKeys.postman, 'postman'))}
                <span className="text-xs text-gray-500">
                  {getStatusText(getKeyStatus(apiKeys.postman, 'postman'))}
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                type={showKeys.postman ? 'text' : 'password'}
                value={apiKeys.postman}
                onChange={(e) => setApiKeys(prev => ({ ...prev, postman: e.target.value }))}
                placeholder="PMAK-..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {apiKeys.postman && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard('postman')}
                    className={`p-1 rounded transition-colors ${
                      copyStatus.postman 
                        ? 'text-green-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copyStatus.postman ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('postman')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.postman ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Get your key from <a href="https://www.postman.com/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Postman Settings</a>
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-md ${
              saveStatus === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {saveStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
