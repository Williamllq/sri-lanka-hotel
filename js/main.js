// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取语言选择器
    const languageSelect = document.getElementById('languageSelect');
    
    // 获取所有需要翻译的元素
    const translatableElements = {
        // Hero Section
        heroTitle: document.querySelector('.hero-content h2'),
        heroSubtitle: document.querySelector('.hero-content p'),
        bookTransport: document.querySelector('.hero-buttons .btn'),
        exploreSriLanka: document.querySelector('.hero-buttons .btn-secondary'),
        
        // Why Choose Us
        whyChooseUs: document.querySelector('#about .section-title'),
        aboutText: document.querySelector('.about-text p'),
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
        transportServices: document.querySelector('#transport .section-title'),
        // ... 添加更多元素
    };
    
    // 更新页面文本的函数
    function updatePageText(language) {
        for (let key in translatableElements) {
            if (translatableElements[key] && translations[language][key]) {
                translatableElements[key].textContent = translations[language][key];
            }
        }
        
        // 更新导航链接
        document.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (translations[language][href]) {
                const icon = link.querySelector('i').outerHTML; // 保存图标
                link.innerHTML = icon + ' ' + translations[language][href];
            }
        });
        
        // 更新表单元素
        updateFormElements(language);
    }
    
    // 更新表单元素的函数
    function updateFormElements(language) {
        // 更新选择框选项
        const serviceType = document.getElementById('serviceType');
        if (serviceType) {
            serviceType.options[0].text = translations[language].selectService;
            serviceType.options[1].text = translations[language].pickupService;
            serviceType.options[2].text = translations[language].privateCharter;
            serviceType.options[3].text = translations[language].cityTour;
        }
        
        // 更新标签和占位符
        const formLabels = {
            'serviceType': 'serviceType',
            'vehicleType': 'vehicleType',
            'serviceDate': 'date',
            'serviceTime': 'time',
            'pickupLocation': 'pickupLocation',
            'destination': 'destination',
            'requirements': 'specialRequirements'
        };
        
        for (let id in formLabels) {
            const element = document.getElementById(id);
            if (element) {
                const label = element.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.textContent = translations[language][formLabels[id]];
                }
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[language]['enter' + formLabels[id].charAt(0).toUpperCase() + formLabels[id].slice(1)];
                }
            }
        }
    }
    
    // 监听语言选择变化
    languageSelect.addEventListener('change', function() {
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