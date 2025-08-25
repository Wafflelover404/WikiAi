<template>
  <div class="login-page">
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="serverUrl">API URL</label>
          <input id="serverUrl" v-model="serverUrl" type="text" placeholder="http://localhost:9001" required />
        </div>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <button type="submit" :disabled="loading">Login</button>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      serverUrl: this.$root.serverUrl || '',
      username: '',
      password: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      this.$root.serverUrl = this.serverUrl;
      try {
        const { apiRequest } = await import('../api.js');
        const res = await apiRequest({
          url: `${this.serverUrl}/login`,
          method: 'POST',
          data: {
            username: this.username,
            password: this.password
          }
        });
        if (res.status === 'success' && res.token) {
          this.$root.token = res.token;
          // Pass role to parent
          this.$emit('login-success', { username: this.username, password: this.password, role: res.role });
        } else {
          this.error = res.message || 'Login failed.';
        }
      } catch (e) {
        this.error = 'Network or server error.';
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
}
.login-box {
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
</style>
