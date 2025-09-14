<template>
  <div class="file-tabs">
    <!-- File List View -->
    <div v-if="!activeTab" class="file-list-view">
      <div class="file-list-header">
        <h3>📁 Files</h3>
        <div class="file-count">{{ fileList.length }} files</div>
      </div>
      <div class="file-list-cards">
        <div v-for="file in fileList" :key="file.name" class="file-card" @click="openFile(file.name)">
          <div class="file-icon">{{ getFileIcon(file.name) }}</div>
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div v-if="file.description" class="file-description" :title="file.description">
              {{ file.description.length > 60 ? file.description.substring(0, 60) + '...' : file.description }}
            </div>
            <div class="file-meta">
              <span class="file-size">{{ formatSize(file.size) }}</span>
              <span class="file-date">{{ formatDate(file.modified) }}</span>
              <span class="file-type">{{ file.type }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button class="action-btn" @click.stop="downloadFile(file.name)" title="Download">
              ⬇️
            </button>
            <button class="action-btn" @click.stop="openFile(file.name)" title="Open">
              👁️
            </button>
          </div>
        </div>
        <div v-if="fileList.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">No files available</div>
          <div class="empty-subtext">Files you have access to will appear here</div>
        </div>
      </div>
    </div>
    
    <!-- File Content View -->
    <div v-else class="file-content-view">
      <div class="content-header">
        <button class="back-to-list-btn" @click="closeFile" aria-label="Back to file list">
          ← Back to files
        </button>
        <div class="content-title-section">
          <h4 class="file-content-title">{{ activeTab }}</h4>
          <div class="content-actions">
            <button class="action-btn" @click="$emit('open-quiz', activeTab)" title="Open Quiz" aria-label="Open Quiz">
              🧠
            </button>
            <button class="action-btn" @click="copyContent" title="Copy content">
              📋
            </button>
            <button class="action-btn" @click="printContent" title="Print">
              🖨️
            </button>
            <button class="action-btn" @click="downloadFile(activeTab)" title="Download">
              ⬇️
            </button>
          </div>
        </div>
      </div>
      <div class="content-scroll">
        <div class="content-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <div>Loading content...</div>
          </div>
          <div v-else-if="currentContent" class="content-body">
            <div v-if="isMarkdown" v-html="markedContent"></div>
            <div v-else-if="isCode" class="code-content">
              <div class="code-header">
                <span class="code-language">{{ getCodeLanguage() }}</span>
                <button class="copy-code-btn" @click="copyCode" title="Copy code">
                  📋 Copy
                </button>
              </div>
              <pre class="code-block"><code>{{ currentContent }}</code></pre>
            </div>
            <div v-else class="plain-text-content">
              <div class="text-header">
                <span class="text-type">Plain Text</span>
                <button class="copy-text-btn" @click="copyContent" title="Copy text">
                  📋 Copy
                </button>
              </div>
              <pre class="text-block">{{ currentContent }}</pre>
            </div>
          </div>
          <div v-else class="error-state">
            <div class="error-icon">⚠️</div>
            <div>Failed to load file content</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default {
  name: 'FileTabs',
  props: {
    openedFiles: {
      type: Array,
      default: () => []
    },
    fileContents: {
      type: Object,
      default: () => ({})
    },
    activeTab: {
      type: String,
      default: null
    },
    files: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    fileList() {
      // Use real file metadata from the backend
      return this.files.map(file => ({
        name: file.filename || file.original_filename,
        size: file.size || 0,
        modified: file.upload_date || file.created_at || new Date(),
        type: file.file_type || this.getFileType(file.filename || file.original_filename),
        description: file.description || '',
        file_id: file.file_id
      }));
    },
    currentContent() {
      return this.activeTab ? this.fileContents[this.activeTab] : null;
    },
    markedContent() {
      if (!this.currentContent) return '';
      // Configure marked for better rendering and code highlighting
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
      return marked(this.currentContent);
    },
    isMarkdown() {
      if (!this.currentContent || !this.activeTab) return false;
      const filename = this.activeTab.toLowerCase();
      // Only treat .md/.markdown files as markdown
      return filename.endsWith('.md') || filename.endsWith('.markdown');
    },
    
    isCode() {
      if (!this.activeTab) return false;
      const filename = this.activeTab.toLowerCase();
      const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css', '.xml', '.json', '.yml', '.yaml'];
      return codeExtensions.some(ext => filename.endsWith(ext));
    }
  },
  methods: {
    getMarkedContent(text) {
      if (!text) return '';
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
      return marked(text);
    },
    openFile(fileName) {
      this.$emit('switch-tab', fileName);
    },
    closeFile() {
      this.$emit('close-file', this.activeTab);
    },
    getFileIcon(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
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
        'c': '⚙️',
        'go': '🔷',
        'rust': '🦀',
        'php': '🐘',
        'rb': '💎',
        'swift': '🕊️',
        'kt': '🟣',
        'xml': '📰',
        'yml': '⚙️',
        'yaml': '⚙️'
      };
      return iconMap[extension] || '📄';
    },
    getFileType(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      return extension.toUpperCase();
    },
    formatSize(size) {
      if (!size || isNaN(size)) return '-';
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays} days ago`;
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
    async copyContent() {
      if (!this.currentContent) return;
      
      try {
        await navigator.clipboard.writeText(this.currentContent);
        // You might want to show a toast notification here
        console.log('Content copied to clipboard');
      } catch (err) {
        console.error('Failed to copy content:', err);
      }
    },
    printContent() {
      if (!this.currentContent) return;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${this.activeTab}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              pre { white-space: pre-wrap; word-break: break-word; }
              h1, h2, h3, h4, h5, h6 { color: #333; }
              code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>${this.activeTab}</h1>
            <hr>
            ${this.markedContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    },
    downloadFile(fileName) {
      // Emit event to parent to handle file download
      this.$emit('download-file', fileName);
    },
    
    getCodeLanguage() {
      if (!this.activeTab) return 'Text';
      const filename = this.activeTab.toLowerCase();
      const languageMap = {
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
        '.go': 'Go',
        '.rs': 'Rust',
        '.php': 'PHP',
        '.rb': 'Ruby',
        '.swift': 'Swift',
        '.kt': 'Kotlin',
        '.html': 'HTML',
        '.css': 'CSS',
        '.xml': 'XML',
        '.json': 'JSON',
        '.yml': 'YAML',
        '.yaml': 'YAML'
      };
      
      for (const [ext, lang] of Object.entries(languageMap)) {
        if (filename.endsWith(ext)) return lang;
      }
      return 'Text';
    },
    
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.currentContent);
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.background = '#28a745';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  }
}
</script>

<style scoped>
/* File list view */
.file-list-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(33, 150, 243, 0.08);
  overflow: hidden;
}
.dark-mode .file-list-view {
  background: #1f2122;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
.dark-mode .file-list-header {
  border-bottom-color: #333;
  background: linear-gradient(135deg, #181a1b 0%, #1f2122 100%);
}

.file-list-header h3 {
  font-size: 22px;
  font-weight: 600;
  color: #007BFF;
  margin: 0;
}

.file-count {
  font-size: 14px;
  color: #6C757D;
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
}
.dark-mode .file-count {
  color: #a0a6ac;
  background: rgba(255,255,255,0.08);
}

.file-list-cards {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-card {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.dark-mode .file-card {
  background: #1f2122;
  border-color: #33393d;
}

.file-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #007BFF;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.file-card:hover::before {
  transform: scaleY(1);
}

.file-card:hover {
  background: #f8f9fa;
  border-color: #007BFF;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
}
.dark-mode .file-card:hover {
  background: #242628;
  border-color: #66b3ff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.file-icon {
  font-size: 28px;
  margin-right: 16px;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

  .file-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dark-mode .file-name {
    color: #e0e0e0;
  }
  
  .file-description {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 8px;
    line-height: 1.4;
    word-break: break-word;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dark-mode .file-description {
    color: #a0a6ac;
  }

.file-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6C757D;
}
.dark-mode .file-meta {
  color: #a0a6ac;
}

.file-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.action-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-mode .action-btn {
  background: #2a2d2f;
  border-color: #3a3d3f;
  color: #e0e0e0;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #6c757d;
  transform: scale(1.1);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6C757D;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #495057;
}

.empty-subtext {
  font-size: 14px;
  color: #6C757D;
}

/* File content view */
.file-content-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(33, 150, 243, 0.08);
  overflow: hidden;
}
.dark-mode .file-content-view {
  background: #1f2122;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.content-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
.dark-mode .content-header {
  border-bottom-color: #333;
  background: linear-gradient(135deg, #181a1b 0%, #1f2122 100%);
}

.back-to-list-btn {
  background: #fff;
  color: #007BFF;
  border: 1.5px solid #007BFF;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-to-list-btn:hover {
  background: #007BFF;
  color: #fff;
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.content-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-content-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dark-mode .file-content-title {
  color: #e0e0e0;
}

.content-actions {
  display: flex;
  gap: 8px;
}

.content-scroll {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #fafbfc;
}
.dark-mode .content-container {
  background: #181a1b;
}

.content-body {
  line-height: 1.6;
  color: #333;
  font-size: 16px;
}
.dark-mode .content-body {
  color: #e0e0e0;
}

/* Markdown content styling */
.content-body :deep(h1), 
.content-body :deep(h2), 
.content-body :deep(h3), 
.content-body :deep(h4), 
.content-body :deep(h5), 
.content-body :deep(h6) {
  color: #2c3e50;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.content-body :deep(h1) { font-size: 28px; }
.content-body :deep(h2) { font-size: 24px; }
.content-body :deep(h3) { font-size: 20px; }

.content-body :deep(p) {
  margin-bottom: 16px;
}

.content-body :deep(code) {
  background: #f8f9fa;
  color: #e83e8c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}
.dark-mode .content-body :deep(code) {
  background: #2a2d2f;
  color: #ff79c6;
}

.content-body :deep(pre) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}
.dark-mode .content-body :deep(pre) {
  background: #2a2d2f;
  border-color: #3a3d3f;
}

.content-body :deep(pre code) {
  background: #f8f9fa;
  color: #24292f;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  border-radius: 8px;
  padding: 0;
  overflow-x: auto;
}

.content-body :deep(blockquote) {
  border-left: 4px solid #007BFF;
  background: #f8f9fa;
  margin: 16px 0;
  padding: 12px 20px;
  color: #495057;
  font-style: italic;
}

.content-body :deep(ul), .content-body :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content-body :deep(li) {
  margin-bottom: 4px;
}

.plain-text {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #495057;
  margin: 0;
}

/* Code content styling */
.code-content {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}
.dark-mode .code-content {
  background: #1f2122;
  border-color: #33393d;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}
.dark-mode .code-header {
  background: #181a1b;
  border-bottom-color: #333;
}

.code-language {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dark-mode .code-language {
  color: #c0c4c8;
}

.copy-code-btn {
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-code-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.code-block {
  margin: 0;
  padding: 20px;
  background: #2d3748;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

/* Plain text content styling */
.plain-text-content {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}
.dark-mode .plain-text-content {
  background: #1f2122;
  border-color: #33393d;
}

.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}
.dark-mode .text-header {
  background: #181a1b;
  border-bottom-color: #333;
}

.text-type {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dark-mode .text-type {
  color: #c0c4c8;
}

.copy-text-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-text-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.text-block {
  margin: 0;
  padding: 20px;
  background: #f8f9fa;
  color: #495057;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.dark-mode .text-block {
  background: #2a2d2f;
  color: #e0e0e0;
}

/* Loading and error states */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6C757D;
  text-align: center;
}
.dark-mode .loading-state, .dark-mode .error-state {
  color: #a0a6ac;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .file-list-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .file-card {
    padding: 12px 16px;
  }
  
  .file-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .content-header {
    padding: 16px 20px;
  }
  
  .content-title-section {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .content-container {
    padding: 16px;
  }
  
  .code-header,
  .text-header {
    padding: 10px 12px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .code-block,
  .text-block {
    padding: 16px;
    font-size: 13px;
  }
  
  .file-description {
    display: none;
  }
  
  .file-actions {
    opacity: 1;
  }
}
</style>
