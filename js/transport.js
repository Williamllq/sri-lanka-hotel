document.addEventListener('DOMContentLoaded', function() {
    const transportForm = document.getElementById('transportForm');
    
    if (transportForm) {
        transportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 收集表单数据
            const formData = {
                serviceType: document.getElementById('serviceType').value,
                date: document.getElementById('serviceDate').value,
                time: document.getElementById('serviceTime').value,
                passengers: document.getElementById('passengers').value,
                pickupLocation: document.getElementById('pickupLocation').value,
                destination: document.getElementById('destination').value,
                requirements: document.getElementById('requirements').value
            };
            
            // 这里可以添加表单验证
            
            // 显示确认消息
            alert('Thank you for your booking! We will contact you shortly to confirm your reservation.');
            
            // 清空表单
            transportForm.reset();
        });
    }
    
    // 设置日期选择器的最小日期为今天
    const dateInput = document.getElementById('serviceDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}); 