import React, { useState } from 'react';
import ConfiguratorHeader from './ConfiguratorHeader.js';
import ProgressTracker from './ProgressTracker.js';
import ProductSelector from '../ProductSelector/ProductSelector.js';
import AIConfigurationAssistant from '../AIAssistant/AIConfigurationAssistant.js';
import MessageCenter from '../UI/MessageCenter.js';
import MCPTestPanel from '../Debug/MCPTestPanel.js';
import { useUI } from '../../store/UIContext.js';
import { useValidation } from '../../hooks/useConfiguration.js';
import { Settings } from 'lucide-react';

/**
 * ConfiguratorLayout Component (Enhanced with MCP Testing)
 * Main layout wrapper for the entire configurator
 */
const ConfiguratorLayout = () => {
  const [showMCPTestPanel, setShowMCPTestPanel] = useState(false);
  
  const {
    currentStep,
    isChatVisible,
    showMessageCenter,
    setMessageCenter,
    setCurrentStep
  } = useUI();
  
  const { validationMessages } = useValidation();

  const handleNavigateToStep = (stepId) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <ConfiguratorHeader />
      
      {/* Progress Tracker */}
      <div className="bg-white border-b">
        <div className="max-w-full px-6 py-3">
          <ProgressTracker />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className={`flex-1 bg-white transition-all duration-300 ${
          isChatVisible ? 'mr-96' : 'mr-0'
        }`}>
          <div className="p-6">
            <div className="max-w-none">
              <ProductSelector category={currentStep} />
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar - positioned below header */}
        {isChatVisible && (
          <div className="fixed right-0 z-30 chat-sidebar-container">
            <AIConfigurationAssistant />
          </div>
        )}
      </div>
      
      {/* Message Center Modal */}
      <MessageCenter
        isVisible={showMessageCenter}
        onClose={() => setMessageCenter(false)}
        messages={validationMessages}
        onNavigateToStep={handleNavigateToStep}
      />
      
      {/* MCP Test Panel (Development Only) */}
      <MCPTestPanel 
        isVisible={showMCPTestPanel}
        onClose={() => setShowMCPTestPanel(false)}
      />
      
      {/* Development Tools Toggle (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setShowMCPTestPanel(!showMCPTestPanel)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
            title="Toggle MCP Test Panel"
          >
            <Settings className="w-4 h-4" />
            <span>MCP Tests</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfiguratorLayout;
