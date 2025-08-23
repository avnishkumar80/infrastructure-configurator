/**
 * LLM Service for intelligent query processing
 * Integrates with OpenAI-compatible API to analyze queries and generate responses
 */

import { LLM_CONFIG, getAutoLLMConfig } from '../config/llmConfig.js';

class LLMService {
  constructor() {
    // Use embedded configuration by default
    const autoConfig = getAutoLLMConfig();
    this.baseUrl = autoConfig.baseUrl;
    this.modelName = autoConfig.modelName;
    this.apiKey = autoConfig.apiKey;
    this.isEmbeddedConfig = true;
    this.useCorsProxy = false; // Set to true if CORS is blocking
    
    console.log('🤖 LLM Service initialized with embedded config:', autoConfig.name);
  }

  async analyzeUserQuery(userMessage, availableTools, currentContext = {}) {
    const systemPrompt = this.buildSystemPrompt(availableTools);
    const userPrompt = this.buildAnalysisPrompt(userMessage, currentContext);

    try {
      const response = await this.callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.3,
        max_tokens: 1000
      });

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('LLM analysis failed:', error);
      throw error;
    }
  }

  async generateResponse(userMessage, toolResults, availableTools) {
    const systemPrompt = this.buildResponseSystemPrompt(availableTools);
    const userPrompt = this.buildResponsePrompt(userMessage, toolResults);

    try {
      const response = await this.callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        temperature: 0.7,
        max_tokens: 1500
      });

      return response;
    } catch (error) {
      console.error('LLM response generation failed:', error);
      throw error;
    }
  }

  buildSystemPrompt(availableTools) {
    return `You are an intelligent infrastructure configuration assistant with access to MCP tools.

AVAILABLE TOOLS:
${availableTools.map(tool => `- ${tool.name}: ${tool.description || 'No description'}`).join('\n')}

YOUR TASK:
1. Analyze user queries about infrastructure configuration
2. Determine which tools (if any) would be helpful
3. Suggest tool parameters based on the user's request

RESPONSE FORMAT:
Always respond with a JSON object:
{
  "intent": "user's primary intent (validate|analyze|recommend|fix|generate|optimize|list_tools|general_help)",
  "confidence": 0.0-1.0,
  "suggested_tools": [
    {
      "tool_name": "exact_tool_name",
      "reasoning": "why this tool is relevant",
      "parameters": {"key": "value"},
      "priority": 1-5
    }
  ],
  "requires_clarification": false,
  "clarification_questions": [],
  "response_type": "tool_suggestion|direct_answer|clarification_needed"
}

Be concise but thorough in your analysis.`;
  }

  buildAnalysisPrompt(userMessage, currentContext) {
    return `USER MESSAGE: "${userMessage}"

CURRENT CONTEXT:
- Current step: ${currentContext.currentStep || 'unknown'}
- Configuration status: ${currentContext.hasErrors ? 'has errors' : 'no known errors'}
- User type: ${currentContext.userType || 'unknown'}

Analyze this message and determine the best course of action. What is the user trying to accomplish and which tools would help?`;
  }

  buildResponseSystemPrompt(availableTools) {
    return `You are a helpful infrastructure configuration assistant. Generate clear, actionable responses based on tool results.

AVAILABLE TOOLS: ${availableTools.map(t => t.name).join(', ')}

GUIDELINES:
- Be helpful and specific
- Reference tool results when available
- Provide actionable next steps
- Use a friendly, professional tone
- Format responses with markdown for readability
- Include emojis sparingly for emphasis`;
  }

  buildResponsePrompt(userMessage, toolResults) {
    const toolResultsText = toolResults && toolResults.length > 0
      ? `TOOL EXECUTION RESULTS:\n${toolResults.map(result => 
          `Tool: ${result.toolName}\nSuccess: ${result.success}\nResult: ${JSON.stringify(result.result, null, 2)}`
        ).join('\n\n')}`
      : 'No tools were executed.';

    return `USER REQUEST: "${userMessage}"

${toolResultsText}

Generate a helpful response to the user based on their request and any tool results. Be specific and actionable.`;
  }

  async callLLM(messages, options = {}) {
    // Detect if using Claude API (either direct or via proxy)
    const isClaudeAPI = this.baseUrl.includes('anthropic.com') || this.baseUrl.includes('/api/claude');
    
    if (isClaudeAPI) {
      return await this.callClaudeAPI(messages, options);
    } else {
      return await this.callOpenAICompatibleAPI(messages, options);
    }
  }

  async callClaudeAPI(messages, options = {}) {
    // Check if we're using the local proxy
    const isProxy = this.baseUrl.includes('localhost:3001') || this.baseUrl.includes('/api/claude');
    
    if (isProxy) {
      // Use local proxy server
      const proxyUrl = this.baseUrl.includes('/messages') ? this.baseUrl : `${this.baseUrl}/messages`;
      
      console.log('🤖 Calling Claude API via local proxy:', { 
        url: proxyUrl,
        model: this.modelName,
        messageCount: messages.length,
        apiKeyPreview: this.apiKey ? this.apiKey.substring(0, 12) + '...' + this.apiKey.substring(this.apiKey.length - 4) : 'NO API KEY'
      });

      try {
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.modelName,
            max_tokens: options.max_tokens || 1000,
            messages: messages,
            temperature: options.temperature || 0.7,
            apiKey: this.apiKey
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown proxy error' }));
          throw new Error(`Claude Proxy error: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.content[0].text;
      } catch (error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(`Proxy Error: Cannot reach proxy server at localhost:3001. Make sure the proxy server is running with: npm start`);
        }
        throw error;
      }
    } else {
      // Direct API call to Anthropic (will likely fail due to CORS)
      console.log('🤖 Calling Claude API directly:', { 
        url: `${this.baseUrl}/v1/messages`,
        model: this.modelName,
        messageCount: messages.length 
      });

      try {
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.modelName,
            max_tokens: options.max_tokens || 1000,
            messages: messages,
            temperature: options.temperature || 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.content[0].text;
      } catch (error) {
        if (error.message.includes('CORS')) {
          throw new Error(`CORS Error: Claude API cannot be called directly from browser. Use the local proxy server instead.`);
        }
        throw error;
      }
    }
  }

  async callOpenAICompatibleAPI(messages, options = {}) {
    const requestBody = {
      model: this.modelName,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: false
    };

    console.log('🤖 Calling OpenAI-compatible API with:', { 
      url: `${this.baseUrl}/chat/completions`,
      model: this.modelName,
      messageCount: messages.length 
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      this.handleAPIError(error);
    }
  }

  handleAPIError(error) {
    // Enhanced error handling for different APIs
    if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
      throw new Error(`CORS Error: API server needs to allow requests from ${window.location.origin}. This shouldn't happen with official APIs like Claude/OpenAI.`);
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Network Error: Cannot reach ${this.baseUrl}. Check if the URL is correct and you have internet access.`);
    } else if (error.message.includes('401') || error.message.includes('403')) {
      throw new Error(`Authentication Error: Invalid API key. Please check your token.`);
    } else if (error.message.includes('429')) {
      throw new Error(`Rate Limit Error: You've exceeded the API rate limit. Wait a moment and try again.`);
    }
    throw error;
  }

  parseAnalysisResponse(response) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return {
        intent: parsed.intent || 'general_help',
        confidence: parsed.confidence || 0.5,
        suggestedTools: parsed.suggested_tools || [],
        requiresClarification: parsed.requires_clarification || false,
        clarificationQuestions: parsed.clarification_questions || [],
        responseType: parsed.response_type || 'direct_answer',
        rawResponse: response
      };
    } catch (error) {
      console.warn('Failed to parse LLM analysis response as JSON:', error);
      // Fallback to basic parsing
      return {
        intent: 'general_help',
        confidence: 0.3,
        suggestedTools: [],
        requiresClarification: false,
        clarificationQuestions: [],
        responseType: 'direct_answer',
        rawResponse: response
      };
    }
  }

  // Configuration methods
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isEmbeddedConfig = false;
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    this.isEmbeddedConfig = false;
  }

  setModelName(modelName) {
    this.modelName = modelName;
    this.isEmbeddedConfig = false;
  }

  // Use embedded configuration presets
  useEmbeddedConfig(configName) {
    const config = LLM_CONFIG[configName];
    if (config) {
      this.baseUrl = config.baseUrl;
      this.modelName = config.modelName;
      this.apiKey = config.apiKey;
      this.isEmbeddedConfig = true;
      console.log(`🔄 Switched to embedded config: ${config.name}`);
      console.log(`🔍 API Key set to: ${this.apiKey ? this.apiKey.substring(0, 12) + '...' + this.apiKey.substring(this.apiKey.length - 4) : 'NO KEY'}`);
      return true;
    }
    return false;
  }

  // Get available embedded configurations
  getAvailableConfigs() {
    return Object.keys(LLM_CONFIG).map(key => ({
      key,
      name: LLM_CONFIG[key].name,
      corsSupport: LLM_CONFIG[key].corsSupport
    }));
  }

  getConfig() {
    return {
      baseUrl: this.baseUrl,
      modelName: this.modelName,
      hasApiKey: !!this.apiKey,
      isEmbeddedConfig: this.isEmbeddedConfig,
      availableConfigs: this.getAvailableConfigs()
    };
  }

  async testConnection() {
    try {
      // Detect API type
      const isClaudeAPI = this.baseUrl.includes('anthropic.com') || this.baseUrl.includes('/api/claude');
      
      if (isClaudeAPI) {
        // Test Claude API
        const response = await this.callClaudeAPI([
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
        ], { max_tokens: 50 });
        
        return {
          success: true,
          response: response,
          config: this.getConfig()
        };
      } else {
        // Test OpenAI-compatible API
        const response = await this.callOpenAICompatibleAPI([
          { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
        ], { max_tokens: 50 });
        
        return {
          success: true,
          response: response,
          config: this.getConfig()
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        config: this.getConfig()
      };
    }
  }
}

export default new LLMService();