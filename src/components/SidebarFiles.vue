<template>
  <div class="sidebar-files">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-right: 16px; margin-bottom: 10px;">
      <h3 style="margin-bottom: 5px; margin-left: 15px;">Files</h3>
      <slot name="actions"></slot>
    </div>
    <ul>
      <li v-for="file in files" class="file-placeholder" :key="file" @click="$emit('file-click', file)">{{ file }}</li>
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

// Simple simulation of Vue component behavior. For animation purposes
document.addEventListener('DOMContentLoaded', function() {
  const fileItems = document.querySelectorAll('.file-placeholder');
  
  fileItems.forEach(item => {
    item.addEventListener('click', function() {
      fileItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Simulate Vue $emit
      console.log('File clicked:', this.textContent);
      
    });
  });
});
</script>

<style scoped>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      display: flex;
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      display: flex;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      background: var(--color-surface);
      border-radius: 12px;
      box-shadow: var(--color-shadow-medium);
      overflow: hidden;
    }
    
    /* Improved CSS for the sidebar */
    .sidebar-files {
      width: 280px;
      background: var(--color-surface);
      height: 100%;
      min-height: 400px;
      padding: 20px 0;
      border-right: 1px solid var(--color-border-primary);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dark-mode .sidebar-files {
      background: var(--color-surface);
      border-right-color: var(--color-border-primary);
      color: var(--color-text-primary);
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px 15px;
      border-bottom: 1px solid var(--color-border-primary);
      margin-bottom: 15px;
    }
    
    .sidebar-header h3 {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 18px;
      margin: 0;
    }
    .dark-mode .sidebar-header h3 {
      color: var(--color-text-primary);
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .action-btn {
      background: var(--color-bg-secondary);
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .action-btn:hover {
      background: var(--color-bg-hover);
    }
    .dark-mode .action-btn {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
    }
    .dark-mode .action-btn:hover {
      background: var(--color-bg-hover);
    }
    
    .sidebar-files ul {
      list-style: none;
      padding: 0;
      overflow-y: auto;
      flex-grow: 1;
    }
    
    .file-placeholder {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      margin: 4px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--color-text-primary);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-primary);
    }
    .dark-mode .file-placeholder {
      color: var(--color-text-primary);
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-primary);
    }
    
    .file-placeholder:hover {
      background: var(--color-bg-hover);
      transform: translateY(-1px);
      box-shadow: var(--color-shadow-light);
    }
    .dark-mode .file-placeholder:hover {
      background: var(--color-bg-hover);
      box-shadow: var(--color-shadow-dark);
    }
    
    .file-placeholder:active {
      background: var(--color-bg-active);
      transform: translateY(0);
    }
    .dark-mode .file-placeholder:active {
      background: var(--color-bg-active);
    }
    
    .file-placeholder::before {
      content: "�";
      margin-right: 10px;
      font-size: 14px;
    }
    
    /* Content area for demonstration */
    .content {
      flex: 1;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: var(--color-bg-primary);
    }
    .dark-mode .content {
      background: var(--color-bg-primary);
    }
    
    .content h1 {
      color: var(--color-text-primary);
      margin-bottom: 20px;
    }
    .dark-mode .content h1 { color: var(--color-text-secondary); }
    
    .content p {
      color: var(--color-text-secondary);
      line-height: 1.6;
      max-width: 500px;
      text-align: center;
    }
    .dark-mode .content p { color: var(--color-text-secondary); }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      
      .sidebar-files {
        width: 100%;
        height: auto;
        min-height: 300px;
        border-right: none;
        border-bottom: 1px solid #eaecef;
      }
      .dark-mode .sidebar-files { border-bottom-color: #333; }
    }

</style>
