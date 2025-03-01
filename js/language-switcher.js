/**
 * 简化版语言系统 - 仅支持英文
 */

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化简化版语言系统 - 仅英文');
    
    // 设置网页语言为英文
    document.documentElement.lang = 'en';
    
    // 移除任何现有的语言选择器
    const existingSelectors = document.querySelectorAll('#languageSelect, #language-selector');
    existingSelectors.forEach(selector => {
        if (selector && selector.parentNode) {
            selector.parentNode.removeChild(selector);
        }
    });
    
    console.log('语言系统已简化为仅英文');
}); 