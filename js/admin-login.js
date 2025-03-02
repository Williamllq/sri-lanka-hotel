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
    
    // Get references to the icons
    const usernameIcon = document.querySelector('.form-group:nth-child(1) .input-group i');
    const passwordIcon = document.querySelector('.form-group:nth-child(2) .input-group i');
    
    // Function to toggle icon visibility based on input value
    function toggleIconVisibility(input, icon) {
        if (input.value.trim() !== '') {
            icon.style.display = 'none';
        } else {
            icon.style.display = 'block';
        }
    }
    
    // Hide username icon if there's a saved username
    if (localStorage.getItem('adminRememberUsername')) {
        usernameIcon.style.display = 'none';
    }
    
    // Add input event listeners to hide icons when typing
    usernameInput.addEventListener('input', function() {
        toggleIconVisibility(usernameInput, usernameIcon);
    });
    
    passwordInput.addEventListener('input', function() {
        toggleIconVisibility(passwordInput, passwordIcon);
    });
    
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
            showError('Please enter a username.');
            usernameInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter a password.');
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
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Login successful. Redirecting...';
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
            showError('Invalid username or password. Please try again.');
            
            // Clear password
            passwordInput.value = '';
            
            // Check icon visibility after clearing password
            toggleIconVisibility(passwordInput, passwordIcon);
            
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

    // Add focus and blur events to check for empty fields
    usernameInput.addEventListener('blur', function() {
        toggleIconVisibility(usernameInput, usernameIcon);
    });

    passwordInput.addEventListener('blur', function() {
        toggleIconVisibility(passwordInput, passwordIcon);
    });
}); 