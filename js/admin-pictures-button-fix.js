/**
 * Admin Pictures Button Fix
 * This script fixes issues with non-responsive buttons in the admin pictures interface
 */

(function() {
    'use strict';
    
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Button Fix loaded');
        
        // Wait a bit to ensure other scripts are loaded
        setTimeout(initButtonFixes, 300);
    });
    
    /**
     * Initialize button fixes
     */
    function initButtonFixes() {
        console.log('Initializing button fixes');
        
        // Fix the core picture management buttons
        fixPictureButtons();
        
        // Fix modal handling
        fixModalHandling();
        
        // Set up event delegation for dynamically created elements
        setupEventDelegation();
        
        // Re-check periodically for new elements
        setInterval(checkForNewElements, 1000);
    }
    
    /**
     * Fix the main picture management buttons
     */
    function fixPictureButtons() {
        console.log('Fixing picture management buttons');
        
        // Main buttons that need fixing
        const buttonIds = [
            'uploadPictureBtn',
            'organizePicturesBtn',
            'saveCarouselOrderBtn'
        ];
        
        buttonIds.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                console.log(`Setting up click handler for ${id}`);
                
                // Force these styles to ensure buttons are clickable
                button.style.position = 'relative';
                button.style.zIndex = '1500';
                button.style.cursor = 'pointer';
                button.style.pointerEvents = 'auto';
                
                // Clean old event listeners by cloning
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Set a data attribute to track which buttons we've fixed
                newButton.setAttribute('data-fixed', 'true');
                
                // Add click event listener with capturing phase to ensure it fires
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`Button clicked: ${id}`);
                    
                    // Handle specific button actions
                    if (id === 'uploadPictureBtn') {
                        openModal('uploadModal');
                    } else if (id === 'organizePicturesBtn') {
                        openModal('organizeFoldersModal');
                    } else if (id === 'saveCarouselOrderBtn') {
                        if (typeof saveCarouselOrder === 'function') {
                            saveCarouselOrder();
                        } else {
                            console.error('saveCarouselOrder function not defined');
                        }
                    }
                    
                    return false;
                }, true); // Use capturing phase
            } else {
                console.warn(`Button with ID ${id} not found`);
            }
        });
    }
    
    /**
     * Fix modal handling
     */
    function fixModalHandling() {
        console.log('Fixing modal handling');
        
        // Fix modal close buttons
        const closeButtons = document.querySelectorAll('.close-modal, .cancel-upload, .cancel-btn');
        closeButtons.forEach(button => {
            // Force these styles
            button.style.position = 'relative';
            button.style.zIndex = '2500';
            button.style.cursor = 'pointer';
            button.style.pointerEvents = 'auto';
            
            // Clean old event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const modal = this.closest('.admin-modal');
                if (modal) {
                    console.log(`Closing modal: ${modal.id}`);
                    closeModal(modal.id);
                }
                
                return false;
            }, true);
        });
        
        // Fix picture upload form
        const uploadForm = document.getElementById('uploadPictureForm');
        if (uploadForm) {
            console.log('Fixing picture upload form');
            
            // Clean old event listeners
            const newForm = uploadForm.cloneNode(true);
            uploadForm.parentNode.replaceChild(newForm, uploadForm);
            
            // Ensure file input works for preview
            const fileInput = newForm.querySelector('#pictureFile');
            const filePreview = document.getElementById('filePreview');
            
            if (fileInput && filePreview) {
                fileInput.addEventListener('change', function(e) {
                    const file = this.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            filePreview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px;">`;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        filePreview.innerHTML = `
                            <div class="preview-placeholder">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Image preview will appear here</p>
                            </div>
                        `;
                    }
                });
            }
            
            // Fix form submission
            newForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Picture upload form submitted');
                
                if (typeof handlePictureUpload === 'function') {
                    handlePictureUpload();
                } else {
                    console.error('handlePictureUpload function not defined');
                    // Basic fallback implementation
                    const pictureFile = newForm.querySelector('#pictureFile').files[0];
                    const pictureName = newForm.querySelector('#pictureName').value;
                    const category = newForm.querySelector('#uploadCategory').value;
                    const description = newForm.querySelector('#pictureDescription').value;
                    
                    if (!pictureFile) {
                        alert('Please select an image file');
                        return false;
                    }
                    
                    if (!pictureName.trim()) {
                        alert('Please enter an image name');
                        return false;
                    }
                    
                    if (!category) {
                        alert('Please select a category');
                        return false;
                    }
                    
                    processImageFile(pictureFile, function(imageUrl) {
                        const newPicture = {
                            id: 'pic_' + Date.now(),
                            name: pictureName,
                            category: category,
                            description: description || '',
                            imageUrl: imageUrl,
                            thumbnailUrl: imageUrl,
                            uploadDate: new Date().toISOString()
                        };
                        
                        // Save to storage
                        saveMetadata(newPicture);
                        
                        // Close modal
                        closeModal('uploadModal');
                        
                        // Reset form
                        newForm.reset();
                        filePreview.innerHTML = `
                            <div class="preview-placeholder">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Image preview will appear here</p>
                            </div>
                        `;
                        
                        // Reload pictures
                        if (typeof loadAndDisplayPictures === 'function') {
                            loadAndDisplayPictures();
                        }
                    });
                }
                
                return false;
            }, true);
        }
    }
    
    /**
     * Set up event delegation for dynamically created elements
     */
    function setupEventDelegation() {
        console.log('Setting up event delegation');
        
        // Use event delegation for edit/delete buttons that may be dynamically created
        document.addEventListener('click', function(e) {
            // Edit picture buttons
            if (e.target.classList.contains('edit-picture') || 
                (e.target.parentElement && e.target.parentElement.classList.contains('edit-picture'))) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.classList.contains('edit-picture') ? e.target : e.target.parentElement;
                const pictureId = button.getAttribute('data-id');
                
                if (pictureId && typeof editPicture === 'function') {
                    console.log(`Editing picture: ${pictureId}`);
                    editPicture(pictureId);
                }
                
                return false;
            }
            
            // Delete picture buttons
            if (e.target.classList.contains('delete-picture') || 
                (e.target.parentElement && e.target.parentElement.classList.contains('delete-picture'))) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.classList.contains('delete-picture') ? e.target : e.target.parentElement;
                const pictureId = button.getAttribute('data-id');
                
                if (pictureId && typeof deleteImageAndMetadata === 'function') {
                    console.log(`Deleting picture: ${pictureId}`);
                    if (confirm('Are you sure you want to delete this picture?')) {
                        deleteImageAndMetadata(pictureId);
                    }
                }
                
                return false;
            }
        }, true);
    }
    
    /**
     * Check for new elements that need fixing
     */
    function checkForNewElements() {
        // Fix any new buttons that have appeared
        document.querySelectorAll('.admin-btn:not([data-fixed])').forEach(button => {
            button.style.position = 'relative';
            button.style.zIndex = '1500';
            button.style.cursor = 'pointer';
            button.style.pointerEvents = 'auto';
            button.setAttribute('data-fixed', 'true');
        });
    }
    
    /**
     * Open a modal
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Close any open modals first
        document.querySelectorAll('.admin-modal.active').forEach(m => {
            closeModal(m.id);
        });
        
        // Show the modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Ensure modal is on top
        modal.style.zIndex = '2000';
        
        // Ensure modal content is interactive
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '2001';
            modalContent.style.pointerEvents = 'auto';
        }
        
        console.log(`Modal opened: ${modalId}`);
    }
    
    /**
     * Close a modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Hide the modal
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        console.log(`Modal closed: ${modalId}`);
    }
    
    // Expose functions to global scope
    window.adminPicturesButtonFix = {
        openModal: openModal,
        closeModal: closeModal,
        fixPictureButtons: fixPictureButtons,
        fixModalHandling: fixModalHandling
    };
})();

// Add enhanced styles for picture action buttons
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying enhanced button styles for picture actions');
    
    // Create enhanced styles for buttons
    const enhancedStyles = document.createElement('style');
    enhancedStyles.innerHTML = `
        /* Enhanced Picture Action Buttons */
        .picture-actions {
            padding: 10px !important;
            display: flex !important;
            justify-content: space-between !important;
            gap: 10px !important;
            background-color: #f8f9fa !important;
            border-top: 1px solid #e9ecef !important;
        }
        
        .picture-actions button {
            flex: 1 !important;
            padding: 8px 12px !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            min-width: 70px !important;
            height: 36px !important;
            position: relative !important;
            overflow: hidden !important;
        }
        
        /* Edit button styling */
        .picture-actions .edit-picture {
            background-color: #007bff !important;
            color: white !important;
        }
        
        .picture-actions .edit-picture:hover {
            background-color: #0056b3 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 8px rgba(0,123,255,0.3) !important;
        }
        
        .picture-actions .edit-picture:active {
            transform: translateY(0) !important;
        }
        
        /* Delete button styling */
        .picture-actions .delete-picture {
            background-color: #dc3545 !important;
            color: white !important;
        }
        
        .picture-actions .delete-picture:hover {
            background-color: #c82333 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 8px rgba(220,53,69,0.3) !important;
        }
        
        .picture-actions .delete-picture:active {
            transform: translateY(0) !important;
        }
        
        /* Icon styling */
        .picture-actions button i {
            font-size: 16px !important;
            margin: 0 !important;
        }
        
        /* Add text labels to buttons */
        .picture-actions .edit-picture::after {
            content: " Edit";
            font-family: Arial, sans-serif;
            margin-left: 5px;
        }
        
        .picture-actions .delete-picture::after {
            content: " Delete";
            font-family: Arial, sans-serif;
            margin-left: 5px;
        }
        
        /* Ripple effect on click */
        .picture-actions button::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        
        .picture-actions button:active::before {
            width: 200px;
            height: 200px;
        }
        
        /* Fix picture card layout */
        .picture-card {
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
            min-height: 320px !important;
        }
        
        .picture-info {
            flex-grow: 1 !important;
            padding: 12px !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .picture-actions {
                padding: 8px !important;
                gap: 5px !important;
            }
            
            .picture-actions button {
                padding: 6px 8px !important;
                font-size: 12px !important;
                min-width: 60px !important;
                height: 32px !important;
            }
            
            .picture-actions button i {
                font-size: 14px !important;
            }
        }
        
        /* Additional hover effects */
        .picture-card:hover .picture-actions {
            background-color: #e9ecef !important;
        }
        
        /* Focus styles for accessibility */
        .picture-actions button:focus {
            outline: 2px solid #80bdff !important;
            outline-offset: 2px !important;
        }
        
        /* Loading state */
        .picture-actions button:disabled {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
        }
        
        .picture-actions button:disabled:hover {
            transform: none !important;
            box-shadow: none !important;
        }
    `;
    
    document.head.appendChild(enhancedStyles);
    
    // Add delete picture function if not exists
    if (typeof window.deletePicture === 'undefined') {
        window.deletePicture = function(pictureId) {
            if (confirm('Are you sure you want to delete this picture?')) {
                console.log('Deleting picture:', pictureId);
                
                // Try different methods to delete the picture
                if (typeof deleteImageAndMetadata === 'function') {
                    deleteImageAndMetadata(pictureId).then(() => {
                        console.log('Picture deleted successfully');
                        if (typeof loadAndDisplayPictures === 'function') {
                            loadAndDisplayPictures();
                        }
                    }).catch(error => {
                        console.error('Error deleting picture:', error);
                        alert('Error deleting picture: ' + error.message);
                    });
                } else {
                    // Fallback deletion method
                    try {
                        // Remove from localStorage
                        const picturesStr = localStorage.getItem('adminPictures');
                        if (picturesStr) {
                            let pictures = JSON.parse(picturesStr);
                            pictures = pictures.filter(pic => pic.id !== pictureId);
                            localStorage.setItem('adminPictures', JSON.stringify(pictures));
                        }
                        
                        // Remove from metadata
                        const metadataStr = localStorage.getItem('adminPicturesMetadata');
                        if (metadataStr) {
                            let metadata = JSON.parse(metadataStr);
                            metadata = metadata.filter(meta => meta.id !== pictureId);
                            localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadata));
                        }
                        
                        // Remove from site pictures
                        const sitePicturesStr = localStorage.getItem('sitePictures');
                        if (sitePicturesStr) {
                            let sitePictures = JSON.parse(sitePicturesStr);
                            sitePictures = sitePictures.filter(pic => pic.id !== pictureId);
                            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
                        }
                        
                        // Reload pictures
                        if (typeof loadAndDisplayPictures === 'function') {
                            loadAndDisplayPictures();
                        } else {
                            location.reload();
                        }
                        
                        console.log('Picture deleted successfully');
                    } catch (error) {
                        console.error('Error deleting picture:', error);
                        alert('Error deleting picture: ' + error.message);
                    }
                }
            }
        };
    }
    
    // Re-attach event listeners to existing buttons
    function attachButtonListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-picture').forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                const pictureId = this.getAttribute('data-id');
                console.log('Edit button clicked for picture:', pictureId);
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                } else {
                    alert('Edit functionality is being loaded...');
                }
            };
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-picture').forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                const pictureId = this.getAttribute('data-id');
                console.log('Delete button clicked for picture:', pictureId);
                if (typeof window.deletePicture === 'function') {
                    window.deletePicture(pictureId);
                }
            };
        });
    }
    
    // Initial attachment
    attachButtonListeners();
    
    // Re-attach listeners when DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(attachButtonListeners, 100);
            }
        });
    });
    
    const pictureGrid = document.getElementById('pictureGrid');
    if (pictureGrid) {
        observer.observe(pictureGrid, { childList: true, subtree: true });
    }
    
    console.log('Picture action buttons enhanced successfully');
}); 