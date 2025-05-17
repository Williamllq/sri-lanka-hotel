/**
 * Transport Settings Debug Script
 * This script will be injected to debug the transport settings functionality
 */

(function() {
  console.clear();
  console.log('Transport debug script loaded');
  
  // Check elements
  const saveBtn = document.getElementById('saveTransportSettingsBtn');
  const baseFare = document.getElementById('baseFare');
  const ratePerKm = document.getElementById('ratePerKm');
  const rushHourMultiplier = document.getElementById('rushHourMultiplier');
  const nightMultiplier = document.getElementById('nightMultiplier');
  const weekendMultiplier = document.getElementById('weekendMultiplier');
  const sedanRate = document.getElementById('sedanRate');
  const suvRate = document.getElementById('suvRate');
  const vanRate = document.getElementById('vanRate');
  const luxuryRate = document.getElementById('luxuryRate');
  
  // Log element status
  console.log('Save button exists:', !!saveBtn);
  console.log('Form elements exist:', {
    baseFare: !!baseFare,
    ratePerKm: !!ratePerKm,
    rushHourMultiplier: !!rushHourMultiplier,
    nightMultiplier: !!nightMultiplier,
    weekendMultiplier: !!weekendMultiplier,
    sedanRate: !!sedanRate,
    suvRate: !!suvRate,
    vanRate: !!vanRate,
    luxuryRate: !!luxuryRate
  });
  
  // Test localStorage
  try {
    localStorage.setItem('transport_test', 'test');
    const testValue = localStorage.getItem('transport_test');
    console.log('localStorage test:', testValue === 'test');
    localStorage.removeItem('transport_test');
  } catch (e) {
    console.error('localStorage test failed:', e);
  }
  
  // Log current transport settings in localStorage
  console.log('Current transport settings in localStorage:', localStorage.getItem('transportSettings'));
  
  // Add our own event handler to the save button
  if (saveBtn) {
    // First remove all existing event listeners (not technically possible, but this is a workaround)
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    // Now add our own listener
    newSaveBtn.addEventListener('click', function() {
      console.log('Save button clicked (from debug script)');
      
      try {
        // Get form values
        const settings = {
          baseFare: parseFloat(baseFare.value) || 0,
          ratePerKm: parseFloat(ratePerKm.value) || 0,
          rushHourMultiplier: parseFloat(rushHourMultiplier.value) || 0,
          nightMultiplier: parseFloat(nightMultiplier.value) || 0,
          weekendMultiplier: parseFloat(weekendMultiplier.value) || 0,
          vehicleRates: {
            sedan: parseFloat(sedanRate.value) || 0,
            suv: parseFloat(suvRate.value) || 0,
            van: parseFloat(vanRate.value) || 0,
            luxury: parseFloat(luxuryRate.value) || 0
          }
        };
        
        console.log('Transport settings to save:', settings);
        
        // Clear previous settings
        localStorage.removeItem('transportSettings');
        
        // Save to localStorage
        localStorage.setItem('transportSettings', JSON.stringify(settings));
        
        // Verify save
        const savedData = localStorage.getItem('transportSettings');
        console.log('Saved data:', savedData);
        
        // Add visual feedback
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = '#28a745';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        toast.textContent = 'Transport settings saved successfully!';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);
        
        return false; // Prevent default button behavior
      } catch (e) {
        console.error('Error saving transport settings from debug script:', e);
        alert('Error saving settings: ' + e.message);
      }
    });
    
    console.log('Debug event handler added to save button');
  }
})(); 