// AI Assistant Implementation
class AIAssistant {
    constructor() {
        console.log('AI Assistant initializing...');
        this.initializeUI();
        this.isCollapsed = true;
        this.initializeAPIs();
        
        // Welcome message shown once on initialization
        this.showWelcomeMessage();
        
        // Test API connection
        this.testAPIConnection();
    }

    initializeUI() {
        // Get DOM elements
        this.aiContainer = document.getElementById('ai-assistant');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleButton = document.getElementById('toggleAI');
        this.showButton = document.getElementById('showAI');
        this.statusIndicator = document.getElementById('aiStatus');

        console.log("ShowButton element:", this.showButton);

        // Bind events
        if (this.showButton) {
            this.showButton.addEventListener('click', () => {
                console.log('Show button clicked');
                this.showChat();
            });
        } else {
            console.error("Show button not found - check HTML structure");
        }

        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                console.log('Toggle button clicked');
                this.toggleChat();
            });
        }

        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // Add input field events
        if (this.userInput) {
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-adjust input height
            this.userInput.addEventListener('input', () => {
                this.userInput.style.height = 'auto';
                this.userInput.style.height = (this.userInput.scrollHeight) + 'px';
            });
        }

        // Clear existing messages
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
        
        // Initialize status indicator
        this.updateStatus('connecting', 'Connecting to AI...');
    }

    updateStatus(type, message) {
        if (this.statusIndicator) {
            this.statusIndicator.className = `ai-status ${type}`;
            this.statusIndicator.textContent = message;
        }
    }

    initializeAPIs() {
        // Use API configuration from config.js
        if (typeof config !== 'undefined' && config.apiKeys) {
            this.apis = config.apiKeys;
        } else {
            // Fallback if config is not available
            console.warn('Config not found, using fallback API configuration');
            this.apis = {
                deepseekV3: {
                    name: 'DeepSeek-V3',
                    url: 'https://platform.deepseek.com/v1/chat/completions',
                    key: 'sk-1f52de6f9ed24ad2b4a01ad811a4265e',
                    model: 'deepseek-chat'
                },
                deepseek: {
                    name: 'DeepSeek-R1',
                    url: 'https://platform.deepseek.com/v1/chat/completions',
                    key: 'sk-1f52de6f9ed24ad2b4a01ad811a4265e',
                    model: 'deepseek-r1'
                },
                aliyun: {
                    name: '阿里云-DeepSeek-R1',
                    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
                    key: 'sk-66c9b06e32ea46beacce3a45c13c1bc0',
                    model: 'deepseek-r1'
                }
            };
        }
        
        // Set primary and fallback API order - prioritize V3 for faster responses
        this.primaryAPI = 'deepseekV3';
        this.fallbackAPI = 'deepseek';
        this.tertiaryAPI = 'aliyun';
        this.activeAPI = null;
        
        // System prompt for travel assistant
        this.systemPrompt = "You are a knowledgeable Sri Lanka travel assistant. Help visitors with hotel information, local attractions, travel tips, and booking assistance. Be friendly, concise, and provide specific information about Sri Lanka. If asked about booking or reservations, suggest using the booking form on the website.";
    }

    async testAPIConnection() {
        this.updateStatus('connecting', 'Testing API connection...');
        
        // Simple test prompt
        const testPrompt = "Respond with just the word 'Connected' if you can receive this message.";
        
        try {
            // Test primary API (DeepSeek V3)
            console.log(`Testing primary API: ${this.apis[this.primaryAPI].name}`);
            let response = await this.callAPI(this.primaryAPI, testPrompt);
            
            if (!response || response.includes('error')) {
                // If primary fails, try secondary
                console.log(`Primary API failed, testing secondary API: ${this.apis[this.fallbackAPI].name}`);
                response = await this.callAPI(this.fallbackAPI, testPrompt);
                
                if (!response || response.includes('error')) {
                    // If secondary fails, try tertiary
                    console.log(`Secondary API failed, testing tertiary API: ${this.apis[this.tertiaryAPI].name}`);
                    response = await this.callAPI(this.tertiaryAPI, testPrompt);
                    
                    if (!response || response.includes('error')) {
                        // All APIs failed
                        this.updateStatus('error', 'Unable to connect to AI service');
                        console.error('All APIs failed connection test');
                    } else {
                        // Tertiary API succeeded
                        this.activeAPI = this.tertiaryAPI;
                        this.updateStatus('connected', `Connected to ${this.apis[this.tertiaryAPI].name}`);
                        console.log(`Connected to tertiary API: ${this.apis[this.tertiaryAPI].name}`);
                    }
                } else {
                    // Secondary API succeeded
                    this.activeAPI = this.fallbackAPI;
                    this.updateStatus('connected', `Connected to ${this.apis[this.fallbackAPI].name}`);
                    console.log(`Connected to secondary API: ${this.apis[this.fallbackAPI].name}`);
                }
            } else {
                // Primary API succeeded
                this.activeAPI = this.primaryAPI;
                this.updateStatus('connected', `Connected to ${this.apis[this.primaryAPI].name}`);
                console.log(`Connected to primary API: ${this.apis[this.primaryAPI].name}`);
            }
        } catch (error) {
            console.error('API connection test error:', error);
            this.updateStatus('error', 'Connection error: Check console for details');
        }
    }

    showWelcomeMessage() {
        // Check if welcome message exists
        if (this.chatMessages && this.chatMessages.children.length === 0) {
            const welcomeMessage = "Hello! I'm your Sri Lanka travel assistant. I can help you with: <ul><li>Hotel information</li><li>Local attractions</li><li>Travel tips</li><li>Booking assistance</li></ul>How may I assist you today?";
            
            this.addMessage(welcomeMessage, 'ai');
        }
    }

    showChat() {
        console.log('showChat method called');
        if (this.aiContainer) {
            console.log('aiContainer exists, showing chat window');
            this.aiContainer.classList.add('active');
            if (this.showButton) {
                console.log('showButton exists, hiding it');
                this.showButton.style.display = 'none';
            } else {
                console.error('showButton is null or undefined');
            }
            this.isCollapsed = false;
            this.aiContainer.classList.remove('collapsed');
            console.log('Chat window should now be visible');
        } else {
            console.error('aiContainer is null or undefined');
        }
    }

    toggleChat() {
        this.isCollapsed = !this.isCollapsed;
        if (this.isCollapsed) {
            if (this.aiContainer) {
                this.aiContainer.classList.remove('active');
            }
            if (this.showButton) {
                this.showButton.style.display = 'flex';
            }
        }
        if (this.aiContainer) {
            this.aiContainer.classList.toggle('collapsed');
        }
    }

    async sendMessage() {
        if (!this.userInput) return;
        
        const message = this.userInput.value.trim();
        if (!message) return;

        // Disable send button while processing
        if (this.sendButton) {
            this.sendButton.disabled = true;
            this.sendButton.classList.add('sending');
        }

        // Display user message
        this.addMessage(message, 'user');
        
        // Clear input and reset height
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // Add loading message
        const loadingId = this.addMessage('<i class="fas fa-spinner fa-spin"></i> Thinking...', 'ai', true);
        
        try {
            let response;
            
            // If we already know which API works, use it directly
            if (this.activeAPI) {
                console.log(`Using known working API: ${this.apis[this.activeAPI].name}`);
                const startTime = Date.now();
                response = await this.callAPI(this.activeAPI, message);
                const responseTime = Date.now() - startTime;
                console.log(`Response received in ${responseTime}ms`);
                
                // If it fails, try other APIs in priority order
                if (!response || response.includes('error')) {
                    // Try remaining APIs in priority order
                    const apiOrder = [this.primaryAPI, this.fallbackAPI, this.tertiaryAPI].filter(api => api !== this.activeAPI);
                    
                    for (const api of apiOrder) {
                        console.log(`Trying alternative API: ${this.apis[api].name}`);
                        response = await this.callAPI(api, message);
                        
                        if (!response || response.includes('error')) {
                            continue; // Try next API if available
                        } else {
                            // API succeeded
                            this.activeAPI = api;
                            this.updateStatus('connected', `Connected to ${this.apis[api].name}`);
                            break;
                        }
                    }
                    
                    // If all APIs failed
                    if (!response || response.includes('error')) {
                        response = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact our team directly for assistance.";
                        this.updateStatus('error', 'All API connections failed');
                    }
                }
            } else {
                // Try APIs in priority order if no API is known to work
                const apiOrder = [this.primaryAPI, this.fallbackAPI, this.tertiaryAPI];
                
                for (const api of apiOrder) {
                    console.log(`Trying API: ${this.apis[api].name}`);
                    response = await this.callAPI(api, message);
                    
                    if (!response || response.includes('error')) {
                        continue; // Try next API if available
                    } else {
                        // API succeeded
                        this.activeAPI = api;
                        this.updateStatus('connected', `Connected to ${this.apis[api].name}`);
                        break;
                    }
                }
                
                // If all APIs failed
                if (!response || response.includes('error')) {
                    response = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact our team directly for assistance.";
                    this.updateStatus('error', 'All API connections failed');
                }
            }
            
            // Remove loading message and add response
            this.removeMessage(loadingId);
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('Error in AI response:', error);
            this.removeMessage(loadingId);
            this.addMessage("I apologize, but I'm experiencing technical difficulties. Please try again later.", 'ai');
            this.updateStatus('error', 'Error: ' + error.message);
        } finally {
            // Re-enable send button
            if (this.sendButton) {
                this.sendButton.disabled = false;
                this.sendButton.classList.remove('sending');
            }
        }
    }

    async callAPI(apiKey, userMessage) {
        const api = this.apis[apiKey];
        
        try {
            const response = await fetch(api.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.key}`
                },
                body: JSON.stringify({
                    model: api.model,
                    messages: [
                        {
                            role: "system",
                            content: this.systemPrompt
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(`Error with ${api.name} API:`, error);
            return `error: ${error.message}`;
        }
    }

    addMessage(text, sender, isLoading = false) {
        if (!this.chatMessages) return null;
        
        const messageDiv = document.createElement('div');
        const messageId = isLoading ? 'loading-message' : `msg-${Date.now()}`;
        messageDiv.id = messageId;
        messageDiv.className = `message ${sender}-message`;
        
        // Support for markdown-like formatting
        if (!isLoading) {
            text = this.formatMessage(text);
        }
        
        messageDiv.innerHTML = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageId;
    }
    
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    formatMessage(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert basic markdown
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert lists
        if (text.includes('\n- ')) {
            let parts = text.split('\n');
            let inList = false;
            let formattedText = '';
            
            parts.forEach(part => {
                if (part.startsWith('- ')) {
                    if (!inList) {
                        formattedText += '<ul>';
                        inList = true;
                    }
                    formattedText += '<li>' + part.substring(2) + '</li>';
                } else {
                    if (inList) {
                        formattedText += '</ul>';
                        inList = false;
                    }
                    formattedText += part + '<br>';
                }
            });
            
            if (inList) {
                formattedText += '</ul>';
            }
            
            text = formattedText;
        }
        
        return text;
    }

    // Add debug method to help troubleshoot
    debug() {
        console.log('AI Assistant Debug Information:');
        console.log('- aiContainer:', this.aiContainer);
        console.log('- chatMessages:', this.chatMessages);
        console.log('- userInput:', this.userInput);
        console.log('- sendButton:', this.sendButton);
        console.log('- toggleButton:', this.toggleButton);
        console.log('- showButton:', this.showButton);
        console.log('- statusIndicator:', this.statusIndicator);
        console.log('- isCollapsed:', this.isCollapsed);
        console.log('- activeAPI:', this.activeAPI);
    }
}

// Initialize AI Assistant and add to window
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AI Assistant...');
    window.aiAssistant = new AIAssistant();
    
    // Call debug to check elements
    setTimeout(() => {
        if (window.aiAssistant) {
            window.aiAssistant.debug();
        }
    }, 1000);
}); 