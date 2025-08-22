#!/bin/bash

# Port Management Utility for LLM Prompt Lab
CONFIG_FILE="config/ports.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load port configuration
load_ports() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}❌ Port configuration file not found: $CONFIG_FILE${NC}"
        exit 1
    fi

    if command -v jq &> /dev/null; then
            NEXTJS_PORT=$(jq -r '.development.nextjs' "$CONFIG_FILE")
    GRPC_SERVER_PORT=$(jq -r '.development.grpc.server' "$CONFIG_FILE")
    GRPC_HTTP_PORT=$(jq -r '.development.grpc.http' "$CONFIG_FILE")
    MCP_SQLITE_PORT=$(jq -r '.development.mcp.sqlite' "$CONFIG_FILE")
    MCP_FILESYSTEM_PORT=$(jq -r '.development.mcp.filesystem' "$CONFIG_FILE")
    else
        echo -e "${YELLOW}⚠️  jq not found, using default ports${NC}"
        NEXTJS_PORT=3000
        GRPC_SERVER_PORT=50051
        GRPC_HTTP_PORT=50052
        MCP_SQLITE_PORT=3001
        MCP_FILESYSTEM_PORT=3002
    fi
}

# Check port status
check_ports() {
    echo -e "${BLUE}🔍 Checking port status...${NC}"
    echo ""
    
    local ports=($NEXTJS_PORT $GRPC_SERVER_PORT $GRPC_HTTP_PORT $MCP_SQLITE_PORT $MCP_FILESYSTEM_PORT)
    local services=("Next.js" "gRPC Server" "gRPC HTTP" "MCP SQLite" "MCP Filesystem")
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local service=${services[$i]}
        
        if lsof -i:$port > /dev/null 2>&1; then
            local pid=$(lsof -ti:$port | head -1)
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
            echo -e "${RED}❌ Port $port ($service): IN USE by $process (PID: $pid)${NC}"
        else
            echo -e "${GREEN}✅ Port $port ($service): AVAILABLE${NC}"
        fi
    done
}

# Clean ports
clean_ports() {
    echo -e "${YELLOW}🧹 Cleaning ports...${NC}"
    
    local ports=($NEXTJS_PORT $GRPC_SERVER_PORT $GRPC_HTTP_PORT $MCP_SQLITE_PORT $MCP_FILESYSTEM_PORT)
    local killed=0
    
    for port in "${ports[@]}"; do
        if lsof -i:$port > /dev/null 2>&1; then
            local pids=$(lsof -ti:$port)
            for pid in $pids; do
                echo -e "${YELLOW}   Killing process $pid on port $port${NC}"
                kill -9 $pid 2>/dev/null
                killed=$((killed + 1))
            done
        fi
    done
    
    if [ $killed -gt 0 ]; then
        echo -e "${GREEN}✅ Killed $killed processes${NC}"
    else
        echo -e "${GREEN}✅ No processes to kill${NC}"
    fi
}

# Show configuration
show_config() {
    echo -e "${BLUE}📋 Current Port Configuration:${NC}"
    echo ""
    echo -e "   ${BLUE}•${NC} Next.js: ${GREEN}$NEXTJS_PORT${NC}"
    echo -e "   ${BLUE}•${NC} gRPC Server: ${GREEN}$GRPC_SERVER_PORT${NC}"
    echo -e "   ${BLUE}•${NC} gRPC HTTP: ${GREEN}$GRPC_HTTP_PORT${NC}"
    echo -e "   ${BLUE}•${NC} MCP SQLite: ${GREEN}$MCP_SQLITE_PORT${NC}"
    echo -e "   ${BLUE}•${NC} MCP Filesystem: ${GREEN}$MCP_FILESYSTEM_PORT${NC}"
    echo ""
    echo -e "${BLUE}📁 Config file:${NC} $CONFIG_FILE"
}

# Update port configuration
update_port() {
    local service=$1
    local new_port=$2
    
    if [ -z "$service" ] || [ -z "$new_port" ]; then
        echo -e "${RED}❌ Usage: $0 update <service> <port>${NC}"
        echo -e "${YELLOW}   Services: nextjs, grpc-server, grpc-http, mcp-sqlite, mcp-filesystem${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required to update port configuration${NC}"
        exit 1
    fi
    
    # Create backup
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    
    # Update the port
    case $service in
        "nextjs")
            jq '.development.nextjs = '$new_port' | .production.nextjs = '$new_port' | .fallback.nextjs = '$new_port "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
            ;;
        "grpc-server")
            jq '.development.grpc.server = '$new_port' | .production.grpc.server = '$new_port' | .fallback.grpc.server = '$new_port "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
            ;;
        "grpc-http")
            jq '.development.grpc.http = '$new_port' | .production.grpc.http = '$new_port' | .fallback.grpc.http = '$new_port "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
            ;;
        "mcp-sqlite")
            jq '.development.mcp.sqlite = '$new_port' | .production.mcp.sqlite = '$new_port' | .fallback.mcp.sqlite = '$new_port "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
            ;;
        "mcp-filesystem")
            jq '.development.mcp.filesystem = '$new_port' | .production.mcp.filesystem = '$new_port' | .fallback.mcp.filesystem = '$new_port "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
            ;;
        *)
            echo -e "${RED}❌ Unknown service: $service${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Updated $service port to $new_port${NC}"
    echo -e "${YELLOW}   Backup saved to: $CONFIG_FILE.backup${NC}"
}

# Show usage
show_usage() {
    echo -e "${BLUE}🔧 Port Management Utility for LLM Prompt Lab${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 <command> [options]"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "  ${GREEN}check${NC}     - Check status of all configured ports"
    echo -e "  ${GREEN}clean${NC}     - Kill processes using configured ports"
    echo -e "  ${GREEN}config${NC}    - Show current port configuration"
    echo -e "  ${GREEN}update${NC}    - Update a specific port"
    echo -e "  ${GREEN}generate${NC}  - Regenerate startup scripts with current config"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 check"
    echo -e "  $0 clean"
    echo -e "  $0 update nextjs 3001"
    echo -e "  $0 update grpc-server 50053"
    echo ""
}

# Main script logic
load_ports

case "${1:-help}" in
    "check")
        check_ports
        ;;
    "clean")
        clean_ports
        ;;
    "config")
        show_config
        ;;
    "update")
        update_port "$2" "$3"
        ;;
    "generate")
        bash scripts/generate-startup-scripts.sh
        ;;
    "help"|*)
        show_usage
        ;;
esac
