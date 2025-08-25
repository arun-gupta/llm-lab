// TypeScript definitions for GraphRAG gRPC-Web client
export interface GraphQuery {
  query: string;
  graph_id: string;
  model: string;
  max_depth?: number;
  node_types?: string[];
  streaming?: boolean;
}

export interface GraphRAGResponse {
  query_id: string;
  query: string;
  graph_id: string;
  model: string;
  response: string;
  context?: ContextChunk[];
  performance?: PerformanceMetrics;
  relevant_nodes?: GraphNode[];
  timestamp: string;
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

export interface ContextChunk {
  entity_id: string;
  description: string;
  relevance_score: number;
  relationships?: string[];
  entity_type: string;
  metadata?: { [key: string]: string };
}

export interface PerformanceMetrics {
  processing_time_ms: number;
  context_retrieval_time_ms: number;
  llm_generation_time_ms: number;
  total_nodes_accessed: number;
  total_edges_traversed: number;
  compression_ratio: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
}

export interface ContextRequest {
  query: string;
  graph_id: string;
  max_context_size?: number;
  relevance_threshold?: number;
  include_relationships?: boolean;
}

export interface EntityQuery {
  entity_name: string;
  graph_id: string;
  entity_types?: string[];
  max_results?: number;
  similarity_threshold?: number;
}

export interface EntityResolution {
  matches: EntityMatch[];
  total_found: number;
  search_time_ms: number;
  graph_id: string;
}

export interface EntityMatch {
  entity_id: string;
  entity_name: string;
  entity_type: string;
  similarity_score: number;
  properties?: string[];
  connections?: string[];
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface GraphBuildProgress {
  graph_id: string;
  status: string;
  progress_percentage: number;
  stats?: GraphStats;
  errors?: string[];
  estimated_completion: string;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  node_types?: string[];
  edge_types?: string[];
  density: number;
  connectivity: number;
  top_entities?: string[];
}

export interface GraphFilter {
  graph_id: string;
  node_types?: string[];
  edge_types?: string[];
  min_relevance?: number;
  max_results?: number;
}

export interface GraphUpdate {
  update_id: string;
  graph_id: string;
  update_type: string;
  node?: GraphNode;
  edge?: GraphEdge;
  timestamp: string;
  metadata?: { [key: string]: string };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  weight: number;
  properties?: { [key: string]: string };
}

export interface HealthCheck {
  service: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp: string;
  services?: { [key: string]: string };
  system_performance?: PerformanceMetrics;
}
