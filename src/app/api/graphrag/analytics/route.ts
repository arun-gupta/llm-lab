import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

interface GraphAnalytics {
  graphStats: {
    totalGraphs: number;
    totalNodes: number;
    totalEdges: number;
    averageNodesPerGraph: number;
    averageEdgesPerGraph: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
  };
  documentStats: {
    totalDocuments: number;
    documentTypes: string[];
    averageDocumentSize: number;
    sampleDocuments: string[];
  };
  apiStats: {
    endpoints: {
      name: string;
      method: string;
      path: string;
      description: string;
    }[];
    recentQueries: number;
    averageResponseTime: number;
  };
  insights: {
    mostCommonEntities: string[];
    mostCommonRelationships: string[];
    graphDensity: number;
    connectivityScore: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const graphId = searchParams.get('graphId'); // Optional: specific graph ID
    
    const analytics: GraphAnalytics = {
      graphStats: {
        totalGraphs: 0,
        totalNodes: 0,
        totalEdges: 0,
        averageNodesPerGraph: 0,
        averageEdgesPerGraph: 0,
        nodeTypes: {},
        edgeTypes: {}
      },
      documentStats: {
        totalDocuments: 0,
        documentTypes: [],
        averageDocumentSize: 0,
        sampleDocuments: []
      },
      apiStats: {
        endpoints: [
          {
            name: "Build Knowledge Graph",
            method: "POST",
            path: "/api/graphrag/build-graph",
            description: "Upload documents and build a knowledge graph"
          },
          {
            name: "Query GraphRAG",
            method: "POST", 
            path: "/api/graphrag/query",
            description: "Compare GraphRAG vs Traditional RAG"
          },
          {
            name: "Get Sample Documents",
            method: "GET",
            path: "/api/graphrag/sample-docs",
            description: "Retrieve sample documents for testing"
          },
          {
            name: "Get Analytics",
            method: "GET",
            path: "/api/graphrag/analytics",
            description: "Get comprehensive analytics and insights"
          }
        ],
        recentQueries: 0,
        averageResponseTime: 0
      },
      insights: {
        mostCommonEntities: [],
        mostCommonRelationships: [],
        graphDensity: 0,
        connectivityScore: 0
      }
    };

    // Analyze existing graphs
    try {
      const graphsDir = join(process.cwd(), 'data', 'graphs');
      const graphFiles = await readdir(graphsDir);
      const jsonFiles = graphFiles.filter(file => file.endsWith('.json'));
      
      analytics.graphStats.totalGraphs = jsonFiles.length;
      
      let totalNodes = 0;
      let totalEdges = 0;
      const allNodeTypes: Record<string, number> = {};
      const allEdgeTypes: Record<string, number> = {};
      const allEntities: string[] = [];
      const allRelationships: string[] = [];
      
      for (const file of jsonFiles) {
        try {
          const graphData = JSON.parse(
            await readFile(join(graphsDir, file), 'utf-8')
          );
          
          if (graphData.nodes && graphData.edges) {
            totalNodes += graphData.nodes.length;
            totalEdges += graphData.edges.length;
            
            // Count node types
            graphData.nodes.forEach((node: any) => {
              allNodeTypes[node.type] = (allNodeTypes[node.type] || 0) + 1;
              allEntities.push(node.label);
            });
            
            // Count edge types
            graphData.edges.forEach((edge: any) => {
              allEdgeTypes[edge.type] = (allEdgeTypes[edge.type] || 0) + 1;
              allRelationships.push(edge.label);
            });
          }
        } catch (error) {
          console.warn(`Error reading graph file ${file}:`, error);
        }
      }
      
      analytics.graphStats.totalNodes = totalNodes;
      analytics.graphStats.totalEdges = totalEdges;
      analytics.graphStats.averageNodesPerGraph = jsonFiles.length > 0 ? totalNodes / jsonFiles.length : 0;
      analytics.graphStats.averageEdgesPerGraph = jsonFiles.length > 0 ? totalEdges / jsonFiles.length : 0;
      analytics.graphStats.nodeTypes = allNodeTypes;
      analytics.graphStats.edgeTypes = allEdgeTypes;
      
      // Calculate insights
      analytics.insights.mostCommonEntities = getMostCommon(allEntities, 10);
      analytics.insights.mostCommonRelationships = getMostCommon(allRelationships, 10);
      analytics.insights.graphDensity = totalNodes > 0 ? totalEdges / totalNodes : 0;
      analytics.insights.connectivityScore = totalNodes > 0 ? (totalEdges / (totalNodes * (totalNodes - 1))) * 100 : 0;
      
    } catch (error) {
      console.warn('Error analyzing graphs directory:', error);
    }

    // Analyze sample documents
    try {
      const sampleDocsDir = join(process.cwd(), 'sample-docs');
      const docFiles = await readdir(sampleDocsDir);
      const textFiles = docFiles.filter(file => file.endsWith('.txt'));
      
      analytics.documentStats.totalDocuments = textFiles.length;
      analytics.documentStats.documentTypes = textFiles.map(file => file.replace('.txt', ''));
      
      let totalSize = 0;
      for (const file of textFiles) {
        try {
          const content = await readFile(join(sampleDocsDir, file), 'utf-8');
          totalSize += content.length;
          if (analytics.documentStats.sampleDocuments.length < 3) {
            analytics.documentStats.sampleDocuments.push(file);
          }
        } catch (error) {
          console.warn(`Error reading document ${file}:`, error);
        }
      }
      
      analytics.documentStats.averageDocumentSize = textFiles.length > 0 ? totalSize / textFiles.length : 0;
      
    } catch (error) {
      console.warn('Error analyzing sample documents:', error);
    }

    // Add timestamp
    const response = {
      ...analytics,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getMostCommon(items: string[], limit: number): string[] {
  const counts: Record<string, number> = {};
  
  items.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}
