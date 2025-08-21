import React, { useState } from 'react';
import { getMCPServerUrl } from '../config/serverConfig';
import MCPConnectionTest from './MCPConnectionTest.js';
import LLMConfig from './LLMConfig.js';

/**
 * Enhanced Connection Test Component with Tabs
 * Test connectivity to servers and configure LLM
 */
export const ConnectionTest = () => {
  const [activeTab, setActiveTab] = useState('basic'); // basic, mcp, llm
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
        addTestResult('Health Check', true, `Health endpoint responded: ${data || 'OK'}`);
      } else {
        addTestResult('Health Check', false, `Health check failed with status ${response.status}`);
      }
    } catch (error) {
      addTestResult('Health Check', false, `Health check failed: ${error.message}`);
    }

    // Test 3: MCP endpoint
    try {
      addTestResult('MCP Endpoint', null, 'Testing /mcp endpoint...');
      const response = await fetch(`${serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('MCP Endpoint', true, `MCP endpoint works! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        addTestResult('MCP Endpoint', false, `MCP endpoint failed: ${response.status} ${response.statusText}\\n${errorText}`);
      }
    } catch (error) {
      addTestResult('MCP Endpoint', false, `MCP endpoint test failed: ${error.message}`);
    }

    // Test 4: CORS check
    try {
      addTestResult('CORS Check', null, 'Testing CORS configuration...');
      const response = await fetch(`${serverUrl}/mcp`, {
        method: 'OPTIONS'
      });
      
      if (response.ok || response.status === 204) {
        addTestResult('CORS Check', true, 'CORS is properly configured');
      } else {
        addTestResult('CORS Check', false, `CORS check failed: ${response.status}`);
      }
    } catch (error) {
      addTestResult('CORS Check', false, `CORS check failed: ${error.message}`);
    }

    setIsTestingConnection(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 System Configuration & Testing</h1>
        <p className="text-gray-600">Configure and test your MCP server and LLM connections</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'basic'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🌐 Basic Connection
        </button>
        <button
          onClick={() => setActiveTab('mcp')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'mcp'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🛠️ MCP Tools
        </button>
        <button
          onClick={() => setActiveTab('llm')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'llm'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🧠 LLM Configuration
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {activeTab === 'basic' && (
          <BasicConnectionTest 
            serverUrl={serverUrl}
            setServerUrl={setServerUrl}
            testResults={testResults}
            isTestingConnection={isTestingConnection}
            testConnection={testConnection}
          />
        )}
        
        {activeTab === 'mcp' && (
          <MCPConnectionTest />
        )}
        
        {activeTab === 'llm' && (
          <LLMConfig />
        )}
      </div>
    </div>
  );
};

// Extract the original basic connection test into a separate component
const BasicConnectionTest = ({ serverUrl, setServerUrl, testResults, isTestingConnection, testConnection }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🌐 Basic Server Connection Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Server URL:</label>
        <input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          placeholder="http://your-server-ip:port"
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