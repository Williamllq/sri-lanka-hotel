/**
 * Gallery Sync Fix - Fixes data synchronization between admin and user interfaces
 */

(function() {
    'use strict';
    
    console.log('Gallery Sync Fix loading...');
    
    // Fix data structure mapping
    function mapAdminPictureToGallery(adminPic) {
        // Extract metadata from admin picture
        const metadata = adminPic.metadata || {};
        
        return {
            id: adminPic.id,
            url: adminPic.imageUrl || adminPic.url || adminPic.src,
            title: adminPic.title || metadata.title || adminPic.name || 'Untitled Image',
            description: adminPic.description || metadata.description || '',
            category: adminPic.category || metadata.category || 'scenery',
            uploadDate: adminPic.uploadDate || new Date().toISOString(),
            cloudUrl: adminPic.cloudUrl || null,
            publicId: adminPic.publicId || null
        };
    }
    
    // Sync admin pictures to gallery
    function syncAdminToGallery() {
        try {
            const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
            console.log(`Syncing ${adminPictures.length} admin pictures to gallery...`);
            
            // Map admin pictures to gallery format
            const galleryImages = adminPictures.map(mapAdminPictureToGallery);
            
            // Save to localStorage
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            
            // Trigger storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'galleryImages',
                newValue: JSON.stringify(galleryImages),
                url: window.location.href
            }));
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('galleryUpdate', {
                detail: { images: galleryImages }
            }));
            
            console.log('Gallery sync completed successfully');
            
            // Reload gallery if on user page
            if (typeof window.initGallery === 'function') {
                window.initGallery();
            }
            
            // Update gallery display if on admin page
            if (typeof window.displayPictures === 'function') {
                window.displayPictures();
            }
            
        } catch (error) {
            console.error('Error syncing gallery:', error);
        }
    }
    
    // Fix sample pictures with proper data
    function fixSamplePictures() {
        const samplePictures = [
            {
                id: 'sample_pic_1',
                imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Scenic Beach',
                description: 'Beautiful beach in Sri Lanka with golden sands',
                category: 'beach',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_pic_2',
                imageUrl: 'https://images.unsplash.com/photo-1588598198321-9735fd58f0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Temple of the Tooth',
                description: 'Sacred Buddhist temple in Kandy',
                category: 'culture',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_pic_3',
                imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Wild Elephants',
                description: 'Elephants in their natural habitat at Yala National Park',
                category: 'wildlife',
                uploadDate: new Date().toISOString()
            },
            {
                id: 'sample_pic_4',
                imageUrl: 'https://images.unsplash.com/photo-1566296440929-898ae2baae1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Tea Plantations',
                description: 'Lush green tea plantations in the hill country',
                category: 'scenery',
                uploadDate: new Date().toISOString()
            }
        ];
        
        // Check if we need to fix sample pictures
        const currentPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
        const needsFix = currentPictures.some(pic => 
            pic.imageUrl && (pic.imageUrl.startsWith('/images/') || !pic.title || !pic.category)
        );
        
        if (needsFix || currentPictures.length === 0) {
            console.log('Fixing sample pictures...');
            localStorage.setItem('adminPictures', JSON.stringify(samplePictures));
            syncAdminToGallery();
        }
    }
    
    // Monitor storage changes
    function setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminPictures') {
                console.log('Admin pictures changed, syncing to gallery...');
                setTimeout(syncAdminToGallery, 100);
            }
        });
    }
    
    // Fix upload functionality
    function enhanceUploadFunctionality() {
        // Override the upload function to ensure proper data structure
        const originalUpload = window.uploadPicture;
        if (typeof originalUpload === 'function') {
            window.uploadPicture = async function(imageData) {
                // Ensure imageData has all required fields
                if (!imageData.title) imageData.title = 'New Image';
                if (!imageData.category) imageData.category = 'scenery';
                if (!imageData.description) imageData.description = '';
                
                // Call original upload
                const result = await originalUpload.call(this, imageData);
                
                // Sync after upload
                if (result && result.success) {
                    setTimeout(syncAdminToGallery, 500);
                }
                
                return result;
            };
        }
    }
    
    // Initialize fixes
    function initialize() {
        // Fix sample pictures if needed
        fixSamplePictures();
        
        // Setup storage listener
        setupStorageListener();
        
        // Enhance upload functionality
        enhanceUploadFunctionality();
        
        // Initial sync
        syncAdminToGallery();
        
        // Check if critical fix is loaded, if so, don't set up interval to prevent conflicts
        if (!window.adminCriticalFixLoaded) {
            // Re-sync periodically (every 30 seconds) to catch any missed updates
            window.gallerySyncInterval = setInterval(syncAdminToGallery, 30000);
        } else {
            console.log('Admin Critical Fix is loaded, gallery sync interval disabled to prevent conflicts');
        }
        
        console.log('Gallery Sync Fix initialized successfully');
    }
    
    // Wait for DOM and other scripts to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
    // Expose sync function globally for debugging
    window.GallerySyncFix = {
        sync: syncAdminToGallery,
        fixSamples: fixSamplePictures
    };
    
})(); 