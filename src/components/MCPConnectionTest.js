import React, { useState } from 'react';
import { useMCPIntegration } from '../hooks/useMCPIntegration';

/**
 * MCP Connection Test Component
 * Provides a simple UI to test the HTTP MCP server connection
 */
export const MCPConnectionTest = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    availableTools,
    callTool,
    refreshTools,
    reconnect,
    getConnectionStatus
  } = useMCPIntegration();

  const [testResult, setTestResult] = useState(null);
  const [isTestingTool, setIsTestingTool] = useState(false);

  const handleTestConnection = async () => {
    const status = getConnectionStatus();
    console.log('Connection Status:', status);
  };

  const handleTestTool = async () => {
    setIsTestingTool(true);
    setTestResult(null);

    try {
      // Test the analyze_chat_message tool
      const result = await callTool('analyze_chat_message', {
        message: 'I need help validating my Terraform configuration',
        context: { userType: 'developer' }
      });
      
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    }

    setIsTestingTool(false);
  };

  const handleRefreshTools = async () => {
    await refreshTools();
  };

  const handleReconnect = async () => {
    await reconnect();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔌 MCP Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            isConnecting ? 'bg-yellow-500' : 
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {isConnecting ? 'Connecting...' : 
             isConnected ? 'Connected to C# MCP Server' : 'Disconnected'}
          </span>
          {connectionError && (
            <span className="text-red-600 text-sm">({connectionError})</span>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Server: localhost:5000 (HTTP API)
        </div>
      </div>

      {/* Available Tools */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Available Tools ({availableTools.length})</h3>
        {availableTools.length > 0 ? (
          <div className="space-y-2">
            {availableTools.map((tool, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{tool.name}</div>
                <div className="text-sm text-gray-600">{tool.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            {isConnected ? 'No tools available' : 'Connect to server to see available tools'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleTestConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        
        <button
          onClick={handleRefreshTools}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Refresh Tools
        </button>
        
        <button
          onClick={handleReconnect}
          disabled={isConnecting}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300"
        >
          Reconnect
        </button>
        
        <button
          onClick={handleTestTool}
          disabled={!isConnected || isTestingTool || availableTools.length === 0}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
        >
          {isTestingTool ? 'Testing...' : 'Test Tool'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className={`p-4 rounded-lg ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <div>
                <div className="font-medium text-green-800">✅ Tool executed successfully!</div>
                <div className="mt-2 text-sm text-green-700">
                  Tool: {testResult.toolName}
                </div>
                <div className="mt-2 text-sm">
                  <strong>Result:</strong>
                  <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResult.result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium text-red-800">❌ Tool execution failed</div>
                <div className="mt-2 text-sm text-red-700">
                  Error: {testResult.error}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure your C# MCP server is running on localhost:5000</li>
          <li>Check that CORS is enabled for http://localhost:3000</li>
          <li>Verify the server implements the required API endpoints</li>
          <li>Click "Test Connection" to check connectivity</li>
          <li>Use "Test Tool" to verify tool execution</li>
        </ol>
        
        <div className="mt-3 text-xs text-gray-600">
          See C_SHARP_MCP_API_SPEC.md for complete API documentation
        </div>
      </div>
    </div>
  );
};

export default MCPConnectionTest;