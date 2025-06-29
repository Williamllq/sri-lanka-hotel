/**
 * Modern UI Enhancements for Sri Lanka Stay & Explore
 * 添加交互效果和动画
 */

(function() {
    'use strict';
    
    // ========================================
    // 导航栏滚动效果
    // ========================================
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // 添加滚动类
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 滚动隐藏/显示导航栏
        if (currentScroll > lastScroll && currentScroll > 80) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // ========================================
    // 平滑滚动
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // 滚动动画观察器
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // 为卡片添加延迟动画
                if (entry.target.classList.contains('animate-card')) {
                    const cards = entry.target.querySelectorAll('.card, .transport-card, .feature-card, .hotel-card, .room-card, .testimonial-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animated');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.section, .animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // ========================================
    // 画廊过滤动画
    // ========================================
    const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // 更新激活状态
            galleryFilters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // 过滤画廊项目
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => item.classList.add('show'), 10);
                } else {
                    item.classList.remove('show');
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });
    
    // ========================================
    // 表单增强
    // ========================================
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea, input, select, textarea');
    
    formInputs.forEach(input => {
        // 添加焦点效果
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
        
        // 初始检查
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }
    });
    
    // ========================================
    // 按钮涟漪效果
    // ========================================
    document.querySelectorAll('.btn, .btn-primary, .btn-secondary, button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // ========================================
    // 数字动画
    // ========================================
    const animateNumbers = () => {
        const numbers = document.querySelectorAll('[data-count]');
        
        numbers.forEach(number => {
            const target = parseInt(number.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateNumber = () => {
                current += increment;
                if (current < target) {
                    number.textContent = Math.floor(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    number.textContent = target;
                }
            };
            
            // 使用Intersection Observer触发动画
            const numberObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        updateNumber();
                    }
                });
            }, { threshold: 0.5 });
            
            numberObserver.observe(number);
        });
    };
    
    animateNumbers();
    
    // ========================================
    // 图片懒加载优化
    // ========================================
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // ========================================
    // 移动端菜单
    // ========================================
    const createMobileMenu = () => {
        const nav = document.querySelector('.main-nav');
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-toggle';
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        menuButton.setAttribute('aria-label', 'Toggle menu');
        
        nav.appendChild(menuButton);
        
        menuButton.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
            const icon = menuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        // 关闭菜单当点击链接
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('menu-open');
                menuButton.querySelector('i').classList.add('fa-bars');
                menuButton.querySelector('i').classList.remove('fa-times');
            });
        });
    };
    
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }
    
    // ========================================
    // 搜索框增强
    // ========================================
    const searchInput = document.querySelector('#quickSearchInput');
    const searchButton = document.querySelector('.search-button');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                searchButton.classList.add('active');
            } else {
                searchButton.classList.remove('active');
            }
        });
        
        // 搜索建议（示例）
        const suggestions = ['Colombo Hotels', 'Kandy Tours', 'Beach Resorts', 'Safari Tours', 'Tea Plantation Tours'];
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        searchInput.parentElement.appendChild(suggestionsContainer);
        
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length === 0) {
                suggestionsContainer.innerHTML = suggestions.map(s => 
                    `<div class="suggestion-item">${s}</div>`
                ).join('');
                suggestionsContainer.style.display = 'block';
            }
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }
    
    // ========================================
    // 添加页面加载动画
    // ========================================
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // 依次显示元素
        const animateElements = document.querySelectorAll('.hero-content > *, .section-title, .card');
        animateElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in-up');
            }, index * 100);
        });
    });
    
    // ========================================
    // 添加自定义鼠标跟随效果（可选）
    // ========================================
    if (window.innerWidth > 1024) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        const cursorFollower = document.createElement('div');
        cursorFollower.className = 'cursor-follower';
        document.body.appendChild(cursorFollower);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });
        
        // 悬停效果
        document.querySelectorAll('a, button, .card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }
    
})(); 