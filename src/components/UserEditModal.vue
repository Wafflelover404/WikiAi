<template>
  <div class="modal-overlay fullscreen" @click.self="closeModal">
    <div class="modal-content fullscreen-modal" tabindex="0" @keydown.esc="closeModal">
      <button class="modal-close-btn" @click="closeModal" aria-label="Close">×</button>
      <h2>Edit User</h2>
      <form @submit.prevent="saveEditUser" class="user-form">
        <div class="user-fields">
          <label>Username</label>
          <input v-model="editUserData.new_username" placeholder="New Username" />
          <label>Password</label>
          <div class="password-field">
            <input
              v-model="editUserData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="New Password (leave blank to keep)"
            />
            <button type="button" class="view-password-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>
          <label>Role</label>
          <select v-model="editUserData.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label>Allowed Files:</label>
          <div class="allowed-files-checkboxes">
            <label class="file-checkbox-label">
              <input type="checkbox" value="all" v-model="editUserData.allowed_files" @change="onAllowedFilesChange('all')" />
              All Files
            </label>
            <label v-for="file in files" :key="file.filename" class="file-checkbox-label">
              <input type="checkbox" :value="file.filename" v-model="editUserData.allowed_files" @change="onAllowedFilesChange(file.filename)" :disabled="editUserData.allowed_files.includes('all')" />
              {{ file.filename }}
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="modal-save-btn">💾 Save</button>
          <button type="button" class="modal-cancel-btn" @click="closeModal">Cancel</button>
        </div>
      </form>
      <div v-if="editUserMsg" class="msg">{{ editUserMsg }}</div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  name: 'UserEditModal',
  props: {
    editUserData: { type: Object, required: true },
    editUserMsg: { type: String, default: '' },
    files: { type: Array, required: true }
  },
  emits: ['save', 'close'],
  data() {
    return {
      showPassword: false
    };
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
    saveEditUser() {
      // Ensure exclusivity: if 'all' is selected, only send ['all']
      if (this.editUserData.allowed_files.includes('all')) {
        this.editUserData.allowed_files = ['all'];
      } else {
        // Remove any accidental 'all'
        this.editUserData.allowed_files = this.editUserData.allowed_files.filter(f => f !== 'all');
      }
      this.$emit('save');
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
    }
  },
  mounted() {
    // Focus modal for ESC key
    this.$el.querySelector('.modal-content')?.focus();
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
}
</style>
