/**
 * Default configuration data structure
 * This represents the initial state of the configurator
 */
export const defaultConfigData = {
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

/**
 * Get the default configuration data
 * @returns {Object} Default configuration data
 */
export const getDefaultConfigData = () => {
  return JSON.parse(JSON.stringify(defaultConfigData)); // Deep clone to prevent mutations
};

/**
 * Create initial empty configuration state
 * @returns {Object} Initial configuration state
 */
export const getInitialConfiguration = () => {
  return {
    node: { selections: [], configured: false },
    chassis: { selections: [], configured: false },
    'optional-software': { selections: [], configured: false },
    'required-software': { selections: [], configured: false },
    services: { selections: [], configured: false }
  };
};

/**
 * Get default UI state
 * @returns {Object} Default UI state
 */
export const getDefaultUIState = () => {
  return {
    currentStep: 'node',
    selectedProductIndex: null,
    currentCategory: 'hardware',
    isChatVisible: true,
    showMessageCenter: false,
    showConfigPanel: false,
    isConfigLoading: false,
    configError: null,
    uploadSuccess: false
  };
};

/**
 * Reset configuration to default state
 * @param {Object} customConfigData - Optional custom config data
 * @returns {Object} Reset state object
 */
export const resetToDefaultState = (customConfigData = null) => {
  const configData = customConfigData || getDefaultConfigData();
  const configuration = getInitialConfiguration();
  const uiState = getDefaultUIState();
  
  return {
    configData,
    configuration,
    uiState
  };
};
