<template>
  <div>
    <div class="top-bar">
      <h1 class="logo">KBSage</h1>
      <div style="flex: 1;"></div>
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
        <FileTabs
          :openedFiles="openedFiles"
          :fileContents="fileContents"
          :activeTab="activeTab"
          @close-file="closeFile"
          @switch-tab="switchTab"
        />
        <transition name="sidebar-slide">
          <SearchSidebar v-if="searchVisible" :visible="searchVisible" :token="token" :serverUrl="serverUrl" />
        </transition>
      <SettingsModal
        :visible="settingsVisible"
        :initialToken="token"
        :initialServerUrl="serverUrl"
        @close="settingsVisible = false"
        @save="saveSettings"
      />
    </div>
  </div>
</template>

<script>
import SidebarFiles from './components/SidebarFiles.vue';
import FileTabs from './components/FileTabs.vue';
import SearchSidebar from './components/SearchSidebar.vue';
import SettingsModal from './components/SettingsModal.vue';

export default {
  name: 'App',
  components: {
    SidebarFiles,
    FileTabs,
    SearchSidebar,
    SettingsModal
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
        activeTab: null
      };
  },
  methods: {
    toggleSearch() {
      this.searchVisible = !this.searchVisible;
    },
    async saveSettings({ token, serverUrl }) {
      this.token = token;
      this.serverUrl = serverUrl;
      this.settingsVisible = false;
      // First check server without token
      try {
        const { apiRequest } = await import('./api.js');
        const res = await apiRequest({
          url: `${serverUrl}/`,
          method: 'GET'
        });
        if (typeof res === 'object' && res.app) {
          // Server is up, now load files list
          await this.reloadFiles();
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
/* Sidebar slide animation */
.sidebar-slide-enter-active, .sidebar-slide-leave-active {
  transition: all 0.3s cubic-bezier(.55,0,.1,1);
}
.sidebar-slide-enter, .sidebar-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-left: 16px;
  left: 0;
}
.reload-btn {
  padding: 8px 16px;
  background: #fff;
  color: #0078d4;
  border: 1px solid #0078d4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 56px;
  background: #f7f7f7;
  border-bottom: 1px solid #ddd;
  padding: 0 24px;
  gap: 12px;
}
.app-layout {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 56px);
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.toggle-search {
  padding: 8px 16px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.settings-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
}
.search-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
}
</style>
