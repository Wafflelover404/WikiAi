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
        // Check if the response is JSON
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          this.content = data.content || data.response || '';
        } else {
          // For text files, get the raw text
          this.content = await res.text();
        }
      } catch (e) {
        console.error('Error loading file:', e);
        this.editFileMsg = 'Error loading file content: ' + e.message;
      }
    },
    async saveEditFile() {
      if (!this.content) {
        this.editFileMsg = 'Cannot save empty content';
        return;
      }
      
      this.editFileMsg = 'Saving...';
      try {
        const { editFileContent } = await import('../api.js');
        const res = await editFileContent({
          serverUrl: this.API_BASE_URL,
          token: this.token,
          filename: this.filename,
          newContent: this.content
        });
        
        if (res.status === 'success') {
          this.editFileMsg = 'File updated successfully!';
          setTimeout(() => {
            this.$emit('save');
            this.$emit('close');
          }, 1000);
        } else {
          this.editFileMsg = res.message || 'Failed to update file.';
        }
      } catch (e) {
        console.error('Error saving file:', e);
        this.editFileMsg = 'Failed to update file: ' + e.message;
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
