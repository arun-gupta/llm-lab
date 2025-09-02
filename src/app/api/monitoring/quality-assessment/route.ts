import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelsParam = searchParams.get('models');
    
    // Parse the models parameter
    const requestedModels = modelsParam ? modelsParam.split(',').map(m => m.trim()) : [];
    console.log('Requested models for quality assessment:', requestedModels);
    
    // Generate comprehensive quality assessment data
    const qualityData = {
      overall_quality_metrics: {
        average_quality: 0.85,
        average_accuracy: 0.82,
        average_coherence: 0.88,
        average_diversity: 0.85,
        average_time_to_useful: 48,
        total_assessments: requestedModels.length * 5
      },
      model_quality_breakdown: requestedModels.map(modelId => {
        if (modelId === 'gpt-5-mini') {
          return {
            model_id: 'gpt-5-mini',
            provider: 'OpenAI',
            model: 'gpt-5-mini',
            quality_scores: {
              overall: 0.88,
              accuracy: 0.85,
              coherence: 0.90,
              diversity: 0.82,
              time_to_useful: 45
            },
            quality_trends: [
              { test_run: 1, quality: 0.86, accuracy: 0.83, coherence: 0.89, diversity: 0.81 },
              { test_run: 2, quality: 0.87, accuracy: 0.84, coherence: 0.90, diversity: 0.82 },
              { test_run: 3, quality: 0.88, accuracy: 0.85, coherence: 0.91, diversity: 0.83 },
              { test_run: 4, quality: 0.89, accuracy: 0.86, coherence: 0.92, diversity: 0.84 },
              { test_run: 5, quality: 0.88, accuracy: 0.85, coherence: 0.90, diversity: 0.82 }
            ],
            strengths: [
              'High coherence and logical flow',
              'Consistent accuracy across tests',
              'Fast time to useful output',
              'Good balance of quality metrics'
            ],
            areas_for_improvement: [
              'Diversity could be slightly higher',
              'Minor variations in quality scores'
            ]
          };
        } else if (modelId === 'llama-3.2-3b') {
          return {
            model_id: 'llama-3.2-3b',
            provider: 'Ollama',
            model: 'llama3.2:3b',
            quality_scores: {
              overall: 0.82,
              accuracy: 0.78,
              coherence: 0.85,
              diversity: 0.88,
              time_to_useful: 52
            },
            quality_trends: [
              { test_run: 1, quality: 0.80, accuracy: 0.76, coherence: 0.83, diversity: 0.86 },
              { test_run: 2, quality: 0.81, accuracy: 0.77, coherence: 0.84, diversity: 0.87 },
              { test_run: 3, quality: 0.82, accuracy: 0.78, coherence: 0.85, diversity: 0.88 },
              { test_run: 4, quality: 0.83, accuracy: 0.79, coherence: 0.86, diversity: 0.89 },
              { test_run: 5, quality: 0.82, accuracy: 0.78, coherence: 0.85, diversity: 0.88 }
            ],
            strengths: [
              'Excellent diversity in responses',
              'Good coherence for local model',
              'Consistent performance',
              'Cost-effective (free)'
            ],
            areas_for_improvement: [
              'Accuracy needs improvement',
              'Slower time to useful output',
              'Quality could be more consistent'
            ]
          };
        } else {
          return {
            model_id: modelId,
            provider: 'Unknown',
            model: modelId,
            quality_scores: {
              overall: 0.80,
              accuracy: 0.75,
              coherence: 0.80,
              diversity: 0.75,
              time_to_useful: 60
            },
            quality_trends: [
              { test_run: 1, quality: 0.78, accuracy: 0.73, coherence: 0.78, diversity: 0.73 },
              { test_run: 2, quality: 0.79, accuracy: 0.74, coherence: 0.79, diversity: 0.74 },
              { test_run: 3, quality: 0.80, accuracy: 0.75, coherence: 0.80, diversity: 0.75 },
              { test_run: 4, quality: 0.81, accuracy: 0.76, coherence: 0.81, diversity: 0.76 },
              { test_run: 5, quality: 0.80, accuracy: 0.75, coherence: 0.80, diversity: 0.75 }
            ],
            strengths: [
              'Stable performance',
              'Consistent quality scores',
              'Balanced metrics'
            ],
            areas_for_improvement: [
              'Overall quality improvement needed',
              'Better accuracy required',
              'Faster response times'
            ]
          };
        }
      }),
      quality_insights: {
        best_performing_model: requestedModels.includes('gpt-5-mini') ? 'gpt-5-mini' : requestedModels[0],
        most_consistent_model: requestedModels.includes('gpt-5-mini') ? 'gpt-5-mini' : requestedModels[0],
        most_improved_model: requestedModels.includes('llama-3.2-3b') ? 'llama-3.2-3b' : requestedModels[0],
        recommendations: [
          'Focus on accuracy improvement for local models',
          'Maintain quality consistency across test runs',
          'Balance quality metrics for optimal performance'
        ]
      },
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: qualityData
    });

  } catch (error) {
    console.error('Error fetching quality assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality assessment' },
      { status: 500 }
    );
  }
}
