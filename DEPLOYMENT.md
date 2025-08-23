# Infrastructure Configurator Deployment Guide

## 🔐 Security Setup

### Environment Variables (.env.local)
Create `.env.local` in the root directory:
```bash
# Claude API Key from https://console.anthropic.com
REACT_APP_CLAUDE_API_KEY=your-actual-claude-api-key-here
```

### For New Machine Deployment:
1. **Copy `.env.local.example`** to `.env.local` 
2. **Add your real API keys** to `.env.local`
3. **Never commit .env.local** (already in .gitignore)

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start proxy server:**
   ```bash
   cd proxy-server && npm start
   ```

3. **Start React app:**
   ```bash
   npm start
   ```

## 🏗️ MCP Server Integration

For connecting to remote MCP server, update:
- `src/config/mcpConfig.js` - Change `baseUrl` from `localhost:5000` to your server IP
- `src/hooks/useMCPIntegration.js` - Update server configuration

## ✅ Your App Status: Ready for Production!

✅ Claude LLM integration working  
✅ Environment variables configured  
✅ API keys secured  
✅ MCP client ready  
✅ Proxy server setup complete

Your infrastructure configurator is production-ready!
