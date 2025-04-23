// Booking and Fare Calculation functionality
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
    displayQuote(distance, fare, deposit);
    
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
function displayQuote(distance, fare, deposit) {
    const priceEstimate = document.querySelector('.price-estimate');
    if (!priceEstimate) {
        console.error('Price estimate element not found');
        return;
    }
    
    // Format amounts for display
    const formattedDistance = distance.toFixed(2);
    const formattedFare = fare.toFixed(2);
    const formattedDeposit = deposit.toFixed(2);
    
    // Get vehicle display name
    const vehicleType = getSelectedVehicleType();
    const vehicleNames = {
        sedan: 'Sedan',
        suv: 'SUV',
        van: 'Van',
        luxury: 'Luxury Car'
    };
    const vehicleName = vehicleNames[vehicleType] || 'Vehicle';
    
    // Create HTML for the estimate
    priceEstimate.innerHTML = `
        <div class="quote-result">
            <h3>Journey Quote</h3>
            <div class="quote-item">
                <span>Distance:</span>
                <span>${formattedDistance} km</span>
            </div>
            <div class="quote-item">
                <span>Vehicle Type:</span>
                <span>${vehicleName}</span>
            </div>
            <div class="quote-item total">
                <span>Estimated Total:</span>
                <span>$${formattedFare}</span>
            </div>
            <div class="quote-item deposit">
                <span>Required Deposit (30%):</span>
                <span>$${formattedDeposit}</span>
            </div>
            <p class="quote-note">The full amount is payable on the day of travel.</p>
            <div id="routeMap" style="height: 300px; width: 100%; margin-top: 20px; border-radius: 8px;"></div>
        </div>
    `;
    
    // Add CSS if there is none
    if (!document.getElementById('quote-styles')) {
        const style = document.createElement('style');
        style.id = 'quote-styles';
        style.textContent = `
            .quote-result {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-top: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .quote-result h3 {
                margin-top: 0;
                color: #218838;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .quote-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .quote-item.total {
                font-weight: bold;
                font-size: 1.1em;
                margin-top: 15px;
                border-top: 1px dashed #ddd;
                padding-top: 10px;
            }
            .quote-item.deposit {
                color: #d63031;
                font-weight: bold;
            }
            .quote-note {
                font-size: 0.9em;
                color: #666;
                font-style: italic;
                margin-top: 15px;
                margin-bottom: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show with animation
    priceEstimate.style.display = 'block';
    priceEstimate.classList.add('fade-in');
    
    // Initialize route map after a short delay to ensure the container is visible
    setTimeout(() => {
        // Get coordinates for map display
        const pickupInput = document.getElementById('pickupLocation');
        const destinationInput = document.getElementById('destinationLocation');
        
        if (pickupInput && destinationInput && 
            pickupInput.dataset.lat && pickupInput.dataset.lng && 
            destinationInput.dataset.lat && destinationInput.dataset.lng) {
            
            const pickupLat = parseFloat(pickupInput.dataset.lat);
            const pickupLng = parseFloat(pickupInput.dataset.lng);
            const destLat = parseFloat(destinationInput.dataset.lat);
            const destLng = parseFloat(destinationInput.dataset.lng);
            
            initRouteMap(pickupLat, pickupLng, destLat, destLng);
        }
    }, 500);
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
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Map loading failed. Please try again later.</div>';
        return;
    }
    
    try {
        // Create map with both points visible
        const routeMap = L.map('routeMap');
        
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
        
        console.log('Route map initialized successfully');
    } catch (error) {
        console.error('Error initializing route map:', error);
        mapContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #721c24;">Failed to display the route map. Please try again later.</div>';
    }
} 