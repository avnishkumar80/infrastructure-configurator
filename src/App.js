import React from 'react';
import { ConfigurationProvider } from './store/ConfigurationContext.js';
import { UIProvider } from './store/UIContext.js';
import ConfiguratorLayout from './components/Layout/ConfiguratorLayout.js';

/**
 * Enhanced App Component with MCP Integration
 * Now uses the modular architecture with MCP support
 */
function App() {
  return (
    <div className="App">
      <ConfigurationProvider>
        <UIProvider>
          <ConfiguratorLayout />
        </UIProvider>
      </ConfigurationProvider>
    </div>
  );
}

export default App;
