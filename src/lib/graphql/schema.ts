import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Graph Node (Entity)
  type GraphNode {
    id: ID!
    label: String!
    type: String!
    properties: JSON
    connections: Int!
  }

  # Graph Edge (Relationship)
  type GraphEdge {
    id: ID!
    source: String!
    target: String!
    label: String!
    type: String!
    properties: JSON
  }

  # Graph Data Structure
  type GraphData {
    id: ID!
    name: String!
    nodes: [GraphNode!]!
    edges: [GraphEdge!]!
    stats: GraphStats!
    createdAt: String!
    updatedAt: String!
  }

  # Graph Statistics
  type GraphStats {
    totalNodes: Int!
    totalEdges: Int!
    nodeTypes: JSON!
    edgeTypes: JSON!
    density: Float!
    connectivity: Float!
  }

  # Document Information
  type Document {
    id: ID!
    name: String!
    type: String!
    size: Int!
    content: String
    uploadedAt: String!
  }

  # GraphRAG Query Response
  type GraphRAGResponse {
    query: String!
    model: String!
    graphRAGResponse: String!
    traditionalRAGResponse: String!
    graphContext: [String!]!
    performance: PerformanceMetrics!
    analytics: AnalyticsData!
  }

  # Performance Metrics
  type PerformanceMetrics {
    graphRAGLatency: Int!
    traditionalRAGLatency: Int!
    contextRelevance: Float!
  }

  # Analytics Data
  type AnalyticsData {
    tokens: TokenAnalytics!
    quality: QualityMetrics!
    graph: GraphCoverage!
  }

  # Token Analytics
  type TokenAnalytics {
    graphRAG: TokenUsage!
    traditionalRAG: TokenUsage!
  }

  # Token Usage
  type TokenUsage {
    input: Int!
    output: Int!
    total: Int!
    efficiency: Float!
    cost: Float!
  }

  # Quality Metrics
  type QualityMetrics {
    graphRAG: QualityScore!
    traditionalRAG: QualityScore!
  }

  # Quality Score
  type QualityScore {
    length: Int!
    completeness: Float!
    specificity: Float!
    readability: Float!
  }

  # Graph Coverage
  type GraphCoverage {
    totalNodes: Int!
    totalEdges: Int!
    usedEntities: Int!
    usedRelationships: Int!
    coveragePercentage: Float!
    relationshipUtilization: Float!
    entityTypeDistribution: JSON!
  }

  # Analytics Overview
  type AnalyticsOverview {
    graphStats: GraphAnalyticsStats!
    documentStats: DocumentAnalyticsStats!
    apiStats: APIAnalyticsStats!
    insights: GraphInsights!
    timestamp: String!
    version: String!
  }

  # Graph Analytics Stats
  type GraphAnalyticsStats {
    totalGraphs: Int!
    totalNodes: Int!
    totalEdges: Int!
    averageNodesPerGraph: Float!
    averageEdgesPerGraph: Float!
    nodeTypes: JSON!
    edgeTypes: JSON!
  }

  # Document Analytics Stats
  type DocumentAnalyticsStats {
    totalDocuments: Int!
    documentTypes: [String!]!
    averageDocumentSize: Float!
    sampleDocuments: [String!]!
  }

  # API Analytics Stats
  type APIAnalyticsStats {
    endpoints: [APIEndpoint!]!
    recentQueries: Int!
    averageResponseTime: Float!
  }

  # API Endpoint
  type APIEndpoint {
    name: String!
    method: String!
    path: String!
    description: String!
  }

  # Graph Insights
  type GraphInsights {
    mostCommonEntities: [String!]!
    mostCommonRelationships: [String!]!
    graphDensity: Float!
    connectivityScore: Float!
  }

  # Graph Building Progress
  type GraphBuildProgress {
    status: String!
    percentage: Float!
    message: String!
    graphId: String
    stats: GraphStats
  }

  # Query Input
  input GraphRAGQueryInput {
    query: String!
    graphId: ID!
    model: String = "gpt-5-nano"
  }

  # Document Upload Input
  input DocumentUploadInput {
    files: [Upload!]!
  }

  # Graph Filter Input
  input GraphFilterInput {
    graphId: ID
    nodeType: String
    edgeType: String
    limit: Int = 100
  }

  # Analytics Filter Input
  input AnalyticsFilterInput {
    graphId: ID
    dateRange: String
    nodeType: String
  }

  # Root Query Type
  type Query {
    # Get all graphs
    graphs(filter: GraphFilterInput): [GraphData!]!
    
    # Get specific graph
    graph(id: ID!): GraphData
    
    # Get documents
    documents: [Document!]!
    
    # Get specific document
    document(id: ID!): Document
    
    # GraphRAG query
    graphRAGQuery(input: GraphRAGQueryInput!): GraphRAGResponse!
    
    # Get analytics
    analytics(filter: AnalyticsFilterInput): AnalyticsOverview!
    
    # Get graph preview data
    graphPreview(id: ID!): GraphData
    
    # Search entities
    searchEntities(query: String!, graphId: ID, limit: Int = 10): [GraphNode!]!
    
    # Get entity relationships
    entityRelationships(entityId: String!, graphId: ID!, depth: Int = 2): [GraphEdge!]!
    
    # Get graph statistics
    graphStatistics(id: ID!): GraphStats!
  }

  # Root Mutation Type
  type Mutation {
    # Upload documents and build graph
    buildGraph(input: DocumentUploadInput!): GraphBuildProgress!
    
    # Delete graph
    deleteGraph(id: ID!): Boolean!
    
    # Update graph metadata
    updateGraph(id: ID!, name: String): GraphData!
    
    # Add document
    addDocument(file: Upload!): Document!
    
    # Delete document
    deleteDocument(id: ID!): Boolean!
  }

  # Root Subscription Type
  type Subscription {
    # Graph building progress
    graphBuildProgress(graphId: ID!): GraphBuildProgress!
    
    # Graph updates
    graphUpdated(graphId: ID!): GraphData!
  }

  # Scalar for JSON data
  scalar JSON

  # Scalar for file uploads
  scalar Upload
`;
