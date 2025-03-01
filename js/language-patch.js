/**
 * 语言切换补丁 - 完全重构版
 * 使用更接近标准i18n框架的实现方式
 * 版本: 3.0 - 专业标准化版
 */

(function() {
    // 立即执行函数，防止全局变量污染
    console.log("🚀 专业标准版语言补丁正在加载...");

    // 1. 语言配置
    const LANGUAGES = {
        'en': { name: 'English', flag: '🇬🇧' },
        'zh': { name: '中文', flag: '🇨🇳' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'si': { name: 'සිංහල', flag: '🇱🇰' }
    };

    // 2. 翻译资源对象 - 基础上保持不变
    const TRANSLATIONS = {
        'zh': {
            // ... 保持原来的中文翻译
        },
        'de': {
            // ... 保持原来的德语翻译
        },
        'fr': {
            // ... 保持原来的法语翻译
        },
        'es': {
            // ... 保持原来的西班牙语翻译  
        },
        'si': {
            // ... 保持原来的僧伽罗语翻译
        }
    };

    // 3. 全局状态管理
    const I18N = {
        // 当前语言
        currentLanguage: 'en',
        
        // 所有注册的翻译元素
        registeredElements: new Map(),
        
        // 初始化
        init: function() {
            this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
            document.documentElement.lang = this.currentLanguage;
            
            this.addStyles();
            this.setupLanguageSelector();
            this.scanAndRegisterElements();
            this.applyTranslations();
            this.setupMutationObserver();
            
            // 应用初始语言
            this.setLanguage(this.currentLanguage, false);
            
            console.log(`I18N初始化完成，当前语言: ${this.currentLanguage}`);
        },
        
        // 添加CSS样式
        addStyles: function() {
            const css = `
                .i18n-transition {
                    transition: opacity 0.3s ease;
                    opacity: 0.7;
                }
                
                #language-notification {
                    position: fixed;
                    top: 70px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    font-weight: 500;
                }
                
                .language-selector select {
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
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },
        
        // 创建语言选择器
        setupLanguageSelector: function() {
            // 清理现有选择器
            document.querySelectorAll('.language-selector,.language-switch select').forEach(el => {
                el.innerHTML = '';
            });
            
            const langSwitch = document.querySelector('.language-switch');
            if (!langSwitch) return;
            
            const select = document.createElement('select');
            select.className = 'language-selector';
            select.id = 'language-selector';
            
            Object.keys(LANGUAGES).forEach(code => {
                const option = document.createElement('option');
                option.value = code;
                option.text = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
                option.selected = code === this.currentLanguage;
                select.appendChild(option);
            });
            
            select.addEventListener('change', () => {
                this.setLanguage(select.value);
            });
            
            langSwitch.appendChild(select);
        },
        
        // 扫描并注册可翻译元素
        scanAndRegisterElements: function() {
            // 清除现有注册
            this.registeredElements.clear();
            
            // 1. 注册有data-i18n属性的元素
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                
                // 保存原始文本
                if (!el.hasAttribute('data-original-text')) {
                    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                        el.setAttribute('data-original-text', el.placeholder);
                    } else {
                        el.setAttribute('data-original-text', el.textContent);
                    }
                }
                
                this.registeredElements.set(el, {
                    key: key,
                    originalText: el.getAttribute('data-original-text')
                });
            });
            
            // 2. 自动标记未标记但需要翻译的元素
            this.autoMarkElements();
            
            console.log(`注册了 ${this.registeredElements.size} 个可翻译元素`);
        },
        
        // 自动标记需要翻译的元素
        autoMarkElements: function() {
            // 常见需要翻译的元素选择器
            const selectors = [
                'h1:not([data-i18n])',
                'h2:not([data-i18n])',
                'h3:not([data-i18n])',
                'p:not([data-i18n]):not(.no-translate)',
                'button:not([data-i18n])',
                'label:not([data-i18n])',
                '.section-title:not([data-i18n])',
                '.btn:not([data-i18n])',
                '.feature-item span:not([data-i18n])'
            ];
            
            document.querySelectorAll(selectors.join(',')).forEach(el => {
                // 跳过空元素
                const text = el.textContent.trim();
                if (!text || text.length < 2) return;
                
                // 跳过不需要翻译的元素
                if (el.closest('.no-translate') || el.classList.contains('no-translate')) return;
                
                // 为元素创建唯一键
                const key = this.createKeyFromText(text);
                
                // 设置属性
                el.setAttribute('data-i18n', key);
                el.setAttribute('data-original-text', text);
                
                // 注册元素
                this.registeredElements.set(el, {
                    key: key,
                    originalText: text
                });
                
                // 为预订表单等特殊区域设置额外标记
                this.markSpecialElements(el, key, text);
            });
        },
        
        // 标记特殊区域的元素（预订表单、车辆信息等）
        markSpecialElements: function(el, key, text) {
            // 预订表单标题
            if (el.tagName === 'H2' && (text.includes('Book Your') || text.includes('ඔබේ ගමන'))) {
                el.setAttribute('data-special-section', 'booking-title');
                el.setAttribute('data-i18n', 'book-your-journey');
            }
            
            // 预订表单相关文本
            if (el.closest('.booking-container')) {
                // 检查是否是表单标签
                if (el.tagName === 'LABEL') {
                    const forAttr = el.getAttribute('for');
                    
                    // 根据for属性识别表单字段并设置相应翻译键
                    if (forAttr === 'serviceType') {
                        el.setAttribute('data-i18n', 'service-type');
                    } else if (forAttr === 'date') {
                        el.setAttribute('data-i18n', 'date');
                    } else if (forAttr === 'time') {
                        el.setAttribute('data-i18n', 'time');
                    } else if (forAttr === 'passengers') {
                        el.setAttribute('data-i18n', 'passengers');
                    } else if (forAttr === 'pickupLocation') {
                        el.setAttribute('data-i18n', 'pickup-location');
                    } else if (forAttr === 'destination') {
                        el.setAttribute('data-i18n', 'destination');
                    } else if (forAttr === 'specialRequirements') {
                        el.setAttribute('data-i18n', 'special-requirements');
                    }
                }
                
                // 处理按钮
                if (el.tagName === 'BUTTON') {
                    if (text.includes('Get Quote') || text.includes('ගණන්')) {
                        el.setAttribute('data-i18n', 'get-quote');
                    } else if (text.includes('Book Now') || text.includes('වෙන් කරන්න')) {
                        el.setAttribute('data-i18n', 'book-now');
                    }
                }
            }
            
            // 车辆信息
            if (el.closest('.vehicle-info') || el.parentElement && el.parentElement.classList.contains('feature-item')) {
                if (el.tagName === 'H2' && text.includes('Vehicle')) {
                    el.setAttribute('data-i18n', 'safe-comfortable');
                } else if (el.tagName === 'P' && text.includes('journey')) {
                    el.setAttribute('data-i18n', 'vehicle-desc');
                } else if (text.includes('passenger')) {
                    el.setAttribute('data-i18n', 'passengers');
                } else if (text.includes('luggage')) {
                    el.setAttribute('data-i18n', 'luggage');
                } else if (text.includes('conditioning')) {
                    el.setAttribute('data-i18n', 'ac');
                } else if (text.includes('safety')) {
                    el.setAttribute('data-i18n', 'safety');
                }
            }
        },
        
        // 从文本创建翻译键
        createKeyFromText: function(text) {
            // 创建简化的键
            let key = text.toLowerCase()
                .replace(/[^a-z0-9]/gi, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 30);
            
            // 检查是否已有匹配的键
            for (const lang in TRANSLATIONS) {
                for (const existingKey in TRANSLATIONS[lang]) {
                    if (TRANSLATIONS[lang][existingKey] === text) {
                        return existingKey;
                    }
                }
            }
            
            return key;
        },
        
        // 应用翻译到所有注册元素
        applyTranslations: function() {
            // 确保在翻译前页面设置为过渡状态
            document.documentElement.classList.add('i18n-transition');
            
            // 获取当前语言的翻译
            const translations = TRANSLATIONS[this.currentLanguage];
            if (!translations && this.currentLanguage !== 'en') {
                console.error(`未找到 ${this.currentLanguage} 的翻译`);
                return;
            }
            
            // 如果是英语，重置为原始文本
            if (this.currentLanguage === 'en') {
                this.resetToEnglish();
                return;
            }
            
            // 获取预订表单相关元素统一处理
            this.processBookingForm();
            
            // 处理所有注册的元素
            this.registeredElements.forEach((info, el) => {
                const key = info.key;
                
                // 如果有匹配的翻译
                if (translations && translations[key]) {
                    // 根据元素类型应用翻译
                    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                        el.placeholder = translations[key];
                    } else if (el.tagName === 'OPTION') {
                        el.text = translations[key];
                    } else {
                        el.textContent = translations[key];
                    }
                    
                    // 标记为已翻译
                    el.setAttribute('data-translated', 'true');
                }
            });
            
            // 处理表单特殊元素
            this.processFormElements();
            
            // 处理特殊结构
            this.processSpecialStructures();
            
            // 结束过渡
            setTimeout(() => {
                document.documentElement.classList.remove('i18n-transition');
            }, 300);
            
            console.log(`已应用 ${this.currentLanguage} 的翻译`);
        },
        
        // 处理预订表单，确保完全翻译
        processBookingForm: function() {
            // 预订表单容器
            const bookingContainer = document.querySelector('.booking-container');
            if (!bookingContainer) return;
            
            const lang = this.currentLanguage;
            const translations = TRANSLATIONS[lang];
            if (!translations) return;
            
            // 标题
            const title = bookingContainer.querySelector('h2');
            if (title && translations['book-your-journey']) {
                title.textContent = translations['book-your-journey'];
                title.setAttribute('data-translated', 'true');
            }
            
            // 副标题（定金信息）
            const subtitle = bookingContainer.querySelector('.deposit-info');
            if (subtitle && translations['deposit-required']) {
                subtitle.textContent = translations['deposit-required'];
                subtitle.setAttribute('data-translated', 'true');
            }
            
            // 服务类型
            const serviceTypeLabel = bookingContainer.querySelector('label[for="serviceType"]');
            if (serviceTypeLabel && translations['service-type']) {
                serviceTypeLabel.textContent = translations['service-type'];
                serviceTypeLabel.setAttribute('data-translated', 'true');
            }
            
            // 日期和时间
            const dateLabel = bookingContainer.querySelector('label[for="date"]');
            if (dateLabel && translations['date']) {
                dateLabel.textContent = translations['date'];
                dateLabel.setAttribute('data-translated', 'true');
            }
            
            const timeLabel = bookingContainer.querySelector('label[for="time"]');
            if (timeLabel && translations['time']) {
                timeLabel.textContent = translations['time'];
                timeLabel.setAttribute('data-translated', 'true');
            }
            
            // 乘客
            const passengersLabel = bookingContainer.querySelector('label[for="passengers"]');
            if (passengersLabel && translations['passengers']) {
                passengersLabel.textContent = translations['passengers'];
                passengersLabel.setAttribute('data-translated', 'true');
            }
            
            // 接送地点
            const pickupLabel = bookingContainer.querySelector('label[for="pickupLocation"]');
            if (pickupLabel && translations['pickup-location']) {
                pickupLabel.textContent = translations['pickup-location'];
                pickupLabel.setAttribute('data-translated', 'true');
            }
            
            // 目的地
            const destinationLabel = bookingContainer.querySelector('label[for="destination"]');
            if (destinationLabel && translations['destination']) {
                destinationLabel.textContent = translations['destination'];
                destinationLabel.setAttribute('data-translated', 'true');
            }
            
            // 特殊要求
            const requirementsLabel = bookingContainer.querySelector('label[for="specialRequirements"]');
            if (requirementsLabel && translations['special-requirements']) {
                requirementsLabel.textContent = translations['special-requirements'];
                requirementsLabel.setAttribute('data-translated', 'true');
            }
            
            // 处理按钮
            const quoteBtn = bookingContainer.querySelector('button:nth-of-type(1)');
            if (quoteBtn && translations['get-quote']) {
                quoteBtn.textContent = translations['get-quote'];
                quoteBtn.setAttribute('data-translated', 'true');
            }
            
            const bookBtn = bookingContainer.querySelector('button:nth-of-type(2)');
            if (bookBtn && translations['book-now']) {
                bookBtn.textContent = translations['book-now'];
                bookBtn.setAttribute('data-translated', 'true');
            }
        },
        
        // 处理表单元素（下拉框、输入框等）
        processFormElements: function() {
            const lang = this.currentLanguage;
            const translations = TRANSLATIONS[lang];
            if (!translations) return;
            
            // 服务类型下拉框
            const serviceType = document.querySelector('#serviceType');
            if (serviceType) {
                const defaultOption = serviceType.querySelector('option[value=""]');
                if (defaultOption && translations['select-service']) {
                    defaultOption.textContent = translations['select-service'];
                }
                serviceType.setAttribute('data-translated', 'true');
            }
            
            // 接送地点输入框
            const pickupLocation = document.querySelector('#pickupLocation');
            if (pickupLocation && translations['enter-pickup']) {
                pickupLocation.placeholder = translations['enter-pickup'];
                pickupLocation.setAttribute('data-translated', 'true');
            }
            
            // 目的地输入框
            const destination = document.querySelector('#destination');
            if (destination && translations['enter-destination']) {
                destination.placeholder = translations['enter-destination'];
                destination.setAttribute('data-translated', 'true');
            }
            
            // 特殊要求文本框
            const specialRequirements = document.querySelector('#specialRequirements');
            if (specialRequirements && translations['any-requirements']) {
                specialRequirements.placeholder = translations['any-requirements'];
                specialRequirements.setAttribute('data-translated', 'true');
            }
        },
        
        // 处理特殊结构（探索卡片、房间卡片等）
        processSpecialStructures: function() {
            const lang = this.currentLanguage;
            const translations = TRANSLATIONS[lang];
            if (!translations) return;
            
            // 探索卡片
            document.querySelectorAll('.explore-card').forEach(card => {
                const title = card.querySelector('h3');
                const desc = card.querySelector('p');
                
                if (title) {
                    const text = title.textContent.trim();
                    if ((text === 'Tea Plantations' || text === '茶园') && translations['tea-plantations']) {
                        title.textContent = translations['tea-plantations'];
                        title.setAttribute('data-translated', 'true');
                    } else if ((text === 'Wildlife Safari' || text === '野生动物之旅') && translations['wildlife-safari']) {
                        title.textContent = translations['wildlife-safari'];
                        title.setAttribute('data-translated', 'true');
                    } else if ((text === 'Cultural Heritage' || text === '文化遗产') && translations['cultural-heritage']) {
                        title.textContent = translations['cultural-heritage'];
                        title.setAttribute('data-translated', 'true');
                    }
                }
                
                if (desc) {
                    const text = desc.textContent.trim();
                    if (text.includes('Ceylon tea') && translations['visit-tea']) {
                        desc.textContent = translations['visit-tea'];
                        desc.setAttribute('data-translated', 'true');
                    } else if (text.includes('wildlife') && translations['experience-wildlife']) {
                        desc.textContent = translations['experience-wildlife'];
                        desc.setAttribute('data-translated', 'true');
                    } else if (text.includes('temples') && translations['discover-temples']) {
                        desc.textContent = translations['discover-temples'];
                        desc.setAttribute('data-translated', 'true');
                    }
                }
            });
            
            // 房间卡片
            document.querySelectorAll('.room-card').forEach(card => {
                const title = card.querySelector('h3');
                const desc = card.querySelector('p');
                
                if (title) {
                    const text = title.textContent.trim();
                    if (text === 'Ocean View Suite' && translations['ocean-suite']) {
                        title.textContent = translations['ocean-suite'];
                        title.setAttribute('data-translated', 'true');
                    } else if (text === 'Tropical Garden Suite' && translations['garden-suite']) {
                        title.textContent = translations['garden-suite'];
                        title.setAttribute('data-translated', 'true');
                    } else if (text === 'Private Pool Villa' && translations['pool-villa']) {
                        title.textContent = translations['pool-villa'];
                        title.setAttribute('data-translated', 'true');
                    }
                }
                
                if (desc) {
                    const text = desc.textContent.trim();
                    if (text.includes('Indian Ocean') && translations['ocean-desc']) {
                        desc.textContent = translations['ocean-desc'];
                        desc.setAttribute('data-translated', 'true');
                    } else if (text.includes('tropical gardens') && translations['garden-desc']) {
                        desc.textContent = translations['garden-desc'];
                        desc.setAttribute('data-translated', 'true');
                    } else if (text.includes('infinity pool') && translations['pool-desc']) {
                        desc.textContent = translations['pool-desc'];
                        desc.setAttribute('data-translated', 'true');
                    }
                }
            });
            
            // 车辆特点
            document.querySelectorAll('.feature-item, .features').forEach(container => {
                container.querySelectorAll('span').forEach(span => {
                    const text = span.textContent.trim().toLowerCase();
                    
                    if (text.includes('passenger') && translations['passengers']) {
                        span.textContent = translations['passengers'];
                        span.setAttribute('data-translated', 'true');
                    } else if ((text.includes('luggage') || text.includes('baggage')) && translations['luggage']) {
                        span.textContent = translations['luggage'];
                        span.setAttribute('data-translated', 'true');
                    } else if ((text.includes('air') || text.includes('a/c')) && translations['ac']) {
                        span.textContent = translations['ac'];
                        span.setAttribute('data-translated', 'true');
                    } else if (text.includes('safety') && translations['safety']) {
                        span.textContent = translations['safety'];
                        span.setAttribute('data-translated', 'true');
                    }
                });
            });
            
            // AI助手
            document.querySelectorAll('.ai-message').forEach(msg => {
                if (msg.textContent.includes("I'm your Sri Lanka travel assistant")) {
                    if (translations['ai-welcome']) {
                        msg.innerHTML = translations['ai-welcome'];
                        
                        if (translations['hotel-info'] && 
                            translations['local-attractions'] && 
                            translations['travel-tips'] && 
                            translations['booking-assistance']) {
                            
                            msg.innerHTML += '<ul>' +
                                `<li>${translations['hotel-info']}</li>` +
                                `<li>${translations['local-attractions']}</li>` +
                                `<li>${translations['travel-tips']}</li>` +
                                `<li>${translations['booking-assistance']}</li>` +
                                '</ul>';
                            
                            msg.innerHTML += translations['how-assist'] || 'How may I assist you today?';
                        }
                        
                        msg.setAttribute('data-translated', 'true');
                    }
                }
            });
        },
        
        // 重置为英语原文
        resetToEnglish: function() {
            this.registeredElements.forEach((info, el) => {
                const originalText = info.originalText;
                if (originalText) {
                    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                        el.placeholder = originalText;
                    } else if (el.tagName === 'OPTION') {
                        el.text = originalText;
                    } else {
                        el.textContent = originalText;
                    }
                }
            });
            
            // 移除所有翻译标记
            document.querySelectorAll('[data-translated]').forEach(el => {
                el.removeAttribute('data-translated');
            });
            
            console.log('已重置为英文');
        },
        
        // 设置语言并应用翻译
        setLanguage: function(lang, showNotification = true) {
            if (!LANGUAGES[lang]) {
                console.error(`不支持的语言: ${lang}`);
                return;
            }
            
            // 更新全局状态
            this.currentLanguage = lang;
            
            // 保存设置
            localStorage.setItem('selectedLanguage', lang);
            
            // 更新文档语言属性
            document.documentElement.lang = lang;
            
            // 更新选择器显示
            const selector = document.getElementById('language-selector');
            if (selector) {
                selector.value = lang;
            }
            
            // 重新扫描和应用翻译
            this.scanAndRegisterElements();
            this.applyTranslations();
            
            // 显示通知
            if (showNotification) {
                this.showNotification(`已切换到 ${LANGUAGES[lang].flag} ${LANGUAGES[lang].name}`);
            }
            
            // 触发自定义事件
            document.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
        },
        
        // 显示通知
        showNotification: function(message) {
            let notification = document.getElementById('language-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'language-notification';
                document.body.appendChild(notification);
            }
            
            notification.textContent = message;
            notification.style.opacity = '1';
            
            setTimeout(() => {
                notification.style.opacity = '0';
            }, 3000);
        },
        
        // 设置DOM变化监听
        setupMutationObserver: function() {
            const observer = new MutationObserver((mutations) => {
                let hasNewElements = false;
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        hasNewElements = true;
                    }
                });
                
                if (hasNewElements && this.currentLanguage !== 'en') {
                    setTimeout(() => {
                        this.scanAndRegisterElements();
                        this.applyTranslations();
                    }, 100);
                }
            });
            
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
            
            console.log('已设置DOM变化监听');
        }
    };

    // 4. 初始化并导出全局函数
    
    // 等待DOM加载完成
    function initLangPatch() {
        console.log('DOM已加载，初始化语言补丁...');
        
        // 清理可能存在的旧版翻译工具
        const translationPanel = document.querySelector('.translation-coverage-analysis');
        if (translationPanel) {
            translationPanel.remove();
        }
        
        document.querySelectorAll('.translation-highlight').forEach(el => {
            el.classList.remove('translation-highlight');
        });
        
        // 初始化I18N系统
        I18N.init();
        
        console.log('语言补丁初始化完成!');
    }
    
    // 导出全局切换函数
    window.switchLanguage = function(lang) {
        I18N.setLanguage(lang);
    };
    
    // 检查DOM状态并初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLangPatch);
    } else {
        initLangPatch();
    }
    
    // 页面完全加载后再次执行以确保完全覆盖
    window.addEventListener('load', function() {
        setTimeout(() => {
            I18N.scanAndRegisterElements();
            I18N.applyTranslations();
        }, 500);
    });

    console.log("🚀 专业版语言补丁加载完成，等待初始化...");
})(); 