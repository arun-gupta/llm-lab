# LLM Lab

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/arun-gupta/llm-prompt-lab)

A full-stack web application that allows you to test and compare LLMs across multiple providers side by side, with **Postman integration and analytics**. Perfect for LLM experimentation, performance analysis, and AI development.

## 🚀 Quick Start

### **Option 1: GitHub Codespaces (Recommended for trying)**

Click the button at the top of this README to open LLM Lab in GitHub Codespaces. This will:
- 🚀 **Launch instantly** in your browser
- ⚡ **Auto-install dependencies** and start the dev server
- 🔑 **Set up environment** with example configuration
- 🌐 **Forward port 3000** automatically
- 📋 **Show detailed logs** during setup (use Cmd/Ctrl + Shift + P → "View Creation Log")
- 💻 **Use 4-core machine** with 8GB RAM for optimal LLM performance

### **Option 2: Local Development**
```bash
# Clone and run
git clone https://github.com/arun-gupta/llm-lab.git
cd llm-lab
./quickstart.sh
```

**Or manually:**
```bash
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev
```

### **MCP Server Integration (Auto-Installed)**

MCP (Model Context Protocol) server infrastructure is **automatically installed** during setup for enhanced Postman integration:

**Local Infrastructure:**
- **Local MCP Server Template** (Port 3001): Basic MCP server for testing

**Remote GitHub MCP Servers (Always Available):**
- **GitHub MCP Server**: https://api.githubcopilot.com/mcp/
- **GitHub Repositories**: https://api.githubcopilot.com/mcp/x/repos
- **GitHub Issues**: https://api.githubcopilot.com/mcp/x/issues
- **GitHub Pull Requests**: https://api.githubcopilot.com/mcp/x/pull_requests
- **GitHub Actions**: https://api.githubcopilot.com/mcp/x/actions
- **GitHub Notifications**: https://api.githubcopilot.com/mcp/x/notifications
- **GitHub Organizations**: https://api.githubcopilot.com/mcp/x/orgs
- **GitHub Users**: https://api.githubcopilot.com/mcp/x/users
- **GitHub Gists**: https://api.githubcopilot.com/mcp/x/gists
- **GitHub Discussions**: https://api.githubcopilot.com/mcp/x/discussions
- **GitHub Dependabot**: https://api.githubcopilot.com/mcp/x/dependabot
- **GitHub Code Security**: https://api.githubcopilot.com/mcp/x/code_security
- **GitHub Secret Protection**: https://api.githubcopilot.com/mcp/x/secret_protection
- **GitHub Experiments**: https://api.githubcopilot.com/mcp/x/experiments
- **GitHub Copilot**: https://api.githubcopilot.com/mcp/x/copilot

**✅ GitHub Token Pre-configured**: The project includes a working GitHub Personal Access Token for testing MCP server integration.

**Management:**
- **UI Management**: Go to Settings → MCP Server Management
- **Command Line**: Use npm scripts for quick access
  ```bash
  npm run start-mcp    # Start local server
  npm run stop-mcp     # Stop local server
  npm run status-mcp   # Check status
  ```

**Authentication:**
- **Local Server**: No authentication required
- **Remote GitHub Servers**: Uses GitHub authentication (pre-configured token with 'repo' scope)

**Documentation:**
- [GitHub MCP Server Documentation](https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md)

## 🔑 Required API Keys

Add to `.env.local`:
```env
# Required (at least one):
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional (for Postman integration):
POSTMAN_API_KEY=your_key_here

# Optional (for GitHub MCP server integration):
GITHUB_TOKEN=your_github_personal_access_token_here
```

**Get API Keys:** [OpenAI](https://platform.openai.com/) | [Anthropic](https://console.anthropic.com/) | [Postman](https://www.postman.com) | [GitHub](https://github.com/settings/tokens)

### **🔑 Setting Up API Keys in Codespaces**

If you're using GitHub Codespaces, you can add your API keys in two ways:

**Option 1: Environment Variables (Recommended)**
1. Go to your Codespace settings
2. Add environment variables:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` 
   - `POSTMAN_API_KEY` (optional)
   - `GITHUB_TOKEN` (optional, for MCP integration)
   - `NEXT_PUBLIC_BASE_URL` (set to your Codespaces URL)

**Option 2: Direct File Edit**
1. Open `.env.local` in the Codespace
2. Replace the placeholder values with your actual API keys
3. Set `NEXT_PUBLIC_BASE_URL` to your Codespaces URL (e.g., `https://your-codespace-name.your-username.github.dev`)
4. Save the file - the dev server will auto-restart

## ✨ Key Features

- 🔄 **Side-by-side LLM comparison** (OpenAI, Anthropic, Ollama)
- 🦙 **Local model support** via Ollama (auto-detects running models)
- 📦 **Direct Postman workspace integration** via Postman API
- 🎯 **Custom collection names** for personalized organization
- 🎉 **Success celebrations** with confetti animations
- 👀 **Collection preview** before creation
- 📊 **Performance metrics** (latency, token usage)
- 🧪 **Comprehensive test scripts** for automated validation
- 🔧 **Environment variables** for secure API key management
- 📈 **Analytics** and performance insights
- 🏗️ **Tabbed interface** for organized workflow
- 🔌 **Auto-installed MCP servers** for enhanced Postman automation

## 🎯 Postman Integration

### **What You Get:**
- **Direct Workspace Creation**: Collections appear instantly in your Postman workspace
- **Collection Preview**: Review collection details before creation
- **Custom Names**: Personalize collection names for better organization
- **Success Celebrations**: Engaging feedback when collections are created
- **Environment Templates**: Automatic setup of API key variables
- **Test Automation**: Pre-built scripts validate responses
- **Dynamic Content**: Variables for easy prompt modification
- **Rich Documentation**: Detailed descriptions in every collection

### **Two Options:**
1. **🚀 Direct Creation** (Recommended): Collections created directly in Postman
2. **📥 Download & Import**: Traditional JSON file download

### **Agent Selection:**
- **Web**: Create collections in Postman web interface
- **Desktop**: Create collections in Postman desktop app

## 📊 Current Status

✅ **Working**: OpenAI, Anthropic, Ollama integrations  
✅ **Complete**: Postman integration, UI, error handling, success celebrations  
✅ **Features**: Custom collection names, collection preview, status indicators  

## 🛠️ Usage

1. **Enter your prompt** and optional context
2. **Select providers** (defaults to "All Local" if Ollama models available)
3. **Submit** to compare responses side-by-side
4. **Preview collection** details before creation
5. **Create Postman collection** with custom name for direct API testing
6. **Celebrate success** with engaging animations

## 📈 Planned Features

### **Phase 1: Enhanced Integration** ✅
- [x] One-click Postman workspace setup
- [x] Interactive onboarding wizard
- [x] Collection preview before creation
- [x] Success celebration moments
- [x] Improved error handling
- [x] Custom collection names

### **Phase 2: Viral Sharing** 🚀
- [ ] Public collection gallery
- [ ] One-click collection import
- [ ] Collection templates library
- [ ] Social sharing integration
- [ ] Collection analytics

### **Phase 3: Postman-First UX** 🎨
- [ ] Redesigned landing page
- [ ] Postman-centric user journey
- [ ] Collection-first results page
- [ ] Postman branding integration
- [x] Advanced collection features

### **Phase 4: Team Collaboration** 👥
- [ ] Team workspace integration
- [ ] Collection commenting system
- [ ] Usage analytics dashboard
- [ ] Organization templates
- [ ] Team invitation flows

### **Phase 5: Advanced Features** ⚡
- [ ] Dynamic environment management
- [ ] Advanced test automation
- [ ] Mock server integration
- [ ] API monitoring setup
- [ ] CI/CD integration examples

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Reference

### **LLM API Endpoint**
```bash
POST /api/llm
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "context": "Optional context",
  "providers": ["openai:gpt-4o", "anthropic:claude-3-5-sonnet"]
}
```

### **Postman Integration**
```bash
# Check Postman API key status
GET /api/postman/status

# Create collection in Postman workspace
POST /api/postman/create-collection
{
  "collection": { /* Postman collection object */ },
  "createInWeb": true
}
```

### **Ollama Models**
```bash
# Get available Ollama models
GET /api/ollama/models
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community. **Perfect for generating Postman collections and testing LLM APIs.**
