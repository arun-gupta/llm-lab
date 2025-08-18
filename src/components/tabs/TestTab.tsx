'use client';

import { useState } from 'react';
import { LLMForm } from '../LLMForm';
import { ResponseTabs } from '../ResponseTabs';
import { LLMResponse } from '@/lib/llm-apis';
import { Clock, DollarSign, Target } from 'lucide-react';

import { TabType } from '../TabNavigation';

interface TestTabProps {
  onTabChange: (tab: TabType) => void;
}

export function TestTab({ onTabChange }: TestTabProps) {
  const [responses, setResponses] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [formData, setFormData] = useState<{ prompt: string; context?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics' | 'comparison'>('responses');

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setActiveTab('responses');
      setTimeout(() => {
        const responsesElement = document.getElementById('responses-section');
        if (responsesElement) {
          responsesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const handleResponsesChange = (newResponses: LLMResponse[]) => {
    setResponses(newResponses);
    if (newResponses.length > 0) {
      setActiveTab('responses');
      setTimeout(() => {
        const responsesElement = document.getElementById('responses-section');
        if (responsesElement) {
          responsesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test & Compare</h1>
          <p className="text-gray-600">
            Test prompts across different providers and models with A/B testing, side-by-side comparison, and performance benchmarking.
          </p>
        </div>
      </div>



      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <LLMForm 
              onResponsesChange={handleResponsesChange}
              onLoadingChange={handleLoadingChange}
              onProvidersChange={setSelectedProviders}
              onFormDataChange={setFormData}
            />
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="lg:col-span-2" id="responses-section">
          <ResponseTabs 
            responses={responses}
            prompt={formData?.prompt || ''}
            context={formData?.context || ''}
            isLoading={isLoading}
            selectedProviders={selectedProviders}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Advanced Comparison Features */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Comparison Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Response Time Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Detailed latency and throughput comparison with statistical analysis
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Cost Analysis</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Compare costs across different providers and models with budget tracking
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Quality Assessment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automated quality scoring and comparison with consistency checks
            </p>
            <div className="text-xs text-gray-500">🚧 Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
