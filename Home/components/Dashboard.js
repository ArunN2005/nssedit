// Enhanced Dashboard Component
class NSS_Dashboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      apiEndpoint: '/api/students',
      refreshInterval: 30000, // 30 seconds
      animations: true,
      ...options
    };
    
    this.data = {
      students: [],
      stats: {},
      charts: {}
    };
    
    this.init();
  }
  
  async init() {
    if (!this.container) {
      console.error('Dashboard container not found');
      return;
    }
    
    this.createDashboard();
    await this.loadData();
    this.bindEvents();
    this.startAutoRefresh();
  }
  
  createDashboard() {
    this.container.innerHTML = `
      <div class="dashboard-header">
        <h1 class="dashboard-title">NSS Dashboard</h1>
        <div class="dashboard-controls">
          <button class="refresh-btn" id="refresh-btn">
            <span class="refresh-icon">🔄</span>
            Refresh
          </button>
          <div class="last-updated" id="last-updated">
            Last updated: Never
          </div>
        </div>
      </div>
      
      <div class="dashboard-stats" id="dashboard-stats">
        <!-- Stats cards will be inserted here -->
      </div>
      
      <div class="dashboard-charts">
        <div class="chart-container">
          <h3 class="chart-title">Student Progress Distribution</h3>
          <canvas id="progress-chart"></canvas>
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">Department Participation</h3>
          <canvas id="department-chart"></canvas>
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">Monthly Activity Trend</h3>
          <canvas id="activity-chart"></canvas>
        </div>
      </div>
      
      <div class="dashboard-tables">
        <div class="table-container">
          <h3 class="table-title">Top Performers</h3>
          <div class="table-wrapper" id="top-performers">
            <!-- Top performers table -->
          </div>
        </div>
        
        <div class="table-container">
          <h3 class="table-title">Recent Activity</h3>
          <div class="table-wrapper" id="recent-activity">
            <!-- Recent activity table -->
          </div>
        </div>
      </div>
    `;
  }
  
  async loadData() {
    try {
      this.showLoading();
      
      const response = await fetch(this.options.apiEndpoint);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      this.data.students = await response.json();
      this.calculateStats();
      this.renderStats();
      this.renderCharts();
      this.renderTables();
      this.updateLastUpdated();
      
      this.hideLoading();
      
      if (this.options.animations) {
        this.animateElements();
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data');
    }
  }
  
  calculateStats() {
    const students = this.data.students;
    
    this.data.stats = {
      totalStudents: students.length,
      totalHours: students.reduce((sum, s) => sum + s.hoursWorked, 0),
      activeVolunteers: students.filter(s => s.hoursWorked > 0).length,
      averageHours: students.length > 0 ? 
        Math.round(students.reduce((sum, s) => sum + s.hoursWorked, 0) / students.length) : 0,
      completionRate: students.length > 0 ? 
        Math.round((students.filter(s => s.hoursWorked >= 120).length / students.length) * 100) : 0,
      departmentStats: this.getDepartmentStats(students),
      yearStats: this.getYearStats(students)
    };
  }
  
  getDepartmentStats(students) {
    const deptStats = {};
    students.forEach(student => {
      const dept = student.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = { count: 0, totalHours: 0 };
      }
      deptStats[dept].count++;
      deptStats[dept].totalHours += student.hoursWorked;
    });
    return deptStats;
  }
  
  getYearStats(students) {
    const yearStats = {};
    students.forEach(student => {
      const year = student.year || 'Unknown';
      if (!yearStats[year]) {
        yearStats[year] = { count: 0, totalHours: 0 };
      }
      yearStats[year].count++;
      yearStats[year].totalHours += student.hoursWorked;
    });
    return yearStats;
  }
  
  renderStats() {
    const statsContainer = document.getElementById('dashboard-stats');
    const stats = this.data.stats;
    
    const statCards = [
      {
        icon: '👥',
        value: stats.totalStudents,
        label: 'Total Students',
        color: '#3B82F6'
      },
      {
        icon: '⏰',
        value: stats.totalHours,
        label: 'Service Hours',
        color: '#10B981'
      },
      {
        icon: '🎯',
        value: stats.activeVolunteers,
        label: 'Active Volunteers',
        color: '#F59E0B'
      },
      {
        icon: '📊',
        value: stats.averageHours,
        label: 'Average Hours',
        color: '#8B5CF6'
      },
      {
        icon: '🏆',
        value: `${stats.completionRate}%`,
        label: 'Completion Rate',
        color: '#EF4444'
      }
    ];
    
    statsContainer.innerHTML = statCards.map(stat => `
      <div class="stat-card" style="--accent-color: ${stat.color}">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-value" data-value="${typeof stat.value === 'number' ? stat.value : 0}">
          ${stat.value}
        </div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  }
  
  renderCharts() {
    this.renderProgressChart();
    this.renderDepartmentChart();
    this.renderActivityChart();
  }
  
  renderProgressChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const students = this.data.students;
    
    const ranges = {
      '0 Hours': students.filter(s => s.hoursWorked === 0).length,
      '1-30 Hours': students.filter(s => s.hoursWorked > 0 && s.hoursWorked <= 30).length,
      '31-60 Hours': students.filter(s => s.hoursWorked > 30 && s.hoursWorked <= 60).length,
      '61-90 Hours': students.filter(s => s.hoursWorked > 60 && s.hoursWorked <= 90).length,
      '91-120 Hours': students.filter(s => s.hoursWorked > 90 && s.hoursWorked <= 120).length,
      '120+ Hours': students.filter(s => s.hoursWorked > 120).length
    };
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(ranges),
        datasets: [{
          data: Object.values(ranges),
          backgroundColor: [
            '#EF4444',
            '#F59E0B',
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#06B6D4'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
            }
          }
        }
      }
    });
  }
  
  renderDepartmentChart() {
    const ctx = document.getElementById('department-chart').getContext('2d');
    const deptStats = this.data.stats.departmentStats;
    
    const labels = Object.keys(deptStats);
    const data = labels.map(dept => deptStats[dept].count);
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Students',
          data: data,
          backgroundColor: 'rgba(107, 52, 245, 0.8)',
          borderColor: 'rgba(107, 52, 245, 1)',
          borderWidth: 1,
          borderRadius: 8
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
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
            },
            grid: {
              color: 'rgba(107, 52, 245, 0.1)'
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  renderActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    // Generate mock monthly data for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(() => Math.floor(Math.random() * 100) + 50);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Activity Level',
          data: data,
          borderColor: 'rgba(0, 221, 235, 1)',
          backgroundColor: 'rgba(0, 221, 235, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(0, 221, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
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
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
            },
            grid: {
              color: 'rgba(0, 221, 235, 0.1)'
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  renderTables() {
    this.renderTopPerformers();
    this.renderRecentActivity();
  }
  
  renderTopPerformers() {
    const container = document.getElementById('top-performers');
    const topStudents = this.data.students
      .sort((a, b) => b.hoursWorked - a.hoursWorked)
      .slice(0, 5);
    
    container.innerHTML = `
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Department</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          ${topStudents.map((student, index) => `
            <tr>
              <td>
                <span class="rank-badge rank-${index + 1}">${index + 1}</span>
              </td>
              <td class="student-name">${student.name}</td>
              <td>${student.department}</td>
              <td class="hours-cell">${student.hoursWorked}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    
    // Mock recent activity data
    const activities = [
      { type: 'attendance', student: 'John Doe', action: 'Marked attendance', time: '2 hours ago' },
      { type: 'certificate', student: 'Jane Smith', action: 'Certificate sent', time: '4 hours ago' },
      { type: 'registration', student: 'Mike Johnson', action: 'New registration', time: '6 hours ago' },
      { type: 'update', student: 'Sarah Wilson', action: 'Profile updated', time: '8 hours ago' },
      { type: 'attendance', student: 'David Brown', action: 'Marked attendance', time: '10 hours ago' }
    ];
    
    container.innerHTML = `
      <div class="activity-list">
        ${activities.map(activity => `
          <div class="activity-item">
            <div class="activity-icon activity-${activity.type}">
              ${this.getActivityIcon(activity.type)}
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>${activity.student}</strong> ${activity.action}
              </div>
              <div class="activity-time">${activity.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  getActivityIcon(type) {
    const icons = {
      attendance: '✅',
      certificate: '🏆',
      registration: '👤',
      update: '✏️'
    };
    return icons[type] || '📝';
  }
  
  animateElements() {
    // Animate stat cards
    gsap.from('.stat-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out'
    });
    
    // Animate counter values
    document.querySelectorAll('.stat-value').forEach(element => {
      const targetValue = parseInt(element.dataset.value) || 0;
      this.animateCounter(element, targetValue);
    });
    
    // Animate charts
    gsap.from('.chart-container', {
      duration: 1,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.5
    });
    
    // Animate tables
    gsap.from('.table-container', {
      duration: 1,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.8
    });
  }
  
  animateCounter(element, targetValue) {
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
      
      element.textContent = element.textContent.includes('%') ? 
        currentValue + '%' : currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  }
  
  bindEvents() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      this.refresh();
    });
  }
  
  async refresh() {
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = refreshBtn?.querySelector('.refresh-icon');
    
    if (refreshIcon) {
      refreshIcon.style.animation = 'spin 1s linear infinite';
    }
    
    await this.loadData();
    
    if (refreshIcon) {
      refreshIcon.style.animation = '';
    }
  }
  
  startAutoRefresh() {
    if (this.options.refreshInterval > 0) {
      setInterval(() => {
        this.loadData();
      }, this.options.refreshInterval);
    }
  }
  
  updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
      lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }
  
  showLoading() {
    // Add loading state
    this.container.classList.add('loading');
  }
  
  hideLoading() {
    // Remove loading state
    this.container.classList.remove('loading');
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'dashboard-error';
    errorDiv.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-message">${message}</div>
      <button class="error-retry" onclick="this.parentElement.remove(); dashboard.loadData();">
        Retry
      </button>
    `;
    
    this.container.insertBefore(errorDiv, this.container.firstChild);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NSS_Dashboard;
}