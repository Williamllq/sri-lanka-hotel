// AI助手功能将在这里实现
class AIAssistant {
    constructor() {
        console.log('AI Assistant initializing...'); // 调试日志
        this.initializeUI();
        this.isCollapsed = true;
        this.apiKey = config.apiKey; // 从配置文件获取 API key
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

        // 添加用户消息
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // 显示加载状态
        const loadingId = this.addMessage('Thinking...', 'ai');

        try {
            const response = await this.callDeepseekAPI(message);
            document.getElementById(loadingId).remove();
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('API Error:', error);
            document.getElementById(loadingId).remove();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }

    async callDeepseekAPI(message) {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
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
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API request error:', error);
            // 如果 API 调用失败，返回一个友好的错误消息
            return "I'm currently experiencing some technical difficulties. In the meantime, you can reach our staff at info@srilankastay.com or call +94 123 456 789 for immediate assistance.";
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