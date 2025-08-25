// Simple gRPC-Web client implementation for GraphRAG
// This is a simplified version that uses HTTP/JSON for now

export class GraphRAGServiceClient {
  constructor(serverUrl = 'http://localhost:50052') {
    this.serverUrl = serverUrl;
  }

  async queryGraph(request) {
    const response = await fetch(`${this.serverUrl}/graphrag.GraphRAGService/QueryGraph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`gRPC-Web error: ${response.status}`);
    }

    return await response.json();
  }

  async traverseGraph(request) {
    const response = await fetch(`${this.serverUrl}/graphrag.GraphRAGService/TraverseGraph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`gRPC-Web error: ${response.status}`);
    }

    return await response.json();
  }

  async getContextStream(request) {
    const response = await fetch(`${this.serverUrl}/graphrag.GraphRAGService/GetContextStream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`gRPC-Web error: ${response.status}`);
    }

    return await response.json();
  }

  async resolveEntities(request) {
    const response = await fetch(`${this.serverUrl}/graphrag.GraphRAGService/ResolveEntities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`gRPC-Web error: ${response.status}`);
    }

    return await response.json();
  }

  async healthCheck(request) {
    const response = await fetch(`${this.serverUrl}/graphrag.GraphRAGService/HealthCheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`gRPC-Web error: ${response.status}`);
    }

    return await response.json();
  }
}
