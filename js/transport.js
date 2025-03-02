document.addEventListener('DOMContentLoaded', function() {
    console.log('Transport.js loaded');
    const transportForm = document.getElementById('transportForm');
    const serviceType = document.getElementById('serviceType');
    const airportFields = document.querySelectorAll('.airport-field');
    const charterFields = document.querySelectorAll('.charter-field');
    const journeyDate = document.getElementById('journeyDate');
    const journeyTime = document.getElementById('journeyTime');
    const passengerCount = document.getElementById('passengerCount');
    const pickupLocation = document.getElementById('pickupLocation');
    const destinationLocation = document.getElementById('destinationLocation');
    const specialRequirements = document.getElementById('specialRequirements');
    const getQuoteBtn = document.querySelector('.btn.secondary');
    const bookNowBtn = document.querySelector('.btn.primary');
    
    // 价格配置
    const prices = {
        airport: {
            base: 30,
            perKm: 0.5
        },
        charter: {
            sedan: {
                halfDay: 50,
                fullDay: 80,
                multiDay: 70
            },
            suv: {
                halfDay: 70,
                fullDay: 120,
                multiDay: 100
            },
            van: {
                halfDay: 90,
                fullDay: 150,
                multiDay: 130
            },
            luxury: {
                halfDay: 150,
                fullDay: 250,
                multiDay: 200
            }
        }
    };

    // 监听服务类型变化
    serviceType.addEventListener('change', function() {
        // 隐藏所有特殊字段
        airportFields.forEach(field => field.style.display = 'none');
        charterFields.forEach(field => field.style.display = 'none');
        
        // 显示相应字段
        switch(this.value) {
            case 'airport':
                airportFields.forEach(field => field.style.display = 'block');
                break;
            case 'charter':
                charterFields.forEach(field => field.style.display = 'block');
                updatePriceEstimate();
                break;
        }
    });

    // 更新价格估算
    function updatePriceEstimate() {
        const estimatedPrice = document.getElementById('estimatedPrice');
        const type = serviceType.value;
        let price = 0;

        if (type === 'charter') {
            const vehicleType = document.getElementById('vehicleType').value;
            const duration = document.getElementById('duration').value;
            price = prices.charter[vehicleType][duration.replace('-', '')];
            estimatedPrice.textContent = `$${price} USD`;
        } else if (type === 'airport') {
            price = prices.airport.base;
            estimatedPrice.textContent = `From $${price} USD`;
        } else {
            estimatedPrice.textContent = 'Select service type to see price';
        }
    }

    // 表单提交处理
    if (transportForm) {
        transportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 收集表单数据
            const formData = {
                serviceType: serviceType.value,
                date: document.getElementById('serviceDate').value,
                time: document.getElementById('serviceTime').value,
                passengers: document.getElementById('passengers').value,
                pickupLocation: document.getElementById('pickupLocation').value,
                destination: document.getElementById('destination').value,
                requirements: document.getElementById('requirements').value
            };

            // 根据服务类型添加特殊字段
            if (formData.serviceType === 'airport') {
                formData.flightNumber = document.getElementById('flightNumber').value;
            } else if (formData.serviceType === 'charter') {
                formData.vehicleType = document.getElementById('vehicleType').value;
                formData.duration = document.getElementById('duration').value;
            }
            
            // 显示确认消息
            alert('Thank you for your booking! We will contact you shortly to confirm your reservation.');
            
            // 清空表单
            transportForm.reset();
            estimatedPrice.textContent = 'Select service type to see price';
        });
    }
    
    // 设置日期选择器的最小日期为今天
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    // 添加服务项点击事件
    document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('click', function() {
            const serviceType = this.dataset.service;
            const selectElement = document.getElementById('serviceType');
            selectElement.value = serviceType;
            
            // 触发 change 事件以更新表单
            const event = new Event('change');
            selectElement.dispatchEvent(event);
            
            // 滚动到预订表单
            document.querySelector('.booking-form').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Set up date input to only allow future dates
    if (journeyDate) {
        const today = new Date().toISOString().split('T')[0];
        journeyDate.min = today;
    }
    
    // 添加地图集成的逻辑
    if (pickupLocation) {
        pickupLocation.addEventListener('click', function() {
            openMap('pickup');
        });
    }
    
    // 修正这里的变量名
    if (destinationLocation) {
        destinationLocation.addEventListener('click', function() {
            openMap('destination');
        });
    }
    
    // 添加地图按钮的事件监听器
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    if (pickupMapBtn) {
        pickupMapBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 防止表单提交
            openMap('pickup');
        });
    }
    
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    if (destinationMapBtn) {
        destinationMapBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 防止表单提交
            openMap('destination');
        });
    }
    
    // Get quote functionality
    if (getQuoteBtn) {
        getQuoteBtn.addEventListener('click', function() {
            calculatePrice();
        });
    }
    
    // Book now functionality
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            if (validateForm()) {
                submitBooking();
            }
        });
    }
    
    // Calculate price based on service type
    function calculatePrice() {
        console.log('Calculating price in transport.js');
        
        // 检查是否有地图脚本并且地图功能可用
        if (typeof window.markers === 'undefined') {
            console.error('Map markers not found, map.js might not be loaded correctly');
            showFareResult('System error: Cannot access map data. Please refresh the page and try again.', 'error');
            return;
        }
        
        // 检查是否设置了地点标记
        if (!window.markers.pickup || !window.markers.destination) {
            console.log('Missing pickup or destination markers');
            showFareResult('Please select both pickup and destination locations on the map first.', 'error');
            return;
        }
        
        // 手动调用计算距离
        let distance;
        try {
            distance = calculateDistance();
        } catch (error) {
            console.error('Error calculating distance:', error);
            showFareResult('Error calculating distance. Please try again.', 'error');
            return;
        }
        
        if (!distance || isNaN(distance)) {
            console.error('Invalid distance value');
            showFareResult('Unable to calculate distance. Please select both locations again.', 'error');
            return;
        }
        
        console.log('Distance for price calculation:', distance);
        
        // Get selected vehicle type
        const vehicleTypeElements = document.querySelectorAll('input[name="vehicleType"]');
        let vehicleType = 'sedan'; // 默认值
        
        for (const element of vehicleTypeElements) {
            if (element.checked) {
                vehicleType = element.value;
                break;
            }
        }
        
        console.log('Selected vehicle type:', vehicleType);
        
        // Base price per km for different vehicle types
        const pricePerKm = {
            sedan: 0.8,
            suv: 1.0,
            van: 1.2,
            luxury: 1.5
        };
        
        // Base fare
        const baseFare = 10;
        
        // Calculate total fare
        const fare = baseFare + (distance * pricePerKm[vehicleType]);
        
        // Round to 2 decimal places
        const roundedFare = Math.round(fare * 100) / 100;
        
        console.log('Calculated fare:', roundedFare);
        
        // Display result
        showFareResult(`Estimated fare: $${roundedFare.toFixed(2)}`, 'success');
    }
    
    // Validate the form
    function validateForm() {
        if (!serviceType || !serviceType.value) {
            showNotification('Please select a service type', 'error');
            return false;
        }
        
        if (!journeyDate || !journeyDate.value) {
            showNotification('Please select a date', 'error');
            return false;
        }
        
        if (!journeyTime || !journeyTime.value) {
            showNotification('Please select a time', 'error');
            return false;
        }
        
        if (!pickupLocation || !pickupLocation.value) {
            showNotification('Please enter a pickup location', 'error');
            return false;
        }
        
        if (!destinationLocation || !destinationLocation.value) {
            showNotification('Please enter a destination', 'error');
            return false;
        }
        
        return true;
    }
    
    // Submit booking
    function submitBooking() {
        // Collect booking data
        const bookingData = {
            serviceType: serviceType.value,
            date: journeyDate.value,
            time: journeyTime.value,
            passengers: passengerCount.value,
            pickupLocation: pickupLocation.value,
            destination: destinationLocation ? destinationLocation.value : '',
            specialRequirements: specialRequirements ? specialRequirements.value : ''
        };
        
        console.log('Booking data:', bookingData);
        
        // In a real application, you would send this data to a server
        // For now, we'll just show a success message
        showNotification('Thank you for your booking! We will contact you shortly to confirm your reservation.', 'success');
        
        // Reset form
        resetForm();
    }
    
    // Reset form
    function resetForm() {
        if (serviceType) serviceType.value = '';
        if (journeyDate) journeyDate.value = '';
        if (journeyTime) journeyTime.value = '';
        if (passengerCount) passengerCount.value = '1';
        if (pickupLocation) pickupLocation.value = '';
        if (destinationLocation) destinationLocation.value = '';
        if (specialRequirements) specialRequirements.value = '';
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.style.display = 'block';
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    function showFareResult(message, type) {
        console.log('Showing fare result:', message, type);
        
        const fareResult = document.getElementById('fareResult');
        if (fareResult) {
            fareResult.textContent = message;
            fareResult.style.display = 'block';
            
            // Clear existing classes
            fareResult.className = 'fare-result';
            
            // Add status class
            if (type) {
                fareResult.classList.add(type);
            }
        } else {
            console.error('Fare result element not found');
        }
    }

    // 计算价格函数
    function calculatePrice(distance) {
        console.log('计算价格，距离:', distance, 'km');
        
        if (!distance || isNaN(distance)) {
            console.error('无效的距离值');
            return;
        }
        
        // 获取选择的车辆类型
        const vehicleType = document.querySelector('input[name="vehicle"]:checked');
        if (!vehicleType) {
            console.error('未选择车辆类型');
            alert('请选择车辆类型');
            return;
        }
        
        const vehicleValue = vehicleType.value;
        console.log('选择的车辆类型:', vehicleValue);
        
        // 基础价格（根据车辆类型）
        let baseFare = 0;
        let ratePerKm = 0;
        
        switch (vehicleValue) {
            case 'sedan':
                baseFare = 20;
                ratePerKm = 0.8;
                break;
            case 'suv':
                baseFare = 25;
                ratePerKm = 1;
                break;
            case 'van':
                baseFare = 30;
                ratePerKm = 1.2;
                break;
            case 'luxury':
                baseFare = 50;
                ratePerKm = 1.5;
                break;
            default:
                baseFare = 20;
                ratePerKm = 0.8;
        }
        
        // 计算总价
        const totalFare = baseFare + (distance * ratePerKm);
        console.log('计算的价格:', totalFare);
        
        // 显示结果
        const fareResultElement = document.getElementById('fareResult');
        if (fareResultElement) {
            fareResultElement.textContent = `预估费用: $${totalFare.toFixed(2)}`;
            fareResultElement.style.display = 'block';
        }
    }
}); 