<template>
  <div class="login-page" :class="{ 'dark-mode': isDark }">
    <AnimatedBackground class="background" :dark-mode="isDark" />
    <div class="login-container">
      <div class="top-bar">
        <button
          class="home-button-icon"
          type="button"
          @click="goToLanding"
          aria-label="Go to home"
        >
          <SvgIcons icon="home" />
        </button>
        <!-- Top controls: language + theme + settings -->
        <div class="top-controls">
          <button 
            class="lang-toggle" 
            @click="toggleLanguage" 
            :title="`Switch to ${language === 'en' ? 'Русский' : 'English'}`"
            aria-label="Language selector"
          >
            <SvgIcons :icon="language === 'en' ? 'flag-ru' : 'flag-gb'" /> {{ language === 'en' ? 'РУ' : 'EN' }}
          </button>
          <button class="theme-toggle" @click="toggleTheme" :aria-pressed="isDark" aria-label="Toggle theme">
            <SvgIcons :icon="isDark ? 'sun' : 'moon'" />
          </button>
          <button 
            class="server-settings-toggle" 
            @click="toggleServerSettings" 
            :class="{ active: showServerSettings }" 
            :aria-expanded="showServerSettings"
            :aria-label="$t?.login?.serverSettings || 'Server settings'" 
            :title="$t?.login?.serverSettings || 'Server settings'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="login-box" v-motion-slide-visible-once-bottom>
        <h2>{{ t.login.title }}</h2>
        <p class="login-subtitle">{{ t.login.subtitle }}</p>
        <div class="mode-toggle" role="group" aria-label="Authentication mode">
          <button
            type="button"
            :class="{ active: mode === 'create' }"
            @click="mode = 'create'"
          >
            Create organization
          </button>
          <button
            type="button"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            Use existing session
          </button>
        </div>
        <p class="org-hint">
          GraphTalk sessions are scoped to an organization. Creating an organization issues a session token with org context.
        </p>
        <form @submit.prevent="handleLogin">
          <div class="form-group" v-if="mode === 'create'">
            <label for="organizationName">Organization name</label>
            <input
              id="organizationName"
              v-model="organizationName"
              type="text"
              placeholder="e.g. GraphTalk Demo"
              required
            />
          </div>
          <div class="form-group">
            <label for="username">{{ t.login.username }}</label>
            <input id="username" v-model="username" type="text" required />
          </div>
          <div class="form-group password-group">
            <label for="password">{{ t.login.password }}</label>
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
                <SvgIcons :icon="showPassword ? 'eye' : 'eye-closed'" />
              </button>
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              {{ t.login.rememberMe }}
            </label>
          </div>
          <button type="submit" :disabled="loading" v-motion-fade-visible-once>
            <span v-if="!loading">{{ t.login.login }}</span>
            <span v-else class="loading-spinner"></span>
          </button>
          <div v-if="error || success" 
               :class="['status-msg', { 'error-msg': error, 'success-msg': success }]" 
               v-motion-pop-visible-once>
            {{ error || success }}
          </div>
        </form>
      </div>
      <!-- Server Settings Modal -->
      <SettingsModal
        v-if="showServerSettings"
        :visible.sync="showServerSettings"
        :initial-server-url="serverUrl"
        :is-dark="isDark"
        @close="closeServerSettings"
      />
    </div>
  </div>
</template>

<script>
import AnimatedBackground from './AnimatedBackground.vue';
import SvgIcons from './SvgIcons.vue';
import SettingsModal from './SettingsModal.vue';
import { useI18n } from '../i18n.js';

export default {
  name: 'LoginPage',
  components: {
    AnimatedBackground,
    SvgIcons,
    SettingsModal
  },
  props: {
    language: {
      type: String,
      default: 'en'
    }
  },
  data() {
    const language = localStorage.getItem('language') || 'en';
    document.documentElement.lang = language;
    
    const defaultServerUrl = import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_API_PROXY || '';
    const envOptions = (import.meta.env.VITE_API_URL_OPTIONS || '')
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);

    let storedOptions = [];
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('serverUrlOptions') : null;
      storedOptions = raw ? JSON.parse(raw) : [];
    } catch (e) {
      storedOptions = [];
    }

    const uniqueServerOptions = Array.from(new Set([defaultServerUrl, ...envOptions, ...storedOptions].filter(Boolean)));

    return {
      defaultServerUrl,
      serverUrl: defaultServerUrl,
      organizationName: '',
      organizationId: '',
      organizationSlug: '',
      memberships: [],
      username: '',
      password: '',
      rememberMe: false,
      loading: false,
      error: '',
      success: '',
      showPassword: false,
      showProxyWarning: !!import.meta.env.VITE_API_PROXY,
      isDark: true,
      language: language,
      serverOptions: uniqueServerOptions,
      showServerSettings: false,
      mode: 'create'
    };
  },
  computed: {
    t() {
      return useI18n(this.language);
    }
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
      // Only load username and password, not serverUrl
      this.username = stored.username || '';
      this.password = stored.password || '';
      this.organizationName = stored.organizationName || '';
      this.organizationId = stored.organizationId || '';
      this.organizationSlug = stored.organizationSlug || '';
      this.memberships = stored.memberships || [];
      this.mode = stored.mode || 'create';
      this.rememberMe = true;
      // Only auto-login if we have both username and password
      if (this.username && this.password) {
        this.autoLogin();
      }
    }

    this.showProxyWarning = !!import.meta.env.VITE_API_PROXY;

    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleGlobalClick);
    }
  },
  beforeUnmount() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.handleGlobalClick);
    }
  },
  methods: {
    goToLanding() {
      this.$router.push('/landing');
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      if (this.isDark) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: this.isDark } }));
      this.$emit('theme-changed', this.isDark);
    },
    toggleServerSettings() {
      this.showServerSettings = !this.showServerSettings;
      
      // Close other open dropdowns when opening settings
      if (this.showServerSettings) {
        document.dispatchEvent(new CustomEvent('close-dropdowns'));
        // Focus the server URL input when modal opens
        this.$nextTick(() => {
          const input = this.$el.querySelector('.settings-modal input[type="text"]');
          if (input) input.focus();
        });
      }
    },
    
    closeServerSettings() {
      this.showServerSettings = false;
    },
    onServerSettingsSave(serverUrl) {
      if (serverUrl && serverUrl !== this.serverUrl) {
        this.serverUrl = serverUrl;
        this.persistServerOption(serverUrl);
        // Optionally show a success message or update UI
      }
    },
    persistServerOption(url) {
      try {
        // Add to the beginning of the array if not already present
        const updatedOptions = [
          url,
          ...this.serverOptions.filter(option => option !== url)
        ].slice(0, 5); // Keep only the 5 most recent

        this.serverOptions = updatedOptions;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('serverUrlOptions', JSON.stringify(updatedOptions));
        }
        return updatedOptions;
      } catch (e) {
        console.error('Failed to persist server URL option', e);
        return [];
      }
    },
    toggleLanguage() {
      this.language = this.language === 'en' ? 'ru' : 'en';
      localStorage.setItem('language', this.language);
      document.documentElement.lang = this.language;
      // Emit event to parent component if needed
      this.$emit('update:language', this.language);
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async autoLogin() {
      await this.handleLogin(true);
    },
    extractOrganizationContext(response, fallbackName = '') {
      const responsePayload = response?.response || {};
      const memberships = responsePayload.memberships || response.memberships || [];
      const firstMembership = memberships.find(m => m.status === 'active') || memberships[0] || {};
      const orgName =
        responsePayload.organization_name ||
        response.organization_name ||
        firstMembership.organization_name ||
        fallbackName;
      const orgId =
        responsePayload.organization_id ||
        response.organization_id ||
        firstMembership.organization_id ||
        '';
      const orgSlug =
        responsePayload.organization_slug ||
        response.organization_slug ||
        firstMembership.organization_slug ||
        firstMembership.slug ||
        '';
      return {
        name: orgName,
        id: orgId,
        slug: orgSlug,
        memberships
      };
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
        this.persistServerOption(cleanUrl);

        // Route the auth request based on the selected mode
        let response;
        const trimmedUsername = this.username.trim();
        const trimmedPassword = this.password.trim();

        if (this.mode === 'create') {
          if (!this.organizationName.trim()) {
            this.error = 'Organization name is required for GraphTalk sessions';
            this.loading = false;
            return;
          }
          const { createOrganizationWithAdmin } = await import('../api.js');
          response = await createOrganizationWithAdmin({
            serverUrl: cleanUrl,
            organizationName: this.organizationName.trim(),
            adminUsername: trimmedUsername,
            adminPassword: trimmedPassword
          });
        } else {
          const { login } = await import('../api.js');
          response = await login({
            serverUrl: cleanUrl,
            username: trimmedUsername,
            password: trimmedPassword
          });
        }

        // Check for error status in response
        if (response.status === 'error') {
          throw new Error(response.message || 'Login failed');
        }

        // If we get here, authentication was successful
        const { token, role } = response;
        const orgContext = this.extractOrganizationContext(
          response,
          this.mode === 'create' ? this.organizationName.trim() : ''
        );

        this.organizationName = orgContext.name || this.organizationName;
        this.organizationId = orgContext.id || '';
        this.organizationSlug = orgContext.slug || '';
        this.memberships = orgContext.memberships || [];

        this.$root.token = token;
        this.$emit('login-success', {
          username: this.username,
          password: this.password,
          organizationName: this.organizationName,
          organizationId: this.organizationId,
          organizationSlug: this.organizationSlug,
          memberships: this.memberships,
          role: role || 'user',
          token: token,
          serverUrl: cleanUrl
        });

        // Set success message
        this.success = response.message || (this.mode === 'create'
          ? 'Organization created and session issued.'
          : 'Login successful!');
        
        // Handle remember me
        if (this.rememberMe) {
            localStorage.setItem(
              'loginData',
              JSON.stringify({
                username: this.username,
                password: this.password,
                organizationName: this.organizationName,
                organizationId: this.organizationId,
                organizationSlug: this.organizationSlug,
                memberships: this.memberships || [],
                mode: this.mode
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
/* Icon specific styles */
.svg-icon {
  color: var(--icon-color);
  transition: color 0.3s ease;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.mode-toggle button {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle button.active {
  background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
  color: #fff;
  border-color: #007BFF;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.org-hint {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.home-button-icon .svg-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.lang-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.lang-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.theme-toggle .svg-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.toggle-password .svg-icon {
  width: 1.1rem;
  height: 1.1rem;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Ensure all buttons with icons have proper alignment */
button[class$="-icon"],
button[class*="-icon "] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.3s ease;
}

button[class$="-icon"]:hover,
button[class*="-icon "]:hover {
  opacity: 0.8;
}

.top-controls {
  position: absolute;
  top: 14px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

/* Theme toggle and server settings button base styles */
.theme-toggle,
.server-settings-toggle {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 8px;
}

/* Light mode styles */
:not(.dark-mode) .theme-toggle,
:not(.dark-mode) .server-settings-toggle {
  border-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
}

:not(.dark-mode) .theme-toggle:hover,
:not(.dark-mode) .server-settings-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
  border-color: rgba(0, 0, 0, 0.15);
}

/* Dark mode styles */
.dark-mode .theme-toggle,
.dark-mode .server-settings-toggle {
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.dark-mode .theme-toggle:hover,
.dark-mode .server-settings-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

/* Hover and active states */
.theme-toggle:hover,
.theme-toggle:focus,
.server-settings-toggle:hover,
.server-settings-toggle:focus,
.server-settings-toggle.active {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-toggle:active,
.server-settings-toggle:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Icons */
.theme-toggle svg,
.server-settings-toggle svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
}

/* Active state for server settings button when modal is open */
.server-settings-toggle.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.2);
}

.dark-mode .server-settings-toggle.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.home-button-icon {
  position: absolute;
  top: 14px;
  left: 20px;
  background: none;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s ease, border-color 0.2s ease;
  z-index: 2;
}

.home-button-icon:hover {
  background: rgba(0,0,0,0.05);
}

::deep(.dark-mode) .home-button-icon {
  border-color: rgba(255,255,255,0.2);
  color: #e0e0e0;
}

::deep(.dark-mode) .home-button-icon:hover {
  background: rgba(255,255,255,0.08);
}

.theme-toggle {
  position: static;
  width: 34px;
  height: 34px;
  border-radius: 50%;
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

.login-subtitle {
  text-align: center;
  margin-top: -12px;
  margin-bottom: 32px;
  color: #666;
  font-size: 0.95rem;
}

:deep(.dark-mode) .login-subtitle {
  color: #b5b8bd;
}

.form-group {
  margin-bottom: 24px;
}

.server-panel {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  position: relative;
  overflow: visible;
  z-index: 10;
}

:deep(.dark-mode) .server-panel {
  background: rgba(20,22,25,0.9);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
}


.server-panel-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.server-panel-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.server-panel-title {
  font-weight: 700;
  color: #0f2238;
}

.server-panel-subtitle {
  font-size: 0.85rem;
  color: rgba(15,34,56,0.7);
}

.server-panel-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.1);
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #0f2238;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.server-panel-toggle .arrow {
  transition: transform 0.2s ease;
}

.server-panel-toggle .arrow.open {
  transform: rotate(180deg);
}

.server-panel-toggle:hover {
  border-color: rgba(0,120,212,0.4);
  background: rgba(0,120,212,0.08);
}

:deep(.dark-mode) .server-panel-title {
  color: #f3f4f6;
}

:deep(.dark-mode) .server-panel-subtitle {
  color: rgba(255,255,255,0.6);
}

:deep(.dark-mode) .server-panel-toggle {
  border-color: rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: #e0e0e0;
}

:deep(.dark-mode) .server-panel-toggle:hover {
  border-color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
}

.server-panel-content {
  margin-top: 18px;
  overflow: visible;
}

.server-slide-enter-active,
.server-slide-leave-active {
  transition: all 0.25s ease;
}

.server-slide-enter-from,
.server-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.server-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.server-dropdown-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.server-dropdown-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.server-dropdown-toggle:hover:not(:disabled) {
  background: rgba(0,0,0,0.05);
}

.server-options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 4px;
  z-index: 500;
}

.server-options li {
  margin: 0;
  margin-bottom: 5px;
}

.server-options button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: inherit;
}

.server-options button:hover {
  background: rgba(0, 120, 212, 0.1);
}

.server-options button.active {
  background: #0078d4;
  color: #fff;
}

:deep(.dark-mode) .server-dropdown-toggle {
  border-color: rgba(255,255,255,0.2);
  color: #e0e0e0;
}

:deep(.dark-mode) .server-dropdown-toggle:hover:not(:disabled) {
  background: rgba(255,255,255,0.08);
}

:deep(.dark-mode) .server-options {
  background: #1f2226;
  border-color: #34363a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

:deep(.dark-mode) .server-options button:hover {
  background: rgba(0, 120, 212, 0.25);
}

:deep(.dark-mode) .server-options button.active {
  background: #0078d4;
  color: #fff;
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
