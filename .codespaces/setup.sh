#!/bin/bash

# Postman Labs Codespaces Setup Script
# This script sets up the development environment for Postman Labs

set -e

echo "🚀 Setting up Postman Labs development environment..."

# Disable automatic Codespaces features
export CODESPACES_DISABLED=true

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo "📝 Created .env.local from template"
fi

# Set up MCP servers
echo "🔌 Setting up MCP servers..."
if [ -f "scripts/setup-mcp-servers.sh" ]; then
    bash scripts/setup-mcp-servers.sh
fi

# Set up gRPC server
echo "📡 Setting up gRPC server..."
if [ -f "scripts/setup-grpc-server.sh" ]; then
    bash scripts/setup-grpc-server.sh
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/graphs
mkdir -p sample-docs
mkdir -p logs

# Create sample documents if they don't exist
if [ ! -f "sample-docs/ai-healthcare.txt" ] || [ ! -f "sample-docs/tech-companies.txt" ]; then
    echo "📄 Creating sample documents..."
    echo "AI in Healthcare sample content" > sample-docs/ai-healthcare.txt
    echo "Tech Companies sample content" > sample-docs/tech-companies.txt
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo "  • npm run dev - Start development server"
echo "  • ./quickstart.sh - Start all services"
echo "  • ./quickstatus.sh - Check service status"
echo "  • ./quickstop.sh - Stop all services"
echo ""
echo "🌐 Development server will be available at: http://localhost:3000"
echo "📡 gRPC server will be available at: localhost:50051"
echo "🌐 gRPC-Web proxy will be available at: localhost:50052"
echo "🔌 MCP servers will be available at: localhost:3001, localhost:3002"
echo ""
echo "⚠️  Note: Codespaces functionality has been disabled for this repository."
