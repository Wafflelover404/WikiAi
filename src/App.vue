<template>
  <div class="kb-app" :class="{ 'dark-mode': darkMode }">
    <!-- Login Screen -->
    <LoginPage v-if="!token" @login-success="onLoginSuccess" />
    <!-- Main App -->
    <template v-else>
      <div class="sidebar-nav" role="navigation" aria-label="Main Navigation">
        <div class="sidebar-header">
          <img src="/favicon.ico" alt="KBSage Logo" class="sidebar-logo" />
          <span class="sidebar-title">KBSage</span>
        </div>
        <ul class="sidebar-tabs">
          <li :class="{active: currentView === 'home' && !showAdminDashboard}" @click="navigateTo('home')" tabindex="0" aria-label="Home">🏠 Home</li>
          <li :class="{active: currentView === 'files' && !showAdminDashboard}" @click="navigateTo('files')" tabindex="0" aria-label="Files">📁 Files</li>
          <li :class="{active: currentView === 'search' && !showAdminDashboard}" @click="navigateTo('search')" tabindex="0" aria-label="Search">🔍 Search</li>
          <li v-if="isAdmin" :class="{active: showAdminDashboard}" @click="showAdminDashboard = true" tabindex="0" aria-label="Admin">🛠 Admin</li>
        </ul>
        <div class="sidebar-bottom">
          <button class="darkmode-toggle" @click="toggleDarkMode" :aria-pressed="darkMode" aria-label="Toggle dark mode">
            <span v-if="!darkMode">🌙</span>
            <span v-else>☀️</span>
          </button>
          <button class="settings-icon-btn" @click="settingsVisible = true" aria-label="Settings">
            ⚙️
          </button>
        </div>
      </div>
      <div class="app-layout">
        <template v-if="showAdminDashboard">
          <AdminDashboard :token="token" :API_BASE_URL="serverUrl" :activeTabAdmin="activeTabAdmin" @close="showAdminDashboard = false" />
        </template>
        <template v-else>
          <!-- Home View -->
          <HomePage 
            v-if="currentView === 'home'"
            :files="files"
            :token="token"
            :serverUrl="serverUrl"
            @navigate-to="navigateTo"
            @perform-search="performSearch"
            @open-file="openFileFromHome"
            @upload-files="handleFileUpload"
          />
          
          <!-- Files View -->
          <div v-else-if="currentView === 'files'" class="files-view">
            <div class="view-header">
              <h1>📁 Files</h1>
              <p class="view-subtitle">Browse and manage your document library</p>
              <div class="view-actions">
                <div class="search-bar">
                  <input 
                    type="text" 
                    v-model="globalSearch" 
                    placeholder="Search files..." 
                    class="files-search-input"
                  />
                  <button v-if="globalSearch" @click="clearGlobalSearch" class="clear-search-btn">✖</button>
                </div>
                <div class="file-status">
                  <span class="status-text">{{ loading ? 'Loading...' : `${filteredFiles.length} files` }}</span>
                  <span v-if="!loading" class="last-update">Last updated: {{ getLastUpdateTime() }}</span>
                </div>
              </div>
            </div>
            <div v-if="loading" class="loading-indicator" role="status" aria-live="polite">Loading...</div>
            <div class="main-content-area">
              <FileTabs
                :files="filteredFiles"
                :openedFiles="openedFiles"
                :fileContents="fileContents"
                :activeTab="activeTab"
                @close-file="closeFile"
                @switch-tab="switchTab"
                @download-file="downloadFile"
              />
            </div>
          </div>
          
          <!-- Search View -->
          <SearchPage 
            v-else-if="currentView === 'search'"
            :token="token"
            :serverUrl="serverUrl"
            :initial-search="pendingSearch"
            @search-performed="pendingSearch = ''"
          />
          
          <!-- Settings Modal -->
          <SettingsModal
            :visible="settingsVisible"
            :initialUsername="username"
            :initialPassword="password"
            :initialServerUrl="serverUrl"
            :accessToken="token"
            @close="settingsVisible = false"
            @save="saveSettings"
            @logout="handleLogout"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import FileTabs from './components/FileTabs.vue';
import SearchSidebar from './components/SearchSidebar.vue';
import SettingsModal from './components/SettingsModal.vue';
import LoginPage from './components/LoginPage.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import HomePage from './components/HomePage.vue';
import SearchPage from './components/SearchPage.vue';

export default {
  name: 'App',
  components: {
    FileTabs,
    SearchSidebar,
    SettingsModal,
    LoginPage,
    AdminDashboard,
    HomePage,
    SearchPage
  },
  data() {
    return {
      files: [],
      openedFiles: [],
      fileContents: {},
      searchVisible: false,
      settingsVisible: false,
      token: '',
      serverUrl: '',
      activeTab: null,
      activeTabAdmin: 'users',
      username: '',
      password: '',
      user: null,
      showAdminDashboard: false,
      showToken: false,
      darkMode: false,
      globalSearch: '',
      loading: false,
      currentView: 'home',
      pendingSearch: ''
    };
  },
  watch: {
    currentView(newView) {
      if (newView === 'files' && this.files.length === 0 && this.token && this.serverUrl) {
        this.updateFiles();
      }
    }
  },
  computed: {
      isAdmin() {
        // You may want to fetch user info from API or decode token
        // For now, assume user info is available in this.user
        return this.user && this.user.role === 'admin';
      },
      maskedToken() {
        return this.token ? '•'.repeat(this.token.length) : 'No token';
      },
      filteredFiles() {
        if (!this.globalSearch) return this.files;
        const search = this.globalSearch.toLowerCase();
        return this.files.filter(file => {
          const name = (file.filename || file.original_filename || '').toLowerCase();
          const description = (file.description || '').toLowerCase();
          return name.includes(search) || description.includes(search);
        });
      }
    },
  methods: {
    toggleToken() {
      this.showToken = !this.showToken;
    },
    copyToken() {
      navigator.clipboard.writeText(this.token).then(() => alert('Token copied!'));
    },
    onLoginSuccess({ username, password, role, token, serverUrl }) {
      this.username = username;
      this.password = password;
      this.user = { username, role };
      this.token = token || this.$root.token;
      this.serverUrl = serverUrl;
      this.updateFiles();
    },
    handleLogout() {
      this.token = '';
      this.username = '';
      this.password = '';
      this.files = [];
      this.openedFiles = [];
      this.fileContents = {};
      this.activeTab = null;
      this.searchVisible = false;
      this.settingsVisible = false;
    },
    toggleSearch() {
      this.searchVisible = !this.searchVisible;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.body.classList.toggle('dark-mode', this.darkMode);
    },
    onGlobalSearchInput() {
      // Optionally add debounce for performance
    },
    clearGlobalSearch() {
      this.globalSearch = '';
    },
    async saveSettings({ serverUrl }) {
      this.serverUrl = serverUrl;
      this.settingsVisible = false;
      try {
        this.loading = true;
        const { apiRequest } = await import('./api.js');
        const res = await apiRequest({ url: `${serverUrl}/`, method: 'GET' });
        if (typeof res === 'object' && res.app) {
          if (this.token) {
            await this.reloadFiles();
          }
        } else {
          this.files = [];
        }
      } catch (e) {
        this.files = [];
      } finally {
        this.loading = false;
      }
    },
    async reloadFiles() {
      await this.updateFiles();
    },
    async updateFiles() {
      if (this.token && this.serverUrl) {
        try {
          this.loading = true;
          const { apiRequest } = await import('./api.js');
          const res = await apiRequest({ url: `${this.serverUrl}/files/list`, method: 'GET', token: this.token });
          if (res && res.response && Array.isArray(res.response.documents)) {
            // Store full file objects with metadata instead of just filenames
            this.files = res.response.documents.map(doc => ({
              filename: doc.filename || doc.original_filename,
              original_filename: doc.original_filename,
              file_id: doc.file_id,
              size: doc.size || 0,
              upload_date: doc.upload_date || doc.created_at,
              file_type: doc.file_type || this.getFileTypeFromName(doc.filename || doc.original_filename),
              description: doc.description || ''
            }));
            console.log('Files loaded:', this.files);
          } else {
            this.files = [];
          }
        } catch (e) {
          console.error('Error fetching files:', e);
          this.files = [];
        } finally {
          this.loading = false;
        }
      }
    },
    async handleFileClick(fileOrFilename) {
      if (!this.token || !this.serverUrl) return;
      
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      if (this.openedFiles.includes(filename)) {
        this.activeTab = filename;
        return;
      }
      
      try {
        this.loading = true;
        const encodedFilename = encodeURIComponent(filename);
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (res.ok) {
          const content = await res.text();
          this.fileContents[filename] = content;
          console.log(`File content loaded for: ${filename}`);
        } else if (res.status === 404) {
          this.fileContents[filename] = 'File not found.';
          console.warn(`File not found: ${filename}`);
        } else if (res.status === 403) {
          this.fileContents[filename] = 'Access denied.';
          console.warn(`Access denied for file: ${filename}`);
        } else {
          this.fileContents[filename] = `Unable to load file content. Status: ${res.status}`;
          console.error(`Failed to load file: ${filename}, status: ${res.status}`);
        }
        
        this.openedFiles.unshift(filename);
        this.activeTab = filename;
      } catch (e) {
        console.error(`Error loading file ${filename}:`, e);
        this.fileContents[filename] = 'Error loading file: ' + e.message;
        this.openedFiles.unshift(filename);
        this.activeTab = filename;
      } finally {
        this.loading = false;
      }
    },
    closeFile(filename) {
      this.openedFiles = this.openedFiles.filter(f => f !== filename);
      if (this.activeTab === filename) {
        this.activeTab = this.openedFiles[0] || null;
      }
    },
    async switchTab(fileOrFilename) {
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      // Load file content if not already loaded
      if (!this.fileContents[filename]) {
        await this.handleFileClick(filename);
      } else {
        this.activeTab = filename;
        if (!this.openedFiles.includes(filename)) {
          this.openedFiles.unshift(filename);
        }
      }
    },
    async downloadFile(fileOrFilename) {
      if (!this.token || !this.serverUrl) return;
      
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      try {
        const encodedFilename = encodeURIComponent(filename);
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
          console.log(`File downloaded: ${filename}`);
        } else {
          console.error(`Failed to download file ${filename}:`, res.statusText);
        }
      } catch (e) {
        console.error(`Error downloading file ${filename}:`, e);
      }
    },
    
    // Navigation methods
    navigateTo(view) {
      this.currentView = view;
      this.showAdminDashboard = false;
      
      // Reset active tab when switching views
      if (view !== 'files') {
        this.activeTab = null;
      }
    },
    
    // Home page event handlers
    performSearch(query) {
      this.pendingSearch = query;
      this.currentView = 'search';
    },
    
    async openFileFromHome(fileOrFilename) {
      this.currentView = 'files';
      await this.handleFileClick(fileOrFilename);
    },
    
    handleFileUpload(files) {
      // Handle file upload - you can implement this based on your API
      console.log('Files to upload:', files);
      // For now, just show an alert
      alert(`Selected ${files.length} file(s) for upload. Upload functionality needs to be implemented.`);
    },
    
    getFileTypeFromName(filename) {
      if (!filename) return 'unknown';
      const extension = filename.split('.').pop()?.toLowerCase();
      const typeMap = {
        'md': 'markdown',
        'txt': 'text',
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'json': 'json',
        'js': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin',
        'xml': 'xml',
        'yml': 'yaml',
        'yaml': 'yaml'
      };
      return typeMap[extension] || 'unknown';
    },
    
    getLastUpdateTime() {
      if (!this.files.length) return 'Never';
      // For now, return a simple timestamp. In a real app, you'd track this
      return new Date().toLocaleTimeString();
    }
  }
}
</script>



<style>
.kb-app {
  max-width: 100%;
}

/* Full-page login UI */
.login-fullpage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  z-index: 100;
}
body {
  font-family: 'Inter', 'Open Sans', Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
  transition: background 0.3s;
}
.kb-app {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}
.dark-mode {
  background: #181a1b !important;
  color: #e0e0e0;
}
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 2px 0 8px rgba(33, 150, 243, 0.04);
  z-index: 1000;
  overflow-y: auto;
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 24px 16px 12px 16px;
  gap: 12px;
}
.sidebar-logo {
  width: 32px;
  height: 32px;
}
.sidebar-title {
  font-size: 22px;
  font-weight: 600;
  color: #007BFF;
  letter-spacing: 1px;
}
.sidebar-tabs {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.sidebar-tabs li {
  padding: 14px 24px;
  font-size: 18px;
  color: #6C757D;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  outline: none;
}
.sidebar-tabs li.active, .sidebar-tabs li:focus, .sidebar-tabs li:hover {
  background: #e3f2fd;
  color: #007BFF;
  border-left: 4px solid #007BFF;
}
.sidebar-bottom {
  display: flex;
  gap: 8px;
  padding: 16px;
  justify-content: flex-end;
}
.darkmode-toggle {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  border-radius: 50%;
  padding: 8px;
  transition: background 0.2s;
}
.darkmode-toggle:hover {
  background: #e3f2fd;
}
.settings-icon-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  border-radius: 50%;
  padding: 8px;
  transition: background 0.2s;
}
.settings-icon-btn:hover {
  background: #e3f2fd;
}
.app-layout {
  margin-left: 220px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: inherit;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 32px;
}
.breadcrumbs {
  font-size: 15px;
  color: #6C757D;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.global-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  gap: 8px;
}
.global-search-bar input {
  font-size: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 260px;
  outline: none;
  transition: border-color 0.2s;
}
.global-search-bar input:focus {
  border-color: #007BFF;
}
.clear-search-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #DC3545;
  border-radius: 50%;
  padding: 4px;
  transition: background 0.2s;
}
.clear-search-btn:hover {
  background: #f8d7da;
}
.loading-indicator {
  font-size: 16px;
  color: #007BFF;
  margin-bottom: 12px;
}
.reload-btn {
  padding: 8px 20px;
  background: #fff;
  color: #007BFF;
  border: 1.5px solid #007BFF;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  transition: background 0.2s, color 0.2s;
}
.reload-btn:hover {
  background: #e3f2fd;
  color: #1565c0;
}
.search-sidebar-animated {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 320px;
  z-index: 10;
  transition: width 0.6s cubic-bezier(.23,1,.32,1);
}
.sidebar-slide-enter-active, .sidebar-slide-leave-active {
  transition: all 0.6s cubic-bezier(.23,1,.32,1);
}
.sidebar-slide-enter, .sidebar-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.file-tabs-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(33, 150, 243, 0.10);
  margin: 24px;
  padding: 24px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.admin-dashboard-wrapper {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.token-section {
  margin-bottom: 32px;
}
.token-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-top: 8px;
  word-break: break-all;
}
.token-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: 6px;
  color: #007BFF;
}
/* Main content area */
.main-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 8px;
}

/* Files View Styles */
.files-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
}

.view-header {
  background: white;
  padding: 32px 40px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-subtitle {
  font-size: 18px;
  color: #5f6368;
  margin: 0 0 24px 0;
  font-weight: 300;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  position: relative;
}

.files-search-input {
  width: 320px;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.files-search-input:focus {
  background: white;
  border-color: #4285f4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
}

.files-search-input::placeholder {
  color: #9aa0a6;
}

.file-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.last-update {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

/* Accessibility: focus ring for keyboard navigation */
.sidebar-tabs li:focus {
  outline: 2px solid #007BFF;
}

/* Responsive design for files view and overall app */
@media (max-width: 1024px) {
  .sidebar-nav {
    width: 180px;
  }
  
  .app-layout {
    margin-left: 180px;
  }
  
  .admin-header-content {
    padding: 20px 24px;
  }
  
  .admin-tab-content {
    padding: 24px 24px;
  }
}

@media (max-width: 768px) {
  .sidebar-nav {
    position: fixed;
    left: -220px;
    transition: left 0.3s ease;
    z-index: 2000;
  }
  
  .sidebar-nav.mobile-open {
    left: 0;
  }
  
  .app-layout {
    margin-left: 0;
  }
  
  .view-header {
    padding: 24px 20px;
  }
  
  .view-header h1 {
    font-size: 28px;
  }
  
  .view-subtitle {
    font-size: 16px;
  }
  
  .view-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .files-search-input {
    width: 100%;
  }
  
  .admin-header-content {
    padding: 16px 20px;
  }
  
  .admin-title {
    font-size: 24px;
  }
  
  .admin-subtitle {
    font-size: 14px;
  }
  
  .admin-stats-quick {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .sidebar-title {
    font-size: 18px;
  }
  
  .sidebar-tabs li {
    font-size: 16px;
    padding: 12px 20px;
  }
  
  .admin-tabs {
    padding: 0 20px;
    overflow-x: auto;
  }
  
  .admin-tab {
    min-width: 120px;
    justify-content: center;
  }
  
  .admin-tab-content {
    padding: 20px 16px;
  }
}
</style>
