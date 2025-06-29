/**
 * 简单画廊管理系统 - 与管理员界面完全同步
 * 显示管理员上传的所有激活图片
 */

(function() {
    console.log('Simple Gallery initializing...');
    
    const galleryContainer = document.getElementById('pictureGallery');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // 存储键 - 使用统一的键名
    const STORAGE_KEY = 'sitePictures';
    
    // 类别映射
    const categories = {
        all: { name: 'All', icon: '🏝️' },
        scenery: { name: 'Scenery', icon: '🌄' },
        wildlife: { name: 'Wildlife', icon: '🐘' },
        culture: { name: 'Culture', icon: '🛕' },
        beach: { name: 'Beach', icon: '🏖️' },
        food: { name: 'Food', icon: '🍛' },
        accommodation: { name: 'Hotels', icon: '🏨' }
    };
    
    let currentCategory = 'all';
    let allPictures = [];
    
    /**
     * 初始化画廊
     */
    function initializeGallery() {
        if (!galleryContainer) {
            console.log('Gallery container not found on this page');
            return;
        }
        
        console.log('Initializing simple gallery...');
        
        // 加载图片数据
        loadPictures();
        
        // 设置分类过滤器
        setupCategoryFilter();
        
        // 监听数据更新事件
        setupDataListeners();
        
        // 显示画廊
        displayGallery();
    }
    
    /**
     * 加载图片数据 - 从统一存储加载
     */
    function loadPictures() {
        // 获取所有图片（包括管理员上传的）
        const storedPictures = localStorage.getItem(STORAGE_KEY);
        
        if (storedPictures) {
            try {
                allPictures = JSON.parse(storedPictures);
                console.log(`Loaded ${allPictures.length} pictures from storage`);
            } catch (e) {
                console.error('Error parsing stored pictures:', e);
                allPictures = [];
            }
        }
        
        // 只显示激活的图片
        allPictures = allPictures.filter(pic => pic.isActive !== false);
        
        // 如果没有图片，显示默认图片
        if (allPictures.length === 0) {
            allPictures = getDefaultPictures();
        }
  }
  
  /**
   * 获取默认图片
   */
  function getDefaultPictures() {
        return [
            {
                id: 'default1',
                name: 'Welcome to Sri Lanka',
                category: 'scenery',
                imageUrl: './images/sri-lanka-default.jpg',
                thumbnailUrl: './images/sri-lanka-default.jpg',
                description: 'Discover the beauty of Sri Lanka'
            }
        ];
    }
    
    /**
     * 设置分类过滤器
     */
    function setupCategoryFilter() {
        if (!categoryFilter) return;
        
        // 创建分类按钮
        categoryFilter.innerHTML = '';
        
        Object.entries(categories).forEach(([key, category]) => {
            const button = document.createElement('button');
            button.className = `category-btn ${key === currentCategory ? 'active' : ''}`;
            button.setAttribute('data-category', key);
            button.innerHTML = `${category.icon} ${category.name}`;
            
            button.addEventListener('click', () => {
                currentCategory = key;
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                displayGallery();
            });
            
            categoryFilter.appendChild(button);
        });
    }
    
    /**
     * 显示画廊
     */
    function displayGallery() {
        if (!galleryContainer) return;
        
        // 过滤图片
        const filteredPictures = currentCategory === 'all' 
            ? allPictures 
            : allPictures.filter(pic => pic.category === currentCategory);
        
        // 清空容器
        galleryContainer.innerHTML = '';
        
        if (filteredPictures.length === 0) {
            galleryContainer.innerHTML = `
                <div class="no-pictures">
                    <p>No pictures available in this category.</p>
                    <p>Admin can add pictures from the dashboard.</p>
                </div>
            `;
            return;
        }
        
        // 创建图片卡片
        filteredPictures.forEach(picture => {
            const card = createPictureCard(picture);
            galleryContainer.appendChild(card);
        });
        
        // 添加动画
        animateGallery();
    }
    
    /**
     * 创建图片卡片
     */
    function createPictureCard(picture) {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        
        // 确定图片URL
        const imageUrl = picture.cloudUrl || picture.imageUrl || picture.thumbnailUrl || './images/placeholder.jpg';
        const isCloudImage = picture.cloudUrl || picture.cloudPublicId;
        
        card.innerHTML = `
            <div class="gallery-image">
                <img src="${imageUrl}" 
                     alt="${picture.name || 'Gallery Image'}" 
                     loading="lazy"
                     onerror="this.src='./images/placeholder.jpg'">
                ${isCloudImage ? '<span class="cloud-badge">☁️</span>' : ''}
            </div>
            <div class="gallery-info">
                <h3>${picture.name || 'Untitled'}</h3>
                ${picture.description ? `<p>${picture.description}</p>` : ''}
                <span class="category-tag">${categories[picture.category]?.icon || '📷'} ${categories[picture.category]?.name || picture.category}</span>
            </div>
        `;
        
        // 点击查看大图
        card.addEventListener('click', () => {
            viewLargeImage(picture);
        });
        
        return card;
    }
    
    /**
     * 查看大图
     */
    function viewLargeImage(picture) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        const imageUrl = picture.cloudUrl || picture.imageUrl || picture.thumbnailUrl;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="${imageUrl}" alt="${picture.name}">
                <div class="modal-info">
                    <h2>${picture.name}</h2>
                    ${picture.description ? `<p>${picture.description}</p>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * 动画效果
     */
    function animateGallery() {
        const items = galleryContainer.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in');
        });
    }
    
    /**
     * 设置数据监听器
     */
    function setupDataListeners() {
        // 监听画廊更新事件（来自数据同步服务）
        window.addEventListener('galleryUpdate', (event) => {
            console.log('Gallery update event received');
            if (event.detail && event.detail.pictures) {
                allPictures = event.detail.pictures;
                displayGallery();
            }
        });
        
        // 监听存储变化（跨标签页）
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                console.log('Storage updated, reloading gallery...');
                loadPictures();
                displayGallery();
            }
        });
        
        // 定期检查更新（每10秒）
        setInterval(() => {
            const currentCount = allPictures.length;
            loadPictures();
            if (allPictures.length !== currentCount) {
                console.log('Picture count changed, updating gallery...');
                displayGallery();
            }
        }, 10000);
    }
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        /* 画廊容器 */
        #pictureGallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            margin-top: 20px;
        }
        
        /* 图片卡片 */
        .gallery-item {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            position: relative;
        }
        
        .gallery-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .gallery-image {
            position: relative;
            width: 100%;
            height: 250px;
            overflow: hidden;
        }
        
        .gallery-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .gallery-item:hover .gallery-image img {
            transform: scale(1.05);
        }
        
        /* 云标记 */
        .cloud-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* 图片信息 */
        .gallery-info {
            padding: 15px;
        }
        
        .gallery-info h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
        }
        
        .gallery-info p {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .category-tag {
            display: inline-block;
            background: #f0f0f0;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            color: #555;
        }
        
        /* 分类过滤器 */
        #categoryFilter {
            display: flex;
            gap: 10px;
            padding: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .category-btn {
            padding: 10px 20px;
            border: none;
            background: #f0f0f0;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        }
        
        .category-btn:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }
        
        .category-btn.active {
            background: #ff6b6b;
            color: white;
        }
        
        /* 无图片提示 */
        .no-pictures {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .no-pictures p {
            margin: 10px 0;
            font-size: 16px;
        }
        
        /* 图片模态框 */
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        }
        
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .modal-content img {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 8px;
        }
        
        .modal-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            color: white;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        
        .modal-info h2 {
            margin: 0 0 10px 0;
        }
        
        .modal-info p {
            margin: 0;
            opacity: 0.9;
        }
        
        .modal-close {
            position: absolute;
            top: 20px;
            right: 40px;
            color: white;
            font-size: 40px;
            cursor: pointer;
            z-index: 1001;
        }
        
        .modal-close:hover {
            color: #ff6b6b;
        }
        
        /* 动画 */
        .fade-in {
            animation: fadeIn 0.6s ease forwards;
            opacity: 0;
        }
        
        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }
        
        /* 响应式 */
        @media (max-width: 768px) {
            #pictureGallery {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                padding: 15px;
            }
            
            .gallery-image {
                height: 200px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 导出函数供外部调用
    window.initializeSimpleGallery = initializeGallery;
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGallery);
    } else {
        initializeGallery();
    }
    
})(); 