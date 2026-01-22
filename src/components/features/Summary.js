import React, { useMemo } from 'react';
import { calculatePrice } from '../../utils/pricing';

const Summary = ({
    configData,
    configuration
}) => {
    const grandTotal = useMemo(() => {
        return Object.entries(configuration).reduce((total, [category, categoryConfig]) => {
            return total + Object.entries(categoryConfig).reduce((catSum, [subItem, config]) => {
                if (config.selections) {
                    return catSum + config.selections.reduce((subSum, selection) => {
                        return subSum + calculatePrice(selection.product, selection.config, selection.quantity);
                    }, 0);
                }
                return catSum;
            }, 0);
        }, 0);
    }, [configuration]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Configuration Summary</h2>

            {/* Category Summary */}
            {Object.entries(configuration).map(([category, categoryConfig]) => {
                const categorySelections = Object.entries(categoryConfig).reduce((acc, [subItem, config]) => {
                    if (config.selections && config.selections.length > 0) {
                        acc.push(...config.selections.map(selection => ({
                            ...selection,
                            subItem,
                            subItemLabel: configData.subItems[category]?.find(item => item.id === subItem)?.label || subItem
                        })));
                    }
                    return acc;
                }, []);

                if (categorySelections.length === 0) return null;

                const categoryTotal = categorySelections.reduce((sum, selection) => {
                    return sum + calculatePrice(selection.product, selection.config, selection.quantity);
                }, 0);

                return (
                    <div key={category} className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                            <span className="text-lg font-semibold text-green-600">${categoryTotal.toLocaleString()}</span>
                        </div>

                        {/* Items under category */}
                        <div className="space-y-4">
                            {categorySelections.map((selection, index) => (
                                <div key={`${selection.subItem}-${index}`} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="text-lg font-medium text-gray-900">
                                                {selection.product.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {selection.product.description}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-2">
                                                <span className="font-medium">Category:</span> {selection.subItemLabel}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Quantity:</span> {selection.quantity} ×
                                                <span className="font-medium"> Base Price:</span> ${selection.product.basePrice.toLocaleString()}
                                            </div>

                                            {/* Configuration Details */}
                                            {selection.config && Object.keys(selection.config).length > 0 && (
                                                <div className="mt-3">
                                                    <div className="text-sm font-medium text-gray-700 mb-2">Configuration:</div>
                                                    <div className="space-y-1">
                                                        {Object.entries(selection.config).map(([moduleId, moduleConfig]) => {
                                                            const module = selection.product.modules?.[moduleId];
                                                            if (!module) return null;

                                                            if (module.type === 'single-select' && moduleConfig) {
                                                                const selectedOption = module.options.find(opt => opt.id === moduleConfig);
                                                                return (
                                                                    <div key={moduleId} className="text-xs text-gray-600">
                                                                        <span className="font-medium">{module.label}:</span> {selectedOption?.label}
                                                                        {selectedOption?.price > 0 && (
                                                                            <span className="text-green-600 ml-1">(+${selectedOption.price.toLocaleString()})</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }

                                                            if (module.type === 'multi-select-quantity' && Array.isArray(moduleConfig)) {
                                                                return (
                                                                    <div key={moduleId} className="text-xs text-gray-600">
                                                                        <span className="font-medium">{module.label}:</span>
                                                                        {moduleConfig.map((item, idx) => {
                                                                            const option = module.options.find(opt => opt.id === item.optionId);
                                                                            return option ? (
                                                                                <span key={idx} className="ml-1">
                                                                                    {option.label} × {item.quantity}
                                                                                    <span className="text-green-600">(+${(option.price * item.quantity).toLocaleString()})</span>
                                                                                    {idx < moduleConfig.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                );
                                                            }

                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="text-xl font-bold text-green-600">
                                                ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {grandTotal > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">Total Configuration Cost</h3>
                        <span className="text-2xl font-bold text-green-600">${grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-gray-600">No products configured yet</h3>
                    <p className="text-gray-500 mt-1">Start by selecting products from the Hardware, Software, or Services sections.</p>
                </div>
            )}
        </div>
    );
};

export default Summary;
