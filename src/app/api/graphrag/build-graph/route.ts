import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { extractEntities, buildGraph } from '@/lib/graphrag';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('documents') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      );
    }

    // Process documents
    const documents: string[] = [];
    for (const file of files) {
      const text = await file.text();
      documents.push(text);
    }

    // Extract entities and build graph
    const entities = await extractEntities(documents);
    const graphData = await buildGraph(entities, documents);

    // Save graph data to file system
    const dataDir = join(process.cwd(), 'data', 'graphs');
    await mkdir(dataDir, { recursive: true });
    
    const graphId = `graph_${Date.now()}`;
    const graphPath = join(dataDir, `${graphId}.json`);
    await writeFile(graphPath, JSON.stringify(graphData, null, 2));

    return NextResponse.json({
      ...graphData,
      graphId,
      message: 'Knowledge graph built successfully'
    });

  } catch (error) {
    console.error('Error building graph:', error);
    return NextResponse.json(
      { error: 'Failed to build knowledge graph' },
      { status: 500 }
    );
  }
}
