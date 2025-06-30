/**
 * Performance Optimizer - Comprehensive performance enhancement for Sri Lankan tourism website
 * Handles image optimization, resource preloading, caching, and performance monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.config = {
            // Performance thresholds
            imageLoadTimeout: 10000,
            criticalResourceTimeout: 5000,
            lazyLoadThreshold: 200,
            
            // Optimization settings
            enableImageOptimization: true,
            enableResourcePreloading: true,
            enableLazyLoading: true,
            enableServiceWorker: true,
            
            // Analytics
            enablePerformanceTracking: true
        };
        
        this.metrics = {
            pageLoadStart: performance.now(),
            imagesLoaded: 0,
            imagesTotal: 0,
            resourcesLoaded: 0,
            resourcesTotal: 0
        };
        
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.preloadCriticalResources();
        this.optimizeImages();
        this.setupLazyLoading();
        this.setupServiceWorker();
        this.setupResourceHints();
        this.monitorPagePerformance();
    }

    // Performance monitoring setup
    setupPerformanceMonitoring() {
        if (!this.config.enablePerformanceTracking) return;

        // Monitor navigation timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPagePerformance();
            }, 1000);
        });

        // Monitor resource loading
        this.setupResourceObserver();
        
        // Monitor Core Web Vitals
        this.trackCoreWebVitals();
    }

    // Track page performance metrics
    trackPagePerformance() {
        if (!performance.getEntriesByType) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return;

        const metrics = {
            // Page load metrics
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
            
            // Network metrics
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart,
            
            // Image metrics
            imagesLoaded: this.metrics.imagesLoaded,
            imagesTotal: this.metrics.imagesTotal,
            imageLoadSuccess: this.metrics.imagesTotal > 0 ? (this.metrics.imagesLoaded / this.metrics.imagesTotal * 100).toFixed(1) : 0
        };

        console.log('📊 Page Performance Metrics:', metrics);
        
        // Store metrics for analytics
        this.storeMetrics(metrics);
        
        return metrics;
    }

    // Setup resource loading observer
    setupResourceObserver() {
        if (!window.PerformanceObserver) return;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    this.metrics.resourcesLoaded++;
                    
                    // Track slow resources
                    if (entry.duration > 1000) {
                        console.warn(`Slow resource detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                    }
                }
            }
        });

        observer.observe({ entryTypes: ['resource'] });
    }

    // Track Core Web Vitals
    trackCoreWebVitals() {
        // Cumulative Layout Shift (CLS)
        this.trackCLS();
        
        // First Input Delay (FID)
        this.trackFID();
        
        // Largest Contentful Paint (LCP)
        this.trackLCP();
    }

    trackCLS() {
        if (!window.PerformanceObserver) return;

        let cumulativeLayoutShift = 0;
        
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    cumulativeLayoutShift += entry.value;
                }
            }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
            console.log(`📏 Cumulative Layout Shift: ${cumulativeLayoutShift.toFixed(4)}`);
        }, 5000);
    }

    trackFID() {
        if (!window.PerformanceObserver) return;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log(`⚡ First Input Delay: ${entry.processingStart - entry.startTime}ms`);
            }
        });

        observer.observe({ type: 'first-input', buffered: true });
    }

    trackLCP() {
        if (!window.PerformanceObserver) return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`🎨 Largest Contentful Paint: ${lastEntry.startTime}ms`);
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // Preload critical resources
    preloadCriticalResources() {
        if (!this.config.enableResourcePreloading) return;

        const criticalResources = [
            // Critical CSS
            { href: 'css/style.css', as: 'style', type: 'text/css' },
            { href: 'css/responsive.css', as: 'style', type: 'text/css' },
            
            // Critical JavaScript
            { href: 'js/main.js', as: 'script', type: 'text/javascript' },
            { href: 'js/booking.js', as: 'script', type: 'text/javascript' },
            
            // Critical Images
            { href: 'images/hero-bg.jpg', as: 'image', type: 'image/jpeg' },
            { href: 'images/ranga_bandara_logo_v2.png', as: 'image', type: 'image/png' },
            
            // Critical Fonts
            { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', as: 'style', type: 'text/css' }
        ];

        criticalResources.forEach(resource => {
            this.preloadResource(resource);
        });
    }

    preloadResource(resource) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) link.type = resource.type;
        if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
        
        link.onload = () => {
            this.metrics.resourcesLoaded++;
            console.log(`✅ Preloaded: ${resource.href}`);
        };
        
        link.onerror = () => {
            console.warn(`❌ Failed to preload: ${resource.href}`);
        };
        
        document.head.appendChild(link);
        this.metrics.resourcesTotal++;
    }

    // Optimize images
    optimizeImages() {
        if (!this.config.enableImageOptimization) return;

        const images = document.querySelectorAll('img');
        this.metrics.imagesTotal = images.length;

        images.forEach(img => {
            this.optimizeImage(img);
        });

        // Setup observer for dynamically added images
        this.setupImageObserver();
    }

    optimizeImage(img) {
        // Add loading attribute for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.loading = 'lazy';
        }

        // Add proper alt text if missing
        if (!img.alt) {
            img.alt = 'Sri Lankan Tourism Image';
        }

        // Setup image loading handlers
        img.addEventListener('load', () => {
            this.metrics.imagesLoaded++;
            img.classList.add('loaded');
        });

        img.addEventListener('error', () => {
            console.warn(`Failed to load image: ${img.src}`);
        });

        // Add responsive image attributes if not present
        this.addResponsiveImageAttributes(img);
    }

    addResponsiveImageAttributes(img) {
        // Add decoding attribute for better performance
        if (!img.hasAttribute('decoding')) {
            img.decoding = 'async';
        }

        // Add fetch priority for above-the-fold images
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.left < window.innerWidth) {
            img.fetchPriority = 'high';
        }
    }

    setupImageObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        images.forEach(img => {
                            this.optimizeImage(img);
                            this.metrics.imagesTotal++;
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Setup lazy loading for content below the fold
    setupLazyLoading() {
        if (!this.config.enableLazyLoading || !window.IntersectionObserver) return;

        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `${this.config.lazyLoadThreshold}px`
        });

        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });
    }

    loadLazyElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        
        if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
        }
        
        element.classList.add('lazy-loaded');
    }

    // Setup Service Worker for caching
    setupServiceWorker() {
        if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) return;

        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.warn('❌ Service Worker registration failed:', error);
            });
    }

    // Setup resource hints
    setupResourceHints() {
        const hints = [
            // DNS prefetch for external resources
            { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://unpkg.com' },
            
            // Preconnect for critical external resources
            { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: true },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) link.crossOrigin = '';
            document.head.appendChild(link);
        });
    }

    // Monitor ongoing page performance
    monitorPagePerformance() {
        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('⚠️ High memory usage detected');
                }
            }, 30000);
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn(`⏱️ Long task detected: ${entry.duration}ms`);
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    // Store metrics for analytics
    storeMetrics(metrics) {
        try {
            localStorage.setItem('performanceMetrics', JSON.stringify({
                ...metrics,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                connectionType: navigator.connection?.effectiveType || 'unknown'
            }));
        } catch (e) {
            console.warn('Failed to store performance metrics:', e);
        }
    }

    // Get performance report
    getPerformanceReport() {
        const metrics = this.trackPagePerformance();
        
        const report = {
            ...metrics,
            grade: this.calculatePerformanceGrade(metrics),
            recommendations: this.getPerformanceRecommendations(metrics)
        };

        console.log('📋 Performance Report:', report);
        return report;
    }

    calculatePerformanceGrade(metrics) {
        let score = 100;
        
        // Deduct points for slow loading
        if (metrics.totalPageLoad > 3000) score -= 20;
        if (metrics.totalPageLoad > 5000) score -= 30;
        
        // Deduct points for slow DOM content loaded
        if (metrics.domContentLoaded > 1500) score -= 15;
        
        // Deduct points for failed images
        if (metrics.imageLoadSuccess < 90) score -= 15;
        
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    getPerformanceRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.totalPageLoad > 3000) {
            recommendations.push('Consider optimizing images and reducing resource sizes');
        }
        
        if (metrics.domContentLoaded > 1500) {
            recommendations.push('Optimize JavaScript execution and DOM manipulation');
        }
        
        if (metrics.imageLoadSuccess < 90) {
            recommendations.push('Fix broken images and implement better error handling');
        }
        
        if (metrics.serverResponse > 500) {
            recommendations.push('Optimize server response time');
        }
        
        return recommendations;
    }
}

// Auto-initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Provide global function for performance reporting
window.getPerformanceReport = () => {
    if (window.performanceOptimizer) {
        return window.performanceOptimizer.getPerformanceReport();
    }
    console.warn('Performance optimizer not initialized');
};

// CSS for performance-related animations
if (!document.querySelector('#performance-styles')) {
    const styles = document.createElement('style');
    styles.id = 'performance-styles';
    styles.textContent = `
        img {
            transition: opacity 0.3s ease;
        }
        
        img:not(.loaded) {
            opacity: 0.7;
        }
        
        img.loaded {
            opacity: 1;
        }
        
        .lazy-loaded {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styles);
} 