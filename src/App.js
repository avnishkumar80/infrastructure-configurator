import React, { useState } from 'react';
import { ConfigurationProvider } from './store/ConfigurationContext.js';
import { UIProvider } from './store/UIContext.js';
import ConfiguratorLayout from './components/Layout/ConfiguratorLayout.js';
import ConnectionTest from './components/ConnectionTest.js';
import { Settings, Home } from 'lucide-react';

/**
 * Enhanced App Component with Compact Connection Test Toggle
 * Toggle between the main configurator and connection test
 */
function App() {
  const [showConnectionTest, setShowConnectionTest] = useState(true); // Start with connection test

  return (
    <div className="App">
      <ConfigurationProvider>
        <UIProvider>
          {/* Compact Toggle Button - smaller and non-overlapping */}
          <div className="fixed top-2 right-2 z-50">
            <button
              onClick={() => setShowConnectionTest(!showConnectionTest)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center group"
              title={showConnectionTest ? 'Show Main App' : 'Show Connection Test'}
            >
              {showConnectionTest ? (
                <Home className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
            </button>
            
            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {showConnectionTest ? 'Show Main App' : 'Connection Test'}
              </div>
            </div>
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
