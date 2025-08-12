import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getDefaultUIState } from '../services/defaultConfigService.js';

// Action types
const UI_ACTIONS = {
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_SELECTED_PRODUCT_INDEX: 'SET_SELECTED_PRODUCT_INDEX',
  SET_CURRENT_CATEGORY: 'SET_CURRENT_CATEGORY',
  TOGGLE_CHAT_VISIBILITY: 'TOGGLE_CHAT_VISIBILITY',
  SET_CHAT_VISIBILITY: 'SET_CHAT_VISIBILITY',
  TOGGLE_MESSAGE_CENTER: 'TOGGLE_MESSAGE_CENTER',
  SET_MESSAGE_CENTER: 'SET_MESSAGE_CENTER',
  TOGGLE_CONFIG_PANEL: 'TOGGLE_CONFIG_PANEL',
  SET_CONFIG_PANEL: 'SET_CONFIG_PANEL',
  SET_CONFIG_LOADING: 'SET_CONFIG_LOADING',
  SET_CONFIG_ERROR: 'SET_CONFIG_ERROR',
  SET_UPLOAD_SUCCESS: 'SET_UPLOAD_SUCCESS',
  RESET_UI_STATE: 'RESET_UI_STATE'
};

// Initial state
const initialState = getDefaultUIState();

// Reducer function
const uiReducer = (state, action) => {
  switch (action.type) {
    case UI_ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload,
        selectedProductIndex: null // Reset selected product when changing steps
      };
      
    case UI_ACTIONS.SET_SELECTED_PRODUCT_INDEX:
      return {
        ...state,
        selectedProductIndex: action.payload
      };
      
    case UI_ACTIONS.SET_CURRENT_CATEGORY:
      return {
        ...state,
        currentCategory: action.payload
      };
      
    case UI_ACTIONS.TOGGLE_CHAT_VISIBILITY:
      return {
        ...state,
        isChatVisible: !state.isChatVisible
      };
      
    case UI_ACTIONS.SET_CHAT_VISIBILITY:
      return {
        ...state,
        isChatVisible: action.payload
      };
      
    case UI_ACTIONS.TOGGLE_MESSAGE_CENTER:
      return {
        ...state,
        showMessageCenter: !state.showMessageCenter
      };
      
    case UI_ACTIONS.SET_MESSAGE_CENTER:
      return {
        ...state,
        showMessageCenter: action.payload
      };
      
    case UI_ACTIONS.TOGGLE_CONFIG_PANEL:
      return {
        ...state,
        showConfigPanel: !state.showConfigPanel
      };
      
    case UI_ACTIONS.SET_CONFIG_PANEL:
      return {
        ...state,
        showConfigPanel: action.payload
      };
      
    case UI_ACTIONS.SET_CONFIG_LOADING:
      return {
        ...state,
        isConfigLoading: action.payload
      };
      
    case UI_ACTIONS.SET_CONFIG_ERROR:
      return {
        ...state,
        configError: action.payload,
        uploadSuccess: action.payload ? false : state.uploadSuccess // Clear success when error occurs
      };
      
    case UI_ACTIONS.SET_UPLOAD_SUCCESS:
      return {
        ...state,
        uploadSuccess: action.payload,
        configError: action.payload ? null : state.configError // Clear error when success occurs
      };
      
    case UI_ACTIONS.RESET_UI_STATE:
      return getDefaultUIState();
      
    default:
      return state;
  }
};

// Create context
const UIContext = createContext();

// Provider component
export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Action creators
  const setCurrentStep = useCallback((step) => {
    dispatch({ type: UI_ACTIONS.SET_CURRENT_STEP, payload: step });
  }, []);

  const setSelectedProductIndex = useCallback((index) => {
    dispatch({ type: UI_ACTIONS.SET_SELECTED_PRODUCT_INDEX, payload: index });
  }, []);

  const setCurrentCategory = useCallback((category) => {
    dispatch({ type: UI_ACTIONS.SET_CURRENT_CATEGORY, payload: category });
  }, []);

  const toggleChatVisibility = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_CHAT_VISIBILITY });
  }, []);

  const setChatVisibility = useCallback((visible) => {
    dispatch({ type: UI_ACTIONS.SET_CHAT_VISIBILITY, payload: visible });
  }, []);

  const toggleMessageCenter = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_MESSAGE_CENTER });
  }, []);

  const setMessageCenter = useCallback((show) => {
    dispatch({ type: UI_ACTIONS.SET_MESSAGE_CENTER, payload: show });
  }, []);

  const toggleConfigPanel = useCallback(() => {
    dispatch({ type: UI_ACTIONS.TOGGLE_CONFIG_PANEL });
  }, []);

  const setConfigPanel = useCallback((show) => {
    dispatch({ type: UI_ACTIONS.SET_CONFIG_PANEL, payload: show });
  }, []);

  const setConfigLoading = useCallback((loading) => {
    dispatch({ type: UI_ACTIONS.SET_CONFIG_LOADING, payload: loading });
  }, []);

  const setConfigError = useCallback((error) => {
    dispatch({ type: UI_ACTIONS.SET_CONFIG_ERROR, payload: error });
  }, []);

  const setUploadSuccess = useCallback((success) => {
    dispatch({ type: UI_ACTIONS.SET_UPLOAD_SUCCESS, payload: success });
  }, []);

  const resetUIState = useCallback(() => {
    dispatch({ type: UI_ACTIONS.RESET_UI_STATE });
  }, []);

  // Auto-clear success and error messages after a delay
  const showTemporarySuccess = useCallback((duration = 3000) => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), duration);
  }, [setUploadSuccess]);

  const showTemporaryError = useCallback((error, duration = 5000) => {
    setConfigError(error);
    setTimeout(() => setConfigError(null), duration);
  }, [setConfigError]);

  const value = {
    // State
    currentStep: state.currentStep,
    selectedProductIndex: state.selectedProductIndex,
    currentCategory: state.currentCategory,
    isChatVisible: state.isChatVisible,
    showMessageCenter: state.showMessageCenter,
    showConfigPanel: state.showConfigPanel,
    isConfigLoading: state.isConfigLoading,
    configError: state.configError,
    uploadSuccess: state.uploadSuccess,
    
    // Actions
    setCurrentStep,
    setSelectedProductIndex,
    setCurrentCategory,
    toggleChatVisibility,
    setChatVisibility,
    toggleMessageCenter,
    setMessageCenter,
    toggleConfigPanel,
    setConfigPanel,
    setConfigLoading,
    setConfigError,
    setUploadSuccess,
    resetUIState,
    
    // Helper actions
    showTemporarySuccess,
    showTemporaryError
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Export action types for testing
export { UI_ACTIONS };
