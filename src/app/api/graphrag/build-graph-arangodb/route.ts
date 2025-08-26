import { NextRequest, NextResponse } from 'next/server';
import { extractEntities, buildGraph } from '@/lib/graphrag';

// ArangoDB configuration
const ARANGO_CONFIG = {
  url: 'http://localhost:8529',
  databaseName: 'graphrag',
  username: 'root',
  password: 'postmanlabs123',
};

// Helper function to make ArangoDB REST API calls
async function arangoRequest(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${ARANGO_CONFIG.url}/_db/${ARANGO_CONFIG.databaseName}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${ARANGO_CONFIG.username}:${ARANGO_CONFIG.password}`).toString('base64')}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`ArangoDB request failed: ${response.statusText}`);
  }
  
  return response.json();
}

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
    const graphKey = graphId.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const arangoGraph = {
      _key: graphKey,
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

    // Create graph using REST API
    await arangoRequest('/_api/document/graphs', 'POST', arangoGraph);

    // Create entities in ArangoDB
    const arangoEntities = graphData.nodes.map(node => ({
      _key: node.id,
      label: node.label,
      type: node.type,
      frequency: node.frequency,
      connections: node.connections,
      properties: {},
      graphId: graphKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Create entities using REST API
    const entityResults = await arangoRequest('/_api/document/entities', 'POST', arangoEntities);
    const entityKeys = entityResults.map((result: any) => result._key);
    
    // Create entity ID mapping
    const entityMap = new Map();
    graphData.nodes.forEach((node, index) => {
      entityMap.set(node.id, entityKeys[index]);
    });

    // Create relationships in ArangoDB
    const arangoRelationships = graphData.edges.map(edge => ({
      _from: `entities/${entityMap.get(edge.source)}`,
      _to: `entities/${entityMap.get(edge.target)}`,
      relationship: edge.relationship,
      weight: edge.weight,
      context: '',
      graphId: graphKey,
      createdAt: new Date().toISOString(),
    }));

    // Create relationships using REST API
    await arangoRequest('/_api/document/relationships', 'POST', arangoRelationships);

    // Create documents in ArangoDB
    for (const file of files) {
      const text = await file.text();
      const arangoDocument = {
        _key: file.name.replace(/[^a-zA-Z0-9_-]/g, '_'),
        name: file.name,
        content: text,
        type: file.type || 'text/plain',
        size: text.length,
        graphId: graphKey,
        uploadedAt: new Date().toISOString(),
      };
      
      await arangoRequest('/_api/document/documents', 'POST', arangoDocument);
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
