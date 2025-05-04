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
    // 优先使用增强版存储服务
    if (window.ImageStorageService) {
      console.log('Using enhanced image storage service');
      // 使用IndexedDB存储服务，获取所有图片的缩略图
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
   * 从localStorage加载图片
   */
  function loadImagesFromLocalStorage() {
    try {
      // 优先从sitePictures获取 - 这是前端显示的格式
      const siteData = localStorage.getItem('sitePictures');
      if (siteData) {
        const sitePics = JSON.parse(siteData);
        if (sitePics && sitePics.length > 0) {
          console.log(`Loaded ${sitePics.length} images from sitePictures`);
          setupGalleryWithPictures(sitePics);
          return;
        }
      }
      
      // 如果sitePictures为空，尝试获取adminPictures
      const adminData = localStorage.getItem('adminPictures');
      if (adminData) {
        const adminPics = JSON.parse(adminData);
        if (adminPics && adminPics.length > 0) {
          console.log(`Converting ${adminPics.length} images from adminPictures`);
          // 转换格式
          const convertedPics = adminPics.map(pic => ({
            id: pic.id,
            name: pic.name,
            category: pic.category,
            description: pic.description || '',
            url: pic.imageUrl, // 关键区别：admin存储用imageUrl，site存储用url
            uploadDate: pic.uploadDate
          }));
          setupGalleryWithPictures(convertedPics);
          return;
        }
      }
      
      // 如果都没有，显示默认图片
      console.log('No images found in localStorage, using default images');
      setupGalleryWithPictures(getDefaultImages());
    } catch (e) {
      console.error('Error loading images from localStorage:', e);
      // 出错时使用默认图片
      setupGalleryWithPictures(getDefaultImages());
    }
  }
  
  /**
   * 设置图库并显示图片
   * @param {Array} pictures - 图片数据数组
   */
  function setupGalleryWithPictures(pictures) {
    // 规范化图片数据 - 确保数据格式统一
    const normalizedPictures = pictures.map(pic => ({
      id: pic.id,
      name: pic.name,
      category: normalizeCategory(pic.category),
      description: pic.description || '',
      url: pic.url || pic.imageUrl, // 兼容不同的命名格式
      uploadDate: pic.uploadDate
    }));
    
    // 设置分类按钮事件
    setupFilterButtons(normalizedPictures);
    
    // 默认显示所有图片
    displayPicturesByCategory(normalizedPictures, 'all');
  }
  
  /**
   * 规范化图片分类
   * @param {string} category - 原始分类名
   * @returns {string} 规范化后的分类名
   */
  function normalizeCategory(category) {
    if (!category) return 'scenery';
    
    const lowerCategory = category.toLowerCase().trim();
    
    // 基本分类映射
    const categoryMap = {
      'scenery': 'scenery',
      'scene': 'scenery',
      'landscapes': 'scenery',
      'landscape': 'scenery',
      
      'wildlife': 'wildlife',
      'animals': 'wildlife',
      'animal': 'wildlife',
      
      'culture': 'culture',
      'cultural': 'culture',
      'tradition': 'culture',
      'traditions': 'culture',
      
      'food': 'food',
      'cuisine': 'food',
      'dish': 'food',
      'dishes': 'food',
      
      'beach': 'beach',
      'beaches': 'beach',
      'coastal': 'beach',
      'coast': 'beach',
      'sea': 'beach'
    };
    
    return categoryMap[lowerCategory] || 'scenery';
  }
  
  /**
   * 设置筛选按钮事件
   * @param {Array} pictures - 图片数组
   */
  function setupFilterButtons(pictures) {
    const filterContainer = document.querySelector('.gallery-filter');
    if (!filterContainer) return;
    
    // 清空现有按钮
    filterContainer.innerHTML = '';
    
    // 获取可用分类
    const categories = ['all', 'scenery', 'wildlife', 'culture', 'food', 'beach'];
    
    // 移除没有图片的分类
    const availableCategories = categories.filter(cat => {
      if (cat === 'all') return true;
      return pictures.some(pic => pic.category === cat);
    });
    
    // 创建筛选按钮
    availableCategories.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'gallery-filter-btn';
      btn.setAttribute('data-category', category);
      
      // 设置按钮文本
      if (category === 'all') {
        btn.textContent = 'All';
      } else {
        // 首字母大写
        btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      }
      
      // 添加按钮点击事件
      btn.addEventListener('click', function() {
        // 移除所有按钮的active类
        document.querySelectorAll('.gallery-filter-btn').forEach(button => {
          button.classList.remove('active');
        });
        
        // 给当前按钮添加active类
        this.classList.add('active');
        
        // 显示对应分类的图片
        displayPicturesByCategory(pictures, category);
      });
      
      // 添加到筛选容器
      filterContainer.appendChild(btn);
    });
    
    // 默认选中All按钮
    const allBtn = filterContainer.querySelector('[data-category="all"]');
    if (allBtn) allBtn.classList.add('active');
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
      thumbnail.innerHTML = `<img src="${picture.url}" alt="${picture.name}">`;
      
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
    // 更新特色图片
    container.innerHTML = `
      <div class="featured-image">
        <img src="${picture.url}" alt="${picture.name}">
      </div>
      <div class="featured-caption">
        <h3 class="featured-title">${picture.name}</h3>
        <p class="featured-desc">${picture.description || ''}</p>
      </div>
    `;
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
  
  /**
   * 获取默认图片
   * @returns {Array} 默认图片数组
   */
  function getDefaultImages() {
    return [
      {
        id: 'default_1',
        name: 'Beautiful Beaches in Sri Lanka',
        category: 'beach',
        description: 'Explore the pristine beaches of Sri Lanka',
        url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1000',
        uploadDate: new Date().toISOString()
      },
      {
        id: 'default_2',
        name: 'Sri Lankan Wildlife',
        category: 'wildlife',
        description: 'Experience the diverse wildlife of Sri Lanka',
        url: 'https://images.unsplash.com/photo-1544535830-d4ae39e3e711?q=80&w=1000',
        uploadDate: new Date().toISOString()
      },
      {
        id: 'default_3',
        name: 'Cultural Heritage',
        category: 'culture',
        description: 'Discover the rich cultural heritage of Sri Lanka',
        url: 'https://images.unsplash.com/photo-1556195332-95503f664ced?q=80&w=1000',
        uploadDate: new Date().toISOString()
      },
      {
        id: 'default_4',
        name: 'Sri Lankan Cuisine',
        category: 'food',
        description: 'Taste the delicious flavors of Sri Lankan cuisine',
        url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1000',
        uploadDate: new Date().toISOString()
      },
      {
        id: 'default_5',
        name: 'Scenic Landscapes',
        category: 'scenery',
        description: 'Enjoy the breathtaking landscapes of Sri Lanka',
        url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1000',
        uploadDate: new Date().toISOString()
      }
    ];
  }
})(); 