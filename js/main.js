// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查 translations 是否正确加载
    if (typeof translations === 'undefined') {
        console.error('translations.js not loaded!');
        // Continue anyway to avoid breaking the site
    }
    
    // 注意：语言切换逻辑已移至 language-switcher.js
    
    // 导航菜单响应式处理
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // 滚动时导航栏效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Initialize the Discover More tabs
    initDiscoverTabs();
    
    // Display all images from admin in the gallery section
    displayAdminImages();
    
    // Initialize testimonials
    initTestimonials();
    
    // Initialize quick search
    initQuickSearch();
});

// Initialize the tabs in the Discover More section
function initDiscoverTabs() {
    const tabs = document.querySelectorAll('.discover-tab');
    const contents = document.querySelectorAll('.discover-content');
    
    if (tabs.length === 0 || contents.length === 0) {
        console.warn("Discover tabs or content not found");
        return;
    }
    
    console.log("Initializing discover tabs...");
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the tab data attribute and find matching content
            const tabId = this.getAttribute('data-tab');
            const content = document.getElementById(tabId + '-content');
            
            if (content) {
                content.classList.add('active');
                console.log(`Switched to ${tabId} tab`);
            } else {
                console.warn(`Content with ID ${tabId}-content not found`);
            }
        });
    });
    
    // Initialize "Load More" buttons
    const loadMoreButtons = document.querySelectorAll('.load-more-btn');
    
    loadMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            // This is where you would implement loading more content
            // For example, through an API call or revealing hidden content
            console.log("Load more button clicked");
            alert("More content would load here. This feature will be implemented with actual content.");
        });
    });
    
    // Initialize video thumbnails to show a modal or play video
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoTitle = this.parentElement.querySelector('h4').textContent;
            console.log(`Video clicked: ${videoTitle}`);
            alert(`Video "${videoTitle}" would play here. This feature will be implemented with actual video content.`);
        });
    });
}

// Display images uploaded from admin dashboard in the website gallery
function displayAdminImages() {
    const gallerySection = document.querySelector('.gallery-grid');
    if (!gallerySection) {
        console.warn("Gallery grid not found, skipping image display");
        return;
    }
    
    console.log("Initializing gallery with admin images...");
    
    // 尝试从多个来源加载图片数据
    let storedPictures = localStorage.getItem('sitePictures');
    
    if (!storedPictures) {
        console.log("No sitePictures found, trying adminPictures");
        storedPictures = localStorage.getItem('adminPictures');
    }
    
    // 如果两者都没有找到，创建一些模拟数据
    if (!storedPictures) {
        console.log("No uploaded images found, using default gallery");
        
        // 检查DOM中是否已有静态画廊项目
        const existingItems = gallerySection.querySelectorAll('.gallery-item');
        if (existingItems.length > 0) {
            console.log(`Found ${existingItems.length} existing static gallery items`);
            
            // 收集现有的静态图片项到一个数组，以便同步到localStorage
            const existingPictures = Array.from(existingItems).map(item => {
                const img = item.querySelector('img');
                const title = item.querySelector('.gallery-item-title');
                const desc = item.querySelector('.gallery-item-desc');
                const category = item.getAttribute('data-category');
                
                return {
                    id: 'default_' + Math.random().toString(36).substr(2, 9),
                    name: title ? title.textContent : 'Beautiful Sri Lanka',
                    category: category || 'scenery',
                    description: desc ? desc.textContent : '',
                    url: img ? img.src : '',
                    uploadDate: new Date().toISOString()
                };
            });
            
            // 存储这些静态项目，以供管理员界面使用
            if (existingPictures.length > 0) {
                localStorage.setItem('sitePictures', JSON.stringify(existingPictures));
                console.log(`Saved ${existingPictures.length} static gallery items to localStorage`);
                return; // 保持静态项目
            }
        }
        return;
    }
    
    try {
        const pictures = JSON.parse(storedPictures);
        if (!Array.isArray(pictures) || pictures.length === 0) {
            console.log("No valid pictures array found");
            return;
        }
        
        console.log(`Found ${pictures.length} images to display in gallery`);
        
        // 清空现有静态画廊项目
        gallerySection.innerHTML = '';
        
        // 添加每张图片到画廊
        pictures.forEach(picture => {
            // 处理不同的数据格式（管理员和前端格式可能不同）
            const imageUrl = picture.url || picture.imageUrl;
            const imageName = picture.name || 'Sri Lanka Image';
            const imageDesc = picture.description || '';
            const imageCategory = picture.category || 'scenery';
            
            if (!imageUrl) {
                console.warn("Missing image URL, skipping:", picture);
                return;
            }
            
            // 创建画廊项
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', imageCategory);
            
            // 创建图片容器
            galleryItem.innerHTML = `
                <img src="${imageUrl}" alt="${imageName}" class="gallery-image">
                <div class="gallery-item-info">
                    <h3 class="gallery-item-title">${imageName}</h3>
                    <p class="gallery-item-desc">${imageDesc}</p>
                </div>
            `;
            
            // 添加到画廊
            gallerySection.appendChild(galleryItem);
        });
        
        // 确保前端和管理员存储都有相同的图片数据
        syncImageStorages();
        
        // 添加过滤功能
        const categoryButtons = document.querySelectorAll('.gallery-filter-btn');
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const category = this.getAttribute('data-filter');
                    
                    // 移除所有按钮的active类
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    // 添加active类到点击的按钮
                    this.classList.add('active');
                    
                    // 显示所有项或按类别过滤
                    const items = document.querySelectorAll('.gallery-item');
                    items.forEach(item => {
                        if (category === 'all' || item.getAttribute('data-category') === category) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
            
            // 设置默认活动类别
            const defaultCategory = categoryButtons[1]; // wildlife
            if (defaultCategory) {
                defaultCategory.click();
            }
        }
        
        // 触发自定义事件通知其他脚本画廊已更新
        const galleryUpdatedEvent = new CustomEvent('galleryUpdated');
        document.dispatchEvent(galleryUpdatedEvent);
        
    } catch (error) {
        console.error("Error displaying admin images:", error);
    }
}

// 同步管理员和前端的图片存储
function syncImageStorages() {
    console.log("Syncing image storages between admin and frontend...");
    
    try {
        // 获取管理员和前端图片数据
        const adminPicturesStr = localStorage.getItem('adminPictures');
        const sitePicturesStr = localStorage.getItem('sitePictures');
        
        // 解析数据
        let adminPictures = adminPicturesStr ? JSON.parse(adminPicturesStr) : [];
        let sitePictures = sitePicturesStr ? JSON.parse(sitePicturesStr) : [];
        
        // 确保是数组
        if (!Array.isArray(adminPictures)) adminPictures = [];
        if (!Array.isArray(sitePictures)) sitePictures = [];
        
        // 如果管理员图片为空但前端有图片，复制到管理员
        if (adminPictures.length === 0 && sitePictures.length > 0) {
            console.log(`Copying ${sitePictures.length} images from site to admin storage`);
            
            // 转换为管理员格式
            const adminFormattedPictures = sitePictures.map(sitePic => {
                return {
                    id: sitePic.id || ('pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
                    name: sitePic.name || 'Untitled Image',
                    category: sitePic.category || 'scenery',
                    description: sitePic.description || '',
                    imageUrl: sitePic.url || sitePic.imageUrl,
                    uploadDate: sitePic.uploadDate || new Date().toISOString()
                };
            });
            
            localStorage.setItem('adminPictures', JSON.stringify(adminFormattedPictures));
        }
        
        // 如果前端图片为空但管理员有图片，复制到前端
        if (sitePictures.length === 0 && adminPictures.length > 0) {
            console.log(`Copying ${adminPictures.length} images from admin to site storage`);
            
            // 转换为前端格式
            const siteFormattedPictures = adminPictures.map(adminPic => {
                return {
                    id: adminPic.id,
                    name: adminPic.name,
                    category: adminPic.category,
                    description: adminPic.description,
                    url: adminPic.imageUrl,
                    uploadDate: adminPic.uploadDate
                };
            });
            
            localStorage.setItem('sitePictures', JSON.stringify(siteFormattedPictures));
        }
        
        // 如果两者都有图片，合并不重复的
        if (sitePictures.length > 0 && adminPictures.length > 0) {
            // 找出管理员中不在前端的图片
            const adminOnlyPictures = adminPictures.filter(adminPic => {
                return !sitePictures.some(sitePic => 
                    (sitePic.id === adminPic.id) || 
                    (sitePic.url === adminPic.imageUrl)
                );
            });
            
            // 找出前端中不在管理员的图片
            const siteOnlyPictures = sitePictures.filter(sitePic => {
                return !adminPictures.some(adminPic => 
                    (adminPic.id === sitePic.id) || 
                    (adminPic.imageUrl === sitePic.url)
                );
            });
            
            // 如果有差异，更新两边
            if (adminOnlyPictures.length > 0) {
                console.log(`Adding ${adminOnlyPictures.length} admin-only images to site storage`);
                
                // 转换为前端格式并添加
                const newSitePictures = adminOnlyPictures.map(adminPic => {
                    return {
                        id: adminPic.id,
                        name: adminPic.name,
                        category: adminPic.category,
                        description: adminPic.description,
                        url: adminPic.imageUrl,
                        uploadDate: adminPic.uploadDate
                    };
                });
                
                const mergedSitePictures = [...sitePictures, ...newSitePictures];
                localStorage.setItem('sitePictures', JSON.stringify(mergedSitePictures));
            }
            
            if (siteOnlyPictures.length > 0) {
                console.log(`Adding ${siteOnlyPictures.length} site-only images to admin storage`);
                
                // 转换为管理员格式并添加
                const newAdminPictures = siteOnlyPictures.map(sitePic => {
                    return {
                        id: sitePic.id || ('pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
                        name: sitePic.name || 'Untitled Image',
                        category: sitePic.category || 'scenery',
                        description: sitePic.description || '',
                        imageUrl: sitePic.url,
                        uploadDate: sitePic.uploadDate || new Date().toISOString()
                    };
                });
                
                const mergedAdminPictures = [...adminPictures, ...newAdminPictures];
                localStorage.setItem('adminPictures', JSON.stringify(mergedAdminPictures));
            }
        }
        
        console.log("Image storage synchronization complete");
    } catch (error) {
        console.error("Error syncing image storages:", error);
    }
}

// 初始化轮播功能
function initCarousel() {
    console.log("Initializing carousel...");
    const carousel = document.querySelector('.image-carousel');
    if (!carousel) {
        console.warn("Carousel element not found");
        return;
    }
    
    const track = carousel.querySelector('.carousel-track');
    if (!track) {
        console.warn("Carousel track element not found");
        return;
    }
    
    // Load carousel images from localStorage
    const storedCarouselImages = localStorage.getItem('siteCarouselImages');
    console.log("Checking for stored carousel images...");
    
    // Default images in case no localStorage data or error occurs
    const defaultImages = [
        { id: 1, name: 'Sigiriya Rock', category: 'scenery', url: 'images/sigiriya-rock.jpg' },
        { id: 4, name: 'Sri Lankan Elephant', category: 'wildlife', url: 'images/elephant.jpg' },
        { id: 5, name: 'Train to Ella', category: 'transport', url: 'images/train-ella.jpg' }
    ];
    
    // If we have stored images, replace the carousel slides with them
    let usedImages = defaultImages;
    
    if (storedCarouselImages) {
        try {
            const carouselImages = JSON.parse(storedCarouselImages);
            console.log("Found carousel images in localStorage:", carouselImages.length);
            
            // Use stored images if available and valid
            if (carouselImages && carouselImages.length > 0) {
                usedImages = carouselImages;
            } else {
                console.warn("No valid carousel images found in localStorage, using defaults");
            }
        } catch (e) {
            console.error('Error parsing carousel images from localStorage:', e);
            console.log("Using default carousel images instead");
        }
    } else {
        console.log("No carousel images found in localStorage, using defaults");
    }
    
    // Clear existing slides
    console.log("Clearing existing slides and adding", usedImages.length, "slides");
    track.innerHTML = '';
    
    // Add slides from our image source (localStorage or defaults)
    usedImages.forEach((image, index) => {
        console.log(`Adding slide ${index + 1}:`, image.name || 'Unnamed image');
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        // Create container for image and caption
        const container = document.createElement('div');
        container.className = 'carousel-image-container';
        
        const img = document.createElement('img');
        
        // Handle both data URLs (from localStorage) and regular image paths
        img.src = image.url;
        img.alt = image.name || 'Carousel Image';
        
        // Error handling for image loading
        img.onerror = function() {
            console.error(`Failed to load image: ${image.url.substring(0, 100)}...`);
            this.src = 'images/placeholder.jpg';
            this.alt = 'Image not available';
        };
        
        // Add caption with description if available
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.innerHTML = `
            <h3>${image.name || 'Sri Lanka Image'}</h3>
            ${image.description ? `<p>${image.description}</p>` : ''}
        `;
        
        container.appendChild(img);
        container.appendChild(caption);
        slide.appendChild(container);
        track.appendChild(slide);
    });
    
    // Check if we have slides after possible replacement
    const slides = Array.from(track.children);
    console.log("Final carousel slide count:", slides.length);
    
    if (slides.length === 0) {
        console.warn("No slides found in carousel after setup");
        return;
    }
    
    const nextButton = carousel.querySelector('.carousel-button.next');
    const prevButton = carousel.querySelector('.carousel-button.prev');
    
    let currentIndex = 0;
    
    // 根据视窗宽度调整可见幻灯片数量
    function updateSlidesToShow() {
        return window.innerWidth < 768 ? 1 : 
               window.innerWidth < 1024 ? 2 : 3;
    }
    
    // 设置初始状态
    function setupCarousel() {
        try {
            // 计算每个幻灯片宽度
            const carouselWidth = carousel.clientWidth - parseInt(window.getComputedStyle(carousel).paddingLeft) - parseInt(window.getComputedStyle(carousel).paddingRight);
            const slideWidth = carouselWidth / updateSlidesToShow();
            
            // 设置每个幻灯片宽度
            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });
            
            // 移动到起始位置
            moveToSlide(currentIndex);
            console.log("Carousel setup complete. Width:", carouselWidth, "px, Slide width:", slideWidth, "px");
        } catch (error) {
            console.error("Error setting up carousel:", error);
        }
    }
    
    // 移动幻灯片
    function moveToSlide(index) {
        try {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${index * slideWidth}px)`;
            currentIndex = index;
            
            // 更新按钮状态
            updateButtonsState();
        } catch (error) {
            console.error("Error moving carousel slide:", error);
        }
    }
    
    // 更新按钮状态
    function updateButtonsState() {
        if (!prevButton || !nextButton) {
            console.warn("Carousel navigation buttons not found");
            return;
        }
        
        prevButton.disabled = currentIndex === 0;
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        
        const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
        nextButton.disabled = currentIndex >= maxIndex;
        nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
    }
    
    // 监听按钮点击
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const maxIndex = Math.max(0, slides.length - updateSlidesToShow());
            if (currentIndex < maxIndex) {
                moveToSlide(currentIndex + 1);
            }
        });
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            }
        });
    }
    
    // 监听窗口大小改变
    window.addEventListener('resize', setupCarousel);
    
    // 初始化
    setupCarousel();
    console.log("Carousel initialization complete");
}

// Function to initialize the Discover More section
function initDiscoverMore() {
    console.log('Initializing Discover More section...');
    
    // Initialize the tabs
    const discoverTabs = document.querySelectorAll('.discover-tab');
    const discoverContents = document.querySelectorAll('.discover-content');
    
    discoverTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and content
            discoverTabs.forEach(t => t.classList.remove('active'));
            discoverContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load content from localStorage
    loadArticles();
    loadVideos();
    loadLinks();
}

// Load articles from localStorage
function loadArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (!articlesGrid) return;
    
    const articles = JSON.parse(localStorage.getItem('siteArticles') || '[]');
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = '<p class="no-content">No articles available yet. Check back soon!</p>';
        return;
    }
    
    articlesGrid.innerHTML = '';
    
    // Get the 6 most recent articles
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayArticles = articles.slice(0, 6);
    
    displayArticles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'discover-card article-card';
        
        const articleUrl = article.externalLink || '#';
        const targetAttr = article.externalLink ? ' target="_blank"' : '';
        
        articleCard.innerHTML = `
            <a href="${articleUrl}"${targetAttr}>
                <div class="discover-card-img">
                    <img src="${article.imageUrl || 'images/placeholder-article.jpg'}" alt="${article.title}">
                </div>
                <div class="discover-card-content">
                    <h3>${article.title}</h3>
                    <p>${article.description.substring(0, 120)}${article.description.length > 120 ? '...' : ''}</p>
                    <span class="read-more">Read More</span>
                </div>
            </a>
        `;
        
        articlesGrid.appendChild(articleCard);
    });
    
    // Add "Load More" button if we have more articles
    if (articles.length > 6) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More Articles';
        loadMoreBtn.addEventListener('click', function() {
            // In a real application, you would load more articles here
            alert('Load more functionality would be implemented here in a full application');
        });
        articlesGrid.parentElement.appendChild(loadMoreBtn);
    }
}

// Load videos from localStorage
function loadVideos() {
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) return;
    
    const videos = JSON.parse(localStorage.getItem('siteVideos') || '[]');
    
    if (videos.length === 0) {
        videosGrid.innerHTML = '<p class="no-content">No videos available yet. Check back soon!</p>';
        return;
    }
    
    videosGrid.innerHTML = '';
    
    // Get the 6 most recent videos
    videos.sort((a, b) => new Date(b.date) - new Date(a.date));
    const displayVideos = videos.slice(0, 6);
    
    displayVideos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'discover-card video-card';
        
        // Create a YouTube thumbnail URL if it's a YouTube video
        let thumbnailUrl = video.thumbnailUrl;
        if (!thumbnailUrl && video.videoUrl.includes('youtube.com')) {
            const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }
        }
        
        videoCard.innerHTML = `
            <div class="discover-card-img" data-video-url="${video.videoUrl}">
                <img src="${thumbnailUrl || 'images/placeholder-video.jpg'}" alt="${video.title}">
                <div class="play-button">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="discover-card-content">
                <h3>${video.title}</h3>
                <p>${video.description.substring(0, 120)}${video.description.length > 120 ? '...' : ''}</p>
            </div>
        `;
        
        // Add click handler to play the video
        const videoImg = videoCard.querySelector('.discover-card-img');
        videoImg.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-video-url');
            
            // Simple modal for playing the video
            const videoModal = document.createElement('div');
            videoModal.className = 'video-modal';
            
            let videoEmbed;
            if (videoUrl.includes('youtube.com')) {
                const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    videoEmbed = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else if (videoUrl.includes('vimeo.com')) {
                const videoId = videoUrl.split('vimeo.com/')[1];
                if (videoId) {
                    videoEmbed = `<iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else {
                videoEmbed = `<video controls autoplay><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }
            
            videoModal.innerHTML = `
                <div class="video-modal-content">
                    <span class="close-video">&times;</span>
                    <div class="video-container">
                        ${videoEmbed}
                    </div>
                </div>
            `;
            
            document.body.appendChild(videoModal);
            
            // Close modal functionality
            const closeBtn = videoModal.querySelector('.close-video');
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(videoModal);
            });
            
            // Close by clicking outside
            videoModal.addEventListener('click', function(e) {
                if (e.target === videoModal) {
                    document.body.removeChild(videoModal);
                }
            });
        });
        
        videosGrid.appendChild(videoCard);
    });
    
    // Add "Load More" button if we have more videos
    if (videos.length > 6) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More Videos';
        loadMoreBtn.addEventListener('click', function() {
            // In a real application, you would load more videos here
            alert('Load more functionality would be implemented here in a full application');
        });
        videosGrid.parentElement.appendChild(loadMoreBtn);
    }
}

// Load links from localStorage
function loadLinks() {
    const linksGrid = document.getElementById('linksGrid');
    if (!linksGrid) return;
    
    const links = JSON.parse(localStorage.getItem('siteLinks') || '[]');
    
    if (links.length === 0) {
        linksGrid.innerHTML = '<p class="no-content">No links available yet. Check back soon!</p>';
        return;
    }
    
    linksGrid.innerHTML = '';
    
    // Sort by date, newest first
    links.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    links.forEach(link => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';
        
        linkCard.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                <i class="${link.icon || 'fas fa-link'}"></i>
                <div class="link-content">
                    <h3>${link.title}</h3>
                    <p>${link.description}</p>
                </div>
                <i class="fas fa-external-link-alt external-icon"></i>
            </a>
        `;
        
        linksGrid.appendChild(linkCard);
    });
}

// Initialize transport price calculation functionality
function initTransportCalculation() {
    console.log('Initializing transport calculation...');
    
    const calculateButton = document.getElementById('calculateFareBtn');
    if (!calculateButton) return;
    
    calculateButton.addEventListener('click', calculatePrice);
}

// Function to calculate the transportation price
function calculatePrice() {
    // Get the inputs
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const tripDate = document.getElementById('tripDate').value;
    const tripTime = document.getElementById('tripTime').value;
    const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value || 'sedan';
    
    if (!pickupLocation || !destinationLocation) {
        alert('Please enter both pickup and destination locations');
        return;
    }
    
    // Get distance (in a real app, this would come from the Maps API)
    // For demo purposes, we'll use the distance from the map.js or a fallback value
    let distance = window.calculatedDistance || 10; // km
    
    // Get transport settings from localStorage
    const defaultSettings = {
        baseFare: 30,
        ratePerKm: 0.5,
        rushHourMultiplier: 1.5,
        nightMultiplier: 1.3,
        weekendMultiplier: 1.2,
        vehicleRates: {
            sedan: 1.0,
            suv: 1.5,
            van: 1.8,
            luxury: 2.2
        }
    };
    
    const settings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
    
    // Calculate base price
    let price = settings.baseFare + (distance * settings.ratePerKm);
    
    // Apply vehicle type multiplier
    price *= settings.vehicleRates[vehicleType];
    
    // Check if rush hour, night time, or weekend
    if (tripDate && tripTime) {
        const tripDateTime = new Date(`${tripDate}T${tripTime}`);
        const hour = tripDateTime.getHours();
        const day = tripDateTime.getDay();
        
        // Rush hour: 7-9 AM or 4-6 PM on weekdays
        if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
            if (day >= 1 && day <= 5) {
                price *= settings.rushHourMultiplier;
            }
        }
        
        // Night time: 10 PM - 6 AM
        if (hour >= 22 || hour <= 6) {
            price *= settings.nightMultiplier;
        }
        
        // Weekend: Saturday and Sunday
        if (day === 0 || day === 6) {
            price *= settings.weekendMultiplier;
        }
    }
    
    // Display the result
    const resultElement = document.getElementById('fareResult');
    if (resultElement) {
        resultElement.textContent = `Estimated fare: $${price.toFixed(2)}`;
        resultElement.style.display = 'block';
    }
    
    return price;
}

// Call initialization functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the navigation menu
    initNavigation();
    
    // Initialize the image showcase carousel
    initImageCarousel();
    
    // Initialize gallery images from localStorage
    displayAdminImages();
    
    // Initialize the discover more tabs and content
    initDiscoverMore();
    
    // Initialize transport price calculation
    initTransportCalculation();
    
    // Initialize modals and feedback
    initModals();
    
    // Initialize the animation on scroll
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
});

// Initialize all modals and feedback functionality
function initModals() {
    // Feedback modal
    const feedbackModal = document.getElementById('feedbackModal');
    const showFeedbackBtn = document.getElementById('showFeedback');
    const closeFeedbackBtn = feedbackModal ? feedbackModal.querySelector('.close-modal') : null;
    
    if (feedbackModal && showFeedbackBtn) {
        // Show feedback modal when clicking the button
        showFeedbackBtn.addEventListener('click', function() {
            feedbackModal.classList.add('active');
        });
        
        // Close modal when clicking the close button
        if (closeFeedbackBtn) {
            closeFeedbackBtn.addEventListener('click', function() {
                feedbackModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside the modal content
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('active');
            }
        });
    }
    
    // Handle feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('feedbackName').value;
            const country = document.getElementById('feedbackCountry').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
            const feedback = document.getElementById('feedbackText').value;
            
            // In a real app, you would send this data to a server
            console.log('Feedback submitted:', { name, country, rating, feedback });
            
            // Show success message
            alert('Thank you for your feedback!');
            
            // Reset form and close modal
            feedbackForm.reset();
            feedbackModal.classList.remove('active');
        });
    }
    
    // Map modal
    const mapModal = document.getElementById('mapModal');
    const closeMapBtn = mapModal ? mapModal.querySelector('.close-modal') : null;
    
    if (mapModal && closeMapBtn) {
        closeMapBtn.addEventListener('click', function() {
            mapModal.classList.remove('active');
        });
        
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                mapModal.classList.remove('active');
            }
        });
    }
}

// Initialize testimonials grid and slider
function initTestimonials() {
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    
    if (!dots.length || !testimonialCards.length) {
        console.warn('Testimonials elements not found');
        return;
    }

    let currentSlide = 0;
    const totalSlides = testimonialCards.length;

    // Function to update the active slide
    function showSlide(index) {
        // Hide all testimonials (for mobile view)
        testimonialCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show the current testimonial
        testimonialCards[index].style.display = 'flex';
        
        // Update the active dot
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        dots[index].classList.add('active');
        currentSlide = index;
    }

    // Set up dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Set up prev/next buttons
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            let newIndex = currentSlide - 1;
            if (newIndex < 0) {
                newIndex = totalSlides - 1;
            }
            showSlide(newIndex);
        });

        nextButton.addEventListener('click', () => {
            let newIndex = currentSlide + 1;
            if (newIndex >= totalSlides) {
                newIndex = 0;
            }
            showSlide(newIndex);
        });
    }

    // Initialize the first slide for mobile view
    // Desktop view shows all cards in a grid
    if (window.innerWidth <= 768) {
        showSlide(0);
    }

    // Update on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            // On mobile, make sure a slide is active
            showSlide(currentSlide);
        } else {
            // On desktop, show all testimonials in grid
            testimonialCards.forEach(card => {
                card.style.display = 'flex';
            });
        }
    });
}

// Initialize quick search functionality
function initQuickSearch() {
    const searchForm = document.getElementById('quickSearchForm');
    const searchInput = document.getElementById('quickSearchInput');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchQuery = searchInput.value.trim().toLowerCase();
        if (!searchQuery) return;
        
        // Determine search type based on keywords
        if (searchQuery.includes('hotel') || searchQuery.includes('stay') || searchQuery.includes('accommodation')) {
            // Redirect to hotels page with search query
            window.location.href = `hotels.html?search=${encodeURIComponent(searchQuery)}`;
        } else if (searchQuery.includes('transport') || searchQuery.includes('car') || searchQuery.includes('taxi') || searchQuery.includes('driver')) {
            // Scroll to transport section
            document.getElementById('transport')?.scrollIntoView({ behavior: 'smooth' });
            
            // Pre-fill transport search if it includes location
            const locations = ['colombo', 'kandy', 'galle', 'ella', 'sigiriya', 'yala', 'mirissa', 'nuwara eliya'];
            const foundLocation = locations.find(loc => searchQuery.includes(loc));
            if (foundLocation) {
                const pickupInput = document.getElementById('pickupLocation');
                if (pickupInput) {
                    pickupInput.value = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
                }
            }
        } else {
            // Search in available content
            performGeneralSearch(searchQuery);
        }
    });
    
    // Add search suggestions (optional enhancement)
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length > 2) {
            // You could show suggestions here
            showSearchSuggestions(query);
        }
    });
}

// Perform general search across the site
function performGeneralSearch(query) {
    const results = [];
    
    // Search in hotels
    const hotels = JSON.parse(localStorage.getItem('siteHotels') || '[]');
    hotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(query) || 
            hotel.location.toLowerCase().includes(query) ||
            hotel.description.toLowerCase().includes(query)) {
            results.push({
                type: 'hotel',
                title: hotel.name,
                description: hotel.description,
                link: `hotels.html?hotelId=${hotel.id}`
            });
        }
    });
    
    // Search in locations
    const popularLocations = [
        { name: 'Colombo', description: 'Capital city with modern attractions' },
        { name: 'Kandy', description: 'Cultural capital with Temple of the Tooth' },
        { name: 'Galle', description: 'Historic fort city by the sea' },
        { name: 'Ella', description: 'Mountain town with scenic train rides' },
        { name: 'Sigiriya', description: 'Ancient rock fortress' },
        { name: 'Yala', description: 'National park with wildlife safaris' }
    ];
    
    popularLocations.forEach(location => {
        if (location.name.toLowerCase().includes(query) || 
            location.description.toLowerCase().includes(query)) {
            results.push({
                type: 'location',
                title: location.name,
                description: location.description,
                link: '#explore'
            });
        }
    });
    
    // Display results
    if (results.length > 0) {
        displaySearchResults(results);
    } else {
        alert(`No results found for "${query}". Try searching for hotels, transport, or popular destinations.`);
    }
}

// Display search results in a modal or redirect
function displaySearchResults(results) {
    // For now, just show the first result
    if (results.length > 0) {
        const firstResult = results[0];
        if (firstResult.type === 'hotel') {
            window.location.href = firstResult.link;
        } else {
            // Scroll to explore section
            document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Show search suggestions (optional)
function showSearchSuggestions(query) {
    // This could be implemented to show a dropdown with suggestions
    // For now, we'll keep it simple
    const suggestions = [];
    
    // Add hotel suggestions
    const hotels = JSON.parse(localStorage.getItem('siteHotels') || '[]');
    hotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(query)) {
            suggestions.push({ text: hotel.name, type: 'hotel' });
        }
    });
    
    // Add location suggestions
    const locations = ['Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya', 'Yala', 'Mirissa', 'Nuwara Eliya'];
    locations.forEach(loc => {
        if (loc.toLowerCase().includes(query)) {
            suggestions.push({ text: loc, type: 'location' });
        }
    });
    
    // You could display these suggestions in a dropdown
    console.log('Search suggestions:', suggestions);
} 