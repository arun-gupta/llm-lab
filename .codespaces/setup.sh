#!/bin/bash

echo "🚀 Setting up LLM Prompt Lab in GitHub Codespaces..."

# Check if .env.local exists, if not copy from example
if [ ! -f .env.local ]; then
    echo "📝 Setting up environment file..."
    cp .env.local.example .env.local
    echo "✅ Environment file created from template"
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check if the dev server is running
if ! pgrep -f "next dev" > /dev/null; then
    echo "🌐 Starting development server..."
    npm run dev &
    echo "✅ Development server started on port 3000"
fi

echo "🎉 LLM Prompt Lab is ready!"
echo "📖 Next steps:"
echo "   1. Add your API keys to .env.local or Codespace environment variables"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Start testing LLM prompts and creating Postman collections!"
