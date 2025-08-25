import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    // Validate input
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled flag is required and must be a boolean' },
        { status: 400 }
      );
    }

    // Stop performance monitoring
    const monitoringConfig = {
      monitoring_id: `monitoring_${Date.now()}`,
      enabled,
      stop_time: new Date().toISOString(),
      status: enabled ? 'active' : 'stopped'
    };

    // In a real implementation, you would:
    // 1. Update the monitoring configuration in the database
    // 2. Stop background monitoring processes
    // 3. Generate final metrics report

    return NextResponse.json({
      success: true,
      message: enabled ? 'Performance monitoring resumed' : 'Performance monitoring stopped successfully',
      data: monitoringConfig
    });

  } catch (error) {
    console.error('Error stopping performance monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to stop performance monitoring' },
      { status: 500 }
    );
  }
}
