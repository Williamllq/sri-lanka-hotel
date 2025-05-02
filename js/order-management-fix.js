/**
 * Order Management Fix
 * 
 * This script fixes issues with the order management functionality
 * on the admin dashboard.
 */

// Immediately invoked function to avoid global scope pollution
(function() {
    console.log('Order management fix script loaded');
    
    // Add CSS styles for order management
    const style = document.createElement('style');
    style.textContent = `
        .order-tab {
            user-select: none;
            cursor: pointer;
            transition: all 0.3s;
            opacity: 0.8;
        }
        .order-tab.active {
            opacity: 1;
            font-weight: bold;
            background-color: #4a6fa5 !important;
            color: white !important;
        }
        .order-tab:hover {
            opacity: 1;
            background-color: #e9ecef;
        }
        .order-tab.active:hover {
            background-color: #3a5d8f !important;
            color: white !important;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            min-width: 80px;
        }
        .status-badge.pending {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .status-badge.confirmed {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .status-badge.completed {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-badge.cancelled {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border: 1px solid #ddd;
            background-color: white;
            cursor: pointer;
        }
        .action-btn.view-btn {
            color: #4a6fa5;
        }
        .action-btn.delete-btn {
            color: #dc3545;
        }
        .action-btn.view-btn:hover {
            background-color: #e7f0ff;
            border-color: #4a6fa5;
        }
        .action-btn.delete-btn:hover {
            background-color: #fff5f5;
            border-color: #dc3545;
        }
        #orderDetailsModal .modal-body {
            padding: 0;
        }
        #orderDetailsModal .order-details {
            padding: 20px;
        }
        #orderDetailsModal .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        #orderDetailsModal .order-header h4 {
            margin: 0;
            font-size: 20px;
            color: #333;
        }
        .order-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-group {
            margin-bottom: 12px;
        }
        .info-group label {
            display: block;
            font-size: 12px;
            color: #777;
            margin-bottom: 4px;
        }
        .info-group span {
            font-weight: 500;
            color: #333;
        }
        .admin-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow-y: auto;
            padding: 20px;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
    
    // Function to create sample demo orders
    function createDemoOrders() {
        return [
            {
                id: 'ORD-1001',
                customerName: 'John Smith',
                customerEmail: 'john.smith@example.com',
                customerPhone: '+1 123-456-7890',
                fromLocation: 'Colombo',
                toLocation: 'Kandy',
                distance: 115.5,
                vehicleType: 'Sedan',
                journeyDate: '2023-12-15',
                journeyTime: '09:30',
                price: 89.50,
                status: 'confirmed',
                createdAt: new Date('2023-12-10').toISOString()
            },
            {
                id: 'ORD-1002',
                customerName: 'Emma Johnson',
                customerEmail: 'emma.j@example.com',
                customerPhone: '+44 7700 900123',
                fromLocation: 'Galle',
                toLocation: 'Mirissa',
                distance: 45.8,
                vehicleType: 'SUV',
                journeyDate: '2023-12-18',
                journeyTime: '14:00',
                price: 65.75,
                status: 'pending',
                createdAt: new Date('2023-12-11').toISOString()
            },
            {
                id: 'ORD-1003',
                customerName: 'David Chen',
                customerEmail: 'david.c@example.com',
                customerPhone: '+61 4123 456789',
                fromLocation: 'Negombo',
                toLocation: 'Sigiriya',
                distance: 158.3,
                vehicleType: 'Van',
                journeyDate: '2023-12-12',
                journeyTime: '10:00',
                price: 175.25,
                status: 'completed',
                createdAt: new Date('2023-12-08').toISOString()
            },
            {
                id: 'ORD-1004',
                customerName: 'Sarah Miller',
                customerEmail: 'sarah.m@example.com',
                customerPhone: '+49 30 123456',
                fromLocation: 'Colombo',
                toLocation: 'Galle',
                distance: 125.7,
                vehicleType: 'Luxury',
                journeyDate: '2023-12-20',
                journeyTime: '08:00',
                price: 210.50,
                status: 'cancelled',
                createdAt: new Date('2023-12-09').toISOString()
            }
        ];
    }

    // Initialize order manager when DOM is loaded
    function initOrderManager() {
        console.log('Initializing order manager...');
        
        // Set up event listeners for order tabs
        const orderTabs = document.querySelectorAll('.order-tab');
        if (orderTabs.length > 0) {
            console.log('Found order tabs:', orderTabs.length);
            
            orderTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    orderTabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Load orders with new filter
                    loadOrders();
                });
            });
        } else {
            console.error('No order tabs found!');
        }
        
        // Set up search functionality
        const orderSearchBtn = document.getElementById('orderSearchBtn');
        const orderSearchInput = document.getElementById('orderSearchInput');
        
        if (orderSearchBtn) {
            orderSearchBtn.addEventListener('click', function() {
                loadOrders();
            });
        }
        
        if (orderSearchInput) {
            orderSearchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    loadOrders();
                }
            });
        }
        
        // Load orders initially
        loadOrders();
    }

    // Load orders function
    function loadOrders() {
        console.log('Loading orders...');
        
        // Get elements
        const ordersTableBody = document.getElementById('ordersTableBody');
        const noOrdersMessage = document.getElementById('noOrdersMessage');
        const orderTabs = document.querySelectorAll('.order-tab');
        const orderSearchInput = document.getElementById('orderSearchInput');
        
        // Get current filter
        let currentFilter = 'all';
        orderTabs.forEach(tab => {
            if (tab.classList.contains('active')) {
                currentFilter = tab.getAttribute('data-order-tab');
            }
        });
        
        // Get search term
        const searchTerm = orderSearchInput ? orderSearchInput.value.toLowerCase() : '';
        
        console.log('Current filter:', currentFilter, 'Search term:', searchTerm);
        
        // Clear table
        if (ordersTableBody) {
            ordersTableBody.innerHTML = '';
        } else {
            console.error('Orders table body not found!');
            return;
        }
        
        // Get orders from localStorage
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('bookings');
            console.log('Raw bookings data:', storedOrders);
            
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                console.log('Parsed orders:', orders);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
        
        // If no orders, use demo data
        if (!orders || orders.length === 0) {
            console.log('No orders found, using demo data');
            orders = createDemoOrders();
            
            // Save demo orders to localStorage for testing
            try {
                localStorage.setItem('bookings', JSON.stringify(orders));
                console.log('Demo orders saved to localStorage');
            } catch (error) {
                console.error('Error saving demo orders:', error);
            }
        }
        
        // Filter orders by status if not showing all
        if (currentFilter !== 'all') {
            orders = orders.filter(order => order.status === currentFilter);
        }
        
        // Filter by search term if provided
        if (searchTerm) {
            orders = orders.filter(order => 
                (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
                (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm)) ||
                (order.fromLocation && order.fromLocation.toLowerCase().includes(searchTerm)) ||
                (order.toLocation && order.toLocation.toLowerCase().includes(searchTerm)) ||
                (order.id && order.id.toLowerCase().includes(searchTerm))
            );
        }
        
        // Show no orders message if no results
        if (orders.length === 0) {
            if (noOrdersMessage) {
                noOrdersMessage.style.display = 'flex';
            }
            return;
        }
        
        // Hide no orders message
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'none';
        }
        
        // Add orders to table
        orders.forEach(order => {
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id || 'N/A'}</td>
                <td>${orderDate}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${order.vehicleType || 'Transport'}</td>
                <td>${order.fromLocation || 'N/A'}</td>
                <td>${order.toLocation || 'N/A'}</td>
                <td>$${parseFloat(order.price || 0).toFixed(2)}</td>
                <td><span class="status-badge ${order.status || 'pending'}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-order-id="${order.id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn" data-order-id="${order.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            ordersTableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        setupActionButtons();
        
        console.log('Orders loaded successfully!');
    }

    // Setup action buttons
    function setupActionButtons() {
        const viewButtons = document.querySelectorAll('.action-btn.view-btn');
        const deleteButtons = document.querySelectorAll('.action-btn.delete-btn');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                viewOrderDetails(orderId);
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                if (confirm('Are you sure you want to delete this order?')) {
                    deleteOrder(orderId);
                }
            });
        });
    }

    // View order details
    function viewOrderDetails(orderId) {
        console.log('Viewing order details:', orderId);
        
        const orderDetailsModal = document.getElementById('orderDetailsModal');
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        
        if (!orderDetailsModal || !orderDetailsContent) {
            console.error('Order details modal elements not found!');
            return;
        }
        
        // Get orders from localStorage
        let orders = [];
        let order = null;
        
        try {
            const storedOrders = localStorage.getItem('bookings');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                order = orders.find(o => o.id === orderId);
            }
        } catch (error) {
            console.error('Error finding order:', error);
        }
        
        // If not found, check demo orders
        if (!order) {
            console.log('Order not found in localStorage, checking demo orders');
            const demoOrders = createDemoOrders();
            order = demoOrders.find(o => o.id === orderId);
        }
        
        if (!order) {
            alert('Order not found!');
            return;
        }
        
        // Format dates
        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
        const journeyDate = order.journeyDate || 'N/A';
        const journeyTime = order.journeyTime || '';
        
        // Create HTML content for order details
        orderDetailsContent.innerHTML = `
            <div class="order-details">
                <div class="order-header">
                    <h4>Order ${order.id}</h4>
                    <span class="status-badge ${order.status || 'pending'}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span>
                </div>
                
                <div class="order-info-grid">
                    <div class="info-group">
                        <label>Order Date:</label>
                        <span>${orderDate}</span>
                    </div>
                    <div class="info-group">
                        <label>Journey Date:</label>
                        <span>${journeyDate} ${journeyTime}</span>
                    </div>
                    <div class="info-group">
                        <label>Customer Name:</label>
                        <span>${order.customerName || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Email:</label>
                        <span>${order.customerEmail || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Phone:</label>
                        <span>${order.customerPhone || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>From:</label>
                        <span>${order.fromLocation || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>To:</label>
                        <span>${order.toLocation || 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Distance:</label>
                        <span>${order.distance ? order.distance + ' km' : 'N/A'}</span>
                    </div>
                    <div class="info-group">
                        <label>Vehicle Type:</label>
                        <span>${order.vehicleType || 'Transport'}</span>
                    </div>
                    <div class="info-group">
                        <label>Price:</label>
                        <span>$${parseFloat(order.price || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        orderDetailsModal.style.display = 'block';
        
        // Setup status update buttons
        const statusButtons = orderDetailsModal.querySelectorAll('.order-status-buttons button');
        statusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const status = this.getAttribute('data-status');
                updateOrderStatus(orderId, status);
            });
        });
        
        // Setup close buttons
        const closeButtons = orderDetailsModal.querySelectorAll('.close-modal, .close-details-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                orderDetailsModal.style.display = 'none';
            });
        });
    }

    // Update order status
    function updateOrderStatus(orderId, status) {
        console.log('Updating order status:', orderId, 'to', status);
        
        try {
            let orders = JSON.parse(localStorage.getItem('bookings') || '[]');
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                orders[orderIndex].status = status;
                localStorage.setItem('bookings', JSON.stringify(orders));
                
                // Update status badge in modal
                const statusBadge = document.querySelector('#orderDetailsModal .status-badge');
                if (statusBadge) {
                    statusBadge.className = `status-badge ${status}`;
                    statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                }
                
                // Reload orders
                loadOrders();
            } else {
                alert('Order not found! It might be a demo order.');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status!');
        }
    }

    // Delete order
    function deleteOrder(orderId) {
        console.log('Deleting order:', orderId);
        
        try {
            let orders = JSON.parse(localStorage.getItem('bookings') || '[]');
            orders = orders.filter(order => order.id !== orderId);
            localStorage.setItem('bookings', JSON.stringify(orders));
            
            // Reload orders
            loadOrders();
            
            alert('Order deleted successfully!');
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order!');
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOrderManager);
    } else {
        // DOM is already ready
        initOrderManager();
    }
})();