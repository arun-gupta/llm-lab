#!/bin/bash

echo "🚀 Setting up LLM Prompt Lab in GitHub Codespaces..."

# Run the Codespaces-specific quickstart script
echo "📋 Running Codespaces quickstart script for complete setup..."
bash .codespaces/quickstart-codespaces.sh

echo "🎉 LLM Prompt Lab is ready in GitHub Codespaces!"
echo "📖 Next steps:"
echo "   1. Add your API keys to .env.local or Codespace environment variables"
echo "   2. The app should automatically open in your browser"
echo "   3. If not, visit the forwarded port 3000"
echo "   4. Start testing LLM prompts and creating Postman collections!"
