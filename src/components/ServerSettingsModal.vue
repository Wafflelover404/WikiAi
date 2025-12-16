<template>
  <transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="closeModal" @keydown.esc="closeModal" tabindex="-1">
      <div class="server-settings-modal" :class="{ 'dark-mode': isDark }" role="dialog" aria-modal="true" aria-labelledby="server-settings-title">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="server-settings-title">Server Settings</h2>
            <button class="modal-close-btn" @click="closeModal" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="serverUrl">Server URL</label>
              <div class="server-input-wrapper" ref="serverSelector">
                <input 
                  id="serverUrl" 
                  v-model="serverUrl" 
                  type="text" 
                  :placeholder="$t?.login?.apiUrlPlaceholder || 'Enter server URL'" 
                  required 
                  @keyup.enter="saveSettings"
                />
                <button
                  type="button"
                  class="server-dropdown-toggle"
                  @click.stop="toggleServerDropdown"
                  :aria-expanded="serverDropdownOpen"
                  aria-haspopup="listbox"
                  :disabled="!serverOptions.length"
                  :title="serverOptions.length ? ($t?.login?.selectServer || 'Select server') : ($t?.login?.noSavedServers || 'No saved servers')"
                >
                  <SvgIcons :icon="serverDropdownOpen ? 'chevron-up' : 'chevron-down'" />
                </button>
                <ul 
                  v-if="serverDropdownOpen && serverOptions.length" 
                  class="server-options" 
                  role="listbox"
                  @click.stop
                >
                  <li v-for="option in serverOptions" :key="option">
                    <button 
                      type="button" 
                      @click="selectServerOption(option)"
                      :class="{ active: serverUrl === option }"
                    >
                      {{ option }}
                    </button>
                  </li>
                </ul>
              </div>
              <small v-if="showProxyWarning" class="proxy-warning">
                {{ $t?.login?.proxyWarning || 'Warning: Using localhost may not work in production' }}
              </small>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">
              {{ $t?.common?.cancel || 'Cancel' }}
            </button>
            <button class="btn btn-primary" @click="saveSettings" :disabled="!serverUrl">
              {{ $t?.common?.save || 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import SvgIcons from './SvgIcons.vue';

export default {
  name: 'ServerSettingsModal',
  components: { SvgIcons },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialServerUrl: {
      type: String,
      default: ''
    },
    serverOptions: {
      type: Array,
      default: () => []
    },
    isDark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      serverUrl: this.initialServerUrl,
      serverDropdownOpen: false,
      showProxyWarning: false,
      isMounted: false
    };
  },
  
  mounted() {
    this.isMounted = true;
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('click', this.handleClickOutside);
    this.checkProxyWarning(this.serverUrl);
    
    // Focus the input when modal opens
    this.$nextTick(() => {
      const input = this.$refs.serverInput;
      if (input) input.focus();
    });
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    initialServerUrl(newVal) {
      this.serverUrl = newVal;
    },
    serverUrl(newVal) {
      this.checkProxyWarning(newVal);
    }
  },
  methods: {
    closeModal() {
      this.$emit('update:visible', false);
      this.serverDropdownOpen = false;
    },
    handleEscape(e) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    },
    saveSettings() {
      this.$emit('save', this.serverUrl);
      this.closeModal();
    },
    toggleServerDropdown() {
      this.serverDropdownOpen = !this.serverDropdownOpen;
    },
    selectServerOption(option) {
      this.serverUrl = option;
      this.serverDropdownOpen = false;
    },
    checkProxyWarning(url) {
      try {
        const { hostname } = new URL(url);
        this.showProxyWarning = hostname === 'localhost' || hostname === '127.0.0.1';
      } catch (e) {
        this.showProxyWarning = false;
      }
    },
    handleClickOutside(event) {
      if (this.visible && !this.$el.contains(event.target)) {
        this.closeModal();
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('click', this.handleClickOutside);
    this.checkProxyWarning(this.serverUrl);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

/* Modal container */
.server-settings-modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  transform: translateY(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

/* Dark mode styles */
.server-settings-modal.dark-mode {
  background: #1e1e2e;
  color: #e0e0e0;
}

/* Modal header */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dark-mode .modal-header {
  border-bottom-color: #2d3748;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.dark-mode .modal-header h2 {
  color: #f3f4f6;
}

/* Close button */
.modal-close-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.dark-mode .modal-close-btn {
  color: #9ca3af;
}

.dark-mode .modal-close-btn:hover {
  background-color: #374151;
  color: #f3f4f6;
}

/* Modal content */
.modal-content {
  padding: 24px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* Form group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.dark-mode .form-group label {
  color: #e5e7eb;
}

/* Input wrapper */
.server-input-wrapper {
  position: relative;
  width: 100%;
}

/* Input field */
input[type="text"] {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9375rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #ffffff;
  color: #111827;
}

dark-mode input[type="text"] {
  background-color: #1f2937;
  border-color: #374151;
  color: #f3f4f6;
}

input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
}

/* Server dropdown toggle */
.server-dropdown-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.server-dropdown-toggle:hover {
  background-color: #f3f4f6;
}

.dark-mode .server-dropdown-toggle {
  color: #9ca3af;
}

.dark-mode .server-dropdown-toggle:hover {
  background-color: #374151;
}

/* Server options dropdown */
.server-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 4px;
  padding: 4px 0;
  list-style: none;
  z-index: 50;
}

.dark-mode .server-options {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
}

.server-options li {
  margin: 0;
  padding: 0;
}

.server-options button {
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #374151;
  transition: background-color 0.1s;
}

.dark-mode .server-options button {
  color: #e5e7eb;
}

.server-options button:hover {
  background-color: #f9fafb;
}

.dark-mode .server-options button:hover {
  background-color: #374151;
}

.server-options button.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.dark-mode .server-options button.active {
  background-color: #1e3a8a;
  color: #93c5fd;
}

/* Proxy warning */
.proxy-warning {
  display: block;
  margin-top: 8px;
  font-size: 0.8125rem;
  color: #d97706;
  line-height: 1.4;
}

.dark-mode .proxy-warning {
  color: #fbbf24;
}

/* Modal footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dark-mode .modal-footer {
  border-top-color: #374151;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.dark-mode .btn-secondary {
  background-color: #374151;
  color: #f3f4f6;
  border-color: #4b5563;
}

.dark-mode .btn-secondary:hover {
  background-color: #4b5563;
  border-color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .server-settings-modal {
    margin: 0 16px;
    max-width: 100%;
    max-height: 90vh;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 16px;
  }
}

/* Animation for modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .server-settings-modal,
.modal-leave-active .server-settings-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .server-settings-modal,
.modal-leave-to .server-settings-modal {
  opacity: 0;
  transform: translateY(-20px);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.server-settings-modal {
  background: var(--color-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: var(--color-bg-hover);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text);
}

.server-input-wrapper {
  position: relative;
  width: 100%;
}

input[type="text"] {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: var(--color-bg);
  color: var(--color-text);
}

input[type="text"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
  outline: none;
}

.server-dropdown-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.server-dropdown-toggle:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
}

.server-dropdown-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.server-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  z-index: 10;
}

.server-options li {
  margin: 0;
  padding: 0;
}

.server-options button {
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text);
  transition: background-color 0.1s;
}

.server-options button:hover {
  background-color: var(--color-bg-hover);
}

.server-options button.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.proxy-warning {
  display: block;
  margin-top: 8px;
  color: var(--color-warning);
  font-size: 0.85rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
}

/* Dark mode specific styles */
.dark-mode .server-settings-modal {
  background-color: var(--color-bg-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode input[type="text"] {
  background-color: var(--color-bg-dark);
  border-color: var(--color-border-dark);
  color: var(--color-text-dark);
}

.dark-mode .server-options {
  background-color: var(--color-bg-dark);
  border-color: var(--color-border-dark);
}

.dark-mode .server-options button {
  color: var(--color-text-dark);
}

.dark-mode .server-options button:hover {
  background-color: var(--color-bg-hover-dark);
}

.dark-mode .server-options button.active {
  background-color: var(--color-primary-dark);
  color: white;
}

.dark-mode .close-btn {
  color: var(--color-text-secondary-dark);
}

.dark-mode .close-btn:hover {
  background-color: var(--color-bg-hover-dark);
}
</style>
