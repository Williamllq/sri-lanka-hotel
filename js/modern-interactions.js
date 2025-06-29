/**
 * Modern Interactions for Sri Lanka Stay & Explore
 * 现代化交互效果 - 提升用户体验
 */

(function() {
    'use strict';
    
    // ===== 1. 平滑滚动增强 =====
    function initSmoothScroll() {
        // 为所有锚链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 80; // 导航栏高度
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ===== 2. 导航栏交互增强 =====
    function enhanceNavigation() {
        const nav = document.querySelector('.main-nav');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // 添加/移除滚动类
            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            
            // 隐藏/显示导航栏
            if (currentScroll > lastScroll && currentScroll > 300) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // ===== 3. 元素进入视口动画 =====
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // 对于一次性动画，可以停止观察
                    if (entry.target.dataset.animateOnce) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // 观察所有需要动画的元素
        document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .room-card, .hotel-card, .gallery-item').forEach(el => {
            observer.observe(el);
        });
    }
    
    // ===== 4. 卡片悬停效果增强 =====
    function enhanceCardHovers() {
        const cards = document.querySelectorAll('.room-card, .hotel-card, .transport-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 创建涟漪效果
                const ripple = document.createElement('div');
                ripple.className = 'hover-ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
            
            // 3D 倾斜效果
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const tiltX = (y - 0.5) * 10;
                const tiltY = (x - 0.5) * -10;
                
                this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }
    
    // ===== 5. 图片延迟加载 =====
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // ===== 6. 打字机效果 =====
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // ===== 7. 数字动画 =====
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // ===== 8. 表单验证动画 =====
    function enhanceForms() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // 浮动标签效果
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
            
            // 实时验证反馈
            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.classList.remove('error');
                    this.classList.add('valid');
                } else {
                    this.classList.remove('valid');
                    this.classList.add('error');
                }
            });
        });
    }
    
    // ===== 9. 加载进度条 =====
    function createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'page-progress';
        progressBar.innerHTML = '<div class="progress-bar"></div>';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.querySelector('.progress-bar').style.width = scrollPercent + '%';
        });
    }
    
    // ===== 10. 按钮点击效果 =====
    function enhanceButtons() {
        document.querySelectorAll('.btn, .btn-secondary, button').forEach(button => {
            button.addEventListener('click', function(e) {
                // 创建涟漪效果
                const ripple = document.createElement('span');
                ripple.className = 'button-ripple';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    
    // ===== 11. 预加载关键资源 =====
    function preloadResources() {
        const criticalResources = [
            '/images/hero-bg.jpg',
            '/images/ranga_bandara_logo_v2.png'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.jpg') || resource.endsWith('.png') ? 'image' : 'fetch';
            document.head.appendChild(link);
        });
    }
    
    // ===== 12. 添加必要的CSS =====
    function injectStyles() {
        const styles = `
            /* 涟漪效果 */
            .hover-ripple, .button-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            .hover-ripple {
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
            }
            
            .button-ripple {
                background: rgba(255, 255, 255, 0.5);
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* 进度条 */
            .page-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                z-index: 9999;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                width: 0;
                transition: width 0.3s ease;
            }
            
            /* 动画类 */
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            /* 表单验证状态 */
            input.valid, textarea.valid {
                border-color: var(--success-color) !important;
            }
            
            input.error, textarea.error {
                border-color: var(--error-color) !important;
            }
            
            /* 加载动画 */
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--bg-secondary);
                border-top-color: var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // ===== 初始化所有功能 =====
    function init() {
        // 注入样式
        injectStyles();
        
        // 预加载资源
        preloadResources();
        
        // 初始化各种功能
        initSmoothScroll();
        enhanceNavigation();
        initScrollAnimations();
        enhanceCardHovers();
        initLazyLoading();
        enhanceForms();
        createProgressBar();
        enhanceButtons();
        
        // Hero 标题打字机效果
        const heroTitle = document.querySelector('.hero-content h2');
        if (heroTitle) {
            const originalText = heroTitle.textContent;
            heroTitle.textContent = '';
            setTimeout(() => {
                typeWriter(heroTitle, originalText, 50);
            }, 500);
        }
        
        // 统计数字动画
        document.querySelectorAll('[data-count-to]').forEach(element => {
            const target = parseInt(element.dataset.countTo);
            const duration = parseInt(element.dataset.duration) || 2000;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateValue(element, 0, target, duration);
                        observer.unobserve(element);
                    }
                });
            });
            
            observer.observe(element);
        });
    }
    
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})(); 