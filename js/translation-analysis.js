/**
 * 翻译覆盖率分析工具
 * Translation Coverage Analysis Tool
 */

(function() {
    console.log("🔍 启动翻译覆盖率分析...");
    
    // 从language-patch.js获取语言数据
    const LANGUAGES = {
        'en': { name: 'English', flag: '🇬🇧' },
        'zh': { name: '中文', flag: '🇨🇳' },
        'de': { name: 'Deutsch', flag: '🇩🇪' },
        'fr': { name: 'Français', flag: '🇫🇷' },
        'es': { name: 'Español', flag: '🇪🇸' },
        'si': { name: 'සිංහල', flag: '🇱🇰' }
    };
    
    // 从language-patch.js获取翻译数据
    function getTranslations() {
        // 尝试从全局变量获取翻译数据
        if (window.TRANSLATIONS) {
            return window.TRANSLATIONS;
        }
        
        // 否则尝试从全局变量中的translations获取
        if (window.translations) {
            return window.translations;
        }
        
        // 如果以上都不可用，我们可以手动提取language-patch.js中的翻译
        // 这里我们无法直接访问那个文件中的变量，所以要进行DOM扫描
        return analyzePageTranslations();
    }
    
    // 通过扫描页面元素来分析翻译覆盖率
    function analyzePageTranslations() {
        console.log("📊 开始扫描页面元素分析翻译覆盖率...");
        
        // 查找所有带有data-i18n属性的元素
        const i18nElements = document.querySelectorAll('[data-i18n]');
        console.log(`找到 ${i18nElements.length} 个带有data-i18n属性的元素`);
        
        // 收集所有翻译键
        const translationKeys = new Set();
        i18nElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) translationKeys.add(key);
        });
        
        console.log(`总共有 ${translationKeys.size} 个不同的翻译键需要翻译`);
        
        // 按照每种语言切换并检查元素是否被翻译
        const results = {};
        const langs = Object.keys(LANGUAGES).filter(lang => lang !== 'en');
        
        // 先记住当前语言
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // 对每种语言分析翻译覆盖率
        langs.forEach(lang => {
            console.log(`分析 ${LANGUAGES[lang].name} 的翻译覆盖率...`);
            
            // 切换到该语言
            if (typeof switchLanguage === 'function') {
                switchLanguage(lang);
                
                // 给页面一点时间应用翻译
                setTimeout(() => {
                    const translatedCount = countTranslatedElements(Array.from(translationKeys));
                    const percentage = (translatedCount / translationKeys.size * 100).toFixed(1);
                    
                    results[lang] = {
                        total: translationKeys.size,
                        translated: translatedCount,
                        percentage: percentage,
                        missing: translationKeys.size - translatedCount
                    };
                    
                    console.log(`${LANGUAGES[lang].flag} ${LANGUAGES[lang].name}: ${percentage}% 已翻译 (${translatedCount}/${translationKeys.size})`);
                    
                    // 如果这是最后一种语言，显示结果并恢复原始语言
                    if (lang === langs[langs.length - 1]) {
                        displayResults(results);
                        // 恢复原始语言
                        switchLanguage(currentLang);
                    }
                }, 500);
            } else {
                console.error("switchLanguage函数不可用，无法分析翻译覆盖率");
            }
        });
    }
    
    // 计算已翻译元素数量
    function countTranslatedElements(keys) {
        let count = 0;
        
        keys.forEach(key => {
            // 查找带有此data-i18n键的元素
            const el = document.querySelector(`[data-i18n="${key}"]`);
            if (el) {
                // 获取默认英文文本
                const defaultText = el.getAttribute('data-default-text');
                let currentText;
                
                // 获取当前文本
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    currentText = el.placeholder;
                } else if (el.tagName === 'OPTION') {
                    currentText = el.text;
                } else {
                    currentText = el.textContent;
                }
                
                // 如果当前文本与默认文本不同，则认为已翻译
                if (defaultText && currentText && defaultText !== currentText) {
                    count++;
                }
            }
        });
        
        return count;
    }
    
    // 显示分析结果
    function displayResults(results) {
        console.log("==== 翻译覆盖率分析结果 ====");
        
        // 创建结果面板
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;
        
        // 添加标题
        const title = document.createElement('h3');
        title.textContent = "Translation Coverage Analysis";
        title.style.margin = "0 0 10px 0";
        panel.appendChild(title);
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = "×";
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => panel.remove();
        panel.appendChild(closeBtn);
        
        // 为每种语言添加结果
        Object.keys(results).forEach(lang => {
            const langResult = results[lang];
            const langDiv = document.createElement('div');
            langDiv.style.margin = "10px 0";
            
            // 创建进度条
            const progressContainer = document.createElement('div');
            progressContainer.style.cssText = `
                width: 100%;
                background-color: #444;
                height: 20px;
                border-radius: 10px;
                margin-top: 5px;
            `;
            
            const progress = document.createElement('div');
            progress.style.cssText = `
                width: ${langResult.percentage}%;
                background-color: ${langResult.percentage > 70 ? '#4CAF50' : langResult.percentage > 40 ? '#FFC107' : '#F44336'};
                height: 20px;
                border-radius: 10px;
                text-align: center;
                line-height: 20px;
                color: white;
                font-size: 12px;
            `;
            progress.textContent = `${langResult.percentage}%`;
            progressContainer.appendChild(progress);
            
            langDiv.innerHTML = `
                <div><strong>${LANGUAGES[lang].flag} ${LANGUAGES[lang].name}</strong></div>
                <div>已翻译: ${langResult.translated}/${langResult.total} (缺少: ${langResult.missing})</div>
            `;
            langDiv.appendChild(progressContainer);
            
            panel.appendChild(langDiv);
        });
        
        // 添加操作说明
        const helpText = document.createElement('p');
        helpText.style.fontSize = '12px';
        helpText.style.marginTop = '15px';
        helpText.style.opacity = '0.8';
        helpText.textContent = "此分析基于页面上带有data-i18n属性的元素。结果显示每种语言的翻译完成度。";
        panel.appendChild(helpText);
        
        // 添加到页面
        document.body.appendChild(panel);
    }
    
    // 在页面加载完成后执行分析
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', getTranslations);
    } else {
        // 等待一点时间确保其他脚本已加载
        setTimeout(getTranslations, 1000);
    }
})(); 