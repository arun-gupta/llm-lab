import { grpc } from 'grpc-web';
// import { GraphRAGServiceClient } from './generated/graphrag_grpc_web_pb';
// import { GraphQuery, GraphRAGResponse } from './generated/graphrag_pb';

// gRPC-Web client for GraphRAG service
export class GraphRAGWebClient {
  private client: GraphRAGServiceClient;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:50052') {
    this.serverUrl = serverUrl;
    this.client = new GraphRAGServiceClient(serverUrl);
  }

  // Query the knowledge graph with GraphRAG
  async queryGraph(query: string, graphId: string, model: string = 'gpt-4'): Promise<any> {
    const request = new GraphQuery();
    request.setQuery(query);
    request.setGraphId(graphId);
    request.setModel(model);

    return new Promise((resolve, reject) => {
      this.client.queryGraph(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.convertResponseToJson(response));
        }
      });
    });
  }

  // Stream graph traversal results
  async traverseGraph(query: string, graphId: string, model: string = 'gpt-4'): Promise<any[]> {
    const request = new GraphQuery();
    request.setQuery(query);
    request.setGraphId(graphId);
    request.setModel(model);

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = this.client.traverseGraph(request, {});

      stream.on('data', (response) => {
        results.push(this.convertNodeToJson(response));
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('end', () => {
        resolve(results);
      });
    });
  }

  // Stream context retrieval for GraphRAG
  async getContextStream(query: string, graphId: string, maxContextSize: number = 10): Promise<any[]> {
    const request = new GraphQuery();
    request.setQuery(query);
    request.setGraphId(graphId);

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = this.client.getContextStream(request, {});

      stream.on('data', (response) => {
        results.push(this.convertContextToJson(response));
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('end', () => {
        resolve(results);
      });
    });
  }

  // Convert protobuf response to JSON
  private convertResponseToJson(response: GraphRAGResponse): any {
    return {
      query_id: response.getQueryId(),
      query: response.getQuery(),
      graph_id: response.getGraphId(),
      model: response.getModel(),
      response: response.getResponse(),
      context: response.getContextList().map(chunk => this.convertContextToJson(chunk)),
      performance: response.getPerformance() ? {
        processing_time_ms: response.getPerformance()!.getProcessingTimeMs(),
        context_retrieval_time_ms: response.getPerformance()!.getContextRetrievalTimeMs(),
        llm_generation_time_ms: response.getPerformance()!.getLlmGenerationTimeMs(),
        total_nodes_accessed: response.getPerformance()!.getTotalNodesAccessed(),
        total_edges_traversed: response.getPerformance()!.getTotalEdgesTraversed(),
        compression_ratio: response.getPerformance()!.getCompressionRatio()
      } : null,
      relevant_nodes: response.getRelevantNodesList().map(node => this.convertNodeToJson(node)),
      timestamp: response.getTimestamp()
    };
  }

  // Convert protobuf node to JSON
  private convertNodeToJson(node: any): any {
    return {
      id: node.getId(),
      label: node.getLabel(),
      type: node.getType(),
      properties: node.getPropertiesMap() ? Object.fromEntries(node.getPropertiesMap()) : {},
      connections: node.getConnectionsList(),
      relevance_score: node.getRelevanceScore(),
      frequency: node.getFrequency()
    };
  }

  // Convert protobuf context to JSON
  private convertContextToJson(context: any): any {
    return {
      entity_id: context.getEntityId(),
      description: context.getDescription(),
      relevance_score: context.getRelevanceScore(),
      relationships: context.getRelationshipsList(),
      entity_type: context.getEntityType(),
      metadata: context.getMetadataMap() ? Object.fromEntries(context.getMetadataMap()) : {}
    };
  }
}

// Export a default instance
export const graphRAGWebClient = new GraphRAGWebClient();
