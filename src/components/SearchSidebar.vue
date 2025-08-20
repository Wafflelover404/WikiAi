<template>
  <div class="search-sidebar" v-if="visible">
    <h3>Search</h3>
    <div class="search-bar">
      <input v-model="searchText" type="text" placeholder="Search knowledge base..." class="search-input" @keyup.enter="runSearch" />
      <button class="search-btn" @click="runSearch">🔍</button>
    </div>
    <div class="ai-overview" v-if="aiOverviewLoading || aiOverview">
      <strong>AI Overview:</strong>
      <div v-if="aiOverviewLoading" style="color:#0078d4;">Loading AI overview...</div>
      <div v-else>{{ aiOverview }}</div>
    </div>
    <div class="search-results">
      <div v-if="aiOverviewLoaded && searchResults.length">
        <div v-for="(result, idx) in searchResults" :key="idx" class="search-result">
          <div v-html="cleanResult(result)"></div>
          <button v-if="extractUploadId(result)" class="open-file-btn" @click="openFile(extractUploadId(result), cleanResult(result))">Open document</button>
        </div>
      </div>
      <p v-if="aiOverviewLoaded && !searchResults.length">No results yet.</p>
    </div>
    <div v-if="fileModalVisible" class="file-modal">
      <div class="file-modal-content">
        <button class="close-file-modal" @click="fileModalVisible = false">✖</button>
        <h4>{{ fileModalName }}</h4>
        <pre style="white-space: pre-wrap; word-break: break-word;"><span v-html="fileModalContent"></span></pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchSidebar',
  props: {
    visible: {
      type: Boolean,
      default: false
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
      searchText: '',
      searchResults: [],
      aiOverview: '',
      aiOverviewLoading: false,
      aiOverviewLoaded: false,
      fileModalVisible: false,
      fileModalContent: '',
      fileModalName: ''
    };
  },
  methods: {
    cleanResult(result) {
      // Remove Link Content, <id>, <main_keyword> tags
      let text = result;
      text = text.replace(/Link Content:/g, '');
      text = text.replace(/<id>.*?<\/id>/g, '');
      text = text.replace(/<main_keyword>.*?<\/main_keyword>/g, '');
      text = text.replace(/<upload_id>(.*?)<\/upload_id>/g, '');
      return text.trim();
    },
    extractUploadId(result) {
      const match = result.match(/<upload_id>(.*?)<\/upload_id>/);
      return match ? match[1] : null;
    },
    async openFile(uploadId, segmentText) {
      if (!uploadId || !this.token || !this.serverUrl) return;
      try {
        const { apiRequest } = await import('../api.js');
        const res = await apiRequest({
          url: `${this.serverUrl}/files/file_content?file_id=${uploadId}&filename=sc-machine.txt`,
          method: 'GET',
          token: this.token
        });
        if (res.status === 'success' && res.response) {
          let content = res.response.content;
          if (segmentText) {
            const escaped = segmentText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            content = content.replace(regex, '<mark style="background: #0078d4; color: #fff;">$&</mark>');
          }
          this.fileModalContent = content;
          this.fileModalName = res.response.filename;
          this.fileModalVisible = true;
        } else {
          this.fileModalContent = 'Unable to load file content.';
          this.fileModalName = '';
          this.fileModalVisible = true;
        }
      } catch (e) {
        this.fileModalContent = 'Error loading file.';
        this.fileModalName = '';
        this.fileModalVisible = true;
      }
    },
    async runSearch() {
      if (!this.searchText || !this.token || !this.serverUrl) return;
      this.searchResults = [];
      this.aiOverview = '';
      this.aiOverviewLoading = false;
      this.aiOverviewLoaded = false;
      try {
        const { apiRequest } = await import('../api.js');
        // Request unhumanized results first
        const res = await apiRequest({
          url: `${this.serverUrl}/query?humanize=false`,
          method: 'POST',
          token: this.token,
          data: { text: this.searchText }
        });
        if (res.status === 'success' && Array.isArray(res.response)) {
          this.searchResults = res.response;
        } else {
          this.searchResults = ['No results found.'];
        }
        this.aiOverviewLoading = true;
        // Now request humanized (AI overview)
        const res2 = await apiRequest({
          url: `${this.serverUrl}/query?humanize=true`,
          method: 'POST',
          token: this.token,
          data: { text: this.searchText }
        });
        if (res2.status === 'success' && res2.response) {
          this.aiOverview = typeof res2.response === 'string' ? res2.response : res2.response.ai_overview || '';
        } else {
          this.aiOverview = '';
        }
        this.aiOverviewLoading = false;
        this.aiOverviewLoaded = true;
      } catch (e) {
        this.searchResults = ['Error searching knowledge base.'];
        this.aiOverview = '';
        this.aiOverviewLoading = false;
        this.aiOverviewLoaded = true;
      }
    }
  }
}
  </script>

<style scoped>
  /* Animation for sidebar appearance */
  .sidebar-slide-enter-active, .sidebar-slide-leave-active {
    transition: all 0.3s cubic-bezier(.55,0,.1,1);
  }
  .sidebar-slide-enter-from, .sidebar-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
  .sidebar-slide-enter-to, .sidebar-slide-leave-from {
    transform: translateX(0);
    opacity: 1;
  }
  .search-sidebar {
    width: 320px;
    background: #f9f9f9;
    height: 95%;
    min-height: 0;
    border-left: 1px solid #ddd;
    padding: 16px;
    position: relative;
    overflow-y: auto;
  }
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .search-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 15px;
  }
  .search-btn {
    background: #0078d4;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
  }
  .search-results {
    color: #333;
    margin-top: 8px;
  }
  .search-result {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .ai-overview {
    background: #eaf6ff;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 8px;
    color: #0078d4;
    font-size: 15px;
    box-shadow: 0 1px 2px rgba(0,120,212,0.04);
  }
</style>

<style>
  .open-file-btn {
    background: #0078d4;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 15px;
    margin-top: 8px;
  }
  .file-modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.2);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .file-modal-content {
    background: #fff;
    padding: 32px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.15);
    min-width: 320px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }
  .close-file-modal {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 20px;
    color: #888;
    cursor: pointer;
  }
</style>
