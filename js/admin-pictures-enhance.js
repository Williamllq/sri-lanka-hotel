/**
 * Admin Pictures Management Enhancement
 * Enhances the picture management interface with better UX and cloud integration
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Enhancement loaded');
    
    // Only enhance if we're on the pictures section
    if (window.location.hash === '#pictures' || document.getElementById('picturesSection')?.classList.contains('active')) {
        enhancePicturesInterface();
    }
    
    // Listen for section changes
    window.addEventListener('hashchange', function() {
        if (window.location.hash === '#pictures') {
            enhancePicturesInterface();
        }
    });
});

/**
 * Main enhancement function
 */
function enhancePicturesInterface() {
    // Add cloud storage indicator
    addCloudStorageIndicator();
    
    // Enhance upload interface
    enhanceUploadInterface();
    
    // Add batch operations toolbar
    addBatchOperationsToolbar();
    
    // Enhance picture grid
    enhancePictureGrid();
    
    // Add search functionality
    addSearchBar();
    
    // Add image optimization tips
    addOptimizationTips();
    
    // Add drag-and-drop upload
    addDragDropUpload();
    
    // Add image preview modal
    addImagePreviewModal();
}

/**
 * Add cloud storage status indicator
 */
function addCloudStorageIndicator() {
    const pictureSection = document.getElementById('picturesSection');
    if (!pictureSection) return;
    
    // Check if indicator already exists
    if (document.getElementById('cloudStorageIndicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'cloudStorageIndicator';
    indicator.className = 'cloud-storage-indicator';
    indicator.innerHTML = `
        <div class="indicator-content">
            <div class="cloud-status">
                <i class="fas fa-cloud"></i>
                <span class="status-text">Checking Cloudinary...</span>
            </div>
            <div class="storage-stats" style="display: none;">
                <span class="stat-item">
                    <i class="fas fa-images"></i>
                    <span class="stat-value" id="totalImages">0</span> images
                </span>
                <span class="stat-item">
                    <i class="fas fa-hdd"></i>
                    <span class="stat-value" id="storageUsed">0</span> MB
                </span>
            </div>
            <button class="btn-migrate" id="migrateToCloudBtn" style="display: none;">
                <i class="fas fa-cloud-upload-alt"></i> Migrate to Cloud
            </button>
        </div>
    `;
    
    // Insert after the section header
    const sectionHeader = pictureSection.querySelector('h2');
    if (sectionHeader) {
        sectionHeader.parentNode.insertBefore(indicator, sectionHeader.nextSibling);
    }
    
    // Check cloud storage status
    checkCloudStorageStatus();
}

/**
 * Check cloud storage connection status
 */
async function checkCloudStorageStatus() {
    const statusText = document.querySelector('.cloud-storage-indicator .status-text');
    const statusIcon = document.querySelector('.cloud-storage-indicator .fa-cloud');
    const statsDiv = document.querySelector('.cloud-storage-indicator .storage-stats');
    
    if (!statusText) return;
    
    try {
        // Test Cloudinary connection
        const testResponse = await fetch('https://res.cloudinary.com/dmpfjul1j/image/upload/v1/test.jpg');
        
        if (window.cloudStorage && !window.cloudStorage.useSimulation) {
            statusText.textContent = 'Connected to Cloudinary';
            statusIcon.style.color = '#4CAF50';
            statusText.style.color = '#4CAF50';
            
            // Show storage stats
            if (statsDiv) {
                statsDiv.style.display = 'flex';
                updateStorageStats();
            }
        } else {
            statusText.textContent = 'Using Local Storage';
            statusIcon.style.color = '#FF9800';
            statusText.style.color = '#FF9800';
            
            // Show migrate button
            const migrateBtn = document.getElementById('migrateToCloudBtn');
            if (migrateBtn) {
                migrateBtn.style.display = 'inline-flex';
            }
        }
    } catch (error) {
        statusText.textContent = 'Cloud Storage Offline';
        statusIcon.style.color = '#f44336';
        statusText.style.color = '#f44336';
    }
}

/**
 * Update storage statistics
 */
function updateStorageStats() {
    // Get images count from grid
    const imageCount = document.querySelectorAll('.picture-card').length;
    document.getElementById('totalImages').textContent = imageCount;
    
    // Estimate storage (mock calculation)
    const estimatedStorage = (imageCount * 0.5).toFixed(1); // Assume 0.5MB per image average
    document.getElementById('storageUsed').textContent = estimatedStorage;
}

/**
 * Enhance upload interface
 */
function enhanceUploadInterface() {
    const uploadBtn = document.getElementById('uploadPictureBtn');
    if (!uploadBtn || uploadBtn.hasAttribute('data-enhanced')) return;
    
    uploadBtn.setAttribute('data-enhanced', 'true');
    
    // Add upload options dropdown
    const uploadOptions = document.createElement('div');
    uploadOptions.className = 'upload-options-wrapper';
    uploadOptions.innerHTML = `
        <button class="admin-btn primary split-btn" id="uploadSplitBtn">
            <span><i class="fas fa-upload"></i> Upload Picture</span>
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="upload-dropdown" style="display: none;">
            <a href="#" id="singleUploadOption"><i class="fas fa-image"></i> Single Image</a>
            <a href="#" id="batchUploadOption"><i class="fas fa-images"></i> Batch Upload</a>
            <a href="#" id="urlUploadOption"><i class="fas fa-link"></i> Upload from URL</a>
            <a href="#" id="importOption"><i class="fas fa-file-import"></i> Import from ZIP</a>
        </div>
    `;
    
    uploadBtn.parentNode.replaceChild(uploadOptions, uploadBtn);
    
    // Handle dropdown toggle
    document.getElementById('uploadSplitBtn').addEventListener('click', function(e) {
        if (e.target.closest('.fa-chevron-down')) {
            e.preventDefault();
            const dropdown = this.parentNode.querySelector('.upload-dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        } else {
            // Default action - single upload
            document.getElementById('uploadPictureBtn')?.click();
        }
    });
}

/**
 * Add batch operations toolbar
 */
function addBatchOperationsToolbar() {
    const filterContainer = document.querySelector('.picture-filter-container');
    if (!filterContainer || document.getElementById('batchOperationsToolbar')) return;
    
    const toolbar = document.createElement('div');
    toolbar.id = 'batchOperationsToolbar';
    toolbar.className = 'batch-operations-toolbar';
    toolbar.innerHTML = `
        <div class="batch-select">
            <label>
                <input type="checkbox" id="selectAllPictures">
                <span>Select All</span>
            </label>
            <span class="selected-count" style="display: none;">
                <span id="selectedCount">0</span> selected
            </span>
        </div>
        <div class="batch-actions" style="display: none;">
            <button class="batch-btn" id="batchDeleteBtn">
                <i class="fas fa-trash"></i> Delete
            </button>
            <button class="batch-btn" id="batchCategoryBtn">
                <i class="fas fa-folder"></i> Change Category
            </button>
            <button class="batch-btn" id="batchDownloadBtn">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="batch-btn" id="batchOptimizeBtn">
                <i class="fas fa-magic"></i> Optimize
            </button>
        </div>
    `;
    
    filterContainer.parentNode.insertBefore(toolbar, filterContainer.nextSibling);
}

/**
 * Enhance picture grid with better features
 */
function enhancePictureGrid() {
    const pictureCards = document.querySelectorAll('.picture-card');
    
    pictureCards.forEach(card => {
        if (card.hasAttribute('data-enhanced')) return;
        card.setAttribute('data-enhanced', 'true');
        
        // Add checkbox for batch operations
        const checkbox = document.createElement('div');
        checkbox.className = 'picture-checkbox';
        checkbox.innerHTML = '<input type="checkbox" class="select-picture">';
        
        const imageDiv = card.querySelector('.picture-image');
        if (imageDiv) {
            imageDiv.style.position = 'relative';
            imageDiv.appendChild(checkbox);
        }
        
        // Add quick actions overlay
        const quickActions = document.createElement('div');
        quickActions.className = 'picture-quick-actions';
        quickActions.innerHTML = `
            <button class="quick-action" title="View Details" data-action="view">
                <i class="fas fa-eye"></i>
            </button>
            <button class="quick-action" title="Copy URL" data-action="copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="quick-action" title="Download" data-action="download">
                <i class="fas fa-download"></i>
            </button>
        `;
        
        if (imageDiv) {
            imageDiv.appendChild(quickActions);
        }
        
        // Add metadata display
        const infoDiv = card.querySelector('.picture-info');
        if (infoDiv) {
            const metadata = document.createElement('div');
            metadata.className = 'picture-metadata';
            metadata.innerHTML = `
                <span class="meta-item"><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}</span>
                <span class="meta-item"><i class="fas fa-expand"></i> 1920x1080</span>
                <span class="meta-item"><i class="fas fa-file"></i> 256 KB</span>
            `;
            infoDiv.appendChild(metadata);
        }
    });
}

/**
 * Add search functionality
 */
function addSearchBar() {
    const filterContainer = document.querySelector('.picture-filter-container');
    if (!filterContainer || document.getElementById('pictureSearchBar')) return;
    
    const searchBar = document.createElement('div');
    searchBar.id = 'pictureSearchBar';
    searchBar.className = 'picture-search-bar';
    searchBar.innerHTML = `
        <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="pictureSearch" placeholder="Search images by name, category, or tags...">
            <button class="clear-search" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="search-filters">
            <button class="filter-chip active" data-filter="all">All</button>
            <button class="filter-chip" data-filter="recent">Recent</button>
            <button class="filter-chip" data-filter="unused">Unused</button>
            <button class="filter-chip" data-filter="large">Large Files</button>
        </div>
    `;
    
    filterContainer.appendChild(searchBar);
    
    // Handle search input
    document.getElementById('pictureSearch').addEventListener('input', function(e) {
        const clearBtn = this.parentNode.querySelector('.clear-search');
        clearBtn.style.display = e.target.value ? 'block' : 'none';
        performSearch(e.target.value);
    });
}

/**
 * Add optimization tips
 */
function addOptimizationTips() {
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid || document.getElementById('optimizationTips')) return;
    
    const tips = document.createElement('div');
    tips.id = 'optimizationTips';
    tips.className = 'optimization-tips';
    tips.innerHTML = `
        <div class="tip-header">
            <i class="fas fa-lightbulb"></i>
            <h4>Image Optimization Tips</h4>
            <button class="close-tips">&times;</button>
        </div>
        <div class="tip-content">
            <div class="tip-item">
                <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                <span>Images are automatically optimized with Cloudinary's f_auto and q_auto</span>
            </div>
            <div class="tip-item">
                <i class="fas fa-info-circle" style="color: #2196F3;"></i>
                <span>Recommended image size: 1920x1080 for best quality</span>
            </div>
            <div class="tip-item">
                <i class="fas fa-exclamation-triangle" style="color: #FF9800;"></i>
                <span>Large images (>5MB) will be automatically compressed</span>
            </div>
        </div>
    `;
    
    pictureGrid.parentNode.insertBefore(tips, pictureGrid);
    
    // Handle close
    tips.querySelector('.close-tips').addEventListener('click', () => {
        tips.style.display = 'none';
        localStorage.setItem('hidePictureTips', 'true');
    });
    
    // Check if tips should be hidden
    if (localStorage.getItem('hidePictureTips') === 'true') {
        tips.style.display = 'none';
    }
}

/**
 * Add drag and drop upload functionality
 */
function addDragDropUpload() {
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid) return;
    
    // Create drop zone overlay
    const dropZone = document.createElement('div');
    dropZone.id = 'dragDropZone';
    dropZone.className = 'drag-drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Drop images here to upload</h3>
            <p>or click to select files</p>
        </div>
    `;
    dropZone.style.display = 'none';
    document.body.appendChild(dropZone);
    
    // Handle drag events
    let dragCounter = 0;
    
    document.addEventListener('dragenter', function(e) {
        e.preventDefault();
        dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items[0].kind === 'file') {
            dropZone.style.display = 'flex';
        }
    });
    
    document.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            dropZone.style.display = 'none';
        }
    });
    
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        dragCounter = 0;
        dropZone.style.display = 'none';
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            handleFileDrop(files);
        }
    });
}

/**
 * Add image preview modal
 */
function addImagePreviewModal() {
    if (document.getElementById('imagePreviewModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'imagePreviewModal';
    modal.className = 'image-preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <span class="close-preview">&times;</span>
            <img class="preview-image" src="" alt="">
            <div class="preview-info">
                <h3 class="preview-title"></h3>
                <div class="preview-metadata">
                    <span class="meta-item"><i class="fas fa-link"></i> <a href="" target="_blank" class="preview-url">View Original</a></span>
                    <span class="meta-item"><i class="fas fa-expand"></i> <span class="preview-dimensions"></span></span>
                    <span class="meta-item"><i class="fas fa-file"></i> <span class="preview-size"></span></span>
                </div>
                <div class="preview-actions">
                    <button class="admin-btn" onclick="copyImageUrl()">
                        <i class="fas fa-copy"></i> Copy URL
                    </button>
                    <button class="admin-btn" onclick="downloadImage()">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="admin-btn primary" onclick="insertToContent()">
                        <i class="fas fa-plus"></i> Insert to Content
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle close
    modal.querySelector('.close-preview').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Handle file drop
 */
async function handleFileDrop(files) {
    console.log('Handling dropped files:', files.length);
    
    // Show upload progress
    showUploadProgress(files);
    
    // Upload files
    for (const file of files) {
        await uploadFileToCloud(file);
    }
}

/**
 * Show upload progress
 */
function showUploadProgress(files) {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'upload-progress-container';
    progressDiv.innerHTML = `
        <h4>Uploading ${files.length} image(s)...</h4>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">0 / ${files.length}</div>
    `;
    
    document.body.appendChild(progressDiv);
}

/**
 * Upload file to cloud
 */
async function uploadFileToCloud(file) {
    if (window.cloudStorage) {
        try {
            const result = await cloudStorage.uploadImage(file, {
                folder: 'admin-uploads',
                tags: ['admin', 'manual-upload']
            });
            
            if (result.success) {
                console.log('Upload successful:', result.data);
                // Refresh picture grid
                if (typeof loadAndDisplayPictures === 'function') {
                    loadAndDisplayPictures();
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }
}

/**
 * Perform search
 */
function performSearch(query) {
    const cards = document.querySelectorAll('.picture-card');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
        const name = card.querySelector('.picture-name')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.picture-category')?.textContent.toLowerCase() || '';
        
        if (name.includes(lowerQuery) || category.includes(lowerQuery)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Add enhancement styles
 */
function addEnhancementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Cloud Storage Indicator */
        .cloud-storage-indicator {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 10px;
            padding: 15px 20px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .indicator-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .cloud-status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }
        
        .cloud-status i {
            font-size: 24px;
        }
        
        .storage-stats {
            display: flex;
            gap: 20px;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #666;
        }
        
        .btn-migrate {
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .btn-migrate:hover {
            background: #1976d2;
            transform: translateY(-1px);
        }
        
        /* Upload Options */
        .upload-options-wrapper {
            position: relative;
            display: inline-block;
        }
        
        .split-btn {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .split-btn .fa-chevron-down {
            padding-left: 10px;
            border-left: 1px solid rgba(255,255,255,0.3);
            margin-left: 5px;
        }
        
        .upload-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-top: 5px;
            min-width: 200px;
            z-index: 1000;
        }
        
        .upload-dropdown a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 15px;
            color: #333;
            text-decoration: none;
            transition: background 0.2s ease;
        }
        
        .upload-dropdown a:hover {
            background: #f5f5f5;
        }
        
        /* Batch Operations */
        .batch-operations-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f9f9f9;
            padding: 12px 20px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #e0e0e0;
        }
        
        .batch-select {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .batch-select label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        
        .selected-count {
            color: #2196F3;
            font-weight: 500;
        }
        
        .batch-actions {
            display: flex;
            gap: 10px;
        }
        
        .batch-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }
        
        .batch-btn:hover {
            background: #f5f5f5;
            border-color: #2196F3;
            color: #2196F3;
        }
        
        /* Picture Enhancements */
        .picture-checkbox {
            position: absolute;
            top: 10px;
            left: 10px;
            background: white;
            border-radius: 4px;
            padding: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .picture-card:hover .picture-checkbox {
            opacity: 1;
        }
        
        .picture-checkbox input:checked {
            opacity: 1;
        }
        
        .picture-quick-actions {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .picture-card:hover .picture-quick-actions {
            opacity: 1;
        }
        
        .quick-action {
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .quick-action:hover {
            background: #2196F3;
            transform: scale(1.1);
        }
        
        .picture-metadata {
            display: flex;
            gap: 10px;
            margin-top: 8px;
            font-size: 12px;
            color: #666;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        /* Search Bar */
        .picture-search-bar {
            margin-top: 15px;
        }
        
        .search-input-wrapper {
            position: relative;
            margin-bottom: 10px;
        }
        
        .search-input-wrapper i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #666;
        }
        
        #pictureSearch {
            width: 100%;
            padding: 10px 40px;
            border: 1px solid #ddd;
            border-radius: 25px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        #pictureSearch:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
            outline: none;
        }
        
        .clear-search {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 5px;
        }
        
        .search-filters {
            display: flex;
            gap: 8px;
        }
        
        .filter-chip {
            background: white;
            border: 1px solid #ddd;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .filter-chip:hover {
            border-color: #2196F3;
            color: #2196F3;
        }
        
        .filter-chip.active {
            background: #2196F3;
            color: white;
            border-color: #2196F3;
        }
        
        /* Optimization Tips */
        .optimization-tips {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .tip-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .tip-header h4 {
            margin: 0;
            flex: 1;
        }
        
        .close-tips {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
        }
        
        .tip-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
            font-size: 14px;
        }
        
        /* Drag Drop Zone */
        .drag-drop-zone {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(33, 150, 243, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .drop-zone-content {
            text-align: center;
            color: white;
        }
        
        .drop-zone-content i {
            font-size: 80px;
            margin-bottom: 20px;
        }
        
        .drop-zone-content h3 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        
        /* Image Preview Modal */
        .image-preview-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            padding: 20px;
        }
        
        .preview-modal-content {
            background: white;
            border-radius: 10px;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            overflow: hidden;
        }
        
        .preview-image {
            max-width: 60%;
            object-fit: contain;
        }
        
        .preview-info {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
        }
        
        .close-preview {
            position: absolute;
            top: 20px;
            right: 20px;
            color: white;
            font-size: 30px;
            cursor: pointer;
            z-index: 1;
        }
        
        /* Upload Progress */
        .upload-progress-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            min-width: 300px;
            z-index: 1000;
        }
        
        .progress-bar {
            background: #e0e0e0;
            height: 4px;
            border-radius: 2px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            background: #2196F3;
            height: 100%;
            transition: width 0.3s ease;
        }
        
        /* Dark mode adjustments */
        body.dark-mode .cloud-storage-indicator {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
        }
        
        body.dark-mode .upload-dropdown {
            background: #333;
            border-color: #444;
        }
        
        body.dark-mode .upload-dropdown a {
            color: #e0e0e0;
        }
        
        body.dark-mode .upload-dropdown a:hover {
            background: #444;
        }
        
        body.dark-mode .batch-operations-toolbar {
            background: #2a2a2a;
            border-color: #444;
        }
        
        body.dark-mode .batch-btn {
            background: #333;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .optimization-tips {
            background: #3a3a2a;
            border-color: #5a5a3a;
            color: #e0e0e0;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize styles
addEnhancementStyles(); 