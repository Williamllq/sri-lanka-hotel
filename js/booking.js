/**
 * Booking functionality for transport services
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking functionality
    initBookingSystem();
});

/**
 * Initialize the booking system
 */
function initBookingSystem() {
    // Initialize Get Quote button
    const getQuoteBtn = document.getElementById('getQuoteBtn');
    if (getQuoteBtn) {
        getQuoteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            calculateQuote();
        });
    }
    
    // Initialize Book Now button
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processBooking();
        });
    }
}

/**
 * Calculate a quote based on the current form values
 */
function calculateQuote() {
    console.log('Calculating quote...');
    
    // Get form data
    const serviceType = document.getElementById('serviceType').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const journeyTime = document.getElementById('journeyTime').value;
    const passengerCount = document.getElementById('passengerCount').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    
    // Validate inputs
    if (!serviceType || !journeyDate || !journeyTime || !pickupLocation || !destinationLocation) {
        alert('Please fill out all required fields to get a quote');
        return;
    }
    
    // Get location coordinates if available
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    let distance = 0;
    
    // Calculate distance if we have coordinates
    if (pickupInput && destinationInput && 
        pickupInput.dataset.lat && pickupInput.dataset.lng && 
        destinationInput.dataset.lat && destinationInput.dataset.lng) {
        
        const pickupLat = parseFloat(pickupInput.dataset.lat);
        const pickupLng = parseFloat(pickupInput.dataset.lng);
        const destLat = parseFloat(destinationInput.dataset.lat);
        const destLng = parseFloat(destinationInput.dataset.lng);
        
        // Calculate distance (haversine formula)
        distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
    } else {
        // Fallback to an estimated distance if coordinates aren't available
        distance = 25; // Default 25km if no coordinates
    }
    
    // Calculate fare based on distance and service type
    const fare = calculateFare(distance, serviceType);
    const deposit = Math.round(fare * 0.3 * 100) / 100; // 30% deposit
    
    // Update the quote container
    displayQuote(distance, fare, deposit);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
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
    
    // Add 30% to account for roads vs straight line
    return Math.round(distance * 1.3 * 10) / 10;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Calculate fare based on distance and service type
 */
function calculateFare(distance, serviceType) {
    // Base rates
    const baseFare = 30; // Base fare in USD
    const ratePerKm = 0.5; // Rate per km in USD
    
    // Calculate basic fare
    let fare = baseFare + (distance * ratePerKm);
    
    // Apply service type multiplier
    if (serviceType === 'airport') {
        fare *= 1.2; // Airport transfers 20% more
    } else if (serviceType === 'custom') {
        fare *= 1.5; // Custom journeys 50% more
    }
    
    // Round to 2 decimal places
    return Math.round(fare * 100) / 100;
}

/**
 * Display the calculated quote
 */
function displayQuote(distance, fare, deposit) {
    // Get the quote container
    const quoteContainer = document.getElementById('quoteContainer');
    if (!quoteContainer) {
        console.error('Quote container not found');
        return;
    }
    
    // Update the quote details
    const distanceElement = document.getElementById('quotedDistance');
    if (distanceElement) {
        distanceElement.textContent = `${distance} km`;
    }
    
    const vehicleElement = document.getElementById('quotedVehicle');
    if (vehicleElement) {
        vehicleElement.textContent = 'Standard';
    }
    
    const fareElement = document.getElementById('quotedFare');
    if (fareElement) {
        fareElement.textContent = `$${fare.toFixed(2)}`;
    }
    
    const depositElement = document.getElementById('quotedDeposit');
    if (depositElement) {
        depositElement.textContent = `$${deposit.toFixed(2)}`;
    }
    
    // Show the quote container
    quoteContainer.style.display = 'block';
    
    // Enable the Book Now button now that we have a quote
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.disabled = false;
    }
    
    // Show route map if coordinates are available
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    if (pickupInput && destinationInput && 
        pickupInput.dataset.lat && pickupInput.dataset.lng && 
        destinationInput.dataset.lat && destinationInput.dataset.lng) {
        
        // Call the showRouteMap function from map.js to display the route
        if (typeof showRouteMap === 'function') {
            showRouteMap();
        } else {
            console.error('showRouteMap function not found');
            // Fallback: just show the container
            const routeMapContainer = document.getElementById('routeMapContainer');
            if (routeMapContainer) {
                routeMapContainer.style.display = 'block';
            }
        }
    }
}

/**
 * Process a booking when the user clicks "Book Now"
 */
function processBooking() {
    // Check if user is logged in
    if (typeof UserAuth === 'undefined' || !UserAuth.isLoggedIn()) {
        alert('Please login to book a journey');
        if (typeof UserAuth !== 'undefined') {
            UserAuth.showLoginModal();
        }
        return;
    }
    
    // Get booking data from form
    const serviceType = document.getElementById('serviceType').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const journeyTime = document.getElementById('journeyTime').value;
    const passengerCount = document.getElementById('passengerCount').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const specialRequirements = document.getElementById('specialRequirements').value;
    
    // Validate inputs
    if (!serviceType || !journeyDate || !journeyTime || !pickupLocation || !destinationLocation) {
        alert('Please fill out all required fields');
        return;
    }
    
    // Get fare data from quote if available
    let fare = 0;
    let distance = 0;
    const quotedFare = document.getElementById('quotedFare');
    const quotedDistance = document.getElementById('quotedDistance');
    
    if (quotedFare) {
        // Extract numeric value from fare text (e.g., "$120" -> 120)
        const fareText = quotedFare.textContent;
        fare = parseFloat(fareText.replace(/[^0-9.]/g, '')) || 0;
    }
    
    if (quotedDistance) {
        // Extract numeric value from distance text (e.g., "10 km" -> 10)
        const distanceText = quotedDistance.textContent;
        distance = parseFloat(distanceText.replace(/[^0-9.]/g, '')) || 0;
    }
    
    // If we don't have a quote yet, calculate one
    if (fare === 0 || distance === 0) {
        calculateQuote();
        return;
    }
    
    // Get user data
    const currentUser = UserAuth.getCurrentUser();
    
    // Create booking object
    const booking = {
        id: 'B' + Date.now(),
        userEmail: currentUser.email,
        userName: currentUser.name,
        serviceType: serviceType,
        date: journeyDate,
        time: journeyTime,
        passengerCount: passengerCount,
        pickupLocation: pickupLocation,
        destinationLocation: destinationLocation,
        specialRequirements: specialRequirements,
        distance: distance,
        totalPrice: fare,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    console.log('Creating new booking:', booking);
    
    // Save booking to multiple locations for redundancy
    saveBooking(booking);
    
    // Show confirmation
    alert('Booking confirmed! Your booking ID is: ' + booking.id);
    
    // Reset form
    resetBookingForm();
}

/**
 * Save booking to localStorage
 */
function saveBooking(booking) {
    // Save to userBookings format (primary)
    try {
        const userBookingsStr = localStorage.getItem('userBookings');
        const userBookings = userBookingsStr ? JSON.parse(userBookingsStr) : {};
        
        if (!userBookings[booking.userEmail]) {
            userBookings[booking.userEmail] = [];
        }
        
        userBookings[booking.userEmail].push(booking);
        localStorage.setItem('userBookings', JSON.stringify(userBookings));
        console.log('Booking saved to userBookings');
    } catch (e) {
        console.error('Error saving to userBookings:', e);
    }
    
    // Save to bookingSystem format (secondary)
    try {
        const bookingSystemStr = localStorage.getItem('bookingSystem');
        const bookingSystem = bookingSystemStr ? JSON.parse(bookingSystemStr) : { bookings: [] };
        
        if (!bookingSystem.bookings) {
            bookingSystem.bookings = [];
        }
        
        bookingSystem.bookings.push(booking);
        localStorage.setItem('bookingSystem', JSON.stringify(bookingSystem));
        console.log('Booking saved to bookingSystem');
    } catch (e) {
        console.error('Error saving to bookingSystem:', e);
    }
    
    // Save to individual booking entry for redundancy
    try {
        localStorage.setItem('booking_' + booking.id, JSON.stringify(booking));
        console.log('Booking saved as individual entry');
    } catch (e) {
        console.error('Error saving individual booking:', e);
    }
}

/**
 * Reset the booking form after a successful booking
 */
function resetBookingForm() {
    document.getElementById('serviceType').value = '';
    document.getElementById('journeyDate').value = '';
    document.getElementById('journeyTime').value = '';
    document.getElementById('passengerCount').value = '1';
    document.getElementById('pickupLocation').value = '';
    document.getElementById('destinationLocation').value = '';
    document.getElementById('specialRequirements').value = '';
    
    // Reset location data attributes
    const pickupInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destinationLocation');
    
    if (pickupInput) {
        pickupInput.setAttribute('data-lat', '');
        pickupInput.setAttribute('data-lng', '');
    }
    
    if (destinationInput) {
        destinationInput.setAttribute('data-lat', '');
        destinationInput.setAttribute('data-lng', '');
    }
    
    // Hide quote container if visible
    const quoteContainer = document.getElementById('quoteContainer');
    if (quoteContainer) {
        quoteContainer.style.display = 'none';
    }
    
    // Hide route map if visible
    const routeMapContainer = document.getElementById('routeMapContainer');
    if (routeMapContainer) {
        routeMapContainer.style.display = 'none';
    }
}