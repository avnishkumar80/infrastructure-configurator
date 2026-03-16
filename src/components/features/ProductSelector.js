import React from 'react';
import { Minus, Plus, Settings } from 'lucide-react';
import { calculatePrice } from '../../utils/pricing';
import { getDefaultConfig } from '../../utils/productUtils';

const ProductSelector = ({
    category,
    subItem,
    configData,
    configuration,
    updateConfiguration,
    selectedProductIndex,
    setSelectedProductIndex,
    userIntent
}) => {
    // Filter products based on intent if set
    const availableProducts = React.useMemo(() => {
        const products = configData.products[subItem] || [];
        if (!userIntent) return products;
        return products.filter(product => {
            // If product has no recommended tag, show it. If it has tags, must match intent.
            return !product.recommendedFor || product.recommendedFor.includes(userIntent);
        });
    }, [configData.products, subItem, userIntent]);

    const currentSelections = configuration[category]?.[subItem]?.selections || [];

    const addProduct = (product) => {
        const newSelection = {
            productId: product.id,
            product,
            config: getDefaultConfig(product),
            quantity: 1,
            configured: true
        };
        const newSelections = [...currentSelections, newSelection];
        updateConfiguration(category, subItem, newSelections);
        setSelectedProductIndex(newSelections.length - 1);
    };

    const updateSelection = (index, updates) => {
        const updated = [...currentSelections];
        updated[index] = { ...updated[index], ...updates };
        updateConfiguration(category, subItem, updated);
    };

    const removeSelection = (index) => {
        const updated = currentSelections.filter((_, i) => i !== index);
        updateConfiguration(category, subItem, updated);
        if (selectedProductIndex === index) {
            setSelectedProductIndex(null);
        } else if (selectedProductIndex > index) {
            setSelectedProductIndex(selectedProductIndex - 1);
        }
    };

    // Helper to check recommendation
    const isRecommended = (item) => {
        return userIntent && item.recommendedFor && item.recommendedFor.includes(userIntent);
    };

    // Configuration mode for specific product
    if (selectedProductIndex !== null && currentSelections[selectedProductIndex]) {
        const selection = currentSelections[selectedProductIndex];
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedProductIndex(null)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <span className="text-sm font-medium">← Back to {configData.subItems?.[category]?.find(i => i.id === subItem)?.label || 'Product List'}</span>
                    </button>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Configuring #{selectedProductIndex + 1}
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selection.product.name}</h3>
                                <p className="text-gray-500 mt-1">{selection.product.description}</p>
                            </div>
                            {userIntent && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium capitalize">
                                    Option Filter: {configData.intents?.find(i => i.id === userIntent)?.label}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {Object.entries(selection.product.modules || {}).map(([moduleId, module]) => (
                            <div key={moduleId} className="bg-white rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                                            {module.label}
                                            {module.required && <span className="text-red-500 ml-1 text-xs">*Required</span>}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        {module.type === 'single-select' ? 'Single Select' : 'Multi Select'}
                                    </span>
                                </div>

                                {module.type === 'single-select' && (
                                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                                        {/* Sort recommended first */}
                                        {[...module.options].sort((a, b) => {
                                            const aRec = isRecommended(a);
                                            const bRec = isRecommended(b);
                                            return bRec - aRec;
                                        }).map(option => (
                                            <label key={option.id} className="relative group cursor-pointer block">
                                                <input
                                                    type="radio"
                                                    name={`${selectedProductIndex}-${moduleId}`}
                                                    value={option.id}
                                                    checked={selection.config[moduleId] === option.id}
                                                    onChange={(e) => updateSelection(selectedProductIndex, {
                                                        config: { ...selection.config, [moduleId]: e.target.value }
                                                    })}
                                                    className="peer sr-only"
                                                />
                                                <div className={`
                                                    h-full rounded-lg border-2 p-4 transition-all duration-200
                                                    peer-checked:border-blue-500 peer-checked:bg-blue-50/50 peer-checked:shadow-sm
                                                    border-gray-200 hover:border-blue-200
                                                    ${isRecommended(option) ? 'ring-2 ring-blue-200 ring-offset-1 border-blue-200' : ''}
                                                `}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900 peer-checked:text-blue-700">{option.label}</span>
                                                            {isRecommended(option) && (
                                                                <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                                    Recommended
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                            {option.price === 0 ? 'Included' : `+$${option.price.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-3">{option.description}</p>
                                                    {option.details && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {option.details.map((detail, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {detail}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {module.type === 'multi-select-quantity' && (
                                    <div className="space-y-3">
                                        {[...module.options].sort((a, b) => {
                                            const aRec = isRecommended(a);
                                            const bRec = isRecommended(b);
                                            return bRec - aRec;
                                        }).map(option => {
                                            const currentSelection = (selection.config[moduleId] || []).find(s => s.optionId === option.id);
                                            const quantity = currentSelection?.quantity || 0;
                                            const isSelected = quantity > 0;

                                            return (
                                                <div key={option.id} className={`
                                                    rounded-lg border-2 p-4 transition-all duration-200
                                                    ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}
                                                    ${isRecommended(option) ? 'border-blue-200 bg-blue-50/10' : ''}
                                                `}>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="font-medium text-gray-900">{option.label}</div>
                                                                {isRecommended(option) && (
                                                                    <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-2">{option.description}</p>
                                                            {option.details && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {option.details.map((detail, idx) => (
                                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                            {detail}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[200px]">
                                                            <div className="text-right">
                                                                <div className="text-sm font-semibold text-green-600">
                                                                    ${option.price.toLocaleString()}
                                                                </div>
                                                                <div className="text-xs text-gray-400">per unit</div>
                                                            </div>

                                                            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                                                                <button
                                                                    onClick={() => {
                                                                        const newQty = Math.max(0, quantity - 1);
                                                                        const moduleConfig = selection.config[moduleId] || [];
                                                                        let newModuleConfig;

                                                                        if (newQty === 0) {
                                                                            newModuleConfig = moduleConfig.filter(s => s.optionId !== option.id);
                                                                        } else {
                                                                            const existingIndex = moduleConfig.findIndex(s => s.optionId === option.id);
                                                                            if (existingIndex >= 0) {
                                                                                newModuleConfig = [...moduleConfig];
                                                                                newModuleConfig[existingIndex] = { ...newModuleConfig[existingIndex], quantity: newQty };
                                                                            }
                                                                        }

                                                                        updateSelection(selectedProductIndex, {
                                                                            config: { ...selection.config, [moduleId]: newModuleConfig }
                                                                        });
                                                                    }}
                                                                    disabled={quantity === 0}
                                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <div className="w-10 text-center font-semibold text-gray-900">{quantity}</div>
                                                                <button
                                                                    onClick={() => {
                                                                        const newQty = Math.min(option.maxQuantity, quantity + 1);
                                                                        const moduleConfig = selection.config[moduleId] || [];
                                                                        let newModuleConfig;

                                                                        const existingIndex = moduleConfig.findIndex(s => s.optionId === option.id);
                                                                        if (existingIndex >= 0) {
                                                                            newModuleConfig = [...moduleConfig];
                                                                            newModuleConfig[existingIndex] = { ...newModuleConfig[existingIndex], quantity: newQty };
                                                                        } else {
                                                                            newModuleConfig = [...moduleConfig, { optionId: option.id, quantity: newQty }];
                                                                        }

                                                                        updateSelection(selectedProductIndex, {
                                                                            config: { ...selection.config, [moduleId]: newModuleConfig }
                                                                        });
                                                                    }}
                                                                    disabled={quantity >= option.maxQuantity}
                                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-8 text-sm text-gray-600">
                                <div>
                                    <span className="block text-xs uppercase tracking-wide text-gray-400">Base Price</span>
                                    <span className="font-medium">${selection.product.basePrice.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wide text-gray-400">Config Price</span>
                                    <span className="font-medium">
                                        ${(calculatePrice(selection.product, selection.config, 1) - selection.product.basePrice).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="block text-xs uppercase tracking-wide text-gray-400">Total Configured Price</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Product overview mode
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {currentSelections.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Your Selections</h3>
                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">
                            {currentSelections.length} Selected
                        </span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {currentSelections.map((selection, index) => (
                            <div key={index} className="group relative border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 border-blue-100 ring-1 ring-blue-50">
                                <div className="flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 line-clamp-1" title={selection.product.name}>
                                                {selection.product.name}
                                            </h4>
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{selection.product.description}</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedProductIndex(index)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => removeSelection(index)}
                                            className="px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    {currentSelections.length > 0 ? 'Add More Products' : 'Available Products'}
                    {userIntent && (
                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Filtered for: {configData.intents?.find(i => i.id === userIntent)?.label}
                        </span>
                    )}
                </h3>

                {availableProducts.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {availableProducts.map(product => (
                            <div key={product.id} className="flex flex-col justify-between border rounded-xl p-5 bg-white hover:shadow-lg transition-shadow duration-300">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {product.id}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Includes</div>
                                        <div className="space-y-1.5">
                                            {Object.entries(product.modules || {}).slice(0, 3).map(([moduleId, module]) => (
                                                <div key={moduleId} className="text-xs flex items-center gap-2 text-gray-700">
                                                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                                    <span className="truncate">{module.label}</span>
                                                </div>
                                            ))}
                                            {Object.keys(product.modules || {}).length > 3 && (
                                                <div className="text-xs text-blue-500 pl-3">+ {Object.keys(product.modules).length - 3} more modules</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                                    <div>
                                        <span className="block text-xs text-gray-500">Starting from</span>
                                        <span className="text-lg font-bold text-green-600">
                                            ${product.basePrice.toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => addProduct(product)}
                                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black focus:ring-4 focus:ring-gray-200 transition-all hover:scale-105"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                            <Settings className="w-full h-full" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">No products match your filter</h3>
                        <p className="text-sm text-gray-500 mt-1">Try resetting the filter or checking other categories.</p>
                        <button
                            onClick={() => window.location.reload()} // Simple way to reset intent for now, or we could pass a reset handler
                            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Reset Configuration
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSelector;
