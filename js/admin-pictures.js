/**
 * Admin Pictures Management
 * 处理管理员界面的图片管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Management loaded');
    
    // Synchronize storage between admin and frontend
    synchronizeImageStorage();
    
    // 初始化图片管理
    initPictureManagement();
    
    // 初始化轮播图管理
    initCarouselManagement();
    
    // Add CSS fixes for picture display
    addPictureStyles();
    
    // Prevent duplicate form handling by marking forms as initialized
    preventDuplicateHandling();
    
    // 初始化分页控件
    initPagination();
});

// 全局变量用于分页
let currentPage = 1;
let imagesPerPage = 12; // 默认每页显示12张图片
let totalPages = 1;
let currentCategory = 'all';

/**
 * 防止重复处理表单提交
 * Prevent duplicate form handling between admin-pictures.js and admin-dashboard.js
 */
function preventDuplicateHandling() {
    // Mark all forms that we handle exclusively in this file
    const uploadPictureForm = document.getElementById('uploadPictureForm');
    if (uploadPictureForm) {
        uploadPictureForm.setAttribute('data-handler', 'admin-pictures');
        console.log('Upload form marked as handled by admin-pictures.js');
        
        // Remove any existing listeners that might be from admin-dashboard.js
        const oldForm = uploadPictureForm.cloneNode(true);
        uploadPictureForm.parentNode.replaceChild(oldForm, uploadPictureForm);
        
        // Call our initialization function on the new form
        fixPictureUploadForm(oldForm);
    }
}

/**
 * 同步管理员界面和前端界面的图片存储
 * Synchronize image storage between admin interface and frontend
 */
function synchronizeImageStorage() {
    console.log('Synchronizing image storage between admin and frontend...');
    
    // 使用新的IndexedDB服务同步数据是自动的
    // 无需额外操作，因为所有修改都会自动同步到前端
    console.log('Using enhanced storage service for automatic sync');
}

/**
 * 移除数组中的重复项
 * @param {Array} array - 要处理的数组
 * @returns {Array} - 去重后的数组
 */
function removeDuplicates(array) {
    const seen = new Set();
    return array.filter(item => {
        const key = item.id ? item.id : (item.name + (item.url || item.imageUrl));
        const duplicate = seen.has(key);
        seen.add(key);
        return !duplicate;
    });
}

/**
 * 添加图片样式修复
 */
function addPictureStyles() {
    // Create a style element
    const style = document.createElement('style');
    
    // Add CSS to fix image display issues
    style.textContent = `
        .picture-image {
            width: 100%;
            height: 200px;
            overflow: hidden;
            border-radius: 8px 8px 0 0;
            position: relative;
        }
        
        .picture-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .picture-card {
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            background: white;
            overflow: hidden;
        }
        
        .picture-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .picture-card:hover .picture-image img {
            transform: scale(1.05);
        }
        
        .picture-info {
            padding: 15px;
        }
        
        .picture-info h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 16px;
            color: #333;
        }
        
        .picture-category {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: white;
            margin-bottom: 10px;
        }
        
        .picture-category.scenery { background-color: #4CAF50; }
        .picture-category.wildlife { background-color: #FF9800; }
        .picture-category.culture { background-color: #9C27B0; }
        .picture-category.food { background-color: #F44336; }
        .picture-category.beach { background-color: #03A9F4; }
        
        .picture-description {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
            height: 40px;
            overflow: hidden;
        }
        
        .picture-actions {
            padding: 0 15px 15px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .picture-actions button {
            background: transparent;
            border: none;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
        }
        
        .picture-actions button:hover {
            background-color: rgba(0,0,0,0.05);
        }
        
        .picture-actions .edit-picture {
            color: #2196F3;
        }
        
        .picture-actions .delete-picture {
            color: #F44336;
        }
        
        .select-picture-image {
            width: 100%;
            height: 150px;
            overflow: hidden;
            border-radius: 4px;
            position: relative;
        }
        
        .select-picture-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .carousel-item-image {
            width: 120px;
            height: 80px;
            overflow: hidden;
            border-radius: 4px;
        }
        
        .carousel-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        #pictureGrid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px 0;
        }
        
        .no-pictures-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: #888;
        }
        
        .no-pictures-message i {
            font-size: 48px;
            margin-bottom: 15px;
            color: #ccc;
        }
    `;
    
    // Append the style element to the head
    document.head.appendChild(style);
}

/**
 * 初始化图片管理功能
 */
function initPictureManagement() {
    console.log('初始化图片管理');
    
    // 加载并显示图片
    loadAndDisplayPictures();
    
    // 设置图片筛选功能
    setupPictureFilter();
    
    // 修复图片上传表单提交
    fixPictureUploadForm();
}

/**
 * 初始化分页控件
 */
function initPagination() {
    // 创建分页控件容器
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid) return;
    
    // 检查是否已存在分页容器
    let paginationContainer = document.querySelector('.admin-pagination');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'admin-pagination';
        paginationContainer.innerHTML = `
            <div class="pagination-controls">
                <button class="pagination-btn prev-page" disabled><i class="fas fa-chevron-left"></i> 上一页</button>
                <span class="pagination-info">第 <span class="current-page">1</span> 页，共 <span class="total-pages">1</span> 页</span>
                <button class="pagination-btn next-page" disabled>下一页 <i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="per-page-selector">
                每页显示: 
                <select class="per-page-select">
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                    <option value="48">48</option>
                </select>
                 张图片
            </div>
        `;
        
        // 将分页容器添加到图片网格后面
        pictureGrid.parentNode.insertBefore(paginationContainer, pictureGrid.nextSibling);
        
        // 添加分页控件样式
        const style = document.createElement('style');
        style.textContent = `
            .admin-pagination {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 20px 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            
            .pagination-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .pagination-btn {
                padding: 6px 12px;
                background: #4285f4;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .pagination-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            .pagination-info {
                font-size: 14px;
                color: #555;
            }
            
            .per-page-selector {
                font-size: 14px;
                color: #555;
            }
            
            .per-page-select {
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #ccc;
                margin: 0 5px;
            }
        `;
        document.head.appendChild(style);
        
        // 添加分页事件处理
        setupPaginationEvents();
    }
}

/**
 * 设置分页事件处理
 */
function setupPaginationEvents() {
    const prevBtn = document.querySelector('.prev-page');
    const nextBtn = document.querySelector('.next-page');
    const perPageSelect = document.querySelector('.per-page-select');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadAndDisplayPictures();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                loadAndDisplayPictures();
            }
        });
    }
    
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function() {
            imagesPerPage = parseInt(this.value);
            currentPage = 1; // 重置到第一页
            loadAndDisplayPictures();
        });
    }
}

/**
 * 更新分页控件状态
 * @param {Object} pagination - 分页信息对象
 */
function updatePaginationControls(pagination) {
    const currentPageElem = document.querySelector('.current-page');
    const totalPagesElem = document.querySelector('.total-pages');
    const prevBtn = document.querySelector('.prev-page');
    const nextBtn = document.querySelector('.next-page');
    
    if (currentPageElem) currentPageElem.textContent = pagination.currentPage;
    if (totalPagesElem) totalPagesElem.textContent = pagination.totalPages;
    
    if (prevBtn) prevBtn.disabled = !pagination.hasPrev;
    if (nextBtn) nextBtn.disabled = !pagination.hasNext;
    
    // 更新全局变量
    currentPage = pagination.currentPage;
    totalPages = pagination.totalPages;
}

/**
 * 加载并显示所有图片
 */
function loadAndDisplayPictures() {
    // 获取图片容器
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid) {
        console.error('Picture grid container not found');
        return;
    }
    
    // 显示加载状态
    pictureGrid.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading images...</p>
        </div>
    `;
    
    // 使用新的存储服务加载图片
    if (window.ImageStorageService) {
        const params = {
            category: currentCategory,
            page: currentPage,
            limit: imagesPerPage,
            sort: 'newest'
        };
        
        window.ImageStorageService.getAllImages(params, function(result) {
            // 清空容器
            pictureGrid.innerHTML = '';
            
            const images = result.images;
            const pagination = result.pagination;
            
            // 更新分页控件
            updatePaginationControls(pagination);
            
            // 显示图片或提示信息
            if (images.length === 0) {
                pictureGrid.innerHTML = `
                    <div class="no-pictures-message">
                        <i class="fas fa-image"></i>
                        <p>No pictures found. Upload some pictures to get started.</p>
                    </div>
                `;
                return;
            }
            
            // 显示所有图片
            images.forEach(picture => {
                addPictureToGrid(pictureGrid, picture);
            });
        });
    } else {
        // 回退到旧的存储方法
        const savedPictures = loadPictures(currentCategory);
        
        // 清空容器
        pictureGrid.innerHTML = '';
        
        // 显示图片或提示信息
        if (savedPictures.length === 0) {
            pictureGrid.innerHTML = `
                <div class="no-pictures-message">
                    <i class="fas fa-image"></i>
                    <p>No pictures found. Upload some pictures to get started.</p>
                </div>
            `;
            return;
        }
        
        // 简单分页处理
        const startIndex = (currentPage - 1) * imagesPerPage;
        const endIndex = startIndex + imagesPerPage;
        const pagedPictures = savedPictures.slice(startIndex, endIndex);
        
        // 计算总页数
        totalPages = Math.ceil(savedPictures.length / imagesPerPage);
        
        // 更新分页控件
        updatePaginationControls({
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: savedPictures.length,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1
        });
        
        // 显示分页后的图片
        pagedPictures.forEach(picture => {
            addPictureToGrid(pictureGrid, picture);
        });
    }
}

/**
 * 从localStorage加载保存的图片
 * @param {string} category - 可选的图片分类筛选
 * @returns {Array} 图片对象数组
 */
function loadPictures(category = 'all') {
    try {
        // 从localStorage获取保存的图片
        const picturesStr = localStorage.getItem('adminPictures');
        let pictures = picturesStr ? JSON.parse(picturesStr) : [];
        
        // 确保是数组
        if (!Array.isArray(pictures)) {
            pictures = [];
        }
        
        // 如果没有图片，创建示例图片（仅在Netlify上运行时）
        if (pictures.length === 0 && window.location.href.includes('netlify')) {
            pictures = createSamplePictures();
            
            // 保存样本图片到localStorage
            localStorage.setItem('adminPictures', JSON.stringify(pictures));
            
            // Also save to sitePictures for frontend
            const sitePictures = pictures.map(pic => ({
                id: pic.id,
                name: pic.name,
                category: pic.category,
                description: pic.description,
                url: pic.imageUrl,
                uploadDate: pic.uploadDate
            }));
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
        }
        
        // 如果指定了分类，进行筛选
        if (category !== 'all') {
            pictures = pictures.filter(pic => pic.category === category);
        }
        
        console.log(`加载了${pictures.length}张图片，分类: ${category}`);
        return pictures;
    } catch (e) {
        console.error('加载图片时出错:', e);
        return [];
    }
}

/**
 * 创建示例图片
 * @returns {Array} 示例图片数组
 */
function createSamplePictures() {
    return [
        {
            id: 'sample_pic_1',
            name: 'Scenic Beach',
            category: 'beach',
            description: 'Beautiful beach in Sri Lanka',
            imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_2',
            name: 'Sri Lankan Culture',
            category: 'culture',
            description: 'Traditional cultural dance',
            imageUrl: 'https://images.unsplash.com/photo-1625468228209-d76af1cc7f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_3',
            name: 'Wildlife Safari',
            category: 'wildlife',
            description: 'Elephants in Yala National Park',
            imageUrl: 'https://images.unsplash.com/photo-1560953222-1f5c46da5697?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_4',
            name: 'Mountain Scenery',
            category: 'scenery',
            description: 'Beautiful mountains in central Sri Lanka',
            imageUrl: 'https://images.unsplash.com/photo-1586005126644-7358e98bf2b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            uploadDate: new Date().toISOString()
        }
    ];
}

/**
 * 将图片添加到网格容器中
 * @param {HTMLElement} container - 容器元素
 * @param {Object} picture - 图片对象
 */
function addPictureToGrid(container, picture) {
    // 创建图片卡片元素
    const pictureCard = document.createElement('div');
    pictureCard.className = 'picture-card';
    pictureCard.setAttribute('data-id', picture.id);
    pictureCard.setAttribute('data-category', picture.category);
    
    // 设置图片卡片内容
    pictureCard.innerHTML = `
        <div class="picture-image">
            <img src="${picture.imageUrl}" alt="${picture.name}">
        </div>
        <div class="picture-info">
            <h3>${picture.name}</h3>
            <div class="picture-category">
                <span class="${picture.category}">${picture.category}</span>
            </div>
            <p class="picture-description">${picture.description || ''}</p>
        </div>
        <div class="picture-actions">
            <button class="edit-picture" data-id="${picture.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-picture" data-id="${picture.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // 添加到容器
    container.appendChild(pictureCard);
    
    // 添加编辑和删除事件处理
    const editBtn = pictureCard.querySelector('.edit-picture');
    const deleteBtn = pictureCard.querySelector('.delete-picture');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            editPicture(picture.id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deletePicture(picture.id);
        });
    }
}

/**
 * 设置图片分类筛选功能
 */
function setupPictureFilter() {
    const categorySelect = document.getElementById('pictureCategory');
    if (!categorySelect) {
        console.error('Category filter not found');
        return;
    }
    
    // 添加分类选择事件处理程序
    categorySelect.addEventListener('change', function() {
        currentCategory = categorySelect.value;
        currentPage = 1; // 切换分类时重置到第一页
        console.log(`Filtering pictures by category: ${currentCategory}`);
        
        // 重新加载并显示符合分类的图片
        loadAndDisplayPictures();
    });
}

/**
 * 修复图片上传表单提交功能
 * @param {HTMLElement} form - 表单元素，默认为null时会自动查找
 */
function fixPictureUploadForm(form = null) {
    const uploadForm = form || document.getElementById('uploadPictureForm');
    if (!uploadForm) {
        console.error('Upload form not found');
        return;
    }
    
    console.log('Setting up picture upload form');
    
    // 标记表单由admin-pictures.js处理
    uploadForm.setAttribute('data-handler', 'admin-pictures');
    
    // 修复文件上传预览
    const pictureFile = uploadForm.querySelector('#pictureFile');
    const filePreview = uploadForm.querySelector('#filePreview');
    
    if (pictureFile && filePreview) {
        pictureFile.addEventListener('change', function(e) {
            console.log('File selected for upload');
            const file = e.target.files[0];
            if (file) {
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    alert('Please select an image file (JPEG, PNG, GIF, etc.)');
                    return;
                }
                
                // 提高文件大小限制到10MB
                if (file.size > 10 * 1024 * 1024) {
                    alert('Image is too large! Please select an image under 10MB.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Create preview with proper aspect ratio
                    filePreview.innerHTML = `
                        <div style="max-width: 100%; max-height: 300px; overflow: hidden; text-align: center; border-radius: 4px;">
                            <img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; object-fit: contain;">
                        </div>
                    `;
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
    
    // 表单提交处理
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const pictureFile = uploadForm.querySelector('#pictureFile');
        const pictureName = uploadForm.querySelector('#pictureName');
        const category = uploadForm.querySelector('#uploadCategory');
        const description = uploadForm.querySelector('#pictureDescription');
        
        // 验证表单
        if (!pictureFile.files[0]) {
            alert('Please select an image file');
            return;
        }
        
        if (!pictureName.value.trim()) {
            alert('Please enter a name for the image');
            return;
        }
        
        if (!category.value) {
            alert('Please select a category');
            return;
        }
        
        // Generate unique ID with timestamp to avoid duplicates
        const uniqueId = 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        // 创建图片对象
        const newPicture = {
            id: uniqueId,
            name: pictureName.value.trim(),
            category: category.value,
            description: description.value.trim()
        };
        
        const file = pictureFile.files[0];
        
        // 使用新的存储服务保存图片
        if (window.ImageStorageService) {
            window.ImageStorageService.saveImage(newPicture, file, function(success) {
                if (success) {
                    // 关闭模态框
                    const modal = document.getElementById('uploadModal');
                    if (modal && typeof closeModal === 'function') {
                        closeModal('uploadModal');
                    } else if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // 重新加载图片列表
                    loadAndDisplayPictures();
                    
                    // 重置表单
                    uploadForm.reset();
                    filePreview.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Image preview will appear here</p>
                        </div>
                    `;
                    
                    alert('Image uploaded successfully!');
                } else {
                    alert('Failed to upload image. Please try again.');
                }
            });
        } else {
            // 回退到旧的存储方法
            processImageFile(file, function(processedImageUrl) {
                newPicture.imageUrl = processedImageUrl;
                newPicture.uploadDate = new Date().toISOString();
                
                // 检查是否已存在相同名称的图片（防止重复）
                const adminPicturesStr = localStorage.getItem('adminPictures');
                const adminPictures = adminPicturesStr ? JSON.parse(adminPicturesStr) : [];
                
                const duplicateImage = adminPictures.find(pic => 
                    pic.name === newPicture.name && 
                    pic.category === newPicture.category
                );
                
                if (duplicateImage) {
                    // 询问用户是否要覆盖
                    if (confirm(`A picture with the name "${newPicture.name}" already exists. Do you want to replace it?`)) {
                        // 删除旧图片
                        deletePicture(duplicateImage.id, false); // 静默删除，不显示提示
                    } else {
                        return; // 用户取消，不保存
                    }
                }
                
                // 保存图片
                savePicture(newPicture);
                
                // 关闭模态框
                const modal = document.getElementById('uploadModal');
                if (modal && typeof closeModal === 'function') {
                    closeModal('uploadModal');
                } else if (modal) {
                    modal.style.display = 'none';
                }
                
                // 重新加载图片列表
                loadAndDisplayPictures();
                
                // 重置表单
                uploadForm.reset();
                filePreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Image preview will appear here</p>
                    </div>
                `;
                
                alert('Image uploaded successfully!');
            });
        }
    });
}

/**
 * 处理图片文件以确保正确显示
 * @param {File} file - 图片文件
 * @param {Function} callback - 回调函数，参数为处理后的图片URL
 */
function processImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置最大尺寸（保持宽高比）
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;
            
            let width = img.width;
            let height = img.height;
            
            // 如果图片大于最大尺寸，按比例缩小
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = width * ratio;
                height = height * ratio;
            }
            
            // 设置canvas尺寸
            canvas.width = width;
            canvas.height = height;
            
            // 绘制图片（保持宽高比）
            ctx.drawImage(img, 0, 0, width, height);
            
            // 获取处理后的图片URL（JPEG格式，保持较好的质量和文件大小）
            const processedImageUrl = canvas.toDataURL('image/jpeg', 0.92);
            
            // 调用回调函数返回处理后的图片URL
            callback(processedImageUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 保存图片
 * @param {Object} picture - 图片对象
 */
function savePicture(picture) {
    try {
        // 优先使用增强存储服务
        if (window.ImageStorageService) {
            console.log('Using enhanced storage to save picture:', picture.name);
            window.ImageStorageService.migrateImage(picture, function(success) {
                if (success) {
                    console.log('Picture saved using enhanced storage:', picture.name);
                }
            });
            return true;
        }
        
        // 备用方案：将图片存储在localStorage
        try {
            // 从localStorage加载已有图片
            const picturesStr = localStorage.getItem('adminPictures');
            const pictures = picturesStr ? JSON.parse(picturesStr) : [];
            
            // 添加新图片
            pictures.push(picture);
            
            // 保存回localStorage
            localStorage.setItem('adminPictures', JSON.stringify(pictures));
            console.log('Picture saved to adminPictures:', picture.name);
            
            // 同时保存到sitePictures以供前端使用
            savePictureToSite(picture);
            
            return true;
        } catch (storageError) {
            console.error('LocalStorage error, likely quota exceeded:', storageError);
            // 尝试单独保存这一张图片，删除旧图片腾出空间
            try {
                console.log('Attempting emergency storage cleanup...');
                // 清理旧数据
                const oldPics = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                // 只保留最新的10张图片
                const recentPics = oldPics.sort((a, b) => {
                    const dateA = new Date(a.uploadDate || 0);
                    const dateB = new Date(b.uploadDate || 0);
                    return dateB - dateA;
                }).slice(0, 10);
                
                localStorage.setItem('adminPictures', JSON.stringify(recentPics));
                console.log('Emergency cleanup complete, saved recent pictures');
                
                // 现在添加新图片
                recentPics.push(picture);
                localStorage.setItem('adminPictures', JSON.stringify(recentPics));
                
                return true;
            } catch (emergencyError) {
                console.error('Emergency storage also failed:', emergencyError);
                return false;
            }
        }
    } catch (e) {
        console.error('Error saving picture:', e);
        return false;
    }
}

/**
 * 保存图片到sitePictures以供前端使用
 * @param {Object} adminPicture - 管理员图片对象
 */
function savePictureToSite(adminPicture) {
    // 如果可用，总是使用增强存储服务
    if (window.ImageStorageService) {
        console.log('Using enhanced storage for frontend sync:', adminPicture.name);
        window.ImageStorageService.syncToFrontend(adminPicture);
        return true;
    }
    
    try {
        // 转换图片格式以适应前端使用
        const sitePicture = {
            id: adminPicture.id,
            name: adminPicture.name,
            category: adminPicture.category, 
            description: adminPicture.description,
            url: adminPicture.imageUrl,
            uploadDate: adminPicture.uploadDate
        };
        
        // 尝试从localStorage加载前端图片
        try {
            const sitePicturesStr = localStorage.getItem('sitePictures');
            const sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
            
            // 检查是否已存在相同ID的图片
            const existingIndex = sitePictures.findIndex(pic => pic.id === sitePicture.id);
            if (existingIndex !== -1) {
                // 更新已存在的图片
                sitePictures[existingIndex] = sitePicture;
                console.log('Updated existing picture in frontend storage:', sitePicture.name);
            } else {
                // 添加新图片
                sitePictures.push(sitePicture);
                console.log('Added new picture to frontend storage:', sitePicture.name);
            }
            
            // 保存回localStorage
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            console.log(`Frontend storage now has ${sitePictures.length} pictures`);
            
        } catch (storageError) {
            console.error('LocalStorage error when saving to site:', storageError);
            // 尝试只存储单张图片
            try {
                localStorage.setItem('sitePictures', JSON.stringify([sitePicture]));
                console.log('Saved single picture to frontend storage as emergency measure');
            } catch (emergencyError) {
                console.error('Emergency frontend storage also failed:', emergencyError);
            }
        }
        
        return true;
    } catch (e) {
        console.error('Error saving picture to frontend storage:', e);
        return false;
    }
}

/**
 * 删除图片
 * @param {string} pictureId - 图片ID
 * @param {boolean} showConfirm - 是否显示确认对话框
 */
function deletePicture(pictureId, showConfirm = true) {
    if (showConfirm && !confirm('Are you sure you want to delete this picture? This action cannot be undone.')) {
        return;
    }
    
    // 使用新的存储服务删除图片
    if (window.ImageStorageService) {
        window.ImageStorageService.deleteImage(pictureId, function(success) {
            if (success) {
                // 重新加载图片列表
                loadAndDisplayPictures();
                
                console.log('Picture deleted:', pictureId);
                if (showConfirm) {
                    alert('Picture deleted successfully');
                }
            } else {
                console.error('Error deleting picture:', pictureId);
                if (showConfirm) {
                    alert('Failed to delete picture');
                }
            }
        });
    } else {
        // 回退到旧的存储方法
        try {
            // 从localStorage加载图片
            const picturesStr = localStorage.getItem('adminPictures');
            let pictures = picturesStr ? JSON.parse(picturesStr) : [];
            
            // 移除指定图片
            pictures = pictures.filter(pic => pic.id !== pictureId);
            
            // 保存回localStorage
            localStorage.setItem('adminPictures', JSON.stringify(pictures));
            
            // 同时从前端存储中删除
            const sitePicturesStr = localStorage.getItem('sitePictures');
            let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
            sitePictures = sitePictures.filter(pic => pic.id !== pictureId);
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            
            // 重新加载图片列表
            loadAndDisplayPictures();
            
            console.log('Picture deleted:', pictureId);
            if (showConfirm) {
                alert('Picture deleted successfully');
            }
            
            // 重新同步存储
            synchronizeImageStorage();
        } catch (e) {
            console.error('Error deleting picture:', e);
            if (showConfirm) {
                alert('Failed to delete picture');
            }
        }
    }
}

/**
 * 编辑图片信息
 * @param {string} pictureId - 图片ID
 */
function editPicture(pictureId) {
    // 使用新的存储服务获取图片
    if (window.ImageStorageService) {
        window.ImageStorageService.getFullImage(pictureId, function(picture) {
            if (!picture) {
                console.error('Picture not found:', pictureId);
                return;
            }
            
            displayEditModal(picture);
        });
    } else {
        // 回退到旧的存储方法
        try {
            // 从localStorage加载图片数据
            const picturesStr = localStorage.getItem('adminPictures');
            const pictures = picturesStr ? JSON.parse(picturesStr) : [];
            
            // 查找要编辑的图片
            const picture = pictures.find(pic => pic.id === pictureId);
            if (!picture) {
                console.error('Picture not found:', pictureId);
                return;
            }
            
            displayEditModal(picture);
        } catch (e) {
            console.error('Error editing picture:', e);
        }
    }
}

/**
 * 显示编辑模态框
 * @param {Object} picture - 图片对象
 */
function displayEditModal(picture) {
    console.log('Editing picture:', picture);
    
    // 检查是否已有系统模态框可用
    const systemModal = document.querySelector('#pictureEditModal, #editImageModal, .admin-modal.image-edit, .admin-modal.edit-picture, #editPictureModal');
    
    if (systemModal) {
        // 填充表单数据
        const nameInput = systemModal.querySelector('#pictureName, #name, #editName, #editPictureName, input[name="name"]');
        const categorySelect = systemModal.querySelector('#category, #editCategory, #pictureCategory, select[name="category"]');
        const descriptionInput = systemModal.querySelector('#description, #pictureDescription, #editDescription, #editPictureDescription, textarea[name="description"]');
        
        if (nameInput) nameInput.value = picture.name;
        if (categorySelect) categorySelect.value = picture.category;
        if (descriptionInput) descriptionInput.value = picture.description || '';
        
        // 保存按钮点击事件
        const saveBtn = systemModal.querySelector('button:last-child, button.primary, button.save-changes, button.btn-primary, button[type="submit"]');
        
        if (saveBtn) {
            // 清除现有的所有点击事件处理程序
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            // 添加新的点击事件处理程序
            newSaveBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 获取更新后的值
                const updatedName = nameInput ? nameInput.value.trim() : picture.name;
                const updatedCategory = categorySelect ? categorySelect.value : picture.category;
                const updatedDescription = descriptionInput ? descriptionInput.value.trim() : (picture.description || '');
                
                // 获取图片文件（如果有上传）
                const fileInput = systemModal.querySelector('input[type="file"]');
                const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
                
                // 更新后的图片数据
                const updatedImageData = {
                    id: picture.id,
                    name: updatedName,
                    category: updatedCategory,
                    description: updatedDescription,
                    uploadDate: picture.uploadDate || new Date().toISOString()
                };
                
                // 使用新的存储服务更新图片
                if (window.ImageStorageService) {
                    window.ImageStorageService.updateImage(updatedImageData, file, function(success) {
                        if (success) {
                            // 尝试关闭模态框
                            tryCloseModal(systemModal);
                            
                            // 重新加载图片列表
                            loadAndDisplayPictures();
                            
                            alert('Picture updated successfully!');
                        } else {
                            alert('Failed to update picture. Please try again.');
                        }
                    });
                } else {
                    // 回退到旧的存储方法
                    if (file) {
                        // 处理新上传的图片
                        processImageFile(file, function(processedImageUrl) {
                            updatePicture(picture.id, updatedName, updatedCategory, updatedDescription, processedImageUrl);
                            
                            // 尝试关闭模态框
                            tryCloseModal(systemModal);
                        });
                    } else {
                        // 使用原图片
                        updatePicture(picture.id, updatedName, updatedCategory, updatedDescription, picture.imageUrl);
                        
                        // 尝试关闭模态框
                        tryCloseModal(systemModal);
                    }
                }
                
                return false;
            };
        }
        
        return;
    }
    
    // 如果没有找到系统模态框，则使用自定义模态框
    // ... existing code for custom modal ...
}

/**
 * 尝试关闭模态框
 * @param {HTMLElement} modal - 模态框元素
 */
function tryCloseModal(modal) {
    // ... existing code ...
}

/**
 * 更新图片数据
 * @param {string} pictureId - 图片ID
 * @param {string} name - 图片名称
 * @param {string} category - 图片分类
 * @param {string} description - 图片描述
 * @param {string} imageUrl - 图片URL
 */
function updatePicture(pictureId, name, category, description, imageUrl) {
    // ... existing code ...
}

/**
 * 初始化轮播图管理功能
 */
function initCarouselManagement() {
    console.log('初始化轮播图管理');
    
    // 加载当前轮播图
    loadCarouselImages();
    
    // 设置添加轮播图功能
    setupAddToCarousel();
    
    // 设置保存轮播图顺序功能
    setupSaveCarouselOrder();
}

/**
 * 加载轮播图图片
 */
function loadCarouselImages() {
    const carouselList = document.getElementById('carouselImagesList');
    if (!carouselList) {
        console.error('Carousel images list container not found');
        return;
    }
    
    // 从localStorage获取轮播图设置
    try {
        const carouselImagesStr = localStorage.getItem('carouselImages');
        let carouselImages = carouselImagesStr ? JSON.parse(carouselImagesStr) : [];
        
        if (!Array.isArray(carouselImages)) {
            carouselImages = [];
        }
        
        // 清空列表
        carouselList.innerHTML = '';
        
        // 如果没有轮播图，显示提示
        if (carouselImages.length === 0) {
            carouselList.innerHTML = `
                <div class="no-carousel-images">
                    <i class="fas fa-images"></i>
                    <p>No images in carousel. Click "Add Image to Carousel" to add some.</p>
                </div>
            `;
            return;
        }
        
        // 显示轮播图
        carouselImages.forEach((imageId, index) => {
            // 查找图片详情
            const picturesStr = localStorage.getItem('adminPictures');
            const pictures = picturesStr ? JSON.parse(picturesStr) : [];
            
            const picture = pictures.find(pic => pic.id === imageId);
            if (!picture) {
                console.warn(`Carousel image not found: ${imageId}`);
                return;
            }
            
            // 创建轮播图项
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.setAttribute('data-id', picture.id);
            
            carouselItem.innerHTML = `
                <div class="carousel-item-image">
                    <img src="${picture.imageUrl}" alt="${picture.name}">
                </div>
                <div class="carousel-item-info">
                    <span class="carousel-item-name">${picture.name}</span>
                    <span class="carousel-item-category ${picture.category}">${picture.category}</span>
                </div>
                <div class="carousel-item-actions">
                    <button class="remove-from-carousel" data-id="${picture.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    <span class="drag-handle">
                        <i class="fas fa-grip-lines"></i>
                    </span>
                </div>
            `;
            
            carouselList.appendChild(carouselItem);
            
            // 添加移除按钮事件
            const removeBtn = carouselItem.querySelector('.remove-from-carousel');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    removeFromCarousel(picture.id);
                });
            }
        });
        
        // 设置拖拽排序
        setupCarouselSorting(carouselList);
        
    } catch (e) {
        console.error('Error loading carousel images:', e);
    }
}

/**
 * 设置轮播图排序功能
 * @param {HTMLElement} container - 轮播图容器
 */
function setupCarouselSorting(container) {
    // 检查是否有Sortable对象
    if (typeof Sortable !== 'undefined') {
        try {
            // 创建Sortable实例
            new Sortable(container, {
                animation: 150,
                ghostClass: 'carousel-item-ghost',
                handle: '.drag-handle',
                onEnd: function(evt) {
                    // 排序结束后自动保存顺序
                    saveCarouselOrder();
                }
            });
            console.log('Carousel sorting initialized');
        } catch (e) {
            console.error('Error initializing Sortable:', e);
        }
    } else {
        console.warn('Sortable.js not loaded, carousel sorting disabled');
    }
}

/**
 * 设置添加图片到轮播图功能
 */
function setupAddToCarousel() {
    const addToCarouselBtn = document.getElementById('addToCarouselBtn');
    if (!addToCarouselBtn) {
        console.error('Add to carousel button not found');
        return;
    }
    
    // 点击"添加到轮播图"按钮打开模态框
    addToCarouselBtn.addEventListener('click', function() {
        // 加载所有图片到选择网格
        loadPicturesToSelectGrid();
        
        // 显示模态框
        const modal = document.getElementById('carouselModal');
        if (modal && typeof openModal === 'function') {
            openModal('carouselModal');
        } else if (modal) {
            modal.style.display = 'block';
        }
    });
    
    // 设置确认选择按钮
    const confirmSelectBtn = document.getElementById('confirmSelectBtn');
    if (confirmSelectBtn) {
        confirmSelectBtn.addEventListener('click', function() {
            addSelectedImagesToCarousel();
        });
    }
    
    // 设置取消按钮
    const cancelSelectBtn = document.getElementById('cancelSelectBtn');
    if (cancelSelectBtn) {
        cancelSelectBtn.addEventListener('click', function() {
            // 关闭模态框
            const modal = document.getElementById('carouselModal');
            if (modal && typeof closeModal === 'function') {
                closeModal('carouselModal');
            } else if (modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * 加载图片到选择网格
 */
function loadPicturesToSelectGrid() {
    const selectGrid = document.getElementById('selectPictureGrid');
    if (!selectGrid) {
        console.error('Select picture grid not found');
        return;
    }
    
    // 从localStorage获取所有图片
    const pictures = loadPictures();
    
    // 清空网格
    selectGrid.innerHTML = '';
    
    // 如果没有图片，显示提示
    if (pictures.length === 0) {
        selectGrid.innerHTML = `
            <div class="no-pictures-message">
                <i class="fas fa-image"></i>
                <p>No pictures available. Upload some pictures first.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有图片
    pictures.forEach(picture => {
        const pictureItem = document.createElement('div');
        pictureItem.className = 'select-picture-item';
        pictureItem.setAttribute('data-id', picture.id);
        
        pictureItem.innerHTML = `
            <div class="select-picture-image">
                <img src="${picture.imageUrl}" alt="${picture.name}">
                <div class="select-checkbox">
                    <input type="checkbox" id="select_${picture.id}" data-id="${picture.id}">
                    <label for="select_${picture.id}"></label>
                </div>
            </div>
            <div class="select-picture-info">
                <span class="select-picture-name">${picture.name}</span>
                <span class="select-picture-category ${picture.category}">${picture.category}</span>
            </div>
        `;
        
        selectGrid.appendChild(pictureItem);
        
        // 添加点击事件
        pictureItem.addEventListener('click', function(e) {
            if (e.target.closest('.select-checkbox') === null) {
                const checkbox = pictureItem.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

/**
 * 添加选中的图片到轮播图
 */
function addSelectedImagesToCarousel() {
    // 获取所有选中的图片
    const selectedCheckboxes = document.querySelectorAll('#selectPictureGrid input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one image');
        return;
    }
    
    // 从localStorage获取现有轮播图设置
    const carouselImagesStr = localStorage.getItem('carouselImages');
    let carouselImages = carouselImagesStr ? JSON.parse(carouselImagesStr) : [];
    
    // 确保是数组
    if (!Array.isArray(carouselImages)) {
        carouselImages = [];
    }
    
    // 添加选中的图片ID（如果不在轮播图中）
    let newImagesAdded = 0;
    selectedCheckboxes.forEach(checkbox => {
        const imageId = checkbox.getAttribute('data-id');
        
        if (!carouselImages.includes(imageId)) {
            carouselImages.push(imageId);
            newImagesAdded++;
        }
    });
    
    // 保存回localStorage
    localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
    
    // 关闭模态框
    const modal = document.getElementById('carouselModal');
    if (modal && typeof closeModal === 'function') {
        closeModal('carouselModal');
    } else if (modal) {
        modal.style.display = 'none';
    }
    
    // 重新加载轮播图
    loadCarouselImages();
    
    // 显示成功消息
    alert(`${newImagesAdded} new image(s) added to carousel`);
}

/**
 * 从轮播图中移除图片
 * @param {string} imageId - 图片ID
 */
function removeFromCarousel(imageId) {
    // 从localStorage获取轮播图设置
    const carouselImagesStr = localStorage.getItem('carouselImages');
    let carouselImages = carouselImagesStr ? JSON.parse(carouselImagesStr) : [];
    
    // 确保是数组
    if (!Array.isArray(carouselImages)) {
        carouselImages = [];
    }
    
    // 移除指定图片ID
    carouselImages = carouselImages.filter(id => id !== imageId);
    
    // 保存回localStorage
    localStorage.setItem('carouselImages', JSON.stringify(carouselImages));
    
    // 重新加载轮播图
    loadCarouselImages();
    
    console.log('Image removed from carousel:', imageId);
}

/**
 * 设置保存轮播图顺序功能
 */
function setupSaveCarouselOrder() {
    const saveOrderBtn = document.getElementById('saveCarouselOrderBtn');
    if (!saveOrderBtn) {
        console.error('Save carousel order button not found');
        return;
    }
    
    saveOrderBtn.addEventListener('click', function() {
        saveCarouselOrder();
    });
}

/**
 * 保存轮播图顺序
 */
function saveCarouselOrder() {
    const carouselItems = document.querySelectorAll('#carouselImagesList .carousel-item');
    
    if (carouselItems.length === 0) {
        console.log('No carousel items to save');
        return;
    }
    
    // 收集当前顺序的图片ID
    const orderedIds = Array.from(carouselItems).map(item => item.getAttribute('data-id'));
    
    // 保存到localStorage
    localStorage.setItem('carouselImages', JSON.stringify(orderedIds));
    
    console.log('Carousel order saved:', orderedIds);
    alert('Carousel order saved successfully');
} 