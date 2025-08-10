# Sri Lanka Stay & Explore 开发说明书

## 项目概述

Sri Lanka Stay & Explore 是一个面向斯里兰卡旅游行业的全栈网站应用，专注于提供酒店住宿预订和交通服务预约。该项目旨在为游客提供一站式服务，包括酒店查询、交通安排和旅游信息浏览。

## 技术栈

### 前端技术
- **HTML5/CSS3**: 构建响应式用户界面
- **JavaScript (ES6+)**: 实现客户端功能和交互
- **Leaflet Maps API**: 地图和路线可视化
- **Leaflet Routing Machine**: 驾驶路线规划
- **OpenStreetMap**: 地图数据源
- **LocalStorage**: 本地数据存储，特别用于图片缓存
- **JWT**: 用于基于角色的认证和权限管理

### 后端技术
- **Node.js**: 服务器端运行环境
- **Express**: Web框架
- **Netlify Functions**: 无服务器函数
- **Nodemailer**: 邮件发送服务
- **Stripe**: 支付处理
- **Serverless Auth**: 认证和授权管理

## 项目结构

```
02_sri-lanka-stay-explore
  ├── config/           # 配置文件
  ├── css/              # 样式文件
  ├── images/           # 图片资源
  │   ├── accommodations/ # 住宿设施图片
  │   ├── gallery/      # 图库图片
  │   ├── hotel/        # 酒店图片
  │   └── testimonials/ # 用户评价图片
  ├── js/               # JavaScript文件
  │   ├── auth/         # 认证和授权管理模块
  │   └── roles/        # 角色权限控制
  ├── public/           # 公共资源
  │   └── locales/      # 国际化语言文件
  ├── server/           # 服务器端代码
  │   ├── functions/    # Netlify无服务器函数
  │   ├── auth/         # 授权中间件
  │   └── roles/        # 角色定义
  ├── index.html        # 主页
  ├── transport.html    # 交通服务页面
  ├── admin-dashboard.html # 管理后台页面
  ├── transport-admin.html # 交通服务管理员专用页面
  ├── admin-login.html  # 管理员登录页面
  ├── server.js         # 主服务器文件
  └── package.json      # 项目依赖配置
```

## 核心功能模块

### 1. 住宿预订系统
- 酒店和住宿设施展示
- 详细信息与照片
- 预订表单与确认流程

### 2. 交通服务系统
- 交互式地图选择接送地点
- 实时驾驶路线可视化
- 基于实际驾驶距离的费用计算
- 简便的预订流程

### 3. 用户发现功能 ("Discover Sri Lanka" 图库)
- 分类筛选 (风景、野生动物、文化、美食、海滩)
- 图片轮播
- 缩略图导航
- 内存优化的图片加载机制
- 多级存储同步系统 (IndexedDB, localStorage)
- 自动化图片来源检测与分类

### 4. 管理员系统
- **角色划分**:
  - **系统管理员**: 完全访问权限，可管理所有内容
  - **交通服务管理员**: 仅限交通相关内容管理权限
- **权限控制**:
  - 基于角色的访问控制(RBAC)
  - 操作审计
  - 资源访问控制

### 5. 管理后台功能
- 图片管理
- 内容管理
- 订单管理
- 交通服务设置
- 系统设置

### 6. 用户认证系统
- 用户登录/注册
- 管理员登录与角色识别
- 会话管理
- 安全令牌处理

### 7. 电子邮件通知
- 预订确认邮件
- 支付通知

## 数据存储
- 使用LocalStorage进行非关键数据存储
- 特别针对图库实现了内存优化机制
- JWT令牌存储用户权限和角色信息

## API集成
- Stripe支付处理
- Leaflet地图服务
- 电子邮件发送服务

## 安全架构
- JWT令牌认证
- HTTPS加密通信
- 角色授权验证
- 安全头部设置

## 部署架构
- 前端部署在Netlify
- 使用Netlify Functions作为无服务器后端
- 静态网站与无服务器功能的混合架构

## 开发指南

### 本地开发环境设置
1. 克隆代码库
   ```
   git clone https://github.com/Williamllq/sri-lanka-hotel
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 创建`.env`文件并设置以下环境变量:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   STRIPE_SECRET_KEY=your-stripe-secret
   JWT_SECRET=your-jwt-secret-key
   ```

4. 启动开发服务器
   ```
   npm run dev
   ```

### 角色与权限开发
1. 角色定义在`server/roles/roles.js`中
2. 权限中间件在`server/auth/permissions.js`中
3. 前端权限验证在`js/auth/roleCheck.js`中实现

### 分支管理策略
- **master**: 生产分支，对应已部署网站
- **main**: 开发分支，用于新功能开发
- **feature/auth**: 用于开发认证和权限相关功能

### 代码发布流程
1. 在`main`分支上开发新功能
2. 提交更改并推送到`main`分支
3. 创建从`main`到`master`的Pull Request
4. 运行自动化测试确保角色权限正常工作
5. 合并更改后Netlify会自动部署更新

### 特别注意事项
- 图库功能使用轻量级`simple-gallery.js`，避免使用内存密集型同步脚本
- 测试应在高端和低端设备上进行，确保性能一致性
- 确保图片类别名称标准化
- 验证数据加载的回退机制正常工作
- 在角色权限测试时，确保测试所有可能的访问场景
- 永远不要在前端硬编码权限逻辑，应通过API请求获取

### 图像存储系统
前端与管理后台之间的图像同步按以下优先级进行:

1. **IndexedDB存储** (优先): 
   - 使用 `js/indexed-db.js` 模块，支持更大存储量
   - 主要用于管理后台上传和管理的图片

2. **localStorage存储** (备选):
   - 使用 `sitePictures` 和 `adminPictures` 键
   - 自动与IndexedDB同步，确保一致性

3. **默认图像** (后备):
   - 从HTML DOM中提取，确保即使存储系统失败也有内容显示

图像同步事件:
- `picturesSynced`: 图像同步完成时触发
- `galleryRefresh`: 请求刷新图库视图
- `imageUploaded`: 新图像上传完成时触发
- `imagesImported`: 批量导入图像时触发

系统会自动处理各存储间的数据一致性，使用事件驱动架构确保视图更新。