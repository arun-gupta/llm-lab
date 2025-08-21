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

// Enhanced entity extraction patterns for our sample documents
const ENTITY_PATTERNS = {
  person: [
    /\bDr\. [A-Z][a-z]+ [A-Z][a-z]+\b/g, // Dr. First Last
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last
    /\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b/g, // First M. Last
    /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Middle Last
  ],
  organization: [
    /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, // Stanford Medical Center, Google Health, etc.
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Microsoft Research, National Institutes, etc.
    /\b[A-Z][A-Z\s&]+(?:Inc|Corp|LLC|Ltd|Company|Organization|Institute|University|College|Hospital|Foundation)\b/g,
    /\b[A-Z][a-z]+ [A-Z][a-z]+(?: Inc| Corp| LLC| Ltd)\b/g,
  ],
  concept: [
    /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, // Artificial Intelligence, Machine Learning, etc.
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Computer Vision, Natural Language, etc.
    /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g, // Other capitalized phrases
  ]
};

// Relationship patterns - enhanced for our sample documents
const RELATIONSHIP_PATTERNS = [
  // Employment/Leadership relationships
  { pattern: /\b(works at|employed by|CEO of|founder of|director of|led by|under the leadership of)\b/gi, type: 'employment' },
  { pattern: /\b(led|leads|leading)\b/gi, type: 'leadership' },
  
  // Collaboration/Partnership relationships
  { pattern: /\b(collaborated with|partnered with|worked with|teamed up with|partnership|collaboration)\b/gi, type: 'collaboration' },
  { pattern: /\b(partnered|has partnered|partners with)\b/gi, type: 'partnership' },
  
  // Research/Development relationships
  { pattern: /\b(researched|developed|created|invented|discovered|developed by|created by)\b/gi, type: 'achievement' },
  { pattern: /\b(focuses on|specialized in|expert in|knowledge of|specializes in)\b/gi, type: 'expertise' },
  
  // Team/Group relationships
  { pattern: /\b(team|group|division|department)\b/gi, type: 'team' },
  { pattern: /\b(includes|including|team includes)\b/gi, type: 'includes' },
  
  // Research/Study relationships
  { pattern: /\b(study|research|paper|published)\b/gi, type: 'research' },
  { pattern: /\b(on|about|regarding|concerning)\b/gi, type: 'topic' },
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
  console.log('Building graph with entities:', entities.length);
  console.log('Sample entities:', entities.slice(0, 5).map(e => `${e.text} (${e.type})`));
  
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

  // Extract relationships with improved logic
  const relationships: Relationship[] = [];
  
  documents.forEach(doc => {
    RELATIONSHIP_PATTERNS.forEach(({ pattern, type }) => {
      const matches = doc.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Find the position of the relationship in the document
          const matchIndex = doc.toLowerCase().indexOf(match.toLowerCase());
          
          if (matchIndex !== -1) {
            // Extract a window of text around the relationship
            const windowStart = Math.max(0, matchIndex - 200);
            const windowEnd = Math.min(doc.length, matchIndex + 200);
            const window = doc.substring(windowStart, windowEnd);
            
            // Find entities in this window
            const windowEntities: string[] = [];
            
            // Look for entities in the window
            entities.forEach(entity => {
              const entityIndex = window.toLowerCase().indexOf(entity.text.toLowerCase());
              if (entityIndex !== -1) {
                windowEntities.push(entity.text);
              }
            });
            
            // Create relationships between entities found in the same window
            for (let i = 0; i < windowEntities.length; i++) {
              for (let j = i + 1; j < windowEntities.length; j++) {
                const entity1 = windowEntities[i];
                const entity2 = windowEntities[j];
                
                const node1 = nodeMap.get(entity1.toLowerCase());
                const node2 = nodeMap.get(entity2.toLowerCase());
                
                if (node1 && node2 && node1 !== node2) {
                  // Check if this relationship already exists
                  const existingRel = relationships.find(r => 
                    (r.source === node1 && r.target === node2 && r.relationship === type) ||
                    (r.source === node2 && r.target === node1 && r.relationship === type)
                  );
                  
                  if (!existingRel) {
                    relationships.push({
                      source: node1,
                      target: node2,
                      relationship: type,
                      weight: 1,
                      context: match
                    });
                  }
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

  console.log('Extracted relationships:', relationships.length);
  console.log('Final edges:', edges.length);
  console.log('Sample relationships:', relationships.slice(0, 5).map(r => 
    `${r.source} -> ${r.target} (${r.relationship})`
  ));

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
