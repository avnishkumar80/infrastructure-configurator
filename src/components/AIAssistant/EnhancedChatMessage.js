import React from 'react';
import { 
  Play, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wrench, 
  Wifi, 
  WifiOff,
  Zap
} from 'lucide-react';

/**
 * Enhanced Chat Message Component with MCP Integration
 */
const EnhancedChatMessage = ({ 
  message, 
  onConfirmToolExecution,
  onSuggestedAction 
}) => {
  const isUser = message.type === 'user';
  
  const getMessageIcon = () => {
    if (message.isToolExecution) return <Wrench className="w-4 h-4" />;
    if (message.mcpPowered) return <Zap className="w-4 h-4 text-blue-500" />;
    if (message.isError) return <XCircle className="w-4 h-4" />;
    if (message.needsConfirmation) return <AlertTriangle className="w-4 h-4" />;
    return null;
  };

  const getMessageStyle = () => {
    if (isUser) return 'bg-blue-600 text-white';
    if (message.isToolExecution) return 'bg-green-50 border border-green-200 text-gray-900';
    if (message.isError) return 'bg-red-50 border border-red-200 text-gray-900';
    if (message.needsConfirmation) return 'bg-amber-50 border border-amber-200 text-gray-900';
    if (message.mcpPowered) return 'bg-blue-50 border border-blue-200 text-gray-900';
    return 'bg-gray-100 text-gray-900';
  };

  const getMCPStatusBadge = () => {
    if (!message.mcpStatus) return null;
    
    return (
      <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
        message.mcpStatus === 'connected' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {message.mcpStatus === 'connected' ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span>MCP {message.mcpStatus}</span>
      </span>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-3 rounded-lg ${getMessageStyle()}`}>
        {/* Message header with icon and status */}
        {!isUser && (getMessageIcon() || message.mcpStatus) && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getMessageIcon()}
              {message.mcpPowered && (
                <span className="text-xs text-blue-600 font-medium">MCP Powered</span>
              )}
            </div>
            {getMCPStatusBadge()}
          </div>
        )}
        
        {/* Message content */}
        <div className="text-sm whitespace-pre-line">{message.content}</div>
        
        {/* Connection Error Display */}
        {message.connectionError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Connection Error:</strong> {message.connectionError}
          </div>
        )}
        
        {/* Tool confirmation button */}
        {message.needsConfirmation && message.suggestedTool && (
          <button
            onClick={() => onConfirmToolExecution(
              message.suggestedTool.tool_name, 
              message.suggestedTool.suggested_parameters || {}
            )}
            className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-3 h-3" />
            <span>Yes, use {message.suggestedTool.tool_name}</span>
          </button>
        )}
        
        {/* Suggested actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-600">Suggested actions:</div>
            {message.suggestedActions.slice(0, 3).map((action, index) => (
              <button
                key={index}
                onClick={() => onSuggestedAction(action)}
                className="w-full px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                title={action.description}
              >
                <Settings className="w-3 h-3" />
                <span>{action.label}</span>
                {action.confidence && (
                  <span className="text-xs opacity-75">
                    ({Math.round(action.confidence * 100)}%)
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Tool execution results */}
        {message.toolResult && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="text-xs font-medium text-gray-700 mb-2">Tool Result:</div>
            <div className="text-xs text-gray-600">
              {message.toolResult.success ? (
                <div className="text-green-700">
                  ✅ Success: {typeof message.toolResult.result === 'string' 
                    ? message.toolResult.result 
                    : JSON.stringify(message.toolResult.result, null, 2)}
                </div>
              ) : (
                <div className="text-red-700">
                  ❌ Error: {message.toolResult.error}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analysis debug info (development only) */}
        {process.env.NODE_ENV === 'development' && message.analysis && (
          <details className="mt-3">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              🔍 Debug Info (Dev Mode)
            </summary>
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <div className="text-xs space-y-1">
                {message.analysis.confidence_score && (
                  <div>
                    <strong>Confidence:</strong> {Math.round(message.analysis.confidence_score * 100)}%
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
                  <summary className="cursor-pointer text-gray-600">Full Analysis</summary>
                  <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto max-h-32">
                    {JSON.stringify(message.analysis, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </details>
        )}
        
        {/* Timestamp */}
        <div className="text-xs opacity-70 mt-2 flex items-center justify-between">
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {message.responseType && (
            <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">
              {message.responseType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatMessage;
