<template>
  <div>
    <div class="top-bar">
      <button class="toggle-search" @click="toggleSearch">
        {{ searchVisible ? 'Close Search' : 'Open Search' }}
      </button>
      <button class="settings-btn" @click="settingsVisible = true">
        ⚙️ Settings
      </button>
    </div>
    <div class="app-layout">
      <SidebarFiles :files="files" @file-click="handleFileClick">
        <template #actions>
          <button class="reload-btn" @click="updateFiles">
            🔄 Update
          </button>
        </template>
      </SidebarFiles>
      <FileTabs :openedFiles="openedFiles" :fileContents="fileContents" />
      <SearchSidebar :visible="searchVisible" />
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
      serverUrl: ''
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
      if (this.openedFiles.includes(filename)) return;
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
      } catch (e) {
        this.fileContents[filename] = 'Error loading file.';
        this.openedFiles.unshift(filename);
      }
    }
  }
}
</script>

<style>
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
}
.toggle-search {
  padding: 8px 16px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.settings-btn {
  padding: 8px 16px;
  background: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
</style>
