# LLM Prompt Lab

A full-stack web application that allows you to test and compare prompts across multiple LLM providers side by side, with **advanced Postman integration**. Perfect for prompt engineering, AI experimentation, and LLM comparison.

## 🚀 QuickStart

Get up and running in under 3 minutes with our automated setup:

### **Option 1: Automated QuickStart (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/arun-gupta/llm-prompt-lab.git
cd llm-prompt-lab

# 2. Run the quickstart script (installs dependencies, sets up environment, and opens browser)
./quickstart.sh
```

The quickstart script will:
- ✅ Install all dependencies automatically
- ✅ Create `.env.local` from template
- ✅ Guide you through API key setup
- ✅ Start the development server
- ✅ Open the app in your browser automatically

### **Option 2: Manual Setup**

```bash
# 1. Clone and install
git clone https://github.com/arun-gupta/llm-prompt-lab.git
cd llm-prompt-lab
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys (see below)

# 3. Run the app
npm run dev
# Open http://localhost:3000
```

### **Required API Keys** (add to `.env.local`):
```env
# At minimum, add one of these working integrations:
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional: For Postman integration
POSTMAN_API_KEY=your_postman_key_here

# Coming Soon - Not yet implemented:
# COHERE_API_KEY=your_cohere_key_here
# MISTRAL_API_KEY=your_mistral_key_here
```

### **Get API Keys:**
- **OpenAI**: [platform.openai.com](https://platform.openai.com/) → API Keys
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/) → API Keys  
- **Postman**: [postman.com](https://www.postman.com) → Settings → API Keys

**That's it!** Start comparing LLM responses and generating Postman collections.

---

**Key Features:**
- 🔄 **Side-by-side LLM comparison** (OpenAI, Anthropic, Ollama local models)
- 🦙 **Local model support** via Ollama integration (auto-detects running models)
- � **Diroect Postman workspace integration** via Postman API
- 📦 **Automatic collection generation** with test scripts and environment templates
- ⚡ **Performance metrics** (latency, token usage)
- 🎯 **Ready-to-use API examples** with dynamic variables and validation
- 🔧 **Advanced features**: Environment templates, test scripts, collection variables

## Current Status

✅ **Working**: OpenAI and Anthropic API integrations  
🔄 **In Progress**: Cohere and Mistral API integrations  
✅ **Complete**: UI, Postman integration, error handling, and deployment setup

## 🚀 Postman Integration Overview

LLM Prompt Lab goes beyond simple collection downloads. It provides **enterprise-grade Postman integration**:

### **What You Get:**
- **Direct Workspace Creation**: Collections appear instantly in your Postman workspace
- **Environment Templates**: Automatic setup of API key variables and configuration
- **Test Automation**: Pre-built scripts validate responses and handle errors
- **Dynamic Content**: Variables allow easy modification of prompts and context
- **Rich Documentation**: Detailed descriptions and examples in every collection

### **Two Integration Options:**
1. **🚀 Direct Creation** (Recommended): Collections created directly in your Postman workspace
2. **📥 Download & Import**: Traditional JSON file download for manual import

## Features

- **Multi-Provider Support**: Compare responses from OpenAI and Anthropic (Cohere and Mistral support coming soon)
- **Side-by-Side Comparison**: View responses from all providers simultaneously
- **Performance Metrics**: See latency and token usage for each response
- **🚀 Advanced Postman Integration**: 
  - Direct workspace creation via Postman API
  - Automatic environment templates with API key placeholders
  - Pre-built test scripts for response validation
  - Dynamic collection variables for prompt and context
  - Rich documentation and examples
- **Clean UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Error Handling**: Comprehensive error handling and loading states

## Postman Integration

LLM Prompt Lab includes powerful Postman integration features that make it easy to test and explore LLM APIs:

### **Individual Response Collections**
- **Download Button**: Each response card has a "Postman" button
- **Automatic Generation**: Creates a Postman collection with the exact API call that was made
- **API Key Placeholders**: Collections include `{{api_key}}` variables for secure testing
- **Complete Setup**: Ready-to-import collections with proper headers and body structure

### **Advanced Postman Integration**
- **Direct Creation**: Create collections directly in your Postman workspace via Postman API
- **Environment Templates**: Automatic generation of Postman environment files with API key placeholders
- **Test Scripts**: Pre-built test scripts for response validation and error handling
- **Collection Variables**: Dynamic variables for prompt content and context
- **Rich Documentation**: Detailed descriptions and examples in each collection

### **Bulk Collection Export**
- **Download All**: Header button to download a combined collection with all responses
- **Multiple APIs**: Single collection containing requests for all tested providers
- **Organized Structure**: Collections are organized by provider and include metadata

### **What's Included in Collections**
```json
{
  "info": {
    "name": "LLM Prompt Lab Collection",
    "description": "Generated collection for prompt: 'Your prompt here'",
    "variable": [
      {"key": "prompt", "value": "Your prompt here"},
      {"key": "context", "value": "Optional context"}
    ]
  },
  "item": [
    {
      "name": "OpenAI - Direct API Call",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Response is successful', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "pm.test('Response has content', function () {",
              "    const response = pm.response.json();",
              "    pm.expect(response.choices).to.be.an('array');",
              "    pm.expect(response.choices[0].message.content).to.be.a('string');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{openai_api_key}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"messages\": [{\"role\": \"user\", \"content\": \"{{prompt}}\"}]}"
        },
        "url": "https://api.openai.com/v1/chat/completions"
      }
    }
  ]
}
```

### **How to Use Postman Collections**

#### **Option 1: Direct Creation (Recommended)**
1. **Create in Postman**: Click "Create in Postman" to automatically create the collection in your workspace
2. **Set API Keys**: Add your API keys to the generated environment variables
3. **Start Testing**: The collection is ready to use with pre-configured test scripts

#### **Option 2: Download and Import**
1. **Download Collection**: Click "Download JSON" to get the collection file
2. **Import to Postman**: Open Postman and import the downloaded JSON file
3. **Set Environment Variables**: Create environment variables for your API keys:
   - `openai_api_key`
   - `anthropic_api_key`
   - `cohere_api_key`
   - `mistral_api_key`
4. **Test APIs**: Run the requests directly in Postman with your API keys

#### **Environment Setup**
The collections include automatic environment templates with:
- API key placeholders for all providers
- Dynamic variables for prompt and context
- Pre-configured test scripts for validation

### **Benefits for API Testing**
- **Real Examples**: Collections contain actual working API calls
- **No Manual Setup**: No need to manually create requests
- **Secure**: API keys are stored as environment variables
- **Reusable**: Collections can be shared with team members
- **Documentation**: Each request includes proper headers and body structure
- **Test Automation**: Pre-built test scripts for response validation
- **Dynamic Content**: Variables allow easy prompt and context modification
- **Direct Integration**: Create collections directly in Postman workspace
- **Environment Templates**: Automatic setup of API key variables

## Screenshots

*[Screenshots will be added here - placeholder for demo images]*

### Postman API Key Setup Guide

**Step 1**: Click on your profile picture in the top-right corner
![Postman Profile Menu](https://via.placeholder.com/400x200?text=Postman+Profile+Menu)

**Step 2**: Select "Settings" from the dropdown menu
![Postman Settings](https://via.placeholder.com/400x200?text=Postman+Settings+Menu)

**Step 3**: Click "API Keys" in the left sidebar
![Postman API Keys Section](https://via.placeholder.com/400x200?text=Postman+API+Keys+Section)

**Step 4**: Click "Generate API Key" and configure your key
![Postman Generate API Key](https://via.placeholder.com/400x200?text=Postman+Generate+API+Key)

**Step 5**: Copy the generated key and add it to your `.env.local` file
![Postman API Key Generated](https://via.placeholder.com/400x200?text=Postman+API+Key+Generated)

## Demo

*[Loom demo link will be added here - placeholder for video demo]*

## Why This App is Useful

### For Postman Teams & API Testing
- **Direct Workspace Integration**: Create collections automatically in your Postman workspace via API
- **Advanced Collection Features**: Pre-built test scripts, environment templates, and dynamic variables
- **Real API Examples**: Collections contain actual working requests with proper headers and body structure
- **Team Collaboration**: Share working API examples and test suites with your development team
- **API Documentation**: Generate real-world examples for API documentation and tutorials
- **Integration Testing**: Verify API integrations work correctly across multiple providers
- **Performance Testing**: Compare latency and token usage across different LLM services
- **Automated Testing**: Built-in test scripts validate response structure and content
- **Environment Management**: Automatic generation of environment templates with API key placeholders

### For DevRel Teams
- **API Documentation**: Easily test and compare different LLM APIs for documentation
- **Demo Creation**: Create compelling demos showing the differences between providers
- **Content Creation**: Generate content comparing different AI services
- **Workshop Tools**: Perfect for running API comparison workshops with Postman collections

### For API Testing Teams
- **Performance Testing**: Compare latency and token usage across providers
- **Quality Assurance**: Test prompt responses across multiple services
- **Regression Testing**: Ensure consistent behavior across different LLM providers
- **Cost Analysis**: Compare token usage and potential costs
- **Test Suite Creation**: Generate comprehensive Postman test collections

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **LLM APIs**: OpenAI, Anthropic, Cohere, Mistral
- **UI Components**: Lucide React icons, custom components
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS with custom utilities

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use nvm for version management)
- npm or yarn
- API keys for the LLM providers you want to test

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd llm-api-explorer
```

2. **Environment Setup** (choose one option):

   **Option A: Using nvm (Recommended)**
   ```bash
   nvm use  # Uses the version specified in .nvmrc
   npm install
   ```

   **Option B: Using Docker**
   ```bash
   docker build -t llm-api-explorer .
   docker run -p 3000:3000 --env-file .env.local llm-api-explorer
   ```

   **Option C: Direct installation**
   ```bash
   npm install
   ```

3. Set up environment variables:
```bash
# Copy the example files
cp .env.example .env
cp .env.local.example .env.local

# Edit .env.local with your actual API keys
nano .env.local  # or use your preferred editor
```

4. Configure your API keys in `.env.local`:
```env
# LLM API Keys (SENSITIVE - Keep these secret!)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here

# Postman API (optional - for generating Postman collections)
POSTMAN_API_KEY=your_postman_api_key_here
```

**Note**: The `.env.local` file contains sensitive data and is automatically ignored by git for security.

### Running Locally

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Select your preferred LLM providers, enter a prompt, and compare responses!

## API Key Setup

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Cohere
1. Go to [Cohere Dashboard](https://dashboard.cohere.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Mistral
1. Go to [Mistral AI Platform](https://console.mistral.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Postman (Optional)
1. **Sign in to Postman**: Go to [postman.com](https://www.postman.com) and sign in to your account
2. **Navigate to Settings**: Click on your profile picture/avatar in the top-right corner
3. **Access API Keys**: In the dropdown menu, click on "Settings"
4. **Go to API Keys Section**: In the left sidebar, click on "API Keys"
5. **Generate New Key**: Click the "Generate API Key" button
6. **Configure Key**:
   - Enter a name for your API key (e.g., "LLM Prompt Lab")
   - Select the workspace where you want collections to be created
   - Choose permissions (typically "Read & Write" for full functionality)
7. **Copy the Key**: Click "Generate API Key" and copy the generated key immediately
8. **Add to Environment**: Add the key to your `.env.local` file:
   ```env
   POSTMAN_API_KEY=your_generated_api_key_here
   ```

**Important Notes**:
- The Postman API key is optional. Without it, collections are downloaded as JSON files
- With the API key, collections can be automatically created in your Postman workspace
- Keep your API key secure and never commit it to version control
- You can revoke or regenerate API keys at any time from the Postman Settings

## Usage

1. **Select Providers**: Choose which LLM providers you want to compare
2. **Enter Prompt**: Type your prompt in the text area
3. **Add Context** (Optional): Include additional context for your prompt
4. **Submit**: Click the submit button to get responses from all selected providers
5. **Compare**: View responses side by side with performance metrics
6. **Export**: Download Postman collections for individual or all responses

### **Postman Workflow**

#### **Direct Creation Workflow (Recommended)**
1. **Test in Playground**: Use the web interface to test different prompts and providers
2. **Create in Postman**: Click "Create in Postman" to automatically create collections in your workspace
3. **Configure Environment**: Add your API keys to the generated environment variables
4. **Run Tests**: Execute the requests with pre-configured test scripts
5. **Share with Team**: Collections are automatically available in your Postman workspace

#### **Download Workflow**
1. **Test in Playground**: Use the web interface to test different prompts and providers
2. **Download Collections**: Click "Download JSON" to get collection files
3. **Import to Postman**: Import the JSON files into your Postman workspace
4. **Set Environment**: Create environment variables for your API keys
5. **Run Tests**: Execute the requests directly in Postman
6. **Share with Team**: Export and share collections with your development team

### **Collection Types**

- **Individual Collections**: One collection per provider response with test scripts
- **Combined Collections**: All responses in a single collection with environment variables
- **LLM Prompt Lab Collection**: The main prompt testing API endpoint
- **Environment Templates**: Automatic generation of Postman environment files
- **Test Scripts**: Pre-built validation scripts for response quality and structure

## API Endpoints

### POST /api/llm
Submit a prompt to multiple LLM providers.

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "context": "Optional context",
  "providers": ["openai", "anthropic", "cohere", "mistral"]
}
```

**Response:**
```json
{
  "responses": [
    {
      "provider": "OpenAI",
      "content": "Response content",
      "latency": 1234,
      "tokens": {
        "prompt": 10,
        "completion": 50,
        "total": 60
      }
    }
  ]
}
```

### POST /api/postman/create-collection
Create a Postman collection directly in your workspace.

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "context": "Optional context",
  "responses": [
    {
      "provider": "OpenAI",
      "content": "Response content",
      "latency": 1234,
      "tokens": {
        "prompt": 10,
        "completion": 50,
        "total": 60
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collection created successfully in Postman",
  "collectionId": "collection-uuid",
  "collectionUrl": "https://go.postman.co/collection/collection-uuid"
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── llm/
│   │   │   └── route.ts          # API endpoint for LLM requests
│   │   └── postman/
│   │       └── create-collection/
│   │           └── route.ts      # API endpoint for Postman collection creation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── LLMForm.tsx              # Main form component
│   ├── ProviderSelector.tsx     # Provider selection component
│   ├── ResponseCard.tsx         # Individual response display
│   └── PostmanIntegration.tsx   # Enhanced Postman integration component
└── lib/
    ├── llm-apis.ts              # LLM API integration functions
    ├── postman.ts               # Postman collection generation and API integration
    └── utils.ts                 # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

### Troubleshooting Postman Integration

#### **Common Issues and Solutions**

**Issue**: "Failed to create collection in Postman. Please check your API key configuration."
- **Solution**: Verify your `POSTMAN_API_KEY` is correctly set in `.env.local`
- **Solution**: Ensure the API key has "Read & Write" permissions
- **Solution**: Check that the workspace selected during key generation exists

**Issue**: "API key not found" or "Invalid API key"
- **Solution**: Regenerate your Postman API key from Settings → API Keys
- **Solution**: Make sure you copied the entire key (it should be a long string)
- **Solution**: Restart your development server after adding the API key

**Issue**: Collections not appearing in Postman workspace
- **Solution**: Check that you selected the correct workspace when generating the API key
- **Solution**: Verify the workspace permissions for your account
- **Solution**: Try refreshing your Postman workspace

**Issue**: "Permission denied" errors
- **Solution**: Ensure your API key has the necessary permissions (Read & Write)
- **Solution**: Check if your Postman account has workspace access
- **Solution**: Try generating a new API key with different permissions

#### **Testing Your Postman API Key**

You can test if your Postman API key is working by making a simple API call:

```bash
curl -X GET "https://api.getpostman.com/collections" \
  -H "X-API-Key: YOUR_POSTMAN_API_KEY" \
  -H "Content-Type: application/json"
```

If successful, you should receive a JSON response with your collections. If you get an error, check your API key configuration.

## PLG-Focused Roadmap

Our roadmap is designed to maximize Postman adoption and showcase Product-Led Growth (PLG) strategies. Each phase includes specific metrics to measure success and drive user engagement.

### **Phase 1: Enhanced Postman Integration & Onboarding** 🎯
**Timeline:** 2-3 weeks | **Focus:** User Activation

**Features:**
- [ ] **One-click Postman workspace setup** - Auto-create workspace + environment + collection in single flow
- [ ] **Interactive Postman onboarding wizard** - Step-by-step guide with API key setup and validation
- [ ] **Collection preview before creation** - Show users exactly what they'll get in Postman
- [ ] **Success celebration moments** - Congratulate users on first collection creation
- [ ] **Improved error handling** - Better UX for Postman API failures with actionable solutions

**Success Metrics:**
- **Primary:** Collection Creation Rate - Target: 65% of users create at least one collection
- **Secondary:** Time to First Collection - Target: <3 minutes from landing page
- **Tertiary:** Postman API Key Setup Success Rate - Target: 85% completion rate
- **Engagement:** Return Rate - Target: 40% of users return within 7 days

### **Phase 2: Viral Collection Sharing** 🚀
**Timeline:** 2 weeks | **Focus:** Organic Growth

**Features:**
- [ ] **Public collection gallery** - Showcase best LLM prompt collections with search/filter
- [ ] **One-click collection import** - Share collections via simple URLs (`/import/collection-id`)
- [ ] **Collection templates library** - Pre-built collections for common use cases (summarization, code review, etc.)
- [ ] **Social sharing integration** - "Share on Twitter/LinkedIn" buttons with collection previews
- [ ] **Collection analytics** - Show collection creators how many people imported their collections

**Success Metrics:**
- **Primary:** Viral Coefficient - Target: 1.2 (each user brings 1.2 new users through sharing)
- **Secondary:** Collection Import Rate - Target: 30% of shared collections get imported
- **Tertiary:** Social Shares per Collection - Target: 15% of collections get shared socially
- **Growth:** Weekly New User Acquisition via Shares - Target: 25% of new users from viral sharing

### **Phase 3: Postman-First User Experience** 🎨
**Timeline:** 3 weeks | **Focus:** Product Positioning

**Features:**
- [ ] **Redesigned landing page** - "Build and share LLM API collections in Postman" messaging
- [ ] **Postman-centric user journey** - Primary CTA: "Create Postman Collection" (not "Compare APIs")
- [ ] **Collection-first results page** - Emphasize collection creation over response comparison
- [ ] **Postman branding integration** - Co-branded experience showcasing Postman partnership
- [ ] **Advanced collection features** - Environment variables, test scripts, documentation templates

**Success Metrics:**
- **Primary:** Collection Creation Intent - Target: 80% of users click "Create Collection" vs other CTAs
- **Secondary:** Session Duration - Target: 5+ minutes average (up from current baseline)
- **Tertiary:** Feature Discovery Rate - Target: 60% of users explore advanced Postman features
- **Positioning:** Brand Association - Target: 70% of users associate the tool with "Postman collections"

### **Phase 4: Team Collaboration Features** 👥
**Timeline:** 4 weeks | **Focus:** Team Expansion

**Features:**
- [ ] **Team workspace integration** - Share collections directly with Postman team workspaces
- [ ] **Collection commenting system** - Add context and documentation to shared collections
- [ ] **Usage analytics dashboard** - Show which team members are using shared collections
- [ ] **Organization templates** - Company-specific prompt templates and standards
- [ ] **Team invitation flows** - Invite colleagues to collaborate on collections

**Success Metrics:**
- **Primary:** Team Expansion Rate - Target: 35% of individual users invite team members
- **Secondary:** Team Collection Usage - Target: 60% of team-shared collections get used by 3+ members
- **Tertiary:** Workspace Integration Rate - Target: 45% of collections created in team workspaces
- **Retention:** Team User Retention - Target: 80% retention rate for users in team workspaces

### **Phase 5: Advanced Postman Features Showcase** ⚡
**Timeline:** 3 weeks | **Focus:** Platform Stickiness

**Features:**
- [ ] **Dynamic environment management** - API key rotation, staging vs production environments
- [ ] **Advanced test automation** - Complex test scripts for response validation and chaining
- [ ] **Mock server integration** - Create mock LLM responses for development workflows
- [ ] **API monitoring setup** - Track LLM API performance and reliability over time
- [ ] **CI/CD integration examples** - Show how to use collections in automated testing pipelines

**Success Metrics:**
- **Primary:** Advanced Feature Adoption - Target: 25% of users use 2+ advanced features
- **Secondary:** Collection Complexity Score - Target: Average 3+ requests per collection
- **Tertiary:** Postman Pro Feature Discovery - Target: 40% of users explore Postman Pro features
- **Stickiness:** Long-term Retention - Target: 60% of users active after 30 days

## **Overall PLG Success Metrics**

### **Acquisition Metrics**
- **Monthly Active Users (MAU)** - Target: 10,000 MAU by end of Phase 3
- **Organic Growth Rate** - Target: 15% month-over-month growth
- **Viral Coefficient** - Target: 1.3 overall (each user brings 1.3 new users)

### **Activation Metrics**
- **Time to Value** - Target: <5 minutes from signup to first collection creation
- **Activation Rate** - Target: 70% of visitors create at least one collection
- **Feature Adoption Rate** - Target: 80% of users use core Postman integration features

### **Engagement Metrics**
- **Collections per User** - Target: 3.5 collections per active user
- **Session Frequency** - Target: 2.2 sessions per user per week
- **Feature Depth** - Target: 60% of users use 3+ features per session

### **Retention Metrics**
- **Day 1 Retention** - Target: 60%
- **Day 7 Retention** - Target: 35%
- **Day 30 Retention** - Target: 20%
- **Cohort Retention** - Target: 15% of users still active after 90 days

### **Revenue Impact Metrics** (Postman PLG)
- **Postman Pro Conversion Rate** - Target: 8% of users upgrade to Postman Pro
- **Team Workspace Creation** - Target: 25% of users create or join team workspaces
- **Enterprise Lead Generation** - Target: 50 qualified enterprise leads per month

## **Measurement & Analytics Setup**

### **Tracking Implementation**
- **Event Tracking:** Collection creation, sharing, imports, team invitations
- **Funnel Analysis:** Landing page → Collection creation → Sharing → Team expansion
- **Cohort Analysis:** User behavior patterns over time
- **A/B Testing:** Feature variations and messaging optimization

### **Dashboard & Reporting**
- **Weekly PLG Metrics Review** - Track all key metrics against targets
- **Monthly Cohort Analysis** - Deep dive into user retention patterns
- **Quarterly Business Impact Review** - Assess contribution to Postman's growth goals

---

## Legacy Roadmap (Deprioritized for PLG Focus)

- [ ] Add more LLM providers (Google Gemini, Meta Llama, etc.) - *Phase 6+*
- [ ] Implement response streaming - *Phase 6+*
- [ ] Add conversation history - *Phase 6+*
- [ ] Create user accounts and saved prompts - *Phase 6+*
- [ ] Add response quality scoring - *Phase 6+*
- [ ] Implement A/B testing for prompts - *Phase 6+*
- [ ] Add cost estimation features - *Phase 6+*
- [ ] Create API rate limiting and usage tracking - *Phase 6+*

---

Built with ❤️ for the developer community. **Perfect for generating Postman collections and testing LLM APIs.**
