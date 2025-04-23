// Booking and Fare Calculation functionality
// Global variable to track the route map instance
let routeMapInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking script loaded');
    
    // Initialize the Get Quote button
    const quoteBtn = document.querySelector('.btn.secondary');
    if (quoteBtn) {
        quoteBtn.addEventListener('click', calculateQuote);
    }
    
    // Initialize the Book Now button
    const bookBtn = document.querySelector('.btn.primary');
    if (bookBtn) {
        bookBtn.addEventListener('click', processBooking);
        // Initially disable Book Now button
        bookBtn.disabled = true;
    }
});

// Calculate the quote based on selected locations
function calculateQuote() {
    console.log('Calculating quote');
    
    // Get inputs
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const serviceType = document.getElementById('serviceType');
    const journeyDate = document.getElementById('journeyDate');
    const journeyTime = document.getElementById('journeyTime');
    const passengerCount = document.getElementById('passengerCount');
    
    // Validation
    if (!pickupInput || !destinationInput) {
        showMessage('Pickup or destination input not found', 'error');
        return;
    }
    
    if (!pickupInput.value || !destinationInput.value) {
        showMessage('Please select both pickup and destination locations', 'error');
        return;
    }
    
    if (!pickupInput.dataset.lat || !pickupInput.dataset.lng || 
        !destinationInput.dataset.lat || !destinationInput.dataset.lng) {
        showMessage('Location coordinates are missing. Please select locations from the map', 'error');
        return;
    }
    
    if (serviceType && serviceType.value === '') {
        showMessage('Please select a service type', 'error');
        return;
    }
    
    if (journeyDate && !journeyDate.value) {
        showMessage('Please select a date for your journey', 'error');
        return;
    }
    
    if (journeyTime && !journeyTime.value) {
        showMessage('Please select a time for your journey', 'error');
        return;
    }
    
    // Calculate distance between points
    const pickupLat = parseFloat(pickupInput.dataset.lat);
    const pickupLng = parseFloat(pickupInput.dataset.lng);
    const destLat = parseFloat(destinationInput.dataset.lat);
    const destLng = parseFloat(destinationInput.dataset.lng);
    
    const distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
    console.log('Calculated distance:', distance, 'km');
    
    // Calculate fare
    const fare = calculateFare(distance, getSelectedVehicleType());
    console.log('Calculated fare:', fare);
    
    // Calculate deposit (30% of fare)
    const deposit = fare * 0.3;
    
    // Display the quote
    displayQuote({
        distance: distance,
        totalFare: fare,
        depositAmount: deposit,
        vehicleType: getSelectedVehicleType()
    });
    
    // Enable the Book Now button
    const bookBtn = document.querySelector('.btn.primary');
    if (bookBtn) {
        bookBtn.disabled = false;
        bookBtn.classList.add('active');
    }
}

// Calculate distance between two points using Haversine formula
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

// Get the selected vehicle type
function getSelectedVehicleType() {
    const selectedVehicle = document.querySelector('input[name="vehicleType"]:checked');
    return selectedVehicle ? selectedVehicle.value : 'sedan';
}

// Calculate fare based on distance and vehicle type
function calculateFare(distance, vehicleType) {
    // Base rates by vehicle type (USD)
    const rates = {
        sedan: {
            base: 20,
            perKm: 0.8
        },
        suv: {
            base: 30,
            perKm: 1.2
        },
        van: {
            base: 40,
            perKm: 1.5
        },
        luxury: {
            base: 50,
            perKm: 2.0
        }
    };
    
    // Get rate for selected vehicle (or default to sedan)
    const rate = rates[vehicleType] || rates.sedan;
    
    // Calculate total fare with base fare + per km charge
    let totalFare = rate.base + (distance * rate.perKm);
    
    // Round to 2 decimal places
    totalFare = Math.round(totalFare * 100) / 100;
    
    return totalFare;
}

// Display the calculated quote
function displayQuote(quote) {
    document.getElementById('quoteContainer').style.display = 'block';
    
    // Populate the quote details
    document.getElementById('quotedDistance').textContent = quote.distance.toFixed(2) + ' km';
    document.getElementById('quotedVehicle').textContent = quote.vehicleType;
    document.getElementById('quotedFare').textContent = 'LKR ' + quote.totalFare.toLocaleString();
    document.getElementById('quotedDeposit').textContent = 'LKR ' + quote.depositAmount.toLocaleString();
    
    // Initialize the map after a short delay to ensure the container is fully visible
    setTimeout(() => {
        try {
            // 从输入字段获取经纬度
            const pickupInput = document.getElementById('pickupLocation');
            const destinationInput = document.getElementById('destinationLocation');
            
            if (!pickupInput || !destinationInput) {
                console.error('Location inputs not found');
                return;
            }
            
            const pickupLat = parseFloat(pickupInput.dataset.lat);
            const pickupLng = parseFloat(pickupInput.dataset.lng);
            const destLat = parseFloat(destinationInput.dataset.lat);
            const destLng = parseFloat(destinationInput.dataset.lng);
            
            if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(destLat) || isNaN(destLng)) {
                console.error('Invalid coordinates for map');
                return;
            }
            
            initRouteMap(pickupLat, pickupLng, destLat, destLng);
        } catch (error) {
            console.error('Error initializing route map:', error);
        }
    }, 500); // 500ms延迟确保DOM准备好
}

// Process booking
function processBooking() {
    console.log('Processing booking');
    
    // You would typically send this to a server or integrate with payment
    // For now, just show a success message
    showMessage('Booking request received! We will contact you shortly to confirm your booking and arrange payment of the deposit.', 'success');
    
    // Save booking data to localStorage for demo purposes
    saveBookingData();
}

// Save booking data to localStorage
function saveBookingData() {
    // Get all form inputs
    const bookingData = {
        serviceType: document.getElementById('serviceType')?.value || '',
        journeyDate: document.getElementById('journeyDate')?.value || '',
        journeyTime: document.getElementById('journeyTime')?.value || '',
        passengerCount: document.getElementById('passengerCount')?.value || '',
        pickupLocation: document.getElementById('pickupLocation')?.value || '',
        destination: document.getElementById('destinationLocation')?.value || '',
        specialRequirements: document.getElementById('specialRequirements')?.value || '',
        vehicleType: getSelectedVehicleType(),
        timestamp: new Date().toISOString()
    };
    
    try {
        // Get existing bookings or create new array
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log('Booking saved to localStorage');
    } catch (error) {
        console.error('Error saving booking to localStorage:', error);
    }
}

// Show a message to the user
function showMessage(message, type = 'info') {
    // Create or get the message container
    let messageContainer = document.querySelector('.booking-message');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'booking-message';
        
        // Find where to insert the message
        const priceEstimate = document.querySelector('.price-estimate');
        if (priceEstimate) {
            priceEstimate.parentNode.insertBefore(messageContainer, priceEstimate);
        } else {
            const bookingForm = document.querySelector('.booking-form');
            if (bookingForm) {
                bookingForm.appendChild(messageContainer);
            } else {
                console.error('Could not find a place to insert the message');
                return;
            }
        }
        
        // Add styles if not present
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                .booking-message {
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 5px;
                    font-weight: 500;
                    display: none;
                }
                .booking-message.info {
                    background-color: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
                .booking-message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .booking-message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .booking-message.warning {
                    background-color: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeeba;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message content and type
    messageContainer.textContent = message;
    messageContainer.className = `booking-message ${type}`;
    
    // Display with animation
    messageContainer.style.display = 'block';
    messageContainer.classList.add('fade-in');
    
    // Scroll to the message
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 10000);
    }
}

// Initialize route map to show journey path
function initRouteMap(pickupLat, pickupLng, destLat, destLng) {
    console.log('Initializing route map');
    
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer) {
        console.error('Route map container not found');
        return;
    }
    
    // Force set the height and style of the map container
    mapContainer.style.height = '300px';
    mapContainer.style.width = '100%';
    mapContainer.style.marginTop = '20px';
    mapContainer.style.borderRadius = '8px';
    mapContainer.style.position = 'relative';
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Map loading failed. Please try again later.</div>';
        return;
    }
    
    try {
        // Check if a map instance already exists and remove it
        if (routeMapInstance) {
            console.log('Removing existing map instance');
            routeMapInstance.remove();
            routeMapInstance = null;
        }
        
        // Sometimes the map container might still have Leaflet-related elements
        // Completely clear the container to avoid "already initialized" errors
        mapContainer.innerHTML = '';
        
        // Generate a unique ID for the map container to avoid Leaflet initialization issues
        const uniqueMapId = 'routeMap_' + Date.now();
        mapContainer.id = uniqueMapId;
        
        // Create map with both points visible
        const routeMap = L.map(uniqueMapId);
        // Store the map instance globally
        routeMapInstance = routeMap;
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(routeMap);
        
        // Create markers for pickup and destination
        const pickupMarker = L.marker([pickupLat, pickupLng], {
            icon: L.divIcon({
                className: 'journey-marker pickup-marker',
                html: '<div class="marker-inner">Pickup</div>',
                iconSize: [80, 30],
                iconAnchor: [40, 15]
            })
        }).addTo(routeMap);
        
        const destMarker = L.marker([destLat, destLng], {
            icon: L.divIcon({
                className: 'journey-marker dest-marker',
                html: '<div class="marker-inner">Destination</div>',
                iconSize: [100, 30],
                iconAnchor: [50, 15]
            })
        }).addTo(routeMap);
        
        // Create a line connecting the two points
        const journeyLine = L.polyline([
            [pickupLat, pickupLng],
            [destLat, destLng]
        ], {
            color: '#4CAF50',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10',
            lineJoin: 'round'
        }).addTo(routeMap);
        
        // Add CSS for custom markers if not exists
        if (!document.getElementById('route-map-styles')) {
            const style = document.createElement('style');
            style.id = 'route-map-styles';
            style.textContent = `
                .journey-marker .marker-inner {
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-weight: bold;
                    font-size: 12px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .pickup-marker .marker-inner {
                    background-color: #4285F4;
                }
                .dest-marker .marker-inner {
                    background-color: #DB4437;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Fit bounds to show both markers with padding
        routeMap.fitBounds([
            [pickupLat, pickupLng],
            [destLat, destLng]
        ], {
            padding: [50, 50]
        });
        
        // Add distance information popup on the line
        const midPoint = {
            lat: (pickupLat + destLat) / 2,
            lng: (pickupLng + destLng) / 2
        };
        
        const distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
        
        L.popup({
            closeButton: false,
            className: 'distance-popup',
            offset: [0, -10]
        })
        .setLatLng([midPoint.lat, midPoint.lng])
        .setContent(`<div style="text-align: center;"><strong>${distance.toFixed(2)} km</strong></div>`)
        .openOn(routeMap);
        
        // Reset the map ID back to the original after initialization
        setTimeout(() => {
            mapContainer.id = 'routeMap';
        }, 1000);
        
        console.log('Route map initialized successfully');
    } catch (error) {
        console.error('Error initializing route map:', error);
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #721c24;">Failed to display the route map. Please try again later.</div>';
    }
} 