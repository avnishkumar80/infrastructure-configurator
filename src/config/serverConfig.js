/**
 * Server Configuration
 * Update these settings to point to your C# MCP server
 */

export const serverConfig = {
  // Update this to your C# server machine's IP address or hostname
  MCP_SERVER_URL: 'http://localhost:5000',
  
  // Alternative configurations for different environments
  development: {
    url: 'http://localhost:5000',
    endpoint: '/mcp'
  },
  
  // If your server is on a different machine, use one of these patterns:
  // url: 'http://192.168.1.100:5000',  // Local network IP
  // url: 'http://your-server-name:5000', // Hostname
  // url: 'http://10.0.0.50:5000',     // Different subnet
  
  production: {
    url: 'https://your-production-server.com:5000',
    endpoint: '/mcp'
  }
};

export const getMCPServerUrl = () => {
  const env = process.env.NODE_ENV || 'development';
  return serverConfig[env]?.url || serverConfig.MCP_SERVER_URL;
};

export const getMCPEndpoint = () => {
  const env = process.env.NODE_ENV || 'development';
  return serverConfig[env]?.endpoint || '/mcp';
};