import React from 'react';
import { Play, Settings } from 'lucide-react';

/**
 * ChatMessage Component
 * Displays individual chat messages with actions
 */
const ChatMessage = ({ 
  message, 
  onApplySuggestion, 
  onFixErrors 
}) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-3 rounded-lg ${
        isUser
          ? 'bg-blue-600 text-white'
          : message.isAutoSuggestion
          ? 'bg-amber-50 border border-amber-200 text-gray-900'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-sm whitespace-pre-line">{message.content}</div>
        
        {/* Apply Suggestion Button */}
        {message.suggestion && (
          <button
            onClick={() => onApplySuggestion(message.suggestion)}
            className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-3 h-3" />
            <span>Apply This Configuration</span>
          </button>
        )}
        
        {/* Fix Errors Button */}
        {message.errors && (
          <button
            onClick={() => onFixErrors(message.errors)}
            className="mt-3 w-full px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="w-3 h-3" />
            <span>Fix These Issues</span>
          </button>
        )}
        
        {/* Timestamp */}
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
