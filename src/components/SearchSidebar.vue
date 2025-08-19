<template>
  <div class="search-sidebar" v-if="visible">
    <h3>Search</h3>
    <input type="text" placeholder="Search..." class="search-input" />
    <div class="search-results">
      <p>No results yet.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchSidebar',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.search-sidebar {
  width: 320px;
  background: #f9f9f9;
  height: 100vh;
  border-left: 1px solid #ddd;
  padding: 16px;
  position: relative;
}
.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-results {
  color: #888;
}
</style>
