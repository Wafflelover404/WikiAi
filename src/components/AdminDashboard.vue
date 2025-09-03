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
          <!-- <button @click="testAPIConnection" class="debug-btn" title="Test API Connection">
            🔧 Test API
          </button>
          <button @click="toggleAutoRefresh" class="auto-refresh-toggle" :class="{ active: isAutoRefreshEnabled }" :title="isAutoRefreshEnabled ? 'Disable Auto-refresh' : 'Enable Auto-refresh'">
            <span class="toggle-icon">{{ isAutoRefreshEnabled ? '⏸️' : '▶️' }}</span>
            <span class="toggle-text">{{ isAutoRefreshEnabled ? 'Pause' : 'Resume' }}</span>
          </button> -->
        </div>
      </div>
      <div class="admin-tabs" role="tablist" aria-label="Admin sections">
        <button
          v-for="(tab, idx) in tabs"
          :key="tab"
          :id="`admin-tab-${tab}`"
          :class="['admin-tab', {active: activeTab === tab}]"
          :tabindex="activeTab === tab ? 0 : -1"
          :aria-selected="activeTab === tab"
          role="tab"
          @click="switchTab(tab)"
          @keydown.left.prevent="focusPrevTab(idx)"
          @keydown.right.prevent="focusNextTab(idx)"
          @keydown.enter.space.prevent="switchTab(tab)"
          :title="tab"
        >
          <span class="tab-icon">{{ getTabIcon(tab) }}</span>
          <span class="tab-text">{{ tab }}</span>
        </button>
        <div class="tab-underline" :style="tabUnderline"></div>
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
              <div class="auto-refresh-status">
                <span class="status-indicator" :class="{ active: isAutoRefreshEnabled }"></span>
                <span class="status-text">{{ isAutoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF' }}</span>
                <span class="last-update">Updated {{ getLastUpdateTime('users') }}</span>
              </div>
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
              <div class="allowed-files-radio-group">
                <label>
                  <input type="radio" value="all" v-model="allowedFilesMode" />
                  All Files
                </label>
                <label>
                  <input type="radio" value="select" v-model="allowedFilesMode" />
                  Select Files
                </label>
              </div>
              <div v-if="allowedFilesMode === 'select'" class="allowed-files-checkboxes">
                <label v-for="file in files" :key="file.filename" class="file-checkbox-label">
                  <input type="checkbox" :value="file.filename" v-model="newUser.allowed_files" />
                  {{ file.filename }}
                </label>
              </div>
              <button type="submit" class="create-btn">Create User</button>
            </form>
            <div v-if="userCreateMsg" class="msg">{{ userCreateMsg }}</div>
          </div>
        </div>
        <div v-else-if="activeTab === 'Files'" class="files-section">
          <div class="admin-section-header">
            <h2>📁 File Management</h2>
            <div class="header-actions">
              <div class="search-files">
                <input 
                  v-model="fileSearch" 
                  placeholder="Search files..." 
                  class="search-input"
                  :disabled="loadingFiles"
                />
                <span v-if="fileSearch" class="search-results-count">{{ filteredFiles.length }} results</span>
              </div>
              <div class="auto-refresh-status">
                <span class="status-indicator" :class="{ active: isAutoRefreshEnabled }"></span>
                <span class="status-text">{{ isAutoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF' }}</span>
                <span class="last-update">Updated {{ getLastUpdateTime('files') }}</span>
              </div>
            </div>
          </div>

          <!-- Drag and Drop Upload Area -->
          <div 
            class="upload-zone"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleFileDrop"
          >
            <div class="upload-content">
              <div class="upload-icon">📤</div>
              <h3>Drag & Drop Files Here</h3>
              <p>or <button class="upload-link" @click="$refs.fileInput.click()">browse files</button></p>
              <input type="file" ref="fileInput" @change="handleFileSelect" multiple style="display: none;" />
            </div>
          </div>

          <div v-if="loadingFiles" class="loading-state">
            <div class="loading-spinner">⟳</div>
            <p>Loading files...</p>
          </div>

          <div v-else-if="filteredFiles.length" class="files-table-container">
            <table class="modern-users-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th class="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in filteredFiles" :key="file.file_id || file.filename" class="file-row">
                  <td class="file-name-cell">
                    <div class="file-name-info">
                      <span class="file-icon-small">{{ getFileIcon(file) }}</span>
                      <span class="file-name">{{ file.original_filename || file.filename }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="file-type-badge">{{ getFileType(file) }}</span>
                  </td>
                  <td class="file-size-cell">
                    {{ formatFileSize(file.size) }}
                  </td>
                  <td class="file-date-cell">
                    {{ formatFileDate(file.created_at || file.uploaded_at) }}
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button class="btn-preview" @click="previewFile(file)" title="Preview">
                        👁️ Preview
                      </button>
                      <button class="btn-edit" @click="openEditFile(file)" title="Edit">
                        ✏️ Edit
                      </button>
                      <button class="btn-delete" @click="deleteFile(file)" title="Delete">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>No files found</h3>
            <p v-if="fileSearch">Try adjusting your search terms</p>
            <p v-else>Upload your first file to get started</p>
          </div>

          <div v-if="fileUploadMsg" class="msg">{{ fileUploadMsg }}</div>
        </div>
        
        <div v-else-if="activeTab === 'Reports'" class="reports-section">
          <div class="admin-section-header">
            <h2>📊 Reports & Analytics</h2>
            <div class="header-actions">
              <div class="reports-overview">
                <div class="overview-card total">
                  <div class="overview-icon">📊</div>
                  <div class="overview-content">
                    <div class="overview-number">{{ totalReports }}</div>
                    <div class="overview-label">Total Reports</div>
                  </div>
                </div>
                <div class="overview-card auto">
                  <div class="overview-icon">🤖</div>
                  <div class="overview-content">
                    <div class="overview-number">{{ autoReports.length }}</div>
                    <div class="overview-label">Auto Reports</div>
                  </div>
                </div>
                <div class="overview-card manual">
                  <div class="overview-icon">✍️</div>
                  <div class="overview-content">
                    <div class="overview-number">{{ manualReports.length }}</div>
                    <div class="overview-label">Manual Reports</div>
                  </div>
                </div>
              </div>
              <div class="auto-refresh-status">
                <span class="status-indicator" :class="{ active: isAutoRefreshEnabled }"></span>
                <span class="status-text">{{ isAutoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF' }}</span>
                <span class="last-update">Updated {{ getLastUpdateTime('reports') }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="reportsMsg" class="message-banner" :class="reportsMsg.includes('error') ? 'error' : 'success'">
            <span class="message-icon">{{ reportsMsg.includes('error') ? '⚠️' : '✅' }}</span>
            {{ reportsMsg }}
          </div>
          
          <div class="reports-navigation">
            <div class="reports-tabs">
              <button 
                :class="['report-tab', {active: reportTab === 'auto'}]" 
                @click="reportTab = 'auto'"
              >
                <span class="tab-icon">🤖</span>
                <span class="tab-text">Automatic</span>
                <span class="tab-count">{{ autoReports.length }}</span>
              </button>
              <button 
                :class="['report-tab', {active: reportTab === 'manual'}]" 
                @click="reportTab = 'manual'"
              >
                <span class="tab-icon">✍️</span>
                <span class="tab-text">Manual</span>
                <span class="tab-count">{{ manualReports.length }}</span>
              </button>
            </div>
          </div>
          
          <div class="reports-content">
            <div v-if="reportTab === 'auto'" class="report-category">
              <div class="category-header">
                <h3>🤖 Automatic System Reports</h3>
                <p class="category-description">Reports generated automatically by the system for security, access control, and system health monitoring.</p>
              </div>
              
              <div v-if="autoReports.length" class="reports-grid">
                <div v-for="(report, index) in autoReports" :key="index" class="report-card auto">
                  <div class="report-header">
                    <div class="report-type">🤖 Auto</div>
                    <div class="report-priority" :class="getReportPriority(report)">{{ getReportPriority(report) }}</div>
                  </div>
                  <div class="report-content">
                    <h4 class="report-title">{{ report.issue || 'System Report' }}</h4>
                    <p class="report-description">{{ report.description || 'Automated system report' }}</p>
                    <div class="report-meta">
                      <span class="meta-item">
                        <span class="meta-icon">👤</span>
                        {{ report.user || 'System' }}
                      </span>
                      <span class="meta-item">
                        <span class="meta-icon">📅</span>
                        {{ formatReportDate(report.timestamp || report.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-reports">
                <div class="empty-icon">🤖</div>
                <h3>No Automatic Reports</h3>
                <p>The system is running smoothly with no automatic reports to display.</p>
              </div>
            </div>
            
            <div v-else class="report-category">
              <div class="category-header">
                <h3>✍️ User-Submitted Reports</h3>
                <p class="category-description">Reports submitted by users for issues, feature requests, or general feedback.</p>
              </div>
              
              <div v-if="manualReports.length" class="reports-grid">
                <div v-for="(report, index) in manualReports" :key="index" class="report-card manual">
                  <div class="report-header">
                    <div class="report-type">✍️ Manual</div>
                    <div class="report-priority" :class="getReportPriority(report)">{{ getReportPriority(report) }}</div>
                  </div>
                  <div class="report-content">
                    <h4 class="report-title">{{ report.issue || 'User Report' }}</h4>
                    <p class="report-description">{{ report.description || 'User-submitted report' }}</p>
                    <div class="report-meta">
                      <span class="meta-item">
                        <span class="meta-icon">👤</span>
                        {{ report.user || 'Unknown User' }}
                      </span>
                      <span class="meta-item">
                        <span class="meta-icon">📅</span>
                        {{ formatReportDate(report.timestamp || report.created_at) }}
                      </span>
                      <span v-if="report.permitted_files && report.permitted_files.length" class="meta-item">
                        <span class="meta-icon">📁</span>
                        {{ report.permitted_files.length }} files
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-reports">
                <div class="empty-icon">✍️</div>
                <h3>No Manual Reports</h3>
                <p>Users haven't submitted any reports yet.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'System'" class="system-section">
          <div class="admin-section-header">
            <h2>⚙️ System Administration</h2>
            <div class="header-actions">
              <div class="system-status">
                <span class="status-indicator online"></span>
                <span class="status-text">System Online</span>
              </div>
            </div>
          </div>
          
          <div class="system-grid">
            <!-- System Actions Card -->
            <div class="system-card">
              <div class="card-header">
                <h3>🔄 System Operations</h3>
                <p>Manage system data and refresh information</p>
              </div>
              <div class="card-content">
                <div class="action-grid">
                  <div class="system-action-btn auto-refresh-control">
                    <span class="action-icon">⏰</span>
                    <span class="action-text">Auto-refresh</span>
                    <span class="action-status" :class="{ active: isAutoRefreshEnabled }">
                      {{ isAutoRefreshEnabled ? 'ON' : 'OFF' }}
                    </span>
                    <button @click="toggleAutoRefresh" class="mini-toggle" :title="isAutoRefreshEnabled ? 'Disable' : 'Enable'">
                      {{ isAutoRefreshEnabled ? '⏸️' : '▶️' }}
                    </button>
                  </div>
                  <div class="system-action-btn refresh-frequency">
                    <span class="action-icon">⚡</span>
                    <span class="action-text">Update Every</span>
                    <span class="action-status">{{ updateFrequency / 1000 }}s</span>
                  </div>
                  <div class="system-action-btn last-updates">
                    <span class="action-icon">📅</span>
                    <span class="action-text">Last Updates</span>
                    <div class="update-times">
                      <span class="update-time">Users: {{ getLastUpdateTime('users') }}</span>
                      <span class="update-time">Files: {{ getLastUpdateTime('files') }}</span>
                      <span class="update-time">Reports: {{ getLastUpdateTime('reports') }}</span>
                    </div>
                  </div>
                  <button @click="testAPIConnection" class="system-action-btn">
                    <span class="action-icon">🔧</span>
                    <span class="action-text">Test API</span>
                    <span class="action-status">Test</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- API Documentation Card -->
            <div class="system-card">
              <div class="card-header">
                <h3>📚 API Documentation</h3>
                <p>Available endpoints and their usage</p>
              </div>
              <div class="card-content">
                <div class="api-endpoints">
                  <div class="endpoint-group">
                    <h4>👥 User Management</h4>
                    <div class="endpoint-list">
                      <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/register</span>
                        <span class="description">Create new user</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method get">GET</span>
                        <span class="path">/accounts</span>
                        <span class="description">List all users</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method delete">DELETE</span>
                        <span class="path">/user/delete</span>
                        <span class="description">Delete user</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/user/edit</span>
                        <span class="description">Edit user</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="endpoint-group">
                    <h4>📁 File Management</h4>
                    <div class="endpoint-list">
                      <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/upload</span>
                        <span class="description">Upload file</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method get">GET</span>
                        <span class="path">/files/list</span>
                        <span class="description">List files</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method delete">DELETE</span>
                        <span class="path">/files/delete_by_fileid</span>
                        <span class="description">Delete by ID</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method delete">DELETE</span>
                        <span class="path">/files/delete_by_filename</span>
                        <span class="description">Delete by name</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="endpoint-group">
                    <h4>📊 Reports</h4>
                    <div class="endpoint-list">
                      <div class="endpoint-item">
                        <span class="method get">GET</span>
                        <span class="path">/reports/get/auto</span>
                        <span class="description">Auto reports</span>
                      </div>
                      <div class="endpoint-item">
                        <span class="method get">GET</span>
                        <span class="path">/reports/get/manual</span>
                        <span class="description">Manual reports</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- System Info Card -->
            <div class="system-card">
              <div class="card-header">
                <h3>ℹ️ System Information</h3>
                <p>Current system status and configuration</p>
              </div>
              <div class="card-content">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">API Base URL</span>
                    <span class="info-value">{{ API_BASE_URL }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Authentication</span>
                    <span class="info-value">Bearer Token</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Session Type</span>
                    <span class="info-value">UUID-based</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Security</span>
                    <span class="info-value">File Access Control</span>
                  </div>
                </div>
              </div>
            </div>
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
    <FileModalOpener
      v-if="previewModalOpen && previewModalFile"
      :filename="previewModalFile.filename"
      :content="previewModalContent"
      :loading="previewModalLoading"
      @close="closePreviewModal"
    />
  </div>
</template>

<script>
import UserEditModal from './UserEditModal.vue';
import ReportTable from './ReportTable.vue';
import FileEditModal from './FileEditModal.vue';
import FileModalOpener from './FileModalOpener.vue';

export default {
  name: 'AdminDashboard',
  components: { UserEditModal, ReportTable, FileEditModal, FileModalOpener },
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
      allowedFilesMode: 'all',
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
      loadingReports: false,
      fileSearch: '',
      filesView: 'grid',
      isDragOver: false,
      tabUnderline: {
        width: '0px',
        left: '0px',
        transition: 'all 0.3s cubic-bezier(.55,0,.1,1)'
      },
      // Auto-refresh settings
      autoRefreshInterval: null,
      lastUpdate: {
        users: null,
        files: null,
        reports: null
      },
      updateFrequency: 30000, // 30 seconds
      isAutoRefreshEnabled: true,
      // Preview modal data
      previewModalOpen: false,
      previewModalFile: null,
      previewModalContent: '',
      previewModalLoading: false,
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
    },
    filteredFiles() {
      if (!this.fileSearch) return this.files;
      const search = this.fileSearch.toLowerCase();
      return this.files.filter(file => {
        const name = (file.original_filename || file.filename || '').toLowerCase();
        return name.includes(search);
      });
    }
  },
  watch: {
    activeTab: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          const tabs = this.$el.querySelectorAll('.admin-tab');
          const idx = this.tabs.indexOf(this.activeTab);
          if (tabs && tabs[idx]) {
            const tab = tabs[idx];
            this.tabUnderline = {
              width: tab.offsetWidth + 'px',
              left: tab.offsetLeft + 'px',
              transition: 'all 0.3s cubic-bezier(.55,0,.1,1)'
            };
          }
        });
      }
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
    async fetchReports(silent = false) {
      if (!silent) {
        this.reportsMsg = '';
        this.loadingReports = true;
      }
      
      try {
        const { getAutoReports, getManualReports } = await import('../api.js');
        
        // Fetch both types of reports in parallel
        const [autoData, manualData] = await Promise.all([
          getAutoReports({ 
            serverUrl: this.API_BASE_URL, 
            token: this.token 
          }),
          getManualReports({ 
            serverUrl: this.API_BASE_URL, 
            token: this.token 
          })
        ]);

        // Process auto reports
        if (autoData && autoData.status === 'success' && autoData.response) {
          this.autoReports = Array.isArray(autoData.response.reports) 
            ? autoData.response.reports 
            : Array.isArray(autoData.response) 
              ? autoData.response 
              : [];
        } else {
          this.autoReports = [];
        }

        // Process manual reports
        if (manualData && manualData.status === 'success' && manualData.response) {
          this.manualReports = Array.isArray(manualData.response.reports) 
            ? manualData.response.reports 
            : Array.isArray(manualData.response) 
              ? manualData.response 
              : [];
        } else {
          this.manualReports = [];
        }

        console.log('Reports fetched:', { 
          auto: this.autoReports, 
          manual: this.manualReports,
          autoData,
          manualData
        });
        
        this.lastUpdate.reports = new Date();
      } catch (e) {
        console.error('Error fetching reports:', e);
        if (!silent) {
          this.reportsMsg = 'Failed to fetch reports: ' + e.message;
        }
        this.autoReports = [];
        this.manualReports = [];
      } finally {
        if (!silent) {
          this.loadingReports = false;
        }
      }
    },
    async fetchUsers(silent = false) {
      if (!silent) {
        this.loadingUsers = true;
      }
      
      try {
        const { getAccounts } = await import('../api.js');
        console.log('Fetching users from:', `${this.API_BASE_URL}/accounts`);
        const data = await getAccounts({
          serverUrl: this.API_BASE_URL,
          token: this.token
        });
        console.log('Users response data:', data);
        
        if (Array.isArray(data)) {
          this.users = data;
          console.log('Users loaded:', this.users.length);
          this.lastUpdate.users = new Date();
        } else {
          console.warn('Users response not an array:', data);
          this.users = [];
        }
      } catch (e) {
        console.error('Error fetching users:', e);
        this.users = [];
        if (!silent) {
          this.userCreateMsg = 'Error fetching users: ' + e.message;
        }
      } finally {
        if (!silent) {
          this.loadingUsers = false;
        }
      }
    },
    async fetchFiles(silent = false) {
      if (!silent) {
        this.loadingFiles = true;
      }
      
      try {
        const { getFilesList } = await import('../api.js');
        console.log('Fetching files from:', `${this.API_BASE_URL}/files/list`);
        const data = await getFilesList({
          serverUrl: this.API_BASE_URL,
          token: this.token
        });
        console.log('Files response data:', data);
        
        if (data.status === 'success' && data.response && Array.isArray(data.response.documents)) {
          // Ensure each file object has file_id, filename, etc.
          this.files = data.response.documents.map(doc => ({ ...doc }));
          console.log('DEBUG: files after fetch', this.files);
          this.lastUpdate.files = new Date();
        } else {
          console.warn('Files response not in expected format:', data);
          this.files = [];
        }
      } catch (e) {
        console.error('Error fetching files:', e);
        this.files = [];
      } finally {
        if (!silent) {
          this.loadingFiles = false;
        }
      }
    },
    async createUser() {
        // Set allowed_files based on radio selection
        if (this.allowedFilesMode === 'all') {
          this.newUser.allowed_files = ['all'];
        } else if (this.allowedFilesMode === 'select') {
          // Remove 'all' if present
          this.newUser.allowed_files = this.newUser.allowed_files.filter(f => f !== 'all');
          // if (this.newUser.allowed_files.length === 0) {
          //   this.userCreateMsg = 'Please select at least one file.';
          //   return;
          // }
        }
      try {
        const { createUser } = await import('../api.js');
        const res = await createUser({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          userData: this.newUser
        });
        const data = await res.json();
        this.userCreateMsg = data.message || 'User created.';
        if (data.status === 'success') {
          this.fetchUsers();
          this.newUser = { username: '', password: '', role: 'user', allowed_files: [] };
          this.allowedFilesMode = 'all';
        }
      } catch (e) {
        this.userCreateMsg = 'Failed to create user.';
      }
    },
    async deleteUser(username) {
      if (!confirm(`Delete user ${username}?`)) return;
      try {
        const { deleteUser } = await import('../api.js');
        const res = await deleteUser({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          username
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
        const { uploadFile } = await import('../api.js');
        const res = await uploadFile({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          file
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
          const { deleteFileById, deleteFileByName } = await import('../api.js');
          let res;
          if (file_id) {
            // Prefer file_id deletion
            res = await deleteFileById({
              serverUrl: this.API_BASE_URL,
              token: this.token,
              fileId: file_id
            });
          } else {
            // Fallback to filename (try original_filename first)
            res = await deleteFileByName({
              serverUrl: this.API_BASE_URL,
              token: this.token,
              filename
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
        const { editUser } = await import('../api.js');
        const res = await editUser({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          userData: this.editUserData
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
    },
    focusPrevTab(idx) {
      const prev = (idx - 1 + this.tabs.length) % this.tabs.length;
      this.$el.querySelectorAll('.admin-tab')[prev].focus();
    },
    focusNextTab(idx) {
      const next = (idx + 1) % this.tabs.length;
      this.$el.querySelectorAll('.admin-tab')[next].focus();
    },
    handleFileDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = Array.from(event.dataTransfer.files);
      this.uploadFiles(files);
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.uploadFiles(files);
    },
    async uploadFiles(fileList) {
      if (!fileList || fileList.length === 0) return;
      
      this.loadingFiles = true;
      try {
        for (const file of fileList) {
          const formData = new FormData();
          formData.append('file', file);
          
          const res = await fetch(`${this.API_BASE_URL}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.token}` },
            body: formData
          });
          
          const data = await res.json();
          if (data.status === 'success') {
            this.fileUploadMsg = `File ${file.name} uploaded successfully!`;
          } else {
            this.fileUploadMsg = `Failed to upload ${file.name}: ${data.message}`;
          }
        }
        
        // Refresh the files list
        await this.fetchFiles();
      } catch (e) {
        this.fileUploadMsg = 'Failed to upload files.';
      } finally {
        this.loadingFiles = false;
      }
    },
    getFileIcon(file) {
      const filename = file.original_filename || file.filename || '';
      if (filename.endsWith('.pdf')) return '📄';
      if (filename.endsWith('.doc') || filename.endsWith('.docx')) return '📝';
      if (filename.endsWith('.txt') || filename.endsWith('.md')) return '📄';
      if (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.gif')) return '🖼️';
      return '📁';
    },
    getFileType(file) {
      const filename = file.original_filename || file.filename || '';
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'PDF';
      if (ext === 'doc' || ext === 'docx') return 'Word';
      if (ext === 'txt' || ext === 'md') return 'Text';
      if (ext === 'jpg' || ext === 'png' || ext === 'gif') return 'Image';
      return ext ? ext.toUpperCase() : 'Unknown';
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    formatFileDate(dateString) {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
  async previewFile(file) {
      this.previewModalOpen = true;
      this.previewModalFile = file;
      this.previewModalLoading = true;
      
      try {
        let filename = file.filename;
        if (filename.startsWith('temp_')) {
          filename = filename.slice(5);
        }
        if (filename.startsWith('file:')) {
          filename = filename.slice(5);
        }
        
        const { getFileContent } = await import('../api.js');
        const res = await getFileContent({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          filename: filename
        });

        // Check content type of response
        const contentType = res.headers.get('content-type');
        console.log('Response content type:', contentType);

        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.status === 'error') {
            throw new Error(data.message || 'Failed to load file content');
          }

          // Set the content and handle highlighting if segments are present
          if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
            this.previewModalContent = this.highlightSegments(data.content, data.segments);
          } else {
            this.previewModalContent = data.content || '';
          }
        } else {
          // If not JSON, treat as plain text
          const textContent = await res.text();
          this.previewModalContent = textContent;
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        this.previewModalContent = `Failed to load file content: ${error.message}`;
      } finally {
        this.previewModalLoading = false;
      }
    },
    closePreviewModal() {
      this.previewModalOpen = false;
      this.previewModalFile = null;
      this.previewModalContent = '';
      this.previewModalLoading = false;
    },
    
    highlightSegments(content, segments) {
      if (!content || !segments || !Array.isArray(segments) || segments.length === 0) {
        return content;
      }

      try {
        let highlighted = content;
        // Sort segments by length in descending order to handle overlapping matches
        const sortedSegments = [...segments].sort((a, b) => b.length - a.length);
        
        for (const segment of sortedSegments) {
          if (typeof segment !== 'string' || segment.length === 0) {
            continue;
          }
          
          // Escape special characters in the segment for use in regex
          const escapedSegment = segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedSegment, 'g');
          
          // Replace with highlighted span, ensuring we don't replace inside already highlighted spans
          highlighted = highlighted.replace(regex, match => `<span class="highlight">${match}</span>`);
        }
        
        return highlighted;
      } catch (error) {
        console.error('Error highlighting segments:', error);
        return content;
      }
    },
    
    async testAPIConnection() {
      try {
        console.log('Testing API connection to:', this.API_BASE_URL);
        const res = await fetch(`${this.API_BASE_URL}/`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        console.log('API connection test successful:', data);
        return true;
      } catch (e) {
        console.error('API connection test failed:', e);
        return false;
      }
    },
    
    async switchTab(tabName) {
      console.log('Switching to tab:', tabName);
      this.activeTab = tabName;
      
      // Load data for the selected tab
      if (tabName === 'Users') {
        await this.fetchUsers();
      } else if (tabName === 'Files') {
        await this.fetchFiles();
      } else if (tabName === 'Reports') {
        await this.fetchReports();
      }
      
      console.log('Tab switched to:', this.activeTab);
    },
    
    getReportPriority(report) {
      // Determine priority based on report content or type
      if (report.issue && report.issue.toLowerCase().includes('error')) return 'high';
      if (report.issue && report.issue.toLowerCase().includes('warning')) return 'medium';
      return 'low';
    },
    
    formatReportDate(dateString) {
      if (!dateString) return 'Unknown';
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
      } catch (e) {
        return 'Invalid date';
      }
    },
    
    // Auto-refresh methods
    startAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
      }
      
      this.autoRefreshInterval = setInterval(() => {
        if (this.isAutoRefreshEnabled) {
          this.performAutoRefresh();
        }
      }, this.updateFrequency);
      
      console.log('Auto-refresh started with', this.updateFrequency / 1000, 'second intervals');
    },
    
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
        console.log('Auto-refresh stopped');
      }
    },
    
    async performAutoRefresh() {
      console.log('Performing auto-refresh...');
      
      // Refresh data based on active tab
      switch (this.activeTab) {
        case 'Users':
          await this.fetchUsers(true); // silent refresh
          break;
        case 'Files':
          await this.fetchFiles(true); // silent refresh
          break;
        case 'Reports':
          await this.fetchReports(true); // silent refresh
          break;
        default:
          // Refresh all data for system tab
          await Promise.all([
            this.fetchUsers(true),
            this.fetchFiles(true),
            this.fetchReports(true)
          ]);
          break;
      }
      
      // Update last update timestamps
      this.lastUpdate[this.activeTab.toLowerCase()] = new Date();
    },
    
    toggleAutoRefresh() {
      this.isAutoRefreshEnabled = !this.isAutoRefreshEnabled;
      if (this.isAutoRefreshEnabled) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
      console.log('Auto-refresh', this.isAutoRefreshEnabled ? 'enabled' : 'disabled');
    },
    
    getLastUpdateTime(tabName) {
      const lastUpdate = this.lastUpdate[tabName.toLowerCase()];
      if (!lastUpdate) return 'Never';
      
      const now = new Date();
      const diffMs = now - lastUpdate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      
      if (diffSeconds < 60) return `${diffSeconds}s ago`;
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      return lastUpdate.toLocaleTimeString();
    }
  },
  mounted() {
    // Initial data load
    this.fetchUsers();
    this.fetchFiles();
    this.fetchReports();
    
    // Start auto-refresh
    this.startAutoRefresh();
    
    // Set initial timestamps
    this.lastUpdate.users = new Date();
    this.lastUpdate.files = new Date();
    this.lastUpdate.reports = new Date();
  },
  
  beforeUnmount() {
    // Clean up auto-refresh interval
    this.stopAutoRefresh();
  }
};
</script>

<style scoped>
:root {
  --primary: #4285f4;
  --primary-dark: #1976d2;
  --primary-light: #e3f2fd;
  --tab-radius: 16px;
  --tab-bg: #fff;
  --tab-hover-bg: #f8f9fa;
  --tab-active-bg: #e3f2fd;
  --tab-shadow: 0 2px 8px rgba(66, 133, 244, 0.08);
}
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
  
  .debug-btn {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .debug-btn:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }
  
  .auto-refresh-toggle {
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .auto-refresh-toggle:hover {
    background: #218838;
    transform: translateY(-1px);
  }
  
  .auto-refresh-toggle.active {
    background: #dc3545;
  }
  
  .auto-refresh-toggle.active:hover {
    background: #c82333;
  }
  
  .toggle-icon {
    font-size: 16px;
  }
  
  .toggle-text {
    font-weight: 600;
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
  position: relative;
  background: var(--tab-bg);
  border-bottom: none;
  padding: 0 40px;
  box-shadow: var(--tab-shadow);
  border-radius: var(--tab-radius) var(--tab-radius) 0 0;
  overflow-x: auto;
}

.admin-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  background: none;
  border: none;
  border-radius: var(--tab-radius) var(--tab-radius) 0 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  text-decoration: none;
  position: relative;
  outline: none;
}

.admin-tab:focus {
  box-shadow: 0 0 0 3px var(--primary-light);
  z-index: 2;
}

.admin-tab:hover {
  color: var(--primary);
  background: var(--tab-hover-bg);
}

.admin-tab.active {
  color: var(--primary-dark);
  background: var(--tab-active-bg);
  z-index: 1;
}

.tab-icon {
  font-size: 18px;
}

.tab-text {
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 60%, var(--primary-dark) 100%);
  border-radius: 2px 2px 0 0;
  transition: all 0.3s cubic-bezier(.55,0,.1,1);
  will-change: left, width;
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
  
  .auto-refresh-status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .auto-refresh-status .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6c757d;
    transition: all 0.3s ease;
  }
  
  .auto-refresh-status .status-indicator.active {
    background: #28a745;
    box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
  }
  
  .auto-refresh-status .status-text {
    font-size: 12px;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .auto-refresh-status .last-update {
    font-size: 11px;
    color: #6c757d;
    font-weight: 500;
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
  .admin-tabs {
    padding: 0 8px;
    border-radius: 0;
  }
  .admin-tab {
    padding: 12px 16px;
    font-size: 15px;
  }
  
  .system-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .reports-tabs {
    flex-direction: column;
  }
  
  .report-tab {
    padding: 12px 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .endpoint-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .path {
    min-width: auto;
    font-size: 12px;
  }
  
  .reports-overview {
    flex-direction: column;
    gap: 12px;
  }
  
  .overview-card {
    padding: 12px 16px;
  }
  
  .overview-number {
    font-size: 20px;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .report-card {
    padding: 16px;
  }
  
  .report-meta {
    flex-direction: column;
    gap: 8px;
  }
}

/* Files Section Styles */
.files-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone.drag-over {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.7;
}

.upload-content h3 {
  margin: 0;
  color: #495057;
  font-size: 20px;
  font-weight: 600;
}

.upload-content p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
}

.upload-link {
  background: none;
  border: none;
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.upload-link:hover {
  color: var(--primary-dark);
}

.files-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.file-row {
  transition: background-color 0.2s ease;
}

.file-row:hover {
  background: #f8f9fa;
}

.file-name-cell {
  font-weight: 600;
}

.file-name-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon-small {
  font-size: 20px;
}

.file-name {
  color: #212529;
  font-weight: 600;
}

.file-type-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.file-size-cell, .file-date-cell {
  color: #495057;
  font-weight: 500;
}

.btn-preview {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-preview:hover {
  background: #c8e6c9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
}

/* Reports Section Styles */
.reports-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reports-overview {
  display: flex;
  gap: 16px;
  align-items: center;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.overview-card.total {
  border-left: 4px solid var(--primary);
}

.overview-card.auto {
  border-left: 4px solid #1565c0;
}

.overview-card.manual {
  border-left: 4px solid #7b1fa2;
}

.overview-icon {
  font-size: 24px;
  opacity: 0.8;
}

.overview-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.overview-number {
  font-size: 24px;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.overview-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge.auto {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.stat-badge.manual {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.message-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 15px;
}

.message-banner.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.message-banner.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.message-icon {
  font-size: 18px;
}

.reports-navigation {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reports-tabs {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.report-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #6c757d;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.report-tab:hover {
  background: #f8f9fa;
  color: #495057;
}

.report-tab.active {
  background: var(--primary);
  color: white;
}

.report-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.report-tab.active .tab-icon,
.report-tab.active .tab-text {
  color: white;
}

.tab-icon {
  font-size: 16px;
}

.tab-text {
  font-weight: 600;
}

.tab-count {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.report-category {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-header {
  margin-bottom: 20px;
  text-align: center;
}

.category-header h3 {
  margin: 0 0 8px 0;
  color: #212529;
  font-size: 20px;
  font-weight: 600;
}

.category-description {
  margin: 0;
  color: #6c757d;
  font-size: 15px;
  line-height: 1.5;
}

.reports-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.report-card.auto {
  border-left: 4px solid #1565c0;
}

.report-card.manual {
  border-left: 4px solid #7b1fa2;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.report-type {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-priority.high {
  background: #ffebee;
  color: #c62828;
}

.report-priority.medium {
  background: #fff3e0;
  color: #ef6c00;
}

.report-priority.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.report-content h4 {
  margin: 0 0 8px 0;
  color: #212529;
  font-size: 16px;
  font-weight: 600;
}

.report-description {
  margin: 0 0 16px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.meta-icon {
  font-size: 14px;
  opacity: 0.7;
}

.empty-reports {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.empty-reports .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-reports h3 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 18px;
  font-weight: 600;
}

.empty-reports p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

/* System Section Styles */
.system-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #28a745;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.system-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.system-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  margin: 0 0 8px 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

.card-content {
  padding: 24px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.system-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.system-action-btn:hover:not(:disabled) {
  background: white;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
}

.system-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.action-count {
  background: var(--primary);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

  .action-status {
    background: #6c757d;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .action-status.active {
    background: #28a745;
  }
  
  .auto-refresh-control,
  .refresh-frequency,
  .last-updates {
    cursor: default;
    background: #f8f9fa;
    border-color: #dee2e6;
  }
  
  .auto-refresh-control:hover,
  .refresh-frequency:hover,
  .last-updates:hover {
    transform: none;
    box-shadow: none;
  }
  
  .mini-toggle {
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-top: 8px;
  }
  
  .mini-toggle:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
  
  .update-times {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }
  
  .update-time {
    font-size: 11px;
    color: #6c757d;
    font-weight: 500;
  }

.api-endpoints {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.endpoint-group h4 {
  margin: 0 0 16px 0;
  color: #212529;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.endpoint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.method {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 50px;
  text-align: center;
}

.method.get {
  background: #d1ecf1;
  color: #0c5460;
}

.method.post {
  background: #d4edda;
  color: #155724;
}

.method.delete {
  background: #f8d7da;
  color: #721c24;
}

.path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #495057;
  font-weight: 500;
  min-width: 120px;
}

.description {
  color: #6c757d;
  font-size: 14px;
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Responsive Design for Auto-refresh Elements */
@media (max-width: 768px) {
  .auto-refresh-status {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }
  
  .auto-refresh-toggle {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .toggle-text {
    display: none;
  }
  
  .overview-card {
    padding: 12px 16px;
  }
  
  .overview-number {
    font-size: 20px;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .report-card {
    padding: 16px;
  }
  
  .report-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .system-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .reports-tabs {
    flex-direction: column;
  }
  
  .report-tab {
    padding: 12px 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .endpoint-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .path {
    min-width: auto;
    font-size: 12px;
  }
}
</style>
