#!/bin/bash

# LLM Prompt Lab QuickStart Script
# This script installs dependencies, sets up environment, and starts the development server

set -e  # Exit on any error

echo "🚀 Setting up LLM Prompt Lab..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up GraphRAG data directories
echo "🕸️  Setting up GraphRAG data directories..."
mkdir -p data/graphs
mkdir -p sample-docs
echo "✅ GraphRAG directories created"
echo "   • data/graphs/ - Knowledge graph storage"
echo "   • sample-docs/ - Sample documents for testing"

# Copy sample documents if they don't exist
if [ ! -f "sample-docs/ai-healthcare.txt" ]; then
    echo "📄 Creating sample documents for GraphRAG testing..."
    cat > sample-docs/ai-healthcare.txt << 'EOF'
Artificial Intelligence in Healthcare: A Comprehensive Overview

Dr. Sarah Johnson, a leading researcher at Stanford Medical Center, has been working on AI applications in healthcare for over a decade. Her team, which includes Dr. Michael Chen and Dr. Emily Rodriguez, has developed several breakthrough technologies.

The Stanford Medical Center has partnered with Google Health to develop AI-powered diagnostic tools. Dr. Johnson's research focuses on machine learning algorithms that can detect early signs of diseases from medical imaging. She collaborated with Dr. Chen on a study that achieved 95% accuracy in detecting lung cancer from CT scans.

Dr. Emily Rodriguez, who specializes in natural language processing, worked with Microsoft Research to develop AI systems that can analyze patient records and medical literature. Her team discovered that AI can help identify drug interactions that human doctors might miss.

The collaboration between Stanford Medical Center and Google Health has led to the development of an AI system that can predict patient outcomes with remarkable accuracy. Dr. Johnson believes that AI will revolutionize healthcare by providing more personalized treatment plans.

Dr. Chen's work on computer vision in medical imaging has been recognized by the American Medical Association. He has published over 50 papers on the subject and has received funding from the National Institutes of Health.

The integration of AI in healthcare has raised important ethical questions. Dr. Rodriguez has been working with ethicists to develop guidelines for responsible AI use in medical settings. She believes that transparency and explainability are crucial for gaining patient trust.

Machine learning algorithms developed by Dr. Johnson's team are now being used in hospitals across the country. These systems can analyze vast amounts of patient data to identify patterns that might indicate health risks.

The future of AI in healthcare looks promising, with researchers like Dr. Johnson, Dr. Chen, and Dr. Rodriguez leading the way in developing innovative solutions that improve patient care and outcomes.
EOF
    echo "✅ Created sample-docs/ai-healthcare.txt"
fi

if [ ! -f "sample-docs/tech-companies.txt" ]; then
    cat > sample-docs/tech-companies.txt << 'EOF'
Leading Technology Companies and Their Innovations

Google, founded by Larry Page and Sergey Brin, has been at the forefront of artificial intelligence research for years. The company's AI division, led by Dr. Jeff Dean, has developed breakthrough technologies in machine learning and natural language processing.

Microsoft, under the leadership of Satya Nadella, has made significant investments in AI and cloud computing. The company's Azure platform provides AI services to thousands of businesses worldwide. Dr. Eric Horvitz, Microsoft's Chief Scientific Officer, has been instrumental in developing AI ethics guidelines.

Apple, led by Tim Cook, has integrated AI into its products through Siri and machine learning features. The company's AI research team, including Dr. Ian Goodfellow, has contributed to advances in computer vision and speech recognition.

Amazon, founded by Jeff Bezos, has leveraged AI to revolutionize e-commerce and cloud computing. The company's AWS division provides AI and machine learning services to developers worldwide. Dr. Rohit Prasad leads Amazon's AI initiatives, including the development of Alexa.

Facebook, now Meta, has invested heavily in AI research under the leadership of Mark Zuckerberg. The company's AI research lab, led by Dr. Yann LeCun, has made significant contributions to computer vision and natural language processing.

Tesla, led by Elon Musk, has been a pioneer in autonomous driving technology. The company's AI team, including Dr. Andrej Karpathy, has developed advanced computer vision systems for self-driving cars.

OpenAI, co-founded by Elon Musk and Sam Altman, has been at the forefront of large language model development. The company's GPT models have revolutionized natural language processing and AI capabilities.

DeepMind, acquired by Google, has made groundbreaking advances in AI research. The company's AlphaGo program, developed by Dr. Demis Hassabis, demonstrated AI's ability to master complex games.

NVIDIA, led by Jensen Huang, has been instrumental in providing the computing power needed for AI development. The company's GPUs are used by researchers and companies worldwide for training AI models.

The collaboration between these companies has accelerated AI development. Google and Microsoft have partnered on various AI initiatives, while Apple and Amazon have competed in the smart speaker market with Siri and Alexa respectively.

These companies continue to push the boundaries of what's possible with AI, driving innovation across industries and shaping the future of technology.
EOF
    echo "✅ Created sample-docs/tech-companies.txt"
fi

echo ""

# Install local MCP servers for enhanced Postman integration
echo "🔌 Setting up local MCP servers for enhanced Postman integration..."
if [ -f "scripts/setup-mcp-servers.sh" ]; then
    bash scripts/setup-mcp-servers.sh
    echo "✅ Local MCP servers installed successfully"
    echo "   • Local MCP Server Template: Port 3001"
    echo "   • File System MCP Server: Port 3002"
    echo "   • Web Search MCP Server: Port 3003"
    echo "   • Database MCP Server: Port 3004"
    echo "   💡 Remote GitHub MCP: https://api.githubcopilot.com/mcp/ (no installation needed)"
    echo "   💡 You can manage MCP servers from the Settings tab in the UI"
    echo ""
else
    echo "⚠️  MCP setup script not found, skipping MCP server installation"
    echo ""
fi

# Set up HTTP filesystem MCP server for Postman integration
echo "🌐 Setting up HTTP filesystem MCP server for Postman integration..."
if [ -f "scripts/setup-http-filesystem-mcp.sh" ]; then
    bash scripts/setup-http-filesystem-mcp.sh
    echo "✅ HTTP filesystem MCP server installed successfully"
    echo "   • HTTP Filesystem MCP Server: http://localhost:3002"
    echo "   • Health check: http://localhost:3002/health"
    echo "   • Tools endpoint: http://localhost:3002/tools"
    echo "   💡 Import the 'Official Filesystem MCP (HTTP)' collection in Postman"
    echo ""
else
    echo "⚠️  HTTP filesystem MCP setup script not found, skipping installation"
    echo ""
fi

# Set up environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.local.example .env.local
    echo "📝 Created .env.local from template"
    echo ""
    echo "🔑 IMPORTANT: You need to add your API keys to .env.local"
echo "   Required: At least one working LLM provider API key"
echo "   Working: OpenAI or Anthropic (Cohere & Mistral coming soon)"
echo "   Optional: POSTMAN_API_KEY for advanced Postman integration"
echo "   GraphRAG: Requires OpenAI API key for LLM comparison features"
    echo ""
    echo "📖 Get API keys from:"
    echo "   • OpenAI: https://platform.openai.com/ → API Keys"
    echo "   • Anthropic: https://console.anthropic.com/ → API Keys"
    echo "   • Postman: https://www.postman.com → Settings → API Keys"
    echo ""
    
    # Ask if user wants to edit the file now
    read -p "Would you like to edit .env.local now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Try to open with common editors
        if command -v code &> /dev/null; then
            echo "📝 Opening .env.local in VS Code..."
            code .env.local
        elif command -v nano &> /dev/null; then
            echo "📝 Opening .env.local in nano..."
            nano .env.local
        elif command -v vim &> /dev/null; then
            echo "📝 Opening .env.local in vim..."
            vim .env.local
        else
            echo "📝 Please edit .env.local with your preferred editor"
        fi
        echo ""
        echo "Press Enter when you've added your API keys..."
        read
    fi
else
    echo "✅ .env.local already exists"
fi

# Check if at least one API key is configured
if ! grep -q "^OPENAI_API_KEY=sk-" .env.local 2>/dev/null && ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  Warning: No API keys detected in .env.local"
    echo "   The app will start but you'll need API keys to test LLM providers"
    echo ""
fi

echo "🎯 Starting development server and MCP servers..."
echo "   The app will open automatically in your browser"
echo "   If it doesn't open, visit: http://localhost:3000"
echo "   MCP servers will be available for Postman integration"
echo "   GraphRAG functionality will be available in the GraphRAG tab"
echo ""

# Start local MCP servers in background
echo "🚀 Starting local MCP servers in background..."
if [ -f "$HOME/.mcp-servers/start-mcp-servers.sh" ]; then
    bash "$HOME/.mcp-servers/start-mcp-servers.sh" &
    MCP_PID=$!
    echo "✅ Local MCP servers started (PID: $MCP_PID)"
    echo "   • HTTP Filesystem MCP: http://localhost:3002"
    echo "   • Remote GitHub MCP: https://api.githubcopilot.com/mcp/ (no startup needed)"
    echo ""
else
    echo "⚠️  MCP servers startup script not found"
    echo ""
fi

# Function to open browser (works on macOS and Linux)
open_browser() {
    sleep 3  # Wait for server to start
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:3000
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:3000
    elif command -v wslview &> /dev/null; then
        # WSL
        wslview http://localhost:3000
    else
        echo "🌐 Please open http://localhost:3000 in your browser"
    fi
}

# Start the browser opener in background
open_browser &

# Start the development server
npm run dev