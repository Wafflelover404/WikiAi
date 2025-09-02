<template>
  <div class="home-page">
    <!-- Welcome Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="welcome-message">
          <h1>Welcome to <span class="brand">KBSage</span></h1>
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
                <div class="stat-number">{{ totalFiles }}</div>
                <div class="stat-label">Total Documents</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🔍</div>
              <div class="stat-info">
                <div class="stat-number">{{ totalSearches }}</div>
                <div class="stat-label">Searches Today</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <div class="stat-number">{{ avgResponseTime }}ms</div>
                <div class="stat-label">Avg Response Time</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-number">{{ knowledgeScore }}%</div>
                <div class="stat-label">Knowledge Coverage</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <h2 class="section-title">🕒 Recent Activity</h2>
          <div class="activity-list">
            <div 
              v-for="(activity, idx) in recentActivity" 
              :key="idx" 
              class="activity-item"
              @click="handleActivityClick(activity)"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
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
            
            <div class="action-card" @click="uploadFiles">
              <div class="action-icon">⬆️</div>
              <div class="action-title">Upload Documents</div>
              <div class="action-description">Add new files to your knowledge base</div>
            </div>
            
            <div class="action-card" @click="viewAnalytics">
              <div class="action-icon">📊</div>
              <div class="action-title">Analytics</div>
              <div class="action-description">View usage statistics and insights</div>
            </div>
          </div>
        </div>

        <!-- Popular Searches -->
        <div class="popular-section">
          <h2 class="section-title">🔥 Trending Searches</h2>
          <div class="popular-searches">
            <div 
              v-for="(search, idx) in popularSearches" 
              :key="idx" 
              class="popular-search-item"
              @click="performSearch(search.query)"
            >
              <div class="search-rank">#{{ idx + 1 }}</div>
              <div class="search-info">
                <div class="search-query">{{ search.query }}</div>
                <div class="search-count">{{ search.count }} searches</div>
              </div>
              <div class="search-trend" :class="search.trend">
                {{ search.trend === 'up' ? '📈' : search.trend === 'down' ? '📉' : '➡️' }}
              </div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="status-section">
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
    }
  },
  data() {
    return {
      quickSearchText: '',
      recentActivity: [
        {
          icon: '🔍',
          title: 'Search: "API documentation"',
          description: 'Found 12 relevant documents',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          type: 'search',
          query: 'API documentation'
        },
        {
          icon: '📄',
          title: 'Opened: setup-guide.md',
          description: 'Viewed installation instructions',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          type: 'file',
          filename: 'setup-guide.md'
        },
        {
          icon: '⬆️',
          title: 'Uploaded: troubleshooting.pdf',
          description: 'Added new troubleshooting guide',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          type: 'upload',
          filename: 'troubleshooting.pdf'
        },
        {
          icon: '🔍',
          title: 'Search: "configuration settings"',
          description: 'Found 8 relevant documents',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          type: 'search',
          query: 'configuration settings'
        }
      ],
      popularSearches: [
        { query: 'API documentation', count: 156, trend: 'up' },
        { query: 'installation guide', count: 134, trend: 'stable' },
        { query: 'troubleshooting', count: 98, trend: 'up' },
        { query: 'configuration', count: 87, trend: 'down' },
        { query: 'deployment process', count: 76, trend: 'up' }
      ],
      totalSearches: 42,
      avgResponseTime: 340,
      knowledgeScore: 94,
      aiProcessingStatus: 'Optimal',
      storageUsage: 67
    };
  },
  computed: {
    totalFiles() {
      return this.files.length || 28; // Fallback for demo
    },
    storageStatusClass() {
      if (this.storageUsage < 70) return 'healthy';
      if (this.storageUsage < 90) return 'warning';
      return 'critical';
    }
  },
  methods: {
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
      // Create a temporary file input
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
    
    viewAnalytics() {
      this.$emit('navigate-to', 'admin');
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
  background: linear-gradient(45deg, #4285f4, #34a853);
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
