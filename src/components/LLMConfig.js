import React, { useState, useEffect } from 'react';
import { Brain, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import llmService from '../../services/llmService';

/**
 * LLM Configuration Component
 * Allows users to configure and test the LLM connection
 */
export const LLMConfig = () => {
  const [config, setConfig] = useState({
    baseUrl: 'http://your-llm-server.com/v1',
    modelName: 'gpt-oss-120b',
    apiKey: 'your-api-token-here'
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('llm-config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      llmService.setBaseUrl(parsed.baseUrl);
      llmService.setModelName(parsed.modelName);
      llmService.setApiKey(parsed.apiKey);
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('llm-config', JSON.stringify(config));
    llmService.setBaseUrl(config.baseUrl);
    llmService.setModelName(config.modelName);
    llmService.setApiKey(config.apiKey);
    alert('LLM configuration saved!');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Apply current config
    llmService.setBaseUrl(config.baseUrl);
    llmService.setModelName(config.modelName);
    llmService.setApiKey(config.apiKey);

    try {
      const result = await llmService.testConnection();
      setTestResult(result);
      setIsConnected(result.success);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
      setIsConnected(false);
    }

    setIsTesting(false);
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">🧠 LLM Configuration</h2>
        {isConnected && <CheckCircle className="w-5 h-5 text-green-600" />}
      </div>

      {/* Configuration Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">API Base URL</label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
            placeholder="http://your-llm-server.com/v1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Model Name</label>
          <input
            type="text"
            value={config.modelName}
            onChange={(e) => handleConfigChange('modelName', e.target.value)}
            placeholder="gpt-oss-120b"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key/Token</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder="your-api-token-here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleSaveConfig}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Save Config</span>
        </button>

        <button
          onClick={handleTestConnection}
          disabled={isTesting || !config.apiKey}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-2"
        >
          {isTesting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
            </span>
          </div>

          {testResult.success ? (
            <div className="text-sm text-green-700">
              <div><strong>Model:</strong> {config.modelName}</div>
              <div><strong>Response:</strong> {testResult.response}</div>
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <div><strong>Error:</strong> {testResult.error}</div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">📋 Setup Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter your LLM API base URL (OpenAI-compatible format)</li>
          <li>Specify the model name you want to use</li>
          <li>Add your API key/token for authentication</li>
          <li>Save the configuration</li>
          <li>Test the connection to verify it works</li>
          <li>Once connected, the AI assistant will use LLM for intelligent responses</li>
        </ol>
        
        <div className="mt-3 text-xs text-gray-600">
          Configuration is saved locally in your browser
        </div>
      </div>
    </div>
  );
};

export default LLMConfig;