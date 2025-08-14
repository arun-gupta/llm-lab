#!/bin/bash

# LLM Prompt Lab Setup Script for GitHub Codespaces
# This script installs dependencies, sets up environment, and starts the development server

set -e  # Exit on any error

echo "🚀 Setting up LLM Prompt Lab in GitHub Codespaces..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.local.example .env.local
    echo "📝 Created .env.local from template"
    echo ""
    echo "🔑 IMPORTANT: You need to add your API keys to .env.local"
    echo "   Required: At least one working LLM provider API key"
    echo "   Working: OpenAI or Anthropic"
    echo "   Optional: POSTMAN_API_KEY for advanced Postman integration"
    echo ""
    echo "📖 Get API keys from:"
    echo "   • OpenAI: https://platform.openai.com/ → API Keys"
    echo "   • Anthropic: https://console.anthropic.com/ → API Keys"
    echo "   • Postman: https://www.postman.com → Settings → API Keys"
    echo ""
    echo "💡 In Codespaces, you can also add API keys as environment variables:"
    echo "   1. Go to Codespace settings"
    echo "   2. Add OPENAI_API_KEY, ANTHROPIC_API_KEY, POSTMAN_API_KEY"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Check if at least one API key is configured
if ! grep -q "^OPENAI_API_KEY=sk-" .env.local 2>/dev/null && ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  Warning: No API keys detected in .env.local"
    echo "   The app will start but you'll need API keys to test LLM providers"
    echo "   You can add them via Codespace environment variables or edit .env.local"
    echo ""
fi

echo "🎯 Starting development server..."
echo "   The app will be available at the forwarded port 3000"
echo "   GitHub Codespaces will automatically forward the port to your browser"
echo ""

# Start the development server
npm run dev
