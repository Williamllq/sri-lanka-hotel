let map;
let marker;
let vectorLayer;
let currentField;

// 初始化地图
function initMap() {
    // 创建矢量图层来放置标记
    vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    // 创建地图
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([80.7718, 7.8731]), // 斯里兰卡中心点
            zoom: 8
        })
    });

    // 添加点击事件监听器
    map.on('click', function(evt) {
        const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        setMarker(coords);
        getAddressFromCoords(coords);
    });

    // 添加搜索功能
    const searchInput = document.getElementById('searchLocation');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation(this.value);
        }
    });
}

// 搜索位置
function searchLocation(query) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    
    fetch(nominatimUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
                setMarker(coords);
                map.getView().setCenter(ol.proj.fromLonLat(coords));
                map.getView().setZoom(16);
            }
        });
}

// 设置标记
function setMarker(coords) {
    vectorLayer.getSource().clear();
    const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
    });
    
    feature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/examples/data/icon.png'
        })
    }));

    vectorLayer.getSource().addFeature(feature);
    marker = feature;
}

// 从坐标获取地址
function getAddressFromCoords(coords) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}`;
    
    fetch(nominatimUrl)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById(currentField === 'pickup' ? 'pickupLocation' : 'destination').value = data.display_name;
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
    // 触发地图重新计算大小
    map.updateSize();
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