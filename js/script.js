// Gallery carousel and filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentCategory = 'wildlife'; // 默认显示野生动物类别
    let currentIndex = 0;
    let filteredItems = [];
    
    // 初始化轮播
    function initCarousel() {
        // 根据当前类别筛选项目
        filteredItems = Array.from(galleryItems).filter(item => 
            item.getAttribute('data-category') === currentCategory
        );
        
        if (filteredItems.length === 0) return;
        
        // 隐藏所有项目
        galleryItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 显示当前项目
        currentIndex = 0;
        filteredItems[currentIndex].classList.add('active');
    }
    
    // 切换到下一个项目
    function nextSlide() {
        if (filteredItems.length <= 1) return;
        
        filteredItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % filteredItems.length;
        filteredItems[currentIndex].classList.add('active');
    }
    
    // 切换到上一个项目
    function prevSlide() {
        if (filteredItems.length <= 1) return;
        
        filteredItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        filteredItems[currentIndex].classList.add('active');
    }
    
    // 设置按钮点击事件
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // 设置自动轮播
    let autoplayInterval = setInterval(nextSlide, 5000);
    
    // 鼠标悬停时暂停自动轮播
    document.querySelector('.gallery-grid').addEventListener('mouseenter', function() {
        clearInterval(autoplayInterval);
    });
    
    // 鼠标离开时恢复自动轮播
    document.querySelector('.gallery-grid').addEventListener('mouseleave', function() {
        autoplayInterval = setInterval(nextSlide, 5000);
    });
    
    // 设置筛选按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活动状态
            this.classList.add('active');
            
            // 更新当前类别
            currentCategory = this.getAttribute('data-filter');
            
            // 重新初始化轮播
            initCarousel();
            
            // 重置自动轮播
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(nextSlide, 5000);
        });
    });
    
    // 初始化轮播
    initCarousel();
}); 