import React from 'react';
import { Check } from 'lucide-react';

/**
 * ProgressStep Component
 * Displays a single step in the configuration progress tracker
 */
const ProgressStep = ({ 
  step, 
  index, 
  isActive, 
  isCompleted, 
  onClick, 
  totalSteps 
}) => {
  const stepNumber = index + 1;
  const isLast = index === totalSteps - 1;
  
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isCompleted
            ? 'bg-green-100 border-2 border-green-500 text-green-700'
            : isActive
            ? 'bg-blue-600 border-2 border-blue-600 text-white'
            : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
        } hover:scale-105`}
        title={`${step.label}${step.required ? ' (Required)' : ''}`}
        aria-label={`Step ${stepNumber}: ${step.label}${step.required ? ' (Required)' : ''}`}
      >
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          <span className="text-sm font-semibold">{stepNumber}</span>
        )}
      </button>
      
      <div className="ml-3 flex-1">
        <div className={`text-sm font-medium ${
          isActive ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {step.label}
          {step.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="text-xs text-gray-500">
          {isCompleted ? 'Configured' : 'Not configured'}
        </div>
      </div>
      
      {!isLast && (
        <div className={`w-12 h-0.5 mx-4 ${
          isCompleted ? 'bg-green-300' : 'bg-gray-200'
        }`} />
      )}
    </div>
  );
};

export default ProgressStep;
