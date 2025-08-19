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
      <div v-if="!aiOverviewLoading && searchResults.length">
        <div v-for="(result, idx) in searchResults" :key="idx" class="search-result">
          {{ result }}
        </div>
      </div>
      <p v-if="!aiOverviewLoading && !searchResults.length">No results yet.</p>
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
      aiOverviewLoading: false
    };
  },
  methods: {
    async runSearch() {
      if (!this.searchText || !this.token || !this.serverUrl) return;
      this.searchResults = [];
      this.aiOverview = '';
      this.aiOverviewLoading = false;
      try {
        const { apiRequest } = await import('../api.js');
        // First request: get results only
        this.aiOverviewLoading = true;
        const res = await apiRequest({
          url: `${this.serverUrl}/query?humanize=false`,
          method: 'POST',
          token: this.token,
          data: { text: this.searchText }
        });
        // Do not show results yet, only blue field
        // Second request: get AI overview
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
        // Now show results
        if (res.status === 'success' && Array.isArray(res.response)) {
          this.searchResults = res.response;
        } else {
          this.searchResults = ['No results found.'];
        }
      } catch (e) {
        this.searchResults = ['Error searching knowledge base.'];
        this.aiOverview = '';
        this.aiOverviewLoading = false;
      }
    }
  }
}
</script>

<style scoped>
  .search-sidebar {
    width: 320px;
    background: #f9f9f9;
    height: 100vh;
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
