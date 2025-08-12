import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Target, 
  HelpCircle,
  CheckCircle,
  Wrench,
  Zap,
  FileText
} from 'lucide-react';

/**
 * QuickActions Component
 * Displays quick action buttons for common AI assistant queries
 */
const QuickActions = ({ onActionClick, quickActions }) => {
  const iconMap = {
    'Lightbulb': Lightbulb,
    'AlertTriangle': AlertTriangle,
    'Target': Target,
    'HelpCircle': HelpCircle,
    'CheckCircle': CheckCircle,
    'Tool': Wrench,
    'Zap': Zap,
    'FileText': FileText
  };

  return (
    <div className="p-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
      <div className="text-xs font-medium text-gray-600 mb-2">Quick Actions:</div>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => {
          const IconComponent = iconMap[action.icon] || HelpCircle;
          
          return (
            <button
              key={index}
              onClick={() => onActionClick(action.query)}
              className="flex items-center space-x-2 p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
            >
              <IconComponent className="w-3 h-3 text-blue-600" />
              <span className="text-gray-700">{action.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
