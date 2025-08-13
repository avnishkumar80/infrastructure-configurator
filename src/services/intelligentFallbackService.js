/**
 * Intelligent Fallback AI Service
 * Provides smart responses when MCP server is unavailable
 */

export class IntelligentFallbackService {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
  }

  async processUserMessage(userMessage, currentContext) {
    // Analyze the user's intent
    const analysis = this.analyzeUserIntent(userMessage, currentContext);
    
    // Generate contextual response based on analysis
    const response = this.generateIntelligentResponse(analysis, userMessage, currentContext);
    
    // Store conversation for context
    this.conversationHistory.push({
      message: userMessage,
      analysis,
      response,
      timestamp: new Date()
    });

    return {
      response,
      analysis,
      suggestedActions: this.generateSuggestedActions(analysis, currentContext)
    };
  }

  analyzeUserIntent(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection patterns
    const intents = {
      validate_config: {
        patterns: ['validate', 'check', 'verify', 'errors', 'issues', 'problems', 'wrong'],
        confidence: 0,
        keywords: []
      },
      optimize_performance: {
        patterns: ['optimize', 'performance', 'faster', 'speed', 'improve', 'better'],
        confidence: 0,
        keywords: []
      },
      cost_optimization: {
        patterns: ['budget', 'cost', 'cheap', 'save', 'money', 'affordable', 'price'],
        confidence: 0,
        keywords: []
      },
      troubleshoot: {
        patterns: ['help', 'fix', 'broken', 'not working', 'issue', 'problem', 'error'],
        confidence: 0,
        keywords: []
      },
      recommend_setup: {
        patterns: ['recommend', 'suggest', 'best', 'should', 'what', 'advice', 'guidance'],
        confidence: 0,
        keywords: []
      },
      explain_options: {
        patterns: ['explain', 'what is', 'how does', 'difference', 'compare', 'vs'],
        confidence: 0,
        keywords: []
      },
      generate_config: {
        patterns: ['generate', 'create', 'build', 'setup', 'configure', 'deploy'],
        confidence: 0,
        keywords: []
      }
    };

    // Calculate confidence scores
    Object.keys(intents).forEach(intentKey => {
      const intent = intents[intentKey];
      intent.patterns.forEach(pattern => {
        if (lowerMessage.includes(pattern)) {
          intent.confidence += 0.3;
          intent.keywords.push(pattern);
        }
      });
    });

    // Find the highest confidence intent
    const detectedIntent = Object.keys(intents).reduce((best, current) => {
      return intents[current].confidence > intents[best].confidence ? current : best;
    }, 'recommend_setup');

    // Extract technology/infrastructure keywords
    const techKeywords = this.extractTechKeywords(lowerMessage);
    const complexityLevel = this.assessComplexityLevel(lowerMessage, context);

    return {
      primaryIntent: detectedIntent,
      confidence: intents[detectedIntent].confidence,
      matchedKeywords: intents[detectedIntent].keywords,
      techKeywords,
      complexityLevel,
      contextAware: this.isContextAware(lowerMessage, context),
      originalMessage: message
    };
  }

  extractTechKeywords(message) {
    const techPatterns = {
      infrastructure: ['server', 'node', 'cluster', 'infrastructure', 'hardware'],
      storage: ['storage', 'disk', 'ssd', 'nvme', 'database', 'data'],
      compute: ['cpu', 'processor', 'ram', 'memory', 'compute', 'cores'],
      networking: ['network', 'bandwidth', 'connection', 'router', 'switch'],
      applications: ['web', 'app', 'application', 'service', 'api', 'microservice'],
      containers: ['docker', 'kubernetes', 'container', 'pod', 'orchestration'],
      cloud: ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda'],
      monitoring: ['monitoring', 'logs', 'metrics', 'alerts', 'observability']
    };

    const detected = {};
    Object.keys(techPatterns).forEach(category => {
      detected[category] = techPatterns[category].filter(keyword => 
        message.includes(keyword)
      );
    });

    return detected;
  }

  assessComplexityLevel(message, context) {
    let complexity = 'basic';
    
    const complexIndicators = [
      'enterprise', 'scale', 'distributed', 'microservices', 'kubernetes',
      'load balancing', 'high availability', 'disaster recovery', 'compliance'
    ];
    
    const advancedIndicators = [
      'optimization', 'performance tuning', 'custom', 'integration', 'migration'
    ];

    if (complexIndicators.some(indicator => message.includes(indicator))) {
      complexity = 'enterprise';
    } else if (advancedIndicators.some(indicator => message.includes