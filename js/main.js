// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查 translations 是否正确加载
    if (typeof translations === 'undefined') {
        console.error('translations.js not loaded!');
        return;
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
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    
    // Check if we have carousel images in localStorage
    const storedCarouselImages = localStorage.getItem('siteCarouselImages');
    
    // If we have stored images, replace the carousel slides with them
    if (storedCarouselImages) {
        try {
            const carouselImages = JSON.parse(storedCarouselImages);
            
            // Only proceed if we have images
            if (carouselImages && carouselImages.length > 0) {
                // Clear existing slides
                track.innerHTML = '';
                
                // Add slides from localStorage
                carouselImages.forEach(image => {
                    const slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    
                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = image.name || 'Carousel Image';
                    
                    slide.appendChild(img);
                    track.appendChild(slide);
                });
            }
        } catch (e) {
            console.error('Error loading carousel images:', e);
        }
    }
    
    // Get updated slides after possible replacement
    const slides = Array.from(track.children);
    const nextButton = carousel.querySelector('.carousel-button.next');
    const prevButton = carousel.querySelector('.carousel-button.prev');
    
    if (!slides.length) return;
    
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
} 