// AI助手功能将在这里实现
class AIAssistant {
    constructor() {
        this.apiKey = 'sk-1894de68b8174a64ae18cb6bd26011ce';
        this.isActive = false;
        this.initializeUI();
    }

    initializeUI() {
        // 获取DOM元素
        this.aiContainer = document.getElementById('ai-assistant');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleButton = document.getElementById('toggleAI');

        // 绑定事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.toggleButton.addEventListener('click', () => this.toggleChat());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 添加默认欢迎消息
        this.addMessage("您好！我是您的斯里兰卡旅游助手。我可以帮您：\n1. 规划旅游路线\n2. 推荐景点美食\n3. 回答关于斯里兰卡的问题\n请问有什么我可以帮您的吗？", 'ai');
    }

    toggleChat() {
        this.aiContainer.classList.toggle('collapsed');
        const icon = this.toggleButton.querySelector('i');
        icon.classList.toggle('fa-chevron-up');
        icon.classList.toggle('fa-chevron-down');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // 显示用户消息
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // 显示加载状态
        const loadingId = this.addMessage('正在思考...', 'ai');

        try {
            const response = await this.callAPI(message);
            // 移除加载消息
            this.chatMessages.removeChild(document.getElementById(loadingId));
            // 显示AI回复
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('API调用错误:', error);
            this.chatMessages.removeChild(document.getElementById(loadingId));
            this.addMessage('抱歉，我现在无法回答您的问题。请稍后再试。', 'ai');
        }
    }

    async callAPI(message) {
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
                        content: "你是一个专业的斯里兰卡旅游助手，可以帮助游客规划行程、推荐景点和美食，并回答关于斯里兰卡的各种问题。请用简洁友好的方式回答。"
                    }, {
                        role: "user",
                        content: message
                    }]
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API请求错误:', error);
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
    window.aiAssistant = new AIAssistant();
});

// 后续会添加更多AI助手相关功能
``` 