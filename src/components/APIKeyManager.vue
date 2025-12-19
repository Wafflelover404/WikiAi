<template>
  <div class="api-keys-section">
    <div class="admin-section-header">
      <h2><SvgIcons icon="key" /> API Keys Management</h2>
      <p class="subtitle">Create and manage API keys for programmatic access to the API</p>
    </div>

    <!-- Create New API Key Section -->
    <div class="api-key-create-panel">
      <h3>Create New API Key</h3>
      
      <div class="form-group">
        <label>Key Name</label>
        <input
          v-model="newKey.name"
          type="text"
          placeholder="e.g., Production Key, Mobile App"
          class="form-input"
          :disabled="creatingKey"
        />
      </div>

      <div class="form-group">
        <label>Description (Optional)</label>
        <textarea
          v-model="newKey.description"
          placeholder="Describe what this key will be used for"
          class="form-input"
          rows="3"
          :disabled="creatingKey"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Expiration (Optional)</label>
        <select v-model="newKey.expires_in_days" class="form-input" :disabled="creatingKey">
          <option :value="null">Never Expires</option>
          <option :value="30">30 Days</option>
          <option :value="90">90 Days</option>
          <option :value="180">180 Days</option>
          <option :value="365">1 Year</option>
        </select>
      </div>

      <div class="form-group">
        <label>Permissions</label>
        <p class="permissions-info">Select what operations this key can perform:</p>
        <div class="permissions-grid">
          <div v-for="perm in availablePermissions" :key="perm" class="permission-checkbox">
            <input
              :id="`perm-${perm}`"
              :checked="newKey.permissions.includes(perm)"
              type="checkbox"
              @change="togglePermission(perm)"
              :disabled="creatingKey"
            />
            <label :for="`perm-${perm}`">{{ formatPermission(perm) }}</label>
          </div>
        </div>
      </div>

      <div v-if="createMsg" :class="['api-key-message', createMsg.type]">
        {{ createMsg.text }}
      </div>

      <button
        @click="createNewKey"
        class="btn-primary"
        :disabled="!newKey.name || newKey.permissions.length === 0 || creatingKey"
      >
        {{ creatingKey ? 'Creating...' : 'Create API Key' }}
      </button>
    </div>

    <!-- Show Created Key (Only Once) -->
    <div v-if="createdKey" class="api-key-created-alert">
      <h3>⚠️ Save Your API Key Now</h3>
      <p class="warning-text">This is the only time your full API key will be displayed. Copy it now and store it securely!</p>
      
      <div class="key-display">
        <code class="key-code">{{ createdKey.full_key }}</code>
        <button @click="copyToClipboard(createdKey.full_key)" class="btn-copy">
          📋 Copy to Clipboard
        </button>
      </div>

      <div class="key-info">
        <p><strong>Key ID:</strong> {{ createdKey.key_id }}</p>
        <p><strong>Name:</strong> {{ createdKey.name }}</p>
        <p><strong>Permissions:</strong> {{ createdKey.permissions.join(', ') }}</p>
      </div>

      <button @click="dismissCreatedKey" class="btn-secondary">I've Saved My Key</button>
    </div>

    <!-- Existing API Keys List -->
    <div class="api-keys-list">
      <h3>Your API Keys</h3>

      <div v-if="loadingKeys" class="loading-state">
        <div class="loading-spinner">⟳</div>
        <p>Loading API keys...</p>
      </div>

      <div v-else-if="apiKeys.length === 0" class="empty-state">
        <p>No API keys created yet. Create your first one above!</p>
      </div>

      <div v-else class="keys-table-container">
        <table class="keys-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in apiKeys" :key="key.id" class="key-row" :class="{ inactive: !key.is_active }">
              <td class="key-name">
                {{ key.name }}
                <span v-if="key.description" class="description">{{ key.description }}</span>
              </td>
              <td class="key-prefix"><code>{{ key.key_prefix }}...</code></td>
              <td class="key-permissions">
                <span v-for="perm in key.permissions" :key="perm" class="permission-badge">
                  {{ formatPermission(perm) }}
                </span>
              </td>
              <td class="key-status">
                <span :class="['status-badge', key.is_active ? 'active' : 'inactive']">
                  {{ key.is_active ? '✓ Active' : '✗ Revoked' }}
                </span>
                <span v-if="key.expires_at" class="expires-info">
                  Expires: {{ formatDate(key.expires_at) }}
                </span>
              </td>
              <td class="key-created">{{ formatDate(key.created_at) }}</td>
              <td class="key-last-used">{{ key.last_used ? formatDate(key.last_used) : '—' }}</td>
              <td class="key-actions">
                <button
                  v-if="key.is_active"
                  @click="openEditKey(key)"
                  class="btn-small btn-edit"
                  title="Edit this key"
                >
                  ✏️
                </button>
                <button
                  v-if="key.is_active"
                  @click="revokeKey(key.id)"
                  class="btn-small btn-revoke"
                  title="Revoke this key"
                >
                  <SvgIcons icon="blocked" />
                </button>
                <button
                  @click="deleteKey(key.id)"
                  class="btn-small btn-delete"
                  title="Delete this key"
                >
                  <SvgIcons icon="trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Key Modal -->
    <div v-if="editingKey" class="modal-overlay" @click="closeEditKey">
      <div class="modal-content" @click.stop>
        <h3>Edit API Key</h3>
        
        <div class="form-group">
          <label>Name</label>
          <input
            v-model="editKey.name"
            type="text"
            class="form-input"
            :disabled="updatingKey"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="editKey.description"
            class="form-input"
            rows="3"
            :disabled="updatingKey"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Permissions</label>
          <div class="permissions-grid">
            <div v-for="perm in availablePermissions" :key="perm" class="permission-checkbox">
              <input
                :id="`edit-perm-${perm}`"
                :checked="editKey.permissions.includes(perm)"
                type="checkbox"
                @change="toggleEditPermission(perm)"
                :disabled="updatingKey"
              />
              <label :for="`edit-perm-${perm}`">{{ formatPermission(perm) }}</label>
            </div>
          </div>
        </div>

        <div v-if="editMsg" :class="['api-key-message', editMsg.type]">
          {{ editMsg.text }}
        </div>

        <div class="modal-actions">
          <button @click="updateKey" class="btn-primary" :disabled="updatingKey">
            {{ updatingKey ? 'Updating...' : 'Save Changes' }}
          </button>
          <button @click="closeEditKey" class="btn-secondary" :disabled="updatingKey">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'APIKeyManager',
  props: {
    token: { type: String, required: true },
    API_BASE_URL: { type: String, required: true },
    language: { type: String, default: 'en' }
  },
  data() {
    return {
      apiKeys: [],
      availablePermissions: [],
      creatingKey: false,
      loadingKeys: false,
      updatingKey: false,
      newKey: {
        name: '',
        description: '',
        permissions: [],
        expires_in_days: null
      },
      editingKey: false,
      editKey: {
        id: '',
        name: '',
        description: '',
        permissions: []
      },
      createdKey: null,
      createMsg: null,
      editMsg: null
    }
  },
  async mounted() {
    await this.loadAvailablePermissions();
    await this.loadAPIKeys();
  },
  methods: {
    async loadAvailablePermissions() {
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/permissions/list`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          this.availablePermissions = data.response.permissions;
        }
      } catch (error) {
        console.error('Failed to load permissions:', error);
      }
    },
    async loadAPIKeys() {
      this.loadingKeys = true;
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/list`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          this.apiKeys = data.response.keys;
        }
      } catch (error) {
        console.error('Failed to load API keys:', error);
      } finally {
        this.loadingKeys = false;
      }
    },
    togglePermission(perm) {
      const idx = this.newKey.permissions.indexOf(perm);
      if (idx > -1) {
        this.newKey.permissions.splice(idx, 1);
      } else {
        this.newKey.permissions.push(perm);
      }
    },
    toggleEditPermission(perm) {
      const idx = this.editKey.permissions.indexOf(perm);
      if (idx > -1) {
        this.editKey.permissions.splice(idx, 1);
      } else {
        this.editKey.permissions.push(perm);
      }
    },
    formatPermission(perm) {
      const labels = {
        'search': 'search Search',
        'upload': 'download Upload',
        'download': '📥 Download',
        'delete_documents': 'trash Delete Documents',
        'parse_users': '👥 Parse Users',
        'edit_users': '✏️ Edit Users',
        'view_reports': 'chart View Reports',
        'manage_api_keys': 'key Manage API Keys'
      };
      return labels[perm] || perm;
    },
    formatDate(dateStr) {
      if (!dateStr) return '—';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return dateStr;
      }
    },
    async createNewKey() {
      this.creatingKey = true;
      this.createMsg = null;
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: this.newKey.name,
              description: this.newKey.description,
              permissions: this.newKey.permissions,
              expires_in_days: this.newKey.expires_in_days
            })
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          this.createdKey = data.response;
          this.newKey = {
            name: '',
            description: '',
            permissions: [],
            expires_in_days: null
          };
          this.createMsg = { type: 'success', text: 'API key created! Copy it now - you won\'t see it again.' };
          await this.loadAPIKeys();
        } else {
          this.createMsg = { type: 'error', text: data.message || 'Failed to create API key' };
        }
      } catch (error) {
        this.createMsg = { type: 'error', text: 'Error: ' + error.message };
      } finally {
        this.creatingKey = false;
      }
    },
    dismissCreatedKey() {
      this.createdKey = null;
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('API Key copied to clipboard!');
    },
    openEditKey(key) {
      this.editingKey = true;
      this.editKey = {
        id: key.id,
        name: key.name,
        description: key.description,
        permissions: [...key.permissions]
      };
      this.editMsg = null;
    },
    closeEditKey() {
      this.editingKey = false;
      this.editMsg = null;
    },
    async updateKey() {
      this.updatingKey = true;
      this.editMsg = null;
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/${this.editKey.id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: this.editKey.name,
              description: this.editKey.description,
              permissions: this.editKey.permissions
            })
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          this.editMsg = { type: 'success', text: 'API key updated successfully!' };
          await this.loadAPIKeys();
          setTimeout(() => this.closeEditKey(), 1500);
        } else {
          this.editMsg = { type: 'error', text: data.message || 'Failed to update API key' };
        }
      } catch (error) {
        this.editMsg = { type: 'error', text: 'Error: ' + error.message };
      } finally {
        this.updatingKey = false;
      }
    },
    async revokeKey(keyId) {
      if (!confirm('Are you sure you want to revoke this API key? It will no longer work.')) return;
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/${keyId}/revoke`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          await this.loadAPIKeys();
        } else {
          alert('Failed to revoke API key: ' + data.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    },
    async deleteKey(keyId) {
      if (!confirm('Are you sure you want to permanently delete this API key?')) return;
      try {
        const response = await fetch(
          `${this.API_BASE_URL}/api-keys/${keyId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          await this.loadAPIKeys();
        } else {
          alert('Failed to delete API key: ' + data.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.api-keys-section {
  padding: 20px;
}

.admin-section-header {
  margin-bottom: 30px;
}

.admin-section-header h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #333;
}

.admin-section-header .subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

/* Create Panel */
.api-key-create-panel {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.api-key-create-panel h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.permissions-info {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.permission-checkbox {
  display: flex;
  align-items: center;
}

.permission-checkbox input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.permission-checkbox label {
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: normal;
}

.permission-checkbox input:disabled + label {
  opacity: 0.5;
  cursor: not-allowed;
}

.api-key-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
}

.api-key-message.success {
  background: #d1f2eb;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.api-key-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-secondary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Created Key Alert */
.api-key-created-alert {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.api-key-created-alert h3 {
  margin: 0 0 12px 0;
  color: #92400e;
}

.warning-text {
  color: #b45309;
  margin: 0 0 16px 0;
  font-size: 14px;
}

.key-display {
  background: white;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.key-code {
  flex: 1;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
  font-family: monospace;
  color: #374151;
}

.btn-copy {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
}

.btn-copy:hover {
  background: #1d4ed8;
}

.key-info {
  background: white;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.key-info p {
  margin: 8px 0;
}

.key-info strong {
  color: #92400e;
}

/* Keys List */
.api-keys-list {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.api-keys-list h3 {
  margin-top: 0;
  color: #333;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.loading-spinner {
  font-size: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.keys-table-container {
  overflow-x: auto;
}

.keys-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.keys-table thead {
  background: #f3f4f6;
  border-bottom: 2px solid #e0e0e0;
}

.keys-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
}

.keys-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.key-row {
  transition: background 0.2s;
}

.key-row:hover {
  background: #f9fafb;
}

.key-row.inactive {
  opacity: 0.6;
}

.key-name {
  font-weight: 500;
  color: #333;
}

.key-name .description {
  display: block;
  font-size: 12px;
  color: #666;
  font-weight: normal;
  margin-top: 4px;
}

.key-prefix code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 2px;
  color: #374151;
}

.key-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-badge {
  background: #dbeafe;
  color: #0c4a6e;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  white-space: nowrap;
}

.key-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.expires-info {
  font-size: 11px;
  color: #666;
}

.key-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  border: none;
  background: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
  border-radius: 4px;
}

.btn-small:hover {
  opacity: 0.7;
  background: #f0f0f0;
}

.btn-edit {
  color: #2563eb;
}

.btn-revoke {
  color: #f59e0b;
}

.btn-delete {
  color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: 1fr;
  }

  .keys-table {
    font-size: 12px;
  }

  .keys-table th,
  .keys-table td {
    padding: 8px;
  }

  .key-actions {
    flex-direction: column;
  }

  .api-key-create-panel {
    padding: 16px;
  }
}
</style>
