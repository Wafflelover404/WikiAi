<template>
  <div class="analytics-dashboard">
    <!-- Header -->
    <div class="analytics-header">
      <div class="analytics-header-content">
        <div class="analytics-title-section">
          <h1 class="analytics-title">📊 Analytics & Metrics</h1>
          <p class="analytics-subtitle">Real-time system performance and usage analytics</p>
        </div>
        <div class="analytics-header-actions">
          <div class="time-range-selector">
            <button 
              v-for="range in timeRanges" 
              :key="range.value"
              @click="selectedTimeRange = range.value"
              :class="['time-btn', { active: selectedTimeRange === range.value }]"
            >
              {{ range.label }}
            </button>
          </div>
          <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="analytics-loading">
      <div class="loading-spinner">⟳</div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="analytics-error">
      <div class="error-icon">⚠️</div>
      <h3>Failed to Load Analytics</h3>
      <p>{{ error }}</p>
      <button @click="refreshData" class="retry-btn">🔄 Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else class="analytics-content">
      <!-- System Health Section -->
      <section class="analytics-section health-section">
        <div class="section-header">
          <h2>💚 System Health</h2>
          <span :class="['health-badge', healthStatus]">{{ healthStatus }}</span>
        </div>
        <div class="health-grid">
          <div class="health-card">
            <div class="card-value">{{ metrics.summary?.total_queries || 0 }}</div>
            <div class="card-label">Total Queries</div>
            <div class="card-details">Last {{ selectedTimeRange }}</div>
          </div>
          <div class="health-card success">
            <div class="card-value">{{ metrics.summary?.success_rate || 0 }}%</div>
            <div class="card-label">Success Rate</div>
            <div class="card-details">Request completion</div>
          </div>
          <div class="health-card response-time">
            <div class="card-value">{{ (metrics.summary?.avg_response_time_ms || 0).toFixed(0) }}ms</div>
            <div class="card-label">Avg Response</div>
            <div class="card-details">Average latency</div>
          </div>
          <div class="health-card users">
            <div class="card-value">{{ metrics.summary?.unique_users || 0 }}</div>
            <div class="card-label">Active Users</div>
            <div class="card-details">Unique visitors</div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="analytics-tabs">
        <button 
          v-for="tab in analyticsTabsList" 
          :key="tab"
          @click="activeAnalyticsTab = tab"
          :class="['analytics-tab', { active: activeAnalyticsTab === tab }]"
        >
          {{ getTabIcon(tab) }} {{ tab }}
        </button>
      </div>

      <!-- Performance Tab -->
      <section v-if="activeAnalyticsTab === 'Performance'" class="analytics-section">
        <div class="section-header">
          <h2>⚡ Performance Metrics</h2>
        </div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Min Response Time</div>
            <div class="metric-value">{{ (metrics.summary?.min_response_time_ms || 0).toFixed(0) }}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Max Response Time</div>
            <div class="metric-value">{{ (metrics.summary?.max_response_time_ms || 0).toFixed(0) }}ms</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Cache Hit Rate</div>
            <div class="metric-value">{{ (metrics.summary?.cache_hit_rate || 0).toFixed(1) }}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Avg Docs/Query</div>
            <div class="metric-value">{{ (metrics.summary?.avg_docs_per_query || 0).toFixed(2) }}</div>
          </div>
        </div>

        <div class="performance-operations" v-if="metrics.performance?.length > 0">
          <h3>Slowest Operations</h3>
          <table class="operations-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Avg Duration</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(op, idx) in metrics.performance.slice(0, 5)" :key="idx">
                <td>{{ op.operation_name }}</td>
                <td>{{ (op.avg_duration_ms || 0).toFixed(2) }}ms</td>
                <td>{{ op.count || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Users Tab -->
      <section v-if="activeAnalyticsTab === 'Users'" class="analytics-section">
        <div class="section-header">
          <h2>👥 User Analytics</h2>
        </div>
        <div class="users-metrics-grid">
          <div v-if="metrics.users?.engagement_score" class="user-engagement-card">
            <h3>Engagement Scores</h3>
            <div class="engagement-list">
              <div v-for="(user, idx) in metrics.users.engagement_score.slice(0, 5)" :key="idx" class="engagement-item">
                <span class="user-name">{{ user.user_id }}</span>
                <div class="engagement-bar">
                  <div class="engagement-fill" :style="{ width: user.engagement_score + '%' }"></div>
                </div>
                <span class="engagement-score">{{ user.engagement_score }}</span>
              </div>
            </div>
          </div>

          <div v-if="metrics.users?.segments" class="user-segments-card">
            <h3>User Segments</h3>
            <div class="segments-list">
              <div v-for="(segment, type) in metrics.users.segments" :key="type" class="segment-item">
                <span class="segment-label">{{ type }}:</span>
                <span class="segment-count">{{ segment.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Security Tab -->
      <section v-if="activeAnalyticsTab === 'Security'" class="analytics-section">
        <div class="section-header">
          <h2>🔒 Security Events</h2>
        </div>
        <div class="security-metrics">
          <div class="security-summary" v-if="metrics.security">
            <div class="security-card">
              <span class="security-count">{{ metrics.security.total_events || 0 }}</span>
              <span class="security-label">Total Events</span>
            </div>
            <div class="security-card warning">
              <span class="security-count">{{ metrics.security.suspicious_ips || 0 }}</span>
              <span class="security-label">Suspicious IPs</span>
            </div>
            <div class="security-card alert">
              <span class="security-count">{{ metrics.security.failed_logins || 0 }}</span>
              <span class="security-label">Failed Logins</span>
            </div>
          </div>

          <div v-if="metrics.security?.events?.length > 0" class="security-events-table">
            <h3>Recent Security Events</h3>
            <table class="events-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(event, idx) in metrics.security.events.slice(0, 10)" :key="idx">
                  <td>{{ event.event_type }}</td>
                  <td>{{ event.user_id || 'N/A' }}</td>
                  <td>{{ event.ip_address || 'N/A' }}</td>
                  <td :class="['severity', event.severity]">{{ event.severity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Documents Tab -->
      <section v-if="activeAnalyticsTab === 'Documents'" class="analytics-section">
        <div class="section-header">
          <h2>📄 Document Analytics</h2>
        </div>
        <div v-if="metrics.documents?.length > 0" class="documents-table">
          <table class="documents-data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Accesses</th>
                <th>RAG Hits</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, idx) in metrics.documents.slice(0, 10)" :key="idx">
                <td class="filename">{{ doc.filename }}</td>
                <td>{{ doc.access_count }}</td>
                <td>{{ doc.rag_hit_count }}</td>
                <td>{{ formatBytes(doc.size_bytes) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          <p>No document analytics available</p>
        </div>
      </section>

      <!-- Errors Tab -->
      <section v-if="activeAnalyticsTab === 'Errors'" class="analytics-section">
        <div class="section-header">
          <h2>⚠️ Error Tracking</h2>
        </div>
        <div v-if="metrics.errors?.length > 0" class="errors-table">
          <table class="errors-data-table">
            <thead>
              <tr>
                <th>Error Type</th>
                <th>Count</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(error, idx) in metrics.errors.slice(0, 10)" :key="idx">
                <td class="error-type">{{ error.error_type }}</td>
                <td class="error-count">{{ error.frequency }}</td>
                <td class="error-time">{{ formatDate(error.last_occurrence) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          <p>No errors recorded</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsDashboard',
  props: {
    token: String,
    API_BASE_URL: String
  },
  data() {
    return {
      isLoading: false,
      error: null,
      selectedTimeRange: '24h',
      activeAnalyticsTab: 'Performance',
      healthStatus: 'healthy',
      metrics: {
        summary: {},
        performance: [],
        users: {},
        security: {},
        documents: [],
        errors: []
      },
      timeRanges: [
        { label: '1H', value: '1h' },
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' }
      ],
      analyticsTabsList: ['Performance', 'Users', 'Security', 'Documents', 'Errors']
    };
  },
  computed: {
    errorCount() {
      return this.metrics.errors?.length || 0;
    }
  },
  mounted() {
    this.refreshData();
    // Auto-refresh every 30 seconds
    this.autoRefreshInterval = setInterval(() => this.refreshData(), 30000);
  },
  beforeUnmount() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  },
  watch: {
    selectedTimeRange() {
      this.refreshData();
    }
  },
  methods: {
    async refreshData() {
      this.isLoading = true;
      this.error = null;

      try {
        // Fetch all metrics in parallel
        const [summary, performance, users, security, documents, errors] = await Promise.all([
          this.fetchMetrics('/metrics/summary'),
          this.fetchMetrics('/metrics/performance'),
          this.fetchMetrics('/analytics/users/segments'),
          this.fetchMetrics('/analytics/security/threats'),
          this.fetchMetrics('/metrics/documents'),
          this.fetchMetrics('/metrics/errors')
        ]);

        this.metrics = {
          summary: summary?.data || {},
          performance: performance?.data?.operations || [],
          users: users?.data || {},
          security: security?.data || {},
          documents: documents?.data?.documents || [],
          errors: errors?.data?.errors || []
        };

        // Determine health status
        this.updateHealthStatus();
      } catch (err) {
        this.error = err.message || 'Failed to load analytics data';
        console.error('Analytics fetch error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMetrics(endpoint) {
      const params = new URLSearchParams();
      
      if (endpoint.includes('security') || endpoint.includes('compliance') || endpoint.includes('performance')) {
        params.append('since_hours', this.timeRangeToHours());
      } else if (endpoint.includes('summary')) {
        params.append('since', this.selectedTimeRange);
      }

      const response = await fetch(
        `${this.API_BASE_URL}${endpoint}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },

    timeRangeToHours() {
      const map = { '1h': 1, '24h': 24, '7d': 168 };
      return map[this.selectedTimeRange] || 24;
    },

    updateHealthStatus() {
      const successRate = this.metrics.summary?.success_rate || 0;
      const errorCount = this.errorCount;

      if (successRate >= 95 && errorCount === 0) {
        this.healthStatus = 'healthy';
      } else if (successRate >= 90 && errorCount < 5) {
        this.healthStatus = 'warning';
      } else {
        this.healthStatus = 'critical';
      }
    },

    formatBytes(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return dateString;
      }
    },

    getTabIcon(tab) {
      const icons = {
        'Performance': '⚡',
        'Users': '👥',
        'Security': '🔒',
        'Documents': '📄',
        'Errors': '⚠️'
      };
      return icons[tab] || '📊';
    }
  }
};
</script>

<style scoped>
.analytics-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary, #f5f7fa);
  color: var(--text-primary, #333);
}

.analytics-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analytics-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.analytics-title-section h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.analytics-subtitle {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.analytics-header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.time-range-selector {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.time-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0.3rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.time-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.time-btn.active {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analytics-loading,
.analytics-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analytics-error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  color: #c33;
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background: #c33;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #a22;
}

.analytics-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.analytics-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.health-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.health-badge.healthy {
  background: #d4edda;
  color: #155724;
}

.health-badge.warning {
  background: #fff3cd;
  color: #856404;
}

.health-badge.critical {
  background: #f8d7da;
  color: #721c24;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.health-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.health-card.success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #333;
}

.health-card.response-time {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #333;
}

.health-card.users {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: white;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.card-details {
  font-size: 0.75rem;
  opacity: 0.7;
}

.analytics-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0;
}

.analytics-tab {
  padding: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.analytics-tab:hover {
  color: #333;
}

.analytics-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  border-left: 4px solid #667eea;
}

.metric-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.performance-operations {
  margin-top: 2rem;
}

.performance-operations h3 {
  margin-top: 0;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
}

.operations-table th,
.operations-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.operations-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.operations-table tbody tr:hover {
  background: #f8f9fa;
}

.users-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-engagement-card,
.user-segments-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.user-engagement-card h3,
.user-segments-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.engagement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.engagement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  width: 120px;
  font-weight: 500;
  word-break: break-all;
}

.engagement-bar {
  flex: 1;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.engagement-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.engagement-score {
  width: 40px;
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
}

.segments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.segment-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.segment-label {
  font-weight: 500;
}

.segment-count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.security-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.security-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
}

.security-card.warning {
  background: linear-gradient(135deg, #ffa500 0%, #ff6347 100%);
}

.security-card.alert {
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
}

.security-count {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.security-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.security-events-table,
.documents-table,
.errors-table {
  margin-top: 1.5rem;
}

.security-events-table h3,
.documents-table h3,
.errors-table h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.events-table,
.documents-data-table,
.errors-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.events-table th,
.events-table td,
.documents-data-table th,
.documents-data-table td,
.errors-data-table th,
.errors-data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.events-table th,
.documents-data-table th,
.errors-data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.events-table tbody tr:hover,
.documents-data-table tbody tr:hover,
.errors-data-table tbody tr:hover {
  background: #f8f9fa;
}

.severity {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.severity.low {
  background: #d4edda;
  color: #155724;
}

.severity.medium {
  background: #fff3cd;
  color: #856404;
}

.severity.high {
  background: #f8d7da;
  color: #721c24;
}

.filename {
  max-width: 300px;
  word-break: break-word;
}

.error-type {
  max-width: 250px;
  word-break: break-word;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

@media (max-width: 768px) {
  .analytics-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .analytics-header {
    padding: 1.5rem;
  }

  .time-range-selector {
    flex-wrap: wrap;
  }

  .health-grid {
    grid-template-columns: 1fr 1fr;
  }

  .analytics-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .analytics-tab {
    font-size: 0.9rem;
    padding: 0.75rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }

  .users-metrics-grid,
  .security-summary {
    grid-template-columns: 1fr;
  }

  .analytics-content {
    padding: 1rem;
  }

  .analytics-section {
    padding: 1rem;
  }
}

.dark-mode {
  --bg-secondary: #1a1a1a;
  --text-primary: #e0e0e0;
}

.dark-mode .analytics-dashboard {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.dark-mode .analytics-section {
  background: #2a2a2a;
  color: var(--text-primary);
}

.dark-mode .metric-card {
  background: #333;
}

.dark-mode .user-engagement-card,
.dark-mode .user-segments-card {
  background: #333;
}

.dark-mode .analytics-tab {
  color: #999;
}

.dark-mode .analytics-tab.active {
  color: #667eea;
}

.dark-mode .operations-table th,
.dark-mode .events-table th,
.dark-mode .documents-data-table th,
.dark-mode .errors-data-table th {
  background: #333;
  color: var(--text-primary);
}

.dark-mode .operations-table tbody tr:hover,
.dark-mode .events-table tbody tr:hover,
.dark-mode .documents-data-table tbody tr:hover,
.dark-mode .errors-data-table tbody tr:hover {
  background: #333;
}
</style>
