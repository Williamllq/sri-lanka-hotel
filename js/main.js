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
});

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
    console.log("Found stored carousel images:", storedCarouselImages ? "Yes" : "No");
    
    // If we have stored images, replace the carousel slides with them
    if (storedCarouselImages) {
        try {
            const carouselImages = JSON.parse(storedCarouselImages);
            console.log("Parsed carousel images:", carouselImages.length);
            
            // Only proceed if we have images
            if (carouselImages && carouselImages.length > 0) {
                // Clear existing slides
                track.innerHTML = '';
                console.log("Cleared existing slides, adding", carouselImages.length, "new slides");
                
                // Add slides from localStorage
                carouselImages.forEach((image, index) => {
                    console.log(`Adding image ${index + 1}:`, image.name);
                    const slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    
                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = image.name || 'Carousel Image';
                    img.onerror = function() {
                        console.error(`Failed to load image: ${image.url}`);
                        // Replace with placeholder
                        this.src = 'images/placeholder.jpg';
                        this.alt = 'Image not available';
                    };
                    
                    slide.appendChild(img);
                    track.appendChild(slide);
                });
            } else {
                console.warn("No carousel images found in localStorage or array is empty");
            }
        } catch (e) {
            console.error('Error loading carousel images:', e);
        }
    } else {
        console.log("Using default carousel slides");
    }
    
    // Check if we have slides after possible replacement
    const slides = Array.from(track.children);
    console.log("Final carousel slide count:", slides.length);
    
    if (slides.length === 0) {
        console.warn("No slides found in carousel");
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
        // 计算每个幻灯片宽度
        const carouselWidth = carousel.clientWidth - parseInt(window.getComputedStyle(carousel).paddingLeft) - parseInt(window.getComputedStyle(carousel).paddingRight);
        const slideWidth = carouselWidth / updateSlidesToShow();
        
        // 设置每个幻灯片宽度
        slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        
        // 移动到起始位置
        moveToSlide(currentIndex);
    }
    
    // 移动幻灯片
    function moveToSlide(index) {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${index * slideWidth}px)`;
        currentIndex = index;
        
        // 更新按钮状态
        updateButtonsState();
    }
    
    // 更新按钮状态
    function updateButtonsState() {
        prevButton.disabled = currentIndex === 0;
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        
        const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
        nextButton.disabled = currentIndex >= maxIndex;
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }
    
    // 监听按钮点击
    nextButton.addEventListener('click', () => {
        const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
        if (currentIndex < maxIndex) {
            moveToSlide(currentIndex + 1);
        }
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        }
    });
    
    // 监听窗口大小改变
    window.addEventListener('resize', setupCarousel);
    
    // 初始化
    setupCarousel();
    console.log("Carousel initialization complete");
} 