<template>
  <div>
  <!-- debug token output removed -->
    <LoginPage v-if="!token" @login-success="onLoginSuccess" />
    <template v-else>
      <div class="top-bar">
        <h1 class="logo">KBSage v0.1</h1>
        <nav class="main-nav">
          <a href="#" :class="{active: !showAdminDashboard}" @click.prevent="showAdminDashboard = false">Home</a>
          <a v-if="isAdmin" href="#" :class="{active: showAdminDashboard}" @click.prevent="showAdminDashboard = true">Admin</a>
        </nav>
        <div style="flex: 1;"></div>
        <div v-if="!showAdminDashboard">
          <span v-if="user && user.nickname" class="user-nickname">{{ user.nickname }}</span>
          <button class="search-sidebar-btn" @click="toggleSearch">
            <span v-if="!searchVisible" style="font-size: 22px;">▶</span>
            <span v-else style="font-size: 22px;">◀</span>
          </button>
          <button class="settings-icon-btn" @click="settingsVisible = true">
            <span style="font-size: 22px;">⚙️</span>
          </button>
        </div>
        <div v-else>
            <div class="token-section">
            <label>Token</label>
            <div class="token-box">
              <span>{{ showToken ? token : maskedToken }}</span>
              <div class="token-actions">
                <button @click="toggleToken" :title="showToken ? 'Hide token' : 'Show token'">
                  {{ showToken ? '🙈' : '👁' }}
                </button>
                <button @click="copyToken" title="Copy token">📋</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="app-layout">
        <template v-if="showAdminDashboard">
          <AdminDashboard :token="this.token" :API_BASE_URL="this.serverUrl" :activeTabAdmin="this.activeTabAdmin" @close="showAdminDashboard = false" />
        </template>
        <template v-else>
          <SidebarFiles :files="files" :token="token" :serverUrl="serverUrl" @file-click="handleFileClick">
            <template #actions>
              <button class="reload-btn" @click="updateFiles">
                🔄 Update
              </button>
            </template>
          </SidebarFiles>
          <div
            class="main-content"
            :class="{ 'main-content-shifted': searchVisible }"
          >
            <FileTabs
              :openedFiles="openedFiles"
              :fileContents="fileContents"
              :activeTab="activeTab"
              @close-file="closeFile"
              @switch-tab="switchTab"
            />
          </div>
          <transition name="sidebar-slide">
            <div v-if="searchVisible" class="search-sidebar-animated">
              <SearchSidebar :visible="searchVisible" :token="token" :serverUrl="serverUrl" />
            </div>
          </transition>
          <SettingsModal
            :visible="settingsVisible"
            :initialUsername="username"
            :initialPassword="password"
            :initialServerUrl="serverUrl"
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
        showToken: false
      };
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
      // After login, store username, password, role, token, and serverUrl, then load files
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
    async saveSettings({ serverUrl }) {
      this.serverUrl = serverUrl;
      this.settingsVisible = false;
      // First check server
      try {
        const { apiRequest } = await import('./api.js');
        const res = await apiRequest({
          url: `${serverUrl}/`,
          method: 'GET'
        });
        if (typeof res === 'object' && res.app) {
          if (this.token) {
            await this.reloadFiles();
          }
        } else {
          this.files = [];
        }
      } catch (e) {
        this.files = [];
      }
    },
    async reloadFiles() {
      // Deprecated: use updateFiles instead
      await this.updateFiles();
    },
    async updateFiles() {
      if (this.token && this.serverUrl) {
        try {
          const { apiRequest } = await import('./api.js');
          // Get the list of files
          const res = await apiRequest({
            url: `${this.serverUrl}/files/list`,
            method: 'GET',
            token: this.token
          });
          // Handle backend response: { status, message, response: { documents: [...] } }
          if (res && res.response && Array.isArray(res.response.documents)) {
            this.files = res.response.documents.map(f => f.filename);
          } else {
            this.files = [];
          }
        } catch (e) {
          this.files = [];
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
        const { apiRequest } = await import('./api.js');
        // URL-encode the filename for backend compatibility
        const encodedFilename = encodeURIComponent(filename);
        // Use the new backend endpoint: /files/content/{filename}
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
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
      }
    },
    closeFile(filename) {
      this.openedFiles = this.openedFiles.filter(f => f !== filename);
      if (this.activeTab === filename) {
        this.activeTab = this.openedFiles[0] || null;
      }
      // Optionally remove fileContents[filename] if you want to free memory
    },
    switchTab(filename) {
      this.activeTab = filename;
    }
  }
}
</script>



<style>
body {
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
}
.logo {
  font-size: 26px;
  font-weight: 500;
  color: #1976d2;
  margin-left: 8px;
  letter-spacing: 1px;
}
.top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  border-bottom: 1px solid #e0e0e0;
  padding: 0 32px;
  gap: 16px;
}
.user-nickname {
  font-size: 16px;
  color: #1976d2;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 8px;
}
.main-nav {
  display: flex;
  gap: 16px;
  margin-left: 32px;
}
.main-nav a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  font-size: 18px;
  padding: 6px 18px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.main-nav a.active, .main-nav a:hover {
  background: #e3f2fd;
  color: #1565c0;
}
/* Animate sidebar and main content shift */
.app-layout {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 64px);
  background: #f5f5f5;
  position: relative;
  min-height: 0;
  overflow: hidden;
}


.main-content {
  flex: 1;
  min-width: 0;
  transition: margin-right 0.6s cubic-bezier(.23,1,.32,1);
  margin-right: 0;
  display: flex;
  flex-direction: column;
}
.main-content-shifted {
  margin-right: 320px; /* Same as sidebar width */
  transition: margin-right 0.6s cubic-bezier(.23,1,.32,1);
}


.search-sidebar-animated {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 320px;
  z-index: 10;
  transition: width 0.6s cubic-bezier(.23,1,.32,1);
  /* Let the transition handle appearance */
}
.reload-btn {
  padding: 8px 20px;
  background: #fff;
  color: #1976d2;
  border: 1.5px solid #1976d2;
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
.settings-icon-btn, .search-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  margin-left: 8px;
  border-radius: 50%;
  transition: background 0.5s;
}
.settings-icon-btn:hover, .search-sidebar-btn:hover {
  background: #e3f2fd;
}
/* Sidebar slide animation for transition */

.sidebar-slide-enter-active, .sidebar-slide-leave-active {
  transition: all 0.6s cubic-bezier(.23,1,.32,1);
}
.sidebar-slide-enter, .sidebar-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.toggle-search {
  padding: 8px 20px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
  transition: background 0.5s;
}
.toggle-search:hover {
  background: #1565c0;
}
/* Card style for main content */
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
  overflow: hidden; /* Prevent entire page from scrolling */
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
  color: #1976d2;
}
</style>
