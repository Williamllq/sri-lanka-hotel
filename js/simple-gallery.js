/**
 * Simple Gallery - 简单图库显示
 * 轻量级图片显示，直接从存储中获取图片数据
 */
(function() {
  'use strict';

  // 仅在DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', initGallery);
  
  // 监听图库更新事件
  document.addEventListener('gallery-updated', function() {
    console.log('Gallery update event received, refreshing display');
    initGallery();
  });

  // 全局变量，以便在需要时停止动画
  let carouselInterval = null;
  
  // 图片加载状态跟踪
  const loadedImages = new Set();
  
  // 当前显示的图片索引
  let currentImageIndex = 0;

  /**
   * 初始化图库显示
   */
  function initGallery() {
    console.log('Initializing simple gallery');
    
    // 检查是否在前端页面
    if (!document.querySelector('.gallery-filter')) return;
    
    // 尝试使用IndexedDB获取图片，如果不可用则回退到localStorage
    getGalleryPicturesAdvanced()
      .then(pictures => {
        // 设置分类按钮事件
        setupFilterButtons(pictures);
        
        // 获取当前选中的类别
        let selectedCategory = 'all';
        const activeButton = document.querySelector('.gallery-filter-btn.active');
        if (activeButton) {
          selectedCategory = activeButton.getAttribute('data-filter') || 'all';
        }
        
        // 显示对应类别的图片
        displayPicturesByCategory(pictures, selectedCategory);
        
        // 注册懒加载观察器
        registerLazyLoadObserver();
      })
      .catch(error => {
        console.error('Error initializing gallery:', error);
        // 回退到旧方法
        const pictures = getGalleryPictures();
        setupFilterButtons(pictures);
        let selectedCategory = 'all';
        const activeButton = document.querySelector('.gallery-filter-btn.active');
        if (activeButton) {
          selectedCategory = activeButton.getAttribute('data-filter') || 'all';
        }
        displayPicturesByCategory(pictures, selectedCategory);
      });
  }

  /**
   * 使用IndexedDB获取图片数据的高级方法
   */
  async function getGalleryPicturesAdvanced() {
    // 首先尝试使用IndexedDB
    try {
      // 如果支持Service Worker并且已注册
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // 触发后台同步
        navigator.serviceWorker.ready.then(registration => {
          if (registration.sync) {
            registration.sync.register('sync-gallery-images')
              .then(() => console.log('Background sync registered'))
              .catch(err => console.error('Background sync failed:', err));
          }
        });
      }
      
      // 尝试打开IndexedDB
      const db = await openImageDatabase();
      if (db) {
        // 从IndexedDB获取所有图片
        const images = await getAllImagesFromDB(db);
        if (images && images.length > 0) {
          console.log(`Retrieved ${images.length} images from IndexedDB`);
          return normalizeImages(images);
        }
      }
    } catch (e) {
      console.warn('IndexedDB access failed:', e);
    }
    
    // 如果IndexedDB不可用或为空，回退到localStorage
    return getGalleryPictures();
  }
  
  /**
   * 打开图片数据库
   */
  function openImageDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject('IndexedDB not supported');
        return;
      }
      
      const request = indexedDB.open('GalleryDatabase', 1);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('uploadDate', 'uploadDate', { unique: false });
        }
      };
      
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  }
  
  /**
   * 从IndexedDB获取所有图片
   */
  function getAllImagesFromDB(db) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }
  
  /**
   * 从存储中获取图片数据 (旧方法)
   */
  function getGalleryPictures() {
    // 尝试从localStorage获取图片
    try {
      let allPictures = [];
      
      // 优先从adminPictures获取（这是主要图片源）
      const adminData = localStorage.getItem('adminPictures');
      if (adminData) {
        const adminPics = JSON.parse(adminData);
        if (Array.isArray(adminPics) && adminPics.length > 0) {
          console.log(`Found ${adminPics.length} pictures in adminPictures`);
          
          // 将admin图片转换为标准格式并添加到集合中
          adminPics.forEach(adminPic => {
            if (adminPic && adminPic.id) {
              allPictures.push({
                id: adminPic.id,
                name: adminPic.name || 'Untitled',
                category: (adminPic.category || 'scenery').toLowerCase(),
                description: adminPic.description || '',
                url: adminPic.imageUrl || adminPic.url || '',
                uploadDate: adminPic.uploadDate || new Date().toISOString()
              });
            }
          });
        }
      }
      
      // 再从sitePictures获取，避免重复
      const siteData = localStorage.getItem('sitePictures');
      if (siteData) {
        const sitePics = JSON.parse(siteData);
        if (Array.isArray(sitePics) && sitePics.length > 0) {
          console.log(`Found ${sitePics.length} pictures in sitePictures`);
          
          // 添加未重复的图片
          sitePics.forEach(sitePic => {
            if (!sitePic || !sitePic.id) return;
            
            // 检查是否已存在于allPictures中
            const isDuplicate = allPictures.some(pic => 
              pic.id === sitePic.id || 
              (pic.url && sitePic.url && pic.url === sitePic.url) || 
              (pic.name && sitePic.name && pic.name === sitePic.name && pic.category === sitePic.category)
            );
            
            if (!isDuplicate) {
              allPictures.push({
                id: sitePic.id,
                name: sitePic.name || 'Untitled',
                category: (sitePic.category || 'scenery').toLowerCase(),
                description: sitePic.description || '',
                url: sitePic.url || '',
                uploadDate: sitePic.uploadDate || new Date().toISOString()
              });
            }
          });
        }
      }
      
      // 如果已获取图片，标准化并返回
      if (allPictures.length > 0) {
        console.log(`Total unique pictures: ${allPictures.length}`);
        // 打印类别统计信息帮助调试
        const categories = {};
        allPictures.forEach(pic => {
          categories[pic.category] = (categories[pic.category] || 0) + 1;
        });
        console.log('Categories breakdown:', categories);
        
        return normalizeImages(allPictures);
      }
    } catch (e) {
      console.error('Error loading pictures from storage:', e);
    }
    
    // 从默认图片中获取
    console.log('No pictures found in storage, using default pictures');
    return getDefaultPictures();
  }
  
  /**
   * 获取默认图片
   */
  function getDefaultPictures() {
    const defaultPics = [];
    
    // 从隐藏的gallery-grid中获取图片
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    if (galleryItems && galleryItems.length > 0) {
      console.log(`Loading ${galleryItems.length} default pictures`);
      
      galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img || !img.src) return;
        
        const title = item.querySelector('.gallery-item-title');
        const desc = item.querySelector('.gallery-item-desc');
        const category = item.getAttribute('data-category') || 'scenery';
        
        defaultPics.push({
          id: `default_${index}`,
          name: title ? title.textContent : 'Sri Lanka',
          category: category.toLowerCase(),
          description: desc ? desc.textContent : 'Discover Sri Lanka',
          url: img.src
        });
      });
    }
    
    return defaultPics;
  }
  
  /**
   * 标准化图片数据
   */
  function normalizeImages(images) {
    return images.map(img => {
      // 确保URL字段存在
      let url = img.url || img.imageUrl || '';
      
      // 处理相对路径
      if (url && !url.match(/^(https?:\/\/|data:image|\/)/i) && !url.startsWith('images/')) {
        url = 'images/' + url;
      }
      
      // 标准化类别
      let category = (img.category || 'scenery').toLowerCase();
      
      // 获取不同分辨率的URL
      let thumbnailUrl = img.thumbnailUrl || img.urls?.thumbnail || img.thumbnail || url;
      let mediumUrl = img.mediumUrl || img.urls?.medium || img.medium || url;
      
      return {
        id: img.id || `img_${Math.floor(Math.random() * 10000)}`,
        name: img.name || img.title || 'Sri Lanka Image',
        category: category,
        description: img.description || '',
        url: url,
        thumbnailUrl: thumbnailUrl,
        mediumUrl: mediumUrl
      };
    }).filter(img => img.url && img.url.trim() !== '');
  }
  
  /**
   * 设置筛选按钮
   */
  function setupFilterButtons(pictures) {
    const buttons = document.querySelectorAll('.gallery-filter-btn');
    if (!buttons || buttons.length === 0) return;
    
    // 获取当前选中的类别（如果有）
    let currentActiveCategory = 'all';
    const activeButton = document.querySelector('.gallery-filter-btn.active');
    if (activeButton) {
      currentActiveCategory = activeButton.getAttribute('data-filter') || 'all';
    }
    
    // 移除所有按钮上的active类和事件处理
    buttons.forEach(btn => {
      btn.classList.remove('active');
      // 创建新的按钮元素以移除旧的事件监听
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);
      }
      
      // 确保所有按钮都有正确的data-filter属性
      if (!newBtn.hasAttribute('data-filter')) {
        const category = newBtn.textContent.trim().toLowerCase();
        newBtn.setAttribute('data-filter', category);
      }
      
      // 设置刚开始的激活状态 - 保持之前选择的类别
      if (newBtn.getAttribute('data-filter') === currentActiveCategory) {
        newBtn.classList.add('active');
      }
      
      // 添加单选点击事件
      newBtn.addEventListener('click', function() {
        // 确保单选行为 - 移除所有按钮的active类
        document.querySelectorAll('.gallery-filter-btn').forEach(b => {
          b.classList.remove('active');
        });
        
        // 仅将当前按钮设为active
        newBtn.classList.add('active');
        
        // 获取类别并显示对应图片
        const category = newBtn.getAttribute('data-filter');
        console.log(`Filter clicked: ${category}`);
        displayPicturesByCategory(pictures, category);
      });
    });
    
    // 如果没有激活的按钮，则默认第一个按钮（"All"）
    if (!document.querySelector('.gallery-filter-btn.active') && buttons.length > 0) {
      buttons[0].classList.add('active');
      const defaultCategory = buttons[0].getAttribute('data-filter') || 'all';
      displayPicturesByCategory(pictures, defaultCategory);
    }
  }
  
  /**
   * 按类别显示图片
   */
  function displayPicturesByCategory(pictures, category) {
    if (!pictures || pictures.length === 0) {
      showEmptyGallery();
      return;
    }
    
    // 筛选指定类别的图片
    const filteredPictures = category === 'all' 
      ? pictures 
      : pictures.filter(pic => pic.category === category);
    
    if (filteredPictures.length === 0) {
      showEmptyGallery();
      return;
    }
    
    // 显示筛选后的图片
    displayGallery(filteredPictures);
    
    // 启动图片轮播
    startCarousel(filteredPictures);
    
    // 更新URL哈希值（用于分享和刷新保持）
    if (category !== 'all') {
      window.location.hash = `explore/${category}`;
    } else {
      // 移除哈希值，但避免页面滚动
      const scrollPosition = window.scrollY;
      window.location.hash = 'explore';
      window.scrollTo(0, scrollPosition);
    }
  }
  
  /**
   * 显示图库
   */
  function displayGallery(pictures) {
    // 获取容器元素
    const featuredContainer = document.querySelector('.featured-image');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    const captionTitle = document.querySelector('.featured-title');
    const captionDesc = document.querySelector('.featured-desc');
    
    if (!featuredContainer || !thumbnailsContainer) return;
    
    // 清空容器
    featuredContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    
    // 创建主图显示区域
    const initialPicture = pictures[0];
    
    // 使用渐进式加载策略处理主图
    const featuredImageContainer = document.createElement('div');
    featuredImageContainer.className = 'gallery-image-container';
    featuredImageContainer.id = `featured-image-${initialPicture.id}`;
    featuredImageContainer.dataset.fullsize = initialPicture.url;
    featuredImageContainer.dataset.thumbnail = initialPicture.thumbnailUrl || initialPicture.url;
    
    // 先显示占位
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    featuredImageContainer.appendChild(placeholder);
    
    // 将容器添加到主图区域
    featuredContainer.appendChild(featuredImageContainer);
    
    // 更新标题和描述
    if (captionTitle) captionTitle.textContent = initialPicture.name;
    if (captionDesc) captionDesc.textContent = initialPicture.description;
    
    // 应用渐进式加载
    progressiveImageLoading(featuredImageContainer.id);
    
    // 创建缩略图
    pictures.forEach((picture, index) => {
      const thumbnailItem = document.createElement('div');
      thumbnailItem.className = 'thumbnail-item';
      thumbnailItem.dataset.index = index;
      if (index === 0) thumbnailItem.classList.add('active');
      
      // 创建缩略图容器以应用懒加载
      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'gallery-image';
      thumbContainer.dataset.src = picture.thumbnailUrl || picture.url;
      
      // 添加点击事件
      thumbnailItem.addEventListener('click', () => {
        // 更新选中状态
        document.querySelectorAll('.thumbnail-item').forEach(thumb => {
          thumb.classList.remove('active');
        });
        thumbnailItem.classList.add('active');
        
        // 更新主图
        featuredImageContainer.dataset.fullsize = picture.url;
        featuredImageContainer.dataset.thumbnail = picture.thumbnailUrl || picture.url;
        
        // 应用渐进式加载
        progressiveImageLoading(featuredImageContainer.id);
        
        // 更新标题和描述
        if (captionTitle) captionTitle.textContent = picture.name;
        if (captionDesc) captionDesc.textContent = picture.description;
        
        // 更新当前图片索引
        currentImageIndex = index;
      });
      
      // 添加到容器
      thumbnailItem.appendChild(thumbContainer);
      thumbnailsContainer.appendChild(thumbnailItem);
    });
    
    // 应用懒加载
    lazyLoadImages();
  }
  
  /**
   * 注册懒加载观察器
   */
  function registerLazyLoadObserver() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src) {
              // 创建新图片并设置加载完成事件
              const newImg = new Image();
              newImg.className = 'gallery-img';
              newImg.alt = img.dataset.alt || 'Sri Lanka Gallery Image';
              
              newImg.onload = function() {
                img.appendChild(newImg);
                img.classList.add('loaded');
                loadedImages.add(src);
              };
              
              newImg.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
      
      // 存储观察器以便可以重用
      window.galleryImageObserver = imageObserver;
    }
  }
  
  /**
   * 应用懒加载
   */
  function lazyLoadImages() {
    const images = document.querySelectorAll('.gallery-image[data-src]');
    
    if ('IntersectionObserver' in window && window.galleryImageObserver) {
      images.forEach(img => {
        window.galleryImageObserver.observe(img);
      });
    } else {
      // 回退到基本实现
      images.forEach(img => {
        const src = img.dataset.src;
        if (src) {
          const newImg = document.createElement('img');
          newImg.src = src;
          newImg.className = 'gallery-img';
          newImg.alt = img.dataset.alt || 'Sri Lanka Gallery Image';
          
          newImg.onload = function() {
            img.appendChild(newImg);
            img.classList.add('loaded');
            img.removeAttribute('data-src');
          };
        }
      });
    }
  }
  
  /**
   * 渐进式图片加载
   */
  function progressiveImageLoading(containerId) {
    const imgContainer = document.getElementById(containerId);
    if (!imgContainer) return;
    
    // 清空容器
    imgContainer.innerHTML = '';
    
    // 先加载缩略图
    const thumbImg = new Image();
    thumbImg.className = 'thumb-image';
    thumbImg.src = imgContainer.dataset.thumbnail;
    thumbImg.alt = 'Gallery preview image';
    
    thumbImg.onload = () => {
      imgContainer.appendChild(thumbImg);
      imgContainer.classList.add('thumb-loaded');
      
      // 然后加载高质量图片
      const fullImg = new Image();
      fullImg.className = 'full-image';
      fullImg.src = imgContainer.dataset.fullsize;
      fullImg.alt = 'Gallery full image';
      
      fullImg.onload = () => {
        if (imgContainer.contains(thumbImg)) {
          imgContainer.replaceChild(fullImg, thumbImg);
        } else {
          imgContainer.appendChild(fullImg);
        }
        imgContainer.classList.add('full-loaded');
      };
    };
    
    // 添加加载中指示器
    const loader = document.createElement('div');
    loader.className = 'image-loader';
    imgContainer.appendChild(loader);
  }
  
  /**
   * 显示空图库
   */
  function showEmptyGallery() {
    // 获取容器元素
    const featuredContainer = document.querySelector('.featured-image');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    const captionTitle = document.querySelector('.featured-title');
    const captionDesc = document.querySelector('.featured-desc');
    
    if (!featuredContainer || !thumbnailsContainer) return;
    
    // 清空容器
    featuredContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    
    // 显示空状态
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-gallery';
    emptyState.innerHTML = `
      <i class="fas fa-images"></i>
      <p>No images available for this category</p>
    `;
    
    featuredContainer.appendChild(emptyState);
    
    // 清空标题和描述
    if (captionTitle) captionTitle.textContent = '';
    if (captionDesc) captionDesc.textContent = '';
    
    // 停止轮播
    stopCarousel();
  }
  
  /**
   * 启动图片轮播
   */
  function startCarousel(pictures) {
    // 先停止现有轮播
    stopCarousel();
    
    // 如果没有足够的图片或用户禁用了自动播放，则不启动轮播
    if (!pictures || pictures.length < 2 || window.disableGalleryAutoplay) {
      return;
    }
    
    // 设置轮播间隔 (5秒)
    carouselInterval = setInterval(() => {
      // 计算下一张图片的索引
      currentImageIndex = (currentImageIndex + 1) % pictures.length;
      
      // 获取对应的缩略图并触发点击
      const nextThumbnail = document.querySelector(`.thumbnail-item[data-index="${currentImageIndex}"]`);
      if (nextThumbnail) {
        nextThumbnail.click();
      }
    }, 5000);
    
    // 监听页面可见性变化，在页面不可见时暂停轮播
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  
  /**
   * 停止图片轮播
   */
  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
    
    // 移除可见性监听器
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  
  /**
   * 处理页面可见性变化
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      // 页面不可见，暂停轮播
      if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
      }
    } else {
      // 页面可见，恢复轮播
      const activeCategory = document.querySelector('.gallery-filter-btn.active');
      if (activeCategory) {
        const category = activeCategory.getAttribute('data-filter');
        const pictures = getGalleryPictures();
        const filteredPictures = category === 'all' 
          ? pictures 
          : pictures.filter(pic => pic.category === category);
          
        startCarousel(filteredPictures);
      }
    }
  }
  
})(); 