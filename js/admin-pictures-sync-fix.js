/**
 * Admin Pictures Sync Fix
 * This script fixes image synchronization between the admin dashboard and frontend
 */

(function() {
    'use strict';
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Sync Fix loaded');
        
        // Wait a bit to ensure the original scripts have been loaded
        setTimeout(initSyncFix, 500);
    });
    
    /**
     * Initialize the synchronization fix
     */
    function initSyncFix() {
        console.log('Initializing pictures sync fix...');
        
        // First, check and merge any frontend-only images into admin
        syncFrontendImagesToAdmin();
        
        // Then, ensure admin images are properly reflected on frontend
        syncAdminImagesToFrontend();
        
        // Set up periodic synchronization
        setInterval(syncFrontendImagesToAdmin, 10000); // Every 10 seconds
        setInterval(syncAdminImagesToFrontend, 15000); // Every 15 seconds
    }
    
    /**
     * Synchronize frontend images back to admin interface
     * This ensures any images that appear on frontend but not in admin are added to admin
     */
    function syncFrontendImagesToAdmin() {
        console.log('Checking for frontend images to sync to admin...');
        
        try {
            // Get frontend images
            const frontendImagesStr = localStorage.getItem('sitePictures');
            if (!frontendImagesStr) {
                console.log('No frontend images found');
                return;
            }
            
            const frontendImages = JSON.parse(frontendImagesStr);
            if (!Array.isArray(frontendImages) || frontendImages.length === 0) {
                console.log('No frontend images to sync');
                return;
            }
            
            // Get admin images
            const adminImagesStr = localStorage.getItem('adminPicturesMetadata');
            let adminImages = [];
            if (adminImagesStr) {
                adminImages = JSON.parse(adminImagesStr);
                if (!Array.isArray(adminImages)) {
                    adminImages = [];
                }
            }
            
            // Find frontend images that aren't in admin
            const adminImageIds = adminImages.map(img => img.id);
            const missingImages = frontendImages.filter(img => !adminImageIds.includes(img.id));
            
            if (missingImages.length === 0) {
                console.log('All frontend images are already in admin');
                return;
            }
            
            console.log(`Found ${missingImages.length} frontend images not in admin, adding them...`);
            
            // Convert frontend images to admin format and add them
            const newAdminImages = missingImages.map(img => ({
                id: img.id,
                name: img.name || 'Imported Image',
                category: img.category || 'scenery',
                description: img.description || '',
                thumbnailUrl: img.url || '',
                imageUrl: img.url || '',
                uploadDate: img.uploadDate || new Date().toISOString()
            }));
            
            // Merge with existing admin images
            const mergedImages = [...adminImages, ...newAdminImages];
            
            // Save back to admin storage
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(mergedImages));
            
            console.log(`Successfully added ${missingImages.length} images to admin`);
            
            // Trigger refresh if we're on the admin page
            if (window.location.href.includes('admin-dashboard')) {
                refreshAdminPictureGrid();
            }
        } catch (error) {
            console.error('Error syncing frontend images to admin:', error);
        }
    }
    
    /**
     * Synchronize admin images to frontend
     * This ensures all admin images are properly visible on the frontend
     */
    function syncAdminImagesToFrontend() {
        console.log('Syncing admin images to frontend...');
        
        try {
            // Get admin images
            const adminImagesStr = localStorage.getItem('adminPicturesMetadata');
            if (!adminImagesStr) {
                console.log('No admin images found');
                return;
            }
            
            const adminImages = JSON.parse(adminImagesStr);
            if (!Array.isArray(adminImages) || adminImages.length === 0) {
                console.log('No admin images to sync');
                return;
            }
            
            // Convert to frontend format
            const frontendImages = adminImages.map(img => ({
                id: img.id,
                name: img.name || 'Untitled',
                category: (img.category || 'scenery').toLowerCase(),
                description: img.description || '',
                url: img.thumbnailUrl || img.imageUrl || '',
                uploadDate: img.uploadDate || new Date().toISOString()
            }));
            
            // Save to frontend storage
            localStorage.setItem('sitePictures', JSON.stringify(frontendImages));
            
            console.log(`Successfully synced ${frontendImages.length} admin images to frontend`);
            
            // Dispatch event to notify frontend
            const event = new CustomEvent('picturesSynced', {
                detail: { count: frontendImages.length }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error syncing admin images to frontend:', error);
        }
    }
    
    /**
     * Refresh the admin picture grid display
     */
    function refreshAdminPictureGrid() {
        console.log('Refreshing admin picture grid...');
        
        const pictureGrid = document.getElementById('pictureGrid');
        if (!pictureGrid) return;
        
        // Check if there's an existing function we can use
        if (typeof window.loadAndDisplayPictures === 'function') {
            console.log('Using existing loadAndDisplayPictures function');
            window.loadAndDisplayPictures();
            return;
        }
        
        if (typeof window.forcePictureRefresh === 'function') {
            console.log('Using existing forcePictureRefresh function');
            window.forcePictureRefresh();
            return;
        }
        
        // Otherwise, implement our own refresh
        try {
            // Get admin images
            const adminImagesStr = localStorage.getItem('adminPicturesMetadata');
            if (!adminImagesStr) return;
            
            const adminImages = JSON.parse(adminImagesStr);
            if (!Array.isArray(adminImages) || adminImages.length === 0) return;
            
            // Clear grid
            pictureGrid.innerHTML = '';
            
            // Add each image to grid
            adminImages.forEach(picture => {
                addPictureToGrid(pictureGrid, picture);
            });
            
            console.log('Admin picture grid refreshed with', adminImages.length, 'images');
        } catch (error) {
            console.error('Error refreshing admin picture grid:', error);
        }
    }
    
    /**
     * Add a picture to the grid (simplified version)
     */
    function addPictureToGrid(container, picture) {
        // Create picture card element
        const pictureCard = document.createElement('div');
        pictureCard.className = 'picture-card';
        pictureCard.setAttribute('data-id', picture.id);
        pictureCard.setAttribute('data-category', picture.category);
        
        // Set picture card content
        pictureCard.innerHTML = `
            <div class="picture-image">
                <img src="${picture.thumbnailUrl || picture.imageUrl}" alt="${picture.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="picture-info">
                <h3>${picture.name}</h3>
                <div class="picture-category">
                    <span class="${picture.category}">${picture.category}</span>
                </div>
                <p class="picture-description">${picture.description || ''}</p>
            </div>
            <div class="picture-actions">
                <button class="edit-picture" data-id="${picture.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-picture" data-id="${picture.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add to container
        container.appendChild(pictureCard);
        
        // Add basic event listeners for buttons
        const editBtn = pictureCard.querySelector('.edit-picture');
        const deleteBtn = pictureCard.querySelector('.delete-picture');
        
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Edit button clicked for picture:', picture.id);
                // The main script will handle this
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Delete button clicked for picture:', picture.id);
                // The main script will handle this
            });
        }
    }
    
    // Expose some functions globally
    window.adminPicturesSyncFix = {
        syncFrontendImagesToAdmin: syncFrontendImagesToAdmin,
        syncAdminImagesToFrontend: syncAdminImagesToFrontend,
        refreshAdminPictureGrid: refreshAdminPictureGrid
    };
})(); 