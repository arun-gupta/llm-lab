'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  Zap, 
  Activity,
  GitCompare,
  Database,
  Settings,
  Download,
  Play,
  Pause,
  RefreshCw,
  MessageSquare,
  FileText
} from 'lucide-react';
import { SuccessCelebration } from '../SuccessCelebration';

interface ModelMonitoringTabProps {
  onTabChange?: (tab: string) => void;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  color: string;
  enabled: boolean;
}

interface TestResult {
  id: string;
  timestamp: string;
  modelId: string;
  prompt: string;
  response: string;
  latency: number;
  tokens: number;
  cost: number;
  quality: number;
  status: 'success' | 'error' | 'timeout';
}

export function ModelMonitoringTab({ onTabChange }: ModelMonitoringTabProps) {
  const [activeTab, setActiveTab] = useState<'ab-testing' | 'monitoring' | 'analytics'>('ab-testing');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'collection-created' | 'api-key-setup' | 'first-response' | 'postman-connected'>('collection-created');
  const [celebrationData, setCelebrationData] = useState<any>({});
  
  // A/B Testing State
  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: 'gpt-5',
      name: 'GPT-5',
      provider: 'OpenAI',
      model: 'gpt-5',
      description: 'Latest flagship model with advanced capabilities',
      color: 'blue',
      enabled: true
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      provider: 'OpenAI',
      model: 'gpt-5-mini',
      description: 'Fast and efficient GPT-5 variant',
      color: 'cyan',
      enabled: true
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      provider: 'OpenAI',
      model: 'gpt-5-nano',
      description: 'Lightweight and fast GPT-5 variant',
      color: 'teal',
      enabled: true
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      model: 'gpt-4',
      description: 'Previous generation GPT-4 model',
      color: 'indigo',
      enabled: false
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      model: 'gpt-3.5-turbo',
      description: 'Fast and cost-effective GPT-3.5 model',
      color: 'green',
      enabled: false
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      model: 'claude-3-5-sonnet-20241022',
      description: 'Latest Claude 3.5 model with advanced reasoning',
      color: 'purple',
      enabled: true
    },
    {
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      model: 'claude-3-5-haiku-20241022',
      description: 'Fast and efficient Claude 3.5 variant',
      color: 'pink',
      enabled: true
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      model: 'claude-3-opus-20240229',
      description: 'Previous generation Claude model for complex tasks',
      color: 'violet',
      enabled: false
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      model: 'claude-3-sonnet-20240229',
      description: 'Previous generation balanced Claude model',
      color: 'orange',
      enabled: false
    },
    {
      id: 'llama-3.1-8b',
      name: 'Llama 3.1 8B',
      provider: 'Ollama',
      model: 'llama3.1:8b',
      description: 'Local Llama model for privacy-focused testing',
      color: 'red',
      enabled: false
    },
    {
      id: 'llama-3.2-1b',
      name: 'Llama 3.2 1B',
      provider: 'Ollama',
      model: 'llama3.2:1b',
      description: 'Ultra-fast local Llama 3.2 model',
      color: 'amber',
      enabled: false
    },
    {
      id: 'llama-3.2-3b',
      name: 'Llama 3.2 3B',
      provider: 'Ollama',
      model: 'llama3.2:3b',
      description: 'Fast local Llama 3.2 model with good performance',
      color: 'yellow',
      enabled: false
    },
    {
      id: 'llama-3.2-8b',
      name: 'Llama 3.2 8B',
      provider: 'Ollama',
      model: 'llama3.2:8b',
      description: 'Balanced local Llama 3.2 model',
      color: 'lime',
      enabled: false
    },
    {
      id: 'llama-3.2-70b',
      name: 'Llama 3.2 70B',
      provider: 'Ollama',
      model: 'llama3.2:70b',
      description: 'High-performance local Llama 3.2 model',
      color: 'emerald',
      enabled: false
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'Ollama',
      model: 'mistral:7b',
      description: 'Efficient local Mistral model',
      color: 'sky',
      enabled: false
    },
    {
      id: 'codellama-7b',
      name: 'Code Llama 7B',
      provider: 'Ollama',
      model: 'codellama:7b',
      description: 'Specialized local model for code generation',
      color: 'indigo',
      enabled: false
    },
    {
      id: 'phi-3-mini',
      name: 'Phi-3 Mini',
      provider: 'Ollama',
      model: 'phi3:mini',
      description: 'Lightweight local Microsoft Phi-3 model',
      color: 'rose',
      enabled: false
    }
  ]);

  const [testPrompt, setTestPrompt] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Sample prompts for A/B testing
  const samplePrompts = [
    {
      id: 'creative-writing',
      title: 'Creative Writing',
      prompt: 'Write a short story about a time traveler who accidentally changes a small event in history, but discovers that this change leads to a much better future than the original timeline.',
      category: 'Creative',
      difficulty: 'Medium'
    },
    {
      id: 'code-review',
      title: 'Code Review',
      prompt: 'Review this Python function for potential issues, performance improvements, and best practices:\n\ndef process_data(data_list):\n    result = []\n    for item in data_list:\n        if item > 0:\n            result.append(item * 2)\n    return result',
      category: 'Technical',
      difficulty: 'Easy'
    },
    {
      id: 'business-analysis',
      title: 'Business Analysis',
      prompt: 'Analyze the potential impact of implementing a 4-day workweek on employee productivity, company costs, and customer satisfaction. Provide specific recommendations for a tech company with 500 employees.',
      category: 'Business',
      difficulty: 'Hard'
    },
    {
      id: 'scientific-explanation',
      title: 'Scientific Explanation',
      prompt: 'Explain quantum entanglement in simple terms that a high school student could understand. Include analogies and real-world examples.',
      category: 'Educational',
      difficulty: 'Medium'
    },
    {
      id: 'problem-solving',
      title: 'Problem Solving',
      prompt: 'A company is experiencing high employee turnover. Design a comprehensive strategy to improve employee retention that considers compensation, work environment, career development, and company culture.',
      category: 'Business',
      difficulty: 'Hard'
    },
    {
      id: 'creative-brainstorming',
      title: 'Creative Brainstorming',
      prompt: 'Generate 10 innovative product ideas that could help reduce food waste in households. Focus on practical, affordable solutions that could be easily adopted.',
      category: 'Creative',
      difficulty: 'Medium'
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis',
      prompt: 'Given a dataset of customer purchase history, what are the key metrics you would analyze to identify customer segments and develop targeted marketing strategies?',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      id: 'ethical-decision',
      title: 'Ethical Decision Making',
      prompt: 'A self-driving car must choose between hitting a pedestrian or swerving into a wall, potentially harming the passenger. Analyze the ethical considerations and decision-making frameworks for autonomous vehicles.',
      category: 'Philosophical',
      difficulty: 'Hard'
    }
  ];

  // Quick Combos for testing
  const quickCombos = [
    {
      id: 'speed-test',
      title: 'Speed Test',
      description: 'Compare response times across models',
      models: ['gpt-5-nano', 'gpt-5-mini', 'llama-3.2-1b', 'llama-3.2-3b'],
      prompt: 'Write a 100-word summary of the benefits of renewable energy sources.',
      icon: '⚡'
    },
    {
      id: 'quality-test',
      title: 'Quality Test',
      description: 'Compare response quality across models',
      models: ['gpt-5', 'claude-3-5-sonnet', 'llama-3.2-70b', 'gpt-4'],
      prompt: 'Explain the concept of machine learning in detail, including its applications, limitations, and future prospects.',
      icon: '🎯'
    },
    {
      id: 'cost-test',
      title: 'Cost Test',
      description: 'Compare cost-effectiveness across models',
      models: ['llama-3.2-1b', 'llama-3.2-3b', 'phi-3-mini', 'gpt-3.5-turbo'],
      prompt: 'Provide a brief analysis of the current trends in remote work.',
      icon: '💰'
    },
    {
      id: 'creative-test',
      title: 'Creative Test',
      description: 'Test creative writing capabilities',
      models: ['gpt-5', 'claude-3-5-sonnet', 'llama-3.2-8b', 'mistral-7b'],
      prompt: 'Write a creative story about a robot learning to paint.',
      icon: '🎨'
    },
    {
      id: 'local-vs-cloud',
      title: 'Local vs Cloud',
      description: 'Compare local Ollama models with cloud models',
      models: ['llama-3.2-8b', 'gpt-5-mini', 'claude-3-5-haiku', 'mistral-7b'],
      prompt: 'Explain the differences between supervised and unsupervised learning with examples.',
      icon: '🏠'
    },
    {
      id: 'code-generation',
      title: 'Code Generation',
      description: 'Test code generation capabilities',
      models: ['codellama-7b', 'gpt-5', 'claude-3-5-sonnet', 'llama-3.2-8b'],
      prompt: 'Write a Python function that implements a binary search algorithm with proper error handling and documentation.',
      icon: '💻'
    },
    {
      id: 'privacy-focused',
      title: 'Privacy Focused',
      description: 'Compare local models for privacy-sensitive tasks',
      models: ['llama-3.2-8b', 'llama-3.2-70b', 'mistral-7b', 'phi-3-mini'],
      prompt: 'Analyze the privacy implications of using cloud-based AI services versus local models.',
      icon: '🔒'
    }
  ];

  // Response Comparison State
  const [comparisonPrompt, setComparisonPrompt] = useState('');
  const [comparisonContext, setComparisonContext] = useState('');
  const [isRunningComparison, setIsRunningComparison] = useState(false);
  const [comparisonResponses, setComparisonResponses] = useState<any[]>([]);
  const [showMorePrompts, setShowMorePrompts] = useState(false);
  
  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    ollama: true,
    openai: true,
    anthropic: true
  });
  
  // Quick Combos expansion state
  const [showAllQuickCombos, setShowAllQuickCombos] = useState(false);
  
  // Ollama models status
  const [runningOllamaModels, setRunningOllamaModels] = useState<string[]>([]);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  // Check Ollama models on component mount
  useEffect(() => {
    checkOllamaModels();
  }, []);

  // Performance Monitoring State
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    averageLatency: 0,
    totalCost: 0,
    successRate: 0
  });

  const generateUnifiedCollection = async () => {
    if (!models.filter(m => m.enabled).length) return;

    setImportStatus('importing');
    
    try {
      const enabledModels = models.filter(m => m.enabled);
      
      const collection = {
        info: {
          name: `A/B Testing Collection - ${new Date().toLocaleDateString()}`,
          description: `A/B testing collection for comparing ${enabledModels.length} models`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "base_url",
            value: "http://localhost:3000",
            type: "string"
          },
          {
            key: "test_prompt",
            value: testPrompt || "Compare the performance of different AI models",
            type: "string"
          }
        ],
        item: [
          // A/B Testing Setup Request
          {
            name: "Setup A/B Testing Environment",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  models: enabledModels.map(m => ({
                    id: m.id,
                    provider: m.provider,
                    model: m.model
                  })),
                  test_prompt: "{{test_prompt}}"
                }, null, 2)
              },
              url: {
                raw: "{{base_url}}/api/monitoring/setup-ab-test",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "setup-ab-test"]
              }
            }
          },
          // Individual model test requests
          ...enabledModels.map(model => ({
            name: `Test ${model.name} (${model.provider})`,
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  prompt: "{{test_prompt}}",
                  provider: model.provider,
                  model: model.model,
                  track_performance: true
                }, null, 2)
              },
              url: {
                raw: "{{base_url}}/api/llm",
                host: ["{{base_url}}"],
                path: ["api", "llm"]
              }
            },
            response: [
              {
                name: "Sample Response",
                originalRequest: {
                  method: "POST",
                  header: [
                    {
                      key: "Content-Type",
                      value: "application/json"
                    }
                  ],
                  body: {
                    mode: "raw",
                    raw: JSON.stringify({
                      prompt: "{{test_prompt}}",
                      provider: model.provider,
                      model: model.model,
                      track_performance: true
                    }, null, 2)
                  },
                  url: {
                    raw: "{{base_url}}/api/llm",
                    host: ["{{base_url}}"],
                    path: ["api", "llm"]
                  }
                },
                status: "OK",
                code: 200,
                _postman_previewlanguage: "json",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                cookie: [],
                body: JSON.stringify({
                  provider: model.provider,
                  model: model.model,
                  content: `Sample response from ${model.name}`,
                  latency: Math.floor(Math.random() * 2000) + 500,
                  tokens: Math.floor(Math.random() * 1000) + 100,
                  cost: (Math.random() * 0.1).toFixed(4),
                  quality: (Math.random() * 0.3 + 0.7).toFixed(2)
                }, null, 2)
              }
            ]
          })),
          // Performance Analysis Request
          {
            name: "Analyze A/B Test Results",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{base_url}}/api/monitoring/ab-test-results",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "ab-test-results"]
              }
            }
          }
        ]
      };

      // Create collection via Postman API
      const apiResponse = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: collection,
          createInWeb: false,
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        setImportStatus('success');
        setShowSuccessCelebration(true);
        setCelebrationType('collection-created');
        setCelebrationData({
          collectionUrl: result.data?.collectionUrl
        });
      } else {
        if (result.fallback) {
          const blob = new Blob([JSON.stringify(collection, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ab-testing-collection-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setImportStatus('success');
          setShowSuccessCelebration(true);
          setCelebrationType('collection-created');
          setCelebrationData({});
        } else {
          throw new Error(result.message || 'Failed to create collection');
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setImportStatus('error');
      setShowSuccessCelebration(true);
      setCelebrationData({
        title: 'Collection Creation Failed',
        message: 'Failed to create collection. Try again or check your Postman API key.'
      });
    }
  };

  const generateResponseComparisonCollection = async () => {
    if (!comparisonResponses || comparisonResponses.length === 0) return;

    setImportStatus('importing');
    
    try {
      const collection = {
        info: {
          name: `Response Comparison Collection - ${new Date().toLocaleDateString()}`,
          description: `Response comparison collection with ${comparisonResponses.length} model responses`,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "base_url",
            value: "http://localhost:3000",
            type: "string"
          }
        ],
        item: comparisonResponses.map((response, index) => ({
          name: `${response.provider} - ${response.modelName}`,
          request: {
            method: "POST",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                prompt: comparisonPrompt,
                context: comparisonContext,
                provider: response.provider,
                model: response.model
              }, null, 2)
            },
            url: {
              raw: "{{base_url}}/api/llm",
              host: ["{{base_url}}"],
              path: ["api", "llm"]
            }
          },
          response: [
            {
              name: "Sample Response",
              originalRequest: {
                method: "POST",
                header: [
                  {
                    key: "Content-Type",
                    value: "application/json"
                  }
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    prompt: comparisonPrompt,
                    context: comparisonContext,
                    provider: response.provider,
                    model: response.model
                  }, null, 2)
                },
                url: {
                  raw: "{{base_url}}/api/llm",
                  host: ["{{base_url}}"],
                  path: ["api", "llm"]
                }
              },
              status: "OK",
              code: 200,
              _postman_previewlanguage: "json",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              cookie: [],
              body: JSON.stringify({
                provider: response.provider,
                model: response.model,
                content: response.content,
                latency: response.latency,
                tokens: response.tokens,
                cost: response.cost,
                error: response.error
              }, null, 2)
            }
          ]
        }))
      };

      const apiResponse = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: collection,
          createInWeb: false,
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        setImportStatus('success');
        setShowSuccessCelebration(true);
        setCelebrationType('collection-created');
        setCelebrationData({
          collectionUrl: result.data?.collectionUrl
        });
      } else {
        if (result.fallback) {
          const blob = new Blob([JSON.stringify(collection, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `response-comparison-collection-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setImportStatus('success');
          setShowSuccessCelebration(true);
          setCelebrationType('collection-created');
          setCelebrationData({});
        } else {
          throw new Error(result.message || 'Failed to create collection');
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setImportStatus('error');
      setShowSuccessCelebration(true);
      setCelebrationType('collection-created');
      setCelebrationData({});
    }
  };

  const generateMonitoringCollection = async () => {
    setImportStatus('importing');
    
    try {
      const collection = {
        info: {
          name: `Model Performance Monitoring - ${new Date().toLocaleDateString()}`,
          description: "Performance monitoring collection for tracking model metrics",
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
          {
            key: "base_url",
            value: "http://localhost:3000",
            type: "string"
          }
        ],
        item: [
          {
            name: "Start Performance Monitoring",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  enabled: true,
                  track_metrics: ["latency", "throughput", "cost", "quality"]
                }, null, 2)
              },
              url: {
                raw: "{{base_url}}/api/monitoring/start",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "start"]
              }
            }
          },
          {
            name: "Get Performance Metrics",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{base_url}}/api/monitoring/metrics",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "metrics"]
              }
            }
          },
          {
            name: "Get Model Performance Comparison",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{base_url}}/api/monitoring/model-comparison",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "model-comparison"]
              }
            }
          },
          {
            name: "Export Performance Report",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{base_url}}/api/monitoring/export-report?format=json",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "export-report"],
                query: [
                  {
                    key: "format",
                    value: "json"
                  }
                ]
              }
            }
          },
          {
            name: "Stop Performance Monitoring",
            request: {
              method: "POST",
              header: [
                {
                  key: "Content-Type",
                  value: "application/json"
                }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  enabled: false
                }, null, 2)
              },
              url: {
                raw: "{{base_url}}/api/monitoring/stop",
                host: ["{{base_url}}"],
                path: ["api", "monitoring", "stop"]
              }
            }
          }
        ]
      };

      const apiResponse = await fetch('/api/postman/create-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: collection,
          createInWeb: false,
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        setImportStatus('success');
        setShowSuccessCelebration(true);
        setCelebrationType('collection-created');
        setCelebrationData({
          collectionUrl: result.data?.collectionUrl
        });
      } else {
        if (result.fallback) {
          const blob = new Blob([JSON.stringify(collection, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `monitoring-collection-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setImportStatus('success');
          setShowSuccessCelebration(true);
          setCelebrationType('collection-created');
          setCelebrationData({});
        } else {
          throw new Error(result.message || 'Failed to create collection');
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setImportStatus('error');
      setShowSuccessCelebration(true);
      setCelebrationData({
        title: 'Collection Creation Failed',
        message: 'Failed to create collection. Try again or check your Postman API key.'
      });
    }
  };

  const toggleModel = (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const toggleSection = (section: 'ollama' | 'openai' | 'anthropic') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const checkOllamaModels = async () => {
    setIsCheckingOllama(true);
    try {
      const response = await fetch('/api/ollama/models');
      if (response.ok) {
        const data = await response.json();
        const availableModels = data.models?.map((model: any) => model.name) || [];
        setRunningOllamaModels(availableModels);
      } else {
        setRunningOllamaModels([]);
      }
    } catch (error) {
      console.error('Error checking Ollama models:', error);
      setRunningOllamaModels([]);
    } finally {
      setIsCheckingOllama(false);
    }
  };

  const selectSamplePrompt = (prompt: string) => {
    setTestPrompt(prompt);
    setComparisonPrompt(prompt);
  };

  const selectQuickCombo = (combo: any) => {
    // Set the prompt
    setTestPrompt(combo.prompt);
    setComparisonPrompt(combo.prompt);
    
    // Enable only the models in the combo
    setModels(prev => prev.map(m => ({
      ...m,
      enabled: combo.models.includes(m.id)
    })));
  };

  const runABTest = async () => {
    if (!testPrompt.trim() || !models.filter(m => m.enabled).length) return;
    
    setIsRunningTest(true);
    setTestResults([]);
    
    // Simulate A/B testing
    const enabledModels = models.filter(m => m.enabled);
    const results: TestResult[] = [];
    
    for (const model of enabledModels) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const result: TestResult = {
        id: `${model.id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        modelId: model.id,
        prompt: testPrompt,
        response: `Sample response from ${model.name} for: "${testPrompt}"`,
        latency: Math.floor(Math.random() * 2000) + 500,
        tokens: Math.floor(Math.random() * 1000) + 100,
        cost: parseFloat((Math.random() * 0.1).toFixed(4)),
        quality: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
        status: 'success'
      };
      
      results.push(result);
      setTestResults(prev => [...prev, result]);
    }
    
    setIsRunningTest(false);
  };

  const runResponseComparison = async () => {
    if (!comparisonPrompt.trim() || !models.filter(m => m.enabled).length) return;
    
    setIsRunningComparison(true);
    setComparisonResponses([]);
    
    // Simulate response comparison
    const enabledModels = models.filter(m => m.enabled);
    const responses: any[] = [];
    
    for (const model of enabledModels) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = {
        id: `${model.id}-${Date.now()}`,
        provider: model.provider,
        model: model.model,
        modelName: model.name,
        content: `This is a detailed response from ${model.name} for the prompt: "${comparisonPrompt}". ${model.name} provides comprehensive analysis and insights based on the given context. The response demonstrates the model's capabilities in understanding and processing the input while maintaining coherence and relevance.`,
        latency: Math.floor(Math.random() * 2000) + 500,
        tokens: Math.floor(Math.random() * 1000) + 100,
        cost: parseFloat((Math.random() * 0.1).toFixed(4)),
        timestamp: new Date().toISOString(),
        error: null
      };
      
      responses.push(response);
      setComparisonResponses(prev => [...prev, response]);
    }
    
    setIsRunningComparison(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Monitoring</h1>
            <p className="text-gray-600">
              A/B testing and performance monitoring for LLM models with comprehensive analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateUnifiedCollection}
              disabled={importStatus === 'importing'}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/postman-logo.svg" alt="Postman" className="w-4 h-4 mr-2" />
              {importStatus === 'importing' ? 'Importing...' : 'Add Model Monitoring Collection'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ab-testing')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'ab-testing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>A/B Testing</span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Performance Monitoring</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>
        </nav>
      </div>

      {/* A/B Testing Tab */}
      {activeTab === 'ab-testing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Quick Combos and Model Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Combos */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Quick Combos</h3>
                <p className="text-gray-600 text-sm mt-1">Pre-configured test scenarios</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {(showAllQuickCombos ? quickCombos : quickCombos.slice(0, 3)).map((combo) => (
                    <div
                      key={combo.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectQuickCombo(combo)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{combo.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{combo.title}</h4>
                          <p className="text-xs text-gray-600">{combo.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {combo.models.map((modelId) => {
                          const model = models.find(m => m.id === modelId);
                          return model ? (
                            <span
                              key={modelId}
                              className={`text-xs px-2 py-1 rounded-full ${
                                model.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {model.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {quickCombos.length > 3 && (
                    <button
                      onClick={() => setShowAllQuickCombos(!showAllQuickCombos)}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {showAllQuickCombos ? 'Show Less' : `Show ${quickCombos.length - 3} More Combos`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Model Configuration */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Model Configuration</h3>
                <p className="text-gray-600 text-sm mt-1">Select models to include in A/B testing</p>
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  {/* Ollama Models Section */}
                  <div>
                    <h4 
                      className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between cursor-pointer hover:text-gray-900"
                      onClick={() => toggleSection('ollama')}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        Ollama (Local Models)
                        <span className="text-xs text-gray-500 ml-2">
                          ({models.filter(model => model.provider === 'Ollama' && model.enabled).length} selected)
                        </span>
                        {isCheckingOllama && (
                          <RefreshCw className="w-3 h-3 ml-2 animate-spin text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            checkOllamaModels();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                          title="Refresh Ollama models"
                        >
                          Refresh
                        </button>
                        <span className="text-gray-400">
                          {expandedSections.ollama ? '−' : '+'}
                        </span>
                      </div>
                    </h4>
                    
                    {/* Color Legend */}
                    {expandedSections.ollama && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">Model Categories:</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-gray-600">Legacy Models</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            <span className="text-gray-600">Fast Models</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-gray-600">Specialized Models</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {expandedSections.ollama && (
                      <div className="space-y-2">
                        {models.filter(model => model.provider === 'Ollama').map((model) => {
                          const isRunning = runningOllamaModels.includes(model.model);
                          return (
                            <div
                              key={model.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                model.enabled
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              } ${isRunning ? 'ring-1 ring-green-500' : ''}`}
                              onClick={() => toggleModel(model.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                                  <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                                  {isRunning && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Running
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {!isRunning && (
                                    <span className="text-xs text-gray-400">Not Available</span>
                                  )}
                                  <input
                                    type="checkbox"
                                    checked={model.enabled}
                                    onChange={() => toggleModel(model.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={!isRunning}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                              {!isRunning && (
                                <p className="text-xs text-red-500 mt-1">
                                  Model not running. Start with: <code className="bg-gray-100 px-1 rounded">ollama pull {model.model}</code>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* OpenAI Models Section */}
                  <div>
                    <h4 
                      className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between cursor-pointer hover:text-gray-900"
                      onClick={() => toggleSection('openai')}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        OpenAI (Cloud Models)
                        <span className="text-xs text-gray-500 ml-2">
                          ({models.filter(model => model.provider === 'OpenAI' && model.enabled).length} selected)
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {expandedSections.openai ? '−' : '+'}
                      </span>
                    </h4>
                    {expandedSections.openai && (
                      <div className="space-y-2">
                        {models.filter(model => model.provider === 'OpenAI').map((model) => (
                          <div
                            key={model.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              model.enabled
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleModel(model.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                                <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={model.enabled}
                                onChange={() => toggleModel(model.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Anthropic Models Section */}
                  <div>
                    <h4 
                      className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between cursor-pointer hover:text-gray-900"
                      onClick={() => toggleSection('anthropic')}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        Anthropic (Cloud Models)
                        <span className="text-xs text-gray-500 ml-2">
                          ({models.filter(model => model.provider === 'Anthropic' && model.enabled).length} selected)
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {expandedSections.anthropic ? '−' : '+'}
                      </span>
                    </h4>
                    {expandedSections.anthropic && (
                      <div className="space-y-2">
                        {models.filter(model => model.provider === 'Anthropic').map((model) => (
                          <div
                            key={model.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              model.enabled
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleModel(model.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                                <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={model.enabled}
                                onChange={() => toggleModel(model.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Test Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Test Configuration</h3>
                <p className="text-gray-600 mt-1">Configure your A/B test parameters</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Prompt
                  </label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a prompt to test across all selected models..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={runABTest}
                    disabled={!testPrompt.trim() || !models.filter(m => m.enabled).length || isRunningTest}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningTest ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running Test...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run A/B Test
                      </>
                    )}
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    {models.filter(m => m.enabled).length} model(s) selected
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Prompts */}
            <div className="bg-white rounded-lg border shadow-sm mt-6">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Sample Prompts</h3>
                <p className="text-gray-600 text-sm mt-1">Choose from predefined prompts to get started</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {(showMorePrompts ? samplePrompts : samplePrompts.slice(0, 3)).map((sample) => (
                    <div 
                      key={sample.id} 
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectSamplePrompt(sample.prompt)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{sample.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sample.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          sample.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sample.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{sample.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{sample.prompt.substring(0, 80)}...</p>
                      <button 
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSamplePrompt(sample.prompt);
                        }}
                      >
                        Use this prompt →
                      </button>
                    </div>
                  ))}
                  {!showMorePrompts && samplePrompts.length > 3 && (
                    <button
                      onClick={() => setShowMorePrompts(true)}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                    >
                      Show More Prompts ({samplePrompts.length - 3} more)
                    </button>
                  )}
                  {showMorePrompts && (
                    <button
                      onClick={() => setShowMorePrompts(false)}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
                  <p className="text-gray-600 mt-1">Performance comparison across models</p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testResults.map((result) => {
                          const model = models.find(m => m.id === result.modelId);
                          return (
                            <tr key={result.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full bg-${model?.color || 'gray'}-500 mr-3`}></div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{model?.name}</div>
                                    <div className="text-sm text-gray-500">{model?.provider}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.latency}ms
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.tokens}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${result.cost}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.quality}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  result.status === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : result.status === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {result.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Response Comparison Tab */}
      {activeTab === 'response-comparison' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Model Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Configuration */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Model Configuration</h3>
                <p className="text-gray-600 text-sm mt-1">Select models to include in response comparison</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        model.enabled
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleModel(model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                          <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={model.enabled}
                          onChange={() => toggleModel(model.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{model.provider}</p>
                      <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Combos */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Quick Combos</h3>
                <p className="text-gray-600 text-sm mt-1">Pre-configured comparison scenarios</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {quickCombos.map((combo) => (
                    <div
                      key={combo.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectQuickCombo(combo)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{combo.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{combo.title}</h4>
                          <p className="text-xs text-gray-600">{combo.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {combo.models.map((modelId) => {
                          const model = models.find(m => m.id === modelId);
                          return model ? (
                            <span
                              key={modelId}
                              className={`text-xs px-2 py-1 rounded-full ${
                                model.enabled ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {model.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sample Prompts */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Sample Prompts</h3>
                <p className="text-gray-600 text-sm mt-1">Choose from predefined prompts</p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {(showMorePrompts ? samplePrompts : samplePrompts.slice(0, 3)).map((sample) => (
                    <div 
                      key={sample.id} 
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectSamplePrompt(sample.prompt)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{sample.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sample.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          sample.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sample.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{sample.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{sample.prompt.substring(0, 80)}...</p>
                      <button 
                        className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSamplePrompt(sample.prompt);
                        }}
                      >
                        Use this prompt →
                      </button>
                    </div>
                  ))}
                  {!showMorePrompts && samplePrompts.length > 3 && (
                    <button
                      onClick={() => setShowMorePrompts(true)}
                      className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2"
                    >
                      Show More Prompts ({samplePrompts.length - 3} more)
                    </button>
                  )}
                  {showMorePrompts && (
                    <button
                      onClick={() => setShowMorePrompts(false)}
                      className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Comparison Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Response Comparison</h3>
                <p className="text-gray-600 mt-1">Compare responses from different models side-by-side</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={comparisonPrompt}
                    onChange={(e) => setComparisonPrompt(e.target.value)}
                    placeholder="Enter a prompt to test across all selected models..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context (Optional)
                  </label>
                  <textarea
                    value={comparisonContext}
                    onChange={(e) => setComparisonContext(e.target.value)}
                    placeholder="Add context or additional information..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={runResponseComparison}
                    disabled={!comparisonPrompt.trim() || !models.filter(m => m.enabled).length || isRunningComparison}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningComparison ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running Comparison...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Run Response Comparison
                      </>
                    )}
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    {models.filter(m => m.enabled).length} model(s) selected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Comparison Results */}
          {comparisonResponses.length > 0 && (
            <div className="mt-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Response Comparison Results</h3>
                  <p className="text-gray-600 mt-1">Side-by-side comparison of model responses</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {comparisonResponses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-${models.find(m => m.id === response.model)?.color || 'gray'}-500`}></div>
                            <h4 className="font-medium text-gray-900">{response.modelName}</h4>
                          </div>
                          <div className="text-xs text-gray-500">
                            {response.provider}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-sm bg-gray-50 p-3 rounded border">
                            <div className="text-xs text-gray-500 mb-1">Response:</div>
                            <div className="text-gray-700">{response.content}</div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="font-medium text-blue-900">{response.latency}ms</div>
                              <div className="text-blue-600">Latency</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-medium text-green-900">{response.tokens}</div>
                              <div className="text-green-600">Tokens</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="font-medium text-yellow-900">${response.cost}</div>
                              <div className="text-yellow-600">Cost</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Performance Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Monitoring Controls */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Performance Monitoring</h3>
              <p className="text-gray-600 mt-1">Track and monitor model performance metrics</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Real-time Monitoring</h4>
                  <p className="text-sm text-gray-600">Track latency, throughput, costs, and quality metrics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monitoringEnabled}
                    onChange={(e) => setMonitoringEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Latency</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.averageLatency}ms</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">${metrics.totalCost}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.successRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoring Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h4 className="font-medium text-gray-900 mb-4">Tracked Metrics</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <Zap className="w-4 h-4 mr-2 text-blue-600" />
                  Response latency and throughput
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  Cost per request and total spending
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  Quality scores and error rates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Database className="w-4 h-4 mr-2 text-orange-600" />
                  Token usage and efficiency
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h4 className="font-medium text-gray-900 mb-4">API Endpoints</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">POST /api/monitoring/start</code>
                </li>
                <li className="text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">GET /api/monitoring/metrics</code>
                </li>
                <li className="text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">GET /api/monitoring/model-comparison</code>
                </li>
                <li className="text-sm text-gray-600">
                  <code className="bg-gray-100 px-2 py-1 rounded">POST /api/monitoring/stop</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-6">
              Comprehensive analytics and insights for model performance comparison
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Performance Trends</h4>
                <p className="text-sm text-gray-600">Track performance over time with detailed charts and metrics</p>
                <div className="text-xs text-gray-500 mt-2">🚧 Coming Soon</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Cost Analysis</h4>
                <p className="text-sm text-gray-600">Compare costs across different models and providers</p>
                <div className="text-xs text-gray-500 mt-2">🚧 Coming Soon</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Quality Assessment</h4>
                <p className="text-sm text-gray-600">Automated quality scoring and consistency checks</p>
                <div className="text-xs text-gray-500 mt-2">🚧 Coming Soon</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <p className="text-sm text-gray-600">AI-powered recommendations for model selection</p>
                <div className="text-xs text-gray-500 mt-2">🚧 Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Celebration */}
      {showSuccessCelebration && (
        <SuccessCelebration
          isVisible={showSuccessCelebration}
          type={celebrationType}
          onClose={() => {
            setShowSuccessCelebration(false);
            setCelebrationData({});
            setImportStatus('idle');
          }}
          data={celebrationData}
        />
      )}
    </div>
  );
}
