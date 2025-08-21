import { mockAIResponses } from '../utils/mockData.js';
import mcpClientService from './mcpClientServiceHTTP.js';
import llmService from './llmService.js';

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
      console.log('🤖 Processing with MCP - Available tools:', mcpClientService.getAvailableTools().map(t => t.name));
      
      // Check if LLM is configured and available
      const llmConfig = llmService.getConfig();
      const useLLM = llmConfig.hasApiKey && llmConfig.baseUrl;
      
      if (useLLM) {
        console.log('🧠 Using LLM for intelligent processing');
        return await this.processWithLLM(userMessage, currentContext);
      }
      
      console.log('📝 Using pattern-based processing (LLM not configured)');
      
      // First, check if user is asking for tool list
      if (userMessage.toLowerCase().includes('list') && (userMessage.toLowerCase().includes('tool') || userMessage.toLowerCase().includes('command'))) {
        return this.generateToolListResponse();
      }
      
      // Try to use analyze_chat_message if available
      if (mcpClientService.isToolAvailable('analyze_chat_message')) {
        const analysisResult = await mcpClientService.callTool('analyze_chat_message', {
          message: userMessage,
          context: currentContext
        });

        if (analysisResult.success && analysisResult.result) {
          return this.generateMCPResponse(analysisResult.result, userMessage);
        } else {
          console.warn('MCP analysis failed:', analysisResult.error);
        }
      }
      
      // Check if user wants to use a specific tool
      const toolRequest = this.detectToolRequest(userMessage);
      if (toolRequest.toolName && mcpClientService.isToolAvailable(toolRequest.toolName)) {
        return this.generateToolExecutionResponse(toolRequest.toolName, toolRequest.parameters, userMessage);
      }
      
      // If no specific tool or analysis failed, provide tool-aware response
      return this.generateToolAwareResponse(userMessage, currentContext);
      
    } catch (error) {
      console.error('Error processing with MCP:', error);
      return this.processFallback(userMessage, currentContext);
    }
  }

  async processWithLLM(userMessage, currentContext) {
    try {
      const availableTools = mcpClientService.getAvailableTools();
      
      // Step 1: LLM analyzes the query
      console.log('🧠 Step 1: LLM analyzing user query...');
      const analysis = await llmService.analyzeUserQuery(userMessage, availableTools, currentContext);
      console.log('🔍 LLM Analysis:', analysis);
      
      // Step 2: Execute suggested tools if any
      let toolResults = [];
      if (analysis.suggestedTools && analysis.suggestedTools.length > 0) {
        console.log('🛠️ Step 2: Executing suggested tools...');
        
        for (const toolSuggestion of analysis.suggestedTools.slice(0, 2)) { // Limit to 2 tools max
          if (mcpClientService.isToolAvailable(toolSuggestion.tool_name)) {
            try {
              const result = await mcpClientService.callTool(
                toolSuggestion.tool_name, 
                toolSuggestion.parameters || {}
              );
              toolResults.push({
                toolName: toolSuggestion.tool_name,
                success: result.success,
                result: result.result,
                error: result.error
              });
              console.log(`✅ Tool ${toolSuggestion.tool_name} executed:`, result.success);
            } catch (error) {
              console.error(`❌ Tool ${toolSuggestion.tool_name} failed:`, error);
              toolResults.push({
                toolName: toolSuggestion.tool_name,
                success: false,
                error: error.message
              });
            }
          }
        }
      }
      
      // Step 3: LLM generates final response
      console.log('🧠 Step 3: LLM generating final response...');
      const finalResponse = await llmService.generateResponse(userMessage, toolResults, availableTools);
      
      return {
        response: {
          type: 'llm_powered',
          content: finalResponse
        },
        analysis: {
          llmAnalysis: analysis,
          toolsExecuted: toolResults.length,
          toolResults: toolResults
        },
        suggestedActions: this.generateLLMSuggestedActions(analysis, toolResults)
      };
      
    } catch (error) {
      console.error('LLM processing failed:', error);
      // Fallback to pattern-based processing
      return this.generateToolAwareResponse(userMessage, currentContext);
    }
  }

  generateToolListResponse() {
    const tools = mcpClientService.getAvailableTools();
    
    let response = `🛠️ **Available MCP Tools** (${tools.length} tools connected)\n\n`;
    
    tools.forEach((tool, index) => {
      response += `**${index + 1}. ${tool.name}**\n`;
      if (tool.description) {
        response += `   ${tool.description}\n`;
      } else {
        response += `   *No description available*\n`;
      }
      response += `\n`;
    });
    
    response += `💡 **Try asking me to use one of these tools!**\n`;
    response += `For example: "Use the validate tool" or "Help me with configuration analysis"`;
    
    return {
      response: {
        type: 'tool_list',
        content: response
      },
      analysis: {
        toolListRequest: true,
        availableTools: tools.length
      },
      suggestedActions: tools.slice(0, 3).map(tool => ({
        type: 'tool_execution',
        label: `Use ${tool.name}`,
        toolName: tool.name,
        description: tool.description || 'Execute this tool'
      }))
    };
  }

  generateToolAwareResponse(userMessage, currentContext) {
    const tools = mcpClientService.getAvailableTools();
    
    return {
      response: {
        type: 'mcp_available',
        content: `🤖 **I'm connected to your MCP server!**\n\nI have access to ${tools.length} tools and can help you with real tasks.\n\n**Available capabilities:**\n${tools.map(t => `• ${t.name}`).join('\n')}\n\nWhat would you like me to help you with? I can use these tools to provide actual assistance instead of just giving generic advice.`
      },
      analysis: {
        mcpConnected: true,
        availableTools: tools.length,
        userMessage: userMessage
      },
      suggestedActions: [
        {
          type: 'tool_list_request',
          label: 'Show all tools',
          description: 'List all available MCP tools'
        }
      ]
    };
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

  detectToolRequest(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const availableTools = mcpClientService.getAvailableTools();
    
    // Direct tool name mentions
    for (const tool of availableTools) {
      const toolName = tool.name.toLowerCase();
      if (lowerMessage.includes(toolName) || 
          lowerMessage.includes(`use ${toolName}`) ||
          lowerMessage.includes(`run ${toolName}`) ||
          lowerMessage.includes(`execute ${toolName}`)) {
        return {
          toolName: tool.name,
          parameters: this.extractParametersFromMessage(userMessage, tool),
          confidence: 0.9
        };
      }
    }
    
    // Intent-based tool detection
    const intentMap = {
      'validate': ['validate', 'check', 'verify', 'test'],
      'analyze': ['analyze', 'analysis', 'examine', 'review'],
      'recommend': ['recommend', 'suggest', 'advice', 'best'],
      'fix': ['fix', 'repair', 'solve', 'resolve'],
      'generate': ['generate', 'create', 'build', 'make'],
      'optimize': ['optimize', 'improve', 'enhance', 'better']
    };
    
    for (const [intentKey, keywords] of Object.entries(intentMap)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        const matchingTool = availableTools.find(tool => 
          tool.name.toLowerCase().includes(intentKey) ||
          (tool.description && tool.description.toLowerCase().includes(intentKey))
        );
        
        if (matchingTool) {
          return {
            toolName: matchingTool.name,
            parameters: this.extractParametersFromMessage(userMessage, matchingTool),
            confidence: 0.7
          };
        }
      }
    }
    
    return { toolName: null, parameters: {}, confidence: 0 };
  }

  extractParametersFromMessage(userMessage, tool) {
    // Basic parameter extraction - can be enhanced based on tool schemas
    const params = {
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    
    // Add more sophisticated parameter extraction here based on tool.inputSchema
    return params;
  }

  generateToolExecutionResponse(toolName, parameters, originalMessage) {
    const tool = mcpClientService.getAvailableTools().find(t => t.name === toolName);
    
    return {
      response: {
        type: 'tool_execution_request',
        content: `🛠️ **Ready to execute: ${toolName}**\n\n${tool.description || 'No description available'}\n\nI'll run this tool with the following parameters:\n\`\`\`json\n${JSON.stringify(parameters, null, 2)}\n\`\`\`\n\nShould I proceed?`,
        needsConfirmation: true,
        suggestedTool: {
          tool_name: toolName,
          suggested_parameters: parameters,
          tool_info: tool
        }
      },
      analysis: {
        detectedTool: toolName,
        parameters: parameters,
        originalMessage: originalMessage
      },
      suggestedActions: [
        {
          type: 'tool_execution',
          label: `Execute ${toolName}`,
          toolName: toolName,
          parameters: parameters,
          description: `Run the ${toolName} tool`
        }
      ]
    };
  }

  generateLLMSuggestedActions(analysis, toolResults) {
    const actions = [];
    
    // Add follow-up tool suggestions
    if (analysis.suggestedTools) {
      const unexecutedTools = analysis.suggestedTools.filter(tool => 
        !toolResults.some(result => result.toolName === tool.tool_name)
      );
      
      unexecutedTools.slice(0, 2).forEach(tool => {
        actions.push({
          type: 'tool_execution',
          label: `Use ${tool.tool_name}`,
          toolName: tool.tool_name,
          parameters: tool.parameters || {},
          description: tool.reasoning || 'Execute this tool'
        });
      });
    }
    
    // Add clarification actions if needed
    if (analysis.requiresClarification) {
      actions.push({
        type: 'clarification',
        label: 'Ask for clarification',
        description: 'Get more specific information'
      });
    }
    
    return actions;
  }
}

export default new EnhancedAiService();
