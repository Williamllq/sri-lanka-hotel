// Global variables
window.map = null;
window.markers = {
    pickup: null,
    destination: null
};
window.activeField = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up map event listeners');
    // Initialize map event listeners
    setupMapEventListeners();
});

// Setup map and related event listeners
function setupMapEventListeners() {
    console.log('Setting up map event listeners');
    
    // Form field clicks to open map
    const pickupField = document.getElementById('pickupLocation');
    const destinationField = document.getElementById('destinationLocation');
    
    // 检查地图模态窗口是否存在
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) {
        console.error('Map modal not found in the document!');
    } else {
        console.log('Map modal found', mapModal);
    }
    
    if (pickupField) {
        console.log('Found pickup field, adding event listener');
        pickupField.addEventListener('click', function() {
            console.log('Pickup field clicked');
            openMap('pickup');
        });
    } else {
        console.error('Pickup field not found');
    }
    
    if (destinationField) {
        console.log('Found destination field, adding event listener');
        destinationField.addEventListener('click', function() {
            console.log('Destination field clicked');
            openMap('destination');
        });
    } else {
        console.error('Destination field not found');
    }
    
    // Map buttons click events
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    if (pickupMapBtn) {
        console.log('Found pickup map button, adding event listener');
        pickupMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Pickup map button clicked');
            openMap('pickup');
        });
    } else {
        console.error('Pickup map button not found');
    }
    
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    if (destinationMapBtn) {
        console.log('Found destination map button, adding event listener');
        destinationMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Destination map button clicked');
            openMap('destination');
        });
    } else {
        console.error('Destination map button not found');
    }
    
    // Close button for map modal
    const closeButton = document.getElementById('closeMapModal');
    if (closeButton) {
        console.log('Found close button, adding event listener');
        closeButton.addEventListener('click', function() {
            console.log('Close button clicked');
            closeMap();
        });
    } else {
        console.error('Close button not found');
    }
    
    // Location search
    const searchInput = document.getElementById('mapSearchInput');
    const searchBtn = document.getElementById('mapSearchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation(e.target.value);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = document.getElementById('mapSearchInput').value;
            searchLocation(query);
        });
    }
    
    // Confirm location button
    const confirmBtn = document.getElementById('confirmLocationBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmLocation);
    }
    
    // Close map when clicking outside the modal content
    if (mapModal) {
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                closeMap();
            }
        });
    } else {
        console.error('Map modal not found');
    }
    
    // 为计算按钮添加事件监听器
    const calculateFareBtn = document.getElementById('calculateFareBtn');
    if (calculateFareBtn) {
        console.log('Found calculate fare button, adding event listener');
        calculateFareBtn.addEventListener('click', function() {
            calculateDistance();
            if (typeof calculatePrice === 'function') {
                calculatePrice();
            } else {
                console.error('calculatePrice function not found');
            }
        });
    } else {
        console.error('Calculate fare button not found');
    }
}

// Initialize the map
function initMap() {
    console.log('Initializing map');
    
    // If map already initialized, return
    if (window.map) {
        console.log('Map already initialized, updating size');
        window.map.invalidateSize();
        return;
    }
    
    // Make sure the map container is visible
    const mapContainer = document.getElementById('modalMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    console.log('Creating new map in container:', mapContainer);
    
    try {
        // Create map centered on Sri Lanka
        window.map = L.map('modalMap').setView([7.8731, 80.7718], 8);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.map);
        
        // Add click event to map for setting markers
        window.map.on('click', function(e) {
            console.log('Map clicked at:', e.latlng);
            setMarker(e.latlng);
        });
        
        console.log('Map created successfully');
    } catch (error) {
        console.error('Error creating map:', error);
    }
    
    // Force map to update its size after it becomes visible
    setTimeout(function() {
        if (window.map) {
            console.log('Invalidating map size');
            window.map.invalidateSize();
        }
    }, 500);
}

// Open the map modal
function openMap(field) {
    console.log('Opening map for field:', field);
    
    window.activeField = field;
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) {
        console.error('Map modal not found');
        return;
    }
    
    // 设置标题
    const mapTitle = document.getElementById('mapModalTitle');
    if (mapTitle) {
        mapTitle.textContent = field === 'pickup' ? 'Select Pickup Location' : 'Select Destination';
    }
    
    // Show modal
    mapModal.classList.add('active');
    console.log('Map modal activated');
    
    // Initialize map after modal is visible
    setTimeout(function() {
        try {
            initMap();
            
            // If there's already a marker for this field, center on it
            if (window.markers[field]) {
                window.map.setView(window.markers[field].getLatLng(), 13);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }, 500);
}

// Close the map modal
function closeMap() {
    console.log('Closing map');
    
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) return;
    
    mapModal.classList.remove('active');
    window.activeField = null;
}

// Set a marker on the map
function setMarker(latlng) {
    console.log('Setting marker at:', latlng);
    
    if (!window.activeField || !window.map) {
        console.error('No active field or map not initialized');
        return;
    }
    
    // Remove existing marker for this field if it exists
    if (window.markers[window.activeField]) {
        window.map.removeLayer(window.markers[window.activeField]);
    }
    
    // Create new marker
    window.markers[window.activeField] = L.marker(latlng).addTo(window.map);
    
    // Update coordinates in hidden field if it exists
    const coordField = document.getElementById(window.activeField + 'Coordinates');
    if (coordField) {
        coordField.value = latlng.lat + ',' + latlng.lng;
    }
}

// Search for a location
function searchLocation(query) {
    console.log('Searching for location:', query);
    
    if (!query) return;
    
    // Use Nominatim search API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const latlng = L.latLng(parseFloat(location.lat), parseFloat(location.lon));
                
                // Center map on search result
                window.map.setView(latlng, 13);
                
                // Set marker at found location
                setMarker(latlng);
            } else {
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            alert('Error searching for location. Please try again.');
        });
}

// Confirm selected location
function confirmLocation() {
    console.log('Confirming location');
    
    if (!window.activeField || !window.markers[window.activeField]) {
        alert('Please select a location on the map first.');
        return;
    }
    
    const latlng = window.markers[window.activeField].getLatLng();
    
    // Update input field with reverse geocoded address or coordinates
    reverseGeocode(latlng, function(address) {
        const inputField = document.getElementById(window.activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
        if (inputField) {
            inputField.value = address || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        }
        
        // If both pickup and destination are set, calculate distance
        if (window.markers.pickup && window.markers.destination) {
            calculateDistance();
        }
        
        // Close the map modal
        closeMap();
    });
}

// Reverse geocode coordinates to address
function reverseGeocode(latlng, callback) {
    console.log('Reverse geocoding:', latlng);
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                callback(data.display_name);
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.error('Error reverse geocoding:', error);
            callback(null);
        });
}

// Calculate distance between pickup and destination
function calculateDistance() {
    console.log('Calculating distance');
    
    if (!window.markers.pickup || !window.markers.destination) {
        console.error('Missing markers for distance calculation');
        return;
    }
    
    const pickup = window.markers.pickup.getLatLng();
    const destination = window.markers.destination.getLatLng();
    
    // Calculate distance in kilometers
    const distance = pickup.distanceTo(destination) / 1000;
    
    console.log(`Distance calculated: ${distance.toFixed(2)} km`);
    
    // Display distance in the UI
    const distanceDisplay = document.getElementById('distance');
    if (distanceDisplay) {
        distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;
        distanceDisplay.style.display = 'block';
    } else {
        console.error('Distance display element not found');
    }
    
    return distance;
} 