<template>
  <div v-if="visible">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="settings-modal">
      <div class="modal-content">
        <h3>Configuration</h3>
        <label>
          Username:
          <input v-model="username" type="text" placeholder="Current username" disabled />
        </label>
        <label>
          Password:
          <div style="display: flex; align-items: center;">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Current password" disabled />
            <button type="button" @click="showPassword = !showPassword" style="margin-left:8px;">{{ showPassword ? 'Hide' : 'Show' }}</button>
          </div>
        </label>
        <label>
          Server URL:
          <input v-model="serverUrl" type="text" placeholder="Enter server URL" />
        </label>
        <div class="modal-actions">
          <button @click="$emit('save', { serverUrl })">Save</button>
          <button @click="$emit('close')">Cancel</button>
          <button @click="checkServer" :disabled="checking">Check Server</button>
          <button @click="logout" style="background:#d32f2f;color:#fff;">Logout</button>
        </div>
        <div v-if="checkResult" class="check-result">{{ checkResult }}</div>
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
    }
  },
  data() {
    return {
    username: this.initialUsername,
    password: this.initialPassword,
    serverUrl: this.initialServerUrl,
    showPassword: false,
    checking: false,
    checkResult: ''
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
      this.$emit('logout');
    }
  }
}
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
.settings-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  padding: 32px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  min-width: 320px;
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
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
