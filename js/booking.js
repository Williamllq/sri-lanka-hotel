/**
 * Booking functionality for transport services
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking functionality
    initBookingSystem();
    
    // Initialize the confirmation modal
    initConfirmationModal();
    
    // Synchronize existing bookings to admin panel format
    synchronizeBookings();
    
    // 添加表单滚动位置记忆功能
    initFormScrollMemory();
    
    // 添加"Book Transport"按钮跳转到预订表单功能
    initBookTransportButton();
});

/**
 * 初始化"Book Transport"按钮跳转功能
 */
function initBookTransportButton() {
    // 检查是否为移动设备，为桌面和移动设备提供不同的实现
    const isMobile = /Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent);
    
    // 查找所有"Book Transport"按钮
    const bookTransportButtons = document.querySelectorAll('a[href="#booking-form-anchor"]');
    
    bookTransportButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标元素
            const bookingFormAnchor = document.getElementById('booking-form-anchor');
            if (!bookingFormAnchor) {
                console.error('Booking form anchor not found');
                return;
            }
            
            // 计算目标滚动位置（考虑任何固定标题的高度）
            const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
            const targetPosition = bookingFormAnchor.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            // 使用更简单的滚动方法用于桌面设备
            if (!isMobile) {
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                return;
            }
            
            // 以下是移动设备的增强滚动实现
            // 检查页面是否已经加载完成
            if (document.readyState === 'complete') {
                performSmoothScroll(targetPosition);
            } else {
                // 如果页面还在加载，等待加载完成再滚动
                window.addEventListener('load', function() {
                    performSmoothScroll(targetPosition);
                });
            }
        });
    });
    
    /**
     * 执行平滑滚动并确保在移动设备上正确工作
     * @param {number} targetPosition - 目标滚动位置
     */
    function performSmoothScroll(targetPosition) {
        // 使用更可靠的方法滚动到目标位置
        try {
            // 尝试使用平滑滚动
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // 确保我们确实到达了目标位置（可能的滚动干扰）
            setTimeout(function() {
                const currentPos = window.pageYOffset;
                const targetDiff = Math.abs(currentPos - targetPosition);
                
                // 如果我们不在目标位置附近，尝试再次滚动
                if (targetDiff > 50) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'auto'
                    });
                    
                    // 聚焦到表单的第一个输入元素以引导用户
                    setTimeout(function() {
                        const serviceTypeSelect = document.getElementById('serviceType');
                        if (serviceTypeSelect) {
                            serviceTypeSelect.focus();
                        }
                    }, 500);
                }
            }, 1000);
        } catch (e) {
            // 回退到基本滚动方法
            console.error('Smooth scroll failed, using fallback', e);
            window.scrollTo(0, targetPosition);
        }
    }
    
    // 初始化页面加载时的直接跳转处理
    if (window.location.hash === '#booking-form-anchor') {
        // 等待DOM加载完毕再处理哈希值
        setTimeout(function() {
            const bookingFormAnchor = document.getElementById('booking-form-anchor');
            if (bookingFormAnchor) {
                const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
                const targetPosition = bookingFormAnchor.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
            }
        }, 500);
    }
}

/**
 * 初始化表单滚动位置记忆功能
 * 防止移动端用户填写表单时页面跳回顶部
 */
function initFormScrollMemory() {
    // 检查是否为移动设备，桌面设备不需要此功能
    const isMobile = /Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent);
    
    // 如果是桌面设备，仅设置基本的表单功能，不添加滚动位置管理
    if (!isMobile) {
        console.log('Desktop device detected - not applying scroll position management');
        return;
    }
    
    console.log('Mobile device detected - applying scroll position management');
    
    // 要监听的表单元素
    const formElements = [
        'serviceType',
        'journeyDate',
        'journeyTime',
        'passengerCount',
        'pickupLocation',
        'destinationLocation',
        'specialRequirements'
    ];
    
    // 记录上次触发的时间，用于防止过于频繁的滚动恢复
    let lastRestoreTime = 0;
    
    // 增强版的恢复滚动位置函数
    function enhancedRestoreScrollPosition() {
        const now = Date.now();
        // 确保至少间隔100ms才恢复滚动位置，避免频繁恢复导致的问题
        if (now - lastRestoreTime > 100) {
            lastRestoreTime = now;
            // 使用更可靠的方式恢复滚动位置
            if (lastScrollPosition > 0) {
                window.scrollTo({
                    top: lastScrollPosition,
                    behavior: 'auto' // 使用'auto'而不是'smooth'以避免动画过渡
                });
                console.log('Restored scroll position:', lastScrollPosition);
            }
        }
    }
    
    // 为每个表单元素添加增强的事件监听器
    formElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            // 保存当前滚动位置
            element.addEventListener('focus', saveScrollPosition);
            
            // 针对不同类型的元素添加不同的事件监听器
            if (element.tagName === 'SELECT') {
                element.addEventListener('change', enhancedRestoreScrollPosition);
                element.addEventListener('touchend', saveScrollPosition); // 触摸结束后保存位置
            } else if (element.type === 'date' || element.type === 'time') {
                // 对日期和时间输入添加更多事件监听
                element.addEventListener('change', enhancedRestoreScrollPosition);
                element.addEventListener('blur', enhancedRestoreScrollPosition);
                element.addEventListener('touchend', saveScrollPosition);
                element.addEventListener('touchcancel', enhancedRestoreScrollPosition);
                
                // 对日期和时间输入添加特殊处理，以解决本地日期选择器问题
                element.addEventListener('click', function(e) {
                    saveScrollPosition();
                    // 使用MutationObserver监控DOM变化，在选择器关闭后恢复滚动位置
                    const observer = new MutationObserver(function(mutations) {
                        setTimeout(enhancedRestoreScrollPosition, 300);
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                    // 5秒后自动断开观察器
                    setTimeout(() => observer.disconnect(), 5000);
                });
                
                // 防止隐藏输入相关的滚动跳转
                // 这是处理iOS和Android原生日期/时间选择器的关键部分
                element.addEventListener('touchstart', function(e) {
                    saveScrollPosition();
                    e.stopPropagation(); // 阻止事件冒泡
                });
            } else {
                element.addEventListener('blur', enhancedRestoreScrollPosition);
                element.addEventListener('touchend', function(e) {
                    // 输入完成后保存位置
                    saveScrollPosition();
                    setTimeout(enhancedRestoreScrollPosition, 100);
                });
            }
        }
    });
    
    // 防止地图选择框关闭后页面跳转
    document.addEventListener('click', function(event) {
        const mapModal = document.getElementById('mapModal');
        if (mapModal && mapModal.style.display === 'flex' && !mapModal.contains(event.target)) {
            saveScrollPosition();
            setTimeout(enhancedRestoreScrollPosition, 300);
        }
    });
    
    // 防止表单提交时页面跳转
    const getQuoteBtn = document.getElementById('getQuoteBtn');
    const bookNowBtn = document.getElementById('bookNowBtn');
    
    if (getQuoteBtn) {
        getQuoteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveScrollPosition();
            calculateQuote();
            setTimeout(enhancedRestoreScrollPosition, 300);
        });
    }
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveScrollPosition();
            processBooking();
            // 不在这里恢复滚动位置，因为可能会显示确认模态框
        });
    }
    
    // 添加地图选择按钮的事件处理
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    
    if (pickupMapBtn) {
        pickupMapBtn.addEventListener('click', saveScrollPosition);
    }
    
    if (destinationMapBtn) {
        destinationMapBtn.addEventListener('click', saveScrollPosition);
    }
    
    // 监听窗口大小变化和屏幕方向变化，保持滚动位置
    window.addEventListener('resize', function() {
        setTimeout(enhancedRestoreScrollPosition, 100);
    });
    
    window.addEventListener('orientationchange', function() {
        saveScrollPosition();
        setTimeout(enhancedRestoreScrollPosition, 300);
    });
    
    // 阻止日期时间输入框的浏览器默认行为
    preventDefaultDateTimeScrolling();
}

/**
 * 阻止日期和时间输入框的浏览器默认滚动行为
 */
function preventDefaultDateTimeScrolling() {
    // 首先检查是否为移动设备，如果不是，直接返回
    if (!(/Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent))) {
        console.log('Desktop detected, not applying mobile scroll fixes');
        return;
    }
    
    const dateInput = document.getElementById('journeyDate');
    const timeInput = document.getElementById('journeyTime');
    
    // 用自定义处理替换原生日期选择器的函数
    function createCustomDateTimePicker(input, type) {
        if (!(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))) {
            return; // 只在移动设备上应用这个增强功能
        }
        
        // 设置为只读，防止键盘弹出
        input.setAttribute('readonly', 'readonly');
        
        // 创建一个隐藏的原生输入，用于实际选择
        const hiddenInput = document.createElement('input');
        hiddenInput.type = type;
        hiddenInput.style.position = 'absolute';
        hiddenInput.style.opacity = '0';
        hiddenInput.style.height = '0';
        hiddenInput.style.width = '0';
        hiddenInput.style.pointerEvents = 'none';
        document.body.appendChild(hiddenInput);
        
        // 当用户点击输入框时的处理
        input.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 保存滚动位置
            saveScrollPosition();
            const currentValue = input.value;
            
            // 重要：阻止任何可能的滚动，但只在移动设备上
            const preventScroll = (e) => {
                if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.scrollTo(0, lastScrollPosition);
                }
            };
            
            // 监听滚动事件
            window.addEventListener('scroll', preventScroll, { passive: false });
            
            // 点击隐藏输入打开日期/时间选择器
            hiddenInput.value = currentValue;
            hiddenInput.focus();
            hiddenInput.click();
            
            // 处理选择结果
            hiddenInput.addEventListener('change', function onChangeOnce() {
                input.value = hiddenInput.value;
                
                // 触发change事件，让其他代码知道值已更改
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
                
                // 恢复滚动位置
                setTimeout(() => {
                    window.removeEventListener('scroll', preventScroll);
                    
                    // 多次尝试恢复滚动位置，确保成功（但只在移动设备上）
                    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => {
                                if (lastScrollPosition > 0) {
                                    window.scrollTo({
                                        top: lastScrollPosition,
                                        behavior: 'auto'
                                    });
                                }
                            }, i * 100);
                        }
                    }
                }, 100);
                
                // 移除一次性事件监听器
                hiddenInput.removeEventListener('change', onChangeOnce);
            });
            
            // 监听blur事件，处理用户取消选择的情况
            hiddenInput.addEventListener('blur', function onBlurOnce() {
                setTimeout(() => {
                    window.removeEventListener('scroll', preventScroll);
                    
                    if (lastScrollPosition > 0 && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        window.scrollTo({
                            top: lastScrollPosition,
                            behavior: 'auto'
                        });
                    }
                }, 300);
                
                hiddenInput.removeEventListener('blur', onBlurOnce);
            });
        });
    }
    
    // 应用到日期和时间输入
    if (dateInput) {
        createCustomDateTimePicker(dateInput, 'date');
    }
    
    if (timeInput) {
        createCustomDateTimePicker(timeInput, 'time');
    }
    
    // 为表单添加总体处理，防止任何元素导致页面跳转
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('touchstart', function(e) {
            // 保存当前滚动位置
            saveScrollPosition();
        }, { passive: true });
        
        // 确保任何输入完成后滚动位置被正确恢复
        bookingForm.addEventListener('touchend', function(e) {
            // 延迟执行以确保其他事件处理完成
            setTimeout(function() {
                if (lastScrollPosition > 0 && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.scrollTo({
                        top: lastScrollPosition,
                        behavior: 'auto'
                    });
                }
            }, 100);
        }, { passive: true });
    }
}

// 保存滚动位置的变量
let lastScrollPosition = 0;

/**
 * 保存当前滚动位置
 */
function saveScrollPosition() {
    // 只在移动设备上保存滚动位置，避免影响桌面端滚动
    if (/Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent)) {
        lastScrollPosition = window.scrollY || window.pageYOffset;
        console.log('Saved scroll position:', lastScrollPosition);
    }
}

/**
 * 恢复保存的滚动位置
 */
function restoreScrollPosition() {
    // 只在移动设备上恢复滚动位置
    if (/Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent)) {
        // 使用setTimeout确保在DOM更新后恢复滚动位置
        setTimeout(function() {
            if (lastScrollPosition > 0) {
                window.scrollTo({
                    top: lastScrollPosition,
                    behavior: 'auto' // 使用'auto'而不是'smooth'以避免动画过渡
                });
                console.log('Restored scroll position:', lastScrollPosition);
            }
        }, 10);
    }
}

/**
 * Initialize the booking system
 */
function initBookingSystem() {
    // Initialize Get Quote button
    const getQuoteBtn = document.getElementById('getQuoteBtn');
    if (getQuoteBtn) {
        getQuoteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            calculateQuote();
        });
    }
    
    // Initialize Book Now button
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processBooking();
        });
    }
}

/**
 * Initialize the booking confirmation modal
 */
function initConfirmationModal() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('bookingConfirmationModal')) {
        const modalHTML = `
            <div id="bookingConfirmationModal" class="booking-modal">
                <div class="booking-modal-content">
                    <span class="booking-modal-close">&times;</span>
                    <div class="booking-modal-header">
                        <i class="fas fa-check-circle"></i>
                        <h2>Booking Confirmed!</h2>
            </div>
                    <div class="booking-modal-body">
                        <div class="booking-details">
                            <div class="booking-id-container">
                                <span>Booking ID:</span>
                                <span id="confirmationBookingId" class="booking-id">B12345678</span>
            </div>
                            <div class="booking-info-grid">
                                <div class="booking-info-item">
                                    <i class="fas fa-calendar-day"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Date & Time</span>
                                        <span id="confirmationDateTime">2023-08-15 14:30</span>
            </div>
        </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Pickup Location</span>
                                        <span id="confirmationPickup">Colombo International Airport</span>
            </div>
            </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-map-pin"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Destination</span>
                                        <span id="confirmationDestination">Kandy City Center</span>
        </div>
        </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-users"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Passengers</span>
                                        <span id="confirmationPassengers">2 People</span>
        </div>
        </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-route"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Distance</span>
                                        <span id="confirmationDistance">120 km</span>
            </div>
                    </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-dollar-sign"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Total Price</span>
                                        <span id="confirmationPrice">$85.00</span>
                        </div>
                        </div>
                        </div>
                            <div class="booking-notes">
                                <div id="confirmationNotes">
                                    <p>A confirmation email has been sent to your registered email address.</p>
                                    <p>Please note that 30% deposit is required to secure your booking.</p>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div class="booking-modal-footer">
                        <button id="viewBookingsBtn" class="btn">View My Bookings</button>
                        <button id="closeModalBtn" class="btn secondary">Close</button>
                    </div>
                    </div>
                </div>
            `;
        
        // Add modal HTML to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .booking-modal {
                    display: none;
                    position: fixed;
                z-index: 1000;
                    left: 0;
                top: 0;
                    width: 100%;
                    height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease-in-out;
            }
            
            .booking-modal-content {
                    background-color: #fff;
                margin: 5% auto;
                padding: 0;
                    width: 90%;
                    max-width: 600px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.4s ease-out;
                overflow: hidden;
            }
            
            .booking-modal-header {
                background-color: #4CAF50;
                color: white;
                padding: 25px 20px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }
            
            .booking-modal-header i {
                font-size: 48px;
                margin-bottom: 10px;
                animation: bounceIn 0.6s;
            }
            
            .booking-modal-header h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            
            .booking-modal-body {
                padding: 25px;
            }
            
            .booking-id-container {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                border-left: 4px solid #4CAF50;
            }
            
            .booking-id {
                font-size: 18px;
                    font-weight: 600;
                color: #4CAF50;
                font-family: monospace;
                }
                
            .booking-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                    margin-bottom: 20px;
                }
                
            .booking-info-item {
                    display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                background-color: #f8f9fa;
            }
            
            .booking-info-item i {
                color: #4a6fa5;
                font-size: 20px;
                margin-top: 2px;
            }
            
            .booking-info-content {
                    display: flex;
                flex-direction: column;
            }
            
            .booking-info-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 2px;
            }
            
            .booking-notes {
                background-color: #e9f7ef;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
                border-left: 4px solid #4CAF50;
                font-size: 14px;
                color: #2d3748;
            }
            
            .booking-notes p {
                margin: 5px 0;
            }
            
            .booking-modal-footer {
                padding: 15px 25px 25px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .booking-modal-close {
                position: absolute;
                right: 20px;
                top: 15px;
                color: white;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                z-index: 10;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            @media (max-width: 768px) {
                .booking-modal-content {
                    width: 95%;
                    margin: 10% auto;
                }
                
                .booking-info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(modalStyles);
        
        // Add event listeners for the modal
        const modal = document.getElementById('bookingConfirmationModal');
        const closeBtn = document.querySelector('.booking-modal-close');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const viewBookingsBtn = document.getElementById('viewBookingsBtn');
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
        
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
        
        viewBookingsBtn.addEventListener('click', function() {
            modal.style.display = "none";
            if (typeof showMyBookings === 'function') {
                showMyBookings();
            } else {
                console.error('showMyBookings function not found');
            }
        });
        
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }
}

/**
 * Calculate a quote based on the current form values
 */
function calculateQuote() {
    console.log('Calculating quote...');
    
    // Get form data
    const serviceType = document.getElementById('serviceType').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const journeyTime = document.getElementById('journeyTime').value;
    const passengerCount = document.getElementById('passengerCount').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    
    // Validate inputs
    if (!serviceType || !journeyDate || !journeyTime || !pickupLocation || !destinationLocation) {
        // 替换alert为更友好的提示方式
        showMobileNotification('Please fill out all required fields to get a quote');
        // 恢复滚动位置
        setTimeout(enhancedRestoreScrollPosition, 100);
        return;
    }
    
    // 保存滚动位置
    saveScrollPosition();
    
    // Get location coordinates if available
        const pickupInput = document.getElementById('pickupLocation');
        const destinationInput = document.getElementById('destinationLocation');
        
    let distance = 0;
    
    // Calculate distance if we have coordinates
            if (pickupInput && destinationInput && 
                pickupInput.dataset.lat && pickupInput.dataset.lng &&
                destinationInput.dataset.lat && destinationInput.dataset.lng) {
                
                const pickupLat = parseFloat(pickupInput.dataset.lat);
                const pickupLng = parseFloat(pickupInput.dataset.lng);
                const destLat = parseFloat(destinationInput.dataset.lat);
                const destLng = parseFloat(destinationInput.dataset.lng);
                
        // We'll get the actual distance from the route data
        // For now, use Haversine formula as an initial estimate
        distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
        
        // Calculate fare based on distance and service type
        const fare = calculateFare(distance, serviceType);
        const deposit = Math.round(fare * 0.3 * 100) / 100; // 30% deposit
        
        // Show the initial quote while we load the route
        displayQuote(distance, fare, deposit);
        
        // 恢复滚动位置
        setTimeout(enhancedRestoreScrollPosition, 300);
        
        // Call showRouteMap to display the route and get the actual driving distance
        if (typeof showRouteMap === 'function') {
            showRouteMap();
            
            // The distance will be updated by getRouteData in map.js
            // We'll check for the updated distance after a short delay
            setTimeout(function() {
                const distanceElement = document.getElementById('quotedDistance');
                if (distanceElement) {
                    const distanceText = distanceElement.textContent;
                    const match = distanceText.match(/(\d+\.?\d*)/);
                    if (match) {
                        const updatedDistance = parseFloat(match[1]);
                        
                        // If the distance has been updated by the routing API
                        if (updatedDistance !== distance) {
                            console.log('Updating quote with actual driving distance:', updatedDistance);
                            
                            // Recalculate fare with the actual driving distance
                            const updatedFare = calculateFare(updatedDistance, serviceType);
                            const updatedDeposit = Math.round(updatedFare * 0.3 * 100) / 100;
                            
                            // Update the quote display
                            updateQuoteDisplay(updatedDistance, updatedFare, updatedDeposit);
                            
                            // 恢复滚动位置
                            setTimeout(enhancedRestoreScrollPosition, 100);
                        }
                    }
                }
            }, 1500); // Wait 1.5 seconds for route data to be loaded
        }
    } else {
        // Fallback to an estimated distance if coordinates aren't available
        distance = 25; // Default 25km if no coordinates
        
        // Calculate fare based on distance and service type
        const fare = calculateFare(distance, serviceType);
        const deposit = Math.round(fare * 0.3 * 100) / 100; // 30% deposit
        
        // Update the quote container
        displayQuote(distance, fare, deposit);
        
        // 恢复滚动位置
        setTimeout(enhancedRestoreScrollPosition, 300);
    }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Add 30% to account for roads vs straight line
    return Math.round(distance * 1.3 * 10) / 10;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Calculate fare based on distance and service type
 */
function calculateFare(distance, serviceType) {
    // Get transport settings from localStorage
    let settings = {
        baseFare: 30,          // 默认基础价格
        ratePerKm: 0.5,        // 默认每公里价格
        rushHourMultiplier: 1.5,
        nightMultiplier: 1.3,
        weekendMultiplier: 1.2,
        sedanRate: 1.0,
        suvRate: 1.5,
        vanRate: 1.8,
        luxuryRate: 2.2
    };
    
    // 尝试从localStorage读取设置
    try {
        const savedSettings = localStorage.getItem('transportSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // 使用保存的设置替换默认值
            settings = { ...settings, ...parsedSettings };
        }
    } catch (error) {
        console.error('Error loading transport settings, using defaults:', error);
    }
    
    // 使用设置中的基本价格
    let fare = settings.baseFare + (distance * settings.ratePerKm);
    
    // 应用服务类型倍率
    if (serviceType === 'airport') {
        fare *= settings.suvRate; // 机场接送使用SUV费率
    } else if (serviceType === 'custom') {
        fare *= settings.vanRate; // 自定义行程使用面包车费率
    }
    
    // 检查是否是周末
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // 0是周日，6是周六
    
    if (isWeekend) {
        fare *= settings.weekendMultiplier;
    }
    
    // 检查是否是高峰时段或夜间
    const hour = now.getHours();
    const isRushHour = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19);
    const isNight = hour >= 22 || hour < 6;
    
    if (isRushHour) {
        fare *= settings.rushHourMultiplier;
    } else if (isNight) {
        fare *= settings.nightMultiplier;
    }
    
    // 四舍五入到2位小数
    return Math.round(fare * 100) / 100;
}

/**
 * Display the calculated quote
 */
function displayQuote(distance, fare, deposit) {
    // Get the quote container
        const quoteContainer = document.getElementById('quoteContainer');
        if (!quoteContainer) {
        console.error('Quote container not found');
            return;
        }
        
    // Update the quote details
    updateQuoteDisplay(distance, fare, deposit);
    
    // Show the quote container
    quoteContainer.style.display = 'block';
    
    // Enable the Book Now button now that we have a quote
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.disabled = false;
    }
    
    // Show route map if coordinates are available
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    if (pickupInput && destinationInput && 
        pickupInput.dataset.lat && pickupInput.dataset.lng && 
        destinationInput.dataset.lat && destinationInput.dataset.lng) {
        
        // Call the showRouteMap function from map.js to display the route
        if (typeof showRouteMap === 'function') {
            showRouteMap();
        } else {
            console.error('showRouteMap function not found');
            // Fallback: just show the container
            const routeMapContainer = document.getElementById('routeMapContainer');
            if (routeMapContainer) {
                routeMapContainer.style.display = 'block';
            }
        }
    }
}

/**
 * Update the quote display with new values
 */
function updateQuoteDisplay(distance, fare, deposit) {
    const distanceElement = document.getElementById('quotedDistance');
    if (distanceElement) {
        distanceElement.textContent = `${distance} km`;
    }
    
    const vehicleElement = document.getElementById('quotedVehicle');
    if (vehicleElement) {
        vehicleElement.textContent = 'Standard';
    }
    
    const fareElement = document.getElementById('quotedFare');
    if (fareElement) {
        fareElement.textContent = `$${fare.toFixed(2)}`;
    }
    
    const depositElement = document.getElementById('quotedDeposit');
    if (depositElement) {
        depositElement.textContent = `$${deposit.toFixed(2)}`;
    }
}

/**
 * Process a booking when the user clicks "Book Now"
 */
function processBooking() {
    // Check if user is logged in
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
        showMobileNotification('Please login to book a journey');
        if (typeof UserAuth !== 'undefined') {
            UserAuth.showLoginModal();
        }
        return;
    }
    
    // 保存滚动位置
    saveScrollPosition();
    
    // Get booking data from form
    const serviceType = document.getElementById('serviceType').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const journeyTime = document.getElementById('journeyTime').value;
    const passengerCount = document.getElementById('passengerCount').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const specialRequirements = document.getElementById('specialRequirements').value;
    
    // Validate inputs
    if (!serviceType || !journeyDate || !journeyTime || !pickupLocation || !destinationLocation) {
        showMobileNotification('Please fill out all required fields');
        // 恢复滚动位置
        setTimeout(enhancedRestoreScrollPosition, 100);
        return;
    }
    
    // Get fare data from quote if available
    let fare = 0;
    let distance = 0;
    const quotedFare = document.getElementById('quotedFare');
    const quotedDistance = document.getElementById('quotedDistance');
    
    if (quotedFare) {
        // Extract numeric value from fare text (e.g., "$120" -> 120)
        const fareText = quotedFare.textContent;
        fare = parseFloat(fareText.replace(/[^0-9.]/g, '')) || 0;
    }
    
    if (quotedDistance) {
        // Extract numeric value from distance text (e.g., "10 km" -> 10)
        const distanceText = quotedDistance.textContent;
        distance = parseFloat(distanceText.replace(/[^0-9.]/g, '')) || 0;
    }
    
    // If we don't have a quote yet, calculate one
    if (fare === 0 || distance === 0) {
        calculateQuote();
        return;
    }
    
    // Get user data
    const currentUser = UserAuth.getCurrentUser();
    
    // Create booking object
    const booking = {
        id: 'B' + Date.now(),
        userEmail: currentUser.email,
        userName: currentUser.name,
        serviceType: serviceType,
        date: journeyDate,
        time: journeyTime,
        passengerCount: passengerCount,
        pickupLocation: pickupLocation,
        destinationLocation: destinationLocation,
        specialRequirements: specialRequirements,
        distance: distance,
        totalPrice: fare,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    console.log('Creating new booking:', booking);
    
    // Save booking to multiple locations for redundancy
    saveBooking(booking);
    
    // Show confirmation modal instead of alert
    showBookingConfirmation(booking);
    
    // Send confirmation email
    sendBookingConfirmation(booking);
}

/**
 * Show the booking confirmation modal with booking details
 */
function showBookingConfirmation(booking) {
    const modal = document.getElementById('bookingConfirmationModal');
    if (!modal) {
        console.error('Booking confirmation modal not found');
        return;
    }
    
    // Format date and time for display
    const dateObj = new Date(booking.date + 'T' + booking.time);
    const formattedDateTime = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update modal content with booking details
    document.getElementById('confirmationBookingId').textContent = booking.id;
    document.getElementById('confirmationDateTime').textContent = formattedDateTime;
    document.getElementById('confirmationPickup').textContent = booking.pickupLocation;
    document.getElementById('confirmationDestination').textContent = booking.destinationLocation;
    document.getElementById('confirmationPassengers').textContent = booking.passengerCount + (booking.passengerCount === '1' ? ' Person' : ' People');
    document.getElementById('confirmationDistance').textContent = booking.distance + ' km';
    document.getElementById('confirmationPrice').textContent = '$' + booking.totalPrice.toFixed(2);
    
    // 更新确认信息，表明订单已提交但需要确认
    const confirmationNotes = document.getElementById('confirmationNotes');
    if (confirmationNotes) {
        confirmationNotes.innerHTML = `
            <p>Your booking request has been <strong>submitted</strong> and is awaiting confirmation.</p>
            <p>Our team will review and confirm your booking shortly.</p>
            <p>Please note that 30% deposit is required to secure your booking once confirmed.</p>
        `;
    }
    
    // Show the booking confirmation modal
    modal.style.display = "block";
}

/**
 * Send booking confirmation email to the user
 */
function sendBookingConfirmation(booking) {
    console.log('Sending booking confirmation email to:', booking.userEmail);
    
    // Format date and time for display
    const dateObj = new Date(booking.date + 'T' + booking.time);
    const formattedDateTime = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Prepare email data for the API call
    const emailData = {
        to: booking.userEmail,
        subject: 'Your Sri Lanka Stay & Explore Booking Request',
        bookingId: booking.id,
        userName: booking.userName,
        serviceType: getServiceTypeLabel(booking.serviceType),
        date: formattedDateTime,
        pickupLocation: booking.pickupLocation,
        destinationLocation: booking.destinationLocation,
        passengerCount: booking.passengerCount,
        distance: booking.distance,
        totalPrice: booking.totalPrice.toFixed(2),
        deposit: (booking.totalPrice * 0.3).toFixed(2)
    };
    
    // Log the email data
    console.log('Email data:', emailData);
    
    // Call the API to send the email confirmation
    // We determine the API URL based on the environment
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/send-booking-confirmation'
        : '/api/send-booking-confirmation';
    
    // Make the API call
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Email sent successfully:', data);
        
        // Update the confirmation modal to indicate email was sent
        const confirmationNotes = document.getElementById('confirmationNotes');
        if (confirmationNotes) {
            confirmationNotes.innerHTML = `
                <p>A booking confirmation email has been sent to <strong>${booking.userEmail}</strong>.</p>
                <p>Your booking request is awaiting approval by our team.</p>
                <p>Please note that 30% deposit is required to secure your booking once confirmed.</p>
            `;
        }
    })
    .catch(error => {
        console.error('Error sending email:', error);
        
        // Update the confirmation modal to indicate there was an issue
        const confirmationNotes = document.getElementById('confirmationNotes');
        if (confirmationNotes) {
            confirmationNotes.innerHTML = `
                <p>We couldn't send the confirmation email at this time.</p>
                <p>Your booking request (ID: <strong>${booking.id}</strong>) has been submitted and is awaiting approval.</p>
                <p>Please note that 30% deposit is required to secure your booking once confirmed.</p>
            `;
        }
    });
}

/**
 * Get a user-friendly label for service type
 */
function getServiceTypeLabel(serviceType) {
    switch(serviceType) {
        case 'airport':
            return 'Airport Transfer';
        case 'city':
            return 'City Tour';
        case 'custom':
            return 'Custom Journey';
        default:
            return serviceType;
    }
}

/**
 * Save booking to localStorage
 */
function saveBooking(booking) {
    // Ensure booking has an ID
    if (!booking.id) {
        booking.id = 'booking-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    // Save to userBookings format (primary)
    try {
        const userBookingsStr = localStorage.getItem('userBookings');
        const userBookings = userBookingsStr ? JSON.parse(userBookingsStr) : {};
        
        if (!userBookings[booking.userEmail]) {
            userBookings[booking.userEmail] = [];
        }
        
        // Check for duplicates first
        const existingIndex = userBookings[booking.userEmail].findIndex(b => b.id === booking.id);
        if (existingIndex >= 0) {
            // Update existing booking
            userBookings[booking.userEmail][existingIndex] = booking;
        } else {
            // Add new booking
        userBookings[booking.userEmail].push(booking);
        }
        
        localStorage.setItem('userBookings', JSON.stringify(userBookings));
        console.log('Booking saved to userBookings');
    } catch (e) {
        console.error('Error saving to userBookings:', e);
    }
    
    // Save to bookingSystem format (secondary)
    try {
        const bookingSystemStr = localStorage.getItem('bookingSystem');
        const bookingSystem = bookingSystemStr ? JSON.parse(bookingSystemStr) : { bookings: [] };
        
        if (!bookingSystem.bookings) {
            bookingSystem.bookings = [];
        }
        
        // Check for duplicates
        const existingIndex = bookingSystem.bookings.findIndex(b => b.id === booking.id);
        if (existingIndex >= 0) {
            // Update existing booking
            bookingSystem.bookings[existingIndex] = booking;
        } else {
            // Add new booking
        bookingSystem.bookings.push(booking);
        }
        
        localStorage.setItem('bookingSystem', JSON.stringify(bookingSystem));
        console.log('Booking saved to bookingSystem');
    } catch (e) {
        console.error('Error saving to bookingSystem:', e);
    }
    
    // Save to individual booking entry for redundancy
    try {
        localStorage.setItem('booking_' + booking.id, JSON.stringify(booking));
        console.log('Booking saved as individual entry');
    } catch (e) {
        console.error('Error saving individual booking:', e);
    }
    
    // Save for admin dashboard in 'bookings' format
    try {
        // Prepare admin-friendly booking format
        const adminBooking = {
            ...booking,
            // Add fields required for admin dashboard
            timestamp: booking.createdAt || new Date().toISOString(),
            customerName: booking.userName || 'N/A',
            customerEmail: booking.userEmail || 'N/A',
            fromLocation: booking.pickupLocation || 'N/A',
            toLocation: booking.destinationLocation || 'N/A',
            totalFare: booking.totalPrice || 0,
            depositAmount: (booking.totalPrice * 0.3) || 0,
            userId: booking.userEmail || 'guest',
            vehicleType: 'Standard',
            status: booking.status || 'pending', // Default to pending
            lastUpdated: new Date().toISOString()
        };
        
        // Get existing bookings array
        const bookingsStr = localStorage.getItem('bookings');
        let bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        
        // Ensure bookings is an array
        if (!Array.isArray(bookings)) {
            bookings = [];
        }
        
        // Check for duplicates
        const existingIndex = bookings.findIndex(b => b.id === booking.id);
        if (existingIndex >= 0) {
            // Update existing booking
            bookings[existingIndex] = adminBooking;
        } else {
            // Add new booking
        bookings.push(adminBooking);
        }
        
        // Save back to localStorage
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log('Booking saved to bookings for admin panel');
    } catch (e) {
        console.error('Error saving to bookings format:', e);
    }
}

/**
 * Reset the booking form after a successful booking
 */
function resetBookingForm() {
    document.getElementById('serviceType').value = '';
    document.getElementById('journeyDate').value = '';
    document.getElementById('journeyTime').value = '';
    document.getElementById('passengerCount').value = '1';
    document.getElementById('pickupLocation').value = '';
    document.getElementById('destinationLocation').value = '';
    document.getElementById('specialRequirements').value = '';
    
    // Reset location data attributes
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    if (pickupInput) {
        pickupInput.setAttribute('data-lat', '');
        pickupInput.setAttribute('data-lng', '');
    }
    
    if (destinationInput) {
        destinationInput.setAttribute('data-lat', '');
        destinationInput.setAttribute('data-lng', '');
    }
    
    // Hide quote container if visible
        const quoteContainer = document.getElementById('quoteContainer');
        if (quoteContainer) {
        quoteContainer.style.display = 'none';
    }
    
    // Hide route map if visible
    const routeMapContainer = document.getElementById('routeMapContainer');
    if (routeMapContainer) {
        routeMapContainer.style.display = 'none';
    }
}

/**
 * Handle mobile layout optimization for the route map
 * This function will move the route map to appear below the quote on mobile devices
 */
function setupMobileRouteMap() {
    // Check if it's mobile view (screen width < 768px)
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    const routeMapContainer = document.getElementById('routeMapContainer');
    const quoteContainer = document.getElementById('quoteContainer');
    const bookingForm = document.querySelector('.booking-form');
    const transportInfo = document.querySelector('.transport-info');
    
    if (!routeMapContainer || !quoteContainer || !bookingForm || !transportInfo) {
        return;
    }
    
    if (isMobile) {
        // On mobile: Move the route map to display after the quote container
        if (routeMapContainer.parentNode === transportInfo && quoteContainer.style.display !== 'none') {
            // Remove from current position
            transportInfo.removeChild(routeMapContainer);
            // Insert after quote container
            bookingForm.insertBefore(routeMapContainer, quoteContainer.nextSibling);
            console.log('Route map moved to mobile position');
        }
    } else {
        // On desktop: Move back to original position if needed
        if (routeMapContainer.parentNode !== transportInfo) {
            // Remove from current position
            routeMapContainer.parentNode.removeChild(routeMapContainer);
            // Insert back into transport info
            transportInfo.appendChild(routeMapContainer);
            console.log('Route map moved to desktop position');
        }
    }
}

// Add resize event listener to handle layout changes
window.addEventListener('resize', function() {
    if (document.getElementById('routeMapContainer').style.display !== 'none') {
        setupMobileRouteMap();
    }
});

// Add event listener to run when route map is shown
document.addEventListener('DOMContentLoaded', function() {
    const getQuoteBtn = document.getElementById('getQuoteBtn');
    if (getQuoteBtn) {
        const originalClick = getQuoteBtn.onclick;
        getQuoteBtn.addEventListener('click', function() {
            // Wait for the route map to be displayed
            setTimeout(function() {
                setupMobileRouteMap();
            }, 500);
        });
    }
});

/**
 * Synchronize existing bookings from userBookings and bookingSystem to the bookings format
 * for the admin panel
 */
function synchronizeBookings() {
    console.log('Synchronizing bookings for admin panel...');
    
    // Existing bookings collection
    let allBookings = [];
    let bookingIds = new Set();
    
    // Debug: Log all localStorage keys
    console.log('All localStorage keys for synchronization:');
    for (let i = 0; i < localStorage.length; i++) {
        console.log(`- ${localStorage.key(i)}`);
    }
    
    // Get bookings from userBookings
    try {
        const userBookingsStr = localStorage.getItem('userBookings');
        if (userBookingsStr) {
            const userBookings = JSON.parse(userBookingsStr);
            
            // Process all user bookings
            Object.keys(userBookings).forEach(userEmail => {
                const userBookingList = userBookings[userEmail];
                if (Array.isArray(userBookingList)) {
                    userBookingList.forEach(booking => {
                        if (booking && booking.id && !bookingIds.has(booking.id)) {
                            bookingIds.add(booking.id);
                            allBookings.push({
                                ...booking,
                                customerEmail: userEmail,
                                customerName: booking.userName || 'Customer',
                                // Convert date formats if needed
                                journeyDate: booking.date || booking.journeyDate,
                                // Ensure timestamps are set
                                timestamp: booking.createdAt || booking.timestamp || new Date().toISOString(),
                                lastUpdated: booking.lastUpdated || new Date().toISOString()
                    });
                }
            });
        }
            });
        console.log('Retrieved bookings from userBookings:', bookingIds.size);
        }
    } catch (e) {
        console.error('Error retrieving bookings from userBookings:', e);
    }
    
    // Get bookings from bookingSystem
    try {
        const bookingSystemStr = localStorage.getItem('bookingSystem');
        if (bookingSystemStr) {
            const bookingSystem = JSON.parse(bookingSystemStr);
            
            if (bookingSystem && Array.isArray(bookingSystem.bookings)) {
                bookingSystem.bookings.forEach(booking => {
                    if (booking && booking.id && !bookingIds.has(booking.id)) {
                        bookingIds.add(booking.id);
                        allBookings.push({
                            ...booking,
                            // Ensure these fields exist for admin panel
                            journeyDate: booking.date || booking.journeyDate,
                            timestamp: booking.createdAt || booking.timestamp || new Date().toISOString(),
                            lastUpdated: booking.lastUpdated || new Date().toISOString()
                        });
                    }
                });
            }
        }
        console.log('Retrieved additional bookings from bookingSystem:', bookingIds.size);
    } catch (e) {
        console.error('Error retrieving bookings from bookingSystem:', e);
    }
    
    // Get bookings from individual booking entries
    try {
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('booking_') || key.includes('booking'))) {
                try {
                    const booking = JSON.parse(localStorage.getItem(key));
                    const bookingId = booking.id || booking.bookingId;
                    if (booking && bookingId && !bookingIds.has(bookingId)) {
                        bookingIds.add(bookingId);
                        allBookings.push({
                            ...booking,
                            id: bookingId,
                            // Convert date formats if needed
                            journeyDate: booking.date || booking.journeyDate,
                            // Ensure timestamps are set
                            timestamp: booking.createdAt || booking.timestamp || new Date().toISOString(),
                            lastUpdated: booking.lastUpdated || new Date().toISOString()
                        });
                    }
                } catch (innerErr) {
                    console.error('Error parsing individual booking:', innerErr);
                }
            }
        }
        console.log('Retrieved additional bookings from individual entries:', bookingIds.size);
    } catch (e) {
        console.error('Error retrieving individual bookings:', e);
    }
    
    // Check specifically for the May 17th booking
    const mayBookingDate = "2024-05-17";
    let foundMayBooking = false;
    
    for (const booking of allBookings) {
        if ((booking.journeyDate && booking.journeyDate.includes(mayBookingDate)) || 
            (booking.date && booking.date.includes(mayBookingDate))) {
            foundMayBooking = true;
            console.log('Found May 17th booking during synchronization:', booking);
        }
    }
    
    if (!foundMayBooking) {
        console.log('May 17th booking not found during normal sync. Searching localStorage directly...');
        
        // Search all localStorage for any May 17th date
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const item = localStorage.getItem(key);
            
            if (item && item.includes(mayBookingDate)) {
                console.log(`Found May 17th booking data in localStorage key: ${key}`);
                try {
                    const data = JSON.parse(item);
                    
                    // Handle various data structures
                    if (Array.isArray(data)) {
                        // If it's an array, check each entry
                        data.forEach(entry => {
                            if ((entry.date && entry.date.includes(mayBookingDate)) || 
                                (entry.journeyDate && entry.journeyDate.includes(mayBookingDate))) {
                                
                                const bookingId = entry.id || `may17-${Date.now()}`;
                                if (!bookingIds.has(bookingId)) {
                                    bookingIds.add(bookingId);
                                    allBookings.push({
                                        ...entry,
                                        id: bookingId,
                                        journeyDate: mayBookingDate,
                                        timestamp: entry.createdAt || entry.timestamp || new Date().toISOString(),
                                        lastUpdated: entry.lastUpdated || new Date().toISOString()
                                    });
                                }
                            }
                        });
                    } else if (typeof data === 'object' && !Array.isArray(data)) {
                        // Check if it's a userBookings structure (email keys with arrays)
                        let foundInUserObj = false;
                        Object.keys(data).forEach(key => {
                            if (Array.isArray(data[key])) {
                                data[key].forEach(entry => {
                                    if ((entry.date && entry.date.includes(mayBookingDate)) || 
                                        (entry.journeyDate && entry.journeyDate.includes(mayBookingDate))) {
                                        
                                        const bookingId = entry.id || `may17-${Date.now()}`;
                                        if (!bookingIds.has(bookingId)) {
                                            bookingIds.add(bookingId);
                                            allBookings.push({
                                                ...entry,
                                                id: bookingId,
                                                customerEmail: key,
                                                journeyDate: mayBookingDate,
                                                timestamp: entry.createdAt || entry.timestamp || new Date().toISOString(),
                                                lastUpdated: entry.lastUpdated || new Date().toISOString()
                                            });
                                            foundInUserObj = true;
                                        }
                                    }
                                });
                            }
                        });
                        
                        // If it's a single booking with May 17th date
                        if (!foundInUserObj && ((data.date && data.date.includes(mayBookingDate)) || 
                           (data.journeyDate && data.journeyDate.includes(mayBookingDate)))) {
                            
                            const bookingId = data.id || `may17-${Date.now()}`;
                            if (!bookingIds.has(bookingId)) {
                                bookingIds.add(bookingId);
                                allBookings.push({
                                    ...data,
                                    id: bookingId,
                                    journeyDate: mayBookingDate,
                                    timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
                                    lastUpdated: data.lastUpdated || new Date().toISOString()
                                });
                            }
                        }
                    }
                } catch (parseErr) {
                    console.warn(`Error parsing ${key} containing May 17th date:`, parseErr);
                }
            }
        }
    }
    
    // Convert all bookings to admin format and save
    try {
        // First check existing bookings array
        const bookingsStr = localStorage.getItem('bookings');
        let existingBookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        
        // Ensure it's an array
        if (!Array.isArray(existingBookings)) {
            existingBookings = [];
        }
        
        // Extract existing booking IDs
        const existingIds = new Set(existingBookings.map(b => b.id));
        
        // Convert new bookings to admin format and add
        const adminBookings = allBookings.map(booking => {
            // Skip already existing bookings
            if (existingIds.has(booking.id)) {
                return null;
            }
            
            // Convert to admin format
            return {
                ...booking,
                id: booking.id,
                timestamp: booking.createdAt || booking.timestamp || new Date().toISOString(),
                customerName: booking.userName || booking.name || 'Customer',
                customerEmail: booking.userEmail || booking.email || 'customer@example.com',
                fromLocation: booking.pickupLocation || booking.from || 'N/A',
                toLocation: booking.destinationLocation || booking.to || 'N/A',
                totalFare: booking.totalPrice || booking.price || booking.total || booking.totalFare || 0,
                depositAmount: (booking.totalPrice * 0.3) || 0,
                userId: booking.userEmail || 'guest',
                vehicleType: booking.vehicleType || 'Standard',
                status: booking.status || 'pending' // Default to pending
            };
        }).filter(Boolean); // Remove null items
        
        // Merge existing and new bookings
        const mergedBookings = [...existingBookings, ...adminBookings];
    
        // Save to localStorage
        localStorage.setItem('bookings', JSON.stringify(mergedBookings));
        console.log('Synchronized bookings for admin panel. Total bookings:', mergedBookings.length);
        
        // Update dashboard booking count if on same page
        const totalBookingsElement = document.getElementById('totalBookings');
        if (totalBookingsElement) {
            totalBookingsElement.textContent = mergedBookings.length.toString();
        }
    } catch (e) {
        console.error('Error synchronizing bookings:', e);
    }
}

/**
 * 显示移动端友好的通知提示
 * @param {string} message 要显示的消息
 */
function showMobileNotification(message) {
    // 确保在显示通知前保存滚动位置
    const savedPosition = window.scrollY || window.pageYOffset;
    const isMobile = /Android|iPhone|iPad|iPod|mobile|tablet/i.test(navigator.userAgent);
    
    // 检查是否已有通知元素
    let notification = document.getElementById('mobileNotification');
    
    // 如果没有，创建一个
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'mobileNotification';
        notification.style.position = 'fixed';
        notification.style.bottom = '120px'; // 放在底部按钮上方
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.maxWidth = '90%';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        notification.style.fontSize = '14px';
        notification.style.display = 'none';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        notification.style.pointerEvents = 'auto'; // 允许点击
        
        // 添加关闭按钮
        notification.innerHTML = `
            <span style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 16px;">&times;</span>
            <span id="notificationMessage"></span>
        `;
        document.body.appendChild(notification);
        
        // 添加关闭按钮事件
        const closeBtn = notification.querySelector('span');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                    
                    // 确保关闭通知后恢复滚动位置，但仅限移动设备
                    if (isMobile) {
                        window.scrollTo(0, savedPosition);
                    }
                }, 300);
            });
        }
    }
    
    // 设置消息内容并显示
    const messageSpan = notification.querySelector('#notificationMessage');
    if (messageSpan) {
        messageSpan.textContent = message;
    } else {
        notification.innerHTML = `
            <span style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 16px;">&times;</span>
            <span id="notificationMessage">${message}</span>
        `;
        
        // 重新添加关闭按钮事件
        const closeBtn = notification.querySelector('span');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                    
                    // 确保关闭通知后恢复滚动位置，但仅限移动设备
                    if (isMobile) {
                        window.scrollTo(0, savedPosition);
                    }
                }, 300);
            });
        }
    }
    
    // 使用淡入效果显示通知
    notification.style.display = 'block';
    
    // 强制重绘
    notification.offsetHeight;
    
    // 设置不透明度为1以触发过渡效果
    notification.style.opacity = '1';
    
    // 确保通知显示后不会改变页面滚动位置，但仅限移动设备
    if (isMobile) {
        window.scrollTo(0, savedPosition);
    }
    
    // 添加防抖动特性，阻止通知导致的页面跳动，但仅限移动设备
    const preventScroll = (e) => {
        if (isMobile) {
            window.scrollTo(0, savedPosition);
        }
    };
    
    // 只在移动设备上添加防抖动滚动事件监听
    if (isMobile) {
        window.addEventListener('scroll', preventScroll, { passive: false });
    }
    
    // 4秒后自动隐藏
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
            
            // 仅在移动设备上处理滚动恢复
            if (isMobile) {
                window.removeEventListener('scroll', preventScroll);
                window.scrollTo(0, savedPosition);
            }
        }, 300);
    }, 4000);
}