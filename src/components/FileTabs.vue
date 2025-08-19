<template>
  <div class="file-tabs">
    <div class="tabs">
      <div v-for="file in openedFiles" :key="file" class="tab">
        {{ file }}
      </div>
    </div>
    <div class="file-content">
      <p v-if="openedFiles.length === 0">No file opened</p>
      <div v-else>
        <h4>{{ openedFiles[0] }}</h4>
        <div class="content-placeholder">
          <pre style="white-space: pre-wrap; word-break: break-word;">{{ fileContents[openedFiles[0]] || 'Loading...' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileTabs',
  props: {
    openedFiles: {
      type: Array,
      default: () => []
    },
    fileContents: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.file-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.tabs {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  padding: 0 8px;
  height: 40px;
  align-items: center;
}
.tab {
  margin-right: 12px;
  padding: 6px 16px;
  background: #eaeaea;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
}
.file-content {
  flex: 1;
  padding: 24px;
  background: #fff;
}
.content-placeholder {
  color: #888;
  font-style: italic;
}
</style>
