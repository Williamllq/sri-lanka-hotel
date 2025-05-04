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
      // 检查是否使用增强存储
      const usingEnhanced = localStorage.getItem('usingEnhancedStorage') === 'true';
      
      if (usingEnhanced && window.ImageStorageService) {
        console.log('检测到增强存储标志，但未能成功从IndexedDB加载，正在重试...');
        // 再次尝试从IndexedDB加载图片，使用更简单的方式
        window.ImageStorageService.getAllImages({
          page: 1,
          limit: 100,
          sort: 'newest'
        }, function(result) {
          if (result && result.images && result.images.length > 0) {
            console.log(`成功从IndexedDB加载 ${result.images.length} 张图片`);
            setupGalleryWithPictures(result.images);
          } else {
            // 如果仍然失败，回退到索引
            loadFromImageIndex();
          }
        });
        return;
      }
      
      // 如果不是使用增强存储，或者没有增强存储服务，尝试使用索引
      loadFromImageIndex();
    } catch (e) {
      console.error('加载图片时出错:', e);
      loadDefaultPictures();
    }
  }
  
  /**
   * 从图片索引加载图片
   */
  function loadFromImageIndex() {
    try {
      // 尝试从索引获取
      const indexStr = localStorage.getItem('siteImageIndex');
      const index = indexStr ? JSON.parse(indexStr) : [];
      
      if (index && index.length > 0) {
        console.log(`从索引中找到 ${index.length} 张图片引用`);
        
        // 如果增强存储服务可用，从增强存储加载完整数据
        if (window.ImageStorageService) {
          // 轮询获取每张图片的完整数据
          let loadedImages = [];
          let loadCount = 0;
          
          index.forEach(item => {
            window.ImageStorageService.getFullImage(item.id, function(fullImage) {
              loadCount++;
              
              if (fullImage) {
                loadedImages.push(fullImage);
              }
              
              // 所有图片都处理完后，显示图库
              if (loadCount === index.length) {
                if (loadedImages.length > 0) {
                  console.log(`成功从IndexedDB加载 ${loadedImages.length} 张图片的完整数据`);
                  setupGalleryWithPictures(loadedImages);
                } else {
                  console.warn('未能从IndexedDB加载图片，尝试旧方法');
                  loadFromLegacyStorage();
                }
              }
            });
          });
          return;
        }
      }
      
      // 如果索引为空或无法使用，尝试旧存储
      loadFromLegacyStorage();
    } catch (e) {
      console.error('从索引加载图片失败:', e);
      loadFromLegacyStorage();
    }
  }
  
  /**
   * 从旧存储方式加载图片
   */
  function loadFromLegacyStorage() {
    console.log('尝试从旧存储方式加载图片');
    
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
    
    console.log(`从旧存储方式加载了 ${allPictures.length} 张图片`);
    
    if (allPictures.length > 0) {
      setupGalleryWithPictures(allPictures);
    } else {
      // 没有图片时加载默认图片
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
      : pictures.filter(pic => pic.category.toLowerCase() === category.toLowerCase());
      
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
      
      // 根据分类设置默认缩略图背景
      let categoryColor;
      switch(picture.category.toLowerCase()) {
        case 'scenery': categoryColor = '#4CAF50'; break;
        case 'wildlife': categoryColor = '#FF9800'; break;
        case 'culture': categoryColor = '#9C27B0'; break;
        case 'food': categoryColor = '#F44336'; break;
        case 'beach': categoryColor = '#03A9F4'; break;
        default: categoryColor = '#607D8B';
      }
      
      // 设置默认样式，稍后用图片替换
      thumbnail.innerHTML = `
        <div class="thumbnail-placeholder" style="background-color: ${categoryColor}20; border: 1px solid ${categoryColor}">
          <span>${picture.name.charAt(0)}</span>
        </div>
      `;
      
      // 根据URL类型加载缩略图
      if (picture.imageUrl && (picture.imageUrl.startsWith('data:image/') || 
                              picture.imageUrl.includes('/images/') || 
                              picture.imageUrl.includes('unsplash.com'))) {
        // 直接加载缩略图
        loadThumbnailImage(thumbnail, picture.imageUrl, picture.name);
      } else if (window.ImageStorageService && picture.id) {
        // 尝试从IndexedDB获取缩略图
        window.ImageStorageService.getFullImage(picture.id, function(fullImage) {
          if (fullImage && fullImage.imageUrl) {
            loadThumbnailImage(thumbnail, fullImage.imageUrl, picture.name);
          }
        });
      }
      
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
   * 加载缩略图
   * @param {HTMLElement} container - 缩略图容器
   * @param {string} imageUrl - 图片URL
   * @param {string} altText - 替代文本
   */
  function loadThumbnailImage(container, imageUrl, altText) {
    const img = new Image();
    img.onload = function() {
      container.innerHTML = `<img src="${imageUrl}" alt="${altText}">`;
    };
    img.onerror = function() {
      // 加载失败时保留默认缩略图
    };
    img.src = imageUrl;
  }
  
  /**
   * 显示特色图片
   * @param {HTMLElement} container - 特色图片容器
   * @param {Object} picture - 图片对象
   */
  function displayFeaturedImage(container, picture) {
    // 显示加载中状态
    container.innerHTML = `
      <div class="featured-image">
        <div class="loading-image">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading image...</p>
        </div>
      </div>
      <div class="featured-caption">
        <h3 class="featured-title">${picture.name}</h3>
        <p class="featured-desc">${picture.description || ''}</p>
      </div>
    `;
    
    // 检查图片URL格式
    let imageUrl = picture.imageUrl;
    
    // 处理base64编码的图片数据
    if (imageUrl && (imageUrl.startsWith('data:image/') || imageUrl.includes('/images/') || imageUrl.includes('unsplash.com'))) {
      // 正常URL格式，直接使用
      loadImageWithUrl(imageUrl);
    } else if (window.ImageStorageService && picture.id) {
      // 如果没有直接可用的URL但有ID且存储服务可用，尝试从IndexedDB获取完整图片
      console.log('尝试从IndexedDB获取完整图片:', picture.id);
      window.ImageStorageService.getFullImage(picture.id, function(fullImage) {
        if (fullImage && fullImage.imageUrl) {
          loadImageWithUrl(fullImage.imageUrl);
        } else {
          // 如果从IndexedDB获取失败，使用默认图片
          loadDefaultImage();
        }
      });
    } else {
      // 无法获取图片，使用默认图片
      loadDefaultImage();
    }
    
    /**
     * 尝试加载图片URL
     */
    function loadImageWithUrl(url) {
      // 创建图片元素用于预加载和错误处理
      const img = new Image();
      
      // 设置加载事件
      img.onload = function() {
        // 成功加载后更新特色图片
        container.innerHTML = `
          <div class="featured-image">
            <img src="${url}" alt="${picture.name}">
          </div>
          <div class="featured-caption">
            <h3 class="featured-title">${picture.name}</h3>
            <p class="featured-desc">${picture.description || ''}</p>
          </div>
        `;
      };
      
      // 设置错误处理
      img.onerror = function() {
        console.warn(`Failed to load image: ${picture.name} (${url})`);
        // 加载失败时使用默认图片
        loadDefaultImage();
      };
      
      // 设置超时处理
      const timeout = setTimeout(function() {
        console.warn(`Image load timeout: ${picture.name}`);
        img.src = ""; // 取消加载
        loadDefaultImage();
      }, 5000); // 5秒超时
      
      // 清除超时计时器
      img.onload = function() {
        clearTimeout(timeout);
        // 成功加载后更新特色图片
        container.innerHTML = `
          <div class="featured-image">
            <img src="${url}" alt="${picture.name}">
          </div>
          <div class="featured-caption">
            <h3 class="featured-title">${picture.name}</h3>
            <p class="featured-desc">${picture.description || ''}</p>
          </div>
        `;
      };
      
      // 开始加载图片
      img.src = url;
    }
    
    /**
     * 显示默认/错误图片
     */
    function loadDefaultImage() {
      // 根据分类选择不同的默认图片
      let defaultImagePath;
      
      switch (picture.category.toLowerCase()) {
        case 'scenery':
          defaultImagePath = 'images/gallery/scenic-mountains.jpg';
          break;
        case 'wildlife':
          defaultImagePath = 'images/gallery/wildlife.jpg';
          break;
        case 'culture':
          defaultImagePath = 'images/gallery/temple.jpg';
          break;
        case 'food':
          defaultImagePath = 'images/gallery/food.jpg';
          break;
        case 'beach':
          defaultImagePath = 'images/gallery/beach.jpg';
          break;
        default:
          defaultImagePath = 'images/gallery/sri-lanka-default.jpg';
      }
      
      // 加载默认图片
      const defaultImage = new Image();
      defaultImage.onload = function() {
        container.innerHTML = `
          <div class="featured-image">
            <img src="${defaultImagePath}" alt="${picture.name}">
            <div class="image-overlay">
              <i class="fas fa-exclamation-circle"></i>
              <p>Original image could not be loaded</p>
            </div>
          </div>
          <div class="featured-caption">
            <h3 class="featured-title">${picture.name}</h3>
            <p class="featured-desc">${picture.description || ''}</p>
          </div>
        `;
      };
      
      defaultImage.onerror = function() {
        // 如果默认图片也无法加载，显示纯文本信息
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
      
      defaultImage.src = defaultImagePath;
    }
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