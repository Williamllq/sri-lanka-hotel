/**
 * 数据同步服务 - 确保管理员界面和用户界面数据完全同步
 * 管理员是内容管理者，用户界面是内容展示者
 */

(function() {
    console.log('Data Sync Service initializing...');
    
    // 数据存储键映射 - 统一管理员和用户端的数据键
    const DATA_KEYS = {
        // 图片相关
        pictures: 'sitePictures',           // 统一使用sitePictures
        adminPictures: 'adminPicturesMetadata', // 管理员元数据（将被同步到sitePictures）
        
        // 轮播图
        carousel: 'carouselImages',
        
        // 酒店和房间
        hotels: 'siteHotels',
        rooms: 'siteRooms',
        
        // 订单
        bookings: 'bookings',
        
        // 用户
        users: 'siteUsers',
        adminUsers: 'adminUsers',
        
        // 设置
        transportSettings: 'transportSettings',
        siteSettings: 'siteSettings'
    };
    
    // 数据同步服务
    window.DataSyncService = {
        /**
         * 初始化数据同步
         */
        init() {
            console.log('Initializing data synchronization...');
            
            // 立即同步所有数据
            this.syncAllData();
            
            // 监听存储变化（跨标签页同步）
            this.setupStorageListener();
            
            // 定期同步（每30秒）
            setInterval(() => this.syncAllData(), 30000);
            
            console.log('Data sync service initialized');
        },
        
        /**
         * 同步所有数据
         */
        syncAllData() {
            this.syncPictures();
            this.syncCarousel();
            this.syncHotels();
            this.syncRooms();
            this.syncBookings();
            this.syncUsers();
        },
        
        /**
         * 同步图片数据 - 核心功能
         */
        syncPictures() {
            console.log('Syncing pictures...');
            
            // 获取管理员上传的图片
            const adminPictures = JSON.parse(localStorage.getItem(DATA_KEYS.adminPictures) || '[]');
            const sitePictures = JSON.parse(localStorage.getItem(DATA_KEYS.pictures) || '[]');
            
            // 创建统一的图片集合
            const pictureMap = new Map();
            
            // 先添加站点图片
            sitePictures.forEach(pic => {
                pictureMap.set(pic.id, this.normalizePicture(pic));
            });
            
            // 添加/更新管理员图片
            adminPictures.forEach(pic => {
                pictureMap.set(pic.id, this.normalizePicture(pic));
            });
            
            // 转换回数组并保存
            const unifiedPictures = Array.from(pictureMap.values());
            
            // 保存到两个位置，确保兼容性
            localStorage.setItem(DATA_KEYS.pictures, JSON.stringify(unifiedPictures));
            localStorage.setItem(DATA_KEYS.adminPictures, JSON.stringify(unifiedPictures));
            
            // 如果在用户界面，更新画廊
            this.updateUserGallery(unifiedPictures);
            
            console.log(`Synced ${unifiedPictures.length} pictures`);
        },
        
        /**
         * 标准化图片对象
         */
        normalizePicture(pic) {
            return {
                id: pic.id || 'pic_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name: pic.name || pic.title || 'Untitled',
                category: pic.category || 'scenery',
                description: pic.description || '',
                // 统一URL字段
                imageUrl: pic.imageUrl || pic.url || pic.thumbnailUrl || pic.src,
                thumbnailUrl: pic.thumbnailUrl || pic.imageUrl || pic.url,
                // 云存储信息
                cloudUrl: pic.cloudUrl,
                cloudPublicId: pic.cloudPublicId,
                // 元数据
                uploadDate: pic.uploadDate || new Date().toISOString(),
                uploadedBy: pic.uploadedBy || 'admin',
                isActive: pic.isActive !== false // 默认显示
            };
        },
        
        /**
         * 更新用户界面的画廊
         */
        updateUserGallery(pictures) {
            // 检查是否在用户界面
            const galleryGrid = document.querySelector('.gallery-grid');
            const discoverGallery = document.getElementById('pictureGallery');
            
            if (galleryGrid || discoverGallery) {
                console.log('Updating user gallery with admin pictures...');
                
                // 触发画廊更新事件
                window.dispatchEvent(new CustomEvent('galleryUpdate', {
                    detail: { pictures: pictures.filter(p => p.isActive) }
                }));
                
                // 如果有简单画廊函数，调用它
                if (typeof window.initializeSimpleGallery === 'function') {
                    window.initializeSimpleGallery();
                }
            }
        },
        
        /**
         * 同步轮播图
         */
        syncCarousel() {
            console.log('Syncing carousel images...');
            
            const carouselImages = JSON.parse(localStorage.getItem(DATA_KEYS.carousel) || '[]');
            
            // 确保轮播图引用的是实际存在的图片
            const allPictures = JSON.parse(localStorage.getItem(DATA_KEYS.pictures) || '[]');
            const pictureMap = new Map(allPictures.map(p => [p.id, p]));
            
            // 更新轮播图信息
            const validCarouselImages = carouselImages
                .map(item => {
                    const picture = pictureMap.get(item.imageId || item.id);
                    if (picture) {
                        return {
                            ...item,
                            imageUrl: picture.imageUrl,
                            thumbnailUrl: picture.thumbnailUrl,
                            title: item.title || picture.name,
                            description: item.description || picture.description
                        };
                    }
                    return null;
                })
                .filter(Boolean);
            
            localStorage.setItem(DATA_KEYS.carousel, JSON.stringify(validCarouselImages));
            
            // 更新首页轮播
            this.updateHomeCarousel(validCarouselImages);
        },
        
        /**
         * 更新首页轮播
         */
        updateHomeCarousel(carouselImages) {
            // 检查是否在首页
            const carousel = document.querySelector('.carousel, .hero-carousel, #heroCarousel');
            if (carousel && carouselImages.length > 0) {
                console.log('Updating home page carousel...');
                
                // 触发轮播更新事件
                window.dispatchEvent(new CustomEvent('carouselUpdate', {
                    detail: { images: carouselImages }
                }));
            }
        },
        
        /**
         * 同步酒店数据
         */
        syncHotels() {
            const hotels = JSON.parse(localStorage.getItem(DATA_KEYS.hotels) || '[]');
            
            // 标准化酒店数据
            const normalizedHotels = hotels.map(hotel => ({
                id: hotel.id || 'hotel_' + Date.now(),
                name: hotel.name,
                location: hotel.location,
                price: hotel.price,
                priceRange: hotel.priceRange || hotel.price,
                rating: hotel.rating || 5,
                description: hotel.description,
                image: hotel.image || hotel.imageUrl,
                amenities: hotel.amenities || [],
                website: hotel.website,
                isActive: hotel.isActive !== false
            }));
            
            localStorage.setItem(DATA_KEYS.hotels, JSON.stringify(normalizedHotels));
            
            // 更新酒店页面
            this.updateHotelsPage(normalizedHotels);
        },
        
        /**
         * 更新酒店页面
         */
        updateHotelsPage(hotels) {
            const hotelsGrid = document.querySelector('.hotels-grid, #hotelsGrid');
            if (hotelsGrid) {
                console.log('Updating hotels page with admin data...');
                
                // 触发酒店更新事件
                window.dispatchEvent(new CustomEvent('hotelsUpdate', {
                    detail: { hotels: hotels.filter(h => h.isActive) }
                }));
            }
        },
        
        /**
         * 同步房间数据
         */
        syncRooms() {
            const rooms = JSON.parse(localStorage.getItem(DATA_KEYS.rooms) || '[]');
            
            // 标准化房间数据
            const normalizedRooms = rooms.map(room => ({
                id: room.id || 'room_' + Date.now(),
                name: room.name,
                description: room.description,
                price: room.price,
                size: room.size,
                bedType: room.bedType,
                hasWifi: room.hasWifi !== false,
                image: room.image || room.imageUrl,
                isActive: room.isActive !== false
            }));
            
            localStorage.setItem(DATA_KEYS.rooms, JSON.stringify(normalizedRooms));
            
            // 更新住宿部分
            this.updateAccommodationsSection(normalizedRooms);
        },
        
        /**
         * 更新住宿部分
         */
        updateAccommodationsSection(rooms) {
            const accommodationsSection = document.querySelector('.accommodations-grid, #accommodationsGrid');
            if (accommodationsSection) {
                console.log('Updating accommodations with admin data...');
                
                // 触发住宿更新事件
                window.dispatchEvent(new CustomEvent('accommodationsUpdate', {
                    detail: { rooms: rooms.filter(r => r.isActive) }
                }));
            }
        },
        
        /**
         * 同步订单数据
         */
        syncBookings() {
            // 订单数据本来就是统一的，确保格式正确
            const bookings = JSON.parse(localStorage.getItem(DATA_KEYS.bookings) || '[]');
            
            // 标准化订单数据
            const normalizedBookings = bookings.map(booking => ({
                ...booking,
                id: booking.id || booking.orderId || 'order_' + Date.now(),
                status: booking.status || 'pending',
                createdAt: booking.createdAt || booking.date || new Date().toISOString()
            }));
            
            localStorage.setItem(DATA_KEYS.bookings, JSON.stringify(normalizedBookings));
        },
        
        /**
         * 同步用户数据
         */
        syncUsers() {
            const siteUsers = JSON.parse(localStorage.getItem(DATA_KEYS.users) || '[]');
            const adminUsers = JSON.parse(localStorage.getItem(DATA_KEYS.adminUsers) || '[]');
            
            // 合并用户数据
            const userMap = new Map();
            
            siteUsers.forEach(user => userMap.set(user.email, user));
            adminUsers.forEach(user => userMap.set(user.email || user.username, {
                ...userMap.get(user.email || user.username),
                ...user,
                isAdmin: user.isAdmin || user.role === 'admin'
            }));
            
            const unifiedUsers = Array.from(userMap.values());
            
            // 保存统一的用户数据
            localStorage.setItem(DATA_KEYS.users, JSON.stringify(unifiedUsers));
        },
        
        /**
         * 设置存储监听器（跨标签页同步）
         */
        setupStorageListener() {
            window.addEventListener('storage', (e) => {
                // 只处理我们关心的键
                if (Object.values(DATA_KEYS).includes(e.key)) {
                    console.log(`Storage changed: ${e.key}`);
                    
                    // 根据变化的键执行相应的同步
                    switch(e.key) {
                        case DATA_KEYS.adminPictures:
                        case DATA_KEYS.pictures:
                            this.syncPictures();
                            break;
                        case DATA_KEYS.carousel:
                            this.syncCarousel();
                            break;
                        case DATA_KEYS.hotels:
                            this.syncHotels();
                            break;
                        case DATA_KEYS.rooms:
                            this.syncRooms();
                            break;
                        case DATA_KEYS.bookings:
                            this.syncBookings();
                            break;
                    }
                }
            });
        },
        
        /**
         * 手动触发同步（供调试使用）
         */
        forceSync() {
            console.log('Force syncing all data...');
            this.syncAllData();
            alert('Data synchronization completed!');
        }
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DataSyncService.init());
    } else {
        DataSyncService.init();
    }
    
    // 导出到全局供调试
    window.DataSyncService = DataSyncService;
    
    console.log('Data Sync Service loaded - use DataSyncService.forceSync() to manually sync');
    
})(); 