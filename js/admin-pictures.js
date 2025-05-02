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
});

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
    
    try {
        // Get images from both storages
        const adminPicturesStr = localStorage.getItem('adminPictures');
        const sitePicturesStr = localStorage.getItem('sitePictures');
        
        let adminPictures = adminPicturesStr ? JSON.parse(adminPicturesStr) : [];
        let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
        
        // Ensure they are arrays
        if (!Array.isArray(adminPictures)) adminPictures = [];
        if (!Array.isArray(sitePictures)) sitePictures = [];
        
        // Remove any duplicate entries that might already exist in adminPictures
        const uniqueAdminPictures = removeDuplicates(adminPictures);
        if (uniqueAdminPictures.length !== adminPictures.length) {
            console.log(`Removed ${adminPictures.length - uniqueAdminPictures.length} duplicates from admin pictures`);
            adminPictures = uniqueAdminPictures;
            localStorage.setItem('adminPictures', JSON.stringify(adminPictures));
        }
        
        // Remove any duplicate entries that might already exist in sitePictures
        const uniqueSitePictures = removeDuplicates(sitePictures);
        if (uniqueSitePictures.length !== sitePictures.length) {
            console.log(`Removed ${sitePictures.length - uniqueSitePictures.length} duplicates from site pictures`);
            sitePictures = uniqueSitePictures;
            localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
        }
        
        console.log(`Found ${adminPictures.length} admin pictures and ${sitePictures.length} site pictures`);
        
        // Create a merged set of images - we'll use the combined set
        // Map site pictures to the admin format
        const mappedSitePictures = sitePictures.map(sitePic => {
            // Skip if it already exists in admin pictures by ID or by URL
            const existsInAdmin = adminPictures.some(
                adminPic => (adminPic.id === sitePic.id) || 
                           (adminPic.imageUrl === sitePic.url) ||
                           (sitePic.name && adminPic.name === sitePic.name)
            );
            
            if (existsInAdmin) return null;
            
            // Convert site picture to admin format
            return {
                id: sitePic.id || ('pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
                name: sitePic.name || 'Untitled Image',
                category: sitePic.category || 'scenery',
                description: sitePic.description || '',
                imageUrl: sitePic.url,
                uploadDate: sitePic.uploadDate || new Date().toISOString()
            };
        }).filter(Boolean); // Remove nulls
        
        // Create final merged list
        const mergedPictures = [...adminPictures, ...mappedSitePictures];
        
        // Save merged pictures back to admin storage
        if (mappedSitePictures.length > 0) {
            console.log(`Adding ${mappedSitePictures.length} new pictures from site to admin storage`);
            localStorage.setItem('adminPictures', JSON.stringify(mergedPictures));
        }
        
        // Now, ensure site pictures contains all admin pictures
        // Map admin pictures to the site format
        const mappedAdminPictures = adminPictures.map(adminPic => {
            // Check if it already exists in site pictures
            const existsInSite = sitePictures.some(
                sitePic => (sitePic.id === adminPic.id) || 
                          (sitePic.url === adminPic.imageUrl) ||
                          (adminPic.name && sitePic.name === adminPic.name)
            );
            
            if (existsInSite) return null;
            
            // Convert admin picture to site format
            return {
                id: adminPic.id,
                name: adminPic.name,
                category: adminPic.category,
                description: adminPic.description,
                url: adminPic.imageUrl,
                uploadDate: adminPic.uploadDate
            };
        }).filter(Boolean); // Remove nulls
        
        // Create final merged site pictures
        const mergedSitePictures = [...sitePictures, ...mappedAdminPictures];
        
        // Save merged pictures back to site storage
        if (mappedAdminPictures.length > 0) {
            console.log(`Adding ${mappedAdminPictures.length} new pictures from admin to site storage`);
            localStorage.setItem('sitePictures', JSON.stringify(mergedSitePictures));
        }
        
        console.log('Storage synchronization complete!');
    } catch (error) {
        console.error('Error synchronizing storage:', error);
    }
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
 * 加载并显示所有图片
 */
function loadAndDisplayPictures() {
    // 获取图片容器
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid) {
        console.error('Picture grid container not found');
        return;
    }
    
    // 从localStorage获取保存的图片
    const savedPictures = loadPictures();
    
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
    
    // 显示所有图片
    savedPictures.forEach(picture => {
        addPictureToGrid(pictureGrid, picture);
    });
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
        const category = categorySelect.value;
        console.log(`Filtering pictures by category: ${category}`);
        
        // 重新加载并显示符合分类的图片
        const pictureGrid = document.getElementById('pictureGrid');
        if (pictureGrid) {
            pictureGrid.innerHTML = '';
            
            const filteredPictures = loadPictures(category);
            if (filteredPictures.length === 0) {
                pictureGrid.innerHTML = `
                    <div class="no-pictures-message">
                        <i class="fas fa-image"></i>
                        <p>No pictures found in category "${category}". Upload some pictures or select a different category.</p>
                    </div>
                `;
            } else {
                filteredPictures.forEach(picture => {
                    addPictureToGrid(pictureGrid, picture);
                });
            }
        }
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
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image is too large! Please select an image under 5MB.');
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
        
        // 读取图片文件并处理图片
        const file = pictureFile.files[0];
        processImageFile(file, function(processedImageUrl) {
            // Generate unique ID with timestamp to avoid duplicates
            const uniqueId = 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            
            // 创建图片对象
            const newPicture = {
                id: uniqueId,
                name: pictureName.value.trim(),
                category: category.value,
                description: description.value.trim(),
                imageUrl: processedImageUrl,
                uploadDate: new Date().toISOString()
            };
            
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
 * 保存图片到localStorage
 * @param {Object} picture - 图片对象
 */
function savePicture(picture) {
    try {
        // 从localStorage加载已有图片
        const picturesStr = localStorage.getItem('adminPictures');
        const pictures = picturesStr ? JSON.parse(picturesStr) : [];
        
        // 添加新图片
        pictures.push(picture);
        
        // 保存回localStorage
        localStorage.setItem('adminPictures', JSON.stringify(pictures));
        console.log('Picture saved:', picture.name);
        
        // 同时保存到sitePictures以供前端使用
        savePictureToSite(picture);
        
        return true;
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
    try {
        // 从localStorage加载前端图片
        const sitePicturesStr = localStorage.getItem('sitePictures');
        const sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
        
        // 转换图片格式
        const sitePicture = {
            id: adminPicture.id,
            name: adminPicture.name,
            category: adminPicture.category,
            description: adminPicture.description,
            url: adminPicture.imageUrl,
            uploadDate: adminPicture.uploadDate
        };
        
        // 添加到前端图片
        sitePictures.push(sitePicture);
        
        // 保存回localStorage
        localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
        console.log('Picture saved to frontend storage:', sitePicture.name);
        
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
    } catch (e) {
        console.error('Error deleting picture:', e);
        if (showConfirm) {
            alert('Failed to delete picture');
        }
    }
}

/**
 * 编辑图片信息
 * @param {string} pictureId - 图片ID
 */
function editPicture(pictureId) {
    try {
        console.log('Editing picture with ID:', pictureId);
        // 从localStorage加载图片
        const picturesStr = localStorage.getItem('adminPictures');
        const pictures = picturesStr ? JSON.parse(picturesStr) : [];
        
        // 查找指定图片
        const picture = pictures.find(pic => pic.id === pictureId);
        if (!picture) {
            console.error('Picture not found:', pictureId);
            return;
        }
        
        console.log('Found picture to edit:', picture);
        
        // 检查系统默认编辑模态框
        // 这个看起来是系统的Edit Picture模态框
        const systemModal = document.querySelector('.modal, .admin-modal');
        const modalTitle = document.querySelector('.modal-title, .admin-modal-title');
        const saveChangesBtn = document.querySelector('button.save-changes, button:contains("Save Changes")');
        
        if (systemModal && modalTitle) {
            console.log('Using system modal for editing picture');
            
            // 设置模态框标题
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Picture';
            }
            
            // 查找并填充表单字段
            const nameInput = systemModal.querySelector('input[name="name"], input[placeholder*="Name"], input[id*="Name"]');
            const categorySelect = systemModal.querySelector('select[name="category"], select[id*="category"], select[id*="Category"]');
            const descriptionInput = systemModal.querySelector('textarea[name="description"], textarea[id*="description"], textarea[id*="Description"]');
            
            // 如果找到了对应的输入字段，填充数据
            if (nameInput) {
                console.log('Setting name input:', picture.name);
                nameInput.value = picture.name;
            } else {
                console.warn('Name input field not found in the system modal');
            }
            
            if (categorySelect) {
                console.log('Setting category select:', picture.category);
                categorySelect.value = picture.category;
            } else {
                console.warn('Category select field not found in the system modal');
            }
            
            if (descriptionInput) {
                console.log('Setting description textarea:', picture.description);
                descriptionInput.value = picture.description || '';
            } else {
                console.warn('Description textarea not found in the system modal');
            }
            
            // 保存按钮点击事件
            // 直接查找Save Changes按钮
            const saveBtn = systemModal.querySelector('button:last-child, button.primary, button.save-changes, button.btn-primary, button[type="submit"]');
            
            if (saveBtn) {
                console.log('Found save button:', saveBtn.textContent);
                
                // 清除现有的所有点击事件处理程序
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                
                // 添加新的点击事件处理程序
                newSaveBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Save button clicked!');
                    
                    // 获取更新后的值
                    const updatedName = nameInput ? nameInput.value.trim() : picture.name;
                    const updatedCategory = categorySelect ? categorySelect.value : picture.category;
                    const updatedDescription = descriptionInput ? descriptionInput.value.trim() : (picture.description || '');
                    
                    // 获取图片文件（如果有上传）
                    const fileInput = systemModal.querySelector('input[type="file"]');
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        // 处理新上传的图片
                        processImageFile(fileInput.files[0], function(processedImageUrl) {
                            updatePicture(pictureId, updatedName, updatedCategory, updatedDescription, processedImageUrl);
                            
                            // 尝试关闭模态框
                            tryCloseModal(systemModal);
                        });
                    } else {
                        // 使用原图片
                        updatePicture(pictureId, updatedName, updatedCategory, updatedDescription, picture.imageUrl);
                        
                        // 尝试关闭模态框
                        tryCloseModal(systemModal);
                    }
                    
                    return false;
                });
                
                console.log('Save button click event attached');
            } else {
                console.warn('Save button not found in the system modal');
            }
            
            // 系统可能已经显示了模态框，所以不需要额外的显示操作
            return;
        }
        
        // 如果没有找到系统模态框，则使用我们自定义的模态框
        console.log('Using custom modal for editing picture');
        let editModal = document.getElementById('editPictureModal');
        if (!editModal) {
            // 创建编辑模态框
            editModal = document.createElement('div');
            editModal.id = 'editPictureModal';
            editModal.className = 'admin-modal';
            
            editModal.innerHTML = `
                <div class="admin-modal-content" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; background-color: white; border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                    <div class="admin-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e3e3e3; background-color: #f8f9fa;">
                        <h3 class="modal-title" style="margin: 0; font-size: 18px; color: #333;"><i class="fas fa-edit"></i> Edit Picture</h3>
                        <button class="close-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #666;">&times;</button>
                    </div>
                    <form id="editPictureForm" class="admin-form" style="padding: 20px; background-color: white;">
                        <input type="hidden" id="editPictureId">
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div class="form-group">
                                <label for="editPictureName" style="display: block; margin-bottom: 5px; font-weight: 500; color: #444;">Image Name</label>
                                <input type="text" id="editPictureName" required style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: white;">
                            </div>
                            <div class="form-group">
                                <label for="editCategory" style="display: block; margin-bottom: 5px; font-weight: 500; color: #444;">Category</label>
                                <select id="editCategory" required style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background-color: white;">
                                    <option value="scenery">Scenery</option>
                                    <option value="wildlife">Wildlife</option>
                                    <option value="culture">Culture</option>
                                    <option value="food">Food</option>
                                    <option value="beach">Beach</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label for="editPictureDescription" style="display: block; margin-bottom: 5px; font-weight: 500; color: #444;">Description</label>
                            <textarea id="editPictureDescription" rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; resize: vertical; background-color: white;"></textarea>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #444;">Current Image</label>
                            <div id="editImagePreview" class="image-preview" style="max-width: 300px; margin: 0 auto; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="editPictureFile" style="display: block; margin-bottom: 5px; font-weight: 500; color: #444;">Replace Image (Optional)</label>
                            <input type="file" id="editPictureFile" accept="image/*" style="display: block; width: 100%; padding: 8px 0;">
                            <div id="editFilePreview" class="file-preview" style="margin-top: 10px; max-width: 300px; margin: 10px auto 0;"></div>
                        </div>
                        
                        <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                            <button type="button" class="admin-btn secondary cancel-edit" style="padding: 8px 16px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; color: #333; cursor: pointer; font-size: 14px;">Cancel</button>
                            <button type="submit" class="admin-btn primary save-changes" style="padding: 8px 16px; background-color: #4a6fdc; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 14px;">Save Changes</button>
                        </div>
                    </form>
                </div>
            `;
            
            // 设置模态框样式
            editModal.style.position = 'fixed';
            editModal.style.top = '0';
            editModal.style.left = '0';
            editModal.style.width = '100%';
            editModal.style.height = '100%';
            editModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            editModal.style.display = 'none';
            editModal.style.justifyContent = 'center';
            editModal.style.alignItems = 'center';
            editModal.style.zIndex = '1000';
            
            document.body.appendChild(editModal);
            
            // 设置关闭按钮事件
            const closeBtn = editModal.querySelector('.close-modal');
            const cancelBtn = editModal.querySelector('.cancel-edit');
            
            closeBtn.addEventListener('click', function() {
                editModal.style.display = 'none';
            });
            
            cancelBtn.addEventListener('click', function() {
                editModal.style.display = 'none';
            });
            
            // 设置表单提交事件
            const editForm = document.getElementById('editPictureForm');
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const pictureId = document.getElementById('editPictureId').value;
                const pictureName = document.getElementById('editPictureName').value;
                const category = document.getElementById('editCategory').value;
                const description = document.getElementById('editPictureDescription').value;
                const pictureFile = document.getElementById('editPictureFile').files[0];
                
                if (pictureFile) {
                    // 如果上传了新图片，处理图片
                    processImageFile(pictureFile, function(processedImageUrl) {
                        updatePicture(pictureId, pictureName, category, description, processedImageUrl);
                    });
                } else {
                    // 否则保持原图片
                    const picturesStr = localStorage.getItem('adminPictures');
                    const pictures = picturesStr ? JSON.parse(picturesStr) : [];
                    const picture = pictures.find(pic => pic.id === pictureId);
                    
                    if (picture) {
                        updatePicture(pictureId, pictureName, category, description, picture.imageUrl);
                    }
                }
            });
            
            // 设置文件上传预览
            const editPictureFile = document.getElementById('editPictureFile');
            const editFilePreview = document.getElementById('editFilePreview');
            
            editPictureFile.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        editFilePreview.innerHTML = `
                            <div style="max-width: 100%; max-height: 200px; overflow: hidden; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); background-color: white;">
                                <img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: contain; display: block;">
                            </div>
                        `;
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
        
        // 填充表单数据
        document.getElementById('editPictureId').value = picture.id;
        document.getElementById('editPictureName').value = picture.name;
        document.getElementById('editCategory').value = picture.category;
        document.getElementById('editPictureDescription').value = picture.description || '';
        
        // 显示当前图片
        const editImagePreview = document.getElementById('editImagePreview');
        editImagePreview.innerHTML = `
            <div style="max-width: 100%; max-height: 200px; overflow: hidden; border-radius: 4px; background-color: white;">
                <img src="${picture.imageUrl}" alt="${picture.name}" style="max-width: 100%; max-height: 200px; object-fit: contain; display: block; margin: 0 auto;">
            </div>
        `;
        
        // 清空文件上传字段和预览
        document.getElementById('editPictureFile').value = '';
        document.getElementById('editFilePreview').innerHTML = '';
        
        // 显示模态框
        editModal.style.display = 'flex';
        
    } catch (e) {
        console.error('Error editing picture:', e);
    }
}

/**
 * 尝试关闭模态框
 * @param {HTMLElement} modal - 模态框元素
 */
function tryCloseModal(modal) {
    try {
        // 尝试不同的方法关闭模态框
        
        // 1. 如果有closeModal全局函数
        if (typeof closeModal === 'function') {
            closeModal(modal.id);
            return;
        }
        
        // 2. Bootstrap模态框
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
                return;
            }
        }
        
        // 3. jQuery模态框
        if (typeof $ !== 'undefined') {
            $(modal).modal('hide');
            return;
        }
        
        // 4. 原生关闭按钮点击
        const closeBtn = modal.querySelector('.close, .close-modal, [data-dismiss="modal"]');
        if (closeBtn) {
            closeBtn.click();
            return;
        }
        
        // 5. 设置display属性
        modal.style.display = 'none';
        
        // 6. 移除active类
        modal.classList.remove('active', 'show');
        
        // 7. 移除模态框背景
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
    } catch (e) {
        console.error('Error closing modal:', e);
        
        // 最后尝试直接隐藏
        try {
            modal.style.display = 'none';
        } catch (err) {
            console.error('Failed to hide modal:', err);
        }
    }
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
    try {
        console.log('Updating picture:', { id: pictureId, name, category, description });
        
        // 从localStorage加载图片
        const picturesStr = localStorage.getItem('adminPictures');
        let pictures = picturesStr ? JSON.parse(picturesStr) : [];
        
        // 查找并更新图片
        const index = pictures.findIndex(pic => pic.id === pictureId);
        if (index !== -1) {
            pictures[index] = {
                ...pictures[index],
                name,
                category,
                description,
                imageUrl
            };
            
            // 保存回localStorage
            localStorage.setItem('adminPictures', JSON.stringify(pictures));
            
            // 同步更新sitePictures
            const sitePicturesStr = localStorage.getItem('sitePictures');
            let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
            
            const siteIndex = sitePictures.findIndex(pic => pic.id === pictureId);
            if (siteIndex !== -1) {
                sitePictures[siteIndex] = {
                    ...sitePictures[siteIndex],
                    name,
                    category,
                    description,
                    url: imageUrl
                };
                localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
            }
            
            // 尝试关闭所有打开的模态框
            const openModals = document.querySelectorAll('.modal, .admin-modal');
            openModals.forEach(modal => {
                tryCloseModal(modal);
            });
            
            // 重新加载图片列表
            loadAndDisplayPictures();
            
            alert('Picture updated successfully!');
            console.log('Picture updated successfully');
        } else {
            console.error('Picture not found for update:', pictureId);
        }
    } catch (e) {
        console.error('Error updating picture:', e);
        alert('Error updating picture: ' + e.message);
    }
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