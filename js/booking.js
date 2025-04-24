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
    
    const fare = calculateFare(distance, vehicleType);
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
function displayQuote(quoteData) {
    try {
        const pickupLocation = document.getElementById('pickup-location').value;
        const destination = document.getElementById('destination').value;
        const pickupLat = document.getElementById('pickup-lat').value;
        const pickupLng = document.getElementById('pickup-lng').value;
        const destLat = document.getElementById('dest-lat').value;
        const destLng = document.getElementById('dest-lng').value;

        // Check if we have all needed values
        if (!pickupLocation || !destination || !pickupLat || !pickupLng || !destLat || !destLng) {
            console.error('Missing values for quote calculation');
            showMessage('Please select both pickup and destination locations', 'error');
            return;
        }

        // Calculate distance using Haversine formula (as the crow flies)
        let distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
        
        const vehicleType = getSelectedVehicleType();
        let fare = calculateFare(distance, vehicleType);
        const deposit = fare * 0.2; // 20% deposit

        // Update the DOM with the calculated values
        const quoteContainer = document.getElementById('quoteContainer');
        const quotedPickup = document.getElementById('quotedPickup');
        const quotedDestination = document.getElementById('quotedDestination');
        const quotedDistance = document.getElementById('quotedDistance');
        const quotedVehicleType = document.getElementById('quotedVehicleType');
        const quotedFare = document.getElementById('quotedFare');
        const quotedDeposit = document.getElementById('quotedDeposit');
        const bookNowBtn = document.getElementById('bookNowBtn');

        if (quoteContainer && quotedPickup && quotedDestination && quotedDistance &&
            quotedVehicleType && quotedFare && quotedDeposit && bookNowBtn) {
            
            quotedPickup.textContent = pickupLocation;
            quotedDestination.textContent = destination;
            quotedDistance.textContent = `${distance.toFixed(1)} km`;
            quotedVehicleType.textContent = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
            quotedFare.textContent = `$${fare.toFixed(2)}`;
            quotedDeposit.textContent = `$${deposit.toFixed(2)}`;
            
            // Show the quote container
            quoteContainer.style.display = 'block';
            
            // Enable the Book Now button
            bookNowBtn.disabled = false;
            
            // Initialize the map to show the route
            if (pickupLat && pickupLng && destLat && destLng) {
                initRouteMap(pickupLat, pickupLng, destLat, destLng);
            }
        } else {
            console.error('One or more quote elements not found in the DOM');
        }
    } catch (error) {
        console.error('Error displaying quote:', error);
        showMessage('An error occurred while calculating your quote. Please try again.', 'error');
    }
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
    console.log('Initializing route map with coordinates:', {
        pickup: { lat: pickupLat, lng: pickupLng },
        destination: { lat: destLat, lng: destLng }
    });
    
    // Get map container
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer) {
        console.error('Route map container not found');
        return;
    }
    
    // Set some basic styles on the map container to ensure it displays correctly
    mapContainer.setAttribute('style', `
        height: 350px !important;
        width: 100% !important;
        display: block !important;
        overflow: hidden !important;
        border: 1px solid #ddd !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    `);
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Map loading failed. Please try again later.</div>';
        // Try to load Leaflet again
        loadLeafletForRoute();
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
        const routeMap = L.map(uniqueMapId, {
            zoomControl: true,
            scrollWheelZoom: false, // Disable zoom on scroll for better UX
            dragging: true, // Allow dragging the map
            touchZoom: true, // Allow finger zoom
            zoomAnimation: true, // Enable smooth zoom animation
            fadeAnimation: true // Enable fade animation
        });
        
        // Store the map instance globally
        routeMapInstance = routeMap;
        
        // Add a more appealing map layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
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
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    white-space: nowrap;
                }
                .pickup-marker .marker-inner {
                    background-color: #4285F4;
                    border: 2px solid white;
                }
                .dest-marker .marker-inner {
                    background-color: #DB4437;
                    border: 2px solid white;
                }
                .distance-popup .leaflet-popup-content-wrapper {
                    border-radius: 15px;
                    background-color: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 3px 14px rgba(0,0,0,0.2);
                }
                .distance-popup .leaflet-popup-tip {
                    background-color: rgba(255, 255, 255, 0.9);
                }
                .leaflet-marker-pane .journey-marker {
                    transition: transform 0.3s ease-out;
                }
                .leaflet-marker-pane .journey-marker:hover {
                    transform: scale(1.1);
                    z-index: 1000 !important;
                }
                #routeMap {
                    height: 350px !important;
                    width: 100% !important;
                    display: block !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create markers for pickup and destination with better visibility and animations
        // First, add markers to the map with a delay for animation effect
        setTimeout(() => {
            // Pickup marker
            const pickupMarker = L.marker([pickupLat, pickupLng], {
                icon: L.divIcon({
                    className: 'journey-marker pickup-marker',
                    html: '<div class="marker-inner">Pickup</div>',
                    iconSize: [80, 30],
                    iconAnchor: [40, 15]
                })
            }).addTo(routeMap);
            
            // Add pickup marker animation
            pickupMarker._icon.style.opacity = '0';
            pickupMarker._icon.style.transform = 'translateY(-20px)';
            pickupMarker._icon.style.transition = 'opacity 0.3s, transform 0.3s';
            
            setTimeout(() => {
                pickupMarker._icon.style.opacity = '1';
                pickupMarker._icon.style.transform = 'translateY(0)';
            }, 200);
            
            // Destination marker with slight delay for staged animation
            setTimeout(() => {
                const destMarker = L.marker([destLat, destLng], {
                    icon: L.divIcon({
                        className: 'journey-marker dest-marker',
                        html: '<div class="marker-inner">Destination</div>',
                        iconSize: [100, 30],
                        iconAnchor: [50, 15]
                    })
                }).addTo(routeMap);
                
                // Add destination marker animation
                destMarker._icon.style.opacity = '0';
                destMarker._icon.style.transform = 'translateY(-20px)';
                destMarker._icon.style.transition = 'opacity 0.3s, transform 0.3s';
                
                setTimeout(() => {
                    destMarker._icon.style.opacity = '1';
                    destMarker._icon.style.transform = 'translateY(0)';
                }, 100);
            }, 300);
        }, 100);
        
        // Add a loading indicator to the map while route is calculated
        const loadingControl = L.control({position: 'bottomleft'});
        loadingControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'loading-indicator');
            div.innerHTML = '<div style="background: white; padding: 8px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center;"><div style="width: 16px; height: 16px; border: 2px solid #4285F4; border-radius: 50%; border-top-color: transparent; animation: leaflet-spin 1s linear infinite; margin-right: 8px;"></div>Calculating route...</div>';
            
            // Add the animation if not exists
            if (!document.getElementById('leaflet-spin-style')) {
                const style = document.createElement('style');
                style.id = 'leaflet-spin-style';
                style.textContent = `
                    @keyframes leaflet-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            return div;
        };
        loadingControl.addTo(routeMap);
        
        // Fit bounds to show both markers with padding
        routeMap.fitBounds([
            [pickupLat, pickupLng],
            [destLat, destLng]
        ], {
            padding: [50, 50]
        });
        
        // Use OSRM to get the driving route
        fetchDrivingRoute(pickupLat, pickupLng, destLat, destLng, routeMap, loadingControl);
        
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

// Function to fetch driving route using OSRM API
function fetchDrivingRoute(pickupLat, pickupLng, destLat, destLng, map, loadingControl) {
    // OSRM demo server URL - for production use, consider using a self-hosted instance or a commercial API
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=polyline`;
    
    fetch(osrmUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            if (loadingControl) {
                map.removeControl(loadingControl);
            }
            
            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error('No route found');
            }
            
            // Get route data
            const route = data.routes[0];
            const routeGeometry = route.geometry;
            const routeDistance = route.distance / 1000; // Convert to km
            const routeDuration = Math.round(route.duration / 60); // Convert to minutes
            
            // Ensure the polyline decoder is available
            if (typeof L.Polyline.fromEncoded === 'undefined') {
                // Add the polyline decoder if not available
                addPolylineDecoder();
            }
            
            // Decode the polyline geometry
            const decodedPath = L.Polyline.fromEncoded(routeGeometry).getLatLngs();
            
            // Draw the route with improved styling
            const routeLine = L.polyline(decodedPath, {
                color: '#4CAF50',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round',
                className: 'animated-route'
            }).addTo(map);
            
            // Add route animation style if not exists
            if (!document.getElementById('route-animation-style')) {
                const style = document.createElement('style');
                style.id = 'route-animation-style';
                style.textContent = `
                    @keyframes routeDash {
                        to {
                            stroke-dashoffset: 0;
                        }
                    }
                    .animated-route {
                        stroke-dasharray: 8, 5;
                        animation: routeDash 1.5s linear forwards;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Update the global distance calculation with the driving distance
            const distanceElement = document.getElementById('quotedDistance');
            if (distanceElement) {
                distanceElement.textContent = `${routeDistance.toFixed(1)} km`;
            }
            
            // Add distance and duration popup on the route
            const midPointIndex = Math.floor(decodedPath.length / 2);
            const midPoint = decodedPath[midPointIndex];
            
            L.popup({
                closeButton: false,
                className: 'distance-popup',
                offset: [0, -10],
                autoPan: false
            })
            .setLatLng(midPoint)
            .setContent(`<div style="text-align: center; padding: 8px;"><strong>${routeDistance.toFixed(1)} km</strong><br>${routeDuration} min drive</div>`)
            .openOn(map);
            
            // Update the calculated distance in the quote
            // Recalculate fare based on the new driving distance
            const vehicleType = getSelectedVehicleType();
            const fare = calculateFare(routeDistance, vehicleType);
            const deposit = fare * 0.2; // 20% deposit
            
            // Update the quoted fare
            const fareElement = document.getElementById('quotedFare');
            if (fareElement) {
                fareElement.textContent = `$${fare.toFixed(2)}`;
            }
            
            // Update the quoted deposit
            const depositElement = document.getElementById('quotedDeposit');
            if (depositElement) {
                depositElement.textContent = `$${deposit.toFixed(2)}`;
            }
            
            // Fit map bounds to the route with padding
            map.fitBounds(routeLine.getBounds(), {
                padding: [50, 50],
                animate: true
            });
            
            // Add route milestones for long routes (if more than 5 points)
            if (decodedPath.length > 10) {
                addRouteMilestones(decodedPath, map, routeDistance);
            }
        })
        .catch(error => {
            console.error('Error fetching route:', error);
            
            // Remove loading indicator
            if (loadingControl) {
                map.removeControl(loadingControl);
            }
            
            // Fall back to a straight line if route calculation fails
            L.polyline([
                [pickupLat, pickupLng],
                [destLat, destLng]
            ], {
                color: '#FF5722',
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 10',
                lineJoin: 'round'
            }).addTo(map);
            
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
            .setContent(`<div style="text-align: center;"><strong>${distance.toFixed(1)} km</strong><br>(Direct distance)</div>`)
            .openOn(map);
            
            // Show a warning about falling back to direct distance
            const warningControl = L.control({position: 'bottomright'});
            warningControl.onAdd = function() {
                const div = L.DomUtil.create('div', 'route-warning');
                div.innerHTML = '<div style="background: #f8d7da; color: #721c24; padding: 8px; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.4); font-size: 12px;">Using direct distance. Actual driving route unavailable.</div>';
                return div;
            };
            warningControl.addTo(map);
        });
}

// Function to add route milestones for better visualization
function addRouteMilestones(decodedPath, map, totalDistance) {
    // Only add milestones for routes longer than 10km
    if (totalDistance < 10) return;
    
    // Determine how many milestones to add (1 every 5km, but max 5 total)
    const milestoneCount = Math.min(Math.floor(totalDistance / 5), 5);
    if (milestoneCount <= 1) return;
    
    // Calculate points to place milestones
    for (let i = 1; i < milestoneCount; i++) {
        const ratio = i / milestoneCount;
        const pointIndex = Math.floor(ratio * (decodedPath.length - 1));
        const point = decodedPath[pointIndex];
        
        // Create a milestone marker
        L.circleMarker(point, {
            radius: 6,
            color: '#4CAF50',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2
        }).addTo(map);
    }
}

// Add Polyline.encoded plugin to Leaflet
function addPolylineDecoder() {
    if (typeof L !== 'undefined' && typeof L.Polyline.fromEncoded === 'undefined') {
        // Polyline encoding/decoding utility (required for OSRM routes)
        L.Polyline.fromEncoded = function(encoded, options) {
            var points = [];
            var index = 0, len = encoded.length;
            var lat = 0, lng = 0;
            
            while (index < len) {
                var b, shift = 0, result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += dlat;
                
                shift = 0;
                result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lng += dlng;
                
                points.push([lat * 1e-5, lng * 1e-5]);
            }
            
            return new L.Polyline(points, options);
        };
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
        
        // Add the polyline decoder
        addPolylineDecoder();
        
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
            
            // Add a small delay to ensure Leaflet is fully initialized
            setTimeout(() => initRouteMap(pickupLat, pickupLng, destLat, destLng), 500);
        }
    };
    
    // Add error event
    script.onerror = function() {
        console.error('Failed to load Leaflet for route map');
        const mapContainer = document.getElementById('routeMap');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; background-color: #f8d7da; color: #721c24; border-radius: 4px;">
                    <p><strong>Map loading failed</strong></p>
                    <p>Please refresh the page and try again, or check your internet connection.</p>
                </div>
            `;
        }
    };
    
    // Add CSS for Leaflet
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
    }
    
    // Add script to document
    document.head.appendChild(script);
} 