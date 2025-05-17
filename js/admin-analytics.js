/**
 * Admin Analytics Module
 * Implements advanced analytics reporting for the admin dashboard
 */

class AdminAnalytics {
  constructor() {
    this.isInitialized = false;
    this.analyticsData = {
      visitors: [],
      bookings: [],
      pageViews: {},
      revenue: {},
      popularRoutes: [],
      userSources: {}
    };
    
    // Charts instances
    this.charts = {};
    
    // Time period filters
    this.timePeriods = {
      '7d': { label: 'Last 7 days', days: 7 },
      '30d': { label: 'Last 30 days', days: 30 },
      '90d': { label: 'Last 90 days', days: 90 },
      'year': { label: 'This year', days: 365 },
      'all': { label: 'All time', days: 0 }
    };
    
    // Current selected time period
    this.currentPeriod = '30d';
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => this.init());
  }
  
  /**
   * Initialize analytics module
   */
  async init() {
    if (this.isInitialized) return;
    
    console.log('Initializing Admin Analytics module');
    
    // Load Chart.js library if not already loaded
    await this.loadChartJs();
    
    // Generate demo data
    this.generateDemoData();
    
    // Create analytics UI
    this.createAnalyticsUI();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Render initial charts
    this.renderCharts();
    
    this.isInitialized = true;
  }
  
  /**
   * Load Chart.js library dynamically if not already loaded
   */
  async loadChartJs() {
    if (window.Chart) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Generate demo analytics data for development
   */
  generateDemoData() {
    // Generate date range for past year
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    // Generate visitor data
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      // Seasonal variations with random noise
      const month = d.getMonth();
      const seasonalFactor = [0.7, 0.8, 1.0, 1.1, 1.2, 1.5, 1.8, 1.7, 1.2, 1.0, 0.8, 0.9][month];
      const visitors = Math.round(Math.random() * 30 * seasonalFactor + 30);
      
      // Weekend boost
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const visitorCount = isWeekend ? Math.round(visitors * 1.4) : visitors;
      
      // Add to visitors array
      this.analyticsData.visitors.push({
        date: new Date(d),
        count: visitorCount
      });
      
      // Generate bookings data (about 5-10% of visitors make bookings)
      const bookingRate = 0.05 + Math.random() * 0.05;
      const bookingCount = Math.round(visitorCount * bookingRate);
      const revenue = bookingCount * (Math.random() * 200 + 50); // $50-$250 per booking
      
      this.analyticsData.bookings.push({
        date: new Date(d),
        count: bookingCount,
        revenue: revenue
      });
      
      // Accumulate revenue by month
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!this.analyticsData.revenue[monthKey]) {
        this.analyticsData.revenue[monthKey] = 0;
      }
      this.analyticsData.revenue[monthKey] += revenue;
    }
    
    // Generate page view data
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/transport.html', name: 'Transport' },
      { path: '/gallery', name: 'Gallery' },
      { path: '/contact', name: 'Contact' },
      { path: '/about', name: 'About' }
    ];
    
    pages.forEach(page => {
      // Base views with random variation
      const baseViews = page.path === '/' ? 10000 : 
                        page.path === '/transport.html' ? 7500 : 
                        page.path === '/gallery' ? 8000 : 
                        page.path === '/contact' ? 3000 : 5000;
      
      const views = Math.round(baseViews * (0.8 + Math.random() * 0.4));
      this.analyticsData.pageViews[page.path] = {
        name: page.name,
        views: views,
        bounceRate: Math.random() * 30 + 20, // 20-50% bounce rate
        avgTimeOnPage: Math.round(Math.random() * 180 + 60) // 1-4 minutes
      };
    });
    
    // Generate popular routes data
    const routes = [
      { from: 'Colombo Airport', to: 'Kandy', count: Math.round(Math.random() * 200 + 300) },
      { from: 'Colombo', to: 'Galle', count: Math.round(Math.random() * 150 + 250) },
      { from: 'Kandy', to: 'Ella', count: Math.round(Math.random() * 100 + 200) },
      { from: 'Colombo Airport', to: 'Negombo', count: Math.round(Math.random() * 120 + 180) },
      { from: 'Galle', to: 'Yala National Park', count: Math.round(Math.random() * 80 + 120) },
      { from: 'Colombo', to: 'Sigiriya', count: Math.round(Math.random() * 70 + 100) },
      { from: 'Colombo Airport', to: 'Mirissa', count: Math.round(Math.random() * 50 + 80) }
    ];
    
    this.analyticsData.popularRoutes = routes.sort((a, b) => b.count - a.count);
    
    // Generate user sources data
    this.analyticsData.userSources = {
      'Direct': Math.round(Math.random() * 1000 + 2000),
      'Google': Math.round(Math.random() * 1500 + 3000),
      'TripAdvisor': Math.round(Math.random() * 800 + 1200),
      'Facebook': Math.round(Math.random() * 600 + 800),
      'Instagram': Math.round(Math.random() * 400 + 600),
      'Other Search': Math.round(Math.random() * 300 + 400),
      'Referrals': Math.round(Math.random() * 200 + 300)
    };
  }
  
  /**
   * Create analytics UI elements
   */
  createAnalyticsUI() {
    // Find the analytics section or create it
    let analyticsSection = document.getElementById('analyticsSection');
    
    if (!analyticsSection) {
      // Create the section if it doesn't exist
      analyticsSection = document.createElement('div');
      analyticsSection.id = 'analyticsSection';
      analyticsSection.className = 'admin-section';
      
      // Add to admin panel
      const adminPanel = document.querySelector('.admin-panel');
      if (adminPanel) {
        adminPanel.appendChild(analyticsSection);
      } else {
        // If no admin panel, add to body
        document.body.appendChild(analyticsSection);
      }
    }
    
    // Create the analytics UI
    analyticsSection.innerHTML = `
      <h2 class="section-title">Analytics Dashboard</h2>
      <div class="section-description">
        <p>Advanced analytics and performance metrics</p>
      </div>
      
      <div class="analytics-filters">
        <div class="time-period-filter">
          <label>Time Period:</label>
          <div class="period-buttons">
            ${Object.entries(this.timePeriods).map(([key, period]) => `
              <button 
                class="period-btn ${key === this.currentPeriod ? 'active' : ''}" 
                data-period="${key}"
              >
                ${period.label}
              </button>
            `).join('')}
          </div>
        </div>
        <button class="admin-btn secondary" id="refreshAnalyticsBtn">
          <i class="fas fa-sync"></i> Refresh Data
        </button>
      </div>
      
      <div class="analytics-summary">
        <div class="summary-card visitors">
          <div class="card-icon"><i class="fas fa-users"></i></div>
          <div class="card-content">
            <h3>Total Visitors</h3>
            <div class="card-value" id="visitorCount">Loading...</div>
            <div class="card-change positive" id="visitorChange">+0.0%</div>
          </div>
        </div>
        
        <div class="summary-card bookings">
          <div class="card-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="card-content">
            <h3>Total Bookings</h3>
            <div class="card-value" id="bookingCount">Loading...</div>
            <div class="card-change positive" id="bookingChange">+0.0%</div>
          </div>
        </div>
        
        <div class="summary-card revenue">
          <div class="card-icon"><i class="fas fa-dollar-sign"></i></div>
          <div class="card-content">
            <h3>Total Revenue</h3>
            <div class="card-value" id="revenueValue">Loading...</div>
            <div class="card-change positive" id="revenueChange">+0.0%</div>
          </div>
        </div>
        
        <div class="summary-card conversion">
          <div class="card-icon"><i class="fas fa-chart-line"></i></div>
          <div class="card-content">
            <h3>Conversion Rate</h3>
            <div class="card-value" id="conversionRate">Loading...</div>
            <div class="card-change positive" id="conversionChange">+0.0%</div>
          </div>
        </div>
      </div>
      
      <div class="analytics-charts">
        <div class="chart-container">
          <h3>Visitors & Bookings Trend</h3>
          <canvas id="visitorsTrendChart"></canvas>
        </div>
        
        <div class="chart-container">
          <h3>Revenue by Month</h3>
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
      
      <div class="analytics-details">
        <div class="detail-container">
          <h3>Top Routes</h3>
          <div class="routes-list" id="topRoutesList">
            <!-- Will be populated dynamically -->
          </div>
        </div>
        
        <div class="detail-container">
          <h3>Traffic Sources</h3>
          <canvas id="trafficSourcesChart"></canvas>
        </div>
      </div>
      
      <div class="analytics-tables">
        <div class="table-container">
          <h3>Page Performance</h3>
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Bounce Rate</th>
                <th>Avg. Time</th>
              </tr>
            </thead>
            <tbody id="pagePerformanceTable">
              <!-- Will be populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Add CSS for analytics
    this.addAnalyticsStyles();
  }
  
  /**
   * Add CSS styles for analytics
   */
  addAnalyticsStyles() {
    if (document.getElementById('analytics-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'analytics-styles';
    styleEl.textContent = `
      .analytics-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
      }
      
      .time-period-filter {
        display: flex;
        align-items: center;
      }
      
      .time-period-filter label {
        margin-right: 10px;
        font-weight: 500;
      }
      
      .period-buttons {
        display: flex;
        gap: 5px;
      }
      
      .period-btn {
        padding: 6px 12px;
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .period-btn:hover {
        border-color: #adb5bd;
      }
      
      .period-btn.active {
        background-color: #007bff;
        color: white;
        border-color: #007bff;
      }
      
      .analytics-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .summary-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
        display: flex;
        align-items: center;
      }
      
      .card-icon {
        background-color: #f0f9ff;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 20px;
        color: #007bff;
      }
      
      .summary-card.visitors .card-icon {
        background-color: #f0f9ff;
        color: #007bff;
      }
      
      .summary-card.bookings .card-icon {
        background-color: #f0fff4;
        color: #28a745;
      }
      
      .summary-card.revenue .card-icon {
        background-color: #fffaf0;
        color: #fd7e14;
      }
      
      .summary-card.conversion .card-icon {
        background-color: #f0f2ff;
        color: #6610f2;
      }
      
      .card-content {
        flex-grow: 1;
      }
      
      .card-content h3 {
        font-size: 14px;
        color: #6c757d;
        margin: 0 0 5px 0;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 5px;
      }
      
      .card-change {
        font-size: 12px;
        font-weight: 500;
      }
      
      .card-change.positive {
        color: #28a745;
      }
      
      .card-change.negative {
        color: #dc3545;
      }
      
      .analytics-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .chart-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
      }
      
      .chart-container h3 {
        font-size: 16px;
        margin-top: 0;
        margin-bottom: 15px;
        color: #343a40;
      }
      
      .analytics-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 30px;
        margin-bottom: 30px;
      }
      
      .detail-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
      }
      
      .detail-container h3 {
        font-size: 16px;
        margin-top: 0;
        margin-bottom: 15px;
        color: #343a40;
      }
      
      .routes-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .route-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e9ecef;
      }
      
      .route-item:last-child {
        border-bottom: none;
      }
      
      .route-details {
        display: flex;
        flex-direction: column;
      }
      
      .route-path {
        font-weight: 500;
        margin-bottom: 3px;
      }
      
      .route-count {
        color: #6c757d;
        font-size: 14px;
      }
      
      .route-percentage {
        font-weight: 600;
        color: #007bff;
      }
      
      .analytics-tables {
        margin-bottom: 30px;
      }
      
      .table-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
      }
      
      .table-container h3 {
        font-size: 16px;
        margin-top: 0;
        margin-bottom: 15px;
        color: #343a40;
      }
      
      .analytics-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .analytics-table th,
      .analytics-table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #e9ecef;
      }
      
      .analytics-table th {
        color: #495057;
        font-weight: 600;
      }
      
      .analytics-table tbody tr:last-child td {
        border-bottom: none;
      }
      
      /* Make charts responsive */
      canvas {
        width: 100% !important;
        height: 300px !important;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .analytics-charts,
        .analytics-details {
          grid-template-columns: 1fr;
        }
        
        .analytics-filters {
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
        }
        
        .analytics-summary {
          grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
        }
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Set up event listeners for analytics
   */
  setupEventListeners() {
    // Period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const period = e.currentTarget.dataset.period;
        this.changeTimePeriod(period);
      });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshAnalyticsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }
  }
  
  /**
   * Change the time period for analytics
   */
  changeTimePeriod(period) {
    // Update active button
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(button => {
      button.classList.toggle('active', button.dataset.period === period);
    });
    
    // Update current period
    this.currentPeriod = period;
    
    // Re-render charts with new period
    this.renderCharts();
  }
  
  /**
   * Refresh analytics data
   */
  refreshData() {
    // In a real application, this would fetch fresh data from the server
    // For the demo, we'll just regenerate the data
    this.generateDemoData();
    this.renderCharts();
  }
  
  /**
   * Get filtered data for the current time period
   */
  getFilteredData() {
    const days = this.timePeriods[this.currentPeriod].days;
    
    // If 'all' is selected, return all data
    if (days === 0) {
      return {
        visitors: [...this.analyticsData.visitors],
        bookings: [...this.analyticsData.bookings]
      };
    }
    
    // Filter based on date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return {
      visitors: this.analyticsData.visitors.filter(item => item.date >= cutoffDate),
      bookings: this.analyticsData.bookings.filter(item => item.date >= cutoffDate)
    };
  }
  
  /**
   * Render all analytics charts and data
   */
  renderCharts() {
    // Get filtered data for current period
    const filteredData = this.getFilteredData();
    
    // Update summary cards
    this.updateSummaryCards(filteredData);
    
    // Render visitors trend chart
    this.renderVisitorsTrendChart(filteredData);
    
    // Render revenue chart
    this.renderRevenueChart();
    
    // Render traffic sources chart
    this.renderTrafficSourcesChart();
    
    // Render top routes list
    this.renderTopRoutesList();
    
    // Render page performance table
    this.renderPagePerformanceTable();
  }
  
  /**
   * Update summary cards with current data
   */
  updateSummaryCards(filteredData) {
    // Calculate totals for current period
    const totalVisitors = filteredData.visitors.reduce((sum, item) => sum + item.count, 0);
    const totalBookings = filteredData.bookings.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = filteredData.bookings.reduce((sum, item) => sum + item.revenue, 0);
    const conversionRate = totalVisitors > 0 ? (totalBookings / totalVisitors) * 100 : 0;
    
    // Calculate percentage changes
    // For demo, we'll use random changes
    const visitorChange = (Math.random() * 20 - 5).toFixed(1);
    const bookingChange = (Math.random() * 25 - 5).toFixed(1);
    const revenueChange = (Math.random() * 30 - 10).toFixed(1);
    const conversionChange = (Math.random() * 15 - 5).toFixed(1);
    
    // Update DOM elements
    document.getElementById('visitorCount').textContent = totalVisitors.toLocaleString();
    document.getElementById('bookingCount').textContent = totalBookings.toLocaleString();
    document.getElementById('revenueValue').textContent = `$${Math.round(totalRevenue).toLocaleString()}`;
    document.getElementById('conversionRate').textContent = `${conversionRate.toFixed(1)}%`;
    
    // Update change indicators
    this.updateChangeIndicator('visitorChange', visitorChange);
    this.updateChangeIndicator('bookingChange', bookingChange);
    this.updateChangeIndicator('revenueChange', revenueChange);
    this.updateChangeIndicator('conversionChange', conversionChange);
  }
  
  /**
   * Update a change indicator element
   */
  updateChangeIndicator(elementId, changeValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Set text content with sign
    element.textContent = `${changeValue > 0 ? '+' : ''}${changeValue}%`;
    
    // Set class based on value
    element.className = `card-change ${parseFloat(changeValue) >= 0 ? 'positive' : 'negative'}`;
  }
  
  /**
   * Render visitors and bookings trend chart
   */
  renderVisitorsTrendChart(filteredData) {
    const ctx = document.getElementById('visitorsTrendChart');
    if (!ctx) return;
    
    // Group data by day
    const dateLabels = [];
    const visitorData = [];
    const bookingData = [];
    
    // Process visitors and bookings
    const dateMap = new Map();
    
    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // Process visitors
    filteredData.visitors.forEach(item => {
      const dateStr = formatDate(item.date);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: item.date, visitors: 0, bookings: 0 });
      }
      dateMap.get(dateStr).visitors += item.count;
    });
    
    // Process bookings
    filteredData.bookings.forEach(item => {
      const dateStr = formatDate(item.date);
      if (!dateMap.has(dateStr)) {
        dateMap.get(dateStr, { date: item.date, visitors: 0, bookings: 0 });
      }
      dateMap.get(dateStr).bookings += item.count;
    });
    
    // Sort data by date
    const sortedData = Array.from(dateMap.values()).sort((a, b) => a.date - b.date);
    
    // Extract data for chart
    sortedData.forEach(item => {
      const dateFormatOptions = { month: 'short', day: 'numeric' };
      dateLabels.push(item.date.toLocaleDateString(undefined, dateFormatOptions));
      visitorData.push(item.visitors);
      bookingData.push(item.bookings);
    });
    
    // Create or update chart
    if (this.charts.visitorsTrend) {
      this.charts.visitorsTrend.data.labels = dateLabels;
      this.charts.visitorsTrend.data.datasets[0].data = visitorData;
      this.charts.visitorsTrend.data.datasets[1].data = bookingData;
      this.charts.visitorsTrend.update();
    } else {
      this.charts.visitorsTrend = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dateLabels,
          datasets: [
            {
              label: 'Visitors',
              data: visitorData,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2
            },
            {
              label: 'Bookings',
              data: bookingData,
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Render revenue chart
   */
  renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Sort months and get last 12 months only
    const sortedMonths = Object.entries(this.analyticsData.revenue)
      .sort((a, b) => {
        const [yearA, monthA] = a[0].split('-').map(Number);
        const [yearB, monthB] = b[0].split('-').map(Number);
        return (yearA - yearB) || (monthA - monthB);
      })
      .slice(-12);
    
    const monthLabels = [];
    const revenueData = [];
    
    sortedMonths.forEach(([month, revenue]) => {
      const [year, monthNum] = month.split('-').map(Number);
      const date = new Date(year, monthNum - 1);
      monthLabels.push(date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }));
      revenueData.push(Math.round(revenue));
    });
    
    // Create or update chart
    if (this.charts.revenue) {
      this.charts.revenue.data.labels = monthLabels;
      this.charts.revenue.data.datasets[0].data = revenueData;
      this.charts.revenue.update();
    } else {
      this.charts.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [{
            label: 'Revenue ($)',
            data: revenueData,
            backgroundColor: 'rgba(253, 126, 20, 0.7)',
            borderColor: '#fd7e14',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Render traffic sources chart
   */
  renderTrafficSourcesChart() {
    const ctx = document.getElementById('trafficSourcesChart');
    if (!ctx) return;
    
    const labels = Object.keys(this.analyticsData.userSources);
    const data = Object.values(this.analyticsData.userSources);
    
    // Create color array
    const colors = [
      'rgba(0, 123, 255, 0.7)',
      'rgba(40, 167, 69, 0.7)',
      'rgba(253, 126, 20, 0.7)',
      'rgba(220, 53, 69, 0.7)',
      'rgba(102, 16, 242, 0.7)',
      'rgba(23, 162, 184, 0.7)',
      'rgba(108, 117, 125, 0.7)'
    ];
    
    // Create or update chart
    if (this.charts.trafficSources) {
      this.charts.trafficSources.data.labels = labels;
      this.charts.trafficSources.data.datasets[0].data = data;
      this.charts.trafficSources.update();
    } else {
      this.charts.trafficSources = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((context.parsed / total) * 100);
                  return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Render top routes list
   */
  renderTopRoutesList() {
    const routesList = document.getElementById('topRoutesList');
    if (!routesList) return;
    
    // Clear existing items
    routesList.innerHTML = '';
    
    // Calculate total count for percentages
    const totalBookings = this.analyticsData.popularRoutes.reduce((sum, route) => sum + route.count, 0);
    
    // Add top 5 routes
    this.analyticsData.popularRoutes.slice(0, 5).forEach(route => {
      const percentage = ((route.count / totalBookings) * 100).toFixed(1);
      
      const routeItem = document.createElement('div');
      routeItem.className = 'route-item';
      
      routeItem.innerHTML = `
        <div class="route-details">
          <div class="route-path">${route.from} to ${route.to}</div>
          <div class="route-count">${route.count} bookings</div>
        </div>
        <div class="route-percentage">${percentage}%</div>
      `;
      
      routesList.appendChild(routeItem);
    });
  }
  
  /**
   * Render page performance table
   */
  renderPagePerformanceTable() {
    const tableBody = document.getElementById('pagePerformanceTable');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add row for each page
    Object.entries(this.analyticsData.pageViews).forEach(([path, data]) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${data.name} <small class="text-muted">${path}</small></td>
        <td>${data.views.toLocaleString()}</td>
        <td>${data.bounceRate.toFixed(1)}%</td>
        <td>${Math.floor(data.avgTimeOnPage / 60)}:${String(data.avgTimeOnPage % 60).padStart(2, '0')}</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
}

// Initialize the analytics module
window.AdminAnalytics = new AdminAnalytics(); 