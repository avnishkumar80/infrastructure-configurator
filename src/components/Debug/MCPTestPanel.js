import React, { useState } from 'react';
import { useMCPIntegration } from '../../hooks/useMCPIntegration.js';
import { Wifi, WifiOff, Play, AlertCircle, CheckCircle, X, Trash2, Settings } from 'lucide-react';

/**
 * MCP Test Panel for Development
 * Only visible in development mode
 */
const MCPTestPanel = ({ isVisible, onClose }) => {
  const [testMessage, setTestMessage] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  
  const { 
    isConnected, 
    isConnecting,
    availableTools, 
    callTool, 
    connectionError,
    getConnectionStatus 
  } = useMCPIntegration();

  const testMessages = [
    "Help me validate my current configuration",
    "I'm getting configuration errors, can you help?",
    "Optimize my setup for better performance",
    "Generate Terraform configuration for my infrastructure",
    "Check the status of my current setup"
  ];

  const runTest = async (message) => {
    setIsRunningTest(true);
    const startTime = Date.now();
    
    try {
      const result = await callTool('analyze_chat_message', {
        message,
        context: { 
          currentStep: 'node', 
          hasErrors: false,
          configuration: {}
        }
      });
      
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [...prev, {
        id: Date.now(),
        message,
        success: result.success,
        result: result.result,
        duration,
        timestamp: new Date()
      }]);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [...prev, {
        id: Date.now(),
        message,
        success: false,
        error: error.message,
        duration,
        timestamp: new Date()
      }]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const runCustomTest = async () => {
    if (!testMessage.trim()) return;
    await runTest(testMessage);
    setTestMessage('');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const status = getConnectionStatus();

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-sm">MCP Test Panel</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Status */}
      <div className="p-3 bg-gray-50 border-b text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Available tools:</span>
          <span className="text-gray-900">{availableTools.length}</span>
        </div>
        {connectionError && (
          <div className="text-red-600 text-xs mt-1">
            Error: {connectionError}
          </div>
        )}
      </div>
      
      {/* Test Controls */}
      <div className="p-3 border-b space-y-2">
        <div className="text-xs font-medium text-gray-700">Quick Tests:</div>
        <div className="space-y-1">
          {testMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => runTest(message)}
              disabled={!isConnected || isRunningTest}
              className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 disabled:opacity-50 rounded border text-gray-700 disabled:cursor-not-allowed"
            >
              {message}
            </button>
          ))}
        </div>
        
        {/* Custom Test */}
        <div className="flex space-x-2 mt-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Custom test message..."
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && runCustomTest()}
          />
          <button
            onClick={runCustomTest}
            disabled={!isConnected || isRunningTest || !testMessage.trim()}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Play className="w-3 h-3" />
          </button>
        </div>
        
        {/* Clear Results */}
        {testResults.length > 0 && (
          <button
            onClick={clearResults}
            className="w-full px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 flex items-center justify-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Results</span>
          </button>
        )}
      </div>
      
      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3">
        {testResults.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            No test results yet. Run a test to see results here.
          </div>
        ) : (
          <div className="space-y-2">
            {testResults.slice(-5).map((result) => (
              <div key={result.id} className={`p-2 rounded text-xs border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-1">
                    {result.success ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <span className="text-gray-500">{result.duration}ms</span>
                </div>
                
                <div className="text-gray-700 mb-1 font-medium">
                  "{result.message}"
                </div>
                
                {result.success ? (
                  <div className="text-green-700">
                    {result.result?.summary || 'Tool executed successfully'}
                  </div>
                ) : (
                  <div className="text-red-700">
                    Error: {result.error}
                  </div>
                )}
                
                <div className="text-gray-500 text-xs mt-1">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Status Indicator */}
      {isRunningTest && (
        <div className="p-2 bg-blue-50 border-t border-blue-200 text-center">
          <div className="text-xs text-blue-700">Running test...</div>
        </div>
      )}
    </div>
  );
};

export default MCPTestPanel;
