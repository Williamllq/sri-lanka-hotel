/**
 * Cloudinary Upload Fix - Fixes cloud upload issues and improves error handling
 */

(function() {
    'use strict';
    
    console.log('Cloudinary Upload Fix loading...');
    
    // Override the cloud storage upload to fix common issues
    function fixCloudinaryUpload() {
        if (!window.CloudStorageManager) {
            console.error('CloudStorageManager not found');
            return;
        }
        
        // Store original upload method
        const OriginalCloudStorage = window.CloudStorageManager;
        
        // Create enhanced version
        window.CloudStorageManager = class EnhancedCloudStorageManager extends OriginalCloudStorage {
            async uploadImage(file, options = {}) {
                try {
                    console.log('Enhanced upload starting...', {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        options
                    });
                    
                    // Validate file
                    const validation = this.validateFile(file);
                    if (!validation.valid) {
                        throw new Error(validation.error);
                    }
                    
                    // Prepare upload data
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', this.config.uploadPreset || 'sri_lanka_unsigned');
                    
                    // Add folder if specified
                    if (options.folder) {
                        formData.append('folder', options.folder);
                    }
                    
                    // Add tags if specified
                    if (options.tags && Array.isArray(options.tags)) {
                        formData.append('tags', options.tags.join(','));
                    }
                    
                    // Add context if specified (but properly formatted)
                    if (options.context) {
                        // Ensure context is properly formatted
                        if (typeof options.context === 'string') {
                            // Context should be key=value pairs separated by |
                            formData.append('context', options.context);
                        }
                    }
                    
                    // Add transformation for automatic optimization
                    formData.append('transformation', JSON.stringify([
                        {
                            quality: 'auto:good',
                            fetch_format: 'auto'
                        }
                    ]));
                    
                    const url = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`;
                    
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Cloudinary response error:', errorText);
                        
                        // Parse error message
                        let errorMessage = 'Upload failed';
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.error?.message || errorMessage;
                        } catch (e) {
                            errorMessage = `Upload failed: ${response.statusText}`;
                        }
                        
                        throw new Error(errorMessage);
                    }
                    
                    const result = await response.json();
                    console.log('Upload successful:', result);
                    
                    return result;
                    
                } catch (error) {
                    console.error('Upload error:', error);
                    
                    // Provide helpful error messages
                    if (error.message.includes('preset')) {
                        error.message = 'Upload preset error. Please check Cloudinary settings.';
                    } else if (error.message.includes('cloud_name')) {
                        error.message = 'Invalid cloud name. Please check configuration.';
                    } else if (error.message.includes('unauthorized')) {
                        error.message = 'Unauthorized. Please check your Cloudinary credentials.';
                    }
                    
                    throw error;
                }
            }
            
            validateFile(file) {
                // Check file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    return {
                        valid: false,
                        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
                    };
                }
                
                // Check file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    return {
                        valid: false,
                        error: `File too large. Maximum size: 10MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
                    };
                }
                
                return { valid: true };
            }
        };
    }
    
    // Fix the upload button handler with better error display
    function enhanceUploadErrorHandling() {
        const originalHandler = window.uploadPictureEnhanced;
        if (typeof originalHandler === 'function') {
            window.uploadPictureEnhanced = async function(file, metadata) {
                try {
                    // Add loading state
                    showDetailedProgress('Preparing upload...', 'info');
                    
                    // Validate before upload
                    if (file.size > 10 * 1024 * 1024) {
                        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`);
                    }
                    
                    showDetailedProgress('Uploading to cloud storage...', 'info');
                    
                    const result = await originalHandler.call(this, file, metadata);
                    
                    if (result.success) {
                        showDetailedProgress('Upload successful!', 'success');
                    }
                    
                    return result;
                    
                } catch (error) {
                    console.error('Upload failed:', error);
                    
                    // Show detailed error
                    let errorMessage = error.message;
                    if (errorMessage.includes('Bad Request')) {
                        errorMessage = 'Upload failed: Please check your Cloudinary configuration and ensure the upload preset "sri_lanka_unsigned" exists and is unsigned.';
                    }
                    
                    showDetailedProgress(errorMessage, 'error', 5000);
                    
                    // Still save locally as fallback
                    return {
                        success: false,
                        error: errorMessage,
                        fallbackToLocal: true
                    };
                }
            };
        }
    }
    
    // Enhanced progress display
    function showDetailedProgress(message, type = 'info', duration = 3000) {
        let progressEl = document.getElementById('uploadProgress');
        if (!progressEl) {
            progressEl = document.createElement('div');
            progressEl.id = 'uploadProgress';
            document.body.appendChild(progressEl);
        }
        
        progressEl.className = `upload-progress ${type}`;
        progressEl.innerHTML = `
            <div class="progress-icon">
                ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
                  type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                  '<i class="fas fa-info-circle"></i>'}
            </div>
            <div class="progress-message">${message}</div>
            ${type === 'error' ? '<div class="progress-hint">Images will be stored locally instead.</div>' : ''}
        `;
        
        progressEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Auto hide
        setTimeout(() => {
            if (progressEl) {
                progressEl.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => progressEl.remove(), 300);
            }
        }, duration);
    }
    
    // Add CSS for animations
    function addAnimationStyles() {
        if (!document.getElementById('uploadFixStyles')) {
            const style = document.createElement('style');
            style.id = 'uploadFixStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .upload-progress {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .progress-icon {
                    font-size: 20px;
                }
                
                .progress-message {
                    flex: 1;
                    font-weight: 500;
                }
                
                .progress-hint {
                    font-size: 12px;
                    opacity: 0.9;
                    margin-top: 5px;
                }
                
                /* Fix for image optimization tips */
                .upload-modal .optimization-tips {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                
                .optimization-tips h4 {
                    margin: 0 0 10px 0;
                    color: #856404;
                    font-size: 16px;
                }
                
                .optimization-tips ul {
                    margin: 0;
                    padding-left: 20px;
                }
                
                .optimization-tips li {
                    color: #856404;
                    margin-bottom: 5px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Verify Cloudinary configuration
    function verifyCloudinaryConfig() {
        if (window.cloudStorage && window.cloudStorage.config) {
            console.log('Cloudinary configuration:', {
                cloudName: window.cloudStorage.config.cloudName,
                uploadPreset: window.cloudStorage.config.uploadPreset || 'Not set - will use sri_lanka_unsigned'
            });
            
            // Check if preset is set, if not, set it
            if (!window.cloudStorage.config.uploadPreset) {
                window.cloudStorage.config.uploadPreset = 'sri_lanka_unsigned';
                console.log('Set default upload preset: sri_lanka_unsigned');
            }
        }
    }
    
    // Initialize fixes
    function initialize() {
        console.log('Initializing Cloudinary Upload Fix...');
        
        // Add styles
        addAnimationStyles();
        
        // Fix CloudStorageManager
        setTimeout(() => {
            fixCloudinaryUpload();
            enhanceUploadErrorHandling();
            verifyCloudinaryConfig();
        }, 1000);
        
        console.log('Cloudinary Upload Fix initialized');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})(); 