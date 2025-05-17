// Image Manager Module for Sri Lanka Stay & Explore
// Handles image loading, caching, and synchronization

// Import the IndexedDB Module
// This will be loaded separately in the HTML

/**
 * Image Manager class to handle all image operations
 */
class ImageManager {
  constructor() {
    // Configuration
    this.config = {
      syncInterval: 5 * 60 * 1000, // 5 minutes
      placeholderImage: '/images/placeholder.webp',
      categories: {
        gallery: {
          path: '/images/gallery',
          lastSync: 0
        },
        accommodations: {
          path: '/images/accommodations',
          lastSync: 0
        },
        testimonials: {
          path: '/images/testimonials',
          lastSync: 0
        },
        hotel: {
          path: '/images/hotel',
          lastSync: 0
        }
      },
      lazyLoadThreshold: 200, // pixels
      useServiceWorker: 'serviceWorker' in navigator
    };
    
    // State
    this.isInitialized = false;
    this.syncTimers = {};
    this.observers = {};
    
    // Initialize when IndexedDB is ready
    window.addEventListener('load', () => {
      this.init();
    });
  }
  
  /**
   * Initialize the image manager
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Wait for IndexedDB to be initialized
      if (window.IndexedDB) {
        // Start background sync for all categories
        Object.keys(this.config.categories).forEach(category => {
          this.startBackgroundSync(category);
        });
        
        // Initialize intersection observer for lazy loading
        this.initLazyLoading();
        
        // Register service worker if supported
        if (this.config.useServiceWorker) {
          this.registerServiceWorker();
        }
        
        this.isInitialized = true;
        console.log('Image Manager initialized');
      } else {
        console.warn('IndexedDB not initialized, retrying in 1 second');
        setTimeout(() => this.init(), 1000);
      }
    } catch (error) {
      console.error('Failed to initialize Image Manager:', error);
    }
  }
  
  /**
   * Register service worker for offline support
   */
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/js/service-worker.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  /**
   * Start background synchronization for a category
   * @param {string} category - The image category to sync
   */
  startBackgroundSync(category) {
    if (!this.config.categories[category]) {
      console.error(`Invalid category: ${category}`);
      return;
    }
    
    // Initial sync
    this.syncCategory(category);
    
    // Set up periodic sync
    this.syncTimers[category] = setInterval(() => {
      this.syncCategory(category);
    }, this.config.syncInterval);
  }
  
  /**
   * Synchronize images for a category with the server
   * @param {string} category - The image category to sync
   */
  async syncCategory(category) {
    if (!window.IndexedDB || !window.IndexedDB.ImageStore) {
      console.warn('IndexedDB not available for sync');
      return;
    }
    
    try {
      // Get the last sync timestamp
      const lastSync = this.config.categories[category].lastSync;
      
      // Get stored images from IndexedDB
      const storedImages = await window.IndexedDB.ImageStore.getAllImages(category);
      
      // Call the server to get updates
      const response = await fetch(`/.netlify/functions/imageSync/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          images: storedImages,
          lastSyncTimestamp: lastSync
        })
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the last sync timestamp
        this.config.categories[category].lastSync = data.syncTimestamp;
        
        // Process updates
        await this.processImageUpdates(category, data.updates);
        
        console.log(`Synchronized ${category} images. Added: ${data.updates.add.length}, Updated: ${data.updates.update.length}, Removed: ${data.updates.remove.length}`);
        
        // Trigger update event
        this.triggerUpdateEvent(category);
      }
    } catch (error) {
      console.error(`Failed to sync ${category} images:`, error);
    }
  }
  
  /**
   * Process image updates from the server
   * @param {string} category - The image category
   * @param {Object} updates - The updates from the server
   */
  async processImageUpdates(category, updates) {
    try {
      // Handle images to add
      for (const image of updates.add) {
        await window.IndexedDB.ImageStore.addImage({
          ...image,
          id: `${category}:${image.filename}`,
          category
        });
      }
      
      // Handle images to update
      for (const image of updates.update) {
        await window.IndexedDB.ImageStore.updateImage({
          ...image,
          id: `${category}:${image.filename}`,
          category
        });
      }
      
      // Handle images to remove
      for (const filename of updates.remove) {
        await window.IndexedDB.ImageStore.deleteImage(`${category}:${filename}`);
      }
    } catch (error) {
      console.error('Error processing image updates:', error);
      throw error;
    }
  }
  
  /**
   * Trigger update event for subscribers
   * @param {string} category - The image category that was updated
   */
  triggerUpdateEvent(category) {
    const event = new CustomEvent('imageUpdate', {
      detail: { category }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Get all images for a category
   * @param {string} category - The image category
   * @returns {Promise<Array>} - Array of image objects
   */
  async getImages(category) {
    if (!window.IndexedDB || !window.IndexedDB.ImageStore) {
      console.warn('IndexedDB not available');
      return [];
    }
    
    try {
      return await window.IndexedDB.ImageStore.getAllImages(category);
    } catch (error) {
      console.error(`Failed to get ${category} images:`, error);
      return [];
    }
  }
  
  /**
   * Get a specific image by id
   * @param {string} id - The image id
   * @returns {Promise<Object>} - The image object
   */
  async getImage(id) {
    if (!window.IndexedDB || !window.IndexedDB.ImageStore) {
      console.warn('IndexedDB not available');
      return null;
    }
    
    try {
      return await window.IndexedDB.ImageStore.getImage(id);
    } catch (error) {
      console.error(`Failed to get image ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    // Create intersection observer
    this.lazyLoadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          const srcset = img.getAttribute('data-srcset');
          const category = img.getAttribute('data-category');
          const imageId = img.getAttribute('data-image-id');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          
          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Add load event
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          
          // Stop observing after loading
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: `${this.config.lazyLoadThreshold}px 0px`,
      threshold: 0.01
    });
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      this.refreshLazyImages();
    });
    
    // Also refresh on image update events
    document.addEventListener('imageUpdate', () => {
      this.refreshLazyImages();
    });
  }
  
  /**
   * Refresh lazy-loaded images
   */
  refreshLazyImages() {
    // Get all lazy images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Observe each image
    lazyImages.forEach(img => {
      this.lazyLoadObserver.observe(img);
    });
  }
  
  /**
   * Load gallery images into a container element
   * @param {string} containerId - DOM ID of the gallery container
   * @param {string} category - The image category to load
   */
  async loadGallery(containerId, category = 'gallery') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Gallery container #${containerId} not found`);
      return;
    }
    
    try {
      // Clear the container
      container.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading images...</div>';
      
      // Get images from storage
      const images = await this.getImages(category);
      
      // Clear container again
      container.innerHTML = '';
      
      // Sort images by display order if available
      const sortedImages = images.sort((a, b) => {
        if (a.displayOrder && b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return 0;
      });
      
      if (sortedImages.length === 0) {
        container.innerHTML = '<div class="no-images-message">No images available</div>';
        return;
      }
      
      // Add images to the container
      sortedImages.forEach(image => {
        const imgElement = document.createElement('div');
        imgElement.className = 'gallery-item';
        
        // Create responsive image
        imgElement.innerHTML = `
          <img 
            data-src="${image.path}" 
            data-category="${category}"
            data-image-id="${image.id}"
            alt="${image.filename}" 
            class="gallery-image lazy-image"
          >
          <div class="gallery-caption">
            <h3>${this.formatImageTitle(image.filename)}</h3>
          </div>
        `;
        
        container.appendChild(imgElement);
      });
      
      // Initialize lazy loading
      this.refreshLazyImages();
    } catch (error) {
      console.error(`Failed to load gallery ${containerId}:`, error);
      container.innerHTML = '<div class="error-message">Error loading images</div>';
    }
  }
  
  /**
   * Format an image filename into a title
   * @param {string} filename - The image filename
   * @returns {string} - Formatted title
   */
  formatImageTitle(filename) {
    // Remove extension and replace dashes/underscores with spaces
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    // Clear all sync timers
    Object.values(this.syncTimers).forEach(timer => {
      clearInterval(timer);
    });
    
    // Disconnect observers
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
    }
  }
}

// Create a global instance
window.ImageManager = new ImageManager(); 