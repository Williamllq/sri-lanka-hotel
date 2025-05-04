/**
 * Gallery Category & Carousel Fix
 * 修复前端网站Discover Sri Lanka区域的图片分类显示和轮播功能
 */

(function() {
    'use strict';
    
    console.log('Gallery Category & Carousel Fix loaded');
    
    // 当DOM加载完成时初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing gallery category fix...');
        setTimeout(initGalleryFix, 500);
        
        // 监听图片同步事件
        document.addEventListener('picturesSynced', function() {
            console.log('Pictures synced event received, refreshing gallery categories...');
            initGalleryFix();
        });
        
        // 添加额外的刷新事件监听
        document.addEventListener('galleryRefresh', function() {
            console.log('Gallery refresh event received');
            initGalleryFix();
        });
    });
    
    // 轮播计时器
    let carouselTimer = null;
    // 当前显示的类别 - 默认不限制类别，显示全部
    let currentCategory = 'all';
    // 当前特色图片索引
    let currentFeatureIndex = 0;
    
    /**
     * 初始化图库修复
     */
    function initGalleryFix() {
        console.log('Initializing gallery fix...');
        
        // 检查是否在前端页面
        const isGalleryPage = document.querySelector('.gallery-section') || 
                              document.querySelector('.gallery-filter') ||
                              document.querySelector('.gallery-grid');
        
        if (!isGalleryPage) {
            console.log('Not on gallery page, skipping gallery initialization');
            return;
        }
        
        console.log('Gallery page detected, initializing gallery components');
        
        // 如果定义了增强版同步函数，先运行一次
        if (window.adminPicturesSyncEnhance && 
            typeof window.adminPicturesSyncEnhance.syncPictures === 'function') {
            console.log('Running enhanced sync before initializing gallery');
            window.adminPicturesSyncEnhance.syncPictures();
        }
        
        // 提取默认图片
        extractDefaultImages();
        
        // 获取图片
        const pictures = getSiteImages();
        console.log(`Gallery found ${pictures ? pictures.length : 0} pictures to display`);
        
        // 设置过滤按钮
        setupFilterButtons();
        
        // 初始化显示全部类别
        filterAndDisplayCategory('all');
        
        // 启动轮播
        startCarousel();
    }
    
    /**
     * 从隐藏的原始gallery-grid中提取默认图片
     */
    function extractDefaultImages() {
        console.log('Extracting default images from hidden gallery...');
        const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
        if (!galleryItems || galleryItems.length === 0) {
            console.warn('No gallery items found in hidden gallery');
            return;
        }
        
        console.log(`Found ${galleryItems.length} default images in hidden gallery`);
        
        // 检查localStorage中是否已有图片
        let storageData = localStorage.getItem('sitePictures');
        let pictures = [];
        
        if (storageData) {
            try {
                pictures = JSON.parse(storageData);
                // 验证是否为数组
                if (!Array.isArray(pictures)) {
                    pictures = [];
                }
            } catch(e) {
                console.error('Error parsing stored pictures:', e);
                pictures = [];
            }
        }
        
        // 如果已经有图片，则不需要提取
        if (pictures.length > 0) {
            console.log('Using existing pictures from storage');
            return;
        }
        
        // 从隐藏的gallery-grid中提取图片
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('.gallery-item-title');
            const desc = item.querySelector('.gallery-item-desc');
            const category = item.getAttribute('data-category') || 'scenery';
            
            if (img && img.src) {
                const picture = {
                    id: 'default_' + index,
                    name: title ? title.textContent : 'Sri Lanka',
                    category: category,
                    description: desc ? desc.textContent : 'Discover the beauty of Sri Lanka',
                    url: img.src,
                    uploadDate: new Date().toISOString()
                };
                
                pictures.push(picture);
                console.log(`Extracted default image: ${picture.name} (${category})`);
            }
        });
        
        // 保存到localStorage
        if (pictures.length > 0) {
            localStorage.setItem('sitePictures', JSON.stringify(pictures));
            console.log(`Saved ${pictures.length} default images to storage`);
            
            // 初始化显示默认类别
            setupFilterButtons();
            filterAndDisplayCategory(currentCategory);
            startCarousel();
        }
    }
    
    /**
     * 设置筛选按钮点击事件
     */
    function setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.gallery-filter-btn');
        if (!filterButtons || filterButtons.length === 0) {
            console.warn('Gallery filter buttons not found');
            return;
        }
        
        // 确保所有按钮都有data-filter属性
        filterButtons.forEach(function(button) {
            if (!button.hasAttribute('data-filter')) {
                const buttonText = button.textContent.trim().toLowerCase();
                button.setAttribute('data-filter', buttonText);
                console.log(`Added missing data-filter attribute to button: ${buttonText}`);
            }
        });
        
        // 清除所有现有的active状态
        // 这是多选问题的关键修复 - 确保初始状态只有一个按钮被激活
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 设置默认活动按钮
        const defaultButton = Array.from(filterButtons).find(btn => 
            btn.getAttribute('data-filter') === currentCategory
        );
        
        if (defaultButton) {
            defaultButton.classList.add('active');
        } else if (filterButtons.length > 0) {
            // 如果没有找到匹配的按钮，选择第一个作为默认
            filterButtons[0].classList.add('active');
            currentCategory = filterButtons[0].getAttribute('data-filter') || 'all';
        }
        
        // 重新设置所有按钮的事件监听器
        filterButtons.forEach(function(button) {
            // 移除旧的事件监听器
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // 添加新的事件监听器
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 更新按钮状态 - 确保单选
                document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                newButton.classList.add('active');
                
                // 获取类别值
                const category = newButton.getAttribute('data-filter');
                console.log(`Gallery filter clicked: ${category}`);
                
                // 停止当前轮播
                if (carouselTimer) {
                    clearInterval(carouselTimer);
                    carouselTimer = null;
                }
                
                // 过滤和显示选中类别
                currentCategory = category;
                currentFeatureIndex = 0; // 重置索引
                filterAndDisplayCategory(category);
                
                // 重新启动轮播
                startCarousel();
                
                return false;
            });
        });
    }
    
    /**
     * 过滤和显示选中类别的图片
     */
    function filterAndDisplayCategory(category) {
        const pictures = getSiteImages();
        if (!pictures || pictures.length === 0) return;
        
        // 过滤当前类别的图片
        const filteredPictures = category === 'all' ? 
            pictures : 
            pictures.filter(pic => pic.category === category);
        
        console.log(`Filtered ${filteredPictures.length} images for category: ${category}`);
        
        // 显示缩略图
        displayThumbnails(filteredPictures);
        
        // 显示主图
        if (filteredPictures.length > 0) {
            // 确保索引在有效范围内
            if (currentFeatureIndex >= filteredPictures.length) {
                currentFeatureIndex = 0;
            }
            displayFeatureImage(filteredPictures[currentFeatureIndex]);
        } else {
            // 没有图片时显示占位符
            displayEmptyCategory();
        }
    }
    
    /**
     * 显示缩略图
     */
    function displayThumbnails(pictures) {
        const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
        if (!thumbnailsContainer) {
            console.warn('Gallery thumbnails container not found');
            return;
        }
        
        // 清空现有缩略图
        thumbnailsContainer.innerHTML = '';
        
        // 为每张图片创建缩略图
        pictures.forEach((picture, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'gallery-thumbnail';
            if (index === currentFeatureIndex) {
                thumbnail.classList.add('active');
            }
            
            // 创建图片元素
            const img = document.createElement('img');
            img.src = picture.url;
            img.alt = picture.name || 'Gallery Image';
            img.onerror = function() {
                // 图片加载失败时设置默认图片
                this.src = 'images/placeholder.jpg';
                this.alt = 'Image not available';
                console.warn(`Failed to load image: ${picture.url}`);
            };
            thumbnail.appendChild(img);
            
            // 添加点击事件
            thumbnail.addEventListener('click', function() {
                // 更新活动状态
                document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                thumbnail.classList.add('active');
                
                // 更新特色图片
                currentFeatureIndex = index;
                displayFeatureImage(picture);
                
                // 重置轮播计时器
                if (carouselTimer) {
                    clearInterval(carouselTimer);
                }
                startCarousel();
            });
            
            // 添加到容器
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    /**
     * 显示特色图片
     */
    function displayFeatureImage(picture) {
        // 查找特色图片容器
        const featureImageContainer = document.querySelector('.featured-image');
        const featureTitle = document.querySelector('.featured-title');
        const featureDesc = document.querySelector('.featured-desc');
        
        if (!featureImageContainer || !featureTitle || !featureDesc) {
            console.warn('Featured image containers not found');
            return;
        }
        
        // 设置图片和标题
        featureImageContainer.innerHTML = `<img src="${picture.url}" alt="${picture.name || 'Featured Image'}" onerror="this.src='images/placeholder.jpg'; this.alt='Image not available';">`;
        featureTitle.textContent = picture.name || 'Sri Lanka';
        featureDesc.textContent = picture.description || 'Discover the beauty of Sri Lanka';
        
        // 激活对应的缩略图
        document.querySelectorAll('.gallery-thumbnail').forEach((thumb, index) => {
            if (index === currentFeatureIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    /**
     * 显示空类别提示
     */
    function displayEmptyCategory() {
        const featureImageContainer = document.querySelector('.featured-image');
        const featureTitle = document.querySelector('.featured-title');
        const featureDesc = document.querySelector('.featured-desc');
        
        if (featureImageContainer) {
            featureImageContainer.innerHTML = `
                <div class="empty-category">
                    <i class="fas fa-images"></i>
                    <p>No images in this category</p>
                </div>
            `;
        }
        
        if (featureTitle) featureTitle.textContent = 'No Images Available';
        if (featureDesc) featureDesc.textContent = 'Please upload images in the admin panel for this category';
    }
    
    /**
     * 启动自动轮播
     */
    function startCarousel() {
        // 清除现有计时器
        if (carouselTimer) {
            clearInterval(carouselTimer);
        }
        
        // 设置新计时器
        carouselTimer = setInterval(function() {
            // 获取当前类别的图片
            const pictures = getSiteImages();
            if (!pictures || pictures.length === 0) return;
            
            const filteredPictures = currentCategory === 'all' ? 
                pictures : 
                pictures.filter(pic => pic.category === currentCategory);
            
            if (filteredPictures.length <= 1) return; // 只有一张或没有图片时不轮播
            
            // 更新索引
            currentFeatureIndex = (currentFeatureIndex + 1) % filteredPictures.length;
            
            // 显示下一张
            displayFeatureImage(filteredPictures[currentFeatureIndex]);
            
            // 更新缩略图选中状态
            document.querySelectorAll('.gallery-thumbnail').forEach((thumb, index) => {
                if (index === currentFeatureIndex) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
        }, 5000); // 5秒切换一次
    }
    
    /**
     * 获取网站图片
     */
    function getSiteImages() {
        try {
            let pictures = [];
            
            // 尝试从localStorage获取图片
            const storageData = localStorage.getItem('sitePictures');
            if (storageData) {
                const parsedData = JSON.parse(storageData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    pictures = parsedData;
                    console.log(`Found ${pictures.length} pictures in sitePictures storage`);
                }
            }
            
            // 如果没有数据，尝试获取管理员图片
            if (!pictures || pictures.length === 0) {
                const adminData = localStorage.getItem('adminPictures');
                if (adminData) {
                    const adminPictures = JSON.parse(adminData);
                    if (Array.isArray(adminPictures) && adminPictures.length > 0) {
                        // 转换格式
                        pictures = adminPictures.map(pic => ({
                            id: pic.id || `admin_${Math.random().toString(36).substr(2, 9)}`,
                            name: pic.name || pic.title || 'Sri Lanka Image',
                            category: pic.category || 'scenery',
                            description: pic.description || '',
                            url: pic.imageUrl || pic.url || '',
                            uploadDate: pic.uploadDate || new Date().toISOString()
                        }));
                        console.log(`Converted ${pictures.length} pictures from adminPictures`);
                        
                        // 尝试使用增强版同步
                        if (window.adminPicturesSyncEnhance && 
                            typeof window.adminPicturesSyncEnhance.syncPictures === 'function') {
                            window.adminPicturesSyncEnhance.syncPictures();
                        }
                    }
                }
            }
            
            // 如果仍然没有数据，使用静态图片
            if (!pictures || pictures.length === 0) {
                console.log('No pictures found in storage, extracting from DOM');
                pictures = extractDefaultImages() || [];
            }
            
            // 验证图片URL和类别
            pictures = pictures.filter(pic => {
                // 检查URL是否有效
                const hasValidUrl = pic.url && typeof pic.url === 'string' && pic.url.trim() !== '';
                
                // 标准化类别
                if (hasValidUrl && pic.category) {
                    // 转换为小写
                    pic.category = pic.category.toLowerCase().trim();
                    
                    // 处理常见的类别变体
                    if (['wildlife', 'wild', 'animals', 'animal'].includes(pic.category)) {
                        pic.category = 'wildlife';
                    } else if (['scenery', 'scene', 'landscape', 'landscapes'].includes(pic.category)) {
                        pic.category = 'scenery';
                    } else if (['culture', 'cultural', 'tradition', 'traditional'].includes(pic.category)) {
                        pic.category = 'culture';
                    } else if (['food', 'cuisine', 'foods'].includes(pic.category)) {
                        pic.category = 'food';
                    } else if (['beach', 'beaches', 'sea', 'ocean'].includes(pic.category)) {
                        pic.category = 'beach';
                    } else {
                        // 如果无法匹配到标准类别，默认为scenery
                        pic.category = 'scenery';
                    }
                }
                
                return hasValidUrl;
            });
            
            console.log(`Returning ${pictures.length} validated pictures for gallery`);
            return pictures;
        } catch (e) {
            console.error('Error getting site images:', e);
            return [];
        }
    }
    
    // 将函数导出到全局作用域
    window.galleryCategoryFix = {
        initGalleryFix: initGalleryFix,
        filterAndDisplayCategory: filterAndDisplayCategory,
        startCarousel: startCarousel,
        getSiteImages: getSiteImages,
        extractDefaultImages: extractDefaultImages
    };
})(); 