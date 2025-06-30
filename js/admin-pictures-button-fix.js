/**
 * Admin Pictures Button Fix - OPTIMIZED VERSION
 * Enhanced styling and visibility for edit and delete buttons
 * Performance optimized to prevent lag and conflicts
 * Version 2.0 - Handles overlay buttons and makes them always visible
 */

console.log('Admin Pictures Button Fix (Optimized v2) loaded');

// Global flag to prevent multiple initializations
if (window.adminButtonFixInitialized) {
    console.log('Admin button fix already initialized, skipping...');
} else {
    window.adminButtonFixInitialized = true;
    
    // Performance-optimized initialization
    initializeButtonFix();
}

function initializeButtonFix() {
    let enhancementTimeout;
    let observerCreated = false;
    
    // Debounced function to apply enhancements
    function applyButtonEnhancements() {
        if (enhancementTimeout) {
            clearTimeout(enhancementTimeout);
        }
        
        enhancementTimeout = setTimeout(() => {
            performButtonEnhancements();
        }, 100); // 100ms debounce
    }
    
    // Main enhancement function
    function performButtonEnhancements() {
        console.log('Applying optimized button enhancements v2...');
        
        // Add enhanced styles only once
        addOptimizedStyles();
        
        // Move buttons out of overlay and enhance them
        moveAndEnhanceButtons();
    }
    
    // Add styles only once to prevent conflicts
    function addOptimizedStyles() {
        if (document.getElementById('optimized-button-styles-v2')) {
            return; // Already added
        }
        
        const enhancedStyles = document.createElement('style');
        enhancedStyles.id = 'optimized-button-styles-v2';
        enhancedStyles.innerHTML = `
            /* OPTIMIZED Picture Action Buttons v2 */
            .picture-actions-bottom {
                padding: 8px !important;
                display: flex !important;
                justify-content: space-between !important;
                gap: 8px !important;
                background-color: #f8f9fa !important;
                border-top: 1px solid #e9ecef !important;
                margin-top: 8px !important;
            }
            
            .picture-actions-bottom button {
                flex: 1 !important;
                padding: 6px 10px !important;
                border: none !important;
                border-radius: 4px !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: background-color 0.2s ease, transform 0.1s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 4px !important;
                min-height: 32px !important;
                user-select: none !important;
            }
            
            .edit-picture, .action-btn.edit-btn {
                background-color: #007bff !important;
                color: white !important;
            }
            
            .delete-picture, .action-btn.delete-btn {
                background-color: #dc3545 !important;
                color: white !important;
            }
            
            .picture-actions-bottom button:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
            }
            
            .edit-picture:hover, .action-btn.edit-btn:hover {
                background-color: #0056b3 !important;
            }
            
            .delete-picture:hover, .action-btn.delete-btn:hover {
                background-color: #c82333 !important;
            }
            
            .picture-actions-bottom button:active {
                transform: translateY(0) !important;
                transition: none !important;
            }
            
            /* Hide overlay buttons since we're moving them */
            .picture-overlay {
                display: none !important;
            }
            
            /* Ensure buttons are always visible */
            .picture-actions-bottom button {
                opacity: 1 !important;
                visibility: visible !important;
                position: relative !important;
                z-index: 100 !important;
            }
            
            /* Loading state */
            .picture-actions-bottom button.loading {
                opacity: 0.7 !important;
                cursor: wait !important;
                pointer-events: none !important;
            }
            
            /* Picture card adjustments */
            .picture-card {
                display: flex !important;
                flex-direction: column !important;
            }
            
            .picture-info {
                flex-grow: 1 !important;
            }
        `;
        document.head.appendChild(enhancedStyles);
    }
    
    // Move buttons from overlay to bottom of card
    function moveAndEnhanceButtons() {
        const pictureCards = document.querySelectorAll('.picture-card');
        
        pictureCards.forEach(card => {
            // Skip if already processed
            if (card.hasAttribute('data-buttons-moved')) {
                return;
            }
            
            // Find buttons in overlay
            const overlayEditBtn = card.querySelector('.picture-overlay .edit-btn');
            const overlayDeleteBtn = card.querySelector('.picture-overlay .delete-btn');
            
            // Check if buttons already exist at bottom
            let bottomActions = card.querySelector('.picture-actions-bottom');
            
            if (!bottomActions && (overlayEditBtn || overlayDeleteBtn)) {
                // Create new actions container at bottom
                bottomActions = document.createElement('div');
                bottomActions.className = 'picture-actions-bottom';
                
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-picture action-btn edit-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                editBtn.setAttribute('data-id', card.getAttribute('data-picture-id') || 'unknown');
                editBtn.setAttribute('title', 'Edit Picture');
                
                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-picture action-btn delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
                deleteBtn.setAttribute('data-id', card.getAttribute('data-picture-id') || 'unknown');
                deleteBtn.setAttribute('title', 'Delete Picture');
                
                // Add buttons to container
                bottomActions.appendChild(editBtn);
                bottomActions.appendChild(deleteBtn);
                
                // Append to card (at the bottom)
                card.appendChild(bottomActions);
                
                // Set up click handlers
                setupButtonHandlers(editBtn, deleteBtn, card);
            }
            
            // Mark as processed
            card.setAttribute('data-buttons-moved', 'true');
        });
        
        console.log(`Moved and enhanced buttons for ${pictureCards.length} picture cards`);
    }
    
    // Set up button click handlers
    function setupButtonHandlers(editBtn, deleteBtn, card) {
        // Edit button handler
        editBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Immediate visual feedback
            this.classList.add('loading');
            
            const pictureId = this.getAttribute('data-id');
            console.log('Edit picture:', pictureId);
            
            // Quick response
            setTimeout(() => {
                this.classList.remove('loading');
                
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                } else if (typeof window.AdminEnhancedFix?.editPicture === 'function') {
                    window.AdminEnhancedFix.editPicture(pictureId);
                } else {
                    alert('Edit functionality coming soon!');
                }
            }, 50);
        };
        
        // Delete button handler
        deleteBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Immediate visual feedback
            this.classList.add('loading');
            
            const pictureId = this.getAttribute('data-id');
            
            // Quick response
            setTimeout(() => {
                this.classList.remove('loading');
                
                if (confirm('Delete this picture?')) {
                    console.log('Delete picture:', pictureId);
                    
                    if (typeof deletePicture === 'function') {
                        deletePicture(pictureId);
                    } else if (typeof window.AdminEnhancedFix?.deletePicture === 'function') {
                        window.AdminEnhancedFix.deletePicture(pictureId);
                    } else {
                        // Quick delete implementation
                        card.style.transition = 'opacity 0.2s ease';
                        card.style.opacity = '0';
                        
                        setTimeout(() => {
                            card.remove();
                            
                            // Update localStorage efficiently
                            try {
                                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                                const updatedPictures = adminPictures.filter(p => p.id !== pictureId);
                                localStorage.setItem('adminPictures', JSON.stringify(updatedPictures));
                                console.log('Picture deleted successfully');
                            } catch (error) {
                                console.error('Error updating localStorage:', error);
                            }
                        }, 200);
                    }
                }
            }, 50);
        };
    }
    
    // Apply enhancements immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyButtonEnhancements);
    } else {
        applyButtonEnhancements();
    }
    
    // Optimized DOM observer - only create once
    if (!observerCreated && window.MutationObserver) {
        observerCreated = true;
        
        const observer = new MutationObserver(function(mutations) {
            let needsUpdate = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && // Element node
                            (node.classList?.contains('picture-card') || 
                             node.querySelector?.('.picture-card'))) {
                            needsUpdate = true;
                        }
                    });
                }
            });
            
            if (needsUpdate) {
                applyButtonEnhancements();
            }
        });
        
        // Start observing with minimal impact
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Optimized DOM observer created');
    }
    
    // Expose function for manual triggering
    window.applyOptimizedButtonEnhancements = applyButtonEnhancements;
}

console.log('Admin Pictures Button Fix optimization v2 complete'); 