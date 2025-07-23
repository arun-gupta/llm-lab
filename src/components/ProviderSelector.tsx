'use client';

interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ProviderSelectorProps {
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
}

const providers: Provider[] = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: 'border-green-200 bg-green-50' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', color: 'border-blue-200 bg-blue-50' },
];

export function ProviderSelector({ selectedProviders, onProvidersChange }: ProviderSelectorProps) {
  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onProvidersChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onProvidersChange([...selectedProviders, providerId]);
    }
  };

  const selectAll = () => {
    onProvidersChange(providers.map(p => p.id));
  };

  const selectNone = () => {
    onProvidersChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Select LLM Providers
        </label>
        <div className="flex space-x-2">
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
      
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <label
            key={provider.id}
            className={`
              relative flex items-center p-3 border rounded-lg cursor-pointer transition-all
              ${selectedProviders.includes(provider.id) 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedProviders.includes(provider.id)}
              onChange={() => toggleProvider(provider.id)}
              className="sr-only"
            />
            
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xl">{provider.icon}</span>
              <span className="font-medium text-gray-900">{provider.name}</span>
              
              {selectedProviders.includes(provider.id) && (
                <div className="ml-auto">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {selectedProviders.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          Please select at least one provider
        </p>
      )}
    </div>
  );
} 