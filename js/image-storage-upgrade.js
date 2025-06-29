/**
 * Enhanced Image Storage System using IndexedDB
 * Overcomes localStorage limitations and provides better performance
 */

class ImageStorageSystem {
    constructor() {
        this.dbName = 'SriLankaImageDB';
        this.dbVersion = 1;
        this.db = null;
        this.storeName = 'images';
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB');
                reject(request.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create images object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { 
                        keyPath: 'id',
                        autoIncrement: false 
                    });

                    // Create indexes for efficient querying
                    objectStore.createIndex('category', 'category', { unique: false });
                    objectStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('type', 'type', { unique: false });
                }

                console.log('IndexedDB schema created/updated');
            };
        });
    }

    /**
     * Save an image to IndexedDB
     */
    async saveImage(imageData) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Add metadata
            imageData.uploadDate = imageData.uploadDate || new Date().toISOString();
            imageData.id = imageData.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const request = store.put(imageData);

            request.onsuccess = () => {
                console.log('Image saved successfully:', imageData.id);
                resolve(imageData.id);
            };

            request.onerror = () => {
                console.error('Failed to save image');
                reject(request.error);
            };
        });
    }

    /**
     * Get an image by ID
     */
    async getImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get all images or filter by category
     */
    async getImages(category = null) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            let request;
            if (category && category !== 'all') {
                const index = store.index('category');
                request = index.getAll(category);
            } else {
                request = store.getAll();
            }

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Delete an image
     */
    async deleteImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Image deleted successfully:', id);
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Convert file to base64 with compression
     */
    async fileToBase64(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64
                    const base64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64);
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Upload image from file input
     */
    async uploadImage(file, metadata = {}) {
        try {
            // Convert to base64 with compression
            const base64Data = await this.fileToBase64(file);
            
            // Create image object
            const imageData = {
                name: metadata.name || file.name,
                category: metadata.category || 'general',
                description: metadata.description || '',
                type: metadata.type || 'gallery',
                data: base64Data,
                size: file.size,
                originalSize: file.size,
                compressedSize: base64Data.length,
                mimeType: file.type,
                ...metadata
            };
            
            // Save to IndexedDB
            const imageId = await this.saveImage(imageData);
            
            return { success: true, imageId, imageData };
        } catch (error) {
            console.error('Failed to upload image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        if (!this.db) await this.init();

        const images = await this.getImages();
        
        const stats = {
            totalImages: images.length,
            totalSize: 0,
            byCategory: {},
            byType: {}
        };

        images.forEach(img => {
            // Calculate sizes
            if (img.data) {
                stats.totalSize += img.data.length;
            }

            // Count by category
            stats.byCategory[img.category] = (stats.byCategory[img.category] || 0) + 1;

            // Count by type
            stats.byType[img.type] = (stats.byType[img.type] || 0) + 1;
        });

        // Convert size to MB
        stats.totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);

        return stats;
    }

    /**
     * Clear all images (use with caution)
     */
    async clearAll() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('All images cleared');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Export images to JSON (for backup)
     */
    async exportImages() {
        const images = await this.getImages();
        return JSON.stringify(images);
    }

    /**
     * Import images from JSON
     */
    async importImages(jsonData) {
        try {
            const images = JSON.parse(jsonData);
            const results = [];

            for (const image of images) {
                try {
                    await this.saveImage(image);
                    results.push({ id: image.id, success: true });
                } catch (error) {
                    results.push({ id: image.id, success: false, error: error.message });
                }
            }

            return results;
        } catch (error) {
            throw new Error('Invalid JSON data');
        }
    }

    /**
     * Migrate from localStorage to IndexedDB
     */
    async migrateFromLocalStorage() {
        const migrations = {
            sitePictures: 0,
            adminPictures: 0,
            carouselImages: 0
        };

        // Migrate site pictures
        const sitePictures = localStorage.getItem('sitePictures');
        if (sitePictures) {
            try {
                const pictures = JSON.parse(sitePictures);
                for (const pic of pictures) {
                    await this.saveImage({
                        ...pic,
                        type: 'gallery',
                        data: pic.url || pic.imageUrl
                    });
                    migrations.sitePictures++;
                }
            } catch (error) {
                console.error('Failed to migrate site pictures:', error);
            }
        }

        // Migrate admin pictures
        const adminPictures = localStorage.getItem('adminPictures');
        if (adminPictures) {
            try {
                const pictures = JSON.parse(adminPictures);
                for (const pic of pictures) {
                    await this.saveImage({
                        ...pic,
                        type: 'admin',
                        data: pic.imageUrl || pic.url
                    });
                    migrations.adminPictures++;
                }
            } catch (error) {
                console.error('Failed to migrate admin pictures:', error);
            }
        }

        // Migrate carousel images
        const carouselImages = localStorage.getItem('siteCarouselImages');
        if (carouselImages) {
            try {
                const images = JSON.parse(carouselImages);
                for (const img of images) {
                    await this.saveImage({
                        ...img,
                        type: 'carousel',
                        data: img.url
                    });
                    migrations.carouselImages++;
                }
            } catch (error) {
                console.error('Failed to migrate carousel images:', error);
            }
        }

        console.log('Migration complete:', migrations);
        return migrations;
    }
}

// Create global instance
const imageStorage = new ImageStorageSystem();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await imageStorage.init();
        console.log('Image storage system initialized');
        
        // Check if migration is needed
        const stats = await imageStorage.getStorageStats();
        if (stats.totalImages === 0 && 
            (localStorage.getItem('sitePictures') || 
             localStorage.getItem('adminPictures') || 
             localStorage.getItem('siteCarouselImages'))) {
            console.log('Migrating images from localStorage to IndexedDB...');
            const migrationResults = await imageStorage.migrateFromLocalStorage();
            console.log('Migration results:', migrationResults);
        }
    } catch (error) {
        console.error('Failed to initialize image storage:', error);
    }
});

// Export for use in other scripts
window.imageStorage = imageStorage; 