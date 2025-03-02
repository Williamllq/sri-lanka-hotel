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
    console.log('Setting up map event listeners');
    
    // Form field clicks to open map
    const pickupField = document.getElementById('pickupLocation');
    const destinationField = document.getElementById('destinationLocation');
    
    if (pickupField) {
        console.log('Found pickup field, adding event listener');
        pickupField.addEventListener('click', function() {
            console.log('Pickup field clicked');
            openMap('pickup');
        });
    } else {
        console.log('Pickup field not found');
    }
    
    if (destinationField) {
        console.log('Found destination field, adding event listener');
        destinationField.addEventListener('click', function() {
            console.log('Destination field clicked');
            openMap('destination');
        });
    } else {
        console.log('Destination field not found');
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
        console.log('Pickup map button not found');
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
        console.log('Destination map button not found');
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
        console.log('Close button not found');
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
    } else {
        console.log('Map modal not found');
    }
}

// Initialize the map
function initMap() {
    console.log('Initializing map');
    
    // If map already initialized, return
    if (map) {
        console.log('Map already initialized, updating size');
        map.invalidateSize();
        return;
    }
    
    // Make sure the map container is visible
    const mapContainer = document.getElementById('modalMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    console.log('Creating new map');
    
    // Create map centered on Sri Lanka
    map = L.map('modalMap').setView([7.8731, 80.7718], 8);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add click event to map for setting markers
    map.on('click', function(e) {
        console.log('Map clicked at:', e.latlng);
        setMarker(e.latlng);
    });
    
    // Force map to update its size after it becomes visible
    setTimeout(function() {
        if (map) {
            console.log('Invalidating map size');
            map.invalidateSize();
        }
    }, 300);
}

// Open the map modal
function openMap(field) {
    console.log('Opening map for field:', field);
    
    activeField = field;
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
        initMap();
        
        // If there's already a marker for this field, center on it
        if (markers[field]) {
            map.setView(markers[field].getLatLng(), 13);
        }
    }, 300);
}

// Close the map modal
function closeMap() {
    console.log('Closing map');
    
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) return;
    
    mapModal.classList.remove('active');
    activeField = null;
}

// Set a marker on the map
function setMarker(latlng) {
    console.log('Setting marker at:', latlng);
    
    if (!activeField || !map) {
        console.error('No active field or map not initialized');
        return;
    }
    
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
    console.log('Searching for location:', query);
    
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
    console.log('Confirming location');
    
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
    
    if (!markers.pickup || !markers.destination) {
        console.error('Missing markers for distance calculation');
        return;
    }
    
    const pickup = markers.pickup.getLatLng();
    const destination = markers.destination.getLatLng();
    
    // Calculate distance in kilometers
    const distance = pickup.distanceTo(destination) / 1000;
    
    console.log(`Distance calculated: ${distance.toFixed(2)} km`);
    
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