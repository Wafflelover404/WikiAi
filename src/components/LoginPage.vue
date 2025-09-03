<template>
  <div class="login-page">
    <AnimatedBackground class="background" />
    <div class="login-container">
      <div class="login-box" v-motion-slide-visible-once-bottom>
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group" v-if="defaultServerUrl">
            <label for="serverUrl">API URL</label>
            <input 
              id="serverUrl" 
              v-model="serverUrl" 
              type="text" 
              placeholder="http://localhost:9001" 
              required 
            />
            <small v-if="showProxyWarning" class="proxy-warning">
              Using proxy - set VITE_API_PROXY in .env
            </small>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" v-model="username" type="text" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" required />
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              Remember Me
            </label>
          </div>
          <button type="submit" :disabled="loading" v-motion-fade-visible-once>
            <span v-if="!loading">Login</span>
            <span v-else class="loading-spinner"></span>
          </button>
          <div v-if="error" class="error-msg" v-motion-pop-visible-once>{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedBackground from './AnimatedBackground.vue';

export default {
  name: 'LoginPage',
  components: { AnimatedBackground },
  data() {
    const defaultServerUrl = import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_API_PROXY || '';

    return {
      serverUrl: defaultServerUrl,
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: '',
      showProxyWarning: !!import.meta.env.VITE_API_PROXY
    };
  },
  mounted() {
    const stored = JSON.parse(localStorage.getItem('loginData'));
    if (stored) {
      this.serverUrl = stored.serverUrl;
      this.username = stored.username;
      this.password = stored.password;
      this.rememberMe = true;
      this.autoLogin();
    }

    this.showProxyWarning = !!import.meta.env.VITE_API_PROXY;
  },
  methods: {
    async autoLogin() {
      await this.handleLogin(true);
    },
    async handleLogin(isAuto = false) {
      this.loading = true;
      this.error = '';

      try {
        let cleanUrl = this.serverUrl.trim();

        if (import.meta.env.DEV && import.meta.env.VITE_API_PROXY) {
          cleanUrl = '/api'; // Dev proxy
        } else {
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'http://' + cleanUrl;
          }
          cleanUrl = cleanUrl.replace(/\/+$/, '');
        }

        this.$root.serverUrl = cleanUrl;

        const { login } = await import('../api.js');
        const res = await login({
          serverUrl: cleanUrl,
          username: this.username.trim(),
          password: this.password.trim()
        });

        if (res.token || (res.status && res.session_id)) {
          if (this.rememberMe) {
            localStorage.setItem(
              'loginData',
              JSON.stringify({
                serverUrl: this.serverUrl,
                username: this.username,
                password: this.password
              })
            );
          } else {
            localStorage.removeItem('loginData');
          }

          if (res.token) {
            this.$root.token = res.token;
            this.$emit('login-success', {
              username: this.username,
              password: this.password,
              role: res.role || 'user',
              token: res.token,
              serverUrl: cleanUrl
            });
          } else {
            this.$root.session_id = res.session_id;
            this.$emit('login-success', {
              username: this.username,
              password: this.password,
              role: res.role || 'user',
              session_id: res.session_id,
              status: res.status,
              serverUrl: cleanUrl
            });
          }
        } else {
          if (!isAuto) this.error = res.detail || res.message || 'Login failed.';
          else localStorage.removeItem('loginData');
        }
      } catch (e) {
        console.error('Login error:', e);
        if (!isAuto) {
          this.error = e.message.includes('CORS')
            ? 'CORS error - configure server or use dev proxy'
            : 'Network or server error.';
        }
      }
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: #f7f7f7;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-box {
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.2);
}

.checkbox-group {
  margin: 28px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-left: 32px;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 2px solid #0078d4;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-label:hover input ~ .checkmark {
  background-color: #f0f8ff;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #0078d4;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

button {
  width: 100%;
  padding: 14px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

button:hover:not(:disabled) {
  background: #005a9e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  color: #d32f2f;
  margin-top: 20px;
  text-align: center;
  font-size: 15px;
  padding: 12px;
  background-color: #ffebee;
  border-radius: 8px;
  border-left: 4px solid #d32f2f;
}

.proxy-warning {
  display: block;
  color: #ff9800;
  font-size: 0.85em;
  margin-top: 8px;
  font-style: italic;
}
</style>