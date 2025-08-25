export function encodeGraphQuery(message) {
  let bb = popByteBuffer();
  _encodeGraphQuery(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphQuery(message, bb) {
  // optional string query = 1;
  let $query = message.query;
  if ($query !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $query);
  }

  // optional string graph_id = 2;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $graph_id);
  }

  // optional string model = 3;
  let $model = message.model;
  if ($model !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $model);
  }

  // optional int32 max_depth = 4;
  let $max_depth = message.max_depth;
  if ($max_depth !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($max_depth));
  }

  // repeated string node_types = 5;
  let array$node_types = message.node_types;
  if (array$node_types !== undefined) {
    for (let value of array$node_types) {
      writeVarint32(bb, 42);
      writeString(bb, value);
    }
  }

  // optional bool streaming = 6;
  let $streaming = message.streaming;
  if ($streaming !== undefined) {
    writeVarint32(bb, 48);
    writeByte(bb, $streaming ? 1 : 0);
  }
}

export function decodeGraphQuery(binary) {
  return _decodeGraphQuery(wrapByteBuffer(binary));
}

function _decodeGraphQuery(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string query = 1;
      case 1: {
        message.query = readString(bb, readVarint32(bb));
        break;
      }

      // optional string graph_id = 2;
      case 2: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string model = 3;
      case 3: {
        message.model = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 max_depth = 4;
      case 4: {
        message.max_depth = readVarint32(bb);
        break;
      }

      // repeated string node_types = 5;
      case 5: {
        let values = message.node_types || (message.node_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional bool streaming = 6;
      case 6: {
        message.streaming = !!readByte(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphRAGResponse(message) {
  let bb = popByteBuffer();
  _encodeGraphRAGResponse(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphRAGResponse(message, bb) {
  // optional string query_id = 1;
  let $query_id = message.query_id;
  if ($query_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $query_id);
  }

  // optional string query = 2;
  let $query = message.query;
  if ($query !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $query);
  }

  // optional string graph_id = 3;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $graph_id);
  }

  // optional string model = 4;
  let $model = message.model;
  if ($model !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $model);
  }

  // optional string response = 5;
  let $response = message.response;
  if ($response !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $response);
  }

  // repeated ContextChunk context = 6;
  let array$context = message.context;
  if (array$context !== undefined) {
    for (let value of array$context) {
      writeVarint32(bb, 50);
      let nested = popByteBuffer();
      _encodeContextChunk(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional PerformanceMetrics performance = 7;
  let $performance = message.performance;
  if ($performance !== undefined) {
    writeVarint32(bb, 58);
    let nested = popByteBuffer();
    _encodePerformanceMetrics($performance, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // repeated GraphNode relevant_nodes = 8;
  let array$relevant_nodes = message.relevant_nodes;
  if (array$relevant_nodes !== undefined) {
    for (let value of array$relevant_nodes) {
      writeVarint32(bb, 66);
      let nested = popByteBuffer();
      _encodeGraphNode(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional string timestamp = 9;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 74);
    writeString(bb, $timestamp);
  }
}

export function decodeGraphRAGResponse(binary) {
  return _decodeGraphRAGResponse(wrapByteBuffer(binary));
}

function _decodeGraphRAGResponse(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string query_id = 1;
      case 1: {
        message.query_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string query = 2;
      case 2: {
        message.query = readString(bb, readVarint32(bb));
        break;
      }

      // optional string graph_id = 3;
      case 3: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string model = 4;
      case 4: {
        message.model = readString(bb, readVarint32(bb));
        break;
      }

      // optional string response = 5;
      case 5: {
        message.response = readString(bb, readVarint32(bb));
        break;
      }

      // repeated ContextChunk context = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        let values = message.context || (message.context = []);
        values.push(_decodeContextChunk(bb));
        bb.limit = limit;
        break;
      }

      // optional PerformanceMetrics performance = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        message.performance = _decodePerformanceMetrics(bb);
        bb.limit = limit;
        break;
      }

      // repeated GraphNode relevant_nodes = 8;
      case 8: {
        let limit = pushTemporaryLength(bb);
        let values = message.relevant_nodes || (message.relevant_nodes = []);
        values.push(_decodeGraphNode(bb));
        bb.limit = limit;
        break;
      }

      // optional string timestamp = 9;
      case 9: {
        message.timestamp = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphNode(message) {
  let bb = popByteBuffer();
  _encodeGraphNode(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphNode(message, bb) {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string label = 2;
  let $label = message.label;
  if ($label !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $label);
  }

  // optional string type = 3;
  let $type = message.type;
  if ($type !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $type);
  }

  // optional map<string, string> properties = 4;
  let map$properties = message.properties;
  if (map$properties !== undefined) {
    for (let key in map$properties) {
      let nested = popByteBuffer();
      let value = map$properties[key];
      writeVarint32(nested, 10);
      writeString(nested, key);
      writeVarint32(nested, 18);
      writeString(nested, value);
      writeVarint32(bb, 34);
      writeVarint32(bb, nested.offset);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // repeated string connections = 5;
  let array$connections = message.connections;
  if (array$connections !== undefined) {
    for (let value of array$connections) {
      writeVarint32(bb, 42);
      writeString(bb, value);
    }
  }

  // optional float relevance_score = 6;
  let $relevance_score = message.relevance_score;
  if ($relevance_score !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $relevance_score);
  }

  // optional int32 frequency = 7;
  let $frequency = message.frequency;
  if ($frequency !== undefined) {
    writeVarint32(bb, 56);
    writeVarint64(bb, intToLong($frequency));
  }
}

export function decodeGraphNode(binary) {
  return _decodeGraphNode(wrapByteBuffer(binary));
}

function _decodeGraphNode(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string label = 2;
      case 2: {
        message.label = readString(bb, readVarint32(bb));
        break;
      }

      // optional string type = 3;
      case 3: {
        message.type = readString(bb, readVarint32(bb));
        break;
      }

      // optional map<string, string> properties = 4;
      case 4: {
        let values = message.properties || (message.properties = {});
        let outerLimit = pushTemporaryLength(bb);
        let key;
        let value;
        end_of_entry: while (!isAtEnd(bb)) {
          let tag = readVarint32(bb);
          switch (tag >>> 3) {
            case 0:
              break end_of_entry;
            case 1: {
              key = readString(bb, readVarint32(bb));
              break;
            }
            case 2: {
              value = readString(bb, readVarint32(bb));
              break;
            }
            default:
              skipUnknownField(bb, tag & 7);
          }
        }
        if (key === undefined || value === undefined)
          throw new Error("Invalid data for map: properties");
        values[key] = value;
        bb.limit = outerLimit;
        break;
      }

      // repeated string connections = 5;
      case 5: {
        let values = message.connections || (message.connections = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional float relevance_score = 6;
      case 6: {
        message.relevance_score = readFloat(bb);
        break;
      }

      // optional int32 frequency = 7;
      case 7: {
        message.frequency = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeContextRequest(message) {
  let bb = popByteBuffer();
  _encodeContextRequest(message, bb);
  return toUint8Array(bb);
}

function _encodeContextRequest(message, bb) {
  // optional string query = 1;
  let $query = message.query;
  if ($query !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $query);
  }

  // optional string graph_id = 2;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $graph_id);
  }

  // optional int32 max_context_size = 3;
  let $max_context_size = message.max_context_size;
  if ($max_context_size !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($max_context_size));
  }

  // optional float relevance_threshold = 4;
  let $relevance_threshold = message.relevance_threshold;
  if ($relevance_threshold !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $relevance_threshold);
  }

  // optional bool include_relationships = 5;
  let $include_relationships = message.include_relationships;
  if ($include_relationships !== undefined) {
    writeVarint32(bb, 40);
    writeByte(bb, $include_relationships ? 1 : 0);
  }
}

export function decodeContextRequest(binary) {
  return _decodeContextRequest(wrapByteBuffer(binary));
}

function _decodeContextRequest(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string query = 1;
      case 1: {
        message.query = readString(bb, readVarint32(bb));
        break;
      }

      // optional string graph_id = 2;
      case 2: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 max_context_size = 3;
      case 3: {
        message.max_context_size = readVarint32(bb);
        break;
      }

      // optional float relevance_threshold = 4;
      case 4: {
        message.relevance_threshold = readFloat(bb);
        break;
      }

      // optional bool include_relationships = 5;
      case 5: {
        message.include_relationships = !!readByte(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeContextChunk(message) {
  let bb = popByteBuffer();
  _encodeContextChunk(message, bb);
  return toUint8Array(bb);
}

function _encodeContextChunk(message, bb) {
  // optional string entity_id = 1;
  let $entity_id = message.entity_id;
  if ($entity_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $entity_id);
  }

  // optional string description = 2;
  let $description = message.description;
  if ($description !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $description);
  }

  // optional float relevance_score = 3;
  let $relevance_score = message.relevance_score;
  if ($relevance_score !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $relevance_score);
  }

  // repeated string relationships = 4;
  let array$relationships = message.relationships;
  if (array$relationships !== undefined) {
    for (let value of array$relationships) {
      writeVarint32(bb, 34);
      writeString(bb, value);
    }
  }

  // optional string entity_type = 5;
  let $entity_type = message.entity_type;
  if ($entity_type !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $entity_type);
  }

  // optional map<string, string> metadata = 6;
  let map$metadata = message.metadata;
  if (map$metadata !== undefined) {
    for (let key in map$metadata) {
      let nested = popByteBuffer();
      let value = map$metadata[key];
      writeVarint32(nested, 10);
      writeString(nested, key);
      writeVarint32(nested, 18);
      writeString(nested, value);
      writeVarint32(bb, 50);
      writeVarint32(bb, nested.offset);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeContextChunk(binary) {
  return _decodeContextChunk(wrapByteBuffer(binary));
}

function _decodeContextChunk(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string entity_id = 1;
      case 1: {
        message.entity_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string description = 2;
      case 2: {
        message.description = readString(bb, readVarint32(bb));
        break;
      }

      // optional float relevance_score = 3;
      case 3: {
        message.relevance_score = readFloat(bb);
        break;
      }

      // repeated string relationships = 4;
      case 4: {
        let values = message.relationships || (message.relationships = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional string entity_type = 5;
      case 5: {
        message.entity_type = readString(bb, readVarint32(bb));
        break;
      }

      // optional map<string, string> metadata = 6;
      case 6: {
        let values = message.metadata || (message.metadata = {});
        let outerLimit = pushTemporaryLength(bb);
        let key;
        let value;
        end_of_entry: while (!isAtEnd(bb)) {
          let tag = readVarint32(bb);
          switch (tag >>> 3) {
            case 0:
              break end_of_entry;
            case 1: {
              key = readString(bb, readVarint32(bb));
              break;
            }
            case 2: {
              value = readString(bb, readVarint32(bb));
              break;
            }
            default:
              skipUnknownField(bb, tag & 7);
          }
        }
        if (key === undefined || value === undefined)
          throw new Error("Invalid data for map: metadata");
        values[key] = value;
        bb.limit = outerLimit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeEntityQuery(message) {
  let bb = popByteBuffer();
  _encodeEntityQuery(message, bb);
  return toUint8Array(bb);
}

function _encodeEntityQuery(message, bb) {
  // optional string entity_name = 1;
  let $entity_name = message.entity_name;
  if ($entity_name !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $entity_name);
  }

  // optional string graph_id = 2;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $graph_id);
  }

  // repeated string entity_types = 3;
  let array$entity_types = message.entity_types;
  if (array$entity_types !== undefined) {
    for (let value of array$entity_types) {
      writeVarint32(bb, 26);
      writeString(bb, value);
    }
  }

  // optional int32 max_results = 4;
  let $max_results = message.max_results;
  if ($max_results !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($max_results));
  }

  // optional float similarity_threshold = 5;
  let $similarity_threshold = message.similarity_threshold;
  if ($similarity_threshold !== undefined) {
    writeVarint32(bb, 45);
    writeFloat(bb, $similarity_threshold);
  }
}

export function decodeEntityQuery(binary) {
  return _decodeEntityQuery(wrapByteBuffer(binary));
}

function _decodeEntityQuery(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string entity_name = 1;
      case 1: {
        message.entity_name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string graph_id = 2;
      case 2: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // repeated string entity_types = 3;
      case 3: {
        let values = message.entity_types || (message.entity_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional int32 max_results = 4;
      case 4: {
        message.max_results = readVarint32(bb);
        break;
      }

      // optional float similarity_threshold = 5;
      case 5: {
        message.similarity_threshold = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeEntityResolution(message) {
  let bb = popByteBuffer();
  _encodeEntityResolution(message, bb);
  return toUint8Array(bb);
}

function _encodeEntityResolution(message, bb) {
  // repeated EntityMatch matches = 1;
  let array$matches = message.matches;
  if (array$matches !== undefined) {
    for (let value of array$matches) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodeEntityMatch(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional int32 total_found = 2;
  let $total_found = message.total_found;
  if ($total_found !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, intToLong($total_found));
  }

  // optional float search_time_ms = 3;
  let $search_time_ms = message.search_time_ms;
  if ($search_time_ms !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $search_time_ms);
  }

  // optional string graph_id = 4;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $graph_id);
  }
}

export function decodeEntityResolution(binary) {
  return _decodeEntityResolution(wrapByteBuffer(binary));
}

function _decodeEntityResolution(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated EntityMatch matches = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.matches || (message.matches = []);
        values.push(_decodeEntityMatch(bb));
        bb.limit = limit;
        break;
      }

      // optional int32 total_found = 2;
      case 2: {
        message.total_found = readVarint32(bb);
        break;
      }

      // optional float search_time_ms = 3;
      case 3: {
        message.search_time_ms = readFloat(bb);
        break;
      }

      // optional string graph_id = 4;
      case 4: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeEntityMatch(message) {
  let bb = popByteBuffer();
  _encodeEntityMatch(message, bb);
  return toUint8Array(bb);
}

function _encodeEntityMatch(message, bb) {
  // optional string entity_id = 1;
  let $entity_id = message.entity_id;
  if ($entity_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $entity_id);
  }

  // optional string entity_name = 2;
  let $entity_name = message.entity_name;
  if ($entity_name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $entity_name);
  }

  // optional string entity_type = 3;
  let $entity_type = message.entity_type;
  if ($entity_type !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $entity_type);
  }

  // optional float similarity_score = 4;
  let $similarity_score = message.similarity_score;
  if ($similarity_score !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $similarity_score);
  }

  // repeated string properties = 5;
  let array$properties = message.properties;
  if (array$properties !== undefined) {
    for (let value of array$properties) {
      writeVarint32(bb, 42);
      writeString(bb, value);
    }
  }

  // repeated string connections = 6;
  let array$connections = message.connections;
  if (array$connections !== undefined) {
    for (let value of array$connections) {
      writeVarint32(bb, 50);
      writeString(bb, value);
    }
  }
}

export function decodeEntityMatch(binary) {
  return _decodeEntityMatch(wrapByteBuffer(binary));
}

function _decodeEntityMatch(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string entity_id = 1;
      case 1: {
        message.entity_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string entity_name = 2;
      case 2: {
        message.entity_name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string entity_type = 3;
      case 3: {
        message.entity_type = readString(bb, readVarint32(bb));
        break;
      }

      // optional float similarity_score = 4;
      case 4: {
        message.similarity_score = readFloat(bb);
        break;
      }

      // repeated string properties = 5;
      case 5: {
        let values = message.properties || (message.properties = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // repeated string connections = 6;
      case 6: {
        let values = message.connections || (message.connections = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeDocument(message) {
  let bb = popByteBuffer();
  _encodeDocument(message, bb);
  return toUint8Array(bb);
}

function _encodeDocument(message, bb) {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string name = 2;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $name);
  }

  // optional string content = 3;
  let $content = message.content;
  if ($content !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $content);
  }

  // optional string type = 4;
  let $type = message.type;
  if ($type !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $type);
  }

  // optional int64 size = 5;
  let $size = message.size;
  if ($size !== undefined) {
    writeVarint32(bb, 40);
    writeVarint64(bb, $size);
  }

  // optional string uploaded_at = 6;
  let $uploaded_at = message.uploaded_at;
  if ($uploaded_at !== undefined) {
    writeVarint32(bb, 50);
    writeString(bb, $uploaded_at);
  }
}

export function decodeDocument(binary) {
  return _decodeDocument(wrapByteBuffer(binary));
}

function _decodeDocument(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string name = 2;
      case 2: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string content = 3;
      case 3: {
        message.content = readString(bb, readVarint32(bb));
        break;
      }

      // optional string type = 4;
      case 4: {
        message.type = readString(bb, readVarint32(bb));
        break;
      }

      // optional int64 size = 5;
      case 5: {
        message.size = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional string uploaded_at = 6;
      case 6: {
        message.uploaded_at = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphBuildProgress(message) {
  let bb = popByteBuffer();
  _encodeGraphBuildProgress(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphBuildProgress(message, bb) {
  // optional string graph_id = 1;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $graph_id);
  }

  // optional string status = 2;
  let $status = message.status;
  if ($status !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $status);
  }

  // optional int32 progress_percentage = 3;
  let $progress_percentage = message.progress_percentage;
  if ($progress_percentage !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($progress_percentage));
  }

  // optional GraphStats stats = 4;
  let $stats = message.stats;
  if ($stats !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeGraphStats($stats, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // repeated string errors = 5;
  let array$errors = message.errors;
  if (array$errors !== undefined) {
    for (let value of array$errors) {
      writeVarint32(bb, 42);
      writeString(bb, value);
    }
  }

  // optional string estimated_completion = 6;
  let $estimated_completion = message.estimated_completion;
  if ($estimated_completion !== undefined) {
    writeVarint32(bb, 50);
    writeString(bb, $estimated_completion);
  }
}

export function decodeGraphBuildProgress(binary) {
  return _decodeGraphBuildProgress(wrapByteBuffer(binary));
}

function _decodeGraphBuildProgress(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string graph_id = 1;
      case 1: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string status = 2;
      case 2: {
        message.status = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 progress_percentage = 3;
      case 3: {
        message.progress_percentage = readVarint32(bb);
        break;
      }

      // optional GraphStats stats = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.stats = _decodeGraphStats(bb);
        bb.limit = limit;
        break;
      }

      // repeated string errors = 5;
      case 5: {
        let values = message.errors || (message.errors = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional string estimated_completion = 6;
      case 6: {
        message.estimated_completion = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphStats(message) {
  let bb = popByteBuffer();
  _encodeGraphStats(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphStats(message, bb) {
  // optional int32 total_nodes = 1;
  let $total_nodes = message.total_nodes;
  if ($total_nodes !== undefined) {
    writeVarint32(bb, 8);
    writeVarint64(bb, intToLong($total_nodes));
  }

  // optional int32 total_edges = 2;
  let $total_edges = message.total_edges;
  if ($total_edges !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, intToLong($total_edges));
  }

  // repeated string node_types = 3;
  let array$node_types = message.node_types;
  if (array$node_types !== undefined) {
    for (let value of array$node_types) {
      writeVarint32(bb, 26);
      writeString(bb, value);
    }
  }

  // repeated string edge_types = 4;
  let array$edge_types = message.edge_types;
  if (array$edge_types !== undefined) {
    for (let value of array$edge_types) {
      writeVarint32(bb, 34);
      writeString(bb, value);
    }
  }

  // optional float density = 5;
  let $density = message.density;
  if ($density !== undefined) {
    writeVarint32(bb, 45);
    writeFloat(bb, $density);
  }

  // optional float connectivity = 6;
  let $connectivity = message.connectivity;
  if ($connectivity !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $connectivity);
  }

  // repeated string top_entities = 7;
  let array$top_entities = message.top_entities;
  if (array$top_entities !== undefined) {
    for (let value of array$top_entities) {
      writeVarint32(bb, 58);
      writeString(bb, value);
    }
  }
}

export function decodeGraphStats(binary) {
  return _decodeGraphStats(wrapByteBuffer(binary));
}

function _decodeGraphStats(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional int32 total_nodes = 1;
      case 1: {
        message.total_nodes = readVarint32(bb);
        break;
      }

      // optional int32 total_edges = 2;
      case 2: {
        message.total_edges = readVarint32(bb);
        break;
      }

      // repeated string node_types = 3;
      case 3: {
        let values = message.node_types || (message.node_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // repeated string edge_types = 4;
      case 4: {
        let values = message.edge_types || (message.edge_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional float density = 5;
      case 5: {
        message.density = readFloat(bb);
        break;
      }

      // optional float connectivity = 6;
      case 6: {
        message.connectivity = readFloat(bb);
        break;
      }

      // repeated string top_entities = 7;
      case 7: {
        let values = message.top_entities || (message.top_entities = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphFilter(message) {
  let bb = popByteBuffer();
  _encodeGraphFilter(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphFilter(message, bb) {
  // optional string graph_id = 1;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $graph_id);
  }

  // repeated string node_types = 2;
  let array$node_types = message.node_types;
  if (array$node_types !== undefined) {
    for (let value of array$node_types) {
      writeVarint32(bb, 18);
      writeString(bb, value);
    }
  }

  // repeated string edge_types = 3;
  let array$edge_types = message.edge_types;
  if (array$edge_types !== undefined) {
    for (let value of array$edge_types) {
      writeVarint32(bb, 26);
      writeString(bb, value);
    }
  }

  // optional float min_relevance = 4;
  let $min_relevance = message.min_relevance;
  if ($min_relevance !== undefined) {
    writeVarint32(bb, 37);
    writeFloat(bb, $min_relevance);
  }

  // optional int32 max_results = 5;
  let $max_results = message.max_results;
  if ($max_results !== undefined) {
    writeVarint32(bb, 40);
    writeVarint64(bb, intToLong($max_results));
  }
}

export function decodeGraphFilter(binary) {
  return _decodeGraphFilter(wrapByteBuffer(binary));
}

function _decodeGraphFilter(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string graph_id = 1;
      case 1: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // repeated string node_types = 2;
      case 2: {
        let values = message.node_types || (message.node_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // repeated string edge_types = 3;
      case 3: {
        let values = message.edge_types || (message.edge_types = []);
        values.push(readString(bb, readVarint32(bb)));
        break;
      }

      // optional float min_relevance = 4;
      case 4: {
        message.min_relevance = readFloat(bb);
        break;
      }

      // optional int32 max_results = 5;
      case 5: {
        message.max_results = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphUpdate(message) {
  let bb = popByteBuffer();
  _encodeGraphUpdate(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphUpdate(message, bb) {
  // optional string update_id = 1;
  let $update_id = message.update_id;
  if ($update_id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $update_id);
  }

  // optional string graph_id = 2;
  let $graph_id = message.graph_id;
  if ($graph_id !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $graph_id);
  }

  // optional string update_type = 3;
  let $update_type = message.update_type;
  if ($update_type !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $update_type);
  }

  // optional GraphNode node = 4;
  let $node = message.node;
  if ($node !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeGraphNode($node, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional GraphEdge edge = 5;
  let $edge = message.edge;
  if ($edge !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeGraphEdge($edge, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional string timestamp = 6;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 50);
    writeString(bb, $timestamp);
  }

  // optional map<string, string> metadata = 7;
  let map$metadata = message.metadata;
  if (map$metadata !== undefined) {
    for (let key in map$metadata) {
      let nested = popByteBuffer();
      let value = map$metadata[key];
      writeVarint32(nested, 10);
      writeString(nested, key);
      writeVarint32(nested, 18);
      writeString(nested, value);
      writeVarint32(bb, 58);
      writeVarint32(bb, nested.offset);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeGraphUpdate(binary) {
  return _decodeGraphUpdate(wrapByteBuffer(binary));
}

function _decodeGraphUpdate(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string update_id = 1;
      case 1: {
        message.update_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string graph_id = 2;
      case 2: {
        message.graph_id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string update_type = 3;
      case 3: {
        message.update_type = readString(bb, readVarint32(bb));
        break;
      }

      // optional GraphNode node = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.node = _decodeGraphNode(bb);
        bb.limit = limit;
        break;
      }

      // optional GraphEdge edge = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.edge = _decodeGraphEdge(bb);
        bb.limit = limit;
        break;
      }

      // optional string timestamp = 6;
      case 6: {
        message.timestamp = readString(bb, readVarint32(bb));
        break;
      }

      // optional map<string, string> metadata = 7;
      case 7: {
        let values = message.metadata || (message.metadata = {});
        let outerLimit = pushTemporaryLength(bb);
        let key;
        let value;
        end_of_entry: while (!isAtEnd(bb)) {
          let tag = readVarint32(bb);
          switch (tag >>> 3) {
            case 0:
              break end_of_entry;
            case 1: {
              key = readString(bb, readVarint32(bb));
              break;
            }
            case 2: {
              value = readString(bb, readVarint32(bb));
              break;
            }
            default:
              skipUnknownField(bb, tag & 7);
          }
        }
        if (key === undefined || value === undefined)
          throw new Error("Invalid data for map: metadata");
        values[key] = value;
        bb.limit = outerLimit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeGraphEdge(message) {
  let bb = popByteBuffer();
  _encodeGraphEdge(message, bb);
  return toUint8Array(bb);
}

function _encodeGraphEdge(message, bb) {
  // optional string id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $id);
  }

  // optional string source = 2;
  let $source = message.source;
  if ($source !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $source);
  }

  // optional string target = 3;
  let $target = message.target;
  if ($target !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $target);
  }

  // optional string label = 4;
  let $label = message.label;
  if ($label !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $label);
  }

  // optional string type = 5;
  let $type = message.type;
  if ($type !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $type);
  }

  // optional float weight = 6;
  let $weight = message.weight;
  if ($weight !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $weight);
  }

  // optional map<string, string> properties = 7;
  let map$properties = message.properties;
  if (map$properties !== undefined) {
    for (let key in map$properties) {
      let nested = popByteBuffer();
      let value = map$properties[key];
      writeVarint32(nested, 10);
      writeString(nested, key);
      writeVarint32(nested, 18);
      writeString(nested, value);
      writeVarint32(bb, 58);
      writeVarint32(bb, nested.offset);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeGraphEdge(binary) {
  return _decodeGraphEdge(wrapByteBuffer(binary));
}

function _decodeGraphEdge(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string id = 1;
      case 1: {
        message.id = readString(bb, readVarint32(bb));
        break;
      }

      // optional string source = 2;
      case 2: {
        message.source = readString(bb, readVarint32(bb));
        break;
      }

      // optional string target = 3;
      case 3: {
        message.target = readString(bb, readVarint32(bb));
        break;
      }

      // optional string label = 4;
      case 4: {
        message.label = readString(bb, readVarint32(bb));
        break;
      }

      // optional string type = 5;
      case 5: {
        message.type = readString(bb, readVarint32(bb));
        break;
      }

      // optional float weight = 6;
      case 6: {
        message.weight = readFloat(bb);
        break;
      }

      // optional map<string, string> properties = 7;
      case 7: {
        let values = message.properties || (message.properties = {});
        let outerLimit = pushTemporaryLength(bb);
        let key;
        let value;
        end_of_entry: while (!isAtEnd(bb)) {
          let tag = readVarint32(bb);
          switch (tag >>> 3) {
            case 0:
              break end_of_entry;
            case 1: {
              key = readString(bb, readVarint32(bb));
              break;
            }
            case 2: {
              value = readString(bb, readVarint32(bb));
              break;
            }
            default:
              skipUnknownField(bb, tag & 7);
          }
        }
        if (key === undefined || value === undefined)
          throw new Error("Invalid data for map: properties");
        values[key] = value;
        bb.limit = outerLimit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeHealthCheck(message) {
  let bb = popByteBuffer();
  _encodeHealthCheck(message, bb);
  return toUint8Array(bb);
}

function _encodeHealthCheck(message, bb) {
  // optional string service = 1;
  let $service = message.service;
  if ($service !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $service);
  }
}

export function decodeHealthCheck(binary) {
  return _decodeHealthCheck(wrapByteBuffer(binary));
}

function _decodeHealthCheck(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string service = 1;
      case 1: {
        message.service = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodeHealthCheckResponse(message) {
  let bb = popByteBuffer();
  _encodeHealthCheckResponse(message, bb);
  return toUint8Array(bb);
}

function _encodeHealthCheckResponse(message, bb) {
  // optional string status = 1;
  let $status = message.status;
  if ($status !== undefined) {
    writeVarint32(bb, 10);
    writeString(bb, $status);
  }

  // optional string version = 2;
  let $version = message.version;
  if ($version !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $version);
  }

  // optional string timestamp = 3;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $timestamp);
  }

  // optional map<string, string> services = 4;
  let map$services = message.services;
  if (map$services !== undefined) {
    for (let key in map$services) {
      let nested = popByteBuffer();
      let value = map$services[key];
      writeVarint32(nested, 10);
      writeString(nested, key);
      writeVarint32(nested, 18);
      writeString(nested, value);
      writeVarint32(bb, 34);
      writeVarint32(bb, nested.offset);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional PerformanceMetrics system_performance = 5;
  let $system_performance = message.system_performance;
  if ($system_performance !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodePerformanceMetrics($system_performance, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeHealthCheckResponse(binary) {
  return _decodeHealthCheckResponse(wrapByteBuffer(binary));
}

function _decodeHealthCheckResponse(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional string status = 1;
      case 1: {
        message.status = readString(bb, readVarint32(bb));
        break;
      }

      // optional string version = 2;
      case 2: {
        message.version = readString(bb, readVarint32(bb));
        break;
      }

      // optional string timestamp = 3;
      case 3: {
        message.timestamp = readString(bb, readVarint32(bb));
        break;
      }

      // optional map<string, string> services = 4;
      case 4: {
        let values = message.services || (message.services = {});
        let outerLimit = pushTemporaryLength(bb);
        let key;
        let value;
        end_of_entry: while (!isAtEnd(bb)) {
          let tag = readVarint32(bb);
          switch (tag >>> 3) {
            case 0:
              break end_of_entry;
            case 1: {
              key = readString(bb, readVarint32(bb));
              break;
            }
            case 2: {
              value = readString(bb, readVarint32(bb));
              break;
            }
            default:
              skipUnknownField(bb, tag & 7);
          }
        }
        if (key === undefined || value === undefined)
          throw new Error("Invalid data for map: services");
        values[key] = value;
        bb.limit = outerLimit;
        break;
      }

      // optional PerformanceMetrics system_performance = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.system_performance = _decodePerformanceMetrics(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export function encodePerformanceMetrics(message) {
  let bb = popByteBuffer();
  _encodePerformanceMetrics(message, bb);
  return toUint8Array(bb);
}

function _encodePerformanceMetrics(message, bb) {
  // optional float processing_time_ms = 1;
  let $processing_time_ms = message.processing_time_ms;
  if ($processing_time_ms !== undefined) {
    writeVarint32(bb, 13);
    writeFloat(bb, $processing_time_ms);
  }

  // optional float context_retrieval_time_ms = 2;
  let $context_retrieval_time_ms = message.context_retrieval_time_ms;
  if ($context_retrieval_time_ms !== undefined) {
    writeVarint32(bb, 21);
    writeFloat(bb, $context_retrieval_time_ms);
  }

  // optional float llm_generation_time_ms = 3;
  let $llm_generation_time_ms = message.llm_generation_time_ms;
  if ($llm_generation_time_ms !== undefined) {
    writeVarint32(bb, 29);
    writeFloat(bb, $llm_generation_time_ms);
  }

  // optional int32 total_nodes_accessed = 4;
  let $total_nodes_accessed = message.total_nodes_accessed;
  if ($total_nodes_accessed !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($total_nodes_accessed));
  }

  // optional int32 total_edges_traversed = 5;
  let $total_edges_traversed = message.total_edges_traversed;
  if ($total_edges_traversed !== undefined) {
    writeVarint32(bb, 40);
    writeVarint64(bb, intToLong($total_edges_traversed));
  }

  // optional float compression_ratio = 6;
  let $compression_ratio = message.compression_ratio;
  if ($compression_ratio !== undefined) {
    writeVarint32(bb, 53);
    writeFloat(bb, $compression_ratio);
  }

  // optional int64 memory_usage_bytes = 7;
  let $memory_usage_bytes = message.memory_usage_bytes;
  if ($memory_usage_bytes !== undefined) {
    writeVarint32(bb, 56);
    writeVarint64(bb, $memory_usage_bytes);
  }

  // optional float cpu_usage_percent = 8;
  let $cpu_usage_percent = message.cpu_usage_percent;
  if ($cpu_usage_percent !== undefined) {
    writeVarint32(bb, 69);
    writeFloat(bb, $cpu_usage_percent);
  }
}

export function decodePerformanceMetrics(binary) {
  return _decodePerformanceMetrics(wrapByteBuffer(binary));
}

function _decodePerformanceMetrics(bb) {
  let message = {};

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional float processing_time_ms = 1;
      case 1: {
        message.processing_time_ms = readFloat(bb);
        break;
      }

      // optional float context_retrieval_time_ms = 2;
      case 2: {
        message.context_retrieval_time_ms = readFloat(bb);
        break;
      }

      // optional float llm_generation_time_ms = 3;
      case 3: {
        message.llm_generation_time_ms = readFloat(bb);
        break;
      }

      // optional int32 total_nodes_accessed = 4;
      case 4: {
        message.total_nodes_accessed = readVarint32(bb);
        break;
      }

      // optional int32 total_edges_traversed = 5;
      case 5: {
        message.total_edges_traversed = readVarint32(bb);
        break;
      }

      // optional float compression_ratio = 6;
      case 6: {
        message.compression_ratio = readFloat(bb);
        break;
      }

      // optional int64 memory_usage_bytes = 7;
      case 7: {
        message.memory_usage_bytes = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional float cpu_usage_percent = 8;
      case 8: {
        message.cpu_usage_percent = readFloat(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

function pushTemporaryLength(bb) {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb, type) {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value) {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value) {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value) {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack = [];

function popByteBuffer() {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb) {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes) {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb) {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb, offset) {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb) {
  return bb.offset >= bb.limit;
}

function grow(bb, count) {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb, count) {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb, count) {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb, buffer) {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb, count) {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2, c3, c4, c;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb, text) {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb, buffer) {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb) {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb, value) {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb) {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb, value) {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb) {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb, value) {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb, unsigned) {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb, value) {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb) {
  let c = 0;
  let value = 0;
  let b;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb, value) {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb, unsigned) {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb, value) {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb) {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb, value) {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb) {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb, value) {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
