/**
 * Order Management Fix
 * 
 * This script fixes issues with the order management functionality
 * on the admin dashboard.
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Order management fix loaded');
        
        // Wait a moment to ensure the page is fully loaded
        setTimeout(function() {
            // Load orders function - replacement for the one in admin-dashboard.js
            function fixedLoadOrders(searchTerm = '') {
                console.log('Fixed loadOrders function executed');
                
                // Get elements
                const ordersTableBody = document.getElementById('ordersTableBody');
                const noOrdersMessage = document.getElementById('noOrdersMessage');
                const orderTabs = document.querySelectorAll('[data-order-tab]');
                
                // Get current filter
                let currentOrderFilter = 'all';
                orderTabs.forEach(tab => {
                    if (tab.classList.contains('active')) {
                        currentOrderFilter = tab.getAttribute('data-order-tab');
                    }
                });
                
                // Clear table
                if (ordersTableBody) {
                    ordersTableBody.innerHTML = '';
                }
                
                // Get orders from localStorage
                let orders = [];
                try {
                    const storedOrders = localStorage.getItem('bookings');
                    console.log('Raw bookings data:', storedOrders);
                    
                    if (storedOrders) {
                        orders = JSON.parse(storedOrders);
                        console.log('Loaded orders from localStorage:', orders);
                    }
                } catch (error) {
                    console.error('Error loading orders:', error);
                    return;
                }
                
                // If no orders, use demo data
                if (!orders || orders.length === 0) {
                    console.log('No orders found, creating demo data');
                    orders = createDemoOrders();
                }
                
                // Check if there are orders after potential demo creation
                if (!orders || orders.length === 0) {
                    if (noOrdersMessage) {
                        noOrdersMessage.style.display = 'flex';
                    }
                    return;
                }
                
                // Hide no orders message
                if (noOrdersMessage) {
                    noOrdersMessage.style.display = 'none';
                }
                
                // Filter orders by status
                if (currentOrderFilter !== 'all') {
                    orders = orders.filter(order => order.status === currentOrderFilter);
                }
                
                // Filter orders by search term
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    orders = orders.filter(order => 
                        (order.customerName && order.customerName.toLowerCase().includes(term)) ||
                        (order.customerEmail && order.customerEmail.toLowerCase().includes(term)) ||
                        (order.fromLocation && order.fromLocation.toLowerCase().includes(term)) ||
                        (order.toLocation && order.toLocation.toLowerCase().includes(term))
                    );
                }
                
                // If no matching orders after filtering
                if (orders.length === 0) {
                    if (noOrdersMessage) {
                        noOrdersMessage.style.display = 'flex';
                    }
                    return;
                }
                
                // Create table rows
                orders.forEach(order => {
                    // Format dates
                    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
                    
                    // Get values with fallbacks
                    const orderId = order.id || `ORD-${Math.floor(Math.random() * 10000)}`;
                    const customerName = order.customerName || 'Anonymous Customer';
                    const vehicleType = order.vehicleType || 'Transport';
                    const fromLocation = order.fromLocation || order.pickupLocation || 'N/A';
                    const toLocation = order.toLocation || order.destination || 'N/A';
                    const price = order.price || order.totalFare || 0;
                    const status = order.status || 'pending';
                    
                    // Create table row
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${orderId}</td>
                        <td>${orderDate}</td>
                        <td>${customerName}</td>
                        <td>${vehicleType}</td>
                        <td>${fromLocation}</td>
                        <td>${toLocation}</td>
                        <td>$${parseFloat(price).toFixed(2)}</td>
                        <td><span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td>
                            <button class="action-btn view-btn" data-order-id="${orderId}"><i class="fas fa-eye"></i></button>
                            <button class="action-btn delete-btn" data-order-id="${orderId}"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    
                    if (ordersTableBody) {
                        ordersTableBody.appendChild(row);
                    }
                });
                
                // Add event listeners to action buttons
                const viewBtns = document.querySelectorAll('.action-btn.view-btn');
                const deleteBtns = document.querySelectorAll('.action-btn.delete-btn');
                
                viewBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const orderId = this.getAttribute('data-order-id');
                        if (typeof viewOrderDetails === 'function') {
                            viewOrderDetails(orderId);
                        } else {
                            alert(`Order details for ${orderId}`);
                        }
                    });
                });
                
                deleteBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const orderId = this.getAttribute('data-order-id');
                        if (confirm('Are you sure you want to delete this order?')) {
                            if (typeof deleteOrder === 'function') {
                                deleteOrder(orderId);
                            } else {
                                // Fallback delete implementation
                                try {
                                    let orders = JSON.parse(localStorage.getItem('bookings') || '[]');
                                    orders = orders.filter(o => o.id !== orderId);
                                    localStorage.setItem('bookings', JSON.stringify(orders));
                                    fixedLoadOrders();
                                } catch (e) {
                                    console.error('Error deleting order:', e);
                                }
                            }
                        }
                    });
                });
                
                console.log('Orders loaded successfully');
            }
            
            // Helper function to create demo orders
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
                    }
                ];
            }
            
            // Execute the fixed load orders function
            fixedLoadOrders();
            
            // Add event listeners if needed
            const orderSearchBtn = document.getElementById('orderSearchBtn');
            const orderSearchInput = document.getElementById('orderSearchInput');
            const orderTabs = document.querySelectorAll('[data-order-tab]');
            
            if (orderSearchBtn) {
                orderSearchBtn.addEventListener('click', function() {
                    fixedLoadOrders(orderSearchInput ? orderSearchInput.value : '');
                });
            }
            
            if (orderSearchInput) {
                orderSearchInput.addEventListener('keyup', function(e) {
                    if (e.key === 'Enter') {
                        fixedLoadOrders(this.value);
                    }
                });
            }
            
            orderTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs
                    orderTabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Reload orders with new filter
                    fixedLoadOrders(orderSearchInput ? orderSearchInput.value : '');
                });
            });
            
            console.log('Order management fix applied successfully');
        }, 500);
    });
})();