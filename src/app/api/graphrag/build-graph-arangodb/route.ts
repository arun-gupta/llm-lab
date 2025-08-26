import { NextRequest, NextResponse } from 'next/server';
import { extractEntities, buildGraph } from '@/lib/graphrag';
import { 
  createGraph, 
  createEntities, 
  createRelationships, 
  createDocument,
  ArangoEntity,
  ArangoRelationship,
  ArangoDocument,
  ArangoGraph
} from '@/lib/arangodb';

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

    // Extract entities and build graph using existing logic
    const entities = await extractEntities(documents);
    const graphData = await buildGraph(entities, documents);

    // Create ArangoDB graph record
    const graphId = `graph_${Date.now()}`;
    const arangoGraph: Omit<ArangoGraph, '_key' | '_id'> = {
      name: graphId,
      description: `Graph built from ${files.length} document(s)`,
      stats: {
        totalNodes: graphData.nodes.length,
        totalEdges: graphData.edges.length,
        nodeTypes: graphData.nodes.reduce((acc, node) => {
          acc[node.type] = (acc[node.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        edgeTypes: graphData.edges.reduce((acc, edge) => {
          acc[edge.relationship] = (acc[edge.relationship] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const graphKey = await createGraph(arangoGraph);

    // Create entities in ArangoDB
    const arangoEntities: Omit<ArangoEntity, '_key' | '_id'>[] = graphData.nodes.map(node => ({
      label: node.label,
      type: node.type,
      frequency: node.frequency,
      connections: node.connections,
      properties: {},
      graphId: graphKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const entityKeys = await createEntities(arangoEntities);
    
    // Create entity ID mapping
    const entityMap = new Map();
    graphData.nodes.forEach((node, index) => {
      entityMap.set(node.id, entityKeys[index]);
    });

    // Create relationships in ArangoDB
    const arangoRelationships: Omit<ArangoRelationship, '_key' | '_id'>[] = graphData.edges.map(edge => ({
      _from: `entities/${entityMap.get(edge.source)}`,
      _to: `entities/${entityMap.get(edge.target)}`,
      relationship: edge.relationship,
      weight: edge.weight,
      context: '',
      graphId: graphKey,
      createdAt: new Date().toISOString(),
    }));

    await createRelationships(arangoRelationships);

    // Create documents in ArangoDB
    for (const file of files) {
      const text = await file.text();
      const arangoDocument: Omit<ArangoDocument, '_key' | '_id'> = {
        name: file.name,
        content: text,
        type: file.type || 'text/plain',
        size: text.length,
        graphId: graphKey,
        uploadedAt: new Date().toISOString(),
      };
      
      await createDocument(arangoDocument);
    }

    return NextResponse.json({
      graphId: graphKey,
      name: graphId,
      stats: arangoGraph.stats,
      message: 'Knowledge graph built successfully with ArangoDB',
      documentsProcessed: files.length,
      entitiesCreated: graphData.nodes.length,
      relationshipsCreated: graphData.edges.length,
    });

  } catch (error) {
    console.error('Error building graph with ArangoDB:', error);
    return NextResponse.json(
      { error: 'Failed to build knowledge graph with ArangoDB' },
      { status: 500 }
    );
  }
}
