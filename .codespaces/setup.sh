#!/bin/bash

# LLM Prompt Lab Setup Script for GitHub Codespaces
# This script installs dependencies, sets up environment, and starts the development server

set -e  # Exit on any error

# Function to print section headers
print_section() {
    echo ""
    echo "=========================================="
    echo "🔧 $1"
    echo "=========================================="
}

# Function to print step progress
print_step() {
    echo "📋 Step $1: $2"
}

# Function to print success message
print_success() {
    echo "✅ $1"
}

# Function to print info message
print_info() {
    echo "ℹ️  $1"
}

# Function to print warning message
print_warning() {
    echo "⚠️  $1"
}

echo ""
echo "🚀 =========================================="
echo "🚀 LLM Prompt Lab - GitHub Codespaces Setup"
echo "🚀 =========================================="
echo ""

print_section "Environment Check"
print_step "1" "Checking Node.js installation"

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

print_success "Node.js $(node -v) detected"

print_section "Dependencies Installation"
print_step "2" "Installing npm dependencies"
echo "📦 Running: npm install"
npm install
print_success "Dependencies installed successfully"

print_section "Environment Configuration"
print_step "3" "Setting up environment file"

# Set up environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    print_success "Environment file created from template"
    
    print_info "🔑 API Key Setup Required"
    echo ""
    echo "   To use LLM Prompt Lab, you need to add your API keys:"
    echo ""
    echo "   📖 Get API keys from:"
    echo "   • OpenAI: https://platform.openai.com/ → API Keys"
    echo "   • Anthropic: https://console.anthropic.com/ → API Keys"
    echo "   • Postman: https://www.postman.com → Settings → API Keys"
    echo ""
    echo "   💡 In Codespaces, you can add API keys as environment variables:"
    echo "   1. Go to Codespace settings (gear icon)"
    echo "   2. Add these environment variables:"
    echo "      - OPENAI_API_KEY"
    echo "      - ANTHROPIC_API_KEY"
    echo "      - POSTMAN_API_KEY (optional)"
    echo ""
else
    print_success "Environment file already exists"
fi

print_step "4" "Checking API key configuration"

# Check if at least one API key is configured
if ! grep -q "^OPENAI_API_KEY=sk-" .env.local 2>/dev/null && ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" .env.local 2>/dev/null; then
    print_warning "No API keys detected in .env.local"
    echo "   The app will start but you'll need API keys to test LLM providers"
    echo "   You can add them via Codespace environment variables or edit .env.local"
    echo ""
else
    print_success "API keys detected in environment file"
fi

print_section "Starting Development Server"
print_step "5" "Launching LLM Prompt Lab"

echo "🌐 Starting development server..."
echo "   The app will be available at the forwarded port 3000"
echo "   GitHub Codespaces will automatically forward the port to your browser"
echo ""

print_success "Setup complete! LLM Prompt Lab is starting..."
echo ""
echo "🎉 =========================================="
echo "🎉 LLM Prompt Lab is ready to use!"
echo "🎉 =========================================="
echo ""
echo "📖 Next steps:"
echo "   1. Add your API keys (see instructions above)"
echo "   2. The app will open automatically in your browser"
echo "   3. Start testing LLM prompts and creating Postman collections!"
echo ""

# Start the development server
npm run dev
