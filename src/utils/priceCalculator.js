import { MODULE_TYPES } from './constants.js';

/**
 * Calculate the total price for a product configuration
 * @param {Object} product - The product object
 * @param {Object} config - The configuration object
 * @param {number} quantity - The quantity of the product
 * @returns {number} The total price
 */
export const calculatePrice = (product, config, quantity = 1) => {
  if (!product) return 0;
  
  let total = product.basePrice || 0;
  
  if (config && product.modules) {
    Object.entries(product.modules).forEach(([moduleId, module]) => {
      const moduleConfig = config[moduleId];
      
      if (module.type === MODULE_TYPES.SINGLE_SELECT && moduleConfig) {
        const selectedOption = module.options?.find(opt => opt.id === moduleConfig);
        if (selectedOption && selectedOption.price) {
          total += selectedOption.price;
        }
      } else if (module.type === MODULE_TYPES.MULTI_SELECT_QUANTITY && moduleConfig) {
        if (Array.isArray(moduleConfig)) {
          moduleConfig.forEach(selection => {
            const option = module.options?.find(opt => opt.id === selection.optionId);
            if (option && option.price && selection.quantity) {
              total += option.price * selection.quantity;
            }
          });
        }
      }
    });
  }
  
  return total * quantity;
};

/**
 * Calculate the total price for all configurations
 * @param {Object} configuration - The complete configuration object
 * @returns {number} The total price
 */
export const calculateTotalPrice = (configuration) => {
  if (!configuration || typeof configuration !== 'object') return 0;
  
  let total = 0;
  
  Object.entries(configuration).forEach(([category, config]) => {
    if (config && config.selections && Array.isArray(config.selections)) {
      total += config.selections.reduce((sum, selection) => {
        if (selection && selection.product && selection.config) {
          return sum + calculatePrice(selection.product, selection.config, selection.quantity || 1);
        }
        return sum;
      }, 0);
    }
  });
  
  return total;
};

/**
 * Calculate price breakdown for a single product selection
 * @param {Object} product - The product object
 * @param {Object} config - The configuration object
 * @param {number} quantity - The quantity
 * @returns {Object} Price breakdown object
 */
export const calculatePriceBreakdown = (product, config, quantity = 1) => {
  if (!product) {
    return {
      basePrice: 0,
      addOnPrice: 0,
      unitPrice: 0,
      totalPrice: 0,
      breakdown: []
    };
  }
  
  const breakdown = [];
  let addOnPrice = 0;
  
  if (config && product.modules) {
    Object.entries(product.modules).forEach(([moduleId, module]) => {
      const moduleConfig = config[moduleId];
      
      if (module.type === MODULE_TYPES.SINGLE_SELECT && moduleConfig) {
        const selectedOption = module.options?.find(opt => opt.id === moduleConfig);
        if (selectedOption && selectedOption.price > 0) {
          breakdown.push({
            item: selectedOption.label,
            price: selectedOption.price,
            quantity: 1,
            total: selectedOption.price
          });
          addOnPrice += selectedOption.price;
        }
      } else if (module.type === MODULE_TYPES.MULTI_SELECT_QUANTITY && moduleConfig) {
        if (Array.isArray(moduleConfig)) {
          moduleConfig.forEach(selection => {
            const option = module.options?.find(opt => opt.id === selection.optionId);
            if (option && option.price > 0 && selection.quantity > 0) {
              const itemTotal = option.price * selection.quantity;
              breakdown.push({
                item: option.label,
                price: option.price,
                quantity: selection.quantity,
                total: itemTotal
              });
              addOnPrice += itemTotal;
            }
          });
        }
      }
    });
  }
  
  const basePrice = product.basePrice || 0;
  const unitPrice = basePrice + addOnPrice;
  const totalPrice = unitPrice * quantity;
  
  return {
    basePrice,
    addOnPrice,
    unitPrice,
    totalPrice,
    breakdown
  };
};

/**
 * Format price with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency symbol (default: $)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  if (typeof price !== 'number' || isNaN(price)) return `${currency}0`;
  return `${currency}${price.toLocaleString()}`;
};
