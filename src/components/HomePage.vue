<template>
  <div class="home-page">
    <!-- Welcome Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="welcome-message">
          <h1>Welcome to <span class="brand">WikiAi</span></h1>
          <p class="subtitle">Your intelligent knowledge base companion</p>
        </div>
        
        <!-- Quick Search Bar -->
        <div class="quick-search">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="quickSearchText" 
              type="text" 
              placeholder="Quick search your knowledge base..." 
              class="quick-search-input"
              @keyup.enter="performQuickSearch"
            />
            <button v-if="quickSearchText" class="clear-quick-search" @click="quickSearchText = ''">✖</button>
          </div>
          <button class="quick-search-btn" @click="performQuickSearch" :disabled="!quickSearchText.trim()">
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <div class="dashboard-grid">
        <!-- Statistics Cards -->
        <div class="stats-section">
          <h2 class="section-title">📊 Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📄</div>
              <div class="stat-info">
                <div class="stat-number">{{ files.length }}</div>
                <div class="stat-label">Total Documents</div>
              </div>
              <div v-if="loading.metrics" class="loading-overlay"></div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🔍</div>
              <div class="stat-info">
                <div class="stat-number">{{ dashboardMetrics.total_queries_24h }}</div>
                <div class="stat-label">Searches Today</div>
              </div>
              <div v-if="loading.metrics" class="loading-overlay"></div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <div class="stat-number">{{ Math.round(dashboardMetrics.avg_response_time_ms) }}ms</div>
                <div class="stat-label">Avg Response Time</div>
              </div>
              <div v-if="loading.metrics" class="loading-overlay"></div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👤</div>
              <div class="stat-info">
                <div class="stat-number">{{ userRole === 'admin' ? dashboardMetrics.active_users_24h : dashboardMetrics.active_sessions }}</div>
                <div class="stat-label">{{ userRole === 'admin' ? 'Active Users Today' : 'Active Sessions' }}</div>
              </div>
              <div v-if="loading.metrics" class="loading-overlay"></div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2 class="section-title">⚡ Quick Actions</h2>
          <div class="actions-grid">
            <div class="action-card" @click="$emit('navigate-to', 'search')">
              <div class="action-icon">🔍</div>
              <div class="action-title">Advanced Search</div>
              <div class="action-description">Search across all documents with AI</div>
            </div>
            
            <div class="action-card" @click="$emit('navigate-to', 'files')">
              <div class="action-icon">📁</div>
              <div class="action-title">Browse Files</div>
              <div class="action-description">Explore your document library</div>
            </div>
            
            <div v-if="userRole === 'admin'" class="action-card" @click="$emit('navigate-to', 'admin')">
              <div class="action-icon">⚙️</div>
              <div class="action-title">Admin Panel</div>
              <div class="action-description">Manage users and system settings</div>
            </div>
            
            <div v-if="userRole === 'admin'" class="action-card" @click="viewAnalytics">
              <div class="action-icon">📊</div>
              <div class="action-title">Analytics</div>
              <div class="action-description">View usage statistics and insights</div>
            </div>

            <div v-if="userRole === 'user'" class="action-card" @click="viewStats">
              <div class="action-icon">📊</div>
              <div class="action-title">Statistics</div>
              <div class="action-description">View your activity overview</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity
        <div class="activity-section">
          <h2 class="section-title"> Recent Activity</h2>
          <div class="activity-list">
            <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
              <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                {{ getActivityIcon(activity.type) }}
              </div>
              <div class="activity-content">
                <div class="activity-title">
                  {{ formatActivityTitle(activity) }}
                </div>
                <div class="activity-details">
                  {{ formatActivityDetails(activity) }}
                </div>
              </div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div> -->

        <!-- Popular Searches (admin only) -->
        <div v-if="userRole === 'admin'" class="popular-section">
          <h2 class="section-title">🔥 Most Referenced Files</h2>
          <div class="popular-searches">
            <div 
              v-for="(file, idx) in popularFiles" 
              :key="idx" 
              class="popular-search-item"
              @click="$emit('open-file', file.query)"
            >
              <div class="search-rank">#{{ idx + 1 }}</div>
              <div class="search-info">
                <div class="search-query">{{ file.query }}</div>
                <div class="search-count">{{ file.count }} references</div>
              </div>
              <div class="search-trend" :class="file.trend">
                {{ file.trend === 'up' ? '📈' : file.trend === 'down' ? '📉' : '➡️' }}
              </div>
            </div>
            <div v-if="loading.metrics && !popularFiles.length" class="loading-state">
              Loading popular files...
            </div>
            <div v-if="!loading.metrics && !popularFiles.length" class="empty-state">
              No file references yet
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div v-if="userRole === 'admin'" class="status-section">
          <h2 class="section-title">🟢 System Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-indicator healthy"></div>
              <div class="status-info">
                <div class="status-name">Search Engine</div>
                <div class="status-value">Operational</div>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-indicator healthy"></div>
              <div class="status-info">
                <div class="status-name">AI Processing</div>
                <div class="status-value">{{ aiProcessingStatus }}</div>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-indicator" :class="storageStatusClass"></div>
              <div class="status-info">
                <div class="status-name">Storage</div>
                <div class="status-value">{{ storageUsage }}% Used</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips & Tricks -->
        <div class="tips-section">
          <h2 class="section-title">💡 Tips & Tricks</h2>
          <div class="tips-carousel">
            <div class="tip-item active">
              <div class="tip-icon">🎯</div>
              <div class="tip-content">
                <div class="tip-title">Use specific keywords</div>
                <div class="tip-description">Try searching with technical terms and specific file names for better results</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  methods: {
    getActivityIcon(type) {
      const icons = {
        search: '🔍',
        upload: '📤',
        download: '📥',
        edit: '✏️',
        delete: '🗑️',
        default: '📋'
      };
      return icons[type] || icons.default;
    },
    
    getActivityIconClass(type) {
      return `activity-icon--${type}`;
    },
    
    formatActivityTitle(activity) {
      const actions = {
        search: 'Searched for documents',
        upload: 'Uploaded document',
        download: 'Downloaded document',
        edit: 'Edited document',
        delete: 'Deleted document'
      };
      return actions[activity.type] || 'Performed action';
    },
    
    formatActivityDetails(activity) {
      if (activity.documentName) {
        return `"${activity.documentName}"`;
      } else if (activity.query) {
        return `Query: "${activity.query}"`;
      }
      return activity.details || '';
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);
      
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      
      return date.toLocaleDateString();
    }
  },
  props: {
    files: {
      type: Array,
      default: () => []
    },
    token: {
      type: String,
      default: ''
    },
    serverUrl: {
      type: String,
      default: ''
    },
    userRole: {
      type: String,
      default: 'user'
    }
  },
  data() {
    return {
      quickSearchText: '',
      recentActivity: [],
      popularFiles: [],
      dashboardMetrics: {
        total_queries_24h: 0,
        active_users_24h: 0,
        avg_response_time_ms: 0,
        top_performing_file: 'N/A',
      },
      activityTrends: [],
      aiProcessingStatus: 'Loading...',
      storageUsage: 0,
      loading: {
        metrics: true,
        activity: true,
        trends: true
      }
    };
  },
  computed: {
    storageStatusClass() {
      const usage = this.storageUsage || 0;
      if (usage < 70) return 'healthy';
      if (usage < 90) return 'warning';
      return 'critical';
    }
  },
  mounted() {
    this.fetchDashboardMetrics();
    this.fetchRecentActivity();
    this.fetchTrends();
    this.fetchPopularFiles();
    // Set up auto-refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchDashboardMetrics();
      this.fetchRecentActivity();
    }, 5 * 60 * 1000);
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },

  methods: {
    async fetchDashboardMetrics() {
      this.loading.metrics = true;
      try {
        const endpoint = this.userRole === 'admin' ? '/metrics/summary' : '/metrics/user/summary';
        
        // First get metrics summary
        const response = await fetch(`${this.serverUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        
        if (this.userRole === 'user') {
          // Get active sessions for user
          const sessionResponse = await fetch(`${this.serverUrl}/metrics/user/sessions`, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
          const sessionData = await sessionResponse.json();
          
          this.dashboardMetrics = {
            total_queries_24h: data.total_queries,
            active_sessions: sessionData.active_sessions || 1,
            avg_response_time_ms: data.avg_response_time_ms,
            top_performing_file: data.top_files[0]?.filename || 'N/A'
          };
        } else {
          this.dashboardMetrics = data;
        }
        
        this.aiProcessingStatus = this.dashboardMetrics.avg_response_time_ms < 1000 ? 'Optimal' : 
                                 this.dashboardMetrics.avg_response_time_ms < 2000 ? 'Good' : 'Degraded';
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        this.loading.metrics = false;
      }
    },

    async fetchRecentActivity() {
      this.loading.activity = true;
      try {
        const endpoint = this.userRole === 'admin' ? '/metrics/queries' : '/metrics/user/activity';
        const response = await fetch(`${this.serverUrl}${endpoint}?limit=15`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        
        // Extract activities from response
        const activities = this.userRole === 'admin' ? 
          (data.queries || []) : 
          (data.activities || []);
        
        this.recentActivity = activities.map(activity => {
          const base = {
            id: activity.id || `${Date.now()}-${Math.random()}`,
            timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date(),
            type: activity.type || 'unknown'
          };

          if (activity.type === 'search' || activity.query_type === 'search' || activity.activity_type === 'query') {
            return {
              ...base,
              type: 'search',
              query: activity.content || activity.query || '',
              documentName: activity.filename || '',
              details: activity.content || activity.query || '',
              success: activity.success || true
            };
          }
          
          if (activity.type === 'file' || activity.activity_type === 'file_access' || activity.filename) {
            return {
              ...base,
              type: 'file',
              documentName: activity.filename || '',
              details: `${activity.action_type || 'Accessed'} ${activity.filename || 'file'}`,
              action: activity.action_type || 'access'
            };
          }

          // Upload activity
          if (activity.type === 'upload' || activity.activity_type === 'upload') {
            return {
              ...base,
              type: 'upload',
              documentName: activity.filename || '',
              details: `Uploaded ${activity.filename || 'file'}`
            };
          }

          // Default case for unknown activity types
          return {
            ...base,
            type: 'unknown',
            details: activity.details || 'Activity details not available'
          };
        });
      } catch (error) {
        console.error('Error fetching activity:', error);
        this.recentActivity = [];
      } finally {
        this.loading.activity = false;
      }
    },
    
    getActivityIcon(activity) {
      if (activity.activity_type === 'query') {
        return activity.success ? '🔍' : '❌';
      } else {
        return activity.action === 'view' ? '📄' : '🔄';
      }
    },
    
    getActivityIconClass(activity) {
      if (activity.activity_type === 'query') {
        return activity.success ? 'activity-icon--success' : 'activity-icon--error';
      }
      return 'activity-icon--file';
    },
    async fetchTrends() {
      // Only fetch trends for admin users
      if (this.userRole !== 'admin') {
        this.loading.trends = false;
        return;
      }
      
      this.loading.trends = true;
      try {
        const response = await fetch(`${this.serverUrl}/metrics/aggregations/timeseries?interval=hour&metric=queries&since=24h`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch trends');
        const data = await response.json();
        this.activityTrends = data.data;
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        this.loading.trends = false;
      }
    },

    async fetchPopularFiles() {
      try {
        const endpoint = this.userRole === 'admin' ? '/metrics/aggregations/files' : '/metrics/user/files';
        const response = await fetch(`${this.serverUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch popular files');
        const data = await response.json();
        
        if (this.userRole === 'user') {
          // For users, process their personal file statistics
          const ragFiles = (data.rag_files || []).map(f => ({
            filename: f.filename || '',
            ragCount: f.retrieval_count || 0,
            viewCount: 0,
            lastAccessed: f.last_accessed || new Date()
          }));

          const viewedFiles = (data.viewed_files || []).map(f => ({
            filename: f.filename || '',
            ragCount: 0,
            viewCount: f.view_count || 0,
            lastAccessed: f.last_accessed || new Date()
          }));

          // Combine files and aggregate usage
          const fileMap = new Map();
          [...ragFiles, ...viewedFiles].forEach(file => {
            const existing = fileMap.get(file.filename) || {
              filename: file.filename,
              ragCount: 0,
              viewCount: 0,
              lastAccessed: file.lastAccessed
            };
            
            existing.ragCount += file.ragCount;
            existing.viewCount += file.viewCount;
            existing.lastAccessed = new Date(Math.max(
              new Date(existing.lastAccessed),
              new Date(file.lastAccessed)
            ));
            
            fileMap.set(file.filename, existing);
          });

          this.popularFiles = Array.from(fileMap.values())
            .sort((a, b) => (b.ragCount + b.viewCount) - (a.ragCount + a.viewCount))
            .slice(0, 10)
            .map(file => ({
              query: file.filename,
              count: file.ragCount + file.viewCount,
              description: `${file.ragCount} searches, ${file.viewCount} views`,
              trend: this.getFileTrend(file)
            }));
        } else {
          // For admin, process overall file statistics
          const files = Array.isArray(data.top_files_in_rag) ? data.top_files_in_rag :
                       Array.isArray(data.top_files) ? data.top_files :
                       [];
          
          this.popularFiles = files
            .filter(file => file && file.filename)
            .map(file => ({
              query: file.filename,
              count: file.retrieval_count || file.count || 0,
              description: this.formatFileStats(file),
              trend: this.getFileTrend(file)
            }));
        }
      } catch (error) {
        console.error('Error fetching popular files:', error);
      }
    },

    performQuickSearch() {
      if (!this.quickSearchText.trim()) return;
      this.$emit('perform-search', this.quickSearchText);
      this.$emit('navigate-to', 'search');
    },
    
    performSearch(query) {
      this.$emit('perform-search', query);
      this.$emit('navigate-to', 'search');
    },
    
    handleActivityClick(activity) {
      switch (activity.type) {
        case 'search':
          this.$emit('perform-search', activity.query);
          this.$emit('navigate-to', 'search');
          break;
        case 'file':
          this.$emit('open-file', activity.filename);
          this.$emit('navigate-to', 'files');
          break;
        case 'upload':
          this.uploadFiles();
          break;
      }
    },
    
    uploadFiles() {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.txt,.md,.pdf,.doc,.docx';
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.$emit('upload-files', files);
        }
      };
      input.click();
    },

    getFileTrend(file) {
      // If we have previous_count/period data, use it
      if (file.previous_count !== undefined && file.current_count !== undefined) {
        return file.current_count > file.previous_count ? 'up' :
               file.current_count < file.previous_count ? 'down' : 'stable';
      }
      
      // For user files, compare search vs view ratio
      if (file.ragCount !== undefined && file.viewCount !== undefined) {
        const searchRatio = file.ragCount / (file.ragCount + file.viewCount);
        return searchRatio > 0.6 ? 'up' :
               searchRatio < 0.4 ? 'down' : 'stable';
      }
      
      // Default to stable if we can't determine trend
      return 'stable';
    },
    
    formatFileStats(file) {
      const counts = [];
      
      if (file.retrieval_count || file.count) {
        counts.push(`${file.retrieval_count || file.count} uses`);
      }
      
      if (file.search_count) {
        counts.push(`${file.search_count} searches`);
      }
      
      if (file.view_count) {
        counts.push(`${file.view_count} views`);
      }
      
      return counts.length > 0 ? counts.join(', ') : 'No usage data';
    },
    
    viewAnalytics() {
      this.$emit('navigate-to', 'admin');
    },

    viewStats() {
      this.$emit('navigate-to', 'stats');
    },
    
    formatTime(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.hero-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 60px 0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.welcome-message h1 {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand {
  background: linear-gradient(300deg, #74a9ff, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px 0;
  font-weight: 300;
}

/* Quick Search */
.quick-search {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 0 20px;
  height: 56px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-icon {
  color: #9aa0a6;
  margin-right: 12px;
  font-size: 18px;
}

.quick-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #202124;
}

.quick-search-input::placeholder {
  color: #9aa0a6;
}

.clear-quick-search {
  background: none;
  border: none;
  color: #9aa0a6;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.clear-quick-search:hover {
  background-color: #f1f3f4;
}

.quick-search-btn {
  background: white;
  border: none;
  border-radius: 50px;
  color: #4285f4;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  height: 56px;
  padding: 0 32px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.quick-search-btn:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.quick-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dashboard Content */
.dashboard-content {
  flex: 1;
  background: #f8f9fa;
  padding: 40px 0;
}

.dashboard-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  grid-auto-rows: auto;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Statistics Cards */
.stats-section {
  grid-column: 1 / -1;
  min-height: 200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #4285f4;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #5f6368;
  font-weight: 500;
}

/* Activity Section */
.activity-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
}

.activity-icon {
  font-size: 24px;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #9aa0a6;
}

/* Actions Section */
.actions-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  height: calc(100% - 60px); /* Account for title */
  align-content: start;
}

.action-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  background: white;
  border-color: #4285f4;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(66, 133, 244, 0.15);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 8px;
}

.action-description {
  font-size: 13px;
  color: #5f6368;
  line-height: 1.4;
}

/* Popular Searches */
.popular-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.popular-searches {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popular-search-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.popular-search-item:hover {
  background: #f8f9fa;
}

.search-rank {
  font-size: 20px;
  font-weight: 700;
  color: #4285f4;
  min-width: 40px;
}

.search-info {
  flex: 1;
}

.search-query {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 4px;
}

.search-count {
  font-size: 13px;
  color: #5f6368;
}

.search-trend {
  font-size: 20px;
}

.search-trend.up {
  color: #34a853;
}

.search-trend.down {
  color: #ea4335;
}

.search-trend.stable {
  color: #fbbc04;
}

/* System Status */
.status-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.healthy {
  background: #34a853;
}

.status-indicator.warning {
  background: #fbbc04;
}

.status-indicator.critical {
  background: #ea4335;
}

.status-name {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 2px;
}

.status-value {
  font-size: 12px;
  color: #5f6368;
}

/* Tips Section */
.tips-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #e8f0fe;
}

.tip-icon {
  font-size: 24px;
}

/* Latest Activity Styles */
.activity-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 0.85em;
  margin-top: 4px;
}

.activity-icon {
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon--success {
  background-color: rgba(52, 168, 83, 0.1);
  color: #34a853;
}

.activity-icon--error {
  background-color: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.activity-icon--file {
  background-color: rgba(66, 133, 244, 0.1);
  color: #4285f4;
}

.activity-warning {
  color: #ea4335;
  font-size: 0.9em;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(234, 67, 53, 0.1);
  border-radius: 4px;
  display: inline-block;
}

.activity-item--clickable {
  cursor: pointer;
}

.activity-item--clickable:hover {
  background: rgba(66, 133, 244, 0.05);
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a73e8;
  margin-bottom: 8px;
}

.tip-description {
  font-size: 14px;
  color: #1a73e8;
  opacity: 0.8;
  line-height: 1.4;
}

/* Loading and Empty States */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
}

.loading-state,
.empty-state {
  padding: 20px;
  text-align: center;
  color: #5f6368;
  font-size: 14px;
}

.loading-state {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.stat-card {
  position: relative;
}

/* Section Base Styles */
.activity-section,
.actions-section,
.popular-section,
.status-section,
.tips-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.activity-section {
  grid-row: span 2;
}

.actions-section {
  grid-row: span 1;
}

.popular-section {
  grid-row: span 1;
}

.tips-section {
  grid-row: span 1;
}

.status-section {
  grid-row: span 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    padding: 0 16px;
  }
  
  .welcome-message h1 {
    font-size: 32px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .quick-search {
    flex-direction: column;
    gap: 16px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .activity-section,
  .actions-section,
  .popular-section,
  .status-section,
  .tips-section {
    min-height: unset;
    max-height: unset;
  }
}
</style>
