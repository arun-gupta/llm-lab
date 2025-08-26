#!/bin/bash

# Configure Filesystem MCP Server Script
# This script allows you to reconfigure the allowed directories

set -e

MCP_DIR="$HOME/.mcp-servers"
cd "$MCP_DIR"

echo "Filesystem MCP Server Configuration"
echo "=================================="
echo ""

# Load current configuration
if [ -f "filesystem-mcp-config.env" ]; then
    source filesystem-mcp-config.env
    echo "Current allowed directories: $ALLOWED_DIRECTORIES"
else
    echo "No configuration file found, using defaults"
    ALLOWED_DIRECTORIES="/tmp $HOME/Desktop"
fi

echo ""
echo "Do you want to reconfigure the allowed directories? (y/N): "
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Enter the directories you want to allow access to (one per line, empty line to finish):"
    echo "Examples: /tmp, $HOME/Documents, $HOME/Downloads"
    echo "Warning: Only enter directories you trust!"
    echo ""
    
    CUSTOM_DIRS=""
    while true; do
        read -p "Directory path (or empty to finish): " dir_path
        if [ -z "$dir_path" ]; then
            break
        fi
        
        # Validate directory exists
        if [ ! -d "$dir_path" ]; then
            echo "Directory '$dir_path' does not exist. Create it? (y/N): "
            read -n 1 -r create_dir
            echo ""
            if [[ $create_dir =~ ^[Yy]$ ]]; then
                mkdir -p "$dir_path"
                echo "Created directory: $dir_path"
            else
                echo "Skipping directory: $dir_path"
                continue
            fi
        fi
        
        # Add to custom directories
        if [ -z "$CUSTOM_DIRS" ]; then
            CUSTOM_DIRS="$dir_path"
        else
            CUSTOM_DIRS="$CUSTOM_DIRS $dir_path"
        fi
        echo "Added: $dir_path"
    done
    
    if [ -n "$CUSTOM_DIRS" ]; then
        # Update configuration file
        cat > filesystem-mcp-config.env << CONFIG_EOF
# Filesystem MCP Server Configuration
# This file contains the allowed directories for the filesystem MCP server
# Edit this file to change allowed directories, then restart the server

ALLOWED_DIRECTORIES="$CUSTOM_DIRS"
DEFAULT_DIRECTORIES="/tmp $HOME/Desktop"
CONFIG_EOF
        
        echo ""
        echo "Configuration updated!"
        echo "New allowed directories: $CUSTOM_DIRS"
        echo ""
        echo "To apply changes, restart the server:"
        echo "  ./stop-http-filesystem-mcp.sh && ./start-http-filesystem-mcp.sh"
    else
        echo "No directories specified, keeping current configuration"
    fi
else
    echo "Configuration unchanged"
fi
