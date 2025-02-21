// AI助手功能将在这里实现
class AIAssistant {
    constructor() {
        this.initializeUI();
        this.isCollapsed = false;
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

    toggleChat() {
        this.isCollapsed = !this.isCollapsed;
        this.aiContainer.classList.toggle('collapsed');
        const icon = this.toggleButton.querySelector('i');
        icon.classList.toggle('fa-chevron-up');
        icon.classList.toggle('fa-chevron-down');
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
            // 模拟AI响应（这里可以替换为实际的API调用）
            const response = await this.getAIResponse(message);
            
            // 移除加载消息
            document.getElementById(loadingId).remove();
            
            // 添加AI响应
            this.addMessage(response, 'ai');
        } catch (error) {
            document.getElementById(loadingId).remove();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
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

    async getAIResponse(message) {
        // 模拟API响应延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 简单的响应逻辑
        const responses = {
            'hello': 'Hello! How can I help you with your Sri Lanka travel plans?',
            'rooms': 'We offer three types of rooms: Ocean View Suite, Tropical Garden Suite, and Private Pool Villa. Which one would you like to know more about?',
            'price': 'Our room rates start from $180 per night for the Garden Suite. Would you like to know about specific room rates?',
            'location': 'We are located in a prime beach area in Colombo, Sri Lanka. Would you like directions or transportation information?',
            'default': 'I can help you with information about our rooms, facilities, local attractions, and booking assistance. What would you like to know?'
        };

        // 简单的关键词匹配
        for (let key in responses) {
            if (message.toLowerCase().includes(key)) {
                return responses[key];
            }
        }

        return responses.default;
    }
}

// 初始化AI助手
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});

// 后续会添加更多AI助手相关功能
``` 