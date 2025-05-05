/**
 * Admin Images Repository
 * A comprehensive image management system using the Repository Pattern
 * for robust synchronization between admin panel and frontend gallery
 */

// Immediately invoked function expression to avoid global scope pollution
const ImageRepository = (function() {
    'use strict';
    
    // Storage keys
    const KEYS = {
        ADMIN_PICTURES: 'adminPictures',
        ADMIN_METADATA: 'adminPicturesMetadata',
        SITE_PICTURES: 'sitePictures',
        CAROUSEL_IMAGES: 'carouselImages',
        SYNC_TIMESTAMP: 'imagesSyncTimestamp'
    };
    
    // Events
    const EVENTS = {
        SYNC_COMPLETE: 'imagesSyncComplete',
        IMAGES_UPDATED: 'imagesUpdated',
        SYNC_STARTED: 'imagesSyncStarted',
        ERROR: 'imagesSyncError'
    };
    
    // Default image by category
    const DEFAULT_IMAGES = {
        'scenery': 'images/gallery/scenic-mountains.jpg',
        'wildlife': 'images/gallery/wildlife.jpg',
        'culture': 'images/gallery/temple.jpg',
        'food': 'images/gallery/food.jpg',
        'beach': 'images/gallery/beach.jpg'
    };
    
    // Initialize the repository when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🖼️ Image Repository: Initializing...');
        
        // Add the sync button and status panel to admin interface
        if (isAdminPage()) {
            addRepositoryUI();
        }
        
        // Add debug panel
        if (isAdminPage() && getQueryParam('debug') === 'true') {
            addDebugPanel();
        }
        
        // Do initial sync after a slight delay to ensure other scripts have loaded
        setTimeout(function() {
            fullSync(true);
        }, 1000);
        
        // Set up event listeners for various events
        setupEventListeners();
        
        // Set up interval for periodic sync
        setInterval(function() {
            fullSync(false);
        }, 15000); // Every 15 seconds
    });
    
    /**
     * Check if current page is the admin dashboard
     */
    function isAdminPage() {
        return window.location.href.includes('admin-dashboard');
    }
    
    /**
     * Get query parameter value
     */
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Listen for image related events
        document.addEventListener('pictureSaved', function(e) {
            console.log('🖼️ Image Repository: Picture saved event detected');
            fullSync(false);
        });
        
        document.addEventListener('pictureDeleted', function(e) {
            console.log('🖼️ Image Repository: Picture deleted event detected');
            fullSync(false);
        });
        
        document.addEventListener('galleryUpdated', function(e) {
            console.log('🖼️ Image Repository: Gallery updated event detected');
            fullSync(false);
        });
        
        // Listen for storage changes
        window.addEventListener('storage', function(e) {
            if (Object.values(KEYS).includes(e.key)) {
                console.log(`🖼️ Image Repository: Storage change detected for ${e.key}`);
                fullSync(false);
            }
        });
    }
    
    /**
     * Add repository UI elements to the admin page
     */
    function addRepositoryUI() {
        // Add a sync button to the action buttons container
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons && !document.getElementById('repoSyncBtn')) {
            const syncButton = document.createElement('button');
            syncButton.id = 'repoSyncBtn';
            syncButton.className = 'admin-btn primary';
            syncButton.innerHTML = '<i class="fas fa-sync"></i> Sync All Images';
            syncButton.title = 'Perform a full synchronization of all images';
            
            syncButton.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
                
                fullSync(true).then(count => {
                    this.innerHTML = '<i class="fas fa-check"></i> Synced (' + count + ')';
                    setTimeout(() => {
                        this.disabled = false;
                        this.innerHTML = '<i class="fas fa-sync"></i> Sync All Images';
                    }, 2000);
                    
                    showNotification('Success', `Synchronized ${count} images successfully.`);
                }).catch(error => {
                    this.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                    this.disabled = false;
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-sync"></i> Sync All Images';
                    }, 2000);
                    
                    showNotification('Error', `Failed to sync images: ${error.message}`, 'error');
                });
            });
            
            actionButtons.appendChild(syncButton);
            
            // Add a status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'repoStatusIndicator';
            statusIndicator.className = 'repo-status-indicator';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span class="status-text">Ready</span>';
            
            // Add status indicator styles
            const style = document.createElement('style');
            style.textContent = `
                .repo-status-indicator {
                    display: inline-flex;
                    align-items: center;
                    margin-left: 15px;
                    font-size: 14px;
                    color: #666;
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #28a745;
                    margin-right: 5px;
                }
                .status-dot.syncing {
                    background-color: #ffc107;
                    animation: pulse 1s infinite;
                }
                .status-dot.error {
                    background-color: #dc3545;
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 4px solid #28a745;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    padding: 15px 20px;
                    border-radius: 4px;
                    z-index: 9999;
                    max-width: 350px;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: all 0.3s ease;
                }
                .notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .notification.error {
                    border-left-color: #dc3545;
                }
                .notification h4 {
                    margin-top: 0;
                    margin-bottom: 5px;
                }
                .notification p {
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
            
            actionButtons.appendChild(statusIndicator);
        }
    }
    
    /**
     * Add debug panel for troubleshooting
     */
    function addDebugPanel() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'imageDebugPanel';
        debugPanel.className = 'image-debug-panel';
        debugPanel.innerHTML = `
            <h3>Image Repository Debug <button id="closeDebugPanel">×</button></h3>
            <div class="debug-content">
                <div class="debug-stats">
                    <div class="stat-item">
                        <span class="stat-label">Admin Images:</span>
                        <span class="stat-value" id="adminImgCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Frontend Images:</span>
                        <span class="stat-value" id="frontendImgCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Metadata Count:</span>
                        <span class="stat-value" id="metadataCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Sync:</span>
                        <span class="stat-value" id="lastSyncTime">Never</span>
                    </div>
                </div>
                <div class="debug-actions">
                    <button id="viewStorageBtn">View Storage</button>
                    <button id="cleanupStorageBtn">Clean Storage</button>
                    <button id="restoreDefaultsBtn">Restore Defaults</button>
                </div>
                <div class="debug-output">
                    <pre id="debugOutput"></pre>
                </div>
            </div>
        `;
        
        // Add debug panel styles
        const style = document.createElement('style');
        style.textContent = `
            .image-debug-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                z-index: 9999;
                font-family: monospace;
                font-size: 12px;
            }
            .image-debug-panel h3 {
                margin: 0;
                padding: 10px;
                background: #f8f9fa;
                border-bottom: 1px solid #ddd;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
            }
            .image-debug-panel h3 button {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
            }
            .debug-content {
                padding: 10px;
                max-height: 300px;
                overflow-y: auto;
            }
            .debug-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
                margin-bottom: 10px;
            }
            .stat-item {
                padding: 5px;
                border: 1px solid #eee;
                border-radius: 3px;
            }
            .stat-label {
                font-weight: bold;
            }
            .debug-actions {
                display: flex;
                gap: 5px;
                margin-bottom: 10px;
            }
            .debug-actions button {
                flex: 1;
                padding: 5px;
                font-size: 11px;
                cursor: pointer;
            }
            .debug-output {
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 5px;
                max-height: 150px;
                overflow-y: auto;
            }
            .debug-output pre {
                margin: 0;
                white-space: pre-wrap;
            }
        `;
        document.head.appendChild(style);
        
        // Add debug panel to the page
        document.body.appendChild(debugPanel);
        
        // Add event listeners for debug panel
        document.getElementById('closeDebugPanel').addEventListener('click', function() {
            debugPanel.style.display = 'none';
        });
        
        document.getElementById('viewStorageBtn').addEventListener('click', function() {
            const output = document.getElementById('debugOutput');
            const storage = {
                adminPictures: getAdminPictures(),
                adminMetadata: getAdminMetadata(),
                sitePictures: getSitePictures()
            };
            output.textContent = JSON.stringify(storage, null, 2);
        });
        
        document.getElementById('cleanupStorageBtn').addEventListener('click', function() {
            if (confirm('This will remove duplicate and invalid images. Continue?')) {
                cleanupStorage();
                updateDebugStats();
                const output = document.getElementById('debugOutput');
                output.textContent = 'Storage cleaned up successfully.';
            }
        });
        
        document.getElementById('restoreDefaultsBtn').addEventListener('click', function() {
            if (confirm('This will restore default images. Continue?')) {
                restoreDefaultImages();
                updateDebugStats();
                const output = document.getElementById('debugOutput');
                output.textContent = 'Default images restored.';
            }
        });
        
        // Initial update of debug stats
        updateDebugStats();
    }
    
    /**
     * Update debug panel statistics
     */
    function updateDebugStats() {
        if (!isAdminPage() || !document.getElementById('adminImgCount')) return;
        
        document.getElementById('adminImgCount').textContent = getAdminPictures().length;
        document.getElementById('frontendImgCount').textContent = getSitePictures().length;
        document.getElementById('metadataCount').textContent = getAdminMetadata().length;
        
        const lastSync = localStorage.getItem(KEYS.SYNC_TIMESTAMP);
        if (lastSync) {
            const date = new Date(parseInt(lastSync));
            document.getElementById('lastSyncTime').textContent = date.toLocaleTimeString();
        } else {
            document.getElementById('lastSyncTime').textContent = 'Never';
        }
    }
    
    /**
     * Show a notification message
     */
    function showNotification(title, message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Update the repository status indicator
     */
    function updateStatus(status, isError = false) {
        const indicator = document.getElementById('repoStatusIndicator');
        if (!indicator) return;
        
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        if (status === 'syncing') {
            dot.className = 'status-dot syncing';
            text.textContent = 'Syncing...';
        } else if (isError) {
            dot.className = 'status-dot error';
            text.textContent = status;
        } else {
            dot.className = 'status-dot';
            text.textContent = status;
        }
    }
    
    /**
     * Perform a full synchronization of all images
     */
    async function fullSync(forceRefresh = false) {
        console.log(`🖼️ Image Repository: Starting full sync (force: ${forceRefresh})`);
        
        // Update status
        updateStatus('syncing');
        
        // Dispatch sync started event
        dispatchEvent(EVENTS.SYNC_STARTED);
        
        try {
            // Get images from all storage locations
            const adminImages = getAdminPictures();
            const siteImages = getSitePictures();
            const adminMetadata = getAdminMetadata();
            
            console.log(`🖼️ Image Repository: Found ${adminImages.length} admin images, ${siteImages.length} site images, ${adminMetadata.length} admin metadata`);
            
            // If all storages are empty and this is a forced refresh, add sample images
            if (forceRefresh && adminImages.length === 0 && siteImages.length === 0 && adminMetadata.length === 0) {
                console.log('🖼️ Image Repository: All storages empty, adding sample images');
                await restoreDefaultImages();
                return fullSync(false); // Recurse once to process the new sample images
            }
            
            // Merge all unique images
            const allUniqueImages = mergeImages(adminImages, siteImages, adminMetadata);
            console.log(`🖼️ Image Repository: Merged into ${allUniqueImages.length} unique images`);
            
            // Validate and clean images
            const validatedImages = validateImages(allUniqueImages);
            console.log(`🖼️ Image Repository: ${validatedImages.length} images passed validation`);
            
            // Save to all storage locations
            await saveToAllStorages(validatedImages);
            
            // Record sync timestamp
            localStorage.setItem(KEYS.SYNC_TIMESTAMP, Date.now().toString());
            
            // Update debug stats
            updateDebugStats();
            
            // Update status
            updateStatus(`Synced ${validatedImages.length} images`);
            setTimeout(() => {
                updateStatus('Ready');
            }, 3000);
            
            // Refresh displays if needed
            if (forceRefresh) {
                refreshDisplays();
            }
            
            // Dispatch sync complete event
            dispatchEvent(EVENTS.SYNC_COMPLETE, { count: validatedImages.length });
            
            console.log('🖼️ Image Repository: Full sync completed successfully');
            return validatedImages.length;
        } catch (error) {
            console.error('🖼️ Image Repository: Sync error:', error);
            
            // Update status
            updateStatus(`Error: ${error.message}`, true);
            
            // Dispatch error event
            dispatchEvent(EVENTS.ERROR, { error });
            
            throw error;
        }
    }
    
    /**
     * Clean up storage by removing duplicates and invalid images
     */
    function cleanupStorage() {
        // Get images from all storage locations
        const adminImages = getAdminPictures();
        const siteImages = getSitePictures();
        const adminMetadata = getAdminMetadata();
        
        // Merge all unique images
        const allUniqueImages = mergeImages(adminImages, siteImages, adminMetadata);
        
        // Validate and clean images
        const validatedImages = validateImages(allUniqueImages);
        
        // Save to all storage locations
        saveToAllStorages(validatedImages);
        
        return validatedImages.length;
    }
    
    /**
     * Restore default sample images
     */
    async function restoreDefaultImages() {
        // Create sample images
        const sampleImages = [
            {
                id: 'sample_beach_1',
                name: 'Scenic Beach',
                category: 'beach',
                description: 'Beautiful beach in Sri Lanka',
                imageUrl: 'images/gallery/beach.jpg',
                thumbnailUrl: 'images/gallery/beach.jpg',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_culture_1',
                name: 'Sri Lankan Culture',
                category: 'culture',
                description: 'Ancient temple in Sri Lanka',
                imageUrl: 'images/gallery/temple.jpg',
                thumbnailUrl: 'images/gallery/temple.jpg',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_wildlife_1',
                name: 'Wildlife Safari',
                category: 'wildlife',
                description: 'Elephants in Yala National Park',
                imageUrl: 'images/gallery/wildlife.jpg',
                thumbnailUrl: 'images/gallery/wildlife.jpg',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_scenery_1',
                name: 'Mountain Scenery',
                category: 'scenery',
                description: 'Beautiful mountains in central Sri Lanka',
                imageUrl: 'images/gallery/scenic-mountains.jpg',
                thumbnailUrl: 'images/gallery/scenic-mountains.jpg',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_food_1',
                name: 'Local Cuisine',
                category: 'food',
                description: 'Delicious Sri Lankan dishes',
                imageUrl: 'images/gallery/food.jpg',
                thumbnailUrl: 'images/gallery/food.jpg',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_scenery_2',
                name: 'Tea Plantations',
                category: 'scenery',
                description: 'Sri Lanka\'s famous tea plantations',
                imageUrl: 'images/gallery/tea-plantation.jpg',
                thumbnailUrl: 'images/gallery/tea-plantation.jpg',
                uploadDate: new Date().toISOString()
            }
        ];
        
        // Save to all storage locations
        await saveToAllStorages(sampleImages);
        
        return sampleImages.length;
    }
    
    /**
     * Save images to all storage locations
     */
    async function saveToAllStorages(images) {
        // Save to admin pictures
        const adminImages = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl || img.imageUrl,
            uploadDate: img.uploadDate
        }));
        localStorage.setItem(KEYS.ADMIN_PICTURES, JSON.stringify(adminImages));
        
        // Save to admin metadata
        const adminMetadata = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            thumbnailUrl: img.thumbnailUrl || img.imageUrl,
            uploadDate: img.uploadDate
        }));
        localStorage.setItem(KEYS.ADMIN_METADATA, JSON.stringify(adminMetadata));
        
        // Save to site pictures
        const siteImages = images.map(img => ({
            id: img.id,
            name: img.name,
            category: img.category,
            description: img.description,
            url: img.imageUrl,
            uploadDate: img.uploadDate
        }));
        localStorage.setItem(KEYS.SITE_PICTURES, JSON.stringify(siteImages));
        
        // Dispatch images updated event
        dispatchEvent(EVENTS.IMAGES_UPDATED, { count: images.length });
    }
    
    /**
     * Merge images from different sources
     */
    function mergeImages(adminImages, siteImages, adminMetadata) {
        // Create a map to track unique images by ID
        const uniqueImagesMap = new Map();
        
        // Process site images first
        siteImages.forEach(img => {
            const id = img.id || generateId();
            uniqueImagesMap.set(id, {
                id: id,
                name: img.name || 'Untitled',
                category: img.category || 'scenery',
                description: img.description || '',
                imageUrl: img.url || img.imageUrl || DEFAULT_IMAGES[img.category || 'scenery'] || '',
                thumbnailUrl: img.thumbnailUrl || img.url || img.imageUrl || DEFAULT_IMAGES[img.category || 'scenery'] || '',
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
                    thumbnailUrl: img.thumbnailUrl || img.imageUrl || existing.thumbnailUrl,
                    uploadDate: img.uploadDate || existing.uploadDate
                });
            } else {
                // Add new
                uniqueImagesMap.set(id, {
                    id: id,
                    name: img.name || 'Untitled',
                    category: img.category || 'scenery',
                    description: img.description || '',
                    imageUrl: img.imageUrl || DEFAULT_IMAGES[img.category || 'scenery'] || '',
                    thumbnailUrl: img.thumbnailUrl || img.imageUrl || DEFAULT_IMAGES[img.category || 'scenery'] || '',
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
                // Add new if it has a thumbnail
                if (meta.thumbnailUrl) {
                    uniqueImagesMap.set(id, {
                        id: id,
                        name: meta.name || 'Untitled',
                        category: meta.category || 'scenery',
                        description: meta.description || '',
                        imageUrl: meta.thumbnailUrl || DEFAULT_IMAGES[meta.category || 'scenery'] || '',
                        thumbnailUrl: meta.thumbnailUrl || DEFAULT_IMAGES[meta.category || 'scenery'] || '',
                        uploadDate: meta.uploadDate || new Date().toISOString()
                    });
                }
            }
        });
        
        // Convert map to array
        return Array.from(uniqueImagesMap.values());
    }
    
    /**
     * Validate images and ensure they have required properties
     */
    function validateImages(images) {
        return images.filter(img => {
            // Must have an ID
            if (!img.id) return false;
            
            // Must have an image URL or thumbnail URL
            if (!img.imageUrl && !img.thumbnailUrl) return false;
            
            // Must have a name
            if (!img.name) return false;
            
            // Must have a category
            if (!img.category) return false;
            
            return true;
        }).map(img => {
            // Ensure all required properties exist
            return {
                id: img.id,
                name: img.name || 'Untitled',
                category: img.category || 'scenery',
                description: img.description || '',
                imageUrl: img.imageUrl || img.thumbnailUrl || DEFAULT_IMAGES[img.category] || '',
                thumbnailUrl: img.thumbnailUrl || img.imageUrl || DEFAULT_IMAGES[img.category] || '',
                uploadDate: img.uploadDate || new Date().toISOString()
            };
        });
    }
    
    /**
     * Refresh displays if on relevant page
     */
    function refreshDisplays() {
        // Refresh gallery if on frontend
        if (window.location.pathname === '/' || 
            window.location.pathname === '/index.html' || 
            document.querySelector('.gallery-grid')) {
            
            console.log('🖼️ Image Repository: Refreshing frontend gallery display');
            
            if (typeof window.displayAdminImages === 'function') {
                window.displayAdminImages();
            }
            
            // Dispatch a gallery updated event
            const event = new CustomEvent('galleryUpdated');
            document.dispatchEvent(event);
        }
        
        // Refresh admin panel if on admin page
        if (isAdminPage()) {
            console.log('🖼️ Image Repository: Refreshing admin pictures display');
            
            // Try multiple methods to refresh the admin panel
            const pictureGrid = document.getElementById('pictureGrid');
            
            if (pictureGrid) {
                // Method 1: Directly set innerHTML to loading
                pictureGrid.innerHTML = `
                    <div class="loading-indicator">
                        <i class="fas fa-spinner fa-spin"></i> Loading images...
                    </div>
                `;
                
                // Method 2: Try loadAndDisplayPictures function
                if (typeof window.loadAndDisplayPictures === 'function') {
                    setTimeout(() => window.loadAndDisplayPictures(), 200);
                } else if (typeof loadAndDisplayPictures === 'function') {
                    setTimeout(() => loadAndDisplayPictures(), 200);
                } else {
                    // Method 3: Force refresh with category filter change
                    const categorySelect = document.getElementById('pictureCategory');
                    if (categorySelect) {
                        setTimeout(() => {
                            const currentValue = categorySelect.value;
                            // Change value and change back to trigger change event
                            categorySelect.value = currentValue === 'all' ? 'scenery' : 'all';
                            const event = new Event('change');
                            categorySelect.dispatchEvent(event);
                            setTimeout(() => {
                                categorySelect.value = currentValue;
                                categorySelect.dispatchEvent(event);
                            }, 300);
                        }, 500);
                    } else {
                        // Method 4: As a last resort, manually add images to the grid
                        setTimeout(() => {
                            displayPicturesToGrid(pictureGrid);
                        }, 500);
                    }
                }
            }
        }
    }
    
    /**
     * Manually display pictures to the grid (fallback method)
     */
    function displayPicturesToGrid(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Get images
        const images = getAdminPictures();
        
        if (images.length === 0) {
            container.innerHTML = `
                <div class="no-pictures-message">
                    <i class="fas fa-image"></i>
                    <p>No pictures found. Click the Upload Picture button to add images.</p>
                </div>
            `;
            return;
        }
        
        // Add each image to the grid
        images.forEach(img => {
            const pictureCard = document.createElement('div');
            pictureCard.className = 'picture-card';
            pictureCard.setAttribute('data-id', img.id);
            pictureCard.setAttribute('data-category', img.category);
            
            pictureCard.innerHTML = `
                <div class="picture-image">
                    <img src="${img.thumbnailUrl || img.imageUrl}" alt="${img.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="picture-info">
                    <h3>${img.name}</h3>
                    <div class="picture-category">
                        <span class="${img.category}">${img.category}</span>
                    </div>
                    <p class="picture-description">${img.description || ''}</p>
                </div>
                <div class="picture-actions">
                    <button class="edit-picture" data-id="${img.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-picture" data-id="${img.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(pictureCard);
        });
    }
    
    /**
     * Get all admin pictures from storage
     */
    function getAdminPictures() {
        try {
            const data = localStorage.getItem(KEYS.ADMIN_PICTURES);
            if (!data) return [];
            
            const images = JSON.parse(data);
            return Array.isArray(images) ? images : [];
        } catch (error) {
            console.error('🖼️ Image Repository: Error loading admin pictures:', error);
            return [];
        }
    }
    
    /**
     * Get all admin metadata from storage
     */
    function getAdminMetadata() {
        try {
            const data = localStorage.getItem(KEYS.ADMIN_METADATA);
            if (!data) return [];
            
            const metadata = JSON.parse(data);
            return Array.isArray(metadata) ? metadata : [];
        } catch (error) {
            console.error('🖼️ Image Repository: Error loading admin metadata:', error);
            return [];
        }
    }
    
    /**
     * Get all site pictures from storage
     */
    function getSitePictures() {
        try {
            const data = localStorage.getItem(KEYS.SITE_PICTURES);
            if (!data) return [];
            
            const images = JSON.parse(data);
            return Array.isArray(images) ? images : [];
        } catch (error) {
            console.error('🖼️ Image Repository: Error loading site pictures:', error);
            return [];
        }
    }
    
    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'img_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }
    
    /**
     * Dispatch a custom event
     */
    function dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    // Public API
    return {
        fullSync: fullSync,
        getAdminPictures: getAdminPictures,
        getSitePictures: getSitePictures,
        getAdminMetadata: getAdminMetadata,
        restoreDefaultImages: restoreDefaultImages,
        cleanupStorage: cleanupStorage,
        EVENTS: EVENTS
    };
})();

// Expose to global scope
window.ImageRepository = ImageRepository; 