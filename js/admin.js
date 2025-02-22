// 管理员面板功能
document.addEventListener('DOMContentLoaded', function() {
    // 示例数据
    const adminData = {
        visits: 1234,
        bookings: 56,
        rating: 4.8,
        popularRoutes: [
            'Airport - Colombo',
            'Colombo - Kandy',
            'Galle - Mirissa'
        ]
    };

    // 更新统计数据
    function updateStats() {
        document.getElementById('totalVisits').textContent = adminData.visits;
        document.getElementById('totalBookings').textContent = adminData.bookings;
        document.getElementById('avgRating').textContent = adminData.rating;
        
        const routesList = document.getElementById('popularRoutes');
        routesList.innerHTML = adminData.popularRoutes
            .map(route => `<div class="route-item">${route}</div>`)
            .join('');
    }

    // 初始化
    updateStats();
}); 