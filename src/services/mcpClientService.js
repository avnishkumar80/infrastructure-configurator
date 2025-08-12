/**
 * Browser-Compatible MCP Client Service
 * Simulates MCP integration without Node.js dependencies
 */
class MCPClientService {
  constructor() {
    this.isConnected = false;
    this.availableTools = [];
    this.connectionConfig = null;
    this.mockMode = true; // Enable mock mode for browser compatibility
  }

  async connect(serverConfig) {
    try {
      console.log('🔌 Attempting MCP connection (browser mode)...', serverConfig);
      
      // Store config for reconnection
      this.connectionConfig = serverConfig;
      
      // In browser environment, we'll simulate connection
      // For real implementation, you'd use WebSocket or HTTP API
      if (this.mockMode) {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.isConnected = true;
        this.availableTools = this.getMockTools();
        
        console.log('✅ Connected to MCP server (mock mode)');
        console.log(`📋 Found ${this.availableTools.length} available tools`);
        
        return true;
      }
      
      // For real implementation, replace with actual MCP connection
      // Example: WebSocket connection to your MCP server
      // const ws = new WebSocket('ws://localhost:8080/mcp');
      // ... handle connection
      
      return false;
    } catch (error) {
      console.error('❌ Failed to connect to MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  getMockTools() {
    return [
      {
        name: 'analyze_chat_message',
        description: 'Analyzes user messages to suggest relevant tools and actions',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            context: { type: 'object' }
          }
        }
      },
      {
        name: 'validate_configuration',
        description: 'Validates infrastructure configuration for errors and best practices',
        inputSchema: {
          type: 'object',
          properties: {
            configuration: { type: 'object' },
            check_types: { type: 'array' }
          }
        }
      },
      {
        name: 'generate_terraform_config',
        description: 'Generates Terraform configuration from requirements',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: { type: 'object' },
            platform: { type: 'string' }
          }
        }
      },
      {
        name: 'optimize_resources',
        description: 'Analyzes and optimizes resource allocation',
        inputSchema: {
          type: 'object',
          properties: {
            current_config: { type: 'object' },
            optimization_goals: { type: 'array' }
          }
        }
      }
    ];
  }

  async refreshAvailableTools() {
    if (!this.isConnected) {
      console.warn('Cannot refresh tools - MCP client not connected');
      return [];
    }
    
    try {
      if (this.mockMode) {
        this.availableTools = this.getMockTools();
        console.log('🔄 Refreshed available MCP tools (mock)');
        return this.availableTools;
      }
      
      // For real implementation:
      // const response = await fetch('/api/mcp/tools');
      // this.availableTools = await response.json();
      
      return this.availableTools;
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
      
      if (this.mockMode) {
        // Simulate tool execution with mock responses
        const mockResult = await this.getMockToolResult(toolName, parameters);
        console.log(`✅ Tool ${toolName} executed successfully (mock)`);
        
        return {
          success: true,
          result: mockResult,
          toolName,
          parameters
        };
      }
      
      // For real implementation:
      // const response = await fetch('/api/mcp/tools/call', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: toolName, arguments: parameters })
      // });
      // const result = await response.json();
      
      return {
        success: false,
        error: 'Real MCP implementation needed',
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

  async getMockToolResult(toolName, parameters) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (toolName) {
      case 'analyze_chat_message':
        return this.mockAnalyzeChatMessage(parameters);
      
      case 'validate_configuration':
        return this.mockValidateConfiguration(parameters);
      
      case 'generate_terraform_config':
        return this.mockGenerateTerraform(parameters);
      
      case 'optimize_resources':
        return this.mockOptimizeResources(parameters);
      
      default:
        return {
          summary: `Mock result for ${toolName}`,
          message: `Tool ${toolName} executed successfully in mock mode`
        };
    }
  }

  mockAnalyzeChatMessage(parameters) {
    const message = parameters.message || '';
    const lowerMessage = message.toLowerCase();
    
    let confidence = 0.5;
    let detectedIntents = [];
    let suggestedTools = [];
    
    // Simple intent detection
    if (lowerMessage.includes('validate') || lowerMessage.includes('check')) {
      confidence = 0.8;
      detectedIntents = [{ intent: 'validation', confidence: 0.8 }];
      suggestedTools = [{
        tool_name: 'validate_configuration',
        tool_info: { description: 'Validates infrastructure configuration' },
        relevance_score: 0.9,
        suggested_parameters: { configuration: parameters.context?.configuration }
      }];
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
      confidence = 0.8;
      detectedIntents = [{ intent: 'optimization', confidence: 0.8 }];
      suggestedTools = [{
        tool_name: 'optimize_resources',
        tool_info: { description: 'Optimizes resource allocation' },
        relevance_score: 0.9
      }];
    } else if (lowerMessage.includes('generate') || lowerMessage.includes('terraform')) {
      confidence = 0.8;
      detectedIntents = [{ intent: 'generation', confidence: 0.8 }];
      suggestedTools = [{
        tool_name: 'generate_terraform_config',
        tool_info: { description: 'Generates Terraform configuration' },
        relevance_score: 0.9
      }];
    }
    
    return {
      confidence_score: confidence,
      detected_intents: detectedIntents,
      suggested_tools: suggestedTools,
      extracted_entities: {
        technologies: [],
        configurations: [],
        quantities: []
      }
    };
  }

  mockValidateConfiguration(parameters) {
    return {
      is_valid: true,
      score: 85,
      errors: [],
      warnings: ['Consider adding more storage for future growth'],
      suggestions: ['Enable automatic backups', 'Add monitoring configuration'],
      summary: 'Configuration validation complete. Score: 85/100. Found 0 errors, 1 warning, 2 suggestions.'
    };
  }

  mockGenerateTerraform(parameters) {
    return {
      terraform_config: {
        provider: 'aws',
        resources: {
          'aws_instance': {
            'web_server': {
              ami: 'ami-0abcdef1234567890',
              instance_type: 't3.medium'
            }
          }
        }
      },
      summary: 'Generated Terraform configuration for AWS platform with 1 EC2 instance'
    };
  }

  mockOptimizeResources(parameters) {
    return {
      optimizations: [
        {
          type: 'cost_reduction',
          description: 'Switch to t3.small instances to save 30% on compute costs',
          estimated_savings: '$150/month'
        },
        {
          type: 'performance_improvement',
          description: 'Add SSD storage for 50% faster database operations',
          impact: 'High'
        }
      ],
      total_estimated_savings: '$150/month',
      summary: 'Found 2 optimization opportunities with potential savings of $150/month'
    };
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
    console.log('🔌 Disconnected from MCP server');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      toolCount: this.availableTools.length,
      mockMode: this.mockMode
    };
  }

  // Method to switch to real MCP mode (when server is available)
  enableRealMode() {
    this.mockMode = false;
    console.log('🔄 Switched to real MCP mode');
  }

  // Method to switch back to mock mode
  enableMockMode() {
    this.mockMode = true;
    console.log('🔄 Switched to mock MCP mode');
  }
}

// Export singleton instance
export default new MCPClientService();
