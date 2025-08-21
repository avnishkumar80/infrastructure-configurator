/**
 * LLM Service for intelligent query processing
 * Integrates with OpenAI-compatible API to analyze queries and generate responses
 */

class LLMService {
  constructor() {
    this.baseUrl = 'http://apurl.com/v1';
    this.modelName = 'gpt-oss-120b';
    this.apiKey = 'your-token-here'; // We'll configure this
    this.useCorsProxy = false; // Set to true if CORS is blocking
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
    const requestBody = {
      model: this.modelName,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: false
    };

    console.log('🤖 Calling LLM with:', { 
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
      // More detailed error handling for CORS issues
      if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
        throw new Error(`CORS Error: Your LLM server needs to allow requests from ${window.location.origin}. Add CORS headers to your server.`);
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network Error: Cannot reach ${this.baseUrl}. Check if the server is running and URL is correct.`);
      }
      throw error;
    }
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
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  }

  setModelName(modelName) {
    this.modelName = modelName;
  }

  getConfig() {
    return {
      baseUrl: this.baseUrl,
      modelName: this.modelName,
      hasApiKey: !!this.apiKey
    };
  }

  async testConnection() {
    try {
      const response = await this.callLLM([
        { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
      ], { max_tokens: 50 });
      
      return {
        success: true,
        response: response,
        config: this.getConfig()
      };
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