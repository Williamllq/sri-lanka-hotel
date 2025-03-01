/**
 * 语言切换器修复脚本
 * 确保所有语言切换器按钮显示emoji国旗
 */

(function() {
    // 语言到国旗emoji的映射
    const languageFlags = {
        en: '🇬🇧', // 英国
        zh: '🇨🇳', // 中国
        de: '🇩🇪', // 德国
        fr: '🇫🇷', // 法国
        es: '🇪🇸', // 西班牙
        si: '🇱🇰'  // 斯里兰卡
    };

    // 语言名称映射
    const languageNames = {
        en: 'English',
        zh: '中文',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        si: 'සිංහල' // 僧伽罗语
    };

    // 查找页面上所有可能的语言切换器
    function fixAllLanguageSwitchers() {
        console.log("正在修复所有语言切换器...");

        // 1. 修复下拉菜单
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            console.log("找到语言选择下拉菜单");
            fixDropdownSelector(languageSelect);
        }

        // 2. 查找并修复右上角的语言按钮
        document.querySelectorAll('button, a, span, div').forEach(el => {
            const text = el.textContent.trim();
            if (text === "CN 中文") {
                console.log("找到CN 中文按钮:", el);
                el.innerHTML = `🇨🇳 中文`;
                
                // 尝试给元素添加点击事件
                el.addEventListener('click', function() {
                    if (window.switchLanguage) {
                        window.switchLanguage('zh');
                    }
                });
            }
        });

        // 3. 特殊处理：直接在body中添加一个悬浮的语言切换器
        if (!document.getElementById('floating-language-switcher')) {
            addFloatingLanguageSwitcher();
        }
    }

    // 修复下拉菜单
    function fixDropdownSelector(select) {
        // 清空现有选项
        select.innerHTML = '';
        
        // 添加带国旗emoji的选项
        Object.keys(languageFlags).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = `${languageFlags[lang]} ${languageNames[lang]}`;
            select.appendChild(option);
        });

        // 设置当前选中的语言
        const savedLang = localStorage.getItem('selectedLanguage') || 'en';
        select.value = savedLang;

        // 添加事件监听
        select.addEventListener('change', function() {
            if (window.switchLanguage) {
                window.switchLanguage(this.value);
            } else if (window.applyLanguage) {
                window.applyLanguage(this.value);
            }
        });
    }

    // 添加浮动语言切换器
    function addFloatingLanguageSwitcher() {
        // 创建浮动切换器容器
        const switcher = document.createElement('div');
        switcher.id = 'floating-language-switcher';
        
        // 设置样式
        Object.assign(switcher.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        });
        
        // 添加语言按钮
        Object.keys(languageFlags).forEach(lang => {
            const btn = document.createElement('button');
            btn.textContent = languageFlags[lang];
            btn.title = languageNames[lang];
            
            // 设置按钮样式
            Object.assign(btn.style, {
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'transform 0.2s'
            });
            
            // 高亮当前语言
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            if (lang === currentLang) {
                btn.style.transform = 'scale(1.2)';
                btn.style.background = 'rgba(255,255,255,0.2)';
            }
            
            // 添加悬停效果
            btn.addEventListener('mouseover', () => {
                btn.style.transform = 'scale(1.2)';
            });
            
            btn.addEventListener('mouseout', () => {
                if (lang !== (localStorage.getItem('selectedLanguage') || 'en')) {
                    btn.style.transform = 'scale(1)';
                }
            });
            
            // 添加点击事件
            btn.addEventListener('click', () => {
                if (window.switchLanguage) {
                    window.switchLanguage(lang);
                    
                    // 更新按钮状态
                    Array.from(switcher.children).forEach(button => {
                        button.style.transform = 'scale(1)';
                        button.style.background = 'none';
                    });
                    
                    btn.style.transform = 'scale(1.2)';
                    btn.style.background = 'rgba(255,255,255,0.2)';
                }
            });
            
            switcher.appendChild(btn);
        });
        
        // 添加到页面
        document.body.appendChild(switcher);
        console.log("添加了浮动语言切换器");
    }

    // 当文档加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixAllLanguageSwitchers);
    } else {
        fixAllLanguageSwitchers();
    }

    // 创建一个观察者，在DOM变化时再次检查
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                setTimeout(fixAllLanguageSwitchers, 100);
            }
        });
    });

    // 开始观察
    observer.observe(document.body, { childList: true, subtree: true });

    // 定期检查，以防某些异步加载
    setInterval(fixAllLanguageSwitchers, 2000);

    console.log("语言切换器修复脚本已加载");
})(); 