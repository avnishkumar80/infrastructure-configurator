import { MODULE_TYPES } from '../utils/constants.js';

/**
 * Get default configuration for a product
 * @param {Object} product - The product object
 * @returns {Object} Default configuration object
 */
export const getDefaultConfig = (product) => {
  const config = {};
  
  if (product && product.modules) {
    Object.entries(product.modules).forEach(([moduleId, module]) => {
      if (module.type === MODULE_TYPES.SINGLE_SELECT && module.defaultSelection) {
        config[moduleId] = module.defaultSelection;
      } else if (module.type === MODULE_TYPES.MULTI_SELECT_QUANTITY && module.defaultSelections) {
        config[moduleId] = [...module.defaultSelections];
      }
    });
  }
  
  return config;
};

/**
 * Create a new product selection
 * @param {Object} product - The product to add
 * @param {number} quantity - Initial quantity
 * @returns {Object} New selection object
 */
export const createProductSelection = (product, quantity = 1) => {
  return {
    productId: product.id,
    product,
    config: getDefaultConfig(product),
    quantity,
    configured: true
  };
};

/**
 * Update configuration for a category
 * @param {Object} currentConfig - Current configuration object
 * @param {string} category - Category to update
 * @param {Array} selections - New selections array
 * @returns {Object} Updated configuration object
 */
export const updateCategoryConfiguration = (currentConfig, category, selections) => {
  return {
    ...currentConfig,
    [category]: {
      selections,
      configured: selections.length > 0 && selections.every(s => s.configured)
    }
  };
};

/**
 * Add product to configuration
 * @param {Object} currentConfig - Current configuration object
 * @param {string} category - Category to add to
 * @param {Object} product - Product to add
 * @returns {Object} Updated configuration object
 */
export const addProductToConfiguration = (currentConfig, category, product) => {
  const currentSelections = currentConfig[category]?.selections || [];
  const newSelection = createProductSelection(product);
  const newSelections = [...currentSelections, newSelection];
  
  return updateCategoryConfiguration(currentConfig, category, newSelections);
};

/**
 * Remove product from configuration
 * @param {Object} currentConfig - Current configuration object
 * @param {string} category - Category to remove from
 * @param {number} index - Index of selection to remove
 * @returns {Object} Updated configuration object
 */
export const removeProductFromConfiguration = (currentConfig, category, index) => {
  const currentSelections = currentConfig[category]?.selections || [];
  const newSelections = currentSelections.filter((_, i) => i !== index);
  
  return updateCategoryConfiguration(currentConfig, category, newSelections);
};

/**
 * Update a specific product selection
 * @param {Object} currentConfig - Current configuration object
 * @param {string} category - Category of the selection
 * @param {number} index - Index of the selection
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated configuration object
 */
export const updateProductSelection = (currentConfig, category, index, updates) => {
  const currentSelections = currentConfig[category]?.selections || [];
  const updatedSelections = [...currentSelections];
  
  if (updatedSelections[index]) {
    updatedSelections[index] = { ...updatedSelections[index], ...updates };
  }
  
  return updateCategoryConfiguration(currentConfig, category, updatedSelections);
};

/**
 * Reset configuration to empty state
 * @param {Array} steps - Steps definition array
 * @returns {Object} Empty configuration object
 */
export const createEmptyConfiguration = (steps) => {
  const config = {};
  
  if (steps && Array.isArray(steps)) {
    steps.forEach(step => {
      config[step.id] = { selections: [], configured: false };
    });
  }
  
  return config;
};

/**
 * Apply AI suggestion to configuration
 * @param {Object} currentConfig - Current configuration object
 * @param {Object} suggestion - AI suggestion object
 * @returns {Object} Updated configuration object
 */
export const applyAISuggestion = (currentConfig, suggestion) => {
  const { category, productId, config } = suggestion;
  
  // Find the product in the available products (this would need to be passed in or accessed differently)
  // For now, we'll create a mock product object
  const mockProduct = {
    id: productId,
    name: 'AI Suggested Configuration',
    description: 'Configuration suggested by AI assistant',
    basePrice: 0,
    modules: {}
  };
  
  const newSelection = {
    productId: mockProduct.id,
    product: mockProduct,
    config: config,
    quantity: 1,
    configured: true
  };
  
  const currentSelections = currentConfig[category]?.selections || [];
  const newSelections = [...currentSelections, newSelection];
  
  return updateCategoryConfiguration(currentConfig, category, newSelections);
};

/**
 * Merge uploaded configuration with current state
 * @param {Object} uploadedConfig - Configuration from uploaded file
 * @param {Object} currentConfig - Current configuration state
 * @returns {Object} Result with merged config and restore info
 */
export const mergeUploadedConfiguration = (uploadedConfig, currentConfig) => {
  let newConfigData = uploadedConfig;
  let newConfiguration = currentConfig;
  
  // If the uploaded config has saved selections, restore them
  if (uploadedConfig.currentConfiguration) {
    newConfiguration = uploadedConfig.currentConfiguration;
  } else {
    // Reset to empty configuration with new structure
    newConfiguration = createEmptyConfiguration(uploadedConfig.steps);
  }
  
  return {
    configData: newConfigData,
    configuration: newConfiguration,
    hasRestoredSelections: !!uploadedConfig.currentConfiguration
  };
};

/**
 * Get configuration summary
 * @param {Object} configuration - Configuration object
 * @param {Array} steps - Steps definition array
 * @returns {Object} Configuration summary
 */
export const getConfigurationSummary = (configuration, steps) => {
  const summary = {
    totalSteps: steps?.length || 0,
    completedSteps: 0,
    requiredSteps: 0,
    completedRequiredSteps: 0,
    totalSelections: 0,
    categorySummary: {}
  };
  
  if (!steps || !configuration) return summary;
  
  steps.forEach(step => {
    const config = configuration[step.id];
    const isCompleted = config && config.selections && config.selections.length > 0;
    const selectionCount = config?.selections?.length || 0;
    
    if (step.required) {
      summary.requiredSteps++;
      if (isCompleted) {
        summary.completedRequiredSteps++;
      }
    }
    
    if (isCompleted) {
      summary.completedSteps++;
    }
    
    summary.totalSelections += selectionCount;
    
    summary.categorySummary[step.id] = {
      label: step.label,
      required: step.required,
      completed: isCompleted,
      selectionCount: selectionCount
    };
  });
  
  return summary;
};
