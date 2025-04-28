/**
 * User Admin Dashboard JavaScript
 * 
 * This script handles functionality for the user admin dashboard including:
 * - Authentication verification
 * - Sidebar navigation and responsiveness
 * - Picture management (upload, delete, organize)
 * - Carousel management
 * - Content management (articles, videos, links)
 * - Transport settings
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('userAdminToken') && !localStorage.getItem('adminToken')) {
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
    const lastLogin = localStorage.getItem('userAdminLastLogin');
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
        localStorage.removeItem('userAdminToken');
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
    });
    
    // Initialize picture management
    initPictureManagement();
    
    // Initialize carousel management
    initCarouselManagement();
    
    // Initialize content management
    initContentManagement();
    
    // Initialize transport settings
    initTransportSettings();
    
    // Initialize settings
    initSettings();
    
    // Ensure all modals are properly handled
    initModalHandling();
});

// Ensure all modals are properly handled
function initModalHandling() {
    // Get all modals
    const modals = document.querySelectorAll('.admin-modal');
    
    // Modal open buttons mapping
    const modalOpenButtonMap = {
        'uploadModal': 'uploadPictureBtn',
        'carouselModal': 'addToCarouselBtn',
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
            button.addEventListener('click', function() {
                modal.style.display = 'flex';
                modal.classList.add('active');
            });
        }
    }
    
    // Set up close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
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
}

// Initialize picture management functionality
function initPictureManagement() {
    const uploadForm = document.getElementById('uploadPictureForm');
    const fileInput = document.getElementById('pictureFile');
    const previewContainer = document.getElementById('filePreview');
    const pictureGrid = document.getElementById('pictureGrid');
    const categorySelect = document.getElementById('pictureCategory');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Handle picture upload
            savePicture();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            previewImage(this, previewContainer);
        });
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            displayPictures(this.value);
        });
    }
    
    // Load initial pictures
    displayPictures('all');
}

// Initialize carousel management functionality
function initCarouselManagement() {
    const saveOrderBtn = document.getElementById('saveCarouselOrderBtn');
    const carouselList = document.getElementById('carouselImagesList');
    const confirmSelectBtn = document.getElementById('confirmSelectBtn');
    
    if (saveOrderBtn) {
        saveOrderBtn.addEventListener('click', function() {
            saveCarouselOrder();
        });
    }
    
    if (confirmSelectBtn) {
        confirmSelectBtn.addEventListener('click', function() {
            addSelectedToCarousel();
        });
    }
    
    if (carouselList) {
        // Initialize drag-and-drop sorting
        new Sortable(carouselList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function() {
                // Optional: Auto-save order when items are reordered
                // saveCarouselOrder();
            }
        });
    }
    
    // Load initial carousel images
    displayCarouselImages();
}

// Initialize content management functionality
function initContentManagement() {
    const contentTabs = document.querySelectorAll('.admin-tab');
    const contentSections = document.querySelectorAll('.admin-tab-content');
    
    // Tab switching
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabTarget = this.getAttribute('data-tab');
            
            // Update active tab
            contentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === tabTarget + 'Content') {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Initialize each content type
    initArticlesManagement();
    initVideosManagement();
    initLinksManagement();
}

// Initialize articles management
function initArticlesManagement() {
    const addArticleBtn = document.getElementById('addArticleBtn');
    const articleForm = document.getElementById('articleForm');
    
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', function() {
            // Reset form for new article
            articleForm.reset();
            document.getElementById('articleModalTitle').textContent = 'Add New Article';
            document.getElementById('articleId').value = '';
            document.getElementById('articleImagePreview').src = '';
            
            // Show modal
            document.getElementById('articleModal').style.display = 'flex';
        });
    }
    
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveArticle();
        });
    }
    
    // Load initial articles
    loadArticles();
}

// Initialize videos management
function initVideosManagement() {
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoForm = document.getElementById('videoForm');
    
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', function() {
            // Reset form for new video
            videoForm.reset();
            document.getElementById('videoModalTitle').textContent = 'Add New Video';
            document.getElementById('videoId').value = '';
            document.getElementById('videoThumbnailPreview').src = '';
            
            // Show modal
            document.getElementById('videoModal').style.display = 'flex';
        });
    }
    
    if (videoForm) {
        videoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVideo();
        });
    }
    
    // Load initial videos
    loadVideos();
}

// Initialize links management
function initLinksManagement() {
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkForm = document.getElementById('linkForm');
    
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', function() {
            // Reset form for new link
            linkForm.reset();
            document.getElementById('linkModalTitle').textContent = 'Add New Link';
            document.getElementById('linkId').value = '';
            document.getElementById('linkIcon').value = 'fas fa-globe';
            
            // Show modal
            document.getElementById('linkModal').style.display = 'flex';
        });
    }
    
    if (linkForm) {
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLink();
        });
    }
    
    // Load initial links
    loadLinks();
}

// Initialize transport settings
function initTransportSettings() {
    const saveTransportBtn = document.getElementById('saveTransportSettingsBtn');
    
    if (saveTransportBtn) {
        saveTransportBtn.addEventListener('click', function() {
            saveTransportSettings();
        });
    }
    
    // Load initial settings
    loadTransportSettings();
}

// Initialize settings functionality
function initSettings() {
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            saveUserAdminSettings();
        });
    }
}

// Mock implementations of data functions (to be replaced with actual API calls)
function displayPictures(category) {
    // Implementation would load pictures from API/storage
    console.log('Loading pictures for category:', category);
}

function saveCarouselOrder() {
    // Implementation would save carousel order to API/storage
    console.log('Saving carousel order');
}

function displayCarouselImages() {
    // Implementation would load carousel images from API/storage
    console.log('Loading carousel images');
}

function loadArticles() {
    // Implementation would load articles from API/storage
    console.log('Loading articles');
}

function saveArticle() {
    // Implementation would save article to API/storage
    console.log('Saving article');
}

function loadVideos() {
    // Implementation would load videos from API/storage
    console.log('Loading videos');
}

function saveVideo() {
    // Implementation would save video to API/storage
    console.log('Saving video');
}

function loadLinks() {
    // Implementation would load links from API/storage
    console.log('Loading links');
}

function saveLink() {
    // Implementation would save link to API/storage
    console.log('Saving link');
}

function loadTransportSettings() {
    // Implementation would load transport settings from API/storage
    console.log('Loading transport settings');
}

function saveTransportSettings() {
    // Implementation would save transport settings to API/storage
    console.log('Saving transport settings');
}

function saveUserAdminSettings() {
    // Implementation would save user admin settings to API/storage
    console.log('Saving user admin settings');
}

// Helper function to preview image before upload
function previewImage(input, previewElement) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
} 