import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('test_id');
    const modelsParam = searchParams.get('models');
    
    // Parse the models parameter
    const requestedModels = modelsParam ? modelsParam.split(',').map(m => m.trim()) : [];
    console.log('Requested models for analysis:', requestedModels);

    // In a real implementation, you would fetch results from a database
    // For now, we'll return comprehensive mock data that matches the web interface
    const mockResults = {
      test_id: testId || `ab_test_${Date.now()}`,
      summary: {
        total_requests: requestedModels.length * 5,
        successful_requests: requestedModels.length * 5,
        failed_requests: 0,
        average_latency: 1200,
        total_cost: 0.025,
        test_duration: 25000,
        success_rate: 100
      },
      model_performance: requestedModels.map(modelId => {
        // Generate comprehensive mock data based on the model
        if (modelId === 'gpt-5-mini') {
          return {
            model_id: 'gpt-5-mini',
            provider: 'OpenAI',
            model: 'gpt-5-mini',
            metrics: {
              requests: 5,
              success_rate: 100,
              average_latency: 1100,
              total_cost: 0.015,
              average_quality: 0.88,
              average_accuracy: 0.85,
              average_coherence: 0.90,
              average_diversity: 0.82,
              average_time_to_useful: 45,
              average_toxicity: 0.05,
              average_hallucination: 0.12,
              average_bias: 0.08,
              confidence: 0.92
            }
          };
        } else if (modelId === 'llama-3.2-3b') {
          return {
            model_id: 'llama-3.2-3b',
            provider: 'Ollama',
            model: 'llama3.2:3b',
            metrics: {
              requests: 5,
              success_rate: 100,
              average_latency: 1300,
              total_cost: 0.000,
              average_quality: 0.82,
              average_accuracy: 0.78,
              average_coherence: 0.85,
              average_diversity: 0.88,
              average_time_to_useful: 52,
              average_toxicity: 0.08,
              average_hallucination: 0.18,
              average_bias: 0.12,
              confidence: 0.85
            }
          };
        } else {
          // Generic fallback for other models
          return {
            model_id: modelId,
            provider: 'Unknown',
            model: modelId,
            metrics: {
              requests: 5,
              success_rate: 100,
              average_latency: 1500,
              total_cost: 0.010,
              average_quality: 0.80,
              average_accuracy: 0.75,
              average_coherence: 0.80,
              average_diversity: 0.75,
              average_time_to_useful: 60,
              average_toxicity: 0.10,
              average_hallucination: 0.20,
              average_bias: 0.15,
              confidence: 0.80
            }
          };
        }
      }),
      recommendations: requestedModels.length > 0 ? [
        {
          type: 'cost_optimization',
          message: requestedModels.includes('llama-3.2-3b') 
            ? 'Llama 3.2 3B offers the best cost-to-performance ratio (free local model)'
            : 'Consider local models for cost optimization',
          model_id: requestedModels.includes('llama-3.2-3b') ? 'llama-3.2-3b' : requestedModels[0]
        },
        {
          type: 'quality_optimization',
          message: requestedModels.includes('gpt-5-mini')
            ? 'GPT-5 Mini provides the highest quality responses'
            : 'Consider OpenAI models for quality optimization',
          model_id: requestedModels.includes('gpt-5-mini') ? 'gpt-5-mini' : requestedModels[0]
        },
        {
          type: 'speed_optimization',
          message: requestedModels.includes('gpt-5-mini')
            ? 'GPT-5 Mini has the fastest response times'
            : 'Consider cloud models for speed optimization',
          model_id: requestedModels.includes('gpt-5-mini') ? 'gpt-5-mini' : requestedModels[0]
        }
      ] : [],
      
      // Fact-checking analysis data to match web interface
      fact_checking_analysis: requestedModels.length > 0 ? requestedModels.map(modelId => {
        if (modelId === 'gpt-5-mini') {
          return {
            model_id: 'gpt-5-mini',
            provider: 'OpenAI',
            model: 'gpt-5-mini',
            fact_check_result: {
              accuracy: 0.85,
              confidence: 0.92,
              verified_facts: [
                'AI models can process natural language',
                'Machine learning improves with data',
                'Neural networks are computational models'
              ],
              unverified_claims: [
                'AI will replace all human jobs',
                'Consciousness can be replicated exactly'
              ],
              contradictions: [],
              issues: ['Some claims lack scientific backing']
            }
          };
        } else if (modelId === 'llama-3.2-3b') {
          return {
            model_id: 'llama-3.2-3b',
            provider: 'Ollama',
            model: 'llama3.2:3b',
            fact_check_result: {
              accuracy: 0.78,
              confidence: 0.85,
              verified_facts: [
                'Open source models exist',
                'Local inference is possible',
                'Community-driven development works'
              ],
              unverified_claims: [
                'Local models are always better',
                'Open source guarantees quality'
              ],
              contradictions: [
                'Claims about superiority vs cloud models'
              ],
              issues: ['Some claims are overly optimistic']
            }
          };
        } else {
          return {
            model_id: modelId,
            provider: 'Unknown',
            model: modelId,
            fact_check_result: {
              accuracy: 0.75,
              confidence: 0.80,
              verified_facts: ['Basic AI capabilities exist'],
              unverified_claims: ['Model-specific claims'],
              contradictions: [],
              issues: ['Limited information available']
            }
          };
        }
      }) : [],
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockResults
    });

  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test results' },
      { status: 500 }
    );
  }
}
