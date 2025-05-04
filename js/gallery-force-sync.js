/**
 * Gallery Force Sync
 * 强制同步管理员图片到前端显示，直接解析管理员图片并覆盖到前端
 */

(function() {
    'use strict';

    console.log('Gallery Force Sync loaded');

    // 所有已知可能存储图片的键
    const STORAGE_KEYS = [
        'adminPictures', 
        'sitePictures', 
        'galleryPictures', 
        'pictures', 
        'images'
    ];

    // 立即执行一次强制同步
    setTimeout(forceSync, 300);
    
    // 设置定期同步间隔
    const syncInterval = setInterval(forceSync, 2000);
    
    // 监听DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, forcing sync...');
        forceSync();
        
        // 添加事件监听器
        document.addEventListener('galleryRefresh', forceSync);
        document.addEventListener('picturesSynced', forceSync);
    });

    /**
     * 强制同步所有图片数据
     */
    function forceSync() {
        console.log('Running gallery force sync...');
        
        // 1. 从所有可能的存储中获取图片
        const allImages = getAllImagesFromStorage();
        
        // 2. 如果已经登录了管理员界面，从DOM提取
        if (window.location.href.includes('admin-dashboard.html')) {
            const domImages = extractImagesFromDOM();
            allImages.push(...domImages);
        }
        
        // 3. 从隐藏画廊中提取默认图片（位于前端页面）
        if (window.location.href.includes('index.html') || window.location.pathname === '/') {
            const defaultImages = extractDefaultImages();
            allImages.push(...defaultImages);
        }
        
        // 4. 去重并标准化
        const uniqueImages = deduplicateAndNormalizeImages(allImages);
        console.log(`Force sync found ${uniqueImages.length} unique images`);
        
        // 5. 保存到localStorage
        saveImagesToLocalStorage(uniqueImages);
        
        // 6. 触发显示
        updateGalleryDisplay(uniqueImages);
        
        return uniqueImages;
    }
    
    /**
     * 从所有已知的localStorage键中获取图片数据
     */
    function getAllImagesFromStorage() {
        let allImages = [];
        
        // 遍历所有可能的存储键
        STORAGE_KEYS.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        console.log(`Found ${parsed.length} images in ${key}`);
                        allImages.push(...parsed);
                    }
                }
            } catch (e) {
                console.warn(`Error reading from ${key}:`, e);
            }
        });
        
        return allImages;
    }
    
    /**
     * 从管理员面板DOM提取图片
     */
    function extractImagesFromDOM() {
        const images = [];
        
        // 尝试从图片网格提取
        const pictureItems = document.querySelectorAll('.picture-grid > div');
        if (pictureItems && pictureItems.length > 0) {
            console.log(`Found ${pictureItems.length} pictures in admin DOM`);
            
            pictureItems.forEach((item, index) => {
                // 获取图片信息
                const img = item.querySelector('img');
                if (!img || !img.src) return;
                
                const name = item.querySelector('h3, h4, .picture-name')?.textContent || 
                            item.querySelector('.picture-title')?.textContent || 
                            `Image ${index + 1}`;
                            
                // 尝试获取类别（从标签或类名）
                let category = 'scenery'; // 默认类别
                const categoryBadge = item.querySelector('.category-badge, .picture-category');
                
                if (categoryBadge) {
                    category = categoryBadge.textContent.toLowerCase().trim();
                } else if (item.classList.contains('wildlife')) {
                    category = 'wildlife';
                } else if (item.classList.contains('scenery')) {
                    category = 'scenery';
                } else if (item.classList.contains('culture')) {
                    category = 'culture';
                } else if (item.classList.contains('food')) {
                    category = 'food';
                } else if (item.classList.contains('beach')) {
                    category = 'beach';
                }

                // 处理各种类别变体
                category = normalizeCategory(category);
                
                // 创建图片对象
                images.push({
                    id: `dom_${Date.now()}_${index}`,
                    name: name,
                    category: category,
                    description: name,
                    url: img.src,
                    imageUrl: img.src,
                    uploadDate: new Date().toISOString()
                });
            });
        }
        
        return images;
    }
    
    /**
     * 从默认画廊提取图片
     */
    function extractDefaultImages() {
        const images = [];
        
        // 从隐藏的gallery-grid获取初始图片
        const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
        if (galleryItems && galleryItems.length > 0) {
            console.log(`Found ${galleryItems.length} default gallery items`);
            
            galleryItems.forEach((item, index) => {
                const img = item.querySelector('img');
                if (!img || !img.src) return;
                
                const title = item.querySelector('.gallery-item-title');
                const desc = item.querySelector('.gallery-item-desc');
                const itemCategory = item.getAttribute('data-category') || 'scenery';
                
                images.push({
                    id: `default_${index}`,
                    name: title ? title.textContent : 'Sri Lanka',
                    category: normalizeCategory(itemCategory),
                    description: desc ? desc.textContent : 'Discover Sri Lanka',
                    url: img.src,
                    imageUrl: img.src,
                    uploadDate: new Date().toISOString()
                });
            });
        }
        
        return images;
    }
    
    /**
     * 标准化类别名称
     */
    function normalizeCategory(category) {
        const categoryMap = {
            'wildlife': 'wildlife',
            'wild life': 'wildlife',
            'wild': 'wildlife',
            'animal': 'wildlife',
            'animals': 'wildlife',
            'scenery': 'scenery',
            'scene': 'scenery',
            'landscape': 'scenery',
            'landscapes': 'scenery',
            'culture': 'culture',
            'cultural': 'culture',
            'tradition': 'culture',
            'traditional': 'culture',
            'food': 'food',
            'cuisine': 'food',
            'foods': 'food',
            'beach': 'beach',
            'beaches': 'beach',
            'sea': 'beach',
            'ocean': 'beach'
        };
        
        // 转为小写并修剪空格
        const normalizedCategory = (category || '').toString().toLowerCase().trim();
        
        // 使用映射表或返回默认类别
        return categoryMap[normalizedCategory] || 
               (normalizedCategory === 'all' ? 'all' : 'scenery');
    }
    
    /**
     * 去重并标准化图片数组
     */
    function deduplicateAndNormalizeImages(images) {
        // 用于检查重复的集合
        const uniqueUrls = new Set();
        const result = [];
        
        // 处理每个图片
        images.forEach(img => {
            // 标准化URL
            let url = img.url || img.imageUrl || '';
            
            // 处理相对URL
            if (url && !url.match(/^(https?:\/\/|data:image|\/)/i)) {
                url = url.startsWith('images/') ? url : `images/${url}`;
            }
            
            // 跳过无效URL或重复URL
            if (!url || uniqueUrls.has(url)) return;
            
            // 添加到去重集合
            uniqueUrls.add(url);
            
            // 创建标准化的图片对象
            result.push({
                id: img.id || `img_${Date.now()}_${result.length}`,
                name: img.name || img.title || 'Sri Lanka Image',
                category: normalizeCategory(img.category),
                description: img.description || '',
                url: url,
                uploadDate: img.uploadDate || new Date().toISOString()
            });
        });
        
        return result;
    }
    
    /**
     * 保存图片到localStorage
     */
    function saveImagesToLocalStorage(images) {
        // 保存到所有常用的键
        try {
            localStorage.setItem('sitePictures', JSON.stringify(images));
            localStorage.setItem('adminPictures', JSON.stringify(images.map(img => ({
                ...img,
                imageUrl: img.url
            }))));
            console.log(`Saved ${images.length} images to localStorage`);
        } catch (e) {
            console.error('Error saving images to localStorage:', e);
        }
    }
    
    /**
     * 更新前端画廊显示
     */
    function updateGalleryDisplay(images) {
        if (!images || images.length === 0) {
            console.warn('No images to display in gallery');
            return;
        }
        
        console.log(`Updating gallery display with ${images.length} images`);
        
        // 首先检查是否在前端页面
        if (!window.location.href.includes('index.html') && window.location.pathname !== '/') {
            return;
        }
        
        // 尝试使用现有的galleryCategoryFix初始化
        if (window.galleryCategoryFix && typeof window.galleryCategoryFix.initGalleryFix === 'function') {
            window.galleryCategoryFix.initGalleryFix();
            
            // 确保筛选和轮播重新初始化
            try {
                const filterBtns = document.querySelectorAll('.gallery-filter-btn');
                if (filterBtns.length > 0) {
                    // 默认选中"全部"
                    const allBtn = Array.from(filterBtns).find(btn => 
                        btn.getAttribute('data-filter') === 'all' || 
                        btn.textContent.trim().toLowerCase() === 'all'
                    );
                    
                    if (allBtn) {
                        // 触发点击全部按钮
                        setTimeout(() => {
                            allBtn.click();
                        }, 100);
                    }
                }
            } catch (e) {
                console.error('Error initializing filter buttons:', e);
            }
            
            return;
        }
        
        // 如果没有现有函数，尝试手动更新DOM
        try {
            updateGalleryDOMDirectly(images);
        } catch (e) {
            console.error('Error updating gallery DOM directly:', e);
        }
    }
    
    /**
     * 直接更新DOM中的画廊
     */
    function updateGalleryDOMDirectly(images) {
        const featuredImage = document.querySelector('.featured-image');
        const featuredTitle = document.querySelector('.featured-title');
        const featuredDesc = document.querySelector('.featured-desc');
        const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
        
        if (!featuredImage || !featuredTitle || !featuredDesc || !thumbnailsContainer) {
            console.warn('Required gallery elements not found in DOM');
            return;
        }
        
        // 清空现有内容
        thumbnailsContainer.innerHTML = '';
        
        // 设置第一张图片为特色图片
        if (images.length > 0) {
            const firstImage = images[0];
            
            featuredImage.innerHTML = `
                <img src="${firstImage.url}" alt="${firstImage.name}" 
                     onerror="this.src='images/placeholder.jpg'; this.alt='Image not available';">
            `;
            featuredTitle.textContent = firstImage.name;
            featuredDesc.textContent = firstImage.description || 'Discover the beauty of Sri Lanka';
            
            // 添加所有缩略图
            images.forEach((img, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'gallery-thumbnail';
                if (index === 0) thumbnail.classList.add('active');
                
                thumbnail.innerHTML = `
                    <img src="${img.url}" alt="${img.name}" 
                         onerror="this.src='images/placeholder.jpg'; this.alt='Image not available';">
                `;
                
                // 添加点击事件
                thumbnail.addEventListener('click', function() {
                    // 更新所有缩略图的活动状态
                    document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
                        thumb.classList.remove('active');
                    });
                    thumbnail.classList.add('active');
                    
                    // 更新特色图片
                    featuredImage.innerHTML = `
                        <img src="${img.url}" alt="${img.name}" 
                             onerror="this.src='images/placeholder.jpg'; this.alt='Image not available';">
                    `;
                    featuredTitle.textContent = img.name;
                    featuredDesc.textContent = img.description || 'Discover the beauty of Sri Lanka';
                });
                
                thumbnailsContainer.appendChild(thumbnail);
            });
        } else {
            // 显示空画廊提示
            featuredImage.innerHTML = `
                <div class="empty-category">
                    <i class="fas fa-images"></i>
                    <p>No images available</p>
                </div>
            `;
            featuredTitle.textContent = 'No Images Available';
            featuredDesc.textContent = 'Please upload images in the admin panel';
        }
    }
    
    // 暴露公共API
    window.galleryForceSync = {
        forceSync: forceSync,
        extractImagesFromDOM: extractImagesFromDOM,
        extractDefaultImages: extractDefaultImages
    };
})(); 