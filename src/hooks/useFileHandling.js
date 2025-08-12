import { useCallback } from 'react';
import { useConfiguration } from '../store/ConfigurationContext.js';
import { useUI } from '../store/UIContext.js';
import { 
  downloadConfiguration, 
  processUploadedFile, 
  triggerFileUpload,
  validateFile 
} from '../utils/fileHandlers.js';

/**
 * Custom hook for file handling operations (import/export)
 */
export const useFileHandling = () => {
  const { configData, configuration, uploadConfig, resetToDefault } = useConfiguration();
  const { 
    setConfigLoading, 
    setConfigError, 
    showTemporarySuccess, 
    showTemporaryError,
    setConfigPanel 
  } = useUI();

  // Download configuration
  const handleDownload = useCallback(async () => {
    try {
      const success = await downloadConfiguration(configData, configuration);
      if (success) {
        showTemporarySuccess();
      } else {
        showTemporaryError('Failed to download configuration file');
      }
    } catch (error) {
      showTemporaryError('Failed to download configuration: ' + error.message);
    }
  }, [configData, configuration, showTemporarySuccess, showTemporaryError]);

  // Upload configuration
  const handleUpload = useCallback(() => {
    setConfigLoading(true);
    setConfigError(null);

    triggerFileUpload(async (result) => {
      try {
        if (result.success) {
          // Validate file before processing
          uploadConfig(result.data);
          
          if (result.hasCurrentConfiguration) {
            showTemporarySuccess();
          } else {
            showTemporarySuccess();
          }
        } else {
          showTemporaryError(result.error);
        }
      } catch (error) {
        showTemporaryError('Failed to process uploaded file: ' + error.message);
      } finally {
        setConfigLoading(false);
      }
    });
  }, [uploadConfig, setConfigLoading, setConfigError, showTemporarySuccess, showTemporaryError]);

  // Handle file input change (alternative to trigger)
  const handleFileInputChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setConfigLoading(true);
    setConfigError(null);

    try {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.valid) {
        showTemporaryError(validation.error);
        return;
      }

      // Process the file
      const result = await processUploadedFile(file);
      
      if (result.success) {
        uploadConfig(result.data);
        showTemporarySuccess();
      } else {
        showTemporaryError(result.error);
      }
    } catch (error) {
      showTemporaryError('Failed to process file: ' + error.message);
    } finally {
      setConfigLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [uploadConfig, setConfigLoading, setConfigError, showTemporarySuccess, showTemporaryError]);

  // Reset to default configuration
  const handleResetToDefault = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to reset to default configuration? This will lose all current selections and data.'
    );
    
    if (confirmed) {
      resetToDefault();
      setConfigPanel(false);
      showTemporarySuccess();
    }
  }, [resetToDefault, setConfigPanel, showTemporarySuccess]);

  // Export configuration as JSON string
  const getConfigurationJSON = useCallback(() => {
    try {
      const fullConfig = {
        ...configData,
        currentConfiguration: configuration,
        timestamp: new Date().toISOString(),
        version: "2.0"
      };
      return JSON.stringify(fullConfig, null, 2);
    } catch (error) {
      throw new Error('Failed to serialize configuration: ' + error.message);
    }
  }, [configData, configuration]);

  // Copy configuration to clipboard
  const copyConfigurationToClipboard = useCallback(async () => {
    try {
      const configJSON = getConfigurationJSON();
      await navigator.clipboard.writeText(configJSON);
      showTemporarySuccess();
    } catch (error) {
      showTemporaryError('Failed to copy to clipboard: ' + error.message);
    }
  }, [getConfigurationJSON, showTemporarySuccess, showTemporaryError]);

  // Import configuration from clipboard
  const importFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const result = await processUploadedFile(new Blob([text], { type: 'application/json' }));
      
      if (result.success) {
        uploadConfig(result.data);
        showTemporarySuccess();
      } else {
        showTemporaryError(result.error);
      }
    } catch (error) {
      showTemporaryError('Failed to import from clipboard: ' + error.message);
    }
  }, [uploadConfig, showTemporarySuccess, showTemporaryError]);

  // Validate current configuration before export
  const validateBeforeExport = useCallback(() => {
    try {
      getConfigurationJSON();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }, [getConfigurationJSON]);

  return {
    // Core actions
    handleDownload,
    handleUpload,
    handleFileInputChange,
    handleResetToDefault,
    
    // Advanced actions
    getConfigurationJSON,
    copyConfigurationToClipboard,
    importFromClipboard,
    validateBeforeExport,
    
    // Utilities
    triggerFileUpload: () => triggerFileUpload(async (result) => {
      if (result.success) {
        uploadConfig(result.data);
        showTemporarySuccess();
      } else {
        showTemporaryError(result.error);
      }
    })
  };
};
