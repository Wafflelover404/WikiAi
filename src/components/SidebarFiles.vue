<template>
  <div class="sidebar-files">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-right: 16px;">
      <h3 style="margin-bottom: 0;">Files</h3>
      <slot name="actions"></slot>
    </div>
    <ul>
      <li v-for="file in files" :key="file" @click="$emit('file-click', file)">{{ file }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SidebarFiles',
  props: {
    files: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.sidebar-files {
  width: 220px;
  background: #f4f4f4;
  height: 100%;
  min-height: 0;
  padding: 16px 0 0 0;
  border-right: 1px solid #ddd;
  overflow: hidden;
}
.sidebar-files h3 {
  margin: 0 0 12px 16px;
}
.sidebar-files ul {
  list-style: none;
  padding: 0 0 0 16px;
}
.sidebar-files li {
  margin-bottom: 8px;
  cursor: pointer;
}
</style>
