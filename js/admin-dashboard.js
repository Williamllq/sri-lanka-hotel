/**
 * Admin Dashboard JavaScript
 * 
 * This script handles all the functionality for the admin dashboard including:
 * - Authentication verification
 * - Sidebar navigation and responsiveness
 * - Dashboard stats and charts
 * - Image management (upload, delete, organize)
 * - Carousel management
 * - Hotel recommendations management
 * - Settings management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('adminToken')) {
        localStorage.setItem('adminToken', 'temp_dev_token');
        localStorage.setItem('adminLastLogin', new Date().toISOString());
        console.log('Created temporary admin token for development');
    }

    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminLayout = document.querySelector('.admin-layout');
    const lastLoginTime = document.getElementById('lastLoginTime');
    const logoutButton = document.getElementById('logoutButton');
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
    const adminSections = document.querySelectorAll('.admin-section');

    if (lastLoginTime) {
        const lastLogin = localStorage.getItem('adminLastLogin');
        if (lastLogin) {
            lastLoginTime.textContent = 'Last login: ' + new Date(lastLogin).toLocaleString();
        }
    }

    // Function to initialize a specific section
    function initializeSection(sectionId) {
        console.log('Initializing section:', sectionId);
        switch (sectionId) {
            case 'dashboardSection':
                if (document.getElementById('dashboardSection')) {
                    initCharts();
                    initDashboardStats();
                }
                break;
            case 'contentSection':
                if (document.getElementById('contentSection')) initContentManagement();
                break;
            case 'picturesSection': // Assuming pictures have their own top-level section ID for init
                if (document.getElementById('picturesSection')) initPictureManagement();
                break;
            case 'carouselSection': // Assuming carousel has its own top-level section ID for init
                 if (document.getElementById('carouselSection')) initCarouselManagement();
                 break;
            case 'hotelsSection':
                if (document.getElementById('hotelsSection')) initHotelManagement();
                break;
            case 'ordersSection':
                if (document.getElementById('ordersSection')) initOrderManagement();
                break;
            case 'transportSettingsSection':
                if (document.getElementById('transportSettingsSection')) initTransportSettings();
                break;
            case 'settingsSection':
                if (document.getElementById('settingsSection')) initSettings();
                break;
            default:
                console.warn('No specific initialization logic for section:', sectionId);
        }
        // General modal handling might still be needed globally or re-triggered.
        // For now, let's assume it's safe to call once or its internal guards are sufficient.
        // initModalHandling(); // Consider if this needs to be here or is fine as a one-time call
    }

    // Initialize general UI elements (sidebar, logout, modals)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => adminLayout.classList.toggle('sidebar-collapsed'));
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminLastLogin');
                window.location.href = 'admin-login.html';
            }
        });
    }
    initModalHandling(); // Initialize modal handling once globally

    // Handle sidebar navigation
    sidebarMenuItems.forEach(item => {
        const dataSectionAttribute = item.getAttribute('data-section');
        if (!dataSectionAttribute) return;

        const sectionId = dataSectionAttribute.endsWith('Section') ? dataSectionAttribute : dataSectionAttribute + 'Section';

        item.addEventListener('click', function(event) {
            if (this.classList.contains('logout')) return;
            event.preventDefault();

            sidebarMenuItems.forEach(menuItem => menuItem.classList.remove('active'));
            adminSections.forEach(section => section.classList.remove('active'));

            this.classList.add('active');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                initializeSection(sectionId); // Initialize the section when it's made active
            } else {
                console.error('Target section not found:', sectionId);
            }

            if (window.innerWidth < 992) {
                adminLayout.classList.add('sidebar-collapsed');
            }
        });
    });

    // Activate default section (dashboard) and initialize it
    let defaultSectionActivated = false;
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        const sectionFromHash = document.querySelector(`.sidebar-menu li[data-section='${currentHash}']`);
        if (sectionFromHash) {
            sectionFromHash.click(); // Simulate click to activate and initialize
            defaultSectionActivated = true;
        }
    }

    if (!defaultSectionActivated) {
        const defaultSidebarItem = document.querySelector('.sidebar-menu li[data-section="dashboard"]');
        if (defaultSidebarItem) {
            defaultSidebarItem.classList.add('active');
            const dashboardSection = document.getElementById('dashboardSection');
            if (dashboardSection) {
                dashboardSection.classList.add('active');
                initializeSection('dashboardSection'); // Initialize dashboard by default
            }
        }
    }
});

// Ensure all modals are properly handled
function initModalHandling() {
    console.log('Initializing modal handling');
    // Get all modals
    const modals = document.querySelectorAll('.admin-modal');
    
    // Modal open buttons mapping - corrected to target the actual button IDs
    const modalOpenButtonMap = {
        'uploadModal': 'uploadPictureBtn',
        'carouselModal': 'addToCarouselBtn',
        'hotelModal': 'addHotelBtn',
        'articleModal': 'addArticleBtn',
        'videoModal': 'addVideoBtn',
        'linkModal': 'addLinkBtn'
    };
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.admin-btn.secondary.cancel-upload');
    
    // Hide all modals initially
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Set up open button handlers
    for (const [modalId, buttonId] of Object.entries(modalOpenButtonMap)) {
        const button = document.getElementById(buttonId);
        const modal = document.getElementById(modalId);
        
        if (button && modal) {
            console.log(`Setting up click handler for ${buttonId} to open ${modalId}`);
            button.addEventListener('click', function() {
                console.log(`Opening modal: ${modalId}`);
                modal.style.display = 'flex';
                modal.classList.add('active');
            });
        } else {
            console.warn(`Button ${buttonId} or modal ${modalId} not found in the DOM`);
        }
    }
    
    // Set up close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log(`Closing modal: ${modal.id}`);
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
    
    // Set up cancel button handlers
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log(`Canceling and closing modal: ${modal.id}`);
                modal.style.display = 'none';
                modal.classList.remove('active');
                
                // If in a form, reset the form
                const form = this.closest('form');
                if (form) {
                    form.reset();
                    
                    // Reset any preview elements
                    const previewElement = form.querySelector('.file-preview');
                    if (previewElement) {
                        previewElement.innerHTML = `
                            <div class="preview-placeholder">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Image preview will appear here</p>
                            </div>
                        `;
                    }
                }
            }
        });
    });
    
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                console.log(`Clicking outside closed modal: ${modal.id}`);
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
}

// Dashboard statistics initialization
function initDashboardStats() {
    // Check if the dashboard section and stat elements are present
    if (!document.getElementById('dashboardSection') || 
        !document.getElementById('totalVisits') || 
        !document.getElementById('totalBookings') ||
        !document.getElementById('avgRating') ||
        !document.getElementById('popularRoutes') ||
        !document.getElementById('feedbackList')) {
        console.log('Dashboard section or stat elements not found, skipping initDashboardStats.');
        return;
    }
    // Mock data - in a real app, this would come from an API
    document.getElementById('totalVisits').textContent = '1,245';
    document.getElementById('totalBookings').textContent = '32';
    document.getElementById('avgRating').textContent = '4.8';
    
    // Mock popular routes
    const routes = [
        'Colombo → Kandy (23%)',
        'Galle → Mirissa (18%)',
        'Colombo → Sigiriya (15%)',
        'Kandy → Ella (12%)'
    ];
    
    const routesContainer = document.getElementById('popularRoutes');
    routes.forEach(route => {
        const item = document.createElement('div');
        item.textContent = route;
        routesContainer.appendChild(item);
    });
    
    // Mock feedback
    const feedback = [
        { name: 'John D.', message: 'The hotel recommendations were perfect!', date: '2 days ago' },
        { name: 'Sarah T.', message: 'Loved the travel guides and itinerary suggestions.', date: '5 days ago' },
        { name: 'Michael R.', message: 'The website was easy to navigate and very informative.', date: '1 week ago' }
    ];
    
    const feedbackContainer = document.getElementById('feedbackList');
    feedback.forEach(item => {
        const feedbackItem = document.createElement('div');
        feedbackItem.classList.add('feedback-item');
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-name">${item.name}</span>
                <span class="feedback-date">${item.date}</span>
            </div>
            <div class="feedback-content">${item.message}</div>
        `;
        feedbackContainer.appendChild(feedbackItem);
    });
}

// Picture Management functionality
function initPictureManagement() {
    // Check if the picture management section or relevant elements are present
    if (!document.getElementById('picturesSection') && !document.getElementById('pictureGrid')) {
        console.log('Picture management section or grid not found, skipping initPictureManagement.');
        return;
    }
    console.log('Initializing picture management from admin-dashboard.js');
    
    const pictureGrid = document.getElementById('pictureGrid');
    const pictureCategory = document.getElementById('pictureCategory');
    const uploadPictureForm = document.getElementById('uploadPictureForm');
    
    // Check if upload form is already being handled by admin-pictures.js
    if (uploadPictureForm && uploadPictureForm.getAttribute('data-handler') === 'admin-pictures') {
        console.log('Picture upload form is already being handled by admin-pictures.js');
        // Skip form setup but continue with displaying pictures if needed
    } else if (uploadPictureForm) {
        const pictureFile = document.getElementById('pictureFile');
        const filePreview = document.getElementById('filePreview');
        
        console.log('Setting up picture upload form from admin-dashboard.js');
        
        // Handle picture file selection for preview
        if (pictureFile) {
            pictureFile.addEventListener('change', function(e) {
                if (!filePreview) {
                    console.error('File preview element not found');
                    return;
                }
                
                const file = e.target.files[0];
                if (file) {
                const reader = new FileReader();
                    reader.onload = function(event) {
                        filePreview.innerHTML = `<img src="${event.target.result}" alt="Selected Image Preview">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    filePreview.innerHTML = '';
                }
            });
        } else {
            console.error('Picture file input element not found');
        }
        
        // Handle picture upload form submission
        uploadPictureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pictureName = document.getElementById('pictureName');
            const uploadCategory = document.getElementById('uploadCategory');
            const pictureDescription = document.getElementById('pictureDescription');
            
            if (!pictureName || !uploadCategory || !pictureFile) {
                console.error('One or more form elements not found');
                return;
            }
                
            const file = pictureFile.files[0];
            if (!file) {
                alert('Please select an image file');
                return;
            }
                
            const reader = new FileReader();
            reader.onload = function(event) {
                // In a real application, this would upload to a server
                // For now, we'll just store it in localStorage
                const imageUrl = event.target.result;
                
                // Compress image before storing (optional)
                compressImage(imageUrl).then(compressedUrl => {
                    // Add new picture
                    const newPicture = {
                        id: Date.now(), // Use timestamp as unique ID
                        name: pictureName.value,
                        category: uploadCategory.value,
                        description: pictureDescription ? pictureDescription.value : '',
                        url: compressedUrl
                    };
                    
                    pictures.push(newPicture);
                    savePictures();
                    
                    // Reset form
                    uploadPictureForm.reset();
                    if (filePreview) {
                        filePreview.innerHTML = '';
                    }
                    
                    // Close modal
                    const uploadModal = document.getElementById('uploadModal');
                    if (uploadModal) {
                        uploadModal.style.display = 'none';
                        uploadModal.classList.remove('active');
                    }
                    
                    // Refresh picture grid
                    displayPictures(uploadCategory.value);
                    
                    alert('Picture uploaded successfully!');
                });
            };
            reader.readAsDataURL(file);
        });
    } else {
        console.log('Upload picture form not found - may be handled by another script');
    }
    
    // Compress image function
    async function compressImage(dataURL, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = dataURL;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions if image is wider than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw image on canvas with new dimensions
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data URL
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    }
    
    if (!pictureGrid) {
        console.error('Picture grid element not found in the DOM');
        return;
    }
    
    // Get pictures from localStorage or use mock data if none exists
    let storedPictures = localStorage.getItem('sitePictures');
    let pictures = [];
    
    try {
        pictures = storedPictures ? JSON.parse(storedPictures) : [
            { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya.jpg', description: 'Ancient rock fortress' },
            { id: 2, name: 'Yala Leopard', category: 'wildlife', url: 'images/yala-leopard.jpg', description: 'Rare leopard sighting in Yala National Park' },
            { id: 3, name: 'Temple of the Sacred Tooth', category: 'culture', url: 'images/temple-tooth.jpg', description: 'Buddhist temple in Kandy' },
            { id: 4, name: 'Local Cuisine', category: 'food', url: 'images/sri-lankan-food.jpg', description: 'Authentic Sri Lankan dishes' },
            { id: 5, name: 'Unawatuna Beach', category: 'beach', url: 'images/unawatuna-beach.jpg', description: 'Beautiful beach scene' }
        ];
        console.log("Loaded pictures from localStorage:", pictures.length);
    } catch (error) {
        console.error("Error loading pictures from localStorage:", error);
        pictures = [
            { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya.jpg', description: 'Ancient rock fortress' },
            { id: 2, name: 'Yala Leopard', category: 'wildlife', url: 'images/yala-leopard.jpg', description: 'Rare leopard sighting in Yala National Park' },
            { id: 3, name: 'Temple of the Sacred Tooth', category: 'culture', url: 'images/temple-tooth.jpg', description: 'Buddhist temple in Kandy' },
            { id: 4, name: 'Local Cuisine', category: 'food', url: 'images/sri-lankan-food.jpg', description: 'Authentic Sri Lankan dishes' },
            { id: 5, name: 'Unawatuna Beach', category: 'beach', url: 'images/unawatuna-beach.jpg', description: 'Beautiful beach scene' }
        ];
    }
    
    // Save pictures to localStorage
    function savePictures() {
        localStorage.setItem('sitePictures', JSON.stringify(pictures));
        console.log("Saved pictures to localStorage:", pictures.length);
    }
    
    // Initially save default pictures if none exist
    if (!storedPictures) {
        savePictures();
    }
    
    // Handle picture category filtering
    if (pictureCategory) {
        pictureCategory.addEventListener('change', function() {
            displayPictures(this.value);
        });
    } else {
        console.error('Picture category dropdown not found');
    }
    
    // Delete picture
    function deletePicture(id) {
        if (confirm('Are you sure you want to delete this picture?')) {
            pictures = pictures.filter(pic => pic.id !== id);
            savePictures();
            displayPictures(pictureCategory ? pictureCategory.value : 'all');
        }
    }
    
    // Display pictures in grid
    function displayPictures(category = 'all') {
        if (!pictureGrid) {
            console.error('Picture grid not found for display');
            return;
        }
        
        // Let admin-pictures.js handle the picture grid if it's available
        if (typeof loadAndDisplayPictures === 'function') {
            console.log('Using loadAndDisplayPictures from admin-pictures.js');
            loadAndDisplayPictures(category);
            return;
        }
        
        console.log('Displaying pictures with category:', category);
        
        // Clear the grid
        pictureGrid.innerHTML = '';
        
        // Filter pictures by category
        const filteredPictures = category === 'all' 
            ? pictures 
            : pictures.filter(pic => pic.category === category);
        
        // If no pictures, show a message
        if (filteredPictures.length === 0) {
            pictureGrid.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle"></i> No pictures found in this category. Upload some!
                </div>
            `;
            return;
        }
        
        // Add each picture to the grid
        filteredPictures.forEach(picture => {
            const pictureCard = document.createElement('div');
            pictureCard.className = 'picture-card';
            pictureCard.innerHTML = `
                <div class="picture-image">
                    <img src="${picture.url}" alt="${picture.name}">
                </div>
                <div class="picture-info">
                    <h3>${picture.name}</h3>
                    <div class="picture-category">
                        <span class="${picture.category}">${picture.category}</span>
                    </div>
                    <p class="picture-description">${picture.description || ''}</p>
                </div>
                <div class="picture-actions">
                    <button class="edit-picture" data-id="${picture.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-picture" data-id="${picture.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            pictureGrid.appendChild(pictureCard);
            
            // Add event listeners to buttons
            pictureCard.querySelector('.delete-picture').addEventListener('click', () => {
                deletePicture(picture.id);
            });
            
            pictureCard.querySelector('.edit-picture').addEventListener('click', () => {
                // Edit functionality (not implemented)
                alert('Edit functionality not implemented yet');
            });
        });
    }
    
    // Initialize picture display
    if (pictureGrid) {
        // Check if this function should handle the display
        // or if admin-pictures.js will do it
        if (typeof loadAndDisplayPictures !== 'function') {
            console.log('Displaying pictures from admin-dashboard.js');
            displayPictures('all');
        } else {
            console.log('Picture display will be handled by admin-pictures.js');
        }
    }
}

// Carousel Management functionality
function initCarouselManagement() {
    // Check if the carousel management section or relevant elements are present
    if (!document.getElementById('carouselSection') && !document.getElementById('carouselImagesList')) {
        console.log('Carousel management section or list not found, skipping initCarouselManagement.');
        return;
    }
    const addToCarouselBtn = document.getElementById('addToCarouselBtn');
    const carouselModal = document.getElementById('carouselModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const availablePicturesList = document.getElementById('availablePicturesList');
    const carouselImagesList = document.getElementById('carouselImagesList');
    const selectPictureForm = document.getElementById('selectPictureForm');
    const saveCarouselOrderBtn = document.getElementById('saveCarouselOrderBtn');
    
    // Get carousel images from localStorage or use default data if none exists
    let storedCarouselImages = localStorage.getItem('siteCarouselImages');
    let mockCarouselImages = storedCarouselImages ? JSON.parse(storedCarouselImages) : [
        { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya-rock.jpg' },
        { id: 4, name: 'Sri Lankan Elephant', category: 'wildlife', url: 'images/elephant.jpg' },
        { id: 5, name: 'Train to Ella', category: 'transport', url: 'images/train-ella.jpg' }
    ];
    
    // Save carousel images to localStorage whenever they change
    function saveCarouselImages() {
        localStorage.setItem('siteCarouselImages', JSON.stringify(mockCarouselImages));
        console.log('Carousel images saved:', mockCarouselImages);
    }
    
    // Open carousel modal
    addToCarouselBtn.addEventListener('click', function() {
        // Get all available pictures from localStorage
        let allPictures = [];
        const storedPictures = localStorage.getItem('sitePictures');
        
        if (storedPictures) {
            allPictures = JSON.parse(storedPictures);
        } else {
            // Fallback to default pictures if none in localStorage
            allPictures = [
                { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya-rock.jpg' },
                { id: 2, name: 'Kandy Lake', category: 'scenery', url: 'images/kandy-lake.jpg' },
                { id: 3, name: 'Cinnamon Grand Hotel', category: 'hotel', url: 'images/cinnamon-grand.jpg' },
                { id: 4, name: 'Sri Lankan Elephant', category: 'wildlife', url: 'images/elephant.jpg' },
                { id: 5, name: 'Train to Ella', category: 'transport', url: 'images/train-ella.jpg' }
            ];
        }
        
        // Populate available images - show only images not already in carousel
        availablePicturesList.innerHTML = '';
        
        // Filter out images that are already in the carousel
        const carouselImageIds = mockCarouselImages.map(img => img.id);
        const availablePictures = allPictures.filter(pic => !carouselImageIds.includes(pic.id));
        
        if (availablePictures.length === 0) {
            availablePicturesList.innerHTML = '<p class="no-images-message">All images are already in the carousel. Upload more images to add them.</p>';
        } else {
            availablePictures.forEach(picture => {
                const pictureItem = document.createElement('div');
                pictureItem.classList.add('select-picture-item');
                pictureItem.setAttribute('data-id', picture.id);
                pictureItem.innerHTML = `
                    <img src="${picture.url}" alt="${picture.name}">
                    <div class="picture-name">${picture.name}</div>
                `;
                availablePicturesList.appendChild(pictureItem);
            });
            
            // Add click event to select images
            document.querySelectorAll('.select-picture-item').forEach(item => {
                item.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });
            });
        }
        
        carouselModal.style.display = 'block';
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            carouselModal.style.display = 'none';
        });
    });
    
    // Cancel button
    document.getElementById('cancelSelectBtn').addEventListener('click', function() {
        carouselModal.style.display = 'none';
    });
    
    // Confirm selection button
    document.getElementById('confirmSelectBtn').addEventListener('click', function() {
        const selectedItems = document.querySelectorAll('.select-picture-item.selected');
        let addedCount = 0;
        
        // Get all pictures from localStorage
        const storedPictures = localStorage.getItem('sitePictures');
        const allPictures = storedPictures ? JSON.parse(storedPictures) : [];
        
        selectedItems.forEach(item => {
            const pictureId = parseInt(item.getAttribute('data-id'));
            const pictureToAdd = allPictures.find(pic => pic.id === pictureId);
            
            if (pictureToAdd && !mockCarouselImages.some(img => img.id === pictureId)) {
                mockCarouselImages.push(pictureToAdd);
                addedCount++;
            }
        });
        
        // Save changes to localStorage
        saveCarouselImages();
        
        // Update carousel display
        displayCarouselImages();
        
        // Close modal
        carouselModal.style.display = 'none';
        
        // Show success message
        if (addedCount > 0) {
            alert(`${addedCount} image(s) added to carousel successfully!`);
        } else {
            alert('No new images were added to the carousel.');
        }
    });
    
    // Display carousel images
    function displayCarouselImages() {
        carouselImagesList.innerHTML = '';
        
        if (mockCarouselImages.length === 0) {
            carouselImagesList.innerHTML = '<p class="no-images-message">No images in the carousel. Click "Add Image to Carousel" to add images.</p>';
            return;
        }
        
        mockCarouselImages.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.classList.add('carousel-image-item');
            imageItem.setAttribute('data-id', image.id);
            imageItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}">
                <div class="image-details">
                    <span>${image.name}</span>
                </div>
                <div class="carousel-image-actions">
                    <button class="picture-action-btn remove-carousel-image" data-id="${image.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            carouselImagesList.appendChild(imageItem);
        });
        
        // Add remove event listeners
        document.querySelectorAll('.remove-carousel-image').forEach(btn => {
            btn.addEventListener('click', function() {
                const imageId = parseInt(this.getAttribute('data-id'));
                
                if (confirm('Remove this image from the carousel?')) {
                    mockCarouselImages = mockCarouselImages.filter(img => img.id !== imageId);
                    // Save changes to localStorage
                    saveCarouselImages();
                    displayCarouselImages();
                }
            });
        });
        
        // Initialize sortable for drag-and-drop reordering
        if (typeof Sortable !== 'undefined') {
            new Sortable(carouselImagesList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function() {
                    // Update the order of images in the mockCarouselImages array
                    const newOrder = Array.from(carouselImagesList.children)
                        .map(item => parseInt(item.getAttribute('data-id')));
                    
                    // Reorder the array based on the DOM order
                    mockCarouselImages = newOrder.map(id => 
                        mockCarouselImages.find(img => img.id === id)
                    ).filter(Boolean);
                }
            });
        }
    }
    
    // Save carousel order
    saveCarouselOrderBtn.addEventListener('click', function() {
        // Update the order of images based on the current DOM order
        const newOrder = Array.from(carouselImagesList.children)
            .map(item => parseInt(item.getAttribute('data-id')));
        
        // Reorder the array based on the DOM order
        mockCarouselImages = newOrder.map(id => 
            mockCarouselImages.find(img => img.id === id)
        ).filter(Boolean);
        
        // Save to localStorage
        saveCarouselImages();
        
        alert('Carousel order saved successfully!');
    });
    
    // Initial display
    displayCarouselImages();
}

// Initialize hotel management
function initHotelManagement() {
    // Check if the hotel management section is present
    if (!document.getElementById('hotelsSection')) {
        console.log('Hotels section not found, skipping initHotelManagement.');
        return;
    }
    console.log('Initializing hotel management - delegating to admin-hotels.js');
    
    // We'll let admin-hotels.js handle all the room management functionality
    
    // Make sure the hotelsSection is visible when clicking on the hotels tab
    const hotelsTab = document.querySelector('li[data-section="hotels"]');
    const hotelsSection = document.getElementById('hotelsSection');
    
    if (hotelsTab && hotelsSection) {
        console.log('Setting up hotels tab click handler');
        
        hotelsTab.addEventListener('click', function() {
            // Hide all sections
            const sections = document.querySelectorAll('.admin-section');
            sections.forEach(section => section.classList.remove('active'));
            
            // Show hotels section
            hotelsSection.classList.add('active');
            
            // Update active tab
            const tabs = document.querySelectorAll('.sidebar-menu li');
            tabs.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
        });
    } else {
        console.error('Hotels tab or section not found');
    }
}

// Order Management
function initOrderManagement() {
    // Check if the orders section is present
    if (!document.getElementById('ordersSection')) {
        console.log('Orders section not found, skipping initOrderManagement.');
        return;
    }

    // Clear all existing order data
    clearAllOrderData();
    
    // Set a flag to prevent demo data from being shown
    window.ordersManuallyCleared = true;
    
    console.log('Initializing order management...');
    
    // Debug localStorage content
    try {
        console.log('localStorage bookings content after clearing:', localStorage.getItem('bookings'));
        console.log('localStorage userBookings content:', localStorage.getItem('userBookings'));
    } catch (e) {
        console.error('Error accessing localStorage:', e);
    }
    
    // Get elements
    const ordersTableBody = document.getElementById('ordersTableBody');
    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderSearchBtn = document.getElementById('orderSearchBtn');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const orderTabs = document.querySelectorAll('[data-order-tab]');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    
    // Current filter
    let currentOrderFilter = 'all';
    
    // Load orders on initialization
    loadOrders();
    
    // Add event listeners
    if (orderSearchBtn) {
        orderSearchBtn.addEventListener('click', function() {
            loadOrders(orderSearchInput.value);
        });
    }
    
    if (orderSearchInput) {
        orderSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadOrders(orderSearchInput.value);
            }
        });
    }
    
    // Tab filtering
    orderTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            orderTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Set current filter and reload orders
            currentOrderFilter = this.getAttribute('data-order-tab');
            loadOrders(orderSearchInput.value);
        });
    });
    
    // Function to load orders
    function loadOrders(searchTerm = '') {
        console.log('Loading orders with filter:', currentOrderFilter, 'and search term:', searchTerm);
        
        // Clear table
        if (ordersTableBody) {
            ordersTableBody.innerHTML = '';
        }
        
        // Get orders from localStorage
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('bookings');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                console.log('Loaded orders from localStorage:', orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            return;
        }
        
        // If no orders, show empty state instead of demo data if we've manually cleared
        if (!orders || orders.length === 0) {
            if (window.ordersManuallyCleared) {
                console.log('No orders found and orders were manually cleared. Showing empty state.');
                if (noOrdersMessage) {
                    noOrdersMessage.style.display = 'flex';
                }
                if (ordersTableBody) {
                    ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
                }
                return;
            }
            
            // Only show demo data if not manually cleared
            const showDemoData = !window.ordersManuallyCleared; 
            
            if (showDemoData) {
                console.log('No orders found, creating demo data');
                orders = createDemoOrders();
            } else {
                if (noOrdersMessage) {
                    noOrdersMessage.style.display = 'flex';
                }
                if (ordersTableBody) {
                    ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
                }
                return;
            }
        }
        
        // Filter orders by status
        if (currentOrderFilter !== 'all') {
            orders = orders.filter(order => order.status === currentOrderFilter);
        }
        
        // Filter orders by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            orders = orders.filter(order => 
                (order.customerName && order.customerName.toLowerCase().includes(term)) ||
                (order.customerEmail && order.customerEmail.toLowerCase().includes(term)) ||
                (order.pickupLocation && order.pickupLocation.toLowerCase().includes(term)) ||
                (order.destination && order.destination.toLowerCase().includes(term))
            );
        }
        
        // Check if filtered orders exist
        if (orders.length === 0) {
            if (noOrdersMessage) {
                noOrdersMessage.style.display = 'flex';
            }
            if (ordersTableBody) {
                ordersTableBody.innerHTML = '<tr><td colspan="9" class="no-data">No matching orders found</td></tr>';
            }
            return;
        }
        
        // Hide no orders message
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'none';
        }
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.journeyDate || 0); // Fallback to journeyDate
            const dateB = new Date(b.timestamp || b.journeyDate || 0); // Fallback to journeyDate
            return dateB - dateA;
        });
        
        // Create table rows
        orders.forEach((order, index) => {
            // Create order ID if not exists
            const orderId = order.id || `ORD-${1000 + index}`;
            if (!order.id) {
                order.id = orderId;
                // Update in localStorage to persist the ID
                updateOrderInStorage(order);
            }
            
            // Determine order status if not exists
            const status = order.status || 'pending';
            if (!order.status) {
                order.status = status;
                // Update in localStorage
                updateOrderInStorage(order);
            }
            
            // Format date - Prefer timestamp, fallback to journeyDate
            let orderDateDisplay = 'N/A';
            if (order.timestamp) {
                orderDateDisplay = new Date(order.timestamp).toLocaleDateString();
            } else if (order.journeyDate) {
                orderDateDisplay = new Date(order.journeyDate).toLocaleDateString();
            }
            
            // Format amount
            const amount = order.totalFare ? `$${parseFloat(order.totalFare).toFixed(2)}` : 'N/A';
            
            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${orderId}</td>
                <td>${order.customerName || 'Anonymous Customer'}</td>
                <td>${orderDateDisplay}</td>
                <td>${order.pickupLocation || 'N/A'}</td>
                <td>${order.destination || 'N/A'}</td>
                <td>${amount}</td>
                <td><span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${orderId}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn" data-id="${orderId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            if (ordersTableBody) {
                ordersTableBody.appendChild(row);
            }
            
            // Add event listeners to buttons
            const viewBtn = row.querySelector('.view-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            if (viewBtn) {
                viewBtn.addEventListener('click', function() {
                    viewOrderDetails(this.getAttribute('data-id'));
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    deleteOrder(this.getAttribute('data-id'));
                });
            }
        });
    }
    
    // Function to create demo orders for testing
    function createDemoOrders() {
        const demoOrders = [
            {
                id: 'ORD-1001',
                serviceType: 'Transport',
                journeyDate: '2023-12-15',
                journeyTime: '09:30',
                passengerCount: '2',
                pickupLocation: 'Colombo',
                destination: 'Kandy',
                specialRequirements: 'Need child seat',
                vehicleType: 'sedan',
                distance: 115.5,
                totalFare: 89.50,
                depositAmount: 26.85,
                customerName: 'John Smith',
                customerEmail: 'john.smith@example.com',
                customerPhone: '+1 123-456-7890',
                customerNationality: 'USA',
                status: 'confirmed',
                timestamp: '2023-12-10T08:30:00Z',
                lastUpdated: '2023-12-10T10:15:00Z'
            },
            {
                id: 'ORD-1002',
                serviceType: 'Transport',
                journeyDate: '2023-12-18',
                journeyTime: '14:00',
                passengerCount: '4',
                pickupLocation: 'Galle',
                destination: 'Mirissa',
                specialRequirements: 'Extra luggage space',
                vehicleType: 'suv',
                distance: 45.8,
                totalFare: 65.75,
                depositAmount: 19.73,
                customerName: 'Emma Johnson',
                customerEmail: 'emma.j@example.com',
                customerPhone: '+44 7700 900123',
                customerNationality: 'UK',
                status: 'pending',
                timestamp: '2023-12-11T15:20:00Z',
                lastUpdated: '2023-12-11T15:20:00Z'
            },
            {
                id: 'ORD-1003',
                serviceType: 'Transport',
                journeyDate: '2023-12-12',
                journeyTime: '10:00',
                passengerCount: '6',
                pickupLocation: 'Negombo',
                destination: 'Sigiriya',
                specialRequirements: '',
                vehicleType: 'van',
                distance: 158.3,
                totalFare: 175.25,
                depositAmount: 52.58,
                customerName: 'David Chen',
                customerEmail: 'david.c@example.com',
                customerPhone: '+61 4123 456789',
                customerNationality: 'Australia',
                status: 'completed',
                timestamp: '2023-12-08T09:45:00Z',
                lastUpdated: '2023-12-12T16:30:00Z'
            },
            {
                id: 'ORD-1004',
                serviceType: 'Transport',
                journeyDate: '2023-12-20',
                journeyTime: '16:30',
                passengerCount: '2',
                pickupLocation: 'Colombo Airport',
                destination: 'Bentota',
                specialRequirements: 'Airport pickup',
                vehicleType: 'luxury',
                distance: 87.6,
                totalFare: 120.00,
                depositAmount: 36.00,
                customerName: 'Sophie Martin',
                customerEmail: 'sophie.m@example.com',
                customerPhone: '+33 612345678',
                customerNationality: 'France',
                status: 'cancelled',
                timestamp: '2023-12-05T14:10:00Z',
                lastUpdated: '2023-12-06T11:25:00Z'
            },
            {
                id: 'ORD-1005',
                serviceType: 'Transport',
                journeyDate: '2023-12-22',
                journeyTime: '08:00',
                passengerCount: '3',
                pickupLocation: 'Ella',
                destination: 'Nuwara Eliya',
                specialRequirements: 'Stops at tea plantations',
                vehicleType: 'suv',
                distance: 64.2,
                totalFare: 78.50,
                depositAmount: 23.55,
                customerName: 'Miguel Rodriguez',
                customerEmail: 'miguel.r@example.com',
                customerPhone: '+34 612345678',
                customerNationality: 'Spain',
                status: 'confirmed',
                timestamp: '2023-12-12T18:30:00Z',
                lastUpdated: '2023-12-13T09:15:00Z'
            }
        ];
        
        return demoOrders;
    }
    
    // Function to view order details
    function viewOrderDetails(orderId) {
        console.log('Viewing order details for:', orderId);
        
        // Get orders from localStorage
        let orders = [];
        let order = null;
        
        try {
            const storedOrders = localStorage.getItem('bookings');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                // Find the specific order
                order = orders.find(o => o.id === orderId);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
        
        // If not found in localStorage, check in demo orders
        if (!order) {
            const demoOrders = createDemoOrders();
            order = demoOrders.find(o => o.id === orderId);
        }
        
        // If still not found, show error
        if (!order) {
            alert('Order not found');
            return;
        }
        
        // Get order details content element
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        if (!orderDetailsContent) return;
        
        // Format date
        const orderDate = order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A';
        const journeyDate = order.journeyDate ? new Date(order.journeyDate).toLocaleDateString() : 'N/A';
        const journeyTime = order.journeyTime || 'N/A';
        
        // Create HTML content for order details
        orderDetailsContent.innerHTML = `
            <div class="order-details">
                <div class="order-header">
                    <h4>Order ${order.id}</h4>
                    <span class="status-badge ${order.status || 'pending'}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span>
                </div>
                
                <div class="order-info-grid">
                    <div class="info-group">
                        <label>Order Date:</label>
                        <span>${orderDate}</span>
                    </div>
                    <div class="info-group">
                        <label>Journey Date:</label>
                        <span>${journeyDate} ${journeyTime}</span>
                    </div>
                    <div class="info-group">
                        <label>Service Type:</label>
                        <span>${order.serviceType || 'Transport'}</span>
                    </div>
                    <div class="info-group">
                        <label>Vehicle Type:</label>
                        <span>${order.vehicleType ? order.vehicleType.charAt(0).toUpperCase() + order.vehicleType.slice(1) : 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Passengers:</label>
                        <span>${order.passengerCount || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>From:</label>
                        <span>${order.pickupLocation || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>To:</label>
                        <span>${order.destination || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Distance:</label>
                        <span>${order.distance ? order.distance.toFixed(1) + ' km' : 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Total Fare:</label>
                        <span>${order.totalFare ? '$' + parseFloat(order.totalFare).toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Deposit Amount:</label>
                        <span>${order.depositAmount ? '$' + parseFloat(order.depositAmount).toFixed(2) : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="customer-info">
                    <h4>Customer Information</h4>
                    <div class="info-group">
                        <label>Name:</label>
                        <span>${order.customerName || 'Anonymous Customer'}</span>
                    </div>
                    <div class="info-group">
                        <label>Email:</label>
                        <span>${order.customerEmail || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Phone:</label>
                        <span>${order.customerPhone || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="special-requirements">
                    <h4>Special Requirements</h4>
                    <p>${order.specialRequirements || 'None specified'}</p>
                </div>
            </div>
        `;
        
        // Show modal
        if (orderDetailsModal) {
            orderDetailsModal.style.display = 'flex';
            orderDetailsModal.classList.add('active');
            
            // Add event listeners to status buttons
            const statusButtons = orderDetailsModal.querySelectorAll('.order-status-buttons button');
            statusButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const newStatus = this.getAttribute('data-status');
                    updateOrderStatus(orderId, newStatus);
                });
            });
            
            // Add event listener to close button
            const closeDetailsBtn = orderDetailsModal.querySelector('.close-details-btn');
            if (closeDetailsBtn) {
                closeDetailsBtn.addEventListener('click', function() {
                    orderDetailsModal.style.display = 'none';
                    orderDetailsModal.classList.remove('active');
                });
            }
        }
    }
    
    // Function to update order status
    function updateOrderStatus(orderId, newStatus) {
        console.log('Updating order status:', orderId, newStatus);
        
        // Get orders from localStorage
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('bookings');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            return;
        }
        
        // Find and update the specific order
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            alert('Order not found');
            return;
        }
        
        // Update status
        orders[orderIndex].status = newStatus;
        
        // Save to localStorage
        try {
            localStorage.setItem('bookings', JSON.stringify(orders));
            
            // Reload orders and close modal
            loadOrders();
            if (orderDetailsModal) {
                orderDetailsModal.style.display = 'none';
                orderDetailsModal.classList.remove('active');
            }
        } catch (error) {
            console.error('Error saving order status:', error);
            alert('Failed to update order status');
        }
    }
    
    // Function to delete an order
    function deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            console.log('Order deletion cancelled by user for ID:', orderId);
            return;
        }
        
        console.log('Attempting to delete order with ID:', orderId, typeof orderId);
        
        // Get orders from localStorage
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('bookings');
            console.log('Raw bookings from localStorage:', storedOrders);
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                console.log('Parsed orders from localStorage (before deletion):', JSON.parse(JSON.stringify(orders)));
            } else {
                console.warn('No bookings found in localStorage to delete from.');
                return;
            }
        } catch (error) {
            console.error('Error loading orders for deletion:', error);
            alert('Error loading orders. Deletion failed.');
            return;
        }
        
        const initialOrderCount = orders.length;
        // Remove the specific order
        // Ensure consistent type for comparison if order.id might be number
        const filteredOrders = orders.filter(o => String(o.id) !== String(orderId));
        const finalOrderCount = filteredOrders.length;

        console.log(`Initial order count: ${initialOrderCount}, Orders after filtering for ID ${orderId}: ${finalOrderCount}`);
        
        if (initialOrderCount === finalOrderCount) {
            console.warn(`Order ID ${orderId} not found in the list. No order deleted.`);
            const isDemoOrder = orders.some(o => o.id === orderId && o.serviceType); 
            if (isDemoOrder) {
                 console.log(`Order ID ${orderId} might be a demo order. Ensure deletion logic handles this or data is persistent.`);
            }
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('bookings', JSON.stringify(filteredOrders));
            console.log('Orders saved to localStorage after attempting deletion:', JSON.parse(JSON.stringify(filteredOrders)));
            
            // Attempt to remove the row directly from the DOM for immediate visual feedback
            if (initialOrderCount > finalOrderCount) {
                const rowToDelete = ordersTableBody.querySelector(`button.delete-btn[data-id="${orderId}"]`)?.closest('tr');
                if (rowToDelete) {
                    rowToDelete.remove();
                    console.log('Successfully removed row from DOM for order ID:', orderId);
                } else {
                    console.warn('Could not find row in DOM to remove for order ID:', orderId);
                }
            }

            // Reload orders table to ensure full consistency, respecting current search and filter
            const currentSearchTerm = orderSearchInput ? orderSearchInput.value : '';
            console.log('Reloading orders table after deletion attempt with search:', currentSearchTerm, 'and filter:', currentOrderFilter);
            loadOrders(currentSearchTerm); // Pass current search term
            console.log('Orders table reload initiated.');
            
            if (initialOrderCount > finalOrderCount) {
                alert('Order deleted successfully!');
            } else if (initialOrderCount === finalOrderCount && !document.querySelector(`button.delete-btn[data-id="${orderId}"]`)){
                 // If the item wasn't in the data, and also not in the DOM, it might have been a ghost.
                 console.log(`Order ID ${orderId} was not present or already removed from DOM and data.`);
            } else if (initialOrderCount === finalOrderCount){
                alert('Order not found in data. Table refreshed.');
            }

        } catch (error) {
            console.error('Error saving orders after deletion or reloading table:', error);
            alert('Failed to delete order or refresh table.');
        }
    }
    
    // Helper function to update an order in localStorage
    function updateOrderInStorage(updatedOrder) {
        // Get orders from localStorage
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('bookings');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            return;
        }
        
        // Find and update the specific order
        const orderIndex = orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex !== -1) {
            orders[orderIndex] = updatedOrder;
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('bookings', JSON.stringify(orders));
        } catch (error) {
            console.error('Error updating order in storage:', error);
        }
    }
}

// Function to clear all existing order data
function clearAllOrderData() {
    try {
        // Remove all orders related data from localStorage
        localStorage.removeItem('bookings');
        localStorage.removeItem('userBookings');
        localStorage.removeItem('transportBookings');
        localStorage.removeItem('bookingsArchive');
        
        // Also check for any other potential keys in localStorage that might store order data
        const keysToCheck = [];
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.toLowerCase().includes('order') || 
                key.toLowerCase().includes('book') ||
                key.toLowerCase().includes('reservation')
            )) {
                keysToCheck.push(key);
            }
        }
        
        // Remove any other order-related keys found in localStorage
        keysToCheck.forEach(key => {
            console.log('Removing potentially order-related localStorage key:', key);
            localStorage.removeItem(key);
        });
        
        // Also clear from sessionStorage
        sessionStorage.removeItem('bookings');
        sessionStorage.removeItem('userBookings');
        sessionStorage.removeItem('transportBookings');
        sessionStorage.removeItem('bookingsArchive');
        
        // Check for any other potential keys in sessionStorage
        const sessionKeysToCheck = [];
        for(let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.toLowerCase().includes('order') || 
                key.toLowerCase().includes('book') ||
                key.toLowerCase().includes('reservation')
            )) {
                sessionKeysToCheck.push(key);
            }
        }
        
        // Remove any other order-related keys found in sessionStorage
        sessionKeysToCheck.forEach(key => {
            console.log('Removing potentially order-related sessionStorage key:', key);
            sessionStorage.removeItem(key);
        });
        
        console.log('Successfully cleared all order data from localStorage and sessionStorage');
        
        // Check if ordersTableBody exists and clear it directly for immediate visual feedback
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) {
            // Clear the table body completely - this is more direct than waiting for loadOrders
            ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            
            // Also try to find and remove any rows containing order data
            const allTrs = document.querySelectorAll('#ordersTableBody tr');
            allTrs.forEach(tr => {
                // Skip the "no orders" message row
                if (!tr.innerHTML.includes('No orders found')) {
                    tr.remove();
                }
            });
        }
        
        // Set global flag to indicate orders have been manually cleared
        window.ordersManuallyCleared = true;
    } catch (error) {
        console.error('Error clearing order data:', error);
    }
}

// Transport Settings functionality
function initTransportSettings() {
    // Check if the transport settings section is present
    if (!document.getElementById('transportSettingsSection')) {
        console.log('Transport Settings section not found, skipping initTransportSettings.');
        return;
    }
    console.log('Initializing transport settings...');
    
    // 获取保存按钮元素
    const saveTransportSettingsBtn = document.getElementById('saveTransportSettingsBtn');
    
    if (!saveTransportSettingsBtn) {
        console.error('Save transport settings button not found');
        return;
    }
    
    // 加载现有设置
    loadTransportSettings();
    
    // 为保存按钮添加点击事件监听器
    saveTransportSettingsBtn.addEventListener('click', saveTransportSettings);
    console.log('Event listener added to saveTransportSettingsBtn');
    
    // 单独的保存函数
    function saveTransportSettings() {
        console.log('saveTransportSettings function called');
        try {
            // 获取表单值并转换为数字
            const baseFareValue = parseFloat(document.getElementById('baseFare').value);
            const ratePerKmValue = parseFloat(document.getElementById('ratePerKm').value);
            const rushHourValue = parseFloat(document.getElementById('rushHourMultiplier').value);
            const nightValue = parseFloat(document.getElementById('nightMultiplier').value);
            const weekendValue = parseFloat(document.getElementById('weekendMultiplier').value);
            const sedanValue = parseFloat(document.getElementById('sedanRate').value);
            const suvValue = parseFloat(document.getElementById('suvRate').value);
            const vanValue = parseFloat(document.getElementById('vanRate').value);
            const luxuryValue = parseFloat(document.getElementById('luxuryRate').value);
            
            // 输出当前获取的值用于调试
            console.log('Form values:', {
                baseFare: baseFareValue,
                ratePerKm: ratePerKmValue,
                rushHour: rushHourValue,
                night: nightValue,
                weekend: weekendValue,
                sedan: sedanValue,
                suv: suvValue,
                van: vanValue,
                luxury: luxuryValue
            });
            
            // 验证表单值是否有效
            if (isNaN(baseFareValue) || isNaN(ratePerKmValue) || isNaN(rushHourValue) ||
                isNaN(nightValue) || isNaN(weekendValue) || isNaN(sedanValue) ||
                isNaN(suvValue) || isNaN(vanValue) || isNaN(luxuryValue)) {
                throw new Error('无效的数值输入');
            }
            
            // 创建设置对象
            const transportSettings = {
                baseFare: baseFareValue,
                ratePerKm: ratePerKmValue,
                rushHourMultiplier: rushHourValue,
                nightMultiplier: nightValue,
                weekendMultiplier: weekendValue,
                vehicleRates: {
                    sedan: sedanValue,
                    suv: suvValue,
                    van: vanValue,
                    luxury: luxuryValue
                },
                lastUpdated: new Date().toISOString()
            };
            
            console.log('Saving transport settings:', transportSettings);
            
            // 先尝试清除旧数据（解决可能的缓存问题）
            try {
                localStorage.removeItem('transportSettings');
            } catch (e) {
                console.warn('Failed to remove old settings:', e);
            }
            
            // 保存到localStorage
            try {
                const settingsJSON = JSON.stringify(transportSettings);
                console.log('Settings JSON:', settingsJSON);
                localStorage.setItem('transportSettings', settingsJSON);
                
                // 同时保存到sessionStorage作为备份
                sessionStorage.setItem('transportSettings', settingsJSON);
                
                // 验证保存结果
                const savedData = localStorage.getItem('transportSettings');
                console.log('Saved data retrieved:', savedData);
                
                if (savedData) {
                    console.log('Transport settings saved successfully');
                    alert('Transport settings saved successfully!');
                } else {
                    console.error('Failed to verify saved settings');
                    alert('Failed to save settings. Please try again.');
                }
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                alert('Error saving settings: ' + e.message);
            }
        } catch (error) {
            console.error('Error in saveTransportSettings:', error);
            alert('Error saving settings: ' + error.message);
        }
    }
    
    // 修复loadTransportSettings函数
    function loadTransportSettings() {
        console.log('Loading transport settings...');
        
        try {
            // 获取form表单元素
            const baseFare = document.getElementById('baseFare');
            const ratePerKm = document.getElementById('ratePerKm');
            const rushHourMultiplier = document.getElementById('rushHourMultiplier');
            const nightMultiplier = document.getElementById('nightMultiplier');
            const weekendMultiplier = document.getElementById('weekendMultiplier');
            const sedanRate = document.getElementById('sedanRate');
            const suvRate = document.getElementById('suvRate');
            const vanRate = document.getElementById('vanRate');
            const luxuryRate = document.getElementById('luxuryRate');
            
            // 检查元素是否存在
            if (!baseFare || !ratePerKm || !rushHourMultiplier || !nightMultiplier || 
                !weekendMultiplier || !sedanRate || !suvRate || !vanRate || !luxuryRate) {
                console.error('One or more form elements not found');
                return;
            }
            
            // 尝试从多个来源获取设置
            let settingsStr = localStorage.getItem('transportSettings');
            
            // 如果localStorage没有，尝试从sessionStorage获取
            if (!settingsStr) {
                settingsStr = sessionStorage.getItem('transportSettings');
                console.log('Using settings from sessionStorage');
            }
            
            console.log('Raw settings:', settingsStr);
            
            // 设置默认值（以防localStorage中没有值）
            const defaultSettings = {
                baseFare: 30,
                ratePerKm: 0.5,
                rushHourMultiplier: 1.5,
                nightMultiplier: 1.3,
                weekendMultiplier: 1.2,
                vehicleRates: {
                    sedan: 1.0,
                    suv: 1.5,
                    van: 1.8,
                    luxury: 2.2
                }
            };
            
            if (!settingsStr) {
                console.log('No settings found, using defaults');
                // 使用默认值
                baseFare.value = defaultSettings.baseFare;
                ratePerKm.value = defaultSettings.ratePerKm;
                rushHourMultiplier.value = defaultSettings.rushHourMultiplier;
                nightMultiplier.value = defaultSettings.nightMultiplier;
                weekendMultiplier.value = defaultSettings.weekendMultiplier;
                sedanRate.value = defaultSettings.vehicleRates.sedan;
                suvRate.value = defaultSettings.vehicleRates.suv;
                vanRate.value = defaultSettings.vehicleRates.van;
                luxuryRate.value = defaultSettings.vehicleRates.luxury;
                
                // 保存默认值到localStorage
                try {
                    localStorage.setItem('transportSettings', JSON.stringify(defaultSettings));
                    console.log('Default settings saved to localStorage');
                } catch (e) {
                    console.warn('Failed to save default settings:', e);
                }
                return;
            }
            
            try {
                // 解析JSON
                const settings = JSON.parse(settingsStr);
                console.log('Parsed settings:', settings);
                
                // 设置表单值（带有回退默认值）
                baseFare.value = settings.baseFare || defaultSettings.baseFare;
                ratePerKm.value = settings.ratePerKm || defaultSettings.ratePerKm;
                rushHourMultiplier.value = settings.rushHourMultiplier || defaultSettings.rushHourMultiplier;
                nightMultiplier.value = settings.nightMultiplier || defaultSettings.nightMultiplier;
                weekendMultiplier.value = settings.weekendMultiplier || defaultSettings.weekendMultiplier;
                
                // 处理车辆费率
                const vehicleRates = settings.vehicleRates || defaultSettings.vehicleRates;
                
                sedanRate.value = vehicleRates.sedan || defaultSettings.vehicleRates.sedan;
                suvRate.value = vehicleRates.suv || defaultSettings.vehicleRates.suv;
                vanRate.value = vehicleRates.van || defaultSettings.vehicleRates.van;
                luxuryRate.value = vehicleRates.luxury || defaultSettings.vehicleRates.luxury;
                
                console.log('Transport settings loaded successfully');
            } catch (error) {
                console.error('Error parsing transport settings:', error);
                // 出错时使用默认值
                baseFare.value = defaultSettings.baseFare;
                ratePerKm.value = defaultSettings.ratePerKm;
                rushHourMultiplier.value = defaultSettings.rushHourMultiplier;
                nightMultiplier.value = defaultSettings.nightMultiplier;
                weekendMultiplier.value = defaultSettings.weekendMultiplier;
                sedanRate.value = defaultSettings.vehicleRates.sedan;
                suvRate.value = defaultSettings.vehicleRates.suv;
                vanRate.value = defaultSettings.vehicleRates.van;
                luxuryRate.value = defaultSettings.vehicleRates.luxury;
                
                // 保存默认值到localStorage
                try {
                    localStorage.setItem('transportSettings', JSON.stringify(defaultSettings));
                    console.log('Default settings saved to localStorage after error');
                } catch (e) {
                    console.warn('Failed to save default settings after error:', e);
                }
            }
        } catch (error) {
            console.error('Error loading transport settings:', error);
        }
    }
}

// Settings Management functionality
function initSettings() {
    // Check if the settings section is present
    if (!document.getElementById('settingsSection')) {
        console.log('Settings section not found, skipping initSettings.');
        return;
    }
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
        const username = adminUsername.value.trim();
        const password = adminPassword.value.trim();
        const confirm = confirmPassword.value.trim();
        
        if (!username) {
            alert('Username cannot be empty');
            return;
        }
        
        // Check if changing password
        if (password) {
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            if (password !== confirm) {
                alert('Passwords do not match');
                return;
            }
            
            // In a real app, this would update the password on the server
            alert('Password updated successfully');
        }
        
        // In a real app, this would update the username on the server
        alert('Settings saved successfully');
        
        // Clear password fields
        adminPassword.value = '';
        confirmPassword.value = '';
    });
}

// Content Management functionality
function initContentManagement() {
    console.log('Initializing content management...');
    
    // Tab functionality
    const contentTabs = document.querySelectorAll('.admin-tab');
    const contentTabContents = document.querySelectorAll('.admin-tab-content');

    if (contentTabs.length === 0 && contentTabContents.length === 0 && !document.getElementById('contentSection')) {
        console.log('Content management section elements not found, skipping initialization.');
        return;
    }
    
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and content
            contentTabs.forEach(t => t.classList.remove('active'));
            contentTabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + 'Content').classList.add('active');
        });
    });
    
    // Initialize Articles section
    initArticlesManagement();
    
    // Initialize Videos section
    initVideosManagement();
    
    // Initialize Links section
    initLinksManagement();
}

// Articles Management
function initArticlesManagement() {
    const articlesList = document.getElementById('articlesList');
    const addArticleBtn = document.getElementById('addArticleBtn');
    const articleModal = document.getElementById('articleModal');
    // Early exit if essential elements for this section are not found
    if (!articlesList || !addArticleBtn || !articleModal) {
        console.warn('Articles Management section elements not found, skipping initialization.');
        return;
    }
    const articleForm = document.getElementById('articleForm');
    const closeModalBtns = articleModal.querySelectorAll('.close-modal, #cancelArticleBtn');
    const saveArticleBtn = document.getElementById('saveArticleBtn');
    const articleImage = document.getElementById('articleImage');
    const articleImagePreview = document.getElementById('articleImagePreview');
    
    // Load existing articles
    loadArticles();
    
    // Show article modal for adding new article
    addArticleBtn.addEventListener('click', function() {
        document.getElementById('articleModalTitle').textContent = 'Add New Article';
        articleForm.reset();
        articleImagePreview.style.display = 'none';
        document.getElementById('articleId').value = '';
        articleModal.style.display = 'block';
    });
    
    // Close modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            articleModal.style.display = 'none';
        });
    });
    
    // Handle image preview
    articleImage.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                articleImagePreview.src = e.target.result;
                articleImagePreview.style.display = 'block';
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Save article
    articleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const articleId = document.getElementById('articleId').value;
        const title = document.getElementById('articleTitle').value;
        const description = document.getElementById('articleDescription').value;
        const content = document.getElementById('articleContent').value;
        const externalLink = document.getElementById('articleExternalLink').value;
        let imageUrl = '';
        
        // Check if we have a new image
        if (articleImage.files && articleImage.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUrl = e.target.result;
                saveArticleData(articleId, title, description, content, imageUrl, externalLink);
            }
            reader.readAsDataURL(articleImage.files[0]);
        } else if (articleImagePreview.style.display !== 'none') {
            // Keep existing image
            imageUrl = articleImagePreview.src;
            saveArticleData(articleId, title, description, content, imageUrl, externalLink);
        } else {
            // No image
            saveArticleData(articleId, title, description, content, '', externalLink);
        }
    });
    
    // Function to save article data
    function saveArticleData(id, title, description, content, imageUrl, externalLink) {
        // Get existing articles
        let articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
        
        if (id) {
            // Update existing article
            const index = articles.findIndex(a => a.id === id);
            if (index !== -1) {
                articles[index] = {
                    id,
                    title,
                    description,
                    content,
                    imageUrl,
                    externalLink,
                    date: articles[index].date
                };
            }
        } else {
            // Add new article
            const newId = 'art_' + Date.now();
            articles.push({
                id: newId,
                title,
                description,
                content,
                imageUrl,
                externalLink,
                date: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('siteArticles', JSON.stringify(articles));
        
        // Reload articles list
        loadArticles();
        
        // Close modal
        articleModal.style.display = 'none';
    }
    
    // Load articles from localStorage
    function loadArticles() {
        const articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
        
        if (articles.length === 0) {
            articlesList.innerHTML = '<div class="empty-message">No articles added yet. Click "Add New Article" to create one.</div>';
            return;
        }
        
        articlesList.innerHTML = '';
        
        // Sort by date, newest first
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        articles.forEach(article => {
            const item = document.createElement('div');
            item.className = 'content-item';
            item.innerHTML = `
                <div class="content-item-details">
                    <div class="content-item-title">${article.title}</div>
                    <div class="content-item-desc">${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}</div>
                </div>
                <div class="content-item-actions">
                    <button class="admin-btn small edit-article" data-id="${article.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="admin-btn small danger delete-article" data-id="${article.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            articlesList.appendChild(item);
        });
        
        // Add edit functionality
        document.querySelectorAll('.edit-article').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editArticle(id);
            });
        });
        
        // Add delete functionality
        document.querySelectorAll('.delete-article').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this article?')) {
                    deleteArticle(id);
                }
            });
        });
    }
    
    // Edit article
    function editArticle(id) {
        const articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
        const article = articles.find(a => a.id === id);
        
        if (article) {
            document.getElementById('articleModalTitle').textContent = 'Edit Article';
            document.getElementById('articleId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleDescription').value = article.description;
            document.getElementById('articleContent').value = article.content || '';
            document.getElementById('articleExternalLink').value = article.externalLink || '';
            
            if (article.imageUrl) {
                articleImagePreview.src = article.imageUrl;
                articleImagePreview.style.display = 'block';
            } else {
                articleImagePreview.style.display = 'none';
            }
            
            articleModal.style.display = 'block';
        }
    }
    
    // Delete article
    function deleteArticle(id) {
        let articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
        articles = articles.filter(a => a.id !== id);
        localStorage.setItem('siteArticles', JSON.stringify(articles));
        loadArticles();
    }
}

// Videos Management
function initVideosManagement() {
    const videosList = document.getElementById('videosList');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoModal = document.getElementById('videoModal');
    // Early exit if essential elements for this section are not found
    if (!videosList || !addVideoBtn || !videoModal) {
        console.warn('Videos Management section elements not found, skipping initialization.');
        return;
    }
    const videoForm = document.getElementById('videoForm');
    const closeModalBtns = videoModal.querySelectorAll('.close-modal, #cancelVideoBtn');
    const saveVideoBtn = document.getElementById('saveVideoBtn');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoThumbnailPreview = document.getElementById('videoThumbnailPreview');
    
    // Load existing videos
    loadVideos();
    
    // Show video modal for adding new video
    addVideoBtn.addEventListener('click', function() {
        document.getElementById('videoModalTitle').textContent = 'Add New Video';
        videoForm.reset();
        videoThumbnailPreview.style.display = 'none';
        document.getElementById('videoId').value = '';
        videoModal.style.display = 'block';
    });
    
    // Close modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            videoModal.style.display = 'none';
        });
    });
    
    // Handle thumbnail preview
    videoThumbnail.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                videoThumbnailPreview.src = e.target.result;
                videoThumbnailPreview.style.display = 'block';
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Save video
    videoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const videoId = document.getElementById('videoId').value;
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        const videoUrl = document.getElementById('videoUrl').value;
        let thumbnailUrl = '';
        
        // Check if we have a new thumbnail
        if (videoThumbnail.files && videoThumbnail.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                thumbnailUrl = e.target.result;
                saveVideoData(videoId, title, description, videoUrl, thumbnailUrl);
            }
            reader.readAsDataURL(videoThumbnail.files[0]);
        } else if (videoThumbnailPreview.style.display !== 'none') {
            // Keep existing thumbnail
            thumbnailUrl = videoThumbnailPreview.src;
            saveVideoData(videoId, title, description, videoUrl, thumbnailUrl);
        } else {
            // No thumbnail, try to get one from the video URL (in a real app, you might want to implement this)
            saveVideoData(videoId, title, description, videoUrl, '');
        }
    });
    
    // Function to save video data
    function saveVideoData(id, title, description, videoUrl, thumbnailUrl) {
        // Get existing videos
        let videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
        
        if (id) {
            // Update existing video
            const index = videos.findIndex(v => v.id === id);
            if (index !== -1) {
                videos[index] = {
                    id,
                    title,
                    description,
                    videoUrl,
                    thumbnailUrl,
                    date: videos[index].date
                };
            }
        } else {
            // Add new video
            const newId = 'vid_' + Date.now();
            videos.push({
                id: newId,
                title,
                description,
                videoUrl,
                thumbnailUrl,
                date: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('siteVideos', JSON.stringify(videos));
        
        // Reload videos list
        loadVideos();
        
        // Close modal
        videoModal.style.display = 'none';
    }
    
    // Load videos from localStorage
    function loadVideos() {
        const videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
        
        if (videos.length === 0) {
            videosList.innerHTML = '<div class="empty-message">No videos added yet. Click "Add New Video" to create one.</div>';
            return;
        }
        
        videosList.innerHTML = '';
        
        // Sort by date, newest first
        videos.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'content-item';
            item.innerHTML = `
                <div class="content-item-details">
                    <div class="content-item-title">${video.title}</div>
                    <div class="content-item-desc">${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</div>
                </div>
                <div class="content-item-actions">
                    <button class="admin-btn small edit-video" data-id="${video.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="admin-btn small danger delete-video" data-id="${video.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            videosList.appendChild(item);
        });
        
        // Add edit functionality
        document.querySelectorAll('.edit-video').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editVideo(id);
            });
        });
        
        // Add delete functionality
        document.querySelectorAll('.delete-video').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this video?')) {
                    deleteVideo(id);
                }
            });
        });
    }
    
    // Edit video
    function editVideo(id) {
        const videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
        const video = videos.find(v => v.id === id);
        
        if (video) {
            document.getElementById('videoModalTitle').textContent = 'Edit Video';
            document.getElementById('videoId').value = video.id;
            document.getElementById('videoTitle').value = video.title;
            document.getElementById('videoDescription').value = video.description;
            document.getElementById('videoUrl').value = video.videoUrl;
            
            if (video.thumbnailUrl) {
                videoThumbnailPreview.src = video.thumbnailUrl;
                videoThumbnailPreview.style.display = 'block';
            } else {
                videoThumbnailPreview.style.display = 'none';
            }
            
            videoModal.style.display = 'block';
        }
    }
    
    // Delete video
    function deleteVideo(id) {
        let videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
        videos = videos.filter(v => v.id !== id);
        localStorage.setItem('siteVideos', JSON.stringify(videos));
        loadVideos();
    }
}

// Links Management
function initLinksManagement() {
    const linksList = document.getElementById('linksList');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkModal = document.getElementById('linkModal');
    // Early exit if essential elements for this section are not found
    if (!linksList || !addLinkBtn || !linkModal) {
        console.warn('Links Management section elements not found, skipping initialization.');
        return;
    }
    const linkForm = document.getElementById('linkForm');
    const closeModalBtns = linkModal.querySelectorAll('.close-modal, #cancelLinkBtn');
    const saveLinkBtn = document.getElementById('saveLinkBtn');
    
    // Load existing links
    loadLinks();
    
    // Show link modal for adding new link
    addLinkBtn.addEventListener('click', function() {
        document.getElementById('linkModalTitle').textContent = 'Add New Link';
        linkForm.reset();
        document.getElementById('linkId').value = '';
        document.getElementById('linkIcon').value = 'fas fa-globe';
        linkModal.style.display = 'block';
    });
    
    // Close modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            linkModal.style.display = 'none';
        });
    });
    
    // Save link
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const linkId = document.getElementById('linkId').value;
        const title = document.getElementById('linkTitle').value;
        const description = document.getElementById('linkDescription').value;
        const url = document.getElementById('linkUrl').value;
        const icon = document.getElementById('linkIcon').value;
        
        // Get existing links
        let links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
        
        if (linkId) {
            // Update existing link
            const index = links.findIndex(l => l.id === linkId);
            if (index !== -1) {
                links[index] = {
                    id: linkId,
                    title,
                    description,
                    url,
                    icon,
                    date: links[index].date
                };
            }
        } else {
            // Add new link
            const newId = 'link_' + Date.now();
            links.push({
                id: newId,
                title,
                description,
                url,
                icon,
                date: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('siteLinks', JSON.stringify(links));
        
        // Reload links list
        loadLinks();
        
        // Close modal
        linkModal.style.display = 'none';
    });
    
    // Load links from localStorage
    function loadLinks() {
        const links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
        
        if (links.length === 0) {
            linksList.innerHTML = '<div class="empty-message">No links added yet. Click "Add New Link" to create one.</div>';
            return;
        }
        
        linksList.innerHTML = '';
        
        // Sort by date, newest first
        links.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        links.forEach(link => {
            const item = document.createElement('div');
            item.className = 'content-item';
            item.innerHTML = `
                <div class="content-item-details">
                    <div class="content-item-title">
                        <i class="${link.icon}"></i> ${link.title}
                    </div>
                    <div class="content-item-desc">
                        ${link.description.substring(0, 100)}${link.description.length > 100 ? '...' : ''}
                        <br><small>${link.url}</small>
                    </div>
                </div>
                <div class="content-item-actions">
                    <button class="admin-btn small edit-link" data-id="${link.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="admin-btn small danger delete-link" data-id="${link.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            linksList.appendChild(item);
        });
        
        // Add edit functionality
        document.querySelectorAll('.edit-link').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editLink(id);
            });
        });
        
        // Add delete functionality
        document.querySelectorAll('.delete-link').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this link?')) {
                    deleteLink(id);
                }
            });
        });
    }
    
    // Edit link
    function editLink(id) {
        const links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
        const link = links.find(l => l.id === id);
        
        if (link) {
            document.getElementById('linkModalTitle').textContent = 'Edit Link';
            document.getElementById('linkId').value = link.id;
            document.getElementById('linkTitle').value = link.title;
            document.getElementById('linkDescription').value = link.description;
            document.getElementById('linkUrl').value = link.url;
            document.getElementById('linkIcon').value = link.icon;
            
            linkModal.style.display = 'block';
        }
    }
    
    // Delete link
    function deleteLink(id) {
        let links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
        links = links.filter(l => l.id !== id);
        localStorage.setItem('siteLinks', JSON.stringify(links));
        loadLinks();
    }
} 