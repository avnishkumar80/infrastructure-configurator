import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Maximize2, Minimize2 } from 'lucide-react';

const AIConfigurationAssistant = ({
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // 1. Detect Product Context
        let context = null;
        if (lowerMessage.includes('server') || lowerMessage.includes('node') || lowerMessage.includes('database') || lowerMessage.includes('web app')) {
            context = 'server-nodes';
        } else if (lowerMessage.includes('linux') || lowerMessage.includes('os') || lowerMessage.includes('operating system')) {
            context = 'operating-system';
        }

        // 2. Generate Suggestion based on Context and Modifiers
        if (context === 'server-nodes') {
            const isHighPerf = lowerMessage.includes('performance') || lowerMessage.includes('fast') || lowerMessage.includes('16 core') || lowerMessage.includes('AI');
            const isStorage = lowerMessage.includes('storage') || lowerMessage.includes('space') || lowerMessage.includes('hdd');

            // Build Config
            const config = {
                compute: isHighPerf ? 'cpu-16core-64gb' : 'cpu-8core-32gb',
                storage: []
            };

            // Parse SSD quantity? Default 1.
            let ssdQty = 1;
            if (isHighPerf) ssdQty = 2;
            const ssdMatch = lowerMessage.match(/(\d+)\s*(?:ssd|nvme)/);
            if (ssdMatch) ssdQty = parseInt(ssdMatch[1]);

            config.storage.push({ optionId: 'ssd-500gb', quantity: ssdQty });

            // Add HDD if storage focused
            if (isStorage) {
                let hddQty = 2;
                const hddMatch = lowerMessage.match(/(\d+)\s*(?:hdd|tb|terabyte)/);
                if (hddMatch) hddQty = parseInt(hddMatch[1]);
                config.storage.push({ optionId: 'hdd-2tb', quantity: hddQty });
            }

            return {
                response: `I've configured a ${isHighPerf ? 'high-performance' : 'standard'} server for you. It includes ${isHighPerf ? '16 Cores and 64GB RAM' : '8 Cores and 32GB RAM'} along with ${ssdQty} SSDs${isStorage ? ' and high-capacity HDD storage' : ''}. Would you like to apply this?`,
                suggestion: {
                    category: 'hardware',
                    subItem: 'server-nodes',
                    productId: 'node-a',
                    config: config
                }
            };
        }

        if (context === 'operating-system') {
            const isAdvanced = lowerMessage.includes('advanced') || lowerMessage.includes('premium') || lowerMessage.includes('production');

            return {
                response: `I recommend our Enterprise Linux ${isAdvanced ? 'Advanced' : 'Standard'} Edition. ${isAdvanced ? 'It includes premium support and extended packages.' : 'It covers all basic enterprise needs.'}`,
                suggestion: {
                    category: 'software',
                    subItem: 'operating-system',
                    productId: 'enterprise-linux',
                    config: {
                        edition: isAdvanced ? 'advanced' : 'standard'
                    }
                }
            };
        }

        // Fallback for general queries
        if (lowerMessage.includes('help') || lowerMessage.includes('can you do')) {
            return {
                response: "I can help you build your configuration! Try saying 'Add a high performance server', 'I need a database node with huge storage', or 'Add Enterprise Linux'."
            };
        }

        return {
            response: "I didn't quite catch the specific product you're looking for. Try asking for a 'Server', 'Storage', or 'Linux OS'. I can customize them for performance or capacity too!"
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

        // Simulate AI thinking time
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
        }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
    };

    const handleApplySuggestion = (suggestion) => {
        if (onApplyConfiguration && suggestion) {
            onApplyConfiguration(suggestion);

            // Add confirmation message
            const confirmMessage = {
                id: Date.now(),
                type: 'assistant',
                content: "✅ Great! I've applied that configuration for you. You can see the changes in your configuration and continue customizing from there.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, confirmMessage]);

            // Navigate to the relevant step
            if (onNavigateToStep) {
                onNavigateToStep(suggestion.category, suggestion.subItem);
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
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ${isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
            }`}>
            {/* Header */}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: isExpanded ? '480px' : '240px' }}>
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${message.type === 'user'
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

            {/* Input */}
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

export default AIConfigurationAssistant;
