import { CONFIG_VERSION, DEFAULT_FILENAME_PREFIX } from './constants.js';
import { validateConfigStructure } from './configValidator.js';
import { calculateTotalPrice } from './priceCalculator.js';

/**
 * Download configuration as JSON file
 * @param {Object} configData - The configuration data
 * @param {Object} configuration - The current selections
 * @returns {Promise<boolean>} Success status
 */
export const downloadConfiguration = async (configData, configuration) => {
  try {
    // Create a complete configuration object with both structure and current selections
    const fullConfig = {
      ...configData,
      currentConfiguration: configuration,
      timestamp: new Date().toISOString(),
      version: CONFIG_VERSION,
      totalPrice: calculateTotalPrice(configuration),
      // Add metadata for compatibility
      metadata: {
        configuratorVersion: CONFIG_VERSION,
        exportDate: new Date().toISOString(),
        completedSteps: Object.entries(configuration).filter(([_, config]) => 
          config.selections && config.selections.length > 0
        ).map(([category, _]) => category),
        requiredStepsCompleted: configData.steps
          ?.filter(step => step.required)
          .every(step => configuration[step.id]?.selections?.length > 0) || false
      }
    };
    
    const dataStr = JSON.stringify(fullConfig, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `${DEFAULT_FILENAME_PREFIX}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = exportFileDefaultName;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to download configuration:', error);
    return false;
  }
};

/**
 * Process uploaded configuration file
 * @param {File} file - The uploaded file
 * @returns {Promise<Object>} Result object with success status and data/error
 */
export const processUploadedFile = async (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, error: 'No file provided' });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const uploadedConfig = JSON.parse(e.target.result);
        
        if (validateConfigStructure(uploadedConfig)) {
          resolve({
            success: true,
            data: uploadedConfig,
            hasCurrentConfiguration: !!uploadedConfig.currentConfiguration
          });
        } else {
          resolve({
            success: false,
            error: 'Invalid configuration file structure. Please upload a valid JSON configuration file.'
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: 'Failed to parse JSON file: ' + error.message
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read the file. Please try again.'
      });
    };

    reader.readAsText(file);
  });
};

/**
 * Create a file input element and handle file selection
 * @param {Function} onFileSelected - Callback when file is selected
 * @returns {HTMLInputElement} The file input element
 */
export const createFileInput = (onFileSelected) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  
  input.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && onFileSelected) {
      const result = await processUploadedFile(file);
      onFileSelected(result);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  });
  
  return input;
};

/**
 * Trigger file upload dialog
 * @param {Function} onFileSelected - Callback when file is selected
 */
export const triggerFileUpload = (onFileSelected) => {
  const input = createFileInput(onFileSelected);
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

/**
 * Validate file type and size
 * @param {File} file - The file to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
export const validateFile = (file, allowedTypes = ['application/json'], maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json')) {
    return { valid: false, error: 'Invalid file type. Please upload a JSON file.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.` };
  }
  
  return { valid: true };
};

/**
 * Generate filename with timestamp
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} Generated filename
 */
export const generateFilename = (prefix = DEFAULT_FILENAME_PREFIX, extension = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.${extension}`;
};
