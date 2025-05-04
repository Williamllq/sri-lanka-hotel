/**
 * Image Storage Service
 * 使用IndexedDB替代localStorage存储更多更大的图片
 */

// 确保脚本在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Image Storage Service initialized');
    initializeDatabase();
});

// 数据库配置
const DB_NAME = 'SriLankaImageDB';
const DB_VERSION = 1;
const IMAGES_STORE = 'images';
const THUMBNAILS_STORE = 'thumbnails';
const META_STORE = 'metadata';

let db;

/**
 * 初始化IndexedDB数据库
 */
function initializeDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
        alert('数据库错误，可能无法存储图片。请使用现代浏览器并确保有足够的存储空间。');
    };
    
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Database opened successfully');
        
        // 从旧存储迁移数据
        migrateFromLocalStorage();
    };
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // 创建存储图片的对象仓库
        if (!db.objectStoreNames.contains(IMAGES_STORE)) {
            const imageStore = db.createObjectStore(IMAGES_STORE, { keyPath: 'id' });
            imageStore.createIndex('category', 'category', { unique: false });
            imageStore.createIndex('uploadDate', 'uploadDate', { unique: false });
            console.log('Images object store created');
        }
        
        // 创建存储缩略图的对象仓库
        if (!db.objectStoreNames.contains(THUMBNAILS_STORE)) {
            const thumbnailStore = db.createObjectStore(THUMBNAILS_STORE, { keyPath: 'id' });
            thumbnailStore.createIndex('category', 'category', { unique: false });
            console.log('Thumbnails object store created');
        }
        
        // 创建存储元数据的对象仓库
        if (!db.objectStoreNames.contains(META_STORE)) {
            const metaStore = db.createObjectStore(META_STORE, { keyPath: 'key' });
            console.log('Metadata object store created');
        }
    };
}

/**
 * 从localStorage迁移数据到IndexedDB
 */
function migrateFromLocalStorage() {
    try {
        const adminPicturesStr = localStorage.getItem('adminPictures');
        if (!adminPicturesStr) return;
        
        const adminPictures = JSON.parse(adminPicturesStr);
        if (!Array.isArray(adminPictures) || adminPictures.length === 0) return;
        
        console.log(`开始迁移 ${adminPictures.length} 张图片到IndexedDB...`);
        
        // 检查是否已迁移
        checkIfMigrated(function(isMigrated) {
            if (isMigrated) {
                console.log('数据已经迁移过，跳过迁移');
                return;
            }
            
            // 逐个保存图片
            let successCount = 0;
            const total = adminPictures.length;
            
            adminPictures.forEach(picture => {
                const img = new Image();
                img.onload = function() {
                    // 创建主图像和缩略图
                    const imageData = {
                        id: picture.id,
                        name: picture.name,
                        category: picture.category,
                        description: picture.description || '',
                        imageUrl: picture.imageUrl,
                        uploadDate: picture.uploadDate || new Date().toISOString()
                    };
                    
                    // 生成缩略图
                    const thumbnailUrl = generateThumbnail(img, 200, 150);
                    const thumbnailData = {
                        id: picture.id,
                        name: picture.name,
                        category: picture.category,
                        imageUrl: thumbnailUrl
                    };
                    
                    // 保存到IndexedDB
                    saveImageToDB(imageData, thumbnailData, function() {
                        successCount++;
                        if (successCount === total) {
                            console.log(`成功迁移 ${successCount} 张图片到IndexedDB`);
                            // 记录迁移完成
                            markAsMigrated();
                        }
                    });
                };
                img.onerror = function() {
                    console.error(`加载图片失败: ${picture.name}`);
                    successCount++;
                    if (successCount === total) {
                        console.log(`完成迁移，共 ${successCount} 张图片`);
                        markAsMigrated();
                    }
                };
                img.src = picture.imageUrl;
            });
        });
    } catch (e) {
        console.error('迁移数据时出错:', e);
    }
}

/**
 * 检查数据是否已迁移
 * @param {Function} callback - 回调函数，参数为布尔值表示是否已迁移
 */
function checkIfMigrated(callback) {
    if (!db) {
        callback(false);
        return;
    }
    
    const transaction = db.transaction([META_STORE], 'readonly');
    const store = transaction.objectStore(META_STORE);
    const request = store.get('migrated');
    
    request.onsuccess = function(event) {
        const result = event.target.result;
        callback(result && result.value === true);
    };
    
    request.onerror = function() {
        callback(false);
    };
}

/**
 * 标记数据已迁移
 */
function markAsMigrated() {
    if (!db) return;
    
    const transaction = db.transaction([META_STORE], 'readwrite');
    const store = transaction.objectStore(META_STORE);
    
    store.put({ key: 'migrated', value: true });
    
    transaction.oncomplete = function() {
        console.log('迁移标记已保存');
    };
}

/**
 * 将图片保存到IndexedDB
 * @param {Object} imageData - 图片数据
 * @param {Object} thumbnailData - 缩略图数据
 * @param {Function} callback - 回调函数
 */
function saveImageToDB(imageData, thumbnailData, callback) {
    if (!db) {
        console.error('数据库未初始化');
        if (typeof callback === 'function') callback();
        return;
    }
    
    const transaction = db.transaction([IMAGES_STORE, THUMBNAILS_STORE], 'readwrite');
    
    // 保存主图像
    const imageStore = transaction.objectStore(IMAGES_STORE);
    imageStore.put(imageData);
    
    // 保存缩略图
    const thumbnailStore = transaction.objectStore(THUMBNAILS_STORE);
    thumbnailStore.put(thumbnailData);
    
    transaction.oncomplete = function() {
        if (typeof callback === 'function') callback();
    };
    
    transaction.onerror = function(event) {
        console.error('保存图片时出错:', event.target.error);
        if (typeof callback === 'function') callback();
    };
}

/**
 * 生成图片缩略图
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {string} 缩略图Data URL
 */
function generateThumbnail(img, maxWidth, maxHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(img, 0, 0, width, height);
    
    // 缩略图使用较低质量以节省空间
    return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * 保存图片到存储
 * @param {Object} pictureData - 图片数据对象
 * @param {Function} callback - 回调函数
 */
function saveImage(pictureData, file, callback) {
    if (!db) {
        console.error('数据库未初始化');
        if (typeof callback === 'function') callback(false);
        return;
    }
    
    processImageFile(file, function(processedImageUrl, thumbnailUrl) {
        const imageData = {
            id: pictureData.id,
            name: pictureData.name,
            category: pictureData.category,
            description: pictureData.description || '',
            imageUrl: processedImageUrl,
            uploadDate: new Date().toISOString()
        };
        
        const thumbnailData = {
            id: pictureData.id,
            name: pictureData.name,
            category: pictureData.category,
            imageUrl: thumbnailUrl
        };
        
        saveImageToDB(imageData, thumbnailData, function() {
            // 同步到sitePictures以供前端使用
            syncToFrontend(imageData);
            if (typeof callback === 'function') callback(true);
        });
    });
}

/**
 * 处理图片文件
 * @param {File} file - 图片文件
 * @param {Function} callback - 回调函数，参数为处理后的图片URL和缩略图URL
 */
function processImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // 高质量主图
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置最大尺寸（保持宽高比）- 增加到1800x1200以支持高分辨率设备
            const MAX_WIDTH = 1800;
            const MAX_HEIGHT = 1200;
            
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = width * ratio;
                height = height * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 使用高质量绘制
            ctx.drawImage(img, 0, 0, width, height);
            
            // 获取高质量图片URL（使用更高的质量参数）
            const processedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // 生成缩略图
            const thumbnailUrl = generateThumbnail(img, 200, 150);
            
            // 返回处理后的图片URL
            callback(processedImageUrl, thumbnailUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 同步到前端存储
 * @param {Object} imageData - 图片数据
 */
function syncToFrontend(imageData) {
    try {
        const sitePicture = {
            id: imageData.id,
            name: imageData.name,
            category: imageData.category,
            description: imageData.description,
            url: imageData.imageUrl,
            uploadDate: imageData.uploadDate
        };
        
        const sitePicturesStr = localStorage.getItem('sitePictures');
        let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
        
        // 检查是否存在并更新或添加
        const existingIndex = sitePictures.findIndex(pic => pic.id === sitePicture.id);
        if (existingIndex !== -1) {
            sitePictures[existingIndex] = sitePicture;
        } else {
            sitePictures.push(sitePicture);
        }
        
        localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
    } catch (e) {
        console.error('同步到前端时出错:', e);
    }
}

/**
 * 从存储获取所有图片
 * @param {string} category - 图片分类 (optional)
 * @param {number} page - 页码 (从1开始)
 * @param {number} limit - 每页图片数量
 * @param {Function} callback - 回调函数，参数为图片对象数组
 */
function getAllImages(params, callback) {
    const category = params.category || 'all';
    const page = params.page || 1;
    const limit = params.limit || 20;
    const sort = params.sort || 'newest';
    
    if (!db) {
        console.error('数据库未初始化');
        callback([]);
        return;
    }
    
    // 先获取缩略图 - 这样用户可以快速看到结果
    const thumbnailTransaction = db.transaction([THUMBNAILS_STORE], 'readonly');
    const thumbnailStore = thumbnailTransaction.objectStore(THUMBNAILS_STORE);
    
    let thumbnailRequest;
    if (category !== 'all') {
        const index = thumbnailStore.index('category');
        thumbnailRequest = index.getAll(category);
    } else {
        thumbnailRequest = thumbnailStore.getAll();
    }
    
    thumbnailRequest.onsuccess = function(event) {
        let thumbnails = event.target.result || [];
        
        // 排序
        if (sort === 'newest') {
            thumbnails.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));
        } else if (sort === 'oldest') {
            thumbnails.sort((a, b) => new Date(a.uploadDate || 0) - new Date(b.uploadDate || 0));
        } else if (sort === 'name') {
            thumbnails.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        // 分页
        const start = (page - 1) * limit;
        const end = start + limit;
        const pagedThumbnails = thumbnails.slice(start, end);
        
        // 计算总页数
        const totalPages = Math.ceil(thumbnails.length / limit);
        
        // 返回结果
        callback({
            images: pagedThumbnails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: thumbnails.length,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    };
    
    thumbnailRequest.onerror = function(event) {
        console.error('获取缩略图时出错:', event.target.error);
        callback({ images: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, hasNext: false, hasPrev: false } });
    };
}

/**
 * 加载特定图片的完整数据
 * @param {string} imageId - 图片ID
 * @param {Function} callback - 回调函数，参数为图片对象
 */
function getFullImage(imageId, callback) {
    if (!db) {
        console.error('数据库未初始化');
        callback(null);
        return;
    }
    
    const transaction = db.transaction([IMAGES_STORE], 'readonly');
    const store = transaction.objectStore(IMAGES_STORE);
    const request = store.get(imageId);
    
    request.onsuccess = function(event) {
        const image = event.target.result;
        callback(image);
    };
    
    request.onerror = function(event) {
        console.error('获取图片时出错:', event.target.error);
        callback(null);
    };
}

/**
 * 删除图片
 * @param {string} imageId - 图片ID
 * @param {Function} callback - 回调函数
 */
function deleteImage(imageId, callback) {
    if (!db) {
        console.error('数据库未初始化');
        if (typeof callback === 'function') callback(false);
        return;
    }
    
    const transaction = db.transaction([IMAGES_STORE, THUMBNAILS_STORE], 'readwrite');
    
    // 删除主图像
    const imageStore = transaction.objectStore(IMAGES_STORE);
    imageStore.delete(imageId);
    
    // 删除缩略图
    const thumbnailStore = transaction.objectStore(THUMBNAILS_STORE);
    thumbnailStore.delete(imageId);
    
    transaction.oncomplete = function() {
        // 同时从前端存储中删除
        const sitePicturesStr = localStorage.getItem('sitePictures');
        let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
        sitePictures = sitePictures.filter(pic => pic.id !== imageId);
        localStorage.setItem('sitePictures', JSON.stringify(sitePictures));
        
        if (typeof callback === 'function') callback(true);
    };
    
    transaction.onerror = function(event) {
        console.error('删除图片时出错:', event.target.error);
        if (typeof callback === 'function') callback(false);
    };
}

/**
 * 更新图片信息
 * @param {Object} imageData - 图片数据
 * @param {File} file - 新图片文件 (可选)
 * @param {Function} callback - 回调函数
 */
function updateImage(imageData, file, callback) {
    if (!db) {
        console.error('数据库未初始化');
        if (typeof callback === 'function') callback(false);
        return;
    }
    
    if (file) {
        // 如果有新图片，处理并保存
        processImageFile(file, function(processedImageUrl, thumbnailUrl) {
            const updatedImageData = {
                ...imageData,
                imageUrl: processedImageUrl
            };
            
            const thumbnailData = {
                id: imageData.id,
                name: imageData.name,
                category: imageData.category,
                imageUrl: thumbnailUrl,
                uploadDate: imageData.uploadDate
            };
            
            saveImageToDB(updatedImageData, thumbnailData, function() {
                syncToFrontend(updatedImageData);
                if (typeof callback === 'function') callback(true);
            });
        });
    } else {
        // 如果没有新图片，只更新元数据
        // 先获取现有图片
        const transaction = db.transaction([IMAGES_STORE, THUMBNAILS_STORE], 'readwrite');
        
        // 更新主图像元数据
        const imageStore = transaction.objectStore(IMAGES_STORE);
        const imageRequest = imageStore.get(imageData.id);
        
        imageRequest.onsuccess = function(event) {
            const existingImage = event.target.result;
            if (existingImage) {
                const updatedImage = {
                    ...existingImage,
                    name: imageData.name,
                    category: imageData.category,
                    description: imageData.description
                };
                imageStore.put(updatedImage);
                
                // 更新缩略图元数据
                const thumbnailStore = transaction.objectStore(THUMBNAILS_STORE);
                const thumbnailRequest = thumbnailStore.get(imageData.id);
                
                thumbnailRequest.onsuccess = function(event) {
                    const existingThumbnail = event.target.result;
                    if (existingThumbnail) {
                        const updatedThumbnail = {
                            ...existingThumbnail,
                            name: imageData.name,
                            category: imageData.category
                        };
                        thumbnailStore.put(updatedThumbnail);
                    }
                };
                
                syncToFrontend(updatedImage);
            }
        };
        
        transaction.oncomplete = function() {
            if (typeof callback === 'function') callback(true);
        };
        
        transaction.onerror = function(event) {
            console.error('更新图片时出错:', event.target.error);
            if (typeof callback === 'function') callback(false);
        };
    }
}

// 导出API函数
window.ImageStorageService = {
    saveImage,
    getAllImages,
    getFullImage,
    deleteImage,
    updateImage
}; 