#!/bin/bash

# Update Collection Timestamp Script
# This script updates the timestamp in the GitHub MCP collection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get current timestamp in local timezone
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
VERSION="v1.2"

print_status "Updating collection timestamp to: $TIMESTAMP (Local Time)"

# Update the collection file
COLLECTION_FILE="public/postman-collections/github-mcp-unified.json"

if [ ! -f "$COLLECTION_FILE" ]; then
    print_error "Collection file not found: $COLLECTION_FILE"
    exit 1
fi

# Create backup
BACKUP_FILE="${COLLECTION_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$COLLECTION_FILE" "$BACKUP_FILE"
print_status "Created backup: $BACKUP_FILE"

# Update collection name
sed -i.tmp "s/\"name\": \"GitHub MCP - Unified Repository Analysis v[0-9.]* ([0-9-]* [0-9:]*)\"/\"name\": \"GitHub MCP - Unified Repository Analysis $VERSION ($TIMESTAMP)\"/" "$COLLECTION_FILE"

# Update description timestamp
sed -i.tmp "s/- Created: [0-9-]* [0-9:]* (Local Time)/- Created: $TIMESTAMP (Local Time)/" "$COLLECTION_FILE"

# Clean up temporary files
rm -f "${COLLECTION_FILE}.tmp"

print_success "Collection timestamp updated successfully!"
print_status "New collection name: GitHub MCP - Unified Repository Analysis $VERSION ($TIMESTAMP)"
print_status "You can now import the updated collection into Postman"
