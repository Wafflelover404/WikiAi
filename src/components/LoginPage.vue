<template>
  <div class="login-page">
    <AnimatedBackground class="background" />
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group" v-if="!serverUrl">
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
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="rememberMe" /> Remember Me
          </label>
        </div>
        <button type="submit" :disabled="loading">Login</button>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import AnimatedBackground from './AnimatedBackground.vue';

export default {
  name: 'LoginPage',
  components: { AnimatedBackground },
  data() {
    return {
      serverUrl: import.meta.env.VITE_API_PROXY || '',
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: '',
      showProxyWarning: false
    };
  },
  mounted() {
    // Check if credentials are stored
    const stored = JSON.parse(localStorage.getItem('loginData'));
    if (stored) {
      this.serverUrl = stored.serverUrl;
      this.username = stored.username;
      this.password = stored.password;
      this.rememberMe = true;
      this.autoLogin();
    }
    
    // Show proxy warning if using dev proxy
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
        // Clean and validate URL
        let cleanUrl = this.serverUrl.trim();
        
        // Handle proxy configuration
        if (import.meta.env.DEV && import.meta.env.VITE_API_PROXY) {
          cleanUrl = '/api'; // Use proxy endpoint
        } else {
          // Ensure proper URL format
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'http://' + cleanUrl;
          }
          cleanUrl = cleanUrl.replace(/\/+$/, ''); // Remove trailing slashes
        }

        this.$root.serverUrl = cleanUrl;
        
        const { apiRequest } = await import('../api.js');
        const res = await apiRequest({
          url: `${cleanUrl}/login`,
          method: 'POST',
          data: {
            username: this.username.trim(),
            password: this.password.trim()
          },
          // Critical: Add CORS headers
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
          }
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
  height: 100vh;
  background: #f7f7f7;
  position: relative;
  overflow: hidden;
}
.background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
}
.login-box {
  position: relative;
  z-index: 1;
  background: #fff;
  padding: 32px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  min-width: 320px;
}
.form-group {
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
.error-msg {
  color: #d32f2f;
  margin-top: 12px;
  font-size: 15px;
}
.proxy-warning {
  display: block;
  color: #ff9800;
  font-size: 0.8em;
  margin-top: 4px;
}
</style>