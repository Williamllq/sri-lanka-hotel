/**
 * Clear Orders Utility
 * 
 * This script provides a direct way to clear all order data from localStorage and sessionStorage.
 * It can be used as a bookmarklet or included as a script.
 */

// Flag to prevent the script from running multiple times
window.ordersAlreadyCleared = window.ordersAlreadyCleared || false;

// Function to clear all orders data - exported as a global function
function clearAllOrdersData() {
    // Only allow clearing once per page load to prevent loops
    if (window.ordersAlreadyCleared) {
        console.log('Orders already cleared in this session');
        return 'Orders already cleared in this session';
    }
    
    try {
        // Clear from localStorage
        localStorage.removeItem('bookings');
        localStorage.removeItem('userBookings');
        localStorage.removeItem('transportBookings');
        localStorage.removeItem('bookingsArchive');
        
        // Check for any other order-related keys
        const keysToRemove = [];
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.toLowerCase().includes('order') || 
                key.toLowerCase().includes('book') ||
                key.toLowerCase().includes('reservation')
            )) {
                keysToRemove.push(key);
            }
        }
        
        // Remove the found keys
        keysToRemove.forEach(key => {
            console.log('Removing localStorage key:', key);
            localStorage.removeItem(key);
        });
        
        // Also clear from sessionStorage
        sessionStorage.removeItem('bookings');
        sessionStorage.removeItem('userBookings');
        sessionStorage.removeItem('transportBookings');
        sessionStorage.removeItem('bookingsArchive');
        
        // Check for session storage keys too
        const sessionKeysToRemove = [];
        for(let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.toLowerCase().includes('order') || 
                key.toLowerCase().includes('book') ||
                key.toLowerCase().includes('reservation')
            )) {
                sessionKeysToRemove.push(key);
            }
        }
        
        // Remove session keys
        sessionKeysToRemove.forEach(key => {
            console.log('Removing sessionStorage key:', key);
            sessionStorage.removeItem(key);
        });
        
        // Set a flag to prevent demo data generation
        window.ordersManuallyCleared = true;
        localStorage.setItem('ordersManuallyCleared', 'true');
        
        // Mark as already cleared to prevent loops
        window.ordersAlreadyCleared = true;
        
        // Create a visual confirmation if we're in a browser
        if (typeof document !== 'undefined') {
            // Try to find and clear the orders table
            const ordersTableBody = document.getElementById('ordersTableBody');
            if (ordersTableBody) {
                ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">All orders have been cleared</td></tr>';
            }
        }
        
        console.log('All orders data successfully cleared');
        return 'Orders cleared successfully';
    } catch (error) {
        console.error('Error clearing orders data:', error);
        return 'Error clearing orders: ' + error.message;
    }
}

// Make the function available globally
window.clearAllOrdersData = clearAllOrdersData;

// Check if this is the first page load with cleared state
if (localStorage.getItem('ordersManuallyCleared') === 'true' && !window.ordersAlreadyCleared) {
    console.log('Orders were previously cleared. Setting up cleared state.');
    window.ordersManuallyCleared = true;
    window.ordersAlreadyCleared = true;
} 