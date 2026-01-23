import React from 'react';
import { Check, X } from 'lucide-react';

const IntentSelector = ({ intentQuestions, onSelect, currentIntent, onClose, hasActiveConfig, variant = 'modal', submitLabel }) => {
    // Initialize answers with current intent or defaults
    const [answers, setAnswers] = React.useState(currentIntent || {});

    // Check if we have valid questions
    if (!intentQuestions || intentQuestions.length === 0) return null;

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const isComplete = intentQuestions.every(q => answers[q.id]);
    const isDifferent = JSON.stringify(currentIntent) !== JSON.stringify(answers);
    const showWarning = hasActiveConfig && isDifferent;

    const handleSubmit = () => {
        if (isComplete) {
            onSelect(answers);
        }
    };

    const isModal = variant === 'modal';

    const content = (
        <div className={`
            bg-white w-full animate-in zoom-in-95 duration-200 relative
            ${isModal ? 'rounded-2xl shadow-2xl max-w-2xl p-8' : 'rounded-xl border border-gray-200 p-6 mb-8'}
        `}>
            {isModal && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            <div className={`text-center ${isModal ? 'mb-6' : 'mb-4'}`}>
                <h2 className={`${isModal ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
                    {isModal ? 'Configure Your Environment' : 'Configuration Context'}
                </h2>
                <p className="text-gray-500">
                    {isModal ? 'Answer a few questions to help us tailor the catalog for you.' : 'Define your deployment goals to filter the catalog.'}
                </p>
            </div>

            {showWarning && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-left">
                    <div className="p-1 bg-amber-100 rounded-full">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-amber-800">Warning: Configuration Reset</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Changing the configuration type will <strong>clear your current selections</strong>.
                            Please confirm you want to proceed.
                        </p>
                    </div>
                </div>
            )}

            <div className={`space-y-6 ${isModal ? 'mb-10' : 'mb-6'}`}>
                {intentQuestions.map((question) => (
                    <div key={question.id} className="space-y-3">
                        <h3 className="font-semibold text-lg text-gray-900">{question.label}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {question.options.map((option) => {
                                const isSelected = answers[question.id] === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAnswer(question.id, option.value)}
                                        className={`
                                            relative p-4 rounded-xl border-2 text-left transition-all duration-200
                                            ${isSelected
                                                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {option.label}
                                            </span>
                                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        {option.description && (
                                            <p className="text-xs text-gray-500">{option.description}</p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!isComplete}
                    className={`
                        px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
                        ${isComplete
                            ? showWarning
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-lg hover:shadow-amber-500/25'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
                            : 'bg-gray-300 cursor-not-allowed opacity-70'
                        }
                    `}
                >
                    {showWarning
                        ? 'Update & Reset Configuration'
                        : submitLabel || (isModal ? 'Start Configuration' : 'Apply Filters')}
                </button>
            </div>
        </div>
    );

    if (!isModal) return content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            {content}
        </div>
    );
};

export default IntentSelector;
