// Booking and Fare Calculation functionality
// Global variable to track the route map instance
let routeMapInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking script loaded');
    
    // Initialize the Get Quote button
    const quoteBtn = document.getElementById('getQuoteBtn');
    if (quoteBtn) {
        quoteBtn.addEventListener('click', calculateQuote);
        console.log('Get Quote button event listener added');
    } else {
        console.error('Get Quote button not found');
    }
    
    // Initialize the Book Now button
    const bookBtn = document.getElementById('bookNowBtn');
    if (bookBtn) {
        bookBtn.addEventListener('click', processBooking);
        // Initially disable Book Now button
        bookBtn.disabled = true;
        console.log('Book Now button initialized');
    } else {
        console.error('Book Now button not found');
    }
    
    // Make sure the quote container is hidden initially
    const quoteContainer = document.getElementById('quoteContainer');
    if (quoteContainer) {
        quoteContainer.style.display = 'none';
        console.log('Quote container initially hidden');
    } else {
        console.error('Quote container not found');
    }

    console.log('booking.js: DOM fully loaded, initializing transport settings');
    
    // 预先加载运输设置，让报价计算器准备好
    initializeTransportSettings();
    
    // 显示预算信息和测试
    displayRateInfo();
});

// Calculate the quote based on selected locations
function calculateQuote() {
    console.log('Calculating quote function called');
    
    // Get inputs
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    const serviceType = document.getElementById('serviceType');
    const journeyDate = document.getElementById('journeyDate');
    const journeyTime = document.getElementById('journeyTime');
    const passengerCount = document.getElementById('passengerCount');
    
    console.log('Form inputs:', {
        pickupInput: pickupInput ? 'found' : 'not found',
        destinationInput: destinationInput ? 'found' : 'not found',
        serviceType: serviceType ? serviceType.value : 'not found',
        journeyDate: journeyDate ? journeyDate.value : 'not found',
        journeyTime: journeyTime ? journeyTime.value : 'not found',
        passengerCount: passengerCount ? passengerCount.value : 'not found'
    });
    
    // Validation
    if (!pickupInput || !destinationInput) {
        showMessage('Pickup or destination input not found', 'error');
        return;
    }
    
    console.log('Pickup value:', pickupInput.value);
    console.log('Destination value:', destinationInput.value);
    console.log('Pickup coordinates:', pickupInput.dataset.lat, pickupInput.dataset.lng);
    console.log('Destination coordinates:', destinationInput.dataset.lat, destinationInput.dataset.lng);
    
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
    const vehicleType = getSelectedVehicleType() || 'sedan';
    console.log('Selected vehicle type:', vehicleType);
    
    const fare = calculateFare(distance, vehicleType, journeyDate.value, journeyTime.value);
    console.log('Calculated fare:', fare);
    
    // Calculate deposit (30% of fare)
    const deposit = Math.round(fare * 0.3 * 100) / 100;
    console.log('Deposit amount:', deposit);
    
    // Display the quote
    const quoteData = {
        distance: distance,
        totalFare: fare,
        depositAmount: deposit,
        vehicleType: vehicleType
    };
    console.log('Quote data to display:', quoteData);
    
    displayQuote(quoteData);
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    // If we have a stored driving distance from routing, use that
    if (window.drivingDistanceKm) {
        console.log('Using actual driving distance:', window.drivingDistanceKm);
        return window.drivingDistanceKm;
    }
    
    // Otherwise, fall back to the Haversine formula for straight-line distance
    console.log('Using straight-line distance (Haversine formula)');
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Apply a correction factor to approximate driving distance
    // Typically driving distance is 20-30% longer than straight line
    const correctionFactor = 1.3;
    return distance * correctionFactor;
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
function calculateFare(distance, vehicleType, journeyDate, journeyTime) {
    // Get transport settings from localStorage or use defaults
    const defaultSettings = {
        baseFare: 30,
        ratePerKm: 0.5,
        rushHourMultiplier: 1.5,
        nightMultiplier: 1.3,
        weekendMultiplier: 1.2,
        vehicleRates: {
            sedan: 1.0,
            suv: 1.5,
            van: 1.8,
            luxury: 2.2
        }
    };
    
    let transportSettings;
    
    try {
        // 尝试从多个存储位置获取设置
        console.log('Attempting to retrieve transport settings...');
        
        // 从localStorage获取设置
        const transportSettingsStr = localStorage.getItem('transportSettings');
        const sessionSettingsStr = sessionStorage.getItem('transportSettings');
        
        // 决定使用哪个数据源
        let dataSource = transportSettingsStr || sessionSettingsStr;
        console.log('Transport settings source:', dataSource ? 'Found settings' : 'No settings found');
        
        if (!dataSource) {
            console.warn('No transport settings found in storage, using defaults');
            transportSettings = defaultSettings;
        } else {
            try {
                transportSettings = JSON.parse(dataSource);
                console.log('Using transport settings:', transportSettings);
            } catch (parseError) {
                console.error('Error parsing transport settings:', parseError);
                transportSettings = defaultSettings;
            }
        }
    } catch (error) {
        console.error('Error retrieving transport settings:', error);
        transportSettings = defaultSettings;
    }
    
    // Ensure all required properties exist
    if (!transportSettings.vehicleRates) {
        transportSettings.vehicleRates = defaultSettings.vehicleRates;
    }
    
    // Log the values we're using
    console.log('Using baseFare: $' + transportSettings.baseFare + ', ratePerKm: $' + transportSettings.ratePerKm);
    
    // Base fare calculation
    let fare = transportSettings.baseFare + (distance * transportSettings.ratePerKm);
    
    // Apply vehicle type multiplier
    let vehicleMultiplier = 1.0; // Default to sedan rate
    
    if (transportSettings.vehicleRates[vehicleType.toLowerCase()]) {
        vehicleMultiplier = transportSettings.vehicleRates[vehicleType.toLowerCase()];
    } else {
        // If the specific vehicle type is not found, use default rates
        switch (vehicleType.toLowerCase()) {
            case 'suv':
                vehicleMultiplier = 1.5;
                break;
            case 'van':
                vehicleMultiplier = 1.8;
                break;
            case 'luxury':
                vehicleMultiplier = 2.2;
                break;
            default: // sedan
                vehicleMultiplier = 1.0;
        }
    }
    
    fare *= vehicleMultiplier;
    
    // Parse journey date and time
    let journeyDateTime = null;
    
    if (journeyDate && journeyTime) {
        try {
            // Combine date and time
            journeyDateTime = new Date(journeyDate + 'T' + journeyTime);
        } catch (e) {
            console.warn('Unable to parse journey date/time:', e);
        }
    }
    
    // Apply time-based multipliers if we have a valid date
    if (journeyDateTime && !isNaN(journeyDateTime)) {
        const hour = journeyDateTime.getHours();
        const dayOfWeek = journeyDateTime.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Rush hour: 6-9 AM or 4-7 PM
        if ((hour >= 6 && hour < 9) || (hour >= 16 && hour < 19)) {
            fare *= transportSettings.rushHourMultiplier;
            console.log('Applied rush hour multiplier:', transportSettings.rushHourMultiplier);
        }
        
        // Night time: 10 PM - 6 AM
        if (hour >= 22 || hour < 6) {
            fare *= transportSettings.nightMultiplier;
            console.log('Applied night multiplier:', transportSettings.nightMultiplier);
        }
        
        // Weekend: Saturday and Sunday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            fare *= transportSettings.weekendMultiplier;
            console.log('Applied weekend multiplier:', transportSettings.weekendMultiplier);
        }
    }
    
    // Round to 2 decimal places
    fare = Math.round(fare * 100) / 100;
    
    console.log('Calculated fare:', fare);
    return fare;
}

// Display the calculated quote
function displayQuote(quoteData) {
    console.log('Displaying quote with data:', quoteData);

    // Get the quote container
    const quoteContainer = document.getElementById('quoteContainer');
    if (!quoteContainer) {
        console.error('Quote container not found!');
        return;
    }
    
    // Show the quote container
    quoteContainer.style.display = 'block';
    quoteContainer.classList.add('visible');
    
    // Enable Book Now button
    const bookBtn = document.getElementById('bookNowBtn');
    if (bookBtn) {
        bookBtn.disabled = false;
        console.log('Book Now button enabled');
    }
    
    // Display the route map container
    const routeMapContainer = document.getElementById('routeMapContainer');
    if (routeMapContainer) {
        routeMapContainer.style.display = 'block';
        console.log('Route map container displayed');
    } else {
        console.error('Route map container not found');
    }
    
    // Update quote information
    const distanceElement = document.getElementById('quotedDistance');
    if (distanceElement) {
        distanceElement.textContent = `${quoteData.distance.toFixed(1)} km`;
    }
    
    const vehicleTypeElement = document.getElementById('quotedVehicle');
    if (vehicleTypeElement) {
        // Capitalize vehicle type
        const capitalizedVehicleType = quoteData.vehicleType.charAt(0).toUpperCase() + quoteData.vehicleType.slice(1);
        vehicleTypeElement.textContent = capitalizedVehicleType;
    }
    
    const fareElement = document.getElementById('quotedFare');
    if (fareElement) {
        fareElement.textContent = `$${quoteData.totalFare.toFixed(2)}`;
    }
    
    const depositElement = document.getElementById('quotedDeposit');
    if (depositElement) {
        depositElement.textContent = `$${quoteData.depositAmount.toFixed(2)}`;
    }
    
    // Display current rate information
    displayCurrentRates();
    
    // If route map components exist, update the map
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    if (pickupInput && destinationInput && 
        pickupInput.dataset.lat && pickupInput.dataset.lng &&
        destinationInput.dataset.lat && destinationInput.dataset.lng) {
        
        const pickupLat = parseFloat(pickupInput.dataset.lat);
        const pickupLng = parseFloat(pickupInput.dataset.lng);
        const destLat = parseFloat(destinationInput.dataset.lat);
        const destLng = parseFloat(destinationInput.dataset.lng);
        
        // Initialize or update the route map
        initRouteMap(pickupLat, pickupLng, destLat, destLng);
    }
}

// Display the current rate information
function displayCurrentRates() {
    // Get transport settings
    const defaultSettings = {
        baseFare: 30,
        ratePerKm: 0.5,
        rushHourMultiplier: 1.5,
        nightMultiplier: 1.3,
        weekendMultiplier: 1.2,
        vehicleRates: {
            sedan: 1.0,
            suv: 1.5,
            van: 1.8,
            luxury: 2.2
        }
    };
    
    const transportSettings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
    
    // Find or create rate info container
    let rateInfoElement = document.getElementById('rateInfo');
    
    if (!rateInfoElement) {
        rateInfoElement = document.createElement('div');
        rateInfoElement.id = 'rateInfo';
        rateInfoElement.className = 'rate-info';
        
        // Add styles if needed
        if (!document.getElementById('rate-info-styles')) {
            const style = document.createElement('style');
            style.id = 'rate-info-styles';
            style.textContent = `
                .rate-info {
                    font-size: 0.85rem;
                    margin-top: 8px;
                    color: #666;
                    background-color: #f8f9fa;
                    padding: 8px;
                    border-radius: 4px;
                }
                
                .rate-info ul {
                    margin: 5px 0;
                    padding-left: 20px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Find where to insert the rate info
        const quoteDetails = document.querySelector('.quote-details');
        if (quoteDetails) {
            quoteDetails.appendChild(rateInfoElement);
        } else {
            const quoteContainer = document.getElementById('quoteContainer');
            if (quoteContainer) {
                quoteContainer.appendChild(rateInfoElement);
            }
        }
    }
    
    // Set the content
    rateInfoElement.innerHTML = `
        <p><strong>Current Rates:</strong></p>
        <ul>
            <li>Base Fare: $${transportSettings.baseFare.toFixed(2)}</li>
            <li>Rate per km: $${transportSettings.ratePerKm.toFixed(2)}</li>
        </ul>
        <p><small>Time and vehicle type multipliers also apply to the final price.</small></p>
    `;
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
    console.log('Initializing route map with coordinates:', 
                'Pickup:', pickupLat, pickupLng, 
                'Destination:', destLat, destLng);
    
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer) {
        console.error('Route map container not found');
        return;
    }
    
    // Force set the height and style of the map container - use important to override any conflicting styles
    mapContainer.style.cssText = `
        height: 350px !important;
        width: 100% !important;
        border-radius: 8px !important;
        position: relative !important;
        display: block !important;
        z-index: 1 !important;
        overflow: hidden !important;
        border: 1px solid #ddd !important;
    `;
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Map loading failed. Please try again later.</div>';
        // Try to load Leaflet again
        loadLeafletForRoute();
        return;
    }
    
    // Check if the Leaflet Routing Machine is loaded
    if (typeof L.Routing === 'undefined') {
        console.log('Loading Leaflet Routing Machine');
        loadLeafletRoutingMachine();
        return;
    }
    
    try {
        // Check if a map instance already exists and remove it
        if (routeMapInstance) {
            console.log('Removing existing map instance');
            routeMapInstance.remove();
            routeMapInstance = null;
        }
        
        // Clear the container to avoid "already initialized" errors
        mapContainer.innerHTML = '';
        
        // Generate a unique ID for the map container to avoid Leaflet initialization issues
        const uniqueMapId = 'routeMap_' + Date.now();
        mapContainer.id = uniqueMapId;
        
        // Create map with both points visible
        const routeMap = L.map(uniqueMapId, {
            zoomControl: true,
            scrollWheelZoom: false, // Disable zoom on scroll for better UX
            dragging: true,
            touchZoom: true
        });
        
        // Store the map instance globally
        routeMapInstance = routeMap;
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(routeMap);
        
        // Create markers for pickup and destination with better visibility
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
        
        // Initialize routing control for driving directions
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickupLat, pickupLng),
                L.latLng(destLat, destLng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            addWaypoints: false,
            lineOptions: {
                styles: [{color: '#4CAF50', opacity: 0.7, weight: 5}],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            createMarker: function() { return null; } // Don't create default markers as we already have custom ones
        }).addTo(routeMap);
        
        // Store driving distance when route is calculated
        routingControl.on('routesfound', function(e) {
            console.log('Routes found:', e);
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const drivingDistance = routes[0].summary.totalDistance / 1000; // Convert to km
                const drivingTime = routes[0].summary.totalTime; // Time in seconds
                
                console.log('Actual driving distance:', drivingDistance.toFixed(2) + ' km');
                console.log('Estimated driving time:', Math.round(drivingTime / 60) + ' minutes');
                
                // Store the driving distance for fare calculations
                window.drivingDistanceKm = drivingDistance;
                
                // Update the quote if it's already displayed
                const quoteContainer = document.getElementById('quoteContainer');
                if (quoteContainer && quoteContainer.style.display !== 'none') {
                    calculateQuote();
                }
                
                // Add a popup with distance and time information
                const timeInMinutes = Math.round(drivingTime / 60);
                const timeText = timeInMinutes < 60 
                    ? `${timeInMinutes} minutes` 
                    : `${Math.floor(timeInMinutes / 60)} hr ${timeInMinutes % 60} min`;
                    
                // Create a popup along the route
                const midpointIndex = Math.floor(routes[0].coordinates.length / 2);
                const midpoint = routes[0].coordinates[midpointIndex];
                
                L.popup({
                    closeButton: false,
                    className: 'distance-popup',
                    offset: [0, -10]
                })
                .setLatLng([midpoint.lat, midpoint.lng])
                .setContent(`
                    <div style="text-align: center;">
                        <strong>${drivingDistance.toFixed(2)} km</strong><br>
                        <span style="font-size: 12px;">Est. ${timeText}</span>
                    </div>
                `)
                .openOn(routeMap);
            }
        });
        
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
                #routeMap {
                    height: 350px !important;
                    width: 100% !important;
                    display: block !important;
                }
                .leaflet-routing-container {
                    display: none; /* Hide the default directions panel */
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
        
        // Reset the map ID back to the original after initialization
        setTimeout(() => {
            mapContainer.id = 'routeMap';
            
            // Force map to refresh by invalidating size
            routeMap.invalidateSize(true);
            
            // Force the map to be visible
            mapContainer.style.display = 'block';
        }, 1000);
        
        console.log('Route map initialized successfully');
        
        // Force another refresh after 2 seconds to make sure map renders correctly 
        // even if tabs or containers were initially hidden
        setTimeout(() => {
            if (routeMapInstance) {
                routeMapInstance.invalidateSize(true);
                console.log('Map size invalidated to force refresh');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error initializing route map:', error);
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #721c24;">Failed to display the route map. Please try again later.</div>';
    }
}

// Helper function to load Leaflet specifically for route map
function loadLeafletForRoute() {
    console.log('Attempting to load Leaflet dynamically for route map');
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    // Add load event
    script.onload = function() {
        console.log('Leaflet loaded successfully for route map');
        // Now load the Routing Machine
        loadLeafletRoutingMachine();
    };
    
    // Add error event
    script.onerror = function() {
        console.error('Failed to load Leaflet for route map');
        const mapContainer = document.getElementById('routeMap');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Map loading failed. Please refresh the page and try again.</div>';
        }
    };
    
    // Add script to document
    document.head.appendChild(script);
}

// Helper function to load Leaflet Routing Machine
function loadLeafletRoutingMachine() {
    console.log('Loading Leaflet Routing Machine');
    
    // Add the CSS for Leaflet Routing Machine
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
    document.head.appendChild(linkElement);
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
    
    // Add load event
    script.onload = function() {
        console.log('Leaflet Routing Machine loaded successfully');
        // Get form values again
        const pickupInput = document.getElementById('pickupLocation');
        const destinationInput = document.getElementById('destinationLocation');
        
        if (pickupInput && destinationInput && 
            pickupInput.dataset.lat && pickupInput.dataset.lng &&
            destinationInput.dataset.lat && destinationInput.dataset.lng) {
            
            const pickupLat = parseFloat(pickupInput.dataset.lat);
            const pickupLng = parseFloat(pickupInput.dataset.lng);
            const destLat = parseFloat(destinationInput.dataset.lat);
            const destLng = parseFloat(destinationInput.dataset.lng);
            
            setTimeout(() => initRouteMap(pickupLat, pickupLng, destLat, destLng), 500);
        }
    };
    
    // Add error event
    script.onerror = function() {
        console.error('Failed to load Leaflet Routing Machine');
        const mapContainer = document.getElementById('routeMap');
        if (mapContainer) {
            mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Could not load routing service. Using straight line distance instead.</div>';
            
            // Fall back to standard map without routing
            const pickupInput = document.getElementById('pickupLocation');
            const destinationInput = document.getElementById('destinationLocation');
            
            if (pickupInput && destinationInput && 
                pickupInput.dataset.lat && pickupInput.dataset.lng &&
                destinationInput.dataset.lat && destinationInput.dataset.lng) {
                
                const pickupLat = parseFloat(pickupInput.dataset.lat);
                const pickupLng = parseFloat(pickupInput.dataset.lng);
                const destLat = parseFloat(destinationInput.dataset.lat);
                const destLng = parseFloat(destinationInput.dataset.lng);
                
                // Use the original map functionality as fallback
                fallbackToStraightLineMap(pickupLat, pickupLng, destLat, destLng);
            }
        }
    };
    
    // Add script to document
    document.head.appendChild(script);
}

// Fallback to straight line map if routing fails
function fallbackToStraightLineMap(pickupLat, pickupLng, destLat, destLng) {
    console.log('Falling back to straight line map');
    
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer || typeof L === 'undefined') return;
    
    try {
        // Clear the container
        mapContainer.innerHTML = '';
        
        // Create a unique ID
        const uniqueMapId = 'routeMap_fallback_' + Date.now();
        mapContainer.id = uniqueMapId;
        
        // Create map
        const routeMap = L.map(uniqueMapId).setView([(pickupLat + destLat) / 2, (pickupLng + destLng) / 2], 10);
        routeMapInstance = routeMap;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(routeMap);
        
        // Add markers
        L.marker([pickupLat, pickupLng]).addTo(routeMap).bindPopup('Pickup');
        L.marker([destLat, destLng]).addTo(routeMap).bindPopup('Destination');
        
        // Add straight line
        L.polyline([
            [pickupLat, pickupLng], 
            [destLat, destLng]
        ], {
            color: '#4CAF50',
            dashArray: '5, 10'
        }).addTo(routeMap);
        
        // Set bounds
        routeMap.fitBounds([
            [pickupLat, pickupLng],
            [destLat, destLng]
        ], {
            padding: [50, 50]
        });
        
        // Reset ID
        setTimeout(() => {
            mapContainer.id = 'routeMap';
            routeMap.invalidateSize();
        }, 500);
        
    } catch (error) {
        console.error('Error in fallback map:', error);
    }
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
        
        // Enable the quote button
        if (quoteBtn) {
            quoteBtn.classList.add('active');
            quoteBtn.disabled = false;
        }
        
        // Initialize the route map automatically when both locations are set
        const pickupLat = parseFloat(pickupInput.dataset.lat);
        const pickupLng = parseFloat(pickupInput.dataset.lng);
        const destLat = parseFloat(destinationInput.dataset.lat);
        const destLng = parseFloat(destinationInput.dataset.lng);
        
        // Show the route map container
        const routeMapContainer = document.getElementById('routeMapContainer');
        if (routeMapContainer) {
            routeMapContainer.style.display = 'block';
        }
        
        // Initialize the route map with driving directions
        initRouteMap(pickupLat, pickupLng, destLat, destLng);
        
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

// 初始化运输设置
function initializeTransportSettings() {
    try {
        // 尝试从多个存储位置获取设置
        const transportSettingsStr = localStorage.getItem('transportSettings');
        const sessionSettingsStr = sessionStorage.getItem('transportSettings');
        
        // 如果没有设置，使用默认设置
        if (!transportSettingsStr && !sessionSettingsStr) {
            console.warn('No transport settings found, using defaults');
            return; // 使用默认设置
        }
        
        // 优先使用localStorage，备用sessionStorage
        const dataSource = transportSettingsStr || sessionSettingsStr;
        
        // 解析设置
        const settings = JSON.parse(dataSource);
        console.log('Initialized transport settings:', settings);
        
        // 显示当前设置到控制台，方便调试
        if (settings.baseFare) {
            console.log('Base fare:', settings.baseFare);
        }
        
        return settings;
    } catch (error) {
        console.error('Error initializing transport settings:', error);
        return null;
    }
}

// 显示费率信息
function displayRateInfo() {
    try {
        // 获取报价容器
        const quoteContainer = document.getElementById('quoteContainer');
        if (!quoteContainer) {
            return;
        }
        
        // 获取运输设置
        let transportSettings;
        try {
            const transportSettingsStr = localStorage.getItem('transportSettings');
            if (transportSettingsStr) {
                transportSettings = JSON.parse(transportSettingsStr);
            } else {
                const sessionSettingsStr = sessionStorage.getItem('transportSettings');
                if (sessionSettingsStr) {
                    transportSettings = JSON.parse(sessionSettingsStr);
                }
            }
        } catch (parseError) {
            console.error('Error parsing settings:', parseError);
        }
        
        // 如果没有设置或解析失败，使用默认值
        if (!transportSettings) {
            transportSettings = {
                baseFare: 30,
                ratePerKm: 0.5
            };
        }
        
        // 创建费率信息HTML
        const rateInfoHTML = `
            <div style="font-size: 0.85em; color: #666; margin-top: 5px;">
                <div>Current rates: Base fare $${transportSettings.baseFare}, $${transportSettings.ratePerKm}/km</div>
            </div>
        `;
        
        // 添加到报价容器
        const detailsDiv = quoteContainer.querySelector('.quote-details');
        if (detailsDiv) {
            // 移除任何现有的费率信息
            const existingRateInfo = detailsDiv.querySelector('.rate-info');
            if (existingRateInfo) {
                existingRateInfo.remove();
            }
            
            // 添加新的费率信息
            const rateInfoDiv = document.createElement('div');
            rateInfoDiv.className = 'rate-info';
            rateInfoDiv.innerHTML = rateInfoHTML;
            detailsDiv.appendChild(rateInfoDiv);
        }
    } catch (error) {
        console.error('Error displaying rate info:', error);
    }
}