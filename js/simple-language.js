/**
 * 简单高效的语言切换实现
 * 直接操作DOM，处理原始按钮并应用翻译
 */

(function() {
    // 可用的语言
    const LANGUAGES = ['en', 'zh', 'de', 'fr', 'es', 'si'];
    
    // 语言到国旗emoji的映射
    const LANGUAGE_FLAGS = {
        en: '🇬🇧',
        zh: '🇨🇳',
        de: '🇩🇪',
        fr: '🇫🇷',
        es: '🇪🇸',
        si: '🇱🇰'
    };
    
    // 语言名称
    const LANGUAGE_NAMES = {
        en: 'English',
        zh: '中文',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        si: 'සිංහල'
    };
    
    // 当前语言 - 默认为英语
    let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    
    // 翻译数据 - 全局访问
    let translations = {};
    
    // 启动语言处理
    function init() {
        console.log('🌍 正在初始化语言切换系统...');
        
        // 尝试加载翻译数据
        loadTranslations();
        
        // 寻找并替换语言按钮
        findAndReplaceLanguageButton();
        
        // 创建悬浮语言切换器
        createFloatingLanguageSwitcher();
        
        // 应用当前语言
        applyLanguage(currentLanguage);
        
        console.log(`🌍 语言系统初始化完成，当前语言: ${currentLanguage}`);
    }
    
    // 加载翻译数据
    function loadTranslations() {
        console.log('📚 尝试加载翻译数据...');
        
        // 检查全局变量是否已存在
        if (window.translations) {
            translations = window.translations;
            console.log('✅ 从全局变量加载翻译数据成功');
        } else {
            console.log('⚠️ 未找到全局翻译数据，尝试硬编码基础翻译...');
            
            // 硬编码基本翻译，确保至少有中英文切换
            translations = {
                en: {
                    "home": "Home",
                    "transport": "Transport",
                    "explore": "Explore",
                    "contact": "Contact",
                    "hero-title": "Best Travel - Best Choice",
                    "hero-subtitle": "Your premium travel experience in Sri Lanka",
                    "book-transport": "Book Transport",
                    "explore-lanka": "Explore Sri Lanka",
                    "transport-services": "Transport Services"
                    // 可以根据需要添加更多
                },
                zh: {
                    "home": "首页",
                    "transport": "交通",
                    "explore": "探索",
                    "contact": "联系我们",
                    "hero-title": "最佳旅行 - 最佳选择",
                    "hero-subtitle": "您在斯里兰卡的高级旅行体验",
                    "book-transport": "预订交通",
                    "explore-lanka": "探索斯里兰卡",
                    "transport-services": "交通服务"
                    // 可以根据需要添加更多
                }
            };
        }
    }
    
    // 查找并替换原始语言按钮
    function findAndReplaceLanguageButton() {
        console.log('🔍 查找原始语言按钮...');
        
        // 1. 先尝试查找最明显的"CN 中文"按钮
        const allElements = document.querySelectorAll('button, span, div, a');
        let found = false;
        
        allElements.forEach(el => {
            if (el.textContent.trim() === 'CN 中文') {
                console.log('✅ 找到"CN 中文"按钮', el);
                
                // 替换按钮文本并添加点击事件
                el.innerHTML = `${LANGUAGE_FLAGS['zh']} ${LANGUAGE_NAMES['zh']}`;
                el.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    switchLanguage('zh');
                    return false;
                };
                
                found = true;
            }
        });
        
        // 2. 尝试查找语言切换区域
        const langSwitchAreas = document.querySelectorAll('.language-switch');
        if (langSwitchAreas.length > 0) {
            console.log(`找到 ${langSwitchAreas.length} 个语言切换区域`);
            
            langSwitchAreas.forEach(area => {
                // 清空区域内容
                area.innerHTML = '';
                
                // 创建新的下拉菜单
                const select = document.createElement('select');
                select.id = 'simpleLanguageSelect';
                select.onchange = function() {
                    switchLanguage(this.value);
                };
                
                // 添加选项
                LANGUAGES.forEach(lang => {
                    const option = document.createElement('option');
                    option.value = lang;
                    option.textContent = `${LANGUAGE_FLAGS[lang]} ${LANGUAGE_NAMES[lang]}`;
                    option.selected = lang === currentLanguage;
                    select.appendChild(option);
                });
                
                area.appendChild(select);
            });
            
            found = true;
        }
        
        if (!found) {
            console.log('⚠️ 没有找到语言按钮或语言切换区域');
        }
    }
    
    // 创建悬浮语言切换器
    function createFloatingLanguageSwitcher() {
        console.log('🛠️ 创建悬浮语言切换器...');
        
        // 检查是否已存在
        if (document.getElementById('floating-language-panel')) {
            return;
        }
        
        // 创建悬浮面板
        const panel = document.createElement('div');
        panel.id = 'floating-language-panel';
        
        // 设置样式
        Object.assign(panel.style, {
            position: 'fixed',
            top: '70px',
            right: '10px',
            zIndex: '10000',
            background: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        });
        
        // 添加语言按钮
        LANGUAGES.forEach(lang => {
            const btn = document.createElement('button');
            btn.textContent = LANGUAGE_FLAGS[lang];
            btn.title = LANGUAGE_NAMES[lang];
            
            // 设置样式
            Object.assign(btn.style, {
                background: lang === currentLanguage ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '5px 10px',
                transition: 'all 0.2s ease'
            });
            
            // 添加悬停效果
            btn.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.background = 'rgba(255,255,255,0.3)';
            };
            btn.onmouseout = function() {
                this.style.transform = '';
                this.style.background = lang === currentLanguage ? 'rgba(255,255,255,0.2)' : 'transparent';
            };
            
            // 添加点击事件
            btn.onclick = function() {
                switchLanguage(lang);
                
                // 更新按钮状态
                Array.from(panel.children).forEach(b => {
                    b.style.background = 'transparent';
                });
                this.style.background = 'rgba(255,255,255,0.2)';
            };
            
            panel.appendChild(btn);
        });
        
        // 添加到页面
        document.body.appendChild(panel);
        console.log('✅ 悬浮语言切换器创建成功');
    }
    
    // 切换语言
    function switchLanguage(lang) {
        console.log(`🔄 切换语言到: ${lang}`);
        
        if (!LANGUAGES.includes(lang)) {
            console.error(`❌ 不支持的语言: ${lang}`);
            return;
        }
        
        // 保存当前语言
        currentLanguage = lang;
        localStorage.setItem('selectedLanguage', lang);
        
        // 应用翻译
        applyLanguage(lang);
        
        // 显示通知
        showNotification(`Language switched to ${LANGUAGE_NAMES[lang]}`);
    }
    
    // 应用语言到页面
    function applyLanguage(lang) {
        console.log(`🔤 应用语言: ${lang}`);
        
        // 确保翻译数据已加载
        if (!translations[lang]) {
            console.error(`❌ 没有找到语言 ${lang} 的翻译数据`);
            return;
        }
        
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`找到 ${elements.length} 个需要翻译的元素`);
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                // 如果是输入元素，设置占位符
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = translations[lang][key];
                } 
                // 否则设置内容
                else {
                    el.textContent = translations[lang][key];
                }
            } else {
                console.log(`未找到键 "${key}" 的翻译`);
            }
        });
        
        // 触发自定义事件，通知语言切换完成
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        console.log(`✅ 语言 ${lang} 应用完成`);
        
        // 强制重新渲染整个页面，确保所有内容都更新
        setTimeout(() => {
            const html = document.documentElement;
            html.style.display = 'none';
            setTimeout(() => { html.style.display = ''; }, 10);
        }, 100);
    }
    
    // 显示通知
    function showNotification(message) {
        // 检查是否已存在通知元素
        let notification = document.getElementById('language-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'language-notification';
            
            // 设置样式
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                zIndex: '10001',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            });
            
            document.body.appendChild(notification);
        }
        
        // 设置消息并显示
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }
    
    // 导出全局函数
    window.switchLanguage = switchLanguage;
    
    // 当页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 为防止某些框架或延迟加载的情况，添加一个延迟初始化
    setTimeout(init, 1000);
    
    // 注册页面更新监听
    const observer = new MutationObserver(function(mutations) {
        // 当DOM变化时，重新应用当前语言
        setTimeout(() => applyLanguage(currentLanguage), 100);
    });
    
    // 开始观察
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
    console.log('👍 简单语言切换系统已加载');
})(); 