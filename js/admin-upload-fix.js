/**
 * Admin Upload Fix
 * 修复管理员界面上传图片按钮不响应问题
 */

(function() {
    'use strict';
    
    console.log('Admin Upload Fix loaded');
    
    // 页面加载后立即执行
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initUploadFix, 500);
    });
    
    /**
     * 初始化上传修复
     */
    function initUploadFix() {
        console.log('Initializing upload button fix...');
        
        // 修复上传图片按钮
        fixUploadButton();
        
        // 修复上传表单
        fixUploadForm();
        
        // 修复模态框
        fixUploadModal();
        
        // 定期检查按钮状态
        setInterval(checkButtons, 2000);
    }
    
    /**
     * 修复上传图片按钮
     */
    function fixUploadButton() {
        console.log('Fixing upload picture button...');
        
        // 查找上传按钮
        const uploadBtn = document.getElementById('uploadPictureBtn');
        if (!uploadBtn) {
            console.warn('Upload picture button not found');
            return;
        }
        
        console.log('Found upload picture button');
        
        // 直接在按钮上设置必要的样式
        uploadBtn.style.position = 'relative';
        uploadBtn.style.zIndex = '9999';
        uploadBtn.style.pointerEvents = 'auto';
        uploadBtn.style.cursor = 'pointer';
        
        // 记录原始按钮HTML以便于检测变化
        const originalHTML = uploadBtn.outerHTML;
        
        // 克隆按钮以移除所有现有事件监听器
        const newButton = uploadBtn.cloneNode(true);
        if (uploadBtn.parentNode) {
            uploadBtn.parentNode.replaceChild(newButton, uploadBtn);
        }
        
        // 添加强大的点击事件处理
        newButton.addEventListener('click', function(e) {
            console.log('Upload picture button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // 直接显示上传模态框
            openUploadModal();
            
            return false;
        }, true);
        
        // 同时添加内联onclick处理程序作为备份
        newButton.setAttribute('onclick', "event.preventDefault(); event.stopPropagation(); openUploadModal(); return false;");
        
        console.log('Upload button click handler set up');
    }
    
    /**
     * 打开上传模态框
     */
    function openUploadModal() {
        console.log('Opening upload modal...');
        
        const modal = document.getElementById('uploadModal');
        if (!modal) {
            console.error('Upload modal not found');
            alert('上传模态框不存在，请刷新页面再试');
            return;
        }
        
        // 设置模态框样式和显示
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // 确保模态框内容可交互
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '10000';
            modalContent.style.pointerEvents = 'auto';
        }
        
        // 重置表单
        const form = document.getElementById('uploadPictureForm');
        if (form) {
            form.reset();
            
            // 重置文件预览
            const filePreview = form.querySelector('#filePreview');
            if (filePreview) {
                filePreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
            }
        }
        
        // 修复关闭按钮
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', function() {
                closeUploadModal();
            }, true);
        }
        
        // 修复取消按钮
        const cancelBtn = modal.querySelector('.cancel-upload');
        if (cancelBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.addEventListener('click', function() {
                closeUploadModal();
            }, true);
        }
        
        console.log('Upload modal opened');
    }
    
    /**
     * 关闭上传模态框
     */
    function closeUploadModal() {
        console.log('Closing upload modal...');
        
        const modal = document.getElementById('uploadModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.remove('active');
        
        console.log('Upload modal closed');
    }
    
    /**
     * 修复上传表单
     */
    function fixUploadForm() {
        console.log('Fixing upload form...');
        
        // 查找上传表单
        const form = document.getElementById('uploadPictureForm');
        if (!form) {
            console.warn('Upload form not found');
            return;
        }
        
        // 克隆表单以移除所有现有事件监听器
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // 重新添加文件选择预览功能
        const fileInput = newForm.querySelector('#pictureFile');
        const filePreview = newForm.querySelector('#filePreview');
        
        if (fileInput && filePreview) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) {
                    filePreview.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Image preview will appear here</p>
                        </div>
                    `;
                    return;
                }
                
                // 确保是图片文件
                if (!file.type.match('image.*')) {
                    alert('请选择图片文件 (JPEG, PNG, GIF, etc.)');
                    return;
                }
                
                // 显示预览
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `
                        <div style="max-width: 100%; max-height: 300px; overflow: hidden; text-align: center;">
                            <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; object-fit: contain;">
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            });
        }
        
        // 重新添加表单提交处理
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Upload form submitted');
            
            // 验证表单
            const pictureFile = newForm.querySelector('#pictureFile');
            const pictureName = newForm.querySelector('#pictureName');
            const category = newForm.querySelector('#uploadCategory');
            
            if (!pictureFile || !pictureFile.files || !pictureFile.files[0]) {
                alert('请选择要上传的图片');
                return false;
            }
            
            if (!pictureName || !pictureName.value.trim()) {
                alert('请输入图片名称');
                return false;
            }
            
            if (!category || !category.value) {
                alert('请选择图片类别');
                return false;
            }
            
            // 添加上传状态提示
            const uploadButton = newForm.querySelector('button[type="submit"]');
            if (uploadButton) {
                uploadButton.disabled = true;
                uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            }
            
            // 处理图片上传
            handleImageUpload(newForm);
            
            return false;
        }, true);
        
        // 同时添加内联onsubmit处理程序作为备份
        newForm.setAttribute('onsubmit', "event.preventDefault(); handleImageUpload(this); return false;");
        
        console.log('Upload form fixed');
    }
    
    /**
     * 处理图片上传
     */
    function handleImageUpload(form) {
        console.log('Handling image upload...');
        
        const fileInput = form.querySelector('#pictureFile');
        const nameInput = form.querySelector('#pictureName');
        const categoryInput = form.querySelector('#uploadCategory');
        const descriptionInput = form.querySelector('#pictureDescription');
        
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            console.error('No file selected');
            return;
        }
        
        const file = fileInput.files[0];
        const name = nameInput.value.trim();
        const category = categoryInput.value;
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        
        console.log('Processing image:', name, 'category:', category);
        
        // 创建一个新的图片对象
        const imageId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        // 处理图片文件
        processImageFile(file, function(result) {
            if (!result) {
                console.error('Image processing failed');
                alert('图片处理失败，请重试');
                
                // 重置上传按钮
                const uploadButton = form.querySelector('button[type="submit"]');
                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.innerHTML = 'Upload Image';
                }
                
                return;
            }
            
            // 创建图片数据对象
            const picture = {
                id: imageId,
                name: name,
                category: category,
                description: description,
                thumbnailUrl: result.thumbnail,
                imageUrl: result.full,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                width: result.width,
                height: result.height
            };
            
            // 保存图片到存储
            saveImageToStorage(picture);
            
            // 关闭模态框
            closeUploadModal();
            
            // 刷新图片显示
            if (typeof fixPictureLoading === 'function') {
                fixPictureLoading();
            } else {
                // 尝试调用loadAndDisplayPictures函数
                if (typeof loadAndDisplayPictures === 'function') {
                    loadAndDisplayPictures();
                }
            }
            
            // 显示成功消息
            alert('图片上传成功！');
        });
    }
    
    /**
     * 处理图片文件
     * @param {File} file - 图片文件
     * @param {Function} callback - 回调函数，带有处理结果
     */
    function processImageFile(file, callback) {
        console.log('Processing image file:', file.name, 'size:', file.size);
        
        // 创建图片对象以获取尺寸
        const img = new Image();
        img.onload = function() {
            console.log('Image loaded, dimensions:', img.width, 'x', img.height);
            
            // 创建缩略图
            const thumbnail = createThumbnail(img, 400, 0.8);
            
            // 压缩完整图片
            const full = compressFullImage(img, 1200, 0.9);
            
            // 返回处理结果
            callback({
                thumbnail: thumbnail,
                full: full,
                width: img.width,
                height: img.height
            });
            
            // 释放对象URL
            URL.revokeObjectURL(img.src);
        };
        
        img.onerror = function() {
            console.error('Error loading image');
            callback(null);
            URL.revokeObjectURL(img.src);
        };
        
        img.src = URL.createObjectURL(file);
    }
    
    /**
     * 创建缩略图
     * @param {HTMLImageElement} img - 图片元素
     * @param {number} maxWidth - 最大宽度
     * @param {number} quality - JPEG质量 (0-1)
     * @returns {string} 缩略图的Data URL
     */
    function createThumbnail(img, maxWidth, quality) {
        // 计算缩放比例
        const ratio = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // 绘制缩放后的图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Data URL
        return canvas.toDataURL('image/jpeg', quality);
    }
    
    /**
     * 压缩完整图片
     * @param {HTMLImageElement} img - 图片元素
     * @param {number} maxWidth - 最大宽度
     * @param {number} quality - JPEG质量 (0-1)
     * @returns {string} 压缩后图片的Data URL
     */
    function compressFullImage(img, maxWidth, quality) {
        // 计算缩放比例
        let ratio = 1;
        if (img.width > maxWidth) {
            ratio = maxWidth / img.width;
        }
        
        // 如果图片已经小于最大宽度，则使用原始尺寸
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // 绘制缩放后的图片
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Data URL
        return canvas.toDataURL('image/jpeg', quality);
    }
    
    /**
     * 保存图片到存储
     * @param {Object} picture - 图片对象
     */
    function saveImageToStorage(picture) {
        console.log('Saving image to storage:', picture.id);
        
        try {
            // 1. 保存到IndexedDB (如果可用)
            saveToDB(picture);
            
            // 2. 保存图片元数据到localStorage (用于管理员界面)
            saveMetadataToLocalStorage(picture);
            
            // 3. 同步到前端
            syncToFrontend(picture);
            
            console.log('Image saved successfully');
            return true;
            
        } catch (error) {
            console.error('Error saving image:', error);
            return false;
        }
    }
    
    /**
     * 保存图片到IndexedDB
     * @param {Object} picture - 图片对象
     */
    function saveToDB(picture) {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported by browser');
            return;
        }
        
        try {
            const dbRequest = indexedDB.open('sriLankaImageDB', 1);
            
            dbRequest.onupgradeneeded = function(event) {
                const db = event.target.result;
                
                // 创建存储对象 (如果不存在)
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('metadata')) {
                    const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
                    metadataStore.createIndex('category', 'category', { unique: false });
                }
            };
            
            dbRequest.onsuccess = function(event) {
                const db = event.target.result;
                
                // 保存完整图片数据
                const imageTransaction = db.transaction(['images'], 'readwrite');
                const imageStore = imageTransaction.objectStore('images');
                imageStore.put({
                    id: picture.id,
                    imageUrl: picture.imageUrl,
                    uploadDate: picture.uploadDate
                });
                
                // 保存元数据
                const metadataTransaction = db.transaction(['metadata'], 'readwrite');
                const metadataStore = metadataTransaction.objectStore('metadata');
                metadataStore.put({
                    id: picture.id,
                    name: picture.name,
                    category: picture.category,
                    description: picture.description,
                    thumbnailUrl: picture.thumbnailUrl,
                    width: picture.width,
                    height: picture.height,
                    size: picture.size,
                    type: picture.type,
                    uploadDate: picture.uploadDate
                });
                
                console.log('Image saved to IndexedDB');
            };
            
            dbRequest.onerror = function(event) {
                console.error('IndexedDB error:', event.target.error);
            };
            
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
        }
    }
    
    /**
     * 保存图片元数据到localStorage
     * @param {Object} picture - 图片对象
     */
    function saveMetadataToLocalStorage(picture) {
        try {
            // 获取现有元数据
            const metadataStr = localStorage.getItem('adminPicturesMetadata');
            let metadata = metadataStr ? JSON.parse(metadataStr) : [];
            
            // 确保是数组
            if (!Array.isArray(metadata)) {
                metadata = [];
            }
            
            // 添加新图片元数据
            metadata.push({
                id: picture.id,
                name: picture.name,
                category: picture.category,
                description: picture.description,
                thumbnailUrl: picture.thumbnailUrl,
                imageUrl: picture.imageUrl,
                uploadDate: picture.uploadDate
            });
            
            // 保存回localStorage
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadata));
            
            console.log('Metadata saved to localStorage');
            
        } catch (error) {
            console.error('Error saving metadata to localStorage:', error);
        }
    }
    
    /**
     * 同步到前端
     * @param {Object} adminPicture - 管理员图片对象
     */
    function syncToFrontend(adminPicture) {
        try {
            // 创建前端图片对象 (不包含完整图片数据，只包含必要信息)
            const frontendPicture = {
                id: adminPicture.id,
                name: adminPicture.name,
                category: adminPicture.category.toLowerCase(),
                description: adminPicture.description,
                url: adminPicture.thumbnailUrl,  // 使用缩略图URL，减小大小
                uploadDate: adminPicture.uploadDate
            };
            
            // 获取现有前端图片
            const sitePicturesStr = localStorage.getItem('sitePictures');
            let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
            
            // 确保是数组
            if (!Array.isArray(sitePictures)) {
                sitePictures = [];
            }
            
            // 添加新图片
            sitePictures.push(frontendPicture);
            
            // 保存回localStorage
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            
            console.log('Image synced to frontend');
            
            // 触发同步事件
            const syncEvent = new CustomEvent('gallery-updated');
            document.dispatchEvent(syncEvent);
            
        } catch (error) {
            console.error('Error syncing to frontend:', error);
        }
    }
    
    /**
     * 修复上传模态框
     */
    function fixUploadModal() {
        console.log('Fixing upload modal...');
        
        const modal = document.getElementById('uploadModal');
        if (!modal) return;
        
        // 确保模态框可见且正常工作
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '5000';
        modal.style.display = 'none';
        
        // 修复模态框内容
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflowY = 'auto';
        }
    }
    
    /**
     * 检查按钮状态
     */
    function checkButtons() {
        // 检查上传按钮
        const uploadBtn = document.getElementById('uploadPictureBtn');
        if (uploadBtn && !uploadBtn.onclick) {
            console.log('Upload button needs fixing again');
            fixUploadButton();
        }
        
        // 检查上传表单
        const form = document.getElementById('uploadPictureForm');
        if (form && !form.onsubmit) {
            console.log('Upload form needs fixing again');
            fixUploadForm();
        }
    }
    
})(); 