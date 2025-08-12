// Main Components
export { default as InfrastructureConfigurator } from './InfrastructureConfiguratorNew.js';

// Layout Components
export { default as ConfiguratorLayout } from './components/Layout/ConfiguratorLayout.js';
export { default as ConfiguratorHeader } from './components/Layout/ConfiguratorHeader.js';
export { default as ProgressTracker } from './components/Layout/ProgressTracker.js';

// Product Components
export { default as ProductSelector } from './components/ProductSelector/ProductSelector.js';
export { default as ProductCard } from './components/ProductSelector/ProductCard.js';
export { default as ConfiguredProductCard } from './components/ProductSelector/ConfiguredProductCard.js';
export { default as ModuleConfigurator } from './components/ProductSelector/ModuleConfigurator.js';

// AI Assistant Components
export { default as AIConfigurationAssistant } from './components/AIAssistant/AIConfigurationAssistant.js';
export { default as ChatMessage } from './components/AIAssistant/ChatMessage.js';
export { default as QuickActions } from './components/AIAssistant/QuickActions.js';

// UI Components
export { default as ProgressStep } from './components/UI/ProgressStep.js';
export { default as MessageCenter } from './components/UI/MessageCenter.js';
export { default as ConfigurationPanel } from './components/UI/ConfigurationPanel.js';

// Context Providers
export { ConfigurationProvider, useConfiguration } from './store/ConfigurationContext.js';
export { UIProvider, useUI } from './store/UIContext.js';

// Custom Hooks
export { useConfigurationState, useProductSelections, useValidation } from './hooks/useConfiguration.js';
export { useAIAssistant, useAIChatState } from './hooks/useAIAssistant.js';
export { useFileHandling } from './hooks/useFileHandling.js';

// Services
export * from './services/configurationService.js';
export * from './services/aiService.js';
export * from './services/defaultConfigService.js';

// Utils
export * from './utils/priceCalculator.js';
export * from './utils/configValidator.js';
export * from './utils/fileHandlers.js';
export * from './utils/constants.js';
export * from './utils/mockData.js';
