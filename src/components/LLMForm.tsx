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
          setSelectedProviders(['openai:gpt-5-mini', 'anthropic:claude-4-haiku-20241022']);
          onProvidersChange?.(['openai:gpt-5-mini', 'anthropic:claude-4-haiku-20241022']);
        }
      } catch (error) {
        console.log('Ollama not available, using cloud provider as default');
        // Fallback to a single cloud provider if Ollama is not available
        setSelectedProviders(['openai:gpt-5-mini', 'anthropic:claude-4-haiku-20241022']);
        onProvidersChange?.(['openai:gpt-5-mini', 'anthropic:claude-4-haiku-20241022']);
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
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Try Sample Prompts</h3>
              <p className="text-sm text-gray-600">Click any card to load a sample prompt</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samplePrompts.map((sample, index) => {
              const IconComponent = sample.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => loadSamplePrompt(sample)}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-2 text-left"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sample.color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center shadow-sm`}>
                        <IconComponent className={`w-6 h-6 ${sample.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors leading-tight">
                          {sample.title}
                        </h4>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {sample.prompt}
                    </p>
                    
                    {/* Call to action */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to try →
                      </span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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