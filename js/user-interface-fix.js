/**
 * User Interface Fix - 修复主网站的加载和显示问题
 * 专注于修复用户界面的关键问题
 */

(function() {
    'use strict';
    
    console.log('User Interface Fix loading...');
    
    // 防止重复执行
    if (window.userInterfaceFixLoaded) {
        console.log('User Interface Fix already loaded, skipping...');
        return;
    }
    window.userInterfaceFixLoaded = true;
    
    const UserInterfaceFix = {
        
        // 初始化修复
        init() {
            console.log('Initializing user interface fixes...');
            
            // 设置错误处理
            this.setupErrorHandling();
            
            // 修复图片加载
            this.fixImageLoading();
            
            // 修复画廊显示
            this.fixGalleryDisplay();
            
            // 修复语言切换
            this.fixLanguageSwitcher();
            
            // 停止无限循环
            this.stopInfiniteLoops();
            
            console.log('User interface fixes initialized');
        },
        
        // 设置错误处理
        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('JavaScript Error:', event.error);
                
                // 记录错误但不阻止页面运行
                if (event.error && event.error.message) {
                    const message = event.error.message.toLowerCase();
                    if (message.includes('translations.js not loaded')) {
                        this.loadFallbackTranslations();
                    }
                }
            });
            
            // 处理未捕获的Promise异常
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled Promise Rejection:', event.reason);
                event.preventDefault(); // 防止在控制台显示错误
            });
        },
        
        // 加载备用翻译
        loadFallbackTranslations() {
            if (!window.translations) {
                window.translations = {
                    en: {
                        nav: {
                            home: 'Home',
                            about: 'About',
                            gallery: 'Gallery',
                            transport: 'Transport',
                            hotels: 'Hotels',
                            contact: 'Contact'
                        },
                        hero: {
                            title: 'Explore Beautiful Sri Lanka',
                            subtitle: 'Discover the Pearl of the Indian Ocean',
                            cta: 'Start Your Journey'
                        }
                    }
                };
                console.log('Fallback translations loaded');
            }
        },
        
        // 修复图片加载
        fixImageLoading() {
            // 处理所有图片的错误加载
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.hasAttribute('data-error-handled')) {
                    img.setAttribute('data-error-handled', 'true');
                    img.addEventListener('error', () => {
                        if (img.src !== 'images/placeholder.jpg') {
                            img.src = 'images/placeholder.jpg';
                        }
                    });
                }
            });
            
            console.log(`Fixed ${images.length} images for error handling`);
        },
        
        // 修复画廊显示
        fixGalleryDisplay() {
            try {
                // 从 localStorage 加载图片
                const galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
                const adminPictures = JSON.parse(localStorage.getItem('adminPictures') || '[]');
                
                let imagesToDisplay = galleryImages;
                
                // 如果画廊为空但管理员有图片，进行同步
                if (imagesToDisplay.length === 0 && adminPictures.length > 0) {
                    imagesToDisplay = adminPictures.map(pic => ({
                        id: pic.id,
                        url: pic.imageUrl || pic.url,
                        title: pic.title || 'Beautiful Sri Lanka',
                        description: pic.description || '',
                        category: pic.category || 'scenery'
                    }));
                    
                    // 保存同步后的数据
                    localStorage.setItem('galleryImages', JSON.stringify(imagesToDisplay));
                    console.log('Synced images from admin to gallery');
                }
                
                // 如果还是没有图片，创建示例图片
                if (imagesToDisplay.length === 0) {
                    this.createSampleGalleryImages();
                } else {
                    this.displayGalleryImages(imagesToDisplay);
                }
                
            } catch (error) {
                console.error('Error fixing gallery display:', error);
                this.createSampleGalleryImages();
            }
        },
        
        // 创建示例画廊图片
        createSampleGalleryImages() {
            const sampleImages = [
                {
                    id: 'gallery_1',
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Pristine Beaches',
                    description: 'Crystal clear waters and golden sandy beaches',
                    category: 'beach'
                },
                {
                    id: 'gallery_2',
                    url: 'https://images.unsplash.com/photo-1588598198321-9735fd58f0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Ancient Temples',
                    description: 'Sacred Buddhist temples with rich history',
                    category: 'culture'
                },
                {
                    id: 'gallery_3',
                    url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Wildlife Safari',
                    description: 'Magnificent elephants in their natural habitat',
                    category: 'wildlife'
                },
                {
                    id: 'gallery_4',
                    url: 'https://images.unsplash.com/photo-1566296440929-898ae2baae1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    title: 'Tea Plantations',
                    description: 'Lush green tea estates in the hill country',
                    category: 'scenery'
                }
            ];
            
            localStorage.setItem('galleryImages', JSON.stringify(sampleImages));
            this.displayGalleryImages(sampleImages);
            console.log('Created sample gallery images');
        },
        
        // 显示画廊图片
        displayGalleryImages(images) {
            // 触发画廊更新事件
            window.dispatchEvent(new CustomEvent('galleryUpdate', {
                detail: { images: images }
            }));
            
            console.log(`Displayed ${images.length} gallery images`);
        },
        
        // 修复语言切换
        fixLanguageSwitcher() {
            const languageButtons = document.querySelectorAll('[data-lang]');
            languageButtons.forEach(button => {
                if (!button.hasAttribute('data-fixed')) {
                    button.setAttribute('data-fixed', 'true');
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const lang = button.getAttribute('data-lang');
                        this.switchLanguage(lang);
                    });
                }
            });
        },
        
        // 切换语言
        switchLanguage(lang) {
            try {
                localStorage.setItem('selectedLanguage', lang);
                
                // 更新UI语言标识
                document.documentElement.setAttribute('lang', lang);
                
                // 触发语言更改事件
                window.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { language: lang }
                }));
                
                console.log(`Language switched to: ${lang}`);
                
            } catch (error) {
                console.error('Error switching language:', error);
            }
        },
        
        // 停止无限循环
        stopInfiniteLoops() {
            // 清除可能的无限间隔
            if (window.gallerySyncInterval) {
                clearInterval(window.gallerySyncInterval);
                console.log('Cleared gallery sync interval');
            }
            
            // 限制事件监听器的执行频率
            this.throttleEventListeners();
        },
        
        // 节流事件监听器
        throttleEventListeners() {
            let scrollTimeout;
            let resizeTimeout;
            
            // 节流滚动事件
            const originalScrollListener = window.onscroll;
            window.onscroll = function(event) {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    if (originalScrollListener) originalScrollListener.call(this, event);
                    scrollTimeout = null;
                }, 100);
            };
            
            // 节流窗口大小改变事件
            const originalResizeListener = window.onresize;
            window.onresize = function(event) {
                if (resizeTimeout) return;
                resizeTimeout = setTimeout(() => {
                    if (originalResizeListener) originalResizeListener.call(this, event);
                    resizeTimeout = null;
                }, 200);
            };
        },
        
        // 修复标题动画
        fixTitleAnimation() {
            const title = document.querySelector('.hero-title, .main-title');
            if (title && title.style.animation) {
                // 确保动画正常结束
                title.addEventListener('animationend', () => {
                    title.style.animation = '';
                }, { once: true });
            }
        }
    };
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        /* 防止元素闪烁 */
        .loading {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }
        
        .loaded {
            opacity: 1;
        }
        
        /* 图片加载失败的备用样式 */
        img[src="images/placeholder.jpg"] {
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            border: 2px dashed #ccc;
        }
        
        /* 错误通知样式 */
        .error-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }
        
        .error-toast.show {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
    
    // 暴露到全局
    window.UserInterfaceFix = UserInterfaceFix;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => UserInterfaceFix.init(), 100);
        });
    } else {
        setTimeout(() => UserInterfaceFix.init(), 100);
    }
    
    console.log('User Interface Fix loaded successfully');
    
})(); 