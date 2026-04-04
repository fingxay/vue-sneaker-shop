<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="confirm-modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="confirm-modal">
        <div class="confirm-modal-header">
          <h3 class="confirm-modal-title">{{ title }}</h3>

          <button
            type="button"
            class="confirm-modal-close"
            @click="handleCancel"
          >
            ×
          </button>
        </div>

        <p class="confirm-modal-message">
          {{ message }}
        </p>

        <div class="confirm-modal-actions">
          <button
            type="button"
            class="confirm-modal-btn cancel-btn"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            class="confirm-modal-btn confirm-btn"
            :class="variantClass"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: String,
    default: 'Bạn có chắc muốn thực hiện hành động này không?'
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'danger'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const variantClass = computed(() => {
  return {
    'is-danger': props.variant === 'danger',
    'is-warning': props.variant === 'warning',
    'is-success': props.variant === 'success',
    'is-info': props.variant === 'info',
    'is-purple': props.variant === 'purple'
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = () => {
  if (!props.closeOnOverlay) return
  handleCancel()
}
</script>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.confirm-modal {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
  animation: modalFadeIn 0.2s ease;
}

.confirm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.confirm-modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #111827;
}

.confirm-modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-size: 24px;
  cursor: pointer;
  transition: 0.2s ease;
}

.confirm-modal-close:hover {
  background: #e5e7eb;
}

.confirm-modal-message {
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
}

.confirm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.confirm-modal-btn {
  min-width: 110px;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.cancel-btn {
  background: #f3f4f6;
  color: #111827;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  color: #ffffff;
}

.confirm-btn.is-danger {
  background: #ef4444;
}

.confirm-btn.is-danger:hover {
  background: #dc2626;
}

.confirm-btn.is-warning {
  background: #f59e0b;
}

.confirm-btn.is-warning:hover {
  background: #d97706;
}

.confirm-btn.is-success {
  background: #10b981;
}

.confirm-btn.is-success:hover {
  background: #059669;
}

.confirm-btn.is-info {
  background: #2563eb;
}

.confirm-btn.is-info:hover {
  background: #1d4ed8;
}

.confirm-btn.is-purple {
  background: #7c3aed;
}

.confirm-btn.is-purple:hover {
  background: #6d28d9;
}
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>