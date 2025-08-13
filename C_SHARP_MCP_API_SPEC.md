# C# MCP Server API Endpoints

Your C# MCP server running on localhost:5000 needs to implement these HTTP API endpoints to work with the React frontend.

## Required Endpoints

### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T10:30:00Z",
  "server": "mcp-server-csharp"
}
```

### 2. Initialize MCP Connection
```http
POST /api/mcp/initialize
```
**Request Body:**
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
**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "infrastructure-mcp-server",
      "version": "1.0.0"
    }
  }
}
```

### 3. List Available Tools
```http
POST /api/mcp/tools/list
```
**Request Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```
**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "validate_configuration",
        "description": "Validates infrastructure configuration for errors and best practices",
        "inputSchema": {
          "type": "object",
          "properties": {
            "config": {
              "type": "string",
              "description": "Configuration content to validate"
            },
            "format": {
              "type": "string",
              "enum": ["terraform", "yaml", "json"],
              "description": "Configuration format"
            }
          },
          "required": ["config"]
        }
      },
      {
        "name": "generate_terraform_config",
        "description": "Generates Terraform configuration from requirements",
        "inputSchema": {
          "type": "object",
          "properties": {
            "requirements": {
              "type": "string",
              "description": "Infrastructure requirements description"
            },
            "provider": {
              "type": "string",
              "enum": ["aws", "azure", "gcp"],
              "description": "Cloud provider"
            }
          },
          "required": ["requirements", "provider"]
        }
      },
      {
        "name": "analyze_chat_message",
        "description": "Analyzes user messages to suggest relevant tools and actions",
        "inputSchema": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "description": "User message to analyze"
            },
            "context": {
              "type": "object",
              "description": "Additional context information"
            }
          },
          "required": ["message"]
        }
      },
      {
        "name": "optimize_resources",
        "description": "Analyzes and optimizes resource allocation",
        "inputSchema": {
          "type": "object",
          "properties": {
            "config": {
              "type": "string",
              "description": "Current configuration to optimize"
            },
            "objectives": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Optimization objectives (cost, performance, security)"
            }
          },
          "required": ["config"]
        }
      }
    ]
  }
}
```

### 4. Call Tool
```http
POST /api/mcp/tools/call
```
**Request Body:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "validate_configuration",
    "arguments": {
      "config": "resource \"aws_instance\" \"example\" {\n  ami = \"ami-123456\"\n  instance_type = \"t2.micro\"\n}",
      "format": "terraform"
    }
  }
}
```
**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Configuration validation completed successfully!\n\n✅ **Validation Results:**\n- Syntax: Valid\n- Resource types: Valid\n- Required parameters: Present\n\n⚠️ **Recommendations:**\n- Consider adding tags for better resource management\n- Specify availability zone for better control\n- Add security group configuration\n\n📊 **Summary:**\n- Total resources: 1\n- Warnings: 3\n- Errors: 0"
      }
    ],
    "isError": false
  }
}
```

## C# Implementation Example

Here's a basic ASP.NET Core controller structure:

```csharp
[ApiController]
[Route("api")]
public class MCPController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            server = "mcp-server-csharp"
        });
    }

    [HttpPost("mcp/initialize")]
    public IActionResult Initialize([FromBody] JsonRpcRequest request)
    {
        return Ok(new JsonRpcResponse
        {
            jsonrpc = "2.0",
            id = request.id,
            result = new
            {
                protocolVersion = "2024-11-05",
                capabilities = new
                {
                    tools = new
                    {
                        listChanged = true
                    }
                },
                serverInfo = new
                {
                    name = "infrastructure-mcp-server",
                    version = "1.0.0"
                }
            }
        });
    }

    [HttpPost("mcp/tools/list")]
    public IActionResult ListTools([FromBody] JsonRpcRequest request)
    {
        var tools = GetAvailableTools();
        
        return Ok(new JsonRpcResponse
        {
            jsonrpc = "2.0",
            id = request.id,
            result = new { tools }
        });
    }

    [HttpPost("mcp/tools/call")]
    public async Task<IActionResult> CallTool([FromBody] JsonRpcRequest request)
    {
        try
        {
            var toolName = request.@params?.name;
            var arguments = request.@params?.arguments;
            
            var result = await ExecuteTool(toolName, arguments);
            
            return Ok(new JsonRpcResponse
            {
                jsonrpc = "2.0",
                id = request.id,
                result = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new JsonRpcResponse
            {
                jsonrpc = "2.0",
                id = request.id,
                error = new
                {
                    code = -32603,
                    message = ex.Message
                }
            });
        }
    }
}
```

## CORS Configuration

Make sure to enable CORS in your C# server:

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

// Use CORS
app.UseCors();
```

## Testing the Integration

1. Start your C# MCP server on localhost:5000
2. Start the React app: `npm start`
3. Check browser console for connection status
4. Use the MCP Test Panel to verify tool execution