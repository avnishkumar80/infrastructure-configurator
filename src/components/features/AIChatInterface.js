import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize MCP Client
const mcpClient = new Client(
    { name: "infrastructure-configurator-frontend", version: "1.0.0" },
    { capabilities: {} }
);

let isMcpConnected = false;
const connectMcp = async () => {
    if (isMcpConnected) return;
    try {
        const transport = new SSEClientTransport(new URL("http://localhost:3001/sse"));
        await mcpClient.connect(transport);
        isMcpConnected = true;
        console.log("Connected to MCP Server via SSE");
    } catch (e) {
        console.error("Failed to connect to MCP server", e);
    }
};

// Initialize Gemini
const geminiApiKey = (process.env.REACT_APP_GEMINI_API_KEY || "").trim();

// Debug log for API Key (masked)
if (geminiApiKey) {
    const maskedKey = geminiApiKey.length > 8 
        ? `${geminiApiKey.substring(0, 4)}...${geminiApiKey.substring(geminiApiKey.length - 4)}`
        : "****";
    console.log(`Gemini API Key detected: ${maskedKey}`);
} else {
    console.warn("Gemini API Key (REACT_APP_GEMINI_API_KEY) not found in environment.");
}

let genAI = null;
try {
    if (geminiApiKey && geminiApiKey !== "your_actual_api_key_here" && geminiApiKey !== "undefined") {
        genAI = new GoogleGenerativeAI(geminiApiKey);
    }
} catch (e) {
    console.error("Gemini initialization error:", e);
}

// Initialize OpenAI
const openaiApiKey = (process.env.REACT_APP_OPENAI_API_KEY || "").trim();
let openai = null;
if (openaiApiKey && openaiApiKey !== "undefined") {
    openai = new OpenAI({
        apiKey: openaiApiKey,
        dangerouslyAllowBrowser: true // This is safe for a local internal configurator tool
    });
    console.log("OpenAI client initialized");
} else {
    console.warn("OpenAI API Key (REACT_APP_OPENAI_API_KEY) not found in environment.");
}

// System Instructions for Gemini
const SYSTEM_INSTRUCTION = `You are an AI Infrastructure Architect. 
Your goal is to gather requirements from the user for their hardware sizing.
You need the following 4 pieces of information:
1. Required Storage Capacity (in Terabytes)
2. Performance Tier (High, Medium, or Low)
3. Workload Type (e.g., Database, Web Application, General Compute)
4. Configuration Type (Is this a 'new' deployment or an 'upgrade' to an existing node?)

Instructions:
- Be friendly, concise, and professional.
- Ask questions ONE AT A TIME if information is missing.
- Do NOT output JSON until all 4 requirements are confirmed.
- Once you have gathered all 4 pieces of information, summarize them and explicitly ask the user: "Should I go ahead and build this configuration?"
- If the user confirms (yes, proceed, build it, etc.), you MUST output a raw JSON block containing EXACTLY the gathered parameters, formatted like this:
\`\`\`json
{
  "triggerConfig": true,
  "requiredCapacityTB": 10,
  "performanceRequirements": "High",
  "workloadType": "Database",
  "configType": "new"
}
\`\`\`
- IMPORTANT: The JSON block must be the ONLY code block in your response. Do not output multiple JSON blocks. Keep your final confirmation message short.`;


const AIChatInterface = ({ configData, configuration, updateConfiguration, setConfiguration, resetConfiguration }) => {
    // UI Messages
    const [messages, setMessages] = useState([
        {
            id: 'system-1',
            type: 'assistant',
            content: "Hi! I'm your AI assistant. I can help you design the perfect environment using our advanced Hardware Sizing MCP Tool. What kind of infrastructure are you trying to build today?",
            timestamp: new Date()
        }
    ]);

    // Internal Gemini Chat History
    const [chatHistory, setChatHistory] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        connectMcp();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleReset = () => {
        if (window.confirm('Are you sure you want to start over? This will clear your current configuration.')) {
            resetConfiguration();
            setChatHistory([]);
            setMessages([{
                id: Date.now().toString(),
                type: 'assistant',
                content: "Configuration cleared. Let's start fresh! What kind of infrastructure do you need today?",
                timestamp: new Date()
            }]);
        }
    }

    const generateAIResponse = async (userText) => {
        if (!genAI && !openai) {
            return {
                response: "No AI provider (Gemini or OpenAI) is configured. Please set REACT_APP_GEMINI_API_KEY or REACT_APP_OPENAI_API_KEY in your .env file and restart the app.",
                configurationPayload: null
            };
        }

        try {
            // Check MCP Connection
            if (!isMcpConnected) {
                await connectMcp();
            }

            // Append user message to history payload
            // For OpenAI we need a different format, but we'll adapt Gemini history
            const newHistoryItem = { role: 'user', parts: [{ text: userText }] };
            const currentHistory = [...chatHistory, newHistoryItem];

            let aiResponseText = "";
            let apiUsed = "";

            // Try OpenAI first if available, as it's the requested alternative
            if (openai) {
                try {
                    console.log("Attempting to call OpenAI (gpt-4o)...");
                    apiUsed = "OpenAI";
                    
                    // Convert Gemini history to OpenAI history
                    const openAIMessages = [
                        { role: 'system', content: SYSTEM_INSTRUCTION },
                        ...chatHistory.map(h => ({
                            role: h.role === 'model' ? 'assistant' : 'user',
                            content: h.parts[0].text
                        })),
                        { role: 'user', content: userText }
                    ];

                    const completion = await openai.chat.completions.create({
                        messages: openAIMessages,
                        model: "gpt-4o",
                    });

                    aiResponseText = completion.choices[0].message.content;
                } catch (oe) {
                    console.error("OpenAI call failed:", oe);
                    if (!genAI) throw oe; // Re-throw if no Gemini fallback
                    apiUsed = ""; // Reset to try Gemini
                }
            }

            // Fallback to Gemini if OpenAI failed or wasn't available
            if (!aiResponseText && genAI) {
                apiUsed = "Gemini";
                let result;
                const modelsToTry = [
                    'gemini-1.5-flash', 
                    'gemini-1.5-pro', 
                    'gemini-pro'
                ];
                let lastError = null;

                for (const modelName of modelsToTry) {
                    try {
                        console.log(`Attempting to call Gemini model: ${modelName}...`);
                        
                        const isVersion15 = modelName.includes('1.5');
                        const modelConfig = { model: modelName };
                        
                        if (isVersion15) {
                            modelConfig.systemInstruction = SYSTEM_INSTRUCTION;
                        }

                        const model = genAI.getGenerativeModel(modelConfig, { apiVersion: 'v1' });
                        
                        let finalHistory = [...currentHistory];
                        if (!isVersion15) {
                            if (finalHistory.length > 0 && finalHistory[0].role === 'user') {
                                finalHistory[0] = {
                                    ...finalHistory[0],
                                    parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_INSTRUCTION}\n\nUSER REQUEST: ${finalHistory[0].parts[0].text}` }]
                                };
                            }
                        }

                        result = await model.generateContent({
                            contents: finalHistory
                        });
                        
                        if (result && result.response) {
                            console.log(`Successfully connected with model: ${modelName}`);
                            aiResponseText = result.response.text();
                            break; 
                        }
                    } catch (err) {
                        lastError = err;
                        console.warn(`Model ${modelName} attempt failed:`, err.message);
                        
                        const isRetryable = err.message?.includes('404') || 
                                           err.message?.includes('400') || 
                                           err.message?.includes('not found') ||
                                           err.message?.includes('systemInstruction');
                                           
                        if (!isRetryable) {
                            throw err;
                        }
                    }
                }

                if (!aiResponseText && !result) {
                    throw lastError || new Error("All AI models failed.");
                }
            }

            console.log(`AI Raw Response (${apiUsed}):`, aiResponseText);
            
            // Update history for next turn
            setChatHistory([
                ...currentHistory,
                { role: 'model', parts: [{ text: aiResponseText }] }
            ]);

            // More robust regex to match JSON block (case-insensitive json, optional language tag)
            const jsonRegex = /```(?:json|JSON)?\s*(\{[\s\S]*?\})\s*```/g;
            const matches = [...aiResponseText.matchAll(jsonRegex)];
            
            if (matches.length > 0) {
                // Parse the last JSON match (in case there are multiple, though there should only be one)
                try {
                    const lastMatch = matches[matches.length - 1];
                    const parsedParams = JSON.parse(lastMatch[1]);
                    
                    if (parsedParams.triggerConfig) {
                        console.log("Triggering configuration with params:", parsedParams);
                        
                        // Strip ALL JSON blocks from the user-facing text
                        const cleanResponseText = aiResponseText.replace(jsonRegex, '').trim() 
                            || "Building your configuration now...";

                        // Call MCP Server with Gemini's extracted parameters
                        const mcpResult = await mcpClient.callTool({
                            name: "calculate_hardware_sizing",
                            arguments: {
                                requiredCapacityTB: Number(parsedParams.requiredCapacityTB),
                                performanceRequirements: parsedParams.performanceRequirements,
                                workloadType: parsedParams.workloadType,
                                configType: parsedParams.configType
                            }
                        });

                        const configPayload = JSON.parse(mcpResult.content[0].text);
                        
                        return {
                            response: cleanResponseText + "\n\n✅ Configuration built and applied! Check the Summary panel for details.",
                            configurationPayload: configPayload
                        };
                    }
                } catch (parseError) {
                    console.error("Failed to parse Gemini JSON output:", parseError);
                }
            }

            // Return normal conversation response if no JSON trigger
            return {
                response: aiResponseText,
                configurationPayload: null
            };

        } catch (error) {
            console.error("AI execution failed. Full details:", error);
            
            let descriptiveError = "I encountered an error trying to process your request.";
            if (error.message?.includes('SAFETY')) {
                descriptiveError = "The AI response was blocked by safety filters. Try rephrasing your request to be more specific about infrastructure components.";
            } else if (error.message?.includes('quota') || error.message?.includes('429')) {
                descriptiveError = "AI API quota exceeded. Please check your Gemini API usage limits.";
            } else if (error.message?.includes('MCP') || !isMcpConnected) {
                descriptiveError = "The Hardware Sizing server (MCP) is disconnected. Please ensure 'node index.js' is running in the sizing-mcp-server directory.";
            } else {
                descriptiveError += ` (Technical detail: ${error.message || 'Unknown error'})`;
            }

            return {
                response: descriptiveError,
                configurationPayload: null
            };
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMsgText = inputMessage;
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: userMsgText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Fetch response asynchronously from Gemini
        const aiResult = await generateAIResponse(userMsgText);

        const assistantMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: aiResult.response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        // Apply generated configuration directly if present
        if (aiResult.configurationPayload) {
            applyFullConfiguration(aiResult.configurationPayload);
        }
    };

    const applyFullConfiguration = (configPayload) => {
        // Hydrate and map MCP output
        Object.keys(configPayload).forEach(category => {
            Object.keys(configPayload[category]).forEach(subItem => {
                const rawSelections = configPayload[category][subItem].selections || [];
                
                const hydratedSelections = rawSelections.map(selection => {
                    const productData = configData.products[subItem]?.find(p => p.id === selection.productId);
                    return {
                        ...selection,
                        product: productData
                    };
                }).filter(selection => selection.product);

                updateConfiguration(category, subItem, hydratedSelections);
            });
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">AI Mode</h2>
                        <p className="text-sm text-gray-500 font-medium">Interactive Sizing</p>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reset Configuration"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Start Fresh</span>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className="flex items-end max-w-[85%] space-x-2">
                            {message.type === 'assistant' && (
                                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                            )}

                            <div className={`p-4 rounded-2xl ${message.type === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm shadow-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                                }`}>
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {message.type === 'user' && (
                                <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                                    <User className="w-5 h-5 text-gray-600" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in duration-200">
                        <div className="flex items-end space-x-2">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-sm border border-gray-200 flex items-center space-x-1.5 h-[52px]">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center max-w-4xl mx-auto shadow-sm rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe what you want to build (e.g., 'a database server with 2TB storage')..."
                        className="flex-1 py-4 pl-4 pr-14 bg-transparent outline-none resize-none max-h-32 text-gray-800 placeholder-gray-400 text-[15px]"
                        rows={1}
                        style={{ minHeight: '56px' }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping}
                        className="absolute right-2 bottom-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
                <div className="text-center mt-3">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Mode dynamically builds configurations based on your requirements using Gemini and MCP Tools.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChatInterface;
