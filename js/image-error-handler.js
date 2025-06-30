/**
 * Image Error Handler - Provides robust fallback mechanisms for missing images
 * Automatically handles 404 errors and provides appropriate alternatives
 */

class ImageErrorHandler {
    constructor() {
        this.fallbackImages = {
            // Tourism category fallbacks
            'nine-arch-bridge.jpg': 'images/Scenery in Sir Lanka 3.jpg',
            'temple-tooth.jpg': 'images/kandy-temple.jpg',
            'unawatuna-beach.jpg': 'images/stilt-fishermen.jpg',
            'yala-leopard.jpg': 'images/sri-lankan-leopard.jpg',
            'sri-lankan-food.jpg': 'images/gallery/food.jpg',
            'sigiriya.jpg': 'images/gallery/scenic-mountains.jpg',
            
            // Default fallbacks by category
            'beach': 'images/gallery/beach.jpg',
            'temple': 'images/gallery/temple.jpg',
            'wildlife': 'images/gallery/wildlife.jpg',
            'mountain': 'images/gallery/scenic-mountains.jpg',
            'food': 'images/gallery/food.jpg',
            'tea': 'images/tea-plantations.jpg',
            
            // Ultimate fallback
            'default': 'images/placeholder.jpg'
        };
        
        this.setupGlobalErrorHandler();
        this.setupIntersectionObserver();
    }

    // Set up global image error handling
    setupGlobalErrorHandler() {
        // Handle existing images
        document.querySelectorAll('img').forEach(img => {
            this.setupImageErrorHandler(img);
        });

        // Handle dynamically added images
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                        images.forEach(img => this.setupImageErrorHandler(img));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Set up individual image error handler
    setupImageErrorHandler(img) {
        if (img.dataset.errorHandlerSet) return;
        
        img.dataset.errorHandlerSet = 'true';
        img.dataset.originalSrc = img.src;
        
        img.onerror = () => {
            this.handleImageError(img);
        };
    }

    // Handle image loading errors
    handleImageError(img) {
        console.log(`Image failed to load: ${img.src}`);
        
        const originalSrc = img.dataset.originalSrc || img.src;
        const fallbackSrc = this.findBestFallback(originalSrc);
        
        if (fallbackSrc && fallbackSrc !== img.src) {
            console.log(`Using fallback image: ${fallbackSrc}`);
            img.src = fallbackSrc;
            img.alt = img.alt || 'Sri Lankan Tourism Image';
            
            // Add visual indicator that this is a fallback
            img.style.filter = 'opacity(0.9)';
            img.title = 'Alternative image loaded';
        } else {
            // Create a placeholder if no fallback works
            this.createPlaceholderElement(img);
        }
    }

    // Find the best fallback image based on the original source
    findBestFallback(originalSrc) {
        const filename = originalSrc.split('/').pop().toLowerCase();
        
        // Check direct mapping first
        if (this.fallbackImages[filename]) {
            return this.fallbackImages[filename];
        }
        
        // Check category-based fallbacks
        for (const [category, fallback] of Object.entries(this.fallbackImages)) {
            if (filename.includes(category) || originalSrc.includes(category)) {
                return fallback;
            }
        }
        
        // Return default fallback
        return this.fallbackImages.default;
    }

    // Create a styled placeholder element
    createPlaceholderElement(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: ${img.width || 300}px;
            height: ${img.height || 200}px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            border: 2px dashed #90caf9;
            color: #1976d2;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
            position: relative;
        `;
        
        placeholder.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">🏝️</div>
            <div style="font-weight: bold;">Sri Lankan Tourism</div>
            <div style="font-size: 12px; opacity: 0.7;">Image Loading...</div>
        `;
        
        // Replace the image with the placeholder
        img.parentNode.replaceChild(placeholder, img);
        
        // Try to load the image again after a delay
        setTimeout(() => {
            this.retryImageLoad(placeholder, img);
        }, 2000);
    }

    // Retry loading the original image
    retryImageLoad(placeholder, originalImg) {
        const retryImg = new Image();
        retryImg.onload = () => {
            originalImg.src = retryImg.src;
            placeholder.parentNode.replaceChild(originalImg, placeholder);
        };
        retryImg.onerror = () => {
            // Update placeholder to show permanent failure
            placeholder.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">📷</div>
                <div style="font-weight: bold;">Image Unavailable</div>
                <div style="font-size: 12px; opacity: 0.7;">Sri Lankan Tourism</div>
            `;
        };
        retryImg.src = originalImg.dataset.originalSrc;
    }

    // Set up lazy loading with intersection observer
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        // Observe images with data-src attribute (lazy loading)
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Preload critical images
    preloadCriticalImages() {
        const criticalImages = [
            'images/hero-bg.jpg',
            'images/ranga_bandara_logo_v2.png',
            'images/Car4.jpg',
            'images/gallery/beach.jpg',
            'images/gallery/temple.jpg',
            'images/placeholder.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Check and fix all images on the page
    checkAndFixAllImages() {
        const images = document.querySelectorAll('img');
        let checkedCount = 0;
        let fixedCount = 0;

        images.forEach(img => {
            checkedCount++;
            if (img.naturalWidth === 0 && img.complete) {
                this.handleImageError(img);
                fixedCount++;
            }
        });

        console.log(`Image check complete: ${checkedCount} images checked, ${fixedCount} images fixed`);
        return { checked: checkedCount, fixed: fixedCount };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageErrorHandler = new ImageErrorHandler();
    
    // Preload critical images
    window.imageErrorHandler.preloadCriticalImages();
    
    // Check for broken images after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.imageErrorHandler.checkAndFixAllImages();
        }, 1000);
    });
});

// Provide global function for manual image checking
window.fixBrokenImages = () => {
    if (window.imageErrorHandler) {
        return window.imageErrorHandler.checkAndFixAllImages();
    }
    console.warn('Image error handler not initialized');
};

// CSS styles for image placeholders
if (!document.querySelector('#image-error-styles')) {
    const styles = document.createElement('style');
    styles.id = 'image-error-styles';
    styles.textContent = `
        .image-placeholder {
            transition: all 0.3s ease;
        }
        
        .image-placeholder:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        img[data-src] {
            background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, transparent 63%, #f0f0f0 75%);
            background-size: 400% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(styles);
} 