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
    
    // 获取当前选中的类别
    let selectedCategory = 'all';
    const activeButton = document.querySelector('.gallery-filter-btn.active');
    if (activeButton) {
      selectedCategory = activeButton.getAttribute('data-filter') || 'all';
    }
    
    // 显示对应类别的图片
    displayPicturesByCategory(pictures, selectedCategory);
  }
  
  /**
   * 从存储中获取图片数据
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
    
    // 从隐藏的gallery-grid中获取图片 (修正路径)
    const galleryItems = [
        { name: "Nine Arch Bridge", category: "scenery", description: "Iconic railway bridge in Ella, surrounded by lush tea plantations", url: "images/gallery/scenic-mountains.jpg" },
        { name: "Temple of the Sacred Tooth", category: "culture", description: "Ancient Buddhist temple in Kandy housing Buddha's sacred tooth relic", url: "images/gallery/temple.jpg" },
        { name: "Unawatuna Beach", category: "beach", description: "Pristine golden beaches with crystal clear waters", url: "images/gallery/beach.jpg" },
        { name: "Yala National Park", category: "wildlife", description: "Home to the highest density of leopards in the world", url: "images/gallery/wildlife.jpg" },
        { name: "Local Cuisine", category: "food", description: "Discover the rich flavors of authentic Sri Lankan dishes", url: "images/gallery/food.jpg" },
        { name: "Sigiriya Rock Fortress", category: "scenery", description: "Ancient palace and fortress complex with stunning views", url: "images/gallery/sri-lanka-default.jpg" }
    ];

    if (galleryItems && galleryItems.length > 0) {
      console.log(`Loading ${galleryItems.length} default pictures from predefined list`);
      
      galleryItems.forEach((item, index) => {
        defaultPics.push({
          id: `default_${index}_${Date.now()}`, // Ensure unique ID
          name: item.name || 'Sri Lanka',
          category: (item.category || 'scenery').toLowerCase(),
          description: item.description || 'Discover Sri Lanka',
          url: item.url // Already prefixed
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
    const featuredImageContainer = document.querySelector('.featured-image-container .featured-image');
    const featuredTitle = document.querySelector('.featured-caption .featured-title');
    const featuredDesc = document.querySelector('.featured-caption .featured-desc');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    
    if (!featuredImageContainer || !featuredTitle || !featuredDesc || !thumbnailsContainer) {
      console.error('Gallery containers not found. Featured Image Container:', featuredImageContainer, 'Title:', featuredTitle, 'Desc:', featuredDesc, 'Thumbnails:', thumbnailsContainer);
      showEmptyGallery(); // Attempt to show empty state even if some parts are missing
      return;
    }
    
    // 显示第一张图片作为特色图片
    const mainPic = pictures[0];
    if (mainPic && mainPic.url) {
        featuredImageContainer.innerHTML = `<img src="${mainPic.url}" alt="${mainPic.name || 'Featured Image'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='images/placeholder.jpg'; console.error('Failed to load featured image: ${mainPic.url}')">`;
        featuredTitle.textContent = mainPic.name || 'Image';
        featuredDesc.textContent = mainPic.description || '';
    } else {
        console.warn('First picture for gallery is invalid or missing URL:', mainPic);
        showEmptyGallery(); // Show empty state if first pic is invalid
        return;
    }
    
    // 清空并重新填充缩略图
    thumbnailsContainer.innerHTML = '';
    
    // 显示缩略图
    pictures.forEach((pic, index) => {
      if (!pic || !pic.url) {
          console.warn('Skipping invalid picture for thumbnail:', pic);
          return;
      }
      const thumbElem = document.createElement('div');
      thumbElem.className = 'gallery-thumbnail' + (index === 0 ? ' active' : '');
      thumbElem.innerHTML = `<img src="${pic.url}" alt="${pic.name || 'Thumbnail'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='images/placeholder.jpg'; console.warn('Failed to load thumbnail: ${pic.url}')">`;
      
      // 点击缩略图时更新特色图片
      thumbElem.addEventListener('click', () => {
        // 更新活动状态
        document.querySelectorAll('.gallery-thumbnail').forEach(t => 
          t.classList.remove('active'));
        thumbElem.classList.add('active');
        
        // 更新特色图片
        featuredImageContainer.innerHTML = `<img src="${pic.url}" alt="${pic.name || 'Featured Image'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='images/placeholder.jpg'; console.error('Failed to load featured image on click: ${pic.url}')">`;
        featuredTitle.textContent = pic.name || 'Image';
        featuredDesc.textContent = pic.description || '';
        
        // 重置轮播计时器
        stopCarousel();
        startCarousel(pictures, index); // Pass current index to restart carousel from this image
      });
      
      thumbnailsContainer.appendChild(thumbElem);
    });
     // Ensure the first thumbnail is marked active
    if (thumbnailsContainer.firstChild) {
        thumbnailsContainer.firstChild.classList.add('active');
    }
  }
  
  /**
   * 显示空图库提示
   */
  function showEmptyGallery() {
    const featuredImageContainer = document.querySelector('.featured-image-container .featured-image');
    const featuredTitle = document.querySelector('.featured-caption .featured-title');
    const featuredDesc = document.querySelector('.featured-caption .featured-desc');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    
    console.log('Showing empty gallery state.');

    if (featuredImageContainer) {
      featuredImageContainer.innerHTML = `
        <div class="empty-gallery-placeholder" style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background-color:#f0f0f0;">
          <img src="images/placeholder.jpg" alt="No image available" style="max-width:80%; max-height:200px; object-fit:contain; opacity:0.5;">
          <p style="color:#888; margin-top:15px; font-size:1rem;">No images currently available in this category.</p>
        </div>
      `;
    }
    
    if (featuredTitle) featuredTitle.textContent = 'No Images Available';
    if (featuredDesc) featuredDesc.textContent = 'Please check back later or select another category.';
    if (thumbnailsContainer) thumbnailsContainer.innerHTML = '<p style="text-align:center; color:#888; width:100%;">No thumbnails to display.</p>';
  }
  
  // 轮播相关变量
  let carouselTimer = null;
  let currentIndex = 0;
  
  /**
   * 启动轮播
   */
  function startCarousel(pictures, startIndex = 0) {
    if (!pictures || pictures.length <= 1) return;
    
    // 清除现有定时器
    stopCarousel();
    
    currentIndex = startIndex; // Start from the provided index

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