/**
 * 性能优化脚本
 * 提升网站加载速度和用户体验
 */

(function() {
    'use strict';
    
    // 1. 图片懒加载优化
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('fade-in');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    };
    
    // 2. 预加载关键资源
    const preloadCriticalResources = () => {
        // 预加载字体
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);
        
        // 预连接到CDN
        const preconnectCDN = ['https://cdnjs.cloudflare.com', 'https://unpkg.com'];
        preconnectCDN.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            document.head.appendChild(link);
        });
    };
    
    // 3. 平滑滚动优化
    const enhanceSmoothScroll = () => {
        // 添加CSS平滑滚动
        if (!CSS.supports('scroll-behavior', 'smooth')) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        // 优化锚点跳转
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    // 4. 表单优化
    const enhanceForms = () => {
        // 自动保存表单数据
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const formId = form.id || 'form_' + Math.random().toString(36).substr(2, 9);
            
            // 恢复保存的数据
            const savedData = localStorage.getItem('form_' + formId);
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input && input.type !== 'password') {
                        input.value = data[key];
                    }
                });
            }
            
            // 保存表单数据
            form.addEventListener('input', debounce(() => {
                const formData = {};
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.name && input.type !== 'password') {
                        formData[input.name] = input.value;
                    }
                });
                localStorage.setItem('form_' + formId, JSON.stringify(formData));
            }, 1000));
        });
    };
    
    // 5. 加载动画优化
    const addLoadingStates = () => {
        // 为按钮添加加载状态
        document.querySelectorAll('button[type="submit"], .btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.type === 'submit' || this.classList.contains('btn')) {
                    if (!this.disabled) {
                        const originalText = this.innerHTML;
                        this.disabled = true;
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                        
                        // 3秒后恢复（实际应该在请求完成后恢复）
                        setTimeout(() => {
                            this.disabled = false;
                            this.innerHTML = originalText;
                        }, 3000);
                    }
                }
            });
        });
    };
    
    // 6. 错误处理优化
    const enhanceErrorHandling = () => {
        // 图片加载失败处理
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                e.target.src = './images/placeholder.jpg';
                e.target.alt = 'Image not available';
                e.target.classList.add('error-image');
            }
        }, true);
        
        // 网络状态监测
        window.addEventListener('online', () => {
            showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            showNotification('No internet connection', 'warning');
        });
    };
    
    // 7. 快捷键支持
    const addKeyboardShortcuts = () => {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - 聚焦搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('quickSearchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // ESC - 关闭模态框
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.map-modal, .image-modal');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    };
    
    // 8. 页面可见性优化
    const optimizePageVisibility = () => {
        let hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        
        document.addEventListener(visibilityChange, () => {
            if (document[hidden]) {
                // 页面隐藏时暂停动画
                document.querySelectorAll('.animated').forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            } else {
                // 页面显示时恢复动画
                document.querySelectorAll('.animated').forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }
        });
    };
    
    // 工具函数：防抖
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 工具函数：显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .error-image {
            opacity: 0.5;
            filter: grayscale(100%);
        }
        
        /* 优化加载动画 */
        .fade-in {
            animation: fadeIn 0.6s ease forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* 优化滚动性能 */
        * {
            scroll-behavior: smooth;
        }
        
        /* 减少重绘 */
        .will-change-transform {
            will-change: transform;
        }
    `;
    document.head.appendChild(style);
    
    // 初始化所有优化
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoadImages();
        preloadCriticalResources();
        enhanceSmoothScroll();
        enhanceForms();
        addLoadingStates();
        enhanceErrorHandling();
        addKeyboardShortcuts();
        optimizePageVisibility();
        
        console.log('Performance optimizations loaded');
    });
    
})(); 