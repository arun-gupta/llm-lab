'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2 } from 'lucide-react';
import { ProviderSelector } from './ProviderSelector';
import { ResponseCard } from './ResponseCard';
import { LLMResponse } from '@/lib/llm-apis';

interface FormData {
  prompt: string;
  context: string;
}

interface LLMFormProps {
  onResponsesChange: (responses: LLMResponse[]) => void;
}

export function LLMForm({ onResponsesChange }: LLMFormProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai']);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (selectedProviders.length === 0) {
      setError('Please select at least one provider');
      return;
    }

    setFormData(data);
    setIsLoading(true);
    setError(null);
    setResponses([]);

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: data.prompt,
          context: data.context || undefined,
          providers: selectedProviders,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get responses');
      }

      const result = await response.json();
      setResponses(result.responses);
      onResponsesChange(result.responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Provider Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <ProviderSelector
            selectedProviders={selectedProviders}
            onProvidersChange={setSelectedProviders}
          />
        </div>

        {/* Prompt Input */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Prompt *
          </label>
          <textarea
            id="prompt"
            {...register('prompt', { required: 'Prompt is required' })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your prompt here (e.g., 'Summarize this text', 'Explain quantum physics', etc.)"
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
          )}
        </div>

        {/* Context Input */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            Context (Optional)
          </label>
          <textarea
            id="context"
            {...register('context')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any context or background information that should be included with your prompt..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || selectedProviders.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit to {selectedProviders.length} Provider{selectedProviders.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Getting responses from {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''}...</p>
        </div>
      )}

      {/* Responses */}
      {responses.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Responses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {responses.map((response, index) => (
              <ResponseCard
                key={`${response.provider}-${index}`}
                response={response}
                prompt={formData?.prompt || ''}
                context={formData?.context || ''}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 