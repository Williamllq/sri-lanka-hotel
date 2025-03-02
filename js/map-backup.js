// 简化版地图初始化 - 备用方案
document.addEventListener('DOMContentLoaded', function() {
    console.log('地图备用方案已加载');
    
    // 获取需要的DOM元素
    const mapModal = document.getElementById('mapModal');
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const pickupBtn = document.getElementById('pickupMapBtn');
    const destinationBtn = document.getElementById('destinationMapBtn');
    const closeBtn = document.getElementById('closeMapModal');
    const mapContainer = document.getElementById('modalMap');
    const confirmBtn = document.getElementById('confirmLocationBtn');
    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    const debugBtn = document.getElementById('debugMapBtn');
    
    // 全局变量
    let map = null;
    let currentMarker = null;
    let activeField = null;
    let markers = {
        pickup: null,
        destination: null
    };
    
    // 为相关元素添加事件监听器
    if (pickupInput) {
        pickupInput.addEventListener('click', function() {
            openMapModal('pickup');
        });
    }
    
    if (destinationInput) {
        destinationInput.addEventListener('click', function() {
            openMapModal('destination');
        });
    }
    
    if (pickupBtn) {
        pickupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMapModal('pickup');
        });
    }
    
    if (destinationBtn) {
        destinationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMapModal('destination');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMapModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmLocation);
    }
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value;
            if (query) {
                searchLocation(query);
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value;
                if (query) {
                    searchLocation(query);
                }
            }
        });
    }
    
    // 计算按钮
    const calculateBtn = document.getElementById('calculateFareBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateDistance);
    }
    
    // 调试按钮点击事件
    if (debugBtn) {
        debugBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('调试按钮被点击，尝试强制打开地图');
            
            // 修复模态窗口样式
            if (mapModal) {
                mapModal.style.position = 'fixed';
                mapModal.style.top = '0';
                mapModal.style.left = '0';
                mapModal.style.width = '100%';
                mapModal.style.height = '100%';
                mapModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                mapModal.style.zIndex = '9999';
                mapModal.style.display = 'flex';
                mapModal.style.justifyContent = 'center';
                mapModal.style.alignItems = 'center';
            }
            
            // 修复地图容器样式
            if (mapContainer) {
                mapContainer.style.height = '400px';
                mapContainer.style.width = '100%';
                mapContainer.style.display = 'block';
            }
            
            // 强制打开地图模态窗口
            openMapModal('pickup');
            
            // 延迟初始化地图
            setTimeout(function() {
                console.log('强制重新初始化地图');
                if (map) {
                    map.remove();
                    map = null;
                }
                initMap();
            }, 500);
        });
    }
    
    // 打开地图模态窗口
    function openMapModal(field) {
        console.log('打开地图模态窗口:', field);
        
        if (!mapModal) {
            console.error('找不到地图模态窗口元素');
            return;
        }
        
        // 设置活动字段
        activeField = field;
        
        // 设置模态窗口标题
        const modalTitle = document.getElementById('mapModalTitle');
        if (modalTitle) {
            modalTitle.textContent = field === 'pickup' ? '选择接送地点' : '选择目的地';
        }
        
        // 显示模态窗口
        mapModal.style.display = 'flex';
        
        // 延迟初始化地图，确保模态窗口已显示
        setTimeout(initMap, 200);
    }
    
    // 关闭地图模态窗口
    function closeMapModal() {
        console.log('关闭地图模态窗口');
        
        if (mapModal) {
            mapModal.style.display = 'none';
        }
        
        activeField = null;
    }
    
    // 初始化地图
    function initMap() {
        console.log('初始化地图');
        
        if (!mapContainer) {
            console.error('找不到地图容器元素');
            return;
        }
        
        // 如果地图已存在，只需调整大小
        if (map) {
            console.log('地图已存在，调整大小');
            map.invalidateSize();
            return;
        }
        
        try {
            // 创建地图
            map = L.map('modalMap').setView([7.8731, 80.7718], 8);
            
            // 添加地图图层
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // 添加地图点击事件
            map.on('click', function(e) {
                setMarker(e.latlng);
            });
            
            console.log('地图初始化成功');
            
            // 强制调整地图大小
            setTimeout(function() {
                if (map) {
                    map.invalidateSize();
                }
            }, 300);
            
        } catch (error) {
            console.error('初始化地图时出错:', error);
        }
    }
    
    // 设置标记
    function setMarker(latlng) {
        console.log('设置标记:', latlng);
        
        if (!map || !activeField) return;
        
        // 移除当前标记（如果有）
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        
        // 创建新标记
        currentMarker = L.marker(latlng).addTo(map);
        
        // 保存标记
        markers[activeField] = {
            lat: latlng.lat,
            lng: latlng.lng
        };
    }
    
    // 搜索位置
    function searchLocation(query) {
        console.log('搜索位置:', query);
        
        if (!query || !map) return;
        
        // 禁用搜索输入框
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = '搜索中...';
        }
        
        // 使用Nominatim API搜索位置
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                // 恢复搜索输入框
                if (searchInput) {
                    searchInput.disabled = false;
                    searchInput.placeholder = '搜索位置';
                }
                
                if (data && data.length > 0) {
                    const location = data[0];
                    const lat = parseFloat(location.lat);
                    const lng = parseFloat(location.lon);
                    
                    // 更新地图视图
                    map.setView([lat, lng], 14);
                    
                    // 设置标记
                    setMarker(L.latLng(lat, lng));
                } else {
                    alert('未找到位置，请尝试其他搜索词。');
                }
            })
            .catch(error => {
                console.error('搜索位置时出错:', error);
                alert('搜索位置时出错，请稍后再试。');
                
                if (searchInput) {
                    searchInput.disabled = false;
                    searchInput.placeholder = '搜索位置';
                }
            });
    }
    
    // 确认选择的位置
    function confirmLocation() {
        console.log('确认位置');
        
        if (!activeField || !markers[activeField]) {
            alert('请先在地图上选择一个位置。');
            return;
        }
        
        // 获取标记位置
        const location = markers[activeField];
        
        // 反向地理编码获取地址
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`)
            .then(response => response.json())
            .then(data => {
                // 获取输入框
                const input = document.getElementById(activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
                
                if (input && data && data.display_name) {
                    // 设置输入框值为地址
                    input.value = data.display_name;
                } else if (input) {
                    // 设置输入框值为坐标
                    input.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                }
                
                // 如果两个位置都已设置，尝试计算距离
                if (markers.pickup && markers.destination) {
                    calculateDistance();
                }
                
                // 关闭模态窗口
                closeMapModal();
            })
            .catch(error => {
                console.error('反向地理编码出错:', error);
                
                // 获取输入框
                const input = document.getElementById(activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
                
                if (input) {
                    // 设置输入框值为坐标
                    input.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                }
                
                // 关闭模态窗口
                closeMapModal();
            });
    }
    
    // 计算距离
    function calculateDistance() {
        console.log('计算距离');
        
        if (!markers.pickup || !markers.destination) {
            alert('请先选择接送地点和目的地。');
            return;
        }
        
        // 计算两点之间的距离
        const lat1 = markers.pickup.lat;
        const lng1 = markers.pickup.lng;
        const lat2 = markers.destination.lat;
        const lng2 = markers.destination.lng;
        
        // 使用Haversine公式计算距离
        const R = 6371; // 地球半径（千米）
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // 显示距离
        const distanceDisplay = document.getElementById('distance');
        if (distanceDisplay) {
            distanceDisplay.textContent = `距离: ${distance.toFixed(2)} 公里`;
            distanceDisplay.style.display = 'block';
        }
        
        // 计算价格
        if (typeof calculatePrice === 'function') {
            calculatePrice(distance);
        } else {
            // 简单价格计算
            const fareResult = document.getElementById('fareResult');
            if (fareResult) {
                const baseFare = 20;
                const rate = 0.8;
                const totalFare = baseFare + (distance * rate);
                
                fareResult.textContent = `预估费用: $${totalFare.toFixed(2)}`;
                fareResult.style.display = 'block';
            }
        }
        
        return distance;
    }
}); 