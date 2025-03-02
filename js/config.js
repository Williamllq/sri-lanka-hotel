// Website Configuration
const config = {
    // Google Maps API Key
    googleMapsApiKey: "AIzaSyDcU6-4g0cU8o67iRz1H5HQs9sxwGJsjX0",
    
    // Base location for fare calculations
    baseLocation: {
        lat: 6.927079,
        lng: 79.861244,
        name: "Colombo"
    },
    
    // Fare calculation settings
    fareSettings: {
        baseFare: 500, // Base fare in LKR
        perKm: 150,    // Price per km in LKR
        currency: "LKR" // Sri Lankan Rupee
    },
    
    // API Keys
    apiKeys: {
        // DeepSeek V3 API (优先使用)
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