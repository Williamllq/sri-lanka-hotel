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
        // Redirect to login page if not authenticated
        window.location.href = 'admin-login.html';
        return;
    }

    // Initialize UI elements
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminLayout = document.querySelector('.admin-layout');
    const lastLoginTime = document.getElementById('lastLoginTime');
    const logoutButton = document.getElementById('logoutButton');
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
    const adminSections = document.querySelectorAll('.admin-section');
    
    // Set last login time
    const lastLogin = localStorage.getItem('adminLastLogin');
    if (lastLogin) {
        const date = new Date(lastLogin);
        lastLoginTime.textContent = `Last login: ${date.toLocaleString()}`;
    }
    
    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', function() {
        adminLayout.classList.toggle('sidebar-collapsed');
    });
    
    // Responsive design
    function handleResponsive() {
        if (window.innerWidth < 992) {
            adminLayout.classList.add('sidebar-collapsed');
        } else {
            adminLayout.classList.remove('sidebar-collapsed');
        }
    }
    
    // Initially handle responsive design
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
    
    // Handle sidebar navigation
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', function(event) {
            if (this.classList.contains('logout')) return;
            
            event.preventDefault();
            
            // Remove active class from all menu items and sections
            sidebarMenuItems.forEach(menuItem => menuItem.classList.remove('active'));
            adminSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId + 'Section').classList.add('active');
            
            // On mobile, collapse sidebar after selection
            if (window.innerWidth < 992) {
                adminLayout.classList.add('sidebar-collapsed');
            }
        });
    });
    
    // Logout functionality
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear local storage authentication
        localStorage.removeItem('adminToken');
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
    });
    
    // Initialize dashboard stats (mock data for demonstration)
    initDashboardStats();
    
    // Initialize picture management
    initPictureManagement();
    
    // Initialize carousel management
    initCarouselManagement();
    
    // Initialize content management
    initContentManagement();
    
    // Initialize hotel management
    initHotelManagement();
    
    // Initialize transport settings
    initTransportSettings();
    
    // Initialize settings
    initSettings();
    
    // Ensure all modals are properly handled
    initModalHandling();
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
    console.log('Initializing picture management');
    
    const pictureGrid = document.getElementById('pictureGrid');
    const pictureCategory = document.getElementById('pictureCategory');
    const uploadPictureForm = document.getElementById('uploadPictureForm');
    const pictureFile = document.getElementById('pictureFile');
    const filePreview = document.getElementById('filePreview');
    
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
    if (uploadPictureForm) {
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
        console.error('Upload picture form not found');
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
        
        // Clear current grid
        pictureGrid.innerHTML = '';
        
        // Filter pictures by category
        const filteredPictures = category === 'all' ? 
            pictures : 
            pictures.filter(pic => pic.category === category);
        
        if (filteredPictures.length === 0) {
            pictureGrid.innerHTML = '<div class="no-pictures">No pictures found in this category</div>';
            return;
        }
        
        // Create picture cards
        filteredPictures.forEach(pic => {
            const pictureCard = document.createElement('div');
            pictureCard.classList.add('picture-card');
            
            pictureCard.innerHTML = `
                <div class="picture-img">
                    <img src="${pic.url}" alt="${pic.name}">
                </div>
                <div class="picture-info">
                    <h4>${pic.name}</h4>
                    <p class="picture-category">${pic.category}</p>
                    <p class="picture-description">${pic.description || ''}</p>
                </div>
                <div class="picture-actions">
                    <button class="picture-action-btn edit-btn" data-id="${pic.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="picture-action-btn delete-btn" data-id="${pic.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            pictureGrid.appendChild(pictureCard);
            
            // Add delete event listener
            const deleteBtn = pictureCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    deletePicture(id);
                });
            }
        });
    }
    
    // Initial display of pictures
    displayPictures('all');
}

// Carousel Management functionality
function initCarouselManagement() {
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

// Hotel Management functionality
function initHotelManagement() {
    console.log('Initializing hotel management');
    
    const addHotelBtn = document.getElementById('addHotelBtn');
    const hotelModal = document.getElementById('hotelModal');
    const hotelForm = document.getElementById('hotelForm');
    const hotelsGrid = document.getElementById('hotelsGrid');
    
    // 酒店和客房标签页切换
    const hotelTabs = document.querySelectorAll('.admin-tab[data-hotel-tab]');
    const hotelTabContents = document.querySelectorAll('.hotel-tab-content');
    
    hotelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签页的active类
            hotelTabs.forEach(t => t.classList.remove('active'));
            hotelTabContents.forEach(c => c.classList.remove('active'));
            
            // 激活当前标签页
            this.classList.add('active');
            const tabName = this.getAttribute('data-hotel-tab');
            document.getElementById(tabName + 'Content').classList.add('active');
        });
    });
    
    // 客房管理功能
    const addRoomBtn = document.getElementById('addRoomBtn');
    const roomModal = document.getElementById('roomModal');
    const roomForm = document.getElementById('roomForm');
    const roomsGrid = document.getElementById('roomsGrid');
    
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', function() {
            // 重置表单
            if (roomForm) roomForm.reset();
            document.getElementById('roomId').value = '';
            document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-bed"></i> Add New Room';
            
            // 清除预览图
            const preview = document.getElementById('roomImagePreview');
            if (preview) preview.innerHTML = '';
            
            // 显示模态框
            if (roomModal) {
                roomModal.style.display = 'flex';
                roomModal.classList.add('active');
            }
        });
    }
    
    // 图片预览功能
    const roomImage = document.getElementById('roomImage');
    const roomImagePreview = document.getElementById('roomImagePreview');
    
    if (roomImage && roomImagePreview) {
        roomImage.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    roomImagePreview.innerHTML = `<img src="${event.target.result}" alt="Room Preview">`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // 取消按钮
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
    
    // 保存客房表单
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const roomId = document.getElementById('roomId').value || Date.now(); // 使用时间戳作为ID
            const roomName = document.getElementById('roomName').value;
            const roomDescription = document.getElementById('roomDescription').value;
            const roomPrice = document.getElementById('roomPrice').value;
            const roomSize = document.getElementById('roomSize').value;
            const bedType = document.getElementById('bedType').value;
            const hasWifi = document.querySelector('input[name="hasWifi"]:checked').value === 'yes';
            
            // 获取图片
            const roomImageFile = document.getElementById('roomImage').files[0];
            
            if (!roomImageFile && !document.getElementById('roomId').value) {
                alert('请选择房间图片');
                return;
            }
            
            if (roomImageFile) {
                // 读取图片为Base64
                const reader = new FileReader();
                reader.onload = function(event) {
                    saveRoom(roomId, roomName, roomDescription, roomPrice, roomSize, bedType, hasWifi, event.target.result);
                };
                reader.readAsDataURL(roomImageFile);
            } else {
                // 使用现有图片
                const rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
                const existingRoom = rooms.find(r => r.id == roomId);
                if (existingRoom) {
                    saveRoom(roomId, roomName, roomDescription, roomPrice, roomSize, bedType, hasWifi, existingRoom.imageUrl);
                }
            }
        });
    }
    
    // 保存客房数据
    function saveRoom(id, name, description, price, size, bedType, hasWifi, imageUrl) {
        // 获取现有客房数据
        let rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
        
        // 检查是新增还是编辑
        const existingRoomIndex = rooms.findIndex(room => room.id == id);
        
        if (existingRoomIndex !== -1) {
            // 更新现有客房
            rooms[existingRoomIndex] = {
                id: id,
                name: name,
                description: description,
                price: price,
                size: size,
                bedType: bedType,
                hasWifi: hasWifi,
                imageUrl: imageUrl // 确保更新图片URL
            };
        } else {
            // 添加新客房
            rooms.push({
                id: id,
                name: name,
                description: description,
                price: price,
                size: size,
                bedType: bedType,
                hasWifi: hasWifi,
                imageUrl: imageUrl
            });
        }
        
        // 保存到localStorage
        localStorage.setItem('siteRooms', JSON.stringify(rooms));
        
        // 关闭模态框
        if (roomModal) {
            roomModal.style.display = 'none';
            roomModal.classList.remove('active');
        }
        
        // 刷新客房列表
        displayRooms();
        
        alert(existingRoomIndex !== -1 ? '客房更新成功！' : '新客房添加成功！');
    }
    
    // 显示客房列表
    function displayRooms() {
        if (!roomsGrid) return;
        
        // 清空现有内容
        roomsGrid.innerHTML = '';
        
        // 获取客房数据
        const rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
        
        if (rooms.length === 0) {
            roomsGrid.innerHTML = `
                <div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-bed" style="font-size: 40px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>还没有添加任何客房。点击"Add New Room"按钮添加您的第一个客房。</p>
                </div>
            `;
            return;
        }
        
        // 创建客房卡片
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.classList.add('room-admin-card');
            
            roomCard.innerHTML = `
                <div class="room-image-container">
                    <img src="${room.imageUrl}" alt="${room.name}">
                </div>
                <div class="room-details">
                    <h3 class="room-name">${room.name}</h3>
                    <p class="room-description">${room.description}</p>
                    <div class="room-specs">
                        <div class="room-spec">
                            <i class="fas fa-bed"></i> ${room.bedType}
                        </div>
                        <div class="room-spec">
                            <i class="fas fa-ruler-combined"></i> ${room.size} m²
                        </div>
                        <div class="room-spec">
                            <i class="fas fa-wifi"></i> ${room.hasWifi ? 'Free WiFi' : 'No WiFi'}
                        </div>
                    </div>
                    <div class="room-price">From $${room.price}/night</div>
                    <div class="room-actions">
                        <button class="room-action-btn edit-btn" data-id="${room.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="room-action-btn delete-btn" data-id="${room.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            roomsGrid.appendChild(roomCard);
            
            // 编辑按钮事件
            const editBtn = roomCard.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    const roomId = this.getAttribute('data-id');
                    editRoom(roomId);
                });
            }
            
            // 删除按钮事件
            const deleteBtn = roomCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const roomId = this.getAttribute('data-id');
                    deleteRoom(roomId);
                });
            }
        });
    }
    
    // 编辑客房
    function editRoom(id) {
        const rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
        const room = rooms.find(r => r.id == id);
        
        if (room) {
            // 填充表单
            document.getElementById('roomId').value = room.id;
            document.getElementById('roomName').value = room.name;
            document.getElementById('roomDescription').value = room.description;
            document.getElementById('roomPrice').value = room.price;
            document.getElementById('roomSize').value = room.size;
            document.getElementById('bedType').value = room.bedType;
            
            // 设置WiFi选项
            const wifiRadios = document.querySelectorAll('input[name="hasWifi"]');
            wifiRadios.forEach(radio => {
                if ((radio.value === 'yes' && room.hasWifi) || (radio.value === 'no' && !room.hasWifi)) {
                    radio.checked = true;
                }
            });
            
            // 显示图片预览
            if (roomImagePreview) {
                roomImagePreview.innerHTML = `<img src="${room.imageUrl}" alt="${room.name}">`;
            }
            
            // 更新模态框标题
            document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Room';
            
            // 显示模态框
            if (roomModal) {
                roomModal.style.display = 'flex';
                roomModal.classList.add('active');
            }
        }
    }
    
    // 删除客房
    function deleteRoom(id) {
        if (confirm('确定要删除这个客房吗？此操作无法撤销。')) {
            let rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
            rooms = rooms.filter(room => room.id != id);
            localStorage.setItem('siteRooms', JSON.stringify(rooms));
            
            // 刷新客房列表
            displayRooms();
            
            alert('客房已成功删除！');
        }
    }
    
    // 初始化时显示客房列表
    displayRooms();
    
    // 继续原有的酒店管理代码
    // ...

    // 初始化时加载酒店列表
    displayHotels();
}

// Settings Management functionality
function initSettings() {
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

// Transport Settings functionality
function initTransportSettings() {
    console.log('Initializing transport settings...');
    
    const saveTransportSettingsBtn = document.getElementById('saveTransportSettingsBtn');
    
    // Load existing settings
    loadTransportSettings();
    
    // Save settings
    saveTransportSettingsBtn.addEventListener('click', function() {
        const transportSettings = {
            baseFare: parseFloat(document.getElementById('baseFare').value),
            ratePerKm: parseFloat(document.getElementById('ratePerKm').value),
            rushHourMultiplier: parseFloat(document.getElementById('rushHourMultiplier').value),
            nightMultiplier: parseFloat(document.getElementById('nightMultiplier').value),
            weekendMultiplier: parseFloat(document.getElementById('weekendMultiplier').value),
            vehicleRates: {
                sedan: parseFloat(document.getElementById('sedanRate').value),
                suv: parseFloat(document.getElementById('suvRate').value),
                van: parseFloat(document.getElementById('vanRate').value),
                luxury: parseFloat(document.getElementById('luxuryRate').value)
            }
        };
        
        // Save to localStorage
        localStorage.setItem('transportSettings', JSON.stringify(transportSettings));
        
        alert('Transport settings saved successfully');
    });
    
    // Load transport settings from localStorage
    function loadTransportSettings() {
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
        
        const transportSettings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
        
        // Populate form fields
        document.getElementById('baseFare').value = transportSettings.baseFare;
        document.getElementById('ratePerKm').value = transportSettings.ratePerKm;
        document.getElementById('rushHourMultiplier').value = transportSettings.rushHourMultiplier;
        document.getElementById('nightMultiplier').value = transportSettings.nightMultiplier;
        document.getElementById('weekendMultiplier').value = transportSettings.weekendMultiplier;
        document.getElementById('sedanRate').value = transportSettings.vehicleRates.sedan;
        document.getElementById('suvRate').value = transportSettings.vehicleRates.suv;
        document.getElementById('vanRate').value = transportSettings.vehicleRates.van;
        document.getElementById('luxuryRate').value = transportSettings.vehicleRates.luxury;
    }
} 