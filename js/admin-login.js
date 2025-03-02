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
    const rememberCheckbox = document.getElementById('remember');
    
    // Set focus on username field
    usernameInput.focus();
    
    // Check if user is already logged in
    if (localStorage.getItem('adminToken')) {
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    // Check if there was a saved username (remember me)
    const savedUsername = localStorage.getItem('adminRememberUsername');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = true;
        // Set focus to password field if username is already filled
        passwordInput.focus();
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberCheckbox.checked;
        
        // Validate inputs
        if (!username) {
            showError('Bitte geben Sie einen Benutzernamen ein.');
            usernameInput.focus();
            return;
        }
        
        if (!password) {
            showError('Bitte geben Sie ein Passwort ein.');
            passwordInput.focus();
            return;
        }
        
        // In a real application, this would be a server API call
        // For demonstration, using hardcoded credentials
        const validUsername = 'admin';
        const validPassword = 'rangabandara2024';
        
        if (username === validUsername && password === validPassword) {
            // Login successful
            
            // Handle "Remember me" option
            if (rememberMe) {
                localStorage.setItem('adminRememberUsername', username);
            } else {
                localStorage.removeItem('adminRememberUsername');
            }
            
            // Create a simple authentication token (in a real app, this would be a JWT from server)
            const authToken = btoa(`${username}:${Date.now()}`);
            
            // Store in localStorage (this is for demo purposes - in a real app, use secure methods)
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminLastLogin', new Date().toISOString());
            
            // Show success message before redirect
            const successMessage = document.createElement('div');
            successMessage.className = 'login-success';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Anmeldung erfolgreich. Sie werden weitergeleitet...';
            successMessage.style.backgroundColor = '#f0fff5';
            successMessage.style.color = '#28a745';
            successMessage.style.padding = '12px 15px';
            successMessage.style.borderRadius = '10px';
            successMessage.style.marginBottom = '20px';
            successMessage.style.textAlign = 'left';
            successMessage.style.borderLeft = '4px solid #28a745';
            successMessage.style.fontSize = '15px';
            successMessage.style.display = 'flex';
            successMessage.style.alignItems = 'center';
            
            // Insert before the form
            loginForm.parentNode.insertBefore(successMessage, loginForm);
            
            // Hide login form
            loginForm.style.display = 'none';
            
            // Redirect to admin dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            // Login failed
            showError('Ungültiger Benutzername oder Passwort. Bitte versuchen Sie es erneut.');
            
            // Clear password
            passwordInput.value = '';
            
            // Focus on username field if empty, otherwise focus on password
            if (!username) {
                usernameInput.focus();
            } else {
                passwordInput.focus();
            }
        }
    });
    
    // Function to show error messages
    function showError(message) {
        loginError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        loginError.style.display = 'flex';
        loginForm.classList.add('shake');
        
        // Remove shake class after animation completes
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
        
        // Hide the error message after 4 seconds
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 4000);
    }
}); 