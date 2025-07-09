import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Plus, 
  Trash2,
  Upload,
  Download,
  FileText,
  Bot,
  Send,
  Maximize2,
  Minimize2,
  GitCompare,
  ArrowRight,
  List
} from 'lucide-react';

const AIConfigurationAssistant = ({ 
  configData, 
  configuration, 
  onApplyConfiguration, 
  onNavigateToStep 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI Configuration Assistant. I can help you build the perfect infrastructure setup. Try asking me something like 'I need a setup for a web application with 100 users' or 'What's the best storage configuration for my database?'",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const mockAIResponses = {
    'web application': {
      response: "For a web application, I recommend starting with our Enterprise Node A with 16-Core CPU + 64GB RAM for better performance. You'll also want SSD storage for faster response times. Would you like me to configure this for you?",
      suggestion: {
        category: 'node',
        productId: 'node-a',
        config: {
          compute: 'cpu-16core-64gb',
          storage: [{ optionId: 'ssd-500gb', quantity: 2 }]
        }
      }
    },
    'database': {
      response: "For database workloads, I recommend prioritizing storage performance and memory. The 16-Core CPU with 64GB RAM is ideal, and I suggest multiple NVMe SSDs for your database files. Shall I set this up?",
      suggestion: {
        category: 'node',
        productId: 'node-a',
        config: {
          compute: 'cpu-16core-64gb',
          storage: [{ optionId: 'ssd-500gb', quantity: 4 }]
        }
      }
    },
    'budget': {
      response: "I can help you optimize for cost! The standard 8-Core CPU with 32GB RAM provides excellent value, and you can start with basic storage and scale up later. This configuration starts at $1,650. Want me to configure this budget-friendly option?",
      suggestion: {
        category: 'node',
        productId: 'node-a',
        config: {
          compute: 'cpu-8core-32gb',
          storage: [{ optionId: 'ssd-500gb', quantity: 1 }]
        }
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, data] of Object.entries(mockAIResponses)) {
      if (lowerMessage.includes(keyword)) {
        return data;
      }
    }
    
    if (lowerMessage.includes('help')) {
      return {
        response: "I can help you with product recommendations, budget optimization, performance tuning, and configuration setup. Just describe what you're building!"
      };
    }
    
    return {
      response: "I understand you're asking about your infrastructure setup. Could you provide more details about your specific needs?"
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        suggestion: aiResponse.suggestion
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleApplySuggestion = (suggestion) => {
    if (onApplyConfiguration && suggestion) {
      onApplyConfiguration(suggestion);
      
      const confirmMessage = {
        id: Date.now(),
        type: 'assistant',
        content: "✅ Great! I've applied that configuration for you. You can see the changes in your configuration and continue customizing from there.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      
      if (onNavigateToStep) {
        onNavigateToStep(suggestion.category);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ${
      isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Configuration Helper</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-blue-100 rounded"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: isExpanded ? '480px' : '240px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>
              {message.suggestion && (
                <button
                  onClick={() => handleApplySuggestion(message.suggestion)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Apply This Configuration
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your infrastructure needs..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const defaultConfigData = {
  productInfo: {
    name: "PowerStore",
    subtitle: "Infrastructure Configuration",
    salesPrice: 12450,
    currency: "USD"
  },
  steps: [
    { id: 'node', label: 'Node', required: true },
    { id: 'chassis', label: 'Chassis', required: true },
    { id: 'optional-software', label: 'Optional Software', required: false },
    { id: 'required-software', label: 'Required Software', required: true },
    { id: 'services', label: 'Services', required: false }
  ],
  categories: ['hardware', 'software', 'services'],
  products: {
    'node': [
      {
        id: 'node-a',
        name: 'Enterprise Node A',
        description: 'High-performance server node for enterprise workloads',
        basePrice: 1500,
        modules: {
          compute: {
            label: 'Compute Module',
            description: 'CPU and memory configuration',
            category: 'hardware',
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
            category: 'hardware',
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
          },
          'management-software': {
            label: 'Management Software',
            description: 'Node management and monitoring software',
            category: 'software',
            required: false,
            type: 'single-select',
            defaultSelection: 'basic-mgmt',
            options: [
              { 
                id: 'basic-mgmt', 
                label: 'Basic Management', 
                description: 'Standard node management tools',
                price: 0,
                details: ['Web interface', 'Basic monitoring', 'SNMP support']
              },
              { 
                id: 'advanced-mgmt', 
                label: 'Advanced Management', 
                description: 'Enhanced management with automation',
                price: 200,
                details: ['Advanced analytics', 'Automation tools', 'API access']
              }
            ]
          },
          'installation-service': {
            label: 'Installation Service',
            description: 'Professional installation and setup',
            category: 'services',
            required: false,
            type: 'single-select',
            options: [
              { 
                id: 'self-install', 
                label: 'Self Installation', 
                description: 'Install yourself with documentation',
                price: 0,
                details: ['Installation guide', 'Email support', 'Video tutorials']
              },
              { 
                id: 'professional-install', 
                label: 'Professional Installation', 
                description: 'On-site professional installation',
                price: 500,
                details: ['On-site technician', 'Configuration setup', '2-year warranty']
              }
            ]
          }
        }
      }
    ],
    'chassis': [
      {
        id: 'chassis-standard',
        name: 'Standard Chassis',
        description: '2U rack-mountable chassis',
        basePrice: 800,
        modules: {
          'power-supply': {
            label: 'Power Supply',
            description: 'Redundant power supply configuration',
            category: 'hardware',
            required: true,
            type: 'single-select',
            defaultSelection: 'dual-psu-500w',
            options: [
              { 
                id: 'dual-psu-500w', 
                label: 'Dual 500W PSU', 
                description: 'Redundant 500W power supplies',
                price: 0,
                details: ['Hot-swappable', '80+ Gold certified', 'Redundant operation']
              },
              { 
                id: 'dual-psu-750w', 
                label: 'Dual 750W PSU', 
                description: 'High-capacity redundant power supplies',
                price: 300,
                details: ['Hot-swappable', '80+ Platinum certified', 'Higher efficiency']
              }
            ]
          }
        }
      }
    ],
    'optional-software': [],
    'required-software': [
      {
        id: 'enterprise-linux',
        name: 'Enterprise Linux',
        description: 'Production-ready Linux distribution with enterprise support',
        basePrice: 200,
        modules: {
          edition: {
            label: 'OS Edition',
            description: 'Choose the Linux edition',
            category: 'software',
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
    ],
    'services': []
  }
};

const InfrastructureConfigurator = () => {
  const [configData, setConfigData] = useState(defaultConfigData);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const [currentStep, setCurrentStep] = useState('node');
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('hardware');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [expandedSummaryItems, setExpandedSummaryItems] = useState({});
  
  const fileInputRef = useRef(null);
  
  const [configuration, setConfiguration] = useState({
    node: { selections: [], configured: false },
    chassis: { selections: [], configured: false },
    'optional-software': { selections: [], configured: false },
    'required-software': { selections: [], configured: false },
    services: { selections: [], configured: false }
  });

  const getValidationStatus = (category) => {
    const config = configuration[category];
    if (!config || config.selections.length === 0) return 'incomplete';
    
    let hasErrors = false;
    let hasWarnings = false;
    
    // Check each selection for validation issues
    config.selections.forEach(selection => {
      const productValidation = validateProductConfiguration(selection);
      if (productValidation.errors.length > 0) {
        hasErrors = true;
      }
      if (productValidation.warnings.length > 0) {
        hasWarnings = true;
      }
    });
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    
    return 'valid';
  };

  const getAllMessages = () => {
    const messages = [];
    
    Object.entries(configuration).forEach(([category, config]) => {
      const status = getValidationStatus(category);
      const stepConfig = configData.steps?.find(step => step.id === category);
      const stepName = stepConfig?.label || category;
      
      if (status === 'incomplete') {
        if (stepConfig?.required) {
          messages.push({
            type: 'error',
            category,
            title: `${stepName} required`,
            message: `This section is mandatory and needs configuration`,
            severity: 'high'
          });
        } else {
          messages.push({
            type: 'info',
            category,
            title: `${stepName} available`,
            message: `Optional section ready for configuration`,
            severity: 'low'
          });
        }
      }
    });
    
    return messages;
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

  const updateConfiguration = (category, selections) => {
    setConfiguration(prev => ({
      ...prev,
      [category]: {
        selections,
        configured: selections.length > 0 && selections.every(s => s.configured)
      }
    }));
  };

  const handleAIApplyConfiguration = (suggestion) => {
    const { category, productId, config } = suggestion;
    
    const product = configData.products[category]?.find(p => p.id === productId);
    if (!product) return;

    const newSelection = {
      productId: product.id,
      product,
      config: config,
      quantity: 1,
      configured: true
    };

    const currentSelections = configuration[category]?.selections || [];
    const newSelections = [...currentSelections, newSelection];
    
    updateConfiguration(category, newSelections);
  };

  const handleAINavigateToStep = (category) => {
    setCurrentStep(category);
  };

  const removeSelectionFromSidebar = (category, selectionIndex) => {
    const currentSelections = configuration[category]?.selections || [];
    const updated = currentSelections.filter((_, i) => i !== selectionIndex);
    updateConfiguration(category, updated);
  };

  const validateModuleConfiguration = (product, config, moduleId, module) => {
    const errors = [];
    const warnings = [];
    
    // Check if required module is configured
    if (module.required && (!config[moduleId] || (Array.isArray(config[moduleId]) && config[moduleId].length === 0))) {
      errors.push(`${module.label} is required and must be configured`);
    }
    
    // Validate single-select modules
    if (module.type === 'single-select' && config[moduleId]) {
      const selectedOption = module.options.find(opt => opt.id === config[moduleId]);
      if (!selectedOption) {
        errors.push(`Invalid selection for ${module.label}`);
      }
    }
    
    // Validate multi-select-quantity modules
    if (module.type === 'multi-select-quantity' && config[moduleId]) {
      const selections = config[moduleId] || [];
      selections.forEach(selection => {
        const option = module.options.find(opt => opt.id === selection.optionId);
        if (!option) {
          errors.push(`Invalid option selected in ${module.label}`);
        } else {
          if (selection.quantity > option.maxQuantity) {
            errors.push(`Quantity ${selection.quantity} exceeds maximum ${option.maxQuantity} for ${option.label}`);
          }
          if (selection.quantity < 1) {
            warnings.push(`Quantity should be at least 1 for ${option.label}`);
          }
        }
      });
      
      // Check if at least one item is selected for required modules
      if (module.required && selections.length === 0) {
        errors.push(`At least one ${module.label} option must be selected`);
      }
    }
    
    return { errors, warnings };
  };

  const validateProductConfiguration = (selection) => {
    const errors = [];
    const warnings = [];
    
    if (!selection.product || !selection.product.modules) {
      return { errors, warnings };
    }
    
    Object.entries(selection.product.modules).forEach(([moduleId, module]) => {
      const moduleValidation = validateModuleConfiguration(selection.product, selection.config, moduleId, module);
      errors.push(...moduleValidation.errors);
      warnings.push(...moduleValidation.warnings);
    });
    
    // Check quantity
    if (selection.quantity < 1) {
      errors.push('Product quantity must be at least 1');
    }
    
    return { errors, warnings };
  };

  const getInlineValidation = (product, config, moduleId, module) => {
    return validateModuleConfiguration(product, config, moduleId, module);
  };

  const InlineValidationMessage = ({ errors, warnings }) => {
    if (errors.length === 0 && warnings.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        {errors.map((error, index) => (
          <div key={`error-${index}`} className="flex items-center space-x-2 text-red-600 text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ))}
        {warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="flex items-center space-x-2 text-yellow-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}
      </div>
    );
  };

  const getConfigurationDifferences = (product, currentConfig) => {
    const defaultConfig = getDefaultConfig(product);
    const differences = [];
    
    // Compare each module
    Object.entries(product.modules || {}).forEach(([moduleId, module]) => {
      const currentValue = currentConfig[moduleId];
      const defaultValue = defaultConfig[moduleId];
      
      if (module.type === 'single-select') {
        if (currentValue !== defaultValue) {
          const currentOption = module.options.find(opt => opt.id === currentValue);
          const defaultOption = module.options.find(opt => opt.id === defaultValue);
          
          differences.push({
            moduleId,
            moduleName: module.label,
            type: 'single-select',
            defaultValue: defaultOption?.label || 'None',
            currentValue: currentOption?.label || 'None',
            defaultPrice: defaultOption?.price || 0,
            currentPrice: currentOption?.price || 0,
            priceDifference: (currentOption?.price || 0) - (defaultOption?.price || 0)
          });
        }
      } else if (module.type === 'multi-select-quantity') {
        const currentSelections = currentValue || [];
        const defaultSelections = defaultValue || [];
        
        // Check if quantities or selections are different
        const currentMap = new Map(currentSelections.map(s => [s.optionId, s.quantity]));
        const defaultMap = new Map(defaultSelections.map(s => [s.optionId, s.quantity]));
        
        let isDifferent = false;
        let currentTotal = 0;
        let defaultTotal = 0;
        
        // Calculate totals and check differences
        module.options.forEach(option => {
          const currentQty = currentMap.get(option.id) || 0;
          const defaultQty = defaultMap.get(option.id) || 0;
          
          currentTotal += currentQty * option.price;
          defaultTotal += defaultQty * option.price;
          
          if (currentQty !== defaultQty) {
            isDifferent = true;
          }
        });
        
        if (isDifferent) {
          differences.push({
            moduleId,
            moduleName: module.label,
            type: 'multi-select-quantity',
            defaultValue: `${defaultSelections.length} items`,
            currentValue: `${currentSelections.length} items`,
            defaultPrice: defaultTotal,
            currentPrice: currentTotal,
            priceDifference: currentTotal - defaultTotal,
            details: {
              current: currentSelections,
              default: defaultSelections,
              options: module.options
            }
          });
        }
      }
    });
    
    return differences;
  };

  const openCompareModal = (selection) => {
    const differences = getConfigurationDifferences(selection.product, selection.config);
    const defaultConfig = getDefaultConfig(selection.product);
    const defaultPrice = calculatePrice(selection.product, defaultConfig, selection.quantity);
    const currentPrice = calculatePrice(selection.product, selection.config, selection.quantity);
    
    setCompareData({
      product: selection.product,
      currentConfig: selection.config,
      defaultConfig,
      differences,
      defaultPrice,
      currentPrice,
      priceDifference: currentPrice - defaultPrice,
      quantity: selection.quantity
    });
    setShowCompareModal(true);
  };

  const CompareModal = () => {
    if (!showCompareModal || !compareData) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GitCompare className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Configuration Comparison</h2>
                  <p className="text-sm text-gray-600">{compareData.product.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Price Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-500">Default Price</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${compareData.defaultPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Current Price</div>
                <div className="text-lg font-semibold text-blue-600">
                  ${compareData.currentPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Price Difference</div>
                <div className={`text-lg font-semibold ${
                  compareData.priceDifference > 0 ? 'text-red-600' : 
                  compareData.priceDifference < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {compareData.priceDifference > 0 ? '+' : ''}${compareData.priceDifference.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Differences */}
            {compareData.differences.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Changes</h3>
                {compareData.differences.map((diff, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{diff.moduleName}</h4>
                      <div className={`text-sm font-medium ${
                        diff.priceDifference > 0 ? 'text-red-600' : 
                        diff.priceDifference < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {diff.priceDifference > 0 ? '+' : ''}${diff.priceDifference.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700 mb-1">Default</div>
                        <div className="text-gray-900">{diff.defaultValue}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${diff.defaultPrice.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="font-medium text-blue-700 mb-1">Current</div>
                        <div className="text-blue-900">{diff.currentValue}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          ${diff.currentPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed breakdown for multi-select */}
                    {diff.type === 'multi-select-quantity' && diff.details && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">Detailed Breakdown:</div>
                        <div className="space-y-2">
                          {diff.details.options.map(option => {
                            const currentQty = diff.details.current.find(s => s.optionId === option.id)?.quantity || 0;
                            const defaultQty = diff.details.default.find(s => s.optionId === option.id)?.quantity || 0;
                            
                            if (currentQty !== defaultQty) {
                              return (
                                <div key={option.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                  <span>{option.label}</span>
                                  <span className="flex items-center space-x-2">
                                    <span className="text-gray-600">{defaultQty}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span className="text-blue-600 font-medium">{currentQty}</span>
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GitCompare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No changes from default configuration</p>
                <p className="text-sm">This product is using the default settings.</p>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowCompareModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConfigurationSummary = () => {
    if (!showSummaryModal) return null;

    const toggleExpanded = (key) => {
      setExpandedSummaryItems(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const generateSummaryData = () => {
      const summaryData = [];
      let grandTotal = 0;

      configData.steps.forEach(step => {
        const stepConfig = configuration[step.id];
        if (stepConfig && stepConfig.selections.length > 0) {
          let stepTotal = 0;
          const stepData = {
            id: step.id,
            label: step.label,
            required: step.required,
            products: []
          };

          stepConfig.selections.forEach((selection, selectionIndex) => {
            const productTotal = calculatePrice(selection.product, selection.config, selection.quantity);
            stepTotal += productTotal;

            const productData = {
              id: `${step.id}-${selectionIndex}`,
              name: selection.product.name,
              description: selection.product.description,
              quantity: selection.quantity,
              basePrice: selection.product.basePrice,
              totalPrice: productTotal,
              modules: []
            };

            // Group modules by category
            const modulesByCategory = {};
            Object.entries(selection.product.modules || {}).forEach(([moduleId, module]) => {
              const cat = module.category || 'hardware';
              if (!modulesByCategory[cat]) {
                modulesByCategory[cat] = [];
              }
              modulesByCategory[cat].push([moduleId, module]);
            });

            // Add module data
            Object.entries(modulesByCategory).forEach(([category, modules]) => {
              modules.forEach(([moduleId, module]) => {
                const moduleConfig = selection.config[moduleId];
                let modulePrice = 0;
                let configValue = '';

                if (module.type === 'single-select' && moduleConfig) {
                  const selectedOption = module.options.find(opt => opt.id === moduleConfig);
                  if (selectedOption) {
                    modulePrice = selectedOption.price;
                    configValue = selectedOption.label;
                  }
                } else if (module.type === 'multi-select-quantity' && moduleConfig) {
                  const items = [];
                  moduleConfig.forEach(sel => {
                    const option = module.options.find(opt => opt.id === sel.optionId);
                    if (option) {
                      modulePrice += option.price * sel.quantity;
                      items.push(`${sel.quantity}x ${option.label}`);
                    }
                  });
                  configValue = items.length > 0 ? items.join(', ') : 'None';
                }

                productData.modules.push({
                  id: moduleId,
                  label: module.label,
                  category,
                  required: module.required,
                  type: module.type,
                  value: configValue || 'Not configured',
                  price: modulePrice,
                  details: module.type === 'multi-select-quantity' ? moduleConfig : null
                });
              });
            });

            stepData.products.push(productData);
          });

          stepData.totalPrice = stepTotal;
          grandTotal += stepTotal;
          summaryData.push(stepData);
        }
      });

      return { summaryData, grandTotal };
    };

    const { summaryData, grandTotal } = generateSummaryData();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <List className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Configuration Summary</h2>
                  <p className="text-sm text-gray-600">Complete overview of your infrastructure setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {summaryData.length > 0 ? (
              <div className="space-y-6">
                {summaryData.map((step) => (
                  <div key={step.id} className="border rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleExpanded(step.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {expandedSummaryItems[step.id] ? 
                            <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          }
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                              <span>{step.label}</span>
                              {step.required && <span className="text-red-500 text-sm">*</span>}
                            </h3>
                            <p className="text-sm text-gray-600">{step.products.length} product{step.products.length !== 1 ? 's' : ''} configured</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-green-600">
                            ${step.totalPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedSummaryItems[step.id] && (
                      <div className="p-4 space-y-4">
                        {step.products.map((product) => (
                          <div key={product.id} className="border rounded-lg overflow-hidden">
                            <div 
                              className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => toggleExpanded(product.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {expandedSummaryItems[product.id] ? 
                                    <ChevronDown className="w-4 h-4 text-blue-600" /> : 
                                    <ChevronRight className="w-4 h-4 text-blue-600" />
                                  }
                                  <div>
                                    <h4 className="font-medium text-blue-900">{product.name}</h4>
                                    <p className="text-sm text-blue-700">
                                      Quantity: {product.quantity} | Base: ${product.basePrice.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600">
                                    ${product.totalPrice.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {expandedSummaryItems[product.id] && (
                              <div className="p-4 bg-white">
                                <div className="space-y-3">
                                  {/* Group modules by category */}
                                  {['hardware', 'software', 'services'].map(category => {
                                    const categoryModules = product.modules.filter(m => m.category === category);
                                    if (categoryModules.length === 0) return null;

                                    return (
                                      <div key={category} className="space-y-2">
                                        <h5 className="font-medium text-gray-700 capitalize text-sm border-b border-gray-200 pb-1">
                                          {category} Configuration
                                        </h5>
                                        <div className="space-y-2 ml-4">
                                          {categoryModules.map((module) => (
                                            <div key={module.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                              <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium text-gray-800 text-sm">{module.label}</span>
                                                  {module.required && <span className="text-red-400 text-xs">*</span>}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                  {module.value}
                                                </div>
                                                {module.details && module.details.length > 0 && (
                                                  <div className="text-xs text-gray-500 mt-1">
                                                    {module.details.map(detail => {
                                                      const option = product.modules.find(m => m.id === module.id);
                                                      return `${detail.quantity}x item`;
                                                    }).join(', ')}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                <div className="text-sm font-medium text-green-600">
                                                  {module.price === 0 ? 'Included' : `${module.price.toLocaleString()}`}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <List className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Configuration Yet</h3>
                <p>Start adding products to see your configuration summary here.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Configuration Cost</h3>
                <p className="text-sm text-gray-600">
                  {summaryData.length} step{summaryData.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${grandTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          // Update the base config data
          setConfigData(uploadedConfig);
          
          // If the uploaded config has saved selections, restore them
          if (uploadedConfig.currentConfiguration) {
            setConfiguration(uploadedConfig.currentConfiguration);
          } else {
            // Reset to empty configuration
            resetConfiguration(uploadedConfig);
          }
          
          setConfigError(null);
          setUploadSuccess(true);
          
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          setConfigError('Invalid configuration file structure. Please upload a valid JSON configuration file.');
        }
      } catch (error) {
        setConfigError('Failed to parse JSON file: ' + error.message);
      } finally {
        setIsConfigLoading(false);
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

  const validateConfigStructure = (config) => {
    if (!config || typeof config !== 'object') return false;
    
    const requiredKeys = ['productInfo', 'steps', 'products'];
    const hasRequiredKeys = requiredKeys.every(key => key in config);
    
    if (!hasRequiredKeys) return false;
    
    if (!config.productInfo || typeof config.productInfo !== 'object') return false;
    if (!Array.isArray(config.steps)) return false;
    if (!config.products || typeof config.products !== 'object') return false;
    
    return true;
  };

  const resetConfiguration = (newConfigData = configData) => {
    const newConfig = {};
    if (newConfigData.steps) {
      newConfigData.steps.forEach(step => {
        newConfig[step.id] = { selections: [], configured: false };
      });
    }
    setConfiguration(newConfig);
    
    const firstStep = newConfigData?.steps?.[0]?.id || 'node';
    setCurrentStep(firstStep);
    setSelectedProductIndex(null);
    setCurrentCategory('hardware');
  };

  const downloadConfiguration = () => {
    try {
      // Create a complete configuration object with both structure and current selections
      const fullConfig = {
        ...configData,
        currentConfiguration: configuration,
        timestamp: new Date().toISOString(),
        totalPrice: (() => {
          let total = 0;
          Object.entries(configuration).forEach(([category, config]) => {
            if (config.selections) {
              total += config.selections.reduce((sum, selection) => {
                return sum + calculatePrice(selection.product, selection.config, selection.quantity);
              }, 0);
            }
          });
          return total;
        })()
      };
      
      const dataStr = JSON.stringify(fullConfig, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const exportFileDefaultName = `infrastructure-config-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = exportFileDefaultName;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setConfigError('Failed to download configuration: ' + error.message);
      setTimeout(() => setConfigError(null), 5000);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default configuration? This will lose all current selections and data.')) {
      // Reset everything to initial state
      setConfigData(defaultConfigData);
      setConfiguration({
        node: { selections: [], configured: false },
        chassis: { selections: [], configured: false },
        'optional-software': { selections: [], configured: false },
        'required-software': { selections: [], configured: false },
        services: { selections: [], configured: false }
      });
      
      setCurrentStep('node');
      setSelectedProductIndex(null);
      setCurrentCategory('hardware');
      setShowMessages(false);
      setShowConfigPanel(false);
      setConfigError(null);
      setUploadSuccess(false);
      
      // Show confirmation
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const ProductSelector = ({ category }) => {
    const availableProducts = configData.products[category] || [];
    const currentSelections = configuration[category]?.selections || [];

    const addProduct = (product) => {
      const newSelection = {
        productId: product.id,
        product,
        config: getDefaultConfig(product),
        quantity: 1,
        configured: true
      };
      const newSelections = [...currentSelections, newSelection];
      updateConfiguration(category, newSelections);
      setSelectedProductIndex(newSelections.length - 1);
    };

    const updateSelection = (index, updates) => {
      const updated = [...currentSelections];
      updated[index] = { ...updated[index], ...updates };
      updateConfiguration(category, updated);
    };

    const removeSelection = (index) => {
      const updated = currentSelections.filter((_, i) => i !== index);
      updateConfiguration(category, updated);
      if (selectedProductIndex === index) {
        setSelectedProductIndex(null);
      } else if (selectedProductIndex > index) {
        setSelectedProductIndex(selectedProductIndex - 1);
      }
    };

    if (selectedProductIndex !== null && currentSelections[selectedProductIndex]) {
      const selection = currentSelections[selectedProductIndex];
      
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedProductIndex(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Back to Product List
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-900 font-medium">
                {selection.product.name}
              </span>
            </div>
          </div>

          {Object.keys(modulesByCategory).length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="flex border-b bg-gray-50 rounded-t-lg">
                {(configData.categories || ['hardware', 'software', 'services']).filter(cat => modulesByCategory[cat]).map(cat => (
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
                <div className="space-y-8">
                  {modulesByCategory[currentCategory]?.map(([moduleId, module]) => (
                    <div key={moduleId} className="space-y-4">
                      <div className="border-b border-gray-200 pb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {module.label}
                          {module.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>

                      <div className="space-y-3">
                        {module.type === 'single-select' && module.options.map(option => {
                          const validation = getInlineValidation(selection.product, selection.config, moduleId, module);
                          
                          return (
                            <div key={option.id}>
                              <label className="block">
                                <div className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                                  selection.config[moduleId] === option.id 
                                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                    : validation.errors.length > 0
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                  <div className="flex items-start">
                                    <input
                                      type="radio"
                                      name={`${selectedProductIndex}-${moduleId}`}
                                      value={option.id}
                                      checked={selection.config[moduleId] === option.id}
                                      onChange={(e) => updateSelection(selectedProductIndex, {
                                        config: { ...selection.config, [moduleId]: e.target.value }
                                      })}
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
                                            {option.price === 0 ? 'Included' : `+${option.price.toLocaleString()}`}
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
                              {selection.config[moduleId] === option.id && (
                                <InlineValidationMessage errors={validation.errors} warnings={validation.warnings} />
                              )}
                            </div>
                          );
                        })}

                        {module.type === 'multi-select-quantity' && (
                          <div className="space-y-4">
                            {module.options.map(option => {
                              const currentSelection = (selection.config[moduleId] || []).find(s => s.optionId === option.id);
                              const quantity = currentSelection?.quantity || 0;
                              const validation = getInlineValidation(selection.product, selection.config, moduleId, module);
                              
                              return (
                                <div key={option.id} className={`border rounded-lg p-4 transition-all ${
                                  quantity > 0 ? 'border-blue-500 bg-blue-50 shadow-sm' : 
                                  validation.errors.length > 0 ? 'border-red-300 bg-red-50' :
                                  'border-gray-200'
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
                                          ${option.price.toLocaleString()}/each
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Max: {option.maxQuantity}
                                        </div>
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
                                          className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 rounded border border-gray-300 text-sm"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-medium text-lg">{quantity}</span>
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
                                        Subtotal: ${(option.price * quantity).toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Show validation for this specific option */}
                                  {quantity > option.maxQuantity && (
                                    <div className="mt-2">
                                      <InlineValidationMessage 
                                        errors={[`Quantity ${quantity} exceeds maximum ${option.maxQuantity}`]} 
                                        warnings={[]} 
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Show overall module validation */}
                            <InlineValidationMessage 
                              errors={getInlineValidation(selection.product, selection.config, moduleId, module).errors} 
                              warnings={getInlineValidation(selection.product, selection.config, moduleId, module).warnings} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No {currentCategory} modules available</p>
                      <p className="text-sm mt-1">This product doesn't have {currentCategory} components to configure.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
            
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">${selection.product.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">${calculatePrice(selection.product, selection.config, 1).toLocaleString()}</span>
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
                    ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
                      onClick={() => openCompareModal(selection)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 text-sm rounded hover:bg-gray-200 transition-colors"
                      title="Compare with default"
                    >
                      <GitCompare className="w-4 h-4" />
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
          {availableProducts.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No products available for this category yet.</p>
              <p className="text-sm mt-1">Configure your system using the upload feature or contact support.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    setSelectedProductIndex(null);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
                      Object.entries(configuration).forEach(([category, config]) => {
                        if (config.selections) {
                          total += config.selections.reduce((sum, selection) => {
                            return sum + calculatePrice(selection.product, selection.config, selection.quantity);
                          }, 0);
                        }
                      });
                      return total.toLocaleString();
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
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

                      {showMessages && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">
                              {errors > 0 ? 'Issues to Fix' : warnings > 0 ? 'Warnings' : 'Information'}
                            </h3>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {messages.slice(0, 6).map((message, index) => (
                              <div
                                key={index}
                                className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    message.type === 'error' ? 'bg-red-500' : 
                                    message.type === 'warning' ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  }`} />
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
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowSummaryModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">Summary</span>
                </button>
                
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
          </div>
          
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
                    <span>Operation completed successfully!</span>
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

      <div className="flex-1 flex">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Configuration Steps</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your infrastructure components</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {(configData.steps || []).map((step, stepIndex) => {
                const isActive = currentStep === step.id;
                const stepSelections = configuration[step.id]?.selections || [];
                const stepStatus = getValidationStatus(step.id);
                
                return (
                  <div key={step.id} className={`rounded-lg border transition-colors ${
                    isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}>
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : stepSelections.length > 0
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {stepIndex + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                isActive ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {step.label}
                              </span>
                              {step.required && (
                                <span className="text-red-400 text-xs">*</span>
                              )}
                            </div>
                            {stepSelections.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {stepSelections.length} item{stepSelections.length !== 1 ? 's' : ''} configured
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(stepStatus)}
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            isActive ? 'text-blue-600 rotate-90' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    </button>

                    {isActive && stepSelections.length > 0 && (
                      <div className="px-4 pb-4">
                        <div className="space-y-2 mt-2">
                          {stepSelections.map((selection, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {selection.product.name}
                                  </h4>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Qty: {selection.quantity}
                                    </span>
                                    <span className="text-xs font-medium text-green-600">
                                      ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => setSelectedProductIndex(index)}
                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                                    title="Configure"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => openCompareModal(selection)}
                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Compare with default"
                                  >
                                    <GitCompare className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeSelectionFromSidebar(step.id, index)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {(() => {
              const categoryTotal = configuration[currentStep]?.selections?.reduce((sum, selection) => {
                return sum + calculatePrice(selection.product, selection.config, selection.quantity);
              }, 0) || 0;
              
              if (categoryTotal > 0) {
                return (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {currentStep} Total
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${categoryTotal.toLocaleString()}
                    </div>
                  </div>
                );
              }
              return (
                <div className="text-center text-sm text-gray-500">
                  No items configured yet
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex-1 bg-white">
          <div className="p-6">
            <div className="max-w-none">
              <ProductSelector category={currentStep} />
            </div>
          </div>
        </div>
      </div>
      
      <AIConfigurationAssistant
        configData={configData}
        configuration={configuration}
        onApplyConfiguration={handleAIApplyConfiguration}
        onNavigateToStep={handleAINavigateToStep}
      />
      
      <CompareModal />
      <ConfigurationSummary />
    </div>
  );
};

export default InfrastructureConfigurator;