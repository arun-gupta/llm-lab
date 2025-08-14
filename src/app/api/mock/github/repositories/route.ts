import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Return mock GitHub repositories data
    const mockRepositories = [
      {
        name: 'llm-lab',
        full_name: 'arun-gupta/llm-lab',
        description: 'LLM testing and comparison tool with Postman integration',
        html_url: 'https://github.com/arun-gupta/llm-lab',
        stargazers_count: 42,
        language: 'TypeScript',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-12-01T15:30:00Z',
        fork: false,
        size: 1024,
        watchers_count: 5,
        open_issues_count: 2,
        license: {
          name: 'Apache License 2.0',
          url: 'https://api.github.com/licenses/apache-2.0'
        }
      },
      {
        name: 'mcp-demo',
        full_name: 'arun-gupta/mcp-demo',
        description: 'Model Context Protocol demonstration project',
        html_url: 'https://github.com/arun-gupta/mcp-demo',
        stargazers_count: 15,
        language: 'JavaScript',
        created_at: '2024-02-20T14:00:00Z',
        updated_at: '2024-11-28T09:15:00Z',
        fork: false,
        size: 512,
        watchers_count: 3,
        open_issues_count: 1,
        license: {
          name: 'MIT License',
          url: 'https://api.github.com/licenses/mit'
        }
      },
      {
        name: 'postman-integration',
        full_name: 'arun-gupta/postman-integration',
        description: 'Advanced Postman integration examples and tools',
        html_url: 'https://github.com/arun-gupta/postman-integration',
        stargazers_count: 28,
        language: 'TypeScript',
        created_at: '2024-03-10T11:00:00Z',
        updated_at: '2024-12-02T16:45:00Z',
        fork: false,
        size: 2048,
        watchers_count: 7,
        open_issues_count: 4,
        license: {
          name: 'Apache License 2.0',
          url: 'https://api.github.com/licenses/apache-2.0'
        }
      }
    ];

    return NextResponse.json({
      repositories: mockRepositories,
      total_count: mockRepositories.length,
      timestamp: new Date().toISOString(),
      source: 'Mock Data - GitHub MCP Server unavailable',
      note: 'This is mock data. Configure github_token for real GitHub data.',
      request_body: body
    });

  } catch (error) {
    console.error('Mock GitHub repositories error:', error);
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
    message: 'Mock GitHub repositories endpoint',
    usage: 'Send POST request with any body to get mock repository data',
    timestamp: new Date().toISOString()
  });
}
