/**
 * Admin Pictures Management
 * 处理管理员界面的图片管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Pictures Management loaded');
    
    // 初始化图片管理
    initPictureManagement();
    
    // 初始化轮播图管理
    initCarouselManagement();
});

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
 */
function fixPictureUploadForm() {
    const uploadForm = document.getElementById('uploadPictureForm');
    if (!uploadForm) {
        console.error('Upload form not found');
        return;
    }
    
    console.log('Setting up picture upload form');
    
    // 标记表单由admin-pictures.js处理
    uploadForm.setAttribute('data-handler', 'admin-pictures');
    
    // 修复文件上传预览
    const pictureFile = document.getElementById('pictureFile');
    const filePreview = document.getElementById('filePreview');
    
    if (pictureFile && filePreview) {
        pictureFile.addEventListener('change', function(e) {
            console.log('File selected for upload');
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    filePreview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px;">`;
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
        
        const pictureFile = document.getElementById('pictureFile');
        const pictureName = document.getElementById('pictureName');
        const category = document.getElementById('uploadCategory');
        const description = document.getElementById('pictureDescription');
        
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
        
        // 读取图片文件
        const reader = new FileReader();
        reader.onload = function(event) {
            // 创建图片对象
            const newPicture = {
                id: 'pic_' + Date.now(),
                name: pictureName.value.trim(),
                category: category.value,
                description: description.value.trim(),
                imageUrl: event.target.result,
                uploadDate: new Date().toISOString()
            };
            
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
        };
        
        reader.readAsDataURL(pictureFile.files[0]);
    });
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
        
        return true;
    } catch (e) {
        console.error('Error saving picture:', e);
        return false;
    }
}

/**
 * 删除图片
 * @param {string} pictureId - 图片ID
 */
function deletePicture(pictureId) {
    if (!confirm('Are you sure you want to delete this picture? This action cannot be undone.')) {
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
        
        // 重新加载图片列表
        loadAndDisplayPictures();
        
        console.log('Picture deleted:', pictureId);
        alert('Picture deleted successfully');
    } catch (e) {
        console.error('Error deleting picture:', e);
        alert('Failed to delete picture');
    }
}

/**
 * 编辑图片信息
 * @param {string} pictureId - 图片ID
 */
function editPicture(pictureId) {
    try {
        // 从localStorage加载图片
        const picturesStr = localStorage.getItem('adminPictures');
        const pictures = picturesStr ? JSON.parse(picturesStr) : [];
        
        // 查找指定图片
        const picture = pictures.find(pic => pic.id === pictureId);
        if (!picture) {
            console.error('Picture not found:', pictureId);
            return;
        }
        
        // TODO: 实现图片编辑功能
        alert('Picture editing is not implemented yet');
    } catch (e) {
        console.error('Error editing picture:', e);
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