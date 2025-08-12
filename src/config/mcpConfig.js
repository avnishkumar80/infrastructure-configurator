/**
 * MCP Configuration
 * Configure connection to your team's MCP server
 */

export const mcpConfig = {
  // Development configuration
  development: {
    command: 'node',
    // TODO: Update this path to point to your team's MCP server
    args: ['../your-mcp-server/dist/index.js'], 
    env: {
      ...process.env,
      NODE_ENV: 'development',
      MCP_LOG_LEVEL: 'debug'
    },
    autoReconnect: true,
    reconnectDelay: 5000
  },
  
  // Production configuration
  production: {
    command: 'node',
    args: ['./mcp-server/index.js'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      MCP_LOG_LEVEL: 'info'
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
