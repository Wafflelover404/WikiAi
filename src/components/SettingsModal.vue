<template>
  <div v-if="visible">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="settings-modal">
      <div class="modal-content">
        <h3>Configuration</h3>
        <div class="settings-fields">
          <label>Username
            <input v-model="username" type="text" placeholder="Current username" disabled />
          </label>
          <label>Password
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Current password" disabled style="flex:1;" />
              <button type="button" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
            </div>
          </label>
          <label>Server URL
            <input v-model="serverUrl" type="text" placeholder="Enter server URL" />
          </label>
        </div>
        <div class="modal-actions">
          <button @click="$emit('save', { serverUrl })">Save</button>
          <button @click="$emit('close')">Cancel</button>
          <button @click="checkServer" :disabled="checking">Check Server</button>
          <button @click="logout" style="background:#d32f2f;color:#fff;">Logout</button>
          <button @click="logoutAllSessions" style="background:#ff9800;color:#fff;">Logout All Sessions</button>
        </div>
        <div v-if="checkResult" class="check-result">{{ checkResult }}</div>
        <div v-if="logoutAllMsg" class="check-result" style="color:#e65100;">{{ logoutAllMsg }}</div>
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
.check-result {
  margin-top: 12px;
  color: #0078d4;
  font-weight: bold;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  z-index: 999;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPop {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.settings-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: grid;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
.modal-content {
  background: #fff;
  padding: 32px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.22);
  min-width: 320px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  outline: none;
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1);
}
.modal-content h3 {
  margin-top: 0;
}
label {
  display: block;
  margin-bottom: 16px;
}
input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-top: 16px;
}

.settings-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 10px;
}
.settings-fields label {
  margin-bottom: 2px;
  font-weight: 500;
}
.settings-fields input[type="text"],
.settings-fields input[type="password"] {
  padding: 7px 10px;
  border: 1px solid #cfd8dc;
  border-radius: 5px;
  font-size: 1rem;
  margin-bottom: 2px;
  width: 100%;
  box-sizing: border-box;
}
</style>
