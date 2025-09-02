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
          <li :class="{active: !showAdminDashboard}" @click="showAdminDashboard = false" tabindex="0" aria-label="Home">🏠 Home</li>
          <li :class="{active: false}" tabindex="0" aria-label="Files">📁 Files</li>
          <li :class="{active: false}" tabindex="0" aria-label="Search" @click="toggleSearch">🔍 Search</li>
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
          <div class="main-content">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs" aria-label="Breadcrumb">
              <span>Home</span>
              <span v-if="activeTab"> / {{ activeTab }}</span>
            </nav>
            <!-- Global Search Bar -->
            <div class="global-search-bar">
              <input type="text" v-model="globalSearch" placeholder="Search files..." aria-label="Global Search" @input="onGlobalSearchInput" />
              <button v-if="globalSearch" @click="clearGlobalSearch" aria-label="Clear search" class="clear-search-btn">✖</button>
            </div>
            <!-- Loading/Feedback -->
            <div v-if="loading" class="loading-indicator" role="status" aria-live="polite">Loading...</div>
            <!-- File List Sidebar -->
            <SidebarFiles :files="filteredFiles" :token="token" :serverUrl="serverUrl" @file-click="handleFileClick">
              <template #actions>
                <button class="reload-btn" @click="updateFiles" aria-label="Reload files">🔄 Update</button>
              </template>
            </SidebarFiles>
            <!-- Main Content Tabs -->
            <FileTabs
              :openedFiles="openedFiles"
              :fileContents="fileContents"
              :activeTab="activeTab"
              @close-file="closeFile"
              @switch-tab="switchTab"
            />
            <!-- Search Sidebar -->
            <transition name="sidebar-slide">
              <div v-if="searchVisible" class="search-sidebar-animated">
                <SearchSidebar :visible="searchVisible" :token="token" :serverUrl="serverUrl" />
              </div>
            </transition>
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
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import SidebarFiles from './components/SidebarFiles.vue';
import FileTabs from './components/FileTabs.vue';
import SearchSidebar from './components/SearchSidebar.vue';
import SettingsModal from './components/SettingsModal.vue';
import LoginPage from './components/LoginPage.vue';
import AdminDashboard from './components/AdminDashboard.vue';

export default {
  name: 'App',
  components: {
    SidebarFiles,
    FileTabs,
    SearchSidebar,
    SettingsModal,
    LoginPage,
    AdminDashboard
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
      loading: false
    };
  },
  computed: {
    isAdmin() {
      return this.user && this.user.role === 'admin';
    },
    maskedToken() {
      return this.token ? '•'.repeat(this.token.length) : 'No token';
    },
    filteredFiles() {
      if (!this.globalSearch) return this.files;
      return this.files.filter(f => f.toLowerCase().includes(this.globalSearch.toLowerCase()));
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
            this.files = res.response.documents.map(f => f.filename);
          } else {
            this.files = [];
          }
        } catch (e) {
          this.files = [];
        } finally {
          this.loading = false;
        }
      }
    },
    async handleFileClick(filename) {
      if (!this.token || !this.serverUrl) return;
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
        } else if (res.status === 404) {
          this.fileContents[filename] = 'File not found.';
        } else if (res.status === 403) {
          this.fileContents[filename] = 'Access denied.';
        } else {
          this.fileContents[filename] = 'Unable to load file content.';
        }
        this.openedFiles.unshift(filename);
        this.activeTab = filename;
      } catch (e) {
        this.fileContents[filename] = 'Error loading file.';
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
    switchTab(filename) {
      this.activeTab = filename;
    }
  }
}
</script>



<style>
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
}
.dark-mode {
  background: #181a1b !important;
  color: #e0e0e0;
}
.sidebar-nav {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100vh;
  box-shadow: 2px 0 8px rgba(33, 150, 243, 0.04);
  z-index: 20;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
/* Accessibility: focus ring for keyboard navigation */
.sidebar-tabs li:focus {
  outline: 2px solid #007BFF;
}
</style>
