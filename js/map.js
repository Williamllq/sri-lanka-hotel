let map;
let marker;
let currentField;

// Mapbox access token
mapboxgl.accessToken = '您的实际token';

// 初始化地图
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [80.7718, 7.8731], // 斯里兰卡中心点
        zoom: 8
    });

    // 添加搜索控件
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: 'Search location...',
        marker: false
    });

    map.addControl(geocoder);

    // 点击地图设置标记
    map.on('click', function(e) {
        setMarker([e.lngLat.lng, e.lngLat.lat]);
        getAddressFromCoords([e.lngLat.lng, e.lngLat.lat]);
    });

    // 搜索结果选中时
    geocoder.on('result', function(e) {
        setMarker([e.result.center[0], e.result.center[1]]);
        const address = e.result.place_name;
        document.getElementById(currentField === 'pickup' ? 'pickupLocation' : 'destination').value = address;
    });
}

// 设置标记
function setMarker(coords) {
    if (marker) {
        marker.remove();
    }
    marker = new mapboxgl.Marker({
        draggable: true
    })
    .setLngLat(coords)
    .addTo(map);

    // 拖动结束后更新地址
    marker.on('dragend', function() {
        const lngLat = marker.getLngLat();
        getAddressFromCoords([lngLat.lng, lngLat.lat]);
    });
}

// 从坐标获取地址
function getAddressFromCoords(coords) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const address = data.features[0].place_name;
                document.getElementById(currentField === 'pickup' ? 'pickupLocation' : 'destination').value = address;
            }
        });
}

// 打开地图
function openMap(field) {
    currentField = field;
    document.getElementById('mapModal').style.display = 'block';
    if (!map) {
        initMap();
    }
    map.resize();
}

// 确认位置
function confirmLocation() {
    document.getElementById('mapModal').style.display = 'none';
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