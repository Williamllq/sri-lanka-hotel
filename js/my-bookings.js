/**
 * My Bookings functionality
 * Handles displaying and managing user bookings
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize My Bookings button click event
    const myBookingsNavBtn = document.getElementById('navMyBookingsBtn');
    if (myBookingsNavBtn) {
        myBookingsNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showMyBookings();
        });
    }

    // Listen for authentication changes
    window.addEventListener('userAuthChanged', function(event) {
        const myBookingsNavItem = document.getElementById('myBookingsNavItem');
        if (myBookingsNavItem) {
            if (event.detail.isLoggedIn) {
                myBookingsNavItem.style.display = 'inline-flex';
            } else {
                myBookingsNavItem.style.display = 'none';
                // Hide bookings section if visible
                const bookingsSection = document.getElementById('myBookingsSection');
                if (bookingsSection && bookingsSection.style.display === 'block') {
                    bookingsSection.style.display = 'none';
                }
            }
        }
    });
    
    // Check immediately on page load if user is logged in
    if (typeof UserAuth !== 'undefined' && UserAuth.isLoggedIn()) {
        const myBookingsNavItem = document.getElementById('myBookingsNavItem');
        if (myBookingsNavItem) {
            myBookingsNavItem.style.display = 'inline-flex';
        }
    }
});

/**
 * Show the user's bookings in a modal or section
 */
function showMyBookings() {
    console.log('Showing My Bookings');
    
    // Check if user is logged in
    const currentUser = UserAuth.getCurrentUser();
    if (!currentUser) {
        UserAuth.showLoginModal();
        return;
    }
    
    // Get or create My Bookings section
    let bookingsSection = document.getElementById('myBookingsSection');
    
    if (!bookingsSection) {
        // Create the section if it doesn't exist
        bookingsSection = document.createElement('div');
        bookingsSection.id = 'myBookingsSection';
        bookingsSection.className = 'my-bookings-section';
        
        // Add basic structure
        bookingsSection.innerHTML = `
            <div class="bookings-container">
                <div class="bookings-header">
                    <h2><i class="fas fa-receipt"></i> My Bookings</h2>
                    <button class="close-bookings-btn">&times;</button>
                </div>
                <div class="bookings-content">
                    <div id="bookingsList" class="bookings-list">
                        <!-- Bookings will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(bookingsSection);
        
        // Add event listener to close button
        const closeBtn = bookingsSection.querySelector('.close-bookings-btn');
        closeBtn.addEventListener('click', function() {
            bookingsSection.style.display = 'none';
        });
        
        // Add styles if not already present
        if (!document.getElementById('myBookingsStyles')) {
            const style = document.createElement('style');
            style.id = 'myBookingsStyles';
            style.textContent = `
                .my-bookings-section {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }
                
                .bookings-container {
                    background-color: white;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .bookings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #ddd;
                }
                
                .bookings-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #333;
                }
                
                .close-bookings-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #999;
                    cursor: pointer;
                }
                
                .close-bookings-btn:hover {
                    color: #333;
                }
                
                .bookings-content {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: calc(90vh - 70px);
                }
                
                .bookings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .booking-item {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #fff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                
                .booking-header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                
                .booking-id {
                    font-weight: bold;
                    color: #4a6fa5;
                }
                
                .booking-status {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .status-confirmed {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .status-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                
                .status-cancelled {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .booking-details {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .booking-detail {
                    display: flex;
                    flex-direction: column;
                }
                
                .detail-label {
                    font-size: 0.8rem;
                    color: #666;
                }
                
                .detail-value {
                    font-weight: 500;
                }
                
                .booking-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                }
                
                .booking-btn {
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    border: none;
                }
                
                .cancel-btn {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                .modify-btn {
                    background-color: #e2e3e5;
                    color: #383d41;
                }
                
                .empty-bookings {
                    text-align: center;
                    padding: 30px;
                    color: #666;
                }
                
                @media (max-width: 768px) {
                    .booking-details {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Load and display bookings
    loadUserBookings(currentUser);
    
    // Show the bookings section
    bookingsSection.style.display = 'flex';
}

/**
 * Load user bookings from storage and display them
 */
function loadUserBookings(user) {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    console.log('Loading bookings for user:', user.email);
    
    // Check multiple localStorage keys where bookings might be stored
    const possibleKeys = ['userBookings', 'bookings', 'transportBookings', 'journeyBookings'];
    let allBookings = {};
    let userBookings = [];
    
    // Debug: Log all localStorage keys
    console.log('All localStorage keys:');
    for (let i = 0; i < localStorage.length; i++) {
        console.log(`- ${localStorage.key(i)}`);
    }
    
    // Try all possible keys
    for (const key of possibleKeys) {
        const bookingsStr = localStorage.getItem(key);
        if (bookingsStr) {
            console.log(`Found data in localStorage key: ${key}`);
            try {
                const parsedData = JSON.parse(bookingsStr);
                
                // Check if data is an object with user emails as keys
                if (parsedData && typeof parsedData === 'object') {
                    if (parsedData[user.email]) {
                        console.log(`Found ${parsedData[user.email].length} bookings for user ${user.email} in key ${key}`);
                        userBookings = userBookings.concat(parsedData[user.email]);
                    } else if (Array.isArray(parsedData)) {
                        // If it's an array, filter bookings by user email
                        const userEmailBookings = parsedData.filter(booking => 
                            booking.userEmail === user.email || 
                            booking.email === user.email || 
                            booking.user === user.email
                        );
                        console.log(`Found ${userEmailBookings.length} bookings in array for user ${user.email} in key ${key}`);
                        userBookings = userBookings.concat(userEmailBookings);
                    }
                }
            } catch (e) {
                console.error(`Error parsing data from key ${key}:`, e);
            }
        }
    }
    
    // Manually check for bookings in the main booking system
    try {
        const bookingSystemData = localStorage.getItem('bookingSystem');
        if (bookingSystemData) {
            console.log('Found bookingSystem data');
            const parsedData = JSON.parse(bookingSystemData);
            if (parsedData && parsedData.bookings) {
                const userEmailBookings = parsedData.bookings.filter(booking => 
                    booking.userEmail === user.email || 
                    booking.email === user.email || 
                    booking.user === user.email
                );
                console.log(`Found ${userEmailBookings.length} bookings in bookingSystem for user ${user.email}`);
                userBookings = userBookings.concat(userEmailBookings);
            }
        }
    } catch (e) {
        console.error('Error parsing bookingSystem data:', e);
    }
    
    // Look for any bookings with this user's data
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('booking') || key.includes('order') || key.includes('journey')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && (data.userEmail === user.email || data.email === user.email)) {
                    console.log(`Found individual booking in key ${key}`);
                    userBookings.push(data);
                }
            } catch (e) {
                // Skip if not valid JSON
            }
        }
    }
    
    console.log(`Total bookings found for user: ${userBookings.length}`);
    
    // If we're on a development server, create some sample bookings for testing
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.includes('netlify.app')) {
        
        if (userBookings.length === 0) {
            console.log('Creating sample booking for development testing');
            userBookings.push({
                id: 'sample-' + Date.now(),
                status: 'confirmed',
                serviceType: 'Airport Transfer',
                date: new Date().toISOString(),
                pickupLocation: 'Colombo Airport',
                destinationLocation: 'Kandy City',
                totalPrice: 78.50,
                createdAt: new Date().toISOString()
            });
        }
    }
    
    // Clear existing content
    bookingsList.innerHTML = '';
    
    if (userBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-bookings">
                <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                <h3>No Bookings Found</h3>
                <p>You haven't made any bookings yet.</p>
                <a href="#transport" class="btn" style="display: inline-block; margin-top: 15px;" onclick="document.getElementById('myBookingsSection').style.display='none';">Book Now</a>
            </div>
        `;
        return;
    }
    
    // Sort bookings by date, newest first
    userBookings.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    
    // Add each booking to the list
    userBookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        
        // Ensure booking has an ID
        const bookingId = booking.id || booking.bookingId || booking.orderId || ('booking-' + Date.now());
        
        const statusClass = 
            (booking.status === 'confirmed' || booking.status === 'Confirmed') ? 'status-confirmed' :
            (booking.status === 'pending' || booking.status === 'Pending') ? 'status-pending' :
            'status-cancelled';
        
        // Default status if not specified
        const status = booking.status || 'Confirmed';
        
        bookingItem.innerHTML = `
            <div class="booking-header">
                <div class="booking-id">Booking #${bookingId}</div>
                <div class="booking-status ${statusClass}">${capitalizeFirstLetter(status)}</div>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <span class="detail-label">Service</span>
                    <span class="detail-value">${booking.serviceType || booking.service || booking.type || 'Transport Service'}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${formatDate(booking.date || booking.journeyDate || booking.createdAt)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">From</span>
                    <span class="detail-value">${booking.pickupLocation || booking.from || booking.pickup || 'Not specified'}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">To</span>
                    <span class="detail-value">${booking.destinationLocation || booking.to || booking.destination || 'Not specified'}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">$${(booking.totalPrice || booking.price || booking.total || 0).toFixed(2)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Booked On</span>
                    <span class="detail-value">${formatDate(booking.createdAt || booking.date || new Date())}</span>
                </div>
            </div>
            ${(booking.status !== 'cancelled' && booking.status !== 'Cancelled') ? `
            <div class="booking-actions">
                <button class="booking-btn cancel-btn" data-booking-id="${bookingId}">Cancel Booking</button>
                <button class="booking-btn modify-btn" data-booking-id="${bookingId}">Modify Booking</button>
            </div>
            ` : ''}
        `;
        
        bookingsList.appendChild(bookingItem);
    });
    
    // Add event listeners to cancel and modify buttons
    const cancelButtons = bookingsList.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            cancelBooking(bookingId, user.email);
        });
    });
    
    const modifyButtons = bookingsList.querySelectorAll('.modify-btn');
    modifyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            alert('Modify booking functionality will be implemented soon.');
            // TODO: Implement modifyBooking function
        });
    });
}

/**
 * Cancel a booking
 */
function cancelBooking(bookingId, userEmail) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    console.log(`Attempting to cancel booking: ${bookingId} for user: ${userEmail}`);
    
    // Check multiple possible storage keys
    let cancelled = false;
    
    const possibleKeys = ['userBookings', 'bookings', 'transportBookings', 'journeyBookings'];
    
    for (const key of possibleKeys) {
        const bookingsStr = localStorage.getItem(key);
        if (bookingsStr) {
            try {
                const allBookings = JSON.parse(bookingsStr);
                
                if (allBookings[userEmail]) {
                    // Format: { userEmail: [bookings] }
                    const userBookings = allBookings[userEmail];
                    const bookingIndex = userBookings.findIndex(b => b.id === bookingId || b.bookingId === bookingId);
                    
                    if (bookingIndex !== -1) {
                        userBookings[bookingIndex].status = 'cancelled';
                        allBookings[userEmail] = userBookings;
                        localStorage.setItem(key, JSON.stringify(allBookings));
                        cancelled = true;
                        console.log(`Cancelled booking in ${key}`);
                    }
                } else if (Array.isArray(allBookings)) {
                    // Format: [bookings]
                    const bookingIndex = allBookings.findIndex(b => 
                        (b.id === bookingId || b.bookingId === bookingId) && 
                        (b.userEmail === userEmail || b.email === userEmail)
                    );
                    
                    if (bookingIndex !== -1) {
                        allBookings[bookingIndex].status = 'cancelled';
                        localStorage.setItem(key, JSON.stringify(allBookings));
                        cancelled = true;
                        console.log(`Cancelled booking in ${key} array`);
                    }
                }
            } catch (e) {
                console.error(`Error updating booking in ${key}:`, e);
            }
        }
    }
    
    // Check bookingSystem format
    try {
        const bookingSystemData = localStorage.getItem('bookingSystem');
        if (bookingSystemData) {
            const parsedData = JSON.parse(bookingSystemData);
            if (parsedData && parsedData.bookings && Array.isArray(parsedData.bookings)) {
                const bookingIndex = parsedData.bookings.findIndex(b => 
                    (b.id === bookingId || b.bookingId === bookingId) &&
                    (b.userEmail === userEmail || b.email === userEmail)
                );
                
                if (bookingIndex !== -1) {
                    parsedData.bookings[bookingIndex].status = 'cancelled';
                    localStorage.setItem('bookingSystem', JSON.stringify(parsedData));
                    cancelled = true;
                    console.log('Cancelled booking in bookingSystem');
                }
            }
        }
    } catch (e) {
        console.error('Error updating booking in bookingSystem:', e);
    }
    
    // Reload the bookings display
    if (cancelled) {
        loadUserBookings({email: userEmail});
        alert('Booking has been cancelled');
    } else {
        alert('Could not find the booking to cancel. Please try again later.');
    }
}

/**
 * Helper function to format date strings
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Date Error';
    }
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Make functions available globally
window.showMyBookings = showMyBookings; 