// Standalone test function for displaying current transport rates
// To be included in both admin and user pages for testing

function displayCurrentRatesTest() {
    console.log('Displaying current rates test...');
    
    // Create test container if it doesn't already exist
    let testContainer = document.getElementById('ratesTestContainer');
    
    if (!testContainer) {
        testContainer = document.createElement('div');
        testContainer.id = 'ratesTestContainer';
        testContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f0f8ff;
            border: 1px solid #4682b4;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 300px;
            font-size: 12px;
        `;
        document.body.appendChild(testContainer);
    }
    
    // Get transport settings
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
    
    // Get the raw data string
    const rawData = localStorage.getItem('transportSettings');
    console.log('Raw transport settings data:', rawData);
    
    // Parse the data
    let transportSettings;
    try {
        transportSettings = rawData ? JSON.parse(rawData) : defaultSettings;
        console.log('Parsed transport settings:', transportSettings);
    } catch (e) {
        console.error('Error parsing transport settings:', e);
        transportSettings = defaultSettings;
    }
    
    // Display settings in the container
    testContainer.innerHTML = `
        <h4 style="margin-top:0;color:#4682b4;">Transport Rates Test</h4>
        <div>
            <strong>Current Settings:</strong><br>
            Base Fare: $${transportSettings.baseFare}<br>
            Rate per Km: $${transportSettings.ratePerKm}<br>
            Rush Hour: ${transportSettings.rushHourMultiplier}x<br>
            Night: ${transportSettings.nightMultiplier}x<br>
            Weekend: ${transportSettings.weekendMultiplier}x<br>
        </div>
        <div style="margin-top:8px">
            <strong>Vehicle Rates:</strong><br>
            Sedan: ${transportSettings.vehicleRates.sedan}x<br>
            SUV: ${transportSettings.vehicleRates.suv}x<br>
            Van: ${transportSettings.vehicleRates.van}x<br>
            Luxury: ${transportSettings.vehicleRates.luxury}x<br>
        </div>
        <div style="margin-top:8px;font-size:10px;color:#666;">
            localStorage status: ${rawData ? 'Data found' : 'No data'}<br>
            Page: ${window.location.pathname}
        </div>
        <button onclick="displayCurrentRatesTest()" style="margin-top:8px;font-size:11px;padding:3px 6px;">Refresh</button>
    `;
}

// Auto-run when included
document.addEventListener('DOMContentLoaded', function() {
    console.log('Rate display test script loaded');
    
    // Wait a moment for other scripts to initialize
    setTimeout(displayCurrentRatesTest, 1000);
    
    // Also attach to window for manual testing from console
    window.displayCurrentRatesTest = displayCurrentRatesTest;
}); 