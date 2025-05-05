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