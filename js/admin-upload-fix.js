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
        
        if (!fileInput || !nameInput || !categoryInput) {
            console.error('Required form fields not found');
            alert('表单字段缺失，请刷新页面再试');
            return;
        }
        
        const file = fileInput.files[0];
        if (!file) {
            alert('请选择要上传的图片');
            return;
        }
        
        // 读取图片文件
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // 创建图片对象
            const picture = {
                id: 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name: nameInput.value.trim(),
                category: categoryInput.value,
                description: descriptionInput ? descriptionInput.value.trim() : '',
                imageUrl: imageUrl,
                uploadDate: new Date().toISOString()
            };
            
            // 保存图片到localStorage
            saveImageToStorage(picture);
            
            // 关闭模态框
            closeUploadModal();
            
            // 重置表单
            form.reset();
            const filePreview = form.querySelector('#filePreview');
            if (filePreview) {
                filePreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
            }
            
            // 显示成功消息
            alert('图片上传成功！');
            
            // 刷新图片列表
            if (typeof loadAndDisplayPictures === 'function') {
                loadAndDisplayPictures();
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * 保存图片到存储
     */
    function saveImageToStorage(picture) {
        console.log('Saving image to storage:', picture.name);
        
        try {
            // 获取现有图片
            const storageData = localStorage.getItem('adminPictures');
            let pictures = [];
            
            if (storageData) {
                pictures = JSON.parse(storageData);
                if (!Array.isArray(pictures)) {
                    pictures = [];
                }
            }
            
            // 添加新图片
            pictures.push(picture);
            
            // 保存回localStorage
            localStorage.setItem('adminPictures', JSON.stringify(pictures));
            
            console.log('Image saved successfully');
            
            // 同步到前端显示
            syncToFrontend(picture);
            
            // 触发自定义事件
            const event = new CustomEvent('pictureSaved', {
                detail: { picture: picture }
            });
            document.dispatchEvent(event);
            
            return true;
        } catch (e) {
            console.error('Error saving image:', e);
            alert('保存图片时出错: ' + e.message);
            return false;
        }
    }
    
    /**
     * 同步图片到前端显示
     */
    function syncToFrontend(adminPicture) {
        console.log('Syncing image to frontend display');
        
        try {
            // 获取现有前端图片
            const storageData = localStorage.getItem('sitePictures');
            let pictures = [];
            
            if (storageData) {
                pictures = JSON.parse(storageData);
                if (!Array.isArray(pictures)) {
                    pictures = [];
                }
            }
            
            // 转换为前端格式
            const frontendPicture = {
                id: adminPicture.id,
                name: adminPicture.name,
                category: adminPicture.category,
                description: adminPicture.description,
                url: adminPicture.imageUrl,
                uploadDate: adminPicture.uploadDate
            };
            
            // 添加到前端图片集
            pictures.push(frontendPicture);
            
            // 保存回localStorage
            localStorage.setItem('sitePictures', JSON.stringify(pictures));
            
            console.log('Image synced to frontend display');
        } catch (e) {
            console.error('Error syncing to frontend:', e);
        }
    }
    
    /**
     * 修复上传模态框
     */
    function fixUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (!modal) return;
        
        // 确保模态框可以正确显示
        modal.style.zIndex = '9999';
        
        // 修复模态框内容区域
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '10000';
            modalContent.style.pointerEvents = 'auto';
        }
    }
    
    /**
     * 检查按钮状态并确保它们是可点击的
     */
    function checkButtons() {
        // 重新检查上传按钮
        const uploadBtn = document.getElementById('uploadPictureBtn');
        if (uploadBtn && !uploadBtn.hasAttribute('fixed-by-uploader')) {
            console.log('Re-fixing upload button');
            fixUploadButton();
            uploadBtn.setAttribute('fixed-by-uploader', 'true');
        }
    }
    
    // 暴露公共函数供其他脚本使用
    window.adminUploadFix = {
        openUploadModal: openUploadModal,
        closeUploadModal: closeUploadModal,
        handleImageUpload: handleImageUpload,
        saveImageToStorage: saveImageToStorage
    };
})(); 