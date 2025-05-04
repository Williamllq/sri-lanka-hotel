/**
 * Admin Button Fix
 * 这个文件修复管理员界面按钮无法点击的问题
 * 包括侧边栏导航、模态框按钮和表单提交
 */

(function() {
    'use strict';
    
    // 当DOM加载完成时执行
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Button Fix loaded');
        
        // 延迟执行以确保其他脚本已加载
        setTimeout(function() {
            fixSidebarNavigation();
            fixModalButtons();
            fixActionButtons();
            fixFormSubmissions();
            
            // 设置定期检查，处理可能动态添加的元素
            setInterval(checkForNewElements, 1000);
        }, 500);
    });
    
    // 修复侧边栏导航
    function fixSidebarNavigation() {
        console.log('修复侧边栏导航');
        const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
        
        sidebarMenuItems.forEach(function(item) {
            const link = item.querySelector('a');
            if (!link) return;
            
            // 克隆链接以移除旧事件监听器
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // 添加新的点击事件处理程序
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const sectionId = this.getAttribute('href').substring(1);
                console.log('点击侧边栏菜单:', sectionId);
                
                // 切换活动菜单项
                sidebarMenuItems.forEach(function(menuItem) {
                    menuItem.classList.remove('active');
                });
                item.classList.add('active');
                
                // 切换显示的部分
                const sections = document.querySelectorAll('.admin-section');
                sections.forEach(function(section) {
                    section.classList.remove('active');
                });
                
                const targetSection = document.getElementById(sectionId + 'Section');
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // 更新URL哈希
                window.location.hash = sectionId;
            }, true);
        });
        
        // 修复侧边栏切换按钮
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            const newToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
            
            newToggle.addEventListener('click', function() {
                const adminLayout = document.querySelector('.admin-layout');
                if (adminLayout) {
                    adminLayout.classList.toggle('sidebar-collapsed');
                }
            }, true);
        }
    }
    
    // 修复模态框按钮
    function fixModalButtons() {
        console.log('修复模态框按钮');
        
        // 映射按钮ID到模态框ID
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
        
        // 为每个按钮添加事件处理程序
        buttonModalMap.forEach(function(mapping) {
            const button = document.getElementById(mapping.buttonId);
            const modal = document.getElementById(mapping.modalId);
            
            if (button && modal) {
                console.log(`设置模态框按钮: ${mapping.buttonId} -> ${mapping.modalId}`);
                
                // 克隆按钮以移除旧事件监听器
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // 确保按钮样式正确
                newButton.style.position = 'relative';
                newButton.style.zIndex = '1000';
                newButton.style.cursor = 'pointer';
                newButton.style.pointerEvents = 'auto';
                
                // 添加新的点击事件
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`打开模态框: ${mapping.modalId}`);
                    openModal(mapping.modalId);
                    return false;
                }, true);
            }
        });
        
        // 修复关闭按钮
        const closeButtons = document.querySelectorAll('.close-modal, .cancel-btn, [data-dismiss="modal"]');
        closeButtons.forEach(function(button) {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 确保按钮样式正确
            newButton.style.position = 'relative';
            newButton.style.zIndex = '1001';
            newButton.style.cursor = 'pointer';
            newButton.style.pointerEvents = 'auto';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const modal = this.closest('.admin-modal');
                if (modal) {
                    console.log(`关闭模态框: ${modal.id}`);
                    closeModal(modal.id);
                }
                return false;
            }, true);
        });
        
        // 点击模态框背景关闭模态框
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('admin-modal') && e.target.classList.contains('active')) {
                closeModal(e.target.id);
            }
        }, true);
    }
    
    // 修复操作按钮（编辑、删除等）
    function fixActionButtons() {
        console.log('修复操作按钮');
        
        // 图片编辑按钮
        const editPictureButtons = document.querySelectorAll('.edit-picture');
        editPictureButtons.forEach(function(button) {
            if (button.hasAttribute('data-fixed')) return;
            
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.setAttribute('data-fixed', 'true');
            
            // 确保按钮样式正确
            newButton.style.position = 'relative';
            newButton.style.zIndex = '1000';
            newButton.style.cursor = 'pointer';
            newButton.style.pointerEvents = 'auto';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const pictureId = this.getAttribute('data-id');
                console.log(`编辑图片: ${pictureId}`);
                
                if (typeof editPicture === 'function') {
                    editPicture(pictureId);
                } else {
                    console.error('editPicture函数未定义');
                }
                
                return false;
            }, true);
        });
        
        // 图片删除按钮
        const deletePictureButtons = document.querySelectorAll('.delete-picture');
        deletePictureButtons.forEach(function(button) {
            if (button.hasAttribute('data-fixed')) return;
            
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.setAttribute('data-fixed', 'true');
            
            // 确保按钮样式正确
            newButton.style.position = 'relative';
            newButton.style.zIndex = '1000';
            newButton.style.cursor = 'pointer';
            newButton.style.pointerEvents = 'auto';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const pictureId = this.getAttribute('data-id');
                console.log(`删除图片: ${pictureId}`);
                
                if (confirm('确定要删除这张图片吗？此操作无法撤销。')) {
                    if (typeof deletePicture === 'function') {
                        deletePicture(pictureId);
                    } else {
                        console.error('deletePicture函数未定义');
                    }
                }
                
                return false;
            }, true);
        });
        
        // 酒店编辑按钮
        const editHotelButtons = document.querySelectorAll('.edit-hotel');
        editHotelButtons.forEach(function(button) {
            if (button.hasAttribute('data-fixed')) return;
            
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.setAttribute('data-fixed', 'true');
            
            // 确保按钮样式正确
            newButton.style.position = 'relative';
            newButton.style.zIndex = '1000';
            newButton.style.cursor = 'pointer';
            newButton.style.pointerEvents = 'auto';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hotelId = this.getAttribute('data-id');
                console.log(`编辑酒店: ${hotelId}`);
                
                if (typeof editHotel === 'function') {
                    editHotel(hotelId);
                } else {
                    console.error('editHotel函数未定义');
                }
                
                return false;
            }, true);
        });
        
        // 酒店删除按钮
        const deleteHotelButtons = document.querySelectorAll('.delete-hotel');
        deleteHotelButtons.forEach(function(button) {
            if (button.hasAttribute('data-fixed')) return;
            
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.setAttribute('data-fixed', 'true');
            
            // 确保按钮样式正确
            newButton.style.position = 'relative';
            newButton.style.zIndex = '1000';
            newButton.style.cursor = 'pointer';
            newButton.style.pointerEvents = 'auto';
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hotelId = this.getAttribute('data-id');
                console.log(`删除酒店: ${hotelId}`);
                
                if (confirm('确定要删除这个酒店吗？此操作无法撤销。')) {
                    if (typeof deleteHotel === 'function') {
                        deleteHotel(hotelId);
                    } else {
                        console.error('deleteHotel函数未定义');
                    }
                }
                
                return false;
            }, true);
        });
        
        // 其他常见按钮类型
        const commonButtonSelectors = [
            '.admin-btn', 
            'button[type="button"]', 
            'button[type="submit"]', 
            '.btn'
        ];
        
        document.querySelectorAll(commonButtonSelectors.join(', ')).forEach(function(button) {
            if (button.hasAttribute('data-fixed')) return;
            if (button.classList.contains('edit-picture') || 
                button.classList.contains('delete-picture') ||
                button.classList.contains('edit-hotel') ||
                button.classList.contains('delete-hotel')) {
                return; // 跳过已处理的按钮
            }
            
            // 确保按钮样式正确
            button.style.position = 'relative';
            button.style.zIndex = '1000';
            button.style.cursor = 'pointer';
            button.style.pointerEvents = 'auto';
            button.setAttribute('data-fixed', 'true');
        });
    }
    
    // 修复表单提交
    function fixFormSubmissions() {
        console.log('修复表单提交');
        
        // 上传图片表单
        const uploadPictureForm = document.getElementById('uploadPictureForm');
        if (uploadPictureForm) {
            uploadPictureForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('提交上传图片表单');
                
                if (typeof handlePictureUpload === 'function') {
                    handlePictureUpload();
                } else {
                    console.error('handlePictureUpload函数未定义');
                }
                
                return false;
            }, true);
        }
        
        // 图片上传保存按钮
        const savePictureBtn = document.getElementById('savePictureBtn');
        if (savePictureBtn) {
            const newButton = savePictureBtn.cloneNode(true);
            savePictureBtn.parentNode.replaceChild(newButton, savePictureBtn);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('点击保存图片按钮');
                
                if (typeof handlePictureUpload === 'function') {
                    handlePictureUpload();
                } else {
                    console.error('handlePictureUpload函数未定义');
                }
                
                return false;
            }, true);
        }
        
        // 编辑图片保存按钮
        const updatePictureBtn = document.getElementById('updatePictureBtn');
        if (updatePictureBtn) {
            const newButton = updatePictureBtn.cloneNode(true);
            updatePictureBtn.parentNode.replaceChild(newButton, updatePictureBtn);
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('点击更新图片按钮');
                
                const pictureId = document.getElementById('editPictureId').value;
                const pictureName = document.getElementById('editPictureName').value;
                const category = document.getElementById('editCategory').value;
                const description = document.getElementById('editPictureDescription').value;
                
                if (typeof updatePicture === 'function') {
                    updatePicture(pictureId, pictureName, category, description);
                    closeModal('editPictureModal');
                } else {
                    console.error('updatePicture函数未定义');
                }
                
                return false;
            }, true);
        }
    }
    
    // 检查并修复新添加的元素
    function checkForNewElements() {
        // 检查新的编辑/删除按钮
        document.querySelectorAll('.edit-picture:not([data-fixed]), .delete-picture:not([data-fixed]), .edit-hotel:not([data-fixed]), .delete-hotel:not([data-fixed])').forEach(function(button) {
            console.log('发现新按钮:', button);
            fixActionButtons();
        });
    }
    
    // 打开模态框函数
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`模态框未找到: ${modalId}`);
            return;
        }
        
        // 关闭所有其他模态框
        document.querySelectorAll('.admin-modal.active').forEach(function(otherModal) {
            if (otherModal.id !== modalId) {
                otherModal.classList.remove('active');
                otherModal.style.display = 'none';
            }
        });
        
        // 显示当前模态框
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // 确保模态框内容可交互
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.style.zIndex = '2001';
            modalContent.style.pointerEvents = 'auto';
        }
        
        console.log(`模态框已打开: ${modalId}`);
    }
    
    // 关闭模态框函数
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`模态框未找到: ${modalId}`);
            return;
        }
        
        // 隐藏模态框
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        console.log(`模态框已关闭: ${modalId}`);
    }
    
    // 将函数暴露给全局作用域，以便其他脚本可以使用
    window.adminButtonFix = {
        openModal: openModal,
        closeModal: closeModal,
        fixActionButtons: fixActionButtons,
        fixModalButtons: fixModalButtons
    };
})(); 