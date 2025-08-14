'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiKeyStatus {
  openai: 'configured' | 'missing' | 'invalid' | 'loading';
  anthropic: 'configured' | 'missing' | 'invalid' | 'loading';
  postman: 'configured' | 'missing' | 'invalid' | 'loading';
}

interface ApiKeyStatusIndicatorProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
  refreshTrigger?: number; // Add this to allow parent to trigger refresh
}

export function ApiKeyStatusIndicator({ onStatusChange, refreshTrigger }: ApiKeyStatusIndicatorProps) {
  const [status, setStatus] = useState<ApiKeyStatus>({
    openai: 'loading',
    anthropic: 'loading',
    postman: 'loading'
  });

  useEffect(() => {
    let mounted = true;
    
    const checkApiKeys = async () => {
      try {
        const response = await fetch('/api/config/keys');
        const data = await response.json();
        
        if (!mounted) return;
        
        const newStatus: ApiKeyStatus = {
          openai: data.openai ? 'configured' : 'missing',
          anthropic: data.anthropic ? 'configured' : 'missing',
          postman: data.postman ? 'configured' : 'missing'
        };
        
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to check API keys:', error);
        setStatus({
          openai: 'missing',
          anthropic: 'missing',
          postman: 'missing'
        });
      }
    };

    // Check once on mount
    checkApiKeys();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [refreshTrigger]); // Only re-run when refreshTrigger changes

  const getStatusIcon = (keyStatus: string) => {
    switch (keyStatus) {
      case 'configured':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (keyStatus: string) => {
    switch (keyStatus) {
      case 'configured':
        return 'Configured';
      case 'missing':
        return 'Missing';
      case 'invalid':
        return 'Invalid';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-3 py-2">
      {/* OpenAI */}
      <div className="flex items-center space-x-2" title={`OpenAI: ${getStatusText(status.openai)}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs font-medium text-gray-700">OpenAI</span>
        {getStatusIcon(status.openai)}
      </div>
      
      {/* Anthropic */}
      <div className="flex items-center space-x-2" title={`Anthropic: ${getStatusText(status.anthropic)}`}>
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-xs font-medium text-gray-700">Anthropic</span>
        {getStatusIcon(status.anthropic)}
      </div>
      
      {/* Postman */}
      <div className="flex items-center space-x-2" title={`Postman: ${getStatusText(status.postman)}`}>
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-xs font-medium text-gray-700">Postman</span>
        {getStatusIcon(status.postman)}
      </div>
    </div>
  );
}
