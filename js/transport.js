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

    // 初始化 Stripe
    const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    // 初始化地址自动补全
    initializeLocationAutocomplete();

    function initializeLocationAutocomplete() {
        const pickupInput = document.getElementById('pickupLocation');
        const destinationInput = document.getElementById('destination');
        const pickupMap = document.getElementById('pickupMap');
        const destinationMap = document.getElementById('destinationMap');

        // 创建自动补全
        const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
            componentRestrictions: { country: 'lk' } // 限制在斯里兰卡
        });
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
            componentRestrictions: { country: 'lk' }
        });

        // 处理地点选择
        pickupAutocomplete.addListener('place_changed', () => {
            const place = pickupAutocomplete.getPlace();
            if (place.geometry) {
                showLocationOnMap(place, pickupMap);
                updatePriceEstimate();
            }
        });

        destinationAutocomplete.addListener('place_changed', () => {
            const place = destinationAutocomplete.getPlace();
            if (place.geometry) {
                showLocationOnMap(place, destinationMap);
                updatePriceEstimate();
            }
        });
    }

    function showLocationOnMap(place, mapElement) {
        mapElement.style.display = 'block';
        const map = new google.maps.Map(mapElement, {
            center: place.geometry.location,
            zoom: 15
        });
        new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
    }

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

    // 更新价格估算和定金金额
    function updatePriceEstimate() {
        const estimatedPrice = document.getElementById('estimatedPrice');
        const depositAmount = document.getElementById('depositAmount');
        const type = serviceType.value;
        let price = 0;

        if (type === 'charter') {
            const vehicleType = document.getElementById('vehicleType').value;
            const duration = document.getElementById('duration').value;
            price = prices.charter[vehicleType][duration.replace('-', '')];
        } else if (type === 'airport') {
            // 计算距离并基于距离计算价格
            const pickup = document.getElementById('pickupLocation').value;
            const destination = document.getElementById('destination').value;
            if (pickup && destination) {
                calculateDistance(pickup, destination).then(distance => {
                    price = prices.airport.base + (distance * prices.airport.perKm);
                    estimatedPrice.textContent = `$${price} USD`;
                    depositAmount.textContent = `$${(price * 0.3).toFixed(2)} USD`;
                });
            }
        }

        if (type === 'charter') {
            estimatedPrice.textContent = `$${price} USD`;
            depositAmount.textContent = `$${(price * 0.3).toFixed(2)} USD`;
        }
    }

    // 计算两点之间的距离
    async function calculateDistance(origin, destination) {
        const service = new google.maps.DistanceMatrixService();
        try {
            const response = await service.getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: 'DRIVING'
            });
            const distance = response.rows[0].elements[0].distance.value / 1000; // 转换为公里
            return distance;
        } catch (error) {
            console.error('Error calculating distance:', error);
            return 0;
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
        transportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            try {
                // 创建支付意向
                const response = await fetch('/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: parseFloat(document.getElementById('depositAmount').textContent.replace('$', '').replace(' USD', '')) * 100, // 转换为分
                        currency: 'usd'
                    })
                });

                const data = await response.json();

                // 确认支付
                const result = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: document.getElementById('customerName').value
                        }
                    }
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                // 支付成功，提交预订
                alert('Booking confirmed! We will contact you shortly with the details.');
                transportForm.reset();
                updatePriceEstimate();
            } catch (error) {
                alert(error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Book Transport';
            }
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