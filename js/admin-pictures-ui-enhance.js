/**
 * Admin Pictures UI Enhancement
 * Improves the visual design and user experience of the pictures management interface
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures UI Enhancement loaded');
    
    // Enhance the Cloudinary configuration warning
    enhanceCloudinaryWarning();
    
    // Add helpful tooltips
    addHelpfulTooltips();
    
    // Improve the upload button visibility
    enhanceUploadButton();
    
    // Add quick action buttons
    addQuickActions();
});

/**
 * Enhance the Cloudinary configuration warning with better styling
 */
function enhanceCloudinaryWarning() {
    const warnings = document.querySelectorAll('.cloudinary-alert, .cloudinary-setup-notice');
    warnings.forEach(warning => {
        // Add animation
        warning.style.animation = 'fadeIn 0.5s ease-in';
        
        // Add hover effect
        warning.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        warning.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add CSS for animation
    if (!document.getElementById('ui-enhance-styles')) {
        const style = document.createElement('style');
        style.id = 'ui-enhance-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .cloudinary-setup-notice button {
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,123,255,0.2);
            }
            
            .cloudinary-setup-notice button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,123,255,0.3);
            }
            
            .tooltip {
                position: absolute;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .tooltip.show {
                opacity: 1;
            }
            
            .quick-action-bar {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 999;
                animation: slideIn 0.5s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .quick-action-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #007bff;
                color: white;
                border: none;
                box-shadow: 0 2px 10px rgba(0,123,255,0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .quick-action-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0,123,255,0.4);
            }
            
            .quick-action-btn.setup {
                background: #28a745;
            }
            
            .quick-action-btn.help {
                background: #17a2b8;
            }
            
            .status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                margin-left: 10px;
            }
            
            .status-indicator.cloud-active {
                background: #d4edda;
                color: #155724;
            }
            
            .status-indicator.local-storage {
                background: #fff3cd;
                color: #856404;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Add helpful tooltips to important elements
 */
function addHelpfulTooltips() {
    const tooltips = [
        {
            selector: '#uploadPictureBtn, button:has-text("Upload Picture")',
            text: 'Click to upload images. Configure Cloudinary for cloud storage.'
        },
        {
            selector: '.cloud-storage-status',
            text: 'Cloud storage status. Green = configured, Yellow = using local storage'
        },
        {
            selector: 'button:has-text("Migrate to Cloud")',
            text: 'Move all local images to cloud storage (requires configuration)'
        }
    ];
    
    tooltips.forEach(({ selector, text }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            let tooltip = null;
            
            element.addEventListener('mouseenter', function(e) {
                tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = text;
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                
                setTimeout(() => tooltip.classList.add('show'), 10);
            });
            
            element.addEventListener('mouseleave', function() {
                if (tooltip) {
                    tooltip.classList.remove('show');
                    setTimeout(() => {
                        if (tooltip && tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 300);
                }
            });
        });
    });
}

/**
 * Enhance the upload button visibility and appeal
 */
function enhanceUploadButton() {
    const uploadBtn = document.querySelector('#uploadPictureBtn, button:has-text("Upload Picture")');
    if (uploadBtn) {
        // Add pulsing effect if Cloudinary not configured
        const cloudinaryConfigured = window.cloudinaryIntegration && window.cloudinaryIntegration.isConfigured();
        if (!cloudinaryConfigured) {
            uploadBtn.style.animation = 'pulse 2s infinite';
            
            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0,123,255,0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(0,123,255,0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,123,255,0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add icon if not present
        if (!uploadBtn.querySelector('i')) {
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> ' + uploadBtn.textContent;
        }
    }
}

/**
 * Add quick action buttons for easy access
 */
function addQuickActions() {
    // Don't add if already exists
    if (document.querySelector('.quick-action-bar')) return;
    
    const quickActionBar = document.createElement('div');
    quickActionBar.className = 'quick-action-bar';
    
    // Check if on pictures section
    const isPicturesSection = window.location.hash === '#pictures';
    if (!isPicturesSection) return;
    
    const cloudinaryConfigured = window.cloudinaryIntegration && window.cloudinaryIntegration.isConfigured();
    
    // Setup button (if not configured)
    if (!cloudinaryConfigured) {
        const setupBtn = document.createElement('button');
        setupBtn.className = 'quick-action-btn setup';
        setupBtn.innerHTML = '<i class="fas fa-cog"></i>';
        setupBtn.title = 'Setup Cloud Storage';
        setupBtn.onclick = function() {
            if (typeof showCloudinarySetupGuide === 'function') {
                showCloudinarySetupGuide();
            } else {
                window.location.href = 'document/cloudinary-setup.md';
            }
        };
        quickActionBar.appendChild(setupBtn);
    }
    
    // Help button
    const helpBtn = document.createElement('button');
    helpBtn.className = 'quick-action-btn help';
    helpBtn.innerHTML = '<i class="fas fa-question"></i>';
    helpBtn.title = 'Help & Documentation';
    helpBtn.onclick = function() {
        window.open('document/cloudinary-setup.md', '_blank');
    };
    quickActionBar.appendChild(helpBtn);
    
    // Upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'quick-action-btn';
    uploadBtn.innerHTML = '<i class="fas fa-plus"></i>';
    uploadBtn.title = 'Upload Image';
    uploadBtn.onclick = function() {
        const mainUploadBtn = document.querySelector('#uploadPictureBtn, button:has-text("Upload Picture")');
        if (mainUploadBtn) mainUploadBtn.click();
    };
    quickActionBar.appendChild(uploadBtn);
    
    document.body.appendChild(quickActionBar);
}

/**
 * Add status indicator to the header
 */
function addStatusIndicator() {
    const header = document.querySelector('#picturesSection .admin-header, #picturesSection h2');
    if (!header || header.querySelector('.status-indicator')) return;
    
    const cloudinaryConfigured = window.cloudinaryIntegration && window.cloudinaryIntegration.isConfigured();
    
    const indicator = document.createElement('span');
    indicator.className = 'status-indicator ' + (cloudinaryConfigured ? 'cloud-active' : 'local-storage');
    indicator.innerHTML = cloudinaryConfigured ? 
        '<i class="fas fa-cloud"></i> Cloud Storage Active' : 
        '<i class="fas fa-hdd"></i> Local Storage Mode';
    
    header.appendChild(indicator);
}

// Initialize status indicator when pictures section is shown
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#pictures') {
        setTimeout(addStatusIndicator, 100);
    }
});

// Initial check
if (window.location.hash === '#pictures') {
    setTimeout(addStatusIndicator, 100);
} 