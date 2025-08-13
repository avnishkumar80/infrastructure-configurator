# 🚀 MCP Integration Setup Guide - Native Implementation

## ✅ What's Currently Implemented

Your infrastructure configurator has **native MCP (Model Context Protocol) integration** restored! Here's the current setup:

### 🔧 Core MCP Components
- ✅ MCP Client Service (`services/mcpClientService.js`) - WebSocket-based
- ✅ MCP Configuration (`config/mcpConfig.js`) - Native MCP server configuration
- ✅ MCP Integration Hook (`hooks/useMCPIntegration.js`) - WebSocket connection management
- ✅ Enhanced AI Service (`services/enhancedAiService.js`)
- ✅ Enhanced Chat Components with real tool support
- ✅ Development testing panel for MCP tools

### 🤖 Enhanced AI Assistant
- ✅ Real-time WebSocket connection status display
- ✅ Tool discovery and suggestion via MCP protocol
- ✅ Intelligent message analysis
- ✅ Actual tool execution (when MCP server is available)
- ✅ Fallback to mock responses when MCP is unavailable

## 🚀 How to Connect to Your MCP Server

### Step 1: Update MCP Server Configuration
Edit `src/config/mcpConfig.js` and update the path to your MCP server:

```javascript
development: {
  command: 'node',
  args: ['../path/to/your-mcp-server/index.js'], // UPDATE THIS
  env: {
    ...process.env,
    NODE_ENV: 'development',
    MCP_LOG_LEVEL: 'debug'
  },
  autoReconnect: true,
  reconnectDelay: 5000
}
```

### Step 2: Ensure Your MCP Server Supports WebSocket on localhost:5000
Your MCP server should:
- Accept WebSocket connections on `ws://localhost:5000`
- Implement the MCP protocol (JSON-RPC 2.0 over WebSocket)
- Support these methods:
  - `initialize` - MCP handshake
  - `tools/list` - List available tools
  - `tools/call` - Execute tools

### Step 3: Test the Integration
1. Start your MCP server on localhost:5000
2. Start your React app: `npm start`
3. Look for the **MCP Test Panel** button in the bottom-left (development mode)
4. Check the AI Assistant connection status (green = connected, red = disconnected)

## 🔧 MCP Server Requirements

Your MCP server needs to implement these WebSocket message handlers:

### Initialize Connection
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "infrastructure-configurator",
      "version": "1.0.0"
    }
  }
}
```

### List Tools
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

### Call Tool
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "validate_configuration",
    "arguments": {
      "config": "...",
      "format": "terraform"
    }
  }
}
```

## 🧪 Testing the Integration

### 1. With MCP Server (Real Tools)
When your MCP server is running:
- AI shows "🛠️ MCP Tools Connected"
- Can execute real validation, optimization, and generation tools
- Provides intelligent suggestions based on actual tool capabilities

### 2. Without MCP Server (Fallback Mode)
When MCP server is unavailable:
- AI shows "⚠️ Basic Mode"
- Falls back to mock responses
- Still provides helpful guidance and suggestions
- No real tool execution

## 🎯 User Experience

### Before MCP Integration:
```
User: "Validate my configuration"
AI: "🔧 I can help you fix configuration errors! [Generic advice]"
```

### After MCP Integration:
```
User: "Validate my configuration"  
AI: "🛠️ I can validate your configuration using our validation tool!
     Confidence: 85%
     [Execute Validation Tool] → ✅ Found 2 issues, fixed automatically"
```

## 🛠️ Available Features

### AI Assistant Capabilities
- **Real Tool Execution**: Actually validates, optimizes, and generates configurations
- **Intelligent Analysis**: Understands user intent and suggests appropriate tools
- **Context Awareness**: Considers current configuration step and state
- **Error Handling**: Graceful fallback when tools aren't available

### Development Tools
- **MCP Test Panel**: Test tool connections and responses
- **Debug Information**: See message analysis and tool suggestions
- **Connection Status**: Visual indicators of MCP server status

## 🔧 Troubleshooting

### Common Issues

**1. "MCP Connection Failed"**
- Check that your MCP server is running on localhost:5000
- Verify it accepts WebSocket connections on `ws://localhost:5000`
- Check console for detailed error messages
- Ensure MCP protocol is implemented correctly

**2. "No Tools Available"**
- Ensure your MCP server implements the `tools/list` method
- Check that tools are properly registered on the server
- Verify JSON-RPC 2.0 response format

**3. "Tool Execution Failed"**
- Verify the tool exists on your MCP server
- Check tool parameters match expected schema
- Look at console logs for detailed error info
- Ensure WebSocket connection is stable

### Debug Steps
1. Open browser developer tools (F12)
2. Check console for MCP connection logs
3. Use the MCP Test Panel to test individual tools
4. Verify your MCP server is responding to WebSocket requests
5. Check WebSocket connection in Network tab

## 🔌 WebSocket vs HTTP Implementation

You now have the **native WebSocket MCP implementation**. If you need to switch back to HTTP API integration:

1. The HTTP adapter is available in `src/services/existingApiMCPAdapter.js`
2. The API Explorer is available in `src/components/ExistingAPIExplorer.js`
3. Simply change the import in `src/hooks/useMCPIntegration.js` to switch modes

## 🎉 Next Steps

1. **Configure your MCP server** to accept WebSocket connections on localhost:5000
2. **Implement MCP protocol** in your server (JSON-RPC 2.0 over WebSocket)
3. **Add your infrastructure tools** to the MCP server
4. **Test the connection** using the development panel
5. **Customize the AI responses** based on your specific tools

Your infrastructure configurator is now ready for **native MCP integration** with proper WebSocket support! 🚀

## 📝 Key Files (Current State)

- ✅ `src/services/mcpClientService.js` - Native WebSocket MCP client
- ✅ `src/hooks/useMCPIntegration.js` - WebSocket integration hook
- ✅ `src/config/mcpConfig.js` - Native MCP configuration
- ✅ `src/components/Debug/MCPTestPanel.js` - Testing interface
- ✅ Alternative files available for HTTP mode if needed