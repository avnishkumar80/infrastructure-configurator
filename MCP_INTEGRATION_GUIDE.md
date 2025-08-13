# 🚀 MCP Integration Setup Guide - C# HTTP Server

## ✅ What's Been Updated

Your infrastructure configurator now has **HTTP-based MCP (Model Context Protocol) integration** for connecting to your C# server! Here's what's been implemented:

### 🔧 Enhanced MCP Components
- ✅ HTTP MCP Client Service (`services/httpMcpClientService.js`)
- ✅ Updated MCP Integration Hook (`hooks/useMCPIntegration.js`)
- ✅ Updated MCP Configuration (`config/mcpConfig.js`)
- ✅ Enhanced AI Service integration
- ✅ MCP Test Panel for development testing
- ✅ Connection Test Component

### 🌐 C# Server Integration
- ✅ HTTP API endpoints specification
- ✅ JSON-RPC 2.0 protocol support
- ✅ CORS configuration guidance
- ✅ Real-time connection status
- ✅ Automatic reconnection support

## 🚀 Step-by-Step Setup

### Step 1: Start Your C# MCP Server
Ensure your C# MCP server is running on localhost:5000 with the required endpoints:
```
http://localhost:5000/api/health
http://localhost:5000/api/mcp/initialize
http://localhost:5000/api/mcp/tools/list
http://localhost:5000/api/mcp/tools/call
```

### Step 2: Enable CORS in Your C# Server
Add this to your C# server configuration:
```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000") // React app URL
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors();
```

### Step 3: Start the React Application
```bash
cd /Users/avnishkumar/Documents/infrastructure-configurator
npm start
```

### Step 4: Test the Connection
1. Open your React app in the browser (http://localhost:3000)
2. Look for the **"MCP Tests"** button in the bottom-left corner
3. Click it to open the MCP Test Panel
4. Check the connection status indicator:
   - 🟢 Green = Connected to C# server
   - 🟡 Yellow = Connecting...
   - 🔴 Red = Connection failed

### Step 5: Verify Tool Integration
1. In the MCP Test Panel, try the quick test buttons
2. Check that tools are discovered from your C# server
3. Verify tool execution works correctly
4. Monitor the browser console for detailed logs

## 🔧 C# Server Requirements

Your C# MCP server must implement these endpoints (see `C_SHARP_MCP_API_SPEC.md` for full details):

### Health Check
```http
GET /api/health
```

### Initialize Connection
```http
POST /api/mcp/initialize
```

### List Available Tools
```http
POST /api/mcp/tools/list
```

### Execute Tools
```http
POST /api/mcp/tools/call
```

## 📊 Recommended Tools for Infrastructure Configurator

Implement these tools in your C# server for best integration:

1. **analyze_chat_message** - Analyzes user messages and suggests relevant actions
2. **validate_configuration** - Validates infrastructure configurations
3. **generate_terraform_config** - Generates Terraform code from requirements
4. **optimize_resources** - Provides optimization recommendations
5. **check_system_status** - Checks current system health and status

## 🧪 Testing Features

### Development Test Panel
- Quick test buttons for common scenarios
- Custom message testing
- Real-time connection status
- Tool execution timing
- Error reporting and debugging

### Connection Test Component
Available at `/src/components/MCPConnectionTest.js` for standalone testing.

## 🛠️ Enhanced AI Assistant

The AI Assistant now has:
- **Real-time connection status** to your C# server
- **Intelligent tool discovery** from your server's tool list
- **Actual tool execution** when server is available
- **Graceful fallback** when server is unavailable
- **Context-aware suggestions** based on available tools

## 🔧 Troubleshooting

### Common Issues

**1. "Failed to connect to C# MCP server on localhost:5000"**
- Verify your C# server is running on port 5000
- Check that the health endpoint responds: `curl http://localhost:5000/api/health`
- Ensure CORS is configured correctly

**2. "CORS Error"**
- Add React app origin to CORS policy: `http://localhost:3000`
- Verify CORS middleware is applied before routing
- Check browser developer tools for CORS-specific error messages

**3. "No tools available"**
- Ensure `/api/mcp/tools/list` endpoint returns tool definitions
- Verify JSON-RPC 2.0 response format
- Check that tools are properly registered in your C# server

**4. "Tool execution failed"**
- Verify tool names match exactly between client and server
- Check parameter validation in your C# tool implementations
- Monitor server logs for execution errors

### Debug Steps
1. Open browser developer tools (F12)
2. Check Network tab for HTTP requests to localhost:5000
3. Use the MCP Test Panel to test individual operations
4. Check Console tab for detailed error logs
5. Verify C# server logs for incoming requests

## 🎯 Server Implementation Tips

### ASP.NET Core Controller Example
```csharp
[ApiController]
[Route("api")]
public class MCPController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }

    [HttpPost("mcp/tools/list")]
    public IActionResult ListTools([FromBody] JsonRpcRequest request)
    {
        var tools = GetAvailableTools(); // Your tool discovery logic
        return Ok(new JsonRpcResponse
        {
            jsonrpc = "2.0",
            id = request.id,
            result = new { tools }
        });
    }
    
    // ... other endpoints
}
```

### Tool Response Format
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Configuration validation completed successfully!\n\n✅ Syntax: Valid\n❌ Found 2 issues:\n- Missing required tags\n- Deprecated instance type"
      }
    ],
    "isError": false
  }
}
```

## 🎉 Next Steps

1. **Implement the required API endpoints** in your C# server
2. **Add your infrastructure tools** (validation, generation, optimization)
3. **Test the integration** using the MCP Test Panel
4. **Customize tool responses** to match your domain needs
5. **Deploy with confidence** knowing you have real server integration

Your infrastructure configurator now connects directly to your C# MCP server and can execute real infrastructure tools! 🚀

## 📝 Files Modified/Created

- ✅ `src/services/httpMcpClientService.js` - HTTP client for C# server
- ✅ `src/hooks/useMCPIntegration.js` - Updated for HTTP integration
- ✅ `src/config/mcpConfig.js` - HTTP server configuration
- ✅ `src/components/MCPConnectionTest.js` - Standalone test component
- ✅ `C_SHARP_MCP_API_SPEC.md` - Complete API specification
- ✅ `MCP_INTEGRATION_GUIDE.md` - This updated guide