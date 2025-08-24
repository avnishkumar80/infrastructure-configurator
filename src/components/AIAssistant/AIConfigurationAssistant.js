// Enhanced AIConfigurationAssistant.js
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bot, 
  Send, 
  Maximize2, 
  Minimize2, 
  MessageCircle, 
  Wifi, 
  WifiOff,
  AlertCircle,
  Sparkles,
  Mic,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy
} from 'lucide-react';
import EnhancedChatMessage from './EnhancedChatMessage.js';
import QuickActions from './QuickActions.js';
import { useEnhancedAIAssistant } from '../../hooks/useAIAssistant.js';

/**
 * Enhanced AI Configuration Assistant with Modern UI
 */
const AIConfigurationAssistant = () => {
  const messagesEndRef = useRef(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const {
    messages,
    inputMessage,
    isTyping,
    isMinimized,
    isConnected,
    availableTools,
    connectionError,
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

  // Enhanced quick actions based on MCP availability and actual tools
  const generateQuickActions = () => {
    if (!isConnected || availableTools.length === 0) {
      return [
        { icon: 'HelpCircle', text: "Get guidance", query: "I need help with my infrastructure configuration" },
        { icon: 'Target', text: "Best practices", query: "What are the best practices for my setup?" },
        { icon: 'AlertTriangle', text: "Troubleshoot", query: "I'm having issues with my configuration" },
        { icon: 'Lightbulb', text: "Recommendations", query: "Give me recommendations for my setup" }
      ];
    }

    // Generate actions based on actual available tools
    const actions = [];
    
    // Check for math tools
    const mathTools = availableTools.filter(t => 
      t.name.includes('add') || 
      t.description?.toLowerCase().includes('math') || 
      t.description?.toLowerCase().includes('calculate')
    );
    if (mathTools.length > 0) {
      actions.push({ 
        icon: 'Calculator', 
        text: "Calculate", 
        query: `Use the ${mathTools[0].name} tool to help me with calculations` 
      });
    }

    // Check for recommendation tools
    const recommendTools = availableTools.filter(t => 
      t.name.includes('recommend') || 
      t.description?.toLowerCase().includes('recommend')
    );
    if (recommendTools.length > 0) {
      actions.push({ 
        icon: 'Lightbulb', 
        text: "Get recommendation", 
        query: `Use the ${recommendTools[0].name} tool to give me a recommendation` 
      });
    }

    // Check for system/desktop tools
    const systemTools = availableTools.filter(t => 
      t.name.includes('desktop') || 
      t.name.includes('system') || 
      t.description?.toLowerCase().includes('desktop') ||
      t.description?.toLowerCase().includes('system') ||
      t.description?.toLowerCase().includes('file')
    );
    if (systemTools.length > 0) {
      actions.push({ 
        icon: 'Settings', 
        text: "System help", 
        query: "Help me with system operations and file management" 
      });
    }

    // Add general tool exploration if we have tools
    if (availableTools.length > 0) {
      actions.push({ 
        icon: 'Tool', 
        text: `Explore ${availableTools.length} tools`, 
        query: "Show me what tools are available and what they can do" 
      });
    }

    // Fallback to generic actions if no specific tool patterns found
    if (actions.length === 0) {
      actions.push(
        { icon: 'Zap', text: "Use tools", query: "Help me use the available MCP tools" },
        { icon: 'FileText', text: "List capabilities", query: "What can you do with the connected tools?" }
      );
    }

    return actions.slice(0, 4); // Limit to 4 actions
  };

  const quickActions = generateQuickActions();

  const getConnectionStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="w-3 h-3 text-emerald-600" />,
        text: `${availableTools.length} tools ready`,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      };
    } else if (connectionError) {
      return {
        icon: <AlertCircle className="w-3 h-3 text-red-600" />,
        text: 'Connection failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: <WifiOff className="w-3 h-3 text-slate-400" />,
        text: 'Basic mode',
        color: 'text-slate-400',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200'
      };
    }
  };

  const connectionStatus = getConnectionStatusInfo();

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isTyping) {
      handleSendMessage();
    }
  };

  return (
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl">
      {/* Enhanced Header with glassmorphism effect */}
      <div className="relative p-4 border-b border-slate-200/50 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-xl flex-shrink-0">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Enhanced bot avatar with animation */}
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
                <Bot className="w-6 h-6 text-white" />
                {isConnected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              {/* Pulse animation for activity */}
              {isTyping && (
                <div className="absolute inset-0 rounded-xl bg-blue-400/20 animate-ping"></div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-sm">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-slate-600 font-medium">Infrastructure Helper</p>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${connectionStatus.bgColor} ${connectionStatus.borderColor} border`}>
                  {connectionStatus.icon}
                  <span className={connectionStatus.color}>{connectionStatus.text}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Options menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
                  <button
                    onClick={() => {
                      clearChat();
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(messages.map(m => `${m.type}: ${m.content}`).join('\n'));
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Chat</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Minimize/Maximize button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
              title={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close options */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        ></div>
      )}

      {!isMinimized && (
        <>
          {/* Enhanced Quick Actions */}
          <QuickActions 
            quickActions={quickActions}
            onActionClick={(query) => setInputMessage(query)}
          />

          {/* Connection Status Banner (enhanced) */}
          {connectionError && (
            <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-semibold text-red-800">Connection Issue</div>
                  <div className="text-red-700 mt-1">{connectionError}</div>
                  <button className="text-red-600 hover:text-red-800 font-medium mt-2 text-xs underline">
                    Troubleshoot Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {messages.map((message, index) => (
                <EnhancedChatMessage
                  key={message.id}
                  message={message}
                  onConfirmToolExecution={handleConfirmToolExecution}
                  onSuggestedAction={handleSuggestedAction}
                  isLast={index === messages.length - 1}
                />
              ))}
              
              {/* Enhanced Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-4 rounded-2xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        {isConnected ? 'AI is thinking with tools...' : 'AI is thinking...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Enhanced Status Footer */}
          {isConnected && availableTools.length > 0 && (
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-t border-emerald-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {availableTools.length} tools connected
                  </span>
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  Enhanced mode active
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Input Area */}
          <div className="p-4 border-t border-slate-200/50 bg-gradient-to-t from-slate-50/50 to-white flex-shrink-0">
            <form onSubmit={handleInputSubmit} className="space-y-3">
              {/* Input container */}
              <div className={`relative flex items-end space-x-3 p-3 bg-white border rounded-2xl shadow-sm transition-all duration-200 ${
                isInputFocused ? 'input-container-focus border-blue-300' : 'border-slate-200 hover:border-slate-300'
              }`}>
                {/* Attachment button (placeholder) */}
                <button
                  type="button"
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Attach file (coming soon)"
                  disabled
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                {/* Text input */}
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={isConnected 
                    ? "Ask me anything - I have access to powerful tools..." 
                    : "What would you like to know about your infrastructure?"
                  }
                  className="flex-1 resize-none border-none outline-none focus:outline-none focus:ring-0 text-sm placeholder-slate-400 bg-transparent max-h-32 min-h-[20px] leading-relaxed"
                  rows="1"
                  style={{ 
                    height: 'auto',
                    minHeight: '20px',
                    maxHeight: '128px',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
                
                {/* Voice input button (placeholder) */}
                <button
                  type="button"
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Voice input (coming soon)"
                  disabled
                >
                  <Mic className="w-4 h-4" />
                </button>
                
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
                    inputMessage.trim() && !isTyping
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Character count and tips */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-4">
                  {inputMessage.length > 0 && (
                    <span>{inputMessage.length} characters</span>
                  )}
                  {isConnected && (
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>AI-powered responses</span>
                    </span>
                  )}
                </div>
                <div>
                  Press Enter to send
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Enhanced Minimized State */}
      {isMinimized && (
        <div className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="group flex items-center justify-center space-x-3 w-full py-3 px-4 text-sm font-medium text-blue-700 hover:text-blue-800 bg-white/80 hover:bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Expand AI Chat</span>
            {isConnected && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIConfigurationAssistant;
