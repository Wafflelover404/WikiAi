<template>
  <div class="kb-app" :class="{ 'dark-mode': darkMode }">
    <!-- Login Screen -->
    <LoginPage v-if="!token" @login-success="onLoginSuccess" @theme-changed="applyTheme" />
    <!-- Main App -->
    <template v-else>
      <!-- Mobile Navigation Bar -->
      <div class="mobile-navbar">
        <button class="hamburger-btn" @click="toggleMobileMenu" :class="{ 'is-active': isMobileMenuOpen }" aria-label="Toggle menu">
          <span class="hamburger-icon"></span>
        </button>
        <div class="mobile-title">
          <img src="/favicon.ico" alt="WikiAi Logo" class="mobile-logo" />
          <span>WikiAi</span>
        </div>
      </div>
      <!-- Sidebar Navigation -->
      <!-- Mobile Menu Overlay -->
      <div 
        class="mobile-menu-overlay" 
        :style="{ display: isMobileMenuOpen ? 'block' : 'none' }"
        @click="toggleMobileMenu"
      ></div>
      <!-- Swipe Area for Opening Sidebar -->
      <div class="swipe-area" @touchstart="handleSwipeStart" @touchmove="handleSwipeMove" @touchend="handleSwipeEnd"></div>
      <div class="sidebar-nav" :class="{ 'mobile-open': isMobileMenuOpen }" role="navigation" aria-label="Main Navigation">
        <div class="sidebar-header">
          <img src="/favicon.ico" alt="WikiAi Logo" class="sidebar-logo" /> 
          <span class="sidebar-title">WikiAi</span>
        </div>
        <ul class="sidebar-tabs">
          <li :class="{active: currentView === 'home' && !showAdminDashboard}" @click="navigateTo('home')" tabindex="0" aria-label="Home">🏠 Home</li>
          <li :class="{active: currentView === 'files' && !showAdminDashboard}" @click="navigateTo('files')" tabindex="0" aria-label="Files">📁 Files</li>
          <li :class="{active: currentView === 'search' && !showAdminDashboard}" @click="navigateTo('search')" tabindex="0" aria-label="Search">🔍 Search</li>
          <li v-if="isAdmin" :class="{active: showAdminDashboard}" @click="showAdminDashboard = true" tabindex="0" aria-label="Admin">🛠 Admin</li>
        </ul>
        <div class="sidebar-bottom">
          <button class="darkmode-toggle" @click="toggleDarkMode" :aria-pressed="darkMode" aria-label="Toggle dark mode">
            <span v-if="!darkMode">🌙</span>
            <span v-else>☀️</span>
          </button>
          <button class="settings-icon-btn" @click="settingsVisible = true" aria-label="Settings">
            ⚙️
          </button>
        </div>
      </div>
      <div class="app-layout">
        <template v-if="showAdminDashboard">
          <AdminDashboard :token="token" :API_BASE_URL="serverUrl" :activeTabAdmin="activeTabAdmin" @close="showAdminDashboard = false" />
        </template>
        <template v-else>
          <!-- Home View -->
          <HomePage 
            v-if="currentView === 'home'"
            :files="files"
            :token="token"
            :serverUrl="serverUrl"
            :userRole="user?.role || 'user'"
            @navigate-to="navigateTo"
            @perform-search="performSearch"
            @open-file="openFileFromHome"
            @upload-files="handleFileUpload"
          />
          <!-- Files View -->
          <div v-else-if="currentView === 'files'" class="files-view">
              <div class="view-header">
                <!-- Mobile Header -->
                <div class="mobile-view-header">
                  <h1>📁 Files</h1>
                  <p class="view-subtitle">Browse and manage your document library</p>
                </div>
                <!-- Desktop Header -->
                <div class="desktop-view-header">
                  <div class="header-content">
                    <div class="header-left">
                      <h1>📁 Files</h1>
                      <p class="view-subtitle">Browse and manage your document library</p>
                    </div>
                  </div>
                </div>
                <!-- Desktop Search and Filters (Always visible) -->
                <div class="desktop-filters-panel">
                  <div class="search-bar">
                    <input 
                      type="text" 
                      v-model="globalSearch" 
                      placeholder="Search files..." 
                      class="files-search-input"
                    />
                    <button v-if="globalSearch" @click="clearGlobalSearch" class="clear-search-btn">✖</button>
                  </div>
                  <div class="filter-options">
                    <select v-model="fileTypeFilter" class="filter-select">
                      <option value="">All Types</option>
                      <option value="document">Documents</option>
                      <option value="image">Images</option>
                      <option value="pdf">PDFs</option>
                    </select>
                    <select v-model="dateSortOrder" class="filter-select">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <div class="file-status">
                    <span class="status-text">{{ loading ? 'Loading...' : `${filteredFiles.length} files` }}</span>
                    <span v-if="!loading" class="last-update">Last updated: {{ getLastUpdateTime() }}</span>
                  </div>
                </div>
                <!-- Mobile Search and Filters Panel -->
                <div class="mobile-filters-panel" :class="{ 'show': showMobileFilters }">
                  <div class="search-bar">
                    <input 
                      type="text" 
                      v-model="globalSearch" 
                      placeholder="Search files..." 
                      class="files-search-input"
                    />
                    <button v-if="globalSearch" @click="clearGlobalSearch" class="clear-search-btn">✖</button>
                  </div>
                  <div class="mobile-filter-options">
                    <select v-model="fileTypeFilter" class="mobile-filter-select">
                      <option value="">All Types</option>
                      <option value="document">Documents</option>
                      <option value="image">Images</option>
                      <option value="pdf">PDFs</option>
                    </select>
                    <select v-model="dateSortOrder" class="mobile-filter-select">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <div class="file-status">
                    <span class="status-text">{{ loading ? 'Loading...' : `${filteredFiles.length} files` }}</span>
                    <span v-if="!loading" class="last-update">Last updated: {{ getLastUpdateTime() }}</span>
                  </div>
                </div>
              </div>
            <div v-if="loading" class="loading-indicator" role="status" aria-live="polite">Loading...</div>
            <div class="main-content-area">
              <!-- Desktop View - Always render FileTabs -->
              <FileTabs
                v-show="!isMobileView"
                :files="filteredFiles"
                :openedFiles="openedFiles"
                :fileContents="fileContents"
                :activeTab="activeTab"
                @close-file="closeFile"
                @switch-tab="switchTab"
                @download-file="downloadFile"
                @open-quiz="openQuiz"
                class="desktop-file-tabs"
              />
              <!-- Mobile File List View -->
              <div class="mobile-file-list" v-show="isMobileView && mobileActiveContent === null">
                <div 
                  v-for="file in filteredFiles" 
                  :key="file.file_id"
                  class="mobile-file-item"
                >
                  <div class="mobile-file-container" @click="handleMobileFileClick(file)">
                    <div class="mobile-file-icon">{{ getFileEmoji(file.file_type) }}</div>
                    <div class="mobile-file-info">
                      <div class="mobile-file-name">{{ file.filename }}</div>
                      <div class="mobile-file-meta">
                        <span class="mobile-file-type">{{ getFileTypeLabel(file.file_type) }}</span>
                        <span class="mobile-file-date">{{ formatDate(file.upload_date) }}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    class="mobile-action-btn" 
                    @click.stop="toggleMobileFileActions(file)"
                    aria-label="More actions"
                  >⋮</button>
                </div>
                <!-- Mobile File Actions Menu -->
                <div 
                  v-if="selectedFile"
                  class="mobile-file-actions-menu" 
                  :class="{ 'show': showMobileFileActions }"
                >
                  <div class="mobile-actions-header">
                    <h3>{{ selectedFile.filename }}</h3>
                    <button @click="closeMobileFileActions" class="close-actions-btn">✕</button>
                  </div>
                  <div class="mobile-actions-list">
                    <button @click="downloadFile(selectedFile)" class="mobile-action-item">
                      <span>💾</span> Download
                    </button>
                    <button @click="openQuiz(selectedFile)" class="mobile-action-item">
                      <span>🧠</span> Quiz !
                    </button>
                    <button @click="shareFile(selectedFile)" class="mobile-action-item">
                      <span>↗️</span> Share
                    </button>
                  </div>
                </div>
              </div>
              <!-- Mobile Content Display -->
              <div v-if="isMobileView && mobileActiveContent !== null" class="mobile-content-view">
                <div class="mobile-content-header">
                  <button @click="closeMobileContent" class="back-btn">← Back</button>
                  <h3 class="mobile-content-title">{{ mobileActiveFilename }}</h3>
                  <div class="mobile-content-actions">
                    <button 
                      @click="downloadFile(mobileActiveFilename)" 
                      class="mobile-content-action-btn" 
                      aria-label="Download"
                      title="Download file"
                    >💾</button>
                    <button 
                      @click="openQuiz(mobileActiveFilename)" 
                      class="mobile-content-action-btn" 
                      aria-label="Open Quiz"
                      title="Open Quiz"
                    >🧠</button>
                  </div>
                </div>
                <div class="mobile-content-text">
                  <div v-if="loading" class="mobile-content-loading">
                    <div class="loading-spinner"></div>
                    <span>Loading...</span>
                  </div>
                  <div v-else class="mobile-content-wrapper">
                    <div v-if="isMarkdown" class="markdown-content" v-html="markedContent"></div>
                    <div v-else-if="isCode" class="code-content">
                      <div class="code-header">
                        <span class="code-language">{{ getCodeLanguage() }}</span>
                      </div>
                      <pre class="code-block"><code>{{ mobileActiveContent }}</code></pre>
                    </div>
                    <div v-else class="plain-text-content">
                      <pre class="text-block">{{ mobileActiveContent }}</pre>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Optional: Show message if no file is selected on mobile and content view is not active -->
              <div v-if="isMobileView && mobileActiveContent === null" class="mobile-placeholder">
                <div v-if="filteredFiles.length === 0 && !loading" class="empty-state">
                  <span class="empty-icon">📂</span>
                  <p>No files found</p>
                </div>
                <div v-if="loading" class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>Loading files...</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Search View -->
          <SearchPage 
            v-else-if="currentView === 'search'"
            :token="token"
            :serverUrl="serverUrl"
            :initial-search="pendingSearch"
            @search-performed="pendingSearch = ''"
          />
          <!-- Settings Modal -->
          <SettingsModal
            :visible="settingsVisible"
            :initialUsername="username"
            :initialPassword="password"
            :initialServerUrl="serverUrl"
            :accessToken="token"
            @close="settingsVisible = false"
            @save="saveSettings"
            @logout="handleLogout"
          />
        </template>
      </div>
    </template>
  </div>
  <!-- Quiz Modal -->
  <QuizModal
    :visible="quizVisible"
    :filename="quizFilename"
    :token="token"
    :serverUrl="serverUrl"
    @close="quizVisible = false"
  />
</template>

<script>
import FileTabs from './components/FileTabs.vue';
import SearchSidebar from './components/SearchSidebar.vue';
import SettingsModal from './components/SettingsModal.vue';
import LoginPage from './components/LoginPage.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import HomePage from './components/HomePage.vue';
import SearchPage from './components/SearchPage.vue';
import QuizModal from './components/QuizModal.vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default {
  name: 'App',
  components: {
    FileTabs,
    SearchSidebar,
    SettingsModal,
    LoginPage,
    AdminDashboard,
    HomePage,
    SearchPage,
    QuizModal
  },
  data() {
    return {
      files: [],
      openedFiles: [],
      fileContents: {},
      searchVisible: false,
      settingsVisible: false,
      isMobileMenuOpen: false,
      showMobileFilters: false,
      showMobileFileActions: false,
      selectedFile: null,
      fileTypeFilter: '',
      dateSortOrder: 'newest',
      isMobileView: window.innerWidth <= 768,
      token: '',
      serverUrl: '',
      activeTab: null,
      activeTabAdmin: 'users',
      username: '',
      password: '',
      user: null,
      showAdminDashboard: false,
      showToken: false,
      darkMode: true,
      globalSearch: '',
      loading: false,
      currentView: 'home',
      pendingSearch: '',
      fileListCache: [],
      mobileActiveContent: null, 
      mobileActiveFilename: null, 
      fileListInterval: null,
      quizVisible: false,
      quizFilename: ''
    };
  },
  mounted() {
    try {
      const stored = localStorage.getItem('theme');
      // Default to dark if nothing stored
      this.darkMode = stored ? stored === 'dark' : true;
      // Apply dark mode class to html element for better compatibility
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      document.body.classList.toggle('dark-mode', this.darkMode);
    } catch (e) {
      console.error('Error initializing theme:', e);
      this.darkMode = true;
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
  },
  watch: {
      currentView(newView) {
        if (newView === 'files' && this.token && this.serverUrl) {
          // Start auto-update interval when entering Files tab
          if (!this.fileListInterval) {
            this.fileListInterval = setInterval(this.autoUpdateFiles, 5000);
          }
          // Initial load if needed
          if (this.files.length === 0) {
            this.updateFiles();
          }
        } else {
          // Stop auto-update interval when leaving Files tab
          if (this.fileListInterval) {
            clearInterval(this.fileListInterval);
            this.fileListInterval = null;
          }
        }
      }
  },
  computed: {
      isAdmin() {
        return this.user && this.user.role === 'admin';
      },
    copyContent() {
      if (!this.activeTab) return;
      const content = this.fileContents[this.activeTab] || '';
      if (!content) return;
      navigator.clipboard.writeText(content).then(() => {
        console.log('Content copied');
      }).catch(() => {});
    },
    printContent() {
      if (!this.activeTab) return;
      const content = this.fileContents[this.activeTab] || '';
      const w = window.open('', '_blank');
      if (!w) return;
      const isMarkdown = this.activeTab.toLowerCase().endsWith('.md');
      const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${this.activeTab}</title></head><body>${isMarkdown ? `<pre>${escaped}</pre>` : `<pre>${escaped}</pre>`}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
    },
      maskedToken() {
        return this.token ? '•'.repeat(this.token.length) : 'No token';
      },
      markedContent() {
        if (!this.mobileActiveContent) return '';
        marked.setOptions({
          gfm: true,
          smartLists: true,
          smartypants: true,
          breaks: true,
          headerIds: true,
          mangle: false,
          highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
          }
        });
        return marked(this.mobileActiveContent);
      },
      isMarkdown() {
        if (!this.mobileActiveFilename) return false;
        const filename = this.mobileActiveFilename.toLowerCase();
        return filename.endsWith('.md') || filename.endsWith('.markdown');
      },
      isCode() {
        if (!this.mobileActiveFilename) return false;
        const filename = this.mobileActiveFilename.toLowerCase();
        const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css', '.xml', '.json', '.yml', '.yaml'];
        return codeExtensions.some(ext => filename.endsWith(ext));
      },
      filteredFiles() {
        if (!this.globalSearch) return this.files;
        const search = this.globalSearch.toLowerCase();
        return this.files.filter(file => {
          const name = (file.filename || file.original_filename || '').toLowerCase();
          const description = (file.description || '').toLowerCase();
          return name.includes(search) || description.includes(search);
        });
      }
    },
    methods: {
    applyTheme(isDark) {
      this.darkMode = !!isDark;
      document.body.classList.toggle('dark-mode', this.darkMode);
      try {
        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      } catch (e) { /* ignore */ }
    },
        autoUpdateFiles() {
          if (this.currentView !== 'files' || !this.token || !this.serverUrl) return;
          this.fetchFilesForAutoUpdate();
        },

        async fetchFilesForAutoUpdate() {
          try {
            const { apiRequest } = await import('./api.js');
            const res = await apiRequest({ url: `${this.serverUrl}/files/list`, method: 'GET', token: this.token });
            if (res && res.response && Array.isArray(res.response.documents)) {
              const newFiles = res.response.documents.map(doc => ({
                filename: doc.filename || doc.original_filename,
                original_filename: doc.original_filename,
                file_id: doc.file_id,
                size: doc.size || 0,
                upload_date: doc.upload_date || doc.created_at,
                file_type: doc.file_type || this.getFileTypeFromName(doc.filename || doc.original_filename),
                description: doc.description || ''
              }));
              // Compare with cached list
              if (JSON.stringify(newFiles) !== JSON.stringify(this.fileListCache)) {
                this.files = newFiles;
                this.fileListCache = newFiles;
                console.log('Files auto-updated:', newFiles);
              }
            }
          } catch (e) {
            // Silent fail for auto-update
          }
        },
      toggleToken() {
        this.showToken = !this.showToken;
      },
    beforeDestroy() {
      // Clean up interval on destroy
      if (this.fileListInterval) {
        clearInterval(this.fileListInterval);
        this.fileListInterval = null;
      }
    },
    copyToken() {
      navigator.clipboard.writeText(this.token).then(() => alert('Token copied!'));
    },
    onLoginSuccess({ username, password, role, token, serverUrl }) {
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
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
      document.body.classList.toggle('dark-mode', this.darkMode);
      try {
        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      } catch (e) {
        console.error('Error saving theme preference:', e);
      }
    },
    onGlobalSearchInput() {
      // Optionally add debounce for performance
    },
    clearGlobalSearch() {
      this.globalSearch = '';
    },
    async saveSettings({ serverUrl }) {
      this.serverUrl = serverUrl;
      this.settingsVisible = false;
      try {
        this.loading = true;
        const { apiRequest } = await import('./api.js');
        const res = await apiRequest({ url: `${serverUrl}/`, method: 'GET' });
        if (typeof res === 'object' && res.app) {
          if (this.token) {
            await this.reloadFiles();
          }
        } else {
          this.files = [];
        }
      } catch (e) {
        this.files = [];
      } finally {
        this.loading = false;
      }
    },
    async reloadFiles() {
      await this.updateFiles();
    },
    async updateFiles() {
      if (this.token && this.serverUrl) {
        try {
          this.loading = true;
          const { apiRequest } = await import('./api.js');
          const res = await apiRequest({ url: `${this.serverUrl}/files/list`, method: 'GET', token: this.token });
          if (res && res.response && Array.isArray(res.response.documents)) {
            // Store full file objects with metadata instead of just filenames
            this.files = res.response.documents.map(doc => ({
              filename: doc.filename || doc.original_filename,
              original_filename: doc.original_filename,
              file_id: doc.file_id,
              size: doc.size || 0,
              upload_date: doc.upload_date || doc.created_at,
              file_type: doc.file_type || this.getFileTypeFromName(doc.filename || doc.original_filename),
              description: doc.description || ''
            }));
            console.log('Files loaded:', this.files);
          } else {
            this.files = [];
          }
        } catch (e) {
          console.error('Error fetching files:', e);
          this.files = [];
        } finally {
          this.loading = false;
        }
      }
    },
    // Inside your methods block
    async handleMobileFileClick(fileOrFilename) {
      if (!this.token || !this.serverUrl) return;
      
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      // Set the mobile active filename immediately for UI feedback
      this.mobileActiveFilename = filename;
      
      // If content is already loaded, show it
      if (this.fileContents[filename]) {
        this.mobileActiveContent = this.fileContents[filename];
        return;
      }
      
      try {
        this.loading = true;
        
        // Use the centralized API function
        const { getFileContent } = await import('./api.js');
        const res = await getFileContent({
          serverUrl: this.serverUrl,
          token: this.token,
          filename: filename
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            this.fileContents[filename] = 'File not found.';
            this.mobileActiveContent = 'File not found.';
            console.warn(`File not found: ${filename}`);
          } else if (res.status === 403) {
            this.fileContents[filename] = 'Access denied.';
            this.mobileActiveContent = 'Access denied.';
            console.warn(`Access denied for file: ${filename}`);
          } else {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return;
        }
        
        // Try to parse response based on content type
        const contentType = res.headers.get('content-type');
        let content;
        
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          // Handle different JSON response formats
          if (data.status === 'success' && data.response) {
            content = data.response.content || data.response;
          } else if (data.content) {
            content = data.content;
          } else if (typeof data === 'string') {
            content = data;
          } else {
            content = JSON.stringify(data, null, 2);
          }
        } else {
          // For non-JSON responses, get the raw text
          content = await res.text();
        }
        
        // Store and display the content
        this.fileContents[filename] = content;
        this.mobileActiveContent = content;
        console.log(`File content loaded for: ${filename}`);
        
      } catch (e) {
        console.error(`Error loading file ${filename}:`, e);
        const errorMsg = 'Error loading file: ' + e.message;
        this.fileContents[filename] = errorMsg;
        this.mobileActiveContent = errorMsg;
      } finally {
        this.loading = false;
      }
    },
    closeFile(filename) {
      this.openedFiles = this.openedFiles.filter(f => f !== filename);
      if (this.activeTab === filename) {
        this.activeTab = this.openedFiles[0] || null;
      }
    },
    async switchTab(fileOrFilename) {
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      // Load file content if not already loaded
      if (!this.fileContents[filename]) {
        await this.handleMobileFileClick(fileOrFilename);
      }
      
      this.activeTab = filename;
      if (!this.openedFiles.includes(filename)) {
        this.openedFiles.unshift(filename);
      }
    },
    async downloadFile(fileOrFilename) {
      if (!this.token || !this.serverUrl) return;
      
      // Handle both file objects and filenames
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : fileOrFilename.filename;
      
      try {
        const encodedFilename = encodeURIComponent(filename);
        const url = `${this.serverUrl}/files/content/${encodedFilename}`;
        const res = await fetch(url, {

          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}`, 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
          console.log(`File downloaded: ${filename}`);
        } else {
          console.error(`Failed to download file ${filename}:`, res.statusText);
        }
      } catch (e) {
        console.error(`Error downloading file ${filename}:`, e);
      }
    },
    openQuiz(fileOrFilename) {
      const filename = typeof fileOrFilename === 'string' ? fileOrFilename : (fileOrFilename && fileOrFilename.filename) || this.activeTab;
      if (!filename) return;
      console.log('[Quiz] Opening quiz for', filename);
      this.quizFilename = filename;
      this.quizVisible = true;
    },
    
    // Navigation methods
    navigateTo(view) {
      this.currentView = view;
      this.showAdminDashboard = false;
      this.isMobileMenuOpen = false; // Close mobile menu after navigation
      
      // Reset active tab when switching views
      if (view !== 'files') {
        this.activeTab = null;
      }
    },

    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      // Add overlay when menu is open
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },

    // Touch handling for mobile swipe gestures
    handleSwipeStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    },

    handleSwipeMove(e) {
      if (!this.touchStartX || !this.touchStartY) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - this.touchStartX;
      const deltaY = touchY - this.touchStartY;

      // Check if horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        e.preventDefault();
      }
    },

    handleSwipeEnd(e) {
      if (!this.touchStartX) return;

      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - this.touchStartX;

      // Open menu on right swipe when closed
      if (deltaX > 70 && !this.isMobileMenuOpen) {
        this.isMobileMenuOpen = true;
      }
      // Close menu on left swipe when open
      else if (deltaX < -70 && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }

      this.touchStartX = null;
      this.touchStartY = null;
    },
    
    // Home page event handlers
    performSearch(query) {
      this.pendingSearch = query;
      this.currentView = 'search';
    },
    
    async openFileFromHome(fileOrFilename) {
      this.currentView = 'files';
      await this.handleMobileFileClick(fileOrFilename);
    },
    
    handleFileUpload(files) {
      // Handle file upload - you can implement this based on your API
      console.log('Files to upload:', files);
      // For now, just show an alert
      alert(`Selected ${files.length} file(s) for upload. Upload functionality needs to be implemented.`);
    },
    
    getFileTypeFromName(filename) {
      if (!filename) return 'unknown';
      const extension = filename.split('.').pop()?.toLowerCase();
      const typeMap = {
        'md': 'markdown',
        'txt': 'text',
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'json': 'json',
        'js': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin',
        'xml': 'xml',
        'yml': 'yaml',
        'yaml': 'yaml'
      };
      return typeMap[extension] || 'unknown';
    },
    
    getLastUpdateTime() {
      if (!this.files.length) return 'Never';
      // For now, return a simple timestamp. In a real app, you'd track this
      return new Date().toLocaleTimeString();
    },

    // Mobile-specific methods
    toggleMobileFilters() {
      this.showMobileFilters = !this.showMobileFilters;
      this.showMobileFileActions = false;
    },

    toggleMobileSort() {
      this.dateSortOrder = this.dateSortOrder === 'newest' ? 'oldest' : 'newest';
    },

    closeMobileContent() {
      this.mobileActiveContent = null;
      this.mobileActiveFilename = null;
      this.loading = false;
    },

    toggleMobileFileActions(file) {
      this.selectedFile = file;
      this.showMobileFileActions = true;
    },

    closeMobileFileActions() {
      this.showMobileFileActions = false;
      this.selectedFile = null;
    },

    getFileEmoji(fileType) {
      const emojiMap = {
        'document': '📄',
        'image': '🖼️',
        'pdf': '📑',
        'markdown': '📝',
        'code': '💻',
        'unknown': '📁'
      };
      return emojiMap[fileType] || emojiMap.unknown;
    },

    getFileTypeLabel(fileType) {
      return fileType.charAt(0).toUpperCase() + fileType.slice(1);
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return 'Today';
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        return d.toLocaleDateString();
      }
    },

    shareFile(file) {
      // Implement sharing functionality
      if (navigator.share) {
        navigator.share({
          title: file.filename,
          text: `Check out this file: ${file.filename}`,
          url: window.location.href
        }).catch(console.error);
      } else {
        // Fallback - copy link to clipboard
        const fileUrl = `${window.location.origin}/files/${file.file_id}`;
        navigator.clipboard.writeText(fileUrl)
          .then(() => alert('Link copied to clipboard!'))
          .catch(console.error);
      }
    }
  },

  mounted() {
    // Add window resize listener for mobile view
    window.addEventListener('resize', () => {
      this.isMobileView = window.innerWidth <= 768;
    });

    // Initialize theme from localStorage or system preference
    let storedTheme = null;
    try {
      storedTheme = localStorage.getItem('theme');
    } catch (e) {
      storedTheme = null;
    }

    if (storedTheme === 'dark' || storedTheme === 'light') {
      this.darkMode = storedTheme === 'dark';
      document.body.classList.toggle('dark-mode', this.darkMode);
    } else {
      const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if (mql) {
        this.darkMode = !!mql.matches;
        document.body.classList.toggle('dark-mode', this.darkMode);
        // Listen to system theme changes if user hasn't explicitly chosen
        this._themeMql = mql;
        this._onThemeChange = (e) => {
          // only react if user hasn't explicitly chosen
          let explicit = null;
          try { explicit = localStorage.getItem('theme'); } catch (_) { explicit = null; }
          if (explicit !== 'dark' && explicit !== 'light') {
            this.darkMode = !!e.matches;
            document.body.classList.toggle('dark-mode', this.darkMode);
          }
        };
        if (mql.addEventListener) {
          mql.addEventListener('change', this._onThemeChange);
        } else if (mql.addListener) {
          // Safari
          mql.addListener(this._onThemeChange);
        }
      }
    }
  },

  beforeDestroy() {
    // Clean up resize listener
    window.removeEventListener('resize', () => {
      this.isMobileView = window.innerWidth <= 768;
    });
    // Clean up theme listener
    if (this._themeMql && this._onThemeChange) {
      if (this._themeMql.removeEventListener) {
        this._themeMql.removeEventListener('change', this._onThemeChange);
      } else if (this._themeMql.removeListener) {
        this._themeMql.removeListener(this._onThemeChange);
      }
    }
  }
}
</script>



<style>
.kb-app {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Full-page login UI */
.login-fullpage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  z-index: 100;
}
body {
  font-family: 'Inter', 'Open Sans', Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
  transition: background 0.3s;
}
.kb-app {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}
.dark-mode {
  background: #181a1b !important;
  color: #e0e0e0;
}
.dark-mode body {
  background: #181a1b !important;
  color: #e0e0e0;
}
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 2px 0 8px rgba(33, 150, 243, 0.04);
  z-index: 1000;
  overflow-y: auto;
}
.dark-mode .sidebar-nav {
  background: #1f2122;
  border-right-color: #2a2c2d;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 24px 16px 12px 16px;
  gap: 12px;
}
.sidebar-logo {
  width: 32px;
  height: 32px;
}
.sidebar-title {
  font-size: 22px;
  font-weight: 600;
  color: #007BFF;
  letter-spacing: 1px;
}
.sidebar-tabs {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.sidebar-tabs li {
  padding: 14px 24px;
  font-size: 18px;
  color: #6C757D;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  outline: none;
}
.sidebar-tabs li.active, .sidebar-tabs li:focus, .sidebar-tabs li:hover {
  background: #e3f2fd;
  color: #007BFF;
  border-left: 4px solid #007BFF;
}
.dark-mode .sidebar-tabs li {
  color: #a8adb2;
}
.dark-mode .sidebar-tabs li.active, .dark-mode .sidebar-tabs li:focus, .dark-mode .sidebar-tabs li:hover {
  background: #2a2d2f;
  color: #66b3ff;
  border-left-color: #66b3ff;
}
.sidebar-bottom {
  display: flex;
  gap: 8px;
  padding: 16px;
  justify-content: flex-end;
}
.darkmode-toggle {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  border-radius: 50%;
  padding: 8px;
  transition: background 0.2s;
}
.darkmode-toggle:hover {
  background: #e3f2fd;
}
.settings-icon-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  border-radius: 50%;
  padding: 8px;
  transition: background 0.2s;
}
.settings-icon-btn:hover {
  background: #e3f2fd;
}
.app-layout {
  margin-left: 220px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: inherit;
  width: calc(100% - 220px);
  max-width: calc(100vw - 220px);
  overflow-x: hidden;
}
.dark-mode .app-layout {
  background: #181a1b;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px 32px;
}
.breadcrumbs {
  font-size: 15px;
  color: #6C757D;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
.global-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  gap: 8px;
}
.global-search-bar input {
  font-size: 16px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 260px;
  outline: none;
  transition: border-color 0.2s;
}
.global-search-bar input:focus {
  border-color: #007BFF;
}
.clear-search-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #DC3545;
  border-radius: 50%;
  padding: 4px;
  transition: background 0.2s;
}
.clear-search-btn:hover {
  background: #f8d7da;
}
.loading-indicator {
  font-size: 16px;
  color: #007BFF;
  margin-bottom: 12px;
}
.dark-mode .loading-indicator {
  color: #66b3ff;
}
.reload-btn {
  padding: 8px 20px;
  background: #fff;
  color: #007BFF;
  border: 1.5px solid #007BFF;
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
.search-sidebar-animated {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 320px;
  z-index: 10;
  transition: width 0.6s cubic-bezier(.23,1,.32,1);
}
.sidebar-slide-enter-active, .sidebar-slide-leave-active {
  transition: all 0.6s cubic-bezier(.23,1,.32,1);
}
.sidebar-slide-enter, .sidebar-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
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
.dark-mode .file-tabs-card {
  background: #1f2122;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.admin-dashboard-wrapper {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  box-sizing: border-box;
  overflow: hidden;
  contain: strict;
  padding: 16px;
}

/* Admin Panel Mobile Styles */
@media (max-width: 768px) {
  .admin-dashboard-wrapper {
    padding: 8px;
    contain: strict;
  }

  .admin-panel {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    contain: content;
  }

  .admin-panel > * {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    contain: content;
  }

  .admin-tabs {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 12px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
    margin: 0;
    contain: content;
  }

  .admin-tab-button {
    padding: 12px 20px;
    font-size: 15px;
    white-space: nowrap;
    border: none;
    background: none;
    color: #666;
    position: relative;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-tab-button.active {
    color: #007BFF;
    font-weight: 500;
  }

  .admin-tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #007BFF;
  }

  .admin-content {
    flex: 1;
    padding: 12px;
    background: #fff;
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    contain: content;
  }

  .admin-table {
    width: 100%;
    box-sizing: border-box;
    border-spacing: 0;
    border-collapse: collapse;
    table-layout: fixed;
    contain: content;
  }

  /* Stricter container rules */
  .admin-content > * {
    max-width: 100%;
    overflow-x: hidden;
    contain: content;
  }

  .admin-table-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Extra safety measures for admin panel */
  .admin-form {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .admin-form input,
  .admin-form select,
  .admin-form textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .admin-dashboard-wrapper * {
    max-width: 100%;
    box-sizing: border-box;
  }

  .admin-table table {
    min-width: 100%;
    border-collapse: collapse;
  }

  .admin-table th,
  .admin-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  .admin-table th {
    font-weight: 600;
    color: #444;
    background: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .admin-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .admin-form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-form label {
    font-size: 14px;
    font-weight: 500;
    color: #444;
  }

  .admin-form input,
  .admin-form select,
  .admin-form textarea {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    width: 100%;
    min-height: 48px;
  }

  .admin-form button {
    padding: 12px 24px;
    background: #007BFF;
    color: #fff;
    border: none;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    min-height: 48px;
    cursor: pointer;
  }

  .admin-form button:disabled {
    background: #ccc;
  }

  .dark-mode .admin-dashboard-wrapper {
    background: #181a1b;
  }

  .dark-mode .admin-tabs {
    background: #242526;
    border-bottom-color: #333;
  }

  .dark-mode .admin-tab-button {
    color: #888;
  }

  .dark-mode .admin-tab-button.active {
    color: #66b3ff;
  }

  .dark-mode .admin-content {
    background: #242526;
  }

  .dark-mode .admin-table th {
    background: #1e1e1e;
    color: #e0e0e0;
  }

  .dark-mode .admin-table td {
    border-bottom-color: #333;
  }

  .dark-mode .admin-form label {
    color: #e0e0e0;
  }

  .dark-mode .admin-form input,
  .dark-mode .admin-form select,
  .dark-mode .admin-form textarea {
    background: #333;
    border-color: #444;
    color: #e0e0e0;
  }
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
.dark-mode .token-box {
  background: #2a2d2f;
  border-color: #3a3d3f;
}
.token-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: 6px;
  color: #007BFF;
}
/* Main content area */
.main-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 8px;
}

/* Files View Styles */
.files-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
}
.dark-mode .files-view {
  background: #181a1b;
}

.view-header {
  background: white;
  padding: 32px 40px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.dark-mode .view-header {
  background: #1f2122;
  border-bottom-color: #2a2c2d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.view-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #202124;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dark-mode .view-header h1 {
  color: #e0e0e0;
}

.view-subtitle {
  font-size: 18px;
  color: #5f6368;
  margin: 0 0 24px 0;
  font-weight: 300;
}
.dark-mode .view-subtitle {
  color: #9aa0a6;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  position: relative;
}

.files-search-input {
  width: 320px;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background: #f8f9fa;
}
.dark-mode .files-search-input {
  background: #2a2d2f;
  color: #e0e0e0;
  border-color: #3a3d3f;
}
.dark-mode .files-search-input::placeholder {
  color: #8a8f94;
}

.files-search-input:focus {
  background: white;
  border-color: #4285f4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
}

.files-search-input::placeholder {
  color: #9aa0a6;
}

.file-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.last-update {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

/* Accessibility: focus ring for keyboard navigation */
.sidebar-tabs li:focus {
  outline: 2px solid #007BFF;
}

/* Mobile File List Styles */
.mobile-view-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.desktop-view-header {
  margin-bottom: 16px;
}

@media (min-width: 769px) {
  .desktop-view-header {
    padding: 0 8px;
  }

  .header-content {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .header-content h1 {
    margin: 0;
    font-size: 28px;
  }

  .view-subtitle {
    margin: 0;
    color: #666;
  }

  .view-header {
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin: 16px 24px;
  }
}

.mobile-actions {
  display: flex;
  gap: 12px;
}

.mobile-filter-btn,
.mobile-sort-btn {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 123, 255, 0.1);
}

/* Desktop Filters Panel */
.desktop-filters-panel {
  display: block;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
}
.dark-mode .desktop-filters-panel {
  background: #1f2122;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.desktop-filters-panel .search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.desktop-filters-panel .files-search-input {
  max-width: 320px;
}

.filter-options {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  min-width: 130px;
  height: 38px; /* Match search input height */
}
.dark-mode .filter-select {
  background: #2a2d2f;
  color: #e0e0e0;
  border-color: #3a3d3f;
}

/* Desktop horizontal layout */
@media (min-width: 769px) {
  .desktop-filters-panel {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
  }

  .desktop-filters-panel .search-bar {
    flex: 0 0 auto;
    width: auto;
  }

  .filter-options {
    flex: 0 0 auto;
    margin-top: 0;
  }

  .file-status {
    margin-left: auto;
    text-align: right;
    white-space: nowrap;
  }
}

.mobile-filters-panel {
  padding: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  max-width: 100%;
}

@media (min-width: 769px) {
  .mobile-filters-panel {
    display: none;
  }
}

.mobile-filter-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.mobile-filter-select {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 8px;
  padding-right: 24px;
}

.mobile-file-list {
  padding: 8px;
}

.mobile-file-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  touch-action: pan-y;
}

.mobile-file-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.mobile-file-container:active {
  background-color: rgba(0, 123, 255, 0.05);
}

.mobile-action-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 44px;
}

.mobile-action-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .mobile-action-btn {
  color: #999;
}

.dark-mode .mobile-action-btn:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.mobile-file-icon {
  font-size: 24px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 8px;
}

.mobile-file-info {
  flex: 1;
  min-width: 0;
}

.mobile-file-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-file-meta {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.mobile-file-type {
  background: rgba(0, 123, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.mobile-file-date {
  color: #888;
}

.mobile-action-btn {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
}

.desktop-file-tabs {
  display: block;
}

@media (max-width: 768px) {
  .desktop-file-tabs {
    display: none;
  }
}

.mobile-file-list {
  display: none;
}

@media (max-width: 768px) {
  .mobile-file-list {
    display: block;
    padding: 4px 8px;
  }
}

.mobile-file-actions-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  max-width: 100vw;
}

.mobile-file-actions-menu.show {
  transform: translateY(0);
}

.mobile-actions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.mobile-actions-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

.close-actions-btn {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  color: #666;
  cursor: pointer;
}

.mobile-actions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
}

.mobile-action-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.mobile-action-item span {
  font-size: 18px;
}

.dark-mode .mobile-file-actions-menu {
  background: #242526;
}

.dark-mode .mobile-actions-header h3 {
  color: #e0e0e0;
}

.dark-mode .close-actions-btn {
  color: #999;
}

.dark-mode .mobile-action-item {
  color: #e0e0e0;
}

.dark-mode .mobile-action-item:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.mobile-file-actions-menu.show {
  transform: translateY(0);
}

.mobile-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mobile-actions-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-actions-btn {
  background: none;
  border: none;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
}

.mobile-actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.mobile-action-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.mobile-action-item span {
  font-size: 20px;
}

/* Dark mode adjustments for mobile file list */
.dark-mode .mobile-filters-panel,
.dark-mode .mobile-file-item,
.dark-mode .mobile-file-actions-menu {
  background: #242526;
}

.dark-mode .mobile-file-name {
  color: #e0e0e0;
}

.dark-mode .mobile-file-meta {
  color: #888;
}

.dark-mode .mobile-file-type {
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile Navigation Bar Styles */
.mobile-navbar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}
.dark-mode .mobile-navbar {
  background: #1f2122;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-logo {
  width: 24px;
  height: 24px;
}

.hamburger-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  position: relative;
  z-index: 2001;
}

.hamburger-icon {
  position: relative;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}
.dark-mode .hamburger-icon {
  background: #e0e0e0;
}

.hamburger-icon::before,
.hamburger-icon::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}
.dark-mode .hamburger-icon::before,
.dark-mode .hamburger-icon::after {
  background: #e0e0e0;
}

.hamburger-icon::before {
  transform: translateY(-8px);
}

.hamburger-icon::after {
  transform: translateY(8px);
}

.hamburger-btn.is-active .hamburger-icon {
  background: transparent;
}

.hamburger-btn.is-active .hamburger-icon::before {
  transform: rotate(45deg);
}

.hamburger-btn.is-active .hamburger-icon::after {
  transform: rotate(-45deg);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Responsive design for files view and overall app */
@media (max-width: 1024px) {
  .sidebar-nav {
    width: 180px;
  }
  
  .app-layout {
    margin-left: 180px;
  }
  
  .admin-header-content {
    padding: 20px 24px;
  }
  
  .admin-tab-content {
    padding: 24px 24px;
  }
}

@media (max-width: 768px) {
  .mobile-navbar {
    display: flex;
  }

  .mobile-view-header {
    display: flex;
  }

  .desktop-view-header,
  .desktop-filters-panel {
    display: none;
  }

  .sidebar-nav {
    position: fixed;
    left: -280px;
    top: 0;
    width: 280px;
    transition: transform 0.3s ease;
    z-index: 2000;
    background: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-nav.mobile-open {
    transform: translateX(280px);
  }
  
  .app-layout {
    margin-left: 0;
    width: 100%;
    max-width: 100vw;
    padding-top: 60px;
    overflow-x: hidden;
  }
  
  .view-header {
    padding: 12px;
  }
  
  .view-header h1 {
    font-size: 20px;
    margin-bottom: 8px;
  }
  
  .view-subtitle {
    font-size: 13px;
    margin-bottom: 12px;
  }
  
  .view-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
.files-search-input {
  width: 100%;
  max-width: calc(100vw - 32px);
  font-size: 16px;
  padding: 12px 16px;
  margin: 0 auto;
  min-height: 48px;
  border-radius: 24px;
  -webkit-appearance: none;
  appearance: none;
}  .mobile-file-list {
    padding: 8px;
    max-width: 100vw;
  }

  .mobile-file-item {
    padding: 12px;
    margin: 0 0 8px 0;
    border-radius: 8px;
  }

  .mobile-file-icon {
    font-size: 20px;
    min-width: 32px;
    height: 32px;
  }

.mobile-file-info {
  flex: 1;
  min-width: 0;
}

.mobile-file-name {
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.mobile-file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.mobile-file-type {
  padding: 2px 8px;
  font-size: 11px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 12px;
  color: #0066cc;
}

.mobile-file-date {
  color: #666;
}

.mobile-actions {
  gap: 8px;
}

.mobile-filter-btn,
.mobile-sort-btn {
  font-size: 18px;
  padding: 6px;
  min-width: 36px;
  min-height: 36px;
}

/* Active state for mobile file items */
.mobile-file-item:active {
  background: rgba(0, 123, 255, 0.05);
}

.dark-mode .mobile-file-name {
  color: #e0e0e0;
}

.dark-mode .mobile-file-type {
  background: rgba(255, 255, 255, 0.1);
  color: #66b3ff;
}

.dark-mode .mobile-file-date {
  color: #999;
}

.dark-mode .mobile-file-item:active {
  background: rgba(255, 255, 255, 0.05);
}  /* File content adaptations */
  .file-tabs-card {
    margin: 12px;
    padding: 16px;
    border-radius: 12px;
  }

  /* Touch-friendly adjustments */
  .sidebar-tabs li {
    padding: 16px 24px;
    font-size: 16px;
    min-height: 48px; /* Minimum touch target size */
  }

  .darkmode-toggle,
  .settings-icon-btn {
    padding: 12px;
    min-width: 48px;
    min-height: 48px;
  }

  /* File tabs improvements */
  .file-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px;
  }

  .file-tab {
    padding: 12px 16px;
    min-height: 44px;
    white-space: nowrap;
  }

  /* Add swipe area for sidebar */
  .swipe-area {
    position: fixed;
    top: 60px;
    left: 0;
    width: 20px;
    height: calc(100vh - 60px);
    z-index: 1500;
    background: transparent;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    contain: strict;
  }
}

/* Add these styles inside your <style> block */
.mobile-content-view {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  z-index: 1000;
}

.dark-mode .mobile-content-view {
  background: #242526;
  color: #e0e0e0;
}

.mobile-content-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  min-height: 56px;
}

.dark-mode .mobile-content-header {
  background: #181a1b;
  border-bottom-color: #333;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  padding: 8px 12px;
  cursor: pointer;
  color: #007BFF;
  border-radius: 4px;
  margin-right: 8px; /* Space after back button */
}

.back-btn:hover,
.back-btn:active {
  background-color: rgba(0, 123, 255, 0.1);
}

.dark-mode .back-btn {
  color: #66b3ff;
}

.dark-mode .back-btn:hover,
.dark-mode .back-btn:active {
  background-color: rgba(102, 179, 255, 0.1);
}

.mobile-content-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px; /* Add padding for text */
}

.mobile-content-actions {
  display: flex;
  gap: 8px; /* Space between action buttons */
}

.mobile-content-action-btn {
  background: none;
  border: none;
  font-size: 18px; /* Slightly larger icons */
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px; /* Minimum touch target */
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-content-action-btn:hover,
.mobile-content-action-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .mobile-content-action-btn:hover,
.dark-mode .mobile-content-action-btn:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.mobile-content-text {
  flex: 1;
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.mobile-content-wrapper {
  padding: 16px;
}

.mobile-content-wrapper pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.mobile-content-text pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.dark-mode .mobile-content-text pre {
  color: #e0e0e0;
}

.mobile-content-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.loading-spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Optional placeholder text */
.mobile-placeholder {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.dark-mode .mobile-placeholder {
  color: #999;
}

@media (max-width: 480px) {
  .view-header h1 {
    font-size: 20px;
  }
  
  .view-subtitle {
    font-size: 13px;
  }
  
  .sidebar-tabs li {
    font-size: 15px;
    padding: 14px 20px;
  }

  .file-tabs-card {
    margin: 8px;
    padding: 12px;
  }

  .file-content {
    font-size: 14px;
  }
}

/* Dark mode adjustments for mobile */
.dark-mode .mobile-navbar {
  background: #242526;
}

.dark-mode .hamburger-icon,
.dark-mode .hamburger-icon::before,
.dark-mode .hamburger-icon::after {
  background: #e0e0e0;
}

/* Add Quiz UI styles */
.quiz-btn {
  background-color: #007BFF;
  color: #fff;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.quiz-btn:hover {
  background-color: #0056b3;
}

.dark-mode .quiz-btn {
  background-color: #66b3ff;
}

.dark-mode .quiz-btn:hover {
  background-color: #4488ff;
}

/* Ensure the desktop quick actions bar sits above content and stays visible */
.desktop-quick-actions {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #fff;
  padding: 8px 0 12px 0;
  border-bottom: 1px solid #eee;
}
.dark-mode .desktop-quick-actions { background: #0f1115; border-bottom-color: #222; }

/* Make mobile header action buttons visible and clickable */
.mobile-content-header { position: sticky; top: 0; z-index: 250; background: inherit; }
.mobile-content-actions {
  display: flex;
  gap: 8px;
  z-index: 300;
}
.mobile-content-action-btn {
  position: relative;
  z-index: 300;
  pointer-events: auto;
}

/* Ensure main content does not sit above action bars */
.main-content-area { position: relative; z-index: 1; }
.desktop-file-tabs { position: relative; z-index: 1; }
.desktop-quick-actions { z-index: 1002; }
.quiz-btn { pointer-events: auto; }
</style>

<style>
/* Global dark-mode base to ensure the entire canvas switches */
body.dark-mode {
  background: #0f1113;
  color: #e0e0e0;
}

.kb-app.dark-mode {
  background: #0f1113;
  color: #e0e0e0;
}

/* Ensure links remain readable */
body.dark-mode a { color: #8ab4f8; }

/* Inputs base in dark mode if not overridden */
body.dark-mode input, body.dark-mode select, body.dark-mode textarea {
  background: #232628;
  color: #e0e0e0;
  border-color: #3a3d3f;
}
</style>
