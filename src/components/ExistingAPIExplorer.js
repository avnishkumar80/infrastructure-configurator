import React, { useState, useEffect } from 'react';
import { useMCPIntegration } from '../hooks/useMCPIntegration';

/**
 * Existing API Explorer Component
 * Test and explore your existing C# API endpoints
 */
export const ExistingAPIExplorer = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    availableTools,
    callTool,
    reconnect
  } = useMCPIntegration();

  const [selectedTool, setSelectedTool] = useState(null);
  const [parameters, setParameters] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTestingTool, setIsTestingTool] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customMethod, setCustomMethod] = useState('GET');

  // Update parameters when tool changes
  useEffect(() => {
    if (selectedTool) {
      const tool = availableTools.find(t => t.name === selectedTool);
      if (tool && tool.inputSchema && tool.inputSchema.properties) {
        const newParams = {};
        Object.keys(tool.inputSchema.properties).forEach(key => {
          newParams[key] = '';
        });
        setParameters(newParams);
      } else {
        setParameters({});
      }
    }
  }, [selectedTool, availableTools]);

  const handleTestTool = async () => {
    if (!selectedTool) return;

    setIsTestingTool(true);
    setTestResult(null);

    try {
      const result = await callTool(selectedTool, parameters);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    }

    setIsTestingTool(false);
  };

  const handleTestCustomEndpoint = async () => {
    setIsTestingTool(true);
    setTestResult(null);

    try {
      const url = `http://localhost:5000${customEndpoint}`;
      const options = {
        method: customMethod,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      };

      if (customMethod === 'POST' || customMethod === 'PUT') {
        options.body = JSON.stringify(parameters);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      setTestResult({
        success: response.ok,
        result: {
          content: [
            {
              type: 'text',
              text: `📡 **Custom API Call Results**\n\nStatus: ${response.status} ${response.statusText}\n\n${JSON.stringify(data, null, 2)}`
            }
          ]
        },
        rawResponse: data
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    }

    setIsTestingTool(false);
  };

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const selectedToolInfo = selectedTool ? availableTools.find(t => t.name === selectedTool) : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Existing API Explorer</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            isConnecting ? 'bg-yellow-500' : 
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {isConnecting ? 'Discovering APIs...' : 
             isConnected ? `Connected - Found ${availableTools.length} endpoints` : 'Not Connected'}
          </span>
          {connectionError && (
            <span className="text-red-600 text-sm">({connectionError})</span>
          )}
        </div>
        
        {!isConnected && (
          <button
            onClick={reconnect}
            disabled={isConnecting}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isConnecting ? 'Connecting...' : 'Try Connect'}
          </button>
        )}
      </div>

      {/* Available Tools */}
      {availableTools.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🛠️ Discovered API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTools.map((tool, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedTool === tool.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTool(tool.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{tool.name}</div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    tool.method === 'GET' ? 'bg-green-100 text-green-800' :
                    tool.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tool.method}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{tool.description}</div>
                {tool.path && (
                  <div className="text-xs text-gray-500 mt-1 font-mono">{tool.path}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Parameters */}
      {selectedToolInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">⚙️ Parameters for {selectedToolInfo.name}</h3>
          {selectedToolInfo.parameters && selectedToolInfo.parameters.length > 0 ? (
            <div className="space-y-3">
              {selectedToolInfo.parameters.map((param, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <label className="text-sm font-medium">
                    {param.name} 
                    {param.required && <span className="text-red-500">*</span>}
                    <span className="text-gray-500 ml-2">({param.type})</span>
                  </label>
                  <input
                    type="text"
                    value={parameters[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    placeholder={param.description || `Enter ${param.name}...`}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  {param.description && (
                    <span className="text-xs text-gray-500">{param.description}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No parameters required</div>
          )}
          
          <button
            onClick={handleTestTool}
            disabled={!isConnected || isTestingTool}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {isTestingTool ? 'Testing...' : `Test ${selectedToolInfo.name}`}
          </button>
        </div>
      )}

      {/* Custom Endpoint Testing */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🧪 Test Custom Endpoint</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select
            value={customMethod}
            onChange={(e) => setCustomMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <input
            type="text"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            placeholder="/api/your-endpoint"
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          
          <button
            onClick={handleTestCustomEndpoint}
            disabled={!customEndpoint || isTestingTool}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            {isTestingTool ? 'Testing...' : 'Test'}
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>URL:</strong> http://localhost:5000{customEndpoint || '/api/your-endpoint'}
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">📊 Test Results</h3>
          <div className={`p-4 rounded-lg border ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            {testResult.success ? (
              <div>
                <div className="font-medium text-green-800 mb-2">✅ API call successful!</div>
                <div className="text-sm">
                  <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 border">
                    {testResult.result?.content?.[0]?.text || JSON.stringify(testResult.result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium text-red-800 mb-2">❌ API call failed</div>
                <div className="text-sm text-red-700">
                  Error: {testResult.error}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 How It Works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>The adapter automatically discovers your API endpoints by checking Swagger/OpenAPI specs</li>
          <li>If no spec is found, it probes common endpoint patterns</li>
          <li>Each discovered endpoint becomes a "tool" that the AI assistant can use</li>
          <li>Click on any discovered endpoint to see its parameters and test it</li>
          <li>Use the custom endpoint tester to try endpoints not auto-discovered</li>
          <li>Once working, the AI assistant can intelligently use these endpoints</li>
        </ol>
        
        <div className="mt-3 text-xs text-gray-600">
          <strong>Note:</strong> Make sure your C# server has CORS enabled for http://localhost:3000
        </div>
      </div>
    </div>
  );
};

export default ExistingAPIExplorer;