/**
 * Gallery Display Fix - 修复画廊显示问题
 * 确保管理员上传的图片正确显示在前端画廊中
 */

(function() {
    'use strict';
    
    console.log('Gallery Display Fix loading...');
    
    // 防止重复执行
    if (window.galleryDisplayFixLoaded) {
        console.log('Gallery Display Fix already loaded, skipping...');
        return;
    }
    window.galleryDisplayFixLoaded = true;
    
    const GalleryDisplayFix = {
        
        // 初始化
        init() {
            console.log('Initializing gallery display fixes...');
            
            // 立即更新画廊显示
            this.updateGalleryDisplay();
            
            // 监听数据变化
            this.setupDataChangeListeners();
            
            // 设置定期检查（每10秒检查一次是否需要更新）
            this.setupPeriodicCheck();
            
            console.log('Gallery display fixes initialized');
        },
        
        // 更新画廊显示
        updateGalleryDisplay() {
            try {
                // 获取画廊数据
                const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                
                console.log(`Found ${galleryImages.length} gallery images and ${adminPictures.length} admin pictures`);
                
                // 如果画廊为空但管理员有图片，进行同步
                if (galleryImages.length === 0 && adminPictures.length > 0) {
                    this.syncAdminToGallery();
                    return;
                }
                
                // 如果有画廊数据，更新DOM
                if (galleryImages.length > 0) {
                    this.updateDOM(galleryImages);
                } else {
                    console.log('No gallery images found, using fallback images');
                    this.createFallbackImages();
                }
                
            } catch (error) {
                console.error('Error updating gallery display:', error);
                this.createFallbackImages();
            }
        },
        
        // 同步管理员图片到画廊
        syncAdminToGallery() {
            try {
                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                const galleryImages = adminPictures.map(pic => ({
                    id: pic.id,
                    url: pic.imageUrl || pic.url,
                    title: pic.title || 'Beautiful Sri Lanka',
                    description: pic.description || '',
                    category: pic.category || 'scenery',
                    uploadDate: pic.uploadDate
                }));
                
                localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
                this.updateDOM(galleryImages);
                
                console.log(`Synced ${galleryImages.length} images from admin to gallery`);
                
            } catch (error) {
                console.error('Error syncing admin to gallery:', error);
            }
        },
        
        // 更新DOM中的图片
        updateDOM(images) {
            // 方法1：更新explore部分的画廊项目
            this.updateExploreSection(images);
            
            // 方法2：更新任何使用gallery类的容器
            this.updateGalleryContainers(images);
            
            // 方法3：触发现有的画廊脚本更新
            this.triggerGalleryUpdate(images);
        },
        
        // 更新explore部分
        updateExploreSection(images) {
            const exploreSection = document.querySelector('#explore');
            if (!exploreSection) return;
            
            const galleryItems = exploreSection.querySelectorAll('.gallery-item, .explore-item');
            
            console.log(`Updating ${galleryItems.length} gallery items with ${images.length} images`);
            
            galleryItems.forEach((item, index) => {
                if (index < images.length) {
                    const image = images[index];
                    this.updateGalleryItem(item, image);
                }
            });
        },
        
        // 更新单个画廊项目
        updateGalleryItem(item, imageData) {
            try {
                // 更新图片src
                const img = item.querySelector('img');
                if (img && imageData.url && imageData.url !== 'images/placeholder.jpg') {
                    const oldSrc = img.src;
                    img.src = imageData.url;
                    img.alt = imageData.title || imageData.alt || 'Sri Lanka';
                    
                    console.log(`Updated image: ${oldSrc} -> ${imageData.url}`);
                    
                    // 设置错误处理
                    img.onerror = () => {
                        console.warn(`Failed to load image: ${imageData.url}`);
                        img.src = 'images/placeholder.jpg';
                    };
                }
                
                // 更新标题
                const title = item.querySelector('h3, .gallery-title, .item-title');
                if (title && imageData.title) {
                    title.textContent = imageData.title;
                }
                
                // 更新描述
                const description = item.querySelector('p, .gallery-description, .item-description');
                if (description && imageData.description) {
                    description.textContent = imageData.description;
                }
                
                // 更新类别
                const category = item.querySelector('.category, .gallery-category');
                if (category && imageData.category) {
                    category.textContent = imageData.category;
                    category.className = `category ${imageData.category}`;
                }
                
            } catch (error) {
                console.error('Error updating gallery item:', error);
            }
        },
        
        // 更新画廊容器
        updateGalleryContainers(images) {
            const galleryContainers = document.querySelectorAll('.gallery-grid, .gallery-container, .image-grid');
            
            galleryContainers.forEach(container => {
                this.updateGalleryContainer(container, images);
            });
        },
        
        // 更新画廊容器
        updateGalleryContainer(container, images) {
            try {
                // 如果容器为空，创建画廊项目
                if (container.children.length === 0) {
                    images.forEach(image => {
                        const item = this.createGalleryItem(image);
                        container.appendChild(item);
                    });
                } else {
                    // 更新现有项目
                    const items = container.querySelectorAll('.gallery-item, .image-item');
                    items.forEach((item, index) => {
                        if (index < images.length) {
                            this.updateGalleryItem(item, images[index]);
                        }
                    });
                }
            } catch (error) {
                console.error('Error updating gallery container:', error);
            }
        },
        
        // 创建画廊项目
        createGalleryItem(imageData) {
            const item = document.createElement('div');
            item.className = 'gallery-item image-item';
            item.innerHTML = `
                <div class="image-container">
                    <img src="${imageData.url}" alt="${imageData.title}" loading="lazy"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="item-content">
                    <h3 class="item-title">${imageData.title}</h3>
                    <p class="item-description">${imageData.description}</p>
                    <span class="category ${imageData.category}">${imageData.category}</span>
                </div>
            `;
            return item;
        },
        
        // 触发画廊更新事件
        triggerGalleryUpdate(images) {
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('galleryUpdate', {
                detail: { images: images }
            }));
            
            // 触发存储事件
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'galleryImages',
                newValue: JSON.stringify(images),
                url: window.location.href
            }));
            
            // 如果存在画廊初始化函数，调用它
            if (typeof window.initGallery === 'function') {
                setTimeout(() => window.initGallery(), 100);
            }
            
            if (typeof window.loadGalleryImages === 'function') {
                setTimeout(() => window.loadGalleryImages(), 100);
            }
        },
        
        // 创建备用图片
        createFallbackImages() {
            const fallbackImages = [
                {
                    id: 'fallback_1',
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Pristine Beaches',
                    description: 'Crystal clear waters and golden sandy beaches',
                    category: 'beach'
                },
                {
                    id: 'fallback_2',
                    url: 'https://images.unsplash.com/photo-1588598198321-9735fd58f0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Ancient Temples',
                    description: 'Sacred Buddhist temples with rich history',
                    category: 'culture'
                },
                {
                    id: 'fallback_3',
                    url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Wildlife Safari',
                    description: 'Magnificent elephants in their natural habitat',
                    category: 'wildlife'
                },
                {
                    id: 'fallback_4',
                    url: 'https://images.unsplash.com/photo-1566296440929-898ae2baae1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Tea Plantations',
                    description: 'Lush green tea estates in the hill country',
                    category: 'scenery'
                }
            ];
            
            localStorage.setItem('galleryImages', JSON.stringify(fallbackImages));
            this.updateDOM(fallbackImages);
            
            console.log('Created fallback images');
        },
        
        // 设置数据变化监听器
        setupDataChangeListeners() {
            // 监听localStorage变化
            window.addEventListener('storage', (e) => {
                if (e.key === 'galleryImages' || e.key === 'adminPictures') {
                    console.log('Gallery data changed, updating display...');
                    setTimeout(() => this.updateGalleryDisplay(), 100);
                }
            });
            
            // 监听自定义事件
            window.addEventListener('galleryUpdate', (e) => {
                console.log('Gallery update event received');
                if (e.detail && e.detail.images) {
                    this.updateDOM(e.detail.images);
                }
            });
        },
        
        // 设置定期检查
        setupPeriodicCheck() {
            setInterval(() => {
                // 检查是否有placeholder图片需要更新
                const placeholderImages = document.querySelectorAll('img[src*="placeholder.jpg"]');
                if (placeholderImages.length > 0) {
                    console.log(`Found ${placeholderImages.length} placeholder images, updating gallery...`);
                    this.updateGalleryDisplay();
                }
            }, 10000); // 每10秒检查一次
        }
    };
    
    // 暴露到全局
    window.GalleryDisplayFix = GalleryDisplayFix;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => GalleryDisplayFix.init(), 200);
        });
    } else {
        setTimeout(() => GalleryDisplayFix.init(), 200);
    }
    
    console.log('Gallery Display Fix loaded successfully');
    
})(); 