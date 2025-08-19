<template>
  <div class="file-tabs">
    <div class="tabs">
      <transition-group name="tab-move" tag="div" class="tab-row">
        <div
          v-for="file in openedFiles"
          :key="file"
          class="tab"
          :class="{ active: file === activeTab }"
          @click="$emit('switch-tab', file)"
        >
          <span>{{ file }}</span>
          <button class="close-tab-btn" @click.stop="$emit('close-file', file)" title="Close" style="margin-left: 8px;">✖</button>
        </div>
      </transition-group>
    </div>
    <div class="file-content">
      <p v-if="openedFiles.length === 0">No file opened</p>
      <div v-else>
        <h4>{{ activeTab || openedFiles[0] }}</h4>
        <div class="content-scroll">
          <div class="content-placeholder">
            <pre class="scroll-pre">{{ fileContents[activeTab || openedFiles[0]] || 'Loading...' }}</pre>
          </div>
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
    },
    activeTab: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
.tab-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.file-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
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
  transition: background 0.2s, box-shadow 0.2s;
}
.tab.active {
  background: #fff;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,120,212,0.08);
}
.tab-move-enter-active, .tab-move-leave-active {
  transition: all 0.3s cubic-bezier(.55,0,.1,1);
}
.tab-move-enter-from, .tab-move-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.tab-move-enter-to, .tab-move-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.file-content {
  flex: 1;
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}
.content-placeholder {
  color: #888;
  font-style: italic;
}
.content-scroll {
  width: 100%;
  height: 45em;
  /* You can adjust 400px to fit your design */
  display: flex;
  flex-direction: column;
}
.content-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.scroll-pre {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  border: none;
  margin: 0;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}
.close-tab-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 2px;
  transition: background 0.2s;
}
.close-tab-btn:hover {
  background: #f2dede;
  color: #c00;
}
</style>
