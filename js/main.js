// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查 translations 是否正确加载
    if (typeof translations === 'undefined') {
        console.error('translations.js not loaded!');
        return;
    }

    // 获取语言选择器
    const languageSelect = document.getElementById('languageSelect');
    
    // 定义需要翻译的元素
    const translatableElements = {
        // Navigation
        navHome: {
            element: document.querySelector('a[href="#home"]'),
            icon: '<i class="fas fa-home"></i> '
        },
        navTransport: {
            element: document.querySelector('a[href="#transport"]'),
            icon: '<i class="fas fa-car"></i> '
        },
        navExplore: {
            element: document.querySelector('a[href="#explore"]'),
            icon: '<i class="fas fa-compass"></i> '
        },
        navContact: {
            element: document.querySelector('a[href="#contact"]'),
            icon: '<i class="fas fa-envelope"></i> '
        },
        
        // Hero Section
        heroTitle: {
            element: document.querySelector('.hero-content h2')
        },
        heroSubtitle: {
            element: document.querySelector('.hero-content p')
        },
        bookTransport: {
            element: document.querySelector('.hero-buttons .btn')
        },
        exploreSriLanka: {
            element: document.querySelector('.hero-buttons .btn-secondary')
        },
        
        // Why Choose Us
        whyChooseUs: {
            element: document.querySelector('#about .section-title')
        },
        aboutText: {
            element: document.querySelector('.about-text p')
        },
        support247: document.querySelector('.about-features .feature-item:nth-child(1) span'),
        pricing: document.querySelector('.about-features .feature-item:nth-child(2) span'),
        guides: document.querySelector('.about-features .feature-item:nth-child(3) span'),
        
        // Stats
        professionalDrivers: document.querySelector('.stat-item:nth-child(1) h3'),
        driversDesc: document.querySelector('.stat-item:nth-child(1) p'),
        customTours: document.querySelector('.stat-item:nth-child(2) h3'),
        toursDesc: document.querySelector('.stat-item:nth-child(2) p'),
        service247: document.querySelector('.stat-item:nth-child(3) h3'),
        serviceDesc: document.querySelector('.stat-item:nth-child(3) p'),
        
        // Transport Section
        transportServices: {
            element: document.querySelector('#transport .section-title')
        },
        sedanTitle: document.querySelector('.transport-card:nth-child(1) h3'),
        sedanDesc: document.querySelector('.transport-card:nth-child(1) p'),
        suvTitle: document.querySelector('.transport-card:nth-child(2) h3'),
        suvDesc: document.querySelector('.transport-card:nth-child(2) p'),
        vanTitle: document.querySelector('.transport-card:nth-child(3) h3'),
        vanDesc: document.querySelector('.transport-card:nth-child(3) p'),
        
        // Booking Form
        bookingTitle: document.querySelector('.booking-form h3'),
        // ... 添加更多表单元素
    };
    
    // 更新页面文本的函数
    function updatePageText(language) {
        if (!translations[language]) {
            console.error('Translation not found for language:', language);
            return;
        }

        // 更新所有可翻译元素
        for (let key in translatableElements) {
            const item = translatableElements[key];
            const translation = translations[language][key];
            
            if (item.element && translation) {
                item.element.innerHTML = (item.icon || '') + translation;
            }
        }

        // 更新表单元素
        updateFormElements(language);
    }
    
    // 更新表单元素的函数
    function updateFormElements(language) {
        const formElements = {
            serviceType: {
                label: 'serviceType',
                options: ['selectService', 'pickupService', 'privateCharter', 'cityTour']
            },
            vehicleType: {
                label: 'vehicleType',
                options: ['sedan', 'suv', 'van']
            },
            serviceDate: { label: 'date' },
            serviceTime: { label: 'time' },
            pickupLocation: { 
                label: 'pickupLocation',
                placeholder: 'enterPickup'
            },
            destination: {
                label: 'destination',
                placeholder: 'enterDestination'
            },
            requirements: {
                label: 'specialRequirements',
                placeholder: 'anyRequirements'
            }
        };

        for (let id in formElements) {
            const element = document.getElementById(id);
            if (!element) continue;

            const label = element.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.textContent = translations[language][formElements[id].label];
            }

            if (formElements[id].placeholder) {
                element.placeholder = translations[language][formElements[id].placeholder];
            }

            if (formElements[id].options) {
                const options = element.getElementsByTagName('option');
                formElements[id].options.forEach((optionKey, index) => {
                    if (options[index]) {
                        options[index].textContent = translations[language][optionKey];
                    }
                });
            }
        }
    }
    
    // 监听语言选择变化
    languageSelect.addEventListener('change', function() {
        console.log('Language changed to:', this.value);  // 调试日志
        updatePageText(this.value);
    });
    
    // 初始化页面文本
    updatePageText(languageSelect.value);

    // 获取所有需要翻译的元素
    const translatableElements = {
        'nav-home': document.querySelector('a[href="#home"]'),
        'nav-rooms': document.querySelector('a[href="#rooms"]'),
        'nav-facilities': document.querySelector('a[href="#facilities"]'),
        'nav-explore': document.querySelector('a[href="#explore"]'),
        'nav-contact': document.querySelector('a[href="#contact"]'),
        'welcome-text': document.querySelector('#home h2'),
        'experience-text': document.querySelector('#home p'),
        'book-button': document.querySelector('#home .btn'),
        'footer-title': document.querySelector('.footer-info h3'),
        'footer-desc': document.querySelector('.footer-info p')
    };

    // 保持图标的HTML
    const navIcons = {
        'nav-home': '<i class="fas fa-home"></i> ',
        'nav-rooms': '<i class="fas fa-bed"></i> ',
        'nav-facilities': '<i class="fas fa-concierge-bell"></i> ',
        'nav-explore': '<i class="fas fa-compass"></i> ',
        'nav-contact': '<i class="fas fa-envelope"></i> '
    };

    // 导航栏滚动效果
    const nav = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 图片轮播功能
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    
    let currentIndex = 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    
    // 设置幻灯片位置
    slides.forEach((slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    });
    
    // 移动幻灯片
    const moveToSlide = (track, currentIndex) => {
        track.style.transform = 'translateX(-' + currentIndex * slideWidth + 'px)';
    };
    
    // 下一张
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        moveToSlide(track, currentIndex);
    });
    
    // 上一张
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        moveToSlide(track, currentIndex);
    });
}); 