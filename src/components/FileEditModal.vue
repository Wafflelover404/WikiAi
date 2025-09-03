<template>
  <div class="modal-overlay fullscreen" @click.self="closeModal">
    <div class="modal-content" tabindex="0">
      <h2>Edit File</h2>
      <div class="file-info">
        <b>Filename:</b> <span>{{ filename }}</span>
      </div>
      <textarea v-model="content" rows="18" style="width:100%;margin-top:12px;"></textarea>
      <div class="modal-actions">
        <button class="save-btn" @click="saveEditFile">Save</button>
        <button class="cancel-btn" @click="closeModal">Discard</button>
      </div>
      <div v-if="editFileMsg" class="msg">{{ editFileMsg }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileEditModal',
  props: {
    filename: { type: String, required: true },
    token: { type: String, required: true },
    API_BASE_URL: { type: String, required: true }
  },
  data() {
    return {
      content: '',
      editFileMsg: ''
    };
  },
  methods: {
    async loadFileContent() {
      try {
        const { getFileContent } = await import('../api.js');
        const res = await getFileContent({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          filename: this.filename
        });
        if (typeof res === 'string') {
          this.content = res;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (e) {
        this.editFileMsg = 'Error loading file content.';
      }
    },
    async saveEditFile() {
      try {
        const { editFileContent } = await import('../api.js');
        const res = await editFileContent({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          filename: this.filename,
          newContent: this.content
        });
        const data = await res.json();
        if (data.status === 'success') {
          this.editFileMsg = 'File updated!';
          this.$emit('save');
        } else {
          this.editFileMsg = data.message || 'Failed to update file.';
        }
      } catch (e) {
        this.editFileMsg = 'Failed to update file.';
      }
    },
    closeModal() {
      this.$emit('close');
    }
  },
  mounted() {
    this.loadFileContent();
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
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px 24px 28px;
  min-width: 420px;
  max-width: 700px;
  box-shadow: 0 2px 16px rgba(33,150,243,0.13);
  outline: none;
}
.file-info {
  margin-bottom: 8px;
  font-size: 16px;
}
.modal-actions {
  margin-top: 18px;
  display: flex;
  gap: 16px;
}
.save-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  cursor: pointer;
  font-weight: 500;
}
.cancel-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  cursor: pointer;
  font-weight: 500;
}
.save-btn:hover {
  background: #1565c0;
}
.cancel-btn:hover {
  background: #b71c1c;
}
.msg {
  margin-top: 12px;
  color: #1976d2;
  font-size: 15px;
}
</style>
