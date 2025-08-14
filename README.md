# LLM Prompt Lab

A full-stack web application that allows you to test and compare prompts across multiple LLM providers side by side, with **advanced Postman integration**. Perfect for prompt engineering, AI experimentation, and LLM comparison.

## 🚀 Quick Start

```bash
# Clone and run
git clone https://github.com/arun-gupta/llm-prompt-lab.git
cd llm-prompt-lab
./quickstart.sh
```

**Or manually:**
```bash
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev
```

## 🔑 Required API Keys

Add to `.env.local`:
```env
# Required (at least one):
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional (for Postman integration):
POSTMAN_API_KEY=your_key_here
```

**Get API Keys:** [OpenAI](https://platform.openai.com/) | [Anthropic](https://console.anthropic.com/) | [Postman](https://www.postman.com)

## ✨ Key Features

- 🔄 **Side-by-side LLM comparison** (OpenAI, Anthropic, Ollama)
- 🦙 **Local model support** via Ollama (auto-detects running models)
- 📦 **Direct Postman workspace integration** via Postman API
- ⚡ **Performance metrics** (latency, token usage)
- 🎯 **Ready-to-use API examples** with dynamic variables
- 🔧 **Advanced features**: Environment templates, test scripts, collection variables

## 🎯 Postman Integration

### **What You Get:**
- **Direct Workspace Creation**: Collections appear instantly in your Postman workspace
- **Environment Templates**: Automatic setup of API key variables
- **Test Automation**: Pre-built scripts validate responses
- **Dynamic Content**: Variables for easy prompt modification
- **Rich Documentation**: Detailed descriptions in every collection

### **Two Options:**
1. **🚀 Direct Creation** (Recommended): Collections created directly in Postman
2. **📥 Download & Import**: Traditional JSON file download

## 📊 Current Status

✅ **Working**: OpenAI, Anthropic, Ollama integrations  
✅ **Complete**: Postman integration, UI, error handling  
🔄 **In Progress**: Cohere and Mistral integrations  

## 🛠️ Usage

1. **Enter your prompt** and optional context
2. **Select providers** (defaults to "All Local" if Ollama models available)
3. **Submit** to compare responses side-by-side
4. **Create Postman collection** for direct API testing

## 📈 Planned Features

### **Phase 1: Enhanced Integration** ✅
- [x] One-click Postman workspace setup
- [x] Interactive onboarding wizard
- [x] Collection preview before creation
- [x] Improved error handling
- [ ] Success celebration moments

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
  "collection": { /* Postman collection object */ }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community. **Perfect for generating Postman collections and testing LLM APIs.**
