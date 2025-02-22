document.addEventListener('DOMContentLoaded', function() {
    const transportForm = document.getElementById('transportForm');
    const serviceType = document.getElementById('serviceType');
    const airportFields = document.querySelectorAll('.airport-field');
    const charterFields = document.querySelectorAll('.charter-field');
    
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
                multiDay: 70 // per day
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
        
        if (type === 'charter') {
            const vehicleType = document.getElementById('vehicleType').value;
            const duration = document.getElementById('duration').value;
            const price = prices.charter[vehicleType][duration.replace('-', '')];
            
            estimatedPrice.textContent = `$${price} USD`;
        } else if (type === 'airport') {
            estimatedPrice.textContent = `From $${prices.airport.base} USD`;
        } else {
            estimatedPrice.textContent = 'Select service type to see price';
        }
    }

    // 监听价格相关字段变化
    ['vehicleType', 'duration'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updatePriceEstimate);
        }
    });

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
            
            // 验证乘客数量与车型匹配
            if (formData.serviceType === 'charter') {
                const maxPassengers = {
                    sedan: 3,
                    suv: 5,
                    van: 8,
                    luxury: 3
                };
                
                if (parseInt(formData.passengers) > maxPassengers[formData.vehicleType]) {
                    alert(`The selected vehicle can only accommodate ${maxPassengers[formData.vehicleType]} passengers. Please choose a larger vehicle.`);
                    return;
                }
            }
            
            // 显示确认消息
            alert('Thank you for your booking! We will contact you shortly to confirm your reservation.');
            
            // 清空表单
            transportForm.reset();
            document.getElementById('estimatedPrice').textContent = 'Select service type to see price';
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
}); 