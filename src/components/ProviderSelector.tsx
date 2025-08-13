'use client';

import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'api' | 'local';
  models: ModelOption[];
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  cost: 'low' | 'medium' | 'high';
}

interface OllamaModel {
  name: string;
  model: string;
  size: number;
}

interface ProviderSelectorProps {
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
}

const staticProviders: Provider[] = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: '🤖', 
    color: 'border-green-200 bg-green-50', 
    type: 'api',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal flagship model', cost: 'high' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Affordable, intelligent small model', cost: 'low' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation flagship', cost: 'high' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast, inexpensive model', cost: 'low' },
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    icon: '🧠', 
    color: 'border-blue-200 bg-blue-50', 
    type: 'api',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Most intelligent model', cost: 'high' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fastest model', cost: 'low' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Powerful model for complex tasks', cost: 'high' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and cost-effective', cost: 'low' },
    ]
  },
];

export function ProviderSelector({ 
  selectedProviders, 
  onProvidersChange
}: ProviderSelectorProps) {
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [isLoadingOllama, setIsLoadingOllama] = useState(true);

  // Fetch available Ollama models on component mount
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        const data = await response.json();
        setOllamaModels(data.models || []);
      } catch (error) {
        console.log('Ollama not available:', error);
        setOllamaModels([]);
      } finally {
        setIsLoadingOllama(false);
      }
    };

    fetchOllamaModels();
  }, []);

  // Group models by provider for compact display
  const providerGroups = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      models: staticProviders.find(p => p.id === 'openai')?.models || []
    },
    {
      id: 'anthropic', 
      name: 'Anthropic',
      icon: '🧠',
      models: staticProviders.find(p => p.id === 'anthropic')?.models || []
    }
  ];

  const ollamaProviders = ollamaModels.map(model => ({
    id: `ollama:${model.name}`,
    name: `${model.name}`,
    icon: '🦙',
    color: 'border-purple-200 bg-purple-50',
    type: 'local' as const,
    cost: 'low' as const,
    description: model.size_vram ? `${(model.size_vram / (1024 * 1024 * 1024)).toFixed(1)}GB VRAM` : 'Running'
  }));

  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onProvidersChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onProvidersChange([...selectedProviders, providerId]);
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectAll = () => {
    onProvidersChange(allProviders.map(p => p.id));
  };

  const selectNone = () => {
    onProvidersChange([]);
  };

  // Preconfigured model combinations
  const modelCombos = [
    {
      name: "Budget",
      description: "Fast, cost-effective models",
      models: ["openai:gpt-4o-mini", "anthropic:claude-3-haiku-20240307"]
    },
    {
      name: "Premium", 
      description: "Best performance models",
      models: ["openai:gpt-4o", "anthropic:claude-3-5-sonnet-20241022"]
    },
    {
      name: "Local vs Cloud",
      description: "Compare local Ollama with cloud APIs",
      models: ollamaModels.length > 0 
        ? ["openai:gpt-4o-mini", `ollama:${ollamaModels[0].name}`]
        : ["openai:gpt-4o-mini", "anthropic:claude-3-haiku-20240307"]
    },
    {
      name: "All Local",
      description: "Test all running Ollama models",
      models: ollamaModels.length > 0 
        ? ollamaModels.map(model => `ollama:${model.name}`)
        : []
    },
    {
      name: "OpenAI Compare",
      description: "Compare OpenAI models",
      models: ["openai:gpt-4o", "openai:gpt-4o-mini"]
    },
    {
      name: "Anthropic Compare",
      description: "Compare Anthropic models", 
      models: ["anthropic:claude-3-5-sonnet-20241022", "anthropic:claude-3-haiku-20240307"]
    }
  ];

  const selectCombo = (combo: typeof modelCombos[0]) => {
    onProvidersChange(combo.models);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Select LLM Providers
          </label>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>Cost:</span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full">low</span>
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">high</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Quick Combos */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Quick Combos:</label>
        <div className="flex flex-wrap gap-2">
          {modelCombos
            .filter(combo => combo.name !== "All Local" || ollamaModels.length > 0)
            .map((combo) => (
            <button
              key={combo.name}
              onClick={() => selectCombo(combo)}
              className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full transition-colors"
              title={combo.description}
            >
              {combo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud-Based Models */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cloud-Based Models</h4>
        </div>
        <div className="space-y-3">
          {providerGroups.map((providerGroup) => (
            <div key={providerGroup.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{providerGroup.icon}</span>
                <span className="font-medium text-gray-900">{providerGroup.name}</span>
              </div>
              <div className="space-y-2 ml-6">
                {providerGroup.models.map((model) => {
                  const modelId = `${providerGroup.id}:${model.id}`;
                  return (
                    <label
                      key={modelId}
                      className={`
                        flex items-center justify-between p-2 border rounded cursor-pointer transition-all text-sm
                        ${selectedProviders.includes(modelId) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(modelId)}
                          onChange={() => toggleProvider(modelId)}
                          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900">{model.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ml-2 flex-shrink-0 ${getCostColor(model.cost)}`}>
                        {model.cost}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Running Local Models (Ollama) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Running Models (Ollama)</h4>
          </div>
          {isLoadingOllama && (
            <div className="text-xs text-gray-500">Checking...</div>
          )}
        </div>
        
        {ollamaModels.length === 0 && !isLoadingOllama ? (
          <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <p className="mb-1">No running Ollama models found.</p>
            <p className="text-xs">Start a model: <code className="bg-gray-200 px-1 rounded">ollama run llama3.2</code></p>
          </div>
        ) : (
          <div className="space-y-2">
            {ollamaProviders.map((provider) => (
              <label
                key={provider.id}
                className={`
                  flex items-center justify-between p-2 border rounded cursor-pointer transition-all text-sm
                  ${selectedProviders.includes(provider.id) 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider.id)}
                    onChange={() => toggleProvider(provider.id)}
                    className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
                  />
                  <span className="text-lg flex-shrink-0">{provider.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-gray-900">{provider.name}</span>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" title="Running"></div>
                    </div>
                    <p className="text-xs text-gray-500">{provider.description}</p>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 text-xs rounded-full ml-2 flex-shrink-0 ${getCostColor(provider.cost)}`}>
                  {provider.cost}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {selectedProviders.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          Please select at least one provider
        </p>
      )}
    </div>
  );
} 