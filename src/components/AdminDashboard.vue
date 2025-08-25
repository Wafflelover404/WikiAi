<template>
  <div class="admin-dashboard-full">
    <h2>Admin Dashboard</h2>
    <div class="dashboard-grid">
      <section class="dashboard-section">
        <h3>Users</h3>
        <button @click="fetchUsers" class="refresh-btn">Refresh</button>
        <table v-if="users.length" class="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.username">
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.last_login || 'Never' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-msg">No users found.</div>
      </section>

      <section class="dashboard-section">
        <h3>Create New User</h3>
        <form @submit.prevent="createUser" class="user-form">
          <input v-model="newUser.username" placeholder="Username" required />
          <input v-model="newUser.password" type="password" placeholder="Password" required />
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
      </section>

      <section class="dashboard-section">
        <h3>Files</h3>
        <button @click="fetchFiles" class="refresh-btn">Refresh</button>
        <ul class="files-list">
          <li v-for="file in files" :key="file.filename">{{ file.filename }}</li>
        </ul>
        <form @submit.prevent="uploadFile" class="file-form">
          <input type="file" ref="fileInput" />
          <button type="submit" class="upload-btn">Upload File</button>
        </form>
        <div v-if="fileUploadMsg" class="msg">{{ fileUploadMsg }}</div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      users: [],
      files: [],
      newUser: {
        username: '',
        password: '',
        role: 'user',
        allowed_files: []
      },
      userCreateMsg: '',
      fileUploadMsg: ''
    };
  },
  methods: {
    async fetchUsers() {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            this.userCreateMsg = 'No token found. Please log in.';
            this.users = [];
            return;
          }
          const apiUrl = this.$root.serverUrl || '';
          const headers = { Authorization: `Bearer ${token}` };
          // Debug: log token and headers
          console.log('Using token:', token);
          console.log('Request headers:', headers);
          const res = await fetch(`${apiUrl}/accounts`, {
            headers
          });
          if (!res.ok) {
            if (res.status === 403) {
              this.users = [];
              this.userCreateMsg = 'Access forbidden. Please check your permissions.';
              return;
            }
            this.users = [];
            this.userCreateMsg = `Failed to fetch users. Status: ${res.status}`;
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
          const token = localStorage.getItem('token');
          const res = await fetch('/files/list', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            if (res.status === 403) {
              this.files = [];
              this.fileUploadMsg = 'Access forbidden. Please check your permissions.';
              return;
            }
            this.files = [];
            this.fileUploadMsg = `Failed to fetch files. Status: ${res.status}`;
            return;
          }
          const data = await res.json();
          if (data && data.response && Array.isArray(data.response.files)) {
            this.files = data.response.files;
          } else {
            this.files = [];
          }
        } catch (e) {
          this.files = [];
          this.fileUploadMsg = 'Error fetching files.';
        }
    },
    async createUser() {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(this.newUser)
          });
          if (!res.ok) {
            if (res.status === 403) {
              this.userCreateMsg = 'Access forbidden. Please check your permissions.';
              return;
            }
            this.userCreateMsg = `Failed to create user. Status: ${res.status}`;
            return;
          }
          const data = await res.json();
          this.userCreateMsg = data.message || 'User created.';
          if (data.status === 'success') {
            this.fetchUsers();
          }
        } catch (e) {
          this.userCreateMsg = 'Failed to create user.';
        }
    },
    async uploadFile() {
        try {
          const token = localStorage.getItem('token');
          const file = this.$refs.fileInput.files[0];
          if (!file) return;
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          if (!res.ok) {
            if (res.status === 403) {
              this.fileUploadMsg = 'Access forbidden. Please check your permissions.';
              return;
            }
            this.fileUploadMsg = `Failed to upload file. Status: ${res.status}`;
            return;
          }
          const data = await res.json();
          this.fileUploadMsg = data.message || 'File uploaded.';
          if (data.status === 'success') {
            this.fetchFiles();
          }
        } catch (e) {
          this.fileUploadMsg = 'Failed to upload file.';
        }
    }
  },
  mounted() {
    this.fetchUsers();
    this.fetchFiles();
  }
};
</script>

<style scoped>
.admin-dashboard-full {
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0;
  margin: 0;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  padding: 48px 32px;
}
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(33, 150, 243, 0.10);
  padding: 32px 24px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.users-table th, .users-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.users-table th {
  background: #e3f2fd;
}
.empty-msg {
  margin-top: 16px;
  color: #888;
}
.user-form, .file-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
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
}
.msg {
  margin-top: 12px;
  color: #1976d2;
  font-size: 15px;
}
</style>
