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
  background: var(--color-surface);
  padding: 40px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: var(--color-shadow-dark);
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
  background: var(--color-surface);
  color: var(--color-text-primary);
  box-shadow: var(--color-shadow-dark);
}
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  z-index: 2;
  transition: color 0.2s;
}
.modal-close-btn:hover {
  color: var(--color-error);
}
.dark-mode .modal-close-btn {
  color: var(--color-text-tertiary);
}
.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: var(--color-primary);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-text-secondary);
  text-align: center;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-bg-secondary);
  border-top: 3px solid var(--color-primary);
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
  color: var(--color-text-primary);
  font-size: 16px;
}
.dark-mode .content-body { color: var(--color-text-primary); }
.code-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  overflow: hidden;
}
.dark-mode .code-content {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}
.dark-mode .code-header {
  background: var(--color-bg-tertiary);
  border-bottom-color: var(--color-border-primary);
}
.code-language {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dark-mode .code-language { color: var(--color-text-secondary); }
.copy-code-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.copy-code-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}
.code-block {
  margin: 0;
  padding: 20px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}
.plain-text-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  overflow: hidden;
}
.dark-mode .plain-text-content {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}
.text-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}
.dark-mode .text-header {
  background: var(--color-bg-tertiary);
  border-bottom-color: var(--color-border-primary);
}
.text-type {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.dark-mode .text-type { color: var(--color-text-secondary); }
.copy-text-btn {
  background: var(--color-success);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.copy-text-btn:hover {
  background: var(--color-success-dark);
  transform: translateY(-1px);
}
.text-block {
  margin: 0;
  padding: 20px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.dark-mode .text-block {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
</style>
