/**
 * Hotels functionality
 * Handles hotel search, filtering, and booking
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeHotels();
    setupDataListeners();
});

// Global variables
let allHotels = [];
let filteredHotels = [];

/**
 * Initialize hotels page
 */
function initializeHotels() {
    // Load hotels from localStorage or use default data
    loadHotels();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set default dates
    setDefaultDates();
    
    // Display hotels
    displayHotels();
}

/**
 * Setup data listeners for real-time sync
 */
function setupDataListeners() {
    // 监听酒店更新事件（来自数据同步服务）
    window.addEventListener('hotelsUpdate', (event) => {
        console.log('Hotels update event received');
        if (event.detail && event.detail.hotels) {
            // 更新酒店列表
            allHotels = event.detail.hotels;
            filteredHotels = [...allHotels];
            
            // 重新应用当前的过滤和排序
            filterHotels();
        }
    });
    
    // 监听存储变化（跨标签页）
    window.addEventListener('storage', (e) => {
        if (e.key === 'siteHotels') {
            console.log('Hotels storage updated, reloading...');
            loadHotels();
            displayHotels();
        }
    });
}

/**
 * Load hotels from localStorage or use default data
 */
function loadHotels() {
    const storedHotels = localStorage.getItem('siteHotels');
    
    if (storedHotels) {
        allHotels = JSON.parse(storedHotels);
        // 过滤只显示激活的酒店
        allHotels = allHotels.filter(hotel => hotel.isActive !== false);
    } else {
        // Default hotel data
        allHotels = [
            {
                id: 'h001',
                name: 'Cinnamon Grand Colombo',
                location: 'Colombo',
                description: 'Luxury 5-star hotel in the heart of Colombo with stunning city views',
                rating: 4.8,
                pricePerNight: 150,
                image: 'images/hotel/cmbmc-room-3686-hor-clsc.webp',
                amenities: ['wifi', 'pool', 'spa', 'restaurant', 'parking'],
                featured: true,
                isActive: true
            },
            {
                id: 'h002',
                name: 'Shangri-La Hambantota',
                location: 'Hambantota',
                description: 'Beachfront resort with golf course and water sports facilities',
                rating: 4.9,
                pricePerNight: 280,
                image: 'images/hotel/cmbmc-superior-0033-hor-clsc.webp',
                amenities: ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'beach'],
                featured: true,
                isActive: true
            },
            {
                id: 'h003',
                name: 'Kandy Heritage Hotel',
                location: 'Kandy',
                description: 'Colonial-style boutique hotel near the Temple of the Tooth',
                rating: 4.5,
                pricePerNight: 85,
                image: 'images/hotel/cmbmc-balcony-0037-hor-clsc.avif',
                amenities: ['wifi', 'restaurant', 'parking'],
                featured: false,
                isActive: true
            },
            {
                id: 'h004',
                name: 'Galle Face Hotel',
                location: 'Colombo',
                description: 'Historic oceanfront hotel with colonial charm since 1864',
                rating: 4.6,
                pricePerNight: 120,
                image: 'images/hotel/cmbmc-room-3686-hor-clsc.webp',
                amenities: ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'beach'],
                featured: false,
                isActive: true
            },
            {
                id: 'h005',
                name: 'Jetwing Yala',
                location: 'Yala',
                description: 'Eco-friendly safari lodge at the doorstep of Yala National Park',
                rating: 4.7,
                pricePerNight: 200,
                image: 'images/hotel/cmbmc-superior-0033-hor-clsc.webp',
                amenities: ['wifi', 'pool', 'restaurant', 'parking', 'safari'],
                featured: true,
                isActive: true
            },
            {
                id: 'h006',
                name: 'Cape Weligama',
                location: 'Weligama',
                description: 'Clifftop resort with panoramic Indian Ocean views',
                rating: 4.9,
                pricePerNight: 450,
                image: 'images/hotel/cmbmc-balcony-0037-hor-clsc.avif',
                amenities: ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'beach'],
                featured: true,
                isActive: true
            },
            {
                id: 'h007',
                name: 'Tea Trails',
                location: 'Hatton',
                description: 'Luxury bungalows in the heart of Ceylon tea country',
                rating: 4.8,
                pricePerNight: 350,
                image: 'images/hotel/cmbmc-room-3686-hor-clsc.webp',
                amenities: ['wifi', 'spa', 'restaurant', 'parking', 'tea-plantation'],
                featured: false,
                isActive: true
            },
            {
                id: 'h008',
                name: 'Anantara Peace Haven',
                location: 'Tangalle',
                description: 'Secluded beach resort on a coconut plantation',
                rating: 4.7,
                pricePerNight: 320,
                image: 'images/hotel/cmbmc-superior-0033-hor-clsc.webp',
                amenities: ['wifi', 'pool', 'spa', 'restaurant', 'parking', 'beach'],
                featured: false,
                isActive: true
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('siteHotels', JSON.stringify(allHotels));
    }
    
    filteredHotels = [...allHotels];
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('hotelSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = `$${this.value}`;
            filterHotels();
        });
    }
    
    // Star rating filters
    document.querySelectorAll('[id$="stars"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterHotels);
    });
    
    // Amenity filters
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterHotels);
    });
    
    // Sort dropdown
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', sortHotels);
    }
}

/**
 * Set default check-in and check-out dates
 */
function setDefaultDates() {
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    
    if (checkIn && checkOut) {
        // Set check-in to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        checkIn.valueAsDate = tomorrow;
        checkIn.min = tomorrow.toISOString().split('T')[0];
        
        // Set check-out to 3 days from tomorrow
        const checkOutDate = new Date(tomorrow);
        checkOutDate.setDate(checkOutDate.getDate() + 3);
        checkOut.valueAsDate = checkOutDate;
        checkOut.min = tomorrow.toISOString().split('T')[0];
    }
}

/**
 * Handle search form submission
 */
function handleSearch(e) {
    e.preventDefault();
    
    const location = document.getElementById('location').value.toLowerCase();
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    
    // Store search parameters
    sessionStorage.setItem('hotelSearch', JSON.stringify({
        location,
        checkIn,
        checkOut,
        guests
    }));
    
    // Filter by location
    if (location) {
        filteredHotels = allHotels.filter(hotel => 
            hotel.location.toLowerCase().includes(location) ||
            hotel.name.toLowerCase().includes(location)
        );
    } else {
        filteredHotels = [...allHotels];
    }
    
    // Apply other filters
    filterHotels();
}

/**
 * Filter hotels based on selected criteria
 */
function filterHotels() {
    let filtered = [...filteredHotels];
    
    // Price filter
    const maxPrice = parseFloat(document.getElementById('priceRange').value);
    filtered = filtered.filter(hotel => hotel.pricePerNight <= maxPrice);
    
    // Star rating filter
    const selectedRatings = [];
    document.querySelectorAll('[id$="stars"]:checked').forEach(checkbox => {
        selectedRatings.push(parseInt(checkbox.value));
    });
    
    if (selectedRatings.length > 0) {
        filtered = filtered.filter(hotel => 
            selectedRatings.includes(Math.floor(hotel.rating))
        );
    }
    
    // Amenity filter
    const selectedAmenities = [];
    document.querySelectorAll('.filter-option input[type="checkbox"]:checked').forEach(checkbox => {
        if (!checkbox.id.includes('stars')) {
            selectedAmenities.push(checkbox.value);
        }
    });
    
    if (selectedAmenities.length > 0) {
        filtered = filtered.filter(hotel => 
            selectedAmenities.every(amenity => hotel.amenities.includes(amenity))
        );
    }
    
    filteredHotels = filtered;
    sortHotels();
}

/**
 * Sort hotels based on selected criteria
 */
function sortHotels() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'price-low':
            filteredHotels.sort((a, b) => a.pricePerNight - b.pricePerNight);
            break;
        case 'price-high':
            filteredHotels.sort((a, b) => b.pricePerNight - a.pricePerNight);
            break;
        case 'rating':
            filteredHotels.sort((a, b) => b.rating - a.rating);
            break;
        case 'recommended':
        default:
            // Sort by featured first, then by rating
            filteredHotels.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating;
            });
    }
    
    displayHotels();
}

/**
 * Display hotels in the grid
 */
function displayHotels() {
    const hotelsGrid = document.getElementById('hotelsGrid');
    if (!hotelsGrid) return;
    
    if (filteredHotels.length === 0) {
        hotelsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-hotel" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No hotels found</h3>
                <p>Try adjusting your filters or search criteria</p>
            </div>
        `;
        return;
    }
    
    hotelsGrid.innerHTML = filteredHotels.map(hotel => `
        <div class="hotel-card">
            <div class="hotel-image">
                <img src="${hotel.image}" alt="${hotel.name}" onerror="this.src='images/placeholder.jpg'">
                ${hotel.featured ? '<span class="hotel-badge">Featured</span>' : ''}
            </div>
            <div class="hotel-content">
                <h3 class="hotel-name">${hotel.name}</h3>
                <p class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.location}
                </p>
                <div class="hotel-rating">
                    <span class="stars">${generateStars(hotel.rating)}</span>
                    <span class="rating-text">${hotel.rating} (${Math.floor(Math.random() * 200 + 50)} reviews)</span>
                </div>
                <p style="color: #666; font-size: 14px; margin-bottom: 1rem;">${hotel.description}</p>
                <div class="hotel-amenities">
                    ${generateAmenityIcons(hotel.amenities.slice(0, 4))}
                </div>
                <div class="hotel-price">
                    <div>
                        <div class="price">$${hotel.pricePerNight}</div>
                        <div class="price-label">per night</div>
                    </div>
                    <button class="book-btn" onclick="bookHotel('${hotel.id}')">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Generate star rating display
 */
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    
    if (hasHalfStar && fullStars < 5) {
        stars += '⭐'; // You could use a half-star icon here
    }
    
    return stars;
}

/**
 * Generate amenity icons
 */
function generateAmenityIcons(amenities) {
    const amenityIcons = {
        'wifi': '<i class="fas fa-wifi"></i> WiFi',
        'pool': '<i class="fas fa-swimming-pool"></i> Pool',
        'spa': '<i class="fas fa-spa"></i> Spa',
        'restaurant': '<i class="fas fa-utensils"></i> Restaurant',
        'parking': '<i class="fas fa-parking"></i> Parking',
        'beach': '<i class="fas fa-umbrella-beach"></i> Beach',
        'safari': '<i class="fas fa-binoculars"></i> Safari',
        'tea-plantation': '<i class="fas fa-leaf"></i> Tea Estate'
    };
    
    return amenities.map(amenity => 
        `<span class="amenity">${amenityIcons[amenity] || amenity}</span>`
    ).join('');
}

/**
 * Book a hotel
 */
function bookHotel(hotelId) {
    const hotel = allHotels.find(h => h.id === hotelId);
    if (!hotel) return;
    
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login to book a hotel');
        // You could trigger login modal here
        return;
    }
    
    // Get search parameters
    const searchParams = JSON.parse(sessionStorage.getItem('hotelSearch') || '{}');
    
    // Create booking object
    const booking = {
        id: 'HB' + Date.now(),
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelLocation: hotel.location,
        checkIn: searchParams.checkIn || new Date().toISOString().split('T')[0],
        checkOut: searchParams.checkOut || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: searchParams.guests || '1',
        pricePerNight: hotel.pricePerNight,
        totalPrice: 0, // Calculate based on nights
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: 'current-user' // In real app, get from auth system
    };
    
    // Calculate total price
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    booking.totalPrice = nights * booking.pricePerNight;
    booking.nights = nights;
    
    // Show confirmation dialog
    const confirmMessage = `
        Confirm your booking:
        
        Hotel: ${hotel.name}
        Location: ${hotel.location}
        Check-in: ${booking.checkIn}
        Check-out: ${booking.checkOut}
        Nights: ${nights}
        Guests: ${booking.guests}
        
        Total Price: $${booking.totalPrice}
    `;
    
    if (confirm(confirmMessage)) {
        // Save booking
        saveHotelBooking(booking);
        
        // Show success message
        alert(`Booking confirmed! Your booking ID is ${booking.id}`);
        
        // Redirect to my bookings page
        if (typeof showMyBookings === 'function') {
            showMyBookings();
        }
    }
}

/**
 * Save hotel booking to localStorage
 */
function saveHotelBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
    
    // Also add to general bookings for "My Bookings" page
    let allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    allBookings.push({
        ...booking,
        type: 'hotel'
    });
    localStorage.setItem('userBookings', JSON.stringify(allBookings));
} 