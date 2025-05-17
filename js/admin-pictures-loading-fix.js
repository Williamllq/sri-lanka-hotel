/**
 * Admin Pictures Loading Fix
 * This script fixes the issue with pictures not loading in the admin dashboard
 */

(function() {
    'use strict';
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Loading Fix loaded');
        
        // Wait a bit to ensure other scripts are loaded
        setTimeout(initPictureLoadingFix, 300);
    });
    
    /**
     * Initialize picture loading fix
     */
    function initPictureLoadingFix() {
        console.log('Initializing picture loading fix');
        
        // Check if the picture grid exists
        const pictureGrid = document.getElementById('pictureGrid');
        
        if (pictureGrid) {
            console.log('Found picture grid, checking if it needs fixing');
            
            // Check if the grid is showing a loading message
            const loadingIndicator = pictureGrid.querySelector('.loading-indicator, .no-pictures-message');
            if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) {
                console.log('Pictures appear to be stuck in loading state, applying fix');
                
                // Force loading pictures
                fixPictureLoading();
            } else {
                console.log('Picture grid appears to be working correctly');
            }
        }
        
        // Fix carousel images
        fixCarouselImages();
        
        // Set up periodic check for the picture grid
        setInterval(checkPictureGrid, 1000);
    }
    
    /**
     * Check the picture grid periodically
     */
    function checkPictureGrid() {
        const pictureGrid = document.getElementById('pictureGrid');
        const picturesSection = document.getElementById('picturesSection');
        
        if (pictureGrid && picturesSection && picturesSection.classList.contains('active')) {
            // Only fix if the section is active and the grid is showing a loading message
            const loadingIndicator = pictureGrid.querySelector('.loading-indicator, .no-pictures-message');
            if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) {
                console.log('Pictures section is active but content still loading, applying fix');
                fixPictureLoading();
            }
            
            // Check for empty grid with no message
            if (pictureGrid.children.length === 0) {
                console.log('Empty picture grid with no message, applying fix');
                fixPictureLoading();
            }
        }
    }
    
    /**
     * Fix the carousel images display
     */
    function fixCarouselImages() {
        console.log('Fixing carousel images');
        const carouselContainer = document.getElementById('carouselImagesContainer');
        
        if (carouselContainer) {
            if (carouselContainer.children.length === 0 || 
                (carouselContainer.children.length === 1 && 
                 carouselContainer.firstChild.textContent.includes('Loading'))) {
                
                // Load carousel images
                loadCarouselImages();
            }
        }
        
        // Make add to carousel button work
        const addToCarouselBtn = document.getElementById('addToCarouselBtn');
        if (addToCarouselBtn) {
            const newBtn = addToCarouselBtn.cloneNode(true);
            addToCarouselBtn.parentNode.replaceChild(newBtn, addToCarouselBtn);
            
            newBtn.addEventListener('click', function() {
                const selectImageModal = document.getElementById('selectImageModal');
                if (selectImageModal) {
                    selectImageModal.style.display = 'flex';
                    loadPicturesToSelectGrid();
                }
            });
        }
    }
    
    /**
     * Load carousel images
     */
    function loadCarouselImages() {
        const carouselContainer = document.getElementById('carouselImagesContainer');
        if (!carouselContainer) return;
        
        // Show loading message
        carouselContainer.innerHTML = '<p class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading carousel images...</p>';
        
        try {
            // Get carousel images from localStorage
            const carouselDataStr = localStorage.getItem('carouselImages');
            const carouselImageIds = carouselDataStr ? JSON.parse(carouselDataStr) : [];
            
            // If no carousel images, show message
            if (!carouselImageIds || carouselImageIds.length === 0) {
                carouselContainer.innerHTML = '<p class="no-images-message">No images in carousel. Click "Add Image to Carousel" to add some.</p>';
                return;
            }
            
            // Get all pictures
            let allPictures = loadPicturesFromStorage();
            
            // Filter to only carousel images and maintain order
            const carouselImages = carouselImageIds.map(id => {
                return allPictures.find(pic => pic.id === id);
            }).filter(Boolean);
            
            // If no images found, show message
            if (carouselImages.length === 0) {
                carouselContainer.innerHTML = '<p class="no-images-message">Carousel images not found. Try adding new images.</p>';
                return;
            }
            
            // Clear container
            carouselContainer.innerHTML = '';
            
            // Add each image to container
            carouselImages.forEach(image => {
                const imageCard = document.createElement('div');
                imageCard.className = 'carousel-image-card';
                imageCard.setAttribute('data-id', image.id);
                
                imageCard.innerHTML = `
                    <div class="carousel-image">
                        <img src="${image.thumbnailUrl || image.imageUrl || image.url || ''}" 
                             alt="${image.name || 'Carousel image'}" 
                             onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="carousel-image-info">
                        <h4>${image.name || 'Unnamed'}</h4>
                    </div>
                    <button class="remove-from-carousel" data-id="${image.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                carouselContainer.appendChild(imageCard);
            });
            
            // Add event listeners to remove buttons
            const removeButtons = carouselContainer.querySelectorAll('.remove-from-carousel');
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    if (imageId) {
                        removeFromCarousel(imageId);
                    }
                });
            });
            
            // Set up drag and drop sorting
            setupCarouselSorting(carouselContainer);
            
        } catch (error) {
            console.error('Error loading carousel images:', error);
            carouselContainer.innerHTML = '<p class="error-message">Error loading carousel images. Please try again.</p>';
        }
    }
    
    /**
     * Set up carousel image sorting
     */
    function setupCarouselSorting(container) {
        // Simple implementation of drag and drop sorting
        const items = container.querySelectorAll('.carousel-image-card');
        
        items.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
                this.classList.add('dragging');
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                const dragging = container.querySelector('.dragging');
                if (dragging && dragging !== this) {
                    const rect = this.getBoundingClientRect();
                    const midpoint = (rect.left + rect.right) / 2;
                    
                    if (e.clientX < midpoint) {
                        container.insertBefore(dragging, this);
                    } else {
                        container.insertBefore(dragging, this.nextSibling);
                    }
                }
            });
        });
        
        // Add event listener to save order button
        const saveOrderBtn = document.getElementById('saveCarouselOrderBtn');
        if (saveOrderBtn) {
            saveOrderBtn.addEventListener('click', saveCarouselOrder);
        }
    }
    
    /**
     * Save the order of carousel images
     */
    function saveCarouselOrder() {
        const container = document.getElementById('carouselImagesContainer');
        if (!container) return;
        
        const imageCards = container.querySelectorAll('.carousel-image-card');
        const imageIds = Array.from(imageCards).map(card => card.getAttribute('data-id')).filter(Boolean);
        
        try {
            localStorage.setItem('carouselImages', JSON.stringify(imageIds));
            alert('Carousel image order saved successfully!');
        } catch (error) {
            console.error('Error saving carousel order:', error);
            alert('Error saving carousel order. Please try again.');
        }
    }
    
    /**
     * Remove an image from carousel
     */
    function removeFromCarousel(imageId) {
        if (!confirm('Are you sure you want to remove this image from the carousel?')) {
            return;
        }
        
        try {
            // Get current carousel images
            const carouselDataStr = localStorage.getItem('carouselImages');
            let carouselImageIds = carouselDataStr ? JSON.parse(carouselDataStr) : [];
            
            // Remove the image
            carouselImageIds = carouselImageIds.filter(id => id !== imageId);
            
            // Save updated list
            localStorage.setItem('carouselImages', JSON.stringify(carouselImageIds));
            
            // Reload carousel
            loadCarouselImages();
            
        } catch (error) {
            console.error('Error removing image from carousel:', error);
            alert('Error removing image from carousel. Please try again.');
        }
    }
    
    /**
     * Load pictures for the selection grid
     */
    function loadPicturesToSelectGrid() {
        const selectGrid = document.getElementById('selectImageGrid');
        if (!selectGrid) return;
        
        // Show loading message
        selectGrid.innerHTML = '<p class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading images...</p>';
        
        // Get all pictures
        const pictures = loadPicturesFromStorage();
        
        // Get current carousel images
        const carouselDataStr = localStorage.getItem('carouselImages');
        const carouselImageIds = carouselDataStr ? JSON.parse(carouselDataStr) : [];
        
        // If no pictures, show message
        if (!pictures || pictures.length === 0) {
            selectGrid.innerHTML = '<p class="no-images-message">No images available. Please upload some images first.</p>';
            return;
        }
        
        // Clear grid
        selectGrid.innerHTML = '';
        
        // Add each picture to the grid
        pictures.forEach(picture => {
            const isInCarousel = carouselImageIds.includes(picture.id);
            const pictureCard = document.createElement('div');
            pictureCard.className = 'select-image-card';
            pictureCard.setAttribute('data-id', picture.id);
            
            if (isInCarousel) {
                pictureCard.classList.add('already-in-carousel');
            }
            
            pictureCard.innerHTML = `
                <div class="select-image-container">
                    <img src="${picture.thumbnailUrl || picture.imageUrl || picture.url || ''}" 
                         alt="${picture.name || 'Image'}" 
                         onerror="this.src='images/placeholder.jpg'">
                    <div class="select-image-checkbox">
                        <input type="checkbox" id="select_${picture.id}" 
                               data-id="${picture.id}" ${isInCarousel ? 'checked disabled' : ''}>
                        <label for="select_${picture.id}">
                            ${isInCarousel ? 'Already in carousel' : 'Select'}
                        </label>
                    </div>
                </div>
                <div class="select-image-info">
                    <h4>${picture.name || 'Unnamed'}</h4>
                </div>
            `;
            
            selectGrid.appendChild(pictureCard);
        });
        
        // Set up add selected button
        const addSelectedBtn = document.getElementById('addSelectedImagesBtn');
        if (addSelectedBtn) {
            const newBtn = addSelectedBtn.cloneNode(true);
            addSelectedBtn.parentNode.replaceChild(newBtn, addSelectedBtn);
            
            newBtn.addEventListener('click', addSelectedImagesToCarousel);
        }
    }
    
    /**
     * Add selected images to carousel
     */
    function addSelectedImagesToCarousel() {
        const selectGrid = document.getElementById('selectImageGrid');
        if (!selectGrid) return;
        
        // Get all checkboxes
        const checkboxes = selectGrid.querySelectorAll('input[type="checkbox"]:checked:not([disabled])');
        
        if (checkboxes.length === 0) {
            alert('Please select at least one image to add to the carousel.');
            return;
        }
        
        try {
            // Get current carousel images
            const carouselDataStr = localStorage.getItem('carouselImages');
            let carouselImageIds = carouselDataStr ? JSON.parse(carouselDataStr) : [];
            
            // Add selected images
            checkboxes.forEach(checkbox => {
                const imageId = checkbox.getAttribute('data-id');
                if (imageId && !carouselImageIds.includes(imageId)) {
                    carouselImageIds.push(imageId);
                }
            });
            
            // Save updated list
            localStorage.setItem('carouselImages', JSON.stringify(carouselImageIds));
            
            // Close modal
            const modal = document.getElementById('selectImageModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Reload carousel
            loadCarouselImages();
            
            alert(`Added ${checkboxes.length} image(s) to the carousel.`);
            
        } catch (error) {
            console.error('Error adding images to carousel:', error);
            alert('Error adding images to carousel. Please try again.');
        }
    }
    
    /**
     * Fix picture loading by manually loading pictures
     */
    function fixPictureLoading() {
        const pictureGrid = document.getElementById('pictureGrid');
        if (!pictureGrid) return;
        
        // Clear the grid and show a new loading indicator
        pictureGrid.innerHTML = `
            <div class="no-pictures-message">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading pictures (retry)...</p>
            </div>
        `;
        
        // Try to load pictures from localStorage first
        let pictures = loadPicturesFromStorage();
        
        if (pictures.length === 0) {
            // If no pictures found, create and use sample pictures
            pictures = createSamplePictures();
            
            // Save sample pictures to make sure they persist
            try {
                // Save to adminPicturesMetadata for admin dashboard
                localStorage.setItem('adminPicturesMetadata', JSON.stringify(pictures));
                
                // Save to sitePictures for frontend
                localStorage.setItem('sitePictures', JSON.stringify(pictures));
                
                console.log('Sample pictures saved to storage');
            } catch (error) {
                console.error('Error saving sample pictures to storage:', error);
            }
        }
        
        // Display the pictures
        displayPictures(pictures);
    }
    
    /**
     * Load pictures from storage
     */
    function loadPicturesFromStorage() {
        console.log('Loading pictures from storage');
        
        try {
            // Try different storage keys that might contain picture data
            const storageKeys = [
                'adminPicturesMetadata',
                'sitePictures',
                'pictures',
                'galleryPictures'
            ];
            
            let pictures = [];
            
            // Try each key until we find pictures
            for (const key of storageKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`Found ${parsed.length} pictures in ${key}`);
                            pictures = parsed;
                            break;
                        }
                    } catch (parseError) {
                        console.error(`Error parsing ${key}:`, parseError);
                    }
                }
            }
            
            // Also try to load from IndexedDB if available
            if (pictures.length === 0 && window.indexedDB) {
                console.log('Attempting to load pictures from IndexedDB');
                
                // This part will run asynchronously, but will update the display later
                const dbRequest = indexedDB.open('sriLankaImageDB');
                
                dbRequest.onsuccess = function(event) {
                    const db = event.target.result;
                    if (db.objectStoreNames.contains('metadata')) {
                        const transaction = db.transaction(['metadata'], 'readonly');
                        const store = transaction.objectStore('metadata');
                        const request = store.getAll();
                        
                        request.onsuccess = function() {
                            if (request.result && request.result.length > 0) {
                                console.log(`Found ${request.result.length} pictures in IndexedDB`);
                                
                                // Update pictures in localStorage for future use
                                try {
                                    localStorage.setItem('adminPicturesMetadata', JSON.stringify(request.result));
                                    localStorage.setItem('sitePictures', JSON.stringify(request.result));
                                } catch (e) {
                                    console.error('Error updating localStorage from IndexedDB:', e);
                                }
                                
                                // Update display if there were no pictures before
                                if (pictures.length === 0) {
                                    pictures = request.result;
                                    displayPictures(pictures);
                                }
                            }
                        };
                    }
                };
            }
            
            return pictures;
        } catch (error) {
            console.error('Error loading pictures from storage:', error);
            return [];
        }
    }
    
    /**
     * Create sample pictures when none are found
     */
    function createSamplePictures() {
        console.log('Creating sample pictures');
        
        // Create sample picture data with high-quality images
        const samplePictures = [
            {
                id: 'sample_1',
                name: 'Beautiful Beach',
                category: 'beach',
                description: 'Stunning beach in southern Sri Lanka',
                thumbnailUrl: 'https://images.unsplash.com/photo-1559117762-1c478915df9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1559117762-1c478915df9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_2',
                name: 'Cultural Dance',
                category: 'culture',
                description: 'Traditional Sri Lankan cultural performance',
                thumbnailUrl: 'https://images.unsplash.com/photo-1590675641114-8a8f330df178?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1590675641114-8a8f330df178?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_3',
                name: 'Mountain Landscape',
                category: 'scenery',
                description: 'Beautiful mountains in central Sri Lanka',
                thumbnailUrl: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_4',
                name: 'Wild Elephant',
                category: 'wildlife',
                description: 'Majestic elephant in Yala National Park',
                thumbnailUrl: 'https://images.unsplash.com/photo-1581852017103-68e841601083?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1581852017103-68e841601083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_5',
                name: 'Sri Lankan Cuisine',
                category: 'food',
                description: 'Delicious traditional Sri Lankan cuisine',
                thumbnailUrl: 'https://images.unsplash.com/photo-1589778655375-3d1bacca7cb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1589778655375-3d1bacca7cb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_6',
                name: 'Tea Plantation',
                category: 'scenery',
                description: 'Beautiful tea plantation in Nuwara Eliya',
                thumbnailUrl: 'https://images.unsplash.com/photo-1590691566001-7249d65c5cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                imageUrl: 'https://images.unsplash.com/photo-1590691566001-7249d65c5cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                uploadDate: new Date().toISOString()
            }
        ];
        
        return samplePictures;
    }
    
    /**
     * Display pictures in the picture grid
     */
    function displayPictures(pictures) {
        const pictureGrid = document.getElementById('pictureGrid');
        if (!pictureGrid) return;
        
        // Clear the grid
        pictureGrid.innerHTML = '';
        
        if (!pictures || pictures.length === 0) {
            pictureGrid.innerHTML = `
                <div class="no-pictures-message">
                    <i class="fas fa-image"></i>
                    <p>No pictures found. Start uploading some pictures!</p>
                </div>
            `;
            return;
        }
        
        // Add each picture to the grid
        pictures.forEach(picture => {
            // Create picture card
            const pictureCard = document.createElement('div');
            pictureCard.className = 'picture-card';
            pictureCard.setAttribute('data-id', picture.id);
            pictureCard.setAttribute('data-category', picture.category || 'other');
            
            // Format picture data for display
            const name = picture.name || 'Unnamed Picture';
            const category = picture.category || 'other';
            const description = picture.description || '';
            const imageUrl = picture.thumbnailUrl || picture.imageUrl || picture.url || '';
            
            // Set picture card content
            pictureCard.innerHTML = `
                <div class="picture-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="picture-info">
                    <h3>${name}</h3>
                    <div class="picture-category">
                        <span class="${category}">${category}</span>
                    </div>
                    <p class="picture-description">${description}</p>
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
            
            // Add to grid
            pictureGrid.appendChild(pictureCard);
        });
        
        // Set up edit and delete handlers for the new cards
        setupPictureCardHandlers();
    }
    
    /**
     * Set up picture card handlers
     */
    function setupPictureCardHandlers() {
        const editButtons = document.querySelectorAll('.edit-picture');
        const deleteButtons = document.querySelectorAll('.delete-picture');
        
        // Set up edit button handlers
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const pictureId = this.getAttribute('data-id');
                if (pictureId) {
                    // Try to call the editPicture function from admin-pictures.js
                    if (typeof editPicture === 'function') {
                        editPicture(pictureId);
                    } else {
                        // Fallback alert if function not found
                        alert('Edit functionality not available. Please try refreshing the page.');
                    }
                }
            });
        });
        
        // Set up delete button handlers
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const pictureId = this.getAttribute('data-id');
                if (pictureId) {
                    if (confirm('Are you sure you want to delete this picture? This action cannot be undone.')) {
                        deletePicture(pictureId);
                    }
                }
            });
        });
    }
    
    /**
     * Delete a picture
     */
    function deletePicture(pictureId) {
        console.log('Deleting picture:', pictureId);
        
        try {
            // 1. Remove from adminPicturesMetadata
            const metadataStr = localStorage.getItem('adminPicturesMetadata');
            if (metadataStr) {
                let metadata = JSON.parse(metadataStr);
                metadata = metadata.filter(item => item.id !== pictureId);
                localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadata));
            }
            
            // 2. Remove from sitePictures
            const sitePicturesStr = localStorage.getItem('sitePictures');
            if (sitePicturesStr) {
                let sitePictures = JSON.parse(sitePicturesStr);
                sitePictures = sitePictures.filter(item => item.id !== pictureId);
                localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            }
            
            // 3. Remove from carousel if present
            const carouselImagesStr = localStorage.getItem('carouselImages');
            if (carouselImagesStr) {
                let carouselImages = JSON.parse(carouselImagesStr);
                carouselImages = carouselImages.filter(id => id !== pictureId);
                localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
            }
            
            // 4. Try to remove from IndexedDB
            if (window.indexedDB) {
                const dbRequest = indexedDB.open('sriLankaImageDB');
                dbRequest.onsuccess = function(event) {
                    const db = event.target.result;
                    
                    // Delete from metadata store
                    if (db.objectStoreNames.contains('metadata')) {
                        const metadataTransaction = db.transaction(['metadata'], 'readwrite');
                        const metadataStore = metadataTransaction.objectStore('metadata');
                        metadataStore.delete(pictureId);
                    }
                    
                    // Delete from images store
                    if (db.objectStoreNames.contains('images')) {
                        const imagesTransaction = db.transaction(['images'], 'readwrite');
                        const imagesStore = imagesTransaction.objectStore('images');
                        imagesStore.delete(pictureId);
                    }
                };
            }
            
            // Refresh the display
            fixPictureLoading();
            fixCarouselImages();
            
            alert('Picture deleted successfully.');
            
        } catch (error) {
            console.error('Error deleting picture:', error);
            alert('Error deleting picture. Please try again.');
        }
    }
    
})(); 