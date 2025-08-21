<template>
  <div>
    <LoginPage v-if="!token" @login-success="onLoginSuccess" />
    <template v-else>
      <div class="top-bar">
        <h1 class="logo">KBSage v0.1</h1>
        <div style="flex: 1;"></div>
        <span v-if="user && user.nickname" class="user-nickname">{{ user.nickname }}</span>
        <button class="search-sidebar-btn" @click="toggleSearch">
          <span v-if="!searchVisible" style="font-size: 22px;">▶</span>
          <span v-else style="font-size: 22px;">◀</span>
        </button>
        <button class="settings-icon-btn" @click="settingsVisible = true">
          <span style="font-size: 22px;">⚙️</span>
        </button>
      </div>
      <div class="app-layout">
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

export default {
  name: 'App',
  components: {
    SidebarFiles,
    FileTabs,
    SearchSidebar,
    SettingsModal,
    LoginPage
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
        username: '',
        password: ''
      };
  },
  methods: {
    onLoginSuccess({ username, password }) {
      // After login, store username and password and load files
      this.username = username;
      this.password = password;
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
          if (res.status === 'success' && res.response && Array.isArray(res.response.files)) {
            this.files = res.response.files.map(f => f.filename);
            // For each opened file, update its content
            for (const filename of this.openedFiles) {
              try {
                const fileRes = await apiRequest({
                  url: `${this.serverUrl}/files/file_content`,
                  method: 'GET',
                  token: this.token,
                  params: { filename }
                });
                if (fileRes.status === 'success' && fileRes.response && fileRes.response.content) {
                  this.fileContents[filename] = fileRes.response.content;
                }
              } catch (e) {
                // Ignore errors for individual files
              }
            }
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
        const res = await apiRequest({
          url: `${this.serverUrl}/files/file_content`,
          method: 'GET',
          token: this.token,
          params: { filename }
        });
        if (res.status === 'success' && res.response && res.response.content) {
          this.fileContents[filename] = res.response.content;
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


/* You may want to add similar card style to SidebarFiles and SearchSidebar */
</style>
