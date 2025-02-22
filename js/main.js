// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
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

    // 语言切换功能
    const languageSelect = document.querySelector('#languageSelect');
    
    // 从本地存储中获取上次选择的语言，如果没有则默认为中文
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'zh';
    languageSelect.value = savedLanguage;
    
    // 初始化页面语言
    updateLanguage(savedLanguage);

    languageSelect.addEventListener('change', function(e) {
        const selectedLanguage = e.target.value;
        updateLanguage(selectedLanguage);
        // 保存语言选择到本地存储
        localStorage.setItem('selectedLanguage', selectedLanguage);
    });

    function updateLanguage(language) {
        // 遍历所有带有 data-translate 属性的元素
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[language][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[language][key];
                } else {
                    element.textContent = translations[language][key];
                }
            }
        });

        // 更新表单选项
        updateFormOptions(language);

        // 更新导航菜单
        translatableElements['nav-home'].innerHTML = navIcons['nav-home'] + translations[language].home;
        translatableElements['nav-rooms'].innerHTML = navIcons['nav-rooms'] + translations[language].rooms;
        translatableElements['nav-facilities'].innerHTML = navIcons['nav-facilities'] + translations[language].facilities;
        translatableElements['nav-explore'].innerHTML = navIcons['nav-explore'] + translations[language].explore;
        translatableElements['nav-contact'].innerHTML = navIcons['nav-contact'] + translations[language].contact;

        // 更新主要内容
        translatableElements['welcome-text'].textContent = translations[language].welcome;
        translatableElements['experience-text'].textContent = translations[language].experience;
        translatableElements['book-button'].textContent = translations[language].bookNow;

        // 更新页脚
        translatableElements['footer-title'].textContent = translations[language].footerTitle;
        translatableElements['footer-desc'].textContent = translations[language].footerDesc;

        // 更新文档语言
        document.documentElement.lang = language;
    }

    function updateFormOptions(language) {
        // 更新服务类型选择
        const serviceType = document.getElementById('serviceType');
        if (serviceType) {
            const options = serviceType.options;
            options[0].text = translations[language].selectService;
            options[1].text = translations[language].pickupService;
            options[2].text = translations[language].privateCharter;
            options[3].text = translations[language].cityTours;
        }

        // 更新车型选择
        const vehicleType = document.getElementById('vehicleType');
        if (vehicleType) {
            const options = vehicleType.options;
            options[0].text = translations[language].sedan;
            options[1].text = translations[language].suv;
            options[2].text = translations[language].van;
            options[3].text = translations[language].luxury;
        }
    }
}); 