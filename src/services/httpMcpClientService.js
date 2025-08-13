/**
 * HTTP-based MCP Client Service for C# Server
 * Connects to MCP server on localhost:5000 via HTTP API
 */
class HttpMCPClientService {
  constructor() {
    this.isConnected = false;
    this.availableTools = [];
    this.baseUrl = 'http://localhost:5000';
    this.requestId = 0;
  }

  async connect() {
    try {
      console.log('🔌 Connecting to C# MCP server at localhost:5000...');
      
      // Test connection by trying to initialize
      const response = await this.sendHttpRequest('/api/mcp/initialize', {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: this.getNextRequestId(),
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            clientInfo: {
              name: "infrastructure-configurator",
              version: "1.0.0"
            }
          }
        })
      });

      if (response.ok) {
        console.log('✅ Connected to C# MCP server');
        
        // Get available tools
        await this.refreshAvailableTools();
        
        this.isConnected = true;
        console.log(`📋 Connected with ${this.availableTools.length} tools available`);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to connect to C# MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  async refreshAvailableTools() {
    try {
      const response = await this.sendHttpRequest('/api/mcp/tools/list', {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: this.getNextRequestId(),
          method: "tools/list"
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.availableTools = data.result?.tools || [];
        console.log('🔄 Refreshed available MCP tools:', this.availableTools.map(t => t.name));
        return this.availableTools;
      } else {
        throw new Error(`Failed to get tools: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to get tools from MCP server:', error);
      return [];
    }
  }

  async callTool(toolName, parameters = {}) {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      console.log(`🛠️ Calling MCP tool: ${toolName}`, parameters);
      
      const response = await this.sendHttpRequest('/api/mcp/tools/call', {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: this.getNextRequestId(),
          method: "tools/call",
          params: {
            name: toolName,
            arguments: parameters
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Tool ${toolName} executed successfully`);
        
        return {
          success: true,
          result: data.result,
          toolName,
          parameters
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Failed to call tool ${toolName}:`, error);
      return {
        success: false,
        error: error.message,
        toolName,
        parameters
      };
    }
  }

  async sendHttpRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      return response;
    } catch (error) {
      console.error(`HTTP request failed: ${error.message}`);
      throw error;
    }
  }

  getNextRequestId() {
    return ++this.requestId;
  }

  getAvailableTools() {
    return this.availableTools;
  }

  isToolAvailable(toolName) {
    return this.availableTools.some(tool => tool.name === toolName);
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect to C# MCP server...');
    return await this.connect();
  }

  disconnect() {
    this.isConnected = false;
    this.availableTools = [];
    console.log('🔌 Disconnected from C# MCP server');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      toolCount: this.availableTools.length,
      serverType: 'HTTP',
      baseUrl: this.baseUrl
    };
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.sendHttpRequest('/api/health', {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default new HttpMCPClientService();