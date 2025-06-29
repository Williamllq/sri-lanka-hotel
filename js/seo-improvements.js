/**
 * SEO改进脚本
 * 动态优化页面的SEO元素
 */

(function() {
    'use strict';
    
    // 1. 动态更新页面标题
    const updatePageTitle = () => {
        const originalTitle = document.title;
        let isOriginal = true;
        
        // 页面失去焦点时改变标题
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.title = '🔴 Come back! - ' + originalTitle;
                isOriginal = false;
            } else {
                document.title = originalTitle;
                isOriginal = true;
            }
        });
        
        // 根据页面内容更新标题
        const hash = window.location.hash;
        if (hash) {
            const sectionTitles = {
                '#transport': 'Transport Services',
                '#hotels': 'Hotels & Accommodations',
                '#explore': 'Explore Sri Lanka',
                '#contact': 'Contact Us'
            };
            
            if (sectionTitles[hash]) {
                document.title = `${sectionTitles[hash]} - ${originalTitle}`;
            }
        }
    };
    
    // 2. 添加结构化数据
    const addStructuredData = () => {
        // 添加面包屑结构化数据
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sri-lanka-stay-explore.netlify.app/"
            }]
        };
        
        // 根据当前页面添加面包屑
        if (window.location.pathname.includes('hotels')) {
            breadcrumbData.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Hotels",
                "item": window.location.href
            });
        }
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(breadcrumbData);
        document.head.appendChild(script);
        
        // 添加FAQ结构化数据
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": "What transport services do you offer in Sri Lanka?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We offer airport transfers, city tours, and custom journeys with professional English-speaking drivers and comfortable vehicles."
                }
            }, {
                "@type": "Question",
                "name": "How do I book accommodation in Sri Lanka?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Browse our hotel listings, select your preferred accommodation, choose your dates, and click 'Book Now' to secure your reservation."
                }
            }]
        };
        
        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.textContent = JSON.stringify(faqData);
        document.head.appendChild(faqScript);
    };
    
    // 3. 优化图片Alt文本
    const optimizeImageAlt = () => {
        document.querySelectorAll('img').forEach(img => {
            if (!img.alt || img.alt === '') {
                // 根据图片名称生成Alt文本
                const filename = img.src.split('/').pop().split('.')[0];
                const altText = filename
                    .replace(/-/g, ' ')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                
                img.alt = altText + ' - Sri Lanka Stay & Explore';
            }
            
            // 添加title属性
            if (!img.title) {
                img.title = img.alt;
            }
        });
    };
    
    // 4. 添加社交媒体元标签
    const addSocialMetaTags = () => {
        // 检查是否已有元标签
        if (!document.querySelector('meta[property="og:image"]')) {
            const metaTags = [
                { property: 'og:site_name', content: 'Sri Lanka Stay & Explore' },
                { property: 'og:locale', content: 'en_US' },
                { property: 'article:publisher', content: 'https://www.facebook.com/srilankastayexplore' },
                { name: 'twitter:site', content: '@srilankastay' },
                { name: 'twitter:creator', content: '@srilankastay' }
            ];
            
            metaTags.forEach(tag => {
                const meta = document.createElement('meta');
                if (tag.property) {
                    meta.setAttribute('property', tag.property);
                } else {
                    meta.setAttribute('name', tag.name);
                }
                meta.setAttribute('content', tag.content);
                document.head.appendChild(meta);
            });
        }
    };
    
    // 5. 添加规范链接
    const addCanonicalLink = () => {
        if (!document.querySelector('link[rel="canonical"]')) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = window.location.href.split('?')[0].split('#')[0];
            document.head.appendChild(canonical);
        }
    };
    
    // 6. 优化内部链接
    const optimizeInternalLinks = () => {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            
            // 为外部链接添加属性
            if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('target', '_blank');
                
                // 添加外部链接图标
                if (!link.querySelector('.external-icon')) {
                    link.innerHTML += ' <i class="fas fa-external-link-alt external-icon" style="font-size: 0.8em; opacity: 0.7;"></i>';
                }
            }
            
            // 为内部链接添加描述性title
            if (href && href.startsWith('#')) {
                const sectionName = href.substring(1);
                link.title = `Navigate to ${sectionName} section`;
            }
        });
    };
    
    // 7. 添加语言声明
    const addLanguageDeclaration = () => {
        document.documentElement.lang = 'en';
        
        // 添加语言元标签
        if (!document.querySelector('meta[name="language"]')) {
            const langMeta = document.createElement('meta');
            langMeta.name = 'language';
            langMeta.content = 'English';
            document.head.appendChild(langMeta);
        }
    };
    
    // 8. 监控页面性能
    const monitorPerformance = () => {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // 监控长任务
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // PerformanceObserver可能不支持longtask
            }
            
            // 页面加载完成后记录性能指标
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page Performance Metrics:', {
                            'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                            'Page Load Time': perfData.loadEventEnd - perfData.loadEventStart,
                            'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
                        });
                    }
                }, 0);
            });
        }
    };
    
    // 9. 添加站点地图链接
    const addSitemapLink = () => {
        if (!document.querySelector('link[rel="sitemap"]')) {
            const sitemap = document.createElement('link');
            sitemap.rel = 'sitemap';
            sitemap.type = 'application/xml';
            sitemap.title = 'Sitemap';
            sitemap.href = '/sitemap.xml';
            document.head.appendChild(sitemap);
        }
    };
    
    // 10. 优化表单可访问性
    const optimizeFormAccessibility = () => {
        // 为所有表单元素添加适当的标签
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.id) {
                field.id = 'field_' + Math.random().toString(36).substr(2, 9);
            }
            
            // 查找相关标签
            const label = field.parentElement.querySelector('label');
            if (label && !label.getAttribute('for')) {
                label.setAttribute('for', field.id);
            }
            
            // 添加aria标签
            if (!field.getAttribute('aria-label') && label) {
                field.setAttribute('aria-label', label.textContent);
            }
            
            // 为必填字段添加aria-required
            if (field.required) {
                field.setAttribute('aria-required', 'true');
            }
        });
    };
    
    // 初始化所有SEO改进
    document.addEventListener('DOMContentLoaded', () => {
        updatePageTitle();
        addStructuredData();
        optimizeImageAlt();
        addSocialMetaTags();
        addCanonicalLink();
        optimizeInternalLinks();
        addLanguageDeclaration();
        monitorPerformance();
        addSitemapLink();
        optimizeFormAccessibility();
        
        console.log('SEO improvements loaded');
    });
    
    // 监听URL变化
    window.addEventListener('hashchange', updatePageTitle);
    
})(); 