/**
 * Admin Hotel Management
 * 处理管理员界面的酒店和房间管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Hotel Management loaded');
    
    // 初始化酒店和房间管理
    initHotelManagement();
});

/**
 * 初始化酒店管理功能
 */
function initHotelManagement() {
    console.log('初始化酒店管理');
    
    // 设置酒店标签切换功能
    setupHotelTabs();
    
    // 初始化酒店推荐管理
    initHotelRecommendations();
    
    // 初始化奢华客房管理
    initLuxuriousRooms();
    
    // 设置酒店表单事件
    setupHotelForm();
    
    // 设置客房表单事件
    setupRoomForm();
}

/**
 * 设置酒店标签切换功能
 */
function setupHotelTabs() {
    const hotelTabs = document.querySelectorAll('[data-hotel-tab]');
    if (hotelTabs.length === 0) {
        console.error('Hotel tabs not found');
        return;
    }
    
    hotelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的活动状态
            hotelTabs.forEach(t => t.classList.remove('active'));
            
            // 设置当前标签为活动状态
            this.classList.add('active');
            
            // 获取目标内容ID
            const targetId = this.getAttribute('data-hotel-tab') + 'Content';
            
            // 隐藏所有内容
            document.querySelectorAll('.hotel-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示目标内容
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

/**
 * 初始化酒店推荐管理
 */
function initHotelRecommendations() {
    // 加载和显示酒店推荐
    loadAndDisplayHotels();
    
    // 设置添加酒店按钮
    const addHotelBtn = document.getElementById('addHotelBtn');
    if (addHotelBtn) {
        addHotelBtn.addEventListener('click', function() {
            // 重置表单
            const hotelForm = document.getElementById('hotelForm');
            if (hotelForm) {
                hotelForm.reset();
                
                // 清除隐藏ID字段
                const hotelId = document.getElementById('hotelId');
                if (hotelId) {
                    hotelId.value = '';
                }
                
                // 更新模态框标题
                const modalTitle = document.getElementById('hotelModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = 'Add New Hotel';
                }
                
                // 清除图片预览
                const imagePreview = document.getElementById('hotelImagePreview');
                if (imagePreview) {
                    imagePreview.innerHTML = '';
                }
            }
            
            // 打开模态框
            if (typeof openModal === 'function') {
                openModal('hotelModal');
            } else {
                const modal = document.getElementById('hotelModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    }
}

/**
 * 加载并显示酒店推荐
 */
function loadAndDisplayHotels() {
    const hotelsGrid = document.getElementById('hotelsGrid');
    if (!hotelsGrid) {
        console.error('Hotels grid not found');
        return;
    }
    
    // 从localStorage获取酒店
    const hotelsStr = localStorage.getItem('adminHotels');
    const hotels = hotelsStr ? JSON.parse(hotelsStr) : [];
    
    // 清空列表
    hotelsGrid.innerHTML = '';
    
    // 如果没有酒店，显示提示
    if (hotels.length === 0) {
        hotelsGrid.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-hotel"></i>
                <p>No hotel recommendations found. Click "Add New Hotel" to create some.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有酒店
    hotels.forEach(hotel => {
        const hotelCard = document.createElement('div');
        hotelCard.className = 'hotel-card';
        
        // 生成星级评分HTML
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < parseInt(hotel.rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        // 生成设施HTML
        const amenities = hotel.amenities.split(',').map(item => item.trim());
        let amenitiesHtml = '';
        amenities.forEach(amenity => {
            if (amenity) {
                amenitiesHtml += `<span class="amenity">${amenity}</span>`;
            }
        });
        
        hotelCard.innerHTML = `
            <div class="hotel-image">
                ${hotel.imageUrl ? `<img src="${hotel.imageUrl}" alt="${hotel.name}">` : '<div class="no-image"><i class="fas fa-hotel"></i></div>'}
            </div>
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</div>
                <div class="hotel-rating">${starsHtml}</div>
                <div class="hotel-price">${hotel.price}</div>
                <p class="hotel-description">${hotel.description}</p>
                <div class="hotel-amenities">
                    ${amenitiesHtml}
                </div>
            </div>
            <div class="hotel-actions">
                <button class="edit-hotel-btn" data-id="${hotel.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-hotel-btn" data-id="${hotel.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        hotelsGrid.appendChild(hotelCard);
    });
    
    // 添加编辑和删除事件处理
    setupHotelEventHandlers();
}

/**
 * 设置酒店卡片的事件处理程序
 */
function setupHotelEventHandlers() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.edit-hotel-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const hotelId = this.getAttribute('data-id');
            editHotel(hotelId);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.delete-hotel-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const hotelId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
                deleteHotel(hotelId);
            }
        });
    });
}

/**
 * 设置酒店表单事件
 */
function setupHotelForm() {
    // 酒店图片上传预览
    const hotelImage = document.getElementById('hotelImage');
    const hotelImagePreview = document.getElementById('hotelImagePreview');
    
    if (hotelImage && hotelImagePreview) {
        hotelImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    hotelImagePreview.innerHTML = `<img src="${event.target.result}" alt="预览" style="max-width: 100%; max-height: 200px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 酒店表单提交
    const hotelForm = document.getElementById('hotelForm');
    if (hotelForm) {
        hotelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const hotelId = document.getElementById('hotelId').value;
            const name = document.getElementById('hotelName').value.trim();
            const location = document.getElementById('hotelLocation').value.trim();
            const price = document.getElementById('hotelPrice').value.trim();
            const rating = document.getElementById('hotelRating').value;
            const description = document.getElementById('hotelDescription').value.trim();
            const amenities = document.getElementById('hotelAmenities').value.trim();
            const website = document.getElementById('hotelWebsite').value.trim();
            
            // 验证必填字段
            if (!name) {
                alert('Please enter a hotel name');
                return;
            }
            
            if (!location) {
                alert('Please enter a hotel location');
                return;
            }
            
            if (!price) {
                alert('Please enter a price range');
                return;
            }
            
            if (!description) {
                alert('Please enter a hotel description');
                return;
            }
            
            // 创建酒店对象
            const hotel = {
                id: hotelId || 'hotel_' + Date.now(),
                name: name,
                location: location,
                price: price,
                rating: rating,
                description: description,
                amenities: amenities,
                website: website,
                createdAt: new Date().toISOString()
            };
            
            // 处理图片上传
            const hotelImageInput = document.getElementById('hotelImage');
            const preview = document.querySelector('#hotelImagePreview img');
            
            if (hotelImageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    hotel.imageUrl = e.target.result;
                    saveHotelToStorage(hotel);
                };
                reader.readAsDataURL(hotelImageInput.files[0]);
            } else if (preview && preview.src) {
                // 保留现有图片
                hotel.imageUrl = preview.src;
                saveHotelToStorage(hotel);
            } else {
                // 没有图片
                hotel.imageUrl = '';
                saveHotelToStorage(hotel);
            }
        });
    }
}

/**
 * 保存酒店到localStorage
 * @param {Object} hotel - 酒店对象
 */
function saveHotelToStorage(hotel) {
    try {
        // 从localStorage获取现有酒店
        const hotelsStr = localStorage.getItem('adminHotels');
        let hotels = hotelsStr ? JSON.parse(hotelsStr) : [];
        
        // 确保是数组
        if (!Array.isArray(hotels)) {
            hotels = [];
        }
        
        // 检查是否存在具有相同ID的酒店（编辑模式）
        const existingIndex = hotels.findIndex(h => h.id === hotel.id);
        
        if (existingIndex !== -1) {
            // 更新现有酒店
            hotels[existingIndex] = hotel;
        } else {
            // 添加新酒店
            hotels.push(hotel);
        }
        
        // 保存回localStorage
        localStorage.setItem('adminHotels', JSON.stringify(hotels));
        
        // 关闭模态框
        if (typeof closeModal === 'function') {
            closeModal('hotelModal');
        } else {
            const modal = document.getElementById('hotelModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // 重新加载酒店列表
        loadAndDisplayHotels();
        
        // 显示成功消息
        alert('Hotel saved successfully');
    } catch (e) {
        console.error('Error saving hotel:', e);
        alert('Failed to save hotel');
    }
}

/**
 * 编辑酒店
 * @param {string} hotelId - 酒店ID
 */
function editHotel(hotelId) {
    // 从localStorage获取酒店
    const hotelsStr = localStorage.getItem('adminHotels');
    const hotels = hotelsStr ? JSON.parse(hotelsStr) : [];
    
    // 查找指定酒店
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) {
        console.error('Hotel not found:', hotelId);
        return;
    }
    
    // 填充表单
    document.getElementById('hotelId').value = hotel.id;
    document.getElementById('hotelName').value = hotel.name;
    document.getElementById('hotelLocation').value = hotel.location;
    document.getElementById('hotelPrice').value = hotel.price;
    document.getElementById('hotelRating').value = hotel.rating;
    document.getElementById('hotelDescription').value = hotel.description;
    document.getElementById('hotelAmenities').value = hotel.amenities;
    document.getElementById('hotelWebsite').value = hotel.website || '';
    
    // 设置图片预览
    const imagePreview = document.getElementById('hotelImagePreview');
    if (hotel.imageUrl) {
        imagePreview.innerHTML = `<img src="${hotel.imageUrl}" alt="预览" style="max-width: 100%; max-height: 200px;">`;
    } else {
        imagePreview.innerHTML = '';
    }
    
    // 更新模态框标题
    const modalTitle = document.getElementById('hotelModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Hotel';
    }
    
    // 打开模态框
    if (typeof openModal === 'function') {
        openModal('hotelModal');
    } else {
        const modal = document.getElementById('hotelModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

/**
 * 删除酒店
 * @param {string} hotelId - 酒店ID
 */
function deleteHotel(hotelId) {
    try {
        // 从localStorage获取酒店
        const hotelsStr = localStorage.getItem('adminHotels');
        let hotels = hotelsStr ? JSON.parse(hotelsStr) : [];
        
        // 移除指定酒店
        hotels = hotels.filter(hotel => hotel.id !== hotelId);
        
        // 保存回localStorage
        localStorage.setItem('adminHotels', JSON.stringify(hotels));
        
        // 重新加载酒店列表
        loadAndDisplayHotels();
        
        // 显示成功消息
        alert('Hotel deleted successfully');
    } catch (e) {
        console.error('Error deleting hotel:', e);
        alert('Failed to delete hotel');
    }
}

/**
 * 初始化奢华客房管理
 */
function initLuxuriousRooms() {
    // 加载和显示奢华客房
    loadAndDisplayRooms();
    
    // 设置添加客房按钮
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', function() {
            // 重置表单
            const roomForm = document.getElementById('roomForm');
            if (roomForm) {
                roomForm.reset();
                
                // 清除隐藏ID字段
                const roomId = document.getElementById('roomId');
                if (roomId) {
                    roomId.value = '';
                }
                
                // 更新模态框标题
                const modalTitle = document.getElementById('roomModalTitle');
                if (modalTitle) {
                    modalTitle.innerHTML = '<i class="fas fa-bed"></i> Add New Room';
                }
                
                // 清除图片预览
                const imagePreview = document.getElementById('roomImagePreview');
                if (imagePreview) {
                    imagePreview.innerHTML = '';
                }
            }
            
            // 打开模态框
            if (typeof openModal === 'function') {
                openModal('roomModal');
            } else {
                const modal = document.getElementById('roomModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }
        });
    }
}

/**
 * 加载并显示奢华客房
 */
function loadAndDisplayRooms() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) {
        console.error('Rooms grid not found');
        return;
    }
    
    // 从localStorage获取客房
    const roomsStr = localStorage.getItem('adminRooms');
    const rooms = roomsStr ? JSON.parse(roomsStr) : [];
    
    // 清空列表
    roomsGrid.innerHTML = '';
    
    // 如果没有客房，显示提示
    if (rooms.length === 0) {
        roomsGrid.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-bed"></i>
                <p>No luxury rooms found. Click "Add New Room" to create some.</p>
            </div>
        `;
        return;
    }
    
    // 显示所有客房
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        roomCard.innerHTML = `
            <div class="room-image">
                ${room.imageUrl ? `<img src="${room.imageUrl}" alt="${room.name}">` : '<div class="no-image"><i class="fas fa-bed"></i></div>'}
            </div>
            <div class="room-info">
                <h3>${room.name}</h3>
                <div class="room-price"><i class="fas fa-dollar-sign"></i> $${room.price} per night</div>
                <p class="room-description">${room.description}</p>
                <div class="room-details">
                    <div class="room-detail"><i class="fas fa-ruler-combined"></i> ${room.size} m²</div>
                    <div class="room-detail"><i class="fas fa-bed"></i> ${room.bedType}</div>
                    <div class="room-detail"><i class="fas fa-wifi"></i> WiFi: ${room.hasWifi === 'yes' ? 'Available' : 'Not Available'}</div>
                </div>
            </div>
            <div class="room-actions">
                <button class="edit-room-btn" data-id="${room.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-room-btn" data-id="${room.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        roomsGrid.appendChild(roomCard);
    });
    
    // 添加编辑和删除事件处理
    setupRoomEventHandlers();
}

/**
 * 设置客房卡片的事件处理程序
 */
function setupRoomEventHandlers() {
    // 编辑按钮
    const editButtons = document.querySelectorAll('.edit-room-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.getAttribute('data-id');
            editRoom(roomId);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.delete-room-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
                deleteRoom(roomId);
            }
        });
    });
}

/**
 * 设置客房表单事件
 */
function setupRoomForm() {
    // 客房图片上传预览
    const roomImage = document.getElementById('roomImage');
    const roomImagePreview = document.getElementById('roomImagePreview');
    
    if (roomImage && roomImagePreview) {
        roomImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    roomImagePreview.innerHTML = `<img src="${event.target.result}" alt="预览" style="max-width: 100%; max-height: 200px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 客房表单提交
    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const roomId = document.getElementById('roomId').value;
            const name = document.getElementById('roomName').value.trim();
            const description = document.getElementById('roomDescription').value.trim();
            const price = document.getElementById('roomPrice').value;
            const size = document.getElementById('roomSize').value;
            const bedType = document.getElementById('bedType').value;
            const hasWifi = document.querySelector('input[name="hasWifi"]:checked').value;
            
            // 验证必填字段
            if (!name) {
                alert('Please enter a room name');
                return;
            }
            
            if (!description) {
                alert('Please enter a room description');
                return;
            }
            
            if (!price) {
                alert('Please enter a price per night');
                return;
            }
            
            if (!size) {
                alert('Please enter a room size');
                return;
            }
            
            // 创建客房对象
            const room = {
                id: roomId || 'room_' + Date.now(),
                name: name,
                description: description,
                price: price,
                size: size,
                bedType: bedType,
                hasWifi: hasWifi,
                createdAt: new Date().toISOString()
            };
            
            // 处理图片上传
            const roomImageInput = document.getElementById('roomImage');
            const preview = document.querySelector('#roomImagePreview img');
            
            if (roomImageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    room.imageUrl = e.target.result;
                    saveRoomToStorage(room);
                };
                reader.readAsDataURL(roomImageInput.files[0]);
            } else if (preview && preview.src) {
                // 保留现有图片
                room.imageUrl = preview.src;
                saveRoomToStorage(room);
            } else {
                // 没有图片但这是必填项
                alert('Please select a room image');
                return;
            }
        });
    }
    
    // 设置取消按钮
    const cancelBtn = roomForm.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (typeof closeModal === 'function') {
                closeModal('roomModal');
            } else {
                const modal = document.getElementById('roomModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }
}

/**
 * 保存客房到localStorage
 * @param {Object} room - 客房对象
 */
function saveRoomToStorage(room) {
    try {
        // 从localStorage获取现有客房
        const roomsStr = localStorage.getItem('adminRooms');
        let rooms = roomsStr ? JSON.parse(roomsStr) : [];
        
        // 确保是数组
        if (!Array.isArray(rooms)) {
            rooms = [];
        }
        
        // 检查是否存在具有相同ID的客房（编辑模式）
        const existingIndex = rooms.findIndex(r => r.id === room.id);
        
        if (existingIndex !== -1) {
            // 更新现有客房
            rooms[existingIndex] = room;
        } else {
            // 添加新客房
            rooms.push(room);
        }
        
        // 保存回localStorage
        localStorage.setItem('adminRooms', JSON.stringify(rooms));
        
        // 关闭模态框
        if (typeof closeModal === 'function') {
            closeModal('roomModal');
        } else {
            const modal = document.getElementById('roomModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // 重新加载客房列表
        loadAndDisplayRooms();
        
        // 显示成功消息
        alert('Room saved successfully');
    } catch (e) {
        console.error('Error saving room:', e);
        alert('Failed to save room');
    }
}

/**
 * 编辑客房
 * @param {string} roomId - 客房ID
 */
function editRoom(roomId) {
    // 从localStorage获取客房
    const roomsStr = localStorage.getItem('adminRooms');
    const rooms = roomsStr ? JSON.parse(roomsStr) : [];
    
    // 查找指定客房
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        console.error('Room not found:', roomId);
        return;
    }
    
    // 填充表单
    document.getElementById('roomId').value = room.id;
    document.getElementById('roomName').value = room.name;
    document.getElementById('roomDescription').value = room.description;
    document.getElementById('roomPrice').value = room.price;
    document.getElementById('roomSize').value = room.size;
    document.getElementById('bedType').value = room.bedType;
    
    // 设置WiFi单选按钮
    const hasWifiYes = document.querySelector('input[name="hasWifi"][value="yes"]');
    const hasWifiNo = document.querySelector('input[name="hasWifi"][value="no"]');
    if (room.hasWifi === 'yes') {
        hasWifiYes.checked = true;
    } else {
        hasWifiNo.checked = true;
    }
    
    // 设置图片预览
    const imagePreview = document.getElementById('roomImagePreview');
    if (room.imageUrl) {
        imagePreview.innerHTML = `<img src="${room.imageUrl}" alt="预览" style="max-width: 100%; max-height: 200px;">`;
    } else {
        imagePreview.innerHTML = '';
    }
    
    // 更新模态框标题
    const modalTitle = document.getElementById('roomModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-bed"></i> Edit Room';
    }
    
    // 打开模态框
    if (typeof openModal === 'function') {
        openModal('roomModal');
    } else {
        const modal = document.getElementById('roomModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

/**
 * 删除客房
 * @param {string} roomId - 客房ID
 */
function deleteRoom(roomId) {
    try {
        // 从localStorage获取客房
        const roomsStr = localStorage.getItem('adminRooms');
        let rooms = roomsStr ? JSON.parse(roomsStr) : [];
        
        // 移除指定客房
        rooms = rooms.filter(room => room.id !== roomId);
        
        // 保存回localStorage
        localStorage.setItem('adminRooms', JSON.stringify(rooms));
        
        // 重新加载客房列表
        loadAndDisplayRooms();
        
        // 显示成功消息
        alert('Room deleted successfully');
    } catch (e) {
        console.error('Error deleting room:', e);
        alert('Failed to delete room');
    }
} 