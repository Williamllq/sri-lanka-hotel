/**
 * Admin Bulk Operations Module
 * Implements batch processing functionality for efficient image management
 */

class AdminBulkOperations {
  constructor() {
    this.selectedItems = new Set();
    this.isInitialized = false;
    this.bulkActionType = null;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => this.init());
  }
  
  /**
   * Initialize the bulk operations module
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('Initializing Admin Bulk Operations module');
    
    // Create bulk actions UI
    this.createBulkActionsUI();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Subscribe to image list updates
    document.addEventListener('picturesLoaded', () => this.refreshCheckboxes());
    
    this.isInitialized = true;
  }
  
  /**
   * Create the bulk actions UI elements
   */
  createBulkActionsUI() {
    // Find the picture management section
    const picturesSection = document.getElementById('picturesSection');
    if (!picturesSection) {
      console.warn('Pictures section not found, skipping bulk actions UI creation');
      return;
    }
    
    // Find the action buttons container or create one
    let actionButtonsContainer = picturesSection.querySelector('.action-buttons');
    if (!actionButtonsContainer) {
      actionButtonsContainer = document.createElement('div');
      actionButtonsContainer.className = 'action-buttons';
      const sectionDesc = picturesSection.querySelector('.section-description');
      if (sectionDesc) {
        sectionDesc.after(actionButtonsContainer);
      } else {
        picturesSection.prepend(actionButtonsContainer);
      }
    }
    
    // Create bulk operations container
    const bulkContainer = document.createElement('div');
    bulkContainer.className = 'bulk-operations-container';
    bulkContainer.innerHTML = `
      <div class="bulk-actions" style="display: none;">
        <span class="selected-count">0 items selected</span>
        <div class="bulk-action-buttons">
          <button class="admin-btn" id="bulkCategoryBtn">
            <i class="fas fa-tags"></i> Change Category
          </button>
          <button class="admin-btn danger" id="bulkDeleteBtn">
            <i class="fas fa-trash"></i> Delete Selected
          </button>
          <button class="admin-btn secondary" id="bulkCancelBtn">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
      
      <div class="bulk-select-toggle">
        <button class="admin-btn secondary" id="enableBulkSelectBtn">
          <i class="fas fa-check-square"></i> Bulk Select
        </button>
      </div>
      
      <!-- Category Change Modal -->
      <div id="bulkCategoryModal" class="admin-modal">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Change Category for Selected Images</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p>Select a new category for <span id="categoryChangeCount">0</span> images:</p>
            <div class="form-group">
              <select id="bulkCategorySelect" class="form-control">
                <option value="scenery">Scenery</option>
                <option value="wildlife">Wildlife</option>
                <option value="culture">Culture</option>
                <option value="food">Food</option>
                <option value="beach">Beach</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="admin-btn secondary" id="cancelCategoryChange">Cancel</button>
            <button class="admin-btn primary" id="confirmCategoryChange">Apply Changes</button>
          </div>
        </div>
      </div>
      
      <!-- Confirmation Modal -->
      <div id="bulkConfirmModal" class="admin-modal">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Confirm Action</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirmMessage">Are you sure you want to proceed?</p>
          </div>
          <div class="modal-footer">
            <button class="admin-btn secondary" id="cancelBulkAction">Cancel</button>
            <button class="admin-btn danger" id="confirmBulkAction">Confirm</button>
          </div>
        </div>
      </div>
    `;
    
    // Add to picture section before the picture grid
    const pictureGrid = picturesSection.querySelector('.picture-grid');
    if (pictureGrid) {
      pictureGrid.before(bulkContainer);
    } else {
      actionButtonsContainer.after(bulkContainer);
    }
    
    // Add bulk selection mode toggle button to action buttons
    const toggleBtn = document.getElementById('enableBulkSelectBtn');
    if (toggleBtn && !actionButtonsContainer.contains(toggleBtn)) {
      actionButtonsContainer.appendChild(toggleBtn);
    }
    
    // Add CSS for bulk operations
    this.addBulkOperationsStyles();
  }
  
  /**
   * Add CSS styles for bulk operations
   */
  addBulkOperationsStyles() {
    if (document.getElementById('bulk-operations-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'bulk-operations-styles';
    styleEl.textContent = `
      .bulk-operations-container {
        margin-bottom: 20px;
        width: 100%;
      }
      
      .bulk-actions {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      
      .selected-count {
        font-size: 16px;
        font-weight: 500;
        color: #495057;
      }
      
      .bulk-action-buttons {
        display: flex;
        gap: 10px;
      }
      
      .image-checkbox {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 22px;
        height: 22px;
        background: white;
        border: 2px solid #dee2e6;
        border-radius: 4px;
        cursor: pointer;
        display: none;
        z-index: 10;
      }
      
      .image-checkbox.checked {
        background: #3498db;
        border-color: #3498db;
      }
      
      .image-checkbox.checked:after {
        content: '✓';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }
      
      .gallery-item.selectable {
        position: relative;
      }
      
      .gallery-item.selectable .image-checkbox {
        display: block;
      }
      
      .gallery-item.selected {
        outline: 3px solid #3498db;
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Set up event listeners for bulk operations
   */
  setupEventListeners() {
    // Toggle bulk selection mode
    const enableBulkBtn = document.getElementById('enableBulkSelectBtn');
    if (enableBulkBtn) {
      enableBulkBtn.addEventListener('click', () => this.toggleBulkSelectionMode());
    }
    
    // Bulk action buttons
    const bulkCategoryBtn = document.getElementById('bulkCategoryBtn');
    if (bulkCategoryBtn) {
      bulkCategoryBtn.addEventListener('click', () => this.showCategoryModal());
    }
    
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => this.confirmDeleteSelected());
    }
    
    const bulkCancelBtn = document.getElementById('bulkCancelBtn');
    if (bulkCancelBtn) {
      bulkCancelBtn.addEventListener('click', () => this.cancelBulkSelection());
    }
    
    // Category modal buttons
    const cancelCategoryBtn = document.getElementById('cancelCategoryChange');
    if (cancelCategoryBtn) {
      cancelCategoryBtn.addEventListener('click', () => this.hideCategoryModal());
    }
    
    const confirmCategoryBtn = document.getElementById('confirmCategoryChange');
    if (confirmCategoryBtn) {
      confirmCategoryBtn.addEventListener('click', () => this.applyBulkCategoryChange());
    }
    
    // Confirm modal buttons
    const cancelActionBtn = document.getElementById('cancelBulkAction');
    if (cancelActionBtn) {
      cancelActionBtn.addEventListener('click', () => this.hideConfirmModal());
    }
    
    const confirmActionBtn = document.getElementById('confirmBulkAction');
    if (confirmActionBtn) {
      confirmActionBtn.addEventListener('click', () => this.executeBulkAction());
    }
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.hideCategoryModal();
        this.hideConfirmModal();
      });
    });
  }
  
  /**
   * Toggle bulk selection mode on/off
   */
  toggleBulkSelectionMode() {
    const pictureGrid = document.querySelector('.picture-grid');
    const bulkActions = document.querySelector('.bulk-actions');
    const toggleBtn = document.getElementById('enableBulkSelectBtn');
    
    if (!pictureGrid || !bulkActions || !toggleBtn) return;
    
    // Toggle selection mode
    const isSelectionMode = pictureGrid.classList.toggle('bulk-selection-mode');
    
    if (isSelectionMode) {
      // Enable selection mode
      toggleBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Selection';
      toggleBtn.classList.remove('secondary');
      toggleBtn.classList.add('danger');
      bulkActions.style.display = 'flex';
      
      // Add checkboxes to all images
      this.addCheckboxesToImages();
    } else {
      // Disable selection mode
      this.cancelBulkSelection();
    }
  }
  
  /**
   * Cancel bulk selection mode
   */
  cancelBulkSelection() {
    const pictureGrid = document.querySelector('.picture-grid');
    const bulkActions = document.querySelector('.bulk-actions');
    const toggleBtn = document.getElementById('enableBulkSelectBtn');
    
    if (!pictureGrid || !bulkActions || !toggleBtn) return;
    
    // Reset UI
    pictureGrid.classList.remove('bulk-selection-mode');
    toggleBtn.innerHTML = '<i class="fas fa-check-square"></i> Bulk Select';
    toggleBtn.classList.remove('danger');
    toggleBtn.classList.add('secondary');
    bulkActions.style.display = 'none';
    
    // Clear selection
    this.selectedItems.clear();
    
    // Remove selection styling
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.classList.remove('selected', 'selectable');
      const checkbox = item.querySelector('.image-checkbox');
      if (checkbox) checkbox.remove();
    });
  }
  
  /**
   * Add checkboxes to all images in the grid
   */
  addCheckboxesToImages() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
      // Add selectable class
      item.classList.add('selectable');
      
      // Check if checkbox already exists
      if (item.querySelector('.image-checkbox')) return;
      
      // Create checkbox
      const checkbox = document.createElement('div');
      checkbox.className = 'image-checkbox';
      checkbox.dataset.id = item.dataset.id;
      
      // Add click handler
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleItemSelection(item);
      });
      
      // Add checkbox to item
      item.prepend(checkbox);
      
      // Make the entire item clickable for selection
      item.addEventListener('click', () => {
        if (item.classList.contains('selectable')) {
          this.toggleItemSelection(item);
        }
      });
    });
  }
  
  /**
   * Toggle selection state of an item
   */
  toggleItemSelection(item) {
    const itemId = item.dataset.id;
    const checkbox = item.querySelector('.image-checkbox');
    
    if (!itemId || !checkbox) return;
    
    // Toggle selection
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
      item.classList.remove('selected');
      checkbox.classList.remove('checked');
    } else {
      this.selectedItems.add(itemId);
      item.classList.add('selected');
      checkbox.classList.add('checked');
    }
    
    // Update selection count
    this.updateSelectionCount();
  }
  
  /**
   * Update the selection count display
   */
  updateSelectionCount() {
    const countElement = document.querySelector('.selected-count');
    if (!countElement) return;
    
    const count = this.selectedItems.size;
    countElement.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
    
    // Update count in category modal
    const categoryCountElement = document.getElementById('categoryChangeCount');
    if (categoryCountElement) {
      categoryCountElement.textContent = count;
    }
  }
  
  /**
   * Show the bulk category change modal
   */
  showCategoryModal() {
    if (this.selectedItems.size === 0) {
      alert('Please select at least one image to change category');
      return;
    }
    
    const modal = document.getElementById('bulkCategoryModal');
    if (!modal) return;
    
    modal.classList.add('active');
  }
  
  /**
   * Hide the bulk category change modal
   */
  hideCategoryModal() {
    const modal = document.getElementById('bulkCategoryModal');
    if (!modal) return;
    
    modal.classList.remove('active');
  }
  
  /**
   * Apply bulk category change to selected items
   */
  async applyBulkCategoryChange() {
    if (this.selectedItems.size === 0) return;
    
    const categorySelect = document.getElementById('bulkCategorySelect');
    if (!categorySelect) return;
    
    const newCategory = categorySelect.value;
    
    // Hide modal
    this.hideCategoryModal();
    
    // Show loading indicator
    this.showLoadingOverlay('Updating categories...');
    
    // Process each selected item
    const promises = [];
    const updatedItems = [];
    
    // Check if IndexedDB is available
    const hasIndexedDB = window.IndexedDB && window.IndexedDB.ImageStore;
    
    // Process images in batches
    for (const itemId of this.selectedItems) {
      try {
        // Update in IndexedDB if available
        if (hasIndexedDB) {
          const promise = window.IndexedDB.ImageStore.getImage(itemId)
            .then(image => {
              if (image) {
                image.category = newCategory;
                return window.IndexedDB.ImageStore.updateImage(image)
                  .then(() => {
                    updatedItems.push(itemId);
                    return true;
                  });
              }
              return false;
            });
          
          promises.push(promise);
        } 
        // Fallback to localStorage
        else {
          // Find image in localStorage
          const sitePictures = JSON.parse(localStorage.getItem('sitePictures') || '[]');
          const index = sitePictures.findIndex(pic => pic.id === itemId);
          
          if (index !== -1) {
            sitePictures[index].category = newCategory;
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            updatedItems.push(itemId);
          }
          
          // Also update adminPictures for backward compatibility
          const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
          const adminIndex = adminPictures.findIndex(pic => pic.id === itemId);
          
          if (adminIndex !== -1) {
            adminPictures[adminIndex].category = newCategory;
            localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
          }
        }
      } catch (error) {
        console.error(`Error updating image ${itemId}:`, error);
      }
    }
    
    // Wait for all updates to complete if using IndexedDB
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    // Update UI for changed items
    updatedItems.forEach(itemId => {
      const item = document.querySelector(`.gallery-item[data-id="${itemId}"]`);
      if (item) {
        // Update category display if present
        const categoryElement = item.querySelector('.item-category');
        if (categoryElement) {
          categoryElement.textContent = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
        }
        
        // Update category data attribute
        item.dataset.category = newCategory;
      }
    });
    
    // Hide loading indicator
    this.hideLoadingOverlay();
    
    // Notify of completion
    this.showNotification(`Updated ${updatedItems.length} images to category "${newCategory}"`);
    
    // Refresh UI if needed
    this.refreshAfterUpdate();
    
    // Exit bulk selection mode
    this.cancelBulkSelection();
  }
  
  /**
   * Confirm deletion of selected items
   */
  confirmDeleteSelected() {
    if (this.selectedItems.size === 0) {
      alert('Please select at least one image to delete');
      return;
    }
    
    const modal = document.getElementById('bulkConfirmModal');
    const message = document.getElementById('confirmMessage');
    
    if (!modal || !message) return;
    
    // Set confirmation message
    const count = this.selectedItems.size;
    message.textContent = `Are you sure you want to delete ${count} selected image${count !== 1 ? 's' : ''}? This action cannot be undone.`;
    
    // Update action button styling
    const confirmBtn = document.getElementById('confirmBulkAction');
    if (confirmBtn) {
      confirmBtn.classList.add('danger');
      confirmBtn.textContent = 'Delete';
    }
    
    // Set action type
    this.bulkActionType = 'delete';
    
    // Show modal
    modal.classList.add('active');
  }
  
  /**
   * Hide the confirmation modal
   */
  hideConfirmModal() {
    const modal = document.getElementById('bulkConfirmModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    this.bulkActionType = null;
  }
  
  /**
   * Execute the current bulk action
   */
  async executeBulkAction() {
    // Hide confirmation modal
    this.hideConfirmModal();
    
    if (this.bulkActionType === 'delete') {
      await this.deleteSelectedItems();
    }
    
    // Reset action type
    this.bulkActionType = null;
  }
  
  /**
   * Delete selected items
   */
  async deleteSelectedItems() {
    if (this.selectedItems.size === 0) return;
    
    // Show loading indicator
    this.showLoadingOverlay('Deleting images...');
    
    const promises = [];
    const deletedItems = [];
    
    // Check if IndexedDB is available
    const hasIndexedDB = window.IndexedDB && window.IndexedDB.ImageStore;
    
    // Process each selected item
    for (const itemId of this.selectedItems) {
      try {
        // Delete from IndexedDB if available
        if (hasIndexedDB) {
          const promise = window.IndexedDB.ImageStore.deleteImage(itemId)
            .then(() => {
              deletedItems.push(itemId);
              return true;
            });
          
          promises.push(promise);
        } 
        // Fallback to localStorage
        else {
          // Delete from sitePictures
          let sitePictures = JSON.parse(localStorage.getItem('sitePictures') || '[]');
          sitePictures = sitePictures.filter(pic => pic.id !== itemId);
          localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
          
          // Delete from adminPictures
          let adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
          adminPictures = adminPictures.filter(pic => pic.id !== itemId);
          localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
          
          deletedItems.push(itemId);
        }
      } catch (error) {
        console.error(`Error deleting image ${itemId}:`, error);
      }
    }
    
    // Wait for all deletions to complete if using IndexedDB
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    // Remove deleted items from UI
    deletedItems.forEach(itemId => {
      const item = document.querySelector(`.gallery-item[data-id="${itemId}"]`);
      if (item) {
        item.remove();
      }
    });
    
    // Hide loading indicator
    this.hideLoadingOverlay();
    
    // Notify of completion
    this.showNotification(`Deleted ${deletedItems.length} images successfully`);
    
    // Clear selection
    this.selectedItems.clear();
    
    // Exit bulk selection mode
    this.cancelBulkSelection();
    
    // Refresh UI if needed
    this.refreshAfterUpdate();
  }
  
  /**
   * Refresh the UI after a bulk operation
   */
  refreshAfterUpdate() {
    // Notify other components that images have been updated
    document.dispatchEvent(new CustomEvent('picturesSynced', {
      detail: { source: 'bulkOperation' }
    }));
    
    // Reload the gallery if needed
    if (window.galleryCategoryFix && typeof window.galleryCategoryFix.initGalleryFix === 'function') {
      window.galleryCategoryFix.initGalleryFix();
    }
  }
  
  /**
   * Refresh checkboxes when images are loaded or changed
   */
  refreshCheckboxes() {
    // Only refresh if in selection mode
    const pictureGrid = document.querySelector('.picture-grid');
    if (!pictureGrid || !pictureGrid.classList.contains('bulk-selection-mode')) return;
    
    // Re-add checkboxes
    this.addCheckboxesToImages();
    
    // Re-select previously selected items that still exist
    this.selectedItems.forEach(itemId => {
      const item = document.querySelector(`.gallery-item[data-id="${itemId}"]`);
      if (item) {
        item.classList.add('selected');
        const checkbox = item.querySelector('.image-checkbox');
        if (checkbox) checkbox.classList.add('checked');
      }
    });
    
    // Update selection count
    this.updateSelectionCount();
  }
  
  /**
   * Show loading overlay during bulk operations
   */
  showLoadingOverlay(message = 'Processing...') {
    // Create overlay if it doesn't exist
    let overlay = document.getElementById('bulkLoadingOverlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bulkLoadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p class="loading-message">${message}</p>
        </div>
      `;
      
      // Add overlay styles
      const style = document.createElement('style');
      style.textContent = `
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-spinner {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }
        
        .loading-spinner i {
          font-size: 40px;
          color: #3498db;
          margin-bottom: 20px;
        }
        
        .loading-message {
          font-size: 18px;
          margin: 10px 0 0;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(overlay);
    } else {
      // Update message if overlay exists
      const messageEl = overlay.querySelector('.loading-message');
      if (messageEl) messageEl.textContent = message;
      
      // Show overlay
      overlay.style.display = 'flex';
    }
  }
  
  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById('bulkLoadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
  
  /**
   * Show notification after bulk operation
   */
  showNotification(message) {
    // Use toastr if available
    if (window.toastr) {
      toastr.success(message);
      return;
    }
    
    // Fallback to custom notification
    let notification = document.getElementById('bulkOperationNotification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'bulkOperationNotification';
      notification.className = 'bulk-notification';
      
      // Add notification styles
      const style = document.createElement('style');
      style.textContent = `
        .bulk-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #28a745;
          color: white;
          padding: 15px 20px;
          border-radius: 5px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
          transform: translateY(100px);
          opacity: 0;
        }
        
        .bulk-notification.show {
          transform: translateY(0);
          opacity: 1;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after delay
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

// Initialize the bulk operations module
window.AdminBulkOperations = new AdminBulkOperations(); 