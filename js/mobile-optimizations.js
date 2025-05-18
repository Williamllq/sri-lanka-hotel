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
    function handleScroll() {
        // Add a class while scrolling
        document.body.classList.add('is-scrolling');
        
        // Remove the class after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            document.body.classList.remove('is-scrolling');
        }, 100);
    }
    
    // Add touch feedback effects to buttons and interactive elements
    function addTouchFeedback() {
        const interactiveElements = document.querySelectorAll('.btn, .btn-secondary, .admin-btn, .gallery-filter-btn, .nav-links a, .featured-image, .gallery-thumbnail, .transport-card');
        
        interactiveElements.forEach(element => {
            // Add touch feedback class
            element.classList.add('touch-feedback');
            
            // Add touch start effect
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            // Remove touch effect after touch end
            ['touchend', 'touchcancel'].forEach(event => {
                element.addEventListener(event, function() {
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
            if (isMobile) {
                input.style.fontSize = '16px';
            }
            
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

        if ('IntersectionObserver' in window) {
            const dataSrcImages = document.querySelectorAll('img[data-src]');
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
            dataSrcImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        }
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
                    !mobileMenuToggle.contains(e.target) && // Ensure not clicking the toggle itself
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
    function optimizePassiveScrolling() {
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
        
        if (sidebarToggle && adminLayout && isMobile) {
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
        // Initial iOS Height Fix
        if (isMobile) {
             fixIOSHeight();
        }
       
        // Scroll handling
        window.addEventListener('scroll', handleScroll);

        // Mobile specific initializations
        if (isMobile) {
            addTouchFeedback();
            removeTouchDelay();
            optimizeForms();
            optimizeMobileMenu(); // This is the first mobile menu system
            initMobileNav(); // This is the second mobile menu system, ensure they don't conflict or choose one.
            optimizeButtonPositions();
            enhanceMobileFormExperience();
            fixIOSSafariScroll(); 
            window.addEventListener('resize', fixIOSHeight); // Resize for iOS height
            window.addEventListener('resize', handleResizeForMobileNav); // Resize for the second mobile nav
        }
        
        // Optimizations for all devices (or as configured)
        enhanceLazyLoading(); // Lazy loading for all
        fixSmoothScrolling(); // Smooth scroll for all
        optimizePassiveScrolling(); // Passive scroll listeners for all
        fixAdminSidebar(); // Admin sidebar (conditionally mobile)

        console.log('All mobile/general optimizations and initializations applied via single DOMContentLoaded.');
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
                // document.body.style.position = 'fixed'; // PROBLEMATIC LINE - Commented out
                // document.body.style.width = '100%';
                console.log('iOS input focus, body.style.position was fixed, now commented out.');
            }
        }, true);
        
        document.addEventListener('blur', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // 当输入框失去焦点时，恢复页面滚动
                // document.body.style.position = ''; // Corresponding part for the problematic line
                // document.body.style.width = '';
                console.log('iOS input blur, body.style.position was reset, now commented out.');
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

// 处理屏幕大小变化 (for initMobileNav)
function handleResizeForMobileNav() {
    const isMobileNow = window.innerWidth <= 768;
    const navLinks = document.querySelector('.main-nav .nav-links'); // Be more specific
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    
    if (!isMobileNow && navLinks && hamburgerBtn && hamburgerBtn.style.display !== 'none') {
        navLinks.style.display = ''; // Reset to CSS default (flex)
        hamburgerBtn.style.display = 'none';
    } else if (isMobileNow && navLinks && hamburgerBtn && hamburgerBtn.style.display === 'none') {
        hamburgerBtn.style.display = 'block';
        if (!navLinks.classList.contains('mobile-nav-links')) { // Ensure mobile styles are active
             navLinks.style.display = 'none'; // Hide if it was visible from desktop
        }
    }
} 