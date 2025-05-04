/**
 * Gallery Display Fix
 * 修复前端网站不能正确显示管理员上传图片的问题
 */

(function() {
    'use strict';
    
    console.log('Gallery Display Fix loaded');
    
    // 页面加载后初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 立即执行一次gallery初始化
        setTimeout(initializeGallery, 500);
        
        // 监听图片同步事件
        document.addEventListener('picturesSynced', function(e) {
            console.log('Pictures synced event received, refreshing gallery...');
            initializeGallery();
        });
        
        // 监听画廊刷新事件
        document.addEventListener('galleryRefresh', function() {
            console.log('Gallery refresh event received');
            initializeGallery();
        });
    });
    
    /**
     * 初始化画廊，加载管理员上传的图片
     */
    function initializeGallery() {
        console.log('Initializing gallery with admin pictures...');
        
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) {
            console.log('Gallery grid not found, skipping initialization');
            return;
        }
        
        // 获取图片数据
        const pictures = getSitePictures();
        
        console.log(`Found ${pictures.length} pictures to display`);
        
        // 清空现有内容
        galleryGrid.innerHTML = '';
        
        if (pictures.length === 0) {
            galleryGrid.innerHTML = '<div class="no-images-message">No images found. Please upload some images in the admin panel.</div>';
            return;
        }
        
        // 创建画廊项
        pictures.forEach(function(picture) {
            // 创建图片项元素
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', picture.category);
            
            // 创建图片项内容
            galleryItem.innerHTML = `
                <img src="${picture.url}" alt="${picture.name || 'Gallery Image'}">
                <div class="gallery-item-info">
                    <h3 class="gallery-item-title">${picture.name || 'Sri Lanka Image'}</h3>
                    <p class="gallery-item-desc">${picture.description || 'Discover the beauty of Sri Lanka'}</p>
                </div>
            `;
            
            // 添加到画廊
            galleryGrid.appendChild(galleryItem);
        });
        
        // 添加过滤器功能
        setupCategoryFilters();
        
        // 触发画廊更新完成事件
        const event = new CustomEvent('galleryInitialized', {
            detail: { count: pictures.length }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 设置类别过滤功能
     */
    function setupCategoryFilters() {
        const filterButtons = document.querySelectorAll('.gallery-filter-btn');
        if (!filterButtons.length) return;
        
        filterButtons.forEach(function(button) {
            // 移除旧的事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 添加新的事件监听器
            newButton.addEventListener('click', function() {
                // 切换活动状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                newButton.classList.add('active');
                
                // 获取类别值
                const category = newButton.getAttribute('data-filter');
                
                // 过滤画廊项
                const galleryItems = document.querySelectorAll('.gallery-item');
                galleryItems.forEach(function(item) {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                console.log(`Filtered gallery by category: ${category}`);
            });
        });
        
        // 默认选中第一个按钮
        if (filterButtons[0]) {
            filterButtons[0].click();
        }
    }
    
    /**
     * 获取前端图片数据
     */
    function getSitePictures() {
        try {
            // 尝试从localStorage获取图片
            const data = localStorage.getItem('sitePictures');
            if (!data) return [];
            
            const pictures = JSON.parse(data);
            if (!Array.isArray(pictures)) return [];
            
            return pictures;
        } catch (e) {
            console.error('Error getting site pictures:', e);
            return [];
        }
    }
    
    // 暴露公共函数
    window.galleryDisplayFix = {
        initializeGallery: initializeGallery,
        getSitePictures: getSitePictures
    };
})(); 