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
    const bookNowBtn = document.getElementById('bookNowBtn');
    
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processBooking();
        });
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