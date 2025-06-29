/**
 * Enhanced Admin Analytics
 * Provides advanced data visualization and reporting capabilities
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Analytics loaded');
    
    // Initialize enhanced analytics
    if (document.getElementById('dashboardSection')) {
        initAdvancedCharts();
        initRealTimeMetrics();
        initExportCapabilities();
        initCustomReports();
        initPredictiveAnalytics();
    }
});

/**
 * Initialize advanced charts
 */
function initAdvancedCharts() {
    // Create analytics dashboard layout
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;
    
    // Add advanced analytics section
    const analyticsSection = document.createElement('div');
    analyticsSection.className = 'advanced-analytics-section';
    analyticsSection.innerHTML = `
        <h3>Advanced Analytics</h3>
        
        <div class="analytics-tabs">
            <button class="analytics-tab active" data-tab="overview">Overview</button>
            <button class="analytics-tab" data-tab="revenue">Revenue</button>
            <button class="analytics-tab" data-tab="visitors">Visitors</button>
            <button class="analytics-tab" data-tab="performance">Performance</button>
        </div>
        
        <div class="analytics-content">
            <div class="analytics-tab-content active" id="overviewTab">
                <div class="chart-grid">
                    <div class="chart-container">
                        <h4>Booking Trends</h4>
                        <canvas id="bookingTrendsChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Revenue Distribution</h4>
                        <canvas id="revenueDistChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Popular Destinations</h4>
                        <canvas id="destinationsChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Customer Satisfaction</h4>
                        <canvas id="satisfactionChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="analytics-tab-content" id="revenueTab">
                <div class="revenue-metrics">
                    <div class="metric-card">
                        <h5>Total Revenue</h5>
                        <div class="metric-value">$<span id="totalRevenue">0</span></div>
                        <div class="metric-change positive">+12.5%</div>
                    </div>
                    <div class="metric-card">
                        <h5>Average Order Value</h5>
                        <div class="metric-value">$<span id="avgOrderValue">0</span></div>
                        <div class="metric-change positive">+5.3%</div>
                    </div>
                    <div class="metric-card">
                        <h5>Conversion Rate</h5>
                        <div class="metric-value"><span id="conversionRate">0</span>%</div>
                        <div class="metric-change negative">-2.1%</div>
                    </div>
                    <div class="metric-card">
                        <h5>Refund Rate</h5>
                        <div class="metric-value"><span id="refundRate">0</span>%</div>
                        <div class="metric-change positive">-0.5%</div>
                    </div>
                </div>
                <div class="chart-container full-width">
                    <h4>Revenue Over Time</h4>
                    <canvas id="revenueTimeChart"></canvas>
                </div>
            </div>
            
            <div class="analytics-tab-content" id="visitorsTab">
                <div class="visitor-stats">
                    <div class="chart-container">
                        <h4>Visitor Sources</h4>
                        <canvas id="visitorSourcesChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Device Types</h4>
                        <canvas id="deviceTypesChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Geographic Distribution</h4>
                        <div id="geoMap"></div>
                    </div>
                    <div class="chart-container">
                        <h4>Page Views</h4>
                        <canvas id="pageViewsChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="analytics-tab-content" id="performanceTab">
                <div class="performance-metrics">
                    <div class="metric-card">
                        <h5>Site Speed</h5>
                        <div class="metric-value"><span id="siteSpeed">0</span>ms</div>
                        <div class="speed-indicator good"></div>
                    </div>
                    <div class="metric-card">
                        <h5>Uptime</h5>
                        <div class="metric-value"><span id="uptime">99.9</span>%</div>
                        <div class="uptime-indicator"></div>
                    </div>
                    <div class="metric-card">
                        <h5>Error Rate</h5>
                        <div class="metric-value"><span id="errorRate">0.1</span>%</div>
                        <div class="error-indicator"></div>
                    </div>
                    <div class="metric-card">
                        <h5>API Response Time</h5>
                        <div class="metric-value"><span id="apiResponse">0</span>ms</div>
                        <div class="api-indicator"></div>
                    </div>
                </div>
                <div class="chart-container full-width">
                    <h4>Performance Timeline</h4>
                    <canvas id="performanceTimelineChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="analytics-actions">
            <button class="admin-btn" id="exportAnalyticsBtn">
                <i class="fas fa-download"></i> Export Report
            </button>
            <button class="admin-btn" id="scheduleReportBtn">
                <i class="fas fa-calendar"></i> Schedule Reports
            </button>
            <button class="admin-btn primary" id="customReportBtn">
                <i class="fas fa-chart-bar"></i> Custom Report
            </button>
        </div>
    `;
    
    // Insert after recent feedback
    const recentFeedback = dashboardSection.querySelector('.recent-feedback');
    if (recentFeedback) {
        recentFeedback.parentNode.insertBefore(analyticsSection, recentFeedback);
    }
    
    // Initialize tab switching
    initAnalyticsTabs();
    
    // Initialize charts
    setTimeout(() => {
        drawBookingTrendsChart();
        drawRevenueDistChart();
        drawDestinationsChart();
        drawSatisfactionChart();
    }, 100);
    
    // Add styles
    addAnalyticsStyles();
}

/**
 * Initialize analytics tab switching
 */
function initAnalyticsTabs() {
    const tabs = document.querySelectorAll('.analytics-tab');
    const contents = document.querySelectorAll('.analytics-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabName}Tab`)?.classList.add('active');
            
            // Initialize tab-specific charts
            switch(tabName) {
                case 'revenue':
                    drawRevenueTimeChart();
                    updateRevenueMetrics();
                    break;
                case 'visitors':
                    drawVisitorCharts();
                    break;
                case 'performance':
                    drawPerformanceCharts();
                    break;
            }
        });
    });
}

/**
 * Draw booking trends chart
 */
function drawBookingTrendsChart() {
    const ctx = document.getElementById('bookingTrendsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Transport Bookings',
                data: generateRandomData(7, 20, 50),
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4
            }, {
                label: 'Hotel Bookings',
                data: generateRandomData(7, 15, 40),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Draw revenue distribution chart
 */
function drawRevenueDistChart() {
    const ctx = document.getElementById('revenueDistChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Hotels', 'Tours', 'Others'],
            datasets: [{
                data: [45, 30, 20, 5],
                backgroundColor: [
                    '#2196F3',
                    '#4CAF50',
                    '#FF9800',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Draw popular destinations chart
 */
function drawDestinationsChart() {
    const ctx = document.getElementById('destinationsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Ella'],
            datasets: [{
                label: 'Bookings',
                data: [120, 95, 85, 75, 60],
                backgroundColor: '#FF9800'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Draw customer satisfaction chart
 */
function drawSatisfactionChart() {
    const ctx = document.getElementById('satisfactionChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Service', 'Price', 'Quality', 'Communication', 'Experience'],
            datasets: [{
                label: 'Current Month',
                data: [4.5, 4.2, 4.7, 4.3, 4.6],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)'
            }, {
                label: 'Previous Month',
                data: [4.3, 4.0, 4.5, 4.2, 4.4],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

/**
 * Initialize real-time metrics
 */
function initRealTimeMetrics() {
    // Create real-time metrics widget
    const metricsWidget = document.createElement('div');
    metricsWidget.className = 'real-time-metrics';
    metricsWidget.innerHTML = `
        <h4><i class="fas fa-bolt"></i> Real-Time Metrics</h4>
        <div class="metrics-grid">
            <div class="metric-item">
                <span class="metric-label">Active Users</span>
                <span class="metric-value" id="activeUsers">0</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Today's Revenue</span>
                <span class="metric-value">$<span id="todayRevenue">0</span></span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Pending Orders</span>
                <span class="metric-value" id="pendingOrders">0</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Response Time</span>
                <span class="metric-value"><span id="responseTime">0</span>ms</span>
            </div>
        </div>
    `;
    
    // Add to dashboard
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.parentNode.insertBefore(metricsWidget, statsGrid);
    }
    
    // Update metrics every 5 seconds
    updateRealTimeMetrics();
    setInterval(updateRealTimeMetrics, 5000);
}

/**
 * Update real-time metrics
 */
function updateRealTimeMetrics() {
    // Simulate real-time data
    document.getElementById('activeUsers').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('todayRevenue').textContent = (Math.random() * 5000 + 1000).toFixed(2);
    document.getElementById('pendingOrders').textContent = Math.floor(Math.random() * 20) + 5;
    document.getElementById('responseTime').textContent = Math.floor(Math.random() * 100) + 50;
    
    // Add animation
    document.querySelectorAll('.metric-value').forEach(el => {
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 300);
    });
}

/**
 * Initialize export capabilities
 */
function initExportCapabilities() {
    // Handle export button
    document.getElementById('exportAnalyticsBtn')?.addEventListener('click', function() {
        showExportOptions();
    });
}

/**
 * Show export options modal
 */
function showExportOptions() {
    const modal = document.createElement('div');
    modal.className = 'export-modal admin-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Export Analytics Report</h3>
                <button class="close-modal" onclick="this.closest('.export-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <label>
                        <input type="radio" name="exportFormat" value="pdf" checked>
                        <span><i class="fas fa-file-pdf"></i> PDF Report</span>
                    </label>
                    <label>
                        <input type="radio" name="exportFormat" value="excel">
                        <span><i class="fas fa-file-excel"></i> Excel Spreadsheet</span>
                    </label>
                    <label>
                        <input type="radio" name="exportFormat" value="csv">
                        <span><i class="fas fa-file-csv"></i> CSV Data</span>
                    </label>
                </div>
                
                <div class="date-range-selector">
                    <h4>Select Date Range</h4>
                    <div class="date-inputs">
                        <input type="date" id="exportStartDate">
                        <span>to</span>
                        <input type="date" id="exportEndDate">
                    </div>
                </div>
                
                <div class="report-sections">
                    <h4>Include Sections</h4>
                    <label><input type="checkbox" checked> Overview</label>
                    <label><input type="checkbox" checked> Revenue Analysis</label>
                    <label><input type="checkbox" checked> Visitor Statistics</label>
                    <label><input type="checkbox" checked> Performance Metrics</label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="admin-btn secondary" onclick="this.closest('.export-modal').remove()">Cancel</button>
                <button class="admin-btn primary" onclick="exportAnalytics()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Export analytics data
 */
function exportAnalytics() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    
    // Show loading
    showNotification('Generating report...', 'info');
    
    setTimeout(() => {
        // Simulate export
        showNotification(`${format.toUpperCase()} report generated successfully!`, 'success');
        document.querySelector('.export-modal')?.remove();
    }, 2000);
}

/**
 * Initialize custom reports
 */
function initCustomReports() {
    document.getElementById('customReportBtn')?.addEventListener('click', function() {
        showCustomReportBuilder();
    });
}

/**
 * Show custom report builder
 */
function showCustomReportBuilder() {
    const modal = document.createElement('div');
    modal.className = 'custom-report-modal admin-modal active';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Custom Report Builder</h3>
                <button class="close-modal" onclick="this.closest('.custom-report-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="report-builder">
                    <div class="builder-sidebar">
                        <h4>Available Metrics</h4>
                        <div class="metric-list">
                            <div class="metric-item draggable" draggable="true" data-metric="bookings">
                                <i class="fas fa-shopping-cart"></i> Bookings
                            </div>
                            <div class="metric-item draggable" draggable="true" data-metric="revenue">
                                <i class="fas fa-dollar-sign"></i> Revenue
                            </div>
                            <div class="metric-item draggable" draggable="true" data-metric="visitors">
                                <i class="fas fa-users"></i> Visitors
                            </div>
                            <div class="metric-item draggable" draggable="true" data-metric="conversion">
                                <i class="fas fa-percentage"></i> Conversion Rate
                            </div>
                            <div class="metric-item draggable" draggable="true" data-metric="satisfaction">
                                <i class="fas fa-smile"></i> Satisfaction
                            </div>
                        </div>
                    </div>
                    <div class="builder-canvas">
                        <h4>Report Layout</h4>
                        <div class="report-canvas" id="reportCanvas">
                            <div class="canvas-placeholder">
                                Drag metrics here to build your report
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="admin-btn secondary" onclick="this.closest('.custom-report-modal').remove()">Cancel</button>
                <button class="admin-btn primary" onclick="generateCustomReport()">
                    <i class="fas fa-chart-bar"></i> Generate Report
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize drag and drop
    initReportBuilderDragDrop();
}

/**
 * Initialize predictive analytics
 */
function initPredictiveAnalytics() {
    // Add predictive insights section
    const insightsSection = document.createElement('div');
    insightsSection.className = 'predictive-insights';
    insightsSection.innerHTML = `
        <h3><i class="fas fa-brain"></i> AI-Powered Insights</h3>
        <div class="insights-grid">
            <div class="insight-card">
                <div class="insight-icon trend-up">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="insight-content">
                    <h5>Revenue Forecast</h5>
                    <p>Expected 23% increase in revenue next month based on current booking trends</p>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="insight-content">
                    <h5>Capacity Alert</h5>
                    <p>High demand expected for Kandy tours next weekend. Consider adding more slots</p>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-icon suggestion">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="insight-content">
                    <h5>Optimization Tip</h5>
                    <p>Offering 10% discount on weekday bookings could increase occupancy by 15%</p>
                </div>
            </div>
        </div>
    `;
    
    // Add to dashboard
    const analyticsSection = document.querySelector('.advanced-analytics-section');
    if (analyticsSection) {
        analyticsSection.parentNode.insertBefore(insightsSection, analyticsSection.nextSibling);
    }
}

/**
 * Helper function to get last 7 days
 */
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
}

/**
 * Helper function to generate random data
 */
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

/**
 * Add analytics styles
 */
function addAnalyticsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Advanced Analytics Styles */
        .advanced-analytics-section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .analytics-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .analytics-tab {
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-weight: 500;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .analytics-tab:hover {
            color: #2196F3;
        }
        
        .analytics-tab.active {
            color: #2196F3;
        }
        
        .analytics-tab.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #2196F3;
        }
        
        .analytics-tab-content {
            display: none;
        }
        
        .analytics-tab-content.active {
            display: block;
        }
        
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .chart-container {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            height: 300px;
            position: relative;
        }
        
        .chart-container h4 {
            margin-bottom: 15px;
            color: #333;
            font-size: 16px;
        }
        
        .chart-container canvas {
            max-height: 240px;
        }
        
        .revenue-metrics,
        .performance-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        
        .metric-card h5 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .metric-change {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .metric-change.positive::before {
            content: '↑ ';
        }
        
        .metric-change.negative::before {
            content: '↓ ';
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .analytics-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        /* Real-time Metrics */
        .real-time-metrics {
            background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
            color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        
        .metric-item {
            text-align: center;
        }
        
        .metric-label {
            display: block;
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .metric-value.updated {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Predictive Insights */
        .predictive-insights {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .insight-card {
            display: flex;
            gap: 15px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            transition: transform 0.3s ease;
        }
        
        .insight-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .insight-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .insight-icon.trend-up {
            background: #4CAF50;
            color: white;
        }
        
        .insight-icon.warning {
            background: #FF9800;
            color: white;
        }
        
        .insight-icon.suggestion {
            background: #2196F3;
            color: white;
        }
        
        .insight-content h5 {
            margin: 0 0 8px 0;
            color: #333;
        }
        
        .insight-content p {
            margin: 0;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
        
        /* Export Modal */
        .export-options label {
            display: flex;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .export-options label:hover {
            background: #f5f5f5;
        }
        
        .export-options input[type="radio"] {
            margin-right: 10px;
        }
        
        .export-options span {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .date-range-selector {
            margin: 20px 0;
        }
        
        .date-inputs {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .report-sections label {
            display: block;
            margin: 5px 0;
        }
        
        /* Custom Report Builder */
        .modal-content.large {
            max-width: 900px;
            width: 90%;
        }
        
        .report-builder {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 20px;
            min-height: 400px;
        }
        
        .builder-sidebar {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
        }
        
        .metric-list {
            margin-top: 15px;
        }
        
        .metric-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            margin: 5px 0;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            cursor: move;
            transition: all 0.3s ease;
        }
        
        .metric-item:hover {
            background: #e3f2fd;
            border-color: #2196F3;
        }
        
        .metric-item.dragging {
            opacity: 0.5;
        }
        
        .builder-canvas {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
        }
        
        .report-canvas {
            min-height: 300px;
            border: 2px dashed #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-top: 15px;
        }
        
        .canvas-placeholder {
            text-align: center;
            color: #999;
            padding: 40px;
        }
        
        /* Dark mode support */
        body.dark-mode .advanced-analytics-section,
        body.dark-mode .predictive-insights {
            background: #252525;
        }
        
        body.dark-mode .chart-container {
            background: #333;
        }
        
        body.dark-mode .insight-card {
            background: #333;
        }
        
        body.dark-mode .analytics-tab {
            color: #aaa;
        }
        
        body.dark-mode .analytics-tab.active {
            color: #2196F3;
        }
    `;
    document.head.appendChild(style);
} 