import React from 'react';
import { Settings, Bot } from 'lucide-react';
import ProductCard from './ProductCard.js';
import ConfiguredProductCard from './ConfiguredProductCard.js';
import ModuleConfigurator from './ModuleConfigurator.js';
import { useProductSelections } from '../../hooks/useConfiguration.js';
import { useUI } from '../../store/UIContext.js';
import { formatPrice, calculatePrice } from '../../utils/priceCalculator.js';

/**
 * ProductSelector Component
 * Main component for product selection and configuration
 */
const ProductSelector = ({ category }) => {
  const {
    selections,
    availableProducts,
    categoryPrice,
    addProductToCategory,
    removeProductFromCategory,
    updateProductConfig
  } = useProductSelections(category);
  
  const {
    selectedProductIndex,
    setSelectedProductIndex,
    currentCategory,
    setCurrentCategory,
    setChatVisibility
  } = useUI();

  // If a product is selected for configuration
  if (selectedProductIndex !== null && selections[selectedProductIndex]) {
    const selection = selections[selectedProductIndex];
    
    // Get modules by category
    const modulesByCategory = {};
    Object.entries(selection.product.modules || {}).forEach(([moduleId, module]) => {
      const cat = module.category || 'hardware';
      if (!modulesByCategory[cat]) {
        modulesByCategory[cat] = [];
      }
      modulesByCategory[cat].push([moduleId, module]);
    });

    const availableCategories = Object.keys(modulesByCategory);
    if (availableCategories.length > 0 && !availableCategories.includes(currentCategory)) {
      setCurrentCategory(availableCategories[0]);
    }

    return (
      <div className="space-y-6">
        {/* Category Tabs */}
        {Object.keys(modulesByCategory).length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex border-b bg-gray-50 rounded-t-lg">
              {['hardware', 'software', 'services'].filter(cat => modulesByCategory[cat]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors capitalize border-b-2 ${
                    currentCategory === cat
                      ? 'text-blue-600 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              {modulesByCategory[currentCategory]?.map(([moduleId, module]) => (
                <ModuleConfigurator
                  key={moduleId}
                  module={module}
                  moduleId={moduleId}
                  selection={selection}
                  selectionIndex={selectedProductIndex}
                  onUpdateSelection={updateProductConfig}
                  onBack={() => setSelectedProductIndex(null)}
                />
              )) || (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No {currentCategory} modules available</p>
                  <p className="text-sm mt-1">This product doesn't have {currentCategory} components to configure.</p>
                </div>
              )}
            </div>
          </div>
        )}
          
        {/* Price Summary */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">{formatPrice(selection.product.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">{formatPrice(calculatePrice(selection.product, selection.config, 1))}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{selection.quantity}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-green-600">
                  {formatPrice(calculatePrice(selection.product, selection.config, selection.quantity))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main product selection view
  return (
    <div className="space-y-8">
      {/* Configured Products */}
      {selections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Configured Products
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {selections.length} item{selections.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {selections.map((selection, index) => (
                <ConfiguredProductCard
                  key={index}
                  selection={selection}
                  index={index}
                  onConfigure={setSelectedProductIndex}
                  onRemove={removeProductFromCategory}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Products
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose products to add to your configuration
          </p>
        </div>
        
        {availableProducts.length > 0 ? (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {availableProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddProduct={addProductToCategory}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600 mb-4">
              No products are currently available for this category.
            </p>
            <button
              onClick={() => setChatVisibility(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI for Recommendations</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
