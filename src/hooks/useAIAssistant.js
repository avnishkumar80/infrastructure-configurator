import { useState, useCallback, useEffect } from 'react';
import { useConfiguration } from '../store/ConfigurationContext.js';
import { useUI } from '../store/UIContext.js';
import { useMCPIntegration } from './useMCPIntegration.js';
import { useLLMConnection } from './useLLMConnection.js';
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
  const { isConnected: llmConnected } = useLLMConnection();

  // Generate dynamic welcome message based on available MCP tools
  const generateWelcomeMessage = useCallback(async () => {
    if (!isConnected || availableTools.length === 0) {
      return {
        id: Date.now(),
        type: 'assistant',
        content: "👋 **Hi! I'm your AI Configuration Assistant**\n\n⚠️ **Basic Mode** - MCP tools are currently unavailable\n\nI can still help with:\n• General configuration guidance\n• Best practices advice\n• Basic troubleshooting\n• Configuration suggestions\n\nFor enhanced capabilities, please ensure the MCP server is running.",
        timestamp: new Date(),
        mcpStatus: 'disconnected',
        connectionError: connectionError
      };
    }

    // If both MCP and LLM are connected, use LLM to generate intelligent welcome message
    if (llmConnected) {
      try {
        console.log('🧠 Generating intelligent welcome message with LLM...');
        const welcomeContext = {
          availableTools: availableTools.map(t => ({ name: t.name, description: t.description })),
          toolCount: availableTools.length,
          currentStep,
          configuration,
          configData
        };
        
        // Use LLM service to generate a personalized welcome message
        const aiResult = await enhancedAiService.processUserMessage(
          "Generate a welcome message that shows what you can do with the available MCP tools. Be specific about capabilities and provide 2-3 example queries the user can try.",
          welcomeContext
        );
        
        return {
          id: Date.now(),
          type: 'assistant',
          content: aiResult.response.content,
          timestamp: new Date(),
          mcpStatus: 'connected',
          llmPowered: true,
          availableToolsCount: availableTools.length,
          responseType: aiResult.response.type,
          analysis: aiResult.analysis
        };
      } catch (error) {
        console.error('❌ Failed to generate LLM welcome message:', error);
        // Fallback to dynamic tool-based message
      }
    }

    // Fallback: Generate tool categories for manual welcome message
    const toolCategories = {
      math: availableTools.filter(t => t.name.includes('add') || t.description?.toLowerCase().includes('math') || t.description?.toLowerCase().includes('calculate')),
      recommendation: availableTools.filter(t => t.name.includes('recommend') || t.description?.toLowerCase().includes('recommend')),
      personal: availableTools.filter(t => t.name.includes('wife') || t.name.includes('personal') || t.description?.toLowerCase().includes('personal')),
      system: availableTools.filter(t => t.name.includes('desktop') || t.name.includes('system') || t.description?.toLowerCase().includes('desktop') || t.description?.toLowerCase().includes('system')),
      other: []
    };

    // Put uncategorized tools in "other"
    toolCategories.other = availableTools.filter(tool => 
      !toolCategories.math.includes(tool) && 
      !toolCategories.recommendation.includes(tool) && 
      !toolCategories.personal.includes(tool) && 
      !toolCategories.system.includes(tool)
    );

    let toolsDescription = "";
    let capabilities = [];

    if (toolCategories.math.length > 0) {
      capabilities.push("• **Math & Calculations** - Perform arithmetic and mathematical operations");
    }
    if (toolCategories.recommendation.length > 0) {
      capabilities.push("• **Smart Recommendations** - Get personalized suggestions and advice");
    }
    if (toolCategories.system.length > 0) {
      capabilities.push("• **System Management** - Access desktop and file system operations");
    }
    if (toolCategories.personal.length > 0) {
      capabilities.push("• **Personal Assistance** - Help with personal information and queries");
    }
    if (toolCategories.other.length > 0) {
      capabilities.push(`• **Additional Tools** - ${toolCategories.other.length} specialized tools available`);
    }

    // Generate tool summary
    toolsDescription = `🛠️ **${availableTools.length} MCP Tools Connected!**\n\nAvailable capabilities:\n${capabilities.join('\n')}`;

    // Generate suggested actions based on available tools
    let suggestions = [];
    if (toolCategories.math.length > 0) {
      suggestions.push("*'Calculate 123 + 456'*");
    }
    if (toolCategories.recommendation.length > 0) {
      suggestions.push("*'Give me a recommendation'*");
    }
    if (toolCategories.system.length > 0) {
      suggestions.push("*'Help me with file management'*");
    }

    const suggestionsText = suggestions.length > 0 ? 
      `\n\nTry asking: ${suggestions.slice(0, 2).join(' or ')}` : 
      "\n\nAsk me anything - I'll use the available tools to help!";

    return {
      id: Date.now(),
      type: 'assistant',
      content: `👋 **Welcome to your AI Configuration Assistant**\n\n${toolsDescription}${suggestionsText}`,
      timestamp: new Date(),
      mcpStatus: 'connected',
      availableToolsCount: availableTools.length,
      toolCategories: Object.keys(toolCategories).filter(cat => toolCategories[cat].length > 0)
    };
  }, [isConnected, availableTools, connectionError, currentStep, configuration, configData, llmConnected]);

  // Initialize with welcome message based on MCP status and available tools
  useEffect(() => {
    const initializeWelcomeMessage = async () => {
      try {
        console.log('🚀 Initializing welcome message...', { 
          isConnected, 
          llmConnected, 
          toolCount: availableTools.length 
        });
        const welcomeMessage = await generateWelcomeMessage();
        console.log('✅ Generated welcome message:', welcomeMessage.content.substring(0, 100) + '...');
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('❌ Failed to generate welcome message:', error);
        // Only fallback if everything else fails
        const fallbackMessage = {
          id: Date.now(),
          type: 'assistant',
          content: "👋 **Welcome!**\n\nI'm your AI Configuration Assistant. How can I help you today?",
          timestamp: new Date(),
          mcpStatus: isConnected ? 'connected' : 'disconnected',
          isError: true,
          connectionError: error.message
        };
        setMessages([fallbackMessage]);
      }
    };

    initializeWelcomeMessage();
  }, [generateWelcomeMessage, isConnected, llmConnected, availableTools.length]);

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
        isConnected,
        llmConnected
      };

      console.log('🧠 Processing message with context:', { 
        message: currentInput, 
        mcpConnected: isConnected, 
        llmConnected, 
        toolCount: availableTools.length,
        context: currentContext 
      });

      // Process message with enhanced AI service
      const aiResult = await enhancedAiService.processUserMessage(currentInput, currentContext);
      
      console.log('🤖 AI Service result:', aiResult);
      
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
        mcpPowered: isConnected,
        llmPowered: llmConnected
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
  }, [inputMessage, isTyping, currentStep, configuration, configData, isConnected, llmConnected, availableTools]);

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
  const clearChat = useCallback(async () => {
    try {
      const welcomeMessage = await generateWelcomeMessage();
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to generate welcome message on clear:', error);
      const fallbackMessage = {
        id: Date.now(),
        type: 'assistant',
        content: "👋 Chat cleared! How can I help you?",
        timestamp: new Date(),
        mcpStatus: isConnected ? 'connected' : 'disconnected'
      };
      setMessages([fallbackMessage]);
    }
  }, [generateWelcomeMessage, isConnected]);

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
