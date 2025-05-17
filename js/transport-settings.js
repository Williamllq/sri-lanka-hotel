/**
 * Transport Settings JavaScript
 * 
 * This script handles the functionality for the transport settings page:
 * - Setting base rates for transportation
 * - Managing time-based multipliers
 * - Managing vehicle type multipliers
 * - Saving and loading settings to/from localStorage
 */

// Initialize transport settings when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing transport settings...');
    
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
    const saveTransportSettingsBtn = document.getElementById('saveTransportSettingsBtn');
    
    // Check if all elements exist
    if (!baseFare || !ratePerKm || !rushHourMultiplier || !nightMultiplier || 
        !weekendMultiplier || !sedanRate || !suvRate || !vanRate || !luxuryRate) {
        console.error('One or more transport settings form elements not found');
        return;
    }
    
    // Load saved settings
    loadTransportSettings();
    
    // Add save button click handler
    if (saveTransportSettingsBtn) {
        console.log('Adding event listener to save transport settings button');
        saveTransportSettingsBtn.addEventListener('click', saveTransportSettings);
    } else {
        console.error('Save transport settings button not found');
    }
    
    /**
     * Save transport settings to localStorage
     */
    function saveTransportSettings() {
        console.log('Save transport settings function called');
        
        try {
            // Get values from form and convert to numbers
            const settings = {
                baseFare: parseFloat(baseFare.value),
                ratePerKm: parseFloat(ratePerKm.value),
                rushHourMultiplier: parseFloat(rushHourMultiplier.value),
                nightMultiplier: parseFloat(nightMultiplier.value),
                weekendMultiplier: parseFloat(weekendMultiplier.value),
                vehicleRates: {
                    sedan: parseFloat(sedanRate.value),
                    suv: parseFloat(suvRate.value),
                    van: parseFloat(vanRate.value),
                    luxury: parseFloat(luxuryRate.value)
                },
                lastUpdated: new Date().toISOString()
            };
            
            // Validate all values are numbers
            const validateFields = [
                { name: 'Base Fare', value: settings.baseFare },
                { name: 'Rate per Kilometer', value: settings.ratePerKm },
                { name: 'Rush Hour Multiplier', value: settings.rushHourMultiplier },
                { name: 'Night Time Multiplier', value: settings.nightMultiplier },
                { name: 'Weekend Multiplier', value: settings.weekendMultiplier },
                { name: 'Sedan Rate', value: settings.vehicleRates.sedan },
                { name: 'SUV Rate', value: settings.vehicleRates.suv },
                { name: 'Van Rate', value: settings.vehicleRates.van },
                { name: 'Luxury Vehicle Rate', value: settings.vehicleRates.luxury }
            ];
            
            // Check for invalid values
            for (const field of validateFields) {
                if (isNaN(field.value)) {
                    throw new Error(`${field.name} must be a valid number`);
                }
            }
            
            console.log('Saving transport settings:', settings);
            
            // Save to localStorage
            localStorage.setItem('transportSettings', JSON.stringify(settings));
            
            // Verify save was successful
            const savedSettings = localStorage.getItem('transportSettings');
            
            if (savedSettings) {
                console.log('Transport settings saved successfully');
                
                // Show success message (using alert if toastr is not available)
                if (typeof toastr !== 'undefined') {
                    toastr.success('Transport settings saved successfully!');
                } else {
                    alert('Transport settings saved successfully!');
                }
            } else {
                console.error('Failed to save transport settings');
                
                // Show error message
                if (typeof toastr !== 'undefined') {
                    toastr.error('Failed to save transport settings. Please try again.');
                } else {
                    alert('Failed to save transport settings. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error saving transport settings:', error);
            
            // Show error message
            if (typeof toastr !== 'undefined') {
                toastr.error('Error: ' + error.message);
            } else {
                alert('Error: ' + error.message);
            }
        }
    }
    
    /**
     * Load transport settings from localStorage
     */
    function loadTransportSettings() {
        console.log('Loading transport settings...');
        
        try {
            // Get settings from localStorage
            const savedSettings = localStorage.getItem('transportSettings');
            console.log('Raw saved settings:', savedSettings);
            
            // Default settings if none found in localStorage
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
            
            if (!savedSettings) {
                console.log('No saved transport settings found, using defaults');
                
                // Fill form with default values
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
            
            // Parse saved settings
            const settings = JSON.parse(savedSettings);
            console.log('Parsed settings:', settings);
            
            // Update form with saved values or use defaults for missing values
            baseFare.value = settings.baseFare || defaultSettings.baseFare;
            ratePerKm.value = settings.ratePerKm || defaultSettings.ratePerKm;
            rushHourMultiplier.value = settings.rushHourMultiplier || defaultSettings.rushHourMultiplier;
            nightMultiplier.value = settings.nightMultiplier || defaultSettings.nightMultiplier;
            weekendMultiplier.value = settings.weekendMultiplier || defaultSettings.weekendMultiplier;
            
            // Get vehicle rates with defaults if missing
            const vehicleRates = settings.vehicleRates || defaultSettings.vehicleRates;
            
            sedanRate.value = vehicleRates.sedan || defaultSettings.vehicleRates.sedan;
            suvRate.value = vehicleRates.suv || defaultSettings.vehicleRates.suv;
            vanRate.value = vehicleRates.van || defaultSettings.vehicleRates.van;
            luxuryRate.value = vehicleRates.luxury || defaultSettings.vehicleRates.luxury;
            
            console.log('Transport settings loaded successfully');
        } catch (error) {
            console.error('Error loading transport settings:', error);
            
            // Use default values if error occurs
            baseFare.value = 30;
            ratePerKm.value = 0.5;
            rushHourMultiplier.value = 1.5;
            nightMultiplier.value = 1.3;
            weekendMultiplier.value = 1.2;
            sedanRate.value = 1.0;
            suvRate.value = 1.5;
            vanRate.value = 1.8;
            luxuryRate.value = 2.2;
        }
    }
}); 