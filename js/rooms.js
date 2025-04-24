// rooms.js - 处理房间数据显示在前端页面
document.addEventListener('DOMContentLoaded', function() {
    displayRooms();
});

// 从localStorage加载并显示房间数据
function displayRooms() {
    const roomsContainer = document.querySelector('.rooms-grid');
    if (!roomsContainer) return;
    
    // 尝试从localStorage获取房间数据
    let rooms = [];
    try {
        rooms = JSON.parse(localStorage.getItem('siteRooms') || '[]');
    } catch (e) {
        console.error('Error loading rooms data:', e);
    }
    
    // 如果没有房间数据，使用默认房间
    if (!rooms || rooms.length === 0) {
        rooms = [
            {
                id: 1,
                name: 'Ocean View Suite',
                description: 'Wake up to breathtaking views of the Indian Ocean',
                price: '250',
                size: '55',
                bedType: 'King Bed',
                hasWifi: true,
                imageUrl: 'images/accommodations/ocean-suite.jpg'
            },
            {
                id: 2,
                name: 'Tropical Garden Suite',
                description: 'Immerse yourself in lush tropical gardens',
                price: '180',
                size: '45',
                bedType: 'Queen Bed',
                hasWifi: true,
                imageUrl: 'images/accommodations/garden-suite.jpg'
            },
            {
                id: 3,
                name: 'Private Pool Villa',
                description: 'Ultimate luxury with your own infinity pool',
                price: '450',
                size: '120',
                bedType: 'King Bed',
                hasWifi: true,
                imageUrl: 'images/accommodations/pool-villa.jpg'
            }
        ];
        
        // 保存默认房间数据到localStorage
        try {
            localStorage.setItem('siteRooms', JSON.stringify(rooms));
        } catch (e) {
            console.error('Error saving default rooms data:', e);
        }
    }
    
    // 清空容器
    roomsContainer.innerHTML = '';
    
    // 创建并添加每个房间卡片，保持与现有前端结构一致
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        // 创建与index.html相同结构的房间卡片
        roomCard.innerHTML = `
            <div class="room-image" style="background-image: url('${room.imageUrl}');">
                <!-- 使用背景图片保持与现有CSS一致 -->
            </div>
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <div class="room-details">
                <span><i class="fas fa-bed"></i> ${room.bedType}</span>
                <span><i class="fas fa-ruler-combined"></i> ${room.size} m²</span>
                ${room.hasWifi ? '<span><i class="fas fa-wifi"></i> Free WiFi</span>' : ''}
            </div>
            <a href="#" class="btn-secondary">From $${room.price}/night</a>
        `;
        
        roomsContainer.appendChild(roomCard);
    });
} 