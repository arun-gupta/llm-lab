import { Database, aql } from 'arangojs';

// ArangoDB configuration
const ARANGO_CONFIG = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  databaseName: process.env.ARANGO_DB_NAME || 'graphrag',
  username: process.env.ARANGO_USERNAME || 'graphrag_user',
  password: process.env.ARANGO_PASSWORD || 'graphrag123',
};

// Database connection
let db: Database | null = null;

// Initialize database connection
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  try {
    db = new Database({
      url: ARANGO_CONFIG.url,
      databaseName: ARANGO_CONFIG.databaseName,
      auth: {
        username: ARANGO_CONFIG.username,
        password: ARANGO_CONFIG.password,
      },
    });

    // Test connection
    await db.version();
    console.log('✅ ArangoDB connected successfully');
    
    // Ensure collections and graph exist
    await ensureCollections();
    
    return db;
  } catch (error) {
    console.error('❌ ArangoDB connection failed:', error);
    throw new Error(`Failed to connect to ArangoDB: ${error}`);
  }
}

// Ensure required collections and graph exist
async function ensureCollections() {
  if (!db) throw new Error('Database not initialized');

  // Create collections if they don't exist
  const collections = ['entities', 'relationships', 'documents', 'graphs'];
  
  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    if (!(await collection.exists())) {
      await collection.create();
      console.log(`📁 Created collection: ${collectionName}`);
    }
  }

  // Create graph if it doesn't exist
  const graphName = 'knowledge_graph';
  const graph = db.graph(graphName);
  
  if (!(await graph.exists())) {
    await graph.create([
      {
        collection: 'relationships',
        from: ['entities'],
        to: ['entities']
      }
    ]);
    console.log(`🕸️ Created graph: ${graphName}`);
  }
}

// Graph data interfaces
export interface ArangoEntity {
  _key?: string;
  _id?: string;
  label: string;
  type: 'person' | 'organization' | 'concept' | 'document';
  frequency: number;
  connections: number;
  properties?: Record<string, any>;
  graphId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArangoRelationship {
  _key?: string;
  _id?: string;
  _from: string;
  _to: string;
  relationship: string;
  weight: number;
  context: string;
  graphId: string;
  createdAt: string;
}

export interface ArangoDocument {
  _key?: string;
  _id?: string;
  name: string;
  content: string;
  type: string;
  size: number;
  graphId: string;
  uploadedAt: string;
}

export interface ArangoGraph {
  _key?: string;
  _id?: string;
  name: string;
  description?: string;
  stats: {
    totalNodes: number;
    totalEdges: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
}

// Graph operations
export async function createGraph(graphData: ArangoGraph): Promise<string> {
  const database = await initDatabase();
  const collection = database.collection('graphs');
  
  const result = await collection.save({
    ...graphData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  return result._key!;
}

export async function getGraph(graphId: string): Promise<ArangoGraph | null> {
  const database = await initDatabase();
  const collection = database.collection('graphs');
  
  try {
    const graph = await collection.document(graphId);
    return graph as ArangoGraph;
  } catch (error) {
    return null;
  }
}

export async function getAllGraphs(): Promise<ArangoGraph[]> {
  const database = await initDatabase();
  const collection = database.collection('graphs');
  
  const cursor = await database.query(aql`
    FOR graph IN ${collection}
    SORT graph.createdAt DESC
    RETURN graph
  `);
  
  return await cursor.all();
}

// Entity operations
export async function createEntity(entity: Omit<ArangoEntity, '_key' | '_id'>): Promise<string> {
  const database = await initDatabase();
  const collection = database.collection('entities');
  
  const result = await collection.save({
    ...entity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  return result._key!;
}

export async function createEntities(entities: Omit<ArangoEntity, '_key' | '_id'>[]): Promise<string[]> {
  const database = await initDatabase();
  const collection = database.collection('entities');
  
  const entitiesWithTimestamps = entities.map(entity => ({
    ...entity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  
  const results = await collection.saveAll(entitiesWithTimestamps);
  return results.map(result => result._key!);
}

export async function getEntitiesByGraph(graphId: string): Promise<ArangoEntity[]> {
  const database = await initDatabase();
  const collection = database.collection('entities');
  
  const cursor = await database.query(aql`
    FOR entity IN ${collection}
    FILTER entity.graphId == ${graphId}
    RETURN entity
  `);
  
  return await cursor.all();
}

export async function searchEntities(query: string, graphId: string, limit: number = 10): Promise<ArangoEntity[]> {
  const database = await initDatabase();
  const collection = database.collection('entities');
  
  const cursor = await database.query(aql`
    FOR entity IN ${collection}
    FILTER entity.graphId == ${graphId}
    FILTER CONTAINS(LOWER(entity.label), LOWER(${query}))
    SORT entity.frequency DESC
    LIMIT ${limit}
    RETURN entity
  `);
  
  return await cursor.all();
}

// Relationship operations
export async function createRelationship(relationship: Omit<ArangoRelationship, '_key' | '_id'>): Promise<string> {
  const database = await initDatabase();
  const collection = database.collection('relationships');
  
  const result = await collection.save({
    ...relationship,
    createdAt: new Date().toISOString(),
  });
  
  return result._key!;
}

export async function createRelationships(relationships: Omit<ArangoRelationship, '_key' | '_id'>[]): Promise<string[]> {
  const database = await initDatabase();
  const collection = database.collection('relationships');
  
  const relationshipsWithTimestamp = relationships.map(rel => ({
    ...rel,
    createdAt: new Date().toISOString(),
  }));
  
  const results = await collection.saveAll(relationshipsWithTimestamp);
  return results.map(result => result._key!);
}

export async function getRelationshipsByGraph(graphId: string): Promise<ArangoRelationship[]> {
  const database = await initDatabase();
  const collection = database.collection('relationships');
  
  const cursor = await database.query(aql`
    FOR rel IN ${collection}
    FILTER rel.graphId == ${graphId}
    RETURN rel
  `);
  
  return await cursor.all();
}

// Document operations
export async function createDocument(document: Omit<ArangoDocument, '_key' | '_id'>): Promise<string> {
  const database = await initDatabase();
  const collection = database.collection('documents');
  
  const result = await collection.save({
    ...document,
    uploadedAt: new Date().toISOString(),
  });
  
  return result._key!;
}

export async function getDocumentsByGraph(graphId: string): Promise<ArangoDocument[]> {
  const database = await initDatabase();
  const collection = database.collection('documents');
  
  const cursor = await database.query(aql`
    FOR doc IN ${collection}
    FILTER doc.graphId == ${graphId}
    RETURN doc
  `);
  
  return await cursor.all();
}

// Graph traversal and querying
export async function getEntityRelationships(entityId: string, graphId: string, depth: number = 2): Promise<any[]> {
  const database = await initDatabase();
  
  const cursor = await database.query(aql`
    FOR entity IN entities
    FILTER entity._key == ${entityId} AND entity.graphId == ${graphId}
    FOR v, e, p IN ${depth}..${depth} OUTBOUND entity relationships
    FILTER e.graphId == ${graphId}
    RETURN {
      path: p,
      entity: v,
      relationship: e
    }
  `);
  
  return await cursor.all();
}

export async function getGraphStats(graphId: string): Promise<any> {
  const database = await initDatabase();
  
  const cursor = await database.query(aql`
    LET entities = (
      FOR entity IN entities
      FILTER entity.graphId == ${graphId}
      RETURN entity
    )
    LET relationships = (
      FOR rel IN relationships
      FILTER rel.graphId == ${graphId}
      RETURN rel
    )
    LET nodeTypes = (
      FOR entity IN entities
      COLLECT type = entity.type WITH COUNT INTO count
      RETURN { type, count }
    )
    LET edgeTypes = (
      FOR rel IN relationships
      COLLECT type = rel.relationship WITH COUNT INTO count
      RETURN { type, count }
    )
    RETURN {
      totalNodes: LENGTH(entities),
      totalEdges: LENGTH(relationships),
      nodeTypes: MERGE(
        FOR nt IN nodeTypes
        RETURN { [nt.type]: nt.count }
      ),
      edgeTypes: MERGE(
        FOR et IN edgeTypes
        RETURN { [et.type]: et.count }
      )
    }
  `);
  
  const result = await cursor.next();
  return result || { totalNodes: 0, totalEdges: 0, nodeTypes: {}, edgeTypes: {} };
}

// Migration helper: Convert existing JSON graph to ArangoDB
export async function migrateGraphFromJSON(graphId: string, jsonData: any): Promise<string> {
  const database = await initDatabase();
  
  // Create graph record
  const graphKey = await createGraph({
    name: graphId,
    description: `Migrated from JSON: ${graphId}`,
    stats: jsonData.stats || { totalNodes: 0, totalEdges: 0, nodeTypes: {}, edgeTypes: {} },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // Create entities
  const entities = jsonData.nodes.map((node: any) => ({
    label: node.label,
    type: node.type,
    frequency: node.frequency || 1,
    connections: node.connections || 0,
    properties: {},
    graphId: graphKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  
  const entityKeys = await createEntities(entities);
  const entityMap = new Map();
  jsonData.nodes.forEach((node: any, index: number) => {
    entityMap.set(node.id, entityKeys[index]);
  });
  
  // Create relationships
  const relationships = jsonData.edges.map((edge: any) => ({
    _from: `entities/${entityMap.get(edge.source)}`,
    _to: `entities/${entityMap.get(edge.target)}`,
    relationship: edge.relationship || 'related_to',
    weight: edge.weight || 1,
    context: edge.context || '',
    graphId: graphKey,
    createdAt: new Date().toISOString(),
  }));
  
  await createRelationships(relationships);
  
  return graphKey;
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const database = await initDatabase();
    await database.version();
    return true;
  } catch (error) {
    console.error('ArangoDB health check failed:', error);
    return false;
  }
}
