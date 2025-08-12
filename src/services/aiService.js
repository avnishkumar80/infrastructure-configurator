import { mockAIResponses, defaultWelcomeMessage, quickActionTemplates } from '../utils/mockData.js';
import { AI_RESPONSE_DELAY } from '../utils/constants.js';

/**
 * Generate AI response based on user message
 * @param {string} userMessage - The user's message
 * @param {string} currentStep - Current configuration step
 * @param {Object} configData - Configuration data
 * @returns {Object} AI response object
 */
export const getAIResponse = (userMessage, currentStep, configData) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for keyword matches in mock responses
  for (const [keyword, data] of Object.entries(mockAIResponses)) {
    if (lowerMessage.includes(keyword)) {
      return data;
    }
  }
  
  // Handle current step inquiries
  if (lowerMessage.includes('current') || lowerMessage.includes('this step')) {
    const step = configData.steps?.find(s => s.id === currentStep);
    return {
      response: `🎯 You're currently configuring **${step?.label || currentStep}**.\n\nThis step ${step?.required ? 'is required' : 'is optional'} for your infrastructure setup. What specific help do you need with this configuration?`
    };
  }
  
  // Default response for unmatched queries
  return {
    response: "🤔 I understand you're asking about your infrastructure setup. Could you provide more details about your specific needs? For example:\n\n• What type of application will this support?\n• What's your expected user load?\n• Do you have budget constraints?\n• Any specific performance requirements?"
  };
};

/**
 * Create a chat message object
 * @param {string} content - Message content
 * @param {string} type - Message type ('user' or 'assistant')
 * @param {Object} options - Additional options (suggestion, errors, etc.)
 * @returns {Object} Chat message object
 */
export const createChatMessage = (content, type = 'assistant', options = {}) => {
  return {
    id: Date.now() + Math.random(), // Ensure uniqueness
    type,
    content,
    timestamp: new Date(),
    ...options
  };
};

/**
 * Simulate AI typing delay
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const simulateTypingDelay = (delay = AI_RESPONSE_DELAY) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Process user message and generate AI response
 * @param {string} userMessage - User's input message
 * @param {string} currentStep - Current configuration step
 * @param {Object} configData - Configuration data
 * @returns {Promise<Object>} AI response message object
 */
export const processUserMessage = async (userMessage, currentStep, configData) => {
  await simulateTypingDelay();
  
  const aiResponse = getAIResponse(userMessage, currentStep, configData);
  
  return createChatMessage(aiResponse.response, 'assistant', {
    suggestion: aiResponse.suggestion,
    errors: aiResponse.errors
  });
};

/**
 * Get initial welcome message
 * @returns {Object} Welcome message object
 */
export const getWelcomeMessage = () => {
  return { ...defaultWelcomeMessage, id: Date.now() };
};

/**
 * Get quick action templates
 * @returns {Array} Array of quick action objects
 */
export const getQuickActions = () => {
  return quickActionTemplates;
};

/**
 * Generate configuration suggestion message
 * @param {Object} suggestion - Configuration suggestion
 * @returns {Object} Suggestion message object
 */
export const createSuggestionMessage = (suggestion) => {
  const { category, productId, config } = suggestion;
  
  return createChatMessage(
    `✅ **Configuration Applied!** \n\nI've updated your ${category} setup with the recommended configuration. You can see the changes in the main area and continue customizing from there.`,
    'assistant'
  );
};

/**
 * Generate error fix message
 * @param {Array} errors - Array of error objects
 * @returns {Object} Fix message object
 */
export const createFixMessage = (errors) => {
  return createChatMessage(
    `🔧 **Taking you to fix the issues!**\n\nI've navigated you to the first configuration section that needs attention. Let's get these resolved one by one.`,
    'assistant'
  );
};

/**
 * Analyze configuration and suggest auto-message
 * @param {Object} configuration - Current configuration
 * @param {Array} validationMessages - Current validation messages
 * @returns {Object|null} Auto-suggestion message or null
 */
export const generateAutoSuggestion = (configuration, validationMessages) => {
  const errors = validationMessages?.filter(m => m.type === 'error') || [];
  
  if (errors.length > 0) {
    return createChatMessage(
      `🚨 **I noticed some configuration issues!**\n\nYou have ${errors.length} required section${errors.length !== 1 ? 's' : ''} that need${errors.length === 1 ? 's' : ''} attention:\n\n${errors.map(e => `• ${e.title}`).join('\n')}\n\nWould you like me to guide you through fixing these?`,
      'assistant',
      { 
        isAutoSuggestion: true,
        errors: errors
      }
    );
  }
  
  return null;
};

/**
 * Generate contextual help based on current step
 * @param {string} currentStep - Current configuration step
 * @param {Object} configData - Configuration data
 * @returns {Object} Help message object
 */
export const getContextualHelp = (currentStep, configData) => {
  const step = configData.steps?.find(s => s.id === currentStep);
  const availableProducts = configData.products?.[currentStep] || [];
  
  let helpContent = `💡 **Help for ${step?.label || currentStep}**\n\n`;
  
  if (step?.required) {
    helpContent += `⚠️ This is a **required** step for your configuration.\n\n`;
  }
  
  if (availableProducts.length > 0) {
    helpContent += `Available options:\n`;
    availableProducts.slice(0, 3).forEach(product => {
      helpContent += `• **${product.name}** - ${product.description}\n`;
    });
    
    if (availableProducts.length > 3) {
      helpContent += `• ...and ${availableProducts.length - 3} more options\n`;
    }
  } else {
    helpContent += `No products are currently available for this section.\n`;
  }
  
  helpContent += `\nWhat would you like to know about this configuration step?`;
  
  return createChatMessage(helpContent, 'assistant');
};
