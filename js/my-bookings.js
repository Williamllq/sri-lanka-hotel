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
                myBookingsNavItem.style.display = 'inline-block';
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
    
    // Get bookings from localStorage
    const bookingsStr = localStorage.getItem('userBookings');
    const allBookings = bookingsStr ? JSON.parse(bookingsStr) : {};
    
    // Get this user's bookings
    const userBookings = allBookings[user.email] || [];
    
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
    userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add each booking to the list
    userBookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        
        const statusClass = 
            booking.status === 'confirmed' ? 'status-confirmed' :
            booking.status === 'pending' ? 'status-pending' :
            'status-cancelled';
        
        bookingItem.innerHTML = `
            <div class="booking-header">
                <div class="booking-id">Booking #${booking.id}</div>
                <div class="booking-status ${statusClass}">${capitalizeFirstLetter(booking.status)}</div>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <span class="detail-label">Service</span>
                    <span class="detail-value">${booking.serviceType}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${formatDate(booking.date)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">From</span>
                    <span class="detail-value">${booking.pickupLocation}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">To</span>
                    <span class="detail-value">${booking.destinationLocation}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Total</span>
                    <span class="detail-value">$${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">Booked On</span>
                    <span class="detail-value">${formatDate(booking.createdAt)}</span>
                </div>
            </div>
            ${booking.status !== 'cancelled' ? `
            <div class="booking-actions">
                <button class="booking-btn cancel-btn" data-booking-id="${booking.id}">Cancel Booking</button>
                <button class="booking-btn modify-btn" data-booking-id="${booking.id}">Modify Booking</button>
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
    
    // Get all bookings
    const bookingsStr = localStorage.getItem('userBookings');
    const allBookings = bookingsStr ? JSON.parse(bookingsStr) : {};
    
    // Get this user's bookings
    const userBookings = allBookings[userEmail] || [];
    
    // Find and update the booking
    const bookingIndex = userBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        userBookings[bookingIndex].status = 'cancelled';
        
        // Save back to localStorage
        allBookings[userEmail] = userBookings;
        localStorage.setItem('userBookings', JSON.stringify(allBookings));
        
        // Reload the bookings display
        loadUserBookings({email: userEmail});
        
        alert('Booking has been cancelled');
    }
}

/**
 * Helper function to format date strings
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Make functions available globally
window.showMyBookings = showMyBookings; 