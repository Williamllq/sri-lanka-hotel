// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查 translations 是否正确加载
    if (typeof translations === 'undefined') {
        console.error('translations.js not loaded!');
        // Continue anyway to avoid breaking the site
    }
    
    // 注意：语言切换逻辑已移至 language-switcher.js
    
    // 导航菜单响应式处理
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // 滚动时导航栏效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Initialize the Discover More tabs
    initDiscoverTabs();
    
    // Display all images from admin in the gallery section
    displayAdminImages();
});

// Initialize the tabs in the Discover More section
function initDiscoverTabs() {
    const tabs = document.querySelectorAll('.discover-tab');
    const contents = document.querySelectorAll('.discover-content');
    
    if (tabs.length === 0 || contents.length === 0) {
        console.warn("Discover tabs or content not found");
        return;
    }
    
    console.log("Initializing discover tabs...");
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the tab data attribute and find matching content
            const tabId = this.getAttribute('data-tab');
            const content = document.getElementById(tabId + '-content');
            
            if (content) {
                content.classList.add('active');
                console.log(`Switched to ${tabId} tab`);
            } else {
                console.warn(`Content with ID ${tabId}-content not found`);
            }
        });
    });
    
    // Initialize "Load More" buttons
    const loadMoreButtons = document.querySelectorAll('.load-more-btn');
    
    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            // This is where you would implement loading more content
            // For example, through an API call or revealing hidden content
            console.log("Load more button clicked");
            alert("More content would load here. This feature will be implemented with actual content.");
        });
    });
    
    // Initialize video thumbnails to show a modal or play video
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoTitle = this.parentElement.querySelector('h4').textContent;
            console.log(`Video clicked: ${videoTitle}`);
            alert(`Video "${videoTitle}" would play here. This feature will be implemented with actual video content.`);
        });
    });
}

// Display images uploaded from admin dashboard in the website gallery
function displayAdminImages() {
    const gallerySection = document.querySelector('.gallery-grid');
    if (!gallerySection) {
        console.warn("Gallery grid not found, skipping image display");
        return;
    }
    
    console.log("Initializing gallery with admin images...");
    
    // Load all images from localStorage (from admin dashboard)
    const storedPictures = localStorage.getItem('sitePictures');
    
    if (!storedPictures) {
        console.log("No uploaded images found in localStorage");
        return;
    }
    
    try {
        const pictures = JSON.parse(storedPictures);
        console.log(`Found ${pictures.length} images to display in gallery`);
        
        // Clear existing gallery items if any
        gallerySection.innerHTML = '';
        
        // Add each image to the gallery
        pictures.forEach(picture => {
            // Create gallery item
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', picture.category);
            
            // Create image container with overlay for description
            galleryItem.innerHTML = `
                <div class="gallery-image-container">
                    <img src="${picture.url}" alt="${picture.name}" class="gallery-image">
                    <div class="gallery-overlay">
                        <h3>${picture.name}</h3>
                        <p>${picture.description || ''}</p>
                    </div>
                </div>
            `;
            
            // Add to gallery
            gallerySection.appendChild(galleryItem);
        });
        
        // Add filtering functionality if category buttons exist
        const categoryButtons = document.querySelectorAll('.gallery-filter-btn');
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const category = this.getAttribute('data-filter');
                    
                    // Remove active class from all buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Show all items or filter by category
                    const items = document.querySelectorAll('.gallery-item');
                    items.forEach(item => {
                        if (category === 'all' || item.getAttribute('data-category') === category) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        }
        
    } catch (error) {
        console.error("Error displaying admin images:", error);
    }
}

// 初始化轮播功能
function initCarousel() {
    console.log("Initializing carousel...");
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) {
        console.warn("Carousel element not found");
        return;
    }
    
    const track = carousel.querySelector('.carousel-track');
    if (!track) {
        console.warn("Carousel track element not found");
        return;
    }
    
    // Load carousel images from localStorage
    const storedCarouselImages = localStorage.getItem('siteCarouselImages');
    console.log("Checking for stored carousel images...");
    
    // Default images in case no localStorage data or error occurs
    const defaultImages = [
        { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya-rock.jpg' },
        { id: 4, name: 'Sri Lankan Elephant', category: 'wildlife', url: 'images/elephant.jpg' },
        { id: 5, name: 'Train to Ella', category: 'transport', url: 'images/train-ella.jpg' }
    ];
    
    // If we have stored images, replace the carousel slides with them
    let usedImages = defaultImages;
    
    if (storedCarouselImages) {
        try {
            const carouselImages = JSON.parse(storedCarouselImages);
            console.log("Found carousel images in localStorage:", carouselImages.length);
            
            // Use stored images if available and valid
            if (carouselImages && carouselImages.length > 0) {
                usedImages = carouselImages;
            } else {
                console.warn("No valid carousel images found in localStorage, using defaults");
            }
        } catch (e) {
            console.error('Error parsing carousel images from localStorage:', e);
            console.log("Using default carousel images instead");
        }
    } else {
        console.log("No carousel images found in localStorage, using defaults");
    }
    
    // Clear existing slides
    console.log("Clearing existing slides and adding", usedImages.length, "slides");
    track.innerHTML = '';
    
    // Add slides from our image source (localStorage or defaults)
    usedImages.forEach((image, index) => {
        console.log(`Adding slide ${index + 1}:`, image.name || 'Unnamed image');
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        // Create container for image and caption
        const container = document.createElement('div');
        container.className = 'carousel-image-container';
        
        const img = document.createElement('img');
        
        // Handle both data URLs (from localStorage) and regular image paths
        img.src = image.url;
        img.alt = image.name || 'Carousel Image';
        
        // Error handling for image loading
        img.onerror = function() {
            console.error(`Failed to load image: ${image.url.substring(0, 100)}...`);
            this.src = 'images/placeholder.jpg';
            this.alt = 'Image not available';
        };
        
        // Add caption with description if available
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.innerHTML = `
            <h3>${image.name || 'Sri Lanka Image'}</h3>
            ${image.description ? `<p>${image.description}</p>` : ''}
        `;
        
        container.appendChild(img);
        container.appendChild(caption);
        slide.appendChild(container);
        track.appendChild(slide);
    });
    
    // Check if we have slides after possible replacement
    const slides = Array.from(track.children);
    console.log("Final carousel slide count:", slides.length);
    
    if (slides.length === 0) {
        console.warn("No slides found in carousel after setup");
        return;
    }
    
    const nextButton = carousel.querySelector('.carousel-button.next');
    const prevButton = carousel.querySelector('.carousel-button.prev');
    
    let currentIndex = 0;
    
    // 根据视窗宽度调整可见幻灯片数量
    function updateSlidesToShow() {
        return window.innerWidth < 768 ? 1 : 
               window.innerWidth < 1024 ? 2 : 3;
    }
    
    // 设置初始状态
    function setupCarousel() {
        try {
            // 计算每个幻灯片宽度
            const carouselWidth = carousel.clientWidth - parseInt(window.getComputedStyle(carousel).paddingLeft) - parseInt(window.getComputedStyle(carousel).paddingRight);
            const slideWidth = carouselWidth / updateSlidesToShow();
            
            // 设置每个幻灯片宽度
            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            
            // 移动到起始位置
            moveToSlide(currentIndex);
            console.log("Carousel setup complete. Width:", carouselWidth, "px, Slide width:", slideWidth, "px");
        } catch (error) {
            console.error("Error setting up carousel:", error);
        }
    }
    
    // 移动幻灯片
    function moveToSlide(index) {
        try {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${index * slideWidth}px)`;
            currentIndex = index;
            
            // 更新按钮状态
            updateButtonsState();
        } catch (error) {
            console.error("Error moving carousel slide:", error);
        }
    }
    
    // 更新按钮状态
    function updateButtonsState() {
        if (!prevButton || !nextButton) {
            console.warn("Carousel navigation buttons not found");
            return;
        }
        
        prevButton.disabled = currentIndex === 0;
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        
        const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
        nextButton.disabled = currentIndex >= maxIndex;
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }
    
    // 监听按钮点击
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
            if (currentIndex < maxIndex) {
                moveToSlide(currentIndex + 1);
            }
        });
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            }
        });
    }
    
    // 监听窗口大小改变
    window.addEventListener('resize', setupCarousel);
    
    // 初始化
    setupCarousel();
    console.log("Carousel initialization complete");
}

// Function to initialize the Discover More section
function initDiscoverMore() {
    console.log('Initializing Discover More section...');
    
    // Initialize the tabs
    const discoverTabs = document.querySelectorAll('.discover-tab');
    const discoverContents = document.querySelectorAll('.discover-content');
    
    discoverTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and content
            discoverTabs.forEach(t => t.classList.remove('active'));
            discoverContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load content from localStorage
    loadArticles();
    loadVideos();
    loadLinks();
}

// Load articles from localStorage
function loadArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;
    
    const articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = '<p class="no-content">No articles available yet. Check back soon!</p>';
        return;
    }
    
    articlesGrid.innerHTML = '';
    
    // Get the 6 most recent articles
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayArticles = articles.slice(0, 6);
    
    displayArticles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'discover-card article-card';
        
        const articleUrl = article.externalLink || '#';
        const targetAttr = article.externalLink ? ' target="_blank"' : '';
        
        articleCard.innerHTML = `
            <a href="${articleUrl}"${targetAttr}>
                <div class="discover-card-img">
                    <img src="${article.imageUrl || 'images/placeholder-article.jpg'}" alt="${article.title}">
                </div>
                <div class="discover-card-content">
                    <h3>${article.title}</h3>
                    <p>${article.description.substring(0, 120)}${article.description.length > 120 ? '...' : ''}</p>
                    <span class="read-more">Read More</span>
                </div>
            </a>
        `;
        
        articlesGrid.appendChild(articleCard);
    });
    
    // Add "Load More" button if we have more articles
    if (articles.length > 6) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More Articles';
        loadMoreBtn.addEventListener('click', function() {
            // In a real application, you would load more articles here
            alert('Load more functionality would be implemented here in a full application');
        });
        articlesGrid.parentElement.appendChild(loadMoreBtn);
    }
}

// Load videos from localStorage
function loadVideos() {
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) return;
    
    const videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
    
    if (videos.length === 0) {
        videosGrid.innerHTML = '<p class="no-content">No videos available yet. Check back soon!</p>';
        return;
    }
    
    videosGrid.innerHTML = '';
    
    // Get the 6 most recent videos
    videos.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayVideos = videos.slice(0, 6);
    
    displayVideos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'discover-card video-card';
        
        // Create a YouTube thumbnail URL if it's a YouTube video
        let thumbnailUrl = video.thumbnailUrl;
        if (!thumbnailUrl && video.videoUrl.includes('youtube.com')) {
            const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        }
        
        videoCard.innerHTML = `
            <div class="discover-card-img" data-video-url="${video.videoUrl}">
                <img src="${thumbnailUrl || 'images/placeholder-video.jpg'}" alt="${video.title}">
                <div class="play-button">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="discover-card-content">
                <h3>${video.title}</h3>
                <p>${video.description.substring(0, 120)}${video.description.length > 120 ? '...' : ''}</p>
            </div>
        `;
        
        // Add click handler to play the video
        const videoImg = videoCard.querySelector('.discover-card-img');
        videoImg.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-video-url');
            
            // Simple modal for playing the video
            const videoModal = document.createElement('div');
            videoModal.className = 'video-modal';
            
            let videoEmbed;
            if (videoUrl.includes('youtube.com')) {
                const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    videoEmbed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else if (videoUrl.includes('vimeo.com')) {
                const videoId = videoUrl.split('vimeo.com/')[1];
                if (videoId) {
                    videoEmbed = `<iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else {
                videoEmbed = `<video controls autoplay><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }
            
            videoModal.innerHTML = `
                <div class="video-modal-content">
                    <span class="close-video">&times;</span>
                    <div class="video-container">
                        ${videoEmbed}
                    </div>
                </div>
            `;
            
            document.body.appendChild(videoModal);
            
            // Close modal functionality
            const closeBtn = videoModal.querySelector('.close-video');
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(videoModal);
            });
            
            // Close by clicking outside
            videoModal.addEventListener('click', function(e) {
                if (e.target === videoModal) {
                    document.body.removeChild(videoModal);
                }
            });
        });
        
        videosGrid.appendChild(videoCard);
    });
    
    // Add "Load More" button if we have more videos
    if (videos.length > 6) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More Videos';
        loadMoreBtn.addEventListener('click', function() {
            // In a real application, you would load more videos here
            alert('Load more functionality would be implemented here in a full application');
        });
        videosGrid.parentElement.appendChild(loadMoreBtn);
    }
}

// Load links from localStorage
function loadLinks() {
    const linksGrid = document.getElementById('linksGrid');
    if (!linksGrid) return;
    
    const links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
    
    if (links.length === 0) {
        linksGrid.innerHTML = '<p class="no-content">No links available yet. Check back soon!</p>';
        return;
    }
    
    linksGrid.innerHTML = '';
    
    // Sort by date, newest first
    links.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    links.forEach(link => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';
        
        linkCard.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                <i class="${link.icon || 'fas fa-link'}"></i>
                <div class="link-content">
                    <h3>${link.title}</h3>
                    <p>${link.description}</p>
                </div>
                <i class="fas fa-external-link-alt external-icon"></i>
            </a>
        `;
        
        linksGrid.appendChild(linkCard);
    });
}

// Initialize transport price calculation functionality
function initTransportCalculation() {
    console.log('Initializing transport calculation...');
    
    const calculateButton = document.getElementById('calculateFareBtn');
    if (!calculateButton) return;
    
    calculateButton.addEventListener('click', calculatePrice);
}

// Function to calculate the transportation price
function calculatePrice() {
    // Get the inputs
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const tripDate = document.getElementById('tripDate').value;
    const tripTime = document.getElementById('tripTime').value;
    const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value || 'sedan';
    
    if (!pickupLocation || !destinationLocation) {
        alert('Please enter both pickup and destination locations');
        return;
    }
    
    // Get distance (in a real app, this would come from the Maps API)
    // For demo purposes, we'll use the distance from the map.js or a fallback value
    let distance = window.calculatedDistance || 10; // km
    
    // Get transport settings from localStorage
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
    
    const settings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
    
    // Calculate base price
    let price = settings.baseFare + (distance * settings.ratePerKm);
    
    // Apply vehicle type multiplier
    price *= settings.vehicleRates[vehicleType];
    
    // Check if rush hour, night time, or weekend
    if (tripDate && tripTime) {
        const tripDateTime = new Date(`${tripDate}T${tripTime}`);
        const hour = tripDateTime.getHours();
        const day = tripDateTime.getDay();
        
        // Rush hour: 7-9 AM or 4-6 PM on weekdays
        if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
            if (day >= 1 && day <= 5) {
                price *= settings.rushHourMultiplier;
            }
        }
        
        // Night time: 10 PM - 6 AM
        if (hour >= 22 || hour <= 6) {
            price *= settings.nightMultiplier;
        }
        
        // Weekend: Saturday and Sunday
        if (day === 0 || day === 6) {
            price *= settings.weekendMultiplier;
        }
    }
    
    // Display the result
    const resultElement = document.getElementById('fareResult');
    if (resultElement) {
        resultElement.textContent = `Estimated fare: $${price.toFixed(2)}`;
        resultElement.style.display = 'block';
    }
    
    return price;
}

// Call initialization functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the navigation menu
    initNavigation();
    
    // Initialize the image showcase carousel
    initImageCarousel();
    
    // Initialize gallery images from localStorage
    displayAdminImages();
    
    // Initialize the discover more tabs and content
    initDiscoverMore();
    
    // Initialize transport price calculation
    initTransportCalculation();
    
    // Initialize modals and feedback
    initModals();
    
    // Initialize the animation on scroll
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
});

// Initialize all modals and feedback functionality
function initModals() {
    // Feedback modal
    const feedbackModal = document.getElementById('feedbackModal');
    const showFeedbackBtn = document.getElementById('showFeedback');
    const closeFeedbackBtn = feedbackModal ? feedbackModal.querySelector('.close-modal') : null;
    
    if (feedbackModal && showFeedbackBtn) {
        // Show feedback modal when clicking the button
        showFeedbackBtn.addEventListener('click', function() {
            feedbackModal.classList.add('active');
        });
        
        // Close modal when clicking the close button
        if (closeFeedbackBtn) {
            closeFeedbackBtn.addEventListener('click', function() {
                feedbackModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside the modal content
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('active');
            }
        });
    }
    
    // Handle feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('feedbackName').value;
            const country = document.getElementById('feedbackCountry').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
            const feedback = document.getElementById('feedbackText').value;
            
            // In a real app, you would send this data to a server
            console.log('Feedback submitted:', { name, country, rating, feedback });
            
            // Show success message
            alert('Thank you for your feedback!');
            
            // Reset form and close modal
            feedbackForm.reset();
            feedbackModal.classList.remove('active');
        });
    }
    
    // Map modal
    const mapModal = document.getElementById('mapModal');
    const closeMapBtn = mapModal ? mapModal.querySelector('.close-modal') : null;
    
    if (mapModal && closeMapBtn) {
        closeMapBtn.addEventListener('click', function() {
            mapModal.classList.remove('active');
        });
        
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                mapModal.classList.remove('active');
            }
        });
    }
} 