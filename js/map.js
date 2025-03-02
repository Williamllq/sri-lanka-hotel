let map;
let markers = {
    pickup: null,
    destination: null
};
let activeField = null;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map event listeners
    setupMapEventListeners();
});

// Setup map and related event listeners
function setupMapEventListeners() {
    // Form field clicks to open map
    const pickupField = document.getElementById('pickupLocation');
    const destinationField = document.getElementById('destinationLocation');
    
    if (pickupField) {
        pickupField.addEventListener('click', function() {
            openMap('pickup');
        });
    }
    
    if (destinationField) {
        destinationField.addEventListener('click', function() {
            openMap('destination');
        });
    }
    
    // 地图按钮的点击事件
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    if (pickupMapBtn) {
        pickupMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMap('pickup');
        });
    }
    
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    if (destinationMapBtn) {
        destinationMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMap('destination');
        });
    }
    
    // Close button for map modal
    const closeButton = document.getElementById('closeMapModal');
    if (closeButton) {
        closeButton.addEventListener('click', closeMap);
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
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                closeMap();
            }
        });
    }
}

// Initialize the map
function initMap() {
    // If map already initialized, return
    if (map) return;
    
    // Create map centered on Sri Lanka
    map = L.map('modalMap').setView([7.8731, 80.7718], 8);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add click event to map for setting markers
    map.on('click', function(e) {
        setMarker(e.latlng);
    });
    
    // Force map to update its size after it becomes visible
    setTimeout(function() {
        map.invalidateSize();
    }, 100);
}

// Open the map modal
function openMap(field) {
    activeField = field;
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) return;
    
    // 设置标题
    const mapTitle = document.getElementById('mapModalTitle');
    if (mapTitle) {
        mapTitle.textContent = field === 'pickup' ? 'Select Pickup Location' : 'Select Destination';
    }
    
    mapModal.classList.add('active');
    
    // Initialize map if not already done
    setTimeout(function() {
        initMap();
        
        // If there's already a marker for this field, center on it
        if (markers[field]) {
            map.setView(markers[field].getLatLng(), 13);
        }
    }, 100);
}

// Close the map modal
function closeMap() {
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) return;
    
    mapModal.classList.remove('active');
    activeField = null;
}

// Set a marker on the map
function setMarker(latlng) {
    if (!activeField || !map) return;
    
    // Remove existing marker for this field if it exists
    if (markers[activeField]) {
        map.removeLayer(markers[activeField]);
    }
    
    // Create new marker
    markers[activeField] = L.marker(latlng).addTo(map);
    
    // Update coordinates in hidden field if it exists
    const coordField = document.getElementById(activeField + 'Coordinates');
    if (coordField) {
        coordField.value = latlng.lat + ',' + latlng.lng;
    }
}

// Search for a location
function searchLocation(query) {
    if (!query) return;
    
    // Use Nominatim search API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const latlng = L.latLng(location.lat, location.lon);
                
                // Center map on search result
                map.setView(latlng, 13);
                
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
    if (!activeField || !markers[activeField]) {
        alert('Please select a location on the map first.');
        return;
    }
    
    const latlng = markers[activeField].getLatLng();
    
    // Update input field with reverse geocoded address or coordinates
    reverseGeocode(latlng, function(address) {
        const inputField = document.getElementById(activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
        if (inputField) {
            inputField.value = address || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        }
        
        // If both pickup and destination are set, calculate distance
        if (markers.pickup && markers.destination) {
            calculateDistance();
        }
        
        // Close the map modal
        closeMap();
    });
}

// Reverse geocode coordinates to address
function reverseGeocode(latlng, callback) {
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
    if (!markers.pickup || !markers.destination) return;
    
    const pickup = markers.pickup.getLatLng();
    const destination = markers.destination.getLatLng();
    
    // Calculate distance in kilometers
    const distance = pickup.distanceTo(destination) / 1000;
    
    // Update distance field if it exists
    const distanceField = document.getElementById('distance');
    if (distanceField) {
        distanceField.value = distance.toFixed(2);
    }
    
    console.log(`Distance: ${distance.toFixed(2)} km`);
    
    // Display distance in the UI
    const distanceDisplay = document.getElementById('distance');
    if (distanceDisplay) {
        distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;
        distanceDisplay.style.display = 'block';
    }
    
    // Trigger price calculation if available
    if (typeof calculatePrice === 'function') {
        calculatePrice();
    }
} 