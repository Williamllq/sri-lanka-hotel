/**
 * Admin Pictures Sync Enhancement
 * 增强版管理员图片同步功能，修复类别匹配和URL处理问题
 */

(function() {
    'use strict';
    
    console.log('Admin Pictures Sync Enhancement loaded');
    
    // 标准化类别名称映射
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
    
    // 立即执行一次同步
    setTimeout(enhancedSyncPictures, 500);
    
    // 设置定期同步间隔
    setInterval(enhancedSyncPictures, 3000);
    
    // 监听DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 添加事件监听器，监听保存和删除图片事件
        document.addEventListener('pictureSaved', function(e) {
            console.log('Picture saved event detected, syncing with enhancement...');
            enhancedSyncPictures();
        });
        
        document.addEventListener('pictureDeleted', function(e) {
            console.log('Picture deleted event detected, syncing with enhancement...');
            enhancedSyncPictures();
        });
        
        // 监听网页导航事件
        if (window.location.href.includes('admin-dashboard.html')) {
            // 在管理员页面增加手动同步按钮
            setTimeout(addSyncButton, 1000);
        }
        
        // 监听原同步事件
        document.addEventListener('picturesSynced', function() {
            console.log('Original sync detected, enhancing...');
            setTimeout(enhancedSyncPictures, 500);
        });
    });
    
    /**
     * 添加手动同步按钮到管理员界面
     */
    function addSyncButton() {
        // 检查是否已存在同步按钮
        if (document.getElementById('enhancedSyncBtn')) return;
        
        // 查找上传按钮位置
        const uploadBtn = document.querySelector('#uploadPictureBtn');
        const actionBtns = document.querySelector('.action-buttons');
        
        if (actionBtns) {
            const syncBtn = document.createElement('button');
            syncBtn.id = 'enhancedSyncBtn';
            syncBtn.className = 'admin-btn';
            syncBtn.innerHTML = '<i class="fas fa-sync"></i> 同步图片到前端';
            syncBtn.style.marginLeft = '10px';
            
            syncBtn.addEventListener('click', function() {
                enhancedSyncPictures();
                alert('图片已同步到前端！（增强版同步）');
            });
            
            actionBtns.appendChild(syncBtn);
            console.log('Added enhanced sync button to admin panel');
        }
    }
    
    /**
     * 增强版图片同步
     */
    function enhancedSyncPictures() {
        console.log('Running enhanced picture sync...');
        
        // 获取管理员图片
        let adminPictures = getAdminPictures();
        if (!adminPictures || adminPictures.length === 0) {
            console.log('No admin pictures found for enhanced sync');
            return;
        }
        
        console.log(`Found ${adminPictures.length} admin pictures for enhanced sync`);
        
        // 标准化并转换为前端格式
        const frontendPictures = adminPictures.map(function(adminPic) {
            // 标准化类别
            let category = (adminPic.category || '').toLowerCase().trim();
            
            // 使用映射表标准化类别名称
            if (categoryMap[category]) {
                category = categoryMap[category];
            } else if (!['wildlife', 'scenery', 'culture', 'food', 'beach', 'all'].includes(category)) {
                // 默认为scenery类别
                category = 'scenery';
            }
            
            // 处理图片URL
            let url = adminPic.imageUrl || adminPic.url || '';
            
            // 如果URL包含base64数据，保持不变
            if (!url.startsWith('data:image')) {
                // 检测URL是否为相对路径
                if (url && !url.match(/^(https?:\/\/|data:image|\/)/i)) {
                    url = 'images/' + url;
                }
            }
            
            return {
                id: adminPic.id || ('pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
                name: adminPic.name || 'Sri Lanka Image',
                category: category,
                description: adminPic.description || '',
                url: url,
                uploadDate: adminPic.uploadDate || new Date().toISOString()
            };
        });
        
        // 过滤掉没有有效URL的图片
        const validPictures = frontendPictures.filter(pic => 
            pic.url && typeof pic.url === 'string' && pic.url.trim() !== ''
        );
        
        console.log(`Enhanced sync processed ${validPictures.length} valid pictures`);
        
        // 保存到前端localStorage
        localStorage.setItem('sitePictures', JSON.stringify(validPictures));
        
        // 触发事件通知前端刷新图片显示
        triggerGalleryRefresh();
        
        return validPictures.length;
    }
    
    /**
     * 获取管理员图片数据
     */
    function getAdminPictures() {
        try {
            // 先尝试从localStorage获取
            const data = localStorage.getItem('adminPictures');
            if (data) {
                const pictures = JSON.parse(data);
                if (Array.isArray(pictures) && pictures.length > 0) {
                    return pictures;
                }
            }
            
            // 如果localStorage没有数据，尝试从DOM中获取
            if (window.location.href.includes('admin-dashboard.html')) {
                return extractPicturesFromAdminDOM();
            }
            
            return [];
        } catch (e) {
            console.error('Error reading admin pictures:', e);
            return [];
        }
    }
    
    /**
     * 从管理员面板DOM中提取图片数据
     */
    function extractPicturesFromAdminDOM() {
        const pictures = [];
        const pictureItems = document.querySelectorAll('.picture-grid > div');
        
        if (!pictureItems || pictureItems.length === 0) {
            return pictures;
        }
        
        pictureItems.forEach((item, index) => {
            // 尝试获取图片信息
            const img = item.querySelector('img');
            const name = item.querySelector('h3, h4, .picture-name')?.textContent || 
                         item.querySelector('.picture-title')?.textContent || 
                         `Image ${index + 1}`;
            
            // 尝试获取类别
            let category = 'scenery'; // 默认类别
            const categoryElement = item.querySelector('.category-badge, .picture-category');
            if (categoryElement) {
                category = categoryElement.textContent.toLowerCase().trim();
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
            
            // 处理类别
            if (categoryMap[category]) {
                category = categoryMap[category];
            }
            
            if (img && img.src) {
                pictures.push({
                    id: `admin_${index}`,
                    name: name,
                    category: category,
                    description: '',
                    imageUrl: img.src,
                    uploadDate: new Date().toISOString()
                });
            }
        });
        
        console.log(`Extracted ${pictures.length} pictures from admin DOM`);
        return pictures;
    }
    
    /**
     * 触发图库刷新
     */
    function triggerGalleryRefresh() {
        // 触发事件，通知其他脚本数据已更新
        const syncEvent = new CustomEvent('picturesSynced', {
            detail: { enhanced: true }
        });
        document.dispatchEvent(syncEvent);
        
        // 同时触发galleryRefresh事件
        const refreshEvent = new CustomEvent('galleryRefresh');
        document.dispatchEvent(refreshEvent);
        
        // 如果在前端页面，尝试直接刷新图库
        if (window.location.href.includes('index.html') || 
            window.location.pathname === '/' || 
            document.querySelector('.gallery-grid')) {
            
            console.log('Refreshing frontend gallery from enhanced sync');
            
            // 调用全局图库刷新函数
            if (window.galleryCategoryFix && typeof window.galleryCategoryFix.initGalleryFix === 'function') {
                window.galleryCategoryFix.initGalleryFix();
            }
        }
    }
    
    // 暴露公共函数
    window.adminPicturesSyncEnhance = {
        syncPictures: enhancedSyncPictures,
        getAdminPictures: getAdminPictures
    };
})(); 