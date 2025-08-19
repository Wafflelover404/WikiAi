<template>
  <div class="sidebar-files">
    <h3>Files</h3>
    <ul>
      <li v-for="file in files" :key="file">{{ file }}</li>
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
  height: 100vh;
  padding: 16px 0 0 0;
  border-right: 1px solid #ddd;
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
