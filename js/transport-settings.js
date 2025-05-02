/**
 * Transport Settings functionality
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
    console.log('Initializing transport settings...');
    
    // Get the save button
    const saveButton = document.getElementById('saveTransportSettingsBtn');
    
    // Add event listener to save button
    if (saveButton) {
        saveButton.addEventListener('click', saveTransportSettings);
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
    // Get all input values
    const transportSettings = {
        baseFare: parseFloat(document.getElementById('baseFare').value) || 30,
        ratePerKm: parseFloat(document.getElementById('ratePerKm').value) || 0.5,
        rushHourMultiplier: parseFloat(document.getElementById('rushHourMultiplier').value) || 1.5,
        nightMultiplier: parseFloat(document.getElementById('nightMultiplier').value) || 1.3,
        weekendMultiplier: parseFloat(document.getElementById('weekendMultiplier').value) || 1.2,
        sedanRate: parseFloat(document.getElementById('sedanRate').value) || 1.0,
        suvRate: parseFloat(document.getElementById('suvRate').value) || 1.5,
        vanRate: parseFloat(document.getElementById('vanRate').value) || 1.8,
        luxuryRate: parseFloat(document.getElementById('luxuryRate').value) || 2.2
    };

    console.log('Saving transport settings:', transportSettings);
    
    try {
        // Convert to JSON string and save to localStorage
        localStorage.setItem('transportSettings', JSON.stringify(transportSettings));
        
        // Show success message
        console.log('Transport settings saved successfully');
        alert('Transport settings saved successfully!');
    } catch (error) {
        console.error('Error saving transport settings:', error);
        alert('Failed to save transport settings. Please try again.');
    }
}

/**
 * Load transport settings from localStorage
 */
function loadTransportSettings() {
    console.log('Loading transport settings...');
    
    try {
        // Get settings from localStorage
        const settings = localStorage.getItem('transportSettings');
        
        if (settings) {
            // Parse the JSON string to object
            const transportSettings = JSON.parse(settings);
            
            // Populate the form with saved values
            document.getElementById('baseFare').value = transportSettings.baseFare || 30;
            document.getElementById('ratePerKm').value = transportSettings.ratePerKm || 0.5;
            document.getElementById('rushHourMultiplier').value = transportSettings.rushHourMultiplier || 1.5;
            document.getElementById('nightMultiplier').value = transportSettings.nightMultiplier || 1.3;
            document.getElementById('weekendMultiplier').value = transportSettings.weekendMultiplier || 1.2;
            document.getElementById('sedanRate').value = transportSettings.sedanRate || 1.0;
            document.getElementById('suvRate').value = transportSettings.suvRate || 1.5;
            document.getElementById('vanRate').value = transportSettings.vanRate || 1.8;
            document.getElementById('luxuryRate').value = transportSettings.luxuryRate || 2.2;
            
            console.log('Transport settings loaded successfully');
        } else {
            console.log('No saved transport settings found, using defaults');
        }
    } catch (error) {
        console.error('Error loading transport settings:', error);
    }
} 