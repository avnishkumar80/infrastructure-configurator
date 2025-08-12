import { useState, useEffect, useCallback } from 'react';
import mcpClientService from '../services/mcpClientService.js';

/**
 * MCP Integration Hook (Browser Compatible)
 * Manages connection to MCP server and provides tool execution capabilities
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
        // Browser-compatible MCP server configuration
        const serverConfig = {
          command: 'node', // This won't be used in browser mode
          args: ['mcp-server'], // This won't be used in browser mode
          env: {} // This won't be used in browser mode
        };
        
        console.log('🔌 Attempting MCP connection (browser mode)...');

        const connected = await mcpClientService.connect(serverConfig);
        setIsConnected(connected);
        
        if (connected) {
          const tools = mcpClientService.getAvailableTools();
          setAvailableTools(tools);
          console.log('✅ MCP Integration successful (mock mode active)');
        } else {
          setConnectionError('Failed to connect to MCP server');
          console.log('❌ MCP Integration failed');
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
      mcpClientService.disconnect();
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
      const result = await mcpClientService.callTool(toolName, parameters);
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
      const tools = await mcpClientService.refreshAvailableTools();
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
      const connected = await mcpClientService.reconnect();
      setIsConnected(connected);
      
      if (connected) {
        const tools = mcpClientService.getAvailableTools();
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
      ...mcpClientService.getConnectionStatus()
    };
  }, [isConnected, isConnecting, availableTools.length, connectionError]);

  // Methods to control mock/real mode
  const enableMockMode = useCallback(() => {
    mcpClientService.enableMockMode();
  }, []);

  const enableRealMode = useCallback(() => {
    mcpClientService.enableRealMode();
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
