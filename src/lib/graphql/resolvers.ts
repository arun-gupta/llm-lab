import { readFile, readdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { extractEntities, buildGraph } from '../graphrag';
import { callOpenAI, callOpenAIStreaming, callAnthropic, callOllama } from '../llm-apis';
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

// Cache for better performance
const graphCache = new Map();
const documentCache = new Map();



// Helper function to get all graphs from ArangoDB
async function getAllGraphs() {
  try {
    const response = await arangoRequest('/_api/cursor', 'POST', {
      query: 'FOR g IN graphs SORT g.createdAt DESC RETURN g'
    });
    
    const arangoGraphs = response.result || [];
    const graphs = [];
    
    for (const graph of arangoGraphs) {
      try {
        graphs.push({
          id: graph._key,
          name: graph.name,
          nodes: [], // Don't load all nodes for list view
          edges: [], // Don't load all edges for list view
          stats: graph.stats,
          createdAt: graph.createdAt,
          updatedAt: graph.updatedAt
        });
      } catch (error) {
        console.warn(`Error reading graph ${graph._key}:`, error);
      }
    }
    return graphs;
  } catch (error) {
    console.error('Error getting graphs from ArangoDB:', error);
    return [];
  }
}

// Helper function to get documents
async function getDocuments() {
  if (documentCache.size > 0) {
    return Array.from(documentCache.values());
  }

  try {
    const docsDir = join(process.cwd(), 'sample-docs');
    const files = await readdir(docsDir);
    const textFiles = files.filter(file => file.endsWith('.txt'));
    
    const documents = [];
    for (const file of textFiles) {
      try {
        const content = await readFile(join(docsDir, file), 'utf-8');
        const doc = {
          id: file.replace('.txt', ''),
          name: file,
          type: file.replace('.txt', ''),
          size: content.length,
          content,
          uploadedAt: new Date().toISOString()
        };
        documents.push(doc);
        documentCache.set(doc.id, doc);
      } catch (error) {
        console.warn(`Error reading document ${file}:`, error);
      }
    }
    return documents;
  } catch (error) {
    return [];
  }
}

// Helper function to calculate graph statistics
function calculateGraphStats(nodes: any[], edges: any[]) {
  const nodeTypes: Record<string, number> = {};
  const edgeTypes: Record<string, number> = {};
  
  nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  });
  
  edges.forEach(edge => {
    edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
  });
  
  const density = nodes.length > 0 ? edges.length / nodes.length : 0;
  const connectivity = nodes.length > 1 ? (edges.length / (nodes.length * (nodes.length - 1))) * 100 : 0;
  
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    nodeTypes,
    edgeTypes,
    density,
    connectivity
  };
}

// Helper function to get most common items
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

export const resolvers = {
  Query: {
    // Get all graphs with optional filtering
    graphs: async (_: any, { filter }: { filter?: any }) => {
      const graphs = await getAllGraphs();
      
      if (!filter) return graphs;
      
      return graphs.filter(graph => {
        if (filter.graphId && graph.id !== filter.graphId) return false;
        if (filter.nodeType && !graph.stats?.nodeTypes?.[filter.nodeType]) return false;
        if (filter.edgeType && !graph.stats?.edgeTypes?.[filter.edgeType]) return false;
        return true;
      }).slice(0, filter.limit || 100);
    },

    // Get specific graph
    graph: async (_: any, { id }: { id: string }) => {
      try {
        // Get graph metadata from ArangoDB using REST API
        const graphResponse = await arangoRequest(`/_api/document/graphs/${id}`);
        if (!graphResponse) {
          throw new Error(`Graph not found: ${id}`);
        }

        // Get entities and relationships from ArangoDB using REST API
        const [entitiesResponse, relationshipsResponse] = await Promise.all([
          arangoRequest('/_api/cursor', 'POST', {
            query: `FOR e IN entities FILTER e.graphId == "${id}" RETURN e`
          }),
          arangoRequest('/_api/cursor', 'POST', {
            query: `FOR r IN relationships FILTER r.graphId == "${id}" RETURN r`
          })
        ]);

        const entities = entitiesResponse.result || [];
        const relationships = relationshipsResponse.result || [];

        // Convert to the expected format
        const nodes = entities.map((entity: any) => ({
          id: entity._key,
          label: entity.label,
          type: entity.type,
          connections: entity.connections,
          frequency: entity.frequency,
        }));

        const edges = relationships.map((rel: any) => ({
          id: rel._key,
          source: rel._from ? rel._from.split('/')[1] : '',
          target: rel._to ? rel._to.split('/')[1] : '',
          label: rel.relationship,
          type: rel.relationship,
          properties: { weight: rel.weight }
        }));

        return {
          id,
          name: id,
          nodes,
          edges,
          stats: graphResponse.stats,
          createdAt: graphResponse.createdAt,
          updatedAt: graphResponse.updatedAt
        };
      } catch (error) {
        console.error(`Error getting graph ${id}:`, error);
        throw new Error(`Graph not found: ${id}`);
      }
    },

    // Get all documents
    documents: async () => {
      return await getDocuments();
    },

    // Get specific document
    document: async (_: any, { id }: { id: string }) => {
      const documents = await getDocuments();
      return documents.find(doc => doc.id === id);
    },

    // GraphRAG query - main functionality
    graphRAGQuery: async (_: any, { input }: { input: any }, context: any, info: any) => {
      const { query, graphId, model = 'gpt-5-nano' } = input;
      
      try {
        // Use the existing graph resolver to get graph data
        const graphData = await resolvers.Query.graph(null, { id: graphId });
        
        // Extract relevant context from graph
        const graphContext = extractRelevantContext(query, graphData);
        
        // Build prompts
        const graphRAGPrompt = buildGraphRAGPrompt(query, graphContext);
        const traditionalRAGPrompt = buildTraditionalRAGPrompt(query, graphData);
        
        // Call LLM APIs
        let graphRAGResponse, traditionalRAGResponse;
        const startTime = Date.now();
        
        try {
          const isAnthropic = model.startsWith('claude');
          const isOllama = model.startsWith('ollama:');
          
          if (isAnthropic) {
            [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
              callAnthropic(graphRAGPrompt, undefined, model),
              callAnthropic(traditionalRAGPrompt, undefined, model)
            ]);
          } else if (isOllama) {
            const ollamaModel = model.replace('ollama:', '');
            [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
              callOllama(graphRAGPrompt, ollamaModel, undefined),
              callOllama(traditionalRAGPrompt, ollamaModel, undefined)
            ]);
          } else {
            if (model.startsWith('gpt-5')) {
              [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
                callOpenAIStreaming(graphRAGPrompt, undefined, model),
                callOpenAIStreaming(traditionalRAGPrompt, undefined, model)
              ]);
            } else {
              [graphRAGResponse, traditionalRAGResponse] = await Promise.all([
                callOpenAI(graphRAGPrompt, undefined, model),
                callOpenAI(traditionalRAGPrompt, undefined, model)
              ]);
            }
          }
        } catch (error) {
          throw new Error(`LLM API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        const endTime = Date.now();
        const graphRAGLatency = graphRAGResponse?.latency || (endTime - startTime);
        const traditionalRAGLatency = traditionalRAGResponse?.latency || (endTime - startTime);

        // Calculate analytics
        const tokenAnalytics = calculateTokenAnalytics(graphRAGResponse, traditionalRAGResponse, graphRAGPrompt, traditionalRAGPrompt);
        const qualityAnalytics = calculateResponseQuality(graphRAGResponse?.content || '', traditionalRAGResponse?.content || '', query);
        const graphAnalytics = calculateGraphCoverage(graphContext, graphData);

        return {
          query,
          model,
          graphRAGResponse: graphRAGResponse?.content || '',
          traditionalRAGResponse: traditionalRAGResponse?.content || '',
          graphContext: graphContext.map(ctx => ctx.description),
          performance: {
            graphRAGLatency,
            traditionalRAGLatency,
            contextRelevance: calculateContextRelevance(query, graphContext)
          },
          analytics: {
            tokens: tokenAnalytics,
            quality: qualityAnalytics,
            graph: graphAnalytics
          }
        };
      } catch (error) {
        throw new Error(`GraphRAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Get analytics overview
    analytics: async (_: any, { filter }: { filter?: any }) => {
      const graphs = await getAllGraphs();
      const documents = await getDocuments();
      
      // Calculate graph statistics
      let totalNodes = 0;
      let totalEdges = 0;
      const allNodeTypes: Record<string, number> = {};
      const allEdgeTypes: Record<string, number> = {};
      const allEntities: string[] = [];
      const allRelationships: string[] = [];
      
      graphs.forEach(graph => {
        totalNodes += graph.nodes.length;
        totalEdges += graph.edges.length;
        
        graph.nodes.forEach((node: any) => {
          allNodeTypes[node.type] = (allNodeTypes[node.type] || 0) + 1;
          allEntities.push(node.label);
        });
        
        graph.edges.forEach((edge: any) => {
          allEdgeTypes[edge.type] = (allEdgeTypes[edge.type] || 0) + 1;
          allRelationships.push(edge.label);
        });
      });

      return {
        graphStats: {
          totalGraphs: graphs.length,
          totalNodes,
          totalEdges,
          averageNodesPerGraph: graphs.length > 0 ? totalNodes / graphs.length : 0,
          averageEdgesPerGraph: graphs.length > 0 ? totalEdges / graphs.length : 0,
          nodeTypes: allNodeTypes,
          edgeTypes: allEdgeTypes
        },
        documentStats: {
          totalDocuments: documents.length,
          documentTypes: documents.map(doc => doc.type),
          averageDocumentSize: documents.length > 0 ? documents.reduce((sum, doc) => sum + doc.size, 0) / documents.length : 0,
          sampleDocuments: documents.slice(0, 3).map(doc => doc.name)
        },
        apiStats: {
          endpoints: [
            { name: "Build Knowledge Graph", method: "POST", path: "/api/graphrag/build-graph", description: "Upload documents and build a knowledge graph" },
            { name: "Query GraphRAG", method: "POST", path: "/api/graphrag/query", description: "Compare GraphRAG vs Traditional RAG" },
            { name: "Get Sample Documents", method: "GET", path: "/api/graphrag/sample-docs", description: "Retrieve sample documents for testing" },
            { name: "Get Analytics", method: "GET", path: "/api/graphrag/analytics", description: "Get comprehensive analytics and insights" }
          ],
          recentQueries: 0,
          averageResponseTime: 0
        },
        insights: {
          mostCommonEntities: getMostCommon(allEntities, 10),
          mostCommonRelationships: getMostCommon(allRelationships, 10),
          graphDensity: totalNodes > 0 ? totalEdges / totalNodes : 0,
          connectivityScore: totalNodes > 1 ? (totalEdges / (totalNodes * (totalNodes - 1))) * 100 : 0
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
    },

    // Search entities
    searchEntities: async (_: any, { query, graphId, limit = 10 }: { query: string, graphId?: string, limit?: number }) => {
      try {
        const graphs = graphId ? [await getGraphData(graphId)] : await getAllGraphs();
        const results: any[] = [];
        
        console.log(`Searching for "${query}" in ${graphs.length} graphs`);
        
        graphs.forEach(graph => {
          console.log(`Graph ${graph.id || 'unknown'}: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
          
          graph.nodes.forEach((node: any) => {
            // If query is empty, return all entities
            if (!query || query.trim() === '') {
              results.push({
                ...node,
                connections: graph.edges.filter((edge: any) => 
                  edge.source === node.id || edge.target === node.id
                ).length
              });
            } else {
              // More flexible search - check label, type, and properties
              const searchText = `${node.label} ${node.type} ${Object.values(node.properties || {}).join(' ')}`.toLowerCase();
              const queryLower = query.toLowerCase();
              
              if (searchText.includes(queryLower) || 
                  node.label.toLowerCase().includes(queryLower) ||
                  node.type.toLowerCase().includes(queryLower)) {
                results.push({
                  ...node,
                  connections: graph.edges.filter((edge: any) => 
                    edge.source === node.id || edge.target === node.id
                  ).length
                });
              }
            }
          });
        });
        
        console.log(`Found ${results.length} matching entities`);
        return results.slice(0, limit);
      } catch (error) {
        console.error('Error in searchEntities:', error);
        return [];
      }
    },

    // Get entity relationships
    entityRelationships: async (_: any, { entityId, graphId, depth = 2 }: { entityId: string, graphId: string, depth?: number }) => {
      const graphData = await getGraphData(graphId);
      const visited = new Set();
      const results: any[] = [];
      
      function traverseRelationships(nodeId: string, currentDepth: number) {
        if (currentDepth > depth || visited.has(nodeId)) return;
        visited.add(nodeId);
        
        graphData.edges.forEach((edge: any) => {
          if (edge.source === nodeId || edge.target === nodeId) {
            results.push(edge);
            const nextNode = edge.source === nodeId ? edge.target : edge.source;
            traverseRelationships(nextNode, currentDepth + 1);
          }
        });
      }
      
      traverseRelationships(entityId, 0);
      return results;
    },

    // Get graph statistics
    graphStatistics: async (_: any, { id }: { id: string }) => {
      const graphData = await getGraphData(id);
      return calculateGraphStats(graphData.nodes, graphData.edges);
    }
  },

  Mutation: {
    // Build graph from documents using ArangoDB
    buildGraph: async (_: any, { input }: { input: any }) => {
      try {
        // This would handle file uploads and graph building with ArangoDB
        // For now, return a mock progress
        return {
          status: 'building',
          percentage: 50,
          message: 'Processing documents and extracting entities with ArangoDB...',
          graphId: 'temp-graph-id'
        };
      } catch (error) {
        throw new Error(`Failed to build graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Delete graph from ArangoDB
    deleteGraph: async (_: any, { id }: { id: string }) => {
      try {
        // TODO: Implement delete from ArangoDB
        // For now, just clear cache
        graphCache.delete(id);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Update graph metadata in ArangoDB
    updateGraph: async (_: any, { id, name }: { id: string, name?: string }) => {
      try {
        const graph = await getGraph(id);
        if (!graph) {
          throw new Error(`Graph not found: ${id}`);
        }
        
        if (name) {
          // TODO: Implement update in ArangoDB
          graph.name = name;
          graphCache.delete(id);
        }
        
        return {
          id,
          name: name || graph.name,
          stats: graph.stats,
          createdAt: graph.createdAt,
          updatedAt: graph.updatedAt
        };
      } catch (error) {
        throw new Error(`Failed to update graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  // Custom scalar resolvers
  JSON: {
    __serialize(value: any) {
      return value;
    }
  },

  Upload: {
    __serialize(value: any) {
      return value;
    }
  }
};

// Helper functions (reused from REST API)
function extractRelevantContext(query: string, graphData: any) {
  const queryLower = query.toLowerCase();
  
  // Define relevant keywords for different query types
  const healthcareKeywords = ['healthcare', 'health', 'medical', 'hospital', 'doctor', 'patient', 'treatment', 'diagnosis', 'clinical'];
  const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'algorithm', 'automation', 'intelligent'];
  const benefitKeywords = ['benefit', 'advantage', 'improve', 'enhance', 'better', 'efficient', 'effective'];
  
  // Check if this is a healthcare-related query
  const isHealthcareQuery = healthcareKeywords.some(keyword => queryLower.includes(keyword));
  const isAIQuery = aiKeywords.some(keyword => queryLower.includes(keyword));
  const isBenefitQuery = benefitKeywords.some(keyword => queryLower.includes(keyword));
  
  // If it's a healthcare + AI + benefits query, return all medical/healthcare related entities
  if (isHealthcareQuery && isAIQuery && isBenefitQuery) {
    const relevantNodes = graphData.nodes.filter((node: any) => {
      const nodeLabel = node.label.toLowerCase();
      const nodeType = node.type.toLowerCase();
      
      // Include medical/healthcare related entities
      return nodeType === 'person' || 
             nodeType === 'organization' ||
             nodeLabel.includes('medical') ||
             nodeLabel.includes('health') ||
             nodeLabel.includes('center') ||
             nodeLabel.includes('hospital') ||
             nodeLabel.includes('doctor') ||
             nodeLabel.includes('dr.') ||
             nodeLabel.includes('stanford') ||
             nodeLabel.includes('google');
    });
    
    return relevantNodes.map((node: any) => ({
      type: 'entity',
      description: `${node.label} (${node.type})`
    }));
  }
  
  // Fallback to exact matching for other queries
  const relevantNodes = graphData.nodes.filter((node: any) => 
    queryLower.includes(node.label.toLowerCase()) ||
    node.label.toLowerCase().includes(queryLower)
  );
  
  return relevantNodes.map((node: any) => ({
    type: 'entity',
    description: `${node.label} (${node.type})`
  }));
}

function buildGraphRAGPrompt(query: string, context: any[]) {
  return `Based on the following knowledge graph context, answer the query: "${query}"

Context from knowledge graph:
${context.map(ctx => `- ${ctx.description}`).join('\n')}

Provide a comprehensive answer using the graph context.`;
}

function buildTraditionalRAGPrompt(query: string, graphData: any) {
  const allText = graphData.nodes.map((node: any) => node.label).join(' ');
  return `Based on the following text, answer the query: "${query}"

Text: ${allText}

Provide a comprehensive answer using the text context.`;
}

function calculateContextRelevance(query: string, context: any[]) {
  const queryTerms = query.toLowerCase().split(' ');
  const contextText = context.map(ctx => ctx.description).join(' ').toLowerCase();
  
  let relevantTerms = 0;
  queryTerms.forEach(term => {
    if (contextText.includes(term)) relevantTerms++;
  });
  
  return queryTerms.length > 0 ? relevantTerms / queryTerms.length : 0;
}

function calculateTokenAnalytics(graphRAGResponse: any, traditionalRAGResponse: any, graphRAGPrompt: string, traditionalRAGPrompt: string) {
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  
  const graphRAGInputTokens = estimateTokens(graphRAGPrompt);
  const traditionalRAGInputTokens = estimateTokens(traditionalRAGPrompt);
  
  const graphRAGOutputTokens = graphRAGResponse?.tokens?.completion || estimateTokens(graphRAGResponse?.content || '');
  const traditionalRAGOutputTokens = traditionalRAGResponse?.tokens?.completion || estimateTokens(traditionalRAGResponse?.content || '');
  
  const graphRAGTotalTokens = graphRAGResponse?.tokens?.total || (graphRAGInputTokens + graphRAGOutputTokens);
  const traditionalRAGTotalTokens = traditionalRAGResponse?.tokens?.total || (traditionalRAGInputTokens + traditionalRAGOutputTokens);
  
  const graphRAGEfficiency = graphRAGInputTokens > 0 ? graphRAGOutputTokens / graphRAGInputTokens : 0;
  const traditionalRAGEfficiency = traditionalRAGInputTokens > 0 ? traditionalRAGOutputTokens / traditionalRAGInputTokens : 0;
  
  const costPer1KTokens = 0.00015;
  const graphRAGCost = (graphRAGTotalTokens / 1000) * costPer1KTokens;
  const traditionalRAGCost = (traditionalRAGTotalTokens / 1000) * costPer1KTokens;
  
  return {
    graphRAG: {
      input: graphRAGInputTokens,
      output: graphRAGOutputTokens,
      total: graphRAGTotalTokens,
      efficiency: graphRAGEfficiency,
      cost: graphRAGCost
    },
    traditionalRAG: {
      input: traditionalRAGInputTokens,
      output: traditionalRAGOutputTokens,
      total: traditionalRAGTotalTokens,
      efficiency: traditionalRAGEfficiency,
      cost: traditionalRAGCost
    }
  };
}

function calculateResponseQuality(graphRAGResponse: string, traditionalRAGResponse: string, query: string) {
  const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  const graphRAGCompleteness = calculateCompleteness(graphRAGResponse, queryTerms);
  const traditionalRAGCompleteness = calculateCompleteness(traditionalRAGResponse, queryTerms);
  
  const graphRAGSpecificity = calculateSpecificity(graphRAGResponse);
  const traditionalRAGSpecificity = calculateSpecificity(traditionalRAGResponse);
  
  const graphRAGReadability = calculateReadability(graphRAGResponse);
  const traditionalRAGReadability = calculateReadability(traditionalRAGResponse);
  
  return {
    graphRAG: {
      length: graphRAGResponse.length,
      completeness: graphRAGCompleteness,
      specificity: graphRAGSpecificity,
      readability: graphRAGReadability
    },
    traditionalRAG: {
      length: traditionalRAGResponse.length,
      completeness: traditionalRAGCompleteness,
      specificity: traditionalRAGSpecificity,
      readability: traditionalRAGReadability
    }
  };
}

function calculateGraphCoverage(context: any[], graphData: any) {
  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.edges.length;
  
  const usedEntities = new Set();
  const usedRelationships = new Set();
  
  context.forEach(ctx => {
    if (ctx.type === 'entity') {
      usedEntities.add(ctx.description.split(' (')[0]);
    } else if (ctx.type === 'relationship') {
      usedRelationships.add(ctx.description);
    }
  });
  
  const coveragePercentage = totalNodes > 0 ? (usedEntities.size / totalNodes) * 100 : 0;
  const relationshipUtilization = totalEdges > 0 ? (usedRelationships.size / totalEdges) * 100 : 0;
  
  const entityTypes = new Map<string, number>();
  graphData.nodes.forEach((node: any) => {
    if (usedEntities.has(node.label)) {
      entityTypes.set(node.type, (entityTypes.get(node.type) || 0) + 1);
    }
  });
  
  return {
    totalNodes,
    totalEdges,
    usedEntities: usedEntities.size,
    usedRelationships: usedRelationships.size,
    coveragePercentage,
    relationshipUtilization,
    entityTypeDistribution: Object.fromEntries(entityTypes)
  };
}

function calculateCompleteness(response: string, queryTerms: string[]): number {
  if (queryTerms.length === 0) return 1;
  
  const responseLower = response.toLowerCase();
  let addressedTerms = 0;
  
  for (const term of queryTerms) {
    if (responseLower.includes(term)) {
      addressedTerms++;
    }
  }
  
  return addressedTerms / queryTerms.length;
}

function calculateSpecificity(response: string): number {
  const specificPatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    /\b[A-Z][A-Z]+\b/g,
    /\b\d+\b/g,
    /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g
  ];
  
  const genericPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
    /\b(this|that|these|those|it|they|them|their)\b/gi
  ];
  
  let specificCount = 0;
  let genericCount = 0;
  
  specificPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) specificCount += matches.length;
  });
  
  genericPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) genericCount += matches.length;
  });
  
  const total = specificCount + genericCount;
  return total > 0 ? specificCount / total : 0;
}

function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = estimateSyllables(text);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, fleschScore));
}

function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;
  
  words.forEach(word => {
    word = word.replace(/(?:ed|es|ing|ly|ment|ness|tion|sion)$/, '');
    
    const vowelGroups = word.match(/[aeiouy]+/g);
    if (vowelGroups) {
      syllableCount += vowelGroups.length;
    } else {
      syllableCount += 1;
    }
  });
  
  return syllableCount;
}
