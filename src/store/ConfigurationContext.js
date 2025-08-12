import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  getDefaultConfigData, 
  getInitialConfiguration, 
  resetToDefaultState 
} from '../services/defaultConfigService.js';
import { 
  addProductToConfiguration,
  removeProductFromConfiguration,
  updateProductSelection,
  applyAISuggestion,
  mergeUploadedConfiguration,
  createEmptyConfiguration
} from '../services/configurationService.js';

// Action types
const ACTIONS = {
  SET_CONFIG_DATA: 'SET_CONFIG_DATA',
  SET_CONFIGURATION: 'SET_CONFIGURATION',
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  UPDATE_SELECTION: 'UPDATE_SELECTION',
  APPLY_AI_SUGGESTION: 'APPLY_AI_SUGGESTION',
  UPLOAD_CONFIG: 'UPLOAD_CONFIG',
  RESET_TO_DEFAULT: 'RESET_TO_DEFAULT'
};

// Initial state
const initialState = {
  configData: getDefaultConfigData(),
  configuration: getInitialConfiguration()
};

// Reducer function
const configurationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONFIG_DATA:
      return {
        ...state,
        configData: action.payload
      };
      
    case ACTIONS.SET_CONFIGURATION:
      return {
        ...state,
        configuration: action.payload
      };
      
    case ACTIONS.ADD_PRODUCT:
      return {
        ...state,
        configuration: addProductToConfiguration(
          state.configuration,
          action.payload.category,
          action.payload.product
        )
      };
      
    case ACTIONS.REMOVE_PRODUCT:
      return {
        ...state,
        configuration: removeProductFromConfiguration(
          state.configuration,
          action.payload.category,
          action.payload.index
        )
      };
      
    case ACTIONS.UPDATE_SELECTION:
      return {
        ...state,
        configuration: updateProductSelection(
          state.configuration,
          action.payload.category,
          action.payload.index,
          action.payload.updates
        )
      };
      
    case ACTIONS.APPLY_AI_SUGGESTION:
      return {
        ...state,
        configuration: applyAISuggestion(
          state.configuration,
          action.payload.suggestion
        )
      };
      
    case ACTIONS.UPLOAD_CONFIG:
      const merged = mergeUploadedConfiguration(
        action.payload.uploadedConfig,
        state.configuration
      );
      return {
        configData: merged.configData,
        configuration: merged.configuration
      };
      
    case ACTIONS.RESET_TO_DEFAULT:
      const defaultState = resetToDefaultState(action.payload?.customConfigData);
      return {
        configData: defaultState.configData,
        configuration: defaultState.configuration
      };
      
    default:
      return state;
  }
};

// Create context
const ConfigurationContext = createContext();

// Provider component
export const ConfigurationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(configurationReducer, initialState);

  // Action creators
  const setConfigData = useCallback((configData) => {
    dispatch({ type: ACTIONS.SET_CONFIG_DATA, payload: configData });
  }, []);

  const setConfiguration = useCallback((configuration) => {
    dispatch({ type: ACTIONS.SET_CONFIGURATION, payload: configuration });
  }, []);

  const addProduct = useCallback((category, product) => {
    dispatch({ 
      type: ACTIONS.ADD_PRODUCT, 
      payload: { category, product } 
    });
  }, []);

  const removeProduct = useCallback((category, index) => {
    dispatch({ 
      type: ACTIONS.REMOVE_PRODUCT, 
      payload: { category, index } 
    });
  }, []);

  const updateSelection = useCallback((category, index, updates) => {
    dispatch({ 
      type: ACTIONS.UPDATE_SELECTION, 
      payload: { category, index, updates } 
    });
  }, []);

  const applyAISuggestionAction = useCallback((suggestion) => {
    dispatch({ 
      type: ACTIONS.APPLY_AI_SUGGESTION, 
      payload: { suggestion } 
    });
  }, []);

  const uploadConfig = useCallback((uploadedConfig) => {
    dispatch({ 
      type: ACTIONS.UPLOAD_CONFIG, 
      payload: { uploadedConfig } 
    });
  }, []);

  const resetToDefault = useCallback((customConfigData = null) => {
    dispatch({ 
      type: ACTIONS.RESET_TO_DEFAULT, 
      payload: { customConfigData } 
    });
  }, []);

  const value = {
    // State
    configData: state.configData,
    configuration: state.configuration,
    
    // Actions
    setConfigData,
    setConfiguration,
    addProduct,
    removeProduct,
    updateSelection,
    applyAISuggestion: applyAISuggestionAction,
    uploadConfig,
    resetToDefault
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

// Custom hook to use the configuration context
export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

// Export action types for testing
export { ACTIONS };
