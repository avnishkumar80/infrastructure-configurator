import React from 'react';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/priceCalculator.js';

/**
 * ModuleConfigurator Component
 * Handles configuration of individual product modules
 */
const ModuleConfigurator = ({ 
  module, 
  moduleId, 
  selection, 
  selectionIndex,
  onUpdateSelection,
  onBack
}) => {
  const moduleConfig = selection.config[moduleId];

  const updateModuleConfig = (newConfig) => {
    onUpdateSelection(selectionIndex, {
      config: { ...selection.config, [moduleId]: newConfig }
    });
  };

  const renderSingleSelect = () => {
    return (
      <div className="space-y-3">
        {module.options.map(option => (
          <div key={option.id}>
            <label className="block">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                moduleConfig === option.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-start">
                  <input
                    type="radio"
                    name={`${selectionIndex}-${moduleId}`}
                    value={option.id}
                    checked={moduleConfig === option.id}
                    onChange={(e) => updateModuleConfig(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-green-600">
                          {option.price === 0 ? 'Included' : `+${formatPrice(option.price, '')}`}
                        </div>
                      </div>
                    </div>
                    {option.details && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {option.details.map((detail, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    );
  };

  const renderMultiSelectQuantity = () => {
    return (
      <div className="space-y-4">
        {module.options.map(option => {
          const currentSelection = (moduleConfig || []).find(s => s.optionId === option.id);
          const quantity = currentSelection?.quantity || 0;
          
          const updateQuantity = (newQuantity) => {
            const moduleConfigArray = moduleConfig || [];
            let newModuleConfig;
            
            if (newQuantity === 0) {
              newModuleConfig = moduleConfigArray.filter(s => s.optionId !== option.id);
            } else {
              const existingIndex = moduleConfigArray.findIndex(s => s.optionId === option.id);
              if (existingIndex >= 0) {
                newModuleConfig = [...moduleConfigArray];
                newModuleConfig[existingIndex] = { ...newModuleConfig[existingIndex], quantity: newQuantity };
              } else {
                newModuleConfig = [...moduleConfigArray, { optionId: option.id, quantity: newQuantity }];
              }
            }
            
            updateModuleConfig(newModuleConfig);
          };
          
          return (
            <div key={option.id} className={`border rounded-lg p-4 transition-all ${
              quantity > 0 ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  {option.details && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {option.details.map((detail, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 ml-6">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatPrice(option.price)}/each
                    </div>
                    <div className="text-xs text-gray-500">
                      Max: {option.maxQuantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(Math.max(0, quantity - 1))}
                      disabled={quantity === 0}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 rounded border border-gray-300 text-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(Math.min(option.maxQuantity, quantity + 1))}
                      disabled={quantity >= option.maxQuantity}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 rounded border border-gray-300 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              {quantity > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-right text-sm font-semibold text-blue-600">
                    Subtotal: {formatPrice(option.price * quantity)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Product List</span>
        </button>
        <span className="text-sm text-gray-900 font-medium">
          {selection.product.name}
        </span>
      </div>

      {/* Module Configuration */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900">
            {module.label}
            {module.required && <span className="text-red-500 ml-1">*</span>}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
        </div>
        
        <div className="p-6">
          {module.type === 'single-select' && renderSingleSelect()}
          {module.type === 'multi-select-quantity' && renderMultiSelectQuantity()}
        </div>
      </div>
    </div>
  );
};

export default ModuleConfigurator;
