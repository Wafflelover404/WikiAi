<template>
  <div class="admin-dashboard">
    <!-- Modern Header with Navigation -->
    <div class="admin-header">
      <div class="admin-header-content">
        <div class="admin-title-section">
          <h1 class="admin-title">🛠️ Administration</h1>
          <p class="admin-subtitle">Manage users, files, and system settings</p>
        </div>
        <div class="admin-header-actions">
          <div class="admin-stats-quick">
            <div class="stat-item">
              <span class="stat-number">{{ users.length }}</span>
              <span class="stat-label">Users</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ files.length }}</span>
              <span class="stat-label">Files</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalReports }}</span>
              <span class="stat-label">Reports</span>
            </div>
          </div>
        </div>
      </div>
      <div class="admin-tabs">
        <button v-for="tab in tabs" :key="tab" :class="['admin-tab', {active: activeTab === tab}]" @click="activeTab = tab">
          <span class="tab-icon">{{ getTabIcon(tab) }}</span>
          <span class="tab-text">{{ tab }}</span>
        </button>
      </div>
    </div>
    
    <!-- Content Area with better layout -->
    <div class="admin-content">
      <div class="admin-tab-content">
        <div v-if="activeTab === 'Users'" class="users-section">
          <div class="admin-section-header">
            <h2>👥 User Management</h2>
            <div class="header-actions">
              <div class="search-users">
                <input 
                  v-model="userSearch" 
                  placeholder="Search users..." 
                  class="search-input"
                  :disabled="loadingUsers"
                />
                <span v-if="userSearch" class="search-results-count">{{ filteredUsers.length }} results</span>
              </div>
              <button @click="fetchUsers" class="refresh-btn" :disabled="loadingUsers">
                <span v-if="loadingUsers" class="spinner">⟳</span>
                <span v-else>🔄</span>
                Refresh
              </button>
            </div>
          </div>
          
          <div v-if="loadingUsers" class="loading-state">
            <div class="loading-spinner">⟳</div>
            <p>Loading users...</p>
          </div>
          
          <div v-else-if="filteredUsers.length" class="users-table-container">
            <table class="modern-users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Files Access</th>
                  <th class="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.username" class="user-row">
                  <td class="username-cell">
                    <div class="user-info">
                      <span class="username">{{ user.username }}</span>
                      <span v-if="user.username === 'admin'" class="admin-badge">Admin</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['role-badge', user.role]">{{ user.role }}</span>
                  </td>
                  <td class="last-login-cell">
                    <span v-if="user.last_login" class="login-time">{{ formatLoginTime(user.last_login) }}</span>
                    <span v-else class="never-logged">Never</span>
                  </td>
                  <td class="files-access-cell">
                    <span class="files-count">{{ getFileAccessText(user) }}</span>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button class="btn-edit" @click="openEditUser(user)" :disabled="loadingUsers">
                        ✏️ Edit
                      </button>
                      <button 
                        class="btn-delete" 
                        @click="deleteUser(user.username)" 
                        :disabled="loadingUsers || user.username === 'admin'"
                        :title="user.username === 'admin' ? 'Cannot delete admin user' : 'Delete user'"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No users found</h3>
            <p v-if="userSearch">Try adjusting your search terms</p>
            <p v-else>Create your first user to get started</p>
          </div>
          <div class="admin-section-sub">
            <h3>Create New User</h3>
            <form @submit.prevent="createUser" class="user-form">
              <input v-model="newUser.username" placeholder="Username" required />
              <div style="position: relative; display: flex; align-items: center;">
                <input
                  v-model="newUser.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  required
                  style="flex: 1;"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  style="position: absolute; right: 6px; background: none; border: none; cursor: pointer; font-size: 16px; color: #1976d2;"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  tabindex="-1"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <select v-model="newUser.role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <label>Allowed Files:</label>
              <select v-model="newUser.allowed_files" multiple>
                <option v-for="file in files" :key="file.filename" :value="file.filename">{{ file.filename }}</option>
                <option value="all">All Files</option>
              </select>
              <button type="submit" class="create-btn">Create User</button>
            </form>
            <div v-if="userCreateMsg" class="msg">{{ userCreateMsg }}</div>
          </div>
        </div>
  <div v-else-if="activeTab === 'Files'">
        <div class="admin-section-header">
          <h2>Files</h2>
          <button @click="fetchFiles" class="refresh-btn">Refresh</button>
        </div>
          <ul class="files-list">
            <li v-for="file in files" :key="file.file_id || file.filename">
              <span>{{ file.original_filename || file.filename }}</span>
              <span class="file-actions">
                <button class="danger-btn" @click="deleteFile(file)">Delete</button>
                <button class="edit-btn" @click="openEditFile(file)">Edit</button>
              </span>
            </li>
          </ul>
        <form @submit.prevent="uploadFile" class="file-form">
          <input type="file" ref="fileInput" />
          <button type="submit" class="upload-btn">Upload File</button>
        </form>
        <div v-if="fileUploadMsg" class="msg">{{ fileUploadMsg }}</div>
      </div>
    <div v-else-if="activeTab === 'Reports'">
      <div class="admin-section-header">
        <h2>Reports</h2>
        <button @click="fetchReports" class="refresh-btn">Refresh</button>
      </div>
      <div v-if="reportsMsg" class="msg">{{ reportsMsg }}</div>
      <div class="reports-tabs">
        <button :class="['report-tab', {active: reportTab === 'auto'}]" @click="reportTab = 'auto'">Automatic</button>
        <button :class="['report-tab', {active: reportTab === 'manual'}]" @click="reportTab = 'manual'">Manual</button>
      </div>
      <div class="reports-section scrollable-reports">
        <ReportTable v-if="reportTab === 'auto'" :reports="autoReports" empty-msg="No automatic reports found." />
        <ReportTable v-else :reports="manualReports" empty-msg="No manual reports found." />
      </div>
    </div>
    <div v-else-if="activeTab === 'System'">
          <div class="admin-section-header">
            <h2>System</h2>
          </div>
          <div class="system-actions">
            <button @click="fetchUsers" class="refresh-btn">Reload Users</button>
            <button @click="fetchFiles" class="refresh-btn">Reload Files</button>
          </div>
          <div class="system-info">
            <h3>API Endpoints (Admin Only)</h3>
            <ul>
              <li><b>POST</b> /register — Create user</li>
              <li><b>GET</b> /accounts — List users</li>
              <li><b>DELETE</b> /user/delete — Delete user</li>
              <li><b>POST</b> /user/edit — Edit user</li>
              <li><b>POST</b> /upload — Upload file</li>
              <li><b>DELETE</b> /files/delete_by_fileid — Delete file by file_id</li>
              <li><b>DELETE</b> /files/delete_by_filename — Delete file by filename</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- User Edit Modal: always mounted at root for proper overlay -->
    <UserEditModal
      v-if="editUserModal && editUserData"
      :editUserData="editUserData"
      :editUserMsg="editUserMsg"
      :files="files"
      @save="saveEditUser"
      @close="closeEditUser"
    />
    <FileEditModal
      v-if="editFileModal && editFileName"
      :filename="editFileName"
      :token="token"
      :API_BASE_URL="API_BASE_URL"
      @save="onFileEditSaved"
      @close="closeEditFile"
    />
  </div>
</template>

<script>
import UserEditModal from './UserEditModal.vue';
import ReportTable from './ReportTable.vue';
import FileEditModal from './FileEditModal.vue';

export default {
  name: 'AdminDashboard',
  components: { UserEditModal, ReportTable, FileEditModal },
  props: {
    token: { type: String, required: true },
    API_BASE_URL: { type: String, required: true }
  },
  data() {
    return {
      tabs: ['Users', 'Files', 'Reports', 'System'],
      activeTab: 'Users',
      users: [],
      files: [],
      newUser: {
        username: '',
        password: '',
        role: 'user',
        allowed_files: []
      },
      userCreateMsg: '',
      fileUploadMsg: '',
      editUserModal: false,
      editUserData: null,
      editUserMsg: '',
      showPassword: false,
      autoReports: [],
      manualReports: [],
      reportsMsg: '',
      reportTab: 'auto',
      editFileModal: false,
      editFileName: '',
      userSearch: '',
      loadingUsers: false,
      loadingFiles: false,
    };
  },
  computed: {
    totalReports() {
      return this.autoReports.length + this.manualReports.length;
    },
    filteredUsers() {
      if (!this.userSearch) return this.users;
      const search = this.userSearch.toLowerCase();
      return this.users.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
      );
    }
  },
  methods: {
    getTabIcon(tab) {
      const icons = {
        Users: '👥',
        Files: '📁',
        Reports: '📊',
        System: '⚙️'
      };
      return icons[tab] || '📄';
    },
    async fetchReports() {
      this.reportsMsg = '';
      try {
        // Fetch auto reports
        let res = await fetch(`${this.API_BASE_URL}/reports/get/auto`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        let data = await res.json();
        this.autoReports = Array.isArray(data.reports) ? data.reports : [];
        // Fetch manual reports
        res = await fetch(`${this.API_BASE_URL}/reports/get/manual`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        data = await res.json();
        this.manualReports = Array.isArray(data.reports) ? data.reports : [];
      } catch (e) {
        this.reportsMsg = 'Failed to fetch reports.';
        this.autoReports = [];
        this.manualReports = [];
      }
    },
    async fetchUsers() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/accounts`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!res.ok) {
          this.users = [];
          this.userCreateMsg = 'Failed to fetch users.';
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          this.users = data;
        } else {
          this.users = [];
        }
      } catch (e) {
        this.users = [];
        this.userCreateMsg = 'Error fetching users.';
      }
    },
    async fetchFiles() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/files/list`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.response && Array.isArray(data.response.documents)) {
          // Ensure each file object has file_id, filename, etc.
          this.files = data.response.documents.map(doc => ({ ...doc }));
          console.log('DEBUG: files after fetch', this.files);
        } else {
          this.files = [];
        }
      } catch (e) {
        this.files = [];
      }
    },
    async createUser() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(this.newUser)
        });
        const data = await res.json();
        this.userCreateMsg = data.message || 'User created.';
        if (data.status === 'success') {
          this.fetchUsers();
        }
      } catch (e) {
        this.userCreateMsg = 'Failed to create user.';
      }
    },
    async deleteUser(username) {
      if (!confirm(`Delete user ${username}?`)) return;
      try {
        const res = await fetch(`${this.API_BASE_URL}/user/delete?username=${encodeURIComponent(username)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        this.userCreateMsg = data.message || 'User deleted.';
        if (data.status === 'success') {
          this.fetchUsers();
        }
      } catch (e) {
        this.userCreateMsg = 'Failed to delete user.';
      }
    },
    async uploadFile() {
      try {
        const file = this.$refs.fileInput.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${this.API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          body: formData
        });
        const data = await res.json();
        this.fileUploadMsg = data.message || 'File uploaded.';
        if (data.status === 'success') {
          this.fetchFiles();
        }
      } catch (e) {
        this.fileUploadMsg = 'Failed to upload file.';
      }
    },
    async deleteFile(file) {
      // file can be an object with filename or just a string
        let file_id = file && file.file_id ? file.file_id : null;
        // Always use file.filename for deletion, never original_filename
        let filename = file && file.filename ? file.filename : '';
        if (!file_id && !filename) return;
        // Debug: log filename and code points
        if (filename) {
          const codePoints = Array.from(filename).map(c => c.codePointAt(0).toString(16)).join(' ');
          console.log('Deleting filename:', filename, '| length:', filename.length, '| code points:', codePoints);
        }
    const confirmMsg = `Delete file:\n- Name: ${file.original_filename || filename}\n- file_id: ${file.file_id || 'N/A'}\nContinue?`;
    if (!confirm(confirmMsg)) return;
        try {
          let res, data;
          if (file_id) {
            // Prefer file_id deletion
            res = await fetch(`${this.API_BASE_URL}/files/delete_by_fileid`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`
              },
              body: JSON.stringify({ file_id })
            });
          } else {
            // Fallback to filename (try original_filename first)
            res = await fetch(`${this.API_BASE_URL}/files/delete_by_filename?filename=${encodeURIComponent(filename)}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${this.token}` }
            });
          }
          data = await res.json();
          this.fileUploadMsg = data.message || 'File deleted.';
          if (data.status === 'success') {
            this.fetchFiles();
          }
        } catch (e) {
          this.fileUploadMsg = 'Failed to delete file.';
        }
    },
    openEditUser(user) {
      this.editUserModal = true;
      this.editUserData = {
        username: user.username,
        new_username: user.username,
        password: '',
        role: user.role,
        allowed_files: Array.isArray(user.allowed_files) ? [...user.allowed_files] : []
      };
      this.editUserMsg = '';
    },
    closeEditUser() {
      this.editUserModal = false;
      this.editUserData = null;
      this.editUserMsg = '';
    },
    async saveEditUser() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/user/edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          },
          body: JSON.stringify(this.editUserData)
        });
        const data = await res.json();
        this.editUserMsg = data.message || 'User updated.';
        if (data.status === 'success') {
          this.fetchUsers();
          setTimeout(() => this.closeEditUser(), 1200);
        }
      } catch (e) {
        this.editUserMsg = 'Failed to update user.';
      }
    },
    openEditFile(file) {
      this.editFileName = file.filename;
      this.editFileModal = true;
    },
    closeEditFile() {
      this.editFileModal = false;
      this.editFileName = '';
    },
    onFileEditSaved() {
      this.closeEditFile();
      this.fetchFiles();
    },
    formatLoginTime(loginTime) {
      if (!loginTime) return 'Never';
      const date = new Date(loginTime);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffHours < 24) {
        return diffHours < 1 ? 'Just now' : `${diffHours}h ago`;
      } else if (diffDays < 30) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    },
    getFileAccessText(user) {
      if (!user.allowed_files || !Array.isArray(user.allowed_files)) {
        return 'No access';
      }
      
      if (user.allowed_files.includes('all')) {
        return 'All files';
      }
      
      const fileCount = user.allowed_files.length;
      if (fileCount === 0) {
        return 'No access';
      } else if (fileCount === 1) {
        return '1 file';
      } else {
        return `${fileCount} files`;
      }
    }
  },
  mounted() {
    this.fetchUsers();
    this.fetchFiles();
    this.fetchReports();    
  }
};
</script>

<style scoped>
.admin-dashboard {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* Modern Header Styles */
.admin-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.admin-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-title-section {
  flex: 1;
}

.admin-title {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  font-weight: 400;
}

.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.admin-stats-quick {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #0d6efd;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  font-weight: 500;
}
/* Modern Tab Navigation */
.admin-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 40px;
}

.admin-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.admin-tab:hover {
  color: #0d6efd;
  background: rgba(13, 110, 253, 0.04);
}

.admin-tab.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: rgba(13, 110, 253, 0.04);
}

.tab-icon {
  font-size: 18px;
}

.tab-text {
  font-weight: 600;
}

/* Content Area */
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.admin-tab-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.admin-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.admin-section-sub {
  margin-top: 32px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 24px 18px;
  box-shadow: 0 1px 4px rgba(33, 150, 243, 0.04);
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.users-table th, .users-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.users-table th {
  background: #e3f2fd;
}
.danger-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: background 0.2s;
}
.danger-btn:hover {
  background: #b71c1c;
}
.edit-btn {
  background: linear-gradient(90deg, #42a5f5 60%, #1976d2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(33,150,243,0.08);
}
.edit-btn:hover {
  background: linear-gradient(90deg, #1976d2 60%, #1565c0 100%);
  box-shadow: 0 2px 8px rgba(33,150,243,0.13);
}
.empty-msg {
  margin-top: 16px;
  color: #888;
}
.user-form, .file-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.create-btn, .upload-btn, .refresh-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
}
.create-btn:hover, .upload-btn:hover, .refresh-btn:hover {
  background: #1565c0;
}
.files-list {
  margin-top: 16px;
  padding-left: 0;
  list-style: none;
}
.files-list li {
  background: #e3f2fd;
  margin-bottom: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.file-actions {
  display: flex;
  gap: 6px;
}
.msg {
  margin-top: 12px;
  color: #1976d2;
  font-size: 15px;
}
.system-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.system-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(33, 150, 243, 0.04);
}
.system-info ul {
  margin: 0;
  padding-left: 18px;
}
.system-info li {
  margin-bottom: 6px;
  font-size: 15px;
}
.reports-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 18px;
}
.report-tab {
  padding: 10px 32px;
  font-size: 16px;
  font-weight: 500;
  color: #1976d2;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-bottom 0.2s;
}
.report-tab.active {
  border-bottom: 3px solid #1976d2;
  background: #e3f2fd;
  color: #1565c0;
}
.scrollable-reports {
  max-height: 480px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(33, 150, 243, 0.04);
  padding: 12px 0;
}
.user-actions-cell {
  text-align: right;
}
.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* Enhanced User Management Styles */
.users-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-users {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  width: 300px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.search-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.search-results-count {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  font-size: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  color: #0d6efd;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modern-users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.modern-users-table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 16px 20px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-users-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.user-row {
  transition: background-color 0.2s ease;
}

.user-row:hover {
  background: #f8f9fa;
}

.user-row:last-child td {
  border-bottom: none;
}

.username-cell {
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  color: #212529;
  font-weight: 600;
}

.admin-badge {
  background: #dc3545;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.role-badge.user {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.login-time {
  color: #28a745;
  font-weight: 500;
}

.never-logged {
  color: #6c757d;
  font-style: italic;
}

.files-count {
  color: #495057;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.btn-edit:hover:not(:disabled) {
  background: #bbdefb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(21, 101, 192, 0.2);
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.btn-delete:hover:not(:disabled) {
  background: #ffcdd2;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(198, 40, 40, 0.2);
}

.btn-edit:disabled, .btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  color: #495057;
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
  font-size: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  
  .admin-stats-quick {
    width: 100%;
    justify-content: space-around;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .modern-users-table {
    font-size: 14px;
  }
  
  .modern-users-table th,
  .modern-users-table td {
    padding: 12px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-edit, .btn-delete {
    justify-content: center;
  }
}
</style>

