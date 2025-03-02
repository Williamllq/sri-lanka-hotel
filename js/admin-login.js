/**
 * Admin Login Authentication
 * 
 * This script handles the authentication for the admin login page.
 * It checks username and password, sets authentication token in localStorage,
 * and redirects to the admin dashboard if credentials are valid.
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    
    // Check if user is already logged in
    if (localStorage.getItem('adminToken')) {
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // In a real application, this would be a server API call
        // For demonstration, using hardcoded credentials
        const validUsername = 'admin';
        const validPassword = 'rangabandara2024';
        
        if (username === validUsername && password === validPassword) {
            // Login successful
            // Create a simple authentication token (in a real app, this would be a JWT from server)
            const authToken = btoa(`${username}:${Date.now()}`);
            
            // Store in localStorage (this is for demo purposes - in a real app, use secure methods)
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminLastLogin', new Date().toISOString());
            
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Login failed
            loginError.style.display = 'block';
            loginForm.classList.add('shake');
            
            // Clear password
            passwordInput.value = '';
            
            // Focus on username field
            usernameInput.focus();
            
            // Remove shake class after animation completes
            setTimeout(() => {
                loginForm.classList.remove('shake');
            }, 500);
            
            // Hide the error message after 3 seconds
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    });
}); 