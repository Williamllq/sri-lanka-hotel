// 全局变量
let mapModalActive = false;
let activeField = null;
let map = null;
let markers = {
    pickup: null,
    destination: null
};

// 当DOM加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] DOM loaded - 初始化地图功能');
    
    // 初始化地图按钮事件
    initMapButtons();
    
    // 初始化模态窗口
    initMapModal();
    
    // 确保地图元素存在
    const mapContainer = document.getElementById('modalMap');
    if (!mapContainer) {
        console.error('[DEBUG] 找不到地图容器元素 #modalMap');
    } else {
        console.log('[DEBUG] 找到地图容器元素');
        const rect = mapContainer.getBoundingClientRect();
        console.log('[DEBUG] 地图容器位置和尺寸:', rect.top, rect.left, rect.width, rect.height);
    }
    
    // 测试模态窗口 - 在页面加载后1秒尝试打开地图模态窗口
    setTimeout(function() {
        console.log('[DEBUG] 自动测试打开地图模态窗口');
        openMapModal('pickup');
    }, 5000);
});

// 初始化地图按钮事件
function initMapButtons() {
    console.log('初始化地图按钮');
    
    // 获取输入框和按钮元素
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const pickupBtn = document.getElementById('pickupMapBtn');
    const destinationBtn = document.getElementById('destinationMapBtn');
    
    // 如果选择地图按钮存在，添加点击事件
    if (pickupBtn) {
        console.log('找到接送地点地图按钮');
        pickupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('接送地点地图按钮被点击');
            openMapModal('pickup');
        });
    } else {
        console.error('找不到接送地点地图按钮 #pickupMapBtn');
    }
    
    if (destinationBtn) {
        console.log('找到目的地地图按钮');
        destinationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('目的地地图按钮被点击');
            openMapModal('destination');
        });
    } else {
        console.error('找不到目的地地图按钮 #destinationMapBtn');
    }
    
    // 输入框点击也可以打开地图
    if (pickupInput) {
        pickupInput.addEventListener('click', function() {
            console.log('接送地点输入框被点击');
            openMapModal('pickup');
        });
    }
    
    if (destinationInput) {
        destinationInput.addEventListener('click', function() {
            console.log('目的地输入框被点击');
            openMapModal('destination');
        });
    }
    
    // 计算按钮
    const calculateBtn = document.getElementById('calculateFareBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            console.log('计算价格按钮被点击');
            calculateDistance();
        });
    }
}

// 初始化地图模态窗口
function initMapModal() {
    console.log('初始化地图模态窗口');
    
    // 获取模态窗口元素
    const mapModal = document.getElementById('mapModal');
    const closeBtn = document.getElementById('closeMapModal');
    const confirmBtn = document.getElementById('confirmLocationBtn');
    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    
    // 关闭按钮点击事件
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('关闭按钮被点击');
            closeMapModal();
        });
    }
    
    // 确认位置按钮点击事件
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log('确认位置按钮被点击');
            confirmLocation();
        });
    }
    
    // 搜索按钮点击事件
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            console.log('搜索按钮被点击');
            const query = searchInput.value;
            if (query) {
                searchLocation(query);
            }
        });
    }
    
    // 搜索输入框回车事件
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value;
                if (query) {
                    searchLocation(query);
                }
            }
        });
    }
    
    // 点击模态窗口背景关闭
    if (mapModal) {
        mapModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMapModal();
            }
        });
    }
}

// 打开地图模态窗口
function openMapModal(field) {
    console.log('[DEBUG] 打开地图模态窗口，字段:', field);
    
    // 保存当前活动字段
    activeField = field;
    
    // 获取模态窗口元素
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) {
        console.error('[DEBUG] 找不到地图模态窗口元素 #mapModal');
        return;
    }
    
    console.log('[DEBUG] 找到模态窗口元素，当前display值:', getComputedStyle(mapModal).display);
    
    // 设置标题
    const modalTitle = document.getElementById('mapModalTitle');
    if (modalTitle) {
        modalTitle.textContent = field === 'pickup' ? '选择接送地点' : '选择目的地';
    }
    
    // 显示模态窗口 - 确保样式正确应用
    try {
        mapModal.style.display = 'flex';
        console.log('[DEBUG] 已设置模态窗口display为flex');
        
        // 强制页面回流，确保样式已应用
        void mapModal.offsetHeight;
        
        console.log('[DEBUG] 应用后的实际display值:', getComputedStyle(mapModal).display);
    } catch (error) {
        console.error('[DEBUG] 设置模态窗口display时出错:', error);
    }
    
    mapModalActive = true;
    
    // 在短暂延迟后初始化地图，确保模态窗口已显示
    setTimeout(function() {
        console.log('[DEBUG] 模态窗口应该已显示，开始初始化地图');
        initializeMap();
    }, 300);
}

// 关闭地图模态窗口
function closeMapModal() {
    console.log('关闭地图模态窗口');
    
    // 获取模态窗口元素
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) return;
    
    // 隐藏模态窗口
    mapModal.style.display = 'none';
    mapModalActive = false;
    activeField = null;
}

// 初始化地图
function initializeMap() {
    console.log('[DEBUG] 初始化地图');
    
    // 确保地图容器元素存在
    const mapContainer = document.getElementById('modalMap');
    if (!mapContainer) {
        console.error('[DEBUG] 找不到地图容器元素 #modalMap');
        return;
    }
    
    const rect = mapContainer.getBoundingClientRect();
    console.log('[DEBUG] 初始化前地图容器位置和尺寸:', rect.top, rect.left, rect.width, rect.height);
    
    // 如果地图已存在，刷新大小后返回
    if (map) {
        console.log('[DEBUG] 地图已存在，更新大小');
        map.invalidateSize();
        
        // 如果有标记，则居中到标记位置
        if (activeField && markers[activeField]) {
            map.setView(markers[activeField].getLatLng(), 13);
        }
        
        return;
    }
    
    try {
        console.log('[DEBUG] 创建新地图');
        
        // 确保Leaflet库已加载
        if (typeof L === 'undefined') {
            console.error('[DEBUG] Leaflet库未加载！');
            return;
        }
        
        // 创建地图并设置视图中心点（斯里兰卡中心）
        map = L.map('modalMap').setView([7.8731, 80.7718], 8);
        
        // 添加地图图层（OpenStreetMap）
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // 添加地图点击事件，用于设置标记
        map.on('click', function(e) {
            console.log('[DEBUG] 地图被点击，位置:', e.latlng);
            setMarker(e.latlng);
        });
        
        console.log('[DEBUG] 地图创建成功');
        
    } catch (error) {
        console.error('[DEBUG] 创建地图时出错:', error);
    }
    
    // 强制更新地图大小，确保在模态窗口中正确显示
    setTimeout(function() {
        if (map) {
            console.log('[DEBUG] 强制更新地图大小');
            map.invalidateSize();
        }
    }, 500);
}

// 在地图上设置标记
function setMarker(latlng) {
    console.log('设置标记，位置:', latlng);
    
    if (!activeField || !map) {
        console.error('没有活动字段或地图未初始化');
        return;
    }
    
    // 移除现有标记（如果存在）
    if (markers[activeField]) {
        console.log('移除现有标记');
        map.removeLayer(markers[activeField]);
    }
    
    // 创建新标记并添加到地图
    console.log('创建新标记');
    markers[activeField] = L.marker(latlng).addTo(map);
}

// 搜索位置
function searchLocation(query) {
    console.log('搜索位置:', query);
    
    if (!query || !map) {
        console.error('搜索查询为空或地图未初始化');
        return;
    }
    
    // 显示搜索中状态
    const searchInput = document.getElementById('mapSearchInput');
    if (searchInput) {
        searchInput.disabled = true;
        searchInput.placeholder = '搜索中...';
    }
    
    // 使用 Nominatim 搜索 API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // 恢复搜索输入框状态
            if (searchInput) {
                searchInput.disabled = false;
                searchInput.placeholder = '搜索位置';
            }
            
            if (data && data.length > 0) {
                console.log('找到位置:', data[0]);
                
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);
                const latlng = L.latLng(lat, lon);
                
                // 将地图居中到找到的位置
                map.setView(latlng, 14);
                
                // 设置标记
                setMarker(latlng);
                
            } else {
                console.error('未找到位置');
                alert('未找到位置，请尝试不同的搜索词。');
            }
        })
        .catch(error => {
            console.error('搜索位置时出错:', error);
            alert('搜索位置时出错，请稍后再试。');
            
            // 恢复搜索输入框状态
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
    const latlng = markers[activeField].getLatLng();
    console.log('确认位置坐标:', latlng);
    
    // 使用反向地理编码获取地址
    reverseGeocode(latlng, function(address) {
        // 更新输入框值
        const inputId = activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation';
        const input = document.getElementById(inputId);
        
        if (input) {
            // 使用地址或坐标作为输入框值
            input.value = address || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            console.log(`更新${inputId}值:`, input.value);
        }
        
        // 如果两个位置都已设置，则计算距离
        if (markers.pickup && markers.destination) {
            calculateDistance();
        }
        
        // 关闭地图模态窗口
        closeMapModal();
    });
}

// 反向地理编码（坐标转地址）
function reverseGeocode(latlng, callback) {
    console.log('反向地理编码:', latlng);
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                console.log('获取到地址:', data.display_name);
                callback(data.display_name);
            } else {
                console.error('未获取到地址');
                callback(null);
            }
        })
        .catch(error => {
            console.error('反向地理编码出错:', error);
            callback(null);
        });
}

// 计算两点之间的距离
function calculateDistance() {
    console.log('计算距离');
    
    if (!markers.pickup || !markers.destination) {
        console.error('缺少起点或终点标记');
        return 0;
    }
    
    // 获取两点坐标
    const pickup = markers.pickup.getLatLng();
    const destination = markers.destination.getLatLng();
    
    // 计算距离（单位：公里）
    const distance = pickup.distanceTo(destination) / 1000;
    console.log('计算的距离:', distance, 'km');
    
    // 显示距离
    const distanceDisplay = document.getElementById('distance');
    if (distanceDisplay) {
        distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;
        distanceDisplay.style.display = 'block';
    }
    
    // 显示价格计算结果
    if (typeof calculatePrice === 'function') {
        calculatePrice(distance);
    } else {
        console.log('没有找到calculatePrice函数，请确保已正确加载transport.js');
        
        // 显示一个基本价格估算
        const fareResult = document.getElementById('fareResult');
        if (fareResult) {
            const baseFare = 10;
            const rate = 0.8; // 每公里费率
            const estimatedFare = baseFare + (distance * rate);
            fareResult.textContent = `Estimated fare: $${estimatedFare.toFixed(2)}`;
            fareResult.style.display = 'block';
        }
    }
    
    return distance;
} 