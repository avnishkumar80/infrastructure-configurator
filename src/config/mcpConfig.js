/**
 * MCP Configuration
 * Configure connection to your team's MCP server
 */

export const mcpConfig = {
  // Development configuration for C# HTTP server
  development: {
    serverType: 'http',
    baseUrl: 'http://localhost:5000',
    endpoints: {
      health: '/api/health',
      initialize: '/api/mcp/initialize',
      listTools: '/api/mcp/tools/list',
      callTool: '/api/mcp/tools/call'
    },
    autoReconnect: true,
    reconnectDelay: 5000
  },
  
  // Production configuration for C# HTTP server
  production: {
    serverType: 'http',
    baseUrl: 'http://your-production-server:5000',
    endpoints: {
      health: '/api/health',
      initialize: '/api/mcp/initialize',
      listTools: '/api/mcp/tools/list',
      callTool: '/api/mcp/tools/call'
    },
    autoReconnect: true,
    reconnectDelay: 10000
  },
  
  // Mock configuration for when MCP server is not available
  mock: {
    enabled: true,
    mockTools: [
      {
        name: 'analyze_chat_message',
        description: 'Analyzes user messages to suggest relevant tools and actions'
      },
      {
        name: 'validate_configuration',
        description: 'Validates infrastructure configuration for errors and best practices'
      },
      {
        name: 'generate_terraform_config',
        description: 'Generates Terraform configuration from requirements'
      },
      {
        name: 'optimize_resources',
        description: 'Analyzes and optimizes resource allocation'
      }
    ]
  },
  
  // Tools that are safe to auto-execute without confirmation
  safeAutoExecuteTools: [
    'validate_configuration',
    'check_system_status',
    'get_recommendations',
    'analyze_current_setup',
    'list_available_options',
    'analyze_chat_message'
  ],
  
  // Tools that always require user confirmation
  confirmationRequiredTools: [
    'deploy_configuration',
    'delete_resources',
    'modify_production_config',
    'restart_services',
    'backup_data'
  ],
  
  // Default tool parameters
  defaultToolParams: {
    timeout: 30000, // 30 seconds
    retries: 3,
    includeContext: true
  }
};

export const getMCPConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return mcpConfig[env] || mcpConfig.development;
};

export const isSafeToAutoExecute = (toolName) => {
  return mcpConfig.safeAutoExecuteTools.includes(toolName);
};

export const requiresConfirmation = (toolName) => {
  return mcpConfig.confirmationRequiredTools.includes(toolName);
};
