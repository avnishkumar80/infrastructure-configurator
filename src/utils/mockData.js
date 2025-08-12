// Mock AI responses for the assistant
export const mockAIResponses = {
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

// Default AI welcome message
export const defaultWelcomeMessage = {
  id: 1,
  type: 'assistant',
  content: "👋 Hi! I'm your AI Configuration Assistant. I can help you build the perfect infrastructure setup.\n\nTry asking me:\n• 'I need a setup for a web application'\n• 'What's the best storage for databases?'\n• 'Help me fix configuration errors'\n• 'Recommend a budget-friendly option'",
  timestamp: new Date()
};

// Quick action templates
export const quickActionTemplates = [
  { 
    icon: 'Lightbulb', 
    text: "Recommend setup", 
    query: "Recommend a good setup for my needs" 
  },
  { 
    icon: 'AlertTriangle', 
    text: "Fix errors", 
    query: "Help me fix configuration errors" 
  },
  { 
    icon: 'Target', 
    text: "Optimize budget", 
    query: "Help me optimize for budget" 
  },
  { 
    icon: 'HelpCircle', 
    text: "Explain options", 
    query: "Explain the current configuration options" 
  }
];
