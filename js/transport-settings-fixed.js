/**
 * Transport Settings functionality (Fixed version)
 * This file handles the transport settings management for the admin dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize transport settings
    initTransportSettings();
});

/**
 * Initialize transport settings form and handlers
 */
function initTransportSettings() {
    console.log('Initializing transport settings (fixed version)...');
    
    // Get the save button
    const saveButton = document.getElementById('saveTransportSettingsBtn');
    
    // Add event listener to save button
    if (saveButton) {
        // Remove existing listeners by cloning (a workaround to ensure only one handler)
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        
        // Add new event listener
        newSaveButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default form submission
            saveTransportSettings();
            return false; // Prevent event bubbling
        });
        
        console.log('Event listener added to saveTransportSettingsBtn in fixed version');
    } else {
        console.error('Save transport settings button not found');
    }
    
    // Load existing settings
    loadTransportSettings();
}

/**
 * Save transport settings to localStorage
 */
function saveTransportSettings() {
    console.log('Saving transport settings...');
    
    try {
        // Get all input values with explicit error checking
        const baseFareElement = document.getElementById('baseFare');
        const ratePerKmElement = document.getElementById('ratePerKm');
        const rushHourMultiplierElement = document.getElementById('rushHourMultiplier');
        const nightMultiplierElement = document.getElementById('nightMultiplier');
        const weekendMultiplierElement = document.getElementById('weekendMultiplier');
        const sedanRateElement = document.getElementById('sedanRate');
        const suvRateElement = document.getElementById('suvRate');
        const vanRateElement = document.getElementById('vanRate');
        const luxuryRateElement = document.getElementById('luxuryRate');
        
        // Check if elements exist
        if (!baseFareElement || !ratePerKmElement || !rushHourMultiplierElement || 
            !nightMultiplierElement || !weekendMultiplierElement || !sedanRateElement || 
            !suvRateElement || !vanRateElement || !luxuryRateElement) {
            console.error('One or more form elements not found');
            alert('Error: Could not find all form fields. Please reload the page and try again.');
            return;
        }
        
        // Parse values with fallbacks
        const baseFare = parseFloat(baseFareElement.value) || 30;
        const ratePerKm = parseFloat(ratePerKmElement.value) || 0.5;
        const rushHourMultiplier = parseFloat(rushHourMultiplierElement.value) || 1.5;
        const nightMultiplier = parseFloat(nightMultiplierElement.value) || 1.3;
        const weekendMultiplier = parseFloat(weekendMultiplierElement.value) || 1.2;
        const sedanRate = parseFloat(sedanRateElement.value) || 1.0;
        const suvRate = parseFloat(suvRateElement.value) || 1.5;
        const vanRate = parseFloat(vanRateElement.value) || 1.8;
        const luxuryRate = parseFloat(luxuryRateElement.value) || 2.2;
        
        // Create transport settings object
        const transportSettings = {
            baseFare,
            ratePerKm,
            rushHourMultiplier,
            nightMultiplier,
            weekendMultiplier,
            vehicleRates: {
                sedan: sedanRate,
                suv: suvRate,
                van: vanRate,
                luxury: luxuryRate
            },
            lastUpdated: new Date().toISOString()
        };
        
        console.log('Transport settings to save:', transportSettings);
        
        // Clear any previous data to avoid conflicts
        localStorage.removeItem('transportSettings');
        
        // Convert to JSON string and save to localStorage
        const settingsJSON = JSON.stringify(transportSettings);
        localStorage.setItem('transportSettings', settingsJSON);
        
        // Verify the data was saved correctly
        const savedData = localStorage.getItem('transportSettings');
        if (!savedData) {
            throw new Error('Failed to verify saved data');
        }
        
        console.log('Transport settings saved successfully');
        
        // Add visual feedback
        showSuccessMessage('Transport settings saved successfully!');
    } catch (error) {
        console.error('Error saving transport settings:', error);
        alert('Failed to save transport settings. Error: ' + error.message);
    }
}

/**
 * Load transport settings from localStorage
 */
function loadTransportSettings() {
    console.log('Loading transport settings...');
    
    try {
        // Get form elements
        const baseFare = document.getElementById('baseFare');
        const ratePerKm = document.getElementById('ratePerKm');
        const rushHourMultiplier = document.getElementById('rushHourMultiplier');
        const nightMultiplier = document.getElementById('nightMultiplier');
        const weekendMultiplier = document.getElementById('weekendMultiplier');
        const sedanRate = document.getElementById('sedanRate');
        const suvRate = document.getElementById('suvRate');
        const vanRate = document.getElementById('vanRate');
        const luxuryRate = document.getElementById('luxuryRate');
        
        // Check if all elements exist
        if (!baseFare || !ratePerKm || !rushHourMultiplier || !nightMultiplier || 
            !weekendMultiplier || !sedanRate || !suvRate || !vanRate || !luxuryRate) {
            console.error('One or more form elements not found');
            return;
        }
        
        // Default settings
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
        
        // Get settings from localStorage
        const settingsStr = localStorage.getItem('transportSettings');
        
        if (!settingsStr) {
            console.log('No saved transport settings found, using defaults');
            
            // Use default values
            baseFare.value = defaultSettings.baseFare;
            ratePerKm.value = defaultSettings.ratePerKm;
            rushHourMultiplier.value = defaultSettings.rushHourMultiplier;
            nightMultiplier.value = defaultSettings.nightMultiplier;
            weekendMultiplier.value = defaultSettings.weekendMultiplier;
            sedanRate.value = defaultSettings.vehicleRates.sedan;
            suvRate.value = defaultSettings.vehicleRates.suv;
            vanRate.value = defaultSettings.vehicleRates.van;
            luxuryRate.value = defaultSettings.vehicleRates.luxury;
            
            return;
        }
        
        try {
            // Parse the JSON string to object
            const settings = JSON.parse(settingsStr);
            console.log('Parsed settings:', settings);
            
            // Populate the form with saved values (with fallbacks)
            baseFare.value = settings.baseFare || defaultSettings.baseFare;
            ratePerKm.value = settings.ratePerKm || defaultSettings.ratePerKm;
            rushHourMultiplier.value = settings.rushHourMultiplier || defaultSettings.rushHourMultiplier;
            nightMultiplier.value = settings.nightMultiplier || defaultSettings.nightMultiplier;
            weekendMultiplier.value = settings.weekendMultiplier || defaultSettings.weekendMultiplier;
            
            // Handle vehicle rates (might be in a nested object)
            const vehicleRates = settings.vehicleRates || {};
            
            sedanRate.value = vehicleRates.sedan || defaultSettings.vehicleRates.sedan;
            suvRate.value = vehicleRates.suv || defaultSettings.vehicleRates.suv;
            vanRate.value = vehicleRates.van || defaultSettings.vehicleRates.van;
            luxuryRate.value = vehicleRates.luxury || defaultSettings.vehicleRates.luxury;
            
            console.log('Transport settings loaded successfully');
        } catch (error) {
            console.error('Error parsing transport settings:', error);
            
            // Use default values on error
            baseFare.value = defaultSettings.baseFare;
            ratePerKm.value = defaultSettings.ratePerKm;
            rushHourMultiplier.value = defaultSettings.rushHourMultiplier;
            nightMultiplier.value = defaultSettings.nightMultiplier;
            weekendMultiplier.value = defaultSettings.weekendMultiplier;
            sedanRate.value = defaultSettings.vehicleRates.sedan;
            suvRate.value = defaultSettings.vehicleRates.suv;
            vanRate.value = defaultSettings.vehicleRates.van;
            luxuryRate.value = defaultSettings.vehicleRates.luxury;
        }
    } catch (error) {
        console.error('Error loading transport settings:', error);
    }
}

/**
 * Show a success message toast
 */
function showSuccessMessage(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#28a745';
    toast.style.color = 'white';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    toast.textContent = message;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Remove after 3 seconds with fade effect
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
} 