/**
 * Sri Lanka Stay & Explore - Analytics Module
 * Implements Google Analytics 4 (GA4) tracking for the website
 */

// Initialize analytics tracking system
(function() {
    // Constants
    const GA_MEASUREMENT_ID = 'G-XXXXXXXX'; // Replace with actual GA4 measurement ID
    const DEBUG_MODE = false; // Set to true for development/testing

    // Initialize
    function initAnalytics() {
        console.log('Initializing website analytics tracking...');
        
        // Load Google Analytics
        loadGoogleAnalytics();
        
        // Set up custom event listeners
        setupEventTracking();
    }

    // Load Google Analytics script
    function loadGoogleAnalytics() {
        // Check if gtag is already loaded
        if (typeof gtag !== 'undefined') {
            console.log('Google Analytics already loaded');
            return;
        }
        
        // Create script elements
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        
        const inlineScript = document.createElement('script');
        inlineScript.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { 
                'debug_mode': ${DEBUG_MODE},
                'send_page_view': true
            });
        `;
        
        // Add scripts to head
        document.head.appendChild(gaScript);
        document.head.appendChild(inlineScript);
        
        console.log('Google Analytics loading...');
    }
    
    // Set up event tracking for important user interactions
    function setupEventTracking() {
        // Track navigation clicks
        trackNavigation();
        
        // Track booking form submissions
        trackBookingForms();
        
        // Track content engagement
        trackContentEngagement();

        // Track outbound links
        trackOutboundLinks();
        
        console.log('Event tracking initialized');
    }
    
    // Track navigation menu clicks
    function trackNavigation() {
        document.addEventListener('click', function(event) {
            // Check if click is on a navigation link
            if (event.target.tagName === 'A' && 
                (event.target.closest('.nav-links') || 
                 event.target.closest('.main-nav') || 
                 event.target.closest('.footer-links'))) {
                
                const linkText = event.target.textContent.trim();
                const linkUrl = event.target.getAttribute('href');
                
                // Track navigation click event
                trackEvent('navigation', 'click', linkText, linkUrl);
            }
        });
    }
    
    // Track booking form submissions
    function trackBookingForms() {
        // Find booking forms
        const bookingForms = document.querySelectorAll('form.booking-form, #transportBookingForm, #hotelBookingForm');
        
        bookingForms.forEach(form => {
            form.addEventListener('submit', function(event) {
                // Get form ID or create descriptive name
                const formId = this.id || 'unknown_form';
                const formType = formId.includes('transport') ? 'transport' : 
                               formId.includes('hotel') ? 'hotel' : 'general';
                
                // Track form submission
                trackEvent('booking', 'submit', formType, formId);
            });
        });
    }
    
    // Track content engagement (scrolling to sections, video plays, etc.)
    function trackContentEngagement() {
        // Track scroll depth
        let scrollTracked = {
            '25%': false,
            '50%': false,
            '75%': false,
            '100%': false
        };
        
        window.addEventListener('scroll', debounce(function() {
            const scrollPercent = getScrollPercent();
            
            if (scrollPercent >= 25 && !scrollTracked['25%']) {
                trackEvent('scroll', 'depth', '25%');
                scrollTracked['25%'] = true;
            }
            if (scrollPercent >= 50 && !scrollTracked['50%']) {
                trackEvent('scroll', 'depth', '50%');
                scrollTracked['50%'] = true;
            }
            if (scrollPercent >= 75 && !scrollTracked['75%']) {
                trackEvent('scroll', 'depth', '75%');
                scrollTracked['75%'] = true;
            }
            if (scrollPercent >= 98 && !scrollTracked['100%']) {
                trackEvent('scroll', 'depth', '100%');
                scrollTracked['100%'] = true;
            }
        }, 500));
        
        // Calculate scroll percentage
        function getScrollPercent() {
            const doc = document.documentElement;
            const body = document.body;
            const scrollTop = doc.scrollTop || body.scrollTop;
            const scrollHeight = doc.scrollHeight || body.scrollHeight;
            const clientHeight = doc.clientHeight;
            
            return (scrollTop / (scrollHeight - clientHeight)) * 100;
        }
        
        // Track video plays if videos exist
        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
            video.addEventListener('play', function() {
                trackEvent('video', 'play', `video_${index + 1}`);
            });
            
            video.addEventListener('pause', function() {
                if (this.currentTime > 0 && !this.ended) {
                    trackEvent('video', 'pause', `video_${index + 1}`);
                }
            });
            
            video.addEventListener('ended', function() {
                trackEvent('video', 'complete', `video_${index + 1}`);
            });
        });
    }
    
    // Track outbound links
    function trackOutboundLinks() {
        document.addEventListener('click', function(event) {
            // Check if click is on a link
            if (event.target.tagName === 'A') {
                const href = event.target.getAttribute('href');
                
                // Check if external link (not same origin and not anchor)
                if (href && href.indexOf('http') === 0 && href.indexOf(window.location.hostname) === -1) {
                    trackEvent('outbound', 'click', event.target.textContent.trim(), href);
                }
            }
        });
    }
    
    // Generic tracking function
    function trackEvent(category, action, label, value) {
        if (typeof gtag === 'undefined') {
            console.warn('Google Analytics not loaded yet, cannot track event');
            return;
        }
        
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
        
        if (DEBUG_MODE) {
            console.log(`Tracked event: ${category} / ${action} / ${label} / ${value}`);
        }
    }
    
    // Helper function: debounce to prevent too many scroll events
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }
})(); 