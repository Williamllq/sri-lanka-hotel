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