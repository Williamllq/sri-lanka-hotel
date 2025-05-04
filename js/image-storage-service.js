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
        // 确保一次性迁移所有图片数据（adminPictures 和 sitePictures）
        const adminPicturesStr = localStorage.getItem('adminPictures');
        const sitePicturesStr = localStorage.getItem('sitePictures');
        
        // 合并所有图片来源
        let allPictures = [];
        
        // 添加adminPictures
        if (adminPicturesStr) {
            try {
                const adminPictures = JSON.parse(adminPicturesStr);
                if (Array.isArray(adminPictures) && adminPictures.length > 0) {
                    console.log(`找到 ${adminPictures.length} 张adminPictures图片`);
                    adminPictures.forEach(pic => {
                        allPictures.push({
                            id: pic.id,
                            name: pic.name,
                            category: pic.category,
                            description: pic.description || '',
                            imageUrl: pic.imageUrl,
                            source: 'admin',
                            uploadDate: pic.uploadDate || new Date().toISOString()
                        });
                    });
                }
            } catch (e) {
                console.error('解析adminPictures时出错:', e);
            }
        }
        
        // 添加sitePictures
        if (sitePicturesStr) {
            try {
                const sitePictures = JSON.parse(sitePicturesStr);
                if (Array.isArray(sitePictures) && sitePictures.length > 0) {
                    console.log(`找到 ${sitePictures.length} 张sitePictures图片`);
                    sitePictures.forEach(pic => {
                        // 检查是否已经添加了相同ID的图片
                        const existingIndex = allPictures.findIndex(p => p.id === pic.id);
                        if (existingIndex === -1) {
                            allPictures.push({
                                id: pic.id,
                                name: pic.name,
                                category: pic.category,
                                description: pic.description || '',
                                imageUrl: pic.url, // 注意sitePictures使用url而不是imageUrl
                                source: 'site',
                                uploadDate: pic.uploadDate || new Date().toISOString()
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('解析sitePictures时出错:', e);
            }
        }
        
        // 如果没有找到任何图片，直接返回
        if (allPictures.length === 0) {
            console.log('没有找到图片数据，跳过迁移');
            return;
        }
        
        console.log(`准备迁移总计 ${allPictures.length} 张图片到IndexedDB...`);
        
        // 检查是否已迁移
        checkIfMigrated(function(isMigrated) {
            if (isMigrated) {
                console.log('数据已经迁移过，正在检查遗漏的图片...');
                checkForMissingImages(allPictures);
                return;
            }
            
            // 逐个保存图片
            let successCount = 0;
            let errorCount = 0;
            const total = allPictures.length;
            
            allPictures.forEach(picture => {
                migrateImage(picture, function(success) {
                    if (success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                    
                    // 检查是否所有图片都已处理
                    if (successCount + errorCount === total) {
                        console.log(`迁移完成: 成功 ${successCount} 张, 失败 ${errorCount} 张`);
                        markAsMigrated();
                    }
                });
            });
        });
    } catch (e) {
        console.error('迁移数据时出错:', e);
    }
}

/**
 * 迁移单个图片
 * @param {Object} picture - 图片数据
 * @param {Function} callback - 回调函数
 */
function migrateImage(picture, callback) {
    // 创建Image对象来加载图片
    const img = new Image();
    
    // 设置超时，防止图片加载时间过长
    const timeoutId = setTimeout(function() {
        console.warn(`图片加载超时: ${picture.name}，使用直接保存方式`);
        // 超时后直接保存原始图片数据
        saveDirectly(picture, callback);
    }, 5000); // 5秒超时
    
    img.onload = function() {
        // 清除超时
        clearTimeout(timeoutId);
        
        // 创建主图像数据
        const imageData = {
            id: picture.id,
            name: picture.name,
            category: picture.category,
            description: picture.description,
            imageUrl: picture.imageUrl || picture.url,
            uploadDate: picture.uploadDate
        };
        
        // 生成缩略图
        const thumbnailUrl = generateThumbnail(img, 200, 150);
        const thumbnailData = {
            id: picture.id,
            name: picture.name,
            category: picture.category,
            imageUrl: thumbnailUrl,
            uploadDate: picture.uploadDate
        };
        
        // 保存到IndexedDB
        saveImageToDB(imageData, thumbnailData, function() {
            callback(true);
        });
    };
    
    img.onerror = function() {
        // 清除超时
        clearTimeout(timeoutId);
        
        console.warn(`加载图片失败: ${picture.name}，使用直接保存方式`);
        // 图片加载失败时直接保存原始数据
        saveDirectly(picture, callback);
    };
    
    // 设置图片源
    img.src = picture.imageUrl || picture.url;
}

/**
 * 直接保存图片数据（不生成缩略图）
 * @param {Object} picture - 图片数据
 * @param {Function} callback - 回调函数
 */
function saveDirectly(picture, callback) {
    // 创建主图像数据
    const imageData = {
        id: picture.id,
        name: picture.name,
        category: picture.category,
        description: picture.description,
        imageUrl: picture.imageUrl || picture.url,
        uploadDate: picture.uploadDate
    };
    
    // 使用相同的数据作为缩略图（这不是理想的做法，但可以确保数据的完整性）
    const thumbnailData = {
        id: picture.id,
        name: picture.name,
        category: picture.category,
        imageUrl: picture.imageUrl || picture.url,
        uploadDate: picture.uploadDate
    };
    
    // 保存到IndexedDB
    saveImageToDB(imageData, thumbnailData, function() {
        callback(true);
    });
}

/**
 * 检查遗漏的图片并添加到数据库
 * @param {Array} allPictures - 所有图片数据
 */
function checkForMissingImages(allPictures) {
    if (!db || allPictures.length === 0) return;
    
    const transaction = db.transaction([IMAGES_STORE], 'readonly');
    const store = transaction.objectStore(IMAGES_STORE);
    const request = store.getAllKeys();
    
    request.onsuccess = function(event) {
        const existingKeys = event.target.result || [];
        console.log(`当前数据库中有 ${existingKeys.length} 张图片`);
        
        // 查找遗漏的图片
        const missingPictures = allPictures.filter(pic => !existingKeys.includes(pic.id));
        
        if (missingPictures.length > 0) {
            console.log(`发现 ${missingPictures.length} 张遗漏的图片，开始添加...`);
            
            let addedCount = 0;
            missingPictures.forEach(picture => {
                migrateImage(picture, function(success) {
                    addedCount++;
                    if (addedCount === missingPictures.length) {
                        console.log(`已添加 ${addedCount} 张遗漏的图片`);
                    }
                });
            });
        } else {
            console.log('没有发现遗漏的图片');
        }
    };
    
    request.onerror = function(event) {
        console.error('检查遗漏图片时出错:', event.target.error);
    };
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
 * 从存储获取所有图片
 * @param {Object} params - 查询参数：category, page, limit
 * @param {Function} callback - 回调函数，参数为图片对象数组
 */
function getAllImages(params, callback) {
    const category = params.category || 'all';
    const page = params.page || 1;
    const limit = params.limit || 30; // 增加默认数量
    const sort = params.sort || 'newest';
    
    console.log(`Getting images: category=${category}, page=${page}, limit=${limit}`);
    
    if (!db) {
        console.warn('数据库未初始化，回退到localStorage');
        fallbackToLocalStorage(params, callback);
        return;
    }
    
    const imageTransaction = db.transaction([THUMBNAILS_STORE, IMAGES_STORE], 'readonly');
    const thumbnailStore = imageTransaction.objectStore(THUMBNAILS_STORE);
    
    // 获取所有缩略图
    const thumbnailRequest = thumbnailStore.getAll();
    
    thumbnailRequest.onsuccess = function(event) {
        let thumbnails = event.target.result || [];
        console.log(`从数据库获取到 ${thumbnails.length} 张图片`);
        
        // 过滤分类
        if (category !== 'all') {
            thumbnails = thumbnails.filter(pic => pic.category.toLowerCase() === category.toLowerCase());
            console.log(`分类过滤后还剩 ${thumbnails.length} 张图片`);
        }
        
        // 按上传日期排序
        if (sort === 'newest') {
            thumbnails.sort((a, b) => {
                const dateA = new Date(a.uploadDate || 0);
                const dateB = new Date(b.uploadDate || 0);
                return dateB - dateA; // 降序（最新的在前）
            });
        } else if (sort === 'oldest') {
            thumbnails.sort((a, b) => {
                const dateA = new Date(a.uploadDate || 0);
                const dateB = new Date(b.uploadDate || 0);
                return dateA - dateB; // 升序（最旧的在前）
            });
        } else if (sort === 'name') {
            thumbnails.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        // 计算分页
        const totalPages = Math.ceil(thumbnails.length / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        // 切片获取当前页的图片
        const pageImages = thumbnails.slice(startIndex, endIndex);
        console.log(`当前页面显示 ${pageImages.length} 张图片（第 ${page}/${totalPages} 页）`);
        
        // 返回结果
        callback({
            images: pageImages,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalImages: thumbnails.length,
                imagesPerPage: limit
            }
        });
        
        // 在后台预加载所有图片的完整数据（异步提高性能）
        if (pageImages.length > 0) {
            setTimeout(function() {
                preloadFullImages(pageImages.map(img => img.id));
            }, 200);
        }
    };
    
    thumbnailRequest.onerror = function(event) {
        console.error('加载图片时出错:', event.target.error);
        // 回退到localStorage
        fallbackToLocalStorage(params, callback);
    };
}

/**
 * 保存图片到存储
 * @param {Object} pictureData - 图片数据对象
 * @param {File} file - 图片文件
 * @param {Function} callback - 回调函数
 */
function saveImage(pictureData, file, callback) {
    if (!db) {
        console.error('数据库未初始化');
        if (typeof callback === 'function') callback(false);
        return;
    }
    
    console.log('使用增强存储服务保存图片:', pictureData.name);
    
    // 添加进度指示器
    const progressIndicator = addProgressIndicator();
    
    // 在错误情况下的回退方案
    const handleError = function(error) {
        console.error('处理图片时出错:', error);
        removeProgressIndicator(progressIndicator);
        
        // 尝试直接保存原始文件，不进行处理
        try {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    id: pictureData.id,
                    name: pictureData.name,
                    category: pictureData.category,
                    description: pictureData.description || '',
                    imageUrl: e.target.result,
                    uploadDate: new Date().toISOString()
                };
                
                // 直接使用相同数据作为缩略图
                const thumbnailData = { ...imageData };
                
                // 保存到数据库
                saveImageToDB(imageData, thumbnailData, function() {
                    // 尝试同步到前端（可选）
                    try {
                        syncToFrontend(imageData);
                    } catch (syncError) {
                        console.warn('同步到前端失败，但图片已保存:', syncError);
                    }
                    
                    if (typeof callback === 'function') callback(true);
                });
            };
            reader.onerror = function() {
                if (typeof callback === 'function') callback(false);
            };
            reader.readAsDataURL(file);
        } catch (fallbackError) {
            console.error('回退保存方案也失败:', fallbackError);
            if (typeof callback === 'function') callback(false);
        }
    };
    
    // 处理图片，生成高质量版本和缩略图
    try {
        updateProgressIndicator(progressIndicator, 10);
        
        processImageFile(file, function(processedImageUrl, thumbnailUrl) {
            updateProgressIndicator(progressIndicator, 50);
            
            if (!processedImageUrl) {
                handleError(new Error('图片处理失败'));
                return;
            }
            
            // 创建完整的图片数据
            const imageData = {
                id: pictureData.id,
                name: pictureData.name,
                category: pictureData.category,
                description: pictureData.description || '',
                imageUrl: processedImageUrl,
                uploadDate: new Date().toISOString()
            };
            
            // 创建缩略图数据
            const thumbnailData = {
                id: pictureData.id,
                name: pictureData.name,
                category: pictureData.category,
                imageUrl: thumbnailUrl || processedImageUrl, // 如果没有缩略图就使用原图
                uploadDate: imageData.uploadDate
            };
            
            updateProgressIndicator(progressIndicator, 75);
            
            // 保存到IndexedDB
            saveImageToDB(imageData, thumbnailData, function() {
                updateProgressIndicator(progressIndicator, 90);
                
                // 同步到前端
                syncToFrontend(imageData);
                
                // 完成
                removeProgressIndicator(progressIndicator);
                if (typeof callback === 'function') callback(true);
            });
        });
    } catch (error) {
        handleError(error);
    }
}

/**
 * 添加进度指示器
 */
function addProgressIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'storage-progress-indicator';
    indicator.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar"></div>
            <div class="progress-text">Processing image...</div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .storage-progress-indicator {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(66, 133, 244, 0.9);
            height: 4px;
            z-index: 10000;
            transition: width 0.3s ease;
        }
        .progress-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .progress-bar {
            height: 100%;
            width: 0%;
            background-color: #fff;
            transition: width 0.3s ease;
        }
        .progress-text {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: #fff;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);
    
    return indicator;
}

/**
 * 更新进度指示器
 */
function updateProgressIndicator(indicator, percentage) {
    if (!indicator) return;
    
    const progressBar = indicator.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    const progressText = indicator.querySelector('.progress-text');
    if (progressText) {
        if (percentage < 30) {
            progressText.textContent = 'Processing image...';
        } else if (percentage < 60) {
            progressText.textContent = 'Optimizing image...';
        } else if (percentage < 90) {
            progressText.textContent = 'Saving image...';
        } else {
            progressText.textContent = 'Almost done...';
        }
    }
}

/**
 * 移除进度指示器
 */
function removeProgressIndicator(indicator) {
    if (!indicator) return;
    
    // 先将进度条设置为100%
    updateProgressIndicator(indicator, 100);
    
    // 0.5秒后删除元素
    setTimeout(function() {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 500);
}

/**
 * 预加载完整图片数据
 */
function preloadFullImages(imageIds) {
    if (!db || !imageIds || imageIds.length === 0) return;
    
    console.log(`预加载 ${imageIds.length} 张图片完整数据`);
    const transaction = db.transaction([IMAGES_STORE], 'readonly');
    const store = transaction.objectStore(IMAGES_STORE);
    
    imageIds.forEach(function(id) {
        store.get(id).onsuccess = function() {
            // 仅预加载，不处理结果
        };
    });
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
 * 从localStorage获取图片作为备用
 * @param {Object} params - 参数对象
 * @param {Function} callback - 回调函数
 */
function fallbackToLocalStorage(params, callback) {
    const category = params.category || 'all';
    const page = params.page || 1;
    const limit = params.limit || 20;
    const sort = params.sort || 'newest';
    
    console.log('从localStorage中获取图片数据');
    
    // 尝试从sitePictures获取
    const sitePicturesStr = localStorage.getItem('sitePictures');
    const adminPicturesStr = localStorage.getItem('adminPictures');
    
    let allPictures = [];
    
    // 处理sitePictures
    if (sitePicturesStr) {
        try {
            const sitePictures = JSON.parse(sitePicturesStr);
            if (Array.isArray(sitePictures)) {
                sitePictures.forEach(pic => {
                    if (pic && pic.id) {
                        allPictures.push({
                            id: pic.id,
                            name: pic.name || '',
                            category: pic.category || 'scenery',
                            description: pic.description || '',
                            imageUrl: pic.url,
                            uploadDate: pic.uploadDate || new Date().toISOString()
                        });
                    }
                });
            }
        } catch (e) {
            console.error('解析sitePictures时出错:', e);
        }
    }
    
    // 处理adminPictures
    if (adminPicturesStr) {
        try {
            const adminPictures = JSON.parse(adminPicturesStr);
            if (Array.isArray(adminPictures)) {
                adminPictures.forEach(pic => {
                    // 检查是否已存在相同ID的图片
                    const existingIndex = allPictures.findIndex(p => p.id === pic.id);
                    if (existingIndex === -1 && pic && pic.id) {
                        allPictures.push({
                            id: pic.id,
                            name: pic.name || '',
                            category: pic.category || 'scenery',
                            description: pic.description || '',
                            imageUrl: pic.imageUrl,
                            uploadDate: pic.uploadDate || new Date().toISOString()
                        });
                    }
                });
            }
        } catch (e) {
            console.error('解析adminPictures时出错:', e);
        }
    }
    
    // 如果没有找到图片，返回空结果
    if (allPictures.length === 0) {
        console.log('在localStorage中没有找到图片');
        callback({
            images: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                hasNext: false,
                hasPrev: false
            }
        });
        return;
    }
    
    console.log(`从localStorage中找到 ${allPictures.length} 张图片`);
    
    // 过滤分类
    let filteredPictures = allPictures;
    if (category !== 'all') {
        filteredPictures = allPictures.filter(pic => pic.category === category);
    }
    
    // 排序
    if (sort === 'newest') {
        filteredPictures.sort((a, b) => {
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0);
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateB - dateA;
        });
    } else if (sort === 'oldest') {
        filteredPictures.sort((a, b) => {
            const dateA = a.uploadDate ? new Date(a.uploadDate) : new Date(0);
            const dateB = b.uploadDate ? new Date(b.uploadDate) : new Date(0);
            return dateA - dateB;
        });
    } else if (sort === 'name') {
        filteredPictures.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedPictures = filteredPictures.slice(start, end);
    
    // 转换格式以匹配前端期望的格式
    const formattedImages = pagedPictures.map(pic => ({
        id: pic.id,
        name: pic.name,
        category: pic.category,
        description: pic.description,
        url: pic.imageUrl,  // 前端使用url
        imageUrl: pic.imageUrl,  // 同时包含imageUrl以防万一
        uploadDate: pic.uploadDate
    }));
    
    // 计算总页数
    const totalPages = Math.ceil(filteredPictures.length / limit);
    
    // 返回结果
    callback({
        images: formattedImages,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: filteredPictures.length,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
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

/**
 * 处理图片文件
 * @param {File} file - 图片文件
 * @param {Function} callback - 回调函数，参数为处理后的图片URL和缩略图URL
 */
function processImageFile(file, callback) {
    // 检查文件是否为图片
    if (!file || !file.type.match('image.*')) {
        console.error('无效的图片文件');
        callback(null);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            try {
                // 1. 创建高质量主图
                const mainCanvas = document.createElement('canvas');
                const mainCtx = mainCanvas.getContext('2d');
                
                // 使用更大的尺寸来保持图片质量，同时限制大小以防止内存问题
                // 最大尺寸增加到2000x1500以支持高分辨率设备
                const MAX_WIDTH = 2000;
                const MAX_HEIGHT = 1500;
                
                let width = img.width;
                let height = img.height;
                
                // 按比例缩放到最大尺寸
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                // 设置画布尺寸
                mainCanvas.width = width;
                mainCanvas.height = height;
                
                // 使用高质量绘制
                mainCtx.imageSmoothingEnabled = true;
                mainCtx.imageSmoothingQuality = 'high';
                mainCtx.drawImage(img, 0, 0, width, height);
                
                // 获取高质量图片URL（使用更高的质量参数0.92，平衡质量和文件大小）
                const processedImageUrl = mainCanvas.toDataURL('image/jpeg', 0.92);
                
                // 2. 生成缩略图
                const thumbnailUrl = generateThumbnail(img, 300, 200);
                
                // 返回处理后的图片URL
                callback(processedImageUrl, thumbnailUrl);
            } catch (error) {
                console.error('处理图片时出错:', error);
                
                // 出错时尝试不处理直接使用原图
                try {
                    callback(event.target.result, event.target.result);
                } catch (fallbackError) {
                    console.error('使用原图回退也失败:', fallbackError);
                    callback(null);
                }
            }
        };
        
        // 处理图片加载错误
        img.onerror = function() {
            console.error('图片加载失败');
            callback(null);
        };
        
        // 开始加载图片
        img.src = event.target.result;
    };
    
    // 处理文件读取错误
    reader.onerror = function() {
        console.error('读取文件失败');
        callback(null);
    };
    
    // 开始读取文件
    reader.readAsDataURL(file);
}

// 导出API函数
window.ImageStorageService = {
    saveImage,
    getAllImages,
    getFullImage,
    deleteImage,
    updateImage
}; 