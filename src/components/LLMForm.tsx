'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Loader2, Lightbulb, PenTool, Code, TrendingUp, FileText, BarChart3, GraduationCap } from 'lucide-react';
import { ProviderSelector } from './ProviderSelector';
import { ResponseCard } from './ResponseCard';
import { ResponseTabs } from './ResponseTabs';
import { LLMResponse } from '@/lib/llm-apis';

interface FormData {
  prompt: string;
  context: string;
}

interface LLMFormProps {
  onResponsesChange: (responses: LLMResponse[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  onProvidersChange?: (providers: string[]) => void;
  onFormDataChange?: (data: { prompt: string; context?: string }) => void;
}

export function LLMForm({ onResponsesChange, onLoadingChange, onProvidersChange, onFormDataChange }: LLMFormProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  // Check for Ollama models on mount and set default providers
  useEffect(() => {
    const checkOllamaModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        const data = await response.json();
        const models = data.models || [];
        setOllamaModels(models.map((model: any) => model.name));
        
        // Set default providers based on available Ollama models
        if (models.length > 0) {
          // Use "All Local" if Ollama models are available
          const allLocalModels = models.map((model: any) => `ollama:${model.name}`);
          setSelectedProviders(allLocalModels);
          onProvidersChange?.(allLocalModels);
        } else {
          // Fallback to a single cloud provider if no Ollama models
          setSelectedProviders(['openai:gpt-5-mini', 'anthropic:claude-3-5-haiku-20241022']);
          onProvidersChange?.(['openai:gpt-5-mini', 'anthropic:claude-3-5-haiku-20241022']);
        }
      } catch (error) {
        console.log('Ollama not available, using cloud provider as default');
        // Fallback to a single cloud provider if Ollama is not available
        setSelectedProviders(['openai:gpt-5-mini', 'anthropic:claude-3-5-haiku-20241022']);
        onProvidersChange?.(['openai:gpt-5-mini', 'anthropic:claude-3-5-haiku-20241022']);
      } finally {
        setIsInitialized(true);
      }
    };

    checkOllamaModels();
  }, [onProvidersChange]);

  const handleProvidersChange = (providers: string[]) => {
    setSelectedProviders(providers);
    onProvidersChange?.(providers);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<FormData>();

  // Watch the prompt field to clear errors when user types
  const promptValue = watch('prompt');
  
  // Clear prompt error when user starts typing
  useEffect(() => {
    if (promptValue && promptValue.trim().length > 0 && errors.prompt) {
      clearErrors('prompt');
    }
  }, [promptValue, errors.prompt, clearErrors]);

  // Sample prompts for quick testing with icons
  const samplePrompts = [
    {
      title: "Creative Writing",
      prompt: "Write a short story about a robot discovering emotions for the first time.",
      context: "The story should be suitable for young adults and have a hopeful ending.",
      icon: PenTool,
      color: "text-purple-600"
    },
    {
      title: "Code Explanation",
      prompt: "Explain async/await in JavaScript with a simple example.",
      context: "Assume the reader is familiar with basic JavaScript but new to asynchronous programming.",
      icon: Code,
      color: "text-blue-600"
    },
    {
      title: "Business Analysis",
      prompt: "Key factors for launching a SaaS product in 2024.",
      context: "Focus on market research, pricing strategies, and customer acquisition.",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Technical Documentation",
      prompt: "Write API documentation for a user authentication endpoint.",
      context: "Include request/response examples, error codes, and security considerations.",
      icon: FileText,
      color: "text-orange-600"
    },
    {
      title: "Data Analysis",
      prompt: "Analyze remote work pros and cons for software development teams.",
      context: "Consider productivity, collaboration, work-life balance, and company culture.",
      icon: BarChart3,
      color: "text-indigo-600"
    },
    {
      title: "Educational Content",
      prompt: "Explain quantum computing in simple terms for high school students.",
      context: "Use analogies and avoid complex mathematical formulas.",
      icon: GraduationCap,
      color: "text-red-600"
    }
  ];

  const loadSamplePrompt = (sample: typeof samplePrompts[0]) => {
    setValue('prompt', sample.prompt);
    setValue('context', sample.context);
  };

  const onSubmit = async (data: FormData) => {
    if (selectedProviders.length === 0) {
      setError('Please select at least one provider');
      return;
    }

    setFormData(data);
    setIsLoading(true);
    onLoadingChange?.(true);
    onFormDataChange?.(data);
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
      console.log('LLMForm received response:', result);
      console.log('Responses array:', result.responses);
      console.log('Response count:', result.responses?.length);
      result.responses?.forEach((resp: any, index: number) => {
        console.log(`Response ${index}:`, {
          provider: resp.provider,
          content: resp.content?.substring(0, 100) + '...',
          contentLength: resp.content?.length,
          hasError: !!resp.error,
          fullContent: resp.content
        });
      });
      
      setResponses(result.responses);
      onResponsesChange(result.responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="bg-white rounded-lg border border-gray-200 p-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <ProviderSelector 
          selectedProviders={selectedProviders} 
          onProvidersChange={handleProvidersChange}
          ollamaModels={ollamaModels}
          isInitialized={isInitialized}
        />

        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Prompt *
          </label>
          <textarea
            id="prompt"
            {...register('prompt', { 
              required: 'Prompt is required',
              validate: (value) => value.trim().length > 0 || 'Prompt is required'
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            placeholder="Enter your prompt here or try a sample below..."
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
          )}
        </div>

        {/* Context Input */}
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
            Context (Optional)
          </label>
          <textarea
            id="context"
            {...register('context')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            placeholder="Add any context or background information that should be included with your prompt..."
          />
        </div>

        {/* Sample Prompts */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Try Sample Prompts</h3>
              <p className="text-xs text-gray-600">Click any card to load a sample prompt</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {(showAllPrompts ? samplePrompts : samplePrompts.slice(0, 3)).map((sample, index) => {
              const IconComponent = sample.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => loadSamplePrompt(sample)}
                  className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-3 mb-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sample.color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center`}>
                        <IconComponent className={`w-4 h-4 ${sample.color}`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                        {sample.title}
                      </h4>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {sample.prompt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Show More/Less Button */}
          {samplePrompts.length > 3 && (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={() => setShowAllPrompts(!showAllPrompts)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>{showAllPrompts ? 'Show Less' : 'Show More'}</span>
                <div className={`w-4 h-4 transition-transform duration-200 ${showAllPrompts ? 'rotate-180' : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
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


    </div>
  );
} 