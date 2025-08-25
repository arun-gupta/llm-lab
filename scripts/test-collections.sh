#!/bin/bash

# Newman Collection Testing Script
# This script runs all Postman collections using Newman for CI/CD testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COLLECTIONS_DIR="public/postman-collections"
REPORTS_DIR="newman-reports"
BASE_URL="${BASE_URL:-http://localhost:3000}"

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo -e "${YELLOW}Starting Newman collection tests...${NC}"
echo -e "Base URL: $BASE_URL"
echo -e "Collections directory: $COLLECTIONS_DIR"
echo -e "Reports directory: $REPORTS_DIR"
echo ""

# Function to test a collection
test_collection() {
    local collection_file="$1"
    local collection_name=$(basename "$collection_file" .json)
    local report_file="$REPORTS_DIR/${collection_name}-report.html"
    
    echo -e "${YELLOW}Testing collection: $collection_name${NC}"
    
    # Run Newman with the collection
    if newman run "$collection_file" \
        --reporters cli,html \
        --reporter-html-export "$report_file" \
        --timeout-request 10000 \
        --timeout-script 10000 \
        --bail; then
        echo -e "${GREEN}✓ $collection_name tests passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $collection_name tests failed${NC}"
        return 1
    fi
}

# Function to run tests in parallel
run_parallel_tests() {
    local failed_tests=0
    local pids=()
    
    # Find all collection files
    for collection_file in "$COLLECTIONS_DIR"/*.json; do
        if [[ -f "$collection_file" ]]; then
            # Run test in background
            test_collection "$collection_file" &
            pids+=($!)
        fi
    done
    
    # Wait for all tests to complete
    for pid in "${pids[@]}"; do
        if ! wait "$pid"; then
            ((failed_tests++))
        fi
    done
    
    return $failed_tests
}

# Function to run tests sequentially
run_sequential_tests() {
    local failed_tests=0
    
    for collection_file in "$COLLECTIONS_DIR"/*.json; do
        if [[ -f "$collection_file" ]]; then
            if ! test_collection "$collection_file"; then
                ((failed_tests++))
            fi
        fi
    done
    
    return $failed_tests
}

# Main execution
if [[ "$PARALLEL" == "true" ]]; then
    echo -e "${YELLOW}Running tests in parallel...${NC}"
    run_parallel_tests
else
    echo -e "${YELLOW}Running tests sequentially...${NC}"
    run_sequential_tests
fi

exit_code=$?

echo ""
echo -e "${YELLOW}Test Summary:${NC}"
echo -e "Reports saved to: $REPORTS_DIR/"

if [[ $exit_code -eq 0 ]]; then
    echo -e "${GREEN}All collection tests passed! ✓${NC}"
else
    echo -e "${RED}Some collection tests failed! ✗${NC}"
fi

exit $exit_code
