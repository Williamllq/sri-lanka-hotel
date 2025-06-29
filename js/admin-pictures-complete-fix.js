/**
 * 完整的管理员图片管理修复方案
 * 解决数据结构、UI冲突、图片加载等所有问题
 */

(function() {
    console.log('Admin Pictures Complete Fix initializing...');
    
    // 配置
    const CONFIG = {
        defaultImage: '/images/placeholder.jpg',
        cloudinaryBase: 'https://res.cloudinary.com/dmpfjul1j/image/upload/',
        categories: ['scenery', 'wildlife', 'culture', 'food', 'beach'],
        maxPicturesIndexedDB: 100,
        maxPicturesLocalStorage: 15
    };
    
    /**
     * 步骤1: 清理并修复UI冲突
     */
    function cleanupUIConflicts() {
        console.log('Cleaning up UI conflicts...');
        
        // 移除重复的上传按钮
        const uploadButtons = document.querySelectorAll('button');
        const seenTexts = new Set();
        
        uploadButtons.forEach(btn => {
            const text = btn.textContent.trim();
            if (text.includes('Upload') && text.includes('Picture')) {
                if (seenTexts.has(text) && btn.id !== 'uploadPictureBtn') {
                    btn.style.display = 'none';
                    console.log(`Hidden duplicate button: ${text}`);
                }
                seenTexts.add(text);
            }
        });
        
        // 确保只有一个action-buttons容器
        const picturesSection = document.getElementById('picturesSection');
        if (picturesSection) {
            const actionContainers = picturesSection.querySelectorAll('.action-buttons, .admin-buttons, .upload-button-container');
            if (actionContainers.length > 1) {
                // 保留第一个，隐藏其他
                for (let i = 1; i < actionContainers.length; i++) {
                    actionContainers[i].style.display = 'none';
                }
            }
        }
    }
    
    /**
     * 步骤2: 创建统一的上传按钮UI
     */
    function createUnifiedUploadUI() {
        console.log('Creating unified upload UI...');
        
        const picturesSection = document.getElementById('picturesSection');
        if (!picturesSection) return;
        
        // 查找或创建action-buttons容器
        let actionButtons = picturesSection.querySelector('.action-buttons');
        if (!actionButtons) {
            // 查找标题后插入
            const header = picturesSection.querySelector('h2');
            if (header) {
                actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                header.insertAdjacentElement('afterend', actionButtons);
            }
        }
        
        // 清空并重建按钮
        if (actionButtons) {
            actionButtons.innerHTML = `
                <button class="admin-btn primary" id="uploadPictureBtn" style="margin-right: 10px;">
                    <i class="fas fa-upload"></i> Upload Picture
                </button>
                <button class="admin-btn secondary" id="migrateToCloudBtn">
                    <i class="fas fa-cloud-upload-alt"></i> Migrate to Cloud
                </button>
                <div class="picture-capacity" id="pictureCapacityInfo" style="float: right; margin-top: 10px;"></div>
            `;
            
            // 绑定事件
            const uploadBtn = document.getElementById('uploadPictureBtn');
            const migrateBtn = document.getElementById('migrateToCloudBtn');
            
            if (uploadBtn) {
                uploadBtn.addEventListener('click', function() {
                    const modal = document.getElementById('uploadModal');
                    if (modal) {
                        modal.style.display = 'block';
                        // 确保云存储选项可见
                        ensureCloudStorageOption();
                    }
                });
            }
            
            if (migrateBtn && window.cloudStorage) {
                migrateBtn.addEventListener('click', migrateAllToCloud);
            } else if (migrateBtn) {
                migrateBtn.style.display = 'none';
            }
        }
    }
    
    /**
     * 步骤3: 修复所有图片数据
     */
    async function fixAllPictureData() {
        console.log('Fixing all picture data...');
        
        // 获取所有存储的数据
        const adminPictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
        const sitePictures = JSON.parse(localStorage.getItem('sitePictures') || '[]');
        
        // 创建统一的图片集合
        const allPictures = new Map();
        
        // 处理adminPictures
        adminPictures.forEach(pic => {
            const fixedPic = fixPictureObject(pic);
            allPictures.set(fixedPic.id, fixedPic);
        });
        
        // 处理sitePictures（避免重复）
        sitePictures.forEach(pic => {
            if (!allPictures.has(pic.id)) {
                const fixedPic = fixPictureObject(pic);
                allPictures.set(fixedPic.id, fixedPic);
            }
        });
        
        // 转换回数组
        const fixedPictures = Array.from(allPictures.values());
        
        // 移除使用外部URL的示例图片（如果需要）
        const validPictures = fixedPictures.filter(pic => {
            const url = pic.imageUrl || pic.thumbnailUrl;
            // 保留Cloudinary图片和本地上传的图片
            return url && (url.includes('cloudinary') || url.startsWith('data:') || url.startsWith('/'));
        });
        
        // 如果没有有效图片，创建一些本地示例
        if (validPictures.length === 0) {
            console.log('No valid pictures found, creating local samples...');
            const samples = await createLocalSamplePictures();
            validPictures.push(...samples);
        }
        
        // 保存修复后的数据
        localStorage.setItem('adminPicturesMetadata', JSON.stringify(validPictures));
        localStorage.setItem('sitePictures', JSON.stringify(validPictures));
        
        console.log(`Fixed and saved ${validPictures.length} pictures`);
        
        return validPictures;
    }
    
    /**
     * 修复单个图片对象
     */
    function fixPictureObject(pic) {
        // 确保有ID
        if (!pic.id) {
            pic.id = 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        
        // 统一URL字段
        const possibleUrls = [pic.imageUrl, pic.url, pic.thumbnailUrl, pic.cloudUrl];
        const validUrl = possibleUrls.find(url => url && url.length > 0);
        
        pic.imageUrl = validUrl || CONFIG.defaultImage;
        pic.thumbnailUrl = pic.thumbnailUrl || pic.imageUrl;
        
        // 确保有其他必要字段
        pic.name = pic.name || 'Untitled';
        pic.category = pic.category || 'scenery';
        pic.description = pic.description || '';
        pic.uploadDate = pic.uploadDate || new Date().toISOString();
        
        // 删除不必要的url字段以避免混淆
        delete pic.url;
        
        return pic;
    }
    
    /**
     * 创建本地示例图片（使用Canvas）
     */
    async function createLocalSamplePictures() {
        const samples = [];
        const categories = CONFIG.categories;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
        
        for (let i = 0; i < Math.min(5, categories.length); i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            
            // 创建渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 400, 300);
            gradient.addColorStop(0, colors[i]);
            gradient.addColorStop(1, adjustColor(colors[i], -30));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 300);
            
            // 添加文字
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(categories[i].toUpperCase(), 200, 150);
            
            // 转换为dataURL
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            samples.push({
                id: 'local_sample_' + (i + 1),
                name: `${categories[i]} Sample`,
                category: categories[i],
                description: `Sample ${categories[i]} image`,
                imageUrl: dataUrl,
                thumbnailUrl: dataUrl,
                uploadDate: new Date().toISOString(),
                isLocal: true
            });
        }
        
        return samples;
    }
    
    /**
     * 调整颜色亮度
     */
    function adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    /**
     * 步骤4: 重新实现图片显示
     */
    function displayPictures(pictures) {
        console.log(`Displaying ${pictures.length} pictures...`);
        
        const pictureGrid = document.getElementById('pictureGrid');
        if (!pictureGrid) return;
        
        // 清空网格
        pictureGrid.innerHTML = '';
        
        if (pictures.length === 0) {
            pictureGrid.innerHTML = `
                <div class="no-pictures-message">
                    <i class="fas fa-image"></i>
                    <p>No pictures uploaded yet. Click "Upload Picture" to get started!</p>
                </div>
            `;
            return;
        }
        
        // 显示每张图片
        pictures.forEach(picture => {
            const card = createPictureCard(picture);
            pictureGrid.appendChild(card);
        });
        
        // 更新容量信息
        updateCapacityInfo(pictures.length);
    }
    
    /**
     * 创建图片卡片
     */
    function createPictureCard(picture) {
        const card = document.createElement('div');
        card.className = 'picture-card';
        card.setAttribute('data-id', picture.id);
        card.setAttribute('data-category', picture.category);
        
        const imageUrl = picture.thumbnailUrl || picture.imageUrl;
        const isCloudinary = imageUrl.includes('cloudinary');
        
        card.innerHTML = `
            <div class="picture-image">
                <img src="${imageUrl}" alt="${picture.name}" 
                     onerror="this.src='${CONFIG.defaultImage}'; this.onerror=null;">
                ${isCloudinary ? '<span class="cloud-badge"><i class="fas fa-cloud"></i></span>' : ''}
            </div>
            <div class="picture-info">
                <h3>${picture.name}</h3>
                <span class="picture-category ${picture.category}">${picture.category}</span>
                <p class="picture-description">${picture.description || 'No description'}</p>
            </div>
            <div class="picture-actions">
                <button class="edit-picture" onclick="editPicture('${picture.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-picture" onclick="deletePicture('${picture.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return card;
    }
    
    /**
     * 更新容量信息
     */
    function updateCapacityInfo(count) {
        const capacityInfo = document.getElementById('pictureCapacityInfo');
        if (!capacityInfo) return;
        
        const maxPictures = window.indexedDB ? CONFIG.maxPicturesIndexedDB : CONFIG.maxPicturesLocalStorage;
        const remaining = maxPictures - count;
        
        capacityInfo.innerHTML = `
            <i class="fas fa-database"></i> 
            ${count}/${maxPictures} pictures 
            <span style="color: ${remaining < 5 ? '#f44336' : '#4CAF50'}">
                (${remaining} remaining)
            </span>
        `;
    }
    
    /**
     * 确保云存储选项存在
     */
    function ensureCloudStorageOption() {
        const uploadForm = document.getElementById('uploadPictureForm');
        if (!uploadForm) return;
        
        let cloudOption = uploadForm.querySelector('#useCloudStorage');
        if (!cloudOption && window.cloudStorage) {
            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'form-group';
                optionDiv.innerHTML = `
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="useCloudStorage" checked style="margin-right: 8px;">
                        <span>Use Cloud Storage (Recommended)</span>
                    </label>
                    <small class="form-text text-muted">
                        Cloud storage provides better performance and reliability
                    </small>
                `;
                submitBtn.parentElement.insertBefore(optionDiv, submitBtn);
            }
        }
    }
    
    /**
     * 迁移所有图片到云端
     */
    async function migrateAllToCloud() {
        if (!window.cloudStorage) {
            alert('Cloud storage not available');
            return;
        }
        
        if (!confirm('Migrate all local images to Cloudinary? This may take a few minutes.')) {
            return;
        }
        
        const btn = document.getElementById('migrateToCloudBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migrating...';
        btn.disabled = true;
        
        try {
            const pictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
            let migrated = 0;
            let failed = 0;
            
            for (const picture of pictures) {
                // 跳过已经在云端的图片
                if (picture.cloudUrl || (picture.imageUrl && picture.imageUrl.includes('cloudinary'))) {
                    continue;
                }
                
                // 跳过本地生成的示例
                if (picture.isLocal || !picture.imageUrl || picture.imageUrl.startsWith('data:')) {
                    continue;
                }
                
                try {
                    const result = await window.cloudStorage.uploadImage(picture.imageUrl, {
                        folder: picture.category || 'general',
                        tags: ['migrated', picture.category]
                    });
                    
                    if (result.success) {
                        picture.cloudUrl = result.data.secure_url;
                        picture.imageUrl = result.data.secure_url;
                        picture.thumbnailUrl = result.data.urls.thumbnail;
                        migrated++;
                    } else {
                        failed++;
                    }
                } catch (error) {
                    console.error(`Failed to migrate ${picture.name}:`, error);
                    failed++;
                }
            }
            
            // 保存更新后的数据
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(pictures));
            localStorage.setItem('sitePictures', JSON.stringify(pictures));
            
            // 刷新显示
            displayPictures(pictures);
            
            alert(`Migration complete!\nMigrated: ${migrated}\nFailed: ${failed}`);
            
        } catch (error) {
            console.error('Migration error:', error);
            alert('Migration failed: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    /**
     * 添加必要的CSS
     */
    function addRequiredStyles() {
        if (document.getElementById('picture-complete-fix-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'picture-complete-fix-styles';
        style.textContent = `
            .cloud-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .picture-capacity {
                font-size: 14px;
                color: #666;
            }
            
            .action-buttons {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 20px 0;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            @media (max-width: 768px) {
                .action-buttons {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .picture-capacity {
                    text-align: center;
                    margin-top: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 主初始化函数
     */
    async function initialize() {
        console.log('Initializing complete picture fix...');
        
        // 添加样式
        addRequiredStyles();
        
        // 清理UI冲突
        cleanupUIConflicts();
        
        // 创建统一的上传UI
        createUnifiedUploadUI();
        
        // 修复数据
        const pictures = await fixAllPictureData();
        
        // 显示图片
        displayPictures(pictures);
        
        // 设置筛选功能
        setupCategoryFilter(pictures);
        
        console.log('Complete picture fix initialized successfully');
    }
    
    /**
     * 设置分类筛选
     */
    function setupCategoryFilter(allPictures) {
        const filterButtons = document.querySelectorAll('.category-filter button');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // 更新active状态
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // 获取分类
                const category = this.getAttribute('data-category') || 'all';
                
                // 筛选图片
                const filteredPictures = category === 'all' 
                    ? allPictures 
                    : allPictures.filter(p => p.category === category);
                
                // 重新显示
                displayPictures(filteredPictures);
            });
        });
    }
    
    // 全局函数
    window.editPicture = function(pictureId) {
        console.log('Edit picture:', pictureId);
        // 调用原有的编辑函数或实现新的
        if (typeof window.originalEditPicture === 'function') {
            window.originalEditPicture(pictureId);
        }
    };
    
    window.deletePicture = async function(pictureId) {
        if (!confirm('Are you sure you want to delete this picture?')) return;
        
        try {
            const pictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
            const filteredPictures = pictures.filter(p => p.id !== pictureId);
            
            localStorage.setItem('adminPicturesMetadata', JSON.stringify(filteredPictures));
            localStorage.setItem('sitePictures', JSON.stringify(filteredPictures));
            
            // 从IndexedDB删除（如果存在）
            if (window.deleteImageAndMetadata) {
                await window.deleteImageAndMetadata(pictureId);
            }
            
            // 刷新显示
            displayPictures(filteredPictures);
            
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete picture');
        }
    };
    
    // 启动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 导出初始化函数供调试
    window.reinitializePictures = initialize;
    
})(); 