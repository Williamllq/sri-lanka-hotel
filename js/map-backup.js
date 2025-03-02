// Enhanced map functionality for Sri Lanka location selection
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
    let map = null;
    let currentMarker = null;
    let activeField = null;
    let markers = {
        pickup: null,
        destination: null
    };
    
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
    
    // Function to open the map modal
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
    
    // Function to close the map modal
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
    
    // Function to initialize the map
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
    
    // Function to add popular Sri Lanka destinations to help users
    function addSriLankaDestinations() {
        // Major locations in Sri Lanka that tourists might want to visit
        const destinations = [
            { name: "Colombo", lat: 6.9271, lng: 79.8612 },
            { name: "Kandy", lat: 7.2906, lng: 80.6337 },
            { name: "Galle", lat: 6.0535, lng: 80.2210 },
            { name: "Sigiriya", lat: 7.9570, lng: 80.7603 },
            { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
            { name: "Trincomalee", lat: 8.5874, lng: 81.2152 }
        ];
        
        // Add small markers for each destination
        destinations.forEach(dest => {
            const marker = L.marker([dest.lat, dest.lng], {
                opacity: 0.7,
                title: dest.name
            }).addTo(map);
            
            marker.bindPopup(`<b>${dest.name}</b><br>Click to select this location`);
            
            // When clicked, set as the current selection
            marker.on('click', function() {
                setMarker(L.latLng(dest.lat, dest.lng));
            });
        });
    }
    
    // Function to set a marker on the map
    function setMarker(latlng) {
        console.log('Setting marker at:', latlng);
        
        if (!map || !activeField) return;
        
        // Remove current marker if it exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        
        // Create a new marker
        currentMarker = L.marker(latlng).addTo(map);
        
        // Store marker location
        markers[activeField] = {
            lat: latlng.lat,
            lng: latlng.lng
        };
        
        // Pan the map to center on the new marker
        map.panTo(latlng);
        
        // Add a popup to the marker
        currentMarker.bindPopup(`<b>${activeField === 'pickup' ? 'Pickup' : 'Destination'} Location</b><br>Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`).openPopup();
    }
    
    // Function to search for a location
    function searchLocation(query) {
        console.log('Searching for location:', query);
        
        if (!query || !map) return;
        
        // Append "Sri Lanka" to search query if not already included
        if (!query.toLowerCase().includes('sri lanka')) {
            query += ' Sri Lanka';
        }
        
        // Disable search input while searching
        if (searchInput) {
            searchInput.disabled = true;
            searchInput.placeholder = 'Searching...';
        }
        
        // Use Nominatim API to search for location
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                // Re-enable search input
                if (searchInput) {
                    searchInput.disabled = false;
                    searchInput.placeholder = 'Search for a location in Sri Lanka';
                }
                
                if (data && data.length > 0) {
                    const location = data[0];
                    const lat = parseFloat(location.lat);
                    const lng = parseFloat(location.lon);
                    
                    // Update map view
                    map.setView([lat, lng], 14);
                    
                    // Set marker
                    setMarker(L.latLng(lat, lng));
                } else {
                    alert('Location not found. Please try a different search term.');
                }
            })
            .catch(error => {
                console.error('Error searching for location:', error);
                alert('Error searching for location. Please try again later.');
                
                if (searchInput) {
                    searchInput.disabled = false;
                    searchInput.placeholder = 'Search for a location in Sri Lanka';
                }
            });
    }
    
    // Function to confirm selected location
    function confirmLocation() {
        console.log('Confirming location selection');
        
        if (!activeField || !markers[activeField]) {
            alert('Please select a location on the map first.');
            return;
        }
        
        // Get marker location
        const location = markers[activeField];
        
        // Use reverse geocoding to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`)
            .then(response => response.json())
            .then(data => {
                // Get input field
                const input = document.getElementById(activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
                
                if (input && data && data.display_name) {
                    // Set input value to address
                    input.value = data.display_name;
                } else if (input) {
                    // Set input value to coordinates
                    input.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                }
                
                // If both locations are set, calculate distance
                if (markers.pickup && markers.destination) {
                    calculateDistance();
                }
                
                // Close modal
                closeMapModal();
            })
            .catch(error => {
                console.error('Error in reverse geocoding:', error);
                
                // Get input field
                const input = document.getElementById(activeField === 'pickup' ? 'pickupLocation' : 'destinationLocation');
                
                if (input) {
                    // Set input value to coordinates
                    input.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                }
                
                // Close modal
                closeMapModal();
            });
    }
    
    // Function to calculate distance
    function calculateDistance() {
        console.log('Calculating distance');
        
        if (!markers.pickup || !markers.destination) {
            alert('Please select both pickup and destination locations first.');
            return;
        }
        
        // Calculate distance between two points
        const lat1 = markers.pickup.lat;
        const lng1 = markers.pickup.lng;
        const lat2 = markers.destination.lat;
        const lng2 = markers.destination.lng;
        
        // Use Haversine formula to calculate distance
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Display distance
        const distanceDisplay = document.getElementById('distance');
        if (distanceDisplay) {
            distanceDisplay.textContent = `Distance: ${distance.toFixed(2)} km`;
            distanceDisplay.style.display = 'block';
        }
        
        // Calculate fare
        if (typeof calculatePrice === 'function') {
            calculatePrice(distance);
        } else {
            // Simple fare calculation
            const fareResult = document.getElementById('fareResult');
            if (fareResult) {
                const baseFare = 20;
                const rate = 0.8;
                const totalFare = baseFare + (distance * rate);
                
                fareResult.textContent = `Estimated fare: $${totalFare.toFixed(2)}`;
                fareResult.style.display = 'block';
            }
        }
        
        return distance;
    }
}); 