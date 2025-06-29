/**
 * Cloudinary Integration Test Script
 * Run this in browser console to test the integration
 */

// Test Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dmpfjul1j',
    uploadPreset: 'sri_lanka_unsigned',
    apiKey: '476146554929449'
};

// Test 1: Basic Upload Test
async function testBasicUpload() {
    console.log('🧪 Test 1: Basic Upload Test');
    
    // Create a test image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Draw test pattern
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(1, '#4CAF50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cloudinary Test', 200, 150);
    ctx.font = '16px Arial';
    ctx.fillText(new Date().toLocaleString(), 200, 200);
    
    // Convert to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'test-image.jpg');
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'test-uploads');
    formData.append('tags', 'test,integration-test');
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Upload successful!', data);
        console.log('📸 Image URL:', data.secure_url);
        console.log('🆔 Public ID:', data.public_id);
        
        // Display the uploaded image
        displayTestResult('Test 1: Basic Upload', data.secure_url, 'success');
        
        return data;
    } catch (error) {
        console.error('❌ Upload failed:', error);
        displayTestResult('Test 1: Basic Upload', null, 'error', error.message);
        return null;
    }
}

// Test 2: Transformation Test
async function testTransformations(publicId) {
    console.log('🧪 Test 2: Image Transformations');
    
    if (!publicId) {
        console.error('❌ No public ID provided for transformation test');
        return;
    }
    
    const transformations = [
        {
            name: 'Thumbnail',
            url: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_fill,h_150,w_150,f_auto,q_auto/${publicId}`
        },
        {
            name: 'Medium',
            url: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_fill,h_400,w_600,f_auto,q_auto/${publicId}`
        },
        {
            name: 'Rounded',
            url: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_fill,h_200,w_200,r_max,f_auto,q_auto/${publicId}`
        },
        {
            name: 'Blur Effect',
            url: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/e_blur:300,f_auto,q_auto/${publicId}`
        }
    ];
    
    transformations.forEach(transform => {
        console.log(`📐 ${transform.name}:`, transform.url);
        displayTestResult(`Test 2: ${transform.name}`, transform.url, 'success');
    });
}

// Test 3: Error Handling Test
async function testErrorHandling() {
    console.log('🧪 Test 3: Error Handling');
    
    // Test with invalid preset
    const formData = new FormData();
    formData.append('file', 'invalid-data');
    formData.append('upload_preset', 'invalid_preset_name');
    
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.log('✅ Error handling works correctly:', data.error.message);
            displayTestResult('Test 3: Error Handling', null, 'info', `Expected error: ${data.error.message}`);
        } else {
            console.error('❌ Expected error but got success');
        }
    } catch (error) {
        console.log('✅ Error caught:', error.message);
        displayTestResult('Test 3: Error Handling', null, 'info', `Caught error: ${error.message}`);
    }
}

// Display test results in a nice UI
function displayTestResult(testName, imageUrl, status, message) {
    // Create or get results container
    let container = document.getElementById('cloudinary-test-results');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cloudinary-test-results';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            padding: 20px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        container.innerHTML = '<h2 style="margin-top: 0;">Cloudinary Test Results</h2>';
        document.body.appendChild(container);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeBtn.onclick = () => container.remove();
        container.appendChild(closeBtn);
    }
    
    // Create result item
    const resultItem = document.createElement('div');
    resultItem.style.cssText = `
        margin: 15px 0;
        padding: 15px;
        background: ${status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#d1ecf1'};
        border: 1px solid ${status === 'success' ? '#c3e6cb' : status === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 5px;
    `;
    
    resultItem.innerHTML = `
        <strong>${testName}</strong>
        ${message ? `<p style="margin: 5px 0; font-size: 14px;">${message}</p>` : ''}
        ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; margin-top: 10px; border-radius: 5px;">` : ''}
    `;
    
    container.appendChild(resultItem);
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Cloudinary Integration Tests...');
    console.log('📋 Configuration:', CLOUDINARY_CONFIG);
    
    // Test 1: Basic Upload
    const uploadResult = await testBasicUpload();
    
    // Test 2: Transformations (if upload succeeded)
    if (uploadResult && uploadResult.public_id) {
        await testTransformations(uploadResult.public_id);
    }
    
    // Test 3: Error Handling
    await testErrorHandling();
    
    console.log('✅ All tests completed!');
}

// Auto-run tests
console.log('💡 Run runAllTests() to start testing');
console.log('💡 Or copy this entire script and paste it in the browser console');

// Export for use
window.cloudinaryTest = {
    runAllTests,
    testBasicUpload,
    testTransformations,
    testErrorHandling,
    config: CLOUDINARY_CONFIG
}; 