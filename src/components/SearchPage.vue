<template>
  <div class="search-page">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-container">
        <div class="search-logo">
          <img src="/favicon.ico" alt="KBSage" class="logo-icon" />
          <span class="logo-text">KBSage</span>
        </div>
        
        <!-- Main Search Bar -->
        <div class="search-box-container">
          <div class="search-box" :class="{ 'focused': searchFocused, 'has-results': searchResults.length > 0 }">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchText" 
                type="text" 
                placeholder="Search your knowledge base..." 
                class="search-input"
                @focus="searchFocused = true"
                @blur="handleSearchBlur"
                @keyup.enter="runSearch"
                @input="handleSearchInput"
                ref="searchInput"
              />
              <button v-if="searchText" class="clear-search" @click="clearSearch">✖</button>
            </div>
            
            <!-- Search Suggestions -->
            <div v-if="searchSuggestions.length > 0 && searchFocused" class="search-suggestions">
              <div 
                v-for="(suggestion, idx) in searchSuggestions" 
                :key="idx" 
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                <span class="suggestion-icon">🔍</span>
                <span class="suggestion-text">{{ suggestion }}</span>
              </div>
            </div>
          </div>
          
          <div class="search-buttons">
            <button class="search-btn primary" @click="runSearch" :disabled="!searchText.trim()">
              KBSage Search
            </button>
            <!-- <button class="search-btn secondary" @click="feelingLucky" :disabled="!searchText.trim()">
              I'm Feeling Lucky
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="hasSearched" class="search-results-section">
      <div class="results-container">
        
        <!-- Search Stats -->
        <div class="search-stats">
          About {{ searchResults.length }} results ({{ searchTime }}s)
        </div>

        <!-- AI Overview -->
        <div v-if="aiOverview || aiOverviewLoading" class="ai-overview-card">
          <div class="ai-overview-header">
            <div class="ai-badge">
              <span class="ai-icon">✨</span>
              <span>AI Overview</span>
            </div>
            <button v-if="!aiOverviewExpanded && aiOverview" @click="aiOverviewExpanded = true" class="expand-btn">
              Show more
            </button>
          </div>
          
          <div class="ai-overview-content" :class="{ 'collapsed': !aiOverviewExpanded && !aiOverviewLoading }">
            <div v-if="aiOverviewLoading" class="ai-loading">
              <div class="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <span>AI is analyzing your knowledge base...</span>
            </div>
            <div v-else-if="aiOverview" class="ai-overview-text" v-html="markedOverview"></div>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div 
            v-for="(result, idx) in searchResults" 
            :key="idx" 
            class="search-result-item"
            @click.stop="openFile(result.filename, result.text)"
          >
            <div class="result-header">
              <div class="result-url">
                <span class="file-icon">{{ getFileIcon(result.filename) }}</span>
                <span class="filename">{{ result.filename }}</span>
              </div>
              <div class="result-actions">
                <button class="action-btn" @click.stop="openFile(result.filename, result.text)">
                  Open
                </button>
              </div>
            </div>
            <h3 class="result-title">{{ getResultTitle(result.text) }}</h3>
            <p class="result-snippet" v-html="highlightSearchTerm(getResultSnippet(result.text))"></p>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="hasSearched && !aiOverviewLoading" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No results found for "{{ searchText }}"</h3>
          <div class="no-results-suggestions">
            <p>Try:</p>
            <ul>
              <li>Different keywords</li>
              <li>More general terms</li>
              <li>Checking spelling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Searches (when no search has been performed) -->
    <div v-if="!hasSearched && recentSearches.length > 0" class="recent-searches">
      <div class="recent-container">
        <h3>Recent Searches</h3>
        <div class="recent-items">
          <div 
            v-for="(search, idx) in recentSearches" 
            :key="idx" 
            class="recent-item"
            @click="selectRecentSearch(search)"
          >
            <span class="recent-icon">🕒</span>
            <span>{{ search }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- File Modal -->
    <FileModalOpener 
      v-if="fileModalVisible" 
      :filename="fileModalName" 
      :content="fileModalContent" 
      :loading="fileModalContent === ''" 
      @close="closeFileModal"
    />
  </div>
</template>

<script>
import { marked } from 'marked';
import FileModalOpener from './FileModalOpener.vue';

export default {
  name: 'SearchPage',
  components: {
    FileModalOpener
  },
  props: {
    token: {
      type: String,
      default: ''
    },
    serverUrl: {
      type: String,
      default: ''
    },
    initialSearch: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchText: '',
      searchFocused: false,
      searchResults: [],
      searchSuggestions: [],
      hasSearched: false,
      searchTime: 0,
      aiOverview: '',
      aiOverviewLoading: false,
      aiOverviewExpanded: false,
      fileModalVisible: false,
      fileModalContent: '',
      fileModalName: '',
      recentSearches: [
        'API documentation',
        'deployment guide',
        'troubleshooting',
        'configuration settings'
      ]
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
  mounted() {
    // Focus search input on mount
    this.$nextTick(() => {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    });
    
    // Handle initial search if provided
    if (this.initialSearch && this.initialSearch.trim()) {
      this.searchText = this.initialSearch;
      this.runSearch();
      this.$emit('search-performed');
    }
  },
  watch: {
    initialSearch(newSearch) {
      if (newSearch && newSearch.trim()) {
        this.searchText = newSearch;
        this.runSearch();
        this.$emit('search-performed');
      }
    }
  },
  methods: {
    handleSearchInput() {
      // Generate search suggestions based on input
      if (this.searchText.length > 2) {
        this.generateSearchSuggestions();
      } else {
        this.searchSuggestions = [];
      }
    },
    
    generateSearchSuggestions() {
      // Mock suggestions - in a real app, this would come from an API
      const suggestions = [
        `${this.searchText} documentation`,
        `${this.searchText} guide`,
        `${this.searchText} tutorial`,
        `how to ${this.searchText}`,
        `${this.searchText} examples`
      ];
      this.searchSuggestions = suggestions.slice(0, 5);
    },
    
    handleSearchBlur() {
      // Delay to allow click on suggestions
      setTimeout(() => {
        this.searchFocused = false;
        this.searchSuggestions = [];
      }, 150);
    },
    
    selectSuggestion(suggestion) {
      this.searchText = suggestion;
      this.searchFocused = false;
      this.searchSuggestions = [];
      this.runSearch();
    },
    
    selectRecentSearch(search) {
      this.searchText = search;
      this.runSearch();
    },
    
    clearSearch() {
      this.searchText = '';
      this.hasSearched = false;
      this.searchResults = [];
      this.aiOverview = '';
      this.$refs.searchInput.focus();
    },
    
    async runSearch() {
      if (!this.searchText.trim() || !this.token || !this.serverUrl) return;
      
      const startTime = Date.now();
      this.hasSearched = true;
      this.searchResults = [];
      this.aiOverview = '';
      this.aiOverviewLoading = true;
      this.aiOverviewExpanded = false;
      
      // Add to recent searches
      if (!this.recentSearches.includes(this.searchText)) {
        this.recentSearches.unshift(this.searchText);
        this.recentSearches = this.recentSearches.slice(0, 8);
      }
      
      try {
        const { apiRequest } = await import('../api.js');
        
        // Get search results (unhumanized)
        const res = await apiRequest({
          url: `${this.serverUrl}/query`,
          method: 'POST',
          token: this.token,
          data: { question: this.searchText, humanize: false }
        });
        
        if (res.status === 'success' && res.response && Array.isArray(res.response.chunks)) {
          this.searchResults = res.response.chunks.map(chunk => {
            const match = chunk.match(/<filename>(.*?)<\/filename>/);
            const filename = match ? match[1] : null;
            const text = chunk.replace(/<filename>.*?<\/filename>/g, '').trim();
            return { text, filename };
          });
        }
        
        // Get AI overview (humanized)
        const res2 = await apiRequest({
          url: `${this.serverUrl}/query`,
          method: 'POST',
          token: this.token,
          data: { question: this.searchText, humanize: true }
        });
        
        if (res2.status === 'success' && res2.response && res2.response.answer) {
          this.aiOverview = res2.response.answer;
        }
        
        this.searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
      } catch (error) {
        console.error('Search error:', error);
        this.searchResults = [];
        this.aiOverview = '';
      } finally {
        this.aiOverviewLoading = false;
      }
    },
    
    async feelingLucky() {
      await this.runSearch();
      if (this.searchResults.length > 0) {
        const firstResult = this.searchResults[0];
        this.openFile(firstResult.filename, firstResult.text);
      }
    },
    
    getFileIcon(filename) {
      if (!filename) return '📄';
      const extension = filename.split('.').pop().toLowerCase();
      const iconMap = {
        'md': '📝',
        'txt': '📄',
        'pdf': '📕',
        'doc': '📘',
        'docx': '📘',
        'json': '📋',
        'js': '📜',
        'ts': '📜',
        'html': '🌐',
        'css': '🎨',
        'py': '🐍',
        'java': '☕',
        'cpp': '⚙️',
        'c': '⚙️'
      };
      return iconMap[extension] || '📄';
    },
    
    getResultTitle(text) {
      // Extract first line or first sentence as title
      const lines = text.split('\n');
      const firstLine = lines[0].trim();
      if (firstLine.length > 60) {
        return firstLine.substring(0, 60) + '...';
      }
      return firstLine || 'Document content';
    },
    
    getResultSnippet(text) {
      // Get a snippet around the search term
      const snippet = text.substring(0, 200);
      return snippet.length < text.length ? snippet + '...' : snippet;
    },
    
    highlightSearchTerm(text) {
      if (!this.searchText) return text;
      const searchTerms = this.searchText.split(' ').filter(term => term.length > 2);
      let highlightedText = text;
      
      searchTerms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
      });
      
      return highlightedText;
    },
    
    async openFile(filename, segmentText) {
      if (!filename || !this.token || !this.serverUrl) {
        console.error('Missing required parameters:', { filename, hasToken: !!this.token, hasServerUrl: !!this.serverUrl });
        return;
      }
      
      // Show modal with loading state
      this.fileModalVisible = true;
      this.fileModalName = filename.startsWith('file:') ? filename.substring(5) : filename;
      this.fileModalContent = '';
      
      try {
        // Get clean filename (remove prefix if exists)
        let cleanFilename = this.fileModalName;
        if (cleanFilename.startsWith('temp_')) {
          cleanFilename = cleanFilename.substring(5);
        }
        
        const encodedFilename = encodeURIComponent(cleanFilename);
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        
        console.log('Fetching file:', { url, cleanFilename });
        
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        if (res.ok) {
          let content = await res.text();
          if (segmentText) {
            const escaped = segmentText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            content = content.replace(regex, '<mark style="background: #0078d4; color: #fff;">$&</mark>');
          }
          this.fileModalContent = content;
        } else if (res.status === 404) {
          this.fileModalContent = 'File not found.';
        } else if (res.status === 403) {
          this.fileModalContent = 'Access denied.';
        } else {
          this.fileModalContent = `Unable to load file content. Status: ${res.status}`;
        }
      } catch (error) {
        console.error('Error loading file:', error);
        this.fileModalContent = `Error loading file: ${error.message || 'Unknown error occurred'}`;
      }
    },
    
    closeFileModal() {
      this.fileModalVisible = false;
      this.fileModalContent = '';
      this.fileModalName = '';
    }
  }
};
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* Search Header */
.search-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
}

.logo-icon {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: 32px;
  font-weight: 600;
  color: #4285f4;
  letter-spacing: -1px;
}

/* Search Box */
.search-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 584px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 24px;
  padding: 0 16px;
  height: 44px;
  transition: all 0.3s ease;
  position: relative;
}

.search-box.focused .search-input-wrapper {
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
  border-color: #4285f4;
}

.search-icon {
  color: #9aa0a6;
  margin-right: 12px;
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #202124;
}

.search-input::placeholder {
  color: #9aa0a6;
}

.clear-search {
  background: none;
  border: none;
  color: #9aa0a6;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.clear-search:hover {
  background-color: #f1f3f4;
}

/* Search Suggestions */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe1e5;
  border-top: none;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-icon {
  color: #9aa0a6;
  margin-right: 12px;
  font-size: 14px;
}

.suggestion-text {
  color: #202124;
  font-size: 16px;
}

/* Search Buttons */
.search-buttons {
  display: flex;
  gap: 16px;
}

.search-btn {
  background: #f8f9fa;
  border: 1px solid #f8f9fa;
  border-radius: 4px;
  color: #3c4043;
  font-size: 14px;
  height: 36px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.search-btn:hover:not(:disabled) {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  background: #f1f3f4;
  border: 1px solid #dadce0;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn.primary {
  background: #4285f4;
  border-color: #4285f4;
  color: white;
}

.search-btn.primary:hover:not(:disabled) {
  background: #3367d6;
  border-color: #3367d6;
}

/* Search Results Section */
.search-results-section {
  flex: 1;
  background: #f8f9fa;
  padding: 20px 0;
}

.results-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-stats {
  color: #70757a;
  font-size: 14px;
  margin-bottom: 20px;
}

/* AI Overview */
.ai-overview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4285f4;
}

.ai-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4285f4;
  font-weight: 600;
  font-size: 16px;
}

.ai-icon {
  font-size: 18px;
}

.expand-btn {
  background: none;
  border: none;
  color: #4285f4;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.ai-overview-content {
  line-height: 1.6;
  color: #202124;
}

.ai-overview-content.collapsed {
  max-height: 100px;
  overflow: hidden;
  position: relative;
}

.ai-overview-content.collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, white);
}

.ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4285f4;
  font-style: italic;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots div {
  width: 8px;
  height: 8px;
  background: #4285f4;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dots div:nth-child(1) { animation-delay: -0.32s; }
.loading-dots div:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Search Results */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-result-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-url {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5f6368;
  font-size: 14px;
}

.file-icon {
  font-size: 16px;
}

.filename {
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #4285f4;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  padding: 6px 12px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background: #3367d6;
}

.result-title {
  color: #1a0dab;
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.result-snippet {
  color: #4d5156;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.result-snippet :deep(mark) {
  background: #ff6b35;
  color: white;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}

.no-results-icon {
  font-size: 64px;
  opacity: 0.5;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 20px;
  color: #202124;
}

.no-results-suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.no-results-suggestions p {
  font-weight: 600;
  margin-bottom: 8px;
}

.no-results-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

/* Recent Searches */
.recent-searches {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.recent-container {
  text-align: center;
  max-width: 600px;
}

.recent-container h3 {
  color: white;
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 30px;
  opacity: 0.9;
}

.recent-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.recent-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.recent-icon {
  font-size: 14px;
  opacity: 0.8;
}

/* File Modal */
.file-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.file-modal {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.file-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.file-modal-header h3 {
  margin: 0;
  color: #202124;
  font-size: 18px;
  font-weight: 600;
}

.close-modal-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #5f6368;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-modal-btn:hover {
  background: #e8eaed;
}

.file-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  line-height: 1.6;
  color: #202124;
}

.file-modal-content :deep(mark) {
  background: #ff6b35;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-container {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .search-buttons {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .search-btn {
    width: 100%;
  }
  
  .results-container {
    padding: 0 16px;
  }
  
  .search-result-item {
    padding: 16px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .file-modal {
    width: 95vw;
    max-height: 95vh;
  }
}
</style>
