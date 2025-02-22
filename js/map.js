let map;
let marker;
let currentField;

// 初始化地图
function initMap() {
    map = L.map('map').setView([7.8731, 80.7718], 8); // Sri Lanka center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 添加地理编码控件
    const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        setMarker(latlng);
        map.setView(latlng, 16);
    })
    .addTo(map);

    // 点击地图设置标记
    map.on('click', function(e) {
        setMarker(e.latlng);
    });
}

// 设置标记
function setMarker(latlng) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(latlng, {draggable: true}).addTo(map);
}

// 打开地图
function openMap(field) {
    currentField = field;
    document.getElementById('mapModal').style.display = 'block';
    if (!map) {
        initMap();
    }
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// 确认位置
function confirmLocation() {
    if (marker) {
        const latlng = marker.getLatLng();
        // 使用 Nominatim 反向地理编码
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(response => response.json())
            .then(data => {
                const address = data.display_name;
                document.getElementById(currentField === 'pickup' ? 'pickupLocation' : 'destination').value = address;
                document.getElementById('mapModal').style.display = 'none';
            });
    }
}

// 关闭模态框
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.getElementsByClassName('close-modal');
    for (let button of closeButtons) {
        button.onclick = function() {
            this.closest('.modal').style.display = 'none';
        }
    }
}); 