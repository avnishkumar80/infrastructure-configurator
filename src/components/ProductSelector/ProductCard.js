import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { formatPrice } from '../../utils/priceCalculator.js';

/**
 * ProductCard Component
 * Displays an individual product option with add button
 */
const ProductCard = ({ 
  product, 
  onAddProduct 
}) => {
  const handleAddClick = () => {
    onAddProduct(product);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
              {product.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>
          <div className="ml-4 text-right">
            <div className="text-xs text-gray-500">Starting at</div>
            <div className="text-xl font-bold text-green-600">
              {formatPrice(product.basePrice)}
            </div>
          </div>
        </div>
        
        {/* Default Configuration Preview */}
        {product.modules && Object.keys(product.modules).length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-2">Default Configuration:</div>
            <div className="space-y-1">
              {Object.entries(product.modules).slice(0, 2).map(([moduleId, module]) => {
                if (module.type === 'single-select' && module.defaultSelection) {
                  const defaultOption = module.options.find(opt => opt.id === module.defaultSelection);
                  return (
                    <div key={moduleId} className="flex justify-between text-xs">
                      <span className="text-gray-600">{module.label}:</span>
                      <span className="text-gray-900 font-medium">{defaultOption?.label}</span>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
              {Object.keys(product.modules).length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{Object.keys(product.modules).length - 2} more options to configure
                </div>
              )}
            </div>
          </div>
        )}
        
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm group-hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add to Configuration</span>
        </button>
      </div>
      
      {/* Hover accent */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );
};

export default ProductCard;
