/**
 * LLM Configuration with Embedded Credentials
 * For development and demo purposes
 */

export const LLM_CONFIG = {
  // OpenRouter (recommended - no CORS issues)
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    modelName: 'anthropic/claude-3.5-sonnet',
    apiKey: 'sk-or-v1-your-actual-openrouter-key-here', // Replace with real key
    name: 'Claude via OpenRouter',
    corsSupport: true
  },

  // OpenAI (works directly from browser)
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4',
    apiKey: 'sk-your-actual-openai-key-here', // Replace with real key
    name: 'OpenAI GPT-4',
    corsSupport: true
  },

  // Your local LLM server
  local: {
    baseUrl: 'http://your-llm-server.com/v1',
    modelName: 'gpt-oss-120b',
    apiKey: 'your-api-token-here', // Replace with real token
    name: 'Local LLM Server',
    corsSupport: false // Depends on your server config
  },

  // Add your specific configuration here
  custom: {
    baseUrl: 'http://apurl.com/v1', // Replace with your actual URL
    modelName: 'gpt-oss-120b',
    apiKey: 'your-actual-token-here', // Replace with your actual token
    name: 'Your LLM Server',
    corsSupport: false // Set to true if you configure CORS
  }
};

// Default configuration to use
export const DEFAULT_LLM_CONFIG = LLM_CONFIG.custom; // Using your server as default

// Auto-configure based on environment or preference
export const getAutoLLMConfig = () => {
  // You can add logic here to choose config based on environment
  // For now, return the default
  return DEFAULT_LLM_CONFIG;
};

export default LLM_CONFIG;