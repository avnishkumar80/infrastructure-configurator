import { useState, useEffect, useCallback } from 'react';
import existingApiMCPAdapter from '../services/existingApiMCPAdapter.js';

/**
 * MCP Integration Hook (Existing API Adapter)
 * Manages connection to existing C# API and adapts it for MCP-like usage
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
        
        console.log('🔌 Attempting to connect to existing C# API at localhost:5000...');

        const connected = await existingApiMCPAdapter.connect();
        setIsConnected(connected);
        
        if (connected) {
          const tools = existingApiMCPAdapter.getAvailableTools();
          setAvailableTools(tools);
          console.log('✅ Existing API integration successful');
        } else {
          setConnectionError('Failed to connect to existing C# API on localhost:5000');
          console.log('❌ Existing API integration failed');
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
      existingApiMCPAdapter.disconnect();
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
      const result = await existingApiMCPAdapter.callTool(toolName, parameters);
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
      const tools = await existingApiMCPAdapter.refreshAvailableTools();
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
      const connected = await existingApiMCPAdapter.reconnect();
      setIsConnected(connected);
      
      if (connected) {
        const tools = existingApiMCPAdapter.getAvailableTools();
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
      ...existingApiMCPAdapter.getConnectionStatus()
    };
  }, [isConnected, isConnecting, availableTools.length, connectionError]);

  // Remove the mock mode methods since HTTP client doesn't need them
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
    
    // Utility functions
    isToolAvailable: useCallback((toolName) => {
      return availableTools.some(tool => tool.name === toolName);
    }, [availableTools])
  };
};
