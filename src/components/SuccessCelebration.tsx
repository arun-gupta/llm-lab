'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, Zap, FileText, Key } from 'lucide-react';

interface SuccessCelebrationProps {
  isVisible: boolean;
  type: 'collection-created' | 'api-key-setup' | 'first-response' | 'postman-connected';
  onClose: () => void;
  data?: {
    collectionUrl?: string;
    provider?: string;
    responseCount?: number;
    hasEnvironment?: boolean;
    environmentUrl?: string;
  };
}

export function SuccessCelebration({ isVisible, type, onClose, data }: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getCelebrationContent = () => {
    switch (type) {
      case 'collection-created':
        const hasEnvironment = data?.hasEnvironment;
        return {
          icon: <FileText className="w-6 h-6 text-green-600" />,
          title: hasEnvironment ? '🎉 Collection & Environment Created!' : '🎉 Collection Created!',
          message: hasEnvironment 
            ? 'Your Postman collection and environment have been created successfully. The environment is ready to use with placeholder API keys.'
            : 'Your Postman collection is ready to use',
          action: data?.collectionUrl ? {
            label: 'View Collection',
            url: data.collectionUrl,
            icon: <ExternalLink className="w-4 h-4" />
          } : undefined
        };
      case 'api-key-setup':
        return {
          icon: <Key className="w-6 h-6 text-blue-600" />,
          title: '🔑 Postman Connected!',
          message: 'Your API key is configured and ready',
          action: {
            label: 'Create Collection',
            onClick: () => onClose(),
            icon: <FileText className="w-4 h-4" />
          }
        };
      case 'first-response':
        return {
          icon: <Zap className="w-6 h-6 text-purple-600" />,
          title: '🚀 First Response Generated!',
          message: `Welcome to LLM Prompt Lab! You've generated your first response${data?.provider ? ` using ${data.provider}` : ''}`,
          action: {
            label: 'Create Postman Collection',
            onClick: () => onClose(),
            icon: <FileText className="w-4 h-4" />
          }
        };
      case 'postman-connected':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: '✅ Postman Integration Ready!',
          message: 'You can now create collections directly in your Postman workspace',
          action: {
            label: 'Try It Now',
            onClick: () => onClose(),
            icon: <Zap className="w-4 h-4" />
          }
        };
      default:
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: '🎉 Success!',
          message: 'Operation completed successfully',
          action: undefined
        };
    }
  };

  const content = getCelebrationContent();

  if (!isVisible) return null;

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Toast */}
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {content.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {content.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {content.message}
              </p>
              {content.action && (
                <div className="flex space-x-2">
                  {content.action.url ? (
                    <a
                      href={content.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {content.action.icon}
                      <span>{content.action.label}</span>
                    </a>
                  ) : content.action.onClick ? (
                    <button
                      onClick={content.action.onClick}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {content.action.icon}
                      <span>{content.action.label}</span>
                    </button>
                  ) : null}
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
