import React, { useState } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, Info, XCircle } from 'lucide-react';
import { getAllMessages } from '../../utils/validation';

const StepNavigator = ({
    configData,
    configuration,
    currentStep,
    setCurrentStep,
    setCurrentSubItem
}) => {
    const [showMessages, setShowMessages] = useState(false);

    return (
        <div className="bg-white border-b shadow-sm sticky top-16 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0">
                        {(configData.steps || []).map((step) => {
                            const isActive = currentStep === step.id;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => {
                                        setCurrentStep(step.id);
                                        if (step.id !== 'review') {
                                            setCurrentSubItem(configData.subItems?.[step.id]?.[0]?.id);
                                        }
                                    }}
                                    className={`
                    whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                    ${isActive
                                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    {step.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Messages Display Only */}
                    <div className="flex items-center justify-end py-2 md:py-0 border-t md:border-t-0 border-gray-100 mt-1 md:mt-0">
                        {(() => {
                            const messages = getAllMessages(configuration, configData);
                            const errors = messages.filter(m => m.type === 'error').length;
                            const warnings = messages.filter(m => m.type === 'warning').length;
                            const infos = messages.filter(m => m.type === 'info').length;

                            if (errors > 0 || warnings > 0 || infos > 0) {
                                return (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMessages(!showMessages)}
                                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border ${errors > 0
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                                    : warnings > 0
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                                                }`}
                                        >
                                            {errors > 0 ? (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            ) : warnings > 0 ? (
                                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                            ) : (
                                                <Info className="w-4 h-4 text-blue-600" />
                                            )}
                                            <span>
                                                {errors > 0 ? `${errors} Issue${errors !== 1 ? 's' : ''}` :
                                                    warnings > 0 ? `${warnings} Warning${warnings !== 1 ? 's' : ''}` :
                                                        `${infos} Info`}
                                            </span>
                                            {showMessages ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>

                                        {/* Compact Messages Dropdown */}
                                        {showMessages && (
                                            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                                                    <h3 className="text-sm font-semibold text-gray-900">
                                                        Validation Status
                                                    </h3>
                                                    <span className="text-xs text-gray-500">
                                                        {messages.length} total
                                                    </span>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                                    {messages
                                                        .sort((a, b) => {
                                                            const order = { error: 0, warning: 1, info: 2 };
                                                            return order[a.type] - order[b.type];
                                                        })
                                                        .map((message, index) => (
                                                            <div
                                                                key={index}
                                                                className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors cursor-pointer group"
                                                                onClick={() => {
                                                                    setCurrentStep(message.category);
                                                                    setCurrentSubItem(message.subItem);
                                                                    setShowMessages(false);
                                                                }}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    <div className={`mt-0.5 flex-shrink-0 ${message.type === 'error' ? 'text-red-500' :
                                                                            message.type === 'warning' ? 'text-amber-500' :
                                                                                'text-blue-500'
                                                                        }`}>
                                                                        {message.type === 'error' ? <XCircle className="w-5 h-5" /> :
                                                                            message.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                                                                <Info className="w-5 h-5" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                                                            {message.title}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                                            {message.message}
                                                                        </div>
                                                                    </div>
                                                                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepNavigator;
