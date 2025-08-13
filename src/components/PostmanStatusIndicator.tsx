'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PostmanStatusIndicatorProps {
  onStatusChange?: (configured: boolean) => void;
}

export function PostmanStatusIndicator({ onStatusChange }: PostmanStatusIndicatorProps) {
  const [status, setStatus] = useState<'loading' | 'configured' | 'not-configured' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkPostmanStatus();
  }, []);

  const checkPostmanStatus = async () => {
    try {
      const response = await fetch('/api/postman/status');
      const data = await response.json();
      
      if (data.configured) {
        setStatus('configured');
        setMessage('Postman API key is configured');
        onStatusChange?.(true);
      } else {
        setStatus('not-configured');
        setMessage(data.message || 'Postman API key not configured');
        onStatusChange?.(false);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error checking Postman status');
      onStatusChange?.(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      case 'configured':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'not-configured':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Checking Postman status...';
      case 'configured':
        return 'Postman API configured';
      case 'not-configured':
        return 'Postman API not configured';
      case 'error':
        return 'Error checking status';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className={status === 'configured' ? 'text-green-700' : 'text-gray-600'}>
          {getStatusText()}
        </span>
      </div>
      {status === 'configured' && (
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </div>
  );
}
