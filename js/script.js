// Gallery filtering and masonry layout
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // 初始化 - 显示所有项目
    function showAll() {
        galleryItems.forEach(item => {
            item.style.display = 'block';
            item.style.opacity = '1';
        });
    }
    
    // 初始化时显示所有项目
    showAll();
    
    // 设置筛选按钮点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活动状态
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // 筛选项目
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // 添加悬停效果
    galleryItems.forEach(item => {
        const info = item.querySelector('.gallery-item-info');
        if (info) {
            item.addEventListener('mouseenter', function() {
                info.style.opacity = '1';
                info.style.transform = 'translateY(0)';
            });
            
            item.addEventListener('mouseleave', function() {
                info.style.opacity = '0.7';
                info.style.transform = 'translateY(10px)';
            });
        }
    });
}); 