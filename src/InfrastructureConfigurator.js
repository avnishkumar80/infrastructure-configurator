import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Settings, 
  Shield, 
  Users, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus, 
  Trash2,
  Upload,
  Download,
  FileText
} from 'lucide-react';

// Default configuration data
const defaultConfigData = {
  productInfo: {
    name: "PowerStore",
    subtitle: "Infrastructure Configuration",
    salesPrice: 12450,
    currency: "USD"
  },
  steps: [
    { id: 'hardware', label: 'Hardware' },
    { id: 'software', label: 'Software' },
    { id: 'services', label: 'Services' },
    { id: 'review', label: 'Review' }
  ],
  subItems: {
    hardware: [
      { id: 'server-nodes', label: 'Server Nodes' },
      { id: 'enclosures', label: 'Enclosures' },
      { id: 'storage', label: 'Storage Units' },
      { id: 'step-review', label: 'Step Review' }
    ],
    software: [
      { id: 'operating-system', label: 'Operating System' },
      { id: 'middleware', label: 'Middleware' },
      { id: 'licensing', label: 'Licensing' },
      { id: 'step-review', label: 'Step Review' }
    ],
    services: [
      { id: 'installation', label: 'Installation' },
      { id: 'support', label: 'Support' },
      { id: 'training', label: 'Training' },
      { id: 'step-review', label: 'Step Review' }
    ]
  },
  products: {
    'server-nodes': [
      {
        id: 'node-a',
        name: 'Enterprise Node A',
        description: 'High-performance server node for enterprise workloads',
        basePrice: 1500,
        modules: {
          compute: {
            label: 'Compute Module',
            description: 'CPU and memory configuration',
            required: true,
            type: 'single-select',
            defaultSelection: 'cpu-8core-32gb',
            options: [
              { 
                id: 'cpu-8core-32gb', 
                label: '8-Core CPU + 32GB RAM', 
                description: 'Intel Xeon 8-core processor with 32GB DDR4 memory',
                price: 0,
                details: ['Intel Xeon Silver 4208', '32GB DDR4-2933', '2.1GHz Base, 3.2GHz Boost']
              },
              { 
                id: 'cpu-16core-64gb', 
                label: '16-Core CPU + 64GB RAM', 
                description: 'Intel Xeon 16-core processor with 64GB DDR4 memory',
                price: 800,
                details: ['Intel Xeon Gold 6226R', '64GB DDR4-2933', '2.9GHz Base, 3.9GHz Boost']
              }
            ]
          },
          storage: {
            label: 'Storage Configuration',
            description: 'Primary and secondary storage options',
            required: true,
            type: 'multi-select-quantity',
            defaultSelections: [{ optionId: 'ssd-500gb', quantity: 1 }],
            options: [
              { 
                id: 'ssd-500gb', 
                label: '500GB NVMe SSD', 
                description: 'High-performance NVMe solid state drive',
                price: 150,
                maxQuantity: 4,
                details: ['PCIe 4.0 x4', '7000 MB/s read', '5300 MB/s write']
              },
              { 
                id: 'hdd-2tb', 
                label: '2TB SATA HDD', 
                description: 'Traditional hard disk for bulk storage',
                price: 80,
                maxQuantity: 8,
                details: ['7200 RPM', '256MB cache', 'SATA 6Gb/s']
              }
            ]
          }
        }
      }
    ],
    'operating-system': [
      {
        id: 'enterprise-linux',
        name: 'Enterprise Linux',
        description: 'Production-ready Linux distribution with enterprise support',
        basePrice: 200,
        modules: {
          edition: {
            label: 'Edition Selection',
            description: 'Choose the Linux edition',
            required: true,
            type: 'single-select',
            defaultSelection: 'standard',
            options: [
              { 
                id: 'standard', 
                label: 'Standard Edition', 
                description: 'Basic enterprise Linux',
                price: 0,
                details: ['Community support', 'Basic packages']
              },
              { 
                id: 'advanced', 
                label: 'Advanced Edition', 
                description: 'Enhanced enterprise features',
                price: 100,
                details: ['Premium support', 'Extended packages']
              }
            ]
          }
        }
      }
    ]
  }
};

const InfrastructureConfigurator = () => {
  // Configuration data state
  const [configData, setConfigData] = useState(defaultConfigData);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // UI state
  const [currentStep, setCurrentStep] = useState('hardware');
  const [currentSubItem, setCurrentSubItem] = useState('server-nodes');
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [detailedMode, setDetailedMode] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // File upload ref
  const fileInputRef = useRef(null);
  
  // Configuration state
  const [configuration, setConfiguration] = useState({
    hardware: {
      'server-nodes': { selections: [], configured: false },
      'enclosures': { selections: [], configured: false },
      'storage': { selections: [], configured: false }
    },
    software: {
      'operating-system': { selections: [], configured: false },
      'middleware': { selections: [], configured: false },
      'licensing': { selections: [], configured: false }
    },
    services: {
      'installation': { selections: [], configured: false },
      'support': { selections: [], configured: false },
      'training': { selections: [], configured: false }
    }
  });

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsConfigLoading(true);
    setConfigError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const uploadedConfig = JSON.parse(e.target.result);
        
        if (validateConfigStructure(uploadedConfig)) {
          setConfigData(uploadedConfig);
          resetConfiguration(uploadedConfig);
          setConfigError(null);
          setUploadSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          setConfigError('Invalid configuration file structure. Please ensure the file contains all required sections: productInfo, steps, subItems, and products.');
        }
      } catch (error) {
        setConfigError('Failed to parse JSON file: ' + error.message);
      } finally {
        setIsConfigLoading(false);
        // Clear the file input
        if (event.target) {
          event.target.value = '';
        }
      }
    };

    reader.onerror = () => {
      setConfigError('Failed to read the file. Please try again.');
      setIsConfigLoading(false);
    };

    reader.readAsText(file);
  };

  // Validate configuration structure
  const validateConfigStructure = (config) => {
    if (!config || typeof config !== 'object') return false;
    
    const requiredKeys = ['productInfo', 'steps', 'subItems', 'products'];
    const hasRequiredKeys = requiredKeys.every(key => key in config);
    
    if (!hasRequiredKeys) return false;
    
    // Additional validation
    if (!config.productInfo || typeof config.productInfo !== 'object') return false;
    if (!Array.isArray(config.steps)) return false;
    if (!config.subItems || typeof config.subItems !== 'object') return false;
    if (!config.products || typeof config.products !== 'object') return false;
    
    return true;
  };

  // Reset configuration state
  const resetConfiguration = (newConfigData = configData) => {
    const newConfig = {};
    Object.keys(newConfigData?.subItems || {}).forEach(category => {
      newConfig[category] = {};
      (newConfigData.subItems[category] || []).forEach(item => {
        if (item.id !== 'step-review') {
          newConfig[category][item.id] = { selections: [], configured: false };
        }
      });
    });
    setConfiguration(newConfig);
    
    // Reset to first step and sub-item
    const firstStep = Object.keys(newConfigData?.subItems || {})[0] || 'hardware';
    const firstSubItem = newConfigData?.subItems?.[firstStep]?.[0]?.id || 'server-nodes';
    setCurrentStep(firstStep);
    setCurrentSubItem(firstSubItem);
    setSelectedProductIndex(null);
  };

  // Download current configuration
  const downloadConfiguration = () => {
    try {
      const dataStr = JSON.stringify(configData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `infrastructure-config-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      setConfigError('Failed to download configuration: ' + error.message);
    }
  };

  // Reset to default configuration
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default configuration? This will lose all current data.')) {
      setConfigData(defaultConfigData);
      resetConfiguration(defaultConfigData);
      
      // Reset UI state
      setShowSummary(false);
      setShowMessages(false);
      setShowConfigPanel(false);
      setConfigError(null);
      setUploadSuccess(false);
    }
  };

  // Validation functions
  const getValidationStatus = (category, subItem) => {
    const config = configuration[category]?.[subItem];
    if (!config || config.selections.length === 0) return 'incomplete';
    
    const hasErrors = config.selections.some(sel => !sel.configured);
    if (hasErrors) return 'error';
    
    const hasWarnings = config.selections.some(sel => 
      sel.quantity < 1 || Object.keys(sel.config || {}).length === 0
    );
    if (hasWarnings) return 'warning';
    
    return 'valid';
  };

  const getAllMessages = () => {
    const messages = [];
    
    Object.entries(configuration).forEach(([category, categoryConfig]) => {
      Object.entries(categoryConfig).forEach(([subItem, config]) => {
        if (subItem === 'step-review') return;
        
        const status = getValidationStatus(category, subItem);
        const itemName = configData.subItems?.[category]?.find(item => item.id === subItem)?.label || subItem;
        const availableProducts = configData.products?.[subItem] || [];
        
        const hasRequiredElements = availableProducts.some(product => 
          product.modules && Object.values(product.modules).some(module => module.required)
        );
        
        if (status === 'incomplete') {
          if (hasRequiredElements) {
            messages.push({
              type: 'error',
              category,
              subItem,
              title: `${itemName} required`,
              message: `This section is mandatory and needs configuration`,
              severity: 'high'
            });
          } else {
            messages.push({
              type: 'info',
              category,
              subItem,
              title: `${itemName} available`,
              message: `Optional section ready for configuration`,
              severity: 'low'
            });
          }
        } else if (status === 'error') {
          config.selections.forEach((selection, index) => {
            if (!selection.configured) {
              messages.push({
                type: 'error',
                category,
                subItem,
                title: `${selection.product.name} incomplete`,
                message: `Required configuration options are missing`,
                severity: 'high'
              });
            }
          });
        } else if (status === 'warning') {
          config.selections.forEach((selection, index) => {
            if (selection.quantity < 1) {
              messages.push({
                type: 'warning',
                category,
                subItem,
                title: `${selection.product.name} quantity issue`,
                message: `Quantity should be at least 1`,
                severity: 'medium'
              });
            }
          });
        }
      });
    });
    
    return messages;
  };

  const getOverallStatus = () => {
    const messages = getAllMessages();
    const errors = messages.filter(m => m.type === 'error').length;
    const warnings = messages.filter(m => m.type === 'warning').length;
    
    if (errors > 0) return 'error';
    if (warnings > 0) return 'warning';
    
    const requiredSectionsConfigured = Object.entries(configuration).every(([category, categoryConfig]) => {
      return Object.entries(categoryConfig).every(([subItem, config]) => {
        if (subItem === 'step-review') return true;
        
        const availableProducts = configData.products?.[subItem] || [];
        const hasRequiredElements = availableProducts.some(product => 
          product.modules && Object.values(product.modules).some(module => module.required)
        );
        
        if (hasRequiredElements) {
          return config.selections.length > 0 && config.selections.every(s => s.configured);
        }
        
        return true;
      });
    });
    
    if (!requiredSectionsConfigured) return 'incomplete';
    return 'valid';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      case 'info': return <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const calculatePrice = (product, config, quantity) => {
    let total = product.basePrice;
    
    if (config && product.modules) {
      Object.entries(product.modules).forEach(([moduleId, module]) => {
        const moduleConfig = config[moduleId];
        
        if (module.type === 'single-select' && moduleConfig) {
          const selectedOption = module.options.find(opt => opt.id === moduleConfig);
          if (selectedOption) total += selectedOption.price;
        } else if (module.type === 'multi-select-quantity' && moduleConfig) {
          moduleConfig.forEach(selection => {
            const option = module.options.find(opt => opt.id === selection.optionId);
            if (option) total += option.price * selection.quantity;
          });
        }
      });
    }
    
    return total * (quantity || 1);
  };

  const getDefaultConfig = (product) => {
    const config = {};
    if (product.modules) {
      Object.entries(product.modules).forEach(([moduleId, module]) => {
        if (module.type === 'single-select' && module.defaultSelection) {
          config[moduleId] = module.defaultSelection;
        } else if (module.type === 'multi-select-quantity' && module.defaultSelections) {
          config[moduleId] = [...module.defaultSelections];
        }
      });
    }
    return config;
  };

  const updateConfiguration = (category, subItem, selections) => {
    setConfiguration(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subItem]: {
          selections,
          configured: selections.length > 0 && selections.every(s => s.configured)
        }
      }
    }));
  };

  const updateSelectionFromSidebar = (category, subItem, selectionIndex, updates) => {
    const currentSelections = configuration[category]?.[subItem]?.selections || [];
    const updated = [...currentSelections];
    updated[selectionIndex] = { ...updated[selectionIndex], ...updates };
    updateConfiguration(category, subItem, updated);
  };

  const removeSelectionFromSidebar = (category, subItem, selectionIndex) => {
    const currentSelections = configuration[category]?.[subItem]?.selections || [];
    const updated = currentSelections.filter((_, i) => i !== selectionIndex);
    updateConfiguration(category, subItem, updated);
  };

  // Product selector component
  const ProductSelector = ({ category, subItem }) => {
    const availableProducts = configData.products[subItem] || [];
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

    // Configuration mode for specific product
    if (selectedProductIndex !== null && currentSelections[selectedProductIndex]) {
      const selection = currentSelections[selectedProductIndex];
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProductIndex(null)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span className="text-sm">← Back to Product List</span>
            </button>
            <span className="text-sm text-gray-500">
              Configuring: {selection.product.name} (#{selectedProductIndex + 1})
            </span>
          </div>

          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">{selection.product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selection.product.description}</p>
              </div>
              <button
                onClick={() => removeSelection(selectedProductIndex)}
                className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                Remove Product
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-white rounded border">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={selection.quantity}
                onChange={(e) => updateSelection(selectedProductIndex, { quantity: parseInt(e.target.value) || 1 })}
                className="w-32 p-3 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-6">
              {Object.entries(selection.product.modules || {}).map(([moduleId, module]) => (
                <div key={moduleId} className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {module.label}
                        {module.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {module.type === 'single-select' ? 'Single Select' : 'Multi Select'}
                    </span>
                  </div>

                  {module.type === 'single-select' && (
                    <div className="space-y-3">
                      {module.options.map(option => (
                        <label key={option.id} className="block">
                          <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selection.config[moduleId] === option.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`${selectedProductIndex}-${moduleId}`}
                                value={option.id}
                                checked={selection.config[moduleId] === option.id}
                                onChange={(e) => updateSelection(selectedProductIndex, {
                                  config: { ...selection.config, [moduleId]: e.target.value }
                                })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{option.label}</div>
                                    <div className="text-sm text-gray-600">{option.description}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-green-600">
                                      {option.price === 0 ? 'Included' : `+$${option.price.toLocaleString()}`}
                                    </div>
                                  </div>
                                </div>
                                {option.details && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    <div className="flex flex-wrap gap-2">
                                      {option.details.map((detail, idx) => (
                                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                                          {detail}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {module.type === 'multi-select-quantity' && (
                    <div className="space-y-4">
                      {module.options.map(option => {
                        const currentSelection = (selection.config[moduleId] || []).find(s => s.optionId === option.id);
                        const quantity = currentSelection?.quantity || 0;
                        
                        return (
                          <div key={option.id} className={`border rounded-lg p-4 transition-colors ${
                            quantity > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-600">{option.description}</div>
                                {option.details && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    <div className="flex flex-wrap gap-2">
                                      {option.details.map((detail, idx) => (
                                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                                          {detail}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-3 ml-4">
                                <div className="text-sm font-semibold text-green-600">
                                  ${option.price.toLocaleString()}/each
                                </div>
                                <div className="flex items-center space-x-2">
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
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded text-sm"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{quantity}</span>
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
                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded text-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Max: {option.maxQuantity}
                                </div>
                              </div>
                            </div>
                            {quantity > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <div className="text-right text-sm font-semibold text-blue-600">
                                  Subtotal: ${(option.price * quantity).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t bg-white rounded p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium ml-2">${selection.product.basePrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium ml-2">${calculatePrice(selection.product, selection.config, 1).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium ml-2">{selection.quantity}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    Total: ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Product overview mode
    return (
      <div className="space-y-6">
        {currentSelections.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Added Products ({currentSelections.length})</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentSelections.map((selection, index) => (
                <div key={index} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{selection.product.name}</h4>
                      <p className="text-sm text-blue-700 mt-1">Quantity: {selection.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProductIndex(index)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => removeSelection(index)}
                      className="px-3 py-2 text-red-600 border border-red-200 text-sm rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">
            {currentSelections.length > 0 ? 'Add More Products' : 'Available Products'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600 mt-1 mb-3">{product.description}</p>
                
                <div className="text-xs text-gray-500 mb-3">
                  <div className="font-medium mb-1">Default Configuration:</div>
                  <div className="space-y-1">
                    {Object.entries(product.modules || {}).map(([moduleId, module]) => {
                      if (module.type === 'single-select' && module.defaultSelection) {
                        const defaultOption = module.options.find(opt => opt.id === module.defaultSelection);
                        return (
                          <div key={moduleId} className="text-xs">
                            <span className="font-medium">{module.label}:</span> {defaultOption?.label}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-green-600">
                    From ${product.basePrice.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addProduct(product)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Reset selected product when changing sections
  useEffect(() => {
    setSelectedProductIndex(null);
  }, [currentStep, currentSubItem]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Product Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{configData.productInfo?.name || 'Product Configurator'}</h1>
                <p className="text-sm text-gray-600">{configData.productInfo?.subtitle || 'Configuration'}</p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Configuration Subtotal</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${(configData.productInfo?.salesPrice || 0).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Estimate Price</div>
                  <div className="text-lg font-semibold text-green-600">
                    ${(() => {
                      let total = 0;
                      Object.entries(configuration).forEach(([category, categoryConfig]) => {
                        Object.entries(categoryConfig).forEach(([subItem, config]) => {
                          if (config.selections) {
                            total += config.selections.reduce((sum, selection) => {
                              return sum + calculatePrice(selection.product, selection.config, selection.quantity);
                            }, 0);
                          }
                        });
                      });
                      return total.toLocaleString();
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Config</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <X className="w-4 h-4" />
                <span className="text-sm">Exit Configuration</span>
              </button>
            </div>
          </div>
          
          {/* Configuration Panel */}
          {showConfigPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Configuration Management</h3>
              
              {configError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <div className="flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>{configError}</span>
                  </div>
                </div>
              )}
              
              {uploadSuccess && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Configuration uploaded successfully!</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 text-sm">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isConfigLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isConfigLoading ? 'Loading...' : 'Upload Config'}</span>
                </button>
                
                <button
                  onClick={downloadConfiguration}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Config</span>
                </button>
                
                <button
                  onClick={resetToDefault}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                >
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
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
                    className={`py-4 px-3 border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{step.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Messages Display Only */}
            <div className="flex items-center space-x-4">
              {(() => {
                const messages = getAllMessages();
                const errors = messages.filter(m => m.type === 'error').length;
                const warnings = messages.filter(m => m.type === 'warning').length;
                const infos = messages.filter(m => m.type === 'info').length;
                
                if (errors > 0 || warnings > 0 || infos > 0) {
                  return (
                    <div className="relative">
                      <button
                        onClick={() => setShowMessages(!showMessages)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          errors > 0 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                            : warnings > 0
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                        }`}
                      >
                        {errors > 0 ? (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        ) : warnings > 0 ? (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <span>
                          {errors > 0 ? `${errors} issue${errors !== 1 ? 's' : ''}` : 
                           warnings > 0 ? `${warnings} warning${warnings !== 1 ? 's' : ''}` :
                           `${infos} info`}
                        </span>
                        {showMessages ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Compact Messages Dropdown */}
                      {showMessages && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">
                              {errors > 0 ? 'Issues to Fix' : warnings > 0 ? 'Warnings' : 'Information'}
                            </h3>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {messages
                              .sort((a, b) => {
                                const order = { error: 0, warning: 1, info: 2 };
                                return order[a.type] - order[b.type];
                              })
                              .slice(0, 6)
                              .map((message, index) => (
                              <div
                                key={index}
                                className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    message.type === 'error' ? 'bg-red-500' : 
                                    message.type === 'warning' ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  } ${message.type === 'error' ? 'animate-pulse' : ''}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {message.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {message.message}
                                    </div>
                                    {message.type !== 'info' && (
                                      <button
                                        onClick={() => {
                                          setCurrentStep(message.category);
                                          setCurrentSubItem(message.subItem);
                                          setShowMessages(false);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                                      >
                                        {message.type === 'error' ? 'Fix now →' : 'Review →'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {messages.length > 6 && (
                              <div className="p-3 text-center text-xs text-gray-500 bg-gray-50">
                                +{messages.length - 6} more messages
                              </div>
                            )}
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

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        {currentStep !== 'review' && (
          <div className="w-80 bg-white border-r shadow-sm flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1">
                {(configData.subItems?.[currentStep] || []).map((item) => {
                  const isActive = currentSubItem === item.id;
                  const status = item.id !== 'step-review' 
                    ? getValidationStatus(currentStep, item.id)
                    : 'valid';
                  const selections = configuration[currentStep]?.[item.id]?.selections || [];
                  
                  const availableProducts = configData.products[item.id] || [];
                  const isRequired = availableProducts.some(product => 
                    product.modules && Object.values(product.modules).some(module => module.required)
                  );
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setCurrentSubItem(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{item.label}</span>
                          {isRequired && item.id !== 'step-review' && (
                            <span className="text-red-400 text-sm">*</span>
                          )}
                        </div>
                        {getStatusIcon(status)}
                      </button>

                      {item.id !== 'step-review' && selections.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {selections.map((selection, index) => (
                            <div key={index} className="bg-gray-50 rounded p-2 border text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-800 truncate text-xs">
                                  {selection.product.name}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => {
                                      setCurrentSubItem(item.id);
                                      setSelectedProductIndex(index);
                                    }}
                                    className="text-blue-500 hover:text-blue-700 p-0.5"
                                    title="Configure"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeSelectionFromSidebar(currentStep, item.id, index)}
                                    className="text-red-500 hover:text-red-700 p-0.5"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-500">Qty:</span>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => {
                                        const newQty = Math.max(1, selection.quantity - 1);
                                        updateSelectionFromSidebar(currentStep, item.id, index, { quantity: newQty });
                                      }}
                                      className="w-4 h-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs"
                                    >
                                      <Minus className="w-2 h-2" />
                                    </button>
                                    <span className="font-medium w-6 text-center">{selection.quantity}</span>
                                    <button
                                      onClick={() => {
                                        updateSelectionFromSidebar(currentStep, item.id, index, { quantity: selection.quantity + 1 });
                                      }}
                                      className="w-4 h-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs"
                                    >
                                      <Plus className="w-2 h-2" />
                                    </button>
                                  </div>
                                </div>
                                <span className="text-green-600 font-medium text-xs">
                                  ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="p-3 border-t bg-gray-50">
                {(() => {
                  const categoryTotal = Object.entries(configuration[currentStep] || {}).reduce((sum, [subItem, config]) => {
                    if (config.selections) {
                      return sum + config.selections.reduce((subSum, selection) => {
                        return subSum + calculatePrice(selection.product, selection.config, selection.quantity);
                      }, 0);
                    }
                    return sum;
                  }, 0);
                  
                  if (categoryTotal > 0) {
                    return (
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-gray-700 capitalize">{currentStep} Total:</span>
                        <span className="text-green-600">${categoryTotal.toLocaleString()}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-white">
          <div className="p-6">
            <div className="max-w-none">
              {currentStep === 'review' ? (
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

                  {/* Overall Total */}
                  {(() => {
                    const grandTotal = Object.entries(configuration).reduce((total, [category, categoryConfig]) => {
                      return total + Object.entries(categoryConfig).reduce((catSum, [subItem, config]) => {
                        if (config.selections) {
                          return catSum + config.selections.reduce((subSum, selection) => {
                            return subSum + calculatePrice(selection.product, selection.config, selection.quantity);
                          }, 0);
                        }
                        return catSum;
                      }, 0);
                    }, 0);
                    
                    if (grandTotal > 0) {
                      return (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">Total Configuration Cost</h3>
                            <span className="text-2xl font-bold text-green-600">${grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-gray-600">No products configured yet</h3>
                        <p className="text-gray-500 mt-1">Start by selecting products from the Hardware, Software, or Services sections.</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <ProductSelector category={currentStep} subItem={currentSubItem} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureConfigurator;