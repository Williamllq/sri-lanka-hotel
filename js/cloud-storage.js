/**
 * Cloud Storage Manager
 * Handles image uploads to cloud storage services
 */

class CloudStorageManager {
    constructor() {
        // Cloudinary configuration
        this.config = {
            cloudName: 'dmpfjul1j',
            apiKey: '476146554929449', 
            uploadPreset: 'ml_default', // 临时使用默认预设，如果已创建 'sri_lanka_unsigned' 预设，请改为该值
            // uploadPreset: 'sri_lanka_unsigned', // 创建专属预设后启用此行
            uploadUrl: 'https://api.cloudinary.com/v1_1/dmpfjul1j/image/upload'
        };
        
        // Use real Cloudinary service
        this.useSimulation = false; // Now using real Cloudinary!
        this.simulatedStorage = new Map(); // Keep for fallback
    }

    /**
     * Upload image to cloud storage
     * @param {File|Blob|String} image - Image file, blob, or base64 string
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result with URLs
     */
    async uploadImage(image, options = {}) {
        try {
            if (this.useSimulation) {
                return await this.simulateCloudUpload(image, options);
            } else {
                return await this.uploadToCloudinary(image, options);
            }
        } catch (error) {
            console.error('Cloud upload failed:', error);
            throw error;
        }
    }

    /**
     * Simulate cloud upload for development
     */
    async simulateCloudUpload(image, options) {
        // Generate unique ID
        const publicId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Convert to base64 if needed
        let base64Data;
        if (image instanceof File || image instanceof Blob) {
            base64Data = await this.fileToBase64(image);
        } else {
            base64Data = image;
        }

        // Simulate image transformations
        const transformations = {
            original: base64Data,
            thumbnail: await this.simulateResize(base64Data, 150, 150),
            medium: await this.simulateResize(base64Data, 600, 400),
            large: await this.simulateResize(base64Data, 1200, 800)
        };

        // Store in simulated storage
        const cloudData = {
            public_id: publicId,
            version: Date.now(),
            format: 'jpg',
            resource_type: 'image',
            created_at: new Date().toISOString(),
            bytes: base64Data.length,
            width: 1200,
            height: 800,
            folder: options.folder || '',
            tags: options.tags || [],
            urls: {
                original: transformations.original,
                thumbnail: transformations.thumbnail,
                medium: transformations.medium,
                large: transformations.large
            },
            secure_url: transformations.original,
            eager: [
                { secure_url: transformations.thumbnail, transformation: 'c_fill,h_150,w_150' },
                { secure_url: transformations.medium, transformation: 'c_fill,h_400,w_600' },
                { secure_url: transformations.large, transformation: 'c_fill,h_800,w_1200' }
            ]
        };

        this.simulatedStorage.set(publicId, cloudData);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            data: cloudData
        };
    }

    /**
     * Upload to real Cloudinary service
     */
    async uploadToCloudinary(image, options) {
        const formData = new FormData();
        
        // Add image
        if (image instanceof File || image instanceof Blob) {
            formData.append('file', image);
        } else {
            // Assume it's a base64 string
            formData.append('file', image);
        }

        // Add upload parameters
        formData.append('upload_preset', this.config.uploadPreset);
        
        if (options.folder) {
            formData.append('folder', options.folder);
        }
        
        if (options.tags) {
            formData.append('tags', options.tags.join(','));
        }

        // Add transformations
        formData.append('eager', 'c_fill,h_150,w_150|c_fill,h_400,w_600|c_fill,h_800,w_1200');
        formData.append('eager_async', 'true');

        try {
            const response = await fetch(this.config.uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete image from cloud storage
     */
    async deleteImage(publicId) {
        if (this.useSimulation) {
            this.simulatedStorage.delete(publicId);
            return { success: true };
        } else {
            // Real Cloudinary deletion requires server-side API
            console.warn('Image deletion requires server-side implementation');
            return { success: false, error: 'Server-side deletion required' };
        }
    }

    /**
     * Get image by public ID
     */
    async getImage(publicId) {
        if (this.useSimulation) {
            const image = this.simulatedStorage.get(publicId);
            return image || null;
        } else {
            // Construct Cloudinary URL
            return {
                secure_url: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${publicId}`,
                urls: {
                    thumbnail: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/c_fill,h_150,w_150/${publicId}`,
                    medium: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/c_fill,h_400,w_600/${publicId}`,
                    large: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/c_fill,h_800,w_1200/${publicId}`
                }
            };
        }
    }

    /**
     * List all images in a folder
     */
    async listImages(folder = '') {
        if (this.useSimulation) {
            const images = [];
            this.simulatedStorage.forEach((image, publicId) => {
                if (!folder || image.folder === folder) {
                    images.push(image);
                }
            });
            return images;
        } else {
            console.warn('Listing images requires server-side implementation');
            return [];
        }
    }

    /**
     * Convert file to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Simulate image resize (simplified)
     */
    async simulateResize(base64, width, height) {
        // In real implementation, this would actually resize the image
        // For simulation, we'll just add a marker to the base64 string
        return base64.replace('data:image', `data:image/resized-${width}x${height}`);
    }

    /**
     * Generate optimized URL with transformations
     */
    getOptimizedUrl(publicId, transformations = {}) {
        const baseUrl = this.useSimulation 
            ? this.simulatedStorage.get(publicId)?.secure_url 
            : `https://res.cloudinary.com/${this.config.cloudName}/image/upload`;

        if (!baseUrl) return null;

        // Build transformation string
        const transforms = [];
        
        // Always add automatic format and quality for optimization
        transforms.push('f_auto');
        transforms.push('q_auto');
        
        if (transformations.width) {
            transforms.push(`w_${transformations.width}`);
        }
        if (transformations.height) {
            transforms.push(`h_${transformations.height}`);
        }
        if (transformations.crop) {
            transforms.push(`c_${transformations.crop}`);
        }
        if (transformations.quality) {
            transforms.push(`q_${transformations.quality}`);
        }
        if (transformations.format) {
            transforms.push(`f_${transformations.format}`);
        }
        
        // Add device pixel ratio for retina displays
        if (transformations.dpr) {
            transforms.push(`dpr_${transformations.dpr}`);
        }

        const transformString = transforms.join(',');
        
        if (this.useSimulation) {
            return baseUrl;
        } else {
            return `${baseUrl}/${transformString}/${publicId}`;
        }
    }

    /**
     * Batch upload multiple images
     */
    async batchUpload(images, options = {}) {
        const results = [];
        const batchSize = 3; // Upload 3 at a time
        
        for (let i = 0; i < images.length; i += batchSize) {
            const batch = images.slice(i, i + batchSize);
            const batchPromises = batch.map(image => this.uploadImage(image, options));
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
        }

        return {
            total: images.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
            results: results
        };
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        if (this.useSimulation) {
            let totalSize = 0;
            let imageCount = 0;
            const byFolder = {};

            this.simulatedStorage.forEach(image => {
                imageCount++;
                totalSize += image.bytes || 0;
                
                const folder = image.folder || 'root';
                byFolder[folder] = (byFolder[folder] || 0) + 1;
            });

            return {
                totalImages: imageCount,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                byFolder: byFolder
            };
        } else {
            console.warn('Storage stats require server-side implementation');
            return null;
        }
    }

    /**
     * Migrate images from IndexedDB to cloud storage
     */
    async migrateFromIndexedDB() {
        if (!window.imageStorage) {
            console.error('IndexedDB image storage not available');
            return;
        }

        const images = await window.imageStorage.getImages();
        const migrationResults = {
            total: images.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        for (const image of images) {
            try {
                if (image.data && image.data.startsWith('data:')) {
                    const result = await this.uploadImage(image.data, {
                        folder: image.category || 'migrated',
                        tags: ['migrated', image.type || 'general']
                    });

                    if (result.success) {
                        // Update the image record with cloud URL
                        image.cloudUrl = result.data.secure_url;
                        image.cloudPublicId = result.data.public_id;
                        image.cloudUrls = result.data.urls;
                        
                        // Save updated record back to IndexedDB
                        await window.imageStorage.saveImage(image);
                        
                        migrationResults.successful++;
                    } else {
                        migrationResults.failed++;
                        migrationResults.errors.push({
                            imageId: image.id,
                            error: result.error
                        });
                    }
                } else {
                    console.warn(`Image ${image.id} has no valid data to migrate`);
                    migrationResults.failed++;
                }
            } catch (error) {
                console.error(`Failed to migrate image ${image.id}:`, error);
                migrationResults.failed++;
                migrationResults.errors.push({
                    imageId: image.id,
                    error: error.message
                });
            }
        }

        console.log('Migration completed:', migrationResults);
        return migrationResults;
    }
}

// Create global instance
const cloudStorage = new CloudStorageManager();

// Export for use in other scripts
window.cloudStorage = cloudStorage; 