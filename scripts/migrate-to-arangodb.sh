#!/bin/bash

# Migration script to move existing JSON graphs to ArangoDB
# This script reads existing JSON graph files and migrates them to ArangoDB

set -e

echo "🔄 Starting migration from JSON to ArangoDB..."

# Check if ArangoDB is running
if ! curl -s http://localhost:8529/_api/version > /dev/null; then
    echo "❌ ArangoDB is not running. Please start it first:"
    echo "   docker-compose -f docker-compose.arangodb.yml up -d"
    exit 1
fi

echo "✅ ArangoDB is running"

# Check if data/graphs directory exists
if [ ! -d "data/graphs" ]; then
    echo "❌ No existing graphs found in data/graphs/"
    echo "   Please build some graphs first using the GraphRAG interface"
    exit 1
fi

# Count existing graphs
GRAPH_COUNT=$(find data/graphs -name "*.json" | wc -l)
echo "📊 Found $GRAPH_COUNT existing graphs to migrate"

if [ $GRAPH_COUNT -eq 0 ]; then
    echo "❌ No JSON graph files found to migrate"
    exit 1
fi

# Create migration script
cat > migrate-graphs.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Import ArangoDB functions
const { migrateGraphFromJSON } = require('../src/lib/arangodb.ts');

async function migrateGraphs() {
    const graphsDir = path.join(process.cwd(), 'data', 'graphs');
    const files = fs.readdirSync(graphsDir).filter(file => file.endsWith('.json'));
    
    console.log(`🔄 Migrating ${files.length} graphs to ArangoDB...`);
    
    for (const file of files) {
        const graphId = file.replace('.json', '');
        const filePath = path.join(graphsDir, file);
        
        try {
            console.log(`📁 Migrating graph: ${graphId}`);
            
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const newGraphId = await migrateGraphFromJSON(graphId, jsonData);
            
            console.log(`✅ Migrated ${graphId} -> ${newGraphId}`);
            
            // Optionally backup the original file
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
            console.log(`💾 Backed up to ${backupPath}`);
            
        } catch (error) {
            console.error(`❌ Failed to migrate ${graphId}:`, error.message);
        }
    }
    
    console.log("🎉 Migration completed!");
}

migrateGraphs().catch(console.error);
EOF

# Run migration
echo "🚀 Running migration script..."
node migrate-graphs.js

# Cleanup
rm -f migrate-graphs.js

echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Test the new ArangoDB-based GraphRAG functionality"
echo "   2. Update your application to use the new API endpoints:"
echo "      - /api/graphrag/build-graph-arangodb (for building graphs)"
echo "      - /api/graphrag/graphs-arangodb (for retrieving graphs)"
echo "   3. Once confirmed working, you can remove the old JSON files"
echo ""
echo "🔗 ArangoDB Web Interface: http://localhost:8529"
echo "   Username: graphrag_user"
echo "   Password: graphrag123"
