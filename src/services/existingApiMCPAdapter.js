/**
 * Existing API MCP Adapter
 * Connects to your existing C# API endpoints and adapts them for MCP-like usage
 */
class ExistingApiMCPAdapter {
  constructor() {
    this.isConnected = false;
    this.availableTools = [];
    this.baseUrl = 'http://localhost:5000';
    this.requestId = 0;
    this.apiEndpoints = {};
  }

  async connect() {
    try {
      console.log('🔌 Connecting to existing C# API at localhost:5000...');
      
      // Try to discover available endpoints
      await this.discoverEndpoints();
      
      this.isConnected = true;
      console.log(`✅ Connected to existing API with ${this.availableTools.length} tools mapped`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to existing API:', error);
      this.isConnected = false;
      return false;
    }
  }

  async discoverEndpoints() {
    // Try common discovery endpoints
    const discoveryUrls = [
      '/swagger/v1/swagger.json',
      '/api/swagger.json',
      '/swagger.json',
      '/api-docs',
      '/openapi.json'
    ];

    let swaggerSpec = null;

    for (const url of discoveryUrls) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`);
        if (response.ok) {
          swaggerSpec = await response.json();
          console.log(`📋 Found API specification at ${url}`);
          break;
        }
      } catch (error) {
        // Continue to next URL
      }
    }

    if (swaggerSpec) {
      this.parseSwaggerSpec(swaggerSpec);
    } else {
      // Fallback: try common endpoint patterns
      await this.probeCommonEndpoints();
    }
  }

  parseSwaggerSpec(spec) {
    console.log('📖 Parsing Swagger specification...');
    
    const paths = spec.paths || {};
    this.availableTools = [];
    this.apiEndpoints = {};

    Object.entries(paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        if (method.toLowerCase() === 'get' || method.toLowerCase() === 'post') {
          const toolName = this.generateToolName(path, method, details);
          const tool = {
            name: toolName,
            description: details.summary || details.description || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path: path,
            parameters: this.extractParameters(details),
            inputSchema: this.generateInputSchema(details)
          };

          this.availableTools.push(tool);
          this.apiEndpoints[toolName] = {
            method: method.toUpperCase(),
            path: path,
            details: details
          };
        }
      });
    });

    console.log(`🔧 Mapped ${this.availableTools.length} API endpoints to tools`);
  }

  generateToolName(path, method, details) {
    // Generate a user-friendly tool name from the endpoint
    if (details.operationId) {
      return details.operationId.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // Generate from path and method
    const cleanPath = path
      .replace(/^\/api\//, '')
      .replace(/\{[^}]+\}/g, 'item')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return `${method.toLowerCase()}_${cleanPath}`;
  }

  extractParameters(details) {
    const parameters = [];
    
    // Extract path parameters
    if (details.parameters) {
      details.parameters.forEach(param => {
        if (param.in === 'path' || param.in === 'query') {
          parameters.push({
            name: param.name,
            type: param.schema?.type || 'string',
            description: param.description,
            required: param.required || param.in === 'path'
          });
        }
      });
    }

    // Extract request body parameters
    if (details.requestBody?.content?.['application/json']?.schema) {
      const schema = details.requestBody.content['application/json'].schema;
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([name, prop]) => {
          parameters.push({
            name: name,
            type: prop.type || 'object',
            description: prop.description,
            required: schema.required?.includes(name) || false
          });
        });
      }
    }

    return parameters;
  }

  generateInputSchema(details) {
    const properties = {};
    const required = [];

    // Add path and query parameters
    if (details.parameters) {
      details.parameters.forEach(param => {
        if (param.in === 'path' || param.in === 'query') {
          properties[param.name] = {
            type: param.schema?.type || 'string',
            description: param.description
          };
          if (param.required || param.in === 'path') {
            required.push(param.name);
          }
        }
      });
    }

    // Add request body schema
    if (details.requestBody?.content?.['application/json']?.schema) {
      const bodySchema = details.requestBody.content['application/json'].schema;
      if (bodySchema.properties) {
        Object.assign(properties, bodySchema.properties);
        if (bodySchema.required) {
          required.push(...bodySchema.required);
        }
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  async probeCommonEndpoints() {
    console.log('🔍 Probing for common API endpoints...');
    
    const commonEndpoints = [
      { path: '/api/health', method: 'GET', name: 'health_check', description: 'Check API health status' },
      { path: '/api/status', method: 'GET', name: 'status_check', description: 'Get system status' },
      { path: '/api/version', method: 'GET', name: 'get_version', description: 'Get API version' },
      { path: '/api/info', method: 'GET', name: 'get_info', description: 'Get system information' },
      { path: '/api/config', method: 'GET', name: 'get_configuration', description: 'Get configuration' },
      { path: '/api/validate', method: 'POST', name: 'validate_data', description: 'Validate data or configuration' },
      { path: '/api/process', method: 'POST', name: 'process_data', description: 'Process data' },
      { path: '/api/generate', method: 'POST', name: 'generate_content', description: 'Generate content' }
    ];

    for (const endpoint of commonEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok || response.status < 500) {
          this.availableTools.push({
            name: endpoint.name,
            description: endpoint.description,
            method: endpoint.method,
            path: endpoint.path,
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          });

          this.apiEndpoints[endpoint.name] = {
            method: endpoint.method,
            path: endpoint.path
          };

          console.log(`✅ Found working endpoint: ${endpoint.method} ${endpoint.path}`);
        }
      } catch (error) {
        // Endpoint not available, continue
      }
    }
  }

  async callTool(toolName, parameters = {}) {
    if (!this.isConnected) {
      throw new Error('API client not connected');
    }

    const endpoint = this.apiEndpoints[toolName];
    if (!endpoint) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      console.log(`🛠️ Calling API endpoint: ${endpoint.method} ${endpoint.path}`, parameters);
      
      const url = this.buildUrl(endpoint.path, parameters);
      const options = this.buildRequestOptions(endpoint.method, parameters);

      const response = await fetch(url, options);
      const data = await response.json();

      console.log(`✅ API call successful: ${toolName}`);
      
      return {
        success: true,
        result: {
          content: [
            {
              type: 'text',
              text: this.formatApiResponse(data, toolName)
            }
          ]
        },
        toolName,
        parameters,
        rawResponse: data
      };
    } catch (error) {
      console.error(`❌ Failed to call API endpoint ${toolName}:`, error);
      return {
        success: false,
        error: error.message,
        toolName,
        parameters
      };
    }
  }

  buildUrl(path, parameters) {
    let url = `${this.baseUrl}${path}`;
    
    // Replace path parameters
    Object.entries(parameters).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Add query parameters
    const queryParams = new URLSearchParams();
    Object.entries(parameters).forEach(([key, value]) => {
      if (!path.includes(`{${key}}`)) {
        queryParams.append(key, value);
      }
    });

    if (queryParams.toString()) {
      url += '?' + queryParams.toString();
    }

    return url;
  }

  buildRequestOptions(method, parameters) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // For POST requests, send parameters in body
      options.body = JSON.stringify(parameters);
    }

    return options;
  }

  formatApiResponse(data, toolName) {
    // Format the API response in a user-friendly way
    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object') {
      // Try to create a meaningful summary
      if (data.status) {
        return `✅ **${toolName} completed**\nStatus: ${data.status}\n\n${JSON.stringify(data, null, 2)}`;
      }
      
      if (data.message) {
        return `📋 **${toolName} result**\n${data.message}\n\n${JSON.stringify(data, null, 2)}`;
      }

      if (Array.isArray(data)) {
        return `📊 **${toolName} returned ${data.length} items**\n\n${JSON.stringify(data, null, 2)}`;
      }

      return `🔧 **${toolName} completed successfully**\n\n${JSON.stringify(data, null, 2)}`;
    }

    return `✅ ${toolName} returned: ${data}`;
  }

  getAvailableTools() {
    return this.availableTools;
  }

  isToolAvailable(toolName) {
    return this.availableTools.some(tool => tool.name === toolName);
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect to existing API...');
    return await this.connect();
  }

  disconnect() {
    this.isConnected = false;
    this.availableTools = [];
    this.apiEndpoints = {};
    console.log('🔌 Disconnected from existing API');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      toolCount: this.availableTools.length,
      serverType: 'Existing REST API',
      baseUrl: this.baseUrl
    };
  }

  // Health check method
  async healthCheck() {
    const healthUrls = ['/api/health', '/health', '/status', '/api/status'];
    
    for (const url of healthUrls) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // Continue to next URL
      }
    }
    
    return false;
  }
}

// Export singleton instance
export default new ExistingApiMCPAdapter();