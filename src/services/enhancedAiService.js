import { mockAIResponses } from '../utils/mockData.js';
import mcpClientService from './mcpClientService.js';

/**
 * Enhanced AI Service with MCP Integration (Browser Compatible)
 * Processes user messages and provides intelligent tool suggestions
 */
export class EnhancedAiService {
  constructor() {
    this.conversationHistory = [];
  }

  async processUserMessage(userMessage, currentContext) {
    // Store message in conversation history
    this.conversationHistory.push({
      timestamp: new Date(),
      message: userMessage,
      context: currentContext
    });

    // Check if MCP is available for enhanced processing
    const isConnected = mcpClientService.isConnected;
    
    if (isConnected) {
      return await this.processWithMCP(userMessage, currentContext);
    } else {
      return this.processFallback(userMessage, currentContext);
    }
  }

  async processWithMCP(userMessage, currentContext) {
    try {
      // Use MCP to analyze the message
      const analysisResult = await mcpClientService.callTool('analyze_chat_message', {
        message: userMessage,
        context: currentContext
      });

      if (analysisResult.success && analysisResult.result) {
        return this.generateMCPResponse(analysisResult.result, userMessage);
      } else {
        console.warn('MCP analysis failed, falling back to standard processing');
        return this.processFallback(userMessage, currentContext);
      }
    } catch (error) {
      console.error('Error processing with MCP:', error);
      return this.processFallback(userMessage, currentContext);
    }
  }

  generateMCPResponse(analysis, originalMessage) {
    const { confidence_score, suggested_tools, detected_intents } = analysis;

    // High confidence with available tools
    if (confidence_score > 0.7 && suggested_tools && suggested_tools.length > 0) {
      const bestTool = suggested_tools[0];
      
      // Check if tool is safe to auto-execute
      const safeTools = ['analyze_chat_message', 'validate_configuration', 'check_system_status'];
      
      if (safeTools.includes(bestTool.tool_name)) {
        return {
          response: {
            type: 'mcp_suggestion',
            content: `🛠️ **I can help you with that!**\n\nI found the perfect tool: **${bestTool.tool_name}**\n\n${bestTool.tool_info.description}\n\nConfidence: ${Math.round(confidence_score * 100)}%\n\nWould you like me to run this tool for you?`,
            needsConfirmation: true,
            suggestedTool: bestTool
          },
          analysis,
          suggestedActions: this.generateActionsFromAnalysis(analysis)
        };
      } else {
        return {
          response: {
            type: 'mcp_guidance',
            content: `🎯 **I understand what you need!**\n\nI can help you with: ${detected_intents?.map(i => i.intent.replace('_', ' ')).join(', ') || 'your request'}\n\nI found ${suggested_tools.length} relevant tool${suggested_tools.length > 1 ? 's' : ''} that can assist you. The best option is **${bestTool.tool_name}**, but it requires your approval before I can use it.\n\nWould you like me to proceed?`
          },
          analysis,
          suggestedActions: this.generateActionsFromAnalysis(analysis)
        };
      }
    }

    // Medium confidence - provide guidance
    if (confidence_score > 0.4) {
      return {
        response: {
          type: 'mcp_guidance',
          content: `🤔 **I think I can help with that.**\n\nI detected that you want to: ${detected_intents && detected_intents[0] ? detected_intents[0].intent.replace('_', ' ') : 'get assistance'}\n\nI have ${suggested_tools ? suggested_tools.length : 0} tool${suggested_tools && suggested_tools.length !== 1 ? 's' : ''} that might be relevant. Could you be more specific about what you'd like me to do?`
        },
        analysis,
        suggestedActions: this.generateActionsFromAnalysis(analysis)
      };
    }

    // Low confidence - ask for clarification
    return {
      response: {
        type: 'clarification',
        content: `🔍 **I'd like to help, but need more details.**\n\nI understood some of what you're asking for, but I want to make sure I suggest the right tools. Could you tell me more about:\n\n• What specific task you're trying to accomplish\n• What part of your infrastructure you're working with\n• Whether you're looking to create, fix, or optimize something`
      },
      analysis,
      suggestedActions: []
    };
  }

  processFallback(userMessage, currentContext) {
    // Use existing mock response logic when MCP is not available
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keyword matches in mock responses
    for (const [keyword, data] of Object.entries(mockAIResponses)) {
      if (lowerMessage.includes(keyword)) {
        return {
          response: {
            type: 'mock_response',
            content: `📋 **Standard Response Mode**\n\n${data.response}\n\n⚠️ *Note: Advanced tool integration is currently unavailable. For enhanced capabilities, please ensure the MCP server is running.*`,
            suggestion: data.suggestion
          },
          analysis: {
            originalMessage: userMessage,
            usedMockResponse: true,
            matchedKeyword: keyword
          },
          suggestedActions: data.suggestion ? [{
            type: 'apply_suggestion',
            label: 'Apply Configuration',
            suggestion: data.suggestion
          }] : []
        };
      }
    }

    // Handle current step inquiries
    if (lowerMessage.includes('current') || lowerMessage.includes('this step')) {
      const step = currentContext.configData?.steps?.find(s => s.id === currentContext.currentStep);
      return {
        response: {
          type: 'context_help',
          content: `🎯 **Current Step: ${step?.label || currentContext.currentStep}**\n\nThis step ${step?.required ? 'is required' : 'is optional'} for your infrastructure setup.\n\n⚠️ *Note: For detailed analysis and assistance, please ensure the MCP server is connected.*`
        },
        analysis: {
          originalMessage: userMessage,
          contextProvided: true,
          currentStep: currentContext.currentStep
        },
        suggestedActions: []
      };
    }
    
    // Default fallback response
    return {
      response: {
        type: 'general_help',
        content: `🤖 **I'm here to help!**\n\nI understand you're asking about your infrastructure setup. While I don't have access to advanced tools right now, I can provide general guidance.\n\nFor enhanced assistance, please ensure the MCP server is running. Otherwise, I can help with:\n\n• General configuration advice\n• Explaining infrastructure concepts\n• Guidance on best practices`
      },
      analysis: {
        originalMessage: userMessage,
        noSpecificMatch: true
      },
      suggestedActions: []
    };
  }

  generateActionsFromAnalysis(analysis) {
    const actions = [];
    
    // Add tool-based actions
    if (analysis.suggested_tools) {
      analysis.suggested_tools.slice(0, 3).forEach(toolMatch => {
        actions.push({
          type: 'tool_execution',
          label: `Use ${toolMatch.tool_name}`,
          toolName: toolMatch.tool_name,
          description: toolMatch.tool_info?.description || 'Execute this tool',
          confidence: toolMatch.relevance_score,
          parameters: toolMatch.suggested_parameters || {}
        });
      });
    }

    // Add intent-based actions
    if (analysis.detected_intents && analysis.detected_intents.length > 0) {
      const primaryIntent = analysis.detected_intents[0];
      actions.push({
        type: 'intent_action',
        label: `Help with ${primaryIntent.intent.replace('_', ' ')}`,
        intent: primaryIntent.intent,
        confidence: primaryIntent.confidence
      });
    }

    return actions;
  }

  createMessage(content, type = 'assistant', options = {}) {
    return {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      ...options
    };
  }

  async executeToolAction(toolName, parameters = {}) {
    if (!mcpClientService.isConnected) {
      return {
        success: false,
        error: 'MCP server not connected'
      };
    }

    try {
      const result = await mcpClientService.callTool(toolName, parameters);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatToolResult(result) {
    if (typeof result === 'string') {
      return result;
    } else if (typeof result === 'object' && result) {
      if (result.summary) return result.summary;
      if (result.message) return result.message;
      
      // Format object as readable text
      return Object.entries(result)
        .map(([key, value]) => `**${key}**: ${value}`)
        .join('\n');
    }
    
    return JSON.stringify(result, null, 2);
  }
}

export default new EnhancedAiService();
