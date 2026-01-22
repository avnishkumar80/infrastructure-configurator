
import React from 'react';
import { Target, Scale, Cpu, HardDrive, Zap, Check, X } from 'lucide-react';

const iconMap = {
    'Scale': Scale,
    'Cpu': Cpu,
    'HardDrive': HardDrive,
    'Zap': Zap,
    'Target': Target
};

const IntentSelector = ({ intents, onSelect, currentIntent, onClose }) => {
    if (!intents || intents.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 animate-in zoom-in-95 duration-200 relative">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">How do you assume to use this infrastructure?</h2>
                    <p className="text-gray-500 text-lg">Select a goal to help us recommend the best configuration options for your needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {intents.map((intent) => {
                        const Icon = iconMap[intent.icon] || Target;
                        const isSelected = currentIntent === intent.id;

                        return (
                            <button
                                key={intent.id}
                                onClick={() => onSelect(intent.id)}
                                className={`
                                    relative group items-center flex flex-col text-center p-6 rounded-xl border-2 transition-all duration-200
                                    ${isSelected
                                        ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-100'
                                        : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-blue-600">
                                        <Check className="w-5 h-5 bg-blue-100 rounded-full p-0.5" />
                                    </div>
                                )}

                                <div className={`
                                    p-4 rounded-full mb-4 transition-colors
                                    ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}
                                `}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                <h3 className={`font-semibold text-lg mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {intent.label}
                                </h3>

                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {intent.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default IntentSelector;
