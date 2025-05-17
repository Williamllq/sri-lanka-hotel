/**
 * Sri Lanka Stay & Explore Service Worker
 * 提供图片缓存、离线访问、后台同步等功能
 */

const CACHE_NAME = 'srilanka-stay-explore-v1';
const GALLERY_CACHE_NAME = 'srilanka-gallery-cache-v1';

// 需要缓存的核心资源
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/gallery-fix.css',
  '/js/main.js',
  '/js/simple-gallery.js',
  '/js/script.js',
  '/images/favicon.ico',
  '/images/ranga_bandara_logo_v2.png'
];

// 安装时缓存核心资源
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== GALLERY_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 处理请求，优先使用缓存
self.addEventListener('fetch', event => {
  // 跳过不支持的请求类型
  if (event.request.method !== 'GET') return;
  
  // 处理API请求
  if (event.request.url.includes('/.netlify/functions/')) {
    // 对API请求使用网络优先策略
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // 处理图片资源
  if (isImageRequest(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request, GALLERY_CACHE_NAME));
    return;
  }
  
  // 处理其他静态资源
  event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
});

// 处理后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-gallery-images') {
    console.log('[Service Worker] Syncing gallery images');
    event.waitUntil(syncGalleryImages());
  }
});

/**
 * 网络优先策略
 * 优先从网络获取，失败时使用缓存
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // 克隆响应
      const responseClone = response.clone();
      
      // 缓存响应 (无论是否为图片)
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseClone);
      });
      
      return response;
    })
    .catch(() => {
      // 网络失败时使用缓存
      return caches.match(request);
    });
}

/**
 * 缓存优先策略
 * 优先从缓存获取，失败时使用网络
 */
function cacheFirstStrategy(request, cacheName) {
  return caches.open(cacheName).then(cache => {
    return cache.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // 缓存命中，在后台刷新缓存
        refreshCacheInBackground(request, cache);
        return cachedResponse;
      }
      
      // 缓存未命中，使用网络
      return fetchAndCache(request, cache);
    });
  });
}

/**
 * 获取并缓存资源
 */
function fetchAndCache(request, cache) {
  return fetch(request).then(response => {
    // 检查是否为有效响应
    if (response.status === 200) {
      // 克隆响应以便缓存
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    return response;
  }).catch(error => {
    console.error('[Service Worker] Fetch error:', error);
    throw error;
  });
}

/**
 * 在后台刷新缓存
 */
function refreshCacheInBackground(request, cache) {
  // 避免频繁刷新缓存，添加随机延迟
  setTimeout(() => {
    fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response);
      }
    }).catch(error => {
      console.warn('[Service Worker] Background refresh error:', error);
    });
  }, Math.random() * 5000); // 0-5秒随机延迟
}

/**
 * 判断请求是否为图片
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  
  // 检查图片路径
  if (url.pathname.startsWith('/images/')) {
    return true;
  }
  
  // 检查扩展名
  const extension = url.pathname.split('.').pop() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension.toLowerCase());
}

/**
 * 同步图库图片
 */
async function syncGalleryImages() {
  try {
    // 如果没有网络连接，等待网络恢复
    if (!navigator.onLine) {
      await waitForOnline();
    }
    
    // 获取图片元数据
    let allImages = [];
    
    try {
      const response = await fetch('/.netlify/functions/get-all-images');
      if (response.ok) {
        allImages = await response.json();
      }
    } catch (error) {
      console.warn('[Service Worker] API fetch error, using IndexedDB fallback');
      
      // 如果API调用失败，尝试从IndexedDB获取
      const db = await openImageDatabase();
      if (db) {
        allImages = await getAllImagesFromDB(db);
      }
    }
    
    // 预缓存所有图片
    if (allImages.length > 0) {
      const cache = await caches.open(GALLERY_CACHE_NAME);
      
      // 收集所有图片URL
      const imageUrls = allImages.flatMap(img => {
        const urls = [];
        
        // 收集不同分辨率的URL
        if (img.url) urls.push(img.url);
        if (img.thumbnailUrl) urls.push(img.thumbnailUrl);
        if (img.urls) {
          if (img.urls.thumbnail) urls.push(img.urls.thumbnail);
          if (img.urls.medium) urls.push(img.urls.medium);
          if (img.urls.large) urls.push(img.urls.large);
        }
        
        return urls;
      });
      
      // 缓存所有图片
      console.log(`[Service Worker] Caching ${imageUrls.length} gallery images`);
      
      // 使用Promise.allSettled，即使某些图片加载失败也继续
      const results = await Promise.allSettled(
        imageUrls.map(async url => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              return true;
            }
          } catch (error) {
            console.warn(`[Service Worker] Failed to cache: ${url}`, error);
          }
          return false;
        })
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      console.log(`[Service Worker] Successfully cached ${successCount}/${imageUrls.length} gallery images`);
    }
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return false;
  }
}

/**
 * 等待网络恢复
 */
function waitForOnline() {
  return new Promise(resolve => {
    if (navigator.onLine) {
      resolve();
      return;
    }
    
    const onlineListener = () => {
      window.removeEventListener('online', onlineListener);
      resolve();
    };
    
    window.addEventListener('online', onlineListener);
  });
}

/**
 * 打开图片数据库
 */
async function openImageDatabase() {
  return new Promise((resolve, reject) => {
    if (!indexedDB) {
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
 * 从数据库获取所有图片
 */
async function getAllImagesFromDB(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}