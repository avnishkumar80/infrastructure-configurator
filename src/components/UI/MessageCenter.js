import React from 'react';
import { X, MessageCircle } from 'lucide-react';

/**
 * MessageCenter Component
 * Displays validation messages and issues in a modal overlay
 */
const MessageCenter = ({ 
  isVisible, 
  onClose, 
  messages = [], 
  onNavigateToStep 
}) => {
  if (!isVisible) return null;

  const handleNavigateClick = (category) => {
    if (onNavigateToStep) {
      onNavigateToStep(category);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close messages"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            <div className="p-4 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`border rounded-lg p-3 ${
                  message.type === 'error' ? 'border-red-200 bg-red-50' :
                  message.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      message.type === 'error' ? 'bg-red-500' :
                      message.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {message.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {message.message}
                      </div>
                      {message.category && (
                        <button
                          onClick={() => handleNavigateClick(message.category)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          {message.type === 'error' ? 'Fix now →' : 'Go to section →'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No messages</p>
              <p className="text-sm">All configurations look good!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
