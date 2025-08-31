<template>
  <div class="modal-overlay fullscreen">
    <div class="modal-content fullscreen-modal">
      <h2>Edit User</h2>
      <form @submit.prevent="saveEditUser" class="user-form">
        <label>Username</label>
        <input v-model="editUserData.new_username" placeholder="New Username" />
        <label>Password</label>
        <input v-model="editUserData.password" type="password" placeholder="New Password (leave blank to keep)" />
        <label>Role</label>
        <select v-model="editUserData.role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div class="modal-actions">
          <button type="submit" class="create-btn">Save</button>
          <button type="button" class="danger-btn" @click="$emit('close')">Cancel</button>
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
    }
  }
};
</script>

<style scoped>
.modal-overlay.fullscreen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fullscreen-modal {
  background: #fff;
  padding: 48px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 32px rgba(0,0,0,0.18);
  min-width: 340px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}
</style>
