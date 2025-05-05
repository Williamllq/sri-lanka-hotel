/**
 * Admin Pictures Full Sync
 * This script fixes the synchronization issues between admin and frontend
 * and ensures all images are properly displayed in both places
 */

(function() {
    'use strict';
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Full Sync loaded');
        
        // Start immediate sync
        setTimeout(function() {
            fullSync();
        }, 1000);
        
        // Set up continuous sync on interval
        setInterval(function() {
            fullSync();
        }, 10000); // Sync every 10 seconds
        
        // Add a sync button to the admin panel if in admin area
        addSyncButton();
        
        // Attach event listeners for various storage events
        document.addEventListener('picturesSynced', fullSync);
        document.addEventListener('galleryRefresh', fullSync);
        document.addEventListener('galleryUpdated', fullSync);
        document.addEventListener('pictureSaved', fullSync);
        document.addEventListener('pictureDeleted', fullSync);
        
        // Listen for localStorage changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'sitePictures' || e.key === 'adminPictures' || 
                e.key === 'adminPicturesMetadata') {
                console.log('Storage change detected:', e.key);
                fullSync();
            }
        });
    });
    
    /**
     * Add a sync button to the admin panel
     */
    function addSyncButton() {
        // Only add in admin dashboard
        if (!window.location.href.includes('admin-dashboard')) {
            return;
        }
        
        // Find a suitable container for the button
        const container = document.querySelector('.action-buttons, .admin-buttons');
        if (!container) {
            return;
        }
        
        // Check if button already exists
        if (document.getElementById('fullSyncBtn')) {
            return;
        }
        
        // Create the button
        const syncBtn = document.createElement('button');
        syncBtn.id = 'fullSyncBtn';
        syncBtn.className = 'admin-btn secondary';
        syncBtn.innerHTML = '<i class="fas fa-sync"></i> Sync All Images';
        syncBtn.title = 'Synchronize all images between admin and frontend';
        
        // Add click event
        syncBtn.addEventListener('click', function() {
            fullSync();
            alert('All images have been synchronized successfully!');
        });
        
        // Add to container
        container.appendChild(syncBtn);
        console.log('Sync button added to admin panel');
    }
    
    /**
     * Perform a full sync between all image storage mechanisms
     */
    function fullSync() {
        console.log('Starting full image synchronization...');
        
        try {
            // Get all images from different storage locations
            const siteImages = getSiteImages();
            const adminImages = getAdminImages();
            const adminMetadata = getAdminMetadata();
            
            console.log(`Found: ${siteImages.length} site images, ${adminImages.length} admin images, ${adminMetadata.length} admin metadata`);
            
            // STEP 1: Collect all unique images from different storages
            const allUniqueImages = collectUniqueImages(siteImages, adminImages, adminMetadata);
            console.log(`Collected ${allUniqueImages.length} unique images total`);
            
            // STEP 2: Save all images to each storage format
            saveSiteImages(allUniqueImages);
            saveAdminImages(allUniqueImages);
            saveAdminMetadata(allUniqueImages);
            
            // STEP 3: Refresh displays if needed
            refreshDisplays();
            
            // Trigger sync event
            const syncEvent = new CustomEvent('fullSyncCompleted', {
                detail: { count: allUniqueImages.length }
            });
            document.dispatchEvent(syncEvent);
            
            console.log('Full sync completed successfully');
            return allUniqueImages.length;
        } catch (error) {
            console.error('Error during full sync:', error);
            return 0;
        }
    }
    
    /**
     * Get all images from the site storage
     */
    function getSiteImages() {
        try {
            const data = localStorage.getItem('sitePictures');
            if (!data) return [];
            
            const images = JSON.parse(data);
            return Array.isArray(images) ? images : [];
        } catch (error) {
            console.error('Error loading site images:', error);
            return [];
        }
    }
    
    /**
     * Get all images from the admin storage
     */
    function getAdminImages() {
        try {
            const data = localStorage.getItem('adminPictures');
            if (!data) return [];
            
            const images = JSON.parse(data);
            return Array.isArray(images) ? images : [];
        } catch (error) {
            console.error('Error loading admin images:', error);
            return [];
        }
    }
    
    /**
     * Get all images from the admin metadata storage
     */
    function getAdminMetadata() {
        try {
            const data = localStorage.getItem('adminPicturesMetadata');
            if (!data) return [];
            
            const metadata = JSON.parse(data);
            return Array.isArray(metadata) ? metadata : [];
        } catch (error) {
            console.error('Error loading admin metadata:', error);
            return [];
        }
    }
    
    /**
     * Collect all unique images from different storage mechanisms
     */
    function collectUniqueImages(siteImages, adminImages, adminMetadata) {
        // Create a map to track unique images
        const uniqueImagesMap = new Map();
        
        // Process site images
        siteImages.forEach(img => {
            const id = img.id || generateId();
            uniqueImagesMap.set(id, {
                id: id,
                name: img.name || 'Untitled',
                category: img.category || 'scenery',
                description: img.description || '',
                imageUrl: img.url || img.imageUrl || '',
                thumbnailUrl: img.thumbnailUrl || img.url || img.imageUrl || '',
                uploadDate: img.uploadDate || new Date().toISOString()
            });
        });
        
        // Process admin images
        adminImages.forEach(img => {
            const id = img.id || generateId();
            if (uniqueImagesMap.has(id)) {
                // Merge with existing
                const existing = uniqueImagesMap.get(id);
                uniqueImagesMap.set(id, {
                    ...existing,
                    name: img.name || existing.name,
                    category: img.category || existing.category,
                    description: img.description || existing.description,
                    imageUrl: img.imageUrl || existing.imageUrl,
                    thumbnailUrl: img.thumbnailUrl || existing.thumbnailUrl,
                    uploadDate: img.uploadDate || existing.uploadDate
                });
            } else {
                // Add new
                uniqueImagesMap.set(id, {
                    id: id,
                    name: img.name || 'Untitled',
                    category: img.category || 'scenery',
                    description: img.description || '',
                    imageUrl: img.imageUrl || '',
                    thumbnailUrl: img.thumbnailUrl || img.imageUrl || '',
                    uploadDate: img.uploadDate || new Date().toISOString()
                });
            }
        });
        
        // Process admin metadata
        adminMetadata.forEach(meta => {
            const id = meta.id || generateId();
            if (uniqueImagesMap.has(id)) {
                // Merge with existing
                const existing = uniqueImagesMap.get(id);
                uniqueImagesMap.set(id, {
                    ...existing,
                    name: meta.name || existing.name,
                    category: meta.category || existing.category,
                    description: meta.description || existing.description,
                    thumbnailUrl: meta.thumbnailUrl || existing.thumbnailUrl
                });
            } else {
                // Add new
                uniqueImagesMap.set(id, {
                    id: id,
                    name: meta.name || 'Untitled',
                    category: meta.category || 'scenery',
                    description: meta.description || '',
                    imageUrl: meta.imageUrl || meta.thumbnailUrl || '',
                    thumbnailUrl: meta.thumbnailUrl || meta.imageUrl || '',
                    uploadDate: meta.uploadDate || new Date().toISOString()
                });
            }
        });
        
        // Filter out invalid images (no URL)
        const validImages = Array.from(uniqueImagesMap.values()).filter(img => 
            img.imageUrl || img.thumbnailUrl || img.url
        );
        
        return validImages;
    }
    
    /**
     * Save images to site format
     */
    function saveSiteImages(images) {
        const siteFormatImages = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            url: img.imageUrl || img.thumbnailUrl,
            uploadDate: img.uploadDate
        }));
        
        localStorage.setItem('sitePictures', JSON.stringify(siteFormatImages));
        console.log(`Saved ${siteFormatImages.length} images to site storage`);
    }
    
    /**
     * Save images to admin format
     */
    function saveAdminImages(images) {
        const adminFormatImages = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            imageUrl: img.imageUrl || img.thumbnailUrl,
            thumbnailUrl: img.thumbnailUrl || img.imageUrl,
            uploadDate: img.uploadDate
        }));
        
        localStorage.setItem('adminPictures', JSON.stringify(adminFormatImages));
        console.log(`Saved ${adminFormatImages.length} images to admin storage`);
    }
    
    /**
     * Save images to admin metadata format
     */
    function saveAdminMetadata(images) {
        const metadataFormat = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            thumbnailUrl: img.thumbnailUrl || img.imageUrl,
            uploadDate: img.uploadDate
        }));
        
        localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadataFormat));
        console.log(`Saved ${metadataFormat.length} images to admin metadata storage`);
    }
    
    /**
     * Refresh display of images if on relevant page
     */
    function refreshDisplays() {
        // Refresh gallery if on frontend
        if (document.querySelector('.gallery-grid')) {
            console.log('Refreshing frontend gallery display');
            if (typeof window.displayAdminImages === 'function') {
                window.displayAdminImages();
            }
        }
        
        // Refresh admin panel if on admin page
        if (window.location.href.includes('admin-dashboard')) {
            console.log('Refreshing admin pictures display');
            const pictureGrid = document.getElementById('pictureGrid');
            if (pictureGrid) {
                // Check if we have a loadAndDisplayPictures function
                if (typeof window.loadAndDisplayPictures === 'function') {
                    window.loadAndDisplayPictures();
                } else if (typeof loadAndDisplayPictures === 'function') {
                    loadAndDisplayPictures();
                } else {
                    // Force refresh with a simple trick - trigger change event on category filter
                    const categorySelect = document.getElementById('pictureCategory');
                    if (categorySelect) {
                        const event = new Event('change');
                        categorySelect.dispatchEvent(event);
                    }
                }
            }
        }
    }
    
    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    // Expose functions to global scope
    window.adminPicturesFullSync = {
        fullSync: fullSync,
        getSiteImages: getSiteImages,
        getAdminImages: getAdminImages,
        getAdminMetadata: getAdminMetadata
    };
})(); 