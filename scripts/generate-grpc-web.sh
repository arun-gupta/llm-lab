#!/bin/bash

# Generate gRPC-Web client files
echo "Generating gRPC-Web client files..."

# Create the generated directory
mkdir -p src/lib/generated

# Generate JavaScript files using protobufjs
npx pbjs -t static-module -w es6 -o src/lib/generated/graphrag_pb.js grpc-server/proto/graphrag.proto
npx pbts -o src/lib/generated/graphrag_pb.d.ts src/lib/generated/graphrag_pb.js

# Generate gRPC service files
npx pbjs -t static-module -w es6 -o src/lib/generated/graphrag_grpc_web_pb.js grpc-server/proto/graphrag.proto
npx pbts -o src/lib/generated/graphrag_grpc_web_pb.d.ts src/lib/generated/graphrag_grpc_web_pb.js

echo "gRPC-Web client files generated successfully!"
echo "Files created:"
echo "  - src/lib/generated/graphrag_pb.js"
echo "  - src/lib/generated/graphrag_pb.d.ts"
echo "  - src/lib/generated/graphrag_grpc_web_pb.js"
echo "  - src/lib/generated/graphrag_grpc_web_pb.d.ts"
