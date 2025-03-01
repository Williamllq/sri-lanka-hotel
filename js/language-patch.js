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
            'enter-requirements': '任何特殊要求？'
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
            'transport-services': 'Transportdienstleistungen'
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
            'transport-services': 'Services de transport'
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
            'transport-services': 'Servicios de transporte'
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
            'transport-services': 'ප්‍රවාහන සේවා'
        }
    };

    // 3. 初始化 - 等待页面完全加载后运行
    function initPatch() {
        console.log("🔄 初始化语言补丁...");
        
        // 清理页面上的所有额外语言选择器
        cleanupLanguageSelectors();
        
        // 创建正确的语言选择器
        createNewLanguageSelector();
        
        // 初始化当前语言 (从本地存储或默认为英语)
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 应用翻译
        applyTranslation(currentLang);
        
        console.log("✅ 语言补丁初始化完成!");
    }

    // 4. 清除多余语言选择器
    function cleanupLanguageSelectors() {
        console.log("🧹 清理多余的语言选择器...");
        
        // 移除现有的浮动面板
        const existingPanels = [
            document.getElementById('floating-language-panel'),
            document.getElementById('floating-language-switcher')
        ];
        
        existingPanels.forEach(panel => {
            if (panel) {
                panel.remove();
                console.log("删除了浮动面板");
            }
        });
        
        // 查找并修改导航栏中的语言选择器
        const navLangSwitch = document.querySelector('.language-switch');
        if (navLangSwitch) {
            navLangSwitch.innerHTML = ''; // 清空原有内容
            console.log("清空了导航栏语言选择器");
        }
    }
    
    // 5. 创建新的语言选择器
    function createNewLanguageSelector() {
        console.log("🔨 创建新的语言选择器...");
        
        // 为顶部导航栏创建选择器
        const navLangSwitch = document.querySelector('.language-switch');
        if (navLangSwitch) {
            const dropdown = document.createElement('select');
            dropdown.id = 'topLanguageSelect';
            dropdown.addEventListener('change', function() {
                switchLanguage(this.value);
            });
            
            // 添加所有语言选项
            Object.keys(LANGUAGES).forEach(code => {
                const opt = document.createElement('option');
                opt.value = code;
                opt.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
                opt.selected = (code === (localStorage.getItem('selectedLanguage') || 'en'));
                dropdown.appendChild(opt);
            });
            
            navLangSwitch.appendChild(dropdown);
            console.log("添加了导航栏选择器");
        }
        
        // 创建一个额外的纯按钮式语言选择器 (在截图中看到的那种)
        const btnPanel = document.createElement('div');
        btnPanel.id = 'language-buttons';
        btnPanel.style.cssText = `
            position: fixed;
            top: 138px;
            right: 10px;
            z-index: 9999;
            background: rgba(0,0,0,0.7);
            border-radius: 8px;
            padding: 5px;
            display: flex;
            flex-direction: row;
        `;
        
        // 添加按钮
        Object.keys(LANGUAGES).forEach(code => {
            const btn = document.createElement('button');
            btn.textContent = code.toUpperCase();
            btn.title = LANGUAGES[code].name;
            btn.setAttribute('data-lang', code);
            btn.style.cssText = `
                background: ${code === (localStorage.getItem('selectedLanguage') || 'en') ? '#444' : 'transparent'};
                color: white;
                border: none;
                padding: 5px 10px;
                margin: 0 2px;
                cursor: pointer;
                border-radius: 4px;
                font-weight: bold;
            `;
            
            btn.addEventListener('click', function() {
                switchLanguage(code);
                // 更新按钮状态
                document.querySelectorAll('#language-buttons button').forEach(b => {
                    b.style.background = 'transparent';
                });
                this.style.background = '#444';
            });
            
            btnPanel.appendChild(btn);
        });
        
        document.body.appendChild(btnPanel);
        console.log("添加了悬浮按钮面板");
    }
    
    // 6. 切换语言
    function switchLanguage(lang) {
        console.log(`🔄 切换语言到: ${lang}`);
        
        if (!LANGUAGES[lang]) {
            console.error(`不支持的语言: ${lang}`);
            return;
        }
        
        // 保存语言设置
        localStorage.setItem('selectedLanguage', lang);
        
        // 更新选项值
        const topSelect = document.getElementById('topLanguageSelect');
        if (topSelect) topSelect.value = lang;
        
        // 更新按钮状态
        document.querySelectorAll('#language-buttons button').forEach(btn => {
            btn.style.background = btn.getAttribute('data-lang') === lang ? '#444' : 'transparent';
        });
        
        // 应用翻译
        applyTranslation(lang);
        
        // 显示通知
        showNotification(`已切换到${LANGUAGES[lang].name}`);
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    // 7. 应用翻译
    function applyTranslation(lang) {
        console.log(`📝 应用 ${lang} 语言翻译...`);
        
        // 默认为英语 - 不需要翻译
        if (lang === 'en') {
            resetToEnglish();
            return;
        }
        
        // 获取翻译数据
        let translations = {};
        
        // 首先尝试使用全局翻译数据
        if (window.translations && window.translations[lang]) {
            translations = window.translations[lang];
            console.log("使用全局翻译数据");
        }
        // 然后合并我们的内置翻译
        if (TRANSLATIONS[lang]) {
            translations = {...TRANSLATIONS[lang], ...translations};
            console.log("合并了内置翻译数据");
        }
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`找到 ${elements.length} 个需要翻译的元素`);
        
        // 应用翻译
        let translatedCount = 0;
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
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
            }
        });
        
        console.log(`✅ 翻译了 ${translatedCount} 个元素`);
        
        // 强制重绘以确保所有内容更新
        setTimeout(() => {
            document.body.style.opacity = '0.99';
            setTimeout(() => { document.body.style.opacity = '1'; }, 50);
        }, 100);
    }
    
    // 8. 重置为英文
    function resetToEnglish() {
        console.log("🔄 重置为英文原文...");
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        
        // 恢复原始英文内容
        elements.forEach(el => {
            // 获取默认的英文文本（存储在 data-default-text 属性中，如果有的话）
            const defaultText = el.getAttribute('data-default-text');
            
            if (defaultText) {
                // 如果有存储的默认文本，使用它
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = defaultText;
                } else {
                    el.textContent = defaultText;
                }
            } else {
                // 否则，使用元素当前的英文内容
                // 这可能不是完美的解决方案，但在大多数情况下应该工作
                const key = el.getAttribute('data-i18n');
                
                // 从我们的英文翻译字典尝试获取文本
                if (window.translations && window.translations.en && window.translations.en[key]) {
                    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                        el.placeholder = window.translations.en[key];
                    } else {
                        el.textContent = window.translations.en[key];
                    }
                }
                // 否则保留当前文本
            }
            
            // 存储默认英文文本以备将来使用
            if (!el.hasAttribute('data-default-text')) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.setAttribute('data-default-text', el.placeholder);
                } else {
                    el.setAttribute('data-default-text', el.textContent);
                }
            }
        });
        
        console.log("✅ 已重置为英文原文");
    }
    
    // 9. 显示通知
    function showNotification(message) {
        // 创建或获取通知元素
        let notification = document.getElementById('language-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'language-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
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
    
    // 10. 导出全局函数
    window.switchLanguage = switchLanguage;
    
    // 11. 启动补丁
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPatch);
    } else {
        // 如果页面已加载，延迟一点执行，让其他脚本先运行
        setTimeout(initPatch, 100);
    }
    
    // 12. 定期检查DOM变化
    setInterval(() => {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        if (currentLang !== 'en') {
            // 再次应用当前非英语语言
            applyTranslation(currentLang);
        }
    }, 2000);

    console.log("🔌 语言补丁已加载，等待初始化...");
})(); 