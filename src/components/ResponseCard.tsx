'use client';

import { useState } from 'react';
import { LLMResponse } from '@/lib/llm-apis';
import { generatePostmanCollection, generatePostmanEnvironment } from '@/lib/postman';
import { Download, Copy, Check, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CollectionPreview } from './CollectionPreview';

interface ResponseCardProps {
  response: LLMResponse;
  prompt: string;
  context?: string;
}

export function ResponseCard({ response, prompt, context }: ResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showCollectionPreview, setShowCollectionPreview] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const createPostmanCollectionForResponse = async () => {
    // Show preview first
    setShowCollectionPreview(true);
  };

  const handleConfirmCollectionCreation = async (createInWeb: boolean = true, collectionName?: string, collection?: any, environment?: any) => {
    setIsCreatingCollection(true);
    try {
      // Use provided collection and environment, or generate them
      const finalCollection = collection || generatePostmanCollection(prompt, context, [response], collectionName);
      const finalEnvironment = environment || generatePostmanEnvironment(collectionName || 'LLM Prompt Lab Collection');
      
      const apiResponse = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          collection: finalCollection,
          environment: finalEnvironment,
          createInWeb 
        }),
      });

      const result = await apiResponse.json();
      
      if (result.success) {
        if (createInWeb) {
          // Open in web browser
          window.open(result.collectionUrl, '_blank');
        } else {
          // For desktop, use the postman:// URL scheme
          window.open(result.collectionUrl, '_blank');
        }
        setShowCollectionPreview(false);
      } else {
        // Fallback to download if API key not configured
        const blob = new Blob([JSON.stringify(collection, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${response.provider}-collection.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowCollectionPreview(false);
      }
    } catch (error) {
      console.error('Failed to create Postman collection:', error);
      // Fallback to download on error
      const collection = generatePostmanCollection(prompt, context, [response]);
      const blob = new Blob([JSON.stringify(collection, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${response.provider}-collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowCollectionPreview(false);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'border-green-200 bg-green-50';
      case 'anthropic':
        return 'border-blue-200 bg-blue-50';
      case 'cohere':
        return 'border-purple-200 bg-purple-50';
      case 'mistral':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'cohere':
        return '⚡';
      case 'mistral':
        return '🌪️';
      default:
        return '🤖';
    }
  };

  return (
    <div className={cn(
      'border rounded-lg p-6 shadow-sm transition-all hover:shadow-md',
      getProviderColor(response.provider)
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getProviderIcon(response.provider)}</span>
          <h3 className="font-semibold text-lg">{response.provider}</h3>
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
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {response.content}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

        <button
          onClick={createPostmanCollectionForResponse}
          disabled={downloading || !!response.error}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Creating...' : 'Create in Postman'}</span>
        </button>
      </div>

      {/* Collection Preview */}
      <CollectionPreview
        isOpen={showCollectionPreview}
        onClose={() => setShowCollectionPreview(false)}
        onConfirm={handleConfirmCollectionCreation}
        prompt={prompt}
        context={context}
        responses={[response]}
        isCreating={isCreatingCollection}
      />
    </div>
  );
} 