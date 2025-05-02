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
    
    // Initialize My Bookings button
    const myBookingsBtn = document.getElementById('myBookingsBtn');
    if (myBookingsBtn) {
        myBookingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showMyBookingsSection();
        });
        console.log('My Bookings button initialized');
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
    
    // Show customer information form
    showCustomerInfoForm();
}

// Show customer information form
function showCustomerInfoForm() {
    console.log('Showing customer information form');
    
    // Get the quote container
    const quoteContainer = document.getElementById('quoteContainer');
    if (!quoteContainer) {
        console.error('Quote container not found');
        return;
    }
    
    // Check if the form already exists
    if (document.getElementById('customerInfoForm')) {
        document.getElementById('customerInfoForm').style.display = 'block';
        return;
    }
    
    // Create the customer information form
    const customerInfoForm = document.createElement('div');
    customerInfoForm.id = 'customerInfoForm';
    customerInfoForm.className = 'customer-info-form';
    
    // Add styles if needed
    if (!document.getElementById('customer-form-styles')) {
        const style = document.createElement('style');
        style.id = 'customer-form-styles';
        style.textContent = `
            .customer-info-form {
                margin-top: 20px;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
                border: 1px solid #ddd;
            }
            
            .customer-info-form h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #333;
            }
            
            .form-row {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-row .form-group {
                flex: 1;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            .form-group input, .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .form-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            
            .required-field::after {
                content: "*";
                color: #e74c3c;
                margin-left: 3px;
            }
            
            .form-note {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set the form HTML
    customerInfoForm.innerHTML = `
        <h3>Your Information</h3>
        <p class="form-note">Please provide your details to complete the booking. Fields marked with * are required.</p>
        
        <div class="form-row">
            <div class="form-group">
                <label for="customerName" class="required-field">Full Name</label>
                <input type="text" id="customerName" required placeholder="Your full name">
            </div>
            
            <div class="form-group">
                <label for="customerEmail" class="required-field">Email</label>
                <input type="email" id="customerEmail" required placeholder="Your email address">
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="customerPhone" class="required-field">Phone Number</label>
                <input type="tel" id="customerPhone" required placeholder="Your phone number">
            </div>
            
            <div class="form-group">
                <label for="customerNationality">Nationality</label>
                <input type="text" id="customerNationality" placeholder="Your nationality (optional)">
            </div>
        </div>
        
        <div class="form-group">
            <label for="specialRequirements">Special Requirements</label>
            <textarea id="specialRequirements" rows="3" placeholder="Any special requirements or notes for your journey (optional)"></textarea>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn secondary" id="cancelBookingBtn">Cancel</button>
            <button type="button" class="btn primary" id="confirmBookingBtn">Confirm Booking</button>
        </div>
    `;
    
    // Append the form to the quote container
    quoteContainer.appendChild(customerInfoForm);
    
    // Add event listeners to the buttons
    const cancelBookingBtn = document.getElementById('cancelBookingBtn');
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    
    if (cancelBookingBtn) {
        cancelBookingBtn.addEventListener('click', function() {
            document.getElementById('customerInfoForm').style.display = 'none';
        });
    }
    
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', function() {
            submitBooking();
        });
    }
}

// Submit booking with customer information
function submitBooking() {
    console.log('Submitting booking');
    
    // Validate form
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');
    
    if (!customerName || !customerName.value.trim()) {
        showMessage('Please enter your full name', 'error');
        return;
    }
    
    if (!customerEmail || !customerEmail.value.trim() || !isValidEmail(customerEmail.value)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!customerPhone || !customerPhone.value.trim()) {
        showMessage('Please enter your phone number', 'error');
        return;
    }
    
    // Save booking data with customer information
    saveBookingData();
    
    // Hide customer form
    const customerInfoForm = document.getElementById('customerInfoForm');
    if (customerInfoForm) {
        customerInfoForm.style.display = 'none';
    }
    
    // Show success message with redirect option to view bookings
    const successHtml = `
        <div class="booking-success">
            <h3><i class="fas fa-check-circle"></i> Booking Successful!</h3>
            <p>Thank you for your booking! We have sent a confirmation email to ${customerEmail.value}.</p>
            <p>A 30% deposit is required to confirm your booking. Our team will contact you shortly with payment instructions.</p>
            <div class="booking-actions">
                <button id="viewBookingsBtn" class="btn secondary">View My Bookings</button>
                <button id="backToHomeBtn" class="btn primary">Back to Home</button>
            </div>
        </div>
    `;
    
    // Create success container if not exists
    let successContainer = document.getElementById('bookingSuccessContainer');
    if (!successContainer) {
        successContainer = document.createElement('div');
        successContainer.id = 'bookingSuccessContainer';
        successContainer.className = 'booking-success-container';
        
        // Add styles
        if (!document.getElementById('booking-success-styles')) {
            const style = document.createElement('style');
            style.id = 'booking-success-styles';
            style.textContent = `
                .booking-success-container {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #d4edda;
                    border-radius: 8px;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    text-align: center;
                }
                
                .booking-success h3 {
                    color: #155724;
                    margin-top: 0;
                }
                
                .booking-success i {
                    font-size: 32px;
                    margin-bottom: 10px;
                    color: #28a745;
                }
                
                .booking-actions {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Find where to insert the success message
        const quoteContainer = document.getElementById('quoteContainer');
        if (quoteContainer) {
            quoteContainer.parentNode.insertBefore(successContainer, quoteContainer.nextSibling);
        } else {
            const bookingForm = document.querySelector('.booking-form');
            if (bookingForm) {
                bookingForm.appendChild(successContainer);
            }
        }
    }
    
    // Set success content
    successContainer.innerHTML = successHtml;
    successContainer.style.display = 'block';
    
    // Add event listeners to success buttons
    const viewBookingsBtn = document.getElementById('viewBookingsBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', function() {
            showMyBookings();
        });
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
}

// Save booking data to localStorage
function saveBookingData() {
    // Get quote information
    const distanceElement = document.getElementById('quotedDistance');
    const vehicleTypeElement = document.getElementById('quotedVehicle');
    const fareElement = document.getElementById('quotedFare');
    const depositElement = document.getElementById('quotedDeposit');
    
    // Get form inputs
    const serviceType = document.getElementById('serviceType')?.value || '';
    const journeyDate = document.getElementById('journeyDate')?.value || '';
    const journeyTime = document.getElementById('journeyTime')?.value || '';
    const passengerCount = document.getElementById('passengerCount')?.value || '';
    const pickupLocation = document.getElementById('pickupLocation')?.value || '';
    const destination = document.getElementById('destinationLocation')?.value || '';
    const specialRequirements = document.getElementById('specialRequirements')?.value || '';
    const vehicleType = getSelectedVehicleType();
    
    // Get customer information
    const customerName = document.getElementById('customerName')?.value || '';
    const customerEmail = document.getElementById('customerEmail')?.value || '';
    const customerPhone = document.getElementById('customerPhone')?.value || '';
    const customerNationality = document.getElementById('customerNationality')?.value || '';
    
    // Extract distance and fare values
    const distanceText = distanceElement ? distanceElement.textContent : '';
    const distance = distanceText ? parseFloat(distanceText.replace(/[^0-9.]/g, '')) : 0;
    
    const fareText = fareElement ? fareElement.textContent : '';
    const totalFare = fareText ? parseFloat(fareText.replace(/[^0-9.]/g, '')) : 0;
    
    const depositText = depositElement ? depositElement.textContent : '';
    const depositAmount = depositText ? parseFloat(depositText.replace(/[^0-9.]/g, '')) : 0;
    
    // Create the booking data object
    const bookingData = {
        id: 'ORD-' + Date.now(), // Unique ID based on timestamp
        serviceType: serviceType,
        journeyDate: journeyDate,
        journeyTime: journeyTime,
        passengerCount: passengerCount,
        pickupLocation: pickupLocation,
        destination: destination,
        specialRequirements: specialRequirements,
        vehicleType: vehicleType,
        distance: distance,
        totalFare: totalFare,
        depositAmount: depositAmount,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerNationality: customerNationality,
        status: 'pending', // Initial status
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    try {
        // Get existing bookings or create new array
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log('Booking saved to localStorage:', bookingData);
        
        // Also store in user bookings (filtered by email)
        let userBookings = JSON.parse(localStorage.getItem('userBookings')) || {};
        if (customerEmail) {
            if (!userBookings[customerEmail]) {
                userBookings[customerEmail] = [];
            }
            userBookings[customerEmail].push(bookingData);
            localStorage.setItem('userBookings', JSON.stringify(userBookings));
        }
    } catch (error) {
        console.error('Error saving booking to localStorage:', error);
    }
}

// Helper function to validate email format
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Show user's bookings
function showMyBookings() {
    console.log('Showing user bookings');
    
    // Create booking history container if not exists
    let bookingHistoryContainer = document.getElementById('bookingHistoryContainer');
    if (!bookingHistoryContainer) {
        bookingHistoryContainer = document.createElement('div');
        bookingHistoryContainer.id = 'bookingHistoryContainer';
        bookingHistoryContainer.className = 'booking-history-container';
        
        // Add styles
        if (!document.getElementById('booking-history-styles')) {
            const style = document.createElement('style');
            style.id = 'booking-history-styles';
            style.textContent = `
                .booking-history-container {
                    margin: 30px 0;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .booking-history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .booking-history-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #999;
                }
                
                .booking-history-close:hover {
                    color: #333;
                }
                
                .booking-card {
                    margin-bottom: 15px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                
                .booking-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .booking-id {
                    font-weight: bold;
                    color: #333;
                }
                
                .booking-status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .booking-status.pending {
                    background-color: #ffeeba;
                    color: #856404;
                }
                
                .booking-status.confirmed {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }
                
                .booking-status.completed {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .booking-status.cancelled {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .booking-details {
                    margin-bottom: 10px;
                }
                
                .booking-detail {
                    display: flex;
                    margin-bottom: 5px;
                }
                
                .booking-detail strong {
                    width: 120px;
                    color: #555;
                }
                
                .booking-actions {
                    text-align: right;
                    margin-top: 10px;
                }
                
                .booking-actions button {
                    padding: 5px 10px;
                    margin-left: 5px;
                    background-color: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .booking-actions button:hover {
                    background-color: #e9ecef;
                }
                
                .no-bookings {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Append to the main container
        const mainContainer = document.querySelector('.container');
        if (mainContainer) {
            mainContainer.appendChild(bookingHistoryContainer);
        } else {
            document.body.appendChild(bookingHistoryContainer);
        }
    }
    
    // Create content
    let bookingHistoryHTML = `
        <div class="booking-history-header">
            <h2>My Bookings</h2>
            <button class="booking-history-close" id="closeBookingHistoryBtn">&times;</button>
        </div>
    `;
    
    // Get user email from the form
    const userEmail = document.getElementById('customerEmail')?.value;
    
    // Try to get user's bookings
    let userBookings = [];
    
    try {
        // First try to get from userBookings storage using email
        const allUserBookings = JSON.parse(localStorage.getItem('userBookings')) || {};
        if (userEmail && allUserBookings[userEmail]) {
            userBookings = allUserBookings[userEmail];
        } else {
            // If not found or no email, search through all bookings for matching email
            const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
            if (userEmail) {
                userBookings = allBookings.filter(booking => booking.customerEmail === userEmail);
            }
        }
    } catch (error) {
        console.error('Error loading user bookings:', error);
    }
    
    // Check if user has any bookings
    if (userBookings.length === 0) {
        bookingHistoryHTML += `
            <div class="no-bookings">
                <i class="fas fa-calendar-times"></i>
                <p>You don't have any bookings yet.</p>
            </div>
        `;
    } else {
        // Sort bookings by date (newest first)
        userBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Add each booking card
        userBookings.forEach(booking => {
            const bookingDate = new Date(booking.timestamp).toLocaleDateString();
            const journeyDate = booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString() : 'N/A';
            
            bookingHistoryHTML += `
                <div class="booking-card">
                    <div class="booking-header">
                        <span class="booking-id">${booking.id}</span>
                        <span class="booking-status ${booking.status || 'pending'}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
                    </div>
                    
                    <div class="booking-details">
                        <div class="booking-detail">
                            <strong>Booking Date:</strong>
                            <span>${bookingDate}</span>
                        </div>
                        <div class="booking-detail">
                            <strong>Journey Date:</strong>
                            <span>${journeyDate} ${booking.journeyTime || ''}</span>
                        </div>
                        <div class="booking-detail">
                            <strong>From:</strong>
                            <span>${booking.pickupLocation || 'N/A'}</span>
                        </div>
                        <div class="booking-detail">
                            <strong>To:</strong>
                            <span>${booking.destination || 'N/A'}</span>
                        </div>
                        <div class="booking-detail">
                            <strong>Vehicle Type:</strong>
                            <span>${booking.vehicleType ? booking.vehicleType.charAt(0).toUpperCase() + booking.vehicleType.slice(1) : 'N/A'}</span>
                        </div>
                        <div class="booking-detail">
                            <strong>Total Fare:</strong>
                            <span>$${booking.totalFare ? parseFloat(booking.totalFare).toFixed(2) : 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="booking-actions">
                        <button class="view-details-btn" data-id="${booking.id}">View Details</button>
                        ${booking.status === 'pending' ? `<button class="cancel-booking-btn" data-id="${booking.id}">Cancel Booking</button>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    // Set the HTML content
    bookingHistoryContainer.innerHTML = bookingHistoryHTML;
    bookingHistoryContainer.style.display = 'block';
    
    // Scroll to the booking history container
    bookingHistoryContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add event listeners
    const closeBtn = document.getElementById('closeBookingHistoryBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            bookingHistoryContainer.style.display = 'none';
        });
    }
    
    // Add event listeners to detail buttons
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            viewBookingDetails(bookingId);
        });
    });
    
    // Add event listeners to cancel buttons
    const cancelBtns = document.querySelectorAll('.cancel-booking-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            cancelBooking(bookingId);
        });
    });
}

// View booking details
function viewBookingDetails(bookingId) {
    console.log('Viewing booking details:', bookingId);
    
    // Get all bookings
    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    } catch (error) {
        console.error('Error loading bookings:', error);
        return;
    }
    
    // Find the specific booking
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        alert('Booking not found.');
        return;
    }
    
    // Create modal if not exists
    let bookingDetailsModal = document.getElementById('bookingDetailsModal');
    if (!bookingDetailsModal) {
        bookingDetailsModal = document.createElement('div');
        bookingDetailsModal.id = 'bookingDetailsModal';
        bookingDetailsModal.className = 'booking-details-modal';
        
        // Add styles
        if (!document.getElementById('booking-details-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'booking-details-modal-styles';
            style.textContent = `
                .booking-details-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    overflow-y: auto;
                }
                
                .booking-details-content {
                    position: relative;
                    background-color: #fff;
                    margin: 50px auto;
                    padding: 20px;
                    width: 90%;
                    max-width: 600px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .booking-details-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #aaa;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                }
                
                .booking-details-close:hover {
                    color: #333;
                }
                
                .booking-details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                
                .booking-details-status {
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                }
                
                .booking-info-section {
                    margin-bottom: 20px;
                }
                
                .booking-info-section h4 {
                    color: #333;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                
                .detail-row {
                    display: flex;
                    margin-bottom: 8px;
                }
                
                .detail-row strong {
                    width: 150px;
                    color: #555;
                }
                
                .booking-details-actions {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(bookingDetailsModal);
    }
    
    // Format dates
    const bookingDate = booking.timestamp ? new Date(booking.timestamp).toLocaleString() : 'N/A';
    const journeyDate = booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString() : 'N/A';
    
    // Create content
    const modalContent = `
        <div class="booking-details-content">
            <button class="booking-details-close" id="closeBookingDetailsBtn">&times;</button>
            
            <div class="booking-details-header">
                <h3>Booking Details</h3>
                <span class="booking-details-status booking-status ${booking.status || 'pending'}">
                    ${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                </span>
            </div>
            
            <div class="booking-info-section">
                <h4>Booking Information</h4>
                <div class="detail-row">
                    <strong>Booking ID:</strong>
                    <span>${booking.id}</span>
                </div>
                <div class="detail-row">
                    <strong>Booking Date:</strong>
                    <span>${bookingDate}</span>
                </div>
                <div class="detail-row">
                    <strong>Journey Date:</strong>
                    <span>${journeyDate} ${booking.journeyTime || ''}</span>
                </div>
                <div class="detail-row">
                    <strong>Service Type:</strong>
                    <span>${booking.serviceType || 'Transport'}</span>
                </div>
                <div class="detail-row">
                    <strong>Vehicle Type:</strong>
                    <span>${booking.vehicleType ? booking.vehicleType.charAt(0).toUpperCase() + booking.vehicleType.slice(1) : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Passengers:</strong>
                    <span>${booking.passengerCount || 'N/A'}</span>
                </div>
            </div>
            
            <div class="booking-info-section">
                <h4>Journey Details</h4>
                <div class="detail-row">
                    <strong>From:</strong>
                    <span>${booking.pickupLocation || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>To:</strong>
                    <span>${booking.destination || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Distance:</strong>
                    <span>${booking.distance ? booking.distance.toFixed(1) + ' km' : 'N/A'}</span>
                </div>
            </div>
            
            <div class="booking-info-section">
                <h4>Payment Information</h4>
                <div class="detail-row">
                    <strong>Total Fare:</strong>
                    <span>$${booking.totalFare ? parseFloat(booking.totalFare).toFixed(2) : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Deposit Amount:</strong>
                    <span>$${booking.depositAmount ? parseFloat(booking.depositAmount).toFixed(2) : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Payment Status:</strong>
                    <span>${booking.paymentStatus || 'Pending'}</span>
                </div>
            </div>
            
            ${booking.specialRequirements ? `
            <div class="booking-info-section">
                <h4>Special Requirements</h4>
                <p>${booking.specialRequirements}</p>
            </div>
            ` : ''}
            
            <div class="booking-details-actions">
                <button class="btn secondary" id="closeDetailsBtn">Close</button>
                ${booking.status === 'pending' ? `<button class="btn danger" id="cancelFromDetailsBtn">Cancel Booking</button>` : ''}
            </div>
        </div>
    `;
    
    // Set content and show modal
    bookingDetailsModal.innerHTML = modalContent;
    bookingDetailsModal.style.display = 'flex';
    
    // Add event listeners
    const closeBtn = document.getElementById('closeBookingDetailsBtn');
    const closeBtnFooter = document.getElementById('closeDetailsBtn');
    const cancelFromDetailsBtn = document.getElementById('cancelFromDetailsBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            bookingDetailsModal.style.display = 'none';
        });
    }
    
    if (closeBtnFooter) {
        closeBtnFooter.addEventListener('click', function() {
            bookingDetailsModal.style.display = 'none';
        });
    }
    
    if (cancelFromDetailsBtn) {
        cancelFromDetailsBtn.addEventListener('click', function() {
            cancelBooking(bookingId);
            bookingDetailsModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    bookingDetailsModal.addEventListener('click', function(event) {
        if (event.target === bookingDetailsModal) {
            bookingDetailsModal.style.display = 'none';
        }
    });
}

// Cancel booking
function cancelBooking(bookingId) {
    console.log('Cancelling booking:', bookingId);
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    // Get all bookings
    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    } catch (error) {
        console.error('Error loading bookings:', error);
        return;
    }
    
    // Find and update the specific booking
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
        alert('Booking not found.');
        return;
    }
    
    // Update status
    bookings[bookingIndex].status = 'cancelled';
    bookings[bookingIndex].lastUpdated = new Date().toISOString();
    
    // Save updated bookings
    try {
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Also update userBookings
        const userEmail = bookings[bookingIndex].customerEmail;
        if (userEmail) {
            let userBookings = JSON.parse(localStorage.getItem('userBookings')) || {};
            if (userBookings[userEmail]) {
                const userBookingIndex = userBookings[userEmail].findIndex(b => b.id === bookingId);
                if (userBookingIndex !== -1) {
                    userBookings[userEmail][userBookingIndex].status = 'cancelled';
                    userBookings[userEmail][userBookingIndex].lastUpdated = new Date().toISOString();
                    localStorage.setItem('userBookings', JSON.stringify(userBookings));
                }
            }
        }
        
        // Show success message
        showMessage('Booking cancelled successfully.', 'success');
        
        // Refresh bookings view if open
        if (document.getElementById('bookingHistoryContainer') && document.getElementById('bookingHistoryContainer').style.display !== 'none') {
            showMyBookings();
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Failed to cancel booking. Please try again.');
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

// Show My Bookings section
function showMyBookingsSection() {
    console.log('Showing My Bookings section');
    
    // Hide any other sections that might be visible
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'myBookingsSection') {
            section.style.display = '';
        }
    });
    
    // Show My Bookings section
    const myBookingsSection = document.getElementById('myBookingsSection');
    if (myBookingsSection) {
        myBookingsSection.style.display = 'block';
        
        // Scroll to the section
        myBookingsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add event listener to search button if it doesn't already have one
        const searchBookingsBtn = document.getElementById('searchBookingsBtn');
        if (searchBookingsBtn && !searchBookingsBtn.hasAttribute('data-listener')) {
            searchBookingsBtn.setAttribute('data-listener', 'true');
            searchBookingsBtn.addEventListener('click', searchBookings);
        }
        
        // Show bookings if email is already in the input
        const bookingSearchEmail = document.getElementById('bookingSearchEmail');
        if (bookingSearchEmail && bookingSearchEmail.value.trim()) {
            searchBookings();
        }
    } else {
        console.error('My Bookings section not found');
    }
}

// Search for bookings by email
function searchBookings() {
    const bookingSearchEmail = document.getElementById('bookingSearchEmail');
    if (!bookingSearchEmail) {
        console.error('Booking search email input not found');
        return;
    }
    
    const email = bookingSearchEmail.value.trim();
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Get user's bookings
    let userBookings = [];
    try {
        // First try to get from userBookings storage using email
        const allUserBookings = JSON.parse(localStorage.getItem('userBookings')) || {};
        if (allUserBookings[email]) {
            userBookings = allUserBookings[email];
        } else {
            // If not found, search through all bookings for matching email
            const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
            userBookings = allBookings.filter(booking => booking.customerEmail === email);
        }
    } catch (error) {
        console.error('Error loading user bookings:', error);
    }
    
    displayUserBookings(userBookings);
}

// Display user bookings in the bookings section
function displayUserBookings(bookings) {
    const bookingsListContainer = document.getElementById('bookingsListContainer');
    if (!bookingsListContainer) {
        console.error('Bookings list container not found');
        return;
    }
    
    // Clear existing content
    bookingsListContainer.innerHTML = '';
    
    // Add styles if not already added
    if (!document.getElementById('bookings-list-styles')) {
        const style = document.createElement('style');
        style.id = 'bookings-list-styles';
        style.textContent = `
            .bookings-list {
                margin-top: 20px;
            }
            
            .no-bookings {
                text-align: center;
                padding: 30px;
                background-color: #f8f9fa;
                border-radius: 8px;
                color: #6c757d;
                margin-top: 20px;
            }
            
            .booking-card {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .booking-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
                margin-bottom: 15px;
            }
            
            .booking-id {
                font-weight: bold;
                color: #333;
            }
            
            .booking-status {
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .booking-status.pending {
                background-color: #ffeeba;
                color: #856404;
            }
            
            .booking-status.confirmed {
                background-color: #d1ecf1;
                color: #0c5460;
            }
            
            .booking-status.completed {
                background-color: #d4edda;
                color: #155724;
            }
            
            .booking-status.cancelled {
                background-color: #f8d7da;
                color: #721c24;
            }
            
            .booking-info {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .booking-info-item {
                margin-bottom: 10px;
            }
            
            .booking-info-item label {
                display: block;
                font-size: 12px;
                color: #6c757d;
                margin-bottom: 5px;
            }
            
            .booking-info-item span {
                font-weight: 500;
                color: #343a40;
            }
            
            .booking-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            
            .booking-actions button {
                padding: 8px 15px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .booking-actions button:hover {
                background-color: #e9ecef;
            }
            
            .booking-actions .view-details-btn {
                background-color: #007bff;
                color: white;
                border-color: #007bff;
            }
            
            .booking-actions .view-details-btn:hover {
                background-color: #0069d9;
            }
            
            .booking-actions .cancel-btn {
                background-color: #dc3545;
                color: white;
                border-color: #dc3545;
            }
            
            .booking-actions .cancel-btn:hover {
                background-color: #c82333;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Check if there are any bookings
    if (!bookings || bookings.length === 0) {
        bookingsListContainer.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-calendar-times"></i>
                <p>No bookings found for this email address.</p>
            </div>
        `;
        return;
    }
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create bookings list container
    const bookingsList = document.createElement('div');
    bookingsList.className = 'bookings-list';
    
    // Add each booking
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
        
        // Format dates
        const bookingDate = booking.timestamp ? new Date(booking.timestamp).toLocaleDateString() : 'N/A';
        const journeyDate = booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString() : 'N/A';
        
        // Create booking card HTML
        bookingCard.innerHTML = `
            <div class="booking-header">
                <span class="booking-id">${booking.id || 'Unknown'}</span>
                <span class="booking-status ${booking.status || 'pending'}">${(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}</span>
            </div>
            
            <div class="booking-info">
                <div class="booking-info-item">
                    <label>Booking Date</label>
                    <span>${bookingDate}</span>
                </div>
                <div class="booking-info-item">
                    <label>Journey Date</label>
                    <span>${journeyDate} ${booking.journeyTime || ''}</span>
                </div>
                <div class="booking-info-item">
                    <label>From</label>
                    <span>${booking.pickupLocation || 'N/A'}</span>
                </div>
                <div class="booking-info-item">
                    <label>To</label>
                    <span>${booking.destination || 'N/A'}</span>
                </div>
                <div class="booking-info-item">
                    <label>Vehicle Type</label>
                    <span>${booking.vehicleType ? booking.vehicleType.charAt(0).toUpperCase() + booking.vehicleType.slice(1) : 'N/A'}</span>
                </div>
                <div class="booking-info-item">
                    <label>Total Fare</label>
                    <span>$${booking.totalFare ? parseFloat(booking.totalFare).toFixed(2) : 'N/A'}</span>
                </div>
            </div>
            
            <div class="booking-actions">
                <button class="view-details-btn" data-id="${booking.id || ''}">View Details</button>
                ${booking.status === 'pending' ? 
                    `<button class="cancel-btn" data-id="${booking.id || ''}">Cancel Booking</button>` : ''}
            </div>
        `;
        
        bookingsList.appendChild(bookingCard);
    });
    
    // Add to container
    bookingsListContainer.appendChild(bookingsList);
    
    // Add event listeners to buttons
    const viewDetailsBtns = bookingsListContainer.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            if (bookingId) {
                viewBookingDetails(bookingId);
            }
        });
    });
    
    const cancelBtns = bookingsListContainer.querySelectorAll('.cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            if (bookingId) {
                cancelBooking(bookingId);
            }
        });
    });
}