// 语言切换调试工具
document.addEventListener('DOMContentLoaded', function() {
    console.log('调试脚本已加载');
    
    // 1. 检查 languageSelect 元素是否存在
    const languageSelect = document.getElementById('languageSelect');
    console.log('语言选择器元素存在:', !!languageSelect);
    if (languageSelect) {
        console.log('当前选择的语言:', languageSelect.value);
        
        // 2. 测试直接切换语言
        console.log('正在尝试切换到中文...');
        try {
            // 尝试切换到中文
            switchLanguage('zh');
            console.log('语言切换函数已调用，请检查页面是否发生变化');
        } catch (error) {
            console.error('调用 switchLanguage 函数时出错:', error);
        }
        
        // 3. 查找所有带有 data-i18n 属性的元素
        const i18nElements = document.querySelectorAll('[data-i18n]');
        console.log('找到标记为翻译的元素数量:', i18nElements.length);
        
        // 4. 输出前10个元素的信息
        if (i18nElements.length > 0) {
            console.log('前10个需要翻译的元素:');
            Array.from(i18nElements).slice(0, 10).forEach(el => {
                console.log('- 元素:', el.tagName, '键:', el.getAttribute('data-i18n'), '当前文本:', el.textContent.trim());
            });
        }
        
        // 5. 强制重新绑定语言选择器事件
        console.log('重新绑定语言选择器事件...');
        languageSelect.addEventListener('change', function() {
            console.log('语言选择变更为:', this.value);
            switchLanguage(this.value);
        });
    }
    
    // 6. 检查translations对象
    console.log('translations对象类型:', typeof translations);
    if (typeof translations === 'object') {
        console.log('可用语言:', Object.keys(translations));
        if (translations.zh) {
            console.log('中文翻译键数量:', Object.keys(translations.zh).length);
        }
    }
});

// 添加简化版的语言切换函数，绕过可能的问题
window.simpleLanguageSwitch = function(lang) {
    console.log('使用简化版语言切换函数，切换到:', lang);
    
    // 如果translations对象不存在，直接返回
    if (typeof translations !== 'object' || !translations[lang]) {
        console.error('translations对象不存在或没有该语言的翻译');
        return;
    }
    
    // 保存语言选择
    localStorage.setItem('selectedLanguage', lang);
    
    // 获取所有需要翻译的元素
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('找到需要翻译的元素数量:', elements.length);
    
    // 遍历每个元素并应用翻译
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const translation = translations[lang][key];
        if (!translation) {
            console.warn('未找到翻译键:', key);
            return;
        }
        
        console.log('翻译元素:', element.tagName, '键:', key, '翻译:', translation);
        
        // 根据元素类型应用翻译
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            element.placeholder = translation;
        } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('placeholder')) {
            element.placeholder = translation;
        } else if (element.tagName === 'OPTION') {
            element.text = translation;
        } else {
            // 对于其他元素，直接设置文本内容
            element.textContent = translation;
        }
    });
    
    // 更新语言选择器
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = lang;
    }
    
    console.log('简化版语言切换完成');
    alert('语言已切换到: ' + lang);
    
    // 强制刷新DOM
    document.body.style.display = 'none';
    setTimeout(function() {
        document.body.style.display = '';
    }, 10);
}; 