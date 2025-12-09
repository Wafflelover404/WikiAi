import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref(null);
  const token = ref(localStorage.getItem('authToken') || null);

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin');
  const currentUser = computed(() => user.value);

  // Actions
  async function login(credentials) {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Update state
      user.value = { username: credentials.username, role: data.role || 'user' };
      isAuthenticated.value = true;
      token.value = data.token;
      
      // Persist to localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(user.value));
      
      return data;
    } catch (err) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    // Clear state
    user.value = null;
    isAuthenticated.value = false;
    token.value = null;
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  function initialize() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      try {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
        logout();
      }
    }
  }

  // Initialize store when created
  initialize();

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    token,
    
    // Getters
    isAdmin,
    currentUser,
    
    // Actions
    login,
    logout,
    initialize
  };
});
