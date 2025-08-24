import React, { useState } from 'react';
import { 
  Play, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wrench, 
  Wifi, 
  WifiOff,
  Zap,
  Copy,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  User
} from 'lucide-react';

/**
 * Enhanced Chat Message Component with Modern Design
 */
const EnhancedChatMessage = ({ 
  message, 
  onConfirmToolExecution,
  onSuggestedAction,
  isLast
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.type === 'user';
  
  const getMessageIcon = () => {
    if (message.isToolExecution) return <Wrench className="w-4 h-4 text-emerald-600" />;
    if (message.mcpPowered && message.llmPowered) return <Sparkles className="w-4 h-4 text-purple-500" />;
    if (message.mcpPowered) return <Zap className="w-4 h-4 text-blue-500" />;
    if (message.isError) return <XCircle className="w-4 h-4 text-red-500" />;
    if (message.needsConfirmation) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Bot className="w-4 h-4 text-slate-600" />;
  };

  const getMessageStyle = () => {
    if (isUser) {
      return 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ml-12 rounded-2xl rounded-br-md shadow-lg';
    }
    
    if (message.isToolExecution) return 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
    if (message.isError) return 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
    if (message.needsConfirmation) return 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
    if (message.mcpPowered && message.llmPowered) return 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border border-purple-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
    if (message.mcpPowered) return 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
    return 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-800 mr-12 rounded-2xl rounded-bl-md shadow-sm';
  };

  const getMCPStatusBadge = () => {
    if (!message.mcpStatus && !message.mcpPowered && !message.llmPowered) return null;
    
    const badges = [];
    
    if (message.llmPowered) {
      badges.push(
        <span key="llm" className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          <Sparkles className="w-3 h-3" />
          <span>AI Enhanced</span>
        </span>
      );
    }
    
    if (message.mcpPowered) {
      badges.push(
        <span key="mcp" className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
          <Zap className="w-3 h-3" />
          <span>Tools Active</span>
        </span>
      );
    }
    
    if (message.mcpStatus === 'connected' && !message.mcpPowered) {
      badges.push(
        <span key="connected" className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </span>
      );
    }
    
    return badges.length > 0 ? <div className="flex flex-wrap gap-2">{badges}</div> : null;
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`relative max-w-[85%] p-4 ${getMessageStyle()} transition-all duration-200 hover:shadow-md`}>
        {/* Message header with icon and status */}
        {!isUser && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                {getMessageIcon()}
              </div>
              <div className="text-xs font-semibold text-slate-600">
                AI Assistant
              </div>
            </div>
            
            {/* Message options */}
            <div className="flex items-center space-x-1">
              {getMCPStatusBadge()}
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/60 rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-700"
                  title="Message options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1">
                    <button
                      onClick={handleCopyMessage}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User message header */}
        {isUser && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-white/90">
                You
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded-lg transition-all duration-200 text-white/70 hover:text-white"
                title="Message options"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={handleCopyMessage}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Message content */}
        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>
          {message.content}
        </div>
        
        {/* Connection Error Display */}
        {message.connectionError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <strong>Connection Error:</strong> {message.connectionError}
              </div>
            </div>
          </div>
        )}
        
        {/* Tool confirmation button */}
        {message.needsConfirmation && message.suggestedTool && (
          <div className="mt-4">
            <button
              onClick={() => onConfirmToolExecution(
                message.suggestedTool.tool_name, 
                message.suggestedTool.suggested_parameters || {}
              )}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              <span>Execute {message.suggestedTool.tool_name}</span>
            </button>
          </div>
        )}
        
        {/* Suggested actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-slate-600 mb-2">Quick Actions:</div>
            <div className="grid gap-2">
              {message.suggestedActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestedAction(action)}
                  className="px-4 py-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md"
                  title={action.description}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-3 h-3" />
                    <span>{action.label}</span>
                  </div>
                  {action.confidence && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {Math.round(action.confidence * 100)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Tool execution results */}
        {message.toolResult && (
          <div className="mt-4 p-4 bg-white/80 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="w-4 h-4 text-slate-600" />
              <div className="text-xs font-semibold text-slate-700">Tool Result</div>
            </div>
            <div className="text-sm">
              {message.toolResult.success ? (
                <div className="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Success</span>
                  </div>
                  <div className="text-sm">
                    {typeof message.toolResult.result === 'string' 
                      ? message.toolResult.result 
                      : JSON.stringify(message.toolResult.result, null, 2)}
                  </div>
                </div>
              ) : (
                <div className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <div className="text-sm">{message.toolResult.error}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analysis debug info (development only) */}
        {process.env.NODE_ENV === 'development' && message.analysis && (
          <details className="mt-4">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 font-medium">
              🔍 Debug Info (Dev Mode)
            </summary>
            <div className="mt-2 p-3 bg-slate-100 rounded-lg">
              <div className="text-xs space-y-2">
                {message.analysis.confidence_score && (
                  <div className="flex items-center space-x-2">
                    <strong>Confidence:</strong> 
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.round(message.analysis.confidence_score * 100)}%` }}
                      ></div>
                    </div>
                    <span>{Math.round(message.analysis.confidence_score * 100)}%</span>
                  </div>
                )}
                {message.analysis.detected_intents && (
                  <div>
                    <strong>Intents:</strong> {message.analysis.detected_intents.map(i => i.intent).join(', ')}
                  </div>
                )}
                {message.analysis.suggested_tools && (
                  <div>
                    <strong>Suggested Tools:</strong> {message.analysis.suggested_tools.length}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-slate-600 hover:text-slate-800">Full Analysis</summary>
                  <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-32 border">
                    {JSON.stringify(message.analysis, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </details>
        )}
        
        {/* Message footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center space-x-3">
            <div className={`text-xs ${isUser ? 'text-white/70' : 'text-slate-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {message.responseType && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isUser ? 'bg-white/20 text-white/80' : 'bg-slate-200 text-slate-600'
              }`}>
                {message.responseType}
              </span>
            )}
          </div>
          
          {/* Feedback buttons for AI messages */}
          {!isUser && isLast && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="p-1 hover:bg-white/60 rounded text-slate-500 hover:text-emerald-600 transition-colors"
                title="Good response"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-white/60 rounded text-slate-500 hover:text-red-600 transition-colors"
                title="Poor response"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close options */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        ></div>
      )}
    </div>
  );
};

export default EnhancedChatMessage;
