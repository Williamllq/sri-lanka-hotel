/**
 * Admin Pictures Migrate
 * 将图片数据从localStorage迁移到IndexedDB，用于解决存储限制问题
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Migration script loaded');
    
    // 检测并执行迁移
    setTimeout(checkAndMigrate, 1000);
});

/**
 * 检查是否需要迁移并执行迁移
 */
function checkAndMigrate() {
    console.log('Checking if migration is needed...');
    
    // 检查LocalStorage中是否有图片数据需要迁移
    const hasLocalPictures = localStorage.getItem('adminPictures') !== null;
    const migrationCompleted = localStorage.getItem('picturesMigrationCompleted') === 'true';
    
    if (hasLocalPictures && !migrationCompleted) {
        console.log('Found pictures in localStorage, migration needed');
        
        // 显示迁移信息
        showMigrationNotice();
        
        // 创建"开始迁移"按钮
        createMigrationButton();
    } else {
        console.log('Migration not needed or already completed');
    }
}

/**
 * 显示迁移通知
 */
function showMigrationNotice() {
    // 创建通知元素
    const notice = document.createElement('div');
    notice.id = 'migrationNotice';
    notice.className = 'migration-notice';
    notice.style.backgroundColor = '#FFFBEA';
    notice.style.border = '1px solid #FFE58F';
    notice.style.padding = '10px 15px';
    notice.style.marginBottom = '20px';
    notice.style.borderRadius = '4px';
    notice.style.display = 'flex';
    notice.style.justifyContent = 'space-between';
    notice.style.alignItems = 'center';
    
    // 设置通知内容
    notice.innerHTML = `
        <div>
            <h4 style="margin: 0 0 5px 0; color: #D48806; font-size: 16px;">
                <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                存储升级提示
            </h4>
            <p style="margin: 0; color: #5A5A5A; font-size: 14px;">
                检测到您的图片使用了旧的存储方式，为了支持更多图片并解决存储空间不足的问题，请点击"开始升级"按钮将图片迁移到新的存储系统。
            </p>
        </div>
    `;
    
    // 插入到页面
    const container = document.querySelector('.admin-content, .dashboard-content, .content-area, main');
    if (container) {
        if (container.firstChild) {
            container.insertBefore(notice, container.firstChild);
        } else {
            container.appendChild(notice);
        }
    } else {
        document.body.insertBefore(notice, document.body.firstChild);
    }
}

/**
 * 创建迁移按钮
 */
function createMigrationButton() {
    // 创建按钮
    const button = document.createElement('button');
    button.id = 'startMigrationBtn';
    button.className = 'btn migration-btn';
    button.innerHTML = '<i class="fas fa-database"></i> 开始升级存储系统';
    button.style.backgroundColor = '#1890FF';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px 15px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.marginLeft = '15px';
    button.style.fontWeight = 'bold';
    
    // 添加悬停效果
    button.onmouseover = function() {
        this.style.backgroundColor = '#40A9FF';
    };
    button.onmouseout = function() {
        this.style.backgroundColor = '#1890FF';
    };
    
    // 添加点击事件
    button.onclick = function() {
        startMigration();
    };
    
    // 插入到通知中
    const notice = document.getElementById('migrationNotice');
    if (notice) {
        notice.appendChild(button);
    }
}

/**
 * 开始迁移
 */
function startMigration() {
    console.log('Starting migration process...');
    
    // 禁用迁移按钮
    const button = document.getElementById('startMigrationBtn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在迁移...';
        button.style.backgroundColor = '#8C8C8C';
        button.style.cursor = 'not-allowed';
    }
    
    // 更新通知显示进度
    const notice = document.getElementById('migrationNotice');
    if (notice) {
        const progressDiv = document.createElement('div');
        progressDiv.id = 'migrationProgress';
        progressDiv.className = 'migration-progress';
        progressDiv.style.marginTop = '10px';
        progressDiv.style.width = '100%';
        progressDiv.style.height = '6px';
        progressDiv.style.backgroundColor = '#F5F5F5';
        progressDiv.style.borderRadius = '3px';
        progressDiv.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'migrationProgressBar';
        progressBar.className = 'migration-progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#52C41A';
        progressBar.style.transition = 'width 0.3s ease';
        
        progressDiv.appendChild(progressBar);
        notice.appendChild(progressDiv);
    }
    
    // 执行迁移逻辑
    setTimeout(function() {
        migrateData().then(function() {
            // 标记迁移完成
            localStorage.setItem('picturesMigrationCompleted', 'true');
            
            // 更新界面
            updateMigrationComplete();
            
            // 刷新图片列表
            if (typeof loadAndDisplayPictures === 'function') {
                loadAndDisplayPictures();
            }
        }).catch(function(error) {
            console.error('Migration failed:', error);
            
            // 显示错误
            if (button) {
                button.innerHTML = '<i class="fas fa-exclamation-circle"></i> 迁移失败 - 点击重试';
                button.style.backgroundColor = '#F5222D';
                button.disabled = false;
                button.style.cursor = 'pointer';
            }
        });
    }, 500);
}

/**
 * 数据迁移逻辑
 * @returns {Promise} 迁移完成的Promise
 */
function migrateData() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Migrating picture data to IndexedDB...');
            
            // 从localStorage加载现有图片
            const adminPictures = localStorage.getItem('adminPictures');
            let pictures = [];
            
            if (adminPictures) {
                try {
                    pictures = JSON.parse(adminPictures);
                    if (!Array.isArray(pictures)) {
                        pictures = [];
                    }
                } catch (e) {
                    console.error('Error parsing pictures from localStorage:', e);
                }
            }
            
            if (pictures.length === 0) {
                console.log('No pictures found in localStorage');
                resolve();
                return;
            }
            
            console.log(`Found ${pictures.length} pictures to migrate`);
            
            // 直接检查window上是否有initImageDatabase函数
            if (typeof window.initImageDatabase === 'function') {
                console.log('Using global initImageDatabase function');
                window.initImageDatabase().then(migrateImages).catch(reject);
            } 
            // 检查是否可以从admin-pictures.js获取函数
            else if (typeof initImageDatabase === 'function') {
                console.log('Using local initImageDatabase function');
                initImageDatabase().then(migrateImages).catch(reject);
            } 
            // 如果都不可用，自己实现数据库初始化
            else {
                console.log('No existing initImageDatabase function found, implementing locally');
                // 此处使用内置的initDB函数实现
                initDB().then(migrateImages).catch(reject);
            }
            
            // 迁移图片的内部函数
            function migrateImages() {
                // 更新进度条显示
                const progressBar = document.getElementById('migrationProgressBar');
                
                // 迁移每张图片
                const migrationPromises = pictures.map((picture, index) => {
                    return new Promise((resolveItem) => {
                        setTimeout(() => {
                            try {
                                console.log(`Migrating picture ${index+1}/${pictures.length}: ${picture.id || 'unknown id'}`);
                                
                                // 对图片进行分离处理：元数据和图片数据分开存储
                                const metadata = {
                                    id: picture.id || `pic_migrated_${Date.now()}_${index}`,
                                    name: picture.name || 'Untitled',
                                    category: picture.category || 'scenery',
                                    description: picture.description || '',
                                    thumbnailUrl: picture.imageUrl || picture.url || '', // 旧数据没有缩略图，直接使用原图
                                    uploadDate: picture.uploadDate || new Date().toISOString()
                                };
                                
                                const imageData = {
                                    id: metadata.id, // 确保ID匹配
                                    imageUrl: picture.imageUrl || picture.url || '',
                                    uploadDate: picture.uploadDate || new Date().toISOString()
                                };
                                
                                // 保存到IndexedDB
                                Promise.all([
                                    saveMetadata(metadata),
                                    saveImageData(imageData)
                                ]).then(() => {
                                    // 更新进度条
                                    if (progressBar) {
                                        const progress = Math.floor(((index + 1) / pictures.length) * 100);
                                        progressBar.style.width = `${progress}%`;
                                    }
                                    console.log(`Successfully migrated picture ${index+1}: ${metadata.id}`);
                                    resolveItem();
                                }).catch(error => {
                                    console.error(`Error migrating picture ${metadata.id}:`, error);
                                    resolveItem(); // 继续处理下一张，不中断整体迁移
                                });
                            } catch (e) {
                                console.error(`Error processing picture at index ${index}:`, e);
                                resolveItem(); // 继续处理下一张
                            }
                        }, 100 * index); // 每张图片间隔100ms，避免阻塞UI
                    });
                });
                
                // 等待所有迁移完成
                Promise.all(migrationPromises).then(() => {
                    // 迁移完成后删除localStorage中的图片数据
                    console.log('Migration completed');
                    
                    // 同步到前端
                    if (typeof window.synchronizeImageStorage === 'function') {
                        window.synchronizeImageStorage();
                    } else if (typeof synchronizeImageStorage === 'function') {
                        synchronizeImageStorage();
                    }
                    
                    // 为安全起见，不立即删除原始数据，而是添加一个过期时间
                    localStorage.setItem('adminPicturesBackup', adminPictures);
                    localStorage.setItem('adminPicturesBackupTime', Date.now().toString());
                    
                    // 清除原始存储
                    localStorage.removeItem('adminPictures');
                    
                    resolve();
                }).catch(error => {
                    console.error('Error in migration process:', error);
                    reject(error);
                });
            }
        } catch (e) {
            console.error('Error in migration function:', e);
            reject(e);
        }
    });
}

/**
 * 初始化IndexedDB数据库 - 本地实现，当全局函数不可用时使用
 */
function initDB() {
    return new Promise((resolve, reject) => {
        console.log('Initializing IndexedDB using local implementation');
        
        // 如果浏览器不支持IndexedDB，直接解析空结果
        if (!window.indexedDB) {
            console.error('Browser does not support IndexedDB');
            reject(new Error('您的浏览器不支持现代存储技术。请使用Chrome、Firefox或Edge浏览器。'));
            return;
        }
        
        const dbName = 'sriLankaImageDB';
        const dbVersion = 1;
        
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = function(event) {
            console.error('Error opening IndexedDB:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            window.imageDB = event.target.result;
            console.log('IndexedDB successfully initialized');
            resolve();
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            // 创建图片存储对象
            if (!db.objectStoreNames.contains('images')) {
                const imageStore = db.createObjectStore('images', { keyPath: 'id' });
                imageStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                console.log('Image store created');
            }
            
            // 创建元数据存储对象
            if (!db.objectStoreNames.contains('metadata')) {
                const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
                metadataStore.createIndex('category', 'category', { unique: false });
                console.log('Metadata store created');
            }
        };
    });
}

/**
 * 更新界面显示迁移完成
 */
function updateMigrationComplete() {
    console.log('Updating UI for migration complete');
    
    // 更新按钮
    const button = document.getElementById('startMigrationBtn');
    if (button) {
        button.innerHTML = '<i class="fas fa-check-circle"></i> 升级完成';
        button.style.backgroundColor = '#52C41A';
    }
    
    // 更新通知文本
    const notice = document.getElementById('migrationNotice');
    if (notice) {
        const messageDiv = notice.querySelector('div');
        if (messageDiv) {
            messageDiv.innerHTML = `
                <h4 style="margin: 0 0 5px 0; color: #52C41A; font-size: 16px;">
                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                    存储升级完成
                </h4>
                <p style="margin: 0; color: #5A5A5A; font-size: 14px;">
                    您的图片已成功迁移到新的存储系统，现在可以上传更多图片了。
                </p>
            `;
        }
        
        // 设置自动消失
        setTimeout(() => {
            notice.style.transition = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease';
            notice.style.opacity = '0';
            notice.style.transform = 'translateY(-20px)';
            notice.style.maxHeight = '0';
            notice.style.overflow = 'hidden';
            notice.style.border = 'none';
            notice.style.padding = '0';
            notice.style.margin = '0';
            
            // 删除元素
            setTimeout(() => {
                if (notice.parentNode) {
                    notice.parentNode.removeChild(notice);
                }
            }, 500);
        }, 5000);
    }
}

/**
 * Helper: 保存元数据到IndexedDB
 */
function saveMetadata(metadata) {
    console.log(`Saving metadata for: ${metadata.id}`);
    
    // 如果window上有全局函数，使用它
    if (typeof window.saveMetadata === 'function') {
        console.log('Using global saveMetadata function');
        return window.saveMetadata(metadata);
    }
    
    return new Promise((resolve, reject) => {
        // 检查IndexedDB是否可用
        if (!window.indexedDB) {
            console.error('IndexedDB not supported in this browser');
            reject(new Error('您的浏览器不支持现代存储技术'));
            return;
        }
        
        // 检查数据库是否已初始化
        if (!window.imageDB) {
            console.error('IndexedDB not initialized');
            reject(new Error('数据库尚未初始化'));
            return;
        }
        
        try {
            // 创建事务
            const transaction = window.imageDB.transaction(['metadata'], 'readwrite');
            const store = transaction.objectStore('metadata');
            
            // 保存元数据
            const request = store.put(metadata);
            
            request.onsuccess = function() {
                console.log(`Metadata saved successfully for: ${metadata.id}`);
                resolve(true);
            };
            
            request.onerror = function(event) {
                console.error('Error saving metadata:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                // 事务完成
            };
            
            transaction.onerror = function(event) {
                console.error('Transaction error when saving metadata:', event.target.error);
                reject(event.target.error);
            };
        } catch (e) {
            console.error('Error in saveMetadata transaction:', e);
            reject(e);
        }
    });
}

/**
 * Helper: 保存图片数据到IndexedDB
 */
function saveImageData(imageData) {
    console.log(`Saving image data for: ${imageData.id}`);
    
    // 如果window上有全局函数，使用它
    if (typeof window.saveImageData === 'function') {
        console.log('Using global saveImageData function');
        return window.saveImageData(imageData);
    }
    
    return new Promise((resolve, reject) => {
        // 检查IndexedDB是否可用
        if (!window.indexedDB) {
            console.error('IndexedDB not supported');
            reject(new Error('您的浏览器不支持现代存储技术'));
            return;
        }
        
        // 检查数据库是否已初始化
        if (!window.imageDB) {
            console.error('IndexedDB not initialized');
            reject(new Error('数据库尚未初始化'));
            return;
        }
        
        try {
            // 创建事务
            const transaction = window.imageDB.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            
            // 保存图片数据
            const request = store.put(imageData);
            
            request.onsuccess = function() {
                console.log(`Image data saved successfully for: ${imageData.id}`);
                resolve(true);
            };
            
            request.onerror = function(event) {
                console.error('Error saving image data:', event.target.error);
                reject(event.target.error);
            };
            
            transaction.oncomplete = function() {
                // 事务完成
            };
            
            transaction.onerror = function(event) {
                console.error('Transaction error when saving image data:', event.target.error);
                reject(event.target.error);
            };
        } catch (e) {
            console.error('Error in saveImageData transaction:', e);
            reject(e);
        }
    });
} 