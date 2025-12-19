<template>
  <div class="modal-overlay fullscreen" @click.self="closeModal">
    <div class="modal-content fullscreen-modal" tabindex="0" @keydown.esc="closeModal">
      <button class="modal-close-btn" @click="closeModal" aria-label="Close">×</button>
      <h2><SvgIcons icon="user" /> Edit User</h2>
      <form @submit.prevent="saveEditUser" class="user-form">
        <div class="user-fields">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon"><SvgIcons icon="person" /></span>
              <span class="label-text">Username</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">@</span>
              <input 
                v-model="editUserData.new_username" 
                placeholder="Enter new username" 
                class="enhanced-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon"><SvgIcons icon="lock" /></span>
              <span class="label-text">Password</span>
              <span class="label-hint">(leave blank to keep current)</span>
            </label>
            <div class="input-wrapper password-wrapper">
              <span class="input-icon"><SvgIcons icon="key" /></span>
              <input
                v-model="editUserData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter new password"
                class="enhanced-input"
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="showPassword = !showPassword" 
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <span v-if="showPassword"><SvgIcons icon="eye" /></span>
                <span v-else><SvgIcons icon="eye-closed" /></span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon"><SvgIcons icon="lightning" /></span>
              <span class="label-text">Role</span>
            </label>
            <div class="select-wrapper">
              <span class="input-icon"><SvgIcons icon="role" /></span>
              <select v-model="editUserData.role" class="enhanced-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon"><SvgIcons icon="lock" /></span>
              <span class="label-text">File Permissions</span>
            </label>
          </div>

          <!-- Current Permissions Preview -->
          <div class="current-permissions-panel">
            <div class="panel-header">
              <span class="panel-icon"><SvgIcons icon="document" /></span>
              <strong>Current Access</strong>
              <span class="access-badge" :class="getAccessBadgeClass()">
                {{ getAccessBadgeText() }}
              </span>
            </div>
            <div class="panel-content">
              <div v-if="originalAllowedFiles.includes('all')" class="access-info full-access">
                <div class="access-icon"><SvgIcons icon="world" /></div>
                <div class="access-details">
                  <div class="access-title">Full Access Granted</div>
                  <div class="access-description">This user can access all files, including future uploads</div>
                </div>
              </div>
              <div v-else-if="originalAllowedFiles.length > 0" class="access-info partial-access">
                <div class="access-icon"><SvgIcons icon="folder" /></div>
                <div class="access-details">
                  <div class="access-title">{{ originalAllowedFiles.length }} {{ originalAllowedFiles.length === 1 ? 'File' : 'Files' }} Accessible</div>
                  <div class="access-file-list">
                    <div v-for="filename in originalAllowedFiles.slice(0, 5)" :key="filename" class="access-file-item">
                      <span class="file-icon-small"><SvgIcons :icon="getFileIcon(file)" /></span>
                      <span class="file-name-small">{{ getOriginalFilename(filename) }}</span>
                    </div>
                    <div v-if="originalAllowedFiles.length > 5" class="more-files">
                      +{{ originalAllowedFiles.length - 5 }} more files
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="access-info no-access">
                <div class="access-icon"><SvgIcons icon="blocked" /></div>
                <div class="access-details">
                  <div class="access-title">No Access</div>
                  <div class="access-description">This user cannot access any files</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Permission Summary -->
          <div class="permission-summary">
            <div class="summary-item">
              <span class="summary-icon"><SvgIcons icon="folder" /></span>
              <span class="summary-text">
                <strong>{{ selectedFilesCount }}</strong> of <strong>{{ files.length }}</strong> files accessible
              </span>
            </div>
            <div v-if="hasChanges" class="summary-badge changed">
              <span class="badge-icon"><SvgIcons icon="danger" /></span>
              Unsaved changes
            </div>
          </div>

          <!-- File Selection Controls -->
          <div class="file-selection-controls">
            <div class="search-box">
              <span class="search-icon"><SvgIcons icon="search" /></span>
              <input 
                v-model="fileSearch" 
                type="text"
                placeholder="Search files..." 
                class="file-search-input"
              />
              <span v-if="fileSearch" class="clear-search" @click="fileSearch = ''" title="Clear search">×</span>
            </div>
            <div class="bulk-actions">
              <button type="button" class="bulk-btn" @click="selectAllFiles" :disabled="allFilesSelected">
                <span class="btn-icon">✓</span> Select All
              </button>
              <button type="button" class="bulk-btn" @click="deselectAllFiles" :disabled="selectedFilesCount === 0">
                <span class="btn-icon">✗</span> Clear
              </button>
            </div>
          </div>

          <!-- All Files Option -->
          <div class="all-files-option">
            <label class="file-checkbox-label special">
              <input 
                type="checkbox" 
                value="all" 
                v-model="editUserData.allowed_files" 
                @change="onAllowedFilesChange('all')" 
              />
              <span class="checkbox-text">
                <strong>Grant Access to All Files</strong>
                <span class="checkbox-hint">Including future uploads</span>
              </span>
            </label>
          </div>

          <!-- Individual Files List -->
          <div class="allowed-files-checkboxes" :class="{ disabled: editUserData.allowed_files.includes('all') }">
            <div v-if="filteredFiles.length === 0" class="no-files-message">
              <span class="empty-icon">📂</span>
              <p v-if="fileSearch">No files match "{{ fileSearch }}"</p>
              <p v-else>No files available</p>
            </div>
            <label 
              v-for="file in filteredFiles" 
              :key="file.filename" 
              class="file-checkbox-label"
              :class="{ selected: editUserData.allowed_files.includes(file.filename) }"
            >
              <input 
                type="checkbox" 
                :value="file.filename" 
                v-model="editUserData.allowed_files" 
                @change="onAllowedFilesChange(file.filename)" 
                :disabled="editUserData.allowed_files.includes('all')" 
              />
              <span class="file-info">
                <span class="file-icon"><SvgIcons :icon="getFileIcon(file)" /></span>
                <span class="file-name">{{ file.original_filename || file.filename }}</span>
                <span v-if="file.size" class="file-size">{{ formatFileSize(file.size) }}</span>
              </span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="modal-save-btn" :disabled="saving" :class="{ saving }">
            <span v-if="saving" class="btn-spinner">⏳</span>
            <span v-else class="btn-icon">💾</span>
            <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
          </button>
          <button type="button" class="modal-cancel-btn" @click="closeModal" :disabled="saving">Cancel</button>
        </div>
      </form>
      <div v-if="editUserMsg" class="status-message" :class="messageType">
        <span class="status-icon">{{ getMessageIcon() }}</span>
        <span>{{ editUserMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import SvgIcons from './SvgIcons.vue';

export default {
  name: 'UserEditModal',
  components: {
    SvgIcons
  },
  props: {
    editUserData: { type: Object, required: true },
    editUserMsg: { type: String, default: '' },
    files: { type: Array, required: true }
  },
  emits: ['save', 'close'],
  data() {
    return {
      showPassword: false,
      fileSearch: '',
      originalAllowedFiles: [],
      saving: false,
      messageType: 'info'
    };
  },
  computed: {
    filteredFiles() {
      if (!this.fileSearch) return this.files;
      const search = this.fileSearch.toLowerCase();
      return this.files.filter(file => {
        const filename = (file.original_filename || file.filename || '').toLowerCase();
        return filename.includes(search);
      });
    },
    selectedFilesCount() {
      if (this.editUserData.allowed_files.includes('all')) {
        return this.files.length;
      }
      return this.editUserData.allowed_files.filter(f => f !== 'all').length;
    },
    hasChanges() {
      const current = [...this.editUserData.allowed_files].sort();
      const original = [...this.originalAllowedFiles].sort();
      return JSON.stringify(current) !== JSON.stringify(original);
    },
    allFilesSelected() {
      if (this.editUserData.allowed_files.includes('all')) return true;
      return this.filteredFiles.every(file => 
        this.editUserData.allowed_files.includes(file.filename)
      );
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
        mangle: false
      });
      return marked(text);
    },
    async saveEditUser() {
      // Ensure exclusivity: if 'all' is selected, only send ['all']
      if (this.editUserData.allowed_files.includes('all')) {
        this.editUserData.allowed_files = ['all'];
      } else {
        // Remove any accidental 'all'
        this.editUserData.allowed_files = this.editUserData.allowed_files.filter(f => f !== 'all');
      }
      
      this.saving = true;
      this.messageType = 'info';
      
      try {
        // Emit save event and let parent handle it
        this.$emit('save');
      } catch (error) {
        console.error('Error saving user:', error);
        this.messageType = 'error';
      }
    },
    closeModal() {
      this.$emit('close');
    },
    onAllowedFilesChange(changedValue) {
      if (changedValue === 'all') {
        if (this.editUserData.allowed_files.includes('all')) {
          // Uncheck all other files
          this.editUserData.allowed_files = ['all'];
        }
      } else {
        // If any file is checked, uncheck 'all'
        this.editUserData.allowed_files = this.editUserData.allowed_files.filter(f => f !== 'all');
      }
    },
    selectAllFiles() {
      // Remove 'all' and add all individual files
      this.editUserData.allowed_files = this.files.map(f => f.filename);
    },
    deselectAllFiles() {
      this.editUserData.allowed_files = [];
    },
    getFileIcon(file) {
      const filename = file.original_filename || file.filename || '';
      if (filename.endsWith('.pdf')) return 'document';
      if (filename.endsWith('.doc') || filename.endsWith('.docx')) return 'document-text';
      if (filename.endsWith('.txt') || filename.endsWith('.md')) return 'document';
      if (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.gif')) return 'inbox';
      if (filename.endsWith('.zip') || filename.endsWith('.rar')) return 'package';
      if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) return 'chart';
      return 'folder';
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    getAccessBadgeClass() {
      if (this.originalAllowedFiles.includes('all')) {
        return 'full';
      } else if (this.originalAllowedFiles.length > 0) {
        return 'partial';
      }
      return 'none';
    },
    getAccessBadgeText() {
      if (this.originalAllowedFiles.includes('all')) {
        return 'Full Access';
      } else if (this.originalAllowedFiles.length > 0) {
        return `${this.originalAllowedFiles.length} Files`;
      }
      return 'No Access';
    },
    getOriginalFilename(filename) {
      const file = this.files.find(f => f.filename === filename);
      return file && file.original_filename ? file.original_filename : filename;
    },
    getMessageIcon() {
      switch (this.messageType) {
        case 'success': return 'checkmark';
        case 'error': return 'close';
        case 'warning': return 'danger';
        default: return 'info';
      }
    },
    setSaving(value) {
      this.saving = value;
    },
    setMessageType(type) {
      this.messageType = type;
    }
  },
  mounted() {
    // Focus modal for ESC key
    this.$el.querySelector('.modal-content')?.focus();
    // Store original allowed files for change detection
    this.originalAllowedFiles = [...this.editUserData.allowed_files];
    // Debug: log files prop
    console.log('DEBUG: UserEditModal files prop', this.files);
    // Debug: log allowed_files
    console.log('DEBUG: UserEditModal allowed_files', this.editUserData.allowed_files);
  }
};
</script>

<style scoped>
.modal-overlay.fullscreen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
.fullscreen-modal {
  background: #fff;
  padding: 48px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.22);
  min-width: 340px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  outline: none;
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1);
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
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.modal-save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(33,150,243,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.modal-save-btn:hover {
  background: #1565c0;
  box-shadow: 0 2px 8px rgba(33,150,243,0.13);
}

.view-password-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  margin-left: 6px;
  color: #1976d2;
  padding: 0 4px;
  transition: color 0.2s;
}
.view-password-btn:hover {
  color: #1565c0;
}
.password-field {
  display: flex;
  align-items: center;
}
.modal-cancel-btn {
  background: #fff;
  color: #e53935;
  border: 1.5px solid #e53935;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  background: #e53935;
  color: #fff;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPop {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>

<style scoped>
.user-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 10px;
}
.user-fields label {
  margin-bottom: 2px;
  font-weight: 500;
}
.user-fields input,
.user-fields select {
  padding: 7px 10px;
  border: 1px solid #cfd8dc;
  border-radius: 5px;
  font-size: 1rem;
  margin-bottom: 2px;
}

/* Allowed files checkboxes styles */
.allowed-files-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.file-checkbox-label {
  display: flex;
  align-items: center;
  font-size: 1rem;
  cursor: pointer;
  gap: 8px;
  margin-bottom: 2px;
}
.file-checkbox-label input[type="checkbox"] {
  accent-color: #1976d2;
  width: 18px;
  height: 18px;
  margin-right: 6px;
  cursor: pointer;
}

/* Permission Summary */
.permission-summary {
  background: #f0f7ff;
  border: 1px solid #bdd7f5;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-icon {
  font-size: 1.3rem;
}

.summary-text {
  font-size: 0.95rem;
  color: #2c5282;
}

.summary-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-badge.changed {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.badge-icon {
  font-size: 0.9rem;
}

/* File Selection Controls */
.file-selection-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 1rem;
  color: #718096;
  pointer-events: none;
}

.file-search-input {
  width: 100%;
  padding: 8px 36px 8px 36px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.file-search-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}

.clear-search:hover {
  color: #e53935;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.bulk-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #1976d2;
  color: #1976d2;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 0.9rem;
}

/* All Files Option */
.all-files-option {
  background: #fff8e1;
  border: 2px solid #ffd54f;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.file-checkbox-label.special {
  margin: 0;
  font-weight: 500;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkbox-hint {
  font-size: 0.85rem;
  font-weight: 400;
  color: #666;
}

/* Files List */
.allowed-files-checkboxes {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  background: #fafafa;
}

.allowed-files-checkboxes.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.file-checkbox-label {
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.file-checkbox-label:hover {
  background: #f0f4f8;
}

.file-checkbox-label.selected {
  background: #e3f2fd;
  border-color: #90caf9;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 0.95rem;
  word-break: break-word;
}

.file-size {
  font-size: 0.85rem;
  color: #718096;
  margin-left: auto;
  flex-shrink: 0;
}

.no-files-message {
  text-align: center;
  padding: 32px 16px;
  color: #718096;
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 8px;
}

.no-files-message p {
  margin: 4px 0;
  font-size: 0.95rem;
}

/* Enhanced Form Inputs for Modal */
.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #2d3748;
}

.label-icon {
  font-size: 1.1rem;
}

.label-text {
  color: #2d3748;
}

.label-hint {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 400;
  margin-left: auto;
  font-style: italic;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 1rem;
  color: #718096;
  pointer-events: none;
  z-index: 1;
  transition: color 0.2s;
}

.enhanced-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d3748;
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.enhanced-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.enhanced-input:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.enhanced-input:focus {
  outline: none;
  border-color: #1976d2;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(25, 118, 210, 0.15);
}

.input-wrapper:focus-within .input-icon {
  color: #1976d2;
}

/* Password Input Specific */
.password-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #718096;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  z-index: 2;
}

.password-toggle-btn:hover {
  color: #1976d2;
  background: rgba(25, 118, 210, 0.08);
}

.password-toggle-btn:active {
  transform: scale(0.95);
}

/* Enhanced Select Dropdown */
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.enhanced-select {
  width: 100%;
  padding: 12px 44px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d3748;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.enhanced-select:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.enhanced-select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(25, 118, 210, 0.15);
}

.select-wrapper:focus-within .input-icon {
  color: #1976d2;
}

.enhanced-select:focus + .select-arrow {
  color: #1976d2;
}

.select-arrow {
  position: absolute;
  right: 14px;
  font-size: 0.7rem;
  color: #718096;
  pointer-events: none;
  transition: color 0.2s;
}

/* Animation for form groups in modal */
.form-group {
  animation: fadeInUp 0.4s ease backwards;
}

.form-group:nth-child(1) { animation-delay: 0.05s; }
.form-group:nth-child(2) { animation-delay: 0.1s; }
.form-group:nth-child(3) { animation-delay: 0.15s; }
.form-group:nth-child(4) { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Current Permissions Preview Panel */
.current-permissions-panel {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 2px solid #dee2e6;
  font-size: 0.95rem;
  color: #2d3748;
}

.panel-icon {
  font-size: 1.3rem;
}

.panel-header strong {
  flex: 1;
  font-weight: 600;
}

.access-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.access-badge.full {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.access-badge.partial {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
}

.access-badge.none {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
}

.panel-content {
  padding: 16px 18px;
}

.access-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.access-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}

.access-details {
  flex: 1;
}

.access-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 6px;
}

.access-description {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
}

.access-file-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.access-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.2s;
}

.access-file-item:hover {
  background: #f8f9fa;
  border-color: #cbd5e0;
  transform: translateX(4px);
}

.file-icon-small {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.file-name-small {
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 500;
  word-break: break-word;
}

.more-files {
  padding: 8px 12px;
  background: #e9ecef;
  border: 1px dashed #adb5bd;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
}

/* Different backgrounds for access types */
.access-info.full-access {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #81c784;
}

.access-info.partial-access {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #64b5f6;
}

.access-info.no-access {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #e57373;
}

/* Dark mode for permissions panel */
.dark-mode .current-permissions-panel {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-color: #4a5568;
}

.dark-mode .panel-header {
  background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
  border-bottom-color: #4a5568;
  color: #e2e8f0;
}

.dark-mode .access-title {
  color: #e2e8f0;
}

.dark-mode .access-description {
  color: #a0aec0;
}

.dark-mode .access-file-item {
  background: #2d3748;
  border-color: #4a5568;
}

.dark-mode .access-file-item:hover {
  background: #374151;
  border-color: #718096;
}

.dark-mode .file-name-small {
  color: #e2e8f0;
}

.dark-mode .more-files {
  background: #374151;
  border-color: #4a5568;
  color: #a0aec0;
}

.dark-mode .access-info.full-access {
  background: linear-gradient(135deg, #1e4620 0%, #2d5a2f 100%);
  border-color: #4caf50;
}

.dark-mode .access-info.partial-access {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
  border-color: #2196f3;
}

.dark-mode .access-info.no-access {
  background: linear-gradient(135deg, #4a1f1f 0%, #5a2d2d 100%);
  border-color: #f44336;
}

/* Status Message Styles */
.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 10px;
  margin-top: 16px;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 2px solid #81c784;
}

.status-message.error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border: 2px solid #e57373;
}

.status-message.warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  border: 2px solid #ffb74d;
}

.status-message.info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border: 2px solid #64b5f6;
}

.status-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

/* Save Button States */
.modal-save-btn {
  position: relative;
  overflow: hidden;
}

.modal-save-btn.saving {
  background: linear-gradient(135deg, #90caf9 0%, #64b5f6 100%);
  cursor: wait;
}

.modal-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.1rem;
}

/* Dark mode for status messages */
.dark-mode .status-message.success {
  background: linear-gradient(135deg, #1e4620 0%, #2d5a2f 100%);
  color: #81c784;
  border-color: #4caf50;
}

.dark-mode .status-message.error {
  background: linear-gradient(135deg, #4a1f1f 0%, #5a2d2d 100%);
  color: #e57373;
  border-color: #f44336;
}

.dark-mode .status-message.warning {
  background: linear-gradient(135deg, #4a3520 0%, #5a4530 100%);
  color: #ffb74d;
  border-color: #ff9800;
}

.dark-mode .status-message.info {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
  color: #64b5f6;
  border-color: #2196f3;
}

/* Additional dark theme styles for modal components */
.dark-mode .modal-overlay.fullscreen {
  background: rgba(0, 0, 0, 0.7);
}

.dark-mode .fullscreen-modal {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.dark-mode .modal-close-btn {
  color: var(--color-text-tertiary);
}

.dark-mode .modal-close-btn:hover {
  color: var(--color-error);
}

.dark-mode .modal-save-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Update existing dark mode styles to use CSS variables */
.dark-mode .current-permissions-panel {
  background: var(--color-surface-variant);
  border-color: var(--color-border-primary);
}

.dark-mode .panel-header {
  background: var(--color-bg-tertiary);
  border-bottom-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.dark-mode .access-title {
  color: var(--color-text-primary);
}

.dark-mode .access-description {
  color: var(--color-text-secondary);
}

.dark-mode .access-file-item {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}

.dark-mode .access-file-item:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-secondary);
}

.dark-mode .file-name-small {
  color: var(--color-text-primary);
}

.dark-mode .more-files {
  background: var(--color-bg-hover);
  border-color: var(--color-border-primary);
  color: var(--color-text-secondary);
}

.dark-mode .access-info.full-access {
  background: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.dark-mode .access-info.partial-access {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.dark-mode .access-info.no-access {
  background: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error);
}

.dark-mode .status-message.success {
  background: var(--color-success-light);
  color: var(--color-success);
  border-color: var(--color-success);
}

.dark-mode .status-message.error {
  background: var(--color-error-light);
  color: var(--color-error);
  border-color: var(--color-error);
}

.dark-mode .status-message.warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.dark-mode .status-message.info {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
