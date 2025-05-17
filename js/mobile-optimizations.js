/**
 * Sri Lanka Stay & Explore - Mobile Optimizations
 * Enhances mobile user experience with optimized touch interactions, improved scrolling, and form handling
 */

(function() {
    // Check if the device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Only apply these optimizations for mobile devices
    if (!isMobile) return;
    
    // Add mobile-specific class to body for CSS targeting
    document.body.classList.add('mobile-device');
    
    // Fix for iOS viewport height issue with vh units
    function fixIOSHeight() {
        // Set CSS variable for viewport height that works on iOS
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Fix height on initial load and resize
    fixIOSHeight();
    window.addEventListener('resize', fixIOSHeight);
    
    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        // Add a class while scrolling
        document.body.classList.add('is-scrolling');
        
        // Remove the class after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            document.body.classList.remove('is-scrolling');
        }, 100);
    });
    
    // Add touch feedback effects to buttons and interactive elements
    function addTouchFeedback() {
        const interactiveElements = document.querySelectorAll('button, .btn, a, .form-group');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            ['touchend', 'touchcancel'].forEach(eventType => {
                element.addEventListener(eventType, function() {
                    this.classList.remove('touch-active');
                }, { passive: true });
            });
        });
    }
    
    // Fix slow-click delay on iOS
    function removeTouchDelay() {
        // Apply to all buttons and links
        document.querySelectorAll('a, button, .btn, .btn-secondary, input[type="submit"]').forEach(el => {
            el.style.touchAction = 'manipulation';
        });
    }
    
    // Fix form input issues on mobile
    function optimizeForms() {
        // Focus handling to prevent unnecessary zooming
        document.querySelectorAll('input, select, textarea').forEach(input => {
            // Set font-size to 16px to prevent iOS zoom on focus
            input.style.fontSize = '16px';
            
            // Auto-blur inputs when Enter key is pressed
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && input.type !== 'textarea') {
                    input.blur();
                }
            });
        });
        
        // Fix for map select buttons on mobile
        const mapButtons = document.querySelectorAll('.map-select-btn');
        mapButtons.forEach(button => {
            button.addEventListener('touchend', function(e) {
                // Prevent default to avoid double-taps
                e.preventDefault();
                // Add slight delay to ensure the tap is registered correctly
                setTimeout(() => {
                    this.click();
                }, 10);
            });
        });
    }
    
    // Improve lazy loading of images and resources
    function enhanceLazyLoading() {
        // Find images that should be lazy loaded
        const lazyImages = document.querySelectorAll('img[loading="lazy"], .lazy-load img');
        
        // Add loading class to parent containers
        lazyImages.forEach(img => {
            const parent = img.parentElement;
            if (parent) {
                parent.classList.add('lazy-load');
                
                // Add loaded class when image loads
                img.addEventListener('load', () => {
                    parent.classList.add('lazy-loaded');
                });
            }
        });
    }
    
    // Optimize mobile menu behavior
    function optimizeMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-nav-toggle, #mobileNavToggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            // Set initial state
            navLinks.classList.add('mobile-nav-links');
            navLinks.style.display = 'none';
            
            // Toggle menu on click
            mobileMenuToggle.addEventListener('click', function() {
                const isVisible = navLinks.style.display === 'flex';
                navLinks.style.display = isVisible ? 'none' : 'flex';
                this.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (navLinks.style.display === 'flex' && 
                    !navLinks.contains(e.target) && 
                    e.target !== mobileMenuToggle) {
                    navLinks.style.display = 'none';
                    mobileMenuToggle.classList.remove('active');
                }
            });
        }
    }
    
    // Fix smooth scrolling for anchor links
    function fixSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                // Only process internal links
                const targetId = this.getAttribute('href');
                if (targetId === '#' || !targetId) return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close the mobile menu if it's open
                    const navLinks = document.querySelector('.nav-links');
                    const mobileMenuToggle = document.querySelector('.mobile-nav-toggle, #mobileNavToggle');
                    if (navLinks && navLinks.style.display === 'flex') {
                        navLinks.style.display = 'none';
                        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
                    }
                    
                    // Scroll to the target element
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Optimize scrolling performance
    function optimizeScrolling() {
        // Add passive event listeners for better scroll performance
        const passiveSupported = () => {
            let passive = false;
            try {
                const options = Object.defineProperty({}, "passive", {
                    get: function() { passive = true; return true; }
                });
                window.addEventListener("test", null, options);
                window.removeEventListener("test", null, options);
            } catch(err) {}
            return passive;
        };
        
        // Use passive listeners if supported
        const wheelOpts = passiveSupported() ? { passive: true } : false;
        document.addEventListener('touchstart', function(){}, wheelOpts);
        document.addEventListener('touchmove', function(){}, wheelOpts);
        document.addEventListener('wheel', function(){}, wheelOpts);
    }
    
    // Fix admin dashboard sidebar on mobile
    function fixAdminSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const adminLayout = document.querySelector('.admin-layout');
        
        if (sidebarToggle && adminLayout) {
            // Default to collapsed on mobile
            adminLayout.classList.add('sidebar-collapsed');
            
            sidebarToggle.addEventListener('click', function() {
                adminLayout.classList.toggle('sidebar-collapsed');
            });
            
            // Close sidebar when clicking on content area on small screens
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 767 && 
                    !adminLayout.classList.contains('sidebar-collapsed') && 
                    !e.target.closest('.admin-sidebar') && 
                    e.target !== sidebarToggle) {
                    adminLayout.classList.add('sidebar-collapsed');
                }
            });
        }
    }

    // Initialize all mobile optimizations when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        addTouchFeedback();
        removeTouchDelay();
        optimizeForms();
        enhanceLazyLoading();
        optimizeMobileMenu();
        fixSmoothScrolling();
        optimizeScrolling();
        fixAdminSidebar();
        
        console.log('Mobile optimizations applied');
    });

})(); 

// 移动端优化脚本

document.addEventListener('DOMContentLoaded', function() {
    // 检测是否是移动设备
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 初始化移动端导航
        initMobileNav();
        
        // 优化移动端按钮位置
        optimizeButtonPositions();
        
        // 改进移动端表单体验
        enhanceMobileFormExperience();
        
        // 监听窗口大小变化，以便在旋转屏幕时重新优化
        window.addEventListener('resize', handleResize);
    }
    
    // 修复iOS Safari滚动问题
    fixIOSSafariScroll();
});

// 初始化移动端导航
function initMobileNav() {
    const header = document.querySelector('header');
    const nav = document.querySelector('.main-nav');
    
    if (!header || !nav) return;
    
    // 创建汉堡菜单按钮
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu';
    hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
    hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
    
    // 将原始菜单转换为下拉菜单
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.add('mobile-nav-links');
        navLinks.style.display = 'none'; // 初始隐藏
        
        // 添加汉堡菜单到导航
        nav.insertBefore(hamburgerBtn, navLinks);
        
        // 添加点击事件
        hamburgerBtn.addEventListener('click', function() {
            if (navLinks.style.display === 'none') {
                navLinks.style.display = 'flex';
                hamburgerBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                navLinks.style.display = 'none';
                hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // 点击导航链接后自动关闭菜单
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navLinks.style.display = 'none';
                hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // 添加移动端导航样式
    const style = document.createElement('style');
    style.textContent = `
        .hamburger-menu {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            display: none;
        }
        
        @media (max-width: 768px) {
            .hamburger-menu {
                display: block;
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 1000;
            }
            
            .mobile-nav-links {
                position: absolute;
                top: 60px;
                left: 0;
                width: 100%;
                flex-direction: column;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 999;
                padding: 10px 0;
                box-shadow: 0 5px 10px rgba(0,0,0,0.2);
            }
            
            .mobile-nav-links li {
                width: 100%;
                text-align: center;
                margin: 5px 0;
            }
            
            .mobile-nav-links li a {
                display: block;
                padding: 10px;
            }
            
            .logo {
                position: relative;
                z-index: 1001;
            }
        }
    `;
    document.head.appendChild(style);
}

// 优化移动端按钮位置
function optimizeButtonPositions() {
    const feedbackBtn = document.getElementById('showFeedback');
    const aiBtn = document.getElementById('showAI');
    
    if (feedbackBtn && aiBtn) {
        // 确保按钮不重叠
        feedbackBtn.style.bottom = '80px';
        aiBtn.style.bottom = '20px';
    }
}

// 改进移动端表单体验
function enhanceMobileFormExperience() {
    // 增大输入框点击区域
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.style.padding = '12px';
        input.style.fontSize = '16px'; // 预防iOS缩放
    });
    
    // 调整表单按钮大小
    const formButtons = document.querySelectorAll('.form-buttons button');
    formButtons.forEach(button => {
        button.style.padding = '12px 15px';
        button.style.fontSize = '16px';
        button.style.margin = '5px';
    });
}

// 修复iOS Safari滚动问题
function fixIOSSafariScroll() {
    // 检测是否是iOS设备
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // 修复iOS中软键盘弹出时的页面抖动
        document.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // 当输入框获得焦点时，暂时禁用页面滚动
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            }
        }, true);
        
        document.addEventListener('blur', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // 当输入框失去焦点时，恢复页面滚动
                document.body.style.position = '';
                document.body.style.width = '';
            }
        }, true);
    }
}

// 处理屏幕大小变化
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const navLinks = document.querySelector('.nav-links');
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    
    if (!isMobile && navLinks && hamburgerBtn) {
        // 如果不再是移动尺寸，重置导航
        navLinks.style.display = '';
        hamburgerBtn.style.display = 'none';
    } else if (isMobile && navLinks && hamburgerBtn) {
        // 确保在移动模式下汉堡按钮可见
        hamburgerBtn.style.display = 'block';
    }
}

// 优化图片懒加载
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(function(image) {
            imageObserver.observe(image);
        });
    }
}); 

/**
 * 移动端优化脚本
 * 解决移动端常见的UI和交互问题
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端优化
    initMobileOptimizations();
    
    // 特殊处理日期和时间选择器
    initDateTimeInputs();
    
    // 添加表单聚焦管理
    initFormFocusManagement();
});

/**
 * 初始化移动端优化
 */
function initMobileOptimizations() {
    // 检测是否为移动设备
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 在body上添加mobile类，方便CSS定位
        document.body.classList.add('mobile-device');
        
        // 处理iOS中的100vh问题
        fixIOSViewportHeight();
        
        // 防止iOS橡皮筋滚动效果
        preventRubberBandScroll();
        
        // 对所有按钮添加触摸反馈
        addTouchFeedback();
    }
}

/**
 * 处理iOS中视口高度的问题
 * iOS中的100vh会包含地址栏的高度，导致内容被遮挡
 */
function fixIOSViewportHeight() {
    // 检测是否为iOS设备
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // 设置CSS变量作为实际可见高度
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        // 初始设置
        setViewportHeight();
        
        // 监听窗口大小变化和方向变化
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setViewportHeight, 100);
        });
    }
}

/**
 * 防止iOS橡皮筋滚动效果
 * 这个效果在某些情况下会导致UI问题
 */
function preventRubberBandScroll() {
    // 只应用于iOS设备
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        let startY;
        
        document.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            const currentY = e.touches[0].clientY;
            const scrollingElement = document.scrollingElement || document.documentElement;
            const isAtTop = scrollingElement.scrollTop <= 0;
            const isAtBottom = scrollingElement.scrollHeight - scrollingElement.scrollTop <= scrollingElement.clientHeight;
            
            // 阻止向下拉到顶部的默认行为
            if (isAtTop && currentY > startY) {
                e.preventDefault();
            }
            
            // 阻止向上拉到底部的默认行为
            if (isAtBottom && currentY < startY) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

/**
 * 特殊处理日期和时间输入框，防止移动端跳转问题
 */
function initDateTimeInputs() {
    // 获取所有日期和时间输入框
    const dateTimeInputs = document.querySelectorAll('input[type="date"], input[type="time"]');
    
    // 检查是否为移动设备
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile || dateTimeInputs.length === 0) {
        return;
    }
    
    // 处理每个日期和时间输入框
    dateTimeInputs.forEach(input => {
        // 创建一个辅助函数来保存滚动位置
        function saveCurrentScroll() {
            input.dataset.scrollY = window.scrollY || window.pageYOffset;
            console.log(`保存滚动位置: ${input.dataset.scrollY}px (${input.id})`);
        }
        
        // 创建一个辅助函数来恢复滚动位置
        function restoreScroll() {
            if (input.dataset.scrollY) {
                const scrollY = parseInt(input.dataset.scrollY, 10);
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    console.log(`恢复滚动位置: ${scrollY}px (${input.id})`);
                }, 10);
            }
        }
        
        // 添加iOS专用的修复
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            // 为iOS设备添加特殊的事件监听器
            input.addEventListener('touchstart', saveCurrentScroll, { passive: true });
            input.addEventListener('focus', saveCurrentScroll);
            
            // 使用focusout事件捕获日期选择完成的时刻
            input.addEventListener('focusout', restoreScroll);
            input.addEventListener('change', restoreScroll);
            
            // 添加隐藏的辅助元素来强制控制滚动行为
            const helper = document.createElement('div');
            helper.style.height = '1px';
            helper.style.width = '1px';
            helper.style.position = 'absolute';
            helper.style.left = '-9999px';
            helper.style.top = '0';
            document.body.appendChild(helper);
            
            // 在选择器打开前滚动到辅助元素
            input.addEventListener('touchstart', function(e) {
                // 仅当用户点击输入框自身时执行
                if (e.target === this) {
                    saveCurrentScroll();
                    helper.scrollIntoView({ behavior: 'auto' });
                    setTimeout(restoreScroll, 10);
                }
            }, { passive: true });
        }
        
        // 添加Android专用的修复
        if (/Android/.test(navigator.userAgent)) {
            input.addEventListener('touchstart', saveCurrentScroll, { passive: true });
            input.addEventListener('focus', saveCurrentScroll);
            input.addEventListener('blur', restoreScroll);
            input.addEventListener('change', restoreScroll);
        }
    });
}

/**
 * 初始化表单聚焦管理
 * 处理移动键盘弹出时的视图调整
 */
function initFormFocusManagement() {
    // 检查是否为移动设备
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        return;
    }
    
    // 获取所有输入元素
    const inputs = document.querySelectorAll('input:not([type="date"]):not([type="time"]), textarea, select');
    
    // 找到预订表单的位置
    const bookingForm = document.querySelector('.booking-form');
    const bookingFormTop = bookingForm ? bookingForm.getBoundingClientRect().top + window.pageYOffset : 0;
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 保存当前滚动位置
            if (typeof saveScrollPosition === 'function') {
                saveScrollPosition();
            }
            
            // 如果输入框在表单内且在视口外，则滚动到可见位置
            const rect = this.getBoundingClientRect();
            const isOutOfViewport = rect.bottom > window.innerHeight || rect.top < 0;
            
            if (isOutOfViewport && this.closest('.booking-form')) {
                // 计算滚动目标位置
                const scrollTarget = window.pageYOffset + rect.top - (window.innerHeight / 4);
                
                // 滚动到目标位置
                window.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            }
        });
        
        input.addEventListener('blur', function() {
            // 在输入完成后恢复滚动位置
            if (typeof lastScrollPosition !== 'undefined' && lastScrollPosition > 0) {
                setTimeout(function() {
                    window.scrollTo({
                        top: lastScrollPosition,
                        behavior: 'auto'
                    });
                }, 300);
            }
        });
    });
} 