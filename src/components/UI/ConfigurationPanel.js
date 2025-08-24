import React, { useRef } from 'react';
import { 
  X, 
  Check, 
  Upload, 
  Download, 
  Bot, 
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useFileHandling } from '../../hooks/useFileHandling.js';
import { useMCPIntegration } from '../../hooks/useMCPIntegration.js';
import { useLLMConnection } from '../../hooks/useLLMConnection.js';
import LLMConnectionBadge from './LLMConnectionBadge.js';

/**
 * ConfigurationPanel Component
 * Settings panel for import/export and configuration management
 */
const ConfigurationPanel = ({ 
  isVisible, 
  onClose,
  isChatVisible,
  onToggleChat,
  configError,
  uploadSuccess,
  isConfigLoading
}) => {
  const fileInputRef = useRef(null);
  const { 
    handleDownload, 
    handleFileInputChange, 
    handleResetToDefault 
  } = useFileHandling();

  // Get MCP and LLM connection status
  const { isConnected: mcpConnected, availableTools, connectionError: mcpError } = useMCPIntegration();
  const { isConnected: llmConnected, isConnecting: llmConnecting, connectionError: llmError, llmConfig } = useLLMConnection();

  if (!isVisible) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Configuration Management</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close panel"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {configError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <div className="flex items-center space-x-2">
              <X className="w-4 h-4" />
              <span>{configError}</span>
            </div>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Operation completed successfully!</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Connection Status Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Connection Status
            </label>
            
            <div className="space-y-2">
              {/* MCP Connection Status */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                mcpConnected 
                  ? 'bg-green-50 border-green-200' 
                  : mcpError 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Wifi className={`w-4 h-4 ${
                    mcpConnected ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">MCP Tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  {mcpConnected ? (
                    <>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                        {availableTools.length} tools
                      </span>
                      <Check className="w-4 h-4 text-green-600" />
                    </>
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* LLM Connection Status */}
              <LLMConnectionBadge 
                isConnected={llmConnected}
                isConnecting={llmConnecting}
                error={llmError}
                config={llmConfig}
                size="md"
                className="w-full justify-between px-3 py-2 rounded-lg border"
              />
            </div>
          </div>
          {/* Import/Export Section */}
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Import/Export
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".json"
              className="hidden"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleUploadClick}
                disabled={isConfigLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{isConfigLoading ? 'Loading...' : 'Import'}</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Chat & Display Section */}
          <div className="border-t border-gray-200 pt-3">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
              Chat & Display
            </label>
            
            <button
              onClick={() => {
                onToggleChat();
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                isChatVisible 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>AI Chat Assistant</span>
              </div>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                isChatVisible ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {isChatVisible && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          </div>

          {/* Reset Options Section */}
          <div className="border-t border-gray-200 pt-3">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
              Reset Options
            </label>
            
            <button
              onClick={() => {
                handleResetToDefault();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 border border-red-300 text-sm rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset to Default</span>
            </button>
          </div>

          {/* Info Section */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Export includes:</span>
              <span>Structure + Selections</span>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <span>2.0 (Enhanced)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
