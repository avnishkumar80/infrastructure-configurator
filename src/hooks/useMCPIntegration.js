import { useState, useEffect, useCallback } from 'react';
import mcpClientServiceHTTP from '../services/mcpClientServiceHTTP.js';

/**
 * MCP Integration Hook (HTTP Transport)
 * Manages connection to MCP server via HTTP transport and provides tool execution capabilities
 */
export const useMCPIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Connect to MCP server on component mount
  useEffect(() => {
    const connectToMCP = async () => {
      setIsConnecting(true);
      setConnectionError(null);
      
      try {
        // MCP HTTP transport server configuration
        // Update the baseUrl to point to your C# server machine
        const serverConfig = {
          baseUrl: 'http://localhost:5000', // Change to http://YOUR_SERVER_IP:5000
          transport: 'http'
        };
        
        console.log('🔌 Attempting MCP connection via HTTP transport...');

        const connected = await mcpClientServiceHTTP.connect(serverConfig);
        setIsConnected(connected);
        
        if (connected) {
          const tools = mcpClientServiceHTTP.getAvailableTools();
          setAvailableTools(tools);
          console.log('✅ MCP HTTP Transport Integration successful');
        } else {
          setConnectionError('Failed to connect to MCP server via HTTP transport');
          console.log('❌ MCP HTTP Transport Integration failed');
          setAvailableTools([]);
        }
      } catch (error) {
        console.error('MCP Connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        setAvailableTools([]);
      }
      
      setIsConnecting(false);
    };

    connectToMCP();

    // Cleanup on unmount
    return () => {
      mcpClientServiceHTTP.disconnect();
    };
  }, []);

  const callTool = useCallback(async (toolName, parameters = {}) => {
    if (!isConnected) {
      console.warn(`Cannot call tool ${toolName} - MCP not connected`);
      return {
        success: false,
        error: 'MCP server not connected',
        toolName,
        parameters
      };
    }

    try {
      const result = await mcpClientServiceHTTP.callTool(toolName, parameters);
      return result;
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      return {
        success: false,
        error: error.message,
        toolName,
        parameters
      };
    }
  }, [isConnected]);

  const refreshTools = useCallback(async () => {
    if (!isConnected) return [];
    
    try {
      const tools = await mcpClientServiceHTTP.refreshAvailableTools();
      setAvailableTools(tools);
      return tools;
    } catch (error) {
      console.error('Error refreshing tools:', error);
      return [];
    }
  }, [isConnected]);

  const reconnect = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const connected = await mcpClientServiceHTTP.reconnect();
      setIsConnected(connected);
      
      if (connected) {
        const tools = mcpClientServiceHTTP.getAvailableTools();
        setAvailableTools(tools);
      }
      
      return connected;
    } catch (error) {
      setConnectionError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const getConnectionStatus = useCallback(() => {
    return {
      isConnected,
      isConnecting,
      toolCount: availableTools.length,
      error: connectionError,
      ...mcpClientServiceHTTP.getConnectionStatus()
    };
  }, [isConnected, isConnecting, availableTools.length, connectionError]);

  // Methods to control mock/real mode (HTTP transport compatible)
  const enableMockMode = useCallback(() => {
    mcpClientServiceHTTP.enableMockMode();
  }, []);

  const enableRealMode = useCallback(() => {
    mcpClientServiceHTTP.enableRealMode();
  }, []);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Tools
    availableTools,
    
    // Actions
    callTool,
    refreshTools,
    reconnect,
    getConnectionStatus,
    
    // Mode control
    enableMockMode,
    enableRealMode,
    
    // Utility functions
    isToolAvailable: useCallback((toolName) => {
      return availableTools.some(tool => tool.name === toolName);
    }, [availableTools])
  };
};
