/**
 * Admin Pictures Migrate
 * 将图片数据从localStorage迁移到IndexedDB，用于解决存储限制问题
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Migration script loaded');
    
    // 检测并执行迁移
    setTimeout(checkAndMigrate, 1000);
});

// IndexedDB 数据库名称和版本
const DB_NAME = 'sriLankaImageDB'; // 修正为与admin-pictures.js中相同的数据库名
const DB_VERSION = 1;
let db = null;

/**
 * 初始化IndexedDB数据库
 * @returns {Promise} 初始化完成后的Promise
 */
function initializeDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        
        console.log('Initializing IndexedDB for migration...');
        
        // 尝试获取全局变量中的数据库对象
        if (window.imageDB) {
            console.log('Using existing database from global variable');
            db = window.imageDB;
            resolve(db);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.error);
            reject('无法打开数据库，请确保您的浏览器支持IndexedDB: ' + event.target.error.message);
        };
        
        request.onupgradeneeded = function(event) {
            console.log('Creating/upgrading database schema...');
            const database = event.target.result;
            
            // 创建图片元数据存储
            if (!database.objectStoreNames.contains('metadata')) {
                database.createObjectStore('metadata', { keyPath: 'id' });
                console.log('Created metadata store');
            }
            
            // 创建图片数据存储
            if (!database.objectStoreNames.contains('images')) {
                database.createObjectStore('images', { keyPath: 'id' });
                console.log('Created images store');
            }
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            console.log('Database initialized successfully');
            resolve(db);
        };
    });
}

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
    } else if (migrationCompleted) {
        console.log('Migration already completed');
    } else {
        console.log('No local pictures found, no migration needed');
    }
}

/**
 * 显示迁移通知
 */
function showMigrationNotice() {
    console.log('Showing migration notice');
    
    const pictureGrid = document.getElementById('pictureGrid');
    if (!pictureGrid) {
        console.error('Picture grid container not found');
        return;
    }
    
    pictureGrid.innerHTML = `
        <div id="migration-notice" class="migration-notice">
            <h3>存储升级提示</h3>
            <p>检测到您的图片使用了旧的存储方式，为了支持更多图片并解决存储空间不足的问题，请点击"开始升级"按钮将图片迁移到新的存储系统。</p>
            <div id="migration-buttons"></div>
            <div id="migration-status" style="display: none;"></div>
        </div>
    `;
}

/**
 * 创建迁移按钮
 */
function createMigrationButton() {
    console.log('Creating migration button');
    
    const buttonContainer = document.getElementById('migration-buttons');
    if (!buttonContainer) {
        console.error('Migration button container not found');
        return;
    }
    
    buttonContainer.innerHTML = `
        <button id="start-migration" class="btn btn-primary">开始升级</button>
    `;
    
    const startButton = document.getElementById('start-migration');
    if (startButton) {
        startButton.addEventListener('click', startMigration);
    }
}

/**
 * 启动迁移过程
 */
function startMigration() {
    console.log('Starting migration process');
    
    const statusElement = document.getElementById('migration-status');
    if (statusElement) {
        statusElement.style.display = 'block';
        statusElement.innerHTML = `
            <div class="migration-progress">
                <i class="fas fa-spinner fa-spin"></i>
                <p>正在进行存储升级，请不要关闭页面...</p>
            </div>
        `;
    }
    
    // 禁用开始按钮
    const startButton = document.getElementById('start-migration');
    if (startButton) {
        startButton.disabled = true;
        startButton.textContent = '升级中...';
    }
    
    // 执行迁移过程
    migrateFromLocalStorage()
        .then(() => {
            console.log('Migration completed successfully');
            localStorage.setItem('picturesMigrationCompleted', 'true');
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="migration-success">
                        <i class="fas fa-check-circle"></i>
                        <p>存储升级成功完成！页面将在3秒后刷新...</p>
                    </div>
                `;
            }
            
            // 3秒后刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        })
        .catch(error => {
            console.error('Migration failed:', error);
            
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="migration-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>迁移失败：${error}</p>
                        <button id="retry-migration" class="btn btn-warning">重试</button>
                    </div>
                `;
                
                const retryButton = document.getElementById('retry-migration');
                if (retryButton) {
                    retryButton.addEventListener('click', startMigration);
                }
            }
            
            // 重新启用开始按钮
            if (startButton) {
                startButton.disabled = false;
                startButton.textContent = '开始升级';
            }
        });
}

/**
 * 从localStorage迁移数据到IndexedDB
 * @returns {Promise} 迁移过程的Promise
 */
function migrateFromLocalStorage() {
    return new Promise(async (resolve, reject) => {
        console.log('Migrating data from localStorage to IndexedDB...');
        
        try {
            // 1. 获取localStorage中的数据
            const picturesJson = localStorage.getItem('adminPictures');
            if (!picturesJson) {
                reject('没有找到需要迁移的图片数据');
                return;
            }
            
            let pictures;
            try {
                pictures = JSON.parse(picturesJson);
                console.log(`Found ${pictures.length} pictures to migrate`);
            } catch (e) {
                reject('图片数据格式无效，无法解析: ' + e.message);
                return;
            }
            
            if (!Array.isArray(pictures) || pictures.length === 0) {
                reject('没有有效的图片数据需要迁移');
                return;
            }
            
            // 2. 初始化IndexedDB
            try {
                // 首先尝试使用admin-pictures.js中全局的initImageDatabase函数
                if (typeof initImageDatabase === 'function') {
                    console.log('Using global initImageDatabase function');
                    await initImageDatabase();
                    db = window.imageDB; // 使用全局变量
                } else {
                    // 如果全局函数不可用，则使用我们自己的函数
                    console.log('Using local initializeDB function');
                    await initializeDB();
                }
                
                if (!db) {
                    throw new Error('数据库初始化失败，无法获取数据库对象');
                }
                
                console.log('Database initialized successfully, starting data migration');
                
                // 3. 逐个迁移图片
                const total = pictures.length;
                let completed = 0;
                
                for (let i = 0; i < pictures.length; i++) {
                    const picture = pictures[i];
                    const statusElement = document.getElementById('migration-status');
                    if (statusElement) {
                        statusElement.innerHTML = `
                            <div class="migration-progress">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>正在迁移图片 ${i+1}/${total}...</p>
                                <div class="progress-bar" style="width: ${Math.round((i/total)*100)}%"></div>
                            </div>
                        `;
                    }
                    
                    console.log(`Migrating picture ${i+1}/${total}: ${picture.id}`);
                    
                    try {
                        // 3.1 准备元数据
                        const metadata = {
                            id: picture.id,
                            name: picture.name || 'Untitled',
                            category: picture.category || 'scenery',
                            description: picture.description || '',
                            thumbnailUrl: picture.thumbnailUrl || null,
                            uploadDate: picture.uploadDate || new Date().toISOString()
                        };
                        
                        // 3.2 准备图片数据
                        const imageData = {
                            id: picture.id,
                            imageUrl: picture.imageUrl || picture.dataUrl,
                            uploadDate: picture.uploadDate || new Date().toISOString()
                        };
                        
                        // 3.3 保存到IndexedDB，直接使用事务进行操作
                        await saveToIndexedDBDirect(metadata, imageData);
                        completed++;
                    } catch (error) {
                        console.error(`Error migrating picture ${picture.id}:`, error);
                        // 继续处理其他图片，不中断整个过程
                    }
                }
                
                console.log(`Migration completed: ${completed}/${total} pictures migrated successfully`);
                
                if (completed === 0) {
                    reject(`迁移失败: 没有成功迁移任何图片`);
                    return;
                } else if (completed < total) {
                    console.warn(`部分图片迁移成功: ${completed}/${total}`);
                }
                
                // 4. 同步到前端存储
                try {
                    if (typeof synchronizeImageStorage === 'function') {
                        synchronizeImageStorage();
                        console.log('Synchronized migrated images to frontend storage');
                    }
                } catch (syncError) {
                    console.warn('Warning: Failed to synchronize with frontend:', syncError);
                    // 不因为同步失败而中断整个迁移过程
                }
                
                resolve();
            } catch (dbError) {
                console.error('Database error during migration:', dbError);
                reject('数据库操作失败: ' + (dbError.message || dbError));
            }
        } catch (e) {
            console.error('Unexpected error during migration:', e);
            reject('迁移过程中发生意外错误: ' + (e.message || e));
        }
    });
}

/**
 * 直接使用事务将数据保存到IndexedDB
 * @param {Object} metadata - 图片元数据
 * @param {Object} imageData - 图片数据
 * @returns {Promise} 保存操作的Promise
 */
function saveToIndexedDBDirect(metadata, imageData) {
    return new Promise((resolve, reject) => {
        try {
            if (!db) {
                reject('数据库未初始化或不可用');
                return;
            }
            
            // 使用单个事务保存元数据和图片数据
            const transaction = db.transaction(['metadata', 'images'], 'readwrite');
            
            transaction.onerror = function(event) {
                reject('事务错误: ' + event.target.error);
            };
            
            transaction.oncomplete = function() {
                resolve();
            };
            
            // 保存元数据
            const metadataStore = transaction.objectStore('metadata');
            metadataStore.put(metadata);
            
            // 保存图片数据
            const imageStore = transaction.objectStore('images');
            imageStore.put(imageData);
            
        } catch (e) {
            reject('保存数据失败: ' + e.message);
        }
    });
}

// 添加全局样式
(function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .migration-notice {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .migration-progress, .migration-success, .migration-error {
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
        }
        
        .migration-progress {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .migration-success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .migration-error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        #migration-buttons {
            margin: 15px 0;
        }
        
        .progress-bar {
            height: 10px;
            background-color: #007bff;
            border-radius: 5px;
            margin-top: 8px;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(style);
})(); 