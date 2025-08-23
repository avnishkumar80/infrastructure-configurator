/**
 * Claude API Proxy Server
 * Solves CORS issues by proxying requests to Claude API from browser applications
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your React app
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Claude proxy server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Health check',
      'POST /api/claude/messages - Claude API proxy',
      'POST /api/claude/test - Test Claude connection'
    ]
  });
});

// Claude API proxy endpoint
app.post('/api/claude/messages', async (req, res) => {
  try {
    console.log('🤖 Proxying request to Claude API...');
    
    const { messages, model, max_tokens, temperature, system, apiKey } = req.body;
    console.log('🔍 Debug - API Key received:', apiKey ? `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}` : 'NO API KEY');

    // Validate required fields
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        details: 'Please provide your Claude API key in the request body'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        details: 'Please provide a valid messages array'
      });
    }

    // Prepare request to Claude API
    const claudeRequest = {
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 1000,
      messages: messages,
      temperature: temperature || 0.7
    };

    // Add system message if provided
    if (system) {
      claudeRequest.system = system;
    }

    console.log(`📤 Sending to Claude: ${claudeRequest.model}, ${messages.length} messages`);

    // Make request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Claude API error: ${response.status} ${response.statusText}`);
      console.error(`❌ Error details: ${errorText}`);
      
      return res.status(response.status).json({ 
        error: `Claude API error: ${response.status} ${response.statusText}`,
        details: errorText,
        claude_status: response.status
      });
    }

    const data = await response.json();
    console.log(`✅ Claude response received: ${data.content?.[0]?.text?.slice(0, 100)}...`);
    
    res.json(data);

  } catch (error) {
    console.error('💥 Proxy server error:', error);
    
    // Handle specific error types
    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Cannot reach Claude API',
        details: 'Check your internet connection and try again',
        original_error: error.message
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Request timeout',
        details: 'Claude API took too long to respond',
        original_error: error.message
      });
    }

    res.status(500).json({ 
      error: 'Proxy server error',
      details: error.message,
      type: error.name || 'Unknown'
    });
  }
});

// Test endpoint for Claude connection
app.post('/api/claude/test', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required for testing'
      });
    }

    console.log('🧪 Testing Claude API connection...');

    const testMessages = [{
      role: 'user',
      content: 'Hello! This is a connection test. Please respond with "Connection successful" and nothing else.'
    }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: testMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        success: false,
        error: `Claude API test failed: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Claude test successful');
    
    res.json({ 
      success: true,
      message: 'Claude API connection test successful',
      response: data.content[0].text,
      model: 'claude-sonnet-4-20250514'
    });

  } catch (error) {
    console.error('❌ Claude test failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Test connection failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'POST /api/claude/messages',
      'POST /api/claude/test'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🚀 Claude Proxy Server Started!`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Health: http://localhost:${PORT}/health`);
  console.log(`🚀 Claude Endpoint: http://localhost:${PORT}/api/claude/messages`);
  console.log('🚀 ===================================');
  console.log('📋 Setup Instructions:');
  console.log('📋 1. Get Claude API key from https://console.anthropic.com');
  console.log('📋 2. Configure your app to use http://localhost:3001');
  console.log('📋 3. Send requests to /api/claude/messages');
  console.log('🚀 ===================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Claude proxy server...');
  process.exit(0);
});