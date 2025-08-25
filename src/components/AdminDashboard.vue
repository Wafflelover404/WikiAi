<template>
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar-files">
      <div class="sidebar-header">
        <h3>Admin Dashboard</h3>
      </div>
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.key"
          class="file-placeholder"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <h3>Users</h3>
        <button @click="fetchUsers" class="action-btn">Refresh</button>
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
        <div v-if="userMsg" class="msg">{{ userMsg }}</div>
      </div>

      <!-- Create User Tab -->
      <div v-if="activeTab === 'createUser'">
        <h3>Create New User</h3>
        <form @submit.prevent="createUser" class="form">
          <input v-model="newUser.username" placeholder="Username" required />
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="newUser.password"
              placeholder="Password"
              required
            />
            <button type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <select v-model="newUser.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label>Allowed Files</label>
          <select v-model="newUser.allowed_files" multiple>
            <option v-for="file in files" :key="file.filename" :value="file.filename">
              {{ file.filename }}
            </option>
            <option value="all">All Files</option>
          </select>
          <button type="submit" class="action-btn">Create User</button>
        </form>
        <div v-if="userMsg" class="msg">{{ userMsg }}</div>
      </div>

      <!-- Files Tab -->
      <div v-if="activeTab === 'files'">
        <h3>Files</h3>
        <button @click="fetchFiles" class="action-btn">Refresh</button>
        <ul v-if="files.length" class="files-list">
          <li v-for="file in files" :key="file.filename" class="file-placeholder">{{ file.filename }}</li>
        </ul>
        <div v-else class="empty-msg">No files available.</div>

        <form @submit.prevent="uploadFile" class="form file-form">
          <input type="file" ref="fileInput" />
          <button type="submit" class="action-btn">Upload File</button>
        </form>
        <div v-if="fileMsg" class="msg">{{ fileMsg }}</div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard",
  props: { token: { type: String, required: true }, API_BASE_URL: {type: String, required: true} },
  data() {
    return {
      tabs: [
        { key: "users", label: "Users" },
        { key: "createUser", label: "Create User" },
        { key: "files", label: "Files" },
      ],
      activeTab: "users",
      users: [],
      files: [],
      newUser: { username: "", password: "", role: "user", allowed_files: [] },
      userMsg: "",
      fileMsg: "",
      showPassword: false,
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/accounts`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        let data;
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.substring(0, 200)}...`);
        }

        if (res.ok) {
          this.users = Array.isArray(data) ? data : data.users || [];
          this.userMsg = "";
        } else {
          this.users = [];
          this.userMsg = data.message || `Failed to fetch users (status ${res.status})`;
        }
      } catch (e) {
        this.users = [];
        this.userMsg = `Failed to fetch users: ${e.message}`;
      }
    },

    async fetchFiles() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/files/list`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        let data;
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.substring(0, 200)}...`);
        }

        if (res.ok) {
          this.files = data?.response?.files || data?.files || [];
          this.fileMsg = "";
        } else {
          this.files = [];
          this.fileMsg = data.message || `Failed to fetch files (status ${res.status})`;
        }
      } catch (e) {
        this.files = [];
        this.fileMsg = `Failed to fetch files: ${e.message}`;
      }
    },

    async createUser() {
      try {
        const res = await fetch(`${this.API_BASE_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify(this.newUser),
        });

        let data;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.substring(0, 200)}...`);
        }

        if (res.ok) {
          this.userMsg = data.message || "User created successfully";
          this.fetchUsers();
        } else {
          this.userMsg = data.message || `Failed to create user (status ${res.status})`;
        }
      } catch (e) {
        this.userMsg = `Failed to create user: ${e.message}`;
      }
    },

    async uploadFile() {
      try {
        const file = this.$refs.fileInput.files[0];
        if (!file) {
          this.fileMsg = "No file selected.";
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${this.API_BASE_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
          body: formData,
        });

        let data;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Unexpected response: ${text.substring(0, 200)}...`);
        }

        if (res.ok) {
          this.fileMsg = data.message || "File uploaded successfully";
          this.fetchFiles();
        } else {
          this.fileMsg = data.message || `Failed to upload file (status ${res.status})`;
        }
      } catch (e) {
        this.fileMsg = `Failed to upload file: ${e.message}`;
      }
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchFiles();
  },
};
</script>



<style scoped>
/* Full screen */
.container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #fafbfc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar */
.sidebar-files {
  width: 280px;
  background: #fff;
  border-right: 1px solid #eaecef;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-header h3 {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
  margin-left: 15px;
}

.sidebar-files ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.file-placeholder {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}
.file-placeholder:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.file-placeholder.active {
  background: #dee2e6;
  font-weight: 600;
}

/* Main content */
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* Forms & tables */
.users-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.users-table th, .users-table td { border: 1px solid #ddd; padding: 12px; }
.users-table th { background: #f1f1f1; }

.form input, .form select { padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; width: 100%; margin-top: 12px; }
.password-wrapper { display: flex; gap: 8px; align-items: center; }
.password-wrapper button { background: none; border: none; color: #1976d2; cursor: pointer; }

.action-btn { background: #1976d2; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; margin-top: 12px; }
.action-btn:hover { background: #115293; }

.files-list li { margin-bottom: 6px; }

.msg { margin-top: 12px; color: #388e3c; }
.empty-msg { margin-top: 16px; color: #888; font-style: italic; }

/* Responsive */
@media (max-width: 768px) {
  .container { flex-direction: column; height: auto; }
  .sidebar-files { width: 100%; border-right: none; border-bottom: 1px solid #eaecef; }
}
</style>
