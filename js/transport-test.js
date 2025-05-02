// 测试脚本，用于验证localStorage在管理员和用户界面之间的共享情况
document.addEventListener('DOMContentLoaded', function() {
    console.log('Transport test script loaded');
    
    // 添加测试按钮
    const testContainer = document.createElement('div');
    testContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #fff;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 320px;
        overflow: auto;
        max-height: 80vh;
    `;
    
    let testHtml = `
        <h4 style="margin-top:0">Transport Settings Test</h4>
        <div style="margin-bottom:10px">
            <button id="testShowSettings">Show Settings</button>
            <button id="testClearSettings">Clear Settings</button>
        </div>
    `;
    
    // 在两个页面上都添加直接修改设置的功能
    testHtml += `
        <div style="margin-bottom:10px">
            <label for="testBaseFare">Base Fare:</label>
            <input type="number" id="testBaseFare" style="width:80px" value="3">
            <button id="testSetBaseFare">Set</button>
        </div>
        <div style="margin-bottom:10px">
            <label for="testRatePerKm">Rate per Km:</label>
            <input type="number" id="testRatePerKm" style="width:80px" step="0.1" value="1.0">
            <button id="testSetRatePerKm">Set</button>
        </div>
        <div>
            <button id="testTriggerQuote" style="background-color:#4CAF50;color:white;padding:5px 10px;">Trigger Quote Calculation</button>
        </div>
    `;
    
    testHtml += `<div id="testSettingsOutput" style="margin-top: 10px; font-size: 12px;"></div>`;
    testContainer.innerHTML = testHtml;
    document.body.appendChild(testContainer);
    
    // 添加事件监听器
    document.getElementById('testShowSettings').addEventListener('click', showCurrentSettings);
    document.getElementById('testClearSettings').addEventListener('click', clearSettings);
    document.getElementById('testSetBaseFare').addEventListener('click', setBaseFare);
    document.getElementById('testSetRatePerKm').addEventListener('click', setRatePerKm);
    document.getElementById('testTriggerQuote').addEventListener('click', triggerQuoteCalculation);
    
    // 在页面加载时显示当前设置
    showCurrentSettings();
    
    // 直接设置基本价格
    function setBaseFare() {
        const newBaseFare = parseFloat(document.getElementById('testBaseFare').value);
        if (isNaN(newBaseFare)) {
            alert('Please enter a valid number');
            return;
        }
        
        // 获取当前设置
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
        
        let transportSettings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
        
        // 更新基本价格
        transportSettings.baseFare = newBaseFare;
        
        // 保存到localStorage
        localStorage.setItem('transportSettings', JSON.stringify(transportSettings));
        
        // 更新显示
        showCurrentSettings();
        
        // 更新管理员表单（如果在管理员页面）
        const adminBaseFareInput = document.getElementById('baseFare');
        if (adminBaseFareInput) {
            adminBaseFareInput.value = newBaseFare;
        }
        
        alert(`Base fare updated to $${newBaseFare}`);
    }
    
    // 直接设置每公里价格
    function setRatePerKm() {
        const newRatePerKm = parseFloat(document.getElementById('testRatePerKm').value);
        if (isNaN(newRatePerKm)) {
            alert('Please enter a valid number');
            return;
        }
        
        // 获取当前设置
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
        
        let transportSettings = JSON.parse(localStorage.getItem('transportSettings') || JSON.stringify(defaultSettings));
        
        // 更新每公里价格
        transportSettings.ratePerKm = newRatePerKm;
        
        // 保存到localStorage
        localStorage.setItem('transportSettings', JSON.stringify(transportSettings));
        
        // 更新显示
        showCurrentSettings();
        
        // 更新管理员表单（如果在管理员页面）
        const adminRatePerKmInput = document.getElementById('ratePerKm');
        if (adminRatePerKmInput) {
            adminRatePerKmInput.value = newRatePerKm;
        }
        
        alert(`Rate per km updated to $${newRatePerKm}`);
    }
    
    // 触发报价计算（仅在用户页面）
    function triggerQuoteCalculation() {
        if (window.location.href.includes('admin-dashboard')) {
            alert('This function only works on the user-facing page');
            return;
        }
        
        // 找到计算报价的函数
        if (typeof calculateQuote === 'function') {
            // 检查必要的输入是否存在
            const pickupInput = document.getElementById('pickupLocation');
            const destInput = document.getElementById('destinationLocation');
            
            if (!pickupInput || !pickupInput.dataset.lat || !pickupInput.dataset.lng) {
                alert('Please select a pickup location first');
                return;
            }
            
            if (!destInput || !destInput.dataset.lat || !destInput.dataset.lng) {
                alert('Please select a destination first');
                return;
            }
            
            // 调用函数
            calculateQuote();
            alert('Quote calculation triggered!');
        } else {
            alert('Quote calculation function not found');
        }
    }
    
    // 显示当前设置
    function showCurrentSettings() {
        const outputElement = document.getElementById('testSettingsOutput');
        
        // 从localStorage获取设置
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
        
        const rawData = localStorage.getItem('transportSettings');
        const transportSettings = JSON.parse(rawData || JSON.stringify(defaultSettings));
        
        // 显示关键设置
        outputElement.innerHTML = `
            <strong>Current Transport Settings:</strong><br>
            Base Fare: $${transportSettings.baseFare}<br>
            Rate per Km: $${transportSettings.ratePerKm}<br>
            <hr>
            <strong>Technical Info:</strong><br>
            Storage Type: ${typeof localStorage}<br>
            localStorage Available: ${!!localStorage}<br>
            Raw Data: ${rawData ? `<span style="color:green">Found</span>` : `<span style="color:red">Not Found</span>`}<br>
            Page: ${window.location.pathname}<br>
            Quote Function: ${typeof calculateQuote === 'function' ? `<span style="color:green">Available</span>` : `<span style="color:red">Not Available</span>`}
        `;
        
        console.log('Current transport settings:', transportSettings);
    }
    
    // 清除设置
    function clearSettings() {
        if (confirm('Are you sure you want to clear the transport settings? This will reset to default values.')) {
            localStorage.removeItem('transportSettings');
            showCurrentSettings();
            alert('Transport settings cleared and reset to defaults.');
        }
    }
}); 