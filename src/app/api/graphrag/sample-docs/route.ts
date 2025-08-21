import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docType = searchParams.get('type');

    if (!docType || !['ai-healthcare', 'tech-companies'].includes(docType)) {
      return NextResponse.json(
        { error: 'Invalid document type. Use "ai-healthcare" or "tech-companies"' },
        { status: 400 }
      );
    }

    const filename = `${docType}.txt`;
    const filePath = join(process.cwd(), 'sample-docs', filename);

    try {
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({
        content,
        filename,
        type: docType
      });
    } catch (fileError) {
      return NextResponse.json(
        { error: `Document ${filename} not found` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving sample document:', error);
    return NextResponse.json(
      { error: 'Failed to serve sample document' },
      { status: 500 }
    );
  }
}
