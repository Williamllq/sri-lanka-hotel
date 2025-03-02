// Transport functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Transport script loaded');
    
    // Initialize vehicle selection
    initVehicleSelection();
    
    // Check if fare calculation form elements exist
    const calculateBtn = document.getElementById('calculateFareBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            // The distance calculation is handled in map-backup.js
            // This event will trigger the fare display
            console.log('Calculate fare button clicked');
        });
    }
});

// Initialize vehicle selection
function initVehicleSelection() {
    const vehicleOptions = document.querySelectorAll('.vehicle-option input');
    
    vehicleOptions.forEach(option => {
        option.addEventListener('change', function() {
            console.log('Vehicle selected:', this.value);
            
            // If we already have a distance calculated, update the fare
            const distanceEl = document.getElementById('distance');
            if (distanceEl && distanceEl.style.display !== 'none') {
                const distanceText = distanceEl.textContent;
                const match = distanceText.match(/(\d+\.?\d*)/);
                if (match) {
                    const distance = parseFloat(match[1]);
                    calculatePrice(distance);
                }
            }
        });
    });
}

// Calculate price based on distance and selected vehicle
function calculatePrice(distance) {
    console.log('Calculating price for distance:', distance);
    
    if (!distance || isNaN(distance) || distance <= 0) {
        console.error('Invalid distance value:', distance);
        return;
    }
    
    // Get selected vehicle type
    let vehicleType = 'sedan'; // Default
    const selectedVehicle = document.querySelector('input[name="vehicleType"]:checked');
    
    if (selectedVehicle) {
        vehicleType = selectedVehicle.value;
    } else {
        console.warn('No vehicle selected, using default (sedan)');
    }
    
    console.log('Selected vehicle type:', vehicleType);
    
    // Base rates by vehicle type (USD)
    const rates = {
        sedan: {
            base: 20,
            perKm: 0.8
        },
        suv: {
            base: 30,
            perKm: 1.2
        },
        van: {
            base: 40,
            perKm: 1.5
        }
    };
    
    // Calculate fare
    const rate = rates[vehicleType] || rates.sedan;
    const totalFare = rate.base + (distance * rate.perKm);
    
    console.log('Calculated fare:', totalFare);
    
    // Display fare result
    displayFareResult(totalFare, vehicleType, distance);
    
    return totalFare;
}

// Display fare result with nice formatting
function displayFareResult(fare, vehicleType, distance) {
    const fareResult = document.getElementById('fareResult');
    if (!fareResult) return;
    
    // Format the fare result text
    const formattedFare = fare.toFixed(2);
    const vehicleNames = {
        sedan: 'Sedan',
        suv: 'SUV',
        van: 'Van'
    };
    
    const vehicleName = vehicleNames[vehicleType] || 'Vehicle';
    
    // Create fare result text with nice formatting
    fareResult.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
                <strong>Vehicle Type:</strong>
            </div>
            <div>
                ${vehicleName}
            </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
            <div>
                <strong>Distance:</strong>
            </div>
            <div>
                ${distance.toFixed(2)} km
            </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 1.2em; font-weight: bold; color: #218838;">
            <div>
                Estimated Fare:
            </div>
            <div>
                $${formattedFare}
            </div>
        </div>
    `;
    
    // Show the result
    fareResult.style.display = 'block';
    
    // Add animation effect
    fareResult.style.animation = 'none';
    setTimeout(() => {
        fareResult.style.animation = 'fadeIn 0.5s';
    }, 10);
}

// Helper function to show fare result messages
function showFareResult(message, type = 'info') {
    const fareResult = document.getElementById('fareResult');
    if (!fareResult) return;
    
    // Set message with appropriate styling
    let style = '';
    switch(type) {
        case 'error':
            style = 'color: #dc3545; font-weight: bold;';
            break;
        case 'success':
            style = 'color: #28a745; font-weight: bold;';
            break;
        default:
            style = 'color: #007bff;';
    }
    
    fareResult.innerHTML = `<div style="${style}">${message}</div>`;
    fareResult.style.display = 'block';
} 