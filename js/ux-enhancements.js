/**
 * 用户体验增强脚本
 * 添加小功能提升网站易用性
 */

(function() {
    'use strict';
    
    // 1. 添加返回顶部按钮
    const addBackToTop = () => {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        button.className = 'back-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--accent-color, #ff6b6b);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(button);
        
        // 显示/隐藏逻辑
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        });
        
        // 点击返回顶部
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    
    // 2. 添加阅读进度条
    const addReadingProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(to right, #ff6b6b, #feca57);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.pageYOffset / scrollHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    };
    
    // 3. 自动高亮当前导航项
    const highlightActiveNav = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === current) {
                    link.classList.add('active');
                }
            });
        });
    };
    
    // 4. 表单输入实时验证
    const addFormValidation = () => {
        // Email验证
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', function() {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
                this.style.borderColor = isValid ? '#28a745' : '#dc3545';
            });
        });
        
        // 电话验证
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('blur', function() {
                const isValid = /^[\d\s\+\-\(\)]+$/.test(this.value) && this.value.length >= 10;
                this.style.borderColor = isValid ? '#28a745' : '#dc3545';
            });
        });
        
        // 必填字段验证
        document.querySelectorAll('[required]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.style.borderColor = '#dc3545';
                    showFieldError(this, 'This field is required');
                } else {
                    this.style.borderColor = '#28a745';
                    removeFieldError(this);
                }
            });
        });
    };
    
    // 5. 复制分享链接功能
    const addShareButtons = () => {
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-buttons';
        shareContainer.style.cssText = `
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 998;
        `;
        
        const shareLinks = [
            { icon: 'fa-share-alt', action: 'share' },
            { icon: 'fa-copy', action: 'copy' },
            { icon: 'fa-whatsapp', action: 'whatsapp' }
        ];
        
        shareLinks.forEach(link => {
            const button = document.createElement('button');
            button.innerHTML = `<i class="fas ${link.icon}"></i>`;
            button.className = 'share-btn';
            button.style.cssText = `
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: #f0f0f0;
                color: #333;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            `;
            
            button.addEventListener('mouseenter', function() {
                this.style.background = 'var(--accent-color, #ff6b6b)';
                this.style.color = 'white';
                this.style.transform = 'scale(1.1)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.background = '#f0f0f0';
                this.style.color = '#333';
                this.style.transform = 'scale(1)';
            });
            
            button.addEventListener('click', () => {
                handleShare(link.action);
            });
            
            shareContainer.appendChild(button);
        });
        
        document.body.appendChild(shareContainer);
    };
    
    // 6. 图片查看器增强
    const enhanceImageViewer = () => {
        document.querySelectorAll('img').forEach(img => {
            if (!img.closest('.logo') && !img.closest('.testimonial-author')) {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', function(e) {
                    e.preventDefault();
                    openImageViewer(this.src, this.alt);
                });
            }
        });
    };
    
    // 7. 智能搜索建议
    const addSearchSuggestions = () => {
        const searchInput = document.getElementById('quickSearchInput');
        if (!searchInput) return;
        
        const suggestions = [
            'Colombo hotels', 'Airport transfer', 'Kandy tours',
            'Beach resorts', 'Safari packages', 'Tea plantation tours',
            'Sigiriya day trip', 'Galle Fort hotels', 'Yala National Park'
        ];
        
        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'search-suggestions';
        suggestionBox.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            max-height: 300px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(suggestionBox);
        
        searchInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            if (value.length > 1) {
                const filtered = suggestions.filter(s => s.toLowerCase().includes(value));
                displaySuggestions(filtered, suggestionBox, this);
            } else {
                suggestionBox.style.display = 'none';
            }
        });
    };
    
    // 8. 日期选择器增强
    const enhanceDatePickers = () => {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        
        dateInputs.forEach(input => {
            // 设置最小日期为今天
            input.min = today;
            
            // 添加快捷按钮
            const shortcuts = document.createElement('div');
            shortcuts.className = 'date-shortcuts';
            shortcuts.innerHTML = `
                <button type="button" data-days="1">Tomorrow</button>
                <button type="button" data-days="7">Next Week</button>
                <button type="button" data-days="30">Next Month</button>
            `;
            shortcuts.style.cssText = `
                display: flex;
                gap: 5px;
                margin-top: 5px;
            `;
            
            input.parentElement.appendChild(shortcuts);
            
            shortcuts.querySelectorAll('button').forEach(btn => {
                btn.style.cssText = `
                    padding: 5px 10px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                `;
                
                btn.addEventListener('click', function() {
                    const days = parseInt(this.dataset.days);
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    input.value = date.toISOString().split('T')[0];
                    input.dispatchEvent(new Event('change'));
                });
            });
        });
    };
    
    // 辅助函数
    function showFieldError(field, message) {
        removeFieldError(field);
        const error = document.createElement('span');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        field.parentElement.appendChild(error);
    }
    
    function removeFieldError(field) {
        const error = field.parentElement.querySelector('.field-error');
        if (error) error.remove();
    }
    
    function handleShare(action) {
        const url = window.location.href;
        const title = document.title;
        
        switch(action) {
            case 'share':
                if (navigator.share) {
                    navigator.share({ title, url });
                } else {
                    copyToClipboard(url);
                }
                break;
            case 'copy':
                copyToClipboard(url);
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`);
                break;
        }
    }
    
    function copyToClipboard(text) {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
        showNotification('Link copied to clipboard!', 'success');
    }
    
    function openImageViewer(src, alt) {
        const viewer = document.createElement('div');
        viewer.className = 'image-viewer';
        viewer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: zoom-out;
        `;
        
        viewer.innerHTML = `
            <img src="${src}" alt="${alt}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
            <button class="close-viewer" style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px;">&times;</button>
        `;
        
        viewer.addEventListener('click', function(e) {
            if (e.target === this || e.target.className === 'close-viewer') {
                this.remove();
            }
        });
        
        document.body.appendChild(viewer);
    }
    
    function displaySuggestions(suggestions, container, input) {
        container.innerHTML = '';
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.textContent = suggestion;
            item.style.cssText = `
                padding: 10px 15px;
                cursor: pointer;
                transition: background 0.2s ease;
            `;
            
            item.addEventListener('mouseenter', function() {
                this.style.background = '#f0f0f0';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.background = 'white';
            });
            
            item.addEventListener('click', function() {
                input.value = suggestion;
                container.style.display = 'none';
                input.form.dispatchEvent(new Event('submit'));
            });
            
            container.appendChild(item);
        });
        
        container.style.display = 'block';
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 50px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 添加必要的CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        @keyframes slideDown {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, 100%); opacity: 0; }
        }
        
        .nav-links a.active {
            color: var(--accent-color, #ff6b6b) !important;
            font-weight: 600;
        }
        
        .back-to-top:hover {
            transform: scale(1.1);
        }
        
        .share-buttons {
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .share-buttons:hover {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .share-buttons {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 初始化所有功能
    document.addEventListener('DOMContentLoaded', () => {
        addBackToTop();
        addReadingProgress();
        highlightActiveNav();
        addFormValidation();
        addShareButtons();
        enhanceImageViewer();
        addSearchSuggestions();
        enhanceDatePickers();
        
        console.log('UX enhancements loaded');
    });
    
})(); 