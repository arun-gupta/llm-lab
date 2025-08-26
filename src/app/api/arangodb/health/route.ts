import { NextRequest, NextResponse } from 'next/server';
import { healthCheck, initDatabase } from '@/lib/arangodb';

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await healthCheck();
    
    if (isHealthy) {
      const db = await initDatabase();
      const version = await db.version();
      
      return NextResponse.json({
        status: 'healthy',
        database: 'ArangoDB',
        version: version.version,
        server: version.server,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          database: 'ArangoDB',
          error: 'Database connection failed',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('ArangoDB health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        database: 'ArangoDB',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
