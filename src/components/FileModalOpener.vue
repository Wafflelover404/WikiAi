<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" tabindex="0">
      <button class="modal-close-btn" @click="closeModal" aria-label="Close">×</button>
      <h3 class="modal-title">{{ filename }}</h3>
      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <div>Loading content...</div>
        </div>
        <div v-else-if="isMarkdown" class="content-body" v-html="markedContent"></div>
        <div v-else-if="isCode" class="code-content">
          <div class="code-header">
            <span class="code-language">{{ getCodeLanguage(filename) }}</span>
            <button class="copy-code-btn" @click="copyContent" title="Copy code">📋 Copy</button>
          </div>
          <pre class="code-block"><code>{{ content }}</code></pre>
        </div>
        <div v-else class="plain-text-content">
          <div class="text-header">
            <span class="text-type">Plain Text</span>
            <button class="copy-text-btn" @click="copyContent" title="Copy text">📋 Copy</button>
          </div>
          <pre class="text-block">{{ content }}</pre>
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
  name: 'FileModalOpener',
  props: {
    filename: { type: String, required: true },
    content: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  },
  emits: ['close'],
  computed: {
    isMarkdown() {
      if (!this.content || !this.filename) return false;
      const fname = this.filename.toLowerCase();
      return fname.endsWith('.md') || fname.endsWith('.markdown');
    },
    isCode() {
      if (!this.filename) return false;
      const fname = this.filename.toLowerCase();
      const codeExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css', '.xml', '.json', '.yml', '.yaml'];
      return codeExtensions.some(ext => fname.endsWith(ext));
    },
    markedContent() {
      if (!this.content) return '';
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
      return marked(this.content);
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    copyContent() {
      if (!this.content) return;
      navigator.clipboard.writeText(this.content);
    },
    getCodeLanguage(filename) {
      if (!filename) return 'Text';
      const fname = filename.toLowerCase();
      const languageMap = {
        '.js': 'JavaScript', '.ts': 'TypeScript', '.py': 'Python', '.java': 'Java', '.cpp': 'C++', '.c': 'C', '.go': 'Go', '.rs': 'Rust', '.php': 'PHP', '.rb': 'Ruby', '.swift': 'Swift', '.kt': 'Kotlin', '.html': 'HTML', '.css': 'CSS', '.xml': 'XML', '.json': 'JSON', '.yml': 'YAML', '.yaml': 'YAML'
      };
      for (const [ext, lang] of Object.entries(languageMap)) {
        if (fname.endsWith(ext)) return lang;
      }
      return 'Text';
    }
  },
  mounted() {
    this.$el.querySelector('.modal-content')?.focus();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
.modal-content {
  background: #fff;
  padding: 40px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.22);
  min-width: 340px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  outline: none;
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1);
}
.dark-mode .modal-content {
  background: #1f2122;
  color: #e0e0e0;
  box-shadow: 0 4px 32px rgba(0,0,0,0.6);
}
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 2;
  transition: color 0.2s;
}
.modal-close-btn:hover {
  color: #e53935;
}
.dark-mode .modal-close-btn {
  color: #a0a6ac;
}
.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #1976d2;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #6C757D;
  text-align: center;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.content-body {
  line-height: 1.6;
  color: #333;
  font-size: 16px;
}
.dark-mode .content-body { color: #e0e0e0; }
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
.dark-mode .code-language { color: #c0c4c8; }
.copy-code-btn {
  background: #1976d2;
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
  background: #1565c0;
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
.dark-mode .text-type { color: #c0c4c8; }
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
</style>
