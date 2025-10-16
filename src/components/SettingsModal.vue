<template>
  <div v-if="visible">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="settings-modal">
      <div class="modal-content">
        <button class="modal-close-btn" @click="$emit('close')" aria-label="Close">×</button>
        
        <div class="modal-header">
          <div class="header-icon">⚙️</div>
          <h2>Settings</h2>
          <p class="header-subtitle">Manage your account and preferences</p>
        </div>

        <div class="settings-sections">
          <!-- Account Information Section -->
          <div class="settings-section">
            <div class="section-header">
              <span class="section-icon">👤</span>
              <h3>Account Information</h3>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                <span class="label-text">Username</span>
                <span class="label-badge readonly">Read-only</span>
              </label>
              <div class="input-wrapper">
                <span class="input-icon">@</span>
                <input 
                  v-model="username" 
                  type="text" 
                  placeholder="Current username" 
                  disabled 
                  class="enhanced-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔒</span>
                <span class="label-text">Password</span>
                <span class="label-badge readonly">Read-only</span>
              </label>
              <div class="input-wrapper password-wrapper">
                <span class="input-icon">🔑</span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password" 
                  placeholder="Current password" 
                  disabled 
                  class="enhanced-input"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword" 
                  class="password-toggle-btn"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Server Configuration Section -->
          <div class="settings-section">
            <div class="section-header">
              <span class="section-icon">🌐</span>
              <h3>Server Configuration</h3>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔗</span>
                <span class="label-text">Server URL</span>
              </label>
              <div class="input-wrapper">
                <span class="input-icon">🌐</span>
                <input 
                  v-model="serverUrl" 
                  type="text" 
                  placeholder="https://api.example.com" 
                  class="enhanced-input"
                />
              </div>
            </div>

            <button 
              @click="checkServer" 
              :disabled="checking" 
              class="action-btn secondary full-width"
            >
              <span class="btn-icon">🔍</span>
              <span>{{ checking ? 'Checking...' : 'Test Connection' }}</span>
            </button>

            <div v-if="checkResult" class="status-message" :class="checkResult.includes('Failed') ? 'error' : 'success'">
              <span class="status-icon">{{ checkResult.includes('Failed') ? '❌' : '✅' }}</span>
              {{ checkResult }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button @click="$emit('save', { serverUrl })" class="action-btn primary">
            <span class="btn-icon">💾</span>
            <span>Save Changes</span>
          </button>
          <button @click="$emit('close')" class="action-btn secondary">
            <span class="btn-icon">❌</span>
            <span>Cancel</span>
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <div class="danger-header">
            <span class="danger-icon">⚠️</span>
            <h3>Danger Zone</h3>
          </div>
          <div class="danger-actions">
            <button @click="logoutAllSessions" class="action-btn warning">
              <span class="btn-icon">🚪</span>
              <span>Logout All Sessions</span>
            </button>
            <button @click="logout" class="action-btn danger">
              <span class="btn-icon">🚫</span>
              <span>Logout</span>
            </button>
          </div>
          <div v-if="logoutAllMsg" class="status-message warning">
            <span class="status-icon">⚠️</span>
            {{ logoutAllMsg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialUsername: {
      type: String,
      default: ''
    },
    initialPassword: {
      type: String,
      default: ''
    },
    initialServerUrl: {
      type: String,
      default: ''
    },
    accessToken: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      username: this.initialUsername,
      password: this.initialPassword,
      serverUrl: this.initialServerUrl,
      showPassword: false,
      checking: false,
      checkResult: '',
      logoutAllMsg: ''
    };
  },
  watch: {
    initialUsername(val) {
      this.username = val;
    },
    initialPassword(val) {
      this.password = val;
    },
    initialServerUrl(val) {
      this.serverUrl = val;
    }
  },
  methods: {
    async checkServer() {
      this.checking = true;
      this.checkResult = '';
      try {
        const { apiRequest } = await import('../api.js');
        const res = await apiRequest({
          url: `${this.serverUrl}/`,
          method: 'GET'
        });
        if (typeof res === 'object' && res.status === 'success') {
          this.checkResult = 'Server is reachable.';
        } else {
          this.checkResult = 'Server responded.';
        }
      } catch (e) {
        this.checkResult = 'Failed to reach server.';
      }
      this.checking = false;
    },

    logout() {
      // Reset all settings
      this.username = '';
      this.password = '';
      this.serverUrl = '';
      this.showPassword = false;
      this.checkResult = '';
      this.checking = false;
      this.logoutAllMsg = '';

      // Optionally remove saved credentials from localStorage
      localStorage.removeItem('loginData');

      // Emit logout event to parent
      this.$emit('logout');
    },

    async logoutAllSessions() {
      this.logoutAllMsg = '';
      try {
        const { apiRequest } = await import('../api.js');
        const access_token = this.accessToken;
        if (!access_token) {
          this.logoutAllMsg = 'No access token found.';
          return;
        }
        const res = await apiRequest({
          url: `${this.serverUrl}/user/disrupt_sessions`,
          method: 'POST',
          token: access_token,
          data: { access_token }
        });
        if (typeof res === 'object' && res.status === 'success') {
          this.logoutAllMsg = 'All sessions have been logged out.';
          // Automatically logout the user
          setTimeout(() => {
            this.logout();
          }, 1200);
        } else {
          this.logoutAllMsg = 'Request sent. Check your sessions.';
        }
      } catch (e) {
        this.logoutAllMsg = 'Failed to logout all sessions.';
      }
    }
  }
};
</script>

<style scoped>
/* Modal Backdrop & Container */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.2s;
}

.settings-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Modal Header */
.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f7fafc;
  border: none;
  font-size: 2rem;
  color: #718096;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  line-height: 1;
}

.modal-close-btn:hover {
  background: #e53935;
  color: #ffffff;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  padding: 32px 32px 24px;
  border-bottom: 2px solid #f0f4f8;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  animation: rotate 2s ease-in-out infinite;
}

@keyframes rotate {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.modal-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.header-subtitle {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
}

/* Settings Sections */
.settings-sections {
  padding: 24px 32px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.section-icon {
  font-size: 1.5rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
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
  flex: 1;
}

.label-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-badge.readonly {
  background: #e2e8f0;
  color: #718096;
}

/* Enhanced Inputs */
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

.enhanced-input:hover:not(:disabled) {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.enhanced-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(25, 118, 210, 0.15);
}

.enhanced-input:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.input-wrapper:focus-within .input-icon {
  color: #1976d2;
}

/* Password Toggle */
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

/* Action Buttons */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: #ffffff;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.action-btn.secondary {
  background: #f7fafc;
  color: #2d3748;
  border: 2px solid #e2e8f0;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.action-btn.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #ffffff;
}

.action-btn.warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.action-btn.danger {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: #ffffff;
}

.action-btn.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

.action-btn.full-width {
  width: 100%;
  margin-top: 8px;
}

.btn-icon {
  font-size: 1.1rem;
}

/* Modal Actions */
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 32px 24px;
  border-bottom: 2px solid #f0f4f8;
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 12px;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #81c784;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
  border: 2px solid #e57373;
}

.status-message.warning {
  background: #fff3e0;
  color: #e65100;
  border: 2px solid #ffb74d;
}

.status-icon {
  font-size: 1.2rem;
}

/* Danger Zone */
.danger-zone {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  padding: 24px 32px 32px;
  border-radius: 0 0 20px 20px;
}

.danger-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.danger-icon {
  font-size: 1.5rem;
}

.danger-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #c62828;
}

.danger-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalPop {
  from { 
    transform: scale(0.9);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark Mode */
body.dark-mode .modal-content {
  background: #1a202c;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

body.dark-mode .modal-header {
  border-bottom-color: #2d3748;
}

body.dark-mode .modal-header h2,
body.dark-mode .section-header h3,
body.dark-mode .label-text {
  color: #e2e8f0;
}

body.dark-mode .header-subtitle {
  color: #a0aec0;
}

body.dark-mode .section-header {
  border-bottom-color: #2d3748;
}

body.dark-mode .enhanced-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

body.dark-mode .enhanced-input:disabled {
  background: #1a202c;
  color: #718096;
}

body.dark-mode .enhanced-input:hover:not(:disabled) {
  border-color: #718096;
  background: #374151;
}

body.dark-mode .enhanced-input:focus {
  border-color: #4299e1;
  background: #2d3748;
  box-shadow: 0 0 0 4px rgba(66, 153, 225, 0.2), 0 2px 8px rgba(66, 153, 225, 0.25);
}

body.dark-mode .input-icon {
  color: #a0aec0;
}

body.dark-mode .input-wrapper:focus-within .input-icon {
  color: #4299e1;
}

body.dark-mode .modal-close-btn {
  background: #2d3748;
  color: #a0aec0;
}

body.dark-mode .modal-close-btn:hover {
  background: #e53935;
  color: #ffffff;
}

body.dark-mode .action-btn.secondary {
  background: #2d3748;
  color: #e2e8f0;
  border-color: #4a5568;
}

body.dark-mode .action-btn.secondary:hover:not(:disabled) {
  background: #374151;
  border-color: #718096;
}

body.dark-mode .danger-zone {
  background: linear-gradient(135deg, #2d1f1f 0%, #3d2020 100%);
}

body.dark-mode .modal-actions {
  border-bottom-color: #2d3748;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 24px 20px 20px;
  }
  
  .settings-sections {
    padding: 20px;
  }
  
  .modal-actions,
  .danger-zone {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-actions,
  .danger-actions {
    grid-template-columns: 1fr;
  }
  
  .header-icon {
    font-size: 2.5rem;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
  }
}
</style>
