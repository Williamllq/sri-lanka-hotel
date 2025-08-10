# Sri Lanka Stay & Explore 系统架构文档

## 总体架构

Sri Lanka Stay & Explore 采用混合架构设计，结合了静态网站托管和无服务器函数，以创建轻量级但功能强大的旅游预订平台。系统融合了基于角色的访问控制，支持系统管理员和交通服务管理员两种角色。

### 架构图

```
+---------------------+     +-------------------------+
|                     |     |                         |
|   前端用户界面      |     |      管理员界面         |
|   (静态HTML/CSS/JS) | <-> | (系统/交通服务管理员)   |
|                     |     |                         |
+----------+----------+     +------------+------------+
           ^                             ^
           |                             |
           v                             v
+----------+-----------------------------+------------+
|                                                     |
|          浏览器端 LocalStorage 和 JWT令牌存储       |
|                                                     |
+----+-------------------+----------------------+-----+
     ^                   ^                      ^
     |                   |                      |
     v                   v                      v
+----+------+    +-------+-------+     +--------+-------+
|           |    |               |     |                |
| 地图服务  |    | Netlify Functions|     | Stripe 支付服务 |
| (Leaflet) |    | (无服务器后端)  |     |                |
|           |    |               |     |                |
+-----------+    +-------+-------+     +----------------+
                        ^
                        |
                        v
           +------------+------------+
           |                         |
           |    认证和授权服务       |
           | (JWT + 角色权限控制)    |
           |                         |
           +------------+------------+
                        ^
                        |
                        v
                +-------+-------+
                |               |
                | 电子邮件服务  |
                | (Nodemailer)  |
                |               |
                +---------------+
```

## 前端架构

### 组件结构

1. **主页 (index.html)**
   - 导航栏
   - 首页轮播
   - 交通服务模块
   - 探索斯里兰卡图库
   - 联系表单

2. **交通页面 (transport.html)**
   - 交通选项展示
   - 交互式地图
   - 费用计算器
   - 预订表单

3. **管理后台**
   - **系统管理员界面 (admin-dashboard.html)**
     - 完整仪表盘
     - 图片管理器
     - 内容管理
     - 订单管理
     - 设置面板
     - 管理员账户管理

   - **交通服务管理员界面 (transport-admin.html)**
     - 交通服务仪表盘
     - 交通订单管理
     - 车辆和价格管理
     - 路线统计报告

### 数据流

1. **用户浏览流程**:
   ```
   用户访问网站 -> 浏览内容 -> 查看交通选项 -> 费用计算 -> 提交预订 -> 接收确认
   ```

2. **系统管理员流程**:
   ```
   系统管理员登录 -> 完整仪表盘 -> 管理所有内容/图片/订单 -> 更新任何设置 -> 变更生效
   ```

3. **交通服务管理员流程**:
   ```
   交通服务管理员登录 -> 交通服务仪表盘 -> 管理交通订单/车辆/价格 -> 更新交通相关设置 -> 变更生效
   ```

## 后端架构

### 无服务器函数

该项目使用Netlify Functions作为轻量级后端服务，主要处理:

1. **认证与授权** (`auth.js`)
   - JWT令牌生成与验证
   - 角色权限验证
   - 会话管理

2. **电子邮件发送** (`send-booking-confirmation.js`)
   - 处理预订确认
   - 格式化邮件内容
   - 发送通知

3. **支付处理** (通过`server.js`和Stripe集成)
   - 创建支付意向
   - 处理支付确认

4. **图片处理与存储** (`image-processing.js`)
   - 图片压缩与格式转换
   - 云端存储集成
   - 元数据管理

### 角色与权限系统

实现了基于角色的访问控制(RBAC):

1. **角色定义**:
   - `SYSTEM_ADMIN`: 系统管理员，拥有完全访问权限
   - `TRANSPORT_ADMIN`: 交通服务管理员，仅能访问交通相关功能

2. **权限粒度**:
   - 页面级权限: 控制对特定页面的访问
   - 功能级权限: 控制对特定功能的使用
   - 数据级权限: 控制对特定数据的访问和修改

3. **权限实现**:
   - 前端: 基于JWT令牌中的角色信息渲染UI元素
   - 后端: API接口中间件验证请求者权限

### 数据存储

数据存储策略已优化，采用多层次存储:

1. **浏览器LocalStorage**
   - 存储用户首选项
   - 保存临时预订信息
   - 短期缓存小型图片元数据

2. **云存储系统** (新增)
   - 存储高质量图片原始文件
   - 自动生成多种分辨率版本
   - 提供CDN加速服务

3. **IndexedDB** (新增)
   - 存储图片元数据与缩略图
   - 支持离线功能
   - 提供更大存储空间(>50MB)

4. **JWT令牌**
   - 存储用户身份信息
   - 存储角色和权限信息

5. **Netlify环境变量**
   - 存储API密钥
   - 保存邮件凭证
   - 存储JWT密钥

## 图片管理系统优化

针对图片管理与同步的问题，采用现代化多层次架构:

### 1. 云存储集成

使用云存储服务(如AWS S3、Cloudinary或Firebase Storage)替代LocalStorage:

```javascript
// 图片上传与处理流程
const uploadImage = async (imageFile, metadata) => {
  // 1. 客户端预处理
  const optimizedImage = await preprocessImage(imageFile);
  
  // 2. 上传至云存储
  const uploadData = new FormData();
  uploadData.append('file', optimizedImage);
  uploadData.append('metadata', JSON.stringify(metadata));
  
  const response = await fetch('/.netlify/functions/upload-image', {
    method: 'POST',
    body: uploadData,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  
  // 3. 返回图片信息
  return await response.json();
};
```

### 2. 多分辨率图片系统

自动生成并存储多种分辨率的图片，适应不同设备和网络环境:

```javascript
// 服务器端图片处理 (在 Netlify Function 中)
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

exports.handler = async (event) => {
  const imageBuffer = Buffer.from(/* 图片数据 */);
  
  // 生成不同尺寸版本
  const versions = await Promise.all([
    sharp(imageBuffer).resize(1200, null, {fit: 'inside'}).toBuffer(), // 大图
    sharp(imageBuffer).resize(600, null, {fit: 'inside'}).toBuffer(),  // 中图
    sharp(imageBuffer).resize(300, null, {fit: 'inside'}).toBuffer()   // 缩略图
  ]);
  
  // 上传至云存储
  const uploadResults = await Promise.all([
    cloudinary.uploader.upload_stream({folder: 'gallery/large'}),
    cloudinary.uploader.upload_stream({folder: 'gallery/medium'}),
    cloudinary.uploader.upload_stream({folder: 'gallery/thumbnails'})
  ]);
  
  // 返回图片URL和元数据
  return {
    statusCode: 200,
    body: JSON.stringify({
      urls: {
        large: uploadResults[0].secure_url,
        medium: uploadResults[1].secure_url,
        thumbnail: uploadResults[2].secure_url
      },
      // 其他元数据
    })
  };
};
```

### 3. 前端图片加载优化

使用现代化图片加载技术，提高用户体验:

```javascript
// 前端图片加载与渲染
const GallerySystem = {
  // 懒加载图片
  lazyLoadImages: () => {
    const galleryImages = document.querySelectorAll('.gallery-image[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    
    galleryImages.forEach(img => imageObserver.observe(img));
  },
  
  // 渐进式加载策略
  progressiveImageLoading: (imageId) => {
    const imgContainer = document.getElementById(imageId);
    
    // 先加载缩略图
    const thumbImg = new Image();
    thumbImg.src = imgContainer.dataset.thumbnail;
    thumbImg.onload = () => {
      imgContainer.appendChild(thumbImg);
      imgContainer.classList.add('thumb-loaded');
      
      // 然后加载高质量图片
      const fullImg = new Image();
      fullImg.src = imgContainer.dataset.fullsize;
      fullImg.onload = () => {
        imgContainer.replaceChild(fullImg, thumbImg);
        imgContainer.classList.add('full-loaded');
      };
    };
  }
};
```

### 4. 图片同步与持久化机制

使用IndexedDB替代LocalStorage，突破大小限制并支持结构化数据:

```javascript
// 图片元数据存储系统
const ImageDatabase = {
  db: null,
  
  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GalleryDatabase', 1);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        const store = db.createObjectStore('images', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('uploadDate', 'uploadDate', { unique: false });
      };
      
      request.onsuccess = event => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onerror = event => reject(event.target.error);
    });
  },
  
  // 存储图片元数据
  async storeImage(imageData) {
    const transaction = this.db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    return new Promise((resolve, reject) => {
      const request = store.put(imageData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // 根据类别获取图片
  async getImagesByCategory(category) {
    const transaction = this.db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const index = store.index('category');
    
    return new Promise((resolve, reject) => {
      const request = category === 'all' 
        ? store.getAll() 
        : index.getAll(category);
        
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  // 同步云端数据
  async syncWithCloud() {
    try {
      const response = await fetch('/.netlify/functions/get-all-images', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const cloudImages = await response.json();
      
      // 批量更新本地存储
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      // 清除旧数据
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // 添加新数据
      for (const image of cloudImages) {
        await new Promise((resolve, reject) => {
          const request = store.add(image);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      
      return { success: true, count: cloudImages.length };
    } catch (error) {
      console.error('同步失败:', error);
      return { success: false, error: error.message };
    }
  }
};
```

### 5. 服务工作线程(Service Worker)集成

使用Service Worker支持离线访问和后台同步:

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker注册成功:', registration.scope);
      
      // 设置图片缓存策略
      if (registration.sync) {
        // 后台同步图片
        registration.sync.register('sync-gallery-images');
      }
    } catch (error) {
      console.error('Service Worker注册失败:', error);
    }
  });
}
```

```javascript
// Service Worker实现 (sw.js)
const CACHE_NAME = 'gallery-cache-v1';
const GALLERY_URLS = [
  '/index.html',
  '/css/gallery-fix.css',
  '/js/simple-gallery.js'
];

// 安装时预缓存关键资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(GALLERY_URLS))
  );
});

// 缓存图片资源
self.addEventListener('fetch', event => {
  // 对图片请求使用缓存优先策略
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // 缓存命中则返回缓存
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 否则从网络获取并缓存
          return fetch(event.request)
            .then(response => {
              const clonedResponse = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clonedResponse));
                
              return response;
            });
        })
    );
  }
});

// 后台同步图片
self.addEventListener('sync', event => {
  if (event.tag === 'sync-gallery-images') {
    event.waitUntil(syncGalleryImages());
  }
});

// 同步图片实现
async function syncGalleryImages() {
  try {
    const response = await fetch('/.netlify/functions/get-all-images');
    const images = await response.json();
    
    // 预缓存所有图片
    const cache = await caches.open(CACHE_NAME);
    const imageUrls = images.flatMap(img => [
      img.urls.thumbnail,
      img.urls.medium
    ]);
    
    await Promise.all(
      imageUrls.map(url => 
        fetch(url)
          .then(response => cache.put(url, response))
          .catch(err => console.warn(`缓存图片失败: ${url}`, err))
      )
    );
    
    return true;
  } catch (error) {
    console.error('同步图片失败:', error);
    return false;
  }
}
```

## 集成服务

### 地图服务
- **Leaflet** 提供地图可视化
- **Leaflet Routing Machine** 计算驾驶路线
- **OpenStreetMap** 提供底图数据

### 支付服务
- **Stripe** 处理安全支付

### 电子邮件服务
- **Nodemailer** 发送交易邮件
- 配置为通过Gmail SMTP发送

### 云存储服务 (新增)
- **Cloudinary/AWS S3/Firebase Storage** 提供图片云存储
- 支持自动生成多分辨率图片
- 提供CDN加速分发

## 性能优化

### 图库性能
- 使用IndexedDB替代LocalStorage存储大量图片元数据
- 实现懒加载与渐进式加载
- 使用Service Worker提供离线访问
- 自动图片压缩与格式转换(WebP)
- 通过云存储CDN提供加速分发

### 页面加载
- 异步加载非关键JavaScript
- 使用AOS库进行滚动动画
- 响应式图片加载
- 基于角色的UI渲染，减少不必要组件

## 安全考虑

### 管理认证与授权
- 基于JWT的身份验证
- 基于角色的访问控制(RBAC)
- 细粒度权限管理
- 会话超时处理
- 防止跨角色访问

### 数据保护
- 通过环境变量分离敏感信息
- 通过HTTPS保护所有连接
- CSRF防护措施
- 输入验证和清洗
- 数据加密存储

## 部署架构

### 托管服务
- **Netlify** 用于静态文件托管和无服务器函数
- 自动部署通过GitHub集成实现
- 云存储服务集成

### 域名和SSL
- 使用Netlify提供的子域名 (sri-lanka-stay-explore.netlify.app)
- 自动SSL证书配置

## 扩展性考虑

该架构设计支持以下潜在的未来扩展:

1. 添加更多管理员角色和更细粒度的权限控制
2. 整合客户关系管理(CRM)系统
3. 添加更多支付提供商
4. 实现完整的预订管理系统
5. 增加旅游套餐模块
6. 实现多语言支持
7. 添加更高级的分析和报告功能