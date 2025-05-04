/**
 * Admin Pictures Sync Fix
 * 修复管理员界面与前端图片同步问题
 */

(function() {
    'use strict';
    
    console.log('Admin Pictures Sync Fix loaded');
    
    // 立即执行一次同步
    setTimeout(syncPictures, 500);
    
    // 设置定期同步间隔
    setInterval(syncPictures, 5000);
    
    // 监听DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 添加事件监听器，监听保存图片事件
        document.addEventListener('pictureSaved', function(e) {
            console.log('Picture saved event detected, syncing...');
            syncPictures();
        });
        
        // 监听删除图片事件
        document.addEventListener('pictureDeleted', function(e) {
            console.log('Picture deleted event detected, syncing...');
            syncPictures();
        });
        
        // 手动同步按钮（如果存在）
        const syncBtn = document.getElementById('syncPicturesBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', function() {
                syncPictures();
                alert('图片已同步到前端！');
            });
        }
    });
    
    /**
     * 同步图片数据从管理员到前端
     */
    function syncPictures() {
        console.log('Syncing pictures from admin to frontend...');
        
        // 获取管理员图片
        let adminPictures = getAdminPictures();
        if (!adminPictures || adminPictures.length === 0) {
            console.log('No admin pictures found to sync');
            return;
        }
        
        console.log(`Found ${adminPictures.length} admin pictures`);
        
        // 转换为前端格式
        const frontendPictures = adminPictures.map(function(adminPic) {
            return {
                id: adminPic.id,
                name: adminPic.name || 'Untitled Image',
                category: adminPic.category || 'scenery',
                description: adminPic.description || '',
                url: adminPic.imageUrl || adminPic.url,
                uploadDate: adminPic.uploadDate || new Date().toISOString()
            };
        });
        
        // 保存到前端localStorage
        localStorage.setItem('sitePictures', JSON.stringify(frontendPictures));
        
        // 双向复制 - 确保adminPictures也有前端的图片
        const sitePictures = getSitePictures();
        if (sitePictures && sitePictures.length > 0) {
            // 检查是否有前端独有的图片
            const uniqueSitePics = sitePictures.filter(function(sitePic) {
                return !adminPictures.some(function(adminPic) {
                    return adminPic.id === sitePic.id || 
                           adminPic.imageUrl === sitePic.url;
                });
            });
            
            if (uniqueSitePics.length > 0) {
                console.log(`Found ${uniqueSitePics.length} unique frontend pictures to add to admin`);
                
                // 转换为管理员格式
                const newAdminPics = uniqueSitePics.map(function(sitePic) {
                    return {
                        id: sitePic.id || generateId(),
                        name: sitePic.name || 'Untitled Image',
                        category: sitePic.category || 'scenery',
                        description: sitePic.description || '',
                        imageUrl: sitePic.url,
                        uploadDate: sitePic.uploadDate || new Date().toISOString()
                    };
                });
                
                // 合并并保存
                adminPictures = adminPictures.concat(newAdminPics);
                localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
            }
        }
        
        console.log(`Successfully synced ${frontendPictures.length} pictures to frontend`);
        
        // 触发事件，通知其他脚本数据已更新
        const event = new CustomEvent('picturesSynced', {
            detail: { count: frontendPictures.length }
        });
        document.dispatchEvent(event);
        
        // 强制刷新前端图片显示
        refreshFrontendGallery();
    }
    
    /**
     * 获取管理员图片数据
     */
    function getAdminPictures() {
        try {
            const data = localStorage.getItem('adminPictures');
            if (!data) return [];
            
            const pictures = JSON.parse(data);
            return Array.isArray(pictures) ? pictures : [];
        } catch (e) {
            console.error('Error reading admin pictures:', e);
            return [];
        }
    }
    
    /**
     * 获取前端图片数据
     */
    function getSitePictures() {
        try {
            const data = localStorage.getItem('sitePictures');
            if (!data) return [];
            
            const pictures = JSON.parse(data);
            return Array.isArray(pictures) ? pictures : [];
        } catch (e) {
            console.error('Error reading site pictures:', e);
            return [];
        }
    }
    
    /**
     * 生成唯一ID
     */
    function generateId() {
        return 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    /**
     * 刷新前端图片显示
     */
    function refreshFrontendGallery() {
        // 如果当前页面是前端页面，刷新图片显示
        if (window.location.href.includes('index.html') || 
            window.location.pathname === '/' || 
            document.querySelector('.gallery-grid')) {
            
            console.log('Refreshing frontend gallery display');
            
            // 触发displayAdminImages函数（如果存在）
            if (typeof window.displayAdminImages === 'function') {
                window.displayAdminImages();
            }
            
            // 发送自定义事件通知前端脚本刷新图片
            const event = new CustomEvent('galleryRefresh');
            document.dispatchEvent(event);
        }
    }
    
    // 暴露公共函数
    window.adminPicturesSyncFix = {
        syncPictures: syncPictures,
        getAdminPictures: getAdminPictures,
        getSitePictures: getSitePictures
    };
})(); 