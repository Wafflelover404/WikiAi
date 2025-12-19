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
      background: #f8f9fa;
      color: #333;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      display: flex;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    /* Improved CSS for the sidebar */
    .sidebar-files {
      width: 280px;
      background: #ffffff;
      height: 100%;
      min-height: 400px;
      padding: 20px 0;
      border-right: 1px solid #eaecef;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dark-mode .sidebar-files {
      background: #1f2122;
      border-right-color: #333;
      color: #e0e0e0;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px 15px;
      border-bottom: 1px solid #eaecef;
      margin-bottom: 15px;
    }
    
    .sidebar-header h3 {
      font-weight: 600;
      color: #2c3e50;
      font-size: 18px;
      margin: 0;
    }
    .dark-mode .sidebar-header h3 {
      color: #e0e0e0;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .action-btn {
      background: #f1f3f5;
      border: none;
      color: #4d5a6d;
      cursor: pointer;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .action-btn:hover {
      background: #e3e6e9;
    }
    .dark-mode .action-btn {
      background: #2a2d2f;
      color: #c0c4c8;
    }
    .dark-mode .action-btn:hover {
      background: #33393d;
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
      padding: 10px 20px;
      margin: 4px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #495057;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
    }
    .dark-mode .file-placeholder {
      color: #e0e0e0;
      background: #232628;
      border-color: #33393d;
    }
    
    .file-placeholder:hover {
      background: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .dark-mode .file-placeholder:hover {
      background: #2a2d2f;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
    
    .file-placeholder:active {
      background: #dee2e6;
      transform: translateY(0);
    }
    .dark-mode .file-placeholder:active {
      background: #2f3336;
    }
    
    .file-placeholder::before {
      content: "�";
      margin-right: 10px;
      font-size: 14px;
    }
    
    /* Content area for demonstration */
    .content {
      flex: 1;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #fafbfc;
    }
    .dark-mode .content {
      background: #181a1b;
    }
    
    .content h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .dark-mode .content h1 { color: #e0e0e0; }
    
    .content p {
      color: #5a6778;
      line-height: 1.6;
      max-width: 500px;
      text-align: center;
    }
    .dark-mode .content p { color: #a0a6ac; }
    
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
