// TypeScript definitions for GraphRAG gRPC-Web service client
import { GraphQuery, GraphRAGResponse, ContextRequest, ContextChunk, EntityQuery, EntityResolution, HealthCheck, HealthCheckResponse } from './graphrag_pb';

export class GraphRAGServiceClient {
  constructor(serverUrl?: string);

  queryGraph(request: GraphQuery): Promise<GraphRAGResponse>;
  traverseGraph(request: GraphQuery): Promise<GraphNode[]>;
  getContextStream(request: ContextRequest): Promise<ContextChunk[]>;
  resolveEntities(request: EntityQuery): Promise<EntityResolution>;
  healthCheck(request: HealthCheck): Promise<HealthCheckResponse>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties?: { [key: string]: string };
  connections?: string[];
  relevance_score?: number;
  frequency?: number;
}
