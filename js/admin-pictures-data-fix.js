/**
 * 修复图片数据结构不一致的问题
 * 确保Cloudinary上传的图片能正确保存和显示
 */

(function() {
    console.log('Admin Pictures Data Fix loaded');
    
    /**
     * 修复现有图片数据结构
     */
    function fixExistingPictureData() {
        console.log('Fixing existing picture data...');
        
        // 获取所有图片数据
        const adminPictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
        const sitePictures = JSON.parse(localStorage.getItem('sitePictures') || '[]');
        
        // 修复adminPictures - 确保imageUrl字段正确
        const fixedAdminPictures = adminPictures.map(pic => {
            // 如果imageUrl为空但有thumbnailUrl，使用thumbnailUrl作为imageUrl
            if (!pic.imageUrl && pic.thumbnailUrl) {
                pic.imageUrl = pic.thumbnailUrl;
            }
            // 如果有url字段但没有imageUrl，使用url
            if (!pic.imageUrl && pic.url) {
                pic.imageUrl = pic.url;
            }
            // 确保有thumbnailUrl
            if (!pic.thumbnailUrl && pic.imageUrl) {
                pic.thumbnailUrl = pic.imageUrl;
            }
            return pic;
        });
        
        // 修复sitePictures - 确保数据结构一致
        const fixedSitePictures = sitePictures.map(pic => {
            // 统一使用imageUrl字段
            if (pic.url && !pic.imageUrl) {
                pic.imageUrl = pic.url;
            }
            // 确保有thumbnailUrl
            if (!pic.thumbnailUrl) {
                pic.thumbnailUrl = pic.imageUrl || pic.url;
            }
            return pic;
        });
        
        // 保存修复后的数据
        localStorage.setItem('adminPicturesMetadata', JSON.stringify(fixedAdminPictures));
        localStorage.setItem('sitePictures', JSON.stringify(fixedSitePictures));
        
        console.log(`Fixed ${fixedAdminPictures.length} admin pictures and ${fixedSitePictures.length} site pictures`);
        
        // 刷新图片显示
        if (typeof loadAndDisplayPictures === 'function') {
            loadAndDisplayPictures();
        }
    }
    
    /**
     * 重写processImageFile以确保Cloudinary上传的图片正确保存
     */
    if (window.processImageFile) {
        const originalProcessImageFile = window.processImageFile;
        
        window.processImageFile = async function(file, callback) {
            console.log('Processing image file with data fix...');
            
            // 检查是否使用云存储
            const useCloud = document.getElementById('useCloudStorage')?.checked;
            
            if (useCloud && window.cloudStorage) {
                try {
                    // 显示上传中状态
                    const uploadBtn = document.querySelector('button[type="submit"]');
                    const originalText = uploadBtn?.innerHTML;
                    if (uploadBtn) {
                        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading to Cloudinary...';
                        uploadBtn.disabled = true;
                    }
                    
                    // 上传到Cloudinary
                    console.log('Uploading to Cloudinary...');
                    const result = await window.cloudStorage.uploadImage(file, {
                        folder: document.getElementById('uploadCategory')?.value || 'general',
                        tags: ['admin-upload', new Date().toISOString()]
                    });
                    
                    console.log('Cloudinary upload result:', result);
                    
                    if (result.success) {
                        // 创建统一的图片数据结构
                        const imageData = {
                            thumbnailUrl: result.data.urls.thumbnail,
                            imageUrl: result.data.secure_url, // 使用原始URL作为imageUrl
                            cloudUrl: result.data.secure_url,
                            cloudPublicId: result.data.public_id,
                            cloudUrls: result.data.urls,
                            originalWidth: result.data.width,
                            originalHeight: result.data.height
                        };
                        
                        console.log('Image data structure:', imageData);
                        
                        // 回调
                        callback(imageData);
                        
                        // 恢复按钮
                        if (uploadBtn) {
                            uploadBtn.innerHTML = originalText;
                            uploadBtn.disabled = false;
                        }
                        
                        console.log('Cloudinary upload successful!');
                    } else {
                        throw new Error(result.error || 'Upload failed');
                    }
                } catch (error) {
                    console.error('Cloud upload failed:', error);
                    alert(`Cloud upload failed: ${error.message}`);
                    
                    // 恢复按钮
                    const uploadBtn = document.querySelector('button[type="submit"]');
                    if (uploadBtn) {
                        uploadBtn.innerHTML = uploadBtn.getAttribute('data-original-text') || 'Upload Image';
                        uploadBtn.disabled = false;
                    }
                    
                    // 回退到本地处理
                    originalProcessImageFile(file, callback);
                }
            } else {
                // 使用原始方法（本地处理）
                originalProcessImageFile(file, (processedImage) => {
                    // 确保数据结构一致
                    if (processedImage.url && !processedImage.imageUrl) {
                        processedImage.imageUrl = processedImage.url;
                    }
                    if (!processedImage.thumbnailUrl && processedImage.imageUrl) {
                        processedImage.thumbnailUrl = processedImage.imageUrl;
                    }
                    callback(processedImage);
                });
            }
        };
        
        console.log('processImageFile has been enhanced with data fix');
    }
    
    /**
     * 修复图片显示函数
     */
    function enhanceAddPictureToGrid() {
        if (typeof addPictureToGrid === 'function') {
            const originalAddPictureToGrid = window.addPictureToGrid;
            
            window.addPictureToGrid = function(container, picture) {
                // 确保图片URL正确
                const imageUrl = picture.imageUrl || picture.url || picture.thumbnailUrl || picture.cloudUrl;
                const thumbnailUrl = picture.thumbnailUrl || imageUrl;
                
                // 创建修正后的图片对象
                const fixedPicture = {
                    ...picture,
                    imageUrl: imageUrl,
                    thumbnailUrl: thumbnailUrl
                };
                
                // 调用原始函数
                return originalAddPictureToGrid.call(this, container, fixedPicture);
            };
            
            console.log('addPictureToGrid has been enhanced');
        }
    }
    
    /**
     * 监听图片上传成功事件，确保数据正确保存
     */
    function monitorPictureUploads() {
        // 监听表单提交
        const uploadForm = document.getElementById('uploadPictureForm');
        if (uploadForm && !uploadForm.hasAttribute('data-monitored')) {
            uploadForm.setAttribute('data-monitored', 'true');
            
            // 在表单提交事件中添加额外的验证
            uploadForm.addEventListener('submit', function(e) {
                console.log('Upload form submitted - monitoring for data consistency');
            });
        }
    }
    
    /**
     * 添加调试功能
     */
    window.debugPictureData = function() {
        const adminPictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
        const sitePictures = JSON.parse(localStorage.getItem('sitePictures') || '[]');
        
        console.log('=== Picture Data Debug ===');
        console.log('Admin Pictures:', adminPictures);
        console.log('Site Pictures:', sitePictures);
        
        // 检查URL类型
        const urlTypes = {
            cloudinary: 0,
            unsplash: 0,
            local: 0,
            empty: 0,
            other: 0
        };
        
        adminPictures.forEach(pic => {
            const url = pic.imageUrl || pic.url || pic.thumbnailUrl;
            if (!url) {
                urlTypes.empty++;
            } else if (url.includes('cloudinary')) {
                urlTypes.cloudinary++;
            } else if (url.includes('unsplash')) {
                urlTypes.unsplash++;
            } else if (url.startsWith('/') || url.startsWith('./')) {
                urlTypes.local++;
            } else {
                urlTypes.other++;
            }
        });
        
        console.log('URL Types:', urlTypes);
        
        // 检查最近上传的图片
        const recentPictures = adminPictures
            .filter(pic => pic.uploadDate)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 3);
        
        console.log('Recent Pictures:', recentPictures);
    };
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing picture data fixes...');
        
        // 修复现有数据
        fixExistingPictureData();
        
        // 增强函数
        enhanceAddPictureToGrid();
        
        // 监控上传
        monitorPictureUploads();
        
        // 延迟执行，确保其他脚本已加载
        setTimeout(() => {
            fixExistingPictureData();
            enhanceAddPictureToGrid();
            monitorPictureUploads();
        }, 1000);
    });
    
    // 如果DOM已加载，立即执行
    if (document.readyState !== 'loading') {
        fixExistingPictureData();
        enhanceAddPictureToGrid();
        monitorPictureUploads();
    }
    
})(); 