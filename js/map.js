let map = null;
let marker = null;
let currentField = null;
let pickupMarker = null;
let destinationMarker = null;

// Initialize map
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for map-related UI elements
    setupMapEventListeners();
});

// Set up event listeners
function setupMapEventListeners() {
    console.log('Setting up map event listeners');
    
    // Add click events to form fields to open map
    const pickupLocation = document.getElementById('pickupLocation');
    const destination = document.getElementById('destination');
    
    if (pickupLocation) {
        pickupLocation.addEventListener('click', function() {
            openMap('pickup');
        });
    }
    
    if (destination) {
        destination.addEventListener('click', function() {
            openMap('destination');
        });
    }
    
    // Initialize close buttons for modals
    const closeButtons = document.getElementsByClassName('close-modal');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    }
    
    // Initialize search input
    const searchInput = document.getElementById('searchLocation');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation(this.value);
            }
        });
    }
    
    // Confirm location button
    const confirmBtn = document.querySelector('.map-modal button.btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmLocation);
    }
}

// Initialize map
function initMap() {
    console.log('Initializing map');
    
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    // Remove existing map if any
    if (map !== null) {
        map.remove();
        map = null;
    }
    
    try {
        // Initialize map centered on Sri Lanka
        map = L.map('map').setView([7.8731, 80.7718], 8);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add major cities as markers
        addMajorCityMarkers();
        
        // Add click event to map
        map.on('click', function(e) {
            setMarker([e.latlng.lat, e.latlng.lng]);
        });
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Add major city markers
function addMajorCityMarkers() {
    const cities = {
        'Colombo': [6.9271, 79.8612],
        'Kandy': [7.2906, 80.6337],
        'Galle': [6.0535, 80.2210],
        'Jaffna': [9.6615, 80.0255],
        'Trincomalee': [8.5874, 81.2152],
        'Sigiriya': [7.9570, 80.7603],
        'Ella': [6.8667, 81.0466],
        'Nuwara Eliya': [6.9497, 80.7891],
        'Matara': [5.9485, 80.5353]
    };
    
    for (let city in cities) {
        L.marker(cities[city])
            .addTo(map)
            .bindPopup(city)
            .on('click', function() {
                setMarker(cities[city]);
            });
    }
}

// Search location
function searchLocation(query) {
    if (!query.trim()) return;
    
    // Add "Sri Lanka" to query if not already present
    if (!query.toLowerCase().includes('sri lanka')) {
        query += ' Sri Lanka';
    }
    
    // Show loading indicator
    const searchInput = document.getElementById('searchLocation');
    if (searchInput) {
        searchInput.classList.add('loading');
    }
    
    // Use Nominatim API to search for location
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (searchInput) {
                searchInput.classList.remove('loading');
            }
            
            if (data.length > 0) {
                const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setMarker(location);
                map.setView(location, 13);
            } else {
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            if (searchInput) {
                searchInput.classList.remove('loading');
            }
            alert('Error searching for location. Please try again.');
        });
}

// Set marker
function setMarker(latlng) {
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Create draggable marker
    marker = L.marker(latlng, {draggable: true}).addTo(map);
    
    // Add drag end event
    marker.on('dragend', function() {
        const newPos = marker.getLatLng();
        getAddressFromCoordinates(newPos.lat, newPos.lng);
    });
    
    // Get address from coordinates
    getAddressFromCoordinates(latlng[0], latlng[1]);
}

// Get address from coordinates
function getAddressFromCoordinates(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                marker.bindPopup(data.display_name).openPopup();
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
        });
}

// Open map
function openMap(field) {
    console.log('Opening map for field:', field);
    currentField = field;
    
    // Get map modal
    const mapModal = document.getElementById('mapModal');
    if (!mapModal) {
        console.error('Map modal not found');
        return;
    }
    
    // Show modal
    mapModal.style.display = 'block';
    
    // Initialize map after modal is visible
    setTimeout(() => {
        if (!map) {
            initMap();
        } else {
            map.invalidateSize();
        }
    }, 100);
}

// Confirm location
function confirmLocation() {
    if (!marker) {
        alert('Please select a location on the map first.');
        return;
    }
    
    const latlng = marker.getLatLng();
    
    // Get address from coordinates
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
            
            // Update form field
            const fieldId = currentField === 'pickup' ? 'pickupLocation' : 'destination';
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = address;
            }
            
            // Store marker
            if (currentField === 'pickup') {
                pickupMarker = marker;
            } else {
                destinationMarker = marker;
            }
            
            // Calculate distance if both markers are set
            calculateDistance();
            
            // Close modal
            const mapModal = document.getElementById('mapModal');
            if (mapModal) {
                mapModal.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error confirming location:', error);
            alert('Error confirming location. Please try again.');
        });
}

// Calculate distance between pickup and destination
function calculateDistance() {
    if (pickupMarker && destinationMarker) {
        const distance = pickupMarker.getLatLng().distanceTo(destinationMarker.getLatLng()) / 1000;
        console.log(`Distance: ${distance.toFixed(2)} km`);
        
        // Update price estimate if available
        const priceElement = document.querySelector('.price-estimate');
        if (priceElement) {
            const baseFare = 30;
            const ratePerKm = 0.5;
            const estimatedPrice = baseFare + (distance * ratePerKm);
            priceElement.textContent = `Estimated Price: $${estimatedPrice.toFixed(2)}`;
        }
    }
} 