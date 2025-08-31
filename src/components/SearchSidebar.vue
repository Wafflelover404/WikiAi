<template>
  <div class="search-sidebar" v-if="visible">
    <h3>Search</h3>
    <div class="search-bar">
      <input v-model="searchText" type="text" placeholder="Search knowledge base..." class="search-input" @keyup.enter="runSearch" />
      <button class="search-btn" @click="runSearch">🔍</button>
    </div>
    <div class="ai-overview" v-if="aiOverviewLoading || aiOverview">
      <strong>AI Overview:</strong>
      <div class="loading-ai-overview" v-if="aiOverviewLoading">Loading AI overview...</div>
      <div v-else v-html="markedOverview"></div>
    </div>
    <div class="search-results">
      <div v-if="searchResults.length">
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
import { marked } from 'marked';

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
  computed: {
    markedOverview() {
      if (!this.aiOverview) return '';
      marked.setOptions({
        gfm: true,
        breaks: true,
        sanitize: false,
        smartLists: true,
        smartypants: true
      });
      return marked(this.aiOverview);
    }
  },
  methods: {
    cleanResult(result) {
      // For new format, just return the text field
      return result && result.text ? result.text : '';
    },
    extractUploadId(result) {
      // For new format, return filename
      return result && result.filename ? result.filename : null;
    },
    async openFile(filename, segmentText) {
      if (!filename || !this.token || !this.serverUrl) return;
      try {
        const encodedFilename = encodeURIComponent(filename);
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        if (res.ok) {
          let content = await res.text();
          if (segmentText) {
            const escaped = segmentText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            content = content.replace(regex, '<mark style="background: #0078d4; color: #fff;">$&</mark>');
          }
          this.fileModalContent = content;
          this.fileModalName = filename;
          this.fileModalVisible = true;
        } else if (res.status === 404) {
          this.fileModalContent = 'File not found.';
          this.fileModalName = filename;
          this.fileModalVisible = true;
        } else if (res.status === 403) {
          this.fileModalContent = 'Access denied.';
          this.fileModalName = filename;
          this.fileModalVisible = true;
        } else {
          this.fileModalContent = 'Unable to load file content.';
          this.fileModalName = filename;
          this.fileModalVisible = true;
        }
      } catch (e) {
        this.fileModalContent = 'Error loading file.';
        this.fileModalName = filename;
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
        // Request pure RAG chunks (unhumanized)
        const res = await apiRequest({
          url: `${this.serverUrl}/query`,
          method: 'POST',
          token: this.token,
          data: { question: this.searchText, humanize: false }
        });
        if (res.status === 'success' && res.response && Array.isArray(res.response.chunks)) {
          // Parse each chunk to extract text and filename
          this.searchResults = res.response.chunks.map(chunk => {
            const match = chunk.match(/<filename>(.*?)<\/filename>/);
            const filename = match ? match[1] : null;
            const text = chunk.replace(/<filename>.*?<\/filename>/g, '').trim();
            return { text, filename };
          });
        } else {
          this.searchResults = [];
        }
        this.aiOverviewLoading = true;
        // Now request humanized (AI overview)
        const res2 = await apiRequest({
          url: `${this.serverUrl}/query`,
          method: 'POST',
          token: this.token,
          data: { question: this.searchText, humanize: true }
        });
        if (res2.status === 'success' && res2.response && res2.response.answer) {
          this.aiOverview = res2.response.answer;
        } else {
          this.aiOverview = '';
        }
        this.aiOverviewLoading = false;
        this.aiOverviewLoaded = true;
      } catch (e) {
        this.searchResults = [];
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

  .loading-ai-overview {
    color: #0078d4;
    font-style: italic bold;
    opacity: 1;
    animation: blinker 3s linear infinite;
  }

  @keyframes blinker {
  50% {
    opacity: 0.5;
  }
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
