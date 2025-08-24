import { useState, useEffect, useCallback } from 'react';
import llmService from '../services/llmService.js';

/**
 * LLM Connection Status Hook
 * Tracks the connection status to the configured LLM service
 */
export const useLLMConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [llmConfig, setLlmConfig] = useState(null);
  const [lastTestTime, setLastTestTime] = useState(null);

  // Test LLM connection
  const testConnection = useCallback(async (force = false) => {
    // Don't test too frequently unless forced
    const now = Date.now();
    if (!force && lastTestTime && (now - lastTestTime) < 30000) { // 30 seconds cooldown
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const result = await llmService.testConnection();
      setIsConnected(result.success);
      setLlmConfig(result.config);
      setLastTestTime(now);
      
      if (!result.success) {
        setConnectionError(result.error);
        console.warn('❌ LLM Connection test failed:', result.error);
      } else {
        console.log('✅ LLM Connection test successful');
      }

      return result;
    } catch (error) {
      console.error('LLM Connection test error:', error);
      setIsConnected(false);
      setConnectionError(error.message);
      setLastTestTime(now);
      return { success: false, error: error.message };
    } finally {
      setIsConnecting(false);
    }
  }, [lastTestTime]);

  // Test connection on mount and periodically
  useEffect(() => {
    // Initial test
    testConnection();

    // Periodic testing (every 5 minutes)
    const interval = setInterval(() => {
      testConnection();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [testConnection]);

  // Listen for config changes in localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'llm-config') {
        console.log('🔄 LLM config changed, retesting connection...');
        // Small delay to let the service update its config
        setTimeout(() => testConnection(true), 500);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [testConnection]);

  // Get current LLM configuration
  const getCurrentConfig = useCallback(() => {
    return llmService.getConfig();
  }, []);

  // Force reconnect
  const reconnect = useCallback(async () => {
    return await testConnection(true);
  }, [testConnection]);

  // Get connection status information
  const getConnectionStatus = useCallback(() => {
    return {
      isConnected,
      isConnecting,
      error: connectionError,
      config: llmConfig,
      lastTestTime,
      canTest: !isConnecting && (!lastTestTime || Date.now() - lastTestTime > 10000) // Can test every 10 seconds
    };
  }, [isConnected, isConnecting, connectionError, llmConfig, lastTestTime]);

  return {
    // Status
    isConnected,
    isConnecting,
    connectionError,
    llmConfig,
    lastTestTime,
    
    // Actions
    testConnection,
    reconnect,
    getCurrentConfig,
    getConnectionStatus
  };
};