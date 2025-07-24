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
  List,
  MoreVertical,
  Eye,
  Menu,
  ChevronLeft,
  Play,
  Pause,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react';

const AIConfigurationAssistant = ({ 
  configData, 
  configuration, 
  onApplyConfiguration, 
  onNavigateToStep,
  currentStep,
  onFixError
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "👋 Hi! I'm your AI Configuration Assistant. I can help you build the perfect infrastructure setup.\n\nTry asking me:\n• 'I need a setup for a web application'\n• 'What's the best storage for databases?'\n• 'Help me fix configuration errors'\n• 'Recommend a budget-friendly option'",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const mockAIResponses = {
    'web application': {
      response: "🚀 For a web application, I recommend:\n\n• **Enterprise Node A** with 16-Core CPU + 64GB RAM for performance\n• **NVMe SSD storage** for fast response times\n• **Redundant power supplies** for reliability\n\nThis setup handles 100+ concurrent users efficiently. Would you like me to configure this for you?",
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
      response: "🗄️ For database workloads, performance is key:\n\n• **16-Core CPU with 64GB RAM** for heavy queries\n• **Multiple NVMe SSDs** in RAID for database files\n• **High-capacity power supplies** for stability\n\nThis configuration ensures low latency and high throughput. Shall I set this up?",
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
      response: "💰 I can help you optimize for cost!\n\n• **8-Core CPU with 32GB RAM** provides excellent value\n• **Single SSD** to start, scale later\n• **Standard power supplies** to reduce costs\n\nThis configuration starts at **$1,650** and can grow with your needs. Want me to configure this budget-friendly option?",
      suggestion: {
        category: 'node',
        productId: 'node-a',
        config: {
          compute: 'cpu-8core-32gb',
          storage: [{ optionId: 'ssd-500gb', quantity: 1 }]
        }
      }
    },
    'error': {
      response: "🔧 I can help you fix configuration errors!\n\nLet me analyze your current setup and identify what needs attention. I'll guide you through resolving any missing required fields or validation issues.\n\nWhat specific error would you like me to help with?"
    },
    'help': {
      response: "💡 I can assist you with:\n\n• **Product recommendations** based on your use case\n• **Performance optimization** for your workload\n• **Budget optimization** to reduce costs\n• **Error resolution** and validation fixes\n• **Configuration comparison** and best practices\n\nWhat would you like help with today?"
    },
    'fix': {
      response: "🛠️ I'll help you fix the configuration issues. Let me check what's missing and guide you through the solutions step by step."
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
    
    if (lowerMessage.includes('current') || lowerMessage.includes('this step')) {
      const step = configData.steps?.find(s => s.id === currentStep);
      return {
        response: `🎯 You're currently configuring **${step?.label || currentStep}**.\n\nThis step ${step?.required ? 'is required' : 'is optional'} for your infrastructure setup. What specific help do you need with this configuration?`
      };
    }
    
    return {
      response: "🤔 I understand you're asking about your infrastructure setup. Could you provide more details about your specific needs? For example:\n\n• What type of application will this support?\n• What's your expected user load?\n• Do you have budget constraints?\n• Any specific performance requirements?"
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
        content: "✅ **Configuration Applied!** \n\nI've updated your setup with the recommended configuration. You can see the changes in the main area and continue customizing from there.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      
      if (onNavigateToStep) {
        onNavigateToStep(suggestion.category);
      }
    }
  };

  const handleFixErrors = (errors) => {
    if (errors && errors.length > 0 && onFixError) {
      errors.forEach(error => {
        onFixError(error.category);
      });
      
      const fixMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `🔧 **Taking you to fix the issues!**\n\nI've navigated you to the first configuration section that needs attention. Let's get these resolved one by one.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fixMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Lightbulb, text: "Recommend setup", query: "Recommend a good setup for my needs" },
    { icon: AlertTriangle, text: "Fix errors", query: "Help me fix configuration errors" },
    { icon: Target, text: "Optimize budget", query: "Help me optimize for budget" },
    { icon: HelpCircle, text: "Explain options", query: "Explain the current configuration options" }
  ];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-600">Configuration Helper</p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors"
            title={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="text-xs font-medium text-gray-600 mb-2">Quick Actions:</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(action.query)}
                  className="flex items-center space-x-2 p-2 text-xs bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                >
                  <action.icon className="w-3 h-3 text-blue-600" />
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isAutoSuggestion
                    ? 'bg-amber-50 border border-amber-200 text-gray-900'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                  
                  {message.suggestion && (
                    <button
                      onClick={() => handleApplySuggestion(message.suggestion)}
                      className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-3 h-3" />
                      <span>Apply This Configuration</span>
                    </button>
                  )}
                  
                  {message.errors && (
                    <button
                      onClick={() => handleFixErrors(message.errors)}
                      className="mt-3 w-full px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Fix These Issues</span>
                    </button>
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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

          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
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
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="p-4 text-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center justify-center space-x-2 w-full py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Expand Chat</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ProgressStep = ({ step, index, isActive, isCompleted, onClick, totalSteps }) => {
  const stepNumber = index + 1;
  const isLast = index === totalSteps - 1;
  
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
          isCompleted
            ? 'bg-green-100 border-2 border-green-500 text-green-700'
            : isActive
            ? 'bg-blue-600 border-2 border-blue-600 text-white'
            : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
        } hover:scale-105`}
        title={`${step.label}${step.required ? ' (Required)' : ''}`}
      >
        {isCompleted ? (
          <Check className="w-5 h-5" />
        ) : (
          <span className="text-sm font-semibold">{stepNumber}</span>
        )}
      </button>
      
      <div className="ml-3 flex-1">
        <div className={`text-sm font-medium ${
          isActive ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {step.label}
          {step.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="text-xs text-gray-500">
          {isCompleted ? 'Configured' : 'Not configured'}
        </div>
      </div>
      
      {!isLast && (
        <div className={`w-12 h-0.5 mx-4 ${
          isCompleted ? 'bg-green-300' : 'bg-gray-200'
        }`} />
      )}
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
  const [currentStep, setCurrentStep] = useState('node');
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('hardware');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
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
    const step = configData.steps?.find(s => s.id === category);
    
    if (!config || config.selections.length === 0) {
      return step?.required ? 'incomplete' : 'incomplete';
    }
    return 'valid';
  };

  const isStepCompleted = (category) => {
    const config = configuration[category];
    return config && config.selections.length > 0;
  };

  const getAllMessages = () => {
    const messages = [];
    
    Object.entries(configuration).forEach(([category, config]) => {
      const stepConfig = configData.steps?.find(step => step.id === category);
      const stepName = stepConfig?.label || category;
      
      if (!config || config.selections.length === 0) {
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

  const getMessageCounts = () => {
    const messages = getAllMessages();
    return {
      errors: messages.filter(m => m.type === 'error').length,
      warnings: messages.filter(m => m.type === 'warning').length,
      infos: messages.filter(m => m.type === 'info').length,
      total: messages.length
    };
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

  const handleAIFixError = (category) => {
    setCurrentStep(category);
    setShowMessageCenter(false);
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
        version: "1.0",
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
        })(),
        // Add metadata for compatibility
        metadata: {
          configuratorVersion: "2.0",
          exportDate: new Date().toISOString(),
          completedSteps: Object.entries(configuration).filter(([_, config]) => 
            config.selections && config.selections.length > 0
          ).map(([category, _]) => category),
          requiredStepsCompleted: configData.steps
            .filter(step => step.required)
            .every(step => configuration[step.id]?.selections?.length > 0)
        }
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
      setShowMessageCenter(false);
      setShowConfigPanel(false);
      setConfigError(null);
      setUploadSuccess(false);
      
      // Show confirmation
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const MessageCenter = () => {
    if (!showMessageCenter) return null;

    const messages = getAllMessages();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[70vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              </div>
              <button
                onClick={() => setShowMessageCenter(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="p-4 space-y-3">
                {messages.map((message, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${
                    message.type === 'error' ? 'border-red-200 bg-red-50' :
                    message.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        message.type === 'error' ? 'bg-red-500' :
                        message.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {message.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {message.message}
                        </div>
                        <button
                          onClick={() => handleAIFixError(message.category)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          {message.type === 'error' ? 'Fix now →' : 'Go to section →'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No messages</p>
                <p className="text-sm">All configurations look good!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Product List</span>
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
                        {module.type === 'single-select' && module.options.map(option => (
                          <div key={option.id}>
                            <label className="block">
                              <div className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                                selection.config[moduleId] === option.id 
                                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
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
                          </div>
                        ))}

                        {module.type === 'multi-select-quantity' && (
                          <div className="space-y-4">
                            {module.options.map(option => {
                              const currentSelection = (selection.config[moduleId] || []).find(s => s.optionId === option.id);
                              const quantity = currentSelection?.quantity || 0;
                              
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
                                </div>
                              );
                            })}
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
            
          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-lg">
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
      <div className="space-y-8">
        {currentSelections.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configured Products
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {currentSelections.length} item{currentSelections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {currentSelections.map((selection, index) => (
                  <div key={index} className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 hover:shadow-md transition-all duration-200">
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
                            ${calculatePrice(selection.product, selection.config, selection.quantity).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedProductIndex(index)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() => removeSelection(index)}
                            className="px-4 py-2 text-gray-600 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                  <div key={product.id} className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
                            ${product.basePrice.toLocaleString()}
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
                            })}
                            {Object.keys(product.modules).length > 2 && (
                              <div className="text-xs text-gray-500 italic">
                                +{Object.keys(product.modules).length - 2} more options to configure
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => addProduct(product)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm group-hover:shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add to Configuration</span>
                      </button>
                    </div>
                    
                    {/* Hover accent */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
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
                onClick={() => setIsChatVisible(true)}
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

  useEffect(() => {
    setSelectedProductIndex(null);
  }, [currentStep]);

  const getTotalPrice = () => {
    let total = 0;
    Object.entries(configuration).forEach(([category, config]) => {
      if (config.selections) {
        total += config.selections.reduce((sum, selection) => {
          return sum + calculatePrice(selection.product, selection.config, selection.quantity);
        }, 0);
      }
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-full px-6 py-3">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{configData.productInfo?.name || 'Product Configurator'}</h1>
              <p className="text-xs text-gray-600">{configData.productInfo?.subtitle || 'Configuration'}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Base Price</div>
                <div className="text-sm font-semibold text-blue-600">
                  ${(configData.productInfo?.salesPrice || 0).toLocaleString()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Price</div>
                <div className="text-lg font-bold text-green-600">
                  ${getTotalPrice().toLocaleString()}
                </div>
              </div>

              {(() => {
                const messageCounts = getMessageCounts();
                
                if (messageCounts.total > 0) {
                  return (
                    <button
                      onClick={() => setShowMessageCenter(true)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        messageCounts.errors > 0 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : messageCounts.warnings > 0
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        messageCounts.errors > 0 ? 'bg-red-500 animate-pulse' :
                        messageCounts.warnings > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span>
                        {messageCounts.errors > 0 ? `${messageCounts.errors} issue${messageCounts.errors !== 1 ? 's' : ''}` : 
                         messageCounts.warnings > 0 ? `${messageCounts.warnings} warning${messageCounts.warnings !== 1 ? 's' : ''}` :
                         `${messageCounts.infos} info`}
                      </span>
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  );
                }
                return null;
              })()}
              
              <div className="relative">
                <button
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  title="Configuration Management"
                >
                  <Settings className="w-4 h-4" />
                  <span>Config</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showConfigPanel ? 'rotate-180' : ''}`} />
                </button>

                {showConfigPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Configuration Management</h3>
                        <button
                          onClick={() => setShowConfigPanel(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

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

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Import/Export
                          </label>
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            className="hidden"
                          />
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isConfigLoading}
                              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{isConfigLoading ? 'Loading...' : 'Import'}</span>
                            </button>
                            
                            <button
                              onClick={downloadConfiguration}
                              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Export</span>
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                            Chat & Display
                          </label>
                          
                          <button
                            onClick={() => {
                              setIsChatVisible(!isChatVisible);
                              setShowConfigPanel(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                              isChatVisible 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4" />
                              <span>AI Chat Assistant</span>
                            </div>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isChatVisible ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {isChatVisible && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                            Reset Options
                          </label>
                          
                          <button
                            onClick={() => {
                              resetToDefault();
                              setShowConfigPanel(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 border border-red-300 text-sm rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Reset to Default</span>
                          </button>
                        </div>

                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <div className="flex justify-between">
                            <span>Export includes:</span>
                            <span>Structure + Selections</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Version:</span>
                            <span>2.0 (Enhanced)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            {(configData.steps || []).map((step, index) => (
              <ProgressStep
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === step.id}
                isCompleted={isStepCompleted(step.id)}
                totalSteps={configData.steps.length}
                onClick={() => setCurrentStep(step.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className={`flex-1 bg-white transition-all duration-300 ${isChatVisible ? 'mr-96' : 'mr-0'}`}>
          <div className="p-6">
            <div className="max-w-none">
              <ProductSelector category={currentStep} />
            </div>
          </div>
        </div>

        {isChatVisible && (
          <div className="fixed top-0 right-0 h-full z-30">
            <AIConfigurationAssistant
              configData={configData}
              configuration={configuration}
              currentStep={currentStep}
              onApplyConfiguration={handleAIApplyConfiguration}
              onNavigateToStep={handleAINavigateToStep}
              onFixError={handleAIFixError}
            />
          </div>
        )}
      </div>
      
      <MessageCenter />
    </div>
  );
};

export default InfrastructureConfigurator;