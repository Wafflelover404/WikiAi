<template>
  <div v-if="visible" :class="['toast-notification', type]" @click="close">
    <div class="toast-content">
      <span class="toast-icon">{{ getIcon() }}</span>
      <span class="toast-message">{{ message }}</span>
      <button class="toast-close" @click.stop="close" aria-label="Close notification">×</button>
    </div>
  </div>
</template>

<script>
import SvgIcons from './SvgIcons.vue';

export default {
  name: 'ToastNotification',
  components: {
    SvgIcons
  },
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 4000
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  methods: {
    getIcon() {
      const icons = {
        success: 'checkmark',
        error: 'close',
        warning: '⚠️',
        info: 'info'
      };
      return icons[this.type] || icons.info;
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  min-width: 320px;
  max-width: 500px;
  z-index: 9999;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transform: translateX(100%);
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid;
}

.toast-notification.success .toast-content {
  border-left-color: #28a745;
  background: #f8fff9;
}

.toast-notification.error .toast-content {
  border-left-color: #dc3545;
  background: #fff8f8;
}

.toast-notification.warning .toast-content {
  border-left-color: #ffc107;
  background: #fffdf5;
}

.toast-notification.info .toast-content {
  border-left-color: #17a2b8;
  background: #f8fcff;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #495057;
}

/* Dark mode support */
.dark-mode .toast-content {
  background: #2d3748;
  color: #e2e8f0;
}

.dark-mode .toast-message {
  color: #e2e8f0;
}

.dark-mode .toast-close {
  color: #a0aec0;
}

.dark-mode .toast-close:hover {
  color: #e2e8f0;
}
</style>
