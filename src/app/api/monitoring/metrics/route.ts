import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('time_range') || '24h';
    const modelId = searchParams.get('model_id');

    // In a real implementation, you would fetch metrics from a database
    // For now, we'll return mock data
    const mockMetrics = {
      time_range: timeRange,
      model_id: modelId,
      summary: {
        total_requests: 1250,
        successful_requests: 1180,
        failed_requests: 70,
        average_latency: 1450,
        total_cost: 12.45,
        success_rate: 94.4,
        requests_per_minute: 8.7
      },
      latency_metrics: {
        p50: 1200,
        p90: 2100,
        p95: 2800,
        p99: 4500,
        min: 450,
        max: 5200
      },
      cost_metrics: {
        total_cost: 12.45,
        average_cost_per_request: 0.00996,
        cost_by_model: {
          'gpt-5': 12.50,
          'gpt-5-mini': 6.20,
          'gpt-5-nano': 3.80,
          'claude-3-5-sonnet': 4.50,
          'claude-3-5-haiku': 2.80,
          'gpt-4': 8.20,
          'gpt-3.5-turbo': 2.15
        }
      },
      quality_metrics: {
        average_quality_score: 0.87,
        quality_distribution: {
          '0.9-1.0': 45,
          '0.8-0.9': 35,
          '0.7-0.8': 15,
          '0.6-0.7': 5
        }
      },
      error_metrics: {
        total_errors: 70,
        error_rate: 5.6,
        error_types: {
          'rate_limit': 25,
          'timeout': 20,
          'invalid_request': 15,
          'server_error': 10
        }
      },
      model_performance: [
        {
          model_id: 'gpt-5',
          provider: 'OpenAI',
          requests: 300,
          success_rate: 99.2,
          average_latency: 1200,
          total_cost: 12.50,
          average_quality: 0.96
        },
        {
          model_id: 'gpt-5-mini',
          provider: 'OpenAI',
          requests: 400,
          success_rate: 98.5,
          average_latency: 800,
          total_cost: 6.20,
          average_quality: 0.89
        },
        {
          model_id: 'gpt-5-nano',
          provider: 'OpenAI',
          requests: 350,
          success_rate: 97.8,
          average_latency: 600,
          total_cost: 3.80,
          average_quality: 0.82
        },
        {
          model_id: 'claude-3-5-sonnet',
          provider: 'Anthropic',
          requests: 250,
          success_rate: 95.5,
          average_latency: 1800,
          total_cost: 4.50,
          average_quality: 0.94
        },
        {
          model_id: 'claude-3-5-haiku',
          provider: 'Anthropic',
          requests: 300,
          success_rate: 96.8,
          average_latency: 1000,
          total_cost: 2.80,
          average_quality: 0.87
        },
        {
          model_id: 'gpt-4',
          provider: 'OpenAI',
          requests: 150,
          success_rate: 96.2,
          average_latency: 1800,
          total_cost: 8.20,
          average_quality: 0.92
        },
        {
          model_id: 'gpt-3.5-turbo',
          provider: 'OpenAI',
          requests: 200,
          success_rate: 98.0,
          average_latency: 850,
          total_cost: 2.15,
          average_quality: 0.78
        }
      ],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockMetrics
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
