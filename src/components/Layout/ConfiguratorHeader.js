import React from 'react';
import { 
  Settings, 
  ChevronDown, 
  MessageCircle,
  Wifi
} from 'lucide-react';
import ConfigurationPanel from '../UI/ConfigurationPanel.js';
import LLMConnectionBadge from '../UI/LLMConnectionBadge.js';
import { useConfigurationState } from '../../hooks/useConfiguration.js';
import { useValidation } from '../../hooks/useConfiguration.js';
import { useUI } from '../../store/UIContext.js';
import { useMCPIntegration } from '../../hooks/useMCPIntegration.js';
import { useLLMConnection } from '../../hooks/useLLMConnection.js';
import { formatPrice } from '../../utils/priceCalculator.js';

/**
 * ConfiguratorHeader Component
 * Header section with product info, pricing, and controls
 */
const ConfiguratorHeader = () => {
  const { configData, totalPrice } = useConfigurationState();
  const { messageCounts } = useValidation();
  const {
    showConfigPanel,
    toggleConfigPanel,
    setMessageCenter,
    isChatVisible,
    toggleChatVisibility,
    configError,
    uploadSuccess,
    isConfigLoading
  } = useUI();

  // Get connection status
  const { isConnected: mcpConnected, availableTools } = useMCPIntegration();
  const { isConnected: llmConnected, isConnecting: llmConnecting, connectionError: llmError, llmConfig } = useLLMConnection();

  const renderMessageButton = () => {
    if (messageCounts.total === 0) return null;

    return (
      <button
        onClick={() => setMessageCenter(true)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          messageCounts.errors > 0 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : messageCounts.warnings > 0
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${
          messageCounts.errors > 0 ? 'bg-red-500 animate-pulse' :
          messageCounts.warnings > 0 ? 'bg-yellow-500' : 'bg-blue-500'
        }`} />
        <span>
          {messageCounts.errors > 0 ? `${messageCounts.errors} issue${messageCounts.errors !== 1 ? 's' : ''}` : 
           messageCounts.warnings > 0 ? `${messageCounts.warnings} warning${messageCounts.warnings !== 1 ? 's' : ''}` :
           `${messageCounts.infos} info`}
        </span>
        <MessageCircle className="w-4 h-4" />
      </button>
    );
  };

  return (
    <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-full px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Product Info */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {configData.productInfo?.name || 'Product Configurator'}
            </h1>
            <p className="text-xs text-gray-600">
              {configData.productInfo?.subtitle || 'Configuration'}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Connection Status Badges */}
            <div className="flex items-center space-x-2">
              {/* MCP Status */}
              {mcpConnected && (
                <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                  <Wifi className="w-3 h-3" />
                  <span>MCP</span>
                  <span className="bg-green-100 px-1 py-0.5 rounded text-xs">
                    {availableTools.length}
                  </span>
                </div>
              )}
              
              {/* LLM Status */}
              <LLMConnectionBadge 
                isConnected={llmConnected}
                isConnecting={llmConnecting}
                error={llmError}
                config={llmConfig}
                size="xs"
              />
            </div>

            {/* Price Section */}
            <div className="flex items-center space-x-4">
              {/* Base Price */}
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Base Price</div>
                <div className="text-sm font-semibold text-blue-600">
                  {formatPrice(configData.productInfo?.salesPrice || 0)}
                </div>
              </div>
              
              {/* Total Price */}
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Price</div>
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(totalPrice)}
                </div>
              </div>
            </div>

            {/* Message Button */}
            {renderMessageButton()}
            
            {/* Configuration Panel */}
            <div className="relative">
              <button
                onClick={toggleConfigPanel}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Configuration Management"
              >
                <Settings className="w-4 h-4" />
                <span>Config</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showConfigPanel ? 'rotate-180' : ''}`} />
              </button>

              <ConfigurationPanel
                isVisible={showConfigPanel}
                onClose={() => toggleConfigPanel()}
                isChatVisible={isChatVisible}
                onToggleChat={toggleChatVisibility}
                configError={configError}
                uploadSuccess={uploadSuccess}
                isConfigLoading={isConfigLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHeader;
