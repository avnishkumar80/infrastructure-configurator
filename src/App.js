import React, { useState } from 'react';
import { ConfigurationProvider } from './store/ConfigurationContext.js';
import { UIProvider } from './store/UIContext.js';
import ConfiguratorLayout from './components/Layout/ConfiguratorLayout.js';
import ExistingAPIExplorer from './components/ExistingAPIExplorer.js';

/**
 * Enhanced App Component with API Explorer
 * Toggle between the main configurator and API explorer
 */
function App() {
  const [showAPIExplorer, setShowAPIExplorer] = useState(true); // Start with API explorer

  return (
    <div className="App">
      <ConfigurationProvider>
        <UIProvider>
          {/* Toggle Button */}
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowAPIExplorer(!showAPIExplorer)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
            >
              {showAPIExplorer ? 'Show Main App' : 'Show API Explorer'}
            </button>
          </div>

          {/* Content */}
          {showAPIExplorer ? (
            <div className="min-h-screen bg-gray-100 p-6">
              <ExistingAPIExplorer />
            </div>
          ) : (
            <ConfiguratorLayout />
          )}
        </UIProvider>
      </ConfigurationProvider>
    </div>
  );
}

export default App;
