import React from 'react';
import { Brain, CheckCircle, AlertCircle, Loader, WifiOff } from 'lucide-react';

/**
 * LLM Connection Badge Component
 * Shows the status of LLM connection similar to MCP Connected badge
 */
export const LLMConnectionBadge = ({ 
  isConnected, 
  isConnecting, 
  error, 
  config, 
  className = "",
  size = "sm" 
}) => {
  const sizeClasses = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-2"
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  if (isConnecting) {
    return (
      <div className={`flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full ${sizeClasses[size]} ${className}`}>
        <Loader className={`${iconSizes[size]} animate-spin`} />
        <span>LLM Connecting...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className={`flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 rounded-full ${sizeClasses[size]} ${className}`}>
        <div className="flex items-center space-x-1">
          <Brain className={iconSizes[size]} />
          <CheckCircle className={`${iconSizes[size]} text-green-600`} />
        </div>
        <span>LLM Connected</span>
        {config?.modelName && size !== 'xs' && (
          <span className="text-xs text-green-600 bg-green-100 px-1 py-0.5 rounded">
            {config.modelName.split('/').pop() || config.modelName}
          </span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 rounded-full ${sizeClasses[size]} ${className}`}>
        <div className="flex items-center space-x-1">
          <Brain className={iconSizes[size]} />
          <AlertCircle className={`${iconSizes[size]} text-red-600`} />
        </div>
        <span>LLM Error</span>
        {size === 'lg' && (
          <span className="text-xs text-red-600 bg-red-100 px-1 py-0.5 rounded max-w-32 truncate">
            {error}
          </span>
        )}
      </div>
    );
  }

  // Not connected (default state)
  return (
    <div className={`flex items-center space-x-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-full ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center space-x-1">
        <Brain className={iconSizes[size]} />
        <WifiOff className={`${iconSizes[size]} text-gray-500`} />
      </div>
      <span>LLM Disconnected</span>
    </div>
  );
};

export default LLMConnectionBadge;