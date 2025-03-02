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
    
    // 图片轮播功能
    initCarousel();
    
    // Display all images from admin in the gallery section
    displayAdminImages();
});

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