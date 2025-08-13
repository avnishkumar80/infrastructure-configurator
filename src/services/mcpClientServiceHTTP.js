// Optional: resolve server URL from env/config
function getMCPServerUrl() {
  if (typeof process !== 'undefined' && process.env && process.env.MCP_SERVER_URL) {
    return process.env.MCP_SERVER_URL;
  }
  return 'http://192.168.4.47:5000';
}

class MCPClientServiceHTTP {
  constructor({ baseUrl = getMCPServerUrl(), basePath = '/mcp' } = {}) {
    this.isConnected = false;
    this.availableTools = [];
    this.baseUrl = String(baseUrl || '').replace(/\/+$/, '');
    this.basePath = String(basePath || '/mcp').replace(/\/+$/, '');
    this.requestId = 0;
    this.serverInfo = null;
    this.clientCapabilities = { tools: {} };

    // cache working endpoint for RPC calls
    this.workingEndpoint = null; // e.g., '/mcp' or '/mcp/initialize' just for init
  }

  getNextRequestId() { return ++this.requestId; }
  _url(endpoint) { return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`; }

  async connect(serverConfig) {
    try {
      console.log('🔌 Connecting to MCP server via HTTP transport...');
      this.connectionConfig = serverConfig;

      // Try single-endpoint JSON-RPC at /mcp first, then per-method /mcp/initialize
      const endpointsForInit = [this.basePath || '/mcp', `${this.basePath || '/mcp'}/initialize`];

      const initReq = {
        jsonrpc: '2.0',
        id: this.getNextRequestId(),
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: this.clientCapabilities,
          clientInfo: { name: 'infrastructure-configurator', version: '1.0.0' }
        }
      };

      const initResp = await this._sendWithDiscovery(initReq, endpointsForInit);

      // Surface RPC error explicitly
      if (initResp && initResp.error) {
        throw new Error(`Initialize error: ${initResp.error.message || JSON.stringify(initResp.error)}`);
      }

      // Accept JSON-RPC envelope or a "flattened" result
      const result = initResp?.result || (initResp?.serverInfo ? initResp : null);
      if (!result) {
        console.warn('Initialization envelope did not contain result. Full response:', initResp);
        throw new Error('Invalid initialization response');
      }

      this.serverInfo = result.serverInfo || null;
      console.log('✅ MCP initialization successful:', this.serverInfo);

      // Mark connected before fetching tools
      this.isConnected = true;

      await this.refreshAvailableTools();
      console.log(`📋 Connected with ${this.availableTools.length} tools available`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MCP server via HTTP:', error);
      this.isConnected = false;
      return false;
    }
  }

  async refreshAvailableTools() {
    try {
      const resp = await this.sendMCPRequest({
        jsonrpc: '2.0',
        id: this.getNextRequestId(),
        method: 'tools/list',
        params: {}
      });

      if (resp?.error) {
        console.warn('tools/list RPC error:', resp.error);
        return [];
      }

      const tools = resp?.result?.tools;
      if (Array.isArray(tools)) {
        this.availableTools = tools;
        console.log('🔄 Refreshed available MCP tools:', this.availableTools.map(t => t.name));
        return this.availableTools;
      }

      console.warn('Invalid tools/list response:', resp);
      return [];
    } catch (e) {
      console.error('Failed to get tools from MCP server:', e);
      return [];
    }
  }

  async callTool(toolName, parameters = {}) {
    if (!this.isConnected) throw new Error('MCP client not connected');

    const resp = await this.sendMCPRequest({
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: { name: toolName, arguments: parameters }
    });

    if (resp?.error) throw new Error(resp.error.message || 'Tool execution failed');

    return {
      success: true,
      result: resp?.result?.content ?? resp?.result ?? resp,
      toolName,
      parameters
    };
  }

  // ---- Core transport helpers ----

  async sendMCPRequest(request) {
    // For post-init, prefer a single RPC endpoint at /mcp (common pattern)
    const endpoints = [this.basePath || '/mcp'];
    return await this._sendWithDiscovery(request, endpoints);
  }

  async _sendWithDiscovery(request, endpoints) {
    // Try cached working endpoint first
    if (this.workingEndpoint && endpoints.includes(this.workingEndpoint)) {
      try {
        return await this._postJsonRpc(this.workingEndpoint, request);
      } catch (e) {
        console.warn(`⚠️ Cached endpoint failed (${this.workingEndpoint}). Falling back...`, e.message);
      }
    }

    const failures = [];
    for (const ep of endpoints) {
      try {
        const data = await this._postJsonRpc(ep, request);
        this.workingEndpoint = ep; // cache success
        return data;
      } catch (e) {
        failures.push({ endpoint: ep, error: e.message });
        console.warn(`❌ ${ep} failed: ${e.message}`);
      }
    }

    const msg = ['All endpoint attempts failed.', 'Tried:', ...failures.map(f => `- ${f.endpoint}: ${f.error}`)].join('\n');
    throw new Error(msg);
  }

  async _postJsonRpc(endpoint, request) {
    const url = this._url(endpoint);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        // Server requires JSON body + both acceptable response types
        'Content-Type': 'application/json',
        'Accept': 'application/json; q=1.0, text/event-stream; q=0.9'
      },
      body: JSON.stringify(request)
    });

    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}. Body: ${text.slice(0, 500)}`);
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();

    // Prefer JSON
    if (ct.includes('application/json')) {
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Non-JSON response. Body: ${text.slice(0, 500)}`);
      }
    }

    // If server ever streams SSE for initialize (rare), try to parse first event payload
    if (ct.includes('text/event-stream')) {
      // Very simple parse: look for first `data: ...` line that is JSON
      const match = text.match(/^\s*data:\s*(\{[\s\S]*?\})\s*$/m);
      if (match) {
        try { return JSON.parse(match[1]); } catch { /* fall through */ }
      }
      // As a fallback, return the raw stream so caller can decide
      return { stream: text, contentType: ct };
    }

    // Unknown content-type; return raw body
    return { raw: text, contentType: ct };
  }

  // ---- Misc helpers ----

  getAvailableTools() { return this.availableTools; }
  isToolAvailable(name) { return this.availableTools.some(t => t.name === name); }

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
      basePath: this.basePath,
      workingEndpoint: this.workingEndpoint,
      serverInfo: this.serverInfo
    };
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export default new MCPClientServiceHTTP();
