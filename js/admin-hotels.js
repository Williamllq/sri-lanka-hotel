/**
 * Admin Hotel Management
 * 处理管理员界面的酒店和房间管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Accommodations Management loaded');
    
    // 初始化酒店和房间管理
    initAccommodationsManagement();
});

/**
 * 初始化酒店管理功能
 */
function initAccommodationsManagement() {
    console.log('初始化客房管理');
    
    // 初始化奢华客房管理
    initLuxuriousRooms();
    
    // 设置客房表单事件
    setupRoomForm();
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
 * 加载并显示客房
 */
function loadAndDisplayRooms() {
    console.log('Loading and displaying rooms');
    
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) {
        console.error('Rooms grid element not found');
        return;
    }
    
    // 从localStorage获取客房
    const roomsStr = localStorage.getItem('adminRooms');
    console.log('Rooms data from localStorage:', roomsStr);
    
    let rooms = [];
    try {
        rooms = roomsStr ? JSON.parse(roomsStr) : [];
        console.log('Parsed rooms:', rooms);
        
        // 确保是数组
        if (!Array.isArray(rooms)) {
            console.warn('Rooms is not an array, resetting to empty array');
            rooms = [];
        }
    } catch (e) {
        console.error('Error parsing rooms data:', e);
        rooms = []; // 如果解析失败，使用空数组
    }
    
    // 清空现有内容
    roomsGrid.innerHTML = '';
    
    // 如果没有客房，显示提示
    if (rooms.length === 0) {
        console.log('No rooms found, displaying empty message');
        roomsGrid.innerHTML = `
            <div class="no-content-message">
                <i class="fas fa-bed"></i>
                <p>No luxury rooms found. Click "Add New Room" to create some.</p>
            </div>
        `;
        return;
    }
    
    console.log(`Displaying ${rooms.length} rooms`);
    
    // 显示所有客房
    rooms.forEach((room, index) => {
        console.log(`Creating card for room ${index + 1}:`, room.id);
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        roomCard.innerHTML = `
            <div class="room-image">
                ${room.imageUrl ? `<img src="${room.imageUrl}" alt="${room.name}">` : '<div class="no-image"><i class="fas fa-bed"></i></div>'}
            </div>
            <div class="room-info">
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="room-details">
                    <span><i class="fas fa-bed"></i> ${room.bedType}</span>
                    <span><i class="fas fa-ruler-combined"></i> ${room.size} m²</span>
                    <span><i class="fas fa-wifi"></i> ${room.hasWifi === 'yes' ? 'WiFi Included' : 'No WiFi'}</span>
                </div>
                <div class="room-price">$${room.price} per night</div>
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
    
    // 设置客房卡片的事件处理
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
            // 阻止表单默认提交行为
            e.preventDefault();
            console.log('Room form submitted');
            
            // 获取表单数据
            const roomId = document.getElementById('roomId').value;
            const name = document.getElementById('roomName').value;
            const description = document.getElementById('roomDescription').value;
            const price = document.getElementById('roomPrice').value;
            const size = document.getElementById('roomSize').value;
            const bedType = document.getElementById('bedType').value;
            const hasWifi = document.querySelector('input[name="hasWifi"]:checked').value;
            
            // 数据验证
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
            
            console.log('Created room object:', room);
            
            // 处理图片上传
            const roomImageInput = document.getElementById('roomImage');
            const preview = document.querySelector('#roomImagePreview img');
            
            if (roomImageInput.files && roomImageInput.files[0]) {
                console.log('New image file selected');
                const file = roomImageInput.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    room.imageUrl = e.target.result;
                    console.log('Image loaded, saving room');
                    saveRoomToStorage(room);
                };
                reader.onerror = function(error) {
                    console.error('Error reading file:', error);
                    alert('Failed to read image file');
                };
                reader.readAsDataURL(file);
            } else if (preview && preview.src) {
                // 保留现有图片
                console.log('Using existing image');
                room.imageUrl = preview.src;
                saveRoomToStorage(room);
            } else if (roomId) {
                // 编辑模式，但没有更改图片 - 从存储中获取现有图片
                console.log('Edit mode without image change');
                const roomsStr = localStorage.getItem('adminRooms');
                if (roomsStr) {
                    try {
                        const rooms = JSON.parse(roomsStr);
                        const existingRoom = rooms.find(r => r.id === roomId);
                        if (existingRoom && existingRoom.imageUrl) {
                            room.imageUrl = existingRoom.imageUrl;
                            console.log('Found existing image, saving room');
                            saveRoomToStorage(room);
                            return;
                        }
                    } catch (e) {
                        console.error('Error parsing rooms from localStorage:', e);
                    }
                }
                // 如果找不到现有图片，请求用户上传
                alert('Please select a room image');
            } else {
                // 新增模式，但没有选择图片
                console.log('New room without image');
                alert('Please select a room image');
            }
        });
    } else {
        console.error('Room form not found');
    }
    
    // 设置取消按钮
    const cancelBtn = document.querySelector('#roomForm .cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('Cancel button clicked');
            if (typeof closeModal === 'function') {
                closeModal('roomModal');
            } else {
                const modal = document.getElementById('roomModal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                }
            }
        });
    } else {
        console.warn('Cancel button not found in room form');
    }
}

/**
 * 保存客房到localStorage
 * @param {Object} room - 客房对象
 */
function saveRoomToStorage(room) {
    try {
        console.log('Saving room to storage:', room);
        
        // 从localStorage获取现有客房
        const roomsStr = localStorage.getItem('adminRooms');
        console.log('Current rooms from localStorage:', roomsStr);
        
        let rooms = [];
        try {
            rooms = roomsStr ? JSON.parse(roomsStr) : [];
            // 确保是数组
            if (!Array.isArray(rooms)) {
                console.warn('Rooms is not an array, resetting to empty array');
                rooms = [];
            }
        } catch (parseError) {
            console.error('Error parsing rooms from localStorage:', parseError);
            rooms = [];
        }
        
        console.log('Parsed rooms:', rooms);
        
        // 检查是否存在具有相同ID的客房（编辑模式）
        const existingIndex = rooms.findIndex(r => r.id === room.id);
        console.log('Existing room index:', existingIndex);
        
        if (existingIndex !== -1) {
            // 更新现有客房
            rooms[existingIndex] = room;
            console.log('Updated existing room at index', existingIndex);
        } else {
            // 添加新客房
            rooms.push(room);
            console.log('Added new room, total rooms:', rooms.length);
        }
        
        // 保存回localStorage (管理员界面使用)
        const roomsJson = JSON.stringify(rooms);
        console.log('Saving rooms to localStorage (adminRooms):', roomsJson);
        localStorage.setItem('adminRooms', roomsJson);
        
        // 同时保存到前端使用的siteRooms键
        console.log('Saving rooms to localStorage (siteRooms)');
        
        // 转换为前端可用的格式
        const siteRooms = rooms.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            price: r.price,
            size: r.size,
            bedType: r.bedType,
            hasWifi: r.hasWifi === 'yes',
            imageUrl: r.imageUrl
        }));
        
        localStorage.setItem('siteRooms', JSON.stringify(siteRooms));
        console.log('Rooms saved to siteRooms:', siteRooms);
        
        // 关闭模态框
        console.log('Attempting to close room modal');
        if (typeof closeModal === 'function') {
            closeModal('roomModal');
        } else {
            console.warn('closeModal function not found, using alternative method');
            const modal = document.getElementById('roomModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            } else {
                console.error('Room modal element not found');
            }
        }
        
        // 重新加载客房列表
        console.log('Reloading rooms display');
        loadAndDisplayRooms();
        
        // 显示成功消息
        alert('Room saved successfully');
    } catch (e) {
        console.error('Error saving room:', e);
        alert('Failed to save room: ' + e.message);
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
        console.log('Deleting room:', roomId);
        
        // 从localStorage获取客房
        const roomsStr = localStorage.getItem('adminRooms');
        let rooms = roomsStr ? JSON.parse(roomsStr) : [];
        
        // 移除指定客房
        rooms = rooms.filter(room => room.id !== roomId);
        
        // 保存回localStorage (管理员界面使用)
        console.log('Saving updated rooms to adminRooms after deletion');
        localStorage.setItem('adminRooms', JSON.stringify(rooms));
        
        // 同步删除前端显示的房间
        console.log('Updating siteRooms after deletion');
        const siteRoomsStr = localStorage.getItem('siteRooms');
        let siteRooms = siteRoomsStr ? JSON.parse(siteRoomsStr) : [];
        
        // 从siteRooms中移除相同ID的房间
        siteRooms = siteRooms.filter(room => room.id !== roomId);
        localStorage.setItem('siteRooms', JSON.stringify(siteRooms));
        
        // 重新加载客房列表
        loadAndDisplayRooms();
        
        // 显示成功消息
        alert('Room deleted successfully');
    } catch (e) {
        console.error('Error deleting room:', e);
        alert('Failed to delete room: ' + e.message);
    }
} 