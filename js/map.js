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
    
    // Set up map button click listeners
    const pickupMapBtn = document.getElementById('pickupMapBtn');
    const destinationMapBtn = document.getElementById('destinationMapBtn');
    const closeMapBtn = document.getElementById('closeMapModal');
    const debugMapBtn = document.getElementById('debugMapBtn');
    
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
    
    if (debugMapBtn) {
        debugMapBtn.addEventListener('click', function() {
            console.log('Debug map button clicked');
            debugMap();
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
});

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
    
    mapModal.style.display = 'flex';
    
    // Initialize map with delay to ensure the container is visible
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
        return;
    }
    
    try {
        console.log('Creating new map');
        // Set height explicitly to ensure the map renders correctly
        mapContainer.style.height = '400px';
        mapContainer.style.width = '100%';
        
        // Create map centered on Sri Lanka
        map = L.map('modalMap').setView([7.8731, 80.7718], 8);
        
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
        }, 300);
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Load Leaflet dynamically if not available
function loadLeaflet() {
    console.log('Attempting to load Leaflet dynamically');
    
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
        alert('Failed to load the map library. Please refresh the page and try again.');
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
        alert('Please enter a location to search');
        return;
    }
    
    console.log('Searching for:', searchTerm);
    
    // Show loading state
    if (searchButton) {
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchButton.disabled = true;
    }
    
    // Add "Sri Lanka" to search if not included
    let fullSearchTerm = searchTerm;
    if (!searchTerm.toLowerCase().includes('sri lanka')) {
        fullSearchTerm = searchTerm + ', Sri Lanka';
    }
    
    // Nominatim API for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullSearchTerm)}&limit=5&addressdetails=1`, {
        headers: {
            'User-Agent': 'SriLankaStayExplore/1.0',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    })
    .then(response => {
        console.log('Search API response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Search results:', data);
        
        // Reset button state
        if (searchButton) {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
        }
        
        // Check if any results found
        if (data && data.length > 0) {
            // Filter results to Sri Lanka
            const sriLankaResults = data.filter(item => {
                return item.address && 
                    (item.address.country === 'Sri Lanka' || 
                     item.address.country_code === 'lk');
            });
            
            if (sriLankaResults.length > 0) {
                // Use the first result
                const result = sriLankaResults[0];
                const latlng = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                };
                
                // Set marker and zoom to location
                setMarker(latlng);
                map.setView(latlng, 14);
                
                // Show success message
                searchInput.style.borderColor = '#4CAF50';
                setTimeout(() => {
                    searchInput.style.borderColor = '';
                }, 2000);
                
            } else {
                // If no Sri Lanka results, check if we have any results at all
                if (data.length > 0) {
                    fallbackToHardcodedLocations(searchTerm);
                } else {
                    alert('No locations found in Sri Lanka. Please try a different search term.');
                }
            }
        } else {
            fallbackToHardcodedLocations(searchTerm);
        }
    })
    .catch(error => {
        console.error('Error searching for location:', error);
        
        // Reset button state
        if (searchButton) {
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.disabled = false;
        }
        
        fallbackToHardcodedLocations(searchTerm);
    });
}

// Fallback to hardcoded locations if API fails
function fallbackToHardcodedLocations(searchTerm) {
    console.log('Falling back to hardcoded locations for:', searchTerm);
    
    // Common Sri Lanka locations
    const locations = {
        'colombo': { lat: 6.9271, lng: 79.8612 },
        'kandy': { lat: 7.2906, lng: 80.6337 },
        'galle': { lat: 6.0535, lng: 80.2210 },
        'negombo': { lat: 7.2095, lng: 79.8384 },
        'jaffna': { lat: 9.6615, lng: 80.0255 },
        'ella': { lat: 6.8667, lng: 81.0466 },
        'nuwara eliya': { lat: 6.9697, lng: 80.7893 },
        'sigiriya': { lat: 7.9572, lng: 80.7600 },
        'anuradhapura': { lat: 8.3114, lng: 80.4037 },
        'trincomalee': { lat: 8.5667, lng: 81.2333 },
        'matara': { lat: 5.9485, lng: 80.5353 },
        'batticaloa': { lat: 7.7167, lng: 81.7000 },
        'dambulla': { lat: 7.8675, lng: 80.6519 },
        'bentota': { lat: 6.4215, lng: 79.9954 },
        'hikkaduwa': { lat: 6.1395, lng: 80.1063 },
        'arugam bay': { lat: 6.8392, lng: 81.8342 },
        'mirissa': { lat: 5.9483, lng: 80.4588 },
        'udawalawe': { lat: 6.4335, lng: 80.8982 },
        'yala': { lat: 6.3712, lng: 81.5045 },
        'airport': { lat: 7.1801, lng: 79.8841 }  // Bandaranaike International Airport
    };
    
    // Check if search term matches any known location
    const normalizedSearch = searchTerm.toLowerCase();
    let found = false;
    
    for (const [name, coords] of Object.entries(locations)) {
        if (normalizedSearch.includes(name) || name.includes(normalizedSearch)) {
            console.log('Found matching location:', name);
            setMarker(coords);
            map.setView(coords, 14);
            found = true;
            break;
        }
    }
    
    if (!found) {
        // If no match, default to Colombo
        alert(`Location "${searchTerm}" not found. Showing Colombo as default.`);
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
        alert('Please select a location on the map first');
        return;
    }
    
    if (!activeLocationInput) {
        console.error('No active location input');
        return;
    }
    
    // Create location string with coordinates
    const locationString = `${document.getElementById('mapModalTitle').textContent.replace('Select ', '')} (${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)})`;
    
    // Set the location value
    activeLocationInput.value = locationString;
    
    // Close the modal
    closeMapModal();
    
    // Add a highlight effect to the input
    activeLocationInput.style.backgroundColor = '#f0fff0';
    setTimeout(() => {
        activeLocationInput.style.backgroundColor = '';
    }, 1500);
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

// Debug function
function debugMap() {
    console.log('Debug map info:');
    console.log('Map initialized:', map ? 'Yes' : 'No');
    console.log('Map container exists:', mapContainer ? 'Yes' : 'No');
    console.log('Map modal exists:', mapModal ? 'Yes' : 'No');
    console.log('Active input:', activeLocationInput ? activeLocationInput.id : 'None');
    console.log('Selected location:', selectedLocation);
    console.log('Leaflet loaded:', typeof L !== 'undefined' ? 'Yes' : 'No');
    
    alert('Debug info logged to console. Press F12 to view.');
} 