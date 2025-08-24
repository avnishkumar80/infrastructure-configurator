import React, { useState } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Target, 
  HelpCircle,
  CheckCircle,
  Wrench,
  Zap,
  FileText,
  Calculator,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

/**
 * Enhanced QuickActions Component with Modern Design
 * Displays quick action buttons for common AI assistant queries
 */
const QuickActions = ({ onActionClick, quickActions }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredAction, setHoveredAction] = useState(null);

  const iconMap = {
    'Lightbulb': Lightbulb,
    'AlertTriangle': AlertTriangle,
    'Target': Target,
    'HelpCircle': HelpCircle,
    'CheckCircle': CheckCircle,
    'Tool': Wrench,
    'Zap': Zap,
    'FileText': FileText,
    'Calculator': Calculator,
    'Settings': Settings
  };

  const getActionColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50/80 via-blue-50/30 to-indigo-50/30 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">Quick Actions</span>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            {quickActions.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/60 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
          title={isExpanded ? 'Collapse actions' : 'Expand actions'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Actions Grid */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <div className="px-4 grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = iconMap[action.icon] || HelpCircle;
            
            return (
              <button
                key={index}
                onClick={() => onActionClick(action.query)}
                onMouseEnter={() => setHoveredAction(index)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`group relative overflow-hidden p-3 bg-gradient-to-br ${getActionColor(index)} text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg transform ${
                  hoveredAction === index ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'
                }`}
              >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-3">
                  <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold leading-tight">
                      {action.text}
                    </div>
                    <div className="text-xs opacity-90 mt-1 line-clamp-2">
                      Click to start this action
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full transition-transform duration-500 ${
                  hoveredAction === index ? 'translate-x-full' : ''
                }`}></div>
              </button>
            );
          })}
        </div>

        {/* Pro tip */}
        <div className="px-4 mt-4">
          <div className="bg-white/80 border border-blue-200 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Lightbulb className="w-3 h-3 text-blue-600" />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-blue-600">Pro tip:</span> You can also type your own questions or requests directly in the chat box below.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
