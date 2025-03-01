/**
 * 语言切换补丁 - 解决当前语言切换问题
 * 这个脚本会覆盖其他语言脚本的功能，确保语言切换正常工作
 */

(function() {
    // 立即执行函数，防止全局变量污染
    console.log("🛠️ 语言补丁正在加载...");

    // 1. 基本配置
    const LANGUAGES = {
        'en': { name: 'English', flag: '🇬🇧' },
        'zh': { name: '中文', flag: '🇨🇳' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'si': { name: 'සිංහල', flag: '🇱🇰' }
    };

    // 2. 内置基础翻译 - 确保核心功能可用
    const TRANSLATIONS = {
        'zh': {
            // 导航
            'home': '首页',
            'transport': '交通',
            'explore': '探索',
            'contact': '联系我们',
            
            // 主页
            'hero-title': '最佳旅行 - 最佳选择',
            'hero-subtitle': '您在斯里兰卡的高级旅行体验',
            'book-transport': '预订交通',
            'explore-lanka': '探索斯里兰卡',
            
            // 交通服务
            'transport-services': '交通服务',
            'safe-comfortable': '安全舒适的车辆',
            'vehicle-desc': '整洁且维护良好的车辆，确保您在斯里兰卡旅行途中舒适',
            'passengers': '最多容纳4位乘客',
            'luggage': '大型行李空间',
            'ac': '空调',
            'safety': '安全特性',
            
            // 预订旅程
            'book-journey': '预订您的旅程',
            'deposit-info': '需要支付30%的订金来确认您的预订',
            'service-type': '服务类型',
            'select-service': '选择服务',
            'airport-transfer': '机场接送',
            'private-charter': '私人包车',
            'guided-tour': '导游团',
            'date': '日期',
            'time': '时间',
            'pickup-location': '接送地点',
            'enter-pickup': '输入接送地点',
            'destination': '目的地',
            'enter-destination': '输入目的地',
            'requirements': '特殊要求',
            'enter-requirements': '任何特殊要求？',
            
            // 探索部分
            'quality-vehicle': '高品质车辆',
            'quality-desc': '精心维护的车辆确保您旅途中的舒适与安全',
            'expert-driver': '当地专业司机',
            'driver-desc': '会讲英语的专业司机，拥有丰富的当地知识',
            'protection': '全程保障',
            'protection-desc': '全天候陪伴与安全保障',
            'insider': '内部知识',
            'insider-desc': '带您探索隐藏景点和体验真实的当地生活',
            
            // 探索斯里兰卡
            'discover-lanka': '探索斯里兰卡',
            'tea-plantations': '茶园',
            'visit-tea': '参观世界著名的锡兰茶园',
            'wildlife-safari': '野生动物之旅',
            'experience-wildlife': '体验独特的野生动物邂逅',
            'cultural-heritage': '文化遗产',
            'discover-temples': '探索古老的寺庙和历史遗迹',
            'discover-more': '发现更多',
            
            // 客户评价
            'what-clients-say': '客户评价',
            'testimonial-1': '极好的服务！司机非常专业，知识渊博。使我们在斯里兰卡的旅行难忘。',
            'testimonial-2': '车辆非常舒适，服务可靠。司机准时友好。强烈推荐！',
            'testimonial-3': '很棒的体验！司机了解所有最佳景点，帮助我们探索真实的斯里兰卡。',
            'from-uk': '来自英国',
            'from-china': '来自中国',
            'from-germany': '来自德国',
            
            // 酒店住宿
            'luxurious-accommodations': '豪华住宿',
            'ocean-suite': '海景套房',
            'ocean-desc': '醒来即可欣赏印度洋的壮丽景色',
            'garden-suite': '热带花园套房',
            'garden-desc': '沉浸在郁郁葱葱的热带花园中',
            'pool-villa': '私人泳池别墅',
            'pool-desc': '拥有私人无边泳池的终极奢华体验',
            'king-bed': '特大床',
            'queen-bed': '大床',
            'free-wifi': '免费WiFi',
            'from-price': '起价',
            'per-night': '/晚',
            
            // 联系我们
            'give-feedback': '提供反馈',
            'share-experience': '分享您的体验',
            'name': '姓名',
            'country': '国家',
            'rating': '评分',
            'your-feedback': '您的反馈',
            'submit-feedback': '提交反馈',
            
            // AI助手
            'travel-assistant': '旅行助手',
            'ai-welcome': '您好！我是您的斯里兰卡旅行助手。我可以帮助您：',
            'hotel-info': '酒店信息',
            'local-attractions': '当地景点',
            'travel-tips': '旅行提示',
            'booking-assistance': '预订帮助',
            'how-assist': '我今天能为您做些什么？',
            'ask-anything': '关于斯里兰卡，您可以问我任何问题...',
            'need-help': '需要帮助？'
        },
        'de': {
            'home': 'Startseite',
            'transport': 'Transport',
            'explore': 'Entdecken',
            'contact': 'Kontakt',
            'hero-title': 'Beste Reise - Beste Wahl',
            'hero-subtitle': 'Ihr Premium-Reiseerlebnis in Sri Lanka',
            'book-transport': 'Transport buchen',
            'explore-lanka': 'Sri Lanka entdecken',
            'transport-services': 'Transportdienstleistungen',
            'discover-lanka': 'Entdecken Sie Sri Lanka',
            'need-help': 'Brauchen Sie Hilfe?'
        },
        'fr': {
            'home': 'Accueil',
            'transport': 'Transport',
            'explore': 'Explorer',
            'contact': 'Contact',
            'hero-title': 'Meilleur Voyage - Meilleur Choix',
            'hero-subtitle': 'Votre expérience de voyage premium au Sri Lanka',
            'book-transport': 'Réserver un transport',
            'explore-lanka': 'Explorer le Sri Lanka',
            'transport-services': 'Services de transport',
            'discover-lanka': 'Découvrez le Sri Lanka',
            'need-help': 'Besoin d\'aide?'
        },
        'es': {
            'home': 'Inicio',
            'transport': 'Transporte',
            'explore': 'Explorar',
            'contact': 'Contacto',
            'hero-title': 'Mejor Viaje - Mejor Elección',
            'hero-subtitle': 'Su experiencia de viaje premium en Sri Lanka',
            'book-transport': 'Reservar transporte',
            'explore-lanka': 'Explorar Sri Lanka',
            'transport-services': 'Servicios de transporte',
            'discover-lanka': 'Descubra Sri Lanka',
            'need-help': '¿Necesita ayuda?'
        },
        'si': {
            'home': 'මුල් පිටුව',
            'transport': 'ප්‍රවාහනය',
            'explore': 'ගවේෂණය',
            'contact': 'සම්බන්ධ වන්න',
            'hero-title': 'හොඳම ගමන - හොඳම තේරීම',
            'hero-subtitle': 'ශ්‍රී ලංකාවේ ඔබේ ප්‍රීමියම් සංචාරක අත්දැකීම',
            'book-transport': 'ප්‍රවාහනය වෙන් කරන්න',
            'explore-lanka': 'ශ්‍රී ලංකාව ගවේෂණය කරන්න',
            'transport-services': 'ප්‍රවාහන සේවා',
            'discover-lanka': 'ශ්‍රී ලංකාව සොයා ගන්න',
            'need-help': 'උදව් අවශ්‍යද?'
        }
    };

    // 3. 初始化 - 等待页面完全加载后运行
    function initPatch() {
        console.log("🔄 初始化语言补丁...");
        
        // 清理页面上的所有额外语言选择器
        cleanupLanguageSelectors();
        
        // 创建正确的语言选择器（在导航栏中创建下拉菜单）
        createNavbarLanguageSelector();
        
        // 初始化当前语言 (从本地存储或默认为英语)
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 强制重新应用翻译，确保整个页面都被翻译
        setTimeout(() => {
            applyTranslation(currentLang, true);
        }, 300);
        
        // 增加data-i18n属性到未标记的元素
        setTimeout(() => {
            addMissingI18nAttributes();
        }, 500);
        
        console.log("✅ 语言补丁初始化完成!");
    }

    // 4. 清除多余语言选择器
    function cleanupLanguageSelectors() {
        console.log("🧹 清理多余的语言选择器...");
        
        // 移除之前创建的任何语言选择器
        const selectorsToRemove = [
            document.getElementById('floating-language-panel'),
            document.getElementById('floating-language-switcher'),
            document.getElementById('language-buttons'),
            document.getElementById('topLanguageSelect')
        ];
        
        selectorsToRemove.forEach(selector => {
            if (selector) {
                selector.remove();
                console.log("删除了语言选择器元素");
            }
        });
        
        // 移除顶部导航栏中下拉菜单
        const navLangSwitch = document.querySelector('.language-switch');
        if (navLangSwitch) {
            // 清空内容，但保留容器
            navLangSwitch.innerHTML = '';
            
            // 如果有select下拉框，将其移除
            const selectElements = navLangSwitch.querySelectorAll('select');
            selectElements.forEach(select => {
                select.remove();
            });
            
            console.log("清空了导航栏语言选择器");
        }
    }
    
    // 5. 在导航栏创建下拉菜单语言选择器
    function createNavbarLanguageSelector() {
        console.log("🔨 创建导航栏语言选择器...");
        
        const navLangSwitch = document.querySelector('.language-switch');
        if (!navLangSwitch) {
            console.error("未找到导航栏语言选择器容器");
            return;
        }
        
        // 创建下拉选择框
        const select = document.createElement('select');
        select.id = 'navLanguageSelect';
        
        // 添加样式
        select.style.cssText = `
            padding: 5px 28px 5px 8px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
            background-repeat: no-repeat;
            background-position: right 5px center;
            cursor: pointer;
            font-size: 14px;
        `;
        
        // 获取当前选择的语言
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 添加选项
        Object.keys(LANGUAGES).forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
            option.selected = (code === currentLang);
            select.appendChild(option);
        });
        
        // 添加事件监听器
        select.addEventListener('change', function() {
            switchLanguage(this.value);
        });
        
        // 添加到导航栏
        navLangSwitch.appendChild(select);
        console.log("✅ 创建了导航栏语言选择器");
    }
    
    // 6. 为未标记的元素添加data-i18n属性
    function addMissingI18nAttributes() {
        console.log("🔍 检查未标记的元素并添加data-i18n属性...");
        
        // 查找页面中的主要标题和段落
        const sections = [
            { selector: 'h2.section-title:not([data-i18n])', keyPrefix: 'section-title-' },
            { selector: 'h3:not([data-i18n])', keyPrefix: 'heading-' }, 
            { selector: '.explore-content h3:not([data-i18n])', keyPrefix: 'explore-' },
            { selector: '.explore-content p:not([data-i18n])', keyPrefix: 'explore-desc-' },
            { selector: '.testimonial-content p:not([data-i18n])', keyPrefix: 'testimonial-' },
            { selector: '.author-info p:not([data-i18n])', keyPrefix: 'author-' },
            { selector: '.room-card h3:not([data-i18n])', keyPrefix: 'room-' },
            { selector: '.room-card p:not([data-i18n])', keyPrefix: 'room-desc-' },
            { selector: '.room-details span:not([data-i18n])', keyPrefix: 'room-feature-' },
            { selector: '.btn-secondary:not([data-i18n])', keyPrefix: 'btn-' }
        ];
        
        let addedCount = 0;
        
        // 处理每个选择器
        sections.forEach(section => {
            const elements = document.querySelectorAll(section.selector);
            
            elements.forEach((el, index) => {
                // 创建唯一键名
                const key = `${section.keyPrefix}${index}`;
                
                // 保存原始文本
                const originalText = el.textContent.trim();
                
                // 设置data-i18n属性
                el.setAttribute('data-i18n', key);
                
                // 保存默认英文文本
                el.setAttribute('data-default-text', originalText);
                
                // 尝试翻译此元素
                const currentLang = localStorage.getItem('selectedLanguage') || 'en';
                if (currentLang !== 'en' && TRANSLATIONS[currentLang]) {
                    // 为当前语言添加这个键值对到翻译对象
                    if (!TRANSLATIONS[currentLang][key]) {
                        // 如果我们没有翻译，暂时保留英文
                        // 这里可以根据需要调用在线翻译API
                    }
                }
                
                addedCount++;
            });
        });
        
        console.log(`✅ 添加了 ${addedCount} 个data-i18n属性`);
        
        // 再次应用当前语言翻译
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLang !== 'en') {
            applyTranslation(currentLang, false);
        }
    }
    
    // 7. 切换语言
    function switchLanguage(lang) {
        console.log(`🔄 切换语言到: ${lang}`);
        
        if (!LANGUAGES[lang]) {
            console.error(`不支持的语言: ${lang}`);
            return;
        }
        
        // 保存语言设置
        localStorage.setItem('selectedLanguage', lang);
        
        // 更新导航栏下拉菜单
        const navSelect = document.getElementById('navLanguageSelect');
        if (navSelect) {
            navSelect.value = lang;
        }
        
        // 应用翻译，强制刷新
        applyTranslation(lang, true);
        
        // 显示通知
        showNotification(`已切换到 ${LANGUAGES[lang].flag} ${LANGUAGES[lang].name}`);
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    // 8. 应用翻译
    function applyTranslation(lang, forceRefresh = false) {
        console.log(`📝 应用 ${lang} 语言翻译...${forceRefresh ? '(强制刷新)' : ''}`);
        
        // 默认为英语 - 不需要翻译
        if (lang === 'en') {
            resetToEnglish();
            return;
        }
        
        // 获取翻译数据
        let translations = {};
        
        // 首先尝试使用内置翻译
        if (TRANSLATIONS[lang]) {
            translations = {...TRANSLATIONS[lang]};
            console.log("使用内置翻译数据");
        }
        
        // 然后合并全局翻译数据(如果存在)
        if (window.translations && window.translations[lang]) {
            translations = {...translations, ...window.translations[lang]};
            console.log("合并全局翻译数据");
        }
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`找到 ${elements.length} 个需要翻译的元素`);
        
        // 应用翻译
        let translatedCount = 0;
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            
            // 确保在第一次翻译之前保存原始英文
            if (!el.hasAttribute('data-default-text')) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.setAttribute('data-default-text', el.placeholder);
                } else if (el.tagName === 'OPTION') {
                    el.setAttribute('data-default-text', el.text);
                } else {
                    el.setAttribute('data-default-text', el.textContent);
                }
            }
            
            // 应用翻译
            if (translations[key]) {
                // 对于输入元素，设置占位符
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = translations[key];
                }
                // 对于选择框选项
                else if (el.tagName === 'OPTION') {
                    el.text = translations[key];
                }
                // 普通元素设置文本内容
                else {
                    el.textContent = translations[key];
                }
                translatedCount++;
            } else {
                if (forceRefresh) console.log(`⚠️ 未找到翻译: ${key}`);
            }
        });
        
        console.log(`✅ 翻译了 ${translatedCount} 个元素`);
        
        // 强制重绘以确保所有内容更新
        if (forceRefresh) {
            document.body.style.opacity = '0.99';
            setTimeout(() => { 
                document.body.style.opacity = '1';
                // 二次尝试翻译，处理动态加载的元素
                setTimeout(() => {
                    const secondElements = document.querySelectorAll('[data-i18n]');
                    if (secondElements.length > elements.length) {
                        console.log(`发现 ${secondElements.length - elements.length} 个新元素，重新应用翻译`);
                        applyTranslation(lang, false);
                    }
                }, 200);
            }, 50);
        }
    }
    
    // 9. 重置为英文
    function resetToEnglish() {
        console.log("🔄 重置为英文原文...");
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        
        // 恢复原始英文内容
        elements.forEach(el => {
            // 获取默认的英文文本（存储在 data-default-text 属性中）
            const defaultText = el.getAttribute('data-default-text');
            
            if (defaultText) {
                // 如果有存储的默认文本，使用它
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = defaultText;
                } else if (el.tagName === 'OPTION') {
                    el.text = defaultText;
                } else {
                    el.textContent = defaultText;
                }
            }
        });
        
        console.log("✅ 已重置为英文原文");
        
        // 强制重绘
        document.body.style.opacity = '0.99';
        setTimeout(() => { document.body.style.opacity = '1'; }, 50);
    }
    
    // 10. 显示通知
    function showNotification(message) {
        // 创建或获取通知元素
        let notification = document.getElementById('language-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'language-notification';
            notification.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-size: 14px;
            `;
            document.body.appendChild(notification);
        }
        
        // 显示消息
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }
    
    // 11. 导出全局函数
    window.switchLanguage = switchLanguage;
    
    // 12. 启动补丁
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPatch);
    } else {
        // 页面已加载，立即执行
        initPatch();
        
        // 500ms后再执行一次，确保翻译应用到所有元素
        setTimeout(initPatch, 500);
    }
    
    // 13. 定期检查DOM变化并应用当前语言
    setInterval(() => {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLang !== 'en') {
            // 重新应用当前非英语语言，不需要强制刷新
            applyTranslation(currentLang, false);
        }
    }, 2000);

    console.log("🔌 语言补丁已加载，等待初始化...");
})(); 