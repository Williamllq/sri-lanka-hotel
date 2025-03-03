// Gallery filtering and carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    
    // 所有可用的类别
    const categories = ['scenery', 'wildlife', 'culture', 'food', 'beach'];
    let currentCategoryIndex = 1; // 默认从wildlife开始 (索引1)
    let slideInterval;
    
    // 初始化 - 筛选并显示当前类别的项目
    function filterByCategory(categoryIndex) {
        // 停止当前的轮播
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        // 获取当前类别
        const category = categories[categoryIndex];
        
        // 更新按钮状态
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 隐藏所有项目
        galleryItems.forEach(item => {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        });
        
        // 显示当前类别的项目
        const currentItems = Array.from(galleryItems).filter(item => 
            item.getAttribute('data-category') === category
        );
        
        if (currentItems.length === 0) return;
        
        // 显示当前类别的所有项目
        currentItems.forEach(item => {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
            }, 50);
        });
        
        // 开始轮播 - 切换到下一个类别
        startCategorySlideshow();
    }
    
    // 切换到下一个类别
    function nextCategory() {
        currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
        filterByCategory(currentCategoryIndex);
    }
    
    // 切换到上一个类别
    function prevCategory() {
        currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
        filterByCategory(currentCategoryIndex);
    }
    
    // 开始类别轮播
    function startCategorySlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        slideInterval = setInterval(nextCategory, 5000); // 每5秒切换一次类别
    }
    
    // 设置筛选按钮点击事件
    filterButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // 找到对应的类别索引
            const category = this.getAttribute('data-filter');
            currentCategoryIndex = categories.indexOf(category);
            
            // 筛选项目
            filterByCategory(currentCategoryIndex);
        });
    });
    
    // 设置轮播控制按钮点击事件
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            // 停止自动轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            
            // 切换到上一个类别
            prevCategory();
            
            // 重新开始轮播
            setTimeout(startCategorySlideshow, 2000);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            // 停止自动轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            
            // 切换到下一个类别
            nextCategory();
            
            // 重新开始轮播
            setTimeout(startCategorySlideshow, 2000);
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
                startCategorySlideshow();
            });
        }
    });
    
    // 初始化 - 从wildlife类别开始
    filterByCategory(currentCategoryIndex);
});
