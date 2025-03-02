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
    console.log('Sri Lanka Map Selection Tool Loaded');
    
    // Get necessary DOM elements
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
    
    // Global variables
    let currentMarker = null;
    
    // Set up event listeners for the location inputs and buttons
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
    
    // Calculate button event listener
    const calculateBtn = document.getElementById('calculateFareBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateDistance);
    }
    
    // Debug button event listener
    if (debugBtn) {
        debugBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Debug button clicked, forcing map to open');
            
            // Ensure modal is visible with proper styling
            if (mapModal) {
                mapModal.style.display = 'flex';
                mapModal.style.zIndex = '10000';
                mapModal.classList.add('active');
            }
            
            // Force map container to be visible
            if (mapContainer) {
                mapContainer.style.height = '400px';
                mapContainer.style.width = '100%';
                mapContainer.style.display = 'block';
            }
            
            // Open map modal focusing on Sri Lanka
            openMapModal('pickup');
            
            // Re-initialize map after a short delay
            setTimeout(function() {
                console.log('Reinitializing map');
                if (map) {
                    map.remove();
                    map = null;
                }
                initMap();
            }, 300);
        });
    }
    
    // 确保地图元素存在
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

// 打开地图模态窗口
function openMapModal(field) {
    console.log('Opening map modal for:', field);
    
    if (!mapModal) {
        console.error('Map modal element not found');
        return;
    }
    
    // Set active field (pickup or destination)
    activeField = field;
    
    // Update modal title
    const modalTitle = document.getElementById('mapModalTitle');
    if (modalTitle) {
        modalTitle.textContent = field === 'pickup' ? 'Select Pickup Location' : 'Select Destination';
    }
    
    // Show modal with proper styling
    mapModal.style.display = 'flex';
    mapModal.classList.add('active');
    
    // Ensure map container is visible
    if (mapContainer) {
        mapContainer.style.height = '400px';
        mapContainer.style.width = '100%';
        mapContainer.style.display = 'block';
    }
    
    // Initialize map with short delay to ensure modal is visible
    setTimeout(function() {
        initMap();
        
        // Force map to refresh by triggering a resize event
        if (map) {
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        }
    }, 200);
}

// 关闭地图模态窗口
function closeMapModal() {
    console.log('Closing map modal');
    
    if (mapModal) {
        mapModal.style.display = 'none';
        mapModal.classList.remove('active');
    }
    
    // Clear current marker if not confirmed
    if (currentMarker && !markers[activeField]) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
}

// 初始化地图
function initMap() {
    console.log('Initializing Sri Lanka map');
    
    if (!mapContainer) {
        console.error('Map container element not found');
        return;
    }
    
    // If map already exists, just resize it
    if (map) {
        console.log('Map already exists, resizing');
        map.invalidateSize();
        return;
    }
    
    try {
        // Ensure the map container is visible
        mapContainer.style.display = 'block';
        mapContainer.style.height = '400px';
        mapContainer.style.width = '100%';
        
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded!');
            return;
        }
        
        // Create map centered on Sri Lanka
        map = L.map('modalMap', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([7.8731, 80.7718], 8);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add popular Sri Lanka destinations as helper markers
        addSriLankaDestinations();
        
        // Add click event to map
        map.on('click', function(e) {
            setMarker(e.latlng);
        });
        
        // If a marker already exists for the active field, show it
        if (markers[activeField]) {
            currentMarker = L.marker(markers[activeField].getLatLng()).addTo(map);
            map.setView(markers[activeField].getLatLng(), 15);
        }
        
        // Force map to refresh after a short delay
        setTimeout(function() {
            map.invalidateSize();
        }, 300);
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Function to add popular Sri Lanka destinations as markers
function addSriLankaDestinations() {
    const destinations = [
        { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
        { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
        { name: 'Galle', lat: 6.0535, lng: 80.2210 },
        { name: 'Sigiriya', lat: 7.9570, lng: 80.7603 },
        { name: 'Ella', lat: 6.8667, lng: 81.0466 },
        { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891 },
        { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
        { name: 'Trincomalee', lat: 8.5922, lng: 81.2001 }
    ];
    
    destinations.forEach(function(dest) {
        const marker = L.marker([dest.lat, dest.lng], {
            opacity: 0.7,
            icon: L.divIcon({
                className: 'destination-marker',
                html: `<div class="dest-marker-inner">${dest.name}</div>`,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            })
        }).addTo(map);
        
        marker.on('click', function() {
            setMarker({ lat: dest.lat, lng: dest.lng });
        });
    });
}

// Function to set a marker on the map
function setMarker(latlng) {
    console.log('Setting marker at:', latlng);
    
    // Remove existing temporary marker
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Create new marker
    currentMarker = L.marker([latlng.lat, latlng.lng]).addTo(map);
    
    // Bind popup showing coordinates
    currentMarker.bindPopup(`
        <strong>Selected Location</strong><br>
        Latitude: ${latlng.lat.toFixed(6)}<br>
        Longitude: ${latlng.lng.toFixed(6)}
    `).openPopup();
    
    // Center map on marker
    map.setView([latlng.lat, latlng.lng], 15);
}

// 搜索位置
function searchLocation(query) {
    console.log('Searching for location:', query);
    
    // Add "Sri Lanka" to the query if not already included
    if (!query.toLowerCase().includes('sri lanka')) {
        query += ', Sri Lanka';
    }
    
    // Show loading indicator
    searchInput.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\'/%3E%3C/svg%3E")';
    searchInput.style.backgroundRepeat = 'no-repeat';
    searchInput.style.backgroundPosition = 'right center';
    searchInput.style.backgroundSize = '20px';
    
    // Use Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // Remove loading indicator
            searchInput.style.backgroundImage = 'none';
            
            if (data && data.length > 0) {
                const result = data[0];
                const latlng = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                };
                
                // Set marker and center map
                setMarker(latlng);
                
                // Update search input with found location name
                searchInput.value = result.display_name;
            } else {
                // No results found
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            searchInput.style.backgroundImage = 'none';
            alert('Error searching for location. Please try again.');
        });
}

// 确认选择的位置
function confirmLocation() {
    console.log('Confirming location');
    
    if (!currentMarker) {
        alert('Please select a location on the map first.');
        return;
    }
    
    const latlng = currentMarker.getLatLng();
    
    // Save marker for the active field
    markers[activeField] = currentMarker;
    
    // Get address using reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            let address = data.display_name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            
            // Update the appropriate input field
            if (activeField === 'pickup' && pickupInput) {
                pickupInput.value = address;
            } else if (activeField === 'destination' && destinationInput) {
                destinationInput.value = address;
            }
            
            // Close the modal
            closeMapModal();
            
            // If both locations are set, calculate the distance
            if (markers.pickup && markers.destination) {
                calculateDistance();
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
            
            // Use coordinates as fallback
            const coordsText = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            
            // Update the appropriate input field
            if (activeField === 'pickup' && pickupInput) {
                pickupInput.value = coordsText;
            } else if (activeField === 'destination' && destinationInput) {
                destinationInput.value = coordsText;
            }
            
            // Close the modal
            closeMapModal();
            
            // If both locations are set, calculate the distance
            if (markers.pickup && markers.destination) {
                calculateDistance();
            }
        });
}

// 计算两点之间的距离
function calculateDistance() {
    console.log('Calculating distance between points');
    
    // Check if both markers are set
    if (!markers.pickup || !markers.destination) {
        alert('Please select both pickup and destination locations.');
        return;
    }
    
    // Get coordinates
    const pickup = markers.pickup.getLatLng();
    const destination = markers.destination.getLatLng();
    
    // Earth radius in kilometers
    const R = 6371;
    
    // Convert latitude and longitude from degrees to radians
    const dLat = (destination.lat - pickup.lat) * Math.PI / 180;
    const dLon = (destination.lng - pickup.lng) * Math.PI / 180;
    
    // Haversine formula
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pickup.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Display the distance
    const distanceElement = document.getElementById('distance');
    if (distanceElement) {
        distanceElement.innerHTML = `<strong>Distance:</strong> ${distance.toFixed(2)} km`;
        distanceElement.style.display = 'block';
    }
    
    // Calculate fare if the function exists
    if (typeof calculatePrice === 'function') {
        calculatePrice(distance);
    } else {
        // Simple fare calculation as fallback
        const baseFare = 20; // Base fare in dollars
        const ratePerKm = 0.8; // Rate per kilometer
        const fare = baseFare + (distance * ratePerKm);
        
        // Display the fare
        const fareElement = document.getElementById('fareResult');
        if (fareElement) {
            fareElement.innerHTML = `<strong>Estimated Fare:</strong> $${fare.toFixed(2)}`;
            fareElement.style.display = 'block';
        }
    }
    
    return distance;
} 