/**
 * Admin Pictures Button Fix
 * Enhanced styling and visibility for edit and delete buttons
 * This script observes DOM changes to ensure buttons are always properly styled
 */

console.log('Admin Pictures Button Fix loaded');

// Function to apply enhanced button styles
function applyButtonEnhancements() {
    console.log('Applying button enhancements...');
    
    // Add enhanced styles if not already added
    if (!document.getElementById('button-enhancement-styles')) {
        const enhancedStyles = document.createElement('style');
        enhancedStyles.id = 'button-enhancement-styles';
        enhancedStyles.innerHTML = `
            /* Enhanced Picture Action Buttons */
            .picture-actions {
                padding: 10px !important;
                display: flex !important;
                justify-content: space-between !important;
                gap: 10px !important;
                background-color: #f8f9fa !important;
                border-top: 1px solid #e9ecef !important;
                margin-top: 10px !important;
            }
            
            .picture-actions button {
                flex: 1 !important;
                padding: 8px 12px !important;
                border: none !important;
                border-radius: 5px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 5px !important;
                min-height: 40px !important;
            }
            
            .edit-picture {
                background-color: #007bff !important;
                color: white !important;
            }
            
            .delete-picture {
                background-color: #dc3545 !important;
                color: white !important;
            }
            
            .picture-actions button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            }
            
            .edit-picture:hover {
                background-color: #0056b3 !important;
            }
            
            .delete-picture:hover {
                background-color: #c82333 !important;
            }
            
            /* Ensure buttons are visible */
            .picture-actions button {
                opacity: 1 !important;
                visibility: visible !important;
                position: relative !important;
                z-index: 1000 !important;
            }
        `;
        document.head.appendChild(enhancedStyles);
    }
    
    // Update button content and functionality
    const editButtons = document.querySelectorAll('.edit-picture');
    const deleteButtons = document.querySelectorAll('.delete-picture');
    
    editButtons.forEach(btn => {
        if (!btn.hasAttribute('data-enhanced')) {
            btn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            btn.setAttribute('data-enhanced', 'true');
            
            // Add click handler
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const pictureId = this.getAttribute('data-id');
                console.log('Edit picture:', pictureId);
                // Call existing edit function if available
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                } else {
                    alert('Edit functionality coming soon!');
                }
            });
        }
    });
    
    deleteButtons.forEach(btn => {
        if (!btn.hasAttribute('data-enhanced')) {
            btn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            btn.setAttribute('data-enhanced', 'true');
            
            // Add click handler
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const pictureId = this.getAttribute('data-id');
                
                if (confirm('Are you sure you want to delete this picture?')) {
                    console.log('Delete picture:', pictureId);
                    // Call existing delete function if available
                    if (typeof deletePicture === 'function') {
                        deletePicture(pictureId);
                    } else {
                        // Simple delete implementation
                        const pictureCard = this.closest('.picture-card');
                        if (pictureCard) {
                            pictureCard.style.animation = 'fadeOut 0.3s ease-out';
                            setTimeout(() => {
                                pictureCard.remove();
                                // Update localStorage
                                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                                const updatedPictures = adminPictures.filter(p => p.id !== pictureId);
                                localStorage.setItem('adminPictures', JSON.stringify(updatedPictures));
                                alert('Picture deleted successfully!');
                            }, 300);
                        }
                    }
                }
            });
        }
    });
    
    console.log(`Enhanced ${editButtons.length} edit buttons and ${deleteButtons.length} delete buttons`);
}

// Apply enhancements immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyButtonEnhancements);
} else {
    applyButtonEnhancements();
}

// Watch for DOM changes to apply enhancements to newly added buttons
const observer = new MutationObserver(function(mutations) {
    let needsEnhancement = false;
    
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && node.classList.contains('picture-card') || 
                        node.querySelector && node.querySelector('.picture-card')) {
                        needsEnhancement = true;
                    }
                }
            });
        }
    });
    
    if (needsEnhancement) {
        setTimeout(applyButtonEnhancements, 100);
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Add fadeOut animation
const fadeOutStyles = document.createElement('style');
fadeOutStyles.innerHTML = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
    }
`;
document.head.appendChild(fadeOutStyles);

// Expose function globally for manual triggering
window.applyButtonEnhancements = applyButtonEnhancements; 