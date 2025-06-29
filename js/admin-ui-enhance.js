/**
 * Admin UI/UX Enhancement
 * Improves the admin dashboard user interface and experience
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin UI Enhancement loaded');
    
    // Initialize UI enhancements
    initDarkMode();
    initQuickActions();
    initDataVisualization();
    initBulkOperations();
    initSearchEnhancements();
    initNotifications();
    initKeyboardShortcuts();
    enhanceFormValidation();
    addLoadingStates();
});

/**
 * Initialize dark mode toggle
 */
function initDarkMode() {
    // Check if dark mode preference exists
    const darkMode = localStorage.getItem('adminDarkMode') === 'true';
    
    // Create dark mode toggle button
    const topbar = document.querySelector('.admin-topbar');
    if (topbar) {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        darkModeToggle.title = 'Toggle Dark Mode';
        
        // Insert before user info
        const userInfo = topbar.querySelector('.admin-user');
        topbar.insertBefore(darkModeToggle, userInfo);
        
        // Apply dark mode if enabled
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Toggle dark mode on click
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('adminDarkMode', isDark);
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
    
    // Add dark mode styles
    const style = document.createElement('style');
    style.textContent = `
        /* Dark Mode Toggle Button */
        .dark-mode-toggle {
            background: none;
            border: none;
            color: #666;
            font-size: 18px;
            cursor: pointer;
            padding: 8px 12px;
            margin-right: 20px;
            transition: all 0.3s ease;
        }
        
        .dark-mode-toggle:hover {
            color: #2196F3;
            transform: rotate(180deg);
        }
        
        /* Dark Mode Styles */
        body.dark-mode {
            background-color: #1a1a1a;
            color: #e0e0e0;
        }
        
        body.dark-mode .admin-sidebar {
            background-color: #252525;
            border-color: #333;
        }
        
        body.dark-mode .admin-content {
            background-color: #1a1a1a;
        }
        
        body.dark-mode .admin-topbar {
            background-color: #252525;
            border-color: #333;
        }
        
        body.dark-mode .admin-section {
            background-color: #252525;
            border-color: #333;
        }
        
        body.dark-mode .stat-box {
            background-color: #2a2a2a;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .modal-content {
            background-color: #252525;
            color: #e0e0e0;
        }
        
        body.dark-mode input,
        body.dark-mode select,
        body.dark-mode textarea {
            background-color: #333;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .admin-btn {
            background-color: #333;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .admin-btn.primary {
            background-color: #1976d2;
            border-color: #1976d2;
        }
        
        body.dark-mode .picture-card {
            background-color: #2a2a2a;
            border-color: #444;
        }
        
        body.dark-mode .table {
            color: #e0e0e0;
        }
        
        body.dark-mode .table-hover tbody tr:hover {
            background-color: #333;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize quick actions panel
 */
function initQuickActions() {
    const quickActionsHtml = `
        <div class="quick-actions-panel">
            <h4>Quick Actions</h4>
            <div class="quick-action-buttons">
                <button class="quick-action" data-action="upload-image">
                    <i class="fas fa-upload"></i>
                    <span>Upload Image</span>
                </button>
                <button class="quick-action" data-action="add-hotel">
                    <i class="fas fa-hotel"></i>
                    <span>Add Hotel</span>
                </button>
                <button class="quick-action" data-action="view-orders">
                    <i class="fas fa-shopping-cart"></i>
                    <span>View Orders</span>
                </button>
                <button class="quick-action" data-action="analytics">
                    <i class="fas fa-chart-line"></i>
                    <span>Analytics</span>
                </button>
            </div>
        </div>
    `;
    
    // Add to dashboard section
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        const statsGrid = dashboardSection.querySelector('.stats-grid');
        if (statsGrid) {
            const quickActionsDiv = document.createElement('div');
            quickActionsDiv.innerHTML = quickActionsHtml;
            statsGrid.parentNode.insertBefore(quickActionsDiv.firstElementChild, statsGrid.nextSibling);
            
            // Add event listeners
            document.querySelectorAll('.quick-action').forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    handleQuickAction(action);
                });
            });
        }
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .quick-actions-panel {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .quick-actions-panel h4 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .quick-action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }
        
        .quick-action {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .quick-action:hover {
            background: #e3f2fd;
            border-color: #2196F3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
        }
        
        .quick-action i {
            font-size: 24px;
            margin-bottom: 8px;
            color: #2196F3;
        }
        
        .quick-action span {
            font-size: 12px;
            text-align: center;
        }
        
        body.dark-mode .quick-actions-panel {
            background: #252525;
        }
        
        body.dark-mode .quick-action {
            background: #333;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .quick-action:hover {
            background: #1976d2;
            border-color: #1976d2;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Handle quick action clicks
 */
function handleQuickAction(action) {
    switch(action) {
        case 'upload-image':
            // Trigger upload modal
            document.getElementById('uploadPictureBtn')?.click();
            break;
        case 'add-hotel':
            // Navigate to hotels section and open add modal
            document.querySelector('[data-section="hotels"]')?.click();
            setTimeout(() => {
                document.getElementById('addHotelBtn')?.click();
            }, 300);
            break;
        case 'view-orders':
            // Navigate to orders section
            document.querySelector('[data-section="orders"]')?.click();
            break;
        case 'analytics':
            // Scroll to analytics section
            document.getElementById('totalVisits')?.scrollIntoView({ behavior: 'smooth' });
            break;
    }
}

/**
 * Initialize enhanced data visualization
 */
function initDataVisualization() {
    // Add animation to stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent) || 0;
        animateValue(stat, 0, finalValue, 1000);
    });
    
    // Add sparkline charts to stat boxes
    const statBoxes = document.querySelectorAll('.stat-box');
    statBoxes.forEach(box => {
        if (!box.querySelector('.stat-chart')) {
            const chartDiv = document.createElement('div');
            chartDiv.className = 'stat-chart';
            chartDiv.innerHTML = '<canvas width="100" height="30"></canvas>';
            box.appendChild(chartDiv);
            
            // Generate random sparkline data
            const canvas = chartDiv.querySelector('canvas');
            drawSparkline(canvas);
        }
    });
}

/**
 * Animate number counting
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * Draw sparkline chart
 */
function drawSparkline(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Generate random data points
    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push(Math.random() * height);
    }
    
    // Draw sparkline
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    points.forEach((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - point;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

/**
 * Initialize bulk operations for pictures
 */
function initBulkOperations() {
    const pictureSection = document.getElementById('picturesSection');
    if (!pictureSection) return;
    
    // Add bulk operations toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'bulk-operations-toolbar';
    toolbar.innerHTML = `
        <label>
            <input type="checkbox" id="selectAllPictures">
            Select All
        </label>
        <div class="bulk-actions" style="display: none;">
            <span class="selected-count">0 selected</span>
            <button class="admin-btn btn-sm" id="bulkDeleteBtn">
                <i class="fas fa-trash"></i> Delete Selected
            </button>
            <button class="admin-btn btn-sm" id="bulkCategoryBtn">
                <i class="fas fa-folder"></i> Change Category
            </button>
            <button class="admin-btn btn-sm" id="bulkExportBtn">
                <i class="fas fa-download"></i> Export Selected
            </button>
        </div>
    `;
    
    const filterContainer = pictureSection.querySelector('.picture-filter-container');
    if (filterContainer) {
        filterContainer.parentNode.insertBefore(toolbar, filterContainer.nextSibling);
    }
    
    // Add checkboxes to picture cards
    setTimeout(() => {
        addPictureCheckboxes();
    }, 1000);
    
    // Handle select all
    document.getElementById('selectAllPictures')?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.picture-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
        updateBulkActionsVisibility();
    });
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .bulk-operations-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .bulk-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .selected-count {
            font-weight: bold;
            color: #2196F3;
        }
        
        .picture-checkbox-wrapper {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
            background: white;
            border-radius: 4px;
            padding: 2px;
        }
        
        .picture-checkbox {
            cursor: pointer;
        }
        
        body.dark-mode .bulk-operations-toolbar {
            background: #333;
            color: #e0e0e0;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add checkboxes to picture cards
 */
function addPictureCheckboxes() {
    const pictureCards = document.querySelectorAll('.picture-card');
    pictureCards.forEach(card => {
        if (!card.querySelector('.picture-checkbox-wrapper')) {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'picture-checkbox-wrapper';
            checkboxWrapper.innerHTML = '<input type="checkbox" class="picture-checkbox">';
            
            const pictureImage = card.querySelector('.picture-image');
            if (pictureImage) {
                pictureImage.style.position = 'relative';
                pictureImage.appendChild(checkboxWrapper);
            }
            
            // Update bulk actions on change
            checkboxWrapper.querySelector('.picture-checkbox').addEventListener('change', updateBulkActionsVisibility);
        }
    });
}

/**
 * Update bulk actions visibility
 */
function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.picture-checkbox:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (bulkActions) {
        if (checkedBoxes.length > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = `${checkedBoxes.length} selected`;
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

/**
 * Initialize enhanced search functionality
 */
function initSearchEnhancements() {
    // Add global search bar
    const topbar = document.querySelector('.admin-topbar');
    if (topbar) {
        const searchBar = document.createElement('div');
        searchBar.className = 'global-search';
        searchBar.innerHTML = `
            <input type="text" id="globalSearch" placeholder="Search anything... (Ctrl+K)">
            <i class="fas fa-search"></i>
            <div class="search-results" style="display: none;"></div>
        `;
        
        // Insert after sidebar toggle
        const sidebarToggle = topbar.querySelector('#sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.parentNode.insertBefore(searchBar, sidebarToggle.nextSibling);
        }
        
        // Handle search
        const searchInput = document.getElementById('globalSearch');
        searchInput.addEventListener('input', debounce(performGlobalSearch, 300));
        
        // Focus on Ctrl+K
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .global-search {
            position: relative;
            flex: 1;
            max-width: 400px;
            margin: 0 20px;
        }
        
        .global-search input {
            width: 100%;
            padding: 8px 35px 8px 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .global-search input:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
            outline: none;
        }
        
        .global-search i {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }
        
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-top: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
        }
        
        .search-result-item {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            transition: background 0.2s ease;
        }
        
        .search-result-item:hover {
            background: #f5f5f5;
        }
        
        .search-result-item strong {
            color: #2196F3;
        }
        
        body.dark-mode .global-search input {
            background: #333;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .search-results {
            background: #252525;
            border-color: #444;
        }
        
        body.dark-mode .search-result-item:hover {
            background: #333;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Perform global search
 */
function performGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    const resultsDiv = document.querySelector('.search-results');
    
    if (!query) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    // Search through various data
    const results = [];
    
    // Search pictures
    const pictures = JSON.parse(localStorage.getItem('adminPicturesMetadata') || '[]');
    pictures.forEach(pic => {
        if (pic.name.toLowerCase().includes(query) || 
            pic.description?.toLowerCase().includes(query)) {
            results.push({
                type: 'picture',
                title: pic.name,
                description: pic.description || 'No description',
                action: () => {
                    document.querySelector('[data-section="pictures"]').click();
                    setTimeout(() => {
                        document.getElementById(`picture-${pic.id}`)?.scrollIntoView();
                    }, 300);
                }
            });
        }
    });
    
    // Search hotels
    const hotels = JSON.parse(localStorage.getItem('adminHotels') || '[]');
    hotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(query) || 
            hotel.location?.toLowerCase().includes(query)) {
            results.push({
                type: 'hotel',
                title: hotel.name,
                description: hotel.location,
                action: () => {
                    document.querySelector('[data-section="hotels"]').click();
                }
            });
        }
    });
    
    // Display results
    if (results.length > 0) {
        resultsDiv.innerHTML = results.map(result => `
            <div class="search-result-item" data-type="${result.type}">
                <strong>${result.type}:</strong> ${result.title}
                <div style="font-size: 12px; color: #666;">${result.description}</div>
            </div>
        `).join('');
        
        resultsDiv.style.display = 'block';
        
        // Add click handlers
        resultsDiv.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                results[index].action();
                resultsDiv.style.display = 'none';
                e.target.value = '';
            });
        });
    } else {
        resultsDiv.innerHTML = '<div class="search-result-item">No results found</div>';
        resultsDiv.style.display = 'block';
    }
}

/**
 * Initialize notification system
 */
function initNotifications() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notificationContainer';
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Override alert function with beautiful notifications
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    };
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        }
        
        .notification {
            display: flex;
            align-items: center;
            background: white;
            border-radius: 8px;
            padding: 15px 20px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 300px;
            animation: slideIn 0.3s ease;
        }
        
        .notification i {
            font-size: 20px;
            margin-right: 12px;
        }
        
        .notification span {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.5;
            margin-left: 12px;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification-success {
            border-left: 4px solid #4CAF50;
        }
        
        .notification-success i {
            color: #4CAF50;
        }
        
        .notification-error {
            border-left: 4px solid #f44336;
        }
        
        .notification-error i {
            color: #f44336;
        }
        
        .notification-warning {
            border-left: 4px solid #ff9800;
        }
        
        .notification-warning i {
            color: #ff9800;
        }
        
        .notification-info {
            border-left: 4px solid #2196F3;
        }
        
        .notification-info i {
            color: #2196F3;
        }
        
        .notification.fade-out {
            animation: slideOut 0.3s ease;
            opacity: 0;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        body.dark-mode .notification {
            background: #333;
            color: #e0e0e0;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    const shortcuts = {
        'ctrl+s': () => {
            // Save current form
            const activeForm = document.querySelector('.admin-section.active form');
            if (activeForm) {
                const submitBtn = activeForm.querySelector('button[type="submit"]');
                submitBtn?.click();
            }
        },
        'ctrl+n': () => {
            // New item based on current section
            const activeSection = document.querySelector('.admin-section.active');
            if (activeSection) {
                const addBtn = activeSection.querySelector('[id^="add"]');
                addBtn?.click();
            }
        },
        'alt+1': () => document.querySelector('[data-section="dashboard"]')?.click(),
        'alt+2': () => document.querySelector('[data-section="pictures"]')?.click(),
        'alt+3': () => document.querySelector('[data-section="hotels"]')?.click(),
        'alt+4': () => document.querySelector('[data-section="orders"]')?.click(),
        'escape': () => {
            // Close active modal
            const activeModal = document.querySelector('.admin-modal.active');
            if (activeModal) {
                const closeBtn = activeModal.querySelector('.close-modal');
                closeBtn?.click();
            }
        }
    };
    
    document.addEventListener('keydown', function(e) {
        const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.key.toLowerCase()}`;
        
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key]();
        }
    });
    
    // Show shortcuts help
    const helpBtn = document.querySelector('.admin-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showShortcutsHelp();
        });
    }
}

/**
 * Show keyboard shortcuts help
 */
function showShortcutsHelp() {
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-content">
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcuts-list">
                <div><kbd>Ctrl + K</kbd> Global Search</div>
                <div><kbd>Ctrl + S</kbd> Save Current Form</div>
                <div><kbd>Ctrl + N</kbd> New Item</div>
                <div><kbd>Alt + 1-4</kbd> Navigate Sections</div>
                <div><kbd>Esc</kbd> Close Modal</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .shortcuts-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .shortcuts-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
        }
        
        .shortcuts-list {
            margin: 20px 0;
        }
        
        .shortcuts-list div {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }
        
        kbd {
            background: #f0f0f0;
            padding: 3px 6px;
            border-radius: 3px;
            font-family: monospace;
            border: 1px solid #ccc;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Enhance form validation
 */
function enhanceFormValidation() {
    // Add real-time validation
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[required], textarea[required]')) {
            validateField(e.target);
        }
    });
    
    // Add validation styles
    const style = document.createElement('style');
    style.textContent = `
        input.valid,
        textarea.valid {
            border-color: #4CAF50 !important;
        }
        
        input.invalid,
        textarea.invalid {
            border-color: #f44336 !important;
        }
        
        .field-error {
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Validate form field
 */
function validateField(field) {
    const value = field.value.trim();
    const isValid = value.length > 0;
    
    field.classList.toggle('valid', isValid);
    field.classList.toggle('invalid', !isValid && value.length > 0);
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message if invalid
    if (!isValid && value.length === 0 && field === document.activeElement) {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = 'This field is required';
        field.parentElement.appendChild(error);
    }
}

/**
 * Add loading states to buttons
 */
function addLoadingStates() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('button[type="submit"]')) {
            const btn = e.target;
            const originalText = btn.innerHTML;
            
            // Add loading state
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
            
            // Remove loading state after form submission
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
    });
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 