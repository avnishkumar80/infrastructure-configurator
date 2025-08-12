import React from 'react';
import ProgressStep from '../UI/ProgressStep.js';
import { useConfigurationState } from '../../hooks/useConfiguration.js';
import { useUI } from '../../store/UIContext.js';

/**
 * ProgressTracker Component
 * Displays the step-by-step progress through configuration
 */
const ProgressTracker = () => {
  const { configData, getStepStatus } = useConfigurationState();
  const { currentStep, setCurrentStep } = useUI();

  const steps = configData.steps || [];

  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.id);
        
        return (
          <ProgressStep
            key={step.id}
            step={step}
            index={index}
            isActive={currentStep === step.id}
            isCompleted={stepStatus.completed}
            totalSteps={steps.length}
            onClick={() => setCurrentStep(step.id)}
          />
        );
      })}
    </div>
  );
};

export default ProgressTracker;
