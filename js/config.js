// Website Configuration
const config = {
    // API Keys
    apiKeys: {
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
    },
    
    // Website Settings
    defaultLanguage: 'en',
    websiteName: 'Sri Lanka Stay & Explore',
    
    // Contact Information
    contactPhone: '+94 XX XXX XXXX',
    contactEmail: 'info@srilankastay.com',
    contactWhatsapp: '+94 XX XXX XXXX',
    
    // Social Media
    social: {
        facebook: 'https://facebook.com/srilankastay',
        instagram: 'https://instagram.com/srilankastay',
        twitter: 'https://twitter.com/srilankastay'
    },
    
    // Transport Service Details
    transport: {
        airportTransfer: {
            basePrice: 30,
            pricePerKm: 0.5
        },
        cityTour: {
            basePrice: 50,
            fullDayPrice: 80
        },
        customJourney: {
            basePrice: 70,
            pricePerDay: 100
        }
    },
    
    // Accommodation Prices
    rooms: {
        oceanView: {
            basePrice: 250,
            currencySymbol: '$'
        },
        gardenSuite: {
            basePrice: 180,
            currencySymbol: '$'
        },
        poolVilla: {
            basePrice: 450,
            currencySymbol: '$'
        }
    }
}; 