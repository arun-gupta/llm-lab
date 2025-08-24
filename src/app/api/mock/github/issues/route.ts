import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate a mock issue response
    const mockIssue = {
      number: Math.floor(Math.random() * 1000) + 1,
      title: body.title || 'Test Issue via MCP (Mock)',
      body: body.body || 'This issue was created using MCP integration with mock data',
      labels: body.labels || ['mcp', 'postman', 'mock'],
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
              html_url: `https://github.com/arun-gupta/multi-protocol-lab/issues/${Math.floor(Math.random() * 1000) + 1}`,
      assignees: [],
      milestone: null,
      comments: 0,
      user: {
        login: 'arun-gupta',
        id: 12345,
        avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
        type: 'User'
      },
      repository: {
              name: 'multi-protocol-lab',
      full_name: 'arun-gupta/multi-protocol-lab',
      private: false,
      html_url: 'https://github.com/arun-gupta/multi-protocol-lab'
      }
    };

    return NextResponse.json({
      issue: mockIssue,
      timestamp: new Date().toISOString(),
      source: 'Mock Data - GitHub MCP Server unavailable',
      note: 'This is mock data. Configure github_token for real GitHub issue creation.',
      request_body: body
    });

  } catch (error) {
    console.error('Mock GitHub issues error:', error);
    return NextResponse.json(
      {
        error: 'Mock endpoint error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mock GitHub issues endpoint',
    usage: 'Send POST request with issue data to get mock issue creation response',
    timestamp: new Date().toISOString()
  });
}
