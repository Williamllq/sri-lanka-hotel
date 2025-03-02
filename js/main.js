// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查 translations 是否正确加载
    if (typeof translations === 'undefined') {
        console.error('translations.js not loaded!');
        return;
    }
    
    // 注意：语言切换逻辑已移至 language-switcher.js
    
    // 导航栏滚动效果
    const nav = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
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
    const slides = Array.from(track.children);
    const nextButton = carousel.querySelector('.carousel-button.next');
    const prevButton = carousel.querySelector('.carousel-button.prev');
    
    if (!slides.length) return;
    
    let currentIndex = 0;
    const slidesToShow = window.innerWidth < 768 ? 1 : 3;
    
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
        
        nextButton.disabled = currentIndex >= slides.length - updateSlidesToShow();
        nextButton.style.opacity = currentIndex >= slides.length - updateSlidesToShow() ? '0.5' : '1';
    }
    
    // 监听按钮点击
    nextButton.addEventListener('click', () => {
        if (currentIndex < slides.length - updateSlidesToShow()) {
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