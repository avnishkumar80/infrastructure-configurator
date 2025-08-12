/**
 * Enhanced MCP Client Service for Real Server Connection
 * Connects to MCP server on localhost:5000
 */
class MCPClientService {
  constructor() {
    this.isConnected = false;
    this.availableTools = [];
    this.connectionConfig = null;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async connect(serverConfig) {
    try {
      console.log('🔌 Connecting to MCP server at localhost:5000...');
      
      // Store config for reconnection
      this.connectionConfig = serverConfig;
      
      // Connect via WebSocket to your MCP server
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket('ws://localhost:5000');
        
        this.ws.onopen = async () => {
          console.log('✅ WebSocket connected to MCP server');
          
          try {
            // Send MCP initialization
            await this.initializeMCP();
            
            // Get available tools
            await this.refreshAvailableTools();
            
            this.isConnected = true;
            console.log(`📋 Connected with ${this.availableTools.length} tools available`);
            resolve(true);
          } catch (error) {
            console.error('❌ MCP initialization failed:', error);
            this.isConnected = false;
            reject(error);
          }
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('🔌 WebSocket connection closed');
          this.isConnected = false;
          this.ws = null;
        };
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  async initializeMCP() {
    return this.sendRequest({
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
    });
  }

  async refreshAvailableTools() {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot refresh tools - MCP client not connected');
      return [];
    }
    
    try {
      const response = await this.sendRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "tools/list"
      });
      
      this.availableTools = response.tools || [];
      console.log('🔄 Refreshed available MCP tools:', this.availableTools.map(t => t.name));
      return this.availableTools;
    } catch (error) {
      console.error('Failed to get tools from MCP server:', error);
      return [];
    }
  }

  async callTool(toolName, parameters = {}) {
    if (!this.isConnected || !this.ws) {
      throw new Error('MCP client not connected');
    }

    try {
      console.log(`🛠️ Calling MCP tool: ${toolName}`, parameters);
      
      const response = await this.sendRequest({
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: parameters
        }
      });

      console.log(`✅ Tool ${toolName} executed successfully`);
      
      return {
        success: true,
        result: response.content,
        toolName,
        parameters
      };
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

  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = request.id;
      this.pendingRequests.set(requestId, { resolve, reject });

      this.ws.send(JSON.stringify(request));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'MCP error'));
      } else {
        resolve(message.result);
      }
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
    if (this.connectionConfig) {
      console.log('🔄 Attempting to reconnect to MCP server...');
      return await this.connect(this.connectionConfig);
    }
    return false;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.availableTools = [];
    this.pendingRequests.clear();
    console.log('🔌 Disconnected from MCP server');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      toolCount: this.availableTools.length,
      hasWebSocket: !!this.ws
    };
  }
}

// Export singleton instance
export default new MCPClientService();
