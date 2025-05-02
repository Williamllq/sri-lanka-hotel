/**
 * Booking functionality for transport services
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking functionality
    initBookingSystem();
    
    // Initialize the confirmation modal
    initConfirmationModal();
    
    // Synchronize existing bookings to admin panel format
    synchronizeBookings();
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
 * Initialize the booking confirmation modal
 */
function initConfirmationModal() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('bookingConfirmationModal')) {
        const modalHTML = `
            <div id="bookingConfirmationModal" class="booking-modal">
                <div class="booking-modal-content">
                    <span class="booking-modal-close">&times;</span>
                    <div class="booking-modal-header">
                        <i class="fas fa-check-circle"></i>
                        <h2>Booking Confirmed!</h2>
                    </div>
                    <div class="booking-modal-body">
                        <div class="booking-details">
                            <div class="booking-id-container">
                                <span>Booking ID:</span>
                                <span id="confirmationBookingId" class="booking-id">B12345678</span>
                            </div>
                            <div class="booking-info-grid">
                                <div class="booking-info-item">
                                    <i class="fas fa-calendar-day"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Date & Time</span>
                                        <span id="confirmationDateTime">2023-08-15 14:30</span>
                                    </div>
                                </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Pickup Location</span>
                                        <span id="confirmationPickup">Colombo International Airport</span>
                                    </div>
                                </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-map-pin"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Destination</span>
                                        <span id="confirmationDestination">Kandy City Center</span>
                                    </div>
                                </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-users"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Passengers</span>
                                        <span id="confirmationPassengers">2 People</span>
                                    </div>
                                </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-route"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Distance</span>
                                        <span id="confirmationDistance">120 km</span>
                                    </div>
                                </div>
                                <div class="booking-info-item">
                                    <i class="fas fa-dollar-sign"></i>
                                    <div class="booking-info-content">
                                        <span class="booking-info-label">Total Price</span>
                                        <span id="confirmationPrice">$85.00</span>
                                    </div>
                                </div>
                            </div>
                            <div class="booking-notes">
                                <div id="confirmationNotes">
                                    <p>A confirmation email has been sent to your registered email address.</p>
                                    <p>Please note that 30% deposit is required to secure your booking.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="booking-modal-footer">
                        <button id="viewBookingsBtn" class="btn">View My Bookings</button>
                        <button id="closeModalBtn" class="btn secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal HTML to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .booking-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease-in-out;
            }
            
            .booking-modal-content {
                background-color: #fff;
                margin: 5% auto;
                padding: 0;
                width: 90%;
                max-width: 600px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.4s ease-out;
                overflow: hidden;
            }
            
            .booking-modal-header {
                background-color: #4CAF50;
                color: white;
                padding: 25px 20px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }
            
            .booking-modal-header i {
                font-size: 48px;
                margin-bottom: 10px;
                animation: bounceIn 0.6s;
            }
            
            .booking-modal-header h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            
            .booking-modal-body {
                padding: 25px;
            }
            
            .booking-id-container {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 4px solid #4CAF50;
            }
            
            .booking-id {
                font-size: 18px;
                font-weight: 600;
                color: #4CAF50;
                font-family: monospace;
            }
            
            .booking-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .booking-info-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                background-color: #f8f9fa;
            }
            
            .booking-info-item i {
                color: #4a6fa5;
                font-size: 20px;
                margin-top: 2px;
            }
            
            .booking-info-content {
                display: flex;
                flex-direction: column;
            }
            
            .booking-info-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 2px;
            }
            
            .booking-notes {
                background-color: #e9f7ef;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
                border-left: 4px solid #4CAF50;
                font-size: 14px;
                color: #2d3748;
            }
            
            .booking-notes p {
                margin: 5px 0;
            }
            
            .booking-modal-footer {
                padding: 15px 25px 25px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .booking-modal-close {
                position: absolute;
                right: 20px;
                top: 15px;
                color: white;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                z-index: 10;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            @media (max-width: 768px) {
                .booking-modal-content {
                    width: 95%;
                    margin: 10% auto;
                }
                
                .booking-info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(modalStyles);
        
        // Add event listeners for the modal
        const modal = document.getElementById('bookingConfirmationModal');
        const closeBtn = document.querySelector('.booking-modal-close');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const viewBookingsBtn = document.getElementById('viewBookingsBtn');
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
        
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = "none";
        });
        
        viewBookingsBtn.addEventListener('click', function() {
            modal.style.display = "none";
            if (typeof showMyBookings === 'function') {
                showMyBookings();
            } else {
                console.error('showMyBookings function not found');
            }
        });
        
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
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
        
        // We'll get the actual distance from the route data
        // For now, use Haversine formula as an initial estimate
        distance = calculateDistance(pickupLat, pickupLng, destLat, destLng);
        
        // Calculate fare based on distance and service type
        const fare = calculateFare(distance, serviceType);
        const deposit = Math.round(fare * 0.3 * 100) / 100; // 30% deposit
        
        // Show the initial quote while we load the route
        displayQuote(distance, fare, deposit);
        
        // Call showRouteMap to display the route and get the actual driving distance
        if (typeof showRouteMap === 'function') {
            showRouteMap();
            
            // The distance will be updated by getRouteData in map.js
            // We'll check for the updated distance after a short delay
            setTimeout(function() {
                const distanceElement = document.getElementById('quotedDistance');
                if (distanceElement) {
                    const distanceText = distanceElement.textContent;
                    const match = distanceText.match(/(\d+\.?\d*)/);
                    if (match) {
                        const updatedDistance = parseFloat(match[1]);
                        
                        // If the distance has been updated by the routing API
                        if (updatedDistance !== distance) {
                            console.log('Updating quote with actual driving distance:', updatedDistance);
                            
                            // Recalculate fare with the actual driving distance
                            const updatedFare = calculateFare(updatedDistance, serviceType);
                            const updatedDeposit = Math.round(updatedFare * 0.3 * 100) / 100;
                            
                            // Update the quote display
                            updateQuoteDisplay(updatedDistance, updatedFare, updatedDeposit);
                        }
                    }
                }
            }, 1500); // Wait 1.5 seconds for route data to be loaded
        }
    } else {
        // Fallback to an estimated distance if coordinates aren't available
        distance = 25; // Default 25km if no coordinates
        
        // Calculate fare based on distance and service type
        const fare = calculateFare(distance, serviceType);
        const deposit = Math.round(fare * 0.3 * 100) / 100; // 30% deposit
        
        // Update the quote container
        displayQuote(distance, fare, deposit);
    }
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
    updateQuoteDisplay(distance, fare, deposit);
    
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
 * Update the quote display with new values
 */
function updateQuoteDisplay(distance, fare, deposit) {
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
    
    // Show confirmation modal instead of alert
    showBookingConfirmation(booking);
    
    // Send confirmation email
    sendBookingConfirmation(booking);
    
    // Reset form
    resetBookingForm();
}

/**
 * Show the booking confirmation modal with booking details
 */
function showBookingConfirmation(booking) {
    const modal = document.getElementById('bookingConfirmationModal');
    if (!modal) {
        console.error('Booking confirmation modal not found');
        return;
    }
    
    // Format date and time for display
    const dateObj = new Date(booking.date + 'T' + booking.time);
    const formattedDateTime = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update modal content with booking details
    document.getElementById('confirmationBookingId').textContent = booking.id;
    document.getElementById('confirmationDateTime').textContent = formattedDateTime;
    document.getElementById('confirmationPickup').textContent = booking.pickupLocation;
    document.getElementById('confirmationDestination').textContent = booking.destinationLocation;
    document.getElementById('confirmationPassengers').textContent = booking.passengerCount + (booking.passengerCount === '1' ? ' Person' : ' People');
    document.getElementById('confirmationDistance').textContent = booking.distance + ' km';
    document.getElementById('confirmationPrice').textContent = '$' + booking.totalPrice.toFixed(2);
    
    // Show the booking confirmation modal
    modal.style.display = "block";
}

/**
 * Send booking confirmation email to the user
 */
function sendBookingConfirmation(booking) {
    console.log('Sending booking confirmation email to:', booking.userEmail);
    
    // Format date and time for display
    const dateObj = new Date(booking.date + 'T' + booking.time);
    const formattedDateTime = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Prepare email data for the API call
    const emailData = {
        to: booking.userEmail,
        subject: 'Your Sri Lanka Stay & Explore Booking Confirmation',
        bookingId: booking.id,
        userName: booking.userName,
        serviceType: getServiceTypeLabel(booking.serviceType),
        date: formattedDateTime,
        pickupLocation: booking.pickupLocation,
        destinationLocation: booking.destinationLocation,
        passengerCount: booking.passengerCount,
        distance: booking.distance,
        totalPrice: booking.totalPrice.toFixed(2),
        deposit: (booking.totalPrice * 0.3).toFixed(2)
    };
    
    // Log the email data
    console.log('Email data:', emailData);
    
    // Call the API to send the email confirmation
    // We determine the API URL based on the environment
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/send-booking-confirmation'
        : '/api/send-booking-confirmation';
    
    // Make the API call
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Email sent successfully:', data);
        
        // Update the confirmation modal to indicate email was sent
        const confirmationNotes = document.getElementById('confirmationNotes');
        if (confirmationNotes) {
            confirmationNotes.innerHTML = `
                <p>A confirmation email has been sent to <strong>${booking.userEmail}</strong>.</p>
                <p>Please note that 30% deposit is required to secure your booking.</p>
            `;
        }
    })
    .catch(error => {
        console.error('Error sending email:', error);
        
        // Update the confirmation modal to indicate there was an issue
        const confirmationNotes = document.getElementById('confirmationNotes');
        if (confirmationNotes) {
            confirmationNotes.innerHTML = `
                <p>We couldn't send the confirmation email at this time.</p>
                <p>Please save your booking ID <strong>${booking.id}</strong> for reference.</p>
                <p>Please note that 30% deposit is required to secure your booking.</p>
            `;
        }
    });
}

/**
 * Get a user-friendly label for service type
 */
function getServiceTypeLabel(serviceType) {
    switch(serviceType) {
        case 'airport':
            return 'Airport Transfer';
        case 'city':
            return 'City Tour';
        case 'custom':
            return 'Custom Journey';
        default:
            return serviceType;
    }
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
    
    // 为管理员界面保存预订信息到"bookings"格式
    try {
        // 对booking对象扩展一些额外字段，以便管理员界面能够正确显示
        const adminBooking = {
            ...booking,
            // 添加用于管理员界面的字段
            timestamp: booking.createdAt,
            customerName: booking.userName,
            customerEmail: booking.userEmail,
            fromLocation: booking.pickupLocation,
            toLocation: booking.destinationLocation,
            totalFare: booking.totalPrice,
            depositAmount: booking.totalPrice * 0.3,
            userId: booking.userEmail,
            vehicleType: 'Standard'
        };
        
        // 获取现有bookings数组
        const bookingsStr = localStorage.getItem('bookings');
        let bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        
        // 确保bookings是一个数组
        if (!Array.isArray(bookings)) {
            bookings = [];
        }
        
        // 将当前预订添加到数组中
        bookings.push(adminBooking);
        
        // 保存回localStorage
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log('Booking saved to bookings for admin panel');
    } catch (e) {
        console.error('Error saving to bookings format:', e);
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

/**
 * Handle mobile layout optimization for the route map
 * This function will move the route map to appear below the quote on mobile devices
 */
function setupMobileRouteMap() {
    // Check if it's mobile view (screen width < 768px)
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    const routeMapContainer = document.getElementById('routeMapContainer');
    const quoteContainer = document.getElementById('quoteContainer');
    const bookingForm = document.querySelector('.booking-form');
    const transportInfo = document.querySelector('.transport-info');
    
    if (!routeMapContainer || !quoteContainer || !bookingForm || !transportInfo) {
        return;
    }
    
    if (isMobile) {
        // On mobile: Move the route map to display after the quote container
        if (routeMapContainer.parentNode === transportInfo && quoteContainer.style.display !== 'none') {
            // Remove from current position
            transportInfo.removeChild(routeMapContainer);
            // Insert after quote container
            bookingForm.insertBefore(routeMapContainer, quoteContainer.nextSibling);
            console.log('Route map moved to mobile position');
        }
    } else {
        // On desktop: Move back to original position if needed
        if (routeMapContainer.parentNode !== transportInfo) {
            // Remove from current position
            routeMapContainer.parentNode.removeChild(routeMapContainer);
            // Insert back into transport info
            transportInfo.appendChild(routeMapContainer);
            console.log('Route map moved to desktop position');
        }
    }
}

// Add resize event listener to handle layout changes
window.addEventListener('resize', function() {
    if (document.getElementById('routeMapContainer').style.display !== 'none') {
        setupMobileRouteMap();
    }
});

// Add event listener to run when route map is shown
document.addEventListener('DOMContentLoaded', function() {
    const getQuoteBtn = document.getElementById('getQuoteBtn');
    if (getQuoteBtn) {
        const originalClick = getQuoteBtn.onclick;
        getQuoteBtn.addEventListener('click', function() {
            // Wait for the route map to be displayed
            setTimeout(function() {
                setupMobileRouteMap();
            }, 500);
        });
    }
});

/**
 * Synchronize existing bookings from userBookings and bookingSystem to the bookings format
 * for the admin panel
 */
function synchronizeBookings() {
    console.log('Synchronizing bookings for admin panel...');
    
    // 现有的预订集合
    let allBookings = [];
    let bookingIds = new Set();
    
    // 从userBookings获取预订
    try {
        const userBookingsStr = localStorage.getItem('userBookings');
        if (userBookingsStr) {
            const userBookings = JSON.parse(userBookingsStr);
            
            // 遍历所有用户的预订
            Object.values(userBookings).forEach(userBookingList => {
                if (Array.isArray(userBookingList)) {
                    userBookingList.forEach(booking => {
                        if (booking && booking.id && !bookingIds.has(booking.id)) {
                            bookingIds.add(booking.id);
                            allBookings.push(booking);
                        }
                    });
                }
            });
        }
        console.log('Retrieved bookings from userBookings:', bookingIds.size);
    } catch (e) {
        console.error('Error retrieving bookings from userBookings:', e);
    }
    
    // 从bookingSystem获取预订
    try {
        const bookingSystemStr = localStorage.getItem('bookingSystem');
        if (bookingSystemStr) {
            const bookingSystem = JSON.parse(bookingSystemStr);
            
            if (bookingSystem && Array.isArray(bookingSystem.bookings)) {
                bookingSystem.bookings.forEach(booking => {
                    if (booking && booking.id && !bookingIds.has(booking.id)) {
                        bookingIds.add(booking.id);
                        allBookings.push(booking);
                    }
                });
            }
        }
        console.log('Retrieved additional bookings from bookingSystem:', bookingIds.size);
    } catch (e) {
        console.error('Error retrieving bookings from bookingSystem:', e);
    }
    
    // 从individual booking entries获取预订
    try {
        // 获取所有localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('booking_')) {
                try {
                    const booking = JSON.parse(localStorage.getItem(key));
                    if (booking && booking.id && !bookingIds.has(booking.id)) {
                        bookingIds.add(booking.id);
                        allBookings.push(booking);
                    }
                } catch (innerErr) {
                    console.error('Error parsing individual booking:', innerErr);
                }
            }
        }
        console.log('Retrieved additional bookings from individual entries:', bookingIds.size);
    } catch (e) {
        console.error('Error retrieving individual bookings:', e);
    }
    
    // 将所有预订转换为管理员格式并保存
    try {
        // 先检查现有的bookings数组
        const bookingsStr = localStorage.getItem('bookings');
        let existingBookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        
        // 确保是数组
        if (!Array.isArray(existingBookings)) {
            existingBookings = [];
        }
        
        // 提取现有预订ID
        const existingIds = new Set(existingBookings.map(b => b.id));
        
        // 将新的预订转换为admin格式并添加
        const adminBookings = allBookings.map(booking => {
            // 跳过已存在的预订
            if (existingIds.has(booking.id)) {
                return null;
            }
            
            // 转换为admin格式
            return {
                ...booking,
                timestamp: booking.createdAt || new Date().toISOString(),
                customerName: booking.userName || 'N/A',
                customerEmail: booking.userEmail || 'N/A',
                fromLocation: booking.pickupLocation || 'N/A',
                toLocation: booking.destinationLocation || 'N/A',
                totalFare: booking.totalPrice || 0,
                depositAmount: (booking.totalPrice * 0.3) || 0,
                userId: booking.userEmail || 'guest',
                vehicleType: 'Standard',
                status: booking.status || 'confirmed'
            };
        }).filter(Boolean); // 移除null项
        
        // 合并现有和新的预订
        const mergedBookings = [...existingBookings, ...adminBookings];
        
        // 保存到localStorage
        localStorage.setItem('bookings', JSON.stringify(mergedBookings));
        console.log('Synchronized bookings for admin panel. Total bookings:', mergedBookings.length);
        
        // 更新仪表盘上的预订计数（如果在同一页面）
        const totalBookingsElement = document.getElementById('totalBookings');
        if (totalBookingsElement) {
            totalBookingsElement.textContent = mergedBookings.length.toString();
        }
    } catch (e) {
        console.error('Error synchronizing bookings:', e);
    }
}