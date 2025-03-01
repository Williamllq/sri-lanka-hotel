/**
 * 高性能语言切换系统
 * 支持：英文(默认)、中文、德语、法语、西班牙语、僧伽罗语(斯里兰卡)
 */

// 语言标识与国旗emoji映射
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

// 缓存DOM元素和翻译键以提高性能
let translationElements = [];
let currentLanguage = 'en'; // 默认英语

/**
 * 初始化语言切换系统
 */
function initLanguageSwitcher() {
    console.log('初始化语言切换系统...');
    
    // 缓存所有需要翻译的元素
    cacheTranslationElements();
    
    // 创建带国旗的语言选择器
    createFlagLanguageSelector();
    
    // 从本地存储加载上次选择的语言
    loadSavedLanguage();
    
    // 监听语言选择变化
    document.getElementById('languageSelect').addEventListener('change', function() {
        applyLanguage(this.value);
    });
    
    console.log('语言切换系统初始化完成');
}

/**
 * 缓存所有需要翻译的元素及其翻译键
 */
function cacheTranslationElements() {
    console.log('缓存翻译元素...');
    
    // 查找所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`找到 ${elements.length} 个需要翻译的元素`);
    
    // 缓存元素和翻译键
    translationElements = Array.from(elements).map(el => {
        return {
            element: el,
            key: el.getAttribute('data-i18n'),
            type: el.tagName.toLowerCase(),
            isPlaceholder: (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')
        };
    });
}

/**
 * 创建带国旗的语言选择器
 */
function createFlagLanguageSelector() {
    console.log('创建带国旗的语言选择器...');
    
    const select = document.getElementById('languageSelect');
    if (!select) {
        console.error('未找到 languageSelect 元素');
        return;
    }
    
    // 清空现有选项
    select.innerHTML = '';
    
    // 添加带国旗emoji的选项
    Object.keys(languageFlags).forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = `${languageFlags[lang]} ${languageNames[lang]}`;
        select.appendChild(option);
    });
}

/**
 * 从本地存储加载上次选择的语言
 */
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && languageFlags[savedLang]) {
        console.log(`从本地存储加载语言: ${savedLang}`);
        applyLanguage(savedLang, true);
        
        // 更新选择器值
        const select = document.getElementById('languageSelect');
        if (select) select.value = savedLang;
    } else {
        // 默认使用英语
        applyLanguage('en', true);
    }
}

/**
 * 应用语言翻译
 * @param {string} lang - 语言代码
 * @param {boolean} isInitial - 是否为初始加载
 */
function applyLanguage(lang, isInitial = false) {
    if (!translations || !translations[lang]) {
        console.error(`未找到语言 ${lang} 的翻译`);
        return;
    }
    
    console.log(`应用语言: ${lang}${isInitial ? ' (初始加载)' : ''}`);
    currentLanguage = lang;
    
    // 保存语言选择到本地存储
    localStorage.setItem('selectedLanguage', lang);
    
    // 更新页面标题
    if (translations[lang]['page-title']) {
        document.title = translations[lang]['page-title'];
    }
    
    // 应用翻译到所有缓存的元素
    let translatedCount = 0;
    let missingCount = 0;
    
    translationElements.forEach(item => {
        const { element, key, type, isPlaceholder } = item;
        
        // 检查是否有该键的翻译
        if (!translations[lang][key]) {
            missingCount++;
            console.warn(`未找到键 "${key}" 的 ${lang} 翻译`);
            return;
        }
        
        const translation = translations[lang][key];
        
        // 根据元素类型应用翻译
        if (isPlaceholder) {
            // 输入框占位符
            element.placeholder = translation;
        } else if (type === 'option') {
            // 选项文本
            element.text = translation;
        } else {
            // 处理HTML内容，保留图标等元素
            const iconElement = element.querySelector('i, svg');
            if (iconElement) {
                const iconHTML = iconElement.outerHTML;
                element.innerHTML = iconHTML + ' ' + translation;
            } else {
                element.textContent = translation;
            }
        }
        
        translatedCount++;
    });
    
    console.log(`翻译完成: ${translatedCount} 个元素已翻译, ${missingCount} 个缺少翻译`);
    
    // 如果不是初始加载，显示通知
    if (!isInitial) {
        showLanguageChangeNotification(lang);
    }
}

/**
 * 显示语言更改通知
 * @param {string} lang - 语言代码
 */
function showLanguageChangeNotification(lang) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'language-notification';
    
    // 使用emoji国旗
    const text = document.createElement('span');
    text.textContent = `${languageFlags[lang]} 语言已切换到 ${languageNames[lang]}`;
    
    notification.appendChild(text);
    
    // 设置样式
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '10000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // 3秒后消失
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 手动切换语言的全局函数
 * @param {string} lang - 语言代码
 */
window.switchLanguage = function(lang) {
    if (!languageFlags[lang]) {
        console.error(`不支持的语言: ${lang}`);
        return;
    }
    
    // 更新选择器值
    const select = document.getElementById('languageSelect');
    if (select) select.value = lang;
    
    // 应用语言
    applyLanguage(lang);
    
    // 可选: 强制DOM刷新（解决一些罕见的渲染问题）
    document.body.style.display = 'none';
    setTimeout(() => {
        document.body.style.display = '';
    }, 5);
};

// 当DOM加载完成后初始化语言切换器
document.addEventListener('DOMContentLoaded', initLanguageSwitcher);

// 如果页面已经加载，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initLanguageSwitcher();
}

// Language Switcher Logic

// Function to load language file dynamically
function loadLanguage(lang) {
  return fetch(`/locales/${lang}.json`)
    .then(response => response.json())
    .catch(error => console.error('Error loading the language file:', error));
}

// Function to apply translations to the page
function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
}

// Event listener for language selector
const languageSelector = document.getElementById('language-selector');
languageSelector.addEventListener('change', function() {
  const selectedLanguage = this.value;
  loadLanguage(selectedLanguage)
    .then(translations => {
      applyTranslations(translations);
      document.documentElement.lang = selectedLanguage; // Update the lang attribute of the HTML document
    });
});

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  const initialLanguage = localStorage.getItem('selectedLanguage') || 'en';
  loadLanguage(initialLanguage).then(translations => {
    applyTranslations(translations);
    document.documentElement.lang = initialLanguage;
    languageSelector.value = initialLanguage; // Set the selector to the current language
  });
}); 