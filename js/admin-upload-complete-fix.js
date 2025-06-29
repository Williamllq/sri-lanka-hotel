/**
 * Admin Upload Complete Fix - Comprehensive fix for admin picture upload functionality
 */

(function() {
    'use strict';
    
    console.log('Admin Upload Complete Fix loading...');
    
    // Ensure CloudStorageManager is available
    function waitForCloudStorage(callback) {
        if (window.CloudStorageManager) {
            callback();
        } else {
            setTimeout(() => waitForCloudStorage(callback), 100);
        }
    }
    
    // Enhanced upload function with complete metadata
    async function uploadPictureEnhanced(file, metadata) {
        try {
            console.log('Starting enhanced upload...', metadata);
            
            // Show loading state
            showUploadProgress('Uploading image...');
            
            // Initialize cloud storage if not already done
            if (!window.cloudStorage && window.CloudStorageManager) {
                window.cloudStorage = new CloudStorageManager();
                await window.cloudStorage.init();
            }
            
            // Upload to Cloudinary
            let uploadResult = null;
            if (window.cloudStorage && window.cloudStorage.isConfigured()) {
                try {
                    uploadResult = await window.cloudStorage.uploadImage(file, {
                        folder: 'sri-lanka-gallery',
                        tags: [metadata.category, 'admin-upload'],
                        context: `title=${metadata.title}|category=${metadata.category}`
                    });
                    console.log('Cloud upload successful:', uploadResult);
                } catch (cloudError) {
                    console.error('Cloud upload failed:', cloudError);
                    // Continue with local storage
                }
            }
            
            // Create picture object with complete metadata
            const picture = {
                id: `pic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: metadata.title || 'Untitled',
                description: metadata.description || '',
                category: metadata.category || 'scenery',
                imageUrl: uploadResult ? uploadResult.secure_url : await readFileAsDataURL(file),
                cloudUrl: uploadResult ? uploadResult.secure_url : null,
                publicId: uploadResult ? uploadResult.public_id : null,
                uploadDate: new Date().toISOString(),
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                metadata: metadata
            };
            
            // Save to admin pictures
            const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
            adminPictures.push(picture);
            localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
            
            // Trigger sync to gallery
            triggerGallerySync();
            
            // Update UI
            showUploadProgress('Upload complete!', 'success');
            setTimeout(() => hideUploadProgress(), 2000);
            
            // Refresh picture display
            if (typeof window.displayPictures === 'function') {
                window.displayPictures();
            }
            
            return { success: true, picture };
            
        } catch (error) {
            console.error('Upload error:', error);
            showUploadProgress('Upload failed: ' + error.message, 'error');
            setTimeout(() => hideUploadProgress(), 3000);
            return { success: false, error: error.message };
        }
    }
    
    // Read file as data URL for local storage fallback
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Show upload progress
    function showUploadProgress(message, type = 'info') {
        let progressEl = document.getElementById('uploadProgress');
        if (!progressEl) {
            progressEl = document.createElement('div');
            progressEl.id = 'uploadProgress';
            progressEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
                color: white;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(progressEl);
        }
        progressEl.textContent = message;
        progressEl.style.background = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3';
    }
    
    function hideUploadProgress() {
        const progressEl = document.getElementById('uploadProgress');
        if (progressEl) {
            progressEl.remove();
        }
    }
    
    // Trigger gallery sync
    function triggerGallerySync() {
        // Call the gallery sync fix if available
        if (window.GallerySyncFix && typeof window.GallerySyncFix.sync === 'function') {
            window.GallerySyncFix.sync();
        } else {
            // Manual sync
            const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
            const galleryImages = adminPictures.map(pic => ({
                id: pic.id,
                url: pic.imageUrl || pic.url,
                title: pic.title || 'Untitled',
                description: pic.description || '',
                category: pic.category || 'scenery',
                uploadDate: pic.uploadDate
            }));
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            
            // Trigger events
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'galleryImages',
                newValue: JSON.stringify(galleryImages),
                url: window.location.href
            }));
        }
    }
    
    // Fix the upload modal to include all metadata fields
    function enhanceUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (!modal) return;
        
        // Ensure all fields exist
        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) return;
        
        // Check if fields already exist
        if (!modalBody.querySelector('#uploadTitle')) {
            // Add title field
            const titleGroup = document.createElement('div');
            titleGroup.className = 'form-group';
            titleGroup.innerHTML = `
                <label for="uploadTitle"><i class="fas fa-heading"></i> Image Title</label>
                <input type="text" class="form-control" id="uploadTitle" placeholder="Enter image title" required>
            `;
            modalBody.insertBefore(titleGroup, modalBody.querySelector('#uploadCategory').parentElement);
        }
        
        // Ensure description field exists
        if (!modalBody.querySelector('#uploadDescription')) {
            const descGroup = modalBody.querySelector('textarea')?.parentElement;
            if (descGroup) {
                const textarea = descGroup.querySelector('textarea');
                if (textarea && !textarea.id) {
                    textarea.id = 'uploadDescription';
                }
            }
        }
    }
    
    // Override the upload button handler
    function setupUploadHandler() {
        // Find upload button in modal
        const uploadBtn = document.querySelector('#uploadModal .upload-image-btn, #uploadModal button[onclick*="uploadImage"]');
        if (uploadBtn) {
            uploadBtn.onclick = null;
            uploadBtn.addEventListener('click', handleUploadClick);
        }
        
        // Also handle the form submit
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
            const form = uploadModal.querySelector('form');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    handleUploadClick();
                };
            }
        }
    }
    
    // Handle upload button click
    async function handleUploadClick() {
        const fileInput = document.getElementById('uploadImageFile');
        const titleInput = document.getElementById('uploadTitle') || document.getElementById('uploadImageName');
        const categorySelect = document.getElementById('uploadCategory');
        const descriptionInput = document.getElementById('uploadDescription') || document.querySelector('#uploadModal textarea');
        
        if (!fileInput?.files[0]) {
            alert('Please select an image file');
            return;
        }
        
        const file = fileInput.files[0];
        const metadata = {
            title: titleInput?.value || file.name.split('.')[0],
            category: categorySelect?.value || 'scenery',
            description: descriptionInput?.value || ''
        };
        
        // Upload the picture
        const result = await uploadPictureEnhanced(file, metadata);
        
        if (result.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
            if (modal) modal.hide();
            
            // Reset form
            fileInput.value = '';
            if (titleInput) titleInput.value = '';
            if (categorySelect) categorySelect.value = 'scenery';
            if (descriptionInput) descriptionInput.value = '';
            
            // Clear preview
            const preview = document.getElementById('uploadPreview');
            if (preview) {
                preview.innerHTML = '<p class="text-muted">Image preview will appear here</p>';
            }
        }
    }
    
    // Initialize the fix
    function initialize() {
        console.log('Initializing Admin Upload Complete Fix...');
        
        // Wait for cloud storage
        waitForCloudStorage(() => {
            console.log('Cloud storage ready');
        });
        
        // Enhance upload modal
        setTimeout(() => {
            enhanceUploadModal();
            setupUploadHandler();
        }, 1000);
        
        // Re-setup handlers when modal is shown
        document.addEventListener('shown.bs.modal', (event) => {
            if (event.target.id === 'uploadModal') {
                enhanceUploadModal();
                setupUploadHandler();
            }
        });
        
        // Expose enhanced upload function globally
        window.uploadPictureEnhanced = uploadPictureEnhanced;
        
        console.log('Admin Upload Complete Fix initialized');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})(); 