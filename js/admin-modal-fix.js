/**
 * Admin Modal Fix
 * 这个文件用来修复管理员界面模态框按钮不工作的问题
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Modal Fix loaded');
    setTimeout(fixModals, 500); // 给页面一些时间加载所有元素
});

/**
 * 修复模态框按钮的函数
 */
function fixModals() {
    // 定义模态框按钮映射
    const buttonModalMap = [
        { buttonId: 'uploadPictureBtn', modalId: 'uploadModal' },
        { buttonId: 'addToCarouselBtn', modalId: 'carouselModal' },
        { buttonId: 'addHotelBtn', modalId: 'hotelModal' },
        { buttonId: 'addRoomBtn', modalId: 'roomModal' },
        { buttonId: 'addArticleBtn', modalId: 'articleModal' },
        { buttonId: 'addVideoBtn', modalId: 'videoModal' },
        { buttonId: 'addLinkBtn', modalId: 'linkModal' },
        { buttonId: 'organizePicturesBtn', modalId: 'organizeFoldersModal' }
    ];

    // 添加按钮点击事件处理程序
    buttonModalMap.forEach(mapping => {
        const button = document.getElementById(mapping.buttonId);
        const modal = document.getElementById(mapping.modalId);
        
        if (button && modal) {
            console.log(`设置按钮事件处理程序: ${mapping.buttonId} -> ${mapping.modalId}`);
            
            // 移除可能的现有事件监听器
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 添加新的事件监听器
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`打开模态框: ${mapping.modalId}`);
                openModal(mapping.modalId);
            });
        } else {
            console.warn(`未找到按钮或模态框: ${mapping.buttonId} -> ${mapping.modalId}`);
        }
    });

    // 设置关闭按钮事件处理程序
    const closeButtons = document.querySelectorAll('.close-modal, .admin-btn.secondary.cancel-upload, .cancel-btn');
    closeButtons.forEach(button => {
        // 移除可能的现有事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 添加新的事件监听器
        newButton.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                console.log(`关闭模态框: ${modal.id}`);
                closeModal(modal.id);
            }
        });
    });

    // 点击模态框外部关闭模态框
    document.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.admin-modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                console.log(`点击外部关闭模态框: ${modal.id}`);
                closeModal(modal.id);
            }
        });
    });
}

/**
 * 打开指定的模态框
 * @param {string} modalId - 要打开的模态框ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 确保模态框中的表单重置
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 添加CSS类
        if (!modal.classList.contains('active')) {
            modal.classList.add('active');
        }
        
        // 添加body类
        document.body.classList.add('modal-open');
        
        // 创建背景遮罩
        if (!document.querySelector('.modal-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
        }
    }
}

/**
 * 关闭指定的模态框
 * @param {string} modalId - 要关闭的模态框ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // 隐藏模态框
        modal.style.display = 'none';
        
        // 移除CSS类
        modal.classList.remove('active');
        
        // 移除body类
        document.body.classList.remove('modal-open');
        
        // 移除背景遮罩
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.parentNode.removeChild(backdrop);
        }
    }
} 