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
      <SidebarFiles :files="files" />
      <FileTabs :openedFiles="openedFiles" />
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
      files: ['README.md', 'index.html', 'main.js', 'App.vue', 'user.vue'],
      openedFiles: ['README.md'],
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
    saveSettings({ token, serverUrl }) {
      this.token = token;
      this.serverUrl = serverUrl;
      this.settingsVisible = false;
    }
  }
}
</script>

<style>
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
