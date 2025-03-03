// Gallery filtering and carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    
    let currentCategory = 'wildlife'; // 默认显示野生动物类别
    let currentItems = [];
    let currentIndex = 0;
    let slideInterval;
    
    // 初始化 - 筛选并显示当前类别的项目
    function filterItems(category) {
        // 停止当前的轮播
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        // 更新当前类别
        currentCategory = category;
        
        // 隐藏所有项目
        galleryItems.forEach(item => {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        });
        
        // 筛选当前类别的项目
        currentItems = Array.from(galleryItems).filter(item => 
            item.getAttribute('data-category') === currentCategory
        );
        
        if (currentItems.length === 0) return;
        
        // 重置索引
        currentIndex = 0;
        
        // 显示第一个项目
        showCurrentItem();
        
        // 开始轮播
        startSlideshow();
    }
    
    // 显示当前项目
    function showCurrentItem() {
        if (currentItems.length === 0) return;
        
        currentItems[currentIndex].style.display = 'block';
        setTimeout(() => {
            currentItems[currentIndex].style.opacity = '1';
        }, 50);
    }
    
    // 切换到下一个项目
    function nextSlide() {
        if (currentItems.length <= 1) return;
        
        // 隐藏当前项目
        currentItems[currentIndex].style.opacity = '0';
        setTimeout(() => {
            currentItems[currentIndex].style.display = 'none';
            
            // 更新索引
            currentIndex = (currentIndex + 1) % currentItems.length;
            
            // 显示下一个项目
            showCurrentItem();
        }, 300);
    }
    
    // 切换到上一个项目
    function prevSlide() {
        if (currentItems.length <= 1) return;
        
        // 隐藏当前项目
        currentItems[currentIndex].style.opacity = '0';
        setTimeout(() => {
            currentItems[currentIndex].style.display = 'none';
            
            // 更新索引
            currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
            
            // 显示上一个项目
            showCurrentItem();
        }, 300);
    }
    
    // 开始轮播
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000); // 每5秒切换一次
    }
    
    // 设置筛选按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活动状态
            this.classList.add('active');
            
            // 筛选项目
            filterItems(this.getAttribute('data-filter'));
        });
    });
    
    // 设置轮播控制按钮点击事件
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            // 停止自动轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            
            // 切换到上一个项目
            prevSlide();
            
            // 重新开始轮播
            setTimeout(startSlideshow, 2000);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            // 停止自动轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            
            // 切换到下一个项目
            nextSlide();
            
            // 重新开始轮播
            setTimeout(startSlideshow, 2000);
        });
    }
    
    // 添加悬停效果
    galleryItems.forEach(item => {
        const info = item.querySelector('.gallery-item-info');
        if (info) {
            item.addEventListener('mouseenter', function() {
                info.style.opacity = '1';
                info.style.transform = 'translateY(0)';
                
                // 暂停轮播
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
            });
            
            item.addEventListener('mouseleave', function() {
                info.style.opacity = '0.7';
                info.style.transform = 'translateY(10px)';
                
                // 恢复轮播
                startSlideshow();
            });
        }
    });
    
    // 初始化 - 筛选并显示默认类别的项目
    filterItems(currentCategory);
});
