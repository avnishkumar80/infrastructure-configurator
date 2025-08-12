import React from 'react';
import { ConfigurationProvider } from './store/ConfigurationContext.js';
import { UIProvider } from './store/UIContext.js';
import ConfiguratorLayout from './components/Layout/ConfiguratorLayout.js';

/**
 * InfrastructureConfigurator Component (Refactored)
 * Main entry point - now clean and modular with proper separation of concerns
 */
const InfrastructureConfigurator = () => {
  return (
    <ConfigurationProvider>
      <UIProvider>
        <ConfiguratorLayout />
      </UIProvider>
    </ConfigurationProvider>
  );
};

export default InfrastructureConfigurator;
