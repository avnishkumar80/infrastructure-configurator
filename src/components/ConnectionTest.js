import React, { useState } from 'react';
import { getMCPServerUrl } from '../config/serverConfig';

/**
 * Connection Test Component
 * Test connectivity to your C# MCP server
 */
export const ConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [serverUrl, setServerUrl] = useState(getMCPServerUrl());

  const addTestResult = (test, success, details) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResults([]);

    // Test 1: Basic connectivity
    try {
      addTestResult('Basic Connectivity', null, 'Testing connection...');
      const response = await fetch(serverUrl, { method: 'GET' });
      addTestResult('Basic Connectivity', true, `Server responded with status ${response.status}`);
    } catch (error) {
      addTestResult('Basic Connectivity', false, `Connection failed: ${error.message}`);
    }

    // Test 2: Health endpoint
    try {
      addTestResult('Health Check', null, 'Testing /health endpoint...');
      const response = await fetch(`${serverUrl}/health`);
      if (response.ok) {
        const data = await response.text();
        addTestResult('Health Check', true, `Health endpoint OK: ${data}`);
      } else {
        addTestResult('Health Check', false, `Health endpoint returned ${response.status}`);
      }
    } catch (error) {
      addTestResult('Health Check', false, `Health check failed: ${error.message}`);
    }

    // Test 3: MCP endpoint variations
    const mcpEndpoints = ['/mcp', '/api/mcp', '/mcp/v1', '/jsonrpc'];
    
    for (const endpoint of mcpEndpoints) {
      try {
        addTestResult(`MCP Endpoint ${endpoint}`, null, `Testing ${endpoint} endpoint...`);
        const mcpRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            clientInfo: { name: "connection-test", version: "1.0.0" }
          }
        };

        const response = await fetch(`${serverUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mcpRequest)
        });

        if (response.ok) {
          const data = await response.json();
          addTestResult(`MCP Endpoint ${endpoint}`, true, `MCP initialization successful: ${JSON.stringify(data, null, 2)}`);
          break; // Stop testing other endpoints if one works
        } else {
          const errorText = await response.text();
          addTestResult(`MCP Endpoint ${endpoint}`, false, `Error ${response.status}: ${errorText}`);
        }
      } catch (error) {
        addTestResult(`MCP Endpoint ${endpoint}`, false, `Failed: ${error.message}`);
      }
    }

    // Test 4: CORS check
    try {
      addTestResult('CORS Check', null, 'Testing CORS headers...');
      const response = await fetch(`${serverUrl}/mcp`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (corsHeaders['Access-Control-Allow-Origin']) {
        addTestResult('CORS Check', true, `CORS configured: ${JSON.stringify(corsHeaders, null, 2)}`);
      } else {
        addTestResult('CORS Check', false, 'CORS headers not found - you may need to configure CORS');
      }
    } catch (error) {
      addTestResult('CORS Check', false, `CORS check failed: ${error.message}`);
    }

    setIsTestingConnection(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 C# MCP Server Connection Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Server URL:</label>
        <input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="http://your-server-ip:5000"
        />
        <div className="text-xs text-gray-500 mt-1">
          Update this to point to your C# MCP server machine
        </div>
      </div>

      <button
        onClick={testConnection}
        disabled={isTestingConnection}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 mb-4"
      >
        {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                result.success === true ? 'bg-green-50 border-green-200' :
                result.success === false ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{result.test}</span>
                <span className="text-xs text-gray-500">{result.timestamp}</span>
              </div>
              <div className="text-sm">
                {result.success === true && '✅ '}
                {result.success === false && '❌ '}
                {result.success === null && '⏳ '}
                <pre className="whitespace-pre-wrap text-xs mt-1">{result.details}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔧 Common Issues & Solutions:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Connection failed:</strong> Check if C# server is running and accessible</li>
          <li><strong>CORS errors:</strong> Add CORS configuration to your C# server</li>
          <li><strong>404 on /mcp:</strong> Ensure .WithHttpTransport() is configured</li>
          <li><strong>Different machine:</strong> Update server URL to use IP address instead of localhost</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;