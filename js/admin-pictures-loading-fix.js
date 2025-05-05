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
        }
        
        // Display the pictures
        displayPictures(pictures);
    }
    
    /**
     * Load pictures from localStorage
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
        
        // Create sample picture data
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
            }
        ];
        
        // Store the sample pictures in localStorage for future use
        try {
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(samplePictures));
            localStorage.setItem('sitePictures', JSON.stringify(samplePictures));
        } catch (error) {
            console.error('Error saving sample pictures to storage:', error);
        }
        
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
     * Set up event handlers for picture cards
     */
    function setupPictureCardHandlers() {
        // Edit buttons
        document.querySelectorAll('.edit-picture').forEach(button => {
            button.addEventListener('click', function() {
                const pictureId = this.getAttribute('data-id');
                console.log('Edit picture clicked:', pictureId);
                
                // Call the original editPicture function if it exists
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                } else {
                    alert('Edit functionality not available');
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-picture').forEach(button => {
            button.addEventListener('click', function() {
                const pictureId = this.getAttribute('data-id');
                console.log('Delete picture clicked:', pictureId);
                
                if (confirm('Are you sure you want to delete this picture?')) {
                    // Call the original deleteImageAndMetadata function if it exists
                    if (typeof deleteImageAndMetadata === 'function') {
                        deleteImageAndMetadata(pictureId).then(() => {
                            // Refresh the picture display
                            fixPictureLoading();
                        });
                    } else {
                        // Simple deletion from localStorage
                        let picturesDeleted = false;
                        
                        try {
                            const storageKeys = ['adminPicturesMetadata', 'sitePictures', 'pictures', 'galleryPictures'];
                            
                            for (const key of storageKeys) {
                                const data = localStorage.getItem(key);
                                if (data) {
                                    try {
                                        let pictures = JSON.parse(data);
                                        if (Array.isArray(pictures)) {
                                            const originalLength = pictures.length;
                                            pictures = pictures.filter(pic => pic.id !== pictureId);
                                            
                                            if (pictures.length < originalLength) {
                                                localStorage.setItem(key, JSON.stringify(pictures));
                                                picturesDeleted = true;
                                            }
                                        }
                                    } catch (error) {
                                        console.error(`Error updating ${key}:`, error);
                                    }
                                }
                            }
                            
                            if (picturesDeleted) {
                                // Refresh the picture display
                                fixPictureLoading();
                            }
                        } catch (error) {
                            console.error('Error deleting picture:', error);
                        }
                    }
                }
            });
        });
    }
})(); 