/**
 * Admin Modal Fix
 * 这个文件用来修复管理员界面模态框按钮不工作的问题
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Modal Fix loaded');
    setTimeout(fixModals, 500); // 给页面一些时间加载所有元素
    
    // 修复文件上传功能
    setTimeout(fixFileUpload, 600);
    
    // 添加委托事件监听器，用于处理动态生成的编辑按钮
    document.addEventListener('click', function(e) {
        // 检查是否点击了编辑图片按钮
        if (e.target.classList.contains('edit-picture') || 
            (e.target.parentElement && e.target.parentElement.classList.contains('edit-picture'))) {
            e.preventDefault();
            e.stopPropagation();
            
            // 获取图片ID
            const button = e.target.classList.contains('edit-picture') ? e.target : e.target.parentElement;
            const pictureId = button.getAttribute('data-id');
            
            if (pictureId) {
                console.log('编辑图片按钮被点击，图片ID:', pictureId);
                // 调用editPicture函数
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                }
            }
        }
    });
});

/**
 * 修复模态框按钮的函数
 */
function fixModals() {
    // 定义模态框按钮映射
    const buttonModalMap = [
        { buttonId: 'uploadPictureBtn', modalId: 'uploadModal' },
        { buttonId: 'addToCarouselBtn', modalId: 'carouselModal' },
        { buttonId: 'addHotelBtn', modalId: 'hotelModal' },
        { buttonId: 'addRoomBtn', modalId: 'roomModal' },
        { buttonId: 'addArticleBtn', modalId: 'articleModal' },
        { buttonId: 'addVideoBtn', modalId: 'videoModal' },
        { buttonId: 'addLinkBtn', modalId: 'linkModal' },
        { buttonId: 'organizePicturesBtn', modalId: 'organizeFoldersModal' }
    ];

    // 添加按钮点击事件处理程序
    buttonModalMap.forEach(mapping => {
        const button = document.getElementById(mapping.buttonId);
        const modal = document.getElementById(mapping.modalId);
        
        if (button && modal) {
            console.log(`设置按钮事件处理程序: ${mapping.buttonId} -> ${mapping.modalId}`);
            
            // 移除可能的现有事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 添加新的事件监听器
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`打开模态框: ${mapping.modalId}`);
                openModal(mapping.modalId);
            });
        } else {
            console.warn(`未找到按钮或模态框: ${mapping.buttonId} -> ${mapping.modalId}`);
        }
    });

    // 设置关闭按钮事件处理程序
    const closeButtons = document.querySelectorAll('.close-modal, .admin-btn.secondary.cancel-upload, .cancel-btn, .cancel-edit');
    closeButtons.forEach(button => {
        // 移除可能的现有事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 添加新的事件监听器
        newButton.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log(`关闭模态框: ${modal.id}`);
                closeModal(modal.id);
            }
        });
    });

    // 点击模态框外部关闭模态框
    document.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.admin-modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                console.log(`点击外部关闭模态框: ${modal.id}`);
                closeModal(modal.id);
            }
        });
    });
    
    // 检查并修复保存更改按钮
    fixSaveChangesButtons();
}

/**
 * 修复保存更改按钮
 */
function fixSaveChangesButtons() {
    // 尝试查找编辑图片模态框的保存按钮
    const editPictureModal = document.getElementById('editPictureModal');
    if (editPictureModal) {
        const saveButton = editPictureModal.querySelector('.save-changes, #saveEditButton, button.primary');
        if (saveButton) {
            console.log('设置编辑图片模态框保存按钮事件');
            
            // 克隆按钮以移除旧事件
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            
            // 添加新事件处理程序
            newSaveButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('保存按钮被点击');
                
                // 获取表单数据
                const pictureId = document.getElementById('editPictureId').value;
                const pictureName = document.getElementById('editPictureName').value;
                const category = document.getElementById('editCategory').value;
                const description = document.getElementById('editPictureDescription').value;
                const pictureFile = document.getElementById('editPictureFile').files[0];
                
                // 检查是否存在并可调用外部函数
                if (typeof updatePicture === 'function') {
                    if (pictureFile && typeof processImageFile === 'function') {
                        processImageFile(pictureFile, function(processedImageUrl) {
                            updatePicture(pictureId, pictureName, category, description, processedImageUrl);
                        });
                    } else {
                        // 查找原图片URL
                        const picturesStr = localStorage.getItem('adminPictures');
                        const pictures = picturesStr ? JSON.parse(picturesStr) : [];
                        const picture = pictures.find(pic => pic.id === pictureId);
                        
                        if (picture) {
                            updatePicture(pictureId, pictureName, category, description, picture.imageUrl);
                        }
                    }
                } else {
                    console.error('updatePicture 函数不存在');
                    alert('保存失败: 更新函数未定义');
                }
                
                // 关闭模态框
                closeModal('editPictureModal');
                
                return false;
            };
            
            console.log('保存按钮事件绑定成功');
        }
    }
}

/**
 * 打开指定的模态框
 * @param {string} modalId - 要打开的模态框ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 确保模态框中的表单重置
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // 清除任何已存在的模态框和背景遮罩
        cleanupExistingModals();
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 添加CSS类
        if (!modal.classList.contains('active')) {
            modal.classList.add('active');
        }
        
        // 设置更高的z-index确保模态框在最上层
        modal.style.zIndex = '2000';
        
        // 确保模态框内容可点击
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '2001';
            modalContent.style.pointerEvents = 'auto';
        }
        
        // 添加body类
        document.body.classList.add('modal-open');
        
        // 创建背景遮罩并设置正确的z-index
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1999';
        backdrop.style.pointerEvents = 'auto';
        document.body.appendChild(backdrop);
    }
}

/**
 * 关闭指定的模态框
 * @param {string} modalId - 要关闭的模态框ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 隐藏模态框
        modal.style.display = 'none';
        
        // 移除CSS类
        modal.classList.remove('active');
        
        // 重置z-index
        modal.style.zIndex = '';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = '';
            modalContent.style.zIndex = '';
            modalContent.style.pointerEvents = '';
        }
        
        // 移除body类
        document.body.classList.remove('modal-open');
        
        // 移除背景遮罩
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.parentNode.removeChild(backdrop);
        });
    }
}

/**
 * 清理任何已存在的模态框和背景
 */
function cleanupExistingModals() {
    // 隐藏所有活跃的模态框
    const activeModals = document.querySelectorAll('.admin-modal.active');
    activeModals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.style.zIndex = '';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = '';
            modalContent.style.zIndex = '';
            modalContent.style.pointerEvents = '';
        }
    });
    
    // 移除所有背景遮罩
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.parentNode.removeChild(backdrop);
    });
    
    // 移除body类
    document.body.classList.remove('modal-open');
}

/**
 * 修复文件上传功能
 */
function fixFileUpload() {
    console.log('修复文件上传功能');
    
    // 修复图片上传预览
    const pictureFile = document.getElementById('pictureFile');
    const filePreview = document.getElementById('filePreview');
    
    if (pictureFile && filePreview) {
        console.log('设置图片上传预览事件');
        
        // 移除现有监听器
        const newPictureFile = pictureFile.cloneNode(true);
        pictureFile.parentNode.replaceChild(newPictureFile, pictureFile);
        
        // 添加新监听器
        newPictureFile.addEventListener('change', function(e) {
            console.log('图片文件已选择');
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    filePreview.innerHTML = `<img src="${event.target.result}" alt="预览" style="max-width: 100%; max-height: 300px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                filePreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
            }
        });
    }
    
    // 修复上传表单提交
    const uploadForm = document.getElementById('uploadPictureForm');
    if (uploadForm) {
        console.log('设置上传表单提交事件');
        
        // 检查表单是否已经被admin-pictures.js处理过
        if (uploadForm.getAttribute('data-handler') === 'admin-pictures') {
            console.log('上传表单已经由admin-pictures.js处理，跳过事件绑定');
            return;
        }
        
        // 移除现有监听器
        const newUploadForm = uploadForm.cloneNode(true);
        uploadForm.parentNode.replaceChild(newUploadForm, uploadForm);
        
        // 设置标记，表明此表单已经处理过
        newUploadForm.setAttribute('data-handler', 'admin-modal-fix');
        
        // 修复新表单内的文件上传部分
        const newPictureFile = newUploadForm.querySelector('#pictureFile');
        const newFilePreview = newUploadForm.querySelector('#filePreview');
        
        if (newPictureFile && newFilePreview) {
            newPictureFile.addEventListener('change', function(e) {
                console.log('表单内图片文件已选择');
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        newFilePreview.innerHTML = `<img src="${event.target.result}" alt="预览" style="max-width: 100%; max-height: 300px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // 添加表单提交事件
        newUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('表单提交');
            
            const pictureFile = newUploadForm.querySelector('#pictureFile');
            const pictureName = newUploadForm.querySelector('#pictureName');
            const category = newUploadForm.querySelector('#uploadCategory');
            const description = newUploadForm.querySelector('#pictureDescription');
            
            if (!pictureFile.files[0]) {
                alert('请选择一个图片文件');
                return;
            }
            
            if (!pictureName.value.trim()) {
                alert('请输入图片名称');
                return;
            }
            
            if (!category.value) {
                alert('请选择一个分类');
                return;
            }
            
            // 这里实际上应该是上传到服务器的代码
            // 但由于是本地演示项目，我们只模拟上传操作
            
            // 假设图片保存成功，关闭模态框并显示成功消息
            setTimeout(function() {
                alert('图片上传成功！');
                closeModal('uploadModal');
                
                // 重置表单
                newUploadForm.reset();
                newFilePreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
            }, 1000);
        });
    }
} 