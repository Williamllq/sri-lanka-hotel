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
    
    // Initial call and window resize event
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
    
    // Navigation functionality
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.classList.contains('logout')) return;
            
            e.preventDefault();
            
            // Remove active class from all items
            sidebarMenuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show the corresponding section
            const sectionId = this.getAttribute('data-section') + 'Section';
            
            adminSections.forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
            
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
    
    // Initialize hotel management
    initHotelManagement();
    
    // Initialize settings
    initSettings();
});

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
    const uploadPictureBtn = document.getElementById('uploadPictureBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadPictureForm = document.getElementById('uploadPictureForm');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const pictureFile = document.getElementById('pictureFile');
    const filePreview = document.getElementById('filePreview');
    const pictureGrid = document.getElementById('pictureGrid');
    const pictureCategory = document.getElementById('pictureCategory');
    
    // Get pictures from localStorage or use mock data if none exists
    let storedPictures = localStorage.getItem('sitePictures');
    let mockPictures = storedPictures ? JSON.parse(storedPictures) : [
        { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya-rock.jpg' },
        { id: 2, name: 'Kandy Lake', category: 'scenery', url: 'images/kandy-lake.jpg' },
        { id: 3, name: 'Cinnamon Grand Hotel', category: 'hotel', url: 'images/cinnamon-grand.jpg' },
        { id: 4, name: 'Sri Lankan Elephant', category: 'wildlife', url: 'images/elephant.jpg' },
        { id: 5, name: 'Train to Ella', category: 'transport', url: 'images/train-ella.jpg' }
    ];
    
    console.log("Loaded pictures from localStorage:", mockPictures.length);
    
    // Save pictures to localStorage whenever they change
    function savePictures() {
        localStorage.setItem('sitePictures', JSON.stringify(mockPictures));
        console.log("Saved pictures to localStorage:", mockPictures.length);
    }
    
    // Compress image to reduce storage size
    function compressImage(dataURL, maxWidth = 1200, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                // Create canvas and resize image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // Draw image
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data URL
                const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataURL);
            };
            img.onerror = function() {
                reject(new Error('Failed to load image for compression'));
            };
            img.src = dataURL;
        });
    }
    
    // Open upload modal
    uploadPictureBtn.addEventListener('click', function() {
        uploadModal.style.display = 'block';
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            uploadModal.style.display = 'none';
        });
    });
    
    // File preview functionality
    pictureFile.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Form submission
    uploadPictureForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const pictureName = document.getElementById('pictureName').value;
        const category = document.getElementById('uploadCategory').value;
        const description = document.getElementById('pictureDescription').value;
        
        if (!pictureFile.files || !pictureFile.files[0]) {
            alert('Please select an image file');
            return;
        }
        
        try {
            // Show loading message
            filePreview.innerHTML += '<p>Processing image...</p>';
            
            const reader = new FileReader();
            
            reader.onload = async function(event) {
                try {
                    // Compress the image
                    const compressedImage = await compressImage(event.target.result);
                    
                    // Generate a unique ID using timestamp and random number
                    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
                    
                    // Create a new picture object with the data URL
                    const newPicture = {
                        id: uniqueId,
                        name: pictureName,
                        category: category,
                        url: compressedImage,
                        description: description,
                        dateAdded: new Date().toISOString()
                    };
                    
                    // Add to data
                    mockPictures.push(newPicture);
                    
                    // Save to localStorage
                    savePictures();
                    
                    // Reset form
                    uploadPictureForm.reset();
                    filePreview.innerHTML = '';
                    
                    // Close modal
                    uploadModal.style.display = 'none';
                    
                    // Refresh grid
                    displayPictures();
                    
                    // Show success message
                    alert('Picture uploaded successfully!');
                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Failed to process image. Please try again with a smaller image.');
                }
            };
            
            reader.onerror = function() {
                alert('Error reading the image file. Please try again.');
            };
            
            reader.readAsDataURL(pictureFile.files[0]);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('An error occurred while uploading the image.');
        }
    });
    
    // Filter by category
    pictureCategory.addEventListener('change', function() {
        displayPictures();
    });
    
    // Display pictures function
    function displayPictures() {
        const category = pictureCategory.value;
        
        // Clear current grid
        pictureGrid.innerHTML = '';
        
        // Filter images by category if not "all"
        const filteredPictures = category === 'all' 
            ? mockPictures 
            : mockPictures.filter(pic => pic.category === category);
        
        if (filteredPictures.length === 0) {
            pictureGrid.innerHTML = '<p class="no-images-message">No images found in this category. Upload images to see them here.</p>';
            return;
        }
        
        // Add pictures to grid
        filteredPictures.forEach(picture => {
            const pictureCard = document.createElement('div');
            pictureCard.classList.add('picture-card');
            pictureCard.innerHTML = `
                <img src="${picture.url}" alt="${picture.name}">
                <div class="picture-info">
                    <h4>${picture.name}</h4>
                    <span>${picture.category}</span>
                </div>
                <div class="picture-actions">
                    <button class="picture-action-btn edit-picture" data-id="${picture.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="picture-action-btn delete-picture" data-id="${picture.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="picture-action-btn add-to-carousel" data-id="${picture.id}" title="Add to Carousel">
                        <i class="fas fa-images"></i>
                    </button>
                </div>
            `;
            pictureGrid.appendChild(pictureCard);
        });
        
        // Event listeners for edit and delete buttons
        document.querySelectorAll('.edit-picture').forEach(btn => {
            btn.addEventListener('click', function() {
                const pictureId = this.getAttribute('data-id');
                // Edit functionality would be added here
                alert(`Edit picture ${pictureId}`);
            });
        });
        
        document.querySelectorAll('.delete-picture').forEach(btn => {
            btn.addEventListener('click', function() {
                const pictureId = parseInt(this.getAttribute('data-id'));
                
                if (confirm('Are you sure you want to delete this picture?')) {
                    // Remove from data
                    const index = mockPictures.findIndex(pic => pic.id === pictureId);
                    if (index !== -1) {
                        // Check if this image is used in carousel
                        const storedCarouselImages = localStorage.getItem('siteCarouselImages');
                        if (storedCarouselImages) {
                            const carouselImages = JSON.parse(storedCarouselImages);
                            const inCarousel = carouselImages.some(img => img.id === pictureId);
                            
                            if (inCarousel && !confirm('This image is used in the carousel. Deleting it will also remove it from the carousel. Continue?')) {
                                return;
                            }
                            
                            // Remove from carousel if present
                            const updatedCarousel = carouselImages.filter(img => img.id !== pictureId);
                            localStorage.setItem('siteCarouselImages', JSON.stringify(updatedCarousel));
                        }
                        
                        // Remove from pictures
                        mockPictures.splice(index, 1);
                        
                        // Save changes to localStorage
                        savePictures();
                        displayPictures(); // Refresh the grid
                    }
                }
            });
        });
        
        // Add to carousel directly from pictures grid
        document.querySelectorAll('.add-to-carousel').forEach(btn => {
            btn.addEventListener('click', function() {
                const pictureId = parseInt(this.getAttribute('data-id'));
                const picture = mockPictures.find(pic => pic.id === pictureId);
                
                if (picture) {
                    // Get current carousel images
                    const storedCarouselImages = localStorage.getItem('siteCarouselImages');
                    let carouselImages = storedCarouselImages ? JSON.parse(storedCarouselImages) : [];
                    
                    // Check if already in carousel
                    if (carouselImages.some(img => img.id === pictureId)) {
                        alert('This image is already in the carousel.');
                        return;
                    }
                    
                    // Add to carousel
                    carouselImages.push(picture);
                    
                    // Save to localStorage
                    localStorage.setItem('siteCarouselImages', JSON.stringify(carouselImages));
                    
                    alert('Image added to carousel successfully!');
                }
            });
        });
    }
    
    // Initial display
    displayPictures();
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
    const addHotelBtn = document.getElementById('addHotelBtn');
    const hotelModal = document.getElementById('hotelModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const hotelForm = document.getElementById('hotelForm');
    const hotelImage = document.getElementById('hotelImage');
    const hotelImagePreview = document.getElementById('hotelImagePreview');
    const hotelsGrid = document.getElementById('hotelsGrid');
    
    // Mock hotel data - in a real app, this would come from an API
    let mockHotels = [
        {
            id: 1,
            name: 'Cinnamon Grand Colombo',
            location: 'Colombo',
            price: '$150-300/night',
            rating: 5,
            description: 'Luxury hotel in the heart of Colombo with exceptional service and amenities.',
            imageUrl: 'images/cinnamon-grand.jpg',
            amenities: 'WiFi, Pool, Spa, Restaurant, Bar, Gym',
            website: 'https://www.cinnamonhotels.com/'
        },
        {
            id: 2,
            name: 'Heritance Tea Factory',
            location: 'Nuwara Eliya',
            price: '$120-220/night',
            rating: 4,
            description: 'Unique hotel built in a converted tea factory with stunning views of tea plantations.',
            imageUrl: 'images/tea-factory.jpg',
            amenities: 'WiFi, Restaurant, Bar, Tea Tours, Spa',
            website: 'https://www.heritancehotels.com/'
        }
    ];
    
    // Open add hotel modal
    addHotelBtn.addEventListener('click', function() {
        // Reset form for new hotel
        hotelForm.reset();
        document.getElementById('hotelId').value = '';
        hotelImagePreview.innerHTML = '';
        document.getElementById('hotelModalTitle').textContent = 'Add New Hotel';
        
        hotelModal.style.display = 'block';
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            hotelModal.style.display = 'none';
        });
    });
    
    // Hotel image preview
    hotelImage.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                hotelImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Form submission
    hotelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const hotelId = document.getElementById('hotelId').value;
        const name = document.getElementById('hotelName').value;
        const location = document.getElementById('hotelLocation').value;
        const price = document.getElementById('hotelPrice').value;
        const rating = document.getElementById('hotelRating').value;
        const description = document.getElementById('hotelDescription').value;
        const amenities = document.getElementById('hotelAmenities').value;
        const website = document.getElementById('hotelWebsite').value;
        
        // Create hotel object
        const hotel = {
            id: hotelId ? parseInt(hotelId) : mockHotels.length + 1,
            name,
            location,
            price,
            rating: parseInt(rating),
            description,
            amenities,
            website
        };
        
        // If there's a new image
        if (hotelImage.files && hotelImage.files[0]) {
            hotel.imageUrl = URL.createObjectURL(hotelImage.files[0]);
        } else if (hotelId) {
            // Keep existing image if editing
            const existingHotel = mockHotels.find(h => h.id === parseInt(hotelId));
            if (existingHotel) {
                hotel.imageUrl = existingHotel.imageUrl;
            }
        }
        
        if (hotelId) {
            // Update existing hotel
            const index = mockHotels.findIndex(h => h.id === parseInt(hotelId));
            if (index !== -1) {
                mockHotels[index] = hotel;
            }
        } else {
            // Add new hotel
            mockHotels.push(hotel);
        }
        
        // Update grid
        displayHotels();
        
        // Close modal
        hotelModal.style.display = 'none';
    });
    
    // Display hotels function
    function displayHotels() {
        hotelsGrid.innerHTML = '';
        
        mockHotels.forEach(hotel => {
            const hotelCard = document.createElement('div');
            hotelCard.classList.add('hotel-card');
            
            // Create star rating HTML
            let starsHtml = '';
            for (let i = 0; i < hotel.rating; i++) {
                starsHtml += '<i class="fas fa-star"></i>';
            }
            for (let i = hotel.rating; i < 5; i++) {
                starsHtml += '<i class="far fa-star"></i>';
            }
            
            hotelCard.innerHTML = `
                <img src="${hotel.imageUrl}" alt="${hotel.name}" class="hotel-image">
                <div class="hotel-details">
                    <h3 class="hotel-name">${hotel.name}</h3>
                    <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</div>
                    <div class="hotel-rating">${starsHtml}</div>
                    <div class="hotel-price">${hotel.price}</div>
                    <p class="hotel-description">${hotel.description}</p>
                    <div class="hotel-actions">
                        <button class="admin-btn secondary edit-hotel" data-id="${hotel.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="admin-btn danger delete-hotel" data-id="${hotel.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            hotelsGrid.appendChild(hotelCard);
        });
        
        // Add edit event listeners
        document.querySelectorAll('.edit-hotel').forEach(btn => {
            btn.addEventListener('click', function() {
                const hotelId = parseInt(this.getAttribute('data-id'));
                const hotel = mockHotels.find(h => h.id === hotelId);
                
                if (hotel) {
                    // Populate form with hotel data
                    document.getElementById('hotelId').value = hotel.id;
                    document.getElementById('hotelName').value = hotel.name;
                    document.getElementById('hotelLocation').value = hotel.location;
                    document.getElementById('hotelPrice').value = hotel.price;
                    document.getElementById('hotelRating').value = hotel.rating;
                    document.getElementById('hotelDescription').value = hotel.description;
                    document.getElementById('hotelAmenities').value = hotel.amenities;
                    document.getElementById('hotelWebsite').value = hotel.website || '';
                    
                    // Set image preview
                    hotelImagePreview.innerHTML = `<img src="${hotel.imageUrl}" alt="Preview">`;
                    
                    // Update modal title
                    document.getElementById('hotelModalTitle').textContent = 'Edit Hotel';
                    
                    // Open modal
                    hotelModal.style.display = 'block';
                }
            });
        });
        
        // Add delete event listeners
        document.querySelectorAll('.delete-hotel').forEach(btn => {
            btn.addEventListener('click', function() {
                const hotelId = parseInt(this.getAttribute('data-id'));
                
                if (confirm('Are you sure you want to delete this hotel?')) {
                    mockHotels = mockHotels.filter(h => h.id !== hotelId);
                    displayHotels();
                }
            });
        });
    }
    
    // Initial display
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