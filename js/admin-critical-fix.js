/**
 * Admin Critical Fix - 解决管理界面的关键问题
 * 1. 停止无限循环和冲突
 * 2. 修复加载状态
 * 3. 简化初始化过程
 * 4. 防止脚本重复执行
 */

(function() {
    'use strict';
    
    console.log('Admin Critical Fix loading...');
    
    // 防止重复执行
    if (window.adminCriticalFixLoaded) {
        console.log('Admin Critical Fix already loaded, skipping...');
        return;
    }
    window.adminCriticalFixLoaded = true;
    
    // 停止现有的同步间隔
    if (window.gallerySyncInterval) {
        clearInterval(window.gallerySyncInterval);
        console.log('Cleared existing gallery sync interval');
    }
    
    // 简化的图片管理
    const AdminFix = {
        picturesLoaded: false,
        
        // 初始化修复
        init() {
            console.log('Initializing admin critical fixes...');
            
            // 立即移除加载状态
            this.hideLoadingIndicators();
            
            // 设置错误处理
            this.setupErrorHandling();
            
            // 初始化图片显示
            this.initPictureDisplay();
            
            // 修复上传功能
            this.fixUploadFunctionality();
            
            // 设置安全的同步
            this.setupSafeSync();
            
            console.log('Admin critical fixes initialized');
        },
        
        // 移除加载指示器
        hideLoadingIndicators() {
            const loadingIndicators = document.querySelectorAll('.loading-indicator');
            loadingIndicators.forEach(indicator => {
                indicator.style.display = 'none';
            });
            
            // 如果没有图片，显示提示信息
            setTimeout(() => {
                const pictureGrid = document.getElementById('pictureGrid');
                if (pictureGrid && pictureGrid.children.length <= 1) {
                    this.showEmptyState(pictureGrid);
                }
            }, 100);
        },
        
        // 显示空状态
        showEmptyState(container) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="fas fa-images" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No Images Found</h3>
                    <p>Upload your first image to get started</p>
                    <button class="admin-btn primary" onclick="document.getElementById('uploadPictureBtn').click()">
                        <i class="fas fa-upload"></i> Upload Image
                    </button>
                </div>
            `;
            
            // 清除现有内容
            container.innerHTML = '';
            container.appendChild(emptyState);
        },
        
        // 设置错误处理
        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('JavaScript Error:', event.error);
                
                // 如果是关键错误，显示用户友好的消息
                if (event.error && event.error.message) {
                    const message = event.error.message.toLowerCase();
                    if (message.includes('indexeddb') || message.includes('database')) {
                        this.showDatabaseError();
                    }
                }
            });
        },
        
        // 显示数据库错误
        showDatabaseError() {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Database initialization failed. Using fallback storage.</span>
                    <button onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            document.body.appendChild(errorDiv);
            
            // 自动移除
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        },
        
        // 初始化图片显示
        initPictureDisplay() {
            try {
                // 尝试从localStorage加载图片
                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                console.log(`Loading ${adminPictures.length} pictures from storage`);
                
                this.displayPictures(adminPictures);
                this.picturesLoaded = true;
                
            } catch (error) {
                console.error('Error loading pictures:', error);
                this.createSamplePictures();
            }
        },
        
        // 显示图片
        displayPictures(pictures) {
            const pictureGrid = document.getElementById('pictureGrid');
            if (!pictureGrid) return;
            
            // 清除加载指示器
            pictureGrid.innerHTML = '';
            
            if (pictures.length === 0) {
                this.showEmptyState(pictureGrid);
                return;
            }
            
            pictures.forEach(picture => {
                this.addPictureToGrid(pictureGrid, picture);
            });
        },
        
        // 添加图片到网格
        addPictureToGrid(container, picture) {
            const pictureCard = document.createElement('div');
            pictureCard.className = 'picture-card';
            pictureCard.innerHTML = `
                <div class="picture-thumbnail">
                    <img src="${picture.imageUrl || picture.url}" alt="${picture.title || 'Image'}" 
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="picture-info">
                    <div class="picture-title">${picture.title || 'Untitled'}</div>
                    <div class="picture-category">
                        <span class="category-tag ${picture.category || 'scenery'}">${picture.category || 'scenery'}</span>
                    </div>
                    <div class="picture-description">${picture.description || 'No description'}</div>
                </div>
                <div class="picture-actions">
                    <button class="action-btn edit" onclick="AdminFix.editPicture('${picture.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="AdminFix.deletePicture('${picture.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(pictureCard);
        },
        
        // 创建示例图片
        createSamplePictures() {
            const samplePictures = [
                {
                    id: 'sample_1',
                    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Beautiful Beach',
                    description: 'Stunning beach view in Sri Lanka',
                    category: 'beach',
                    uploadDate: new Date().toISOString()
                },
                {
                    id: 'sample_2',
                    imageUrl: 'https://images.unsplash.com/photo-1588598198321-9735fd58f0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Cultural Temple',
                    description: 'Traditional Sri Lankan temple',
                    category: 'culture',
                    uploadDate: new Date().toISOString()
                },
                {
                    id: 'sample_3',
                    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Wild Elephants',
                    description: 'Elephants in natural habitat',
                    category: 'wildlife',
                    uploadDate: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('adminPictures', JSON.stringify(samplePictures));
            this.displayPictures(samplePictures);
            
            console.log('Created sample pictures');
        },
        
        // 修复上传功能
        fixUploadFunctionality() {
            const uploadForm = document.getElementById('uploadPictureForm');
            if (!uploadForm) return;
            
            // 移除现有的事件监听器
            const newForm = uploadForm.cloneNode(true);
            uploadForm.parentNode.replaceChild(newForm, uploadForm);
            
            // 添加新的事件监听器
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload(newForm);
            });
            
            console.log('Upload functionality fixed');
        },
        
        // 处理上传
        async handleUpload(form) {
            try {
                const fileInput = form.querySelector('#pictureFile');
                const nameInput = form.querySelector('#pictureName');
                const categoryInput = form.querySelector('#uploadCategory');
                const descriptionInput = form.querySelector('#pictureDescription');
                
                if (!fileInput.files[0]) {
                    alert('Please select an image file');
                    return;
                }
                
                // 显示上传进度
                this.showUploadProgress();
                
                // 读取文件
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const imageData = {
                        id: 'pic_' + Date.now(),
                        imageUrl: e.target.result,
                        title: nameInput.value || 'Untitled',
                        category: categoryInput.value || 'scenery',
                        description: descriptionInput.value || '',
                        uploadDate: new Date().toISOString()
                    };
                    
                    // 保存到localStorage
                    const pictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                    pictures.push(imageData);
                    localStorage.setItem('adminPictures', JSON.stringify(pictures));
                    
                    // 刷新显示
                    this.displayPictures(pictures);
                    
                    // 关闭模态框
                    const modal = document.getElementById('uploadModal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // 重置表单
                    form.reset();
                    
                    this.hideUploadProgress();
                    this.showSuccessMessage('Image uploaded successfully!');
                };
                
                reader.readAsDataURL(file);
                
            } catch (error) {
                console.error('Upload error:', error);
                this.hideUploadProgress();
                alert('Upload failed. Please try again.');
            }
        },
        
        // 显示上传进度
        showUploadProgress() {
            const progressDiv = document.createElement('div');
            progressDiv.id = 'uploadProgress';
            progressDiv.className = 'upload-progress';
            progressDiv.innerHTML = `
                <div class="progress-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Uploading image...</span>
                </div>
            `;
            document.body.appendChild(progressDiv);
        },
        
        // 隐藏上传进度
        hideUploadProgress() {
            const progressDiv = document.getElementById('uploadProgress');
            if (progressDiv) {
                progressDiv.remove();
            }
        },
        
        // 显示成功消息
        showSuccessMessage(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-notification';
            successDiv.innerHTML = `
                <div class="success-content">
                    <i class="fas fa-check-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 3000);
        },
        
        // 编辑图片
        editPicture(id) {
            console.log('Edit picture:', id);
            alert('Edit functionality will be implemented');
        },
        
        // 删除图片
        deletePicture(id) {
            if (!confirm('Are you sure you want to delete this image?')) return;
            
            try {
                const pictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                const filteredPictures = pictures.filter(pic => pic.id !== id);
                localStorage.setItem('adminPictures', JSON.stringify(filteredPictures));
                
                this.displayPictures(filteredPictures);
                this.showSuccessMessage('Image deleted successfully!');
                
            } catch (error) {
                console.error('Delete error:', error);
                alert('Delete failed. Please try again.');
            }
        },
        
        // 设置安全的同步（减少频率）
        setupSafeSync() {
            // 只在必要时同步，减少频率
            window.gallerySyncInterval = setInterval(() => {
                if (this.picturesLoaded) {
                    this.syncToGallery();
                }
            }, 30000); // 30秒一次，而不是5秒
            
            console.log('Safe sync interval set up');
        },
        
        // 同步到画廊
        syncToGallery() {
            try {
                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                const galleryImages = adminPictures.map(pic => ({
                    id: pic.id,
                    url: pic.imageUrl || pic.url,
                    title: pic.title || 'Untitled',
                    description: pic.description || '',
                    category: pic.category || 'scenery',
                    uploadDate: pic.uploadDate
                }));
                
                localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
                console.log(`Synced ${galleryImages.length} images to gallery`);
                
            } catch (error) {
                console.error('Sync error:', error);
            }
        }
    };
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .empty-state h3 {
            margin: 0 0 8px 0;
            color: #333;
        }
        
        .empty-state p {
            margin: 0 0 24px 0;
        }
        
        .error-notification, .success-notification, .upload-progress {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px;
            max-width: 400px;
        }
        
        .error-notification {
            border-left: 4px solid #e74c3c;
        }
        
        .success-notification {
            border-left: 4px solid #27ae60;
        }
        
        .upload-progress {
            border-left: 4px solid #3498db;
        }
        
        .error-content, .success-content, .progress-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .error-content i {
            color: #e74c3c;
        }
        
        .success-content i {
            color: #27ae60;
        }
        
        .progress-content i {
            color: #3498db;
        }
        
        .picture-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .picture-card:hover {
            transform: translateY(-2px);
        }
        
        .picture-thumbnail img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .picture-info {
            padding: 16px;
        }
        
        .picture-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .category-tag {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: white;
            background: #3498db;
        }
        
        .picture-actions {
            padding: 12px 16px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            background: none;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .action-btn.edit:hover {
            background: #3498db;
            color: white;
        }
        
        .action-btn.delete:hover {
            background: #e74c3c;
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    // 暴露到全局
    window.AdminFix = AdminFix;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => AdminFix.init(), 500);
        });
    } else {
        setTimeout(() => AdminFix.init(), 500);
    }
    
    console.log('Admin Critical Fix loaded successfully');
    
})(); 