// Gallery filtering and modern display functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const prevButton = document.querySelector('.prev-category');
    const nextButton = document.querySelector('.next-category');
    const featuredImage = document.querySelector('.featured-image');
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDesc = document.querySelector('.featured-desc');
    const galleryThumbnails = document.querySelector('.gallery-thumbnails');
    const currentCategorySpan = document.querySelector('.current-category');
    
    // 所有可用的类别 - 与管理员页面保持一致
    // 管理员页面和用户页面现在都使用相同的类别: 'scenery', 'wildlife', 'culture', 'food', 'beach'
    const categories = ['scenery', 'wildlife', 'culture', 'food', 'beach'];
    
    let currentCategoryIndex = 1; // 默认从wildlife开始 (索引1)
    let currentItems = [];
    let currentItemIndex = 0;
    let slideInterval;
    
    // 初始化 - 从原始画廊中提取数据并显示在现代布局中
    function initializeGallery() {
        console.log('Initializing gallery...');
        // 确保原始画廊项目存在
        if (galleryItems.length === 0) {
            console.log('No gallery items found');
            return;
        }
        
        console.log(`Found ${galleryItems.length} gallery items`);
        
        // 初始化第一个类别
        filterByCategory(currentCategoryIndex);
    }
    
    // 根据类别筛选项目并更新显示
    function filterByCategory(categoryIndex) {
        console.log(`Filtering by category index: ${categoryIndex}`);
        // 停止当前的轮播
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        // 获取当前类别
        const category = categories[categoryIndex];
        console.log(`Selected category: ${category}`);
        
        // 更新按钮状态
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 更新类别指示器
        if (currentCategorySpan) {
            currentCategorySpan.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        }
        
        // 筛选当前类别的项目
        currentItems = Array.from(galleryItems).filter(item => {
            const itemCategory = item.getAttribute('data-category');
            console.log(`Item category: ${itemCategory}, Checking against: ${category}`);
            return itemCategory === category;
        });
        
        console.log(`Found ${currentItems.length} items for category ${category}`);
        
        if (currentItems.length === 0) {
            console.log('No items found for this category');
            // 如果没有找到项目，显示一个默认消息
            if (featuredImage) {
                featuredImage.style.backgroundImage = '';
                featuredTitle.textContent = 'No images found';
                featuredDesc.textContent = 'There are no images in this category yet.';
            }
            return;
        }
        
        // 重置当前项目索引
        currentItemIndex = 0;
        
        // 更新缩略图
        updateThumbnails();
        
        // 显示第一个项目作为特色图片
        updateFeaturedImage(0);
        
        // 开始轮播
        startSlideshow();
    }
    
    // 更新缩略图区域
    function updateThumbnails() {
        // 清空缩略图容器
        if (!galleryThumbnails) {
            console.log('Gallery thumbnails container not found');
            return;
        }
        
        galleryThumbnails.innerHTML = '';
        
        // 为每个当前类别的项目创建缩略图
        currentItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (!img) {
                console.log('Image not found in gallery item');
                return;
            }
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'gallery-thumbnail';
            if (index === currentItemIndex) {
                thumbnail.classList.add('active');
            }
            
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = img.src;
            thumbnailImg.alt = img.alt;
            
            thumbnail.appendChild(thumbnailImg);
            galleryThumbnails.appendChild(thumbnail);
            
            // 添加点击事件
            thumbnail.addEventListener('click', function() {
                updateFeaturedImage(index);
                
                // 更新活动缩略图
                document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                this.classList.add('active');
                
                // 重置轮播计时器
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
                startSlideshow();
            });
        });
    }
    
    // 更新特色图片
    function updateFeaturedImage(index) {
        if (currentItems.length === 0 || index >= currentItems.length) return;
        
        currentItemIndex = index;
        
        const item = currentItems[index];
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-title');
        const desc = item.querySelector('.gallery-item-desc');
        
        if (img && featuredImage) {
            // 使用img元素替代背景图片
            featuredImage.innerHTML = '';
            const newImg = document.createElement('img');
            newImg.src = img.src;
            newImg.alt = img.alt;
            newImg.style.width = '100%';
            newImg.style.height = '100%';
            newImg.style.objectFit = 'cover';
            featuredImage.appendChild(newImg);
        }
        
        if (title && featuredTitle) {
            featuredTitle.textContent = title.textContent;
        }
        
        if (desc && featuredDesc) {
            featuredDesc.textContent = desc.textContent;
        }
        
        // 更新活动缩略图
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // 切换到下一个项目
    function nextItem() {
        if (currentItems.length <= 1) return;
        const newIndex = (currentItemIndex + 1) % currentItems.length;
        updateFeaturedImage(newIndex);
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
    
    // 开始轮播
    function startSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        slideInterval = setInterval(nextItem, 5000); // 每5秒切换一次项目
    }
    
    // 设置筛选按钮点击事件
    filterButtons.forEach((button) => {
        button.addEventListener('click', function() {
            console.log('Filter button clicked:', this.getAttribute('data-filter'));
            // 找到对应的类别索引
            const category = this.getAttribute('data-filter');
            const categoryIndex = categories.indexOf(category);
            
            if (categoryIndex !== -1) {
                currentCategoryIndex = categoryIndex;
                // 筛选项目
                filterByCategory(currentCategoryIndex);
            } else {
                console.log(`Category ${category} not found in categories array`);
            }
        });
    });
    
    // 设置导航按钮点击事件
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            // 停止自动轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            
            // 切换到上一个类别
            prevCategory();
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
        });
    }
    
    // 添加悬停效果
    if (featuredImage && featuredImage.parentElement) {
        featuredImage.parentElement.addEventListener('mouseenter', function() {
            // 暂停轮播
            if (slideInterval) {
                clearInterval(slideInterval);
            }
        });
        
        featuredImage.parentElement.addEventListener('mouseleave', function() {
            // 恢复轮播
            startSlideshow();
        });
    }
    
    // 初始化画廊
    initializeGallery();
});
