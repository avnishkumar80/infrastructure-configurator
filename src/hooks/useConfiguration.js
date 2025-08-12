import { useConfiguration } from '../store/ConfigurationContext.js';
import { calculateTotalPrice, calculatePrice, calculatePriceBreakdown } from '../utils/priceCalculator.js';
import { 
  getAllValidationMessages, 
  getMessageCounts, 
  isStepCompleted,
  areRequiredStepsCompleted,
  getNextIncompleteStep 
} from '../utils/configValidator.js';
import { getConfigurationSummary } from '../services/configurationService.js';

/**
 * Custom hook for configuration state and operations
 */
export const useConfigurationState = () => {
  const { configData, configuration, ...configActions } = useConfiguration();

  // Computed values
  const totalPrice = calculateTotalPrice(configuration);
  const validationMessages = getAllValidationMessages(configuration, configData.steps);
  const messageCounts = getMessageCounts(validationMessages);
  const configSummary = getConfigurationSummary(configuration, configData.steps);
  const allRequiredStepsCompleted = areRequiredStepsCompleted(configuration, configData.steps);
  const nextIncompleteStep = getNextIncompleteStep(configuration, configData.steps);

  // Helper functions
  const getStepStatus = (stepId) => {
    return {
      completed: isStepCompleted(stepId, configuration[stepId]),
      selectionCount: configuration[stepId]?.selections?.length || 0,
      hasErrors: validationMessages.some(msg => msg.category === stepId && msg.type === 'error')
    };
  };

  const getProductPrice = (product, config, quantity = 1) => {
    return calculatePrice(product, config, quantity);
  };

  const getProductPriceBreakdown = (product, config, quantity = 1) => {
    return calculatePriceBreakdown(product, config, quantity);
  };

  const getCategorySelections = (category) => {
    return configuration[category]?.selections || [];
  };

  const getAvailableProducts = (category) => {
    return configData.products?.[category] || [];
  };

  return {
    // State
    configData,
    configuration,
    
    // Computed values
    totalPrice,
    validationMessages,
    messageCounts,
    configSummary,
    allRequiredStepsCompleted,
    nextIncompleteStep,
    
    // Helper functions
    getStepStatus,
    getProductPrice,
    getProductPriceBreakdown,
    getCategorySelections,
    getAvailableProducts,
    
    // Actions
    ...configActions
  };
};

/**
 * Hook for managing product selections within a category
 */
export const useProductSelections = (category) => {
  const { 
    configuration, 
    configData,
    addProduct, 
    removeProduct, 
    updateSelection 
  } = useConfiguration();

  const selections = configuration[category]?.selections || [];
  const availableProducts = configData.products?.[category] || [];
  const isConfigured = configuration[category]?.configured || false;

  const addProductToCategory = (product) => {
    addProduct(category, product);
    return selections.length; // Return index of newly added product
  };

  const removeProductFromCategory = (index) => {
    removeProduct(category, index);
  };

  const updateProductConfig = (index, config) => {
    updateSelection(category, index, { config });
  };

  const updateProductQuantity = (index, quantity) => {
    updateSelection(category, index, { quantity });
  };

  const getSelectionByIndex = (index) => {
    return selections[index] || null;
  };

  const getTotalCategoryPrice = () => {
    return selections.reduce((total, selection) => {
      return total + calculatePrice(selection.product, selection.config, selection.quantity);
    }, 0);
  };

  return {
    selections,
    availableProducts,
    isConfigured,
    categoryPrice: getTotalCategoryPrice(),
    addProductToCategory,
    removeProductFromCategory,
    updateProductConfig,
    updateProductQuantity,
    getSelectionByIndex
  };
};

/**
 * Hook for configuration validation and status
 */
export const useValidation = () => {
  const { configuration, configData } = useConfiguration();
  
  const validationMessages = getAllValidationMessages(configuration, configData.steps);
  const messageCounts = getMessageCounts(validationMessages);
  
  const getStepValidation = (stepId) => {
    const stepMessages = validationMessages.filter(msg => msg.category === stepId);
    const stepCounts = getMessageCounts(stepMessages);
    
    return {
      messages: stepMessages,
      counts: stepCounts,
      hasErrors: stepCounts.errors > 0,
      hasWarnings: stepCounts.warnings > 0,
      isValid: stepCounts.errors === 0
    };
  };

  const getHighPriorityIssues = () => {
    return validationMessages.filter(msg => 
      msg.type === 'error' || (msg.type === 'warning' && msg.severity === 'high')
    );
  };

  return {
    validationMessages,
    messageCounts,
    getStepValidation,
    getHighPriorityIssues,
    hasErrors: messageCounts.errors > 0,
    hasWarnings: messageCounts.warnings > 0,
    isValid: messageCounts.errors === 0
  };
};
