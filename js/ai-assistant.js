// AI助手功能将在这里实现
class AIAssistant {
    constructor() {
        console.log('AI Assistant initializing...'); // 调试日志
        this.initializeUI();
        this.isCollapsed = true;
        // 存储两个 API key
        this.deepseekKey = config.apiKey;
        this.qianwenKey = 'sk-57d00c3d7e0544128b9c39a04cb7cbb3';
    }

    initializeUI() {
        // 获取DOM元素
        this.aiContainer = document.getElementById('ai-assistant');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleButton = document.getElementById('toggleAI');
        this.showButton = document.getElementById('showAI');

        // 检查元素是否正确获取
        console.log('Show button:', this.showButton); // 调试日志

        // 绑定事件
        this.showButton.addEventListener('click', () => {
            console.log('Show button clicked'); // 调试日志
            this.showChat();
        });

        this.toggleButton.addEventListener('click', () => {
            console.log('Toggle button clicked'); // 调试日志
            this.toggleChat();
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 添加输入框事件
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = (this.userInput.scrollHeight) + 'px';
        });
    }

    showChat() {
        console.log('Showing chat...'); // 调试日志
        this.aiContainer.classList.add('active');
        this.showButton.style.display = 'none';
        this.isCollapsed = false;
        this.aiContainer.classList.remove('collapsed');
    }

    toggleChat() {
        console.log('Toggling chat...'); // 调试日志
        this.isCollapsed = !this.isCollapsed;
        if (this.isCollapsed) {
            this.aiContainer.classList.remove('active');
            this.showButton.style.display = 'flex';
        }
        this.aiContainer.classList.toggle('collapsed');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        const loadingId = this.addMessage('Thinking...', 'ai');

        try {
            // 首先尝试使用 Deepseek API
            let response = await this.callDeepseekAPI(message);
            
            // 如果 Deepseek 失败，尝试使用千问 API
            if (response.includes('technical difficulties')) {
                console.log('Deepseek API failed, trying Qianwen API...');
                response = await this.callQianwenAPI(message);
            }

            document.getElementById(loadingId).remove();
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Both APIs failed:', error);
            document.getElementById(loadingId).remove();
            this.addMessage('Sorry, I encountered an error. Please try again later.', 'ai');
        }
    }

    async callDeepseekAPI(message) {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.deepseekKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{
                        role: "system",
                        content: "You are a knowledgeable Sri Lanka travel assistant. Help visitors with hotel information, local attractions, travel tips, and booking assistance. Be friendly and concise."
                    }, {
                        role: "user",
                        content: message
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Deepseek API failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Deepseek API error:', error);
            return "I'm currently experiencing some technical difficulties. Trying alternative service...";
        }
    }

    async callQianwenAPI(message) {
        try {
            const response = await fetch('https://api.qianwen.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.qianwenKey}`
                },
                body: JSON.stringify({
                    model: "qwen-max",
                    messages: [{
                        role: "system",
                        content: "You are a knowledgeable Sri Lanka travel assistant. Help visitors with hotel information, local attractions, travel tips, and booking assistance. Be friendly and concise."
                    }, {
                        role: "user",
                        content: message
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Qianwen API failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Qianwen API error:', error);
            throw error;
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        const messageId = 'msg-' + Date.now();
        messageDiv.id = messageId;
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageId;
    }
}

// 初始化AI助手
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AI Assistant...'); // 调试日志
    window.aiAssistant = new AIAssistant();
});

// 后续会添加更多AI助手相关功能
``` 