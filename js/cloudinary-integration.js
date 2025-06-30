/**
 * Cloudinary Integration for Sri Lanka Tourism Website
 * Handles image uploads to Cloudinary cloud storage
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for free Cloudinary account at https://cloudinary.com
 * 2. Get your Cloud Name, API Key, and Upload Preset
 * 3. Configure the settings below
 */

// Cloudinary Configuration
// IMPORTANT: Replace these with your actual Cloudinary credentials
const CLOUDINARY_CONFIG = {
    cloudName: 'dmpfjul1j', // 您的实际Cloud Name
    uploadPreset: 'sri_lanka_unsigned', // 您刚创建的preset
    apiKey: 'YOUR_API_KEY', // Optional: Only needed for signed uploads
    folder: 'sri-lanka-tourism', // Folder in Cloudinary to organize images
    maxFileSize: 10485760, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformations: {
        thumbnail: 'c_fill,w_400,h_300,q_auto,f_auto',
        medium: 'c_fill,w_800,h_600,q_auto,f_auto',
        large: 'c_limit,w_1200,h_900,q_auto,f_auto'
    }
};

// Check if Cloudinary is configured
function isCloudinaryConfigured() {
    return CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME' && 
           CLOUDINARY_CONFIG.uploadPreset !== 'YOUR_UPLOAD_PRESET';
}

// Show configuration alert
function showConfigurationAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'cloudinary-alert';
    alertDiv.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 20px; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0;">⚠️ Cloudinary Configuration Required</h4>
            <p>To enable image uploads on Netlify, please configure Cloudinary:</p>
            <ol>
                <li>Sign up for a free account at <a href="https://cloudinary.com" target="_blank">cloudinary.com</a></li>
                <li>Create an unsigned upload preset in Settings → Upload</li>
                <li>Update the configuration in <code>js/cloudinary-integration.js</code></li>
            </ol>
            <p><strong>Current Status:</strong> Using local storage (limited functionality)</p>
        </div>
    `;
    
    const pictureSection = document.getElementById('picturesSection');
    if (pictureSection) {
        pictureSection.insertBefore(alertDiv, pictureSection.firstChild);
    }
}

// Initialize Cloudinary
function initCloudinary() {
    if (!isCloudinaryConfigured()) {
        console.warn('Cloudinary not configured. Please update configuration.');
        showConfigurationAlert();
        return false;
    }
    
    console.log('Cloudinary configured successfully');
    
    // Add Cloudinary status indicator
    const statusDiv = document.createElement('div');
    statusDiv.className = 'cloudinary-status';
    statusDiv.innerHTML = `
        <span style="color: green;">
            <i class="fas fa-cloud"></i> Cloud Storage Active
        </span>
    `;
    
    const uploadBtn = document.querySelector('[onclick="showUploadModal()"]');
    if (uploadBtn) {
        uploadBtn.parentElement.appendChild(statusDiv);
    }
    
    return true;
}

// Upload image to Cloudinary
async function uploadToCloudinary(file, options = {}) {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary not configured');
    }
    
    // Validate file
    const fileSize = file.size;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    if (fileSize > CLOUDINARY_CONFIG.maxFileSize) {
        throw new Error(`File size exceeds limit of ${CLOUDINARY_CONFIG.maxFileSize / 1048576}MB`);
    }
    
    if (!CLOUDINARY_CONFIG.allowedFormats.includes(fileExtension)) {
        throw new Error(`File format not allowed. Allowed formats: ${CLOUDINARY_CONFIG.allowedFormats.join(', ')}`);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
    
    // Add tags if provided
    if (options.tags) {
        formData.append('tags', options.tags.join(','));
    }
    
    // Add context (metadata)
    if (options.context) {
        formData.append('context', `alt=${options.context.alt || file.name}|caption=${options.context.caption || ''}`);
    }
    
    try {
        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }
        
        const result = await response.json();
        
        // Generate transformation URLs
        const urls = {
            original: result.secure_url,
            thumbnail: result.secure_url.replace('/upload/', `/upload/${CLOUDINARY_CONFIG.transformations.thumbnail}/`),
            medium: result.secure_url.replace('/upload/', `/upload/${CLOUDINARY_CONFIG.transformations.medium}/`),
            large: result.secure_url.replace('/upload/', `/upload/${CLOUDINARY_CONFIG.transformations.large}/`)
        };
        
        return {
            success: true,
            data: {
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
                urls: urls,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
                created_at: result.created_at
            }
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Delete image from Cloudinary (requires server-side implementation)
async function deleteFromCloudinary(publicId) {
    console.warn('Delete operation requires server-side implementation for security');
    // For now, just mark as deleted in local storage
    return { success: true, message: 'Marked for deletion' };
}

// Override the existing processImageFile function
if (typeof window.processImageFile === 'function') {
    const originalProcessImageFile = window.processImageFile;
    
    window.processImageFile = async function(file, callback) {
        // Check if Cloudinary is configured
        if (isCloudinaryConfigured()) {
            try {
                console.log('Using Cloudinary for image upload...');
                
                // Show upload progress
                const uploadModal = document.getElementById('uploadModal');
                const progressDiv = document.createElement('div');
                progressDiv.className = 'cloudinary-upload-progress';
                progressDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-cloud-upload-alt fa-3x" style="color: #007bff;"></i>
                        <p>Uploading to cloud storage...</p>
                        <div class="progress" style="height: 20px; margin-top: 10px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 75%"></div>
                        </div>
                    </div>
                `;
                
                if (uploadModal) {
                    const modalBody = uploadModal.querySelector('.admin-modal-content');
                    if (modalBody) {
                        modalBody.appendChild(progressDiv);
                    }
                }
                
                // Get form data
                const pictureName = document.getElementById('pictureName')?.value || file.name;
                const category = document.getElementById('uploadCategory')?.value || 'general';
                const description = document.getElementById('pictureDescription')?.value || '';
                
                // Upload to Cloudinary
                const result = await uploadToCloudinary(file, {
                    folder: `${CLOUDINARY_CONFIG.folder}/${category}`,
                    tags: [category, 'admin-upload', new Date().toISOString().split('T')[0]],
                    context: {
                        alt: pictureName,
                        caption: description
                    }
                });
                
                // Remove progress indicator
                if (progressDiv && progressDiv.parentNode) {
                    progressDiv.parentNode.removeChild(progressDiv);
                }
                
                if (result.success) {
                    console.log('Cloudinary upload successful:', result.data);
                    
                    // Call the original callback with Cloudinary URLs
                    callback({
                        imageUrl: result.data.urls.large,
                        thumbnailUrl: result.data.urls.thumbnail,
                        originalUrl: result.data.urls.original,
                        cloudinaryData: result.data,
                        originalWidth: result.data.width,
                        originalHeight: result.data.height
                    });
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Cloudinary upload failed:', error);
                alert('Cloud upload failed: ' + error.message + '\nFalling back to local storage.');
                
                // Fall back to original method
                originalProcessImageFile(file, callback);
            }
        } else {
            // Use original local storage method
            originalProcessImageFile(file, callback);
        }
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on admin pages
    if (window.location.pathname.includes('admin')) {
        initCloudinary();
        
        // Add setup instructions button
        const adminHeader = document.querySelector('.admin-header');
        if (adminHeader && !isCloudinaryConfigured()) {
            const setupBtn = document.createElement('button');
            setupBtn.className = 'btn btn-info btn-sm';
            setupBtn.innerHTML = '<i class="fas fa-cog"></i> Setup Cloud Storage';
            setupBtn.onclick = showCloudinarySetupGuide;
            setupBtn.style.marginLeft = '10px';
            adminHeader.appendChild(setupBtn);
        }
    }
});

// Show Cloudinary setup guide
function showCloudinarySetupGuide() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="admin-modal-content" style="max-width: 800px;">
            <div class="admin-modal-header">
                <h3>Cloudinary Setup Guide</h3>
                <button class="close-modal" onclick="this.closest('.admin-modal').remove()">&times;</button>
            </div>
            <div class="admin-modal-body" style="padding: 20px;">
                <h4>Step 1: Create Cloudinary Account</h4>
                <ol>
                    <li>Go to <a href="https://cloudinary.com/users/register/free" target="_blank">cloudinary.com/register</a></li>
                    <li>Sign up for a free account (includes 25GB storage)</li>
                    <li>Verify your email address</li>
                </ol>
                
                <h4>Step 2: Get Your Cloud Name</h4>
                <ol>
                    <li>Log in to your Cloudinary dashboard</li>
                    <li>Your Cloud Name is displayed at the top of the dashboard</li>
                    <li>Copy it (e.g., "your-cloud-name")</li>
                </ol>
                
                <h4>Step 3: Create an Upload Preset</h4>
                <ol>
                    <li>Go to Settings → Upload</li>
                    <li>Click "Add upload preset"</li>
                    <li>Set Signing Mode to "Unsigned"</li>
                    <li>Set a preset name (e.g., "sri-lanka-tourism")</li>
                    <li>Under "Upload Control", you can set:
                        <ul>
                            <li>Max file size: 10MB</li>
                            <li>Allowed formats: jpg, png, gif, webp</li>
                        </ul>
                    </li>
                    <li>Click "Save"</li>
                </ol>
                
                <h4>Step 4: Update Configuration</h4>
                <ol>
                    <li>Open <code>js/cloudinary-integration.js</code></li>
                    <li>Replace <code>YOUR_CLOUD_NAME</code> with your actual cloud name</li>
                    <li>Replace <code>YOUR_UPLOAD_PRESET</code> with your preset name</li>
                    <li>Save the file and refresh the page</li>
                </ol>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0;">✅ Benefits of Cloud Storage</h4>
                    <ul style="margin: 0;">
                        <li>Images are stored permanently in the cloud</li>
                        <li>Works across all devices and browsers</li>
                        <li>Automatic image optimization</li>
                        <li>CDN delivery for fast loading</li>
                        <li>No storage limits on your server</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Export for use in other modules
window.cloudinaryIntegration = {
    isConfigured: isCloudinaryConfigured,
    upload: uploadToCloudinary,
    delete: deleteFromCloudinary,
    showSetupGuide: showCloudinarySetupGuide,
    config: CLOUDINARY_CONFIG
}; 