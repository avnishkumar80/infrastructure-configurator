import { getMCPServerUrl } from '../config/serverConfig.js';

/**
 * MCP Client Service with HTTP Transport
 * Native MCP protocol (JSON-RPC 2.0) over HTTP instead of WebSocket
 */
class MCPClientServiceHTTP {
  constructor() {
    this.isConnected = false;
    this.availableTools = [];
    // Get server URL from configuration
    this.baseUrl = getMCPServerUrl();
    this.requestId = 0;
    this.serverInfo = null;
    this.clientCapabilities = {
      tools: {}
    };
  }

  async connect(serverConfig) {
    try {
      console.log('🔌 Connecting to MCP server via HTTP transport...');
      
      // Store config for reconnection
      this.connectionConfig = serverConfig;
      
      // Send MCP initialization via HTTP
      const initResponse = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: this.clientCapabilities,
          clientInfo: {
            name: "infrastructure-configurator",
            version: "1.0.0"
          }
        }
      });

      if (initResponse && initResponse.result) {
        this.serverInfo = initResponse.result.serverInfo;
        console.log('✅ MCP initialization successful:', this.serverInfo);
        
        // Get available tools
        await this.refreshAvailableTools();
        
        this.isConnected = true;
        console.log(`📋 Connected with ${this.availableTools.length} tools available`);
        return true;
      } else {
        throw new Error('Invalid initialization response');
      }
    } catch (error) {
      console.error('❌ Failed to connect to MCP server via HTTP:', error);
      this.isConnected = false;
      return false;
    }
  }

  async refreshAvailableTools() {
    if (!this.isConnected) {
      console.warn('Cannot refresh tools - MCP client not connected');
      return [];
    }
    
    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "tools/list",
        params: {}
      });
      
      if (response && response.result && response.result.tools) {
        this.availableTools = response.result.tools;
        console.log('🔄 Refreshed available MCP tools:', this.availableTools.map(t => t.name));
        return this.availableTools;
      } else {
        console.warn('Invalid tools/list response:', response);
        return [];
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
      
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: parameters
        }
      });

      if (response && response.result) {
        console.log(`✅ Tool ${toolName} executed successfully`);
        
        return {
          success: true,
          result: response.result.content || response.result,
          toolName,
          parameters
        };
      } else if (response && response.error) {
        throw new Error(response.error.message || 'Tool execution failed');
      } else {
        throw new Error('Invalid tool call response');
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

  async sendMCPRequest(request) {
    // Based on your server showing "application/jso" (truncated), let's try exact variations
    const variations = [
      // Try without charset first (most common for C# servers)
      { 'Content-Type': 'application/json' },
      // Try text/json (common for older ASP.NET)
      { 'Content-Type': 'text/json' },
      // Try with explicit charset
      { 'Content-Type': 'application/json; charset=utf-8' },
      // Try JSON-RPC specific
      { 'Content-Type': 'application/jsonrequest' },
      // Try minimal content type
      { 'Content-Type': 'application/json-rpc' },
      // Try exactly what curl showed (if it was truncated)
      { 'Content-Type': 'application/json; charset=UTF-8' },
    ];

    for (let i = 0; i < variations.length; i++) {
      try {
        console.log(`🔄 Attempt ${i + 1}: Testing Content-Type:`, variations[i]['Content-Type']);
        
        const response = await fetch(`${this.baseUrl}/mcp`, {
          method: 'POST',
          headers: variations[i],
          body: JSON.stringify(request)
        });

        console.log(`📝 Response status: ${response.status} ${response.statusText}`);
        console.log(`📝 Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('✅ SUCCESS! Working Content-Type:', variations[i]['Content-Type']);
          console.log('📦 Response data:', data);
          
          return data;
        } else {
          const errorText = await response.text();
          console.warn(`❌ Content-Type "${variations[i]['Content-Type']}" failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.warn(`❌ Content-Type "${variations[i]['Content-Type']}" error:`, error.message);
      }
    }

    // If all failed, throw the last error
    throw new Error('All Content-Type variations failed. Server may require specific content-type configuration.');
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
    if (this.connectionConfig) {
      console.log('🔄 Attempting to reconnect to MCP server...');
      return await this.connect(this.connectionConfig);
    }
    return false;
  }

  disconnect() {
    this.isConnected = false;
    this.availableTools = [];
    this.serverInfo = null;
    console.log('🔌 Disconnected from MCP server');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      toolCount: this.availableTools.length,
      serverType: 'MCP HTTP Transport',
      baseUrl: this.baseUrl,
      serverInfo: this.serverInfo
    };
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Mock mode methods for compatibility
  enableMockMode() {
    console.log('📝 Mock mode enabled - will use fallback responses');
    this.mockMode = true;
  }

  enableRealMode() {
    console.log('🔧 Real mode enabled - will use actual MCP server');
    this.mockMode = false;
  }

  // Additional MCP-specific methods
  async getServerCapabilities() {
    if (!this.serverInfo) {
      return null;
    }
    return this.serverInfo.capabilities;
  }

  async listResources() {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "resources/list",
        params: {}
      });

      return response.result;
    } catch (error) {
      console.warn('Resources not supported by this MCP server:', error);
      return { resources: [] };
    }
  }

  async getPrompts() {
    if (!this.isConnected) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.sendMCPRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "prompts/list",
        params: {}
      });

      return response.result;
    } catch (error) {
      console.warn('Prompts not supported by this MCP server:', error);
      return { prompts: [] };
    }
  }
}

// Export singleton instance
export default new MCPClientServiceHTTP();