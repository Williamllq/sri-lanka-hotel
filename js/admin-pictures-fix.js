/**
 * Admin Pictures Fix
 * Ensures the pictures management interface works properly
 * even when Cloudinary is not configured
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Fix loaded');
    
    // Fix loading message that gets stuck
    setTimeout(() => {
        const pictureGrid = document.getElementById('pictureGrid');
        if (pictureGrid && pictureGrid.innerHTML.includes('Loading images...')) {
            console.log('Fixing stuck loading message');
            
            // Check if Cloudinary is configured
            const cloudinaryConfigured = window.cloudinaryIntegration && window.cloudinaryIntegration.isConfigured();
            
            if (!cloudinaryConfigured) {
                // Show setup instructions instead of loading message
                pictureGrid.innerHTML = `
                    <div class="cloudinary-setup-notice" style="
                        grid-column: 1/-1;
                        padding: 40px;
                        text-align: center;
                        background: #f8f9fa;
                        border-radius: 10px;
                        border: 2px dashed #dee2e6;
                    ">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #6c757d; margin-bottom: 20px; display: block;"></i>
                        <h3 style="color: #495057; margin-bottom: 15px;">Cloud Storage Configuration Required</h3>
                        <p style="color: #6c757d; margin-bottom: 20px; max-width: 600px; margin-left: auto; margin-right: auto;">
                            To upload images on Netlify, you need to configure Cloudinary cloud storage. 
                            This is a free service that allows you to store and manage images in the cloud.
                        </p>
                        <button class="btn btn-primary" onclick="showCloudinarySetupGuide()" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 30px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                            <i class="fas fa-cog"></i> Setup Cloud Storage
                        </button>
                        
                        <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: left;">
                            <h4 style="color: #495057; margin-bottom: 15px;">Quick Setup Steps:</h4>
                            <ol style="color: #6c757d; padding-left: 20px;">
                                <li>Create a free Cloudinary account</li>
                                <li>Get your Cloud Name from the dashboard</li>
                                <li>Create an unsigned upload preset</li>
                                <li>Update the configuration in <code>js/cloudinary-integration.js</code></li>
                            </ol>
                            <p style="color: #6c757d; margin-top: 15px;">
                                <strong>Note:</strong> Until configured, images are stored locally in your browser 
                                and won't be visible on other devices.
                            </p>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <a href="document/cloudinary-setup.md" target="_blank" class="btn btn-outline-secondary" style="
                                color: #6c757d;
                                border: 1px solid #6c757d;
                                padding: 8px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                display: inline-block;
                            ">
                                <i class="fas fa-book"></i> View Full Documentation
                            </a>
                        </div>
                    </div>
                `;
            } else {
                // Load pictures normally
                if (typeof loadAndDisplayPictures === 'function') {
                    loadAndDisplayPictures();
                } else {
                    pictureGrid.innerHTML = `
                        <div class="no-pictures-message">
                            <i class="fas fa-image"></i>
                            <p>No pictures found. Start uploading!</p>
                        </div>
                    `;
                }
            }
        }
    }, 2000);
    
    // Ensure the setup guide function is available globally
    if (!window.showCloudinarySetupGuide) {
        window.showCloudinarySetupGuide = function() {
            const modal = document.createElement('div');
            modal.className = 'admin-modal';
            modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;';
            modal.innerHTML = `
                <div class="admin-modal-content" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div class="admin-modal-header" style="padding: 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: #495057;"><i class="fas fa-cloud"></i> Cloudinary Setup Guide</h3>
                        <button class="close-modal" onclick="this.closest('.admin-modal').remove()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #6c757d;">&times;</button>
                    </div>
                    <div class="admin-modal-body" style="padding: 30px;">
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h4 style="margin: 0 0 10px 0; color: #2e7d32;">Why Cloudinary?</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #388e3c;">
                                <li>Free 25GB storage</li>
                                <li>Works on Netlify without backend</li>
                                <li>Automatic image optimization</li>
                                <li>Global CDN for fast loading</li>
                            </ul>
                        </div>
                        
                        <h4 style="color: #495057; margin-bottom: 20px;">Step 1: Create Account</h4>
                        <ol style="color: #6c757d; margin-bottom: 30px;">
                            <li>Go to <a href="https://cloudinary.com/users/register/free" target="_blank">cloudinary.com/register</a></li>
                            <li>Sign up for a free account</li>
                            <li>Verify your email</li>
                        </ol>
                        
                        <h4 style="color: #495057; margin-bottom: 20px;">Step 2: Get Cloud Name</h4>
                        <ol style="color: #6c757d; margin-bottom: 30px;">
                            <li>Log in to Cloudinary Dashboard</li>
                            <li>Find your Cloud Name at the top</li>
                            <li>Copy it (e.g., "dxyz123abc")</li>
                        </ol>
                        
                        <h4 style="color: #495057; margin-bottom: 20px;">Step 3: Create Upload Preset</h4>
                        <ol style="color: #6c757d; margin-bottom: 30px;">
                            <li>Go to Settings → Upload</li>
                            <li>Click "Add upload preset"</li>
                            <li>Set Signing Mode to <strong>Unsigned</strong></li>
                            <li>Name it (e.g., "sri-lanka-tourism")</li>
                            <li>Click Save</li>
                        </ol>
                        
                        <h4 style="color: #495057; margin-bottom: 20px;">Step 4: Update Configuration</h4>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: monospace; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0; color: #6c757d;">In <strong>js/cloudinary-integration.js</strong>:</p>
                            <code style="display: block; background: white; padding: 15px; border-radius: 4px; border: 1px solid #dee2e6;">
const CLOUDINARY_CONFIG = {<br>
&nbsp;&nbsp;cloudName: '<span style="color: #d73a49;">your-cloud-name</span>',<br>
&nbsp;&nbsp;uploadPreset: '<span style="color: #d73a49;">your-preset-name</span>',<br>
                            </code>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://cloudinary.com/users/register/free" target="_blank" class="btn btn-primary" style="
                                background: #007bff;
                                color: white;
                                text-decoration: none;
                                padding: 12px 30px;
                                border-radius: 5px;
                                display: inline-block;
                                font-size: 16px;
                            ">
                                Start Free Account →
                            </a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        };
    }
    
    // Fix upload button if Cloudinary not configured
    const uploadBtn = document.querySelector('[onclick*="showUploadModal"]');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            const cloudinaryConfigured = window.cloudinaryIntegration && window.cloudinaryIntegration.isConfigured();
            if (!cloudinaryConfigured) {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm('Cloud storage is not configured. Would you like to see the setup guide?')) {
                    showCloudinarySetupGuide();
                }
                return false;
            }
        });
    }
}); 