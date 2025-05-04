/**
 * Simple Gallery - 简单图库显示
 * 轻量级图片显示，直接从存储中获取图片数据
 */
(function() {
  'use strict';

  // 仅在DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', initGallery);

  /**
   * 初始化图库显示
   */
  function initGallery() {
    console.log('Initializing simple gallery');
    
    // 检查是否在前端页面
    if (!document.querySelector('.gallery-filter')) return;
    
    // 获取图片数据
    getGalleryPictures();
  }
  
  /**
   * 从存储中获取图片数据
   */
  function getGalleryPictures() {
    // 显示加载中状态
    showLoadingState();
    
    // 优先使用增强版存储服务
    if (window.ImageStorageService) {
      console.log('Using enhanced image storage service');
      // 使用IndexedDB存储服务，获取所有图片
      window.ImageStorageService.getAllImages({
        page: 1,
        limit: 100, // 加载更多图片
        sort: 'newest'
      }, function(result) {
        if (result && result.images && result.images.length > 0) {
          console.log(`Loaded ${result.images.length} images from enhanced storage`);
          setupGalleryWithPictures(result.images);
        } else {
          // 回退到localStorage
          console.log('No images found in enhanced storage, falling back to localStorage');
          loadImagesFromLocalStorage();
        }
      });
    } else {
      // 回退到旧方法
      console.log('Enhanced storage service not available, using localStorage');
      loadImagesFromLocalStorage();
    }
  }
  
  /**
   * 显示图片加载中状态
   */
  function showLoadingState() {
    const gallerySection = document.querySelector('.modern-gallery-container');
    if (!gallerySection) return;
    
    gallerySection.innerHTML = `
      <div class="loading-gallery">
        <i class="fas fa-spinner"></i>
        <p>加载精彩图片中...</p>
      </div>
    `;
  }
  
  /**
   * 从localStorage加载图片
   */
  function loadImagesFromLocalStorage() {
    try {
      // 尝试从adminPictures获取
      const adminPicturesStr = localStorage.getItem('adminPictures');
      const adminPictures = adminPicturesStr ? JSON.parse(adminPicturesStr) : [];
      
      // 尝试从sitePictures获取
      const sitePicturesStr = localStorage.getItem('sitePictures');
      const sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
      
      // 合并去重
      let allPictures = [...adminPictures];
      
      // 添加sitePictures中不重复的图片
      sitePictures.forEach(sitePic => {
        if (!allPictures.some(pic => pic.id === sitePic.id)) {
          // 转换sitePicture格式为统一格式
          allPictures.push({
            id: sitePic.id,
            name: sitePic.name,
            category: sitePic.category,
            description: sitePic.description || '',
            imageUrl: sitePic.url || sitePic.imageUrl,
            uploadDate: sitePic.uploadDate || new Date().toISOString()
          });
        }
      });
      
      console.log(`Loaded ${allPictures.length} images from localStorage`);
      
      if (allPictures.length > 0) {
        setupGalleryWithPictures(allPictures);
      } else {
        // 没有图片时加载默认图片
        loadDefaultPictures();
      }
    } catch (e) {
      console.error('Error loading images from localStorage:', e);
      loadDefaultPictures();
    }
  }
  
  /**
   * 加载默认图片（确保始终有图片显示）
   */
  function loadDefaultPictures() {
    console.log('Loading default pictures');
    
    // 默认图片数据
    const defaultPictures = [
      {
        id: 'default_1',
        name: 'Scenic Mountains',
        category: 'Scenery',
        description: 'Beautiful mountain landscape in Sri Lanka',
        imageUrl: 'images/gallery/scenic-mountains.jpg'
      },
      {
        id: 'default_2',
        name: 'Tea Plantation',
        category: 'Scenery',
        description: 'Famous tea plantations of Sri Lanka',
        imageUrl: 'images/gallery/tea-plantation.jpg'
      },
      {
        id: 'default_3',
        name: 'Exotic Wildlife',
        category: 'Wildlife',
        description: 'Sri Lankan elephant in its natural habitat',
        imageUrl: 'images/gallery/wildlife.jpg'
      },
      {
        id: 'default_4',
        name: 'Buddhist Temple',
        category: 'Culture',
        description: 'Ancient Buddhist temple with traditional architecture',
        imageUrl: 'images/gallery/temple.jpg'
      },
      {
        id: 'default_5',
        name: 'Traditional Food',
        category: 'Food',
        description: 'Delicious traditional Sri Lankan cuisine',
        imageUrl: 'images/gallery/food.jpg'
      },
      {
        id: 'default_6',
        name: 'Beautiful Beach',
        category: 'Beach',
        description: 'Pristine beaches of Sri Lanka',
        imageUrl: 'images/gallery/beach.jpg'
      }
    ];
    
    setupGalleryWithPictures(defaultPictures);
  }
  
  /**
   * 使用图片数据设置画廊
   */
  function setupGalleryWithPictures(pictures) {
    // 设置分类按钮事件
    setupFilterButtons(pictures);
    
    // 默认显示所有图片
    displayPicturesByCategory(pictures, 'all');
  }
  
  /**
   * 设置分类按钮事件处理
   */
  function setupFilterButtons(pictures) {
    // 获取所有分类按钮
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    if (!filterButtons.length) {
      console.error('Gallery filter buttons not found');
      return;
    }
    
    // 移除所有现有的点击事件（防止重复绑定）
    filterButtons.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
    
    // 重新获取按钮
    const updatedButtons = document.querySelectorAll('.gallery-filter-btn');
    
    // 设置点击事件
    updatedButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // 移除所有按钮的活动状态
        updatedButtons.forEach(b => b.classList.remove('active'));
        
        // 将当前按钮设置为活动状态
        this.classList.add('active');
        
        // 获取分类
        const category = this.getAttribute('data-category');
        console.log(`Filtering by category: ${category}`);
        
        // 显示所选分类的图片
        displayPicturesByCategory(pictures, category);
      });
    });
    
    // 默认选中"All"按钮
    const allButton = document.querySelector('.gallery-filter-btn[data-category="all"]');
    if (allButton) {
      allButton.classList.add('active');
    }
  }
  
  /**
   * 根据分类显示图片
   * @param {Array} pictures - 图片数组
   * @param {string} category - 分类名称
   */
  function displayPicturesByCategory(pictures, category) {
    // 筛选图片
    const filteredPictures = category === 'all' 
      ? pictures 
      : pictures.filter(pic => pic.category === category);
      
    console.log(`Displaying ${filteredPictures.length} ${category} pictures`);
    
    // 查找图库容器
    const galleryContainer = document.querySelector('.modern-gallery-container');
    if (!galleryContainer) return;
    
    // 清空容器
    galleryContainer.innerHTML = '';
    
    // 如果没有图片，显示提示信息
    if (filteredPictures.length === 0) {
      galleryContainer.innerHTML = `
        <div class="empty-category">
          <i class="fas fa-image"></i>
          <p>No images found in category "${category}"</p>
        </div>
      `;
      return;
    }
    
    // 创建特色图片容器
    const featuredContainer = document.createElement('div');
    featuredContainer.className = 'featured-image-container';
    
    // 创建缩略图容器
    const thumbnailsContainer = document.createElement('div');
    thumbnailsContainer.className = 'gallery-thumbnails';
    
    // 添加特色图片（默认显示第一张）
    displayFeaturedImage(featuredContainer, filteredPictures[0]);
    
    // 添加所有缩略图
    filteredPictures.forEach((picture, index) => {
      // 创建缩略图
      const thumbnail = document.createElement('div');
      thumbnail.className = `gallery-thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.setAttribute('data-id', picture.id);
      
      // 设置缩略图内容
      thumbnail.innerHTML = `<img src="${picture.imageUrl}" alt="${picture.name}">`;
      
      // 添加点击事件
      thumbnail.addEventListener('click', function() {
        // 更新特色图片
        displayFeaturedImage(featuredContainer, picture);
        
        // 更新活动缩略图
        document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        this.classList.add('active');
      });
      
      // 添加到缩略图容器
      thumbnailsContainer.appendChild(thumbnail);
    });
    
    // 将容器添加到图库
    galleryContainer.appendChild(featuredContainer);
    galleryContainer.appendChild(thumbnailsContainer);
    
    // 设置自动轮播
    setupCarousel(featuredContainer, filteredPictures, thumbnailsContainer);
  }
  
  /**
   * 显示特色图片
   * @param {HTMLElement} container - 特色图片容器
   * @param {Object} picture - 图片对象
   */
  function displayFeaturedImage(container, picture) {
    // 创建图片元素用于预加载和错误处理
    const img = new Image();
    
    // 设置加载事件
    img.onload = function() {
      // 成功加载后更新特色图片
      container.innerHTML = `
        <div class="featured-image">
          <img src="${picture.imageUrl}" alt="${picture.name}">
        </div>
        <div class="featured-caption">
          <h3 class="featured-title">${picture.name}</h3>
          <p class="featured-desc">${picture.description || ''}</p>
        </div>
      `;
    };
    
    // 设置错误处理
    img.onerror = function() {
      console.warn(`Failed to load image: ${picture.name}`);
      // 加载失败时使用替代图片
      container.innerHTML = `
        <div class="featured-image">
          <div class="image-error">
            <i class="fas fa-image"></i>
            <p>Image could not be loaded</p>
          </div>
        </div>
        <div class="featured-caption">
          <h3 class="featured-title">${picture.name}</h3>
          <p class="featured-desc">${picture.description || ''}</p>
        </div>
      `;
    };
    
    // 开始加载图片
    img.src = picture.imageUrl;
  }
  
  /**
   * 设置自动轮播功能
   * @param {HTMLElement} featuredContainer - 特色图片容器
   * @param {Array} pictures - 图片数组
   * @param {HTMLElement} thumbnailsContainer - 缩略图容器
   */
  function setupCarousel(featuredContainer, pictures, thumbnailsContainer) {
    if (pictures.length <= 1) return;
    
    let currentIndex = 0;
    const intervalTime = 5000; // 5秒切换一次
    
    const interval = setInterval(() => {
      // 计算下一个索引
      currentIndex = (currentIndex + 1) % pictures.length;
      
      // 更新特色图片
      displayFeaturedImage(featuredContainer, pictures[currentIndex]);
      
      // 更新缩略图选中状态
      const thumbnails = thumbnailsContainer.querySelectorAll('.gallery-thumbnail');
      thumbnails.forEach((thumb, index) => {
        if (index === currentIndex) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }, intervalTime);
    
    // 当用户点击缩略图时重置计时器
    const thumbnails = thumbnailsContainer.querySelectorAll('.gallery-thumbnail');
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        currentIndex = index;
        clearInterval(interval);
        // 重启计时器
        setupCarousel(featuredContainer, pictures, thumbnailsContainer);
      });
    });
    
    // 当用户离开页面时清除定时器
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        // 重新启动轮播
        setupCarousel(featuredContainer, pictures, thumbnailsContainer);
      }
    });
  }
})(); 