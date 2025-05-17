/**
 * Admin Pictures Management
 * 处理管理员界面的图片管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Management loaded');
    
    // 初始化IndexedDB数据库
    initImageDatabase().then(() => {
        console.log('Image database initialized');
        
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
    }).catch(error => {
        console.error('Failed to initialize image database:', error);
        alert('初始化图片数据库失败。请使用更现代的浏览器或清除浏览器缓存后重试。');
    });
});

// 全局数据库变量
let imageDB = null;
const IMAGE_DB_NAME = 'sriLankaImageDB';
const IMAGE_STORE_NAME = 'images';
const METADATA_STORE_NAME = 'metadata';
const DB_VERSION = 1;

/**
 * 初始化IndexedDB数据库
 * @returns {Promise} - 初始化完成的Promise
 */
function initImageDatabase() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.error('Your browser does not support IndexedDB');
            // 降级到localStorage
            resolve();
            return;
        }
        
        const request = indexedDB.open(IMAGE_DB_NAME, DB_VERSION);
        
        request.onerror = function(event) {
            console.error('Error opening IndexedDB:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            imageDB = event.target.result;
            console.log('IndexedDB connected successfully');
            resolve();
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            // 创建图片存储对象
            if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
                const imageStore = db.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id' });
                imageStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                console.log('Image store created');
            }
            
            // 创建元数据存储对象
            if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
                const metadataStore = db.createObjectStore(METADATA_STORE_NAME, { keyPath: 'id' });
                metadataStore.createIndex('category', 'category', { unique: false });
                console.log('Metadata store created');
            }
        };
    });
}

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
    
    // 从IndexedDB加载所有元数据
    getAllMetadata().then(metadata => {
        // 保存元数据到localStorage (只保存元数据，不包含图片数据)
        try {
            // 为前端创建轻量级的元数据 (不包含图片二进制数据)
            const siteImages = metadata.map(meta => ({
                id: meta.id,
                name: meta.name || 'Untitled',
                category: (meta.category || 'scenery').toLowerCase(),
                description: meta.description || '',
                url: meta.thumbnailUrl || '', // 使用缩略图URL，而不是完整图片
                uploadDate: meta.uploadDate || new Date().toISOString()
            }));
            
            // 保存到localStorage (只保存元数据，尺寸大大减小)
            localStorage.setItem('sitePictures', JSON.stringify(siteImages));
            
            // 不再将完整的图片数据保存到localStorage，而是保留在IndexedDB中
            console.log(`Synchronized ${metadata.length} picture metadata to frontend storage`);
            
            // 触发同步事件
            const syncEvent = new CustomEvent('gallery-updated');
            document.dispatchEvent(syncEvent);
        } catch (error) {
            console.error('Error synchronizing metadata to localStorage:', error);
        }
    }).catch(error => {
        console.error('Error loading metadata for synchronization:', error);
    });
}

/**
 * 从IndexedDB获取所有图片元数据
 * @returns {Promise<Array>} 元数据数组的Promise
 */
function getAllMetadata() {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 如果IndexedDB不可用，从localStorage获取
            try {
                const metadataStr = localStorage.getItem('adminPicturesMetadata');
                const metadataArray = metadataStr ? JSON.parse(metadataStr) : [];
                resolve(Array.isArray(metadataArray) ? metadataArray : []);
            } catch (e) {
                console.error('Error getting metadata from localStorage:', e);
                resolve([]);
            }
            return;
        }
        
        const transaction = imageDB.transaction([METADATA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = function(event) {
            resolve(event.target.result || []);
        };
        
        request.onerror = function(event) {
            console.error('Error getting all metadata:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * 从IndexedDB获取图片元数据
 * @param {string} pictureId - 图片ID
 * @returns {Promise<Object>} 元数据对象的Promise
 */
function getMetadata(pictureId) {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 降级到localStorage
            try {
                const metadataStr = localStorage.getItem('adminPicturesMetadata');
                const metadataArray = metadataStr ? JSON.parse(metadataStr) : [];
                const metadata = Array.isArray(metadataArray) ? 
                    metadataArray.find(meta => meta.id === pictureId) : null;
                resolve(metadata || null);
            } catch (e) {
                console.error('Error getting metadata from localStorage:', e);
                resolve(null);
            }
            return;
        }
        
        const transaction = imageDB.transaction([METADATA_STORE_NAME], 'readonly');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.get(pictureId);
        
        request.onsuccess = function(event) {
            resolve(event.target.result || null);
        };
        
        request.onerror = function(event) {
            console.error('Error getting metadata:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * 从IndexedDB获取图片数据
 * @param {string} pictureId - 图片ID
 * @returns {Promise<Object>} 图片对象的Promise
 */
function getImageData(pictureId) {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 降级到localStorage
            try {
                const picturesStr = localStorage.getItem('adminPictures');
                const pictures = picturesStr ? JSON.parse(picturesStr) : [];
                const picture = Array.isArray(pictures) ? 
                    pictures.find(pic => pic.id === pictureId) : null;
                resolve(picture || null);
            } catch (e) {
                console.error('Error getting image from localStorage:', e);
                resolve(null);
            }
            return;
        }
        
        const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(IMAGE_STORE_NAME);
        const request = store.get(pictureId);
        
        request.onsuccess = function(event) {
            resolve(event.target.result || null);
        };
        
        request.onerror = function(event) {
            console.error('Error getting image data:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * 保存图片元数据到IndexedDB
 * @param {Object} metadata - 元数据对象
 * @returns {Promise<boolean>} 成功与否的Promise
 */
function saveMetadata(metadata) {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 降级到localStorage
            try {
                const metadataStr = localStorage.getItem('adminPicturesMetadata');
                let metadataArray = metadataStr ? JSON.parse(metadataStr) : [];
                if (!Array.isArray(metadataArray)) metadataArray = [];
                
                // 检查是否存在，如果存在则更新
                const index = metadataArray.findIndex(meta => meta.id === metadata.id);
                if (index !== -1) {
                    metadataArray[index] = metadata;
                } else {
                    metadataArray.push(metadata);
                }
                
                localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadataArray));
                resolve(true);
            } catch (e) {
                console.error('Error saving metadata to localStorage:', e);
                resolve(false);
            }
            return;
        }
        
        const transaction = imageDB.transaction([METADATA_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.put(metadata);
        
        request.onsuccess = function() {
            resolve(true);
        };
        
        request.onerror = function(event) {
            console.error('Error saving metadata:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * 保存图片数据到IndexedDB
 * @param {Object} imageData - 图片数据对象
 * @returns {Promise<boolean>} 成功与否的Promise
 */
function saveImageData(imageData) {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 对于没有IndexedDB支持的浏览器，我们尝试将图片和元数据都放在localStorage
            // 但警告用户这可能会很快达到存储限制
            console.warn('IndexedDB not available, trying to fallback to localStorage');
            try {
                const picturesStr = localStorage.getItem('adminPictures');
                let pictures = picturesStr ? JSON.parse(picturesStr) : [];
                if (!Array.isArray(pictures)) pictures = [];
                
                // 检查是否存在，如果存在则更新
                const index = pictures.findIndex(pic => pic.id === imageData.id);
                if (index !== -1) {
                    pictures[index] = imageData;
                } else {
                    pictures.push(imageData);
                }
                
                localStorage.setItem('adminPictures', JSON.stringify(pictures));
                resolve(true);
            } catch (e) {
                console.error('Error saving image data to localStorage:', e);
                alert('存储空间不足，无法保存图片。请删除一些图片后再试。');
                resolve(false);
            }
            return;
        }
        
        const transaction = imageDB.transaction([IMAGE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(IMAGE_STORE_NAME);
        const request = store.put(imageData);
        
        request.onsuccess = function() {
            resolve(true);
        };
        
        request.onerror = function(event) {
            console.error('Error saving image data:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * 删除图片元数据和图片数据
 * @param {string} pictureId - 图片ID
 * @returns {Promise<boolean>} 成功与否的Promise
 */
function deleteImageAndMetadata(pictureId) {
    return new Promise((resolve, reject) => {
        if (!imageDB) {
            // 降级到localStorage
            try {
                // 删除元数据
                const metadataStr = localStorage.getItem('adminPicturesMetadata');
                let metadataArray = metadataStr ? JSON.parse(metadataStr) : [];
                if (Array.isArray(metadataArray)) {
                    metadataArray = metadataArray.filter(meta => meta.id !== pictureId);
                    localStorage.setItem('adminPicturesMetadata', JSON.stringify(metadataArray));
                }
                
                // 删除图片数据
                const picturesStr = localStorage.getItem('adminPictures');
                let pictures = picturesStr ? JSON.parse(picturesStr) : [];
                if (Array.isArray(pictures)) {
                    pictures = pictures.filter(pic => pic.id !== pictureId);
                    localStorage.setItem('adminPictures', JSON.stringify(pictures));
                }
                
                // 删除前端图片引用
                const sitePicturesStr = localStorage.getItem('sitePictures');
                let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
                if (Array.isArray(sitePictures)) {
                    sitePictures = sitePictures.filter(pic => pic.id !== pictureId);
                    localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
                }
                
                // Check if deleted picture is a sample picture
                if (pictureId.startsWith('sample_pic')) {
                    // If we're deleting a sample picture, check if there are any samples left
                    let remainingSamples = 0;
                    
                    if (metadataStr) {
                        const metadata = JSON.parse(metadataStr);
                        remainingSamples = metadata.filter(item => item.id.startsWith('sample_pic')).length;
                    }
                    
                    // If no more samples, remove the sample creation flag
                    if (remainingSamples === 0) {
                        localStorage.removeItem('samplePicturesCreated');
                        console.log('Removed sample pictures creation flag as all samples were deleted');
                    }
                }
                
                resolve(true);
            } catch (e) {
                console.error('Error deleting from localStorage:', e);
                resolve(false);
            }
            return;
        }
        
        // 使用事务同时删除元数据和图片数据，确保原子性
        const transaction = imageDB.transaction([METADATA_STORE_NAME, IMAGE_STORE_NAME], 'readwrite');
        const metadataStore = transaction.objectStore(METADATA_STORE_NAME);
        const imageStore = transaction.objectStore(IMAGE_STORE_NAME);
        
        try {
            metadataStore.delete(pictureId);
            imageStore.delete(pictureId);
            
            // For sample pictures, handle the flag
            if (pictureId.startsWith('sample_pic')) {
                // Check if this was the last sample
                const metadataRequest = metadataStore.index('category').getAll();
                metadataRequest.onsuccess = function() {
                    const allMetadata = metadataRequest.result || [];
                    const remainingSamples = allMetadata.filter(item => 
                        item.id && item.id.startsWith('sample_pic')
                    ).length;
                    
                    if (remainingSamples === 0) {
                        localStorage.removeItem('samplePicturesCreated');
                        console.log('Removed sample pictures creation flag as all samples were deleted');
                    }
                };
            }
            
            transaction.oncomplete = function() {
                resolve(true);
            };
            
            transaction.onerror = function(event) {
                console.error('Error in delete transaction:', event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error('Error in delete operation:', error);
            reject(error);
        }
    });
}

/**
 * 移除数组中的重复项
 * @param {Array} array - 要处理的数组
 * @returns {Array} - 去重后的数组
 */
function removeDuplicates(array) {
    const seen = new Set();
    return array.filter(item => {
        const key = item.id ? item.id : (item.name + (item.url || item.imageUrl || item.thumbnailUrl));
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
            height: 180px;
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
            padding: 12px;
        }
        
        .picture-info h3 {
            margin-top: 0;
            margin-bottom: 5px;
            font-size: 14px;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .picture-category {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: white;
            margin-bottom: 8px;
        }
        
        .picture-category.scenery { background-color: #4CAF50; }
        .picture-category.wildlife { background-color: #FF9800; }
        .picture-category.culture { background-color: #9C27B0; }
        .picture-category.food { background-color: #F44336; }
        .picture-category.beach { background-color: #03A9F4; }
        
        .picture-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            height: 36px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .picture-actions {
            padding: 0 12px 12px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        
        .picture-actions button {
            background: transparent;
            border: none;
            cursor: pointer;
            width: 28px;
            height: 28px;
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
            height: 120px;
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
            width: 100px;
            height: 70px;
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
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
            padding: 15px 0;
        }
        
        @media (max-width: 768px) {
            #pictureGrid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
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
        
        /* 图片上传进度指示器 */
        .upload-progress {
            height: 4px;
            background-color: #f0f0f0;
            margin-top: 10px;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .upload-progress-bar {
            height: 100%;
            background-color: #4285f4;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        /* 显示剩余图片容量 */
        .picture-capacity {
            text-align: right;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }
        
        .picture-capacity-critical {
            color: #F44336;
            font-weight: bold;
        }
        
        /* 数据库存储信息 */
        .db-storage-info {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }
        
        .db-storage-info .storage-type {
            font-weight: bold;
        }
        
        .db-storage-info .storage-type.indexeddb {
            color: #4CAF50;
        }
        
        .db-storage-info .storage-type.localstorage {
            color: #FF9800;
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
    
    // 显示当前图片数量和容量
    updatePictureCapacityInfo();
    
    // 显示存储模式信息
    displayStorageModeInfo();
}

/**
 * 显示当前使用的存储模式信息
 */
function displayStorageModeInfo() {
    // 获取上传按钮容器
    const container = document.querySelector('.upload-button-container, .admin-buttons, .action-buttons');
    if (!container) return;
    
    // 创建存储信息元素
    const storageInfo = document.createElement('div');
    storageInfo.className = 'db-storage-info';
    
    // 设置内容
    if (imageDB) {
        storageInfo.innerHTML = `
            <div>
                <span class="storage-type indexeddb">使用 IndexedDB</span> - 
                可以存储更多图片和更大图片 (50MB+)
            </div>
        `;
    } else {
        storageInfo.innerHTML = `
            <div>
                <span class="storage-type localstorage">使用 LocalStorage</span> - 
                存储空间有限 (约5MB), 建议使用Chrome, Firefox或Edge获得更好体验
            </div>
        `;
    }
    
    // 添加到容器
    container.appendChild(storageInfo);
}

/**
 * 更新图片容量信息显示
 */
function updatePictureCapacityInfo() {
    // 获取管理界面的上传按钮容器
    const uploadBtnContainer = document.querySelector('.upload-button-container, .admin-buttons, .action-buttons');
    if (!uploadBtnContainer) return;
    
    // 查找或创建容量信息元素
    let capacityInfo = document.getElementById('pictureCapacityInfo');
    if (!capacityInfo) {
        capacityInfo = document.createElement('div');
        capacityInfo.id = 'pictureCapacityInfo';
        capacityInfo.className = 'picture-capacity';
        uploadBtnContainer.appendChild(capacityInfo);
    }
    
    // 获取图片数量
    getAllMetadata().then(metadata => {
        // 设置最大图片数量 - 为IndexedDB设置更高的限制
        const MAX_PICTURES = imageDB ? 100 : 15; // 如果使用IndexedDB，则允许更多图片
        const picturesCount = metadata.length;
        const remainingSlots = MAX_PICTURES - picturesCount;
        
        // 更新容量信息显示
        if (remainingSlots <= 5) {
            capacityInfo.className = 'picture-capacity picture-capacity-critical';
        } else {
            capacityInfo.className = 'picture-capacity';
        }
        
        capacityInfo.innerHTML = `已上传: ${picturesCount}/${MAX_PICTURES} 张图片`;
        
        // 如果已达到最大图片数，禁用上传按钮
        const uploadButton = document.querySelector('#uploadPictureBtn, .upload-picture-btn, button[title="Upload Picture"]');
        if (uploadButton) {
            if (picturesCount >= MAX_PICTURES) {
                uploadButton.disabled = true;
                uploadButton.title = `已达到最大图片限制(${MAX_PICTURES}张)`;
                // 添加视觉提示
                uploadButton.style.opacity = '0.5';
                uploadButton.style.cursor = 'not-allowed';
            } else {
                uploadButton.disabled = false;
                uploadButton.title = '上传新图片';
                uploadButton.style.opacity = '1';
                uploadButton.style.cursor = 'pointer';
            }
        }
    }).catch(error => {
        console.error('Error updating picture capacity info:', error);
    });
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
    
    // 显示加载中状态
    pictureGrid.innerHTML = `
        <div class="no-pictures-message">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载图片...</p>
        </div>
    `;
    
    // 从IndexedDB获取保存的图片元数据
    loadPictures().then(savedPictures => {
    // 清空容器
    pictureGrid.innerHTML = '';
    
    // 显示图片或提示信息
    if (savedPictures.length === 0) {
        pictureGrid.innerHTML = `
            <div class="no-pictures-message">
                <i class="fas fa-image"></i>
                    <p>未找到图片。开始上传图片吧！</p>
            </div>
        `;
        return;
    }
    
    // 显示所有图片
    savedPictures.forEach(picture => {
        addPictureToGrid(pictureGrid, picture);
        });
    }).catch(error => {
        console.error('Error loading pictures:', error);
        pictureGrid.innerHTML = `
            <div class="no-pictures-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>加载图片时出错: ${error.message}</p>
            </div>
        `;
    });
}

/**
 * 从IndexedDB加载保存的图片元数据
 * @param {string} category - 可选的图片分类筛选
 * @returns {Promise<Array>} 图片元数据对象数组的Promise
 */
function loadPictures(category = 'all') {
    return new Promise((resolve, reject) => {
        getAllMetadata().then(metadata => {
            console.log(`Loaded ${metadata.length} pictures metadata`);
            
            // Check if sample pictures have been created before
            const samplesCreated = localStorage.getItem('samplePicturesCreated');
            
            // 如果没有图片，创建示例图片（仅在Netlify上运行时且之前未创建过示例图片）
            if (metadata.length === 0 && window.location.href.includes('netlify') && !samplesCreated) {
                createSamplePictures().then(samplePictures => {
                    // Mark that samples have been created
                    localStorage.setItem('samplePicturesCreated', 'true');
                    
                    // 如果指定了分类，进行筛选
                    if (category !== 'all') {
                        samplePictures = samplePictures.filter(pic => pic.category === category);
                    }
                    
                    resolve(samplePictures);
                }).catch(error => {
                    console.error('Error creating sample pictures:', error);
                    resolve([]);
                });
                return;
            }
        
            // 如果指定了分类，进行筛选
            if (category !== 'all') {
                metadata = metadata.filter(pic => pic.category === category);
            }
            
            console.log(`加载了${metadata.length}张图片，分类: ${category}`);
            resolve(metadata);
        }).catch(error => {
            console.error('Error loading pictures:', error);
            reject(error);
        });
    });
}

/**
 * 创建示例图片
 * @returns {Promise<Array>} 示例图片元数据数组的Promise
 */
function createSamplePictures() {
    return new Promise((resolve, reject) => {
        const sampleData = [
        {
            id: 'sample_pic_1',
            name: 'Scenic Beach',
            category: 'beach',
            description: 'Beautiful beach in Sri Lanka',
            imageUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                thumbnailUrl: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_2',
            name: 'Sri Lankan Culture',
            category: 'culture',
            description: 'Traditional cultural dance',
            imageUrl: 'https://images.unsplash.com/photo-1625468228209-d76af1cc7f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                thumbnailUrl: 'https://images.unsplash.com/photo-1625468228209-d76af1cc7f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_3',
            name: 'Wildlife Safari',
            category: 'wildlife',
            description: 'Elephants in Yala National Park',
            imageUrl: 'https://images.unsplash.com/photo-1560953222-1f5c46da5697?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                thumbnailUrl: 'https://images.unsplash.com/photo-1560953222-1f5c46da5697?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            uploadDate: new Date().toISOString()
        },
        {
            id: 'sample_pic_4',
            name: 'Mountain Scenery',
            category: 'scenery',
            description: 'Beautiful mountains in central Sri Lanka',
            imageUrl: 'https://images.unsplash.com/photo-1586005126644-7358e98bf2b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                thumbnailUrl: 'https://images.unsplash.com/photo-1586005126644-7358e98bf2b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60',
            uploadDate: new Date().toISOString()
        }
    ];
        
        // 为示例图片创建元数据和图片数据
        const promises = sampleData.map(sample => {
            // 创建元数据
            const metadata = {
                id: sample.id,
                name: sample.name,
                category: sample.category,
                description: sample.description,
                thumbnailUrl: sample.thumbnailUrl,
                uploadDate: sample.uploadDate
            };
            
            // 创建图片数据
            const imageData = {
                id: sample.id,
                imageUrl: sample.imageUrl,
                uploadDate: sample.uploadDate
            };
            
            // 保存元数据和图片数据
            return Promise.all([
                saveMetadata(metadata),
                saveImageData(imageData)
            ]).then(() => metadata);
        });
        
        // 等待所有示例图片保存完成
        Promise.all(promises).then(results => {
            // 同步到前端
            synchronizeImageStorage();
            resolve(results);
        }).catch(error => {
            console.error('Error saving sample pictures:', error);
            reject(error);
        });
    });
}

/**
 * 将图片添加到网格容器中
 * @param {HTMLElement} container - 容器元素
 * @param {Object} picture - 图片元数据对象
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
            <img src="${picture.thumbnailUrl || picture.imageUrl}" alt="${picture.name}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="picture-info">
            <h3>${picture.name}</h3>
            <div class="picture-category">
                <span class="${picture.category}">${picture.category}</span>
            </div>
            <p class="picture-description">${picture.description || ''}</p>
        </div>
        <div class="picture-actions">
            <button class="edit-picture" data-id="${picture.id}" title="编辑">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-picture" data-id="${picture.id}" title="删除">
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
 * 编辑图片信息
 * @param {string} pictureId - 图片ID
 */
function editPicture(pictureId) {
    try {
        // 从IndexedDB获取图片元数据
        getMetadata(pictureId).then(metadata => {
            if (metadata) {
                console.log('Editing picture:', metadata);
        
        // 检查是否已有系统模态框可用
        const systemModal = document.querySelector('#pictureEditModal, #editImageModal, .admin-modal.image-edit, .admin-modal.edit-picture, #editPictureModal');
        
        if (systemModal) {
            console.log('Using system modal for editing picture:', systemModal.id);
            
            // 填充表单数据
            const nameInput = systemModal.querySelector('#pictureName, #name, #editName, #editPictureName, input[name="name"]');
            const categorySelect = systemModal.querySelector('#category, #editCategory, #pictureCategory, select[name="category"]');
            const descriptionInput = systemModal.querySelector('#description, #pictureDescription, #editDescription, #editPictureDescription, textarea[name="description"]');
            
            if (nameInput) {
                        console.log('Setting name input:', metadata.name);
                        nameInput.value = metadata.name;
            } else {
                console.warn('Name input field not found in the system modal');
            }
            
            if (categorySelect) {
                        console.log('Setting category select:', metadata.category);
                        categorySelect.value = metadata.category;
            } else {
                console.warn('Category select field not found in the system modal');
            }
            
            if (descriptionInput) {
                        console.log('Setting description textarea:', metadata.description);
                        descriptionInput.value = metadata.description || '';
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
                
                // 添加新的点击事件处理程序，使用更稳健的方法
                newSaveBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Save button clicked!');
                    
                    // 获取更新后的值
                            const updatedName = nameInput ? nameInput.value.trim() : metadata.name;
                            const updatedCategory = categorySelect ? categorySelect.value : metadata.category;
                            const updatedDescription = descriptionInput ? descriptionInput.value.trim() : (metadata.description || '');
                            
                            // 获取图片数据
                            getImageData(pictureId).then(imageData => {
                                if (imageData) {
                                    updatePicture(pictureId, updatedName, updatedCategory, updatedDescription, imageData.imageUrl);
                                }
                            });
                    
                    return false;
                };
                
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
                            <button type="button" class="admin-btn primary save-changes" id="saveEditButton" style="padding: 8px 16px; background-color: #4a6fdc; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 14px;">Save Changes</button>
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
            
            // 设置表单提交事件 - 改用保存按钮点击事件
            const saveBtn = editModal.querySelector('.save-changes');
            saveBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const pictureId = document.getElementById('editPictureId').value;
                const pictureName = document.getElementById('editPictureName').value;
                const category = document.getElementById('editCategory').value;
                const description = document.getElementById('editPictureDescription').value;
                const pictureFile = document.getElementById('editPictureFile').files[0];
                
                if (pictureFile) {
                    // 如果上传了新图片，处理图片
                            processImageFile(pictureFile, function(processedImage) {
                                updatePicture(pictureId, pictureName, category, description, processedImage.imageUrl);
                    });
                } else {
                    // 否则保持原图片
                            getImageData(pictureId).then(imageData => {
                                if (imageData) {
                                    updatePicture(pictureId, pictureName, category, description, imageData.imageUrl);
                                }
                            });
                }
                
                // 关闭模态框
                editModal.style.display = 'none';
                
                return false;
            };
            
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
                document.getElementById('editPictureId').value = pictureId;
                document.getElementById('editPictureName').value = metadata.name;
                document.getElementById('editCategory').value = metadata.category;
                document.getElementById('editPictureDescription').value = metadata.description || '';
        
        // 显示当前图片
        const editImagePreview = document.getElementById('editImagePreview');
        editImagePreview.innerHTML = `
            <div style="max-width: 100%; max-height: 200px; overflow: hidden; border-radius: 4px; background-color: white;">
                        <img src="${metadata.thumbnailUrl || metadata.imageUrl}" alt="${metadata.name}" style="max-width: 100%; max-height: 200px; object-fit: contain; display: block; margin: 0 auto;">
            </div>
        `;
        
        // 清空文件上传字段和预览
        document.getElementById('editPictureFile').value = '';
        document.getElementById('editFilePreview').innerHTML = '';
        
        // 显示模态框
        editModal.style.display = 'flex';
            }
        }).catch(error => {
            console.error('Error editing picture:', error);
        });
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
        
        // 从IndexedDB获取图片元数据
        getMetadata(pictureId).then(metadata => {
            if (metadata) {
                // 更新元数据
                const updatedMetadata = {
                    ...metadata,
                name,
                category,
                description,
                imageUrl
            };
            
                // 保存元数据
                saveMetadata(updatedMetadata).then(() => {
            // 尝试关闭所有打开的模态框
            const openModals = document.querySelectorAll('.modal, .admin-modal');
            openModals.forEach(modal => {
                tryCloseModal(modal);
            });
            
            // 重新加载图片列表
            loadAndDisplayPictures();
            
            alert('Picture updated successfully!');
            console.log('Picture updated successfully');
                }).catch(error => {
                    console.error('Error saving updated metadata:', error);
                    alert('Error updating picture: ' + error.message);
                });
        } else {
            console.error('Picture not found for update:', pictureId);
        }
        }).catch(error => {
            console.error('Error getting metadata for update:', error);
            alert('Error updating picture: ' + error.message);
        });
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
    
    // 从IndexedDB获取轮播图设置
    getAllMetadata().then(metadata => {
        console.log(`Loaded ${metadata.length} carousel images metadata`);
        
        // 清空列表
        carouselList.innerHTML = '';
        
        // 如果没有轮播图，显示提示
        if (metadata.length === 0) {
            carouselList.innerHTML = `
                <div class="no-carousel-images">
                    <i class="fas fa-images"></i>
                    <p>No images in carousel. Click "Add Image to Carousel" to add some.</p>
                </div>
            `;
            return;
        }
        
        // 显示轮播图
        metadata.forEach((imageId, index) => {
            // 查找图片详情
            getImageData(imageId).then(imageData => {
                if (imageData) {
            // 创建轮播图项
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
                    carouselItem.setAttribute('data-id', imageData.id);
            
            carouselItem.innerHTML = `
                <div class="carousel-item-image">
                            <img src="${imageData.imageUrl}" alt="${imageData.name}">
                </div>
                <div class="carousel-item-info">
                            <span class="carousel-item-name">${imageData.name}</span>
                            <span class="carousel-item-category ${imageData.category}">${imageData.category}</span>
                </div>
                <div class="carousel-item-actions">
                            <button class="remove-from-carousel" data-id="${imageData.id}">
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
                            removeFromCarousel(imageData.id);
                        });
                    }
                } else {
                    console.warn(`Carousel image not found: ${imageId}`);
                }
            }).catch(error => {
                console.error(`Error loading image data for carousel: ${error.message}`);
            });
        });
        
        // 设置拖拽排序
        setupCarouselSorting(carouselList);
    }).catch(error => {
        console.error('Error loading carousel images:', error);
    });
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
    
    // 从IndexedDB获取所有图片
    loadPictures().then(pictures => {
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
    }).catch(error => {
        console.error('Error loading pictures to select grid:', error);
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
    
    // 从IndexedDB获取现有轮播图设置
    getAllMetadata().then(metadata => {
    // 确保是数组
        if (!Array.isArray(metadata)) {
            metadata = [];
    }
    
    // 添加选中的图片ID（如果不在轮播图中）
    let newImagesAdded = 0;
    selectedCheckboxes.forEach(checkbox => {
        const imageId = checkbox.getAttribute('data-id');
        
            if (!metadata.some(pic => pic.id === imageId)) {
            newImagesAdded++;
                metadata.push({
                    id: imageId,
                    name: '',
                    category: '',
                    description: '',
                    imageUrl: '',
                    uploadDate: new Date().toISOString()
                });
            }
        });
        
        // 保存回IndexedDB
        metadata.forEach(meta => saveMetadata(meta));
    
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
    }).catch(error => {
        console.error('Error adding selected images to carousel:', error);
    });
}

/**
 * 从轮播图中移除图片
 * @param {string} imageId - 图片ID
 */
function removeFromCarousel(imageId) {
    // 从IndexedDB获取轮播图设置
    getAllMetadata().then(metadata => {
    // 确保是数组
        if (!Array.isArray(metadata)) {
            metadata = [];
    }
    
    // 移除指定图片ID
        const updatedMetadata = metadata.filter(pic => pic.id !== imageId);
    
        // 保存回IndexedDB
        saveMetadata(updatedMetadata).then(() => {
    // 重新加载轮播图
    loadCarouselImages();
    
    console.log('Image removed from carousel:', imageId);
            alert('Image removed from carousel');
        }).catch(error => {
            console.error('Error removing image from carousel:', error);
        });
    }).catch(error => {
        console.error('Error getting carousel images:', error);
    });
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
    
    // 保存到IndexedDB
    saveMetadata({
        id: 'carouselImages',
        images: orderedIds
    }).then(() => {
    console.log('Carousel order saved:', orderedIds);
    alert('Carousel order saved successfully');
    }).catch(error => {
        console.error('Error saving carousel order:', error);
        alert('Error saving carousel order: ' + error.message);
    });
}

/**
 * 保存图片到IndexedDB
 * 新增图片处理和上传函数
 */
function processImageFile(file, callback) {
    console.log('Processing image file:', file.name);
    
    if (!file || !file.type.match('image.*')) {
        alert('请选择有效的图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建一个临时图片元素来获取图片尺寸
        const img = new Image();
        img.onload = function() {
            // 创建两个版本的图片：1. 显示用缩略图 2. 全尺寸但压缩的图片
            createThumbnail(img, 400, 0.7).then(thumbnailUrl => {
                compressFullImage(img, 1200, 0.6).then(compressedUrl => {
                    if (callback && typeof callback === 'function') {
                        callback({
                            thumbnailUrl: thumbnailUrl,
                            imageUrl: compressedUrl,
                            originalWidth: img.width,
                            originalHeight: img.height
                        });
                    }
                });
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 创建缩略图版本
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<string>} 返回缩略图的dataURL
 */
function createThumbnail(img, maxWidth, quality) {
    return new Promise((resolve) => {
        // 创建canvas来生成缩略图
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算缩放比例
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制缩略图
        ctx.drawImage(img, 0, 0, width, height);
        
        // 返回压缩的dataURL
        resolve(canvas.toDataURL('image/jpeg', quality));
    });
}

/**
 * 压缩全尺寸图片
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<string>} 返回压缩后的dataURL
 */
function compressFullImage(img, maxWidth, quality) {
    return new Promise((resolve) => {
        // 创建canvas来压缩全尺寸图片
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算缩放比例，保持宽高比
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, width, height);
        
        // WebP格式比JPEG更小，如果浏览器支持则使用WebP
        const supportsWebP = (function() {
            const canvas = document.createElement('canvas');
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        })();
        
        if (supportsWebP) {
            resolve(canvas.toDataURL('image/webp', quality));
        } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
        }
    });
}

// ... existing code ...

/**
 * 从表单上传图片
 * 替换旧的上传处理
 */
function fixPictureUploadForm(form) {
    console.log('Fixing picture upload form...');
    
    // 查找上传表单如果没有提供
    if (!form) {
        form = document.getElementById('uploadPictureForm');
        if (!form) {
            console.warn('Upload form not found');
            return;
        }
    }
    
    // 修复文件预览功能
    const fileInput = form.querySelector('#pictureFile');
    const filePreview = form.querySelector('#filePreview');
    
    if (fileInput && filePreview) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    filePreview.innerHTML = `
                        <div style="max-width: 100%; max-height: 300px; overflow: hidden; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <img src="${event.target.result}" alt="预览" style="width: 100%; height: auto; object-fit: contain;">
                        </div>
                        <div class="upload-progress" style="margin-top: 10px;">
                            <div class="upload-progress-bar" style="width: 0%;"></div>
                        </div>
                    `;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    // 修复表单提交
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const pictureName = form.querySelector('#pictureName');
        const pictureCategory = form.querySelector('#uploadCategory');
        const pictureDescription = form.querySelector('#pictureDescription');
        const pictureFile = form.querySelector('#pictureFile');
        
        if (!pictureName || !pictureCategory || !pictureFile) {
            alert('表单缺少必要字段');
            return;
        }
        
        if (!pictureFile.files || !pictureFile.files[0]) {
            alert('请选择要上传的图片');
            return;
        }
        
        if (!pictureName.value.trim()) {
            alert('请输入图片名称');
            pictureName.focus();
            return;
        }
        
        // 显示上传进度
        if (filePreview) {
            const progressBar = filePreview.querySelector('.upload-progress-bar');
            if (progressBar) {
                // 模拟上传进度
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 5;
                    progressBar.style.width = `${Math.min(progress, 90)}%`;
                    if (progress >= 90) clearInterval(interval);
                }, 100);
            }
        }
        
        // 处理图片文件
        const file = pictureFile.files[0];
        processImageFile(file, function(processedImage) {
            // 创建图片记录
            const picture = {
                id: 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name: pictureName.value.trim(),
                category: pictureCategory.value,
                description: pictureDescription ? pictureDescription.value.trim() : '',
                uploadDate: new Date().toISOString(),
                thumbnailUrl: processedImage.thumbnailUrl
            };
            
            // 创建图片数据记录
            const imageData = {
                id: picture.id,
                imageUrl: processedImage.imageUrl,
                uploadDate: picture.uploadDate,
                width: processedImage.originalWidth,
                height: processedImage.originalHeight
            };
            
            // 保存元数据和图片数据
            Promise.all([
                saveMetadata(picture),
                saveImageData(imageData)
            ]).then(() => {
                // 同步到前端显示
                synchronizeImageStorage();
                
                // 完成上传进度
                if (filePreview) {
                    const progressBar = filePreview.querySelector('.upload-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '100%';
                    }
                }
                
                // 重置表单
                form.reset();
                if (filePreview) {
                    setTimeout(() => {
                        filePreview.innerHTML = '';
                    }, 1000);
                }
                
                // 关闭模态框
                const modal = document.getElementById('uploadModal');
                if (modal) {
                    modal.style.display = 'none';
                    
                    // 如果有Bootstrap模态框关闭方法
                    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const bsModal = bootstrap.Modal.getInstance(modal);
                        if (bsModal) {
                            bsModal.hide();
                        }
                    }
                }
                
                // 刷新图片列表
                loadAndDisplayPictures();
                
                // 更新容量信息
                updatePictureCapacityInfo();
                
                // 显示成功消息
                alert('图片上传成功！');
            }).catch(error => {
                console.error('Error saving image:', error);
                alert('保存图片时出错: ' + error.message);
            });
        });
    });
    
    console.log('Picture upload form fixed');
} 