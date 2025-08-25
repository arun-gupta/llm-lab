# GitHub MCP Collection Setup Guide

## 🚨 Important: Repository Name Configuration

The GitHub MCP collection requires proper environment variable configuration to work correctly.

### 📋 Required Environment Variables

1. **`repo_owner`** = `arun-gupta`
2. **`repo_name`** = `postman-labs`
3. **`github_token`** = Your GitHub Personal Access Token
4. **`mcp_session_id`** = (auto-generated, leave empty)

### 🔧 Setup Instructions

#### Option 1: Import Environment File (Recommended)
1. Download `public/postman-environments/github-mcp-environment.json`
2. Import it into Postman as an environment
3. Set your GitHub token in the environment variables
4. Select the environment in Postman

#### Option 2: Manual Configuration
1. Create a new environment in Postman
2. Add the following variables:
   - `repo_owner` = `arun-gupta`
   - `repo_name` = `postman-labs`
   - `github_token` = Your GitHub token
   - `mcp_session_id` = (leave empty)
3. Select the environment

### 🐛 Troubleshooting

#### Issue: "Repository not found" or "llm-lab" errors
**Cause:** Environment variables not set correctly
**Solution:** 
1. Check that `repo_owner` = `arun-gupta`
2. Check that `repo_name` = `postman-labs`
3. Ensure the environment is selected in Postman

#### Issue: "422 Validation Failed"
**Cause:** Repository doesn't exist or no permission
**Solution:** Verify the repository exists and you have access

### 🔍 Debug Information

Run the first request ("Initialize MCP Session") to see debug information in the console:
- Environment variable values
- Session ID generation
- Any configuration issues

### ✅ Expected Results

When configured correctly, you should see:
- `repo_owner: arun-gupta`
- `repo_name: postman-labs`
- Successful queries to `arun-gupta/postman-labs`

### 📞 Support

If you continue to see `llm-lab` references, it means the environment variables are not being used correctly. Double-check your Postman environment configuration.
