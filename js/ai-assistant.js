// AI Assistant Implementation
class AIAssistant {
    constructor() {
        console.log('AI Assistant initializing...');
        this.initializeUI();
        this.isCollapsed = true;
        this.initializeResponses();
    }

    initializeUI() {
        // Get DOM elements
        this.aiContainer = document.getElementById('ai-assistant');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.toggleButton = document.getElementById('toggleAI');
        this.showButton = document.getElementById('showAI');

        // Bind events
        if (this.showButton) {
            this.showButton.addEventListener('click', () => {
                console.log('Show button clicked');
                this.showChat();
            });
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
    }

    initializeResponses() {
        // Predefined responses for common questions
        this.responses = {
            greetings: [
                "Hello! How can I help you with your Sri Lanka travel plans?",
                "Hi there! Welcome to Sri Lanka Stay & Explore. What can I assist you with?",
                "Greetings! I'm your Sri Lanka travel assistant. How may I help you today?"
            ],
            hotels: [
                "We offer a variety of luxurious accommodations including Ocean View Suites, Tropical Garden Suites, and Private Pool Villas. Each comes with amenities like free WiFi, air conditioning, and beautiful views.",
                "Our accommodations range from $180 to $450 per night depending on the room type. All rooms include breakfast and access to our facilities."
            ],
            transport: [
                "We offer airport transfers, city tours, and custom journeys across Sri Lanka. Our vehicles are comfortable and our drivers are experienced locals.",
                "Our transport services start from $30 for airport transfers. Custom journeys are priced based on distance and duration."
            ],
            attractions: [
                "Popular attractions in Sri Lanka include ancient temples in Anuradhapura, beautiful beaches in Mirissa, tea plantations in Nuwara Eliya, and wildlife safaris in Yala National Park.",
                "Sri Lanka is known for its beautiful landscapes, rich culture, delicious cuisine, and friendly people. You'll love exploring the island!"
            ],
            weather: [
                "Sri Lanka has a tropical climate. The best time to visit depends on which region you plan to explore. Generally, December to March is ideal for the south coast, while May to September is better for the north and east.",
                "Sri Lanka's weather is warm year-round, with temperatures typically ranging from 22°C to 30°C depending on elevation. The monsoon season affects different parts of the island at different times of the year."
            ],
            food: [
                "Sri Lankan cuisine is known for its complex flavors and generous use of spices, coconut, and rice. Must-try dishes include hoppers, kottu roti, and various curry dishes.",
                "We can accommodate dietary restrictions including vegetarian, vegan, and gluten-free options. Just let us know your preferences in advance."
            ],
            booking: [
                "To book our services, you can use the booking form on our website or contact us directly via phone or email. We require a 30% deposit to confirm your reservation.",
                "For bookings, please provide your travel dates, number of travelers, and specific requirements. We'll get back to you with availability and pricing."
            ],
            default: [
                "I'm sorry, I don't have specific information about that. Please contact us directly for more detailed assistance.",
                "That's an interesting question. For more personalized information, please email us at info@srilankastay.com or call +94 XX XXX XXXX."
            ]
        };
    }

    showChat() {
        if (this.aiContainer) {
            this.aiContainer.classList.add('active');
            if (this.showButton) {
                this.showButton.style.display = 'none';
            }
            this.isCollapsed = false;
            this.aiContainer.classList.remove('collapsed');
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

    sendMessage() {
        if (!this.userInput) return;
        
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // Add slight delay to simulate thinking
        setTimeout(() => {
            const response = this.getResponse(message);
            this.addMessage(response, 'ai');
        }, 1000);
    }

    getResponse(message) {
        message = message.toLowerCase();
        
        // Check if message matches any category
        if (this.containsAny(message, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'])) {
            return this.getRandomResponse('greetings');
        } else if (this.containsAny(message, ['hotel', 'room', 'accommodation', 'stay', 'suite', 'villa', 'lodging'])) {
            return this.getRandomResponse('hotels');
        } else if (this.containsAny(message, ['transport', 'travel', 'car', 'driver', 'airport', 'transfer', 'vehicle', 'journey'])) {
            return this.getRandomResponse('transport');
        } else if (this.containsAny(message, ['attraction', 'visit', 'see', 'sight', 'place', 'location', 'explore', 'tour'])) {
            return this.getRandomResponse('attractions');
        } else if (this.containsAny(message, ['weather', 'climate', 'temperature', 'rain', 'season', 'monsoon'])) {
            return this.getRandomResponse('weather');
        } else if (this.containsAny(message, ['food', 'eat', 'restaurant', 'meal', 'cuisine', 'dish', 'dietary', 'vegetarian', 'vegan'])) {
            return this.getRandomResponse('food');
        } else if (this.containsAny(message, ['book', 'reservation', 'reserve', 'confirm', 'booking', 'deposit', 'payment'])) {
            return this.getRandomResponse('booking');
        } else {
            return this.getRandomResponse('default');
        }
    }

    containsAny(str, keywords) {
        return keywords.some(keyword => str.includes(keyword));
    }

    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    addMessage(text, sender) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Support for markdown-like formatting
        text = this.formatMessage(text);
        
        messageDiv.innerHTML = text;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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
}

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AI Assistant...');
    window.aiAssistant = new AIAssistant();
});

// 后续会添加更多AI助手相关功能
``` 