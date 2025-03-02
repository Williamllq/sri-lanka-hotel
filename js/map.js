// 全局变量
let mapModalActive = false;
let activeField = null;
let map = null;
let markers = {
    pickup: null,
    destination: null
};
let mapContainer = null;
let mapModal = null;

// 当DOM加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sri Lanka Map Selection Tool Loaded');
    
    // Check for Leaflet library
    if (typeof L === 'undefined') {
        console.error('Leaflet library not available on page load');
        // Try to load Leaflet dynamically
        loadLeaflet();
    } else {
        console.log('Leaflet library available on page load:', L.version);
    }
    
    // Get necessary DOM elements
    mapModal = document.getElementById('mapModal');
    mapContainer = document.getElementById('modalMap');
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    // 兼容两种可能的ID
    const destinationInputAlt = document.getElementById('destination');
    const pickupBtn = document.getElementById('pickupMapBtn');
    const destinationBtn = document.getElementById('destinationMapBtn');
    const closeBtn = document.getElementById('closeMapModal');
    const confirmBtn = document.getElementById('confirmLocationBtn');
    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    const debugBtn = document.getElementById('debugMapBtn');
    
    // Global variables
    let currentMarker = null;
    
    // 确认地图容器存在
    if (!mapContainer) {
        console.error('Map container element #modalMap not found');
        return; // 如果没有地图容器，不要继续初始化地图相关功能
    }
    
    if (!mapModal) {
        console.error('Map modal element #mapModal not found');
        return;
    }
    
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
    } else if (destinationInputAlt) { // 支持备用ID
        destinationInputAlt.addEventListener('click', function() {
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
            
            // First, check if Leaflet is loaded
            if (typeof L === 'undefined') {
                console.error('Leaflet not available when debug clicked');
                loadLeaflet(function() {
                    console.log('Leaflet loaded by debug button');
                    forceOpenMap();
                });
            } else {
                forceOpenMap();
            }
        });
    }
    
    // 确保地图元素存在
    console.log('[DEBUG] 找到地图容器元素');
    const rect = mapContainer.getBoundingClientRect();
    console.log('[DEBUG] 地图容器位置和尺寸:', rect.top, rect.left, rect.width, rect.height);
    
    // 测试模态窗口 - 在页面加载后5秒尝试打开地图模态窗口
    setTimeout(function() {
        console.log('[DEBUG] 自动测试打开地图模态窗口');
        // Only auto-open on page load if debug flag is set
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug_map')) {
            forceOpenMap();
        }
    }, 2000);
});

// Helper function to load Leaflet
function loadLeaflet(callback) {
    console.log('Dynamically loading Leaflet library');
    
    // First load CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCSS.crossOrigin = '';
    document.head.appendChild(leafletCSS);
    
    // Then load JS
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    leafletScript.crossOrigin = '';
    
    leafletScript.onload = function() {
        console.log('Leaflet library loaded dynamically');
        if (typeof callback === 'function') {
            callback();
        }
    };
    
    document.head.appendChild(leafletScript);
}

// Helper function to force map to open
function forceOpenMap() {
    console.log('Force opening map modal');
    
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
    }, 500);
}

// 打开地图模态窗口
function openMapModal(field) {
    console.log('Opening map modal for:', field);
    
    if (!mapModal) {
        mapModal = document.getElementById('mapModal');
        if (!mapModal) {
            console.error('Map modal element not found');
            alert('Map modal not found. Please reload the page and try again.');
            return;
        }
    }
    
    if (!mapContainer) {
        mapContainer = document.getElementById('modalMap');
        if (!mapContainer) {
            console.error('Map container element not found');
            alert('Map container not found. Please reload the page and try again.');
            return;
        }
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
    
    // Ensure map container is visible with proper dimensions
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';
    mapContainer.style.display = 'block';
    
    console.log('Map container after style updates:', 
        'display:', mapContainer.style.display, 
        'height:', mapContainer.style.height, 
        'width:', mapContainer.style.width);
    
    // Reset map if needed
    if (map && !map._loaded) {
        console.log('Map exists but is not loaded, destroying it');
        map.remove();
        map = null;
    }
    
    // Ensure the modal is fully visible before initializing map
    setTimeout(function() {
        // Check if container is visible now
        const rect = mapContainer.getBoundingClientRect();
        console.log('Map container dimensions after timeout:', 
            'width:', rect.width, 
            'height:', rect.height,
            'visibility:', window.getComputedStyle(mapContainer).visibility,
            'display:', window.getComputedStyle(mapContainer).display);
        
        // Initialize map
        initMap();
        
        // Force map to refresh by triggering a resize event
        if (map) {
            setTimeout(function() {
                console.log('Forcing map resize after initialization');
                map.invalidateSize();
                
                // Center map if a marker exists
                if (markers[activeField]) {
                    map.setView(markers[activeField].getLatLng(), 15);
                }
            }, 500);
        }
    }, 300);
    
    // Log modal status
    mapModalActive = true;
    console.log('Map modal opened, active field:', activeField);
}

// 关闭地图模态窗口
function closeMapModal() {
    console.log('Closing map modal');
    
    if (!mapModal) {
        mapModal = document.getElementById('mapModal');
    }
    
    if (mapModal) {
        mapModal.style.display = 'none';
        mapModal.classList.remove('active');
    }
    
    // Clear current marker if not confirmed
    if (currentMarker && !markers[activeField] && map) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
}

// 初始化地图
function initMap() {
    console.log('Initializing Sri Lanka map');
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    if (!mapContainer) {
        mapContainer = document.getElementById('modalMap');
        if (!mapContainer) {
            console.error('Map container element not found');
            return;
        }
    }
    
    // Ensure the Leaflet library is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded!');
        
        // Display error message in the map container
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">' +
                '<h3>Map Error</h3>' +
                '<p>The map library failed to load. Please try again or reload the page.</p>' +
                '</div>';
        }
        
        // 尝试动态加载Leaflet库
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
        
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        leafletScript.crossOrigin = '';
        document.head.appendChild(leafletScript);
        
        leafletScript.onload = function() {
            console.log('Leaflet library loaded dynamically');
            // 库加载后重新尝试初始化地图
            setTimeout(initMap, 500);
        };
        
        return;
    }
    
    // If map already exists, just resize it
    if (map) {
        console.log('Map already exists, resizing');
        try {
            map.invalidateSize();
            console.log('Map resized successfully');
            return;
        } catch (e) {
            console.error('Error resizing existing map:', e);
            // If error occurs, recreate the map
            map = null;
        }
    }
    
    try {
        // Ensure the map container is visible and properly sized
        mapContainer.style.display = 'block';
        mapContainer.style.height = '400px';
        mapContainer.style.width = '100%';
        
        console.log('Map container dimensions:', mapContainer.clientWidth, 'x', mapContainer.clientHeight);
        
        // Check if container is visible and has dimensions
        const rect = mapContainer.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.error('Map container has zero width or height:', rect);
            
            // Try to fix container visibility
            setTimeout(function() {
                mapContainer.style.display = 'block';
                mapContainer.style.height = '400px';
                mapContainer.style.width = '100%';
                
                // Try again after a short delay
                setTimeout(initMap, 300);
            }, 300);
            
            return;
        }
        
        // Create map centered on Sri Lanka
        console.log('Creating Leaflet map with L:', L);
        map = L.map('modalMap', {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView([7.8731, 80.7718], 8);
        
        console.log('Map created successfully');
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        console.log('Tile layer added');
        
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
            console.log('Forcing map resize');
            map.invalidateSize();
        }, 500);
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        
        // Display error message in the map container
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">' +
                '<h3>Map Error</h3>' +
                '<p>There was an error initializing the map: ' + error.message + '</p>' +
                '<button id="retryMapBtn" style="padding: 8px 15px; background: #00a6a6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Retry</button>' +
                '</div>';
            
            // Add event listener to retry button
            const retryBtn = document.getElementById('retryMapBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    // Clear the error message
                    mapContainer.innerHTML = '';
                    // Try initializing again
                    setTimeout(initMap, 300);
                });
            }
        }
    }
}

// Function to add popular Sri Lanka destinations as markers
function addSriLankaDestinations() {
    if (!map) return;
    
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
    
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
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
    
    if (!searchInput) {
        searchInput = document.getElementById('mapSearchInput');
    }
    
    // Add "Sri Lanka" to the query if not already included
    if (!query.toLowerCase().includes('sri lanka')) {
        query += ', Sri Lanka';
    }
    
    // Show loading indicator
    if (searchInput) {
        searchInput.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\'/%3E%3C/svg%3E")';
        searchInput.style.backgroundRepeat = 'no-repeat';
        searchInput.style.backgroundPosition = 'right center';
        searchInput.style.backgroundSize = '20px';
    }
    
    // Use Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // Remove loading indicator
            if (searchInput) {
                searchInput.style.backgroundImage = 'none';
            }
            
            if (data && data.length > 0) {
                const result = data[0];
                const latlng = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                };
                
                // Set marker and center map
                setMarker(latlng);
                
                // Update search input with found location name
                if (searchInput) {
                    searchInput.value = result.display_name;
                }
            } else {
                // No results found
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            if (searchInput) {
                searchInput.style.backgroundImage = 'none';
            }
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
    
    // Get input field references
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const destinationInputAlt = document.getElementById('destination');
    
    // Get address using reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            let address = data.display_name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            
            // Update the appropriate input field
            if (activeField === 'pickup' && pickupInput) {
                pickupInput.value = address;
            } else if (activeField === 'destination') {
                // 适配两种可能的输入框ID
                if (destinationInput) {
                    destinationInput.value = address;
                } else if (destinationInputAlt) {
                    destinationInputAlt.value = address;
                }
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
            } else if (activeField === 'destination') {
                // 适配两种可能的输入框ID
                if (destinationInput) {
                    destinationInput.value = coordsText;
                } else if (destinationInputAlt) {
                    destinationInputAlt.value = coordsText;
                }
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