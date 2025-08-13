/**
 * HTTP-based MCP Client Service for C# Server
 * Connects to MCP server on http://<server>:5000 via HTTP API
 */
class HttpMCPClientService {
  constructor({ baseUrl = 'http://192.168.4.47:5000' } = {}) {
    this.isConnected = false;
    this.availableTools = [];
    this.baseUrl = baseUrl.replace(/\/$/, ''); // strip trailing slash
    this.requestId = 0;
  }

  async connect() {
    try {
      console.log(`🔌 Connecting to C# MCP server at ${this.baseUrl}...`);

      // Initialize session
      const initPayload = {
        jsonrpc: "2.0",
        id: this.getNextRequestId(),
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05", // keep as string
          capabilities: { tools: {} },
          clientInfo: { name: "infrastructure-configurator", version: "1.0.0" }
        }
      };

      const response = await this.sendHttpRequest('/mcp/initialize', {
        method: 'POST',
        body: JSON.stringify(initPayload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${response.statusText} ${text}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`MCP initialize error: ${JSON.stringify(data.error)}`);
      }

      // Get available tools
      await this.refreshAvailableTools();

      this.isConnected = true;
      console.log(`✅ Connected. Tools available: ${this.availableTools.map(t => t.name).join(', ')}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to C# MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  async refreshAvailableTools() {
    const payload = {
      jsonrpc: "2.0",
      id: this.getNextRequestId(),
      method: "tools/list"
    };

    const response = await this.sendHttpRequest('/mcp/tools/list', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to get tools: HTTP ${response.status} ${text}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`tools/list error: ${JSON.stringify(data.error)}`);
    }

    this.availableTools = data.result?.tools || [];
    console.log('🔄 Refreshed MCP tools:', this.availableTools.map(t => t.name));
    return this.availableTools;
  }

  async callTool(toolName, parameters = {}) {
    if (!this.isConnected) throw new Error('MCP client not connected');

    console.log(`🛠️ Calling MCP tool: ${toolName}`, parameters);

    const payload = {
      jsonrpc: "2.0",
      id: this.getNextRequestId(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: parameters
      }
    };

    const response = await this.sendHttpRequest('/mcp/tools/call', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${response.statusText} ${text}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`tools/call error: ${JSON.stringify(data.error)}`);
    }

    console.log(`✅ Tool ${toolName} executed successfully`);
    return { success: true, result: data.result, toolName, parameters };
  }

  async sendHttpRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // You can add timeouts via AbortController if needed
      ...options
    };

    try {
      const res = await fetch(url, defaultOptions);
      return res;
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
    return this.availableTools.some(t => t.name === toolName);
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect to C# MCP server...');
    return this.connect();
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

  async healthCheck() {
    try {
      const response = await this.sendHttpRequest('/health', { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new HttpMCPClientService();
