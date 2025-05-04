/**
 * 管理员图片同步脚本
 * 确保管理员上传的图片能够正确同步到前端展示系统
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Pictures Sync loaded');
        
        // 立即同步图片数据
        syncPicturesData();
        
        // 设置定期同步检查 (每分钟检查一次)
        setInterval(syncPicturesData, 60000);
        
        // 监听保存图片事件
        document.addEventListener('pictureSaved', function(event) {
            console.log('Picture saved event detected');
            
            // 确保事件包含图片数据
            if (event.detail && event.detail.picture) {
                // 将新图片同步到前端
                savePictureToFrontend(event.detail.picture);
            } else {
                // 如果没有特定图片数据，执行完整同步
                syncPicturesData();
            }
        });
        
        // 监听删除图片事件
        document.addEventListener('pictureDeleted', function(event) {
            console.log('Picture deleted event detected');
            
            // 确保事件包含图片ID
            if (event.detail && event.detail.pictureId) {
                // 从前端删除图片
                deletePictureFromFrontend(event.detail.pictureId);
            } else {
                // 如果没有特定图片ID，执行完整同步
                syncPicturesData();
            }
        });
    });
    
    /**
     * 同步管理员和前端的图片数据
     */
    function syncPicturesData() {
        console.log('Synchronizing admin and frontend pictures...');
        
        try {
            // 获取管理员图片数据
            const adminPicturesStr = localStorage.getItem('adminPictures');
            if (!adminPicturesStr) {
                console.log('No admin pictures found to sync');
                return;
            }
            
            // 解析管理员图片数据
            const adminPictures = JSON.parse(adminPicturesStr);
            if (!Array.isArray(adminPictures) || adminPictures.length === 0) {
                console.log('Admin pictures is empty or invalid');
                return;
            }
            
            console.log(`Found ${adminPictures.length} admin pictures to sync`);
            
            // 获取前端图片数据
            let sitePicturesStr = localStorage.getItem('sitePictures');
            let sitePictures = [];
            
            if (sitePicturesStr) {
                try {
                    sitePictures = JSON.parse(sitePicturesStr);
                    if (!Array.isArray(sitePictures)) {
                        sitePictures = [];
                    }
                } catch (e) {
                    console.error('Error parsing site pictures:', e);
                    sitePictures = [];
                }
            }
            
            console.log(`Found ${sitePictures.length} existing site pictures`);
            
            // 将管理员图片转换为前端格式
            const convertedPictures = adminPictures.map(adminPic => {
                // 检查图片是否已存在于前端
                const existingSitePic = sitePictures.find(sitePic => 
                    sitePic.id === adminPic.id || 
                    sitePic.url === adminPic.imageUrl
                );
                
                // 如果已存在，保留现有数据并更新
                if (existingSitePic) {
                    return {
                        ...existingSitePic,
                        name: adminPic.name || existingSitePic.name,
                        category: adminPic.category || existingSitePic.category,
                        description: adminPic.description || existingSitePic.description,
                        url: adminPic.imageUrl || existingSitePic.url
                    };
                }
                
                // 如果不存在，创建新条目
                return {
                    id: adminPic.id,
                    name: adminPic.name,
                    category: adminPic.category,
                    description: adminPic.description,
                    url: adminPic.imageUrl,
                    uploadDate: adminPic.uploadDate
                };
            });
            
            // 确保没有重复项
            const uniqueIds = new Set();
            const uniquePictures = convertedPictures.filter(pic => {
                // 如果ID已存在，跳过
                if (uniqueIds.has(pic.id)) return false;
                uniqueIds.add(pic.id);
                return true;
            });
            
            console.log(`Syncing ${uniquePictures.length} unique pictures to frontend`);
            
            // 保存到前端存储
            localStorage.setItem('sitePictures', JSON.stringify(uniquePictures));
            
            // 触发自定义事件通知前端脚本数据已更新
            const syncEvent = new CustomEvent('picturesDataSynced', {
                detail: { count: uniquePictures.length }
            });
            document.dispatchEvent(syncEvent);
            
            console.log('Pictures synchronization complete');
        } catch (error) {
            console.error('Error synchronizing pictures:', error);
        }
    }
    
    /**
     * 将单个图片保存到前端存储
     */
    function savePictureToFrontend(adminPicture) {
        console.log('Saving picture to frontend:', adminPicture.id);
        
        try {
            // 获取现有前端图片
            const sitePicturesStr = localStorage.getItem('sitePictures');
            let sitePictures = [];
            
            if (sitePicturesStr) {
                sitePictures = JSON.parse(sitePicturesStr);
                if (!Array.isArray(sitePictures)) {
                    sitePictures = [];
                }
            }
            
            // 检查图片是否已存在
            const existingIndex = sitePictures.findIndex(pic => 
                pic.id === adminPicture.id || 
                pic.url === adminPicture.imageUrl
            );
            
            // 转换为前端格式
            const sitePicture = {
                id: adminPicture.id,
                name: adminPicture.name,
                category: adminPicture.category,
                description: adminPicture.description,
                url: adminPicture.imageUrl,
                uploadDate: adminPicture.uploadDate
            };
            
            // 更新或添加图片
            if (existingIndex >= 0) {
                sitePictures[existingIndex] = sitePicture;
                console.log('Updated existing picture in frontend storage');
            } else {
                sitePictures.push(sitePicture);
                console.log('Added new picture to frontend storage');
            }
            
            // 保存更新后的图片数组
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            
            // 触发自定义事件
            const updateEvent = new CustomEvent('pictureFrontendUpdated', {
                detail: { picture: sitePicture }
            });
            document.dispatchEvent(updateEvent);
            
        } catch (error) {
            console.error('Error saving picture to frontend:', error);
        }
    }
    
    /**
     * 从前端存储中删除图片
     */
    function deletePictureFromFrontend(pictureId) {
        console.log('Deleting picture from frontend:', pictureId);
        
        try {
            // 获取现有前端图片
            const sitePicturesStr = localStorage.getItem('sitePictures');
            if (!sitePicturesStr) return;
            
            let sitePictures = JSON.parse(sitePicturesStr);
            if (!Array.isArray(sitePictures)) return;
            
            // 过滤掉要删除的图片
            const filteredPictures = sitePictures.filter(pic => pic.id !== pictureId);
            
            // 如果有变化，保存更新后的数组
            if (filteredPictures.length !== sitePictures.length) {
                localStorage.setItem('sitePictures', JSON.stringify(filteredPictures));
                console.log('Picture deleted from frontend storage');
                
                // 触发自定义事件
                const deleteEvent = new CustomEvent('pictureFrontendDeleted', {
                    detail: { pictureId: pictureId }
                });
                document.dispatchEvent(deleteEvent);
            }
        } catch (error) {
            console.error('Error deleting picture from frontend:', error);
        }
    }
    
    // 将同步功能暴露给全局作用域
    window.adminPicturesSync = {
        syncPicturesData: syncPicturesData,
        savePictureToFrontend: savePictureToFrontend,
        deletePictureFromFrontend: deletePictureFromFrontend
    };
})(); 