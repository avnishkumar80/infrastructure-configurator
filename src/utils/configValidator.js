import { VALIDATION_STATUS, MESSAGE_TYPES, SEVERITY_LEVELS } from './constants.js';

/**
 * Validate a single configuration step
 * @param {string} category - The category/step name
 * @param {Object} config - The configuration for this category
 * @param {Object} stepDefinition - The step definition from configData
 * @returns {string} Validation status
 */
export const validateStep = (category, config, stepDefinition) => {
  if (!config || !config.selections || config.selections.length === 0) {
    return stepDefinition?.required ? VALIDATION_STATUS.INCOMPLETE : VALIDATION_STATUS.INCOMPLETE;
  }
  
  // Check if all selections are properly configured
  const hasValidSelections = config.selections.every(selection => {
    return selection && selection.configured && selection.product && selection.config;
  });
  
  return hasValidSelections ? VALIDATION_STATUS.VALID : VALIDATION_STATUS.ERROR;
};

/**
 * Check if a step is completed
 * @param {string} category - The category/step name
 * @param {Object} config - The configuration for this category
 * @returns {boolean} Whether the step is completed
 */
export const isStepCompleted = (category, config) => {
  return config && config.selections && config.selections.length > 0;
};

/**
 * Get all validation messages for the current configuration
 * @param {Object} configuration - The complete configuration object
 * @param {Array} steps - The steps definition array
 * @returns {Array} Array of validation messages
 */
export const getAllValidationMessages = (configuration, steps) => {
  const messages = [];
  
  if (!configuration || !steps) return messages;
  
  steps.forEach(step => {
    const config = configuration[step.id];
    const stepName = step.label || step.id;
    
    if (!config || !config.selections || config.selections.length === 0) {
      if (step.required) {
        messages.push({
          type: MESSAGE_TYPES.ERROR,
          category: step.id,
          title: `${stepName} required`,
          message: `This section is mandatory and needs configuration`,
          severity: SEVERITY_LEVELS.HIGH
        });
      } else {
        messages.push({
          type: MESSAGE_TYPES.INFO,
          category: step.id,
          title: `${stepName} available`,
          message: `Optional section ready for configuration`,
          severity: SEVERITY_LEVELS.LOW
        });
      }
    } else {
      // Check for configuration errors within selections
      const hasErrors = config.selections.some(selection => {
        return !selection.configured || !selection.product || !selection.config;
      });
      
      if (hasErrors) {
        messages.push({
          type: MESSAGE_TYPES.WARNING,
          category: step.id,
          title: `${stepName} needs attention`,
          message: `Some configurations in this section are incomplete`,
          severity: SEVERITY_LEVELS.MEDIUM
        });
      }
    }
  });
  
  return messages;
};

/**
 * Get message counts by type
 * @param {Array} messages - Array of validation messages
 * @returns {Object} Message counts object
 */
export const getMessageCounts = (messages) => {
  if (!Array.isArray(messages)) {
    return { errors: 0, warnings: 0, infos: 0, total: 0 };
  }
  
  return {
    errors: messages.filter(m => m.type === MESSAGE_TYPES.ERROR).length,
    warnings: messages.filter(m => m.type === MESSAGE_TYPES.WARNING).length,
    infos: messages.filter(m => m.type === MESSAGE_TYPES.INFO).length,
    total: messages.length
  };
};

/**
 * Validate the structure of uploaded configuration data
 * @param {Object} config - The configuration object to validate
 * @returns {boolean} Whether the configuration structure is valid
 */
export const validateConfigStructure = (config) => {
  if (!config || typeof config !== 'object') return false;
  
  const requiredKeys = ['productInfo', 'steps', 'products'];
  const hasRequiredKeys = requiredKeys.every(key => key in config);
  
  if (!hasRequiredKeys) return false;
  
  // Validate productInfo structure
  if (!config.productInfo || typeof config.productInfo !== 'object') return false;
  
  // Validate steps structure
  if (!Array.isArray(config.steps)) return false;
  
  // Validate products structure
  if (!config.products || typeof config.products !== 'object') return false;
  
  // Additional validation for steps array
  const validSteps = config.steps.every(step => {
    return step && typeof step === 'object' && step.id && step.label;
  });
  
  if (!validSteps) return false;
  
  return true;
};

/**
 * Check if all required steps are completed
 * @param {Object} configuration - The configuration object
 * @param {Array} steps - The steps definition array
 * @returns {boolean} Whether all required steps are completed
 */
export const areRequiredStepsCompleted = (configuration, steps) => {
  if (!configuration || !steps) return false;
  
  return steps
    .filter(step => step.required)
    .every(step => {
      const config = configuration[step.id];
      return config && config.selections && config.selections.length > 0;
    });
};

/**
 * Get the next incomplete required step
 * @param {Object} configuration - The configuration object
 * @param {Array} steps - The steps definition array
 * @returns {string|null} The ID of the next incomplete required step, or null if all are complete
 */
export const getNextIncompleteStep = (configuration, steps) => {
  if (!configuration || !steps) return null;
  
  const incompleteStep = steps.find(step => {
    if (!step.required) return false;
    
    const config = configuration[step.id];
    return !config || !config.selections || config.selections.length === 0;
  });
  
  return incompleteStep ? incompleteStep.id : null;
};
