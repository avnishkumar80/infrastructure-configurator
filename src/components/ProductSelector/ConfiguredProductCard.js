import React from 'react';
import { Settings } from 'lucide-react';
import { formatPrice } from '../../utils/priceCalculator.js';

/**
 * ConfiguredProductCard Component
 * Displays a configured product with edit/remove options
 */
const ConfiguredProductCard = ({ 
  selection, 
  index,
  onConfigure, 
  onRemove 
}) => {
  const handleConfigureClick = () => {
    onConfigure(index);
  };

  const handleRemoveClick = () => {
    onRemove(index);
  };

  const totalPrice = formatPrice(
    (selection.product.basePrice || 0) * (selection.quantity || 1)
  );

  return (
    <div className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">{selection.product.name}</h4>
              <p className="text-sm text-blue-700">Quantity: {selection.quantity}</p>
            </div>
          </div>
          
          {/* Configuration Preview */}
          <div className="grid grid-cols-2 gap-3 text-xs text-blue-800 mb-4">
            {Object.entries(selection.product.modules || {}).slice(0, 2).map(([moduleId, module]) => {
              const moduleConfig = selection.config[moduleId];
              let displayValue = 'Not configured';
              
              if (module.type === 'single-select' && moduleConfig) {
                const option = module.options.find(opt => opt.id === moduleConfig);
                displayValue = option?.label || 'Unknown';
              } else if (module.type === 'multi-select-quantity' && moduleConfig) {
                const selections = moduleConfig;
                displayValue = `${selections.length} option${selections.length !== 1 ? 's' : ''}`;
              }
              
              return (
                <div key={moduleId} className="bg-white/50 rounded px-2 py-1">
                  <div className="font-medium">{module.label}:</div>
                  <div className="truncate">{displayValue}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3 ml-6">
          <div className="text-right">
            <div className="text-xs text-gray-600">Total Price</div>
            <div className="text-lg font-bold text-green-600">
              {totalPrice}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleConfigureClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              Configure
            </button>
            <button
              onClick={handleRemoveClick}
              className="px-4 py-2 text-gray-600 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguredProductCard;
