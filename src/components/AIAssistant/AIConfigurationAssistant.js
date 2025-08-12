import React, { useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Maximize2, 
  Minimize2, 
  MessageCircle, 
  Wifi, 
  WifiOff,
  AlertCircle
} from 'lucide-react';
import EnhancedChatMessage from './EnhancedChatMessage.js';
import QuickActions from './QuickActions.js';
import { useEnhancedAIAssistant } from '../../hooks/useAIAssistant.js';

/**
 * Enhanced AI Configuration Assistant with MCP Integration
 */
const AIConfigurationAssistant = () => {
  const messagesEndRef = useRef(null);
  
  const {
    messages,
    inputMessage,
    isTyping,
    isMinimized,
    isConnected,
    availableTools,
    connectionError,
    mcpStatus,
    setInputMessage,
    setIsMinimized,
    handleSendMessage,
    handleConfirmToolExecution,
    handleSuggestedAction,
    handleKeyPress,
    clearChat
  } = useEnhancedAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced quick actions based on MCP availability
  const quickActions = isConnected ? [
    { icon: 'CheckCircle', text: "Validate config", query: "Validate my current configuration for errors and issues" },
    { icon: 'Tool', text: "Fix issues", query: "Help me fix configuration issues and errors" },
    { icon: 'Zap', text: "Optimize setup", query: "Optimize my infrastructure for better performance and cost" },
    { icon: 'FileText', text: "Generate scripts", query: "Generate deployment scripts for my configuration" }
  ] : [
    { icon: 'HelpCircle', text: "Get guidance", query: "I need help with my infrastructure configuration" },
    { icon: 'Target', text: "Best practices", query: "What are the best practices for my setup?" },
    { icon: 'AlertTriangle', text: "Troubleshoot", query: "I'm having issues with my configuration" },
    { icon: 'Lightbulb', text: "Recommendations", query: "Give me recommendations for my setup" }
  ];

  const getConnectionStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="w-3 h-3 text-green-600" />,
        text: `${availableTools.length} tools ready`,
        color: 'text-green-600'
      };
    } else if (connectionError) {
      return {
        icon: <AlertCircle className="w-3 h-3 text-red-600" />,
        text: 'Connection failed',
        color: 'text-red-600'
      };
    } else {
      return {
        icon: <WifiOff className="w-3 h-3 text-gray-400" />,
        text: 'Basic mode',
        color: 'text-gray-400'
      };
    }
  };

  const connectionStatus = getConnectionStatusInfo();

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen">
      {/* Enhanced Header with MCP status */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-600">Infrastructure Helper</p>
                <div className={`flex items-center space-x-1 ${connectionStatus.color}`}>
                  {connectionStatus.icon}
                  <span className="text-xs">{connectionStatus.text}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Clear chat button */}
            <button
              onClick={clearChat}
              className="p-1 hover:bg-blue-100 rounded text-xs text-blue-600 hover:text-blue-800"
              title="Clear chat"
            >
              Clear
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              title={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          <QuickActions 
            quickActions={quickActions}
            onActionClick={(query) => setInputMessage(query)}
          />

          {/* MCP Status Banner (if there's an issue) */}
          {connectionError && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div className="text-xs text-red-700">
                  <div className="font-medium">MCP Connection Issue</div>
                  <div>{connectionError}</div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <EnhancedChatMessage
                key={message.id}
                message={message}
                onConfirmToolExecution={handleConfirmToolExecution}
                onSuggestedAction={handleSuggestedAction}
              />
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    {isConnected && (
                      <span className="text-xs text-gray-500">Analyzing with MCP tools...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* MCP Tools Status (if connected) */}
          {isConnected && availableTools.length > 0 && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-200">
              <div className="text-xs text-green-700 flex items-center space-x-2">
                <Wifi className="w-3 h-3" />
                <span>🛠️ Connected to {availableTools.length} tools for real-time assistance</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected 
                  ? "Ask me to validate, fix, or optimize your infrastructure..." 
                  : "Ask me about your infrastructure needs..."
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="p-4 text-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center justify-center space-x-2 w-full py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Expand Chat</span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIConfigurationAssistant;
