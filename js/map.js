let map = null;
let marker = null;
let currentField = null;
let pickupMarker = null;
let destinationMarker = null;

// 初始化地图
function initMap() {
    console.log('initMap called');
    if (map !== null) {
        map.remove();
        map = null;
    }
    
    try {
        map = L.map('map').setView([7.8731, 80.7718], 8); // 斯里兰卡中心点
        
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France',
            maxZoom: 19,
            subdomains: 'abc'
        }).addTo(map);

        // 添加主要城市标记
        const cities = {
            'Colombo': [6.9271, 79.8612],
            'Kandy': [7.2906, 80.6337],
            'Galle': [6.0535, 80.2210],
            'Jaffna': [9.6615, 80.0255],
            'Trincomalee': [8.5874, 81.2152]
        };

        for (let city in cities) {
            L.marker(cities[city])
                .addTo(map)
                .bindPopup(city)
                .on('click', function() {
                    setMarker(cities[city]);
                });
        }

        // 点击地图设置标记
        map.on('click', function(e) {
            setMarker([e.latlng.lat, e.latlng.lng]);
        });

        // 搜索功能
        const searchInput = document.getElementById('searchLocation');
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation(this.value);
            }
        });
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// 搜索位置
function searchLocation(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}+Sri+Lanka`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setMarker(location);
                map.setView(location, 13);
            }
        });
}

// 设置标记
function setMarker(latlng) {
    if (marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker(latlng, {draggable: true}).addTo(map);
    
    // 获取地址
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng[0]}&lon=${latlng[1]}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                marker.bindPopup(data.display_name).openPopup();
            }
        });
}

// 打开地图
function openMap(field) {
    console.log('Opening map for:', field);
    currentField = field;
    const mapModal = document.getElementById('mapModal');
    mapModal.style.display = 'block';
    
    // 等待模态框显示后再初始化地图
    setTimeout(() => {
        if (!map) {
            console.log('Initializing map');
            initMap();
        }
        if (map) {
            map.invalidateSize();
        }
    }, 100);
}

// 确认位置
function confirmLocation() {
    if (marker) {
        const latlng = marker.getLatLng();
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(response => response.json())
            .then(data => {
                const address = data.display_name;
                document.getElementById(currentField === 'pickup' ? 'pickupLocation' : 'destination').value = address;
                
                // 保存标记
                if (currentField === 'pickup') {
                    if (pickupMarker) map.removeLayer(pickupMarker);
                    pickupMarker = marker;
                } else {
                    if (destinationMarker) map.removeLayer(destinationMarker);
                    destinationMarker = marker;
                }
                
                // 如果两个点都已设置，计算距离
                if (pickupMarker && destinationMarker) {
                    const distance = pickupMarker.getLatLng().distanceTo(destinationMarker.getLatLng()) / 1000;
                    document.getElementById('estimatedPrice').textContent = 
                        `Distance: ${distance.toFixed(2)} km / Estimated Price: $${(distance * 0.5).toFixed(2)}`;
                }
                
                document.getElementById('mapModal').style.display = 'none';
            });
    }
}

// 关闭模态框
document.addEventListener('DOMContentLoaded', function() {
    // 初始化关闭按钮
    const closeButtons = document.getElementsByClassName('close-modal');
    for (let button of closeButtons) {
        button.onclick = function() {
            this.closest('.modal').style.display = 'none';
        }
    }

    // 初始化地图按钮点击事件
    const mapButtons = document.querySelectorAll('.map-btn');
    mapButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const field = this.getAttribute('data-field');
            openMap(field);
        });
    });
}); 