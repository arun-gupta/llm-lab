'use client';

import { useState } from 'react';
import { LLMResponse } from '@/lib/llm-apis';
import { Copy, Check, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseCardProps {
  response: LLMResponse;
  prompt: string;
  context?: string;
}

export function ResponseCard({ response, prompt, context }: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  // Debug logging to see what ResponseCard receives
  console.log('=== ResponseCard Debug ===');
  console.log('Response object:', response);
  console.log('Provider:', response.provider);
  console.log('Content:', response.content);
  console.log('Content type:', typeof response.content);
  console.log('Content length:', response.content?.length);
  console.log('Has error:', !!response.error);
  console.log('========================');



  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getProviderColor = (provider: string) => {
    const lowerProvider = provider.toLowerCase();
    if (lowerProvider.includes('openai')) return 'border-green-200 bg-green-50';
    if (lowerProvider.includes('anthropic')) return 'border-blue-200 bg-blue-50';
    if (lowerProvider.includes('cohere')) return 'border-purple-200 bg-purple-50';
    if (lowerProvider.includes('mistral')) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getProviderIcon = (provider: string) => {
    const lowerProvider = provider.toLowerCase();
    if (lowerProvider.includes('openai')) return '🤖';
    if (lowerProvider.includes('anthropic')) return '🧠';
    if (lowerProvider.includes('cohere')) return '⚡';
    if (lowerProvider.includes('mistral')) return '🌪️';
    if (lowerProvider.includes('ollama')) return '🦙';
    return '🤖';
  };

  return (
    <div className={cn(
      'border rounded-lg p-6 shadow-sm transition-all hover:shadow-md',
      getProviderColor(response.provider)
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getProviderIcon(response.provider)}</span>
          <h3 className="font-bold text-xl text-gray-900">{response.provider}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {response.error ? (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Success</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {!response.error && (
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{response.latency}ms</span>
          </div>
          {response.tokens && (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>{response.tokens.total} tokens</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        {response.error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{response.error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {response.content}
              </pre>
            </div>
            {response.truncationWarning && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-yellow-800 text-sm">{response.truncationWarning}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 