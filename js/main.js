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
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-button.next');
        const prevButton = document.querySelector('.carousel-button.prev');
        
        let currentIndex = 0;
        const slideWidth = slides[0].getBoundingClientRect().width;
        
        // 设置幻灯片位置
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });
        
        // 移动幻灯片
        const moveToSlide = (track, currentIndex) => {
            track.style.transform = 'translateX(-' + currentIndex * slideWidth + 'px)';
        };
        
        // 下一张
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slides.length;
                moveToSlide(track, currentIndex);
            });
        }
        
        // 上一张
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                moveToSlide(track, currentIndex);
            });
        }
    }
}); 