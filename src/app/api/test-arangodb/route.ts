import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing ArangoDB connection from API route...');
    
    const { Database } = require('arangojs');
    
    const db = new Database({
      url: 'http://localhost:8529',
      databaseName: 'graphrag',
      auth: {
        username: 'root',
        password: 'postmanlabs123',
      },
    });
    
    console.log('Database object created in API route');
    
    const version = await db.version();
    console.log('✅ API route connection successful!');
    
    return NextResponse.json({
      status: 'success',
      version: version,
      message: 'ArangoDB connection working from API route'
    });
    
  } catch (error) {
    console.error('❌ API route connection failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
