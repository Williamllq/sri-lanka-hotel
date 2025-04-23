// Global variables for the map elements
let mapContainer = null;
let mapModal = null;
let map = null;
let tempMarker = null;
let selectedLocation = null;
let activeLocationInput = null;
let searchInput = null;
let searchButton = null;
let confirmButton = null;
let mapLoadingIndicator = null; // 新增：地图加载指示器

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up map event listeners');
    
    // Get map elements
    mapModal = document.getElementById('mapModal');
    mapContainer = document.getElementById('modalMap');
    searchInput = document.getElementById('mapSearchInput');
    searchButton = document.getElementById('mapSearchBtn');
    confirmButton = document.getElementById('confirmLocationBtn');
    
    if (!mapModal || !mapContainer) {
        console.error('Map modal or container not found');
        return;
    }
    
    // 新增：创建加载指示器元素
    createLoadingIndicator();
    
    // Set up map button click listeners
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    const closeMapBtn = document.getElementById('closeMapModal');
    
    if (pickupMapBtn) {
        pickupMapBtn.addEventListener('click', function() {
            console.log('Pickup map button clicked');
            document.getElementById('mapModalTitle').textContent = 'Select Pickup Location';
            activeLocationInput = document.getElementById('pickupLocation');
            openMapModal();
        });
    }
    
    if (destinationMapBtn) {
        destinationMapBtn.addEventListener('click', function() {
            console.log('Destination map button clicked');
            document.getElementById('mapModalTitle').textContent = 'Select Destination Location';
            activeLocationInput = document.getElementById('destinationLocation');
            openMapModal();
        });
    }
    
    if (closeMapBtn) {
        closeMapBtn.addEventListener('click', function() {
            console.log('Close map button clicked');
            closeMapModal();
        });
    }
    
    // Set up search functionality
    if (searchInput) {
        // Add event listener for Enter key
        searchInput.addEventListener('keypress', function(e) {
            console.log('Search input keypress:', e.key);
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation();
            }
        });
        
        // Add focus and blur effects
        searchInput.addEventListener('focus', function() {
            console.log('Search input focused');
            this.style.borderColor = '#4CAF50';
        });
        
        searchInput.addEventListener('blur', function() {
            console.log('Search input blurred');
            this.style.borderColor = '#ddd';
        });
    } else {
        console.error('Search input element not found');
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('Search button clicked');
            searchLocation();
        });
    } else {
        console.error('Search button element not found');
    }
    
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            console.log('Confirm button clicked');
            confirmLocation();
        });
    } else {
        console.error('Confirm button element not found');
    }
    
    // 新增：预加载Leaflet库
    preloadLeaflet();
});

// 新增：创建加载指示器
function createLoadingIndicator() {
    mapLoadingIndicator = document.createElement('div');
    mapLoadingIndicator.className = 'map-loading-indicator';
    mapLoadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>Loading map...</p>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .map-loading-indicator {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: sans-serif;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// 新增：预加载Leaflet
function preloadLeaflet() {
    // 检查是否已加载
    if (typeof L !== 'undefined') {
        console.log('Leaflet already loaded');
        return;
    }
    
    console.log('Preloading Leaflet library');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.defer = true;
    
    script.onload = function() {
        console.log('Leaflet preloaded successfully');
    };
    
    script.onerror = function() {
        console.error('Failed to preload Leaflet');
    };
    
    document.head.appendChild(script);
}

// Open the map modal and initialize map
function openMapModal() {
    console.log('Opening map modal');
    
    if (!mapModal) {
        mapModal = document.getElementById('mapModal');
        if (!mapModal) {
            console.error('Map modal not found');
            return;
        }
    }
    
    // 根据当前选择的输入框更新标题
    const titleElement = document.getElementById('mapModalTitle');
    if (titleElement) {
        if (activeLocationInput === document.getElementById('pickupLocation')) {
            titleElement.textContent = translate('select-pickup-location', 'Select Pickup Location');
        } else {
            titleElement.textContent = translate('select-destination-location', 'Select Destination Location');
        }
    }
    
    // 更新搜索框提示文本
    if (searchInput) {
        searchInput.placeholder = translate('search-location', 'Search for a location in Sri Lanka');
    }
    
    // 更新确认按钮文本
    if (confirmButton) {
        confirmButton.innerHTML = `<i class="fas fa-check"></i> ${translate('confirm-location', 'Confirm Location')}`;
    }
    
    // 显示模态框
    mapModal.style.display = 'flex';
    
    // 显示加载指示器
    if (mapLoadingIndicator && mapContainer) {
        // 更新加载指示器文本
        const loadingText = mapLoadingIndicator.querySelector('p');
        if (loadingText) {
            loadingText.textContent = translate('map-loading', 'Loading map...');
        }
        mapContainer.appendChild(mapLoadingIndicator);
    }
    
    // 初始化地图
    setTimeout(function() {
        initMap();
    }, 300);
}

// Close the map modal
function closeMapModal() {
    console.log('Closing map modal');
    if (mapModal) {
        mapModal.style.display = 'none';
    }
    
    // Clear the selected location
    selectedLocation = null;
    
    // Remove any temporary markers
    if (tempMarker && map) {
        tempMarker.remove();
        tempMarker = null;
    }
}

// Initialize the map of Sri Lanka
function initMap() {
    console.log('Initializing Sri Lanka map. Leaflet loaded:', typeof L !== 'undefined');
    
    if (!mapContainer) {
        mapContainer = document.getElementById('modalMap');
        if (!mapContainer) {
            console.error('Map container element not found');
            return;
        }
    }
    
    // Check if the map container is visible
    if (window.getComputedStyle(mapContainer).display === 'none') {
        console.error('Map container is not visible');
        return;
    }
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        loadLeaflet();
        return;
    }
    
    // Check if the map is already initialized
    if (map) {
        console.log('Map already exists, resizing');
        map.invalidateSize();
        
        // 隐藏加载指示器
        if (mapLoadingIndicator && mapLoadingIndicator.parentNode) {
            mapLoadingIndicator.parentNode.removeChild(mapLoadingIndicator);
        }
        return;
    }
    
    try {
        console.log('Creating new map');
        // Set height explicitly to ensure the map renders correctly
        mapContainer.style.height = '400px';
        mapContainer.style.width = '100%';
        
        // Create map centered on Sri Lanka
        map = L.map('modalMap', {
            zoomControl: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true
        }).setView([7.8731, 80.7718], 8);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add click event to map
        map.on('click', function(e) {
            console.log('Map clicked at:', e.latlng);
            setMarker(e.latlng);
        });
        
        // Add Sri Lanka popular destinations
        addSriLankaDestinations();
        
        // Ensure the map renders correctly
        setTimeout(function() {
            map.invalidateSize();
            
            // 隐藏加载指示器
            if (mapLoadingIndicator && mapLoadingIndicator.parentNode) {
                mapLoadingIndicator.parentNode.removeChild(mapLoadingIndicator);
            }
        }, 300);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        // 隐藏加载指示器并显示错误信息
        if (mapLoadingIndicator && mapLoadingIndicator.parentNode) {
            mapLoadingIndicator.parentNode.removeChild(mapLoadingIndicator);
        }
        
        // 显示用户友好的错误信息
        const errorMsg = document.createElement('div');
        errorMsg.className = 'map-error-message';
        errorMsg.innerHTML = `
            <div style="text-align:center; padding: 20px; color: #721c24; background-color: #f8d7da; border-radius: 5px;">
                <i class="fas fa-exclamation-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>Unable to load the map. Please check your internet connection and try again.</p>
                <button onclick="initMap()" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    Retry
                </button>
            </div>
        `;
        mapContainer.appendChild(errorMsg);
    }
}

// Load Leaflet dynamically if not available
function loadLeaflet() {
    console.log('Attempting to load Leaflet dynamically');
    
    // 显示加载状态
    if (mapContainer) {
        const loadingMsg = document.createElement('div');
        loadingMsg.style.textAlign = 'center';
        loadingMsg.style.padding = '20px';
        loadingMsg.innerHTML = 'Loading map library... <div class="spinner" style="display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite; margin-left: 10px;"></div>';
        mapContainer.innerHTML = '';
        mapContainer.appendChild(loadingMsg);
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    // Add load event
    script.onload = function() {
        console.log('Leaflet loaded successfully');
        // Wait a moment and try to initialize map again
        setTimeout(initMap, 500);
    };
    
    // Add error event
    script.onerror = function() {
        console.error('Failed to load Leaflet');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="text-align:center; padding: 20px; color: #721c24; background-color: #f8d7da; border-radius: 5px;">
                    <p>Failed to load the map library. Please check your internet connection.</p>
                    <button onclick="loadLeaflet()" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        Try Again
                    </button>
                </div>
            `;
        }
    };
    
    // Add script to document
    document.head.appendChild(script);
}

// Perform location search
function searchLocation() {
    console.log('Searching for location');
    
    if (!searchInput) {
        searchInput = document.getElementById('mapSearchInput');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }
    }
    
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showMapMessage(translate('location-required', 'Please enter a location to search'));
        return;
    }
    
    console.log('Searching for:', searchTerm);
    
    // 显示加载状态
    if (searchButton) {
        searchButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translate('searching', 'Searching...')}`;
        searchButton.disabled = true;
    }
    
    // 添加"Sri Lanka"到搜索条件
    let fullSearchTerm = searchTerm;
    if (!searchTerm.toLowerCase().includes('sri lanka')) {
        fullSearchTerm = searchTerm + ', Sri Lanka';
    }
    
    // 使用Nominatim API进行地理编码
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullSearchTerm)}&limit=5&addressdetails=1`, {
        headers: {
            'User-Agent': 'SriLankaStayExplore/1.0',
            'Accept-Language': `${getCurrentLanguage()},en;q=0.9`
        }
    })
    .then(response => {
        console.log('Search API response status:', response.status);
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Search results:', data);
        
        // 重置按钮状态
        if (searchButton) {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
        }
        
        // 检查是否找到结果
        if (data && data.length > 0) {
            // 过滤斯里兰卡的结果
            const sriLankaResults = data.filter(item => {
                return item.address && 
                    (item.address.country === 'Sri Lanka' || 
                     item.address.country_code === 'lk');
            });
            
            if (sriLankaResults.length > 0) {
                // 使用第一个结果
                const result = sriLankaResults[0];
                const latlng = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                };
                
                // 设置标记并缩放到位置
                setMarker(latlng);
                map.setView(latlng, 14);
                
                // 显示成功消息
                searchInput.style.borderColor = '#4CAF50';
                // 添加临时动画效果
                searchInput.classList.add('search-success');
                setTimeout(() => {
                    searchInput.classList.remove('search-success');
                    searchInput.style.borderColor = '';
                }, 2000);
                
            } else {
                // 如果没有斯里兰卡的结果，检查是否有任何结果
                fallbackToHardcodedLocations(searchTerm);
            }
        } else {
            fallbackToHardcodedLocations(searchTerm);
        }
    })
    .catch(error => {
        console.error('Error searching for location:', error);
        
        // 重置按钮状态
        if (searchButton) {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
        }
        
        // 显示用户友好的错误消息
        showMapMessage(translate('no-location-found', 'No locations found. Please try a different search term.'));
        
        // 尝试使用硬编码位置
        fallbackToHardcodedLocations(searchTerm);
    });
}

// 添加地图消息显示函数
function showMapMessage(message, type = 'info') {
    // 检查是否已存在消息元素
    let messageElement = document.querySelector('.map-message');
    if (!messageElement) {
        // 创建消息元素
        messageElement = document.createElement('div');
        messageElement.className = 'map-message';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .map-message {
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 4px;
                font-size: 14px;
                position: relative;
                animation: fadeIn 0.3s ease-out;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .map-message.info {
                background-color: #e3f2fd;
                color: #0277bd;
                border-left: 4px solid #0277bd;
            }
            
            .map-message.error {
                background-color: #ffebee;
                color: #c62828;
                border-left: 4px solid #c62828;
            }
            
            .map-message.success {
                background-color: #e8f5e9;
                color: #2e7d32;
                border-left: 4px solid #2e7d32;
            }
            
            .map-message-close {
                position: absolute;
                right: 8px;
                top: 8px;
                background: none;
                border: none;
                color: inherit;
                font-size: 14px;
                cursor: pointer;
                opacity: 0.6;
            }
            
            .map-message-close:hover {
                opacity: 1;
            }
            
            .search-success {
                animation: pulse 1s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // 插入搜索容器后面
        const searchContainer = document.querySelector('.map-search-container');
        if (searchContainer && searchContainer.parentNode) {
            searchContainer.parentNode.insertBefore(messageElement, searchContainer.nextSibling);
        }
    }
    
    // 设置消息类型和内容
    messageElement.className = `map-message ${type}`;
    messageElement.innerHTML = `
        ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
          type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
          '<i class="fas fa-info-circle"></i>'}
        ${message}
        <button class="map-message-close">&times;</button>
    `;
    
    // 添加关闭按钮功能
    const closeButton = messageElement.querySelector('.map-message-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            messageElement.style.display = 'none';
        });
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.style.display = 'none';
        }
    }, 5000);
}

// 更新硬编码位置的回退函数，包含国际化支持
function fallbackToHardcodedLocations(searchTerm) {
    console.log('Falling back to hardcoded locations for:', searchTerm);
    
    // 斯里兰卡常见位置
    const locations = {
        'colombo': { lat: 6.9271, lng: 79.8612, i18n: 'colombo' },
        'kandy': { lat: 7.2906, lng: 80.6337, i18n: 'kandy' },
        'galle': { lat: 6.0535, lng: 80.2210, i18n: 'galle' },
        'negombo': { lat: 7.2095, lng: 79.8384, i18n: 'negombo' },
        'jaffna': { lat: 9.6615, lng: 80.0255, i18n: 'jaffna' },
        'ella': { lat: 6.8667, lng: 81.0466, i18n: 'ella' },
        'nuwara eliya': { lat: 6.9697, lng: 80.7893, i18n: 'nuwara-eliya' },
        'sigiriya': { lat: 7.9572, lng: 80.7600, i18n: 'sigiriya' },
        'anuradhapura': { lat: 8.3114, lng: 80.4037, i18n: 'anuradhapura' },
        'trincomalee': { lat: 8.5667, lng: 81.2333, i18n: 'trincomalee' },
        'airport': { lat: 7.1801, lng: 79.8841, i18n: 'airport' }
    };
    
    // 检查搜索词是否匹配任何已知位置
    const normalizedSearch = searchTerm.toLowerCase();
    let found = false;
    
    for (const [name, locationData] of Object.entries(locations)) {
        // 也检查翻译后的名称是否匹配
        const translatedName = translate(locationData.i18n, name).toLowerCase();
        
        if (normalizedSearch.includes(name) || 
            name.includes(normalizedSearch) || 
            normalizedSearch.includes(translatedName) || 
            translatedName.includes(normalizedSearch)) {
            
            console.log('Found matching location:', name);
            setMarker(locationData);
            map.setView(locationData, 14);
            found = true;
            
            // 显示成功消息
            const locationName = translate(locationData.i18n, name);
            showMapMessage(`${locationName} ${translate('selected', 'selected')}`, 'success');
            break;
        }
    }
    
    if (!found) {
        // 如果没有匹配项，默认为科伦坡
        showMapMessage(`${translate('default-to-colombo', `Location "${searchTerm}" not found. Showing Colombo as default.`)}`, 'info');
        setMarker(locations.colombo);
        map.setView(locations.colombo, 12);
    }
}

// Set a marker on the map
function setMarker(latlng) {
    console.log('Setting marker at:', latlng);
    
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    // Remove any existing temporary marker
    if (tempMarker) {
        tempMarker.remove();
    }
    
    try {
        // Create marker with custom icon
        tempMarker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'destination-marker',
                html: `<div class="dest-marker-inner">${activeLocationInput === document.getElementById('pickupLocation') ? 'Pickup' : 'Destination'}</div>`,
                iconSize: [100, 30],
                iconAnchor: [50, 15]
            })
        }).addTo(map);
        
        // Create popup with coordinates
        const popupContent = `
            <strong>${activeLocationInput === document.getElementById('pickupLocation') ? 'Pickup' : 'Destination'} Location</strong>
            <br>
            Latitude: ${latlng.lat.toFixed(6)}
            <br>
            Longitude: ${latlng.lng.toFixed(6)}
        `;
        
        tempMarker.bindPopup(popupContent).openPopup();
        
        // Store selected location
        selectedLocation = {
            lat: latlng.lat,
            lng: latlng.lng
        };
        
        // Activate confirm button
        if (confirmButton) {
            confirmButton.classList.add('active');
            // Pulse animation
            confirmButton.classList.remove('active');
            void confirmButton.offsetWidth; // Trigger reflow
            confirmButton.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error setting marker:', error);
        alert('Failed to set marker on the map. Please try again.');
    }
}

// Add popular destinations in Sri Lanka as markers
function addSriLankaDestinations() {
    console.log('Adding Sri Lanka destinations');
    
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    const destinations = [
        { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
        { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
        { name: 'Galle', lat: 6.0535, lng: 80.2210 },
        { name: 'Ella', lat: 6.8667, lng: 81.0466 },
        { name: 'Sigiriya', lat: 7.9572, lng: 80.7600 },
        { name: 'Nuwara Eliya', lat: 6.9697, lng: 80.7893 }
    ];
    
    destinations.forEach(dest => {
        const marker = L.marker([dest.lat, dest.lng], {
            icon: L.divIcon({
                className: 'destination-marker',
                html: `<div class="dest-marker-inner">${dest.name}</div>`,
                iconSize: [100, 30],
                iconAnchor: [50, 15]
            })
        }).addTo(map);
        
        marker.on('click', function() {
            console.log('Destination clicked:', dest.name);
            setMarker({ lat: dest.lat, lng: dest.lng });
        });
    });
}

// Confirm the selected location
function confirmLocation() {
    console.log('Confirming location');
    
    if (!selectedLocation) {
        showMapMessage(translate('location-required', 'Please select a location on the map first'), 'error');
        return;
    }
    
    if (!activeLocationInput) {
        console.error('No active location input');
        return;
    }
    
    // 根据当前模态标题获取位置类型（接送地点或目的地）
    const locationType = document.getElementById('mapModalTitle').textContent
        .replace(translate('select-pickup-location', 'Select Pickup Location'), translate('pickup', 'Pickup'))
        .replace(translate('select-destination-location', 'Select Destination Location'), translate('destination', 'Destination'));
    
    // 创建包含坐标的位置字符串
    const locationString = `${locationType} (${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)})`;
    
    // 设置位置值
    activeLocationInput.value = locationString;
    
    // 在数据集中存储经纬度以便轻松访问
    activeLocationInput.dataset.lat = selectedLocation.lat.toFixed(6);
    activeLocationInput.dataset.lng = selectedLocation.lng.toFixed(6);
    
    // 关闭模态框
    closeMapModal();
    
    // 添加对输入的高亮效果
    activeLocationInput.style.backgroundColor = '#f0fff0';
    setTimeout(() => {
        activeLocationInput.style.backgroundColor = '';
    }, 1500);
    
    // 检查接送地点和目的地是否都已设置
    checkLocationsAndEnableQuote();
}

// Calculate distance between two coordinates using Haversine formula
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
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Check if both pickup and destination locations are set
function checkLocationsAndEnableQuote() {
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const quoteBtn = document.querySelector('.btn.secondary'); // Get Quote button
    const bookBtn = document.querySelector('.btn.primary'); // Book Now button
    
    if (!pickupInput || !destinationInput) {
        console.error('Pickup or destination input not found');
        return;
    }
    
    // Check if both pickup and destination have latitude and longitude data
    const hasPickupCoords = pickupInput.dataset.lat && pickupInput.dataset.lng;
    const hasDestinationCoords = destinationInput.dataset.lat && destinationInput.dataset.lng;
    
    if (hasPickupCoords && hasDestinationCoords) {
        console.log('Both pickup and destination coordinates are set');
        if (quoteBtn) {
            quoteBtn.classList.add('active');
            quoteBtn.disabled = false;
        }
    } else {
        console.log('Pickup or destination coordinates are not set');
        if (quoteBtn) {
            quoteBtn.classList.remove('active');
            quoteBtn.disabled = true;
        }
        if (bookBtn) {
            bookBtn.classList.remove('active');
            bookBtn.disabled = true;
        }
    }
}

// 增加一个语言翻译辅助函数
function translate(key, defaultText) {
    // 获取当前语言
    const currentLang = getCurrentLanguage() || 'en';
    
    // 如果翻译对象存在且有对应翻译，则使用翻译
    if (window.translations && 
        window.translations[currentLang] && 
        window.translations[currentLang][key]) {
        return window.translations[currentLang][key];
    }
    
    // 否则返回默认文本
    return defaultText;
}

// 获取当前语言
function getCurrentLanguage() {
    // 从localStorage中获取当前语言设置
    return localStorage.getItem('selectedLanguage') || 'en';
} 