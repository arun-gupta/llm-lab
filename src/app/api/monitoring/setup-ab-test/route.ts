import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { models, test_prompt } = body;

    // Validate input
    if (!models || !Array.isArray(models) || models.length === 0) {
      return NextResponse.json(
        { error: 'Models array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!test_prompt || typeof test_prompt !== 'string') {
      return NextResponse.json(
        { error: 'Test prompt is required' },
        { status: 400 }
      );
    }

    // Setup A/B testing environment
    const setupData = {
      test_id: `ab_test_${Date.now()}`,
      models: models.map((model: any) => ({
        id: model.id,
        provider: model.provider,
        model: model.model,
        status: 'ready'
      })),
      test_prompt,
      created_at: new Date().toISOString(),
      status: 'setup_complete'
    };

    // In a real implementation, you would store this in a database
    // For now, we'll return the setup data
    return NextResponse.json({
      success: true,
      message: 'A/B testing environment setup successfully',
      data: setupData
    });

  } catch (error) {
    console.error('Error setting up A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to setup A/B testing environment' },
      { status: 500 }
    );
  }
}
