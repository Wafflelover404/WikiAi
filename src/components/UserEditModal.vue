<template>
  <div class="modal-overlay fullscreen" @click.self="closeModal">
    <div class="modal-content fullscreen-modal" tabindex="0" @keydown.esc="closeModal">
      <button class="modal-close-btn" @click="closeModal" aria-label="Close">×</button>
      <h2>Edit User</h2>
      <form @submit.prevent="saveEditUser" class="user-form">
        <div class="user-fields">
          <label>Username</label>
          <input v-model="editUserData.new_username" placeholder="New Username" />
          <label>Password</label>
          <input v-model="editUserData.password" type="password" placeholder="New Password (leave blank to keep)" />
          <label>Role</label>
          <select v-model="editUserData.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="submit" class="modal-save-btn">💾 Save</button>
          <button type="button" class="modal-cancel-btn" @click="closeModal">Cancel</button>
        </div>
      </form>
      <div v-if="editUserMsg" class="msg">{{ editUserMsg }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserEditModal',
  props: {
    editUserData: { type: Object, required: true },
    editUserMsg: { type: String, default: '' }
  },
  emits: ['save', 'close'],
  methods: {
    saveEditUser() {
      this.$emit('save');
    },
    closeModal() {
      this.$emit('close');
    }
  },
  mounted() {
    // Focus modal for ESC key
    this.$el.querySelector('.modal-content')?.focus();
  }
};
</script>

<style scoped>
.modal-overlay.fullscreen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
.fullscreen-modal {
  background: #fff;
  padding: 48px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.22);
  min-width: 340px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  outline: none;
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1);
}
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 2;
  transition: color 0.2s;
}
.modal-close-btn:hover {
  color: #e53935;
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.modal-save-btn {
  background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(33,150,243,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.modal-save-btn:hover {
  background: linear-gradient(90deg, #1565c0 60%, #1976d2 100%);
  box-shadow: 0 2px 8px rgba(33,150,243,0.13);
}
.modal-cancel-btn {
  background: #fff;
  color: #e53935;
  border: 1.5px solid #e53935;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  background: #e53935;
  color: #fff;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPop {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>

<style scoped>
.user-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 10px;
}
.user-fields label {
  margin-bottom: 2px;
  font-weight: 500;
}
.user-fields input,
.user-fields select {
  padding: 7px 10px;
  border: 1px solid #cfd8dc;
  border-radius: 5px;
  font-size: 1rem;
  margin-bottom: 2px;
}
</style>
