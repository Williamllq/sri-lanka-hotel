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
    const pictures = getGalleryPictures();
    
    // 设置分类按钮事件
    setupFilterButtons(pictures);
    
    // 默认显示所有图片
    displayPicturesByCategory(pictures, 'all');
  }
  
  /**
   * 从存储中获取图片数据
   */
  function getGalleryPictures() {
    // 尝试从localStorage获取图片
    try {
      // 优先从adminPictures获取 - 这是管理员上传的图片
      const adminData = localStorage.getItem('adminPictures');
      if (adminData) {
        const adminPics = JSON.parse(adminData);
        if (Array.isArray(adminPics) && adminPics.length > 0) {
          console.log(`Found ${adminPics.length} pictures in adminPictures`);
          return normalizeImages(adminPics);
        }
      }
      
      // 尝试从sitePictures获取
      const siteData = localStorage.getItem('sitePictures');
      if (siteData) {
        const sitePics = JSON.parse(siteData);
        if (Array.isArray(sitePics) && sitePics.length > 0) {
          console.log(`Found ${sitePics.length} pictures in sitePictures`);
          return normalizeImages(sitePics);
        }
      }
    } catch (e) {
      console.error('Error loading pictures from storage:', e);
    }
    
    // 从默认图片中获取
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
      
      return {
        id: img.id || `img_${Math.floor(Math.random() * 10000)}`,
        name: img.name || img.title || 'Sri Lanka Image',
        category: category,
        description: img.description || '',
        url: url
      };
    }).filter(img => img.url && img.url.trim() !== '');
  }
  
  /**
   * 设置筛选按钮
   */
  function setupFilterButtons(pictures) {
    const buttons = document.querySelectorAll('.gallery-filter-btn');
    if (!buttons || buttons.length === 0) return;
    
    // 确保所有按钮都有正确的data-filter属性
    buttons.forEach(btn => {
      if (!btn.hasAttribute('data-filter')) {
        const category = btn.textContent.trim().toLowerCase();
        btn.setAttribute('data-filter', category);
      }
      
      // 移除旧的事件监听器并创建新的按钮
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });
    
    // 获取重新创建的按钮集合并添加点击事件
    const refreshedButtons = document.querySelectorAll('.gallery-filter-btn');
    refreshedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // 更新按钮状态 - 清除所有活动状态，只设置当前按钮为活动
        refreshedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 获取类别
        const category = btn.getAttribute('data-filter');
        displayPicturesByCategory(pictures, category);
      });
    });
    
    // 默认选中第一个按钮
    if (refreshedButtons.length > 0) {
      refreshedButtons[0].classList.add('active');
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
    
    // 过滤图片
    const filteredPics = category === 'all' 
      ? pictures 
      : pictures.filter(pic => pic.category === category);
    
    console.log(`Displaying ${filteredPics.length} pictures for category: ${category}`);
    
    if (filteredPics.length === 0) {
      showEmptyGallery();
      return;
    }
    
    // 显示图片
    displayGallery(filteredPics);
    
    // 启动轮播
    startCarousel(filteredPics);
  }
  
  /**
   * 显示图库
   */
  function displayGallery(pictures) {
    const featuredImage = document.querySelector('.featured-image');
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDesc = document.querySelector('.featured-desc');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    
    if (!featuredImage || !featuredTitle || !featuredDesc || !thumbnailsContainer) {
      console.error('Gallery containers not found');
      return;
    }
    
    // 显示第一张图片作为特色图片
    const mainPic = pictures[0];
    featuredImage.innerHTML = `<img src="${mainPic.url}" alt="${mainPic.name}" onerror="this.src='images/placeholder.jpg'">`;
    featuredTitle.textContent = mainPic.name;
    featuredDesc.textContent = mainPic.description || '';
    
    // 清空并重新填充缩略图
    thumbnailsContainer.innerHTML = '';
    
    // 显示缩略图
    pictures.forEach((pic, index) => {
      const thumbElem = document.createElement('div');
      thumbElem.className = 'gallery-thumbnail' + (index === 0 ? ' active' : '');
      thumbElem.innerHTML = `<img src="${pic.url}" alt="${pic.name}" onerror="this.src='images/placeholder.jpg'">`;
      
      // 点击缩略图时更新特色图片
      thumbElem.addEventListener('click', () => {
        // 更新活动状态
        document.querySelectorAll('.gallery-thumbnail').forEach(t => 
          t.classList.remove('active'));
        thumbElem.classList.add('active');
        
        // 更新特色图片
        featuredImage.innerHTML = `<img src="${pic.url}" alt="${pic.name}" onerror="this.src='images/placeholder.jpg'">`;
        featuredTitle.textContent = pic.name;
        featuredDesc.textContent = pic.description || '';
        
        // 重置轮播计时器
        stopCarousel();
        startCarousel(pictures);
      });
      
      thumbnailsContainer.appendChild(thumbElem);
    });
  }
  
  /**
   * 显示空图库提示
   */
  function showEmptyGallery() {
    const featuredImage = document.querySelector('.featured-image');
    const featuredTitle = document.querySelector('.featured-title');
    const featuredDesc = document.querySelector('.featured-desc');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    
    if (featuredImage) {
      featuredImage.innerHTML = `
        <div class="empty-category">
          <i class="fas fa-images"></i>
          <p>No images in this category</p>
        </div>
      `;
    }
    
    if (featuredTitle) featuredTitle.textContent = 'No Images Available';
    if (featuredDesc) featuredDesc.textContent = 'Please upload images in the admin panel';
    if (thumbnailsContainer) thumbnailsContainer.innerHTML = '';
  }
  
  // 轮播相关变量
  let carouselTimer = null;
  let currentIndex = 0;
  
  /**
   * 启动轮播
   */
  function startCarousel(pictures) {
    if (!pictures || pictures.length <= 1) return;
    
    // 清除现有定时器
    stopCarousel();
    
    // 创建新定时器
    carouselTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % pictures.length;
      const nextPic = pictures[currentIndex];
      
      const featuredImage = document.querySelector('.featured-image');
      const featuredTitle = document.querySelector('.featured-title');
      const featuredDesc = document.querySelector('.featured-desc');
      
      if (featuredImage && featuredTitle && featuredDesc) {
        featuredImage.innerHTML = `<img src="${nextPic.url}" alt="${nextPic.name}" onerror="this.src='images/placeholder.jpg'">`;
        featuredTitle.textContent = nextPic.name;
        featuredDesc.textContent = nextPic.description || '';
      }
      
      // 更新缩略图活动状态
      document.querySelectorAll('.gallery-thumbnail').forEach((thumb, idx) => {
        if (idx === currentIndex) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }, 5000);
  }
  
  /**
   * 停止轮播
   */
  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }
  
  // 将API暴露给全局作用域
  window.simpleGallery = {
    init: initGallery,
    getGalleryPictures: getGalleryPictures
  };
})(); 