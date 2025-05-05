/**
 * Admin Pictures Sync Fix
 * This script ensures proper synchronization between admin interface and front-end gallery pictures,
 * and displays all historical images for management.
 */

(function() {
    'use strict';
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Sync Fix loaded');
        
        // Wait a bit to ensure other scripts are loaded
        setTimeout(initSync, 500);
    });
    
    /**
     * Initialize synchronization fix
     */
    function initSync() {
        console.log('Initializing pictures synchronization fix');
        
        // Collect all images from different storage locations
        collectAllImages().then(allImages => {
            console.log(`Collected ${allImages.length} total images from all storage locations`);
            
            // Save consolidated images to both admin and frontend storage
            saveConsolidatedImages(allImages);
            
            // Refresh the pictures display
            refreshPicturesDisplay();
            
            // Set up a periodic check for image sync
            setInterval(checkImageSync, 5000);
        });
        
        // Fix the edit and delete functionality
        fixImageActions();
    }
    
    /**
     * Collect all images from different storage locations
     */
    function collectAllImages() {
        return new Promise(resolve => {
            console.log('Collecting images from all storage locations');
            
            // Storage keys to check for images
            const storageKeys = [
                'adminPicturesMetadata',  // Admin panel metadata
                'adminPictures',          // Admin panel full pictures
                'sitePictures',           // Frontend gallery pictures
                'galleryPictures',        // Possible alternate frontend gallery storage
                'pictures'                // Generic image storage
            ];
            
            let allImages = [];
            
            // Try to collect from IndexedDB first if available
            try {
                if (window.indexedDB && typeof getAllMetadata === 'function') {
                    console.log('Trying to get images from IndexedDB...');
                    getAllMetadata().then(indexDBImages => {
                        console.log(`Found ${indexDBImages.length} images in IndexedDB`);
                        allImages = [...indexDBImages];
                        
                        // Then collect from localStorage
                        collectFromLocalStorage();
                    }).catch(error => {
                        console.error('Error getting images from IndexedDB:', error);
                        collectFromLocalStorage();
                    });
                } else {
                    collectFromLocalStorage();
                }
            } catch (error) {
                console.error('Error accessing IndexedDB:', error);
                collectFromLocalStorage();
            }
            
            // Collect images from localStorage
            function collectFromLocalStorage() {
                console.log('Collecting images from localStorage...');
                
                storageKeys.forEach(key => {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            try {
                                const images = JSON.parse(data);
                                if (Array.isArray(images) && images.length > 0) {
                                    console.log(`Found ${images.length} images in ${key}`);
                                    allImages = [...allImages, ...images];
                                }
                            } catch (parseError) {
                                console.error(`Error parsing ${key}:`, parseError);
                            }
                        }
                    } catch (storageError) {
                        console.error(`Error accessing ${key}:`, storageError);
                    }
                });
                
                // Deduplicate images by ID
                const uniqueImages = removeDuplicates(allImages);
                console.log(`After deduplication: ${uniqueImages.length} unique images`);
                
                // Process images to ensure consistent format
                const processedImages = processImages(uniqueImages);
                
                // Done collecting
                resolve(processedImages);
            }
        });
    }
    
    /**
     * Process images to ensure consistent format
     */
    function processImages(images) {
        return images.map(image => {
            // Create a standardized image object
            return {
                id: image.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: image.name || image.title || 'Unnamed Image',
                category: (image.category || 'scenery').toLowerCase(),
                description: image.description || '',
                imageUrl: image.imageUrl || image.url || '',
                thumbnailUrl: image.thumbnailUrl || image.url || image.imageUrl || '',
                uploadDate: image.uploadDate || new Date().toISOString()
            };
        });
    }
    
    /**
     * Remove duplicate images
     */
    function removeDuplicates(images) {
        const seen = new Map();
        return images.filter(image => {
            // Use ID as primary key if available
            const key = image.id || image.url || (image.name + image.category);
            
            // Skip if we've seen this image before
            if (seen.has(key)) return false;
            
            // Mark as seen and keep
            seen.set(key, true);
            return true;
        });
    }
    
    /**
     * Save consolidated images to both admin and frontend storage
     */
    function saveConsolidatedImages(images) {
        console.log(`Saving ${images.length} consolidated images to storage`);
        
        try {
            // Save to admin storage
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(images));
            
            // Create frontend-friendly version (with only necessary fields)
            const frontendImages = images.map(image => ({
                id: image.id,
                name: image.name,
                category: image.category,
                description: image.description,
                url: image.thumbnailUrl || image.imageUrl,
                uploadDate: image.uploadDate
            }));
            
            // Save to frontend storage
            localStorage.setItem('sitePictures', JSON.stringify(frontendImages));
            
            console.log('Images successfully saved to both admin and frontend storage');
            
            // Try to save to IndexedDB if available
            saveToIndexedDB(images);
            
        } catch (error) {
            console.error('Error saving consolidated images:', error);
        }
    }
    
    /**
     * Save images to IndexedDB if available
     */
    function saveToIndexedDB(images) {
        if (!window.indexedDB) return;
        
        try {
            if (typeof saveMetadata === 'function' && typeof saveImageData === 'function') {
                console.log('Saving images to IndexedDB...');
                
                // Save each image to IndexedDB
                images.forEach(image => {
                    // Save metadata
                    const metadata = {
                        id: image.id,
                        name: image.name,
                        category: image.category,
                        description: image.description,
                        thumbnailUrl: image.thumbnailUrl,
                        uploadDate: image.uploadDate
                    };
                    
                    // Save image data
                    const imageData = {
                        id: image.id,
                        imageUrl: image.imageUrl,
                        uploadDate: image.uploadDate
                    };
                    
                    // Save both to IndexedDB
                    saveMetadata(metadata).catch(err => console.error('Error saving metadata to IndexedDB:', err));
                    saveImageData(imageData).catch(err => console.error('Error saving image data to IndexedDB:', err));
                });
            }
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
    }
    
    /**
     * Refresh the pictures display in the admin panel
     */
    function refreshPicturesDisplay() {
        console.log('Refreshing pictures display');
        
        // Try to use existing functions to reload pictures
        if (typeof loadAndDisplayPictures === 'function') {
            loadAndDisplayPictures();
            return;
        }
        
        // Fallback: Manual reload
        const pictureGrid = document.getElementById('pictureGrid');
        if (!pictureGrid) return;
        
        // Try to get images from adminPicturesMetadata
        try {
            const data = localStorage.getItem('adminPicturesMetadata');
            if (!data) return;
            
            const images = JSON.parse(data);
            if (!Array.isArray(images) || images.length === 0) return;
            
            // Clear the grid
            pictureGrid.innerHTML = '';
            
            // Display each image
            images.forEach(image => {
                displayImage(pictureGrid, image);
            });
        } catch (error) {
            console.error('Error refreshing pictures display:', error);
        }
    }
    
    /**
     * Display an image in the picture grid
     */
    function displayImage(container, image) {
        // Create picture card
        const pictureCard = document.createElement('div');
        pictureCard.className = 'picture-card';
        pictureCard.setAttribute('data-id', image.id);
        pictureCard.setAttribute('data-category', image.category || 'other');
        
        // Set picture card content
        pictureCard.innerHTML = `
            <div class="picture-image">
                <img src="${image.thumbnailUrl || image.imageUrl}" alt="${image.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="picture-info">
                <h3>${image.name}</h3>
                <div class="picture-category">
                    <span class="${image.category}">${image.category}</span>
                </div>
                <p class="picture-description">${image.description || ''}</p>
            </div>
            <div class="picture-actions">
                <button class="edit-picture" data-id="${image.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-picture" data-id="${image.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add to container
        container.appendChild(pictureCard);
    }
    
    /**
     * Fix image edit and delete functionality
     */
    function fixImageActions() {
        console.log('Fixing image edit and delete functionality');
        
        // Use event delegation for all image actions
        document.addEventListener('click', function(e) {
            // Handle edit button clicks
            if (e.target.closest('.edit-picture')) {
                const button = e.target.closest('.edit-picture');
                const pictureId = button.getAttribute('data-id');
                
                console.log('Edit button clicked for image:', pictureId);
                handleEditImage(pictureId);
                
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Handle delete button clicks
            if (e.target.closest('.delete-picture')) {
                const button = e.target.closest('.delete-picture');
                const pictureId = button.getAttribute('data-id');
                
                console.log('Delete button clicked for image:', pictureId);
                handleDeleteImage(pictureId);
                
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // Use capturing phase
    }
    
    /**
     * Handle editing an image
     */
    function handleEditImage(pictureId) {
        console.log(`Handling edit for image: ${pictureId}`);
        
        // Try to use existing editPicture function if available
        if (typeof editPicture === 'function') {
            try {
                editPicture(pictureId);
                return;
            } catch (error) {
                console.error('Error using existing editPicture function:', error);
                // Continue with our implementation
            }
        }
        
        // Get the image data
        getImageData(pictureId).then(image => {
            if (!image) {
                console.error(`Image ${pictureId} not found`);
                return;
            }
            
            // Show edit modal
            showEditModal(image);
        });
    }
    
    /**
     * Get image data by ID
     */
    function getImageData(pictureId) {
        return new Promise(resolve => {
            console.log(`Getting data for image: ${pictureId}`);
            
            // Try to use existing getMetadata function if available
            if (typeof getMetadata === 'function') {
                try {
                    getMetadata(pictureId).then(metadata => {
                        if (metadata) {
                            resolve(metadata);
                            return;
                        }
                        
                        // Fall back to localStorage
                        getFromLocalStorage();
                    }).catch(() => {
                        // Fall back to localStorage
                        getFromLocalStorage();
                    });
                    return;
                } catch (error) {
                    console.error('Error using existing getMetadata function:', error);
                }
            }
            
            // Get from localStorage
            getFromLocalStorage();
            
            function getFromLocalStorage() {
                try {
                    const data = localStorage.getItem('adminPicturesMetadata');
                    if (!data) {
                        resolve(null);
                        return;
                    }
                    
                    const images = JSON.parse(data);
                    if (!Array.isArray(images)) {
                        resolve(null);
                        return;
                    }
                    
                    const image = images.find(img => img.id === pictureId);
                    resolve(image || null);
                } catch (error) {
                    console.error('Error getting image from localStorage:', error);
                    resolve(null);
                }
            }
        });
    }
    
    /**
     * Show edit modal for an image
     */
    function showEditModal(image) {
        console.log('Showing edit modal for image:', image);
        
        // Look for an existing edit modal
        let editModal = document.getElementById('editPictureModal');
        
        // Create modal if it doesn't exist
        if (!editModal) {
            editModal = document.createElement('div');
            editModal.id = 'editPictureModal';
            editModal.className = 'admin-modal';
            
            editModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-edit"></i> Edit Picture</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editPictureForm">
                            <input type="hidden" id="editPictureId">
                            
                            <div class="form-group">
                                <label for="editPictureName">Image Name</label>
                                <input type="text" id="editPictureName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editCategory">Category</label>
                                <select id="editCategory" required>
                                    <option value="scenery">Scenery</option>
                                    <option value="wildlife">Wildlife</option>
                                    <option value="culture">Culture</option>
                                    <option value="food">Food</option>
                                    <option value="beach">Beach</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editPictureDescription">Description</label>
                                <textarea id="editPictureDescription" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Current Image</label>
                                <div id="editImagePreview" class="image-preview">
                                    <img src="${image.thumbnailUrl || image.imageUrl}" alt="${image.name}" style="max-width: 100%; max-height: 200px;">
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="admin-btn secondary cancel-edit">Cancel</button>
                                <button type="button" class="admin-btn primary save-changes" id="saveEditButton">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editModal);
            
            // Set up close button
            const closeBtn = editModal.querySelector('.close-modal');
            const cancelBtn = editModal.querySelector('.cancel-edit');
            
            closeBtn.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
            
            cancelBtn.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        }
        
        // Fill form with image data
        const idInput = editModal.querySelector('#editPictureId');
        const nameInput = editModal.querySelector('#editPictureName');
        const categorySelect = editModal.querySelector('#editCategory');
        const descriptionInput = editModal.querySelector('#editPictureDescription');
        
        if (idInput) idInput.value = image.id;
        if (nameInput) nameInput.value = image.name;
        if (categorySelect) categorySelect.value = image.category;
        if (descriptionInput) descriptionInput.value = image.description || '';
        
        // Set up save button
        const saveBtn = editModal.querySelector('#saveEditButton');
        
        if (saveBtn) {
            // Remove existing listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            // Add new listener
            newSaveBtn.addEventListener('click', () => {
                updateImage(
                    idInput.value,
                    nameInput.value,
                    categorySelect.value,
                    descriptionInput.value,
                    image.imageUrl
                );
                
                // Hide modal
                editModal.style.display = 'none';
            });
        }
        
        // Show modal
        editModal.style.display = 'flex';
    }
    
    /**
     * Update an image
     */
    function updateImage(id, name, category, description, imageUrl) {
        console.log(`Updating image: ${id}`);
        
        // Try to use existing updatePicture function if available
        if (typeof updatePicture === 'function') {
            try {
                updatePicture(id, name, category, description, imageUrl);
                return;
            } catch (error) {
                console.error('Error using existing updatePicture function:', error);
                // Continue with our implementation
            }
        }
        
        // Update image in localStorage
        try {
            const data = localStorage.getItem('adminPicturesMetadata');
            if (!data) return;
            
            const images = JSON.parse(data);
            if (!Array.isArray(images)) return;
            
            // Find and update the image
            const index = images.findIndex(img => img.id === id);
            if (index === -1) return;
            
            // Update image data
            images[index] = {
                ...images[index],
                name,
                category,
                description,
                lastUpdated: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(images));
            
            // Update frontend storage
            syncToFrontend(images);
            
            // Refresh display
            refreshPicturesDisplay();
            
            console.log(`Image ${id} updated successfully`);
        } catch (error) {
            console.error('Error updating image:', error);
        }
    }
    
    /**
     * Handle deleting an image
     */
    function handleDeleteImage(pictureId) {
        console.log(`Handling delete for image: ${pictureId}`);
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }
        
        // Try to use existing deleteImageAndMetadata function if available
        if (typeof deleteImageAndMetadata === 'function') {
            try {
                deleteImageAndMetadata(pictureId).then(() => {
                    console.log(`Image ${pictureId} deleted using existing function`);
                    refreshPicturesDisplay();
                });
                return;
            } catch (error) {
                console.error('Error using existing deleteImageAndMetadata function:', error);
                // Continue with our implementation
            }
        }
        
        // Delete image from localStorage
        deleteFromLocalStorage();
        
        function deleteFromLocalStorage() {
            const storageKeys = [
                'adminPicturesMetadata',
                'adminPictures',
                'sitePictures',
                'galleryPictures',
                'pictures'
            ];
            
            // Delete from all storage locations
            storageKeys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (!data) return;
                    
                    const items = JSON.parse(data);
                    if (!Array.isArray(items)) return;
                    
                    // Filter out the deleted image
                    const filteredItems = items.filter(item => item.id !== pictureId);
                    
                    // Save back if any were removed
                    if (filteredItems.length < items.length) {
                        localStorage.setItem(key, JSON.stringify(filteredItems));
                        console.log(`Image ${pictureId} removed from ${key}`);
                    }
                } catch (error) {
                    console.error(`Error removing image from ${key}:`, error);
                }
            });
            
            // Refresh display
            refreshPicturesDisplay();
            
            console.log(`Image ${pictureId} deleted successfully`);
        }
    }
    
    /**
     * Sync images to frontend storage
     */
    function syncToFrontend(images) {
        console.log('Syncing images to frontend storage');
        
        try {
            // Create frontend-friendly version
            const frontendImages = images.map(image => ({
                id: image.id,
                name: image.name,
                category: image.category,
                description: image.description,
                url: image.thumbnailUrl || image.imageUrl,
                uploadDate: image.uploadDate
            }));
            
            // Save to frontend storage
            localStorage.setItem('sitePictures', JSON.stringify(frontendImages));
            
            // Trigger sync event for the frontend
            const syncEvent = new CustomEvent('gallery-updated');
            document.dispatchEvent(syncEvent);
            
            console.log('Images synced to frontend successfully');
        } catch (error) {
            console.error('Error syncing to frontend:', error);
        }
    }
    
    /**
     * Periodically check and ensure image sync
     */
    function checkImageSync() {
        // Only run check if we're on the pictures tab
        const picturesSection = document.getElementById('picturesSection');
        if (!picturesSection || !picturesSection.classList.contains('active')) {
            return;
        }
        
        console.log('Checking image synchronization');
        
        // Compare admin and frontend storage
        try {
            const adminData = localStorage.getItem('adminPicturesMetadata');
            const frontendData = localStorage.getItem('sitePictures');
            
            if (!adminData || !frontendData) {
                // If either is missing, collect all images and resync
                collectAllImages().then(allImages => {
                    saveConsolidatedImages(allImages);
                });
                return;
            }
            
            const adminImages = JSON.parse(adminData);
            const frontendImages = JSON.parse(frontendData);
            
            if (!Array.isArray(adminImages) || !Array.isArray(frontendImages)) {
                return;
            }
            
            // Check if counts match
            if (adminImages.length !== frontendImages.length) {
                console.log('Image count mismatch, resyncing...');
                saveConsolidatedImages(adminImages);
                return;
            }
            
            // Check if all admin images exist in frontend
            const adminIds = new Set(adminImages.map(img => img.id));
            const frontendIds = new Set(frontendImages.map(img => img.id));
            
            const missingFromFrontend = [...adminIds].filter(id => !frontendIds.has(id));
            const missingFromAdmin = [...frontendIds].filter(id => !adminIds.has(id));
            
            if (missingFromFrontend.length > 0 || missingFromAdmin.length > 0) {
                console.log('Image ID mismatch, resyncing...');
                collectAllImages().then(allImages => {
                    saveConsolidatedImages(allImages);
                });
            }
        } catch (error) {
            console.error('Error checking image sync:', error);
        }
    }
})(); 