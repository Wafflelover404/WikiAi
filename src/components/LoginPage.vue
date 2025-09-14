<template>
  <div class="login-page" :class="{ 'dark-mode': isDark }">
    <AnimatedBackground class="background" :dark-mode="isDark" />
    <div class="login-container">
      <!-- Theme toggle control -->
      <button class="theme-toggle" @click="toggleTheme" :aria-pressed="isDark" aria-label="Toggle theme">
        <span v-if="!isDark">🌙</span>
        <span v-else>☀️</span>
      </button>
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
          <div class="form-group password-group">
            <label for="password">Password</label>
            <div class="password-input-wrapper">
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>🙈</span>
              </button>
            </div>
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
          <div v-if="error || success" 
               :class="['status-msg', { 'error-msg': error, 'success-msg': success }]" 
               v-motion-pop-visible-once>
            {{ error || success }}
          </div>
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
      success: '',
      showPassword: false,
      showProxyWarning: !!import.meta.env.VITE_API_PROXY,
      isDark: true
    };
  },
  mounted() {
    // Initialize theme on login page (dark by default)
    try {
      const stored = localStorage.getItem('theme');
      this.isDark = stored ? stored === 'dark' : true;
    } catch (e) {
      this.isDark = true;
    }
    document.body.classList.toggle('dark-mode', this.isDark);
    this.$emit('theme-changed', this.isDark);

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
    toggleTheme() {
      this.isDark = !this.isDark;
      document.body.classList.toggle('dark-mode', this.isDark);
      try {
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      } catch (e) { /* ignore */ }
      this.$emit('theme-changed', this.isDark);
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async autoLogin() {
      await this.handleLogin(true);
    },
    async handleLogin(isAuto = false) {
      this.loading = true;
      this.error = '';
      this.success = '';

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
        const response = await login({
          serverUrl: cleanUrl,
          username: this.username.trim(),
          password: this.password.trim()
        });

        // Check for error status in response
        if (response.status === 'error') {
          throw new Error(response.message || 'Login failed');
        }

        // If we get here, login was successful
        const { token, role } = response;
        this.$root.token = token;
        this.$emit('login-success', {
          username: this.username,
          password: this.password,
          role: role || 'user',
          token: token,
          serverUrl: cleanUrl
        });

        // Set success message
        this.success = response.message || 'Login successful!';
        
        // Handle remember me
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
      } catch (e) {
        console.error('Login error:', e);
        
        // Clear any previous success message
        this.success = '';
        
        // Set error message from the error object
        if (e.message.includes('CORS')) {
          this.error = 'CORS error - configure server or use dev proxy';
        } else if (e.response) {
          // If we have a response object, use its message or detail
          this.error = e.response.message || e.response.detail || 'Invalid username or password';
        } else {
          // Fallback to the error message or a generic one
          this.error = e.message || 'Network or server error. Please try again.';
        }
        
        // Only redirect on auto-login if there's no error
        if (isAuto && !this.error) {
          this.$router.push('/');
        }
      }
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 14px;
  right: 20px;
  background: none;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 999px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}
:deep(.dark-mode) .theme-toggle {
  border-color: rgba(255,255,255,0.2);
  color: #e0e0e0;
}
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
  transition: background 0.3s ease;
}

.login-page.dark-mode {
  background: #0f1113;
}

.login-page.dark-mode .login-box {
  background: rgba(27, 29, 31, 0.95);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.login-page.dark-mode h2,
.login-page.dark-mode label,
.login-page.dark-mode .form-group input {
  color: #e0e0e0;
}

.login-page.dark-mode .form-group input {
  background: #2a2d31;
  border-color: #3a3d41;
  color: #e0e0e0;
}

.login-page.dark-mode .form-group input::placeholder {
  color: #8e8e8e;
}

.login-page.dark-mode .toggle-password {
  color: #e0e0e0;
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
  transition: background 0.3s ease, box-shadow 0.3s ease;
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
:deep(.dark-mode) h2 {
  color: #e0e0e0;
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
:deep(.dark-mode) label {
  color: #e0e0e0;
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
:deep(.dark-mode) input {
  background: #232628;
  border-color: #3a3d3f;
  color: #e0e0e0;
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
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.password-group {
  position: relative;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.2em;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.toggle-password:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
:deep(.dark-mode) .toggle-password {
  color: #a0a6ac;
}
:deep(.dark-mode) .toggle-password:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.status-msg {
  margin-top: 16px;
  text-align: center;
  padding: 12px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.error-msg {
  color: #d32f2f;
  background: #ffebee;
  border: 1px solid #ffcdd2;
}
:deep(.dark-mode) .error-msg {
  color: #ffb4a9;
  background: #2a1b1a;
  border-color: #ff8a80;
}

.success-msg {
  color: #2e7d32;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
}
:deep(.dark-mode) .success-msg {
  color: #a5d6a7;
  background: #1c2a1d;
  border-color: #388e3c;
}

.proxy-warning {
  display: block;
  color: #ff9800;
  font-size: 0.85em;
  margin-top: 8px;
  font-style: italic;
}
</style>