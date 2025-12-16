<template>
  <div class="search-page">
    <!-- Search Header -->
    <div class="search-header">
      <div class="search-container">
        <div class="search-logo">
          <img src="/favicon.ico" alt="WikiAi" class="logo-icon" />
          <span class="logo-text">WikiAi</span>
        </div>
        
        <!-- Main Search Bar -->
        <div class="search-box-container">
          <div class="search-box" :class="{ 'focused': searchFocused, 'has-results': searchResults.length > 0 }">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input 
                v-model="searchText" 
                type="text" 
                :placeholder="t.search.searchPlaceholder" 
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
            <button class="settings-btn" @click="settingsModalVisible = true" title="Search settings">
              ⚙️
            </button>
            <button class="search-btn primary" @click="runSearch" :disabled="!searchText.trim()">
              {{ t.search.search }}
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
          <template v-if="searchResults.length > 0">
            <div class="flex items-center">
              <span>About {{ searchResults.length }} results ({{ searchTime }}s)</span>
              <span v-if="searchResults[0]?.sourceType === 'opencart'" class="ml-2 text-sm text-gray-500">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <!-- <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"></path>
                  </svg> -->
                  Semantic Search
                </span>
              </span>
            </div>
          </template>
          <template v-else-if="hasSearched">
            No results found for "{{ searchText }}"
            <button v-if="searchResults.length === 0" @click="toggleSearchType" class="ml-2 text-sm text-blue-600 hover:underline">
              Try {{ searchType === 'opencart' ? 'document' : 'product' }} search instead
            </button>
          </template>
        </div>

        <!-- AI Overview -->
        <div v-if="aiOverview || aiOverviewLoading || aiOverviewError" class="ai-overview-card">
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
            <div v-else-if="aiOverviewError" class="ai-overview-error">{{ aiOverviewError }}</div>
            <div v-else-if="aiOverview" class="ai-overview-text" v-html="markedOverview"></div>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div class="debug-info" v-if="false">
            <pre>{{ JSON.stringify(searchResults, null, 2) }}</pre>
          </div>
          
          <div v-for="(result, index) in searchResults" :key="result.id || 'result-' + index" class="result-item">
            <div class="result-header">
              <div class="flex items-start justify-between">
                <h3 class="flex-1">
                  <template v-if="result.url || (result.sourceType === 'opencart' && result.url)">
                    <a :href="result.url" target="_blank" rel="noopener" class="text-blue-600 hover:underline">
                      {{ result.name || result.displayTitle || result.filename || 'Untitled' }}
                    </a>
                  </template>
                  <template v-else>
                    {{ result.name || result.displayTitle || result.filename || 'Untitled' }}
                  </template>
                </h3>
                
                <div class="flex items-center space-x-2">
                  <!-- Relevance score -->
                  <span v-if="result.score !== undefined" 
                        class="text-xs px-2 py-1 rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': result.score > 0.7,
                          'bg-yellow-100 text-yellow-800': result.score > 0.4 && result.score <= 0.7,
                          'bg-gray-100 text-gray-800': result.score <= 0.4
                        }"
                        :title="`Relevance: ${(result.score * 100).toFixed(0)}%`">
                    {{ (result.score * 100).toFixed(0) }}%
                  </span>
                  
                  <span class="result-source" v-if="result.sourceType">
                    {{ result.sourceType === 'opencart' ? 'Product' : result.sourceType }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="result-content">
              <!-- Show image for OpenCart products -->
              <div v-if="result.sourceType === 'opencart' && (result.opencart?.image || result.image)" class="product-image-container">
                <img 
                  :src="result.opencart?.image || result.image" 
                  :alt="result.displayTitle || 'Product'" 
                  class="product-image" 
                  @error="(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#f5f5f5'; }"
                />
                <div v-if="!result.opencart?.image && !result.image" class="no-image">
                  <span>No Image</span>
                </div>
              </div>
              
              <!-- Show price for OpenCart products -->
              <div v-if="result.sourceType === 'opencart' && (result.opencart?.price || result.price)" class="product-price">
                <template v-if="result.opencart?.special_price || result.special_price">
                  <span class="sale-price">
                    {{ formatPrice(result.opencart?.special_price || result.special_price) }}
                  </span>
                  <span class="original-price">
                    {{ formatPrice(result.opencart?.price || result.price) }}
                  </span>
                </template>
                <template v-else>
                  <span class="price">
                    {{ formatPrice(result.opencart?.price || result.price) }}
                  </span>
                </template>
                
                <span v-if="(result.opencart?.quantity || 0) > 0" class="in-stock">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
                    <path d="M13.5 4L6.5 11L3 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  In Stock
                </span>
                <span v-else-if="result.opencart?.quantity === 0" class="out-of-stock">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Out of Stock
                </span>
              </div>
              
              <!-- Description -->
              <div class="result-description">
                <p v-if="result.displaySnippet" v-html="highlightSearchTerm(result.displaySnippet)"></p>
                <p v-else-if="result.text" v-html="highlightSearchTerm(result.text)"></p>
                <p v-else-if="result.opencart?.description" v-html="highlightSearchTerm(result.opencart.description)"></p>
              </div>
              
              <!-- Shop info for OpenCart products -->
              <div v-if="result.sourceType === 'opencart' && (result.opencart?.shop_name || result.opencart?.store_name)" class="shop-info">
                <span>Shop: </span>
                <a v-if="result.opencart?.shop_url || result.opencart?.store_url" 
                   :href="result.opencart?.shop_url || result.opencart?.store_url" 
                   target="_blank" 
                   rel="noopener">
                  {{ result.opencart?.shop_name || result.opencart?.store_name }}
                </a>
                <span v-else>{{ result.opencart?.shop_name || result.opencart?.store_name }}</span>
              </div>
            </div>
            
            <div class="result-actions">
              <a v-if="(result.sourceType === 'opencart' && result.url) || result.opencart?.url" 
                 :href="result.url || result.opencart?.url" 
                 target="_blank"
                 class="action-btn" 
                 @click.stop>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                  <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 3H21V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 14L21 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ result.sourceType === 'opencart' ? 'View Product' : 'View Details' }}
              </a>
              <button v-else class="action-btn" @click.stop="openFile(result, result.text)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 9H9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Open
              </button>
            </div>
          </div>
          <!-- End of search result item -->
        </div>

        <!-- No Results -->
        <div v-if="hasSearched && searchResults.length === 0 && !aiOverviewLoading" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No results found for "{{ searchText }}"</h3>
          <div v-if="searchType === 'opencart' || searchType === 'all'" class="debug-hint">
            <p>Debug info: Check browser console for API response details</p>
          </div>
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

    <!-- Settings Modal -->
    <div v-if="settingsModalVisible" class="settings-modal-overlay" @click="settingsModalVisible = false">
      <div class="settings-modal" @click.stop>
        <div class="settings-modal-header">
          <h2>Search Settings</h2>
          <button class="close-btn" @click="settingsModalVisible = false">✕</button>
        </div>
        
        <div class="settings-modal-content">
          <div class="settings-section">
            <h3>Search Scope</h3>
            
            <div v-if="loadingPlugins" class="plugin-loading">
              <span>Loading available search options...</span>
            </div>
            
            <div v-else>
              <div class="settings-option">
                <label>
                  <input 
                    type="radio" 
                    v-model="searchType" 
                    value="all"
                    :disabled="!enabledPlugins.documents || !enabledPlugins.opencart"
                    @change="saveSettings"
                  />
                  <span>🌐 All (Documents & Products)</span>
                </label>
                <p class="option-description">Search both knowledge base documents and OpenCart products</p>
              </div>
              
              <div class="settings-option">
                <label>
                  <input 
                    type="radio" 
                    v-model="searchType" 
                    value="documents"
                    :disabled="!enabledPlugins.documents"
                    @change="saveSettings"
                  />
                  <span>📄 Documents Only</span>
                </label>
                <p class="option-description">Search only knowledge base documents</p>
                <p v-if="!enabledPlugins.documents" class="plugin-disabled-notice">
                  ⚠️ Documents plugin is not enabled
                </p>
              </div>
              
              <div class="settings-option">
                <label>
                  <input 
                    type="radio" 
                    v-model="searchType" 
                    value="opencart"
                    :disabled="!enabledPlugins.opencart"
                    @change="saveSettings"
                  />
                  <span>🛍️ Products Only</span>
                </label>
                <p class="option-description">Search only OpenCart products</p>
                <p v-if="!enabledPlugins.opencart" class="plugin-disabled-notice">
                  ⚠️ OpenCart plugin is not enabled
                </p>
              </div>
              
              <!-- Catalog Selection (when OpenCart is enabled and selected) -->
              <div v-if="enabledPlugins.opencart && (searchType === 'opencart' || searchType === 'all')" class="settings-option">
                <h4>Select Catalogs to Search</h4>
                <div v-if="loadingCatalogs" class="catalog-loading">
                  <span>Loading catalogs...</span>
                </div>
                <div v-else-if="catalogs.length === 0" class="no-catalogs-notice">
                  <p>No catalogs available. Create one in the OpenCart plugin.</p>
                </div>
                <div v-else class="catalogs-checklist">
                  <div v-for="catalog in catalogs" :key="catalog.catalog_id" class="catalog-checkbox">
                    <label>
                      <input 
                        type="checkbox" 
                        :value="catalog.catalog_id"
                        v-model="selectedCatalogs"
                        @change="saveSettings"
                      />
                      <span>{{ catalog.shop_name }}</span>
                      <span class="catalog-count">({{ catalog.total_products }} products)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>Display Options</h3>
            <div class="settings-option">
              <label>
                <input 
                  type="checkbox" 
                  v-model="showAiOverview"
                  @change="saveSettings"
                />
                <span>✨ Show AI Overview</span>
              </label>
              <p class="option-description">Display AI-generated summary of search results</p>
            </div>
          </div>
        </div>
        
        <div class="settings-modal-footer">
          <button class="btn-secondary" @click="settingsModalVisible = false">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { translations } from '../i18n.js';
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
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      searchText: '',
      searchType: 'all', // 'all', 'documents', 'opencart'
      searchFocused: false,
      searchResults: [],
      searchSuggestions: [],
      hasSearched: false,
      searchTime: 0,
      aiOverview: '',
      aiOverviewLoading: false,
      aiOverviewError: '',
      aiOverviewExpanded: false,
      fileModalVisible: false,
      fileModalContent: '',
      fileModalName: '',
      settingsModalVisible: false,
      showAiOverview: true,
      enabledPlugins: {
        documents: true,
        opencart: false,
      },
      loadingPlugins: false,
      pluginError: '',
      catalogs: [], // This will store the list of available catalogs
      loadingCatalogs: false,
      selectedCatalogs: [], // All catalogs selected by default
      recentSearches: [
        'API documentation',
        'deployment guide',
        'troubleshooting',
        'configuration settings'
      ]
    };
  },
  computed: {
    t() { return (translations[this.language] || translations.en); },
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
    // Load user settings
    this.loadSettings();
    
    // Load plugin status
    this.loadPluginStatus();
    
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
    formatPrice(price) {
      // Format price with 2 decimal places and currency symbol
      if (typeof price === 'number' || !isNaN(parseFloat(price))) {
        return `$${parseFloat(price).toFixed(2)}`;
      }
      return price || '$0.00';
    },
    
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
      this.aiOverviewError = '';
      this.aiOverviewLoading = true;
      this.aiOverviewExpanded = false;
      
      // Add to recent searches
      if (!this.recentSearches.includes(this.searchText)) {
        this.recentSearches.unshift(this.searchText);
        this.recentSearches = this.recentSearches.slice(0, 8);
      }
      
      // Save recent searches to localStorage
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
      
      try {
        const { queryKnowledgeBase, apiRequest } = await import('../api.js');
        
        // Determine which endpoint(s) to use based on search type
        const searchDocuments = this.searchType === 'all' || this.searchType === 'documents';
        const searchOpencart = this.searchType === 'all' || this.searchType === 'opencart';
        
        // Use semantic search by default for OpenCart
        const useSemanticSearch = true;
        const minRelevance = 0.2; // Minimum relevance score (0-1)
        
        // Use WebSocket for real-time streaming (only for /query endpoint)
        let immediateReceived = false;
        let overviewReceived = false;
        let allResults = [];
        let opencartResults = [];
        
        // Handler for WebSocket messages
        const handleMessage = (message) => {
          console.log('WebSocket message:', message);
          
          switch (message.type) {
            case 'status':
              // Could show status updates in UI if desired
              console.log('Status:', message.message);
              break;
              
            case 'immediate':
              // Process immediate search results
              immediateReceived = true;
              if (message.data && message.data.snippets) {
                const snippets = message.data.snippets.map(snippet => {
                  const text = snippet.content || '';
                  const filename = snippet.source || 'unknown';
                  const sourceType = snippet.source_type || 'document';
                  
                  // Parse content for display
                  let displayTitle = '';
                  let displaySnippet = '';
                  
                  try {
                    let candidate = text;
                    if (candidate.includes("'title'")) {
                      candidate = candidate.replace(/'/g, '"');
                    }
                    const objStart = candidate.indexOf('{');
                    const objEnd = candidate.lastIndexOf('}');
                    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                      const jsonStr = candidate.slice(objStart, objEnd + 1);
                      const parsed = JSON.parse(jsonStr);
                      if (parsed && typeof parsed === 'object') {
                        if (typeof parsed.title === 'string') displayTitle = parsed.title;
                        if (typeof parsed.content === 'string') displaySnippet = parsed.content;
                      }
                    }
                  } catch (_) { /* ignore */ }
                  
                  if (!displaySnippet) {
                    const single = text.match(/['"]content['"]\s*:\s*['"]([\s\S]*?)['"]/);
                    if (single && single[1]) {
                      displaySnippet = single[1];
                    }
                  }
                  
                  if (!displaySnippet) {
                    const firstClean = (text.split('\n').map(l => l.trim()).filter(l => l && !/^<.*?>$/.test(l) && !/relevance\s*:/i.test(l)))[0] || '';
                    displaySnippet = firstClean;
                  }
                  
                  if (displaySnippet && displaySnippet.length > 280) {
                    displaySnippet = displaySnippet.slice(0, 280) + '...';
                  }
                  
                  return { text, filename, displayTitle, displaySnippet, sourceType, opencart: snippet.opencart };
                });
                allResults = [...allResults, ...snippets];
                this.searchResults = allResults;
              }
              break;
              
            case 'overview':
              // Process AI overview
              overviewReceived = true;
              this.aiOverview = message.data || '';
              this.aiOverviewLoading = false;
              break;
              
            case 'chunks':
              // Process raw chunks (for non-humanized queries)
              if (message.data && message.data.chunks) {
                this.searchResults = message.data.chunks.map(rawChunk => {
                  const fnameMatch = rawChunk.match(/<filename>(.*?)<\/filename>/);
                  const filename = fnameMatch ? fnameMatch[1] : null;
                  const possMatch = rawChunk.match(/<possible_files>([\s\S]*?)<\/possible_files>/);
                  let possibleFiles = [];
                  if (possMatch && possMatch[1]) {
                    try { possibleFiles = JSON.parse(possMatch[1]); } catch (_) { possibleFiles = []; }
                  }
                  const text = rawChunk
                    .replace(/<filename>[\s\S]*?<\/filename>/g, '')
                    .replace(/<possible_files>[\s\S]*?<\/possible_files>/g, '')
                    .trim();
                  
                  let displayTitle = '';
                  let displaySnippet = '';
                  
                  try {
                    let candidate = text;
                    if (candidate.includes("'title'")) {
                      candidate = candidate.replace(/'/g, '"');
                    }
                    const objStart = candidate.indexOf('{');
                    const objEnd = candidate.lastIndexOf('}');
                    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                      const jsonStr = candidate.slice(objStart, objEnd + 1);
                      const parsed = JSON.parse(jsonStr);
                      if (parsed && typeof parsed === 'object') {
                        if (typeof parsed.title === 'string') displayTitle = parsed.title;
                        if (typeof parsed.content === 'string') displaySnippet = parsed.content;
                      }
                    }
                  } catch (_) { /* ignore */ }
                  
                  if (!displaySnippet) {
                    const single = text.match(/['"]content['"]\s*:\s*['"]([\s\S]*?)['"]/);
                    if (single && single[1]) {
                      displaySnippet = single[1];
                    }
                  }
                  
                  if (!displaySnippet) {
                    const firstClean = (text.split('\n').map(l => l.trim()).filter(l => l && !/^<.*?>$/.test(l) && !/relevance\s*:/i.test(l)))[0] || '';
                    displaySnippet = firstClean;
                  }
                  
                  if (displaySnippet && displaySnippet.length > 280) {
                    displaySnippet = displaySnippet.slice(0, 280) + '...';
                  }
                  
                  return { text, filename, possibleFiles, displayTitle, displaySnippet };
                });
              }
              break;
              
            case 'error':
              this.aiOverviewError = message.message || 'Error processing query';
              this.aiOverviewLoading = false;
              break;
              
            case 'complete':
              // Query completed
              if (!overviewReceived) {
                this.aiOverviewLoading = false;
              }
              this.searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
              break;
          }
        };
        
        // Execute query with WebSocket (sends both humanized and non-humanized)
        try {
          // If searching documents, use WebSocket for real-time streaming
          if (searchDocuments) {
            await queryKnowledgeBase({
              serverUrl: this.serverUrl,
              token: this.token,
              question: this.searchText,
              humanize: true,
              onMessage: handleMessage,
              useWebSocket: true
            });
          }
          
          // If searching OpenCart, query that endpoint separately
          if (searchOpencart) {
            try {
              // First, get the list of available catalogs if we don't have them yet
              if (this.catalogs.length === 0) {
                const catalogsResponse = await apiRequest({
                  url: `${this.serverUrl}/catalogs`,
                  method: 'GET',
                  token: this.token
                });
                
                if (catalogsResponse.status === 'success' && Array.isArray(catalogsResponse.response)) {
                  this.catalogs = catalogsResponse.response;
                }
              }
              
              // If we have selected catalogs, search in those, otherwise search in all
              const catalogsToSearch = this.selectedCatalogs.length > 0 
                ? this.selectedCatalogs 
                : this.catalogs.map(c => c.catalog_id);
              
              // For each catalog, make a GET request to the search endpoint
              for (const catalogId of catalogsToSearch) {
                try {
                  // Ensure proper encoding for Cyrillic and special characters
                  const searchTerm = this.searchText.trim();
                  const encodedQuery = encodeURIComponent(searchTerm);
                  console.log('Search term:', searchTerm);
                  console.log('Encoded query:', encodedQuery);
                  
                  // Get organization ID and session ID from token or user data
                  const organizationId = this.$store?.state?.user?.organizationId || '';
                  const sessionId = this.$store?.state?.user?.sessionId || '';
                  
                  // Log search parameters for debugging
                  console.log('Search parameters:', {
                    catalogId,
                    searchTerm,
                    encodedQuery,
                    organizationId: organizationId || 'not provided',
                    sessionId: sessionId || 'not provided'
                  });
                  
                  console.log(`Searching catalog ${catalogId} for: ${this.searchText}`);
                  const searchUrl = `${this.serverUrl}/catalogs/${catalogId}/search?query=${encodedQuery}&limit=20`;
                  console.log('Making request to:', searchUrl);
                  console.log('Headers:', {
                    'X-Organization-ID': organizationId,
                    'X-Session-ID': sessionId,
                    'Authorization': `Bearer ${this.token.substring(0, 10)}...`
                  });
                  
                  // Make the API request and process the response immediately
                  const startTime = Date.now();
                  let response;
                  let responseStatus;
                  let responseHeaders;
                  
                  try {
                    // Create a new request to get access to full response details
                    const fullResponse = await fetch(searchUrl, {
                      method: 'GET',
                      headers: {
                        'X-Organization-ID': organizationId,
                        'X-Session-ID': sessionId,
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    // Store status and headers for debugging
                    responseStatus = fullResponse.status;
                    responseHeaders = Object.fromEntries(fullResponse.headers.entries());
                    
                    // Get response text first to handle both JSON and text responses
                    const responseText = await fullResponse.text();
                    
                    // Log response details
                    console.log(`Request completed in ${Date.now() - startTime}ms`);
                    console.log('Response status:', responseStatus);
                    console.log('Response headers:', responseHeaders);
                    console.log('Response type:', fullResponse.type);
                    console.log('Response text (first 1000 chars):', responseText.substring(0, 1000));
                    
                    // Try to parse as JSON, fall back to text if it fails
                    try {
                      response = responseText ? JSON.parse(responseText) : null;
                    } catch (e) {
                      console.warn('Response is not valid JSON, using as text');
                      response = responseText;
                    }
                  } catch (error) {
                    console.error('API request failed:', error);
                    const errorDetails = {
                      name: error.name,
                      message: error.message,
                      stack: error.stack,
                      status: error.status || responseStatus,
                      response: error.response || response,
                      responseHeaders: responseHeaders
                    };
                    
                    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
                    
                    // Set user-friendly error message
                    if (error.message.includes('Failed to fetch')) {
                      this.aiOverviewError = 'Failed to connect to the server. Please check your network connection.';
                    } else if (responseStatus === 401) {
                      this.aiOverviewError = 'Authentication failed. Please log in again.';
                    } else if (responseStatus === 403) {
                      this.aiOverviewError = 'You do not have permission to access this catalog.';
                    } else if (responseStatus === 404) {
                      this.aiOverviewError = 'The requested catalog was not found.';
                    } else if (responseStatus >= 500) {
                      this.aiOverviewError = 'Server error. Please try again later.';
                    } else {
                      this.aiOverviewError = `Search failed: ${error.message || 'Unknown error'}`;
                    }
                    
                    console.groupEnd();
                    continue; // Skip to next catalog
                  }
                  
                  // Process the response
                  console.group('OpenCart Search Debug');
                  
                  // Parse response if it's a string
                  let parsedResponse = response;
                  if (typeof response === 'string') {
                    try {
                      console.log('Raw response (first 500 chars):', response.substring(0, 500));
                      parsedResponse = JSON.parse(response);
                      console.log('Successfully parsed JSON response');
                    } catch (e) {
                      console.error('Failed to parse response as JSON. Response type:', typeof response);
                      console.error('Response content (first 500 chars):', response.substring(0, 500));
                      console.error('Parse error:', e);
                      this.aiOverviewError = `Error parsing server response: ${e.message}`;
                      console.groupEnd();
                      return;
                    }
                  } else {
                    console.log('Response is already an object, no need to parse');
                  }
                  
                  // Debug: Log the full response structure
                  console.log('=== DEBUG: Full API Response ===');
                  console.log('Response type:', typeof parsedResponse);
                  console.log('Response keys:', Object.keys(parsedResponse));
                  if (parsedResponse.data) {
                    console.log('Data keys:', Object.keys(parsedResponse.data));
                    console.log('Results type:', Array.isArray(parsedResponse.data.results) ? 'Array' : typeof parsedResponse.data.results);
                    console.log('Results length:', Array.isArray(parsedResponse.data.results) ? parsedResponse.data.results.length : 'N/A');
                  }
                  
                  console.log('Response type:', typeof parsedResponse);
                  console.log('Response keys:', parsedResponse ? Object.keys(parsedResponse) : 'null');
                  console.log('Full response:', parsedResponse);
                  
                  // Log nested structure if response is an object
                  if (parsedResponse && typeof parsedResponse === 'object') {
                    console.log('Response has status property:', 'status' in parsedResponse);
                    if ('response' in parsedResponse) {
                      console.log('Response.response type:', typeof parsedResponse.response);
                      if (parsedResponse.response && typeof parsedResponse.response === 'object') {
                        console.log('Response.response keys:', Object.keys(parsedResponse.response));
                      }
                    }
                  }
                  
                  // Extract products from the response
                  let products = [];
                  let errorMessage = '';
                  
                  // Use the parsed response
                  const searchResponse = parsedResponse;
                  console.log('Processing OpenCart search response:', JSON.stringify(searchResponse, null, 2));
                  
                  // Check if we have a valid response
                  if (!searchResponse) {
                    errorMessage = 'No response received from the server';
                    console.error('Empty response from server');
                  } 
                  // Check for error status
                  else if (searchResponse.status === 'error' || searchResponse.error) {
                    errorMessage = searchResponse.message || searchResponse.error || 'Unknown error from server';
                    console.error('Error from OpenCart API:', errorMessage);
                  }
                  // Handle successful response with products
                  else if (searchResponse.status === 'success' && searchResponse.response?.results) {
                    console.log('Found products in response.response.results');
                    
                    // Map the products to the expected format
                    products = searchResponse.response.results.map(item => {
                      const metadata = item.metadata || {};
                      return {
                        id: metadata.product_id || `product-${Math.random().toString(36).substr(2, 9)}`,
                        name: metadata.name || 'Product',
                        description: item.content || metadata.description || '',
                        price: metadata.price ? parseFloat(metadata.price) : 0,
                        special_price: metadata.special_price ? parseFloat(metadata.special_price) : null,
                        image: metadata.image || '',
                        url: metadata.url || '#',
                        rating: metadata.rating || 0,
                        catalogId: catalogId,
                        sourceType: 'opencart',
                        opencart: metadata,
                        displayTitle: metadata.name || 'Product',
                        displaySnippet: item.content ? item.content.substring(0, 200) + '...' : 'No description available'
                      };
                    });
                    
                    console.log(`Mapped ${products.length} products for display`);
                    
                    // Add the products to the search results
                    if (products && products.length > 0) {
                      allResults = [...allResults, ...products];
                      this.searchResults = allResults;
                    }
                  } else {
                    errorMessage = `No products found in catalog ${catalogId} for: "${this.searchText}"`;
                    console.warn('No products found in response:', {
                      searchTerm: this.searchText,
                      catalogId,
                      response: searchResponse
                    });
                  }
                  
                  // Set error message if no products were found
                  if (products.length === 0 && !errorMessage) {
                    errorMessage = 'No products found matching your search criteria.';
                    
                    // If no products found, log the full response for debugging
                    if (searchResponse) {
                      try {
                        console.warn('No products found in response. Full response structure:', 
                          JSON.stringify({
                            responseType: typeof searchResponse,
                            responseKeys: Object.keys(searchResponse),
                            hasData: !!searchResponse.data,
                            dataKeys: searchResponse.data ? Object.keys(searchResponse.data) : [],
                            sampleData: JSON.stringify(searchResponse).substring(0, 1000) + '...'
                          }, null, 2));
                      } catch (e) {
                        console.error('Error logging response structure:', e);
                      }
                    }
                  }
                  
                  // Process products if any were found
                  if (products && products.length > 0) {
                    try {
                      console.log(`Found ${products.length} products in catalog ${catalogId}`);
                      console.log('First product sample:', JSON.stringify(products[0], null, 2));
                      
                      // Add catalog ID to each product for reference
                      products = products.map(p => ({
                        ...p,
                        catalogId,
                        sourceType: 'opencart',
                        displayTitle: p.name || p.title || `Product from catalog ${catalogId}`,
                        displaySnippet: p.description || p.short_description || ''
                      }));
                    } catch (e) {
                      console.error('Error processing products:', e);
                      products = []; // Reset products on error
                    }
                  } else if (!errorMessage) {
                    // More detailed error message for no products found
                    errorMessage = `No products found in catalog ${catalogId} for: "${this.searchText}"`;
                    console.warn(errorMessage, {
                      searchTerm: this.searchText,
                      catalogId,
                      responseType: typeof searchResponse,
                      responseKeys: searchResponse ? Object.keys(searchResponse) : 'null',
                      hasData: !!(searchResponse && searchResponse.data)
                    });
                    
                    // Log the full response structure for debugging
                    if (searchResponse) {
                      console.log('Full response structure:', JSON.stringify(searchResponse, (key, value) => {
                        // Limit string length in logs
                        if (typeof value === 'string' && value.length > 200) {
                          return value.substring(0, 200) + '...';
                        }
                        return value;
                      }, 2));
                    }
                  }
                  
                  if (errorMessage) {
                    console.error('Error processing OpenCart response:', errorMessage);
                    this.aiOverviewError = `OpenCart search error: ${errorMessage}`;
                    console.groupEnd();
                    continue; // Skip to next catalog
                  }
                  
                  console.log(`Found ${products.length} products in catalog ${catalogId}`);
                  
                  if (products && products.length > 0) {
                    const catalogResults = products.map(item => {
                      try {
                        // Extract metadata from the item
                        const metadata = item.metadata || {};
                        console.log('Processing product:', item);
                        
                        const productId = item.product_id || metadata.product_id || `product-${Math.random().toString(36).substr(2, 9)}`;
                        const name = item.name || metadata.name || item.title || 'Product';
                        const description = item.content || metadata.description || item.description || '';
                        const price = metadata.price || item.price || '0.00';
                        const image = metadata.image || item.image || '';
                        const url = metadata.url || item.url || '#';
                        const shopName = metadata.shop_name || item.shop_name || 'Online Store';
                        const shopUrl = metadata.shop_url || item.shop_url || '#';
                        const quantity = metadata.quantity || item.quantity || 0;
                        const specialPrice = metadata.special_price || item.special_price || null;
                        
                        // Create the result object
                        const result = {
                          id: productId,
                          text: description,
                          filename: name,
                          displayTitle: name,
                          displaySnippet: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
                          sourceType: 'opencart',
                          opencart: {
                            ...metadata,
                            ...item, // Include all original item data
                            name: name,
                            description: description,
                            price: price,
                            special_price: specialPrice,
                            image: image,
                            url: url,
                            shop_name: shopName,
                            shop_url: shopUrl,
                            quantity: quantity
                          },
                          url: url,
                          image: image
                        };
                        
                        console.log('Processed product result:', result);
                        return result;
                      } catch (e) {
                        console.error('Error processing product:', item, e);
                        return null;
                      }
                    }).filter(Boolean); // Remove any null results from failed processing
                    
                    // Add the results to our collection
                    opencartResults = [...opencartResults, ...catalogResults];
                    
                    console.log(`Added ${catalogResults.length} products from catalog ${catalogId}`);
                    console.log('Updated search results:', opencartResults);
                    
                    // Update search results with both document and OpenCart results
                    this.searchResults = [...allResults, ...opencartResults];
                    
                    console.log('Total results after update:', this.searchResults.length);
                  } else {
                    console.warn(`No products found in catalog ${catalogId}`);
                    console.log('API response:', JSON.stringify(response, null, 2));
                    
                    // If no products found but we have a response, try to extract any error message
                    if (searchResponse && typeof searchResponse === 'object') {
                      const errorMsg = searchResponse.error || searchResponse.message || 'No products found';
                      this.aiOverviewError = `OpenCart search: ${errorMsg}`;
                    }
                  }
                  
                  console.groupEnd(); // Close the OpenCart Search Debug group
                } catch (e) {
                  console.error('Error processing OpenCart response:', e);
                  this.aiOverviewError = 'Error processing OpenCart response: ' + (e.message || 'Unknown error');
                  console.groupEnd(); // Ensure group is closed on error
                }
              }
              
              // Final update of search results with combined results
              this.searchResults = [...allResults, ...opencartResults];
              
              console.group('Final Results');
              console.log('Total search results:', this.searchResults.length);
              console.log('- OpenCart results found:', opencartResults.length);
              console.log('- Document results found:', allResults.length);
              
              if (this.searchResults.length === 0) {
                console.warn('No results to display. Check the following:');
                console.log('1. Ensure the API returned results');
                console.log('2. Check the response format matches expected structure');
                console.log('3. Verify the search query was correct');
              } else {
                console.log('Sample result:', JSON.parse(JSON.stringify(this.searchResults[0])));
              }
              
              console.groupEnd();
              
              // Close any remaining console groups
              console.groupEnd(); // Close Products Processing
              console.groupEnd(); // Close OpenCart Search Debug
            } catch (error) {
              console.error('Error in OpenCart search:', error);
              
              // Enhanced error handling
              let errorMessage = 'Unknown error occurred';
              
              if (error.response) {
                // The request was made and the server responded with a status code
                console.group('Server Response Error');
                console.log('Status:', error.response.status);
                console.log('Headers:', error.response.headers);
                console.log('Data:', error.response.data);
                console.groupEnd();
                
                if (error.response.data) {
                  if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                  } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                  } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                  } else {
                    errorMessage = `Server responded with status ${error.response.status}`;
                  }
                } else {
                  errorMessage = `Server responded with status ${error.response.status}`;
                }
              } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received from server');
                errorMessage = 'No response received from the server. Please check your connection.';
              } else if (error.message) {
                // Something happened in setting up the request
                console.error('Request setup error:', error.message);
                errorMessage = error.message;
              }
              
              this.aiOverviewError = `Error searching OpenCart products: ${errorMessage}`;
              
              // Ensure all console groups are closed
              while (console.group && console.group() !== undefined) {
                console.groupEnd();
              }
            }
          }
        } catch (wsError) {
          console.warn('WebSocket query failed, falling back to HTTP:', wsError);
          
          // Fallback to HTTP if WebSocket fails
          const { apiRequest } = await import('../api.js');
          
          // Get document search results (unhumanized) via HTTP
          if (searchDocuments) {
            const res = await apiRequest({
              url: `${this.serverUrl}/query`,
              method: 'POST',
              token: this.token,
              data: { question: this.searchText, humanize: false }
            });
            
            if (res.status === 'success' && res.response && Array.isArray(res.response.chunks)) {
              this.searchResults = res.response.chunks.map(rawChunk => {
                const fnameMatch = rawChunk.match(/<filename>(.*?)<\/filename>/);
                const filename = fnameMatch ? fnameMatch[1] : null;
                const possMatch = rawChunk.match(/<possible_files>([\s\S]*?)<\/possible_files>/);
                let possibleFiles = [];
                if (possMatch && possMatch[1]) {
                  try { possibleFiles = JSON.parse(possMatch[1]); } catch (_) { possibleFiles = []; }
                }
                const text = rawChunk
                  .replace(/<filename>[\s\S]*?<\/filename>/g, '')
                  .replace(/<possible_files>[\s\S]*?<\/possible_files>/g, '')
                  .trim();
                
                let displayTitle = '';
                let displaySnippet = '';
                try {
                  let candidate = text;
                  if (candidate.includes("'title'")) {
                    candidate = candidate.replace(/'/g, '"');
                  }
                  const objStart = candidate.indexOf('{');
                  const objEnd = candidate.lastIndexOf('}');
                  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                    const jsonStr = candidate.slice(objStart, objEnd + 1);
                    const parsed = JSON.parse(jsonStr);
                    if (parsed && typeof parsed === 'object') {
                      if (typeof parsed.title === 'string') displayTitle = parsed.title;
                      if (typeof parsed.content === 'string') displaySnippet = parsed.content;
                    }
                  }
                } catch (_) { /* ignore */ }
                
                if (!displaySnippet) {
                  const single = text.match(/['"]content['"]\s*:\s*['"]([\s\S]*?)['"]/);
                  if (single && single[1]) {
                    displaySnippet = single[1];
                  }
                }
                
                if (!displaySnippet) {
                  const firstClean = (text.split('\n').map(l => l.trim()).filter(l => l && !/^<.*?>$/.test(l) && !/relevance\s*:/i.test(l)))[0] || '';
                  displaySnippet = firstClean;
                }
                
                if (displaySnippet && displaySnippet.length > 280) {
                  displaySnippet = displaySnippet.slice(0, 280) + '...';
                }
                
                return { text, filename, possibleFiles, displayTitle, displaySnippet };
              });
              allResults = [...allResults, ...this.searchResults];
            } else if (res.status === 'error') {
              this.aiOverviewError = res.message || 'Failed to fetch search results';
            }
          }
          
          // Get OpenCart results via HTTP if needed
          if (searchOpencart) {
            try {
              const ocRes = await apiRequest({
                url: `${this.serverUrl}/search/opencart`,
                method: 'POST',
                token: this.token,
                data: { 
                  question: this.searchText, 
                  humanize: false,
                  catalog_ids: this.selectedCatalogs.length > 0 ? this.selectedCatalogs : undefined
                }
              });
              
              if (ocRes.status === 'success' && ocRes.response && ocRes.response.snippets) {
                opencartResults = ocRes.response.snippets.map(snippet => ({
                  text: snippet.content || '',
                  filename: snippet.source || 'OpenCart Product',
                  displayTitle: snippet.title || snippet.source || 'Product',
                  displaySnippet: snippet.description || snippet.content || '',
                  sourceType: 'opencart',
                  opencart: snippet.metadata || {}
                }));
                allResults = [...allResults, ...opencartResults];
              }
            } catch (ocError) {
              console.warn('OpenCart fallback search error:', ocError);
            }
          }
          
          // Set final results
          this.searchResults = allResults;
          
          // Get AI overview (humanized) via HTTP
          const res2 = await apiRequest({
            url: `${this.serverUrl}/query`,
            method: 'POST',
            token: this.token,
            data: { question: this.searchText, humanize: true }
          });
          
          if (res2.status === 'success' && res2.response && res2.response.answer) {
            this.aiOverview = res2.response.answer;
          } else if (res2.status === 'error') {
            this.aiOverviewError = res2.message || 'Error generating AI overview';
          }
          
          this.searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
        }
        
      } catch (error) {
        console.error('Search error:', error);
        this.searchResults = [];
        this.aiOverview = '';
        this.aiOverviewError = error.message || 'Unknown error occurred';
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
    
    getResultTitle(result) {
      // Prefer parsed title, fallback to first line of text
      const candidate = (result.displayTitle || '').trim();
      if (candidate) return candidate.length > 80 ? candidate.slice(0, 80) + '...' : candidate;
      const text = result.text || '';
      const lines = text.split('\n');
      const firstLine = (lines[0] || '').trim();
      if (firstLine.length > 60) {
        return firstLine.substring(0, 60) + '...';
      }
      return firstLine || 'Document content';
    },
    
    getResultSnippet(result) {
      // Prefer parsed content snippet, fallback to raw text
      const text = (result.displaySnippet && typeof result.displaySnippet === 'string') ? result.displaySnippet : (result.text || '');
      const snippet = text.substring(0, 260);
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
    
    displayFilename(result) {
      if (!result) return 'unknown';
      // Prefer the first possible file, then the filename, then fallback to 'unknown'
      const possibleFile = Array.isArray(result.possibleFiles) && result.possibleFiles.length > 0 
        ? result.possibleFiles[0] 
        : (result.filename === 'unknown' ? null : result.filename);
      return possibleFile || 'unknown';
    },
    
    async openFile(item, segmentText) {
      // Backward compatibility: if first arg is string, wrap it
      const result = (typeof item === 'string') ? { filename: item, possibleFiles: [], text: segmentText } : item;
      const chosenFilename = (result && result.filename && result.filename !== 'unknown')
        ? result.filename
        : (Array.isArray(result?.possibleFiles) && result.possibleFiles.length > 0 ? result.possibleFiles[0] : result?.filename);
      
      if (!chosenFilename || !this.token || !this.serverUrl) {
        console.error('Missing required parameters:', { filename: chosenFilename, hasToken: !!this.token, hasServerUrl: !!this.serverUrl });
        return;
      }
      
      // Show modal with loading state
      this.fileModalVisible = true;
      this.fileModalName = chosenFilename.startsWith('file:') ? chosenFilename.substring(5) : chosenFilename;
      this.fileModalContent = '';
      
      try {
        // Get clean filename (remove prefix if exists)
        let cleanFilename = this.fileModalName;
        if (cleanFilename.startsWith('temp_')) {
          cleanFilename = cleanFilename.substring(5);
          if (cleanFilename.startsWith('_')) {
            cleanFilename = cleanFilename.substring(4);
          }
        }
        
        // Check if this is an OpenCart product
        if (result.sourceType === 'opencart' && result.opencart) {
          // Display OpenCart product data
          const product = result.opencart;
          const productHTML = `
            <div class="opencart-product-view">
              <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="no-image">No Image</div>'}
              </div>
              <div class="product-details">
                <h1>${product.name}</h1>
                <div class="product-sku">SKU: ${product.sku}</div>
                <div class="product-price">
                  <span class="price">$${product.price}</span>
                  ${product.special_price ? `<span class="special-price">$${product.special_price}</span>` : ''}
                </div>
                <div class="product-rating">⭐ Rating: ${product.rating}/5</div>
                <div class="product-stock">
                  Stock: <strong>${product.quantity > 0 ? product.quantity + ' available' : 'Out of stock'}</strong>
                </div>
                <div class="product-shop">From: ${product.shop_name}</div>
                <div class="product-description">
                  <h3>Description</h3>
                  <p>${product.description}</p>
                </div>
                <a href="${product.url}" target="_blank" class="product-link">View on Store →</a>
                <div class="product-meta">
                  <small>Product ID: ${product.product_id}</small>
                  <small>Catalog ID: ${product.catalog_id}</small>
                  <small>Indexed: ${new Date(product.indexed_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          `;
          this.fileModalContent = productHTML;
          return;
        }
        
        const { getFileContent } = await import('../api.js');
        console.log('Fetching file:', { cleanFilename });
        
        const res = await getFileContent({
          serverUrl: this.serverUrl,
          token: this.token,
          filename: cleanFilename
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
    },
    
    async loadPluginStatus() {
      if (!this.token || !this.serverUrl) {
        console.warn('Cannot load plugin status: missing token or server URL');
        return;
      }
      
      this.loadingPlugins = true;
      this.pluginError = '';
      
      try {
        const response = await fetch(`${this.serverUrl}/plugins/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.response) {
            const documentsEnabled = data.response.documents !== false;
            let opencartEnabled = data.response.opencart === true;

            // If the plugins/status endpoint does not report OpenCart as enabled,
            // try to detect whether catalogs exist for this org and treat that
            // as OpenCart being available (helps when catalogs were uploaded via API).
            if (!opencartEnabled) {
              try {
                const catResp = await fetch(`${this.serverUrl}/catalogs`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (catResp.ok) {
                  const catData = await catResp.json();
                  if (catData.status === 'success' && catData.response && Array.isArray(catData.response.catalogs) && catData.response.catalogs.length > 0) {
                    opencartEnabled = true;
                    // Pre-populate catalogs and selectedCatalogs so UI reflects available catalogs
                    this.catalogs = catData.response.catalogs;
                    this.selectedCatalogs = this.catalogs.map(c => c.catalog_id);
                  }
                }
              } catch (e) {
                // ignore catalog detection errors and keep opencartEnabled as-is
                console.warn('Catalog detection failed:', e);
              }
            }

            this.enabledPlugins = {
              documents: documentsEnabled,
              opencart: opencartEnabled
            };

            // Adjust default search type based on enabled plugins
            if (!this.enabledPlugins.opencart && this.searchType === 'opencart') {
              this.searchType = 'documents';
            }
            if (!this.enabledPlugins.documents && this.searchType === 'documents') {
              this.searchType = 'opencart';
            }
            if (!this.enabledPlugins.opencart && !this.enabledPlugins.documents) {
              // No plugins enabled, default to documents
              this.searchType = 'documents';
              this.enabledPlugins.documents = true;
            }
          }
        } else {
          console.error('Failed to load plugin status');
          // Default to documents if fetch fails
          this.enabledPlugins = { documents: true, opencart: false };
        }
      } catch (error) {
        console.error('Error loading plugin status:', error);
        // Default to documents if fetch fails
        this.enabledPlugins = { documents: true, opencart: false };
      } finally {
        this.loadingPlugins = false;
        
        // Load catalogs if OpenCart is enabled
        if (this.enabledPlugins.opencart) {
          this.loadCatalogs();
        }
      }
    },
    
    async loadCatalogs() {
      if (!this.token || !this.serverUrl || !this.enabledPlugins.opencart) return;
      
      this.loadingCatalogs = true;
      try {
        const response = await fetch(`${this.serverUrl}/catalogs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.response && data.response.catalogs) {
            this.catalogs = data.response.catalogs;
            // Select all catalogs by default
            this.selectedCatalogs = this.catalogs.map(c => c.catalog_id);
          }
        }
      } catch (error) {
        console.error('Error loading catalogs:', error);
      } finally {
        this.loadingCatalogs = false;
      }
    },
    
    saveSettings() {
      // Save settings to localStorage
      localStorage.setItem('searchSettings', JSON.stringify({
        searchType: this.searchType,
        showAiOverview: this.showAiOverview,
        selectedCatalogs: this.selectedCatalogs
      }));
    },
    
    loadSettings() {
      // Load settings from localStorage
      const saved = localStorage.getItem('searchSettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this.searchType = settings.searchType || 'all';
          this.showAiOverview = settings.showAiOverview !== false;
          this.selectedCatalogs = settings.selectedCatalogs || [];
        } catch (e) {
          console.error('Failed to load settings:', e);
        }
      }
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
.dark-mode .search-page {
  background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%);
}

/* Search Header */
.search-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}
.dark-mode .search-header {
  background: #1f2122;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
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
.dark-mode .search-input-wrapper {
  background: #2a2d2f;
  border-color: #3a3d3f;
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
.dark-mode .search-icon {
  color: #a0a6ac;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #202124;
}
.dark-mode .search-input {
  color: #e0e0e0;
}

.search-input::placeholder {
  color: #9aa0a6;
}
.dark-mode .search-input::placeholder {
  color: #8a8f94;
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
.dark-mode .clear-search:hover {
  background-color: rgba(255,255,255,0.08);
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
.dark-mode .search-suggestions {
  background: #1f2122;
  border-color: #3a3d3f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
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
.dark-mode .suggestion-item:hover {
  background-color: rgba(255,255,255,0.06);
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
.dark-mode .suggestion-text {
  color: #e0e0e0;
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
.dark-mode .search-btn {
  background: #2a2d2f;
  border-color: #2a2d2f;
  color: #e0e0e0;
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
.dark-mode .search-results-section {
  background: #181a1b;
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
.dark-mode .search-stats {
  color: #a0a6ac;
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
.dark-mode .ai-overview-card {
  background: #1f2122;
  box-shadow: 0 1px 3px rgba(0,0,0,0.5);
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
.dark-mode .ai-badge {
  color: #66b3ff;
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
.dark-mode .ai-overview-content {
  color: #e0e0e0;
}

.ai-overview-error {
  color: #d93025;
  background: #fdecea;
  border-left: 4px solid #d93025;
  padding: 12px 14px;
  border-radius: 4px;
}
.dark-mode .ai-overview-error {
  color: #ffb4a9;
  background: #2a1b1a;
  border-left-color: #ff8a80;
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

.dark-mode .ai-overview-content.collapsed::after {
  background: linear-gradient(transparent, rgb(126, 126, 126));
}

.ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4285f4;
  font-style: italic;
}
.dark-mode .ai-loading {
  color: #66b3ff;
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
  margin-top: 20px;
}

.result-item {
  background: white;
  border-radius: 8px;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary-light, #dbeafe);
}

/* Header Section */
.result-header {
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.result-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text-primary, #111827);
  flex: 1;
}

.result-header h3 a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-header h3 a:hover {
  color: var(--color-primary, #2563eb);
}

.result-source {
  background: var(--color-bg-secondary, #f3f4f6);
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  margin-top: 0.125rem;
}

/* Content Section */
.result-content {
  padding: 1rem 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Product Image */
.product-image-container {
  width: 100%;
  margin: 0 0 1rem;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  background: var(--color-bg-secondary, #f9fafb);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.result-item:hover .product-image {
  transform: scale(1.02);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-bg-secondary, #f3f4f6);
  color: var(--color-text-secondary, #9ca3af);
  font-size: 0.875rem;
}

/* Price Section */
.product-price {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary, #2563eb);
  flex-wrap: wrap;
}

.sale-price {
  color: var(--color-error, #dc2626);
  position: relative;
}

.original-price {
  text-decoration: line-through;
  color: var(--color-text-secondary, #9ca3af);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Stock Status */
.in-stock,
.out-of-stock {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-left: 0.25rem;
}

.in-stock {
  background: var(--color-success-light, #dcfce7);
  color: var(--color-success, #16a34a);
}

.out-of-stock {
  background: var(--color-error-light, #fee2e2);
  color: var(--color-error, #dc2626);
}

/* Description */
.result-description {
  color: var(--color-text-secondary, #4b5563);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.result-description p {
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Shop Info */
.shop-info {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary, #6b7280);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.shop-info a {
  color: var(--color-primary, #2563eb);
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
}

.shop-info a:hover {
  text-decoration: underline;
  color: var(--color-primary-dark, #1d4ed8);
}

/* Action Buttons */
.result-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg, #ffffff);
  color: var(--color-text-primary, #111827);
  min-height: 2.5rem;
}

.action-btn:hover {
  background: var(--color-bg-hover, #f9fafb);
  border-color: var(--color-primary-light, #bfdbfe);
  color: var(--color-primary, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Dark Mode */
.dark-mode .result-item {
  background: var(--color-bg-card-dark, #1f2937);
  border-color: var(--color-border-dark, #374151);
}

.dark-mode .result-header h3,
.dark-mode .result-header h3 a {
  color: var(--color-text-primary-dark, #f9fafb);
}

.dark-mode .result-content {
  color: var(--color-text-secondary-dark, #d1d5db);
}

.dark-mode .result-description {
  color: var(--color-text-secondary-dark, #d1d5db);
}

.dark-mode .shop-info {
  border-color: var(--color-border-dark, #374151);
  color: var(--color-text-tertiary-dark, #9ca3af);
}

.dark-mode .action-btn {
  background: var(--color-bg-dark, #1f2937);
  border-color: var(--color-border-dark, #374151);
  color: var(--color-text-primary-dark, #f9fafb);
}

.dark-mode .action-btn:hover {
  background: var(--color-bg-hover-dark, #1f2937);
  border-color: var(--color-primary-dark, #3b82f6);
  color: var(--color-primary-light, #60a5fa);
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .search-results {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-results {
    grid-template-columns: 1fr;
    max-width: 100%;
    padding: 0.75rem;
    gap: 1rem;
  }
  
  .result-item {
    border-radius: 10px;
  }
  
  .result-header h3 {
    font-size: 1.0625rem;
  }
  
  .product-price {
    font-size: 1.125rem;
  }
  
  .result-description {
    font-size: 0.9375rem;
  }
  
  .action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-item:nth-child(1) { animation-delay: 0.05s; }
.result-item:nth-child(2) { animation-delay: 0.1s; }
.result-item:nth-child(3) { animation-delay: 0.15s; }
.result-item:nth-child(4) { animation-delay: 0.2s; }
.result-item:nth-child(5) { animation-delay: 0.25s; }

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}
.dark-mode .no-results {
  color: #a0a6ac;
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
.dark-mode .no-results h3 {
  color: #e0e0e0;
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
.dark-mode .file-modal {
  background: #1f2122;
  color: #e0e0e0;
}

.file-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}
.dark-mode .file-modal-header {
  background: #181a1b;
  border-bottom-color: #333;
}

.file-modal-header h3 {
  margin: 0;
  color: #202124;
  font-size: 18px;
  font-weight: 600;
}
.dark-mode .file-modal-header h3 {
  color: #e0e0e0;
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
.dark-mode .close-modal-btn {
  color: #a0a6ac;
}
.dark-mode .close-modal-btn:hover {
  background: rgba(255,255,255,0.08);
}

.file-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  line-height: 1.6;
  color: #202124;
}
.dark-mode .file-modal-content {
  color: #e0e0e0;
}

.file-modal-content :deep(mark) {
  background: #ff6b35;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
}

/* Settings Button */
.settings-btn {
  background: #f8f9fa;
  border: 1px solid #dfe1e5;
  border-radius: 4px;
  color: #3c4043;
  font-size: 18px;
  height: 36px;
  width: 36px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .settings-btn {
  background: #2a2d2f;
  border-color: #3a3d3f;
  color: #e0e0e0;
}

.settings-btn:hover {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  background: #f1f3f4;
  border: 1px solid #dadce0;
}

/* Settings Modal Overlay */
.settings-modal-overlay {
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

/* Settings Modal */
.settings-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}
.dark-mode .settings-modal {
  background: #1f2122;
  color: #e0e0e0;
}

.settings-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}
.dark-mode .settings-modal-header {
  background: #181a1b;
  border-bottom-color: #333;
}

.settings-modal-header h2 {
  margin: 0;
  color: #202124;
  font-size: 18px;
  font-weight: 600;
}
.dark-mode .settings-modal-header h2 {
  color: #e0e0e0;
}

.settings-modal-header .close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #5f6368;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-modal-header .close-btn:hover {
  background: #e8eaed;
}
.dark-mode .settings-modal-header .close-btn {
  color: #a0a6ac;
}
.dark-mode .settings-modal-header .close-btn:hover {
  background: rgba(255,255,255,0.08);
}

.settings-modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-of-type {
  margin-bottom: 0;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  color: #202124;
  font-size: 16px;
  font-weight: 600;
}
.dark-mode .settings-section h3 {
  color: #e0e0e0;
}

.settings-option {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}
.dark-mode .settings-option {
  border-bottom-color: #333;
}

.settings-option:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.settings-option label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
  user-select: none;
}

.settings-option input[type="radio"],
.settings-option input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #4285f4;
}

.settings-option span {
  color: #202124;
  font-size: 16px;
  font-weight: 500;
}
.dark-mode .settings-option span {
  color: #e0e0e0;
}

.option-description {
  margin: 8px 0 0 30px;
  color: #5f6368;
  font-size: 13px;
  line-height: 1.4;
}
.dark-mode .option-description {
  color: #a0a6ac;
}

.plugin-disabled-notice {
  margin: 4px 0 0 30px;
  color: #d93025;
  font-size: 12px;
  font-weight: 500;
}
.dark-mode .plugin-disabled-notice {
  color: #ff8a80;
}

.plugin-loading {
  padding: 20px;
  text-align: center;
  color: #5f6368;
  font-size: 14px;
}
.dark-mode .plugin-loading {
  color: #a0a6ac;
}

.no-catalogs-notice {
  padding: 16px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 13px;
}
.dark-mode .no-catalogs-notice {
  background: #2a2410;
  border-left-color: #ffb300;
  color: #ffb300;
}

.catalogs-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}
.dark-mode .catalogs-checklist {
  background: #2a2d2f;
}

.catalog-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.catalog-checkbox label:hover {
  background-color: #e8eaed;
}
.dark-mode .catalog-checkbox label:hover {
  background-color: rgba(255,255,255,0.06);
}

.catalog-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.catalog-count {
  color: #70757a;
  font-size: 12px;
  margin-left: auto;
}
.dark-mode .catalog-count {
  color: #a0a6ac;
}

.catalog-loading {
  padding: 12px;
  text-align: center;
  color: #5f6368;
  font-size: 13px;
}
.dark-mode .catalog-loading {
  color: #a0a6ac;
}

/* Source Badge */
.source-badge {
  display: inline-block;
  background: #e8f0ff;
  color: #1a73e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
  white-space: nowrap;
}

.source-badge.opencart {
  background: #fff3e0;
  color: #e65100;
}

.dark-mode .source-badge {
  background: #1a2f5f;
  color: #64b5f6;
}

.dark-mode .source-badge.opencart {
  background: #2a2410;
  color: #ffb300;
}

.settings-option input[type="radio"]:disabled,
.settings-option input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-option label:has(input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.dark-mode .settings-modal-footer {
  background: #181a1b;
  border-top-color: #333;
}

.btn-secondary {
  background: #f8f9fa;
  border: 1px solid #dfe1e5;
  border-radius: 4px;
  color: #3c4043;
  font-size: 14px;
  height: 36px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}
.dark-mode .btn-secondary {
  background: #2a2d2f;
  border-color: #3a3d3f;
  color: #e0e0e0;
}

.btn-secondary:hover {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  background: #f1f3f4;
  border: 1px solid #dadce0;
}
.dark-mode .btn-secondary:hover {
  background: #3a3d3f;
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
  
  .settings-btn {
    width: 36px;
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
  
  .settings-modal {
    width: 95vw;
  }
}
</style>
