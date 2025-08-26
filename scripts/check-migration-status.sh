#!/bin/bash

# Check ArangoDB migration status
set -e

echo "🔍 Checking ArangoDB Migration Status..."

# Check if migration flag exists
if [ -f ".arangodb-migrated" ]; then
    echo "✅ Migration flag found: .arangodb-migrated"
    MIGRATION_DONE=true
else
    echo "❌ Migration flag not found"
    MIGRATION_DONE=false
fi

# Check for JSON files
if [ -d "data/graphs" ] && [ "$(ls -A data/graphs/*.json 2>/dev/null)" ]; then
    JSON_COUNT=$(find data/graphs -name "*.json" | wc -l)
    echo "📊 Found $JSON_COUNT JSON graph files"
    HAS_JSON=true
else
    echo "📊 No JSON graph files found"
    HAS_JSON=false
fi

# Check ArangoDB connection and count graphs
if curl -s -u root:postmanlabs123 http://localhost:8529/_db/graphrag/_api/version > /dev/null; then
    echo "✅ ArangoDB is accessible"
    # Count graphs in ArangoDB
    GRAPH_COUNT=$(curl -s -u root:postmanlabs123 http://localhost:8529/_db/graphrag/_api/collection/graphs/count | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "📊 ArangoDB contains $GRAPH_COUNT graphs"
    ARANGO_ACCESSIBLE=true
else
    echo "❌ ArangoDB is not accessible"
    ARANGO_ACCESSIBLE=false
fi

echo ""
echo "📋 Migration Status Summary:"
echo "   Migration Flag: $MIGRATION_DONE"
echo "   JSON Files: $HAS_JSON ($JSON_COUNT files)"
echo "   ArangoDB Access: $ARANGO_ACCESSIBLE ($GRAPH_COUNT graphs)"

echo ""
if [ "$MIGRATION_DONE" = true ] && [ "$HAS_JSON" = true ]; then
    echo "⚠️  Migration flag exists but JSON files still present"
    echo "   This might indicate a partial migration"
elif [ "$MIGRATION_DONE" = false ] && [ "$HAS_JSON" = true ]; then
    echo "🔄 Migration needed: JSON files exist but migration not completed"
elif [ "$MIGRATION_DONE" = true ] && [ "$HAS_JSON" = false ]; then
    echo "✅ Migration appears complete: No JSON files, flag exists"
else
    echo "ℹ️  No migration needed: No JSON files to migrate"
fi

echo ""
echo "🔧 Available Actions:"
echo "   1. Force re-migration: rm .arangodb-migrated && ./quickstart.sh"
echo "   2. Check ArangoDB web interface: http://localhost:8529"
echo "   3. Manual migration: ./scripts/migrate-to-arangodb.sh"
