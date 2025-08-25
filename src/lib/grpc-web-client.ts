import { GraphRAGServiceClient } from './generated/graphrag_grpc_web_pb';
import type { GraphQuery, GraphRAGResponse, ContextRequest, EntityQuery } from './generated/graphrag_pb';

// gRPC-Web client for GraphRAG service
export class GraphRAGWebClient {
  private client: GraphRAGServiceClient;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:50053') {
    this.serverUrl = serverUrl;
    this.client = new GraphRAGServiceClient(serverUrl);
  }

  // Query the knowledge graph with GraphRAG
  async queryGraph(query: string, graphId: string, model: string = 'gpt-4'): Promise<any> {
    const request: GraphQuery = {
      query,
      graph_id: graphId,
      model
    };

    return new Promise((resolve, reject) => {
      this.client.queryGraph(request)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // Stream graph traversal results
  async traverseGraph(query: string, graphId: string, model: string = 'gpt-4'): Promise<any[]> {
    const request: GraphQuery = {
      query,
      graph_id: graphId,
      model
    };

    return new Promise((resolve, reject) => {
      this.client.traverseGraph(request)
        .then(response => {
          resolve(Array.isArray(response) ? response : [response]);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // Stream context retrieval for GraphRAG
  async getContextStream(query: string, graphId: string, maxContextSize: number = 10): Promise<any[]> {
    const request: ContextRequest = {
      query,
      graph_id: graphId,
      max_context_size: maxContextSize
    };

    return new Promise((resolve, reject) => {
      this.client.getContextStream(request)
        .then(response => {
          resolve(Array.isArray(response) ? response : [response]);
        })
        .catch(err => {
          reject(err);
        });
    });
  }


}

// Export a default instance
export const graphRAGWebClient = new GraphRAGWebClient();
