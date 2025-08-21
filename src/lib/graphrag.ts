import * as fs from 'fs';
import * as path from 'path';

interface Entity {
  text: string;
  type: 'person' | 'organization' | 'concept' | 'document';
  frequency: number;
  documents: number[];
}

interface Relationship {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  context: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'organization' | 'concept' | 'document';
  connections: number;
  frequency: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    topEntities: string[];
  };
}

// Simple entity extraction patterns
const ENTITY_PATTERNS = {
  person: [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last
    /\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b/g, // First M. Last
    /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Middle Last
  ],
  organization: [
    /\b[A-Z][A-Z\s&]+(?:Inc|Corp|LLC|Ltd|Company|Organization|Institute|University|College|Hospital|Foundation)\b/g,
    /\b[A-Z][a-z]+ [A-Z][a-z]+(?: Inc| Corp| LLC| Ltd)\b/g,
  ],
  concept: [
    /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g, // Capitalized phrases
  ]
};

// Relationship patterns
const RELATIONSHIP_PATTERNS = [
  { pattern: /\b(works at|employed by|CEO of|founder of|director of)\b/gi, type: 'employment' },
  { pattern: /\b(studied at|graduated from|attended|professor at|lecturer at)\b/gi, type: 'education' },
  { pattern: /\b(collaborated with|partnered with|worked with|teamed up with)\b/gi, type: 'collaboration' },
  { pattern: /\b(researched|developed|created|invented|discovered)\b/gi, type: 'achievement' },
  { pattern: /\b(focused on|specialized in|expert in|knowledge of)\b/gi, type: 'expertise' },
];

export async function extractEntities(documents: string[]): Promise<Entity[]> {
  const entities: Map<string, Entity> = new Map();

  documents.forEach((doc, docIndex) => {
    const docLower = doc.toLowerCase();
    
    // Extract entities by type
    Object.entries(ENTITY_PATTERNS).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        const matches = doc.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleanMatch = match.trim();
            if (cleanMatch.length > 2 && cleanMatch.length < 50) {
              const key = cleanMatch.toLowerCase();
              
              if (!entities.has(key)) {
                entities.set(key, {
                  text: cleanMatch,
                  type: type as any,
                  frequency: 0,
                  documents: []
                });
              }
              
              const entity = entities.get(key)!;
              entity.frequency++;
              if (!entity.documents.includes(docIndex)) {
                entity.documents.push(docIndex);
              }
            }
          });
        }
      });
    });
  });

  // Filter entities by frequency and document coverage
  const filteredEntities = Array.from(entities.values())
    .filter(entity => entity.frequency >= 2 || entity.documents.length >= 2)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 100); // Limit to top 100 entities

  return filteredEntities;
}

export async function buildGraph(entities: Entity[], documents: string[]): Promise<GraphData> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, string>();

  // Create nodes from entities
  entities.forEach((entity, index) => {
    const nodeId = `node_${index}`;
    nodeMap.set(entity.text.toLowerCase(), nodeId);
    
    nodes.push({
      id: nodeId,
      label: entity.text,
      type: entity.type,
      connections: 0,
      frequency: entity.frequency
    });
  });

  // Extract relationships
  const relationships: Relationship[] = [];
  
  documents.forEach(doc => {
    RELATIONSHIP_PATTERNS.forEach(({ pattern, type }) => {
      const matches = doc.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Find entities around the relationship
          const words = doc.split(/\s+/);
          const matchIndex = words.findIndex(word => 
            word.toLowerCase().includes(match.toLowerCase())
          );
          
          if (matchIndex !== -1) {
            // Look for entities before and after the relationship
            for (let i = Math.max(0, matchIndex - 3); i < Math.min(words.length, matchIndex + 4); i++) {
              for (let j = i + 1; j < Math.min(words.length, matchIndex + 4); j++) {
                const word1 = words[i].replace(/[^\w\s]/g, '');
                const word2 = words[j].replace(/[^\w\s]/g, '');
                
                const entity1 = nodeMap.get(word1.toLowerCase());
                const entity2 = nodeMap.get(word2.toLowerCase());
                
                if (entity1 && entity2 && entity1 !== entity2) {
                  relationships.push({
                    source: entity1,
                    target: entity2,
                    relationship: type,
                    weight: 1,
                    context: match
                  });
                }
              }
            }
          }
        });
      }
    });
  });

  // Consolidate relationships and create edges
  const relationshipMap = new Map<string, GraphEdge>();
  
  relationships.forEach(rel => {
    const key = `${rel.source}-${rel.target}-${rel.relationship}`;
    const reverseKey = `${rel.target}-${rel.source}-${rel.relationship}`;
    
    if (relationshipMap.has(key)) {
      relationshipMap.get(key)!.weight++;
    } else if (relationshipMap.has(reverseKey)) {
      relationshipMap.get(reverseKey)!.weight++;
    } else {
      relationshipMap.set(key, {
        source: rel.source,
        target: rel.target,
        relationship: rel.relationship,
        weight: rel.weight
      });
    }
  });

  edges.push(...relationshipMap.values());

  // Update connection counts
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode) sourceNode.connections++;
    if (targetNode) targetNode.connections++;
  });

  // Calculate statistics
  const topEntities = nodes
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 10)
    .map(n => n.label);

  return {
    nodes,
    edges,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      topEntities
    }
  };
}

export function saveGraphData(graphData: GraphData, filename: string): void {
  const dataDir = path.join(process.cwd(), 'data', 'graphs');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(graphData, null, 2));
}

export function loadGraphData(filename: string): GraphData | null {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'graphs');
    const filePath = path.join(dataDir, filename);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading graph data:', error);
  }
  
  return null;
}
