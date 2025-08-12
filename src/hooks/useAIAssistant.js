import { useState, useCallback, useEffect } from 'react';
import { useConfiguration } from '../store/ConfigurationContext.js';
import { useUI } from '../store/UIContext.js';
import { useMCPIntegration } from './useMCPIntegration.js';
import enhancedAiService from '../services/enhancedAiService.js';

/**
 * Enhanced AI Assistant Hook with MCP Integration
 */
export const useEnhancedAIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingToolExecution, setPendingToolExecution] = useState(null);

  const { configData, configuration } = useConfiguration();
  const { currentStep } = useUI();
  const { isConnected, availableTools, callTool, connectionError } = useMCPIntegration();

  // Initialize with welcome message based on MCP status
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: isConnected 
        ? "👋 **Hi! I'm your AI Configuration Assistant**\n\n🛠️ **MCP Tools Connected** - I can now provide real assistance!\n\nI have access to your team's tools and can:\n• Validate your configurations\n• Fix configuration errors\n• Generate deployment scripts\n• Optimize your infrastructure\n• And much more!\n\nTry asking: *'Validate my current configuration'* or *'Help me optimize my setup'*"
        : "👋 **Hi! I'm your AI Configuration Assistant**\n\n⚠️ **Basic Mode** - MCP tools are currently unavailable\n\nI can still help with:\n• General configuration guidance\n• Best practices advice\n• Basic troubleshooting\n• Configuration suggestions\n\nFor enhanced capabilities, please ensure the MCP server is running.",
      timestamp: new Date(),
      mcpStatus: isConnected ? 'connected' : 'disconnected',
      connectionError: connectionError
    };

    setMessages([welcomeMessage]);
  }, [isConnected, connectionError]);

  // Enhanced message sending with MCP integration
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get current context for analysis
      const currentContext = {
        currentStep,
        configuration,
        configData,
        hasErrors: false, // You could calculate this from validation
        availableTools,
        isConnected
      };

      // Process message with enhanced AI service
      const aiResult = await enhancedAiService.processUserMessage(currentInput, currentContext);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResult.response.content,
        timestamp: new Date(),
        responseType: aiResult.response.type,
        suggestedActions: aiResult.suggestedActions || [],
        analysis: aiResult.analysis,
        needsConfirmation: aiResult.response.needsConfirmation,
        suggestedTool: aiResult.response.suggestedTool,
        mcpPowered: isConnected
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle pending tool executions
      if (aiResult.response.needsConfirmation && aiResult.response.suggestedTool) {
        setPendingToolExecution({
          tool: aiResult.response.suggestedTool,
          analysis: aiResult.analysis,
          messageId: assistantMessage.id
        });
      }

    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ **Error Processing Request**\n\nI encountered an error while processing your message: ${error.message}\n\nPlease try again or rephrase your question.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, currentStep, configuration, configData, isConnected, availableTools]);

  // Handle tool execution confirmation
  const handleConfirmToolExecution = useCallback(async (toolName, parameters = {}) => {
    if (!isConnected) {
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: "❌ **Tool Execution Unavailable**\n\nMCP server connection is required for tool execution. Please check your MCP server status.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsTyping(true);

    try {
      // Execute the tool
      const result = await callTool(toolName, parameters);
      
      const resultMessage = {
        id: Date.now(),
        type: 'assistant',
        content: result.success 
          ? `✅ **Tool Execution Complete!**\n\n**${toolName}** has been executed successfully.\n\n${enhancedAiService.formatToolResult(result.result)}`
          : `❌ **Tool Execution Failed**\n\nThere was an error executing ${toolName}:\n${result.error}`,
        timestamp: new Date(),
        toolResult: result,
        isToolExecution: true,
        mcpPowered: true
      };

      setMessages(prev => [...prev, resultMessage]);
      setPendingToolExecution(null);

    } catch (error) {
      console.error('Tool execution error:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `❌ **Execution Error**\n\nFailed to execute ${toolName}: ${error.message}\n\nPlease try again or contact support.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [isConnected, callTool]);

  // Handle suggested actions
  const handleSuggestedAction = useCallback(async (action) => {
    if (action.type === 'tool_execution') {
      await handleConfirmToolExecution(action.toolName, action.parameters);
    } else if (action.type === 'intent_action') {
      setInputMessage(`Help me with ${action.intent.replace('_', ' ')}`);
    } else if (action.type === 'apply_suggestion') {
      // Handle configuration suggestions
      if (action.suggestion) {
        const confirmMessage = {
          id: Date.now(),
          type: 'assistant',
          content: "✅ **Configuration Applied!**\n\nI've applied the suggested configuration to your setup.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMessage]);
      }
    }
  }, [handleConfirmToolExecution]);

  // Handle keyboard events
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'assistant',
      content: isConnected 
        ? "👋 Chat cleared! How can I help you with your infrastructure configuration?"
        : "👋 Chat cleared! I'm in basic mode - MCP tools are unavailable. How can I help you?",
      timestamp: new Date(),
      mcpStatus: isConnected ? 'connected' : 'disconnected'
    };
    setMessages([welcomeMessage]);
  }, [isConnected]);

  return {
    // State
    messages,
    inputMessage,
    isTyping,
    isMinimized,
    isConnected,
    availableTools,
    pendingToolExecution,
    connectionError,
    
    // Actions
    setInputMessage,
    setIsMinimized,
    handleSendMessage,
    handleConfirmToolExecution,
    handleSuggestedAction,
    handleKeyPress,
    clearChat,
    
    // MCP Status
    mcpStatus: {
      connected: isConnected,
      toolCount: availableTools.length,
      error: connectionError
    }
  };
};

// Keep the original hook for backward compatibility
export const useAIAssistant = useEnhancedAIAssistant;
