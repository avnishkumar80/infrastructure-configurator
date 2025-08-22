import React, { useState, useEffect } from 'react';
import { Brain, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import llmService from '../services/llmService';

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

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleUseEmbeddedConfig = (configKey) => {
    const success = llmService.useEmbeddedConfig(configKey);
    if (success) {
      const newConfig = llmService.getConfig();
      setConfig({
        baseUrl: newConfig.baseUrl,
        modelName: newConfig.modelName,
        apiKey: '*** USING EMBEDDED KEY ***'
      });
      alert(`Switched to embedded configuration: ${configKey}`);
    }
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
        {/* Embedded Configurations */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium mb-2 text-green-800">🔐 Use Embedded Configuration (No Setup Required)</h4>
          <p className="text-xs text-green-700 mb-3">
            Click a button to use pre-configured API keys embedded in the app code. Perfect for demos and development.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleUseEmbeddedConfig('openrouter')}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center space-x-1"
            >
              <span>🌐</span>
              <span>Use OpenRouter (Recommended)</span>
            </button>
            <button
              onClick={() => handleUseEmbeddedConfig('openai')}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
            >
              <span>🧠</span>
              <span>Use OpenAI</span>
            </button>
            <button
              onClick={() => handleUseEmbeddedConfig('custom')}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center space-x-1"
            >
              <span>🏠</span>
              <span>Use Your Server</span>
            </button>
          </div>
        </div>

        {/* Manual Configuration */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">⚙️ Manual Configuration (Optional)</h4>
          <p className="text-xs text-gray-600 mb-3">
            Or configure manually with your own API keys:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setConfig({
                baseUrl: 'https://openrouter.ai/api/v1',
                modelName: 'anthropic/claude-3.5-sonnet',
                apiKey: config.apiKey || 'sk-or-v1-your-openrouter-key'
              })}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
            >
              🌐 Claude via OpenRouter
            </button>
            <button
              onClick={() => setConfig({
                baseUrl: 'https://api.anthropic.com',
                modelName: 'claude-3-5-sonnet-20241022',
                apiKey: config.apiKey || 'sk-ant-api03-your-key-here'
              })}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
            >
              🤖 Claude Direct (needs proxy)
            </button>
            <button
              onClick={() => setConfig({
                baseUrl: 'https://api.openai.com/v1',
                modelName: 'gpt-4',
                apiKey: config.apiKey || 'sk-your-openai-key-here'
              })}
              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
            >
              🧠 OpenAI GPT-4
            </button>
            <button
              onClick={() => setConfig({
                baseUrl: 'http://your-llm-server.com/v1',
                modelName: 'gpt-oss-120b',
                apiKey: config.apiKey || 'your-api-token-here'
              })}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              🏠 Local Server
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Base URL</label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
            placeholder="https://api.anthropic.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 mt-1">
            • Claude: https://api.anthropic.com
            • OpenAI: https://api.openai.com/v1  
            • Local: http://your-server.com/v1
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Model Name</label>
          <input
            type="text"
            value={config.modelName}
            onChange={(e) => handleConfigChange('modelName', e.target.value)}
            placeholder="claude-3-5-sonnet-20241022"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 mt-1">
            • Claude: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022
            • OpenAI: gpt-4, gpt-3.5-turbo
            • Local: your-model-name
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key/Token</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder="sk-ant-api03-... (for Claude) or sk-... (for OpenAI)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 mt-1">
            • Claude: Get from https://console.anthropic.com
            • OpenAI: Get from https://platform.openai.com
          </div>
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
              
              {/* CORS-specific help */}
              {testResult.error.includes('CORS') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800">🔧 CORS Fix Required</div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Your LLM server needs to allow requests from: <code>{window.location.origin}</code>
                    <br />
                    Add these headers to your server:
                    <pre className="mt-1 text-xs bg-yellow-100 p-1 rounded">
{`Access-Control-Allow-Origin: ${window.location.origin}
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">📋 Setup Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Use embedded configuration (click green buttons) for instant setup</li>
          <li>Or enter your LLM API base URL (OpenAI-compatible format)</li>
          <li>Specify the model name you want to use</li>
          <li>Add your API key/token for authentication</li>
          <li>Save the configuration and test the connection</li>
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