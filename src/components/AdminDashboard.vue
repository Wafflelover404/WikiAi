<template>
  <div>
    <div class="admin-dashboard">
      <div class="admin-tabs">
        <button v-for="tab in tabs" :key="tab" :class="['admin-tab', {active: activeTab === tab}]" @click="activeTab = tab">{{ tab }}</button>
      </div>
      <div class="admin-tab-content">
        <div v-if="activeTab === 'Users'">
          <div class="admin-section-header">
            <h2>Users</h2>
            <button @click="fetchUsers" class="refresh-btn">Refresh</button>
          </div>
          <table v-if="users.length" class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.username">
                <td>{{ user.username }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.last_login || 'Never' }}</td>
                <td>
                  <button class="danger-btn" @click="deleteUser(user.username)">Delete</button>
                  <button class="edit-btn" @click="openEditUser(user)">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-msg">No users found.</div>
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
              <button class="danger-btn" @click="deleteFile(file)">Delete</button>
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
  </div>
</template>

<script>
import UserEditModal from './UserEditModal.vue';
import ReportTable from './ReportTable.vue';

export default {
  name: 'AdminDashboard',
  components: { UserEditModal, ReportTable },
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
    };
  },
  methods: {
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
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0;
  margin: 0;
}
.admin-tabs {
  display: flex;
  gap: 0;
  background: #fff;
  border-bottom: 1.5px solid #e0e0e0;
}
.admin-tab {
  padding: 18px 36px;
  font-size: 18px;
  font-weight: 500;
  color: #1976d2;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-bottom 0.2s;
}
.admin-tab.active {
  border-bottom: 3px solid #1976d2;
  background: #e3f2fd;
  color: #1565c0;
}
.admin-tab-content {
  padding: 32px 48px;
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
</style>

