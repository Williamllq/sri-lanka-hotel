// Admin Image Processor for Sri Lanka Stay & Explore
// Handles admin-side image processing, optimization and synchronization

/**
 * AdminImageProcessor class for admin dashboard
 */
class AdminImageProcessor {
  constructor() {
    // Configuration
    this.config = {
      imageQuality: 85,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      imageSizes: [1200, 800, 400, 200], // Responsive sizes
      defaultFormat: 'webp', // Modern format for better compression
      categories: {
        gallery: {
          path: '/images/gallery',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        },
        accommodations: {
          path: '/images/accommodations',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        },
        testimonials: {
          path: '/images/testimonials',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        },
        hotel: {
          path: '/images/hotel',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      storeOriginal: true,
      compressionLevel: 'medium' // low, medium, high
    };
    
    // State
    this.isInitialized = false;
    this.uploadQueue = [];
    this.isProcessing = false;
    this.uploadStats = {
      processed: 0,
      errors: 0,
      totalSize: 0,
      savedSize: 0
    };
    
    // Initialize when DOM is ready
    window.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }
  
  /**
   * Initialize the image processor
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Check if IndexedDB is available
      if (window.IndexedDB) {
        await this.initializeIndexedDB();
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize UI components
      this.initializeUI();
      
      this.isInitialized = true;
      console.log('Admin Image Processor initialized');
    } catch (error) {
      console.error('Failed to initialize Admin Image Processor:', error);
    }
  }
  
  /**
   * Initialize IndexedDB and sync data from localStorage
   */
  async initializeIndexedDB() {
    if (!window.IndexedDB) {
      console.warn('IndexedDB not available, skipping initialization');
      return;
    }

    try {
      // Wait for IndexedDB to be initialized
      if (window.IndexedDB.initDB) {
        await window.IndexedDB.initDB();
      }

      // Check if there are images in IndexedDB
      if (window.IndexedDB.ImageStore) {
        const dbImages = await window.IndexedDB.ImageStore.getAllImages();
        
        // If IndexedDB is empty, try to import from localStorage
        if (!dbImages || dbImages.length === 0) {
          console.log('No images found in IndexedDB, attempting to import from localStorage');
          await this.importFromLocalStorage();
        } else {
          console.log(`Found ${dbImages.length} images in IndexedDB`);
          
          // Ensure localStorage is updated with IndexedDB data for frontend compatibility
          this.updateLocalStorageFromIndexedDB(dbImages);
        }
      }
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  /**
   * Import images from localStorage to IndexedDB
   */
  async importFromLocalStorage() {
    try {
      // Try site pictures first
      let pictures = [];
      const sitePictures = localStorage.getItem('sitePictures');
      if (sitePictures) {
        try {
          const parsedPictures = JSON.parse(sitePictures);
          if (Array.isArray(parsedPictures) && parsedPictures.length > 0) {
            pictures = parsedPictures;
            console.log(`Found ${pictures.length} images in sitePictures`);
          }
        } catch (e) {
          console.error('Error parsing sitePictures:', e);
        }
      }

      // If no site pictures, try admin pictures
      if (pictures.length === 0) {
        const adminPictures = localStorage.getItem('adminPictures');
        if (adminPictures) {
          try {
            const parsedPictures = JSON.parse(adminPictures);
            if (Array.isArray(parsedPictures) && parsedPictures.length > 0) {
              pictures = parsedPictures.map(pic => ({
                id: pic.id || `admin_${Math.random().toString(36).substr(2, 9)}`,
                name: pic.name || pic.title || 'Site Image',
                description: pic.description || '',
                category: pic.category || 'scenery',
                url: pic.url || pic.imageUrl || '',
                thumbnail: pic.thumbnail || pic.url || pic.imageUrl || '',
                uploadDate: pic.uploadDate || new Date().toISOString()
              }));
              console.log(`Found ${pictures.length} images in adminPictures`);
            }
          } catch (e) {
            console.error('Error parsing adminPictures:', e);
          }
        }
      }

      // Import to IndexedDB if we found pictures
      if (pictures.length > 0 && window.IndexedDB.ImageStore) {
        console.log(`Importing ${pictures.length} images to IndexedDB...`);
        
        for (const picture of pictures) {
          // Add missing fields for IndexedDB
          const dbImageData = {
            ...picture,
            id: picture.id,
            sizes: picture.sizes || [{
              width: 800,
              data: picture.url
            }],
            originalSize: picture.originalSize || 0,
            optimizedSize: picture.optimizedSize || 0,
            format: picture.format || 'jpeg',
            timestamp: Date.now()
          };
          
          try {
            await window.IndexedDB.ImageStore.addImage(dbImageData);
          } catch (error) {
            console.warn(`Failed to import image ${picture.id}:`, error);
          }
        }
        
        console.log(`Successfully imported ${pictures.length} images to IndexedDB`);
        
        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('imagesImported', {
          detail: { count: pictures.length }
        }));
      } else {
        console.log('No images found in localStorage to import');
      }
    } catch (error) {
      console.error('Error importing from localStorage:', error);
    }
  }

  /**
   * Update localStorage with images from IndexedDB for frontend compatibility
   */
  updateLocalStorageFromIndexedDB(dbImages) {
    try {
      if (!dbImages || !Array.isArray(dbImages) || dbImages.length === 0) {
        return;
      }
      
      // Convert IndexedDB format to localStorage format
      const sitePictures = dbImages.map(img => ({
        id: img.id,
        name: img.name,
        description: img.description || '',
        category: img.category || 'scenery',
        url: img.url,
        uploadDate: img.uploadDate || img.timestamp || new Date().toISOString()
      }));
      
      // Save to localStorage
      localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
      
      // Also update adminPictures for backward compatibility
      const adminPictures = dbImages.map(img => ({
        id: img.id,
        name: img.name,
        title: img.name,
        description: img.description || '',
        category: img.category || 'scenery',
        imageUrl: img.url,
        url: img.url,
        thumbnail: img.thumbnail || img.url,
        uploadDate: img.uploadDate || img.timestamp || new Date().toISOString()
      }));
      
      localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
      
      console.log(`Updated localStorage with ${dbImages.length} images from IndexedDB`);
      
      // Dispatch event to notify other components
      document.dispatchEvent(new CustomEvent('picturesSynced', {
        detail: { count: dbImages.length }
      }));
    } catch (error) {
      console.error('Error updating localStorage from IndexedDB:', error);
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle image upload form submission
    const uploadForm = document.getElementById('imageUploadForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleImageUpload(event.target);
      });
    }
    
    // Handle image preview when files are selected
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        this.handleFileSelection(event.target.files);
      });
    }
    
    // Handle drag and drop
    const dropZone = document.getElementById('imageDropZone');
    if (dropZone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
      
      // Highlight drop zone on drag over
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
          dropZone.classList.add('drag-over');
        });
      });
      
      // Remove highlight on drag leave
      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
          dropZone.classList.remove('drag-over');
        });
      });
      
      // Handle dropped files
      dropZone.addEventListener('drop', (event) => {
        const files = event.dataTransfer.files;
        this.handleFileSelection(files);
      });
    }
    
    // Handle bulk processing button
    const bulkProcessBtn = document.getElementById('bulkProcessBtn');
    if (bulkProcessBtn) {
      bulkProcessBtn.addEventListener('click', () => {
        this.processUploadQueue();
      });
    }
    
    // Handle settings changes
    const qualitySlider = document.getElementById('imageQualitySlider');
    if (qualitySlider) {
      qualitySlider.addEventListener('input', (event) => {
        this.config.imageQuality = parseInt(event.target.value);
        document.getElementById('qualityValue').textContent = this.config.imageQuality;
      });
    }
    
    // Handle image format change
    const formatSelector = document.getElementById('imageFormatSelector');
    if (formatSelector) {
      formatSelector.addEventListener('change', (event) => {
        this.config.defaultFormat = event.target.value;
      });
    }
  }
  
  /**
   * Initialize UI components
   */
  initializeUI() {
    // Create quality slider if it doesn't exist
    if (!document.getElementById('imageQualitySlider')) {
      this.createQualitySlider();
    }
    
    // Create format selector if it doesn't exist
    if (!document.getElementById('imageFormatSelector')) {
      this.createFormatSelector();
    }
    
    // Create drop zone if it doesn't exist
    if (!document.getElementById('imageDropZone')) {
      this.createDropZone();
    }
    
    // Create statistics container
    if (!document.getElementById('uploadStatsContainer')) {
      this.createStatsContainer();
    }
  }
  
  /**
   * Create image quality slider
   */
  createQualitySlider() {
    const uploadModal = document.querySelector('#uploadModal .modal-body');
    if (!uploadModal) return;
    
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'quality-slider-container';
    sliderContainer.innerHTML = `
      <label for="imageQualitySlider">Image Quality: <span id="qualityValue">${this.config.imageQuality}</span></label>
      <input type="range" id="imageQualitySlider" min="60" max="100" value="${this.config.imageQuality}" class="quality-slider">
      <div class="quality-labels">
        <span>Smaller Size</span>
        <span>Better Quality</span>
      </div>
    `;
    
    uploadModal.insertBefore(sliderContainer, uploadModal.firstChild);
  }
  
  /**
   * Create image format selector
   */
  createFormatSelector() {
    const uploadModal = document.querySelector('#uploadModal .modal-body');
    if (!uploadModal) return;
    
    const formatContainer = document.createElement('div');
    formatContainer.className = 'format-selector-container';
    formatContainer.innerHTML = `
      <label for="imageFormatSelector">Output Format:</label>
      <select id="imageFormatSelector" class="format-selector">
        <option value="webp" ${this.config.defaultFormat === 'webp' ? 'selected' : ''}>WebP (Best Performance)</option>
        <option value="jpeg" ${this.config.defaultFormat === 'jpeg' ? 'selected' : ''}>JPEG (Wide Compatibility)</option>
        <option value="png" ${this.config.defaultFormat === 'png' ? 'selected' : ''}>PNG (Lossless Quality)</option>
      </select>
    `;
    
    uploadModal.insertBefore(formatContainer, uploadModal.firstChild);
  }
  
  /**
   * Create image drop zone
   */
  createDropZone() {
    const uploadForm = document.getElementById('imageUploadForm');
    if (!uploadForm) return;
    
    const dropZone = document.createElement('div');
    dropZone.id = 'imageDropZone';
    dropZone.className = 'image-drop-zone';
    dropZone.innerHTML = `
      <div class="drop-zone-content">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Drop image files here</p>
        <p>or</p>
        <label for="imageFile" class="drop-zone-button">Select Files</label>
      </div>
    `;
    
    uploadForm.insertBefore(dropZone, uploadForm.firstChild);
  }
  
  /**
   * Create statistics container
   */
  createStatsContainer() {
    const uploadModal = document.querySelector('#uploadModal .modal-footer');
    if (!uploadModal) return;
    
    const statsContainer = document.createElement('div');
    statsContainer.id = 'uploadStatsContainer';
    statsContainer.className = 'upload-stats-container';
    statsContainer.innerHTML = `
      <div class="stats-row">
        <span>Images Processed:</span>
        <span id="processedCount">0</span>
      </div>
      <div class="stats-row">
        <span>Space Saved:</span>
        <span id="spaceSaved">0 KB</span>
      </div>
    `;
    
    uploadModal.insertBefore(statsContainer, uploadModal.firstChild);
  }
  
  /**
   * Handle file selection
   * @param {FileList} files - The selected files
   */
  handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    const previewContainer = document.getElementById('filePreview');
    if (!previewContainer) return;
    
    // Clear previous previews
    previewContainer.innerHTML = '';
    
    // Filter for image files and add to preview
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image`);
        return;
      }
      
      // Check file size
      if (file.size > this.config.maxUploadSize) {
        console.warn(`File ${file.name} exceeds maximum size of ${this.formatSize(this.config.maxUploadSize)}`);
        
        // Add warning to preview
        const warning = document.createElement('div');
        warning.className = 'file-preview-item warning';
        warning.innerHTML = `
          <div class="preview-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${file.name} (${this.formatSize(file.size)}) exceeds maximum size</span>
          </div>
        `;
        previewContainer.appendChild(warning);
        return;
      }
      
      // Create preview
      const preview = document.createElement('div');
      preview.className = 'file-preview-item';
      
      // Create thumbnail
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `
          <div class="preview-image-container">
            <img src="${e.target.result}" alt="${file.name}" class="preview-image">
            <div class="preview-info">
              <span class="preview-name">${file.name}</span>
              <span class="preview-size">${this.formatSize(file.size)}</span>
            </div>
            <div class="preview-actions">
              <button type="button" class="preview-remove" data-filename="${file.name}">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `;
        
        // Add to queue
        this.uploadQueue.push({
          file,
          element: preview
        });
        
        // Add remove button event
        const removeBtn = preview.querySelector('.preview-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            this.removeFromQueue(file.name);
            preview.remove();
          });
        }
      };
      
      reader.readAsDataURL(file);
      previewContainer.appendChild(preview);
    });
    
    // Show bulk processing button if multiple files
    if (files.length > 1) {
      const bulkBtn = document.getElementById('bulkProcessBtn');
      if (bulkBtn) {
        bulkBtn.style.display = 'inline-block';
      }
    }
  }
  
  /**
   * Remove a file from the upload queue
   * @param {string} filename - The filename to remove
   */
  removeFromQueue(filename) {
    const index = this.uploadQueue.findIndex(item => item.file.name === filename);
    if (index !== -1) {
      this.uploadQueue.splice(index, 1);
    }
    
    // Hide bulk button if queue is empty
    if (this.uploadQueue.length <= 1) {
      const bulkBtn = document.getElementById('bulkProcessBtn');
      if (bulkBtn) {
        bulkBtn.style.display = 'none';
      }
    }
  }
  
  /**
   * Format file size to human-readable format
   * @param {number} bytes - The size in bytes
   * @returns {string} - Formatted size
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Process the entire upload queue
   */
  async processUploadQueue() {
    if (this.isProcessing || this.uploadQueue.length === 0) return;
    
    this.isProcessing = true;
    this.uploadStats = {
      processed: 0,
      errors: 0,
      totalSize: 0,
      savedSize: 0
    };
    
    this.updateStatsUI();
    
    // Process each file in the queue
    for (const item of this.uploadQueue) {
      try {
        await this.processAndUploadImage(item.file, item.element);
        this.uploadStats.processed++;
      } catch (error) {
        console.error(`Error processing ${item.file.name}:`, error);
        this.uploadStats.errors++;
        
        // Update UI to show error
        if (item.element) {
          item.element.classList.add('error');
          const infoElement = item.element.querySelector('.preview-info');
          if (infoElement) {
            infoElement.innerHTML += `<span class="preview-error">Error: ${error.message}</span>`;
          }
        }
      }
      
      this.updateStatsUI();
    }
    
    // Clear queue after processing
    this.uploadQueue = [];
    this.isProcessing = false;
    
    // Show completion notification
    this.showNotification(`Processed ${this.uploadStats.processed} images, saved ${this.formatSize(this.uploadStats.savedSize)}`);
  }
  
  /**
   * Update statistics UI
   */
  updateStatsUI() {
    const processedCount = document.getElementById('processedCount');
    if (processedCount) {
      processedCount.textContent = this.uploadStats.processed;
    }
    
    const spaceSaved = document.getElementById('spaceSaved');
    if (spaceSaved) {
      spaceSaved.textContent = this.formatSize(this.uploadStats.savedSize);
    }
  }
  
  /**
   * Process and upload a single image
   * @param {File} file - The image file to process
   * @param {HTMLElement} element - The preview element
   */
  async processAndUploadImage(file, element) {
    // Update UI to show processing
    if (element) {
      element.classList.add('processing');
      const infoElement = element.querySelector('.preview-info');
      if (infoElement) {
        infoElement.innerHTML += '<span class="preview-status">Processing...</span>';
      }
    }
    
    try {
      // Read file as data URL
      const dataUrl = await this.readFileAsDataURL(file);
      
      // Process the image using our serverless function
      const response = await fetch('/.netlify/functions/processImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: dataUrl,
          format: this.config.defaultFormat,
          sizes: this.config.imageSizes,
          quality: this.config.imageQuality
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }
      
      const processingResult = await response.json();
      
      if (!processingResult.success) {
        throw new Error(processingResult.error || 'Image processing failed');
      }
      
      // Get category from form or default to gallery
      const categorySelect = document.getElementById('uploadCategory');
      const category = categorySelect ? categorySelect.value : 'gallery';
      
      // Calculate size savings
      const originalSize = file.size;
      let optimizedSize = 0;
      
      // Use the largest processed image for comparison
      const largestImage = processingResult.images.reduce((prev, current) => 
        (prev.width > current.width) ? prev : current
      );
      
      optimizedSize = this._estimateSize(largestImage.data);
      
      this.uploadStats.totalSize += originalSize;
      this.uploadStats.savedSize += (originalSize - optimizedSize);
      
      // Update UI to show success
      if (element) {
        element.classList.remove('processing');
        element.classList.add('success');
        const infoElement = element.querySelector('.preview-info');
        if (infoElement) {
          infoElement.innerHTML = `
            <span class="preview-name">${file.name}</span>
            <span class="preview-size">Saved ${this.formatSize(originalSize - optimizedSize)} (${Math.round((1 - optimizedSize/originalSize) * 100)}%)</span>
            <span class="preview-status success">Processed successfully</span>
          `;
        }
      }
      
      // Generate a unique ID for the image
      const imageId = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Create image metadata
      const imageData = {
        id: imageId,
        name: document.getElementById('pictureName')?.value || file.name,
        description: document.getElementById('pictureDescription')?.value || '',
        category: category,
        url: largestImage.data,
        thumbnail: processingResult.images.find(img => img.width <= 400)?.data || largestImage.data,
        sizes: processingResult.images.map(img => ({
          width: img.width,
          data: img.data
        })),
        originalSize: originalSize,
        optimizedSize: optimizedSize,
        format: this.config.defaultFormat,
        uploadDate: new Date().toISOString()
      };
      
      // Store in IndexedDB if available
      if (window.IndexedDB && window.IndexedDB.ImageStore) {
        try {
          await window.IndexedDB.ImageStore.addImage(imageData);
          console.log(`Image ${imageId} stored in IndexedDB`);
        } catch (error) {
          console.error('Failed to store image in IndexedDB:', error);
        }
      }
      
      // Also store in localStorage to ensure frontend compatibility
      this.syncWithLocalStorage(imageData);
      
      // Dispatch event for other components to update
      document.dispatchEvent(new CustomEvent('imageUploaded', { 
        detail: { imageId, category }
      }));
      
      return imageData;
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Update UI to show error
      if (element) {
        element.classList.remove('processing');
        element.classList.add('error');
        const infoElement = element.querySelector('.preview-info');
        if (infoElement) {
          infoElement.innerHTML = `
            <span class="preview-name">${file.name}</span>
            <span class="preview-error">Error: ${error.message}</span>
          `;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Read file as data URL
   * @param {File} file - The file to read
   * @returns {Promise<string>} - The file as data URL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.error);
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Estimate size of a data URL in bytes
   * @param {string} dataUrl - The data URL
   * @returns {number} - The estimated size in bytes
   */
  _estimateSize(dataUrl) {
    if (!dataUrl) return 0;
    
    // For base64 data URLs, the size is approximately 3/4 of the string length
    // after removing the header part
    const base64Part = dataUrl.split(',')[1];
    if (!base64Part) return 0;
    
    // Each Base64 character represents 6 bits, so 4 characters are 3 bytes
    return Math.floor(base64Part.length * 0.75);
  }
  
  /**
   * Show notification to user
   * @param {string} message - The message to show
   */
  showNotification(message) {
    if (window.toastr) {
      toastr.success(message, 'Image Processor');
    } else {
      alert(message);
    }
  }
  
  /**
   * Handle image upload form submission
   * @param {HTMLFormElement} form - The form element
   */
  handleImageUpload(form) {
    // Process all queued files
    this.processUploadQueue();
  }
  
  /**
   * Synchronize image data with localStorage for frontend compatibility
   * @param {Object} imageData - The image data to synchronize
   */
  syncWithLocalStorage(imageData) {
    try {
      // Get existing site pictures
      let sitePictures = [];
      const storedPictures = localStorage.getItem('sitePictures');
      if (storedPictures) {
        try {
          sitePictures = JSON.parse(storedPictures);
          if (!Array.isArray(sitePictures)) {
            sitePictures = [];
          }
        } catch (e) {
          console.error('Error parsing sitePictures:', e);
        }
      }
      
      // Check if image already exists
      const existingIndex = sitePictures.findIndex(pic => pic.id === imageData.id);
      if (existingIndex !== -1) {
        // Update existing image
        sitePictures[existingIndex] = {
          ...sitePictures[existingIndex],
          ...imageData
        };
      } else {
        // Add new image
        sitePictures.push({
          id: imageData.id,
          name: imageData.name,
          description: imageData.description,
          category: imageData.category,
          url: imageData.url,
          uploadDate: imageData.uploadDate
        });
      }
      
      // Save back to localStorage
      localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
      console.log(`Synchronized image ${imageData.id} with localStorage (total: ${sitePictures.length} images)`);
      
      // Also update adminPictures for backward compatibility
      let adminPictures = [];
      const storedAdminPictures = localStorage.getItem('adminPictures');
      if (storedAdminPictures) {
        try {
          adminPictures = JSON.parse(storedAdminPictures);
          if (!Array.isArray(adminPictures)) {
            adminPictures = [];
          }
        } catch (e) {
          console.error('Error parsing adminPictures:', e);
        }
      }
      
      // Add to admin pictures in compatible format
      const adminImageData = {
        id: imageData.id,
        name: imageData.name,
        title: imageData.name,
        description: imageData.description,
        category: imageData.category,
        imageUrl: imageData.url,
        url: imageData.url,
        thumbnail: imageData.thumbnail,
        uploadDate: imageData.uploadDate
      };
      
      const existingAdminIndex = adminPictures.findIndex(pic => pic.id === imageData.id);
      if (existingAdminIndex !== -1) {
        adminPictures[existingAdminIndex] = adminImageData;
      } else {
        adminPictures.push(adminImageData);
      }
      
      localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
      
      // Dispatch event to notify other components
      document.dispatchEvent(new CustomEvent('picturesSynced', {
        detail: { count: sitePictures.length }
      }));
    } catch (error) {
      console.error('Error synchronizing with localStorage:', error);
    }
  }
}

// Create a global instance
window.AdminImageProcessor = new AdminImageProcessor(); 