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
            
            // 确保IndexedDB数据库已初始化
            if (typeof initImageDatabase !== 'function') {
                console.error('initImageDatabase function not found');
                reject(new Error('迁移功能不可用，请刷新页面后重试'));
                return;
            }
            
            // 初始化数据库
            initImageDatabase().then(() => {
                // 更新进度条显示
                const progressBar = document.getElementById('migrationProgressBar');
                
                // 迁移每张图片
                const migrationPromises = pictures.map((picture, index) => {
                    return new Promise((resolveItem) => {
                        setTimeout(() => {
                            try {
                                // 对图片进行分离处理：元数据和图片数据分开存储
                                const metadata = {
                                    id: picture.id,
                                    name: picture.name || 'Untitled',
                                    category: picture.category || 'scenery',
                                    description: picture.description || '',
                                    thumbnailUrl: picture.imageUrl, // 旧数据没有缩略图，直接使用原图
                                    uploadDate: picture.uploadDate || new Date().toISOString()
                                };
                                
                                const imageData = {
                                    id: picture.id,
                                    imageUrl: picture.imageUrl,
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
                                    
                                    resolveItem();
                                }).catch(error => {
                                    console.error(`Error migrating picture ${picture.id}:`, error);
                                    resolveItem(); // 继续处理下一张，不中断整体迁移
                                });
                            } catch (e) {
                                console.error(`Error processing picture ${picture.id}:`, e);
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
                    if (typeof synchronizeImageStorage === 'function') {
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
            }).catch(error => {
                console.error('Error initializing IndexedDB:', error);
                reject(error);
            });
        } catch (e) {
            console.error('Error in migration function:', e);
            reject(e);
        }
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
 * Helper: 保存元数据到IndexedDB - 如果admin-pictures.js中的函数不可用
 */
function saveMetadata(metadata) {
    // 如果原始函数存在，使用它
    if (typeof window.saveMetadata === 'function') {
        return window.saveMetadata(metadata);
    }
    
    return new Promise((resolve, reject) => {
        // 检查IndexedDB是否可用
        if (!window.indexedDB) {
            console.error('IndexedDB not supported');
            reject(new Error('Your browser does not support IndexedDB'));
            return;
        }
        
        // 打开数据库
        const request = indexedDB.open('sriLankaImageDB', 1);
        
        request.onerror = function(event) {
            console.error('Error opening IndexedDB:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            try {
                // 创建事务
                const transaction = db.transaction(['metadata'], 'readwrite');
                const store = transaction.objectStore('metadata');
                
                // 保存元数据
                const saveRequest = store.put(metadata);
                
                saveRequest.onsuccess = function() {
                    resolve(true);
                };
                
                saveRequest.onerror = function(event) {
                    console.error('Error saving metadata:', event.target.error);
                    reject(event.target.error);
                };
                
                transaction.oncomplete = function() {
                    db.close();
                };
            } catch (e) {
                console.error('Error in IndexedDB transaction:', e);
                reject(e);
            }
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            // 创建元数据存储
            if (!db.objectStoreNames.contains('metadata')) {
                db.createObjectStore('metadata', { keyPath: 'id' });
            }
            
            // 创建图片存储
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Helper: 保存图片数据到IndexedDB - 如果admin-pictures.js中的函数不可用
 */
function saveImageData(imageData) {
    // 如果原始函数存在，使用它
    if (typeof window.saveImageData === 'function') {
        return window.saveImageData(imageData);
    }
    
    return new Promise((resolve, reject) => {
        // 检查IndexedDB是否可用
        if (!window.indexedDB) {
            console.error('IndexedDB not supported');
            reject(new Error('Your browser does not support IndexedDB'));
            return;
        }
        
        // 打开数据库
        const request = indexedDB.open('sriLankaImageDB', 1);
        
        request.onerror = function(event) {
            console.error('Error opening IndexedDB:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            try {
                // 创建事务
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                
                // 保存图片数据
                const saveRequest = store.put(imageData);
                
                saveRequest.onsuccess = function() {
                    resolve(true);
                };
                
                saveRequest.onerror = function(event) {
                    console.error('Error saving image data:', event.target.error);
                    reject(event.target.error);
                };
                
                transaction.oncomplete = function() {
                    db.close();
                };
            } catch (e) {
                console.error('Error in IndexedDB transaction:', e);
                reject(e);
            }
        };
    });
} 