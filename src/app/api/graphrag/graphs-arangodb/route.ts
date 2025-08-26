import { NextRequest, NextResponse } from 'next/server';
import { getAllGraphs, getGraph, getEntitiesByGraph, getRelationshipsByGraph } from '@/lib/arangodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const graphId = searchParams.get('graphId');
    const includeData = searchParams.get('includeData') === 'true';

    if (graphId) {
      // Get specific graph
      const graph = await getGraph(graphId);
      if (!graph) {
        return NextResponse.json(
          { error: 'Graph not found' },
          { status: 404 }
        );
      }

      let response: any = { graph };

      if (includeData) {
        // Include entities and relationships
        const [entities, relationships] = await Promise.all([
          getEntitiesByGraph(graphId),
          getRelationshipsByGraph(graphId)
        ]);

        response = {
          ...response,
          entities,
          relationships,
          nodes: entities.map((entity: any) => ({
            id: entity._key,
            label: entity.label,
            type: entity.type,
            connections: entity.connections,
            frequency: entity.frequency,
          })),
          edges: relationships.map((rel: any) => ({
            source: rel._from.split('/')[1],
            target: rel._to.split('/')[1],
            relationship: rel.relationship,
            weight: rel.weight,
          })),
        };
      }

      return NextResponse.json(response);
    } else {
      // Get all graphs
      const graphs = await getAllGraphs();
      return NextResponse.json({ graphs });
    }

  } catch (error) {
    console.error('Error retrieving graphs from ArangoDB:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve graphs from ArangoDB' },
      { status: 500 }
    );
  }
}
