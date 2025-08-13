import React, { useState } from 'react';
import { ConfigurationProvider } from './store/ConfigurationContext.js';
import { UIProvider } from './store/UIContext.js';
import ConfiguratorLayout from './components/Layout/ConfiguratorLayout.js';
import ConnectionTest from './components/ConnectionTest.js';

/**
 * Enhanced App Component with Connection Test
 * Toggle between the main configurator and connection test
 */
function App() {
  const [showConnectionTest, setShowConnectionTest] = useState(true); // Start with connection test

  return (
    <div className="App">
      <ConfigurationProvider>
        <UIProvider>
          {/* Toggle Button */}
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowConnectionTest(!showConnectionTest)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
            >
              {showConnectionTest ? 'Show Main App' : 'Show Connection Test'}
            </button>
          </div>

          {/* Content */}
          {showConnectionTest ? (
            <div className="min-h-screen bg-gray-100 p-6">
              <ConnectionTest />
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
